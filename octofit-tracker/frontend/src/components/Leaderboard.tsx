import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

// LeaderboardEntry represents a team's rank and accumulated points.
interface LeaderboardEntry {
  teamName: string;
  totalPoints: number;
  rank: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}

// Leaderboard component fetches and displays teams ranked by total activity points.
// Teams are pre-sorted by the API in descending order of points with 1-based ranking.
// Displays loading, error, and empty states for robust user experience.
export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        setError(null);
        const data = await getJson<LeaderboardResponse>('/api/leaderboard');
        setLeaderboard(data.leaderboard);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        <p>Compare team point totals.</p>
        
        {loading && <p role="status">Loading leaderboard...</p>}
        
        {error && <p role="alert">Unable to load leaderboard: {error}</p>}
        
        {!loading && !error && leaderboard.length === 0 && (
          <p>No leaderboard scores yet.</p>
        )}
        
        {!loading && !error && leaderboard.length > 0 && (
          <ol className="list-unstyled">
            {leaderboard.map((entry) => (
              <li key={entry.rank} className="mb-3">
                <span className="badge bg-primary me-2">#{entry.rank}</span>
                <strong>{entry.teamName}</strong> - {entry.totalPoints} points
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
