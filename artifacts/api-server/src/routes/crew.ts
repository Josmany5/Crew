import { Router, type IRouter } from "express";
import { and, eq, or } from "drizzle-orm";
import {
  checkinsTable,
  conversationsTable,
  eventsTable,
  matchesTable,
  messagesTable,
  placesTable,
  profilesTable,
  rsvpsTable,
  swipesTable,
} from "@workspace/db/schema";
import { db } from "../lib/drizzle";
import { supabase } from "../lib/supabase";
import { requireAuth, type AuthedRequest } from "../lib/auth";
import {
  CreateCheckinBody,
  CreateCheckinResponse,
  CreateConversationBody,
  CreateConversationResponse,
  CreateEventBody,
  CreateEventResponse,
  CreateMessageBody,
  CreateMessageParams,
  CreateMessageResponse,
  CreateSwipeBody,
  CreateSwipeResponse,
  GetConversationsResponse,
  GetDiscoverProfilesQueryParams,
  GetDiscoverProfilesResponse,
  GetEventsQueryParams,
  GetEventsResponse,
  GetGymsResponse,
  GetMatchesResponse,
  GetMessagesParams,
  GetMessagesResponse,
  GetMyProfileResponse,
  DeleteProfileResponse,
  GetPendingLikesResponse,
  RsvpToEventParams,
  RsvpToEventResponse,
  UnmatchParams,
  UnmatchResponse,
  UpdateMyProfileBody,
  UpdateMyProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// All crew routes require a signed-in user.
router.use(requireAuth);

const image = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

async function getProfile(id: string) {
  const [row] = await db()
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, id));
  return row ?? null;
}

/** Creates a default profile the first time a new user is seen. */
async function ensureProfile(id: string) {
  const existing = await getProfile(id);
  if (existing) return existing;
  await db().insert(profilesTable).values({
    id,
    name: "Climber",
    age: 0,
    location: "",
    bio: "",
    avatarUrl: "",
    climbingLevel: "",
  });
  return getProfile(id);
}

// ---------------------------------------------------------------------------
// discovery
// ---------------------------------------------------------------------------
router.get("/discover", async (req: AuthedRequest, res) => {
  const parsed = GetDiscoverProfilesQueryParams.parse(req.query);
  const userId = req.user!.id;
  const [rows, swipes] = await Promise.all([
    db().select().from(profilesTable),
    db().select().from(swipesTable).where(eq(swipesTable.actorId, userId)),
  ]);
  const swipedIds = new Set(swipes.map((swipe) => swipe.targetId));
  const result = rows.filter((profile) => {
    if (profile.id === userId) return false;
    if (swipedIds.has(profile.id)) return false;
    const gymMatches =
      !parsed.gymId ||
      (parsed.gymId === "circuit" && profile.gyms.includes("The Circuit")) ||
      (parsed.gymId === "prg" && profile.gyms.includes("Portland Rock Gym"));
    const disciplineMatches =
      !parsed.discipline ||
      parsed.discipline === "any" ||
      profile.disciplines.includes(parsed.discipline);
    return gymMatches && disciplineMatches;
  });
  res.json(GetDiscoverProfilesResponse.parse(result));
});

router.get("/gyms", async (_req: AuthedRequest, res) => {
  const rows = await db()
    .select()
    .from(placesTable)
    .where(eq(placesTable.type, "gym"));
  res.json(GetGymsResponse.parse(rows));
});

// ---------------------------------------------------------------------------
// profile
// ---------------------------------------------------------------------------
router.get("/profile", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const profile = await ensureProfile(userId);
  res.json(GetMyProfileResponse.parse(profile));
});

router.patch("/profile", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  await ensureProfile(userId);
  const input = UpdateMyProfileBody.parse(req.body);
  await db()
    .update(profilesTable)
    .set({ ...input })
    .where(eq(profilesTable.id, userId));
  const profile = await getProfile(userId);
  res.json(UpdateMyProfileResponse.parse(profile));
});

router.delete("/profile", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  // Remove all user-related data before deleting the account.
  await db()
    .delete(swipesTable)
    .where(or(eq(swipesTable.actorId, userId), eq(swipesTable.targetId, userId)));
  await db()
    .delete(matchesTable)
    .where(or(eq(matchesTable.profileA, userId), eq(matchesTable.profileB, userId)));
  await db().delete(eventsTable).where(eq(eventsTable.hostId, userId));

  const conversations = await db()
    .select()
    .from(conversationsTable)
    .where(
      or(
        eq(conversationsTable.participantA, userId),
        eq(conversationsTable.participantB, userId),
      ),
    );
  for (const conversation of conversations) {
    await db()
      .delete(messagesTable)
      .where(eq(messagesTable.conversationId, conversation.id));
  }
  await db()
    .delete(conversationsTable)
    .where(
      or(
        eq(conversationsTable.participantA, userId),
        eq(conversationsTable.participantB, userId),
      ),
    );
  await db().delete(checkinsTable).where(eq(checkinsTable.profileId, userId));
  await db().delete(rsvpsTable).where(eq(rsvpsTable.profileId, userId));
  await db().delete(profilesTable).where(eq(profilesTable.id, userId));

  const { error } = await supabase().auth.admin.deleteUser(userId);
  if (error) {
    res.status(500).json({ error: "Could not delete the account" });
    return;
  }
  res.json(DeleteProfileResponse.parse({ ok: true }));
});

// ---------------------------------------------------------------------------
// swipes + matches
// ---------------------------------------------------------------------------
router.post("/swipes", async (req: AuthedRequest, res) => {
  const input = CreateSwipeBody.parse(req.body);
  const userId = req.user!.id;
  await ensureProfile(userId);
  await ensureProfile(input.profileId);

  const mutual = await db()
    .select()
    .from(swipesTable)
    .where(
      and(
        eq(swipesTable.actorId, input.profileId),
        eq(swipesTable.targetId, userId),
        eq(swipesTable.action, "like"),
      ),
    );

  const isMatch = input.action === "like" && mutual.length > 0;

  await db().insert(swipesTable).values({
    id: `swipe-${Date.now()}`,
    actorId: userId,
    targetId: input.profileId,
    action: input.action,
  });

  let match: Record<string, unknown> | null = null;
  if (isMatch) {
    const profile = await ensureProfile(input.profileId);
    match = {
      id: `match-${input.profileId}`,
      profile,
      matchedAt: "Just now",
      unreadCount: 0,
    };
    const [existingMatch] = await db()
      .select()
      .from(matchesTable)
      .where(eq(matchesTable.id, `match-${input.profileId}`));
    if (!existingMatch) {
      await db().insert(matchesTable).values({
        id: `match-${input.profileId}`,
        profileA: userId,
        profileB: input.profileId,
        matchedAt: "Just now",
        unreadCount: 0,
      });
    }
  }

  res.json(CreateSwipeResponse.parse({ action: input.action, isMatch, match }));
});

router.get("/swipes", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const [swipes, allMatches] = await Promise.all([
    db()
      .select()
      .from(swipesTable)
      .where(and(eq(swipesTable.actorId, userId), eq(swipesTable.action, "like"))),
    db().select().from(matchesTable),
  ]);
  const matchedIds = new Set(
    allMatches
      .filter((m) => m.profileA === userId || m.profileB === userId)
      .map((m) => (m.profileA === userId ? m.profileB : m.profileA)),
  );
  const result: Array<Record<string, unknown>> = [];
  for (const swipe of swipes) {
    if (matchedIds.has(swipe.targetId)) continue;
    const profile = await ensureProfile(swipe.targetId);
    result.push(profile);
  }
  res.json(GetPendingLikesResponse.parse(result));
});

router.get("/matches", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const rows = await db()
    .select()
    .from(matchesTable)
    .where(
      or(
        eq(matchesTable.profileA, userId),
        eq(matchesTable.profileB, userId),
      ),
    );

  const result: Array<Record<string, unknown>> = [];
  for (const m of rows) {
    const otherId = m.profileA === userId ? m.profileB : m.profileA;
    const profile = await ensureProfile(otherId);
    result.push({ id: m.id, profile, matchedAt: m.matchedAt, unreadCount: m.unreadCount });
  }
  res.json(GetMatchesResponse.parse(result));
});

router.delete("/matches/:matchId", async (req: AuthedRequest, res) => {
  const { matchId } = UnmatchParams.parse(req.params);
  const userId = req.user!.id;
  const [match] = await db()
    .select()
    .from(matchesTable)
    .where(eq(matchesTable.id, matchId));
  if (!match || (match.profileA !== userId && match.profileB !== userId)) {
    res.status(404).json({ error: "Match not found" });
    return;
  }
  const otherId = match.profileA === userId ? match.profileB : match.profileA;
  await db().delete(matchesTable).where(eq(matchesTable.id, matchId));
  const [participantA, participantB] = [userId, otherId].sort();
  const conversationId = `conversation-${participantA}-${participantB}`;
  await db().delete(messagesTable).where(eq(messagesTable.conversationId, conversationId));
  await db().delete(conversationsTable).where(eq(conversationsTable.id, conversationId));
  res.json(UnmatchResponse.parse({ ok: true }));
});

// ---------------------------------------------------------------------------
// events
// ---------------------------------------------------------------------------
router.get("/events", async (req: AuthedRequest, res) => {
  const parsed = GetEventsQueryParams.parse(req.query);
  const rows = await db().select().from(eventsTable);
  const filtered = rows.filter((event) => {
    const typeMatches =
      !parsed.type || parsed.type === "all" || event.type === parsed.type;
    const visibilityMatches =
      !parsed.visibility ||
      parsed.visibility === "all" ||
      event.visibility === parsed.visibility;
    return typeMatches && visibilityMatches;
  });

  const result: Array<Record<string, unknown>> = [];
  for (const event of filtered) {
    const host = await getProfile(event.hostId);
    result.push({ ...event, host });
  }
  res.json(GetEventsResponse.parse(result));
});

router.post("/events", async (req: AuthedRequest, res) => {
  const input = CreateEventBody.parse(req.body);
  const userId = req.user!.id;
  const event = {
    id: `event-${Date.now()}`,
    ...input,
    hostId: userId,
    attendees: 1,
    joined: true,
    visibility: input.visibility ?? "public",
    imageUrl: input.imageUrl ?? image("photo-1522163182402-834f871fd851"),
  };
  await db().insert(eventsTable).values(event);
  const host = await ensureProfile(userId);
  res.status(201).json(CreateEventResponse.parse({ ...event, host }));
});

router.post("/events/:eventId/rsvp", async (req: AuthedRequest, res) => {
  const parsed = RsvpToEventParams.parse(req.params);
  const [event] = await db()
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, parsed.eventId));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const joined = !event.joined;
  const attendees = Math.max(0, event.attendees + (joined ? 1 : -1));
  await db()
    .update(eventsTable)
    .set({ joined, attendees })
    .where(eq(eventsTable.id, parsed.eventId));
  const host = await getProfile(event.hostId);
  res.json(RsvpToEventResponse.parse({ ...event, joined, attendees, host }));
});


// ---------------------------------------------------------------------------
// checkins
// ---------------------------------------------------------------------------
router.post("/checkins", async (req: AuthedRequest, res) => {
  const input = CreateCheckinBody.parse(req.body);
  const userId = req.user!.id;
  const [gym] = await db()
    .select()
    .from(placesTable)
    .where(eq(placesTable.id, input.gymId));
  if (!gym) {
    res.status(404).json({ error: "Gym not found" });
    return;
  }
  await db()
    .update(placesTable)
    .set({ checkedInCount: gym.checkedInCount + 1 })
    .where(eq(placesTable.id, input.gymId));

  const now = new Date();
  const checkin = {
    id: `checkin-${Date.now()}`,
    gymId: gym.id,
    gymName: gym.name,
    createdAt: now.toISOString(),
    note: input.note ?? "",
  };
  await db().insert(checkinsTable).values({
    id: checkin.id,
    gymId: checkin.gymId,
    gymName: checkin.gymName,
    createdAt: now,
    profileId: userId,
    note: checkin.note || null,
  });
  res.status(201).json(CreateCheckinResponse.parse(checkin));
});

// ---------------------------------------------------------------------------
// conversations + messages
// ---------------------------------------------------------------------------
router.get("/conversations", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const rows = await db()
    .select()
    .from(conversationsTable)
    .where(
      or(
        eq(conversationsTable.participantA, userId),
        eq(conversationsTable.participantB, userId),
      ),
    );
  const result: Array<Record<string, unknown>> = [];
  for (const conversation of rows) {
    const otherId = conversation.participantA === userId ? conversation.participantB : conversation.participantA;
    const profile = await ensureProfile(otherId);
    result.push({
      id: conversation.id,
      profile,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount: conversation.unreadCount,
    });
  }
  res.json(GetConversationsResponse.parse(result));
});

router.post("/conversations", async (req: AuthedRequest, res) => {
  const input = CreateConversationBody.parse(req.body);
  const userId = req.user!.id;

  const [match] = await db()
    .select()
    .from(matchesTable)
    .where(
      or(
        and(eq(matchesTable.profileA, userId), eq(matchesTable.profileB, input.profileId)),
        and(eq(matchesTable.profileA, input.profileId), eq(matchesTable.profileB, userId)),
      ),
    );
  if (!match) {
    res.status(403).json({ error: "You can only message climbers you've matched with" });
    return;
  }

  const [participantA, participantB] = [userId, input.profileId].sort();
  const conversationId = `conversation-${participantA}-${participantB}`;
  const [existing] = await db()
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, conversationId));
  if (!existing) {
    await db().insert(conversationsTable).values({
      id: conversationId,
      participantA,
      participantB,
      lastMessage: null,
      lastMessageAt: null,
      unreadCount: 0,
    });
  }

  const profile = await ensureProfile(input.profileId);
  res.status(201).json(
    CreateConversationResponse.parse({
      id: conversationId,
      profile,
      lastMessage: null,
      lastMessageAt: null,
      unreadCount: 0,
    }),
  );
});

router.get("/conversations/:conversationId/messages", async (req: AuthedRequest, res) => {
  const parsed = GetMessagesParams.parse(req.params);
  const userId = req.user!.id;
  const rows = await db()
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, parsed.conversationId));
  const result = rows.map((message) => ({ ...message, isMine: message.senderId === userId }));
  res.json(GetMessagesResponse.parse(result));
});

router.post("/conversations/:conversationId/messages", async (req: AuthedRequest, res) => {
  const params = CreateMessageParams.parse(req.params);
  const input = CreateMessageBody.parse(req.body);
  const userId = req.user!.id;

  const [conversation] = await db()
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, params.conversationId));
  if (
    !conversation ||
    (conversation.participantA !== userId && conversation.participantB !== userId)
  ) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const message = {
    id: `msg-${Date.now()}`,
    conversationId: params.conversationId,
    senderId: userId,
    body: input.body,
    sentAt: "Just now",
    isMine: true,
  };
  await db().insert(messagesTable).values(message);
  await db()
    .update(conversationsTable)
    .set({ lastMessage: input.body, lastMessageAt: "Just now" })
    .where(eq(conversationsTable.id, params.conversationId));

  res.status(201).json(CreateMessageResponse.parse(message));
});

export default router;

