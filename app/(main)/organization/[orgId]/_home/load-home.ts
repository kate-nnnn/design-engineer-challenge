import "server-only";

import { buildInvitedFeed, buildReviewFeed } from "@mock/feed";
import { type IntroCall, upcomingIntroCalls } from "@mock/intro-calls";
import { ROLES } from "@mock/roles";
import { currentUser } from "@mock/store";
import { parseFitReason } from "@clera/shared-utils";

export interface HomeRole {
  id: string;
  name: string;
  paused: boolean;
  openedAt: string;
  waiting: number;
  askedToMeet: number;
  inPipeline: number;
  topScore: number | null;
  hiringManager: string;
}

export interface LongWait {
  talentName: string;
  roleId: string | null;
  roleName: string | null;
  days: number;
}

/** A week without a decision is long for a candidate who is interviewing elsewhere. */
export const LONG_WAIT_DAYS = 7;

export interface HomeData {
  firstName: string | null;
  waiting: number;
  askedToMeet: number;
  flagged: number;
  invited: number;
  inPipeline: number;
  roles: HomeRole[];
  calls: IntroCall[];
  longWaits: LongWait[];
}

// Everything Home needs in one pass over the same mock data the API serves.
export async function loadHome(): Promise<HomeData> {
  const user = await currentUser();
  const feed = buildReviewFeed({ roleId: null });
  const invited = buildInvitedFeed({ roleId: null });

  const roles: HomeRole[] = ROLES.map((role) => {
    const items = feed.items.filter((item) => item.roleId === role.id);
    const scores = items.map((item) => item.matchScore).filter((score): score is number => score != null);
    return {
      id: role.id,
      name: role.position,
      paused: role.status === "paused",
      openedAt: role.createdAt,
      waiting: feed.byRole[role.id]?.pending ?? feed.pausedPending[role.id] ?? 0,
      askedToMeet: items.filter((item) => item.bucket === "intro_request").length,
      inPipeline: role.candidatesInPipeline,
      topScore: scores.length ? Math.max(...scores) : null,
      hiringManager: role.hiringManagerName ?? "Not assigned",
    };
  });

  const now = Date.now();
  const longWaits = feed.items
    .map((item) => {
      const received = item.receivedAt ? Date.parse(item.receivedAt) : Number.NaN;
      const days = Math.floor((now - received) / 86_400_000);
      return { talentName: item.talentName, roleId: item.roleId, roleName: item.roleName, days };
    })
    .filter((wait) => Number.isFinite(wait.days) && wait.days >= LONG_WAIT_DAYS)
    .sort((a, b) => b.days - a.days);

  return {
    longWaits,
    firstName: user?.firstName ?? null,
    waiting: feed.totalCount,
    askedToMeet: feed.items.filter((item) => item.bucket === "intro_request").length,
    flagged: feed.items.filter((item) => parseFitReason(item.fitReason)?.points.some((p) => p.caution)).length,
    invited: invited.totalCount,
    inPipeline: ROLES.reduce((sum, role) => sum + role.candidatesInPipeline, 0),
    roles,
    calls: upcomingIntroCalls(),
  };
}
