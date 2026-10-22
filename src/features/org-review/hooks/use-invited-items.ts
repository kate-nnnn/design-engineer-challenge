"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { orgDashboardKeys } from "@/lib/query-keys";
import type { ReviewItem } from "../types";

// People you've requested an intro to. Refreshed with the rest of the dashboard after each decision.
export function useInvitedItems(orgId: string, roleId?: string) {
	return useQuery<{ items: ReviewItem[]; totalCount: number }>({
		queryKey: orgDashboardKeys.invited(orgId, roleId),
		queryFn: async () => {
			const params = roleId ? `?roleId=${encodeURIComponent(roleId)}` : "";
			const response = await fetch(`/api/organizations/${orgId}/dashboard/review/invited${params}`);
			if (!response.ok) throw new Error("Failed to load invited candidates");
			return response.json();
		},
		staleTime: 30_000,
		enabled: !!orgId,
		placeholderData: keepPreviousData,
	});
}
