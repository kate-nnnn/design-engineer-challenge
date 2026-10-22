import { error, json, latency, requireUser } from "@mock/http";
import { requestAccess, settings } from "@mock/settings";

// Viewers ask the org's owners for decision rights. One pending request per user.
export async function POST() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole !== "viewer") return error("You can already decide on candidates.", 409);
  await latency(300, 700);
  const request = requestAccess(user.id);
  return json({ status: "pending", requestedAt: request?.requestedAt });
}

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({ requests: [...settings.accessRequests.values()] });
}
