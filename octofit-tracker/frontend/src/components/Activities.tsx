import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Activity {
  _id: string;
  type: string;
  minutes: number;
  points: number;
  user?: string;
  team?: string;
  occurredAt?: string;
}

interface ActivitiesResponse {
  activities: Activity[];
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadActivities() {
      try {
        setLoading(true);
        setError(null);
        const data = await getJson<ActivitiesResponse>('/api/activities');
        setActivities(data.activities);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activities');
      } finally {
        setLoading(false);
      }
    }
    loadActivities();
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        
        {loading && <p role="status">Loading activities...</p>}
        
        {error && <p role="alert">Unable to load activities: {error}</p>}
        
        {!loading && !error && activities.length === 0 && (
          <p>No activities yet. Start tracking!</p>
        )}
        
        {!loading && !error && activities.length > 0 && (
          <ul className="list-unstyled">
            {activities.map((activity, index) => (
              <li key={activity._id || index} className="mb-3">
                <strong>{activity.type}</strong> - {activity.minutes} minutes ({activity.points} points)
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
