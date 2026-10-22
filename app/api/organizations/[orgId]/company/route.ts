import { error, json, latency, requireUser } from "@mock/http";
import { type CompanyProfile, settings } from "@mock/settings";

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({ company: settings.company });
}

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole !== "owner") return error("Only owners can edit the company profile.", 403);
  const patch = (await request.json()) as Partial<CompanyProfile>;
  if (patch.name !== undefined && !patch.name.trim()) return error("Company name can't be empty.", 422);
  await latency(400, 900);
  settings.company = { ...settings.company, ...patch };
  return json({ company: settings.company });
}
