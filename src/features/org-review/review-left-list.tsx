"use client";

import type { EntityChipsState } from "@v2/hooks/use-deferred-entity-chips";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ReviewCard } from "./review-card";
import { type ReviewItem, reviewItemKey } from "./types";

interface ReviewLeftListProps {
	items: ReviewItem[];
	selectedKey: string | null;
	onSelect: (item: ReviewItem) => void;
	onOpen?: (item: ReviewItem) => void;
	onPrefetch: (talentId: string) => void;
	onIntro?: (item: ReviewItem) => void;
	onPass?: (item: ReviewItem) => void;
	isPending: (item: ReviewItem) => boolean;
	chipsFor: (talentId: string) => EntityChipsState;
	onCardVisible: (talentId: string) => void;
	onCardSeen: (talentId: string) => void;
	showRole?: boolean;
	/** Splits the list into a short "Best candidates" group and the rest. */
	grouped?: boolean;
}

const BEST_COUNT = 3;

function GroupLabel({ children, hint, first = false }: { children: string; hint?: string; first?: boolean }) {
	return (
		<div className={`flex items-baseline justify-between gap-2 px-1 pb-3 ${first ? "pt-1" : "pt-7"}`}>
			<span className="font-v2-body text-xs font-medium text-v2-text-primary">{children}</span>
			{hint && <span className="truncate font-v2-body text-2xs text-v2-text-tertiary">{hint}</span>}
		</div>
	);
}

export function ReviewLeftList({
	items,
	selectedKey,
	onSelect,
	onOpen,
	onPrefetch,
	onIntro,
	onPass,
	isPending,
	chipsFor,
	onCardVisible,
	onCardSeen,
	showRole = false,
	grouped = false,
}: ReviewLeftListProps) {
	const showGroups = grouped && items.length > BEST_COUNT;
	const prefersReducedMotion = useReducedMotion();
	const exit = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 };

	return (
		<div className="flex flex-col gap-2">
			<AnimatePresence initial={false}>
				{items.map((item, index) => (
					<motion.div key={reviewItemKey(item)} exit={exit} transition={{ duration: 0.15 }} className="overflow-hidden">
						{showGroups && index === 0 && <GroupLabel first hint="Highest match scores for this role">
								Best candidates
							</GroupLabel>}
						{showGroups && index === BEST_COUNT && <GroupLabel>Other good candidates</GroupLabel>}
						<ReviewCard
							item={item}
							isSelected={selectedKey === reviewItemKey(item)}
							isPending={isPending(item)}
							onSelect={() => onSelect(item)}
							onOpen={onOpen && (() => onOpen(item))}
							onPrefetch={() => onPrefetch(item.talentId)}
							onIntro={onIntro && (() => onIntro(item))}
							onPass={onPass && (() => onPass(item))}
							chips={chipsFor(item.talentId)}
							onVisible={onCardVisible}
							onSeen={onCardSeen}
							showRole={showRole}
							best={showGroups && index < BEST_COUNT}
						/>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}

ReviewLeftList.displayName = "ReviewLeftList";
