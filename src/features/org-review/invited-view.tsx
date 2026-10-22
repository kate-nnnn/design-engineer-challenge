"use client";

import { EmptyState } from "@v2/components/data-display";
import { OrgTalentProfileSheet } from "@v2/features/org-talent-profile";
import { useDeferredEntityChips } from "@v2/hooks/use-deferred-entity-chips";
import { CircleAlert } from "lucide-react";
import { useState } from "react";
import { useInvitedItems } from "./hooks/use-invited-items";
import { ReviewCard } from "./review-card";
import { ReviewRowSkeleton } from "./review-row-skeleton";
import type { ReviewItem } from "./types";

interface InvitedViewProps {
	orgId: string;
	selectedRoleId?: string;
}

// Everyone you've asked to meet, so an intro never disappears into the void after ↵.
export function InvitedView({ orgId, selectedRoleId }: InvitedViewProps) {
	const query = useInvitedItems(orgId, selectedRoleId);
	const [selected, setSelected] = useState<ReviewItem | null>(null);
	const items = query.data?.items ?? [];
	const { chipsFor, onCardVisible } = useDeferredEntityChips(
		orgId,
		items.map((item) => item.talentId),
	);

	if (query.isLoading) {
		return (
			<div className="flex flex-col gap-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<ReviewRowSkeleton key={`invited-row-${i}`} delay={i * 70} />
				))}
			</div>
		);
	}

	if (query.isError) {
		return (
			<EmptyState
				icon={<CircleAlert />}
				heading="Couldn't load your invites"
				description="Something went wrong. Refresh the page to try again."
			/>
		);
	}

	if (items.length === 0) {
		return (
			<EmptyState
				heading="No intros requested yet"
				description="People you request an intro to show up here while we set up the first call."
			/>
		);
	}

	return (
		<>
			<div className="flex flex-col gap-2">
				{items.map((item) => (
					<ReviewCard
						key={`${item.talentId}:${item.opportunityId}`}
						item={item}
						isSelected={selected?.talentId === item.talentId && selected?.opportunityId === item.opportunityId}
						onSelect={() => setSelected(item)}
						onPrefetch={() => {}}
						chips={chipsFor(item.talentId)}
						onVisible={onCardVisible}
						showRole
					/>
				))}
			</div>

			<OrgTalentProfileSheet
				open={!!selected}
				onOpenChange={(next) => {
					if (!next) setSelected(null);
				}}
				orgId={orgId}
				talentId={selected?.talentId ?? null}
				talentName={selected?.talentName ?? null}
				avatarUrlFallback={selected?.talentAvatarUrl ?? null}
				surface="review_passed"
			/>
		</>
	);
}

InvitedView.displayName = "InvitedView";
