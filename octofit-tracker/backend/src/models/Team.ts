import { Schema, model } from 'mongoose';

// Team represents a group of users competing in fitness activities.
// Tracks team name, mascot, and member roster for leaderboard aggregation.
// Members array defaults to empty and is managed through upsert operations.
const teamSchema = new Schema({
  name: { type: String, required: true },
  mascot: { type: String, required: true },
  members: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
});

export const Team = model('Team', teamSchema);
