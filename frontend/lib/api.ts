// The only place where the backend address is defined.
// NEXT_PUBLIC_ variables are readable by any visitor of the site:
// only the public API URL goes here, never a secret.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error.";
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      // The JSON header is only needed when a body is sent.
      headers: init?.body
        ? { "Content-Type": "application/json", ...init.headers }
        : init?.headers,
    });
  } catch {
    // fetch rejects when the server is unreachable or the browser blocks
    // the request (for example CORS). Both look the same from here.
    throw new ApiError(
      0,
      `Cannot reach the API at ${API_BASE_URL}. Is the backend running?`,
    );
  }

  if (!response.ok) {
    // NestJS errors look like { statusCode, message, error }.
    // "message" is a string, or an array of strings for validation errors.
    let message = `Request failed with status ${response.status}.`;
    try {
      const body = await response.json();
      if (Array.isArray(body.message)) {
        message = body.message.join(", ");
      } else if (typeof body.message === "string") {
        message = body.message;
      }
    } catch {
      // The body was not JSON: keep the default message.
    }
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}
