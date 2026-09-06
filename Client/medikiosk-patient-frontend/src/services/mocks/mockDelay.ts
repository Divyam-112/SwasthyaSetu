/** Simulates realistic network latency so loading states are visible
 * during development and demo, and so the transition to a real
 * FastAPI backend later doesn't suddenly change perceived performance. */
export function mockDelay<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
