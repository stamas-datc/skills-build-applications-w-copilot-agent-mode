import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

// WorkoutSuggestion represents a recommended exercise with metadata and explanation.
interface WorkoutSuggestion {
  _id?: string;
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason: string;
}

interface WorkoutsResponse {
  suggestions: WorkoutSuggestion[];
}

// Workouts component fetches personalized workout suggestions for a user.
// Analyzes user's recent activity patterns to recommend matching focus area.
// Displays recommendation reason explaining the suggestion basis.
// Includes loading, error, and empty states for robust user experience.
export default function Workouts() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSuggestions() {
      try {
        setLoading(true);
        setError(null);
        const userEmail = 'mona@example.com';
        const data = await getJson<WorkoutsResponse>(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`);
        setSuggestions(data.suggestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workout suggestions');
      } finally {
        setLoading(false);
      }
    }
    loadSuggestions();
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        
        {loading && <p role="status">Loading workout suggestions...</p>}
        
        {error && <p role="alert">Unable to load workout suggestions: {error}</p>}
        
        {!loading && !error && suggestions.length === 0 && (
          <p>No workout suggestions available.</p>
        )}
        
        {!loading && !error && suggestions.length > 0 && (
          <ul className="list-unstyled">
            {suggestions.map((workout, index) => (
              <li key={workout._id || index} className="mb-3">
                <strong>{workout.title}</strong>
                {workout.focus && <> ({workout.focus})</>}
                <p className="mb-0 small text-muted">{workout.reason}</p>
                {workout.minutes && (
                  <p className="mb-0 small">{workout.minutes} minutes</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
