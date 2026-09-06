/**
 * Placeholder HTTP client. Every service function below calls through
 * here so that swapping mock implementations for real FastAPI calls
 * later means changing this file (and the service bodies) only —
 * no page or component needs to change.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}
