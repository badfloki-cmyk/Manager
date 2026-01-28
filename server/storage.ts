import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { 
  teams, players, events, attendance, tactics, messages,
  type Team, type InsertTeam,
  type Player, type InsertPlayer, type UpdatePlayerRequest,
  type Event, type InsertEvent,
  type Attendance, type InsertAttendance,
  type Tactic, type InsertTactic,
  type Message, type InsertMessage
} from "@shared/schema";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";
import { connectMongo, MongoPlayer, MongoEvent } from "./mongo";

export interface IStorage extends IAuthStorage {
  // Teams
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;

  // Players
  getPlayersByTeam(teamId: number): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, updates: UpdatePlayerRequest): Promise<Player>;
  deletePlayer(id: number): Promise<void>;

  // Events
  getEventsByTeam(teamId: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  deleteEvent(id: number): Promise<void>;

  // Attendance
  getAttendanceByEvent(eventId: number): Promise<Attendance[]>;
  updateAttendance(attendance: InsertAttendance): Promise<Attendance>;

  // Tactics
  getTacticsByTeam(teamId: number): Promise<Tactic[]>;
  createTactic(tactic: InsertTactic): Promise<Tactic>;

  // Messages
  getMessagesByTeam(teamId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    connectMongo().catch(err => console.error("MongoDB Connection Error:", err));
  }

  // Auth methods delegated to authStorage
  getUser = authStorage.getUser.bind(authStorage);
  upsertUser = authStorage.upsertUser.bind(authStorage);

  // Teams
  async getTeams(): Promise<Team[]> {
    return await db.select().from(teams);
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    return newTeam;
  }

  // Players
  async getPlayersByTeam(teamId: number): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.teamId, teamId));
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const [newPlayer] = await db.insert(players).values(player).returning();
    return newPlayer;
  }

  async updatePlayer(id: number, updates: UpdatePlayerRequest): Promise<Player> {
    const [updatedPlayer] = await db.update(players)
      .set(updates)
      .where(eq(players.id, id))
      .returning();
    return updatedPlayer;
  }

  async deletePlayer(id: number): Promise<void> {
    await db.delete(players).where(eq(players.id, id));
  }

  // Events
  async getEventsByTeam(teamId: number): Promise<Event[]> {
    return await db.select().from(events)
      .where(eq(events.teamId, teamId))
      .orderBy(desc(events.start));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Attendance
  async getAttendanceByEvent(eventId: number): Promise<Attendance[]> {
    return await db.select().from(attendance).where(eq(attendance.eventId, eventId));
  }

  async updateAttendance(att: InsertAttendance): Promise<Attendance> {
    const [updated] = await db.insert(attendance)
      .values(att)
      .onConflictDoUpdate({
        target: [attendance.eventId, attendance.playerId],
        set: { status: att.status, reason: att.reason }
      })
      .returning();
    return updated;
  }

  // Tactics
  async getTacticsByTeam(teamId: number): Promise<Tactic[]> {
    return await db.select().from(tactics).where(eq(tactics.teamId, teamId));
  }

  async createTactic(tactic: InsertTactic): Promise<Tactic> {
    const [newTactic] = await db.insert(tactics).values(tactic).returning();
    return newTactic;
  }

  // Messages
  async getMessagesByTeam(teamId: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.teamId, teamId))
      .orderBy(desc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();
