import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

// Team represents a group of students competing in fitness activities.
interface Team {
  _id: string;
  name: string;
  mascot?: string;
  members?: string[];
}

interface TeamsResponse {
  teams: Team[];
}

// Teams component fetches and displays all teams with their members.
// Provides loading, error, and empty states for robust user experience.
export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeams() {
      try {
        setLoading(true);
        setError(null);
        const data = await getJson<TeamsResponse>('/api/teams');
        setTeams(data.teams);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load teams');
      } finally {
        setLoading(false);
      }
    }
    loadTeams();
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        
        {loading && <p role="status">Loading teams...</p>}
        
        {error && <p role="alert">Unable to load teams: {error}</p>}
        
        {!loading && !error && teams.length === 0 && (
          <p>No teams yet.</p>
        )}
        
        {!loading && !error && teams.length > 0 && (
          <ul className="list-unstyled">
            {teams.map((team) => (
              <li key={team._id} className="mb-3">
                <strong>{team.name}</strong>
                {team.mascot && <> - {team.mascot}</>}
                {team.members && team.members.length > 0 && (
                  <p className="mb-0 small">Members: {team.members.join(', ')}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
