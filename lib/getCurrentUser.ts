import { getUserFromSessionCookie } from "./auth";

export async function getCurrentUser() {
  return await getUserFromSessionCookie();
}
