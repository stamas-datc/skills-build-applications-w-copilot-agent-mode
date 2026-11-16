import { Schema, model } from 'mongoose';

// User represents a school fitness program participant with identity and fitness goal.
// Required fields: name, email, fitnessGoal. Optional team assignment for team-based activities.
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  fitnessGoal: { type: String, required: true },
});

export const User = model('User', userSchema);
