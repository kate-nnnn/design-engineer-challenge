"use client";

import { TalentEntityChips } from "@v2/components/data-display";
import { UserAvatar } from "@v2/components/ui/avatar";
import { Button } from "@v2/components/ui/button";
import { useHoverPrefetch } from "@v2/hooks/use-hover-prefetch";
import { useInViewport } from "@v2/hooks/use-in-viewport";
import { cn } from "@v2/lib/utils";
import { type MouseEvent, type ReactNode, useCallback, useState } from "react";
import { isRepeatClick } from "@/utils/mouse";
import { scrollTalentBoardPaneToTop } from "./talent-board-pane-scroll";

const SEEN_RATIO = 0.5;

interface TalentBoardChip {
	name: string;
	logoUrl: string | null;
}

interface TalentBoardCardItem {
	name: string | null;
	titleFallback?: string | null;
	avatarUrl: string | null;
	avatarFallback?: ReactNode;
	subtitle: string | null;
	companies: TalentBoardChip[];
	school: TalentBoardChip | null;
	chipsLoading?: boolean;
}

interface TalentBoardCardProps {
	item: TalentBoardCardItem;
	isSelected: boolean;
	onSelect: () => void;
	onOpen?: () => void;
	onPrefetch: () => void;
	badge?: ReactNode;
	footer?: ReactNode;
	onVisible?: () => void;
	onSeen?: () => void;
	cardKey?: string;
	/** Keeps the chip row clear of action buttons overlaid in the bottom-right corner. */
	reserveActionSpace?: boolean;
}

function TalentBoardCard({
	item,
	isSelected,
	onSelect,
	onOpen,
	onPrefetch,
	badge,
	footer,
	onVisible,
	onSeen,
	reserveActionSpace = false,
	cardKey,
}: TalentBoardCardProps) {
	const isNameless = !item.name;
	const title = item.name ?? item.titleFallback ?? item.subtitle;
	const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
	const cardRef = useInViewport<HTMLButtonElement>({
		onEnter: () => {
			setHasEnteredViewport(true);
			onVisible?.();
		},
	});
	const seenRef = useInViewport<HTMLButtonElement>({
		onEnter: () => onSeen?.(),
		rootMargin: "0px",
		threshold: SEEN_RATIO,
	});
	const setCardNode = useCallback(
		(node: HTMLButtonElement | null) => {
			cardRef.current = node;
			seenRef.current = node;
		},
		[cardRef, seenRef],
	);
	const { handleMouseEnter, handleMouseLeave } = useHoverPrefetch(onPrefetch);
	const handleClick = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			if (isRepeatClick(event)) return;
			if (isSelected) scrollTalentBoardPaneToTop();
			onSelect();
		},
		[isSelected, onSelect],
	);

	return (
		<Button
			ref={setCardNode}
			type="button"
			variant="unstyled"
			size="unstyled"
			data-board-key={cardKey}
			onClick={handleClick}
			onDoubleClick={onOpen}
			onPointerEnter={handleMouseEnter}
			onPointerLeave={handleMouseLeave}
			onPointerDown={onPrefetch}
			className={cn(
				"flex w-full flex-col rounded-v2-lg border px-5 text-left transition-colors",
				isNameless ? "gap-3.5 py-5" : "gap-4 py-6",
				isSelected
					? "border-v2-brand-teal bg-v2-bg-card"
					: "border-transparent bg-v2-bg-warm hover:bg-v2-bg-active",
			)}
		>
			{/* Tags sit on their own row, so the avatar lines up with the name and nothing truncates. */}
			{badge && <div className={cn("-mb-2.5 flex flex-wrap gap-1.5", isNameless ? "pl-11" : "pl-12")}>{badge}</div>}
			<div className="flex w-full items-center gap-3">
				<UserAvatar
					src={hasEnteredViewport ? (item.avatarUrl ?? undefined) : undefined}
					name={item.name}
					fallback={item.avatarFallback}
					className={cn("shrink-0", isNameless ? "size-8" : "size-9")}
				/>
				<div className="min-w-0 flex-1">
					<span
						className={cn(
							"block min-w-0 font-v2-body font-medium text-sm leading-snug text-v2-text-primary",
							isNameless ? "line-clamp-2" : "truncate",
						)}
					>
						{title}
					</span>
					{item.subtitle && item.subtitle !== title && (
						<p className="mt-0.5 line-clamp-2 font-v2-body text-v2-text-tertiary text-xs leading-relaxed">
							{item.subtitle}
						</p>
					)}
				</div>
			</div>

			<TalentEntityChips
				companies={item.companies}
				school={item.school}
				isLoading={item.chipsLoading}
				maxVisible={2}
				className={cn("w-full", isNameless ? "pl-11" : "pl-12", reserveActionSpace && "pr-18")}
			/>
			{footer && <div className={cn("w-full", isNameless ? "pl-11" : "pl-12")}>{footer}</div>}
		</Button>
	);
}
TalentBoardCard.displayName = "TalentBoardCard";

export type { TalentBoardCardItem, TalentBoardCardProps, TalentBoardChip };
export { TalentBoardCard };
