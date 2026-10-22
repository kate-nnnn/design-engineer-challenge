import { error, json, latency, requireUser } from "@mock/http";
import { type PendingInvite, settings } from "@mock/settings";
import { USERS } from "@mock/users";

export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole !== "owner") return error("Only owners can invite people.", 403);
  const { email, role } = (await request.json()) as { email: string; role: PendingInvite["role"] };
  const normalized = email?.trim().toLowerCase() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return error("Enter a valid email address.", 422);
  if (USERS.some((u) => u.email === normalized)) return error("They're already on your team.", 409);
  if (settings.invites.some((i) => i.email === normalized)) return error("They've already been invited.", 409);
  await latency(300, 700);
  const invite = { email: normalized, role: role === "owner" ? "owner" : "viewer", invitedAt: new Date().toISOString() } as const;
  settings.invites.push(invite);
  return json({ invite });
}
