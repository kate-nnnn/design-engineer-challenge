import { ORGANIZATION } from "./org";
import { USERS } from "./users";

export interface CompanyProfile {
  name: string;
  website: string;
  tagline: string;
  location: string;
  size: string;
  logo: string | null;
}

export interface PendingInvite {
  email: string;
  role: "owner" | "viewer";
  invitedAt: string;
}

export interface AccessRequest {
  userId: string;
  name: string;
  email: string;
  requestedAt: string;
}

export interface NotificationPrefs {
  weeklyDigest: boolean;
  wantsToMeet: boolean;
  waitingTooLong: boolean;
}

interface SettingsStore {
  company: CompanyProfile;
  invites: PendingInvite[];
  accessRequests: Map<string, AccessRequest>;
  notifications: Map<string, NotificationPrefs>;
}

// In-memory, like the review decisions: survives hot reloads, resets when the server restarts.
const globalStore = globalThis as unknown as { __settings?: SettingsStore };

export const settings: SettingsStore = (globalStore.__settings ??= {
  company: {
    name: ORGANIZATION.name,
    website: ORGANIZATION.website,
    tagline: "Logistics software for the ports that move Europe's freight.",
    location: "Berlin, Germany",
    size: "11–50",
    logo: ORGANIZATION.logo,
  },
  invites: [],
  accessRequests: new Map(),
  notifications: new Map(),
});

// Demo state: Sam (a viewer) has already asked for decision rights, so Settings → Team shows
// a pending request from the start. Seeded once per server run.
const seedFlag = globalThis as unknown as { __settingsSeeded?: boolean };
if (!seedFlag.__settingsSeeded) {
  seedFlag.__settingsSeeded = true;
  settings.accessRequests.set("u_sam", {
    userId: "u_sam",
    name: "Sam Ortiz",
    email: "sam@tidewater.example",
    requestedAt: new Date(Date.now() - 2 * 3_600_000).toISOString(),
  });
}

export const DEFAULT_NOTIFICATIONS: NotificationPrefs = { weeklyDigest: true, wantsToMeet: true, waitingTooLong: true };

export function notificationsFor(userId: string): NotificationPrefs {
  return settings.notifications.get(userId) ?? DEFAULT_NOTIFICATIONS;
}

export function requestAccess(userId: string): AccessRequest | null {
  const user = USERS.find((u) => u.id === userId);
  if (!user) return null;
  const existing = settings.accessRequests.get(userId);
  if (existing) return existing;
  const request = {
    userId,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    requestedAt: new Date().toISOString(),
  };
  settings.accessRequests.set(userId, request);
  return request;
}
