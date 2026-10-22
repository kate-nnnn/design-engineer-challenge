import { json, latency, requireUser } from "@mock/http";
import { upcomingIntroCalls } from "@mock/intro-calls";

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  await latency(200, 500);
  return json({ calls: upcomingIntroCalls(), sample: true });
}
