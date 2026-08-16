import { Router, type IRouter } from "express";
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

const image = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const sam = {
  id: "me",
  name: "Sam Rivera",
  age: 31,
  location: "Portland, OR",
  bio: "Always up for a post-work boulder session, a patient belay, or a weekend that starts with coffee and ends at the crag.",
  avatarUrl: image("photo-1517841905240-472988babdf9"),
  disciplines: ["bouldering", "ropes", "outdoor"],
  gyms: ["The Circuit", "Portland Rock Gym"],
  availability: ["Tue evenings", "Sat mornings"],
  matchPercent: 100,
  openToDating: false,
  gear: ["60m rope", "belay device", "crash pad"],
  verified: true,
  lastActive: "now",
  climbingLevel: "V4 / 5.10b",
};

const profiles = [
  {
    id: "maya-chen",
    name: "Maya Chen",
    age: 29,
    location: "2.4 mi · The Circuit",
    bio: "Boulderer who is slowly becoming a sport climber. I bring snacks, good beta, and zero pressure to send.",
    avatarUrl: image("photo-1524504388940-b1c1722653e1"),
    disciplines: ["bouldering", "ropes"],
    gyms: ["The Circuit"],
    availability: ["Tue evenings", "Sun afternoons"],
    matchPercent: 87,
    openToDating: true,
    gear: ["crash pad", "climbing shoes"],
    verified: true,
    lastActive: "12 min ago",
    climbingLevel: "V5 / 5.10a",
  },
  {
    id: "jonah-wells",
    name: "Jonah Wells",
    age: 34,
    location: "4.1 mi · Portland Rock Gym",
    bio: "Lead-belayer in search of more routes and fewer canceled plans. Happy to trade projecting days for patient coaching.",
    avatarUrl: image("photo-1500648767791-00dcc994a43e"),
    disciplines: ["ropes", "outdoor"],
    gyms: ["Portland Rock Gym", "The Circuit"],
    availability: ["Thu after 6", "Sat mornings"],
    matchPercent: 81,
    openToDating: false,
    gear: ["70m rope", "quickdraws", "harness"],
    verified: true,
    lastActive: "38 min ago",
    climbingLevel: "5.11a / V3",
  },
  {
    id: "riley-park",
    name: "Riley Park",
    age: 27,
    location: "6.8 mi · Outdoor crew",
    bio: "Planning a Smith Rock weekend in a few weeks. Looking for people who enjoy the approach as much as the send.",
    avatarUrl: image("photo-1534528741775-53994a69daeb"),
    disciplines: ["outdoor", "ropes"],
    gyms: ["The Circuit"],
    availability: ["Fri evenings", "Weekend trips"],
    matchPercent: 76,
    openToDating: true,
    gear: ["70m rope", "draws", "camp stove"],
    verified: false,
    lastActive: "2 hr ago",
    climbingLevel: "5.10c / V2",
  },
  {
    id: "diego-martin",
    name: "Diego Martin",
    age: 30,
    location: "3.6 mi · The Circuit",
    bio: "Here for consistent gym nights, curious route-reading, and making the local wall feel a little more social.",
    avatarUrl: image("photo-1506794778202-cad84cf45f1d"),
    disciplines: ["bouldering"],
    gyms: ["The Circuit"],
    availability: ["Mon evenings", "Wed evenings"],
    matchPercent: 72,
    openToDating: false,
    gear: ["climbing shoes", "chalk bag"],
    verified: true,
    lastActive: "yesterday",
    climbingLevel: "V6",
  },
];

const gyms = [
  {
    id: "circuit",
    name: "The Circuit",
    neighborhood: "Southeast Portland",
    distance: "2.4 mi",
    memberCount: 2840,
    checkedInCount: 18,
    imageUrl: image("photo-1522163182402-834f871fd851"),
    specialties: ["bouldering", "training boards", "late nights"],
  },
  {
    id: "prg",
    name: "Portland Rock Gym",
    neighborhood: "Northeast Portland",
    distance: "4.1 mi",
    memberCount: 1960,
    checkedInCount: 11,
    imageUrl: image("photo-1544191696-15693072c5ad"),
    specialties: ["top rope", "lead climbing", "youth programs"],
  },
  {
    id: "montavilla",
    name: "Montavilla Climbing",
    neighborhood: "East Portland",
    distance: "6.2 mi",
    memberCount: 1120,
    checkedInCount: 7,
    imageUrl: image("photo-1522163182402-834f871fd851"),
    specialties: ["bouldering", "community nights", "beginner friendly"],
  },
];

const matches = [
  {
    id: "match-maya",
    profile: profiles[0],
    matchedAt: "Today",
    unreadCount: 2,
  },
  {
    id: "match-jonah",
    profile: profiles[1],
    matchedAt: "Yesterday",
    unreadCount: 0,
  },
];

const events = [
  {
    id: "event-tuesday",
    title: "Tuesday night boulders",
    type: "gym",
    visibility: "crew-only",
    dateLabel: "Tue, Jun 18",
    timeLabel: "6:30 pm",
    location: "The Circuit · Southeast",
    host: profiles[0],
    spots: 6,
    attendees: 4,
    description: "Low-key session for a few hours of projecting, beta swaps, and a snack afterward.",
    imageUrl: image("photo-1522163182402-834f871fd851"),
    joined: false,
  },
  {
    id: "event-smith",
    title: "Smith Rock weekend crew",
    type: "trip",
    visibility: "public",
    dateLabel: "Jun 28–30",
    timeLabel: "7:00 am",
    location: "Smith Rock State Park",
    host: profiles[2],
    spots: 8,
    attendees: 5,
    description: "A relaxed two-night trip for sport routes, shared camp, and folks who are comfortable with a 5.8–5.10 day.",
    imageUrl: image("photo-1519904981063-b0cf448d479e"),
    joined: false,
  },
  {
    id: "event-sunday",
    title: "Sunday ropes and coffee",
    type: "outdoor",
    visibility: "public",
    dateLabel: "Sun, Jun 23",
    timeLabel: "8:00 am",
    location: "Carver · Oregon",
    host: profiles[1],
    spots: 4,
    attendees: 3,
    description: "Easygoing outdoor ropes day. Bring your own harness and a willingness to laugh at the approach.",
    imageUrl: image("photo-1522163182402-834f871fd851"),
    joined: true,
  },
];

const conversations = [
  {
    id: "conversation-maya",
    profile: profiles[0],
    lastMessage: "I’m down for Tuesday if you are.",
    lastMessageAt: "11:42 am",
    unreadCount: 2,
  },
  {
    id: "conversation-jonah",
    profile: profiles[1],
    lastMessage: "Want to trade belays on Thursday?",
    lastMessageAt: "Yesterday",
    unreadCount: 0,
  },
];

const messages: Record<string, Array<Record<string, unknown>>> = {
  "conversation-maya": [
    { id: "msg-1", conversationId: "conversation-maya", senderId: "maya-chen", body: "Hey Sam — our gym answers looked pretty aligned.", sentAt: "11:30 am", isMine: false },
    { id: "msg-2", conversationId: "conversation-maya", senderId: "me", body: "Definitely. I’m usually at The Circuit on Tuesdays.", sentAt: "11:36 am", isMine: true },
    { id: "msg-3", conversationId: "conversation-maya", senderId: "maya-chen", body: "I’m down for Tuesday if you are.", sentAt: "11:42 am", isMine: false },
  ],
  "conversation-jonah": [
    { id: "msg-4", conversationId: "conversation-jonah", senderId: "jonah-wells", body: "Want to trade belays on Thursday?", sentAt: "Yesterday", isMine: false },
  ],
};

const byId = <T extends { id: string }>(items: T[], id: string) =>
  items.find((item) => item.id === id);

router.get("/discover", (req, res) => {
  const parsed = GetDiscoverProfilesQueryParams.parse(req.query);
  const result = profiles.filter((profile) => {
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

router.get("/gyms", (_req, res) => {
  res.json(GetGymsResponse.parse(gyms));
});

router.get("/profile", (_req, res) => {
  res.json(GetMyProfileResponse.parse(sam));
});

router.patch("/profile", (req, res) => {
  const input = UpdateMyProfileBody.parse(req.body);
  Object.assign(sam, input);
  res.json(UpdateMyProfileResponse.parse(sam));
});

router.post("/swipes", (req, res) => {
  const input = CreateSwipeBody.parse(req.body);
  const profile = byId(profiles, input.profileId);
  const isMatch = input.action === "like" && Boolean(profile);
  const match =
    isMatch && profile
      ? {
          id: `match-${profile.id}`,
          profile,
          matchedAt: "Just now",
          unreadCount: 0,
        }
      : null;
  if (match && !byId(matches, match.id)) matches.unshift(match);
  res.json(CreateSwipeResponse.parse({ action: input.action, isMatch, match }));
});

router.get("/matches", (_req, res) => {
  res.json(GetMatchesResponse.parse(matches));
});

router.get("/events", (req, res) => {
  const parsed = GetEventsQueryParams.parse(req.query);
  const result = events.filter((event) => {
    const typeMatches =
      !parsed.type || parsed.type === "all" || event.type === parsed.type;
    const visibilityMatches =
      !parsed.visibility ||
      parsed.visibility === "all" ||
      event.visibility === parsed.visibility;
    return typeMatches && visibilityMatches;
  });
  res.json(GetEventsResponse.parse(result));
});

router.post("/events", (req, res) => {
  const input = CreateEventBody.parse(req.body);
  const event = {
    id: `event-${Date.now()}`,
    ...input,
    host: sam,
    attendees: 1,
    joined: true,
    visibility: input.visibility ?? "public",
    imageUrl: input.imageUrl ?? image("photo-1522163182402-834f871fd851"),
  };
  events.unshift(event);
  res.status(201).json(CreateEventResponse.parse(event));
});

router.post("/events/:eventId/rsvp", (req, res) => {
  const parsed = RsvpToEventParams.parse(req.params);
  const event = byId(events, parsed.eventId);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  event.joined = !event.joined;
  event.attendees += event.joined ? 1 : -1;
  return res.json(RsvpToEventResponse.parse(event));
});

router.post("/checkins", (req, res) => {
  const input = CreateCheckinBody.parse(req.body);
  const gym = byId(gyms, input.gymId);
  if (!gym) {
    res.status(404).json({ error: "Gym not found" });
    return;
  }
  gym.checkedInCount += 1;
  const checkin = {
    id: `checkin-${Date.now()}`,
    gymId: gym.id,
    gymName: gym.name,
    createdAt: new Date().toISOString(),
    note: input.note ?? "",
  };
  return res.status(201).json(CreateCheckinResponse.parse(checkin));
});

router.get("/conversations", (_req, res) => {
  res.json(GetConversationsResponse.parse(conversations));
});

router.get("/conversations/:conversationId/messages", (req, res) => {
  const parsed = GetMessagesParams.parse(req.params);
  const conversationMessages = messages[parsed.conversationId] ?? [];
  res.json(GetMessagesResponse.parse(conversationMessages));
});

router.post("/conversations/:conversationId/messages", (req, res) => {
  const params = CreateMessageParams.parse(req.params);
  const input = CreateMessageBody.parse(req.body);
  if (!conversations.some((conversation) => conversation.id === params.conversationId)) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const message = {
    id: `msg-${Date.now()}`,
    conversationId: params.conversationId,
    senderId: "me",
    body: input.body,
    sentAt: "Just now",
    isMine: true,
  };
  messages[params.conversationId] ??= [];
  messages[params.conversationId].push(message);
  const conversation = conversations.find((item) => item.id === params.conversationId);
  if (conversation) {
    conversation.lastMessage = input.body;
    conversation.lastMessageAt = "Just now";
  }
  return res.status(201).json(CreateMessageResponse.parse(message));
});

export default router;