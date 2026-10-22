import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { type ReviewItem, type ReviewListData, reviewItemKey } from "../types";

function adjustByRole(byRole: ReviewListData["byRole"], roleId: string | null, delta: number) {
	if (!roleId || !byRole[roleId]) return byRole;
	const pending = Math.max(0, byRole[roleId].pending + delta);
	return { ...byRole, [roleId]: { ...byRole[roleId], pending } };
}

export function removeFromReviewFeed(queryClient: QueryClient, queryKey: QueryKey, item: ReviewItem) {
	const previous = queryClient.getQueryData<ReviewListData>(queryKey);
	if (!previous) return previous;
	const items = previous.items.filter((i) => reviewItemKey(i) !== reviewItemKey(item));
	const removed = previous.items.length - items.length;
	if (removed === 0) return previous;
	const counts = { ...previous.counts, all: Math.max(0, previous.counts.all - removed) };
	counts[item.bucket] = Math.max(0, counts[item.bucket] - 1);
	queryClient.setQueryData<ReviewListData>(queryKey, {
		items,
		totalCount: Math.max(0, previous.totalCount - removed),
		truncated: previous.truncated,
		counts,
		byRole: adjustByRole(previous.byRole, item.roleId, -removed),
		pausedPending: previous.pausedPending,
	});
	return previous;
}

// Puts one item back where it was. Unlike restoring a whole snapshot, this doesn't undo
// other decisions that were saved while this one was in flight.
export function restoreToReviewFeed(queryClient: QueryClient, queryKey: QueryKey, item: ReviewItem, index: number) {
	const current = queryClient.getQueryData<ReviewListData>(queryKey);
	if (!current) return;
	if (current.items.some((i) => reviewItemKey(i) === reviewItemKey(item))) return;
	const items = [...current.items];
	items.splice(Math.min(Math.max(index, 0), items.length), 0, item);
	const counts = { ...current.counts, all: current.counts.all + 1 };
	counts[item.bucket] = counts[item.bucket] + 1;
	queryClient.setQueryData<ReviewListData>(queryKey, {
		...current,
		items,
		totalCount: current.totalCount + 1,
		counts,
		byRole: adjustByRole(current.byRole, item.roleId, 1),
	});
}

export function insertIntoReviewFeed(queryClient: QueryClient, queryKey: QueryKey, item: ReviewItem) {
	const previous = queryClient.getQueryData<ReviewListData>(queryKey);
	if (!previous) return previous;
	if (previous.items.some((i) => reviewItemKey(i) === reviewItemKey(item))) return previous;
	const counts = { ...previous.counts, all: previous.counts.all + 1 };
	counts[item.bucket] = counts[item.bucket] + 1;
	queryClient.setQueryData<ReviewListData>(queryKey, {
		items: [item, ...previous.items],
		totalCount: previous.totalCount + 1,
		truncated: previous.truncated,
		counts,
		byRole: adjustByRole(previous.byRole, item.roleId, 1),
		pausedPending: previous.pausedPending,
	});
	return previous;
}
