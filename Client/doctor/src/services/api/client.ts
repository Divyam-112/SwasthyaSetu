/**
 * HTTP client for the SwasthyaSetu backend API.
 * Automatically attaches JWT token from localStorage and handles auth errors.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const TOKEN_KEY = "swasthyasetu_doctor_token";

/** Save token to localStorage */
export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Get token from localStorage */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Remove token (logout) */
export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Generic API request with JWT auth header.
 * Automatically redirects to login on 401.
 */
export async function apiRequest<T>(
  path: string,
  options?: RequestInit & { skipAuth?: boolean },
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  // Attach JWT token if available
  if (!options?.skipAuth) {
    const token = getAuthToken();

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle auth errors
  if (response.status === 401) {
    clearAuthToken();

    // Redirect to login if not already there
    if (!window.location.pathname.includes("/doctor")) {
      window.location.href = "/doctor";
    }

    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    // Try to extract error message from backend response
    let errorMessage = `Request failed: ${response.status}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If response body isn't JSON, use default message
    }

    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}
