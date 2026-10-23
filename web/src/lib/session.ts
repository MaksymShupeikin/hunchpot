// Shared by the proxy and the app code; keep it free of server-only imports.
export const SESSION_COOKIE = "hp_session";

export const signInHref = (next = "/") => `/join?next=${encodeURIComponent(next)}`;
