// Export your models here. Add one export per file
// export * from "./posts";
//
// Each model/table should ideally be split into different files.
// Each model/table should define a Drizzle table, insert schema, and types:
//
//   import { pgTable, text, serial } from "drizzle-orm/pg-core";
//   import { createInsertSchema } from "drizzle-zod";
//   import { z } from "zod/v4";
//
//   export const postsTable = pgTable("posts", {
//     id: serial("id").primaryKey(),
//     title: text("title").notNull(),
//   });
//
//   export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true });
//   export type InsertPost = z.infer<typeof insertPostSchema>;
//   export type Post = typeof postsTable.$inferSelect;

// Drizzle schema for Crew — real persistence (Phase 5).
// Tables mirror the API domain: users, profiles, swipes, matches,
// events, rsvps, conversations, messages, checkins, places.
//
// Pushed to Supabase Postgres with:
//   pnpm --filter @workspace/db run push

import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// users — one row per Supabase auth user
// ---------------------------------------------------------------------------
export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("users_email_idx").on(table.email)],
);

// ---------------------------------------------------------------------------
// profiles — the climber profile attached to a user
// ---------------------------------------------------------------------------
export const profilesTable = pgTable(
  "profiles",
  {
    id: text("id").primaryKey(), // user id
    name: text("name").notNull().default("Climber"),
    age: integer("age"),
    location: text("location"),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    disciplines: jsonb("disciplines").$type<string[]>().notNull().default([]),
    gyms: jsonb("gyms").$type<string[]>().notNull().default([]),
    availability: jsonb("availability").$type<string[]>().notNull().default([]),
    gear: jsonb("gear").$type<string[]>().notNull().default([]),
    openToDating: boolean("open_to_dating").notNull().default(false),
    verified: boolean("verified").notNull().default(false),
    lastActive: text("last_active").notNull().default("now"),
    climbingLevel: text("climbing_level"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("profiles_gyms_idx").on(table.gyms)],
);

// ---------------------------------------------------------------------------
// swipes — like/pass actions between two profiles
// ---------------------------------------------------------------------------
export const swipesTable = pgTable(
  "swipes",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id").notNull(),
    targetId: text("target_id").notNull(),
    action: text("action", { enum: ["like", "pass"] }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("swipes_actor_idx").on(table.actorId),
    index("swipes_target_idx").on(table.targetId),
  ],
);

// ---------------------------------------------------------------------------
// matches — mutual likes
// ---------------------------------------------------------------------------
export const matchesTable = pgTable(
  "matches",
  {
    id: text("id").primaryKey(),
    profileA: text("profile_a").notNull(),
    profileB: text("profile_b").notNull(),
    matchedAt: text("matched_at").notNull().default("Just now"),
    unreadCount: integer("unread_count").notNull().default(0),
  },
  (table) => [
    index("matches_a_idx").on(table.profileA),
    index("matches_b_idx").on(table.profileB),
  ],
);

// ---------------------------------------------------------------------------
// events — community + official climbing events
// ---------------------------------------------------------------------------
export const eventsTable = pgTable(
  "events",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    type: text("type", { enum: ["gym", "outdoor", "trip"] }).notNull(),
    visibility: text("visibility", { enum: ["public", "crew-only"] }).notNull().default("public"),
    official: boolean("official").notNull().default(false),
    dateLabel: text("date_label").notNull(),
    timeLabel: text("time_label").notNull(),
    location: text("location").notNull(),
    placeId: text("place_id"),
    hostId: text("host_id").notNull(),
    spots: integer("spots").notNull().default(6),
    attendees: integer("attendees").notNull().default(1),
    description: text("description"),
    imageUrl: text("image_url"),
    joined: boolean("joined").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("events_place_idx").on(table.placeId),
    index("events_host_idx").on(table.hostId),
  ],
);

// ---------------------------------------------------------------------------
// rsvps — going / maybe / declined per user per event
// ---------------------------------------------------------------------------
export const rsvpsTable = pgTable(
  "rsvps",
  {
    eventId: text("event_id").notNull(),
    profileId: text("profile_id").notNull(),
    status: text("status", { enum: ["going", "maybe", "declined"] }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.eventId, table.profileId] }),
    index("rsvps_event_idx").on(table.eventId),
  ],
);

// ---------------------------------------------------------------------------
// conversations — direct message threads between two matched profiles
// ---------------------------------------------------------------------------
export const conversationsTable = pgTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id").notNull(),
    lastMessage: text("last_message"),
    lastMessageAt: text("last_message_at"),
    unreadCount: integer("unread_count").notNull().default(0),
  },
  (table) => [index("conversations_profile_idx").on(table.profileId)],
);

// ---------------------------------------------------------------------------
// messages — individual messages inside a conversation
// ---------------------------------------------------------------------------
export const messagesTable = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id").notNull(),
    senderId: text("sender_id").notNull(),
    body: text("body").notNull(),
    sentAt: text("sent_at").notNull(),
    isMine: boolean("is_mine").notNull().default(true),
  },
  (table) => [index("messages_conversation_idx").on(table.conversationId)],
);

// ---------------------------------------------------------------------------
// checkins — gym check-ins
// ---------------------------------------------------------------------------
export const checkinsTable = pgTable(
  "checkins",
  {
    id: text("id").primaryKey(),
    gymId: text("gym_id").notNull(),
    gymName: text("gym_name").notNull(),
    profileId: text("profile_id").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("checkins_gym_idx").on(table.gymId)],
);

// ---------------------------------------------------------------------------
// places — gyms & crags (reference data for venue pages)
// ---------------------------------------------------------------------------
export const placesTable = pgTable(
  "places",
  {
    id: text("id").primaryKey(),
    type: text("type", { enum: ["gym", "crag"] }).notNull().default("gym"),
    name: text("name").notNull(),
    neighborhood: text("neighborhood"),
    distance: text("distance"),
    hours: text("hours"),
    about: text("about"),
    memberCount: integer("member_count").notNull().default(0),
    checkedInCount: integer("checked_in_count").notNull().default(0),
    imageUrl: text("image_url"),
    specialties: jsonb("specialties").$type<string[]>().notNull().default([]),
    claimed: boolean("claimed").notNull().default(false),
    brandId: text("brand_id"),
  },
  (table) => [index("places_brand_idx").on(table.brandId)],
);

// ---------------------------------------------------------------------------
// Insert schemas + types (used by the API)
// ---------------------------------------------------------------------------
export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true });
export const insertProfileSchema = createInsertSchema(profilesTable).omit({ id: true });
export const insertSwipeSchema = createInsertSchema(swipesTable).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true });
export const insertRsvpSchema = createInsertSchema(rsvpsTable).omit({ createdAt: true });
export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true });
export const insertCheckinSchema = createInsertSchema(checkinsTable).omit({ id: true, createdAt: true });

export type User = typeof usersTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profilesTable.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Event = typeof eventsTable.$inferSelect;
export type Rsvp = typeof rsvpsTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;
export type Checkin = typeof checkinsTable.$inferSelect;
export type Place = typeof placesTable.$inferSelect;

