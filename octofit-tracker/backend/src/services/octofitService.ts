import { Activity, Team, User, Workout } from '../models/index.js';
import { Types } from 'mongoose';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const data = input as any;
  
  if (!data.userId || !data.teamId || !data.type || data.minutes === undefined) {
    throw Object.assign(new Error('Missing required fields'), { status: 400 });
  }

  if (!Types.ObjectId.isValid(data.userId) || !Types.ObjectId.isValid(data.teamId)) {
    throw Object.assign(new Error('Invalid user or team ID'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.findById(data.userId),
    Team.findById(data.teamId),
  ]);

  if (!user || !team) {
    throw Object.assign(new Error('User or team not found'), { status: 400 });
  }

  const points = Math.round(data.minutes * 1.5);
  const activity = await Activity.create({
    user: data.userId,
    team: data.teamId,
    type: data.type,
    minutes: data.minutes,
    points,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const data = input as any;

  if (!data.name) {
    throw Object.assign(new Error('Team name is required'), { status: 400 });
  }

  const team = await Team.create({
    name: data.name,
    mascot: data.mascot,
    members: data.members || [],
  });

  return team.toObject();
}

export async function getLeaderboard() {
  const results = await Activity.aggregate([
    {
      $group: {
        _id: '$team',
        totalPoints: { $sum: '$points' },
      },
    },
    {
      $lookup: {
        from: 'teams',
        localField: '_id',
        foreignField: '_id',
        as: 'teamData',
      },
    },
    {
      $unwind: '$teamData',
    },
    {
      $sort: { totalPoints: -1 },
    },
    {
      $project: {
        _id: 0,
        teamName: '$teamData.name',
        totalPoints: 1,
      },
    },
  ]);

  return results.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail });

  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recentActivities = await Activity.find({ user: user._id })
    .sort({ occurredAt: -1 })
    .limit(10)
    .lean();

  let preferredFocus = user.fitnessGoal;

  if (recentActivities.length > 0) {
    const activityTypes = recentActivities.map((a) => a.type);
    const typeCounts: Record<string, number> = {};
    for (const type of activityTypes) {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }
    const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    
    const focusMapping: Record<string, string> = {
      run: 'endurance',
      cycle: 'endurance',
      strength: 'strength',
      walk: 'endurance',
    };
    preferredFocus = focusMapping[mostCommonType] || preferredFocus;
  }

  const workout = await Workout.findOne({ focus: preferredFocus }).lean();

  if (!workout) {
    return [];
  }

  return [
    {
      ...workout,
      reason: `Matches your ${preferredFocus} fitness focus from recent activity`,
    },
  ];
}

export { User };
