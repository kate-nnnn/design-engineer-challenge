import type { ReviewBucketCounts, ReviewItem, ReviewListData } from "@/lib/review-feed";
import { ROLE_IDS } from "./ids";
import { REVIEW_ITEM_SEEDS, type ReviewItemSeed } from "./review-items";
import { ROLES } from "./roles";
import { decisions, reviewItemKey } from "./store";

const HIDDEN_BEYOND_PAGE_BY_ROLE: Record<string, number> = { [ROLE_IDS.backend]: 9, [ROLE_IDS.ml]: 4 };
const PAUSED_PENDING: Record<string, number> = { [ROLE_IDS.growth]: 6 };

// Stand-in for the platform's fit score: people who asked to meet you and role picks score
// higher than the weekly drop, with a stable spread per person. Unscored when there's no role.
const SCORE_RANGE: Record<ReviewItem["bucket"], [number, number]> = {
  intro_request: [90, 100],
  role_specific: [86, 100],
  weekly_drop: [72, 90],
  public_drop: [68, 86],
};

function matchScoreFor(seed: ReviewItemSeed): number | null {
  if (!seed.roleId) return null;
  let hash = 0;
  for (const char of `${seed.talentId}:${seed.roleId}`) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  const [min, max] = SCORE_RANGE[seed.bucket];
  return min + (Math.abs(hash) % (max - min + 1));
}

function toReviewItem(seed: ReviewItemSeed, index: number, now: number): ReviewItem {
  const { receivedMinutesAgo, ...rest } = seed;
  return {
    ...rest,
    matchScore: matchScoreFor(seed),
    opportunityId: 48000 + index,
    receivedAt: receivedMinutesAgo === null ? null : new Date(now - receivedMinutesAgo * 60_000).toISOString(),
  };
}

function countBuckets(items: ReviewItem[]): ReviewBucketCounts {
  const counts: ReviewBucketCounts = { all: items.length, intro_request: 0, role_specific: 0, weekly_drop: 0, public_drop: 0 };
  for (const item of items) counts[item.bucket] += 1;
  return counts;
}

export function allReviewItems(): ReviewItem[] {
  const now = Date.now();
  return REVIEW_ITEM_SEEDS.map((seed, index) => toReviewItem(seed, index, now));
}

export function findReviewItem({ talentId, roleId }: { talentId: string; roleId: string | null }): ReviewItem | undefined {
  return allReviewItems().find((item) => item.talentId === talentId && item.roleId === roleId);
}

export function findReviewItemByOpportunity(opportunityId: number): ReviewItem | undefined {
  return allReviewItems().find((item) => item.opportunityId === opportunityId);
}

export function buildReviewFeed({ roleId }: { roleId: string | null }): ReviewListData {
  const pending = allReviewItems().filter((item) => !decisions.has(reviewItemKey(item)));

  const byRole = Object.fromEntries(
    ROLES.filter((role) => role.status === "active").map((role) => {
      const visible = pending.filter((item) => item.roleId === role.id).length;
      const hidden = HIDDEN_BEYOND_PAGE_BY_ROLE[role.id] ?? 0;
      return [role.id, { pending: visible + hidden, truncated: hidden > 0 }];
    }),
  );

  const items = roleId ? pending.filter((item) => item.roleId === roleId) : pending;
  const hidden = roleId
    ? (HIDDEN_BEYOND_PAGE_BY_ROLE[roleId] ?? 0)
    : Object.values(HIDDEN_BEYOND_PAGE_BY_ROLE).reduce((sum, count) => sum + count, 0);

  return {
    items,
    totalCount: items.length + hidden,
    truncated: hidden > 0,
    counts: countBuckets(items),
    byRole,
    pausedPending: PAUSED_PENDING,
  };
}

export function buildInvitedFeed({ roleId }: { roleId: string | null }): { items: ReviewItem[]; totalCount: number } {
  const invited = allReviewItems().filter((item) => decisions.get(reviewItemKey(item))?.action === "interview");
  const items = roleId ? invited.filter((item) => item.roleId === roleId) : invited;
  return { items, totalCount: items.length };
}

export function buildPassedFeed({ roleId }: { roleId: string | null }): { items: ReviewItem[]; totalCount: number } {
  const passed = allReviewItems().filter((item) => decisions.get(reviewItemKey(item))?.action === "pass");
  const items = roleId ? passed.filter((item) => item.roleId === roleId) : passed;
  return { items, totalCount: items.length };
}
