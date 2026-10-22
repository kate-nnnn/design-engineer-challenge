"use client";

import type React from "react";

import { TalentBoardCard } from "@v2/features/org-shared-cards";
import { Briefcase } from "lucide-react";
import type { EntityChipsState } from "@v2/hooks/use-deferred-entity-chips";
import { ReviewCardActions } from "./review-card-actions";
import { StreamBadge } from "./stream-badge";
import { type ReviewItem, reviewItemKey, streamOf } from "./types";
import { waitingLabel } from "./waiting-since";
import { cn } from "@v2/lib/utils";

interface ReviewCardProps {
	item: ReviewItem;
	isSelected: boolean;
	isPending?: boolean;
	onSelect: () => void;
	onOpen?: () => void;
	onPrefetch: () => void;
	onIntro?: () => void;
	onPass?: () => void;
	chips: EntityChipsState;
	onVisible: (talentId: string) => void;
	onSeen?: (talentId: string) => void;
	/** In "All roles" the same person can appear once per role, so each card names its role. */
	showRole?: boolean;
	/** One of the platform's best evaluated candidates: shows the match score. */
	best?: boolean;
	/** An action pinned to the card's bottom-right corner, e.g. "Bring back" on Passed. */
	cornerAction?: React.ReactNode;
}

export function ReviewCard({
	item,
	isSelected,
	isPending = false,
	onSelect,
	onOpen,
	onPrefetch,
	onIntro,
	onPass,
	chips,
	onVisible,
	onSeen,
	showRole = false,
	best = false,
	cornerAction,
}: ReviewCardProps) {
	const hasActions = !!onIntro && !!onPass;
	const waiting = waitingLabel(item.receivedAt);
	const scoreTag =
		best && item.matchScore != null ? (
			<span className="inline-flex items-center rounded-full bg-v2-status-success-bg px-2 py-0.5 font-v2-body text-2xs font-medium text-v2-status-success-text tabular-nums">
				{item.matchScore}% match
			</span>
		) : null;
	const badge =
		item.source !== "passed" ? (
			<>
				{scoreTag}
				<StreamBadge stream={streamOf(item.bucket)} />
			</>
		) : undefined;
	const waitingText = waiting && (
		<span
			title={waiting.title}
			className={cn("shrink-0 tabular-nums", waiting.stale ? "text-v2-status-warning" : "text-v2-text-tertiary")}
		>
			{waiting.text}
		</span>
	);
	// Role and waiting time share one quiet line under the companies.
	const footer =
		showRole || waitingText ? (
			<span className="flex min-w-0 items-center gap-1.5 font-v2-body text-2xs text-v2-text-tertiary">
				{showRole && (
					<>
						<Briefcase size={12} aria-hidden className="shrink-0" />
						<span className="truncate">
							{item.roleName ? `For ${item.roleName}` : "No role yet, pick one when you request the intro"}
						</span>
					</>
				)}
				{showRole && waitingText && <span aria-hidden>·</span>}
				{waitingText}
			</span>
		) : undefined;

	const card = (
		<TalentBoardCard
			cardKey={reviewItemKey(item)}
			item={{
				name: item.talentName,
				avatarUrl: item.talentAvatarUrl,
				// Never leave the headline line empty: fall back to the role line, then say so.
				subtitle: item.talentOneliner || item.headline || "Current role not mentioned",
				companies: chips.companies,
				school: chips.school,
				chipsLoading: chips.isLoading,
			}}
			isSelected={isSelected}
			onSelect={onSelect}
			onOpen={onOpen}
			onPrefetch={onPrefetch}
			badge={badge}
			footer={footer}
			onVisible={() => onVisible(item.talentId)}
			onSeen={onSeen && (() => onSeen(item.talentId))}
			reserveActionSpace={hasActions || !!cornerAction}
		/>
	);

	if (cornerAction) {
		return (
			<div className="relative">
				{card}
				<div className="absolute right-4 bottom-4">{cornerAction}</div>
			</div>
		);
	}

	if (!hasActions) return card;

	return (
		<div className="group relative">
			{card}
			<ReviewCardActions
				talentName={item.talentName}
				isPending={isPending}
				isPinned={isSelected}
				onIntro={onIntro}
				onPass={onPass}
			/>
		</div>
	);
}

ReviewCard.displayName = "ReviewCard";
