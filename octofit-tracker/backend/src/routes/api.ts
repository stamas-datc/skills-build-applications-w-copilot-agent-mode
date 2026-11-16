import { Router } from 'express';
import { createActivity, createTeam, getLeaderboard, listActivities, listTeams, suggestWorkouts } from '../services/octofitService.js';

export const apiRouter = Router();

// GET /api/activities - Retrieve all recorded fitness activities.
// Returns activities as array in { activities: [...] } envelope.
apiRouter.get('/activities', async (_request, response, next) => {
  try { response.json({ activities: await listActivities() }); } catch (error) { next(error); }
});

// POST /api/activities - Create a new fitness activity with validation.
// Accepts { userId, teamId, type, minutes }. Service validates inputs,
// checks user/team existence, computes points (minutes × 1.5), sets timestamp.
// Returns 201 with activity in { activity: {...} } envelope or 4xx on error.
apiRouter.post('/activities', async (request, response, next) => {
  try { response.status(201).json({ activity: await createActivity(request.body) }); } catch (error) { next(error); }
});

// GET /api/teams - Retrieve all teams.
// Returns teams as array in { teams: [...] } envelope, including members array.
apiRouter.get('/teams', async (_request, response, next) => {
  try { response.json({ teams: await listTeams() }); } catch (error) { next(error); }
});

// POST /api/teams - Create a new team with validation.
// Accepts { name, mascot?, members? }. Service requires name field.
// Returns 201 with team in { team: {...} } envelope or 400 if name missing.
apiRouter.post('/teams', async (request, response, next) => {
  try { response.status(201).json({ team: await createTeam(request.body) }); } catch (error) { next(error); }
});

// GET /api/leaderboard - Retrieve teams ranked by total activity points.
// Uses MongoDB aggregation to group activities by team, sum points,
// join team names, sort descending, and assign 1-based ranks.
// Returns { leaderboard: [{teamName, totalPoints, rank}, ...] }.
apiRouter.get('/leaderboard', async (_request, response, next) => {
  try { response.json({ leaderboard: await getLeaderboard() }); } catch (error) { next(error); }
});

// GET /api/workouts/suggestions/:userEmail - Recommend workouts for a user.
// Finds user by email, analyzes recent 10 activities to determine focus area,
// recommends matching workout with explanation reason. Returns 404 if user not found.
// Response format: { suggestions: [{title, focus, difficulty, reason}, ...] }.
apiRouter.get('/workouts/suggestions/:userEmail', async (request, response, next) => {
  try { response.json({ suggestions: await suggestWorkouts(request.params.userEmail) }); } catch (error) { next(error); }
});
