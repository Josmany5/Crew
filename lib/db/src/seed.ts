// Seed the Crew demo data into Supabase Postgres.
// Run:  cd lib/db && node --experimental-strip-types src/seed.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import path from "node:path";
import * as schema from "./schema/index.ts";

try {
  process.loadEnvFile(path.resolve(import.meta.dirname, "../../../.env"));
} catch {
  // fall through — DATABASE_URL below will error if unset
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const db = drizzle(new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } }), { schema });

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

async function main() {
  // --- clear existing rows (idempotent seed) -------------------------------
  await db.delete(schema.messagesTable);
  await db.delete(schema.conversationsTable);
  await db.delete(schema.rsvpsTable);
  await db.delete(schema.swipesTable);
  await db.delete(schema.matchesTable);
  await db.delete(schema.eventsTable);
  await db.delete(schema.checkinsTable);
  await db.delete(schema.placesTable);
  await db.delete(schema.profilesTable);
  await db.delete(schema.usersTable);

  // --- profiles -------------------------------------------------------------
  await db.insert(schema.profilesTable).values([
    {
      id: "me",
      name: "Sam Rivera",
      age: 31,
      location: "Portland, OR",
      bio: "Always up for a post-work boulder session, a patient belay, or a weekend that starts with coffee and ends at the crag.",
      avatarUrl: image("photo-1517841905240-472988babdf9"),
      disciplines: ["bouldering", "ropes", "outdoor"],
      gyms: ["The Circuit", "Portland Rock Gym"],
      availability: ["Tue evenings", "Sat mornings"],
      gear: ["60m rope", "belay device", "crash pad"],
      openToDating: false,
      verified: true,
      matchPercent: 100,
      lastActive: "now",
      climbingLevel: "V4 / 5.10b",
    },
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
      gear: ["crash pad", "climbing shoes"],
      openToDating: true,
      verified: true,
      matchPercent: 87,
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
      gear: ["70m rope", "quickdraws", "harness"],
      openToDating: false,
      verified: true,
      matchPercent: 81,
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
      gear: ["70m rope", "draws", "camp stove"],
      openToDating: true,
      verified: false,
      matchPercent: 76,
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
      gear: ["climbing shoes", "chalk bag"],
      openToDating: false,
      verified: true,
      matchPercent: 72,
      lastActive: "yesterday",
      climbingLevel: "V6",
    },
  ]);

  // --- places (gyms) ---------------------------------------------------------
  await db.insert(schema.placesTable).values([
    {
      id: "circuit",
      type: "gym",
      name: "The Circuit",
      neighborhood: "Southeast Portland",
      distance: "2.4 mi",
      memberCount: 2840,
      checkedInCount: 18,
      imageUrl: image("photo-1522163182402-834f871fd851"),
      specialties: ["bouldering", "training boards", "late nights"],
      claimed: true,
    },
    {
      id: "prg",
      type: "gym",
      name: "Portland Rock Gym",
      neighborhood: "Northeast Portland",
      distance: "4.1 mi",
      memberCount: 1960,
      checkedInCount: 11,
      imageUrl: image("photo-1544191696-15693072c5ad"),
      specialties: ["top rope", "lead climbing", "youth programs"],
      claimed: false,
    },
    {
      id: "montavilla",
      type: "gym",
      name: "Montavilla Climbing",
      neighborhood: "East Portland",
      distance: "6.2 mi",
      memberCount: 1120,
      checkedInCount: 7,
      imageUrl: image("photo-1522163182402-834f871fd851"),
      specialties: ["bouldering", "community nights", "beginner friendly"],
      claimed: false,
    },
  ]);

  // --- events ----------------------------------------------------------------
  await db.insert(schema.eventsTable).values([
    {
      id: "event-tuesday",
      title: "Tuesday night boulders",
      type: "gym",
      visibility: "crew-only",
      official: false,
      dateLabel: "Tue, Jun 18",
      timeLabel: "6:30 pm",
      location: "The Circuit · Southeast",
      placeId: "circuit",
      hostId: "maya-chen",
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
      official: false,
      dateLabel: "Jun 28–30",
      timeLabel: "7:00 am",
      location: "Smith Rock State Park",
      placeId: null,
      hostId: "riley-park",
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
      official: false,
      dateLabel: "Sun, Jun 23",
      timeLabel: "8:00 am",
      location: "Carver · Oregon",
      placeId: null,
      hostId: "jonah-wells",
      spots: 4,
      attendees: 3,
      description: "Easygoing outdoor ropes day. Bring your own harness and a willingness to laugh at the approach.",
      imageUrl: image("photo-1522163182402-834f871fd851"),
      joined: true,
    },
  ]);


  // --- conversations + messages ---------------------------------------------
  await db.insert(schema.conversationsTable).values([
    { id: "conversation-maya", profileId: "maya-chen", lastMessage: "I’m down for Tuesday if you are.", lastMessageAt: "11:42 am", unreadCount: 2 },
    { id: "conversation-jonah", profileId: "jonah-wells", lastMessage: "Want to trade belays on Thursday?", lastMessageAt: "Yesterday", unreadCount: 0 },
  ]);

  await db.insert(schema.messagesTable).values([
    { id: "msg-1", conversationId: "conversation-maya", senderId: "maya-chen", body: "Hey Sam — our gym answers looked pretty aligned.", sentAt: "11:30 am", isMine: false },
    { id: "msg-2", conversationId: "conversation-maya", senderId: "me", body: "Definitely. I’m usually at The Circuit on Tuesdays.", sentAt: "11:36 am", isMine: true },
    { id: "msg-3", conversationId: "conversation-maya", senderId: "maya-chen", body: "I’m down for Tuesday if you are.", sentAt: "11:42 am", isMine: false },
    { id: "msg-4", conversationId: "conversation-jonah", senderId: "jonah-wells", body: "Want to trade belays on Thursday?", sentAt: "Yesterday", isMine: false },
  ]);

  // --- matches + swipes ------------------------------------------------------
  await db.insert(schema.matchesTable).values([
    { id: "match-maya", profileA: "me", profileB: "maya-chen", matchedAt: "Today", unreadCount: 2 },
    { id: "match-jonah", profileA: "me", profileB: "jonah-wells", matchedAt: "Yesterday", unreadCount: 0 },
  ]);

  await db.insert(schema.swipesTable).values([
    { id: "swipe-1", actorId: "me", targetId: "maya-chen", action: "like" },
    { id: "swipe-2", actorId: "me", targetId: "jonah-wells", action: "like" },
    { id: "swipe-3", actorId: "maya-chen", targetId: "me", action: "like" },
    { id: "swipe-4", actorId: "jonah-wells", targetId: "me", action: "like" },
  ]);

  console.log("SEEDED: 5 profiles, 3 gyms, 3 events, 2 conversations, 4 messages, 2 matches, 4 swipes");
  process.exit(0);
}

main().catch((error) => {
  console.error("SEED FAILED:", error);
  process.exit(1);
});

