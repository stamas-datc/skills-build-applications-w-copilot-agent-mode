import { Schema, model } from 'mongoose';

// Activity records individual fitness exercises with computed points and timestamp.
// Links user and team, tracks type (run, cycle, walk, strength), duration in minutes,
// calculated points (minutes × 1.5), and occurrence date for leaderboard aggregation.
const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  type: { type: String, required: true },
  minutes: { type: Number, required: true },
  points: { type: Number, required: true },
  occurredAt: { type: Date, required: true },
});

export const Activity = model('Activity', activitySchema);
