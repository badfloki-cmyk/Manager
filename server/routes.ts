import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

async function seedDatabase() {
  const existingTeams = await storage.getTeams();
  if (existingTeams.length === 0) {
    const team1 = await storage.createTeam({
      name: "1. Mannschaft",
      color: "#10b981",
      logoUrl: "https://placehold.co/100x100?text=1M"
    });
    
    const team2 = await storage.createTeam({
      name: "2. Mannschaft",
      color: "#3b82f6",
      logoUrl: "https://placehold.co/100x100?text=2M"
    });

    // Seed Players for Team 1
    await storage.createPlayer({
      teamId: team1.id,
      name: "Max Mustermann",
      position: "FWD",
      number: 9,
      status: "Active",
      isCaptain: true,
      stats: { goals: 12, assists: 5, yellowCards: 2, redCards: 0, minutesPlayed: 1200, matchesPlayed: 15 }
    });
    await storage.createPlayer({
      teamId: team1.id,
      name: "Lukas Schmidt",
      position: "MID",
      number: 8,
      status: "Active",
      isCaptain: false,
      stats: { goals: 4, assists: 10, yellowCards: 1, redCards: 0, minutesPlayed: 1150, matchesPlayed: 14 }
    });

    // Seed Players for Team 2
    await storage.createPlayer({
      teamId: team2.id,
      name: "Jan Müller",
      position: "DEF",
      number: 4,
      status: "Injured",
      isCaptain: false,
      stats: { goals: 1, assists: 1, yellowCards: 3, redCards: 0, minutesPlayed: 800, matchesPlayed: 10 }
    });

    console.log("Database seeded successfully");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth First
  await setupAuth(app);
  registerAuthRoutes(app);

  // === TEAMS ===
  app.get(api.teams.list.path, async (req, res) => {
    const teams = await storage.getTeams();
    res.json(teams);
  });

  app.get(api.teams.get.path, async (req, res) => {
    const team = await storage.getTeam(Number(req.params.id));
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  });

  app.post(api.teams.create.path, async (req, res) => {
    try {
      const input = api.teams.create.input.parse(req.body);
      const team = await storage.createTeam(input);
      res.status(201).json(team);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === PLAYERS ===
  app.get(api.players.listByTeam.path, async (req, res) => {
    const players = await storage.getPlayersByTeam(Number(req.params.teamId));
    res.json(players);
  });

  app.post(api.players.create.path, async (req, res) => {
    try {
      const input = api.players.create.input.parse(req.body);
      const player = await storage.createPlayer(input);
      res.status(201).json(player);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.players.update.path, async (req, res) => {
    try {
      const input = api.players.update.input.parse(req.body);
      const player = await storage.updatePlayer(Number(req.params.id), input);
      res.json(player);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.players.delete.path, async (req, res) => {
    await storage.deletePlayer(Number(req.params.id));
    res.status(204).end();
  });

  // === EVENTS ===
  app.get(api.events.listByTeam.path, async (req, res) => {
    const events = await storage.getEventsByTeam(Number(req.params.teamId));
    res.json(events);
  });

  app.post(api.events.create.path, async (req, res) => {
    try {
      // Coerce dates if needed, usually zod handles strings to date if configured, 
      // but insertEventSchema expects dates. JSON sends strings.
      // Drizzle-zod should handle string->date coercion for timestamp columns.
      // If not, we might need manual coercion. Let's assume standard handling.
      const input = api.events.create.input.parse({
        ...req.body,
        start: new Date(req.body.start),
        end: new Date(req.body.end)
      });
      const event = await storage.createEvent(input);
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.events.delete.path, async (req, res) => {
    await storage.deleteEvent(Number(req.params.id));
    res.status(204).end();
  });

  // === ATTENDANCE ===
  app.get(api.attendance.getByEvent.path, async (req, res) => {
    const attendance = await storage.getAttendanceByEvent(Number(req.params.eventId));
    res.json(attendance);
  });

  app.post(api.attendance.update.path, async (req, res) => {
    try {
      const input = api.attendance.update.input.parse(req.body);
      const att = await storage.updateAttendance(input);
      res.json(att);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === TACTICS ===
  app.get(api.tactics.listByTeam.path, async (req, res) => {
    const tactics = await storage.getTacticsByTeam(Number(req.params.teamId));
    res.json(tactics);
  });

  app.post(api.tactics.create.path, async (req, res) => {
    try {
      const input = api.tactics.create.input.parse(req.body);
      const tactic = await storage.createTactic(input);
      res.status(201).json(tactic);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === MESSAGES ===
  app.get(api.messages.listByTeam.path, async (req, res) => {
    const messages = await storage.getMessagesByTeam(Number(req.params.teamId));
    res.json(messages);
  });

  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const message = await storage.createMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Seed data
  await seedDatabase();

  return httpServer;
}
