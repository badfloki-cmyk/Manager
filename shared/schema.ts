import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export Auth Models
export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "1. Mannschaft", "2. Mannschaft"
  logoUrl: text("logo_url"),
  color: text("color").default("#10b981"), // Default pitch green
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull(),
  name: text("name").notNull(),
  position: text("position").notNull(), // GK, DEF, MID, FWD
  number: integer("number"),
  status: text("status").default("Active"), // Active, Injured, Suspended
  stats: jsonb("stats").$type<{
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    matchesPlayed: number;
  }>().default({
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    minutesPlayed: 0,
    matchesPlayed: 0
  }),
  isCaptain: boolean("is_captain").default(false),
  avatarUrl: text("avatar_url"),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull(),
  type: text("type").notNull(), // 'training', 'match', 'event'
  title: text("title").notNull(),
  description: text("description"),
  start: timestamp("start").notNull(),
  end: timestamp("end").notNull(),
  location: text("location"),
  opponent: text("opponent"), // For matches
  isHome: boolean("is_home"), // For matches
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  playerId: integer("player_id").notNull(),
  status: text("status").default("Pending"), // Present, Absent, Late, Excused, Pending
  reason: text("reason"), // For absence
});

export const tactics = pgTable("tactics", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull(),
  name: text("name").notNull(),
  formation: text("formation").default("4-4-2"),
  description: text("description"),
  content: text("content"), // Could be JSON for board state or URL for PDF/Video
  type: text("type").default("General"), // General, Set-Piece
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull(),
  userId: text("user_id").notNull(), // Linked to auth users
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  senderName: text("sender_name"), // Cache name for easier display
});

// === RELATIONS ===

export const teamsRelations = relations(teams, ({ many }) => ({
  players: many(players),
  events: many(events),
  tactics: many(tactics),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
  attendance: many(attendance),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  team: one(teams, {
    fields: [events.teamId],
    references: [teams.id],
  }),
  attendance: many(attendance),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  event: one(events, {
    fields: [attendance.eventId],
    references: [events.id],
  }),
  player: one(players, {
    fields: [attendance.playerId],
    references: [players.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertTeamSchema = createInsertSchema(teams).omit({ id: true });
export const insertPlayerSchema = createInsertSchema(players).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });
export const insertTacticSchema = createInsertSchema(tactics).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });

// === EXPLICIT API TYPES ===

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Tactic = typeof tactics.$inferSelect;
export type InsertTactic = z.infer<typeof insertTacticSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type CreatePlayerRequest = InsertPlayer;
export type UpdatePlayerRequest = Partial<InsertPlayer>;
export type UpdateStatsRequest = {
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  minutesPlayed?: number;
  matchesPlayed?: number;
};

export type EventWithAttendance = Event & { attendanceCount: number };
