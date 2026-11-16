import { Schema, model } from 'mongoose';

// Workout represents suggested exercises with focus area, recommended duration, and difficulty level.
// Used to generate personalized recommendations based on user activity patterns and fitness goals.
const workoutSchema = new Schema({
  title: String,
  focus: { type: String, required: true },
  minutes: { type: Number, required: true },
  difficulty: { type: String, required: true },
});

export const Workout = model('Workout', workoutSchema);
