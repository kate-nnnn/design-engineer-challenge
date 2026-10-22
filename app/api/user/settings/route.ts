import { error, json, latency, requireUser } from "@mock/http";
import { type NotificationPrefs, notificationsFor, settings } from "@mock/settings";

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const body = (await request.json()) as { firstName?: string; lastName?: string; notifications?: NotificationPrefs };
  if (body.firstName !== undefined && !body.firstName.trim()) return error("First name can't be empty.", 422);
  await latency(300, 700);
  if (body.firstName !== undefined) user.firstName = body.firstName.trim();
  if (body.lastName !== undefined) user.lastName = body.lastName.trim();
  if (body.notifications) settings.notifications.set(user.id, { ...notificationsFor(user.id), ...body.notifications });
  return json({ ok: true });
}
