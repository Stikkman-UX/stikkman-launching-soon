import { ApiError } from "./client";

/**
 * Shared by every admin form and board. The backend's `ApiError` message is
 * already user-safe (validation text, "not found", …); anything else is an
 * unexpected client/network failure and gets a generic message.
 */
export function resolveErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}
