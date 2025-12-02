import { getUserFromSessionCookie } from "./auth";

export async function getCurrentUserId() {
  const user = await getUserFromSessionCookie();
  return user ? user.user_id : null;
}