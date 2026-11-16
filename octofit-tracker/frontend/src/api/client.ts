// Relative /api paths go through the Vite dev proxy, allowing the Express API to remain on port 8000
// without being exposed to the browser. For production, set VITE_API_BASE_URL environment variable.
export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

// Generic HTTP GET request using fetch, parses JSON response.
// Throws error if response status is not ok (non-2xx), preventing silent failures.
// Supports any response type T through TypeScript generics for type safety.
export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response.json() as Promise<T>;
}
