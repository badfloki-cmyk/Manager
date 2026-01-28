import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

export async function connectMongo() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(MONGODB_URI);
}

const PlayerSchema = new mongoose.Schema({
  name: String,
  position: String,
  number: Number,
  team: String, // "1. Mannschaft" or "2. Mannschaft"
  status: String,
  stats: {
    goals: Number,
    assists: Number,
    matches: Number
  }
});

export const MongoPlayer = mongoose.models.Player || mongoose.model("Player", PlayerSchema);

const EventSchema = new mongoose.Schema({
  title: String,
  type: String,
  start: Date,
  end: Date,
  team: String,
  location: String
});

export const MongoEvent = mongoose.models.Event || mongoose.model("Event", EventSchema);
