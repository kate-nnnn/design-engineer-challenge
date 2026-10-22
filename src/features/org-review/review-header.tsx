"use client";

import { PercentBar } from "@v2/components/data-display";

interface ReviewHeaderProps {
	/** Everyone still waiting, including people beyond the loaded page. */
	remaining: number;
	reviewed: number;
}

export function ReviewHeader({ remaining, reviewed }: ReviewHeaderProps) {
	const total = reviewed + remaining;
	// A sliver of green at zero shows the bar is a progress bar before the first decision.
	const progress = total > 0 ? Math.max(2, Math.round((reviewed / total) * 100)) : 2;
	const status = reviewed > 0 ? `${reviewed} done · ${remaining} left` : `${remaining} waiting on your decision`;
	return (
		<div className="flex flex-col gap-2 px-1 pb-3">
			<span className="font-v2-body text-xs text-v2-text-tertiary tabular-nums">
				{status}
			</span>
			<PercentBar
				value={progress}
				className="h-1 rounded-v2-full bg-v2-bg-active"
				barClassName="rounded-v2-full bg-v2-brand-teal"
			/>
		</div>
	);
}

ReviewHeader.displayName = "ReviewHeader";
