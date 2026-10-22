import { error, json, latency, requireUser } from "@mock/http";
import { settings } from "@mock/settings";
import { USERS } from "@mock/users";

// An owner approves (the viewer becomes an owner) or declines a request.
export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole !== "owner") return error("Only owners can manage access.", 403);
  const { userId } = await params;
  const { decision } = (await request.json()) as { decision: "approve" | "decline" };
  if (!settings.accessRequests.has(userId)) return error("No pending request.", 404);
  await latency(300, 600);
  settings.accessRequests.delete(userId);
  const member = USERS.find((u) => u.id === userId);
  if (decision === "approve" && member) member.orgRole = "owner";
  return json({ ok: true });
}
