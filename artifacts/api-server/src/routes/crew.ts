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
  swipesTable,
} from "@workspace/db/schema";
import { db } from "../lib/drizzle";
import {
  CreateCheckinBody,
  CreateCheckinResponse,
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
  RsvpToEventParams,
  RsvpToEventResponse,
  UpdateMyProfileBody,
  UpdateMyProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Until accounts land, the signed-in climber is the seeded demo user.
// Auth (Phase 5 step 7) will replace this with the authenticated user id.
const CURRENT_USER = "me";

const image = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

async function getProfile(id: string) {
  const [row] = await db()
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, id));
  return row ?? null;
}

// ---------------------------------------------------------------------------
// discovery
// ---------------------------------------------------------------------------
router.get("/discover", async (req, res) => {
  const parsed = GetDiscoverProfilesQueryParams.parse(req.query);
  const rows = await db().select().from(profilesTable);
  const result = rows.filter((profile) => {
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

router.get("/gyms", async (_req, res) => {
  const rows = await db()
    .select()
    .from(placesTable)
    .where(eq(placesTable.type, "gym"));
  res.json(GetGymsResponse.parse(rows));
});

// ---------------------------------------------------------------------------
// profile
// ---------------------------------------------------------------------------
router.get("/profile", async (_req, res) => {
  const profile = await getProfile(CURRENT_USER);
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json(GetMyProfileResponse.parse(profile));
});

router.patch("/profile", async (req, res) => {
  const input = UpdateMyProfileBody.parse(req.body);
  await db()
    .update(profilesTable)
    .set({ ...input })
    .where(eq(profilesTable.id, CURRENT_USER));
  const profile = await getProfile(CURRENT_USER);
  res.json(UpdateMyProfileResponse.parse(profile));
});

// ---------------------------------------------------------------------------
// swipes + matches
// ---------------------------------------------------------------------------
router.post("/swipes", async (req, res) => {
  const input = CreateSwipeBody.parse(req.body);

  const mutual = await db()
    .select()
    .from(swipesTable)
    .where(
      and(
        eq(swipesTable.actorId, input.profileId),
        eq(swipesTable.targetId, CURRENT_USER),
        eq(swipesTable.action, "like"),
      ),
    );

  const isMatch = input.action === "like" && mutual.length > 0;

  await db().insert(swipesTable).values({
    id: `swipe-${Date.now()}`,
    actorId: CURRENT_USER,
    targetId: input.profileId,
    action: input.action,
  });

  let match: Record<string, unknown> | null = null;
  if (isMatch) {
    const profile = await getProfile(input.profileId);
    match = {
      id: `match-${input.profileId}`,
      profile,
      matchedAt: "Just now",
      unreadCount: 0,
    };
    await db().insert(matchesTable).values({
      id: `match-${input.profileId}`,
      profileA: CURRENT_USER,
      profileB: input.profileId,
      matchedAt: "Just now",
      unreadCount: 0,
    });
  }

  res.json(CreateSwipeResponse.parse({ action: input.action, isMatch, match }));
});

router.get("/matches", async (_req, res) => {
  const rows = await db()
    .select()
    .from(matchesTable)
    .where(
      or(
        eq(matchesTable.profileA, CURRENT_USER),
        eq(matchesTable.profileB, CURRENT_USER),
      ),
    );

  const result: Array<Record<string, unknown>> = [];
  for (const m of rows) {
    const otherId = m.profileA === CURRENT_USER ? m.profileB : m.profileA;
    const profile = await getProfile(otherId);
    result.push({ id: m.id, profile, matchedAt: m.matchedAt, unreadCount: m.unreadCount });
  }
  res.json(GetMatchesResponse.parse(result));
});

// ---------------------------------------------------------------------------
// events
// ---------------------------------------------------------------------------
router.get("/events", async (req, res) => {
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

router.post("/events", async (req, res) => {
  const input = CreateEventBody.parse(req.body);
  const event = {
    id: `event-${Date.now()}`,
    ...input,
    hostId: CURRENT_USER,
    attendees: 1,
    joined: true,
    visibility: input.visibility ?? "public",
    imageUrl: input.imageUrl ?? image("photo-1522163182402-834f871fd851"),
  };
  await db().insert(eventsTable).values(event);
  const host = await getProfile(CURRENT_USER);
  res.status(201).json(CreateEventResponse.parse({ ...event, host }));
});

router.post("/events/:eventId/rsvp", async (req, res) => {
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
router.post("/checkins", async (req, res) => {
  const input = CreateCheckinBody.parse(req.body);
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
    profileId: CURRENT_USER,
    note: checkin.note || null,
  });
  res.status(201).json(CreateCheckinResponse.parse(checkin));
});

// ---------------------------------------------------------------------------
// conversations + messages
// ---------------------------------------------------------------------------
router.get("/conversations", async (_req, res) => {
  const rows = await db().select().from(conversationsTable);
  const result: Array<Record<string, unknown>> = [];
  for (const conversation of rows) {
    const profile = await getProfile(conversation.profileId);
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

router.get("/conversations/:conversationId/messages", async (req, res) => {
  const parsed = GetMessagesParams.parse(req.params);
  const rows = await db()
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, parsed.conversationId));
  res.json(GetMessagesResponse.parse(rows));
});

router.post("/conversations/:conversationId/messages", async (req, res) => {
  const params = CreateMessageParams.parse(req.params);
  const input = CreateMessageBody.parse(req.body);

  const [conversation] = await db()
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, params.conversationId));
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const message = {
    id: `msg-${Date.now()}`,
    conversationId: params.conversationId,
    senderId: CURRENT_USER,
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

