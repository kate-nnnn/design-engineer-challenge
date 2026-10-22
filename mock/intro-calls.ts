import { ROLE_IDS } from "./ids";

export interface IntroCall {
  id: string;
  talentName: string;
  roleId: string;
  roleName: string;
  startsAt: string;
  durationMinutes: number;
}

// Sample first calls for Home's calendar. The challenge's mock API has no scheduling data,
// so these are generated relative to now and labelled "Sample" in the UI.
const SAMPLE_CALLS: Array<Omit<IntroCall, "startsAt"> & { dayOffset: number; hour: number; minute: number }> = [
  { id: "call-1", talentName: "Mara Lindqvist", roleId: ROLE_IDS.backend, roleName: "Founding Backend Engineer", dayOffset: 0, hour: 15, minute: 30, durationMinutes: 30 },
  { id: "call-2", talentName: "Leonie Fischer", roleId: ROLE_IDS.design, roleName: "Senior Product Designer", dayOffset: 1, hour: 10, minute: 0, durationMinutes: 45 },
  { id: "call-3", talentName: "Sofia Marchetti", roleId: ROLE_IDS.ml, roleName: "Staff Machine Learning Engineer", dayOffset: 2, hour: 14, minute: 0, durationMinutes: 30 },
  { id: "call-4", talentName: "Kwame Asante", roleId: ROLE_IDS.backend, roleName: "Founding Backend Engineer", dayOffset: 4, hour: 11, minute: 30, durationMinutes: 30 },
];

export function upcomingIntroCalls(now = new Date()): IntroCall[] {
  return SAMPLE_CALLS.map(({ dayOffset, hour, minute, ...call }) => {
    const start = new Date(now);
    start.setDate(start.getDate() + dayOffset);
    start.setHours(hour, minute, 0, 0);
    return { ...call, startsAt: start.toISOString() };
  })
    .filter((call) => Date.parse(call.startsAt) > now.getTime() - 30 * 60_000)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
