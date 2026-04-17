import type { Session } from "next-auth";
import { getSession } from "next-auth/react";

function normalizeToken(token: string | null | undefined) {
  const trimmedToken = token?.trim();
  return trimmedToken ? trimmedToken : null;
}

function getLegacyStoredAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const directToken = normalizeToken(
    window.localStorage.getItem("token") ??
      window.localStorage.getItem("userToken") ??
      window.localStorage.getItem("authToken"),
  );

  if (directToken) {
    return directToken;
  }

  const storedUser = window.localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(storedUser) as { token?: string };
    return normalizeToken(parsedUser.token);
  } catch {
    return null;
  }
}

export function getSessionAuthToken(session: Session | null | undefined) {
  return normalizeToken(session?.user?.token);
}

export async function getClientAuthToken() {
  const sessionToken = getSessionAuthToken(await getSession());

  if (sessionToken) {
    return sessionToken;
  }

  return getLegacyStoredAuthToken();
}
