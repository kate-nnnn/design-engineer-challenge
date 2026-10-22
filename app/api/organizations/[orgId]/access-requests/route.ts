import { error, json, latency, requireUser } from "@mock/http";

// Viewers ask the org's owners for decision rights. Kept in memory: one pending request per user.
const pendingRequests = new Map<string, string>();

export async function POST() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole !== "viewer") return error("You can already decide on candidates.", 409);
  await latency(300, 700);
  const requestedAt = pendingRequests.get(user.id) ?? new Date().toISOString();
  pendingRequests.set(user.id, requestedAt);
  return json({ status: "pending", requestedAt });
}
