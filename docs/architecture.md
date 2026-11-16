# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries 

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: React components with `useEffect` hooks to fetch data from the API, managing loading/error/success states with accessible ARIA roles (`role="status"` for loading, `role="alert"` for errors). Used Bootstrap classes for styling.
- Logic tier decision: Express routes delegate to service functions in `octofitService.ts` that perform validation, database operations, and aggregations. Routes catch errors and pass them to Express middleware for consistent error handling.
- Data tier decision: Mongoose schemas with `required: true` validators on all required fields. Team members default to empty array. Activity's `points` and `occurredAt` computed by service layer.
- Activity tracking approach: Service validates `userId` and `teamId` as valid ObjectIds and that referenced documents exist (returns 400 if not). Calculates points as `minutes × 1.5` and sets `occurredAt` to current date.
- Team management approach: Service validates required `name` field (returns 400 if missing). Accepts optional `mascot` and `members` array for team creation.
- Leaderboard approach: MongoDB aggregation pipeline groups activities by team, sums points, looks up team names, sorts descending by points, and assigns 1-based ranks.
- Workout suggestions approach: Service finds user by email (returns 404 if not found). Analyzes recent 10 activities, maps types to focus areas (run/cycle/walk → endurance, strength → strength). Returns workout matching that focus with explanation reason.

## Test plan

Record the commands you run and what each failure means.

### Results Summary
All tests passing ✅

### Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
**Status: ✅ 5/5 tests passing**

Validation coverage:
- User model enforces `name`, `email`, `fitnessGoal` required fields
- Team model enforces `name`, `mascot` required fields and `members` array with `[]` default
- Activity model enforces all fields required: `type`, `user`, `team`, `minutes`, `points`, `occurredAt`
- Workout model enforces `focus`, `minutes`, `difficulty` required fields

Seed idempotency verified:
- Stable fixture keys (email, name) used for upserts ensure no duplicates on re-seed
- Team membership reconciliation removes users from previous teams before assignment
- Unrelated MongoDB records preserved on successive seed runs
- Same counts returned on first and second run (2 users, 2 teams, 2 activities, 2 workouts)

### API command: `npm run test:api --prefix octofit-tracker/backend`
**Status: ✅ 4/4 tests passing**

Expected failures (now fixed):
- Activity endpoints returned 501: implemented validation in `createActivity()` that checks required fields, validates ObjectIds, and verifies user/team existence; returns 400 for invalid input
- Team endpoints returned 501: implemented validation in `createTeam()` that checks required `name` field; returns 400 if missing
- Leaderboard returned empty array: implemented MongoDB aggregation pipeline that groups by team, sums points, joins team names, sorts descending, and assigns ranks
- Workout suggestions returned wrong focus: implemented analysis of recent activities with type-to-focus mapping (run/cycle/walk→endurance, strength→strength) and reason explanation

### Frontend command: `npm test --prefix octofit-tracker/frontend`
**Status: ✅ 15/15 tests passing**

Expected failures (now fixed):
- All components showed "Implementation pending": implemented full data fetching with `useEffect` hooks for Activities, Teams, Leaderboard, Workouts
- No loading states: added `role="status"` with "Loading..." messages
- No error handling: added `role="alert"` with error messages
- No empty states: added empty state messages when no data returned
- No data display: implemented list rendering with proper keys, formatting, and Bootstrap styling

### Backend build command: `npm run build --prefix octofit-tracker/backend`
**Status: ✅ Builds successfully**
- TypeScript compilation passes with no errors

### Frontend build command: `npm run build --prefix octofit-tracker/frontend`
**Status: ✅ Builds successfully**
- Vite production build outputs 46 modules, 0.36 KB HTML, 231 KB CSS, 267 KB JS
- No TypeScript or build errors
