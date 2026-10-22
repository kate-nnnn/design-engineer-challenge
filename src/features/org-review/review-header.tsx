"use client";

import { PercentBar } from "@v2/components/data-display";

interface ReviewHeaderProps {
	remaining: number;
	reviewed: number;
	truncated?: boolean;
}

export function ReviewHeader({ remaining, reviewed, truncated }: ReviewHeaderProps) {
	const remainingLabel = truncated ? `${remaining}+` : String(remaining);
	const total = reviewed + remaining;
	const progress = total > 0 ? Math.round((reviewed / total) * 100) : 0;
	return (
		<div className="flex flex-col gap-2 px-1 pb-3">
			<span className="font-v2-body text-xs text-v2-text-tertiary tabular-nums">
				{reviewed > 0 ? `${reviewed} done · ${remainingLabel} left` : `${remainingLabel} waiting on your decision`}
			</span>
			<PercentBar
				value={progress}
				className="h-1 rounded-v2-full bg-v2-bg-active"
				barClassName="rounded-v2-full bg-v2-brand-green"
			/>
		</div>
	);
}

ReviewHeader.displayName = "ReviewHeader";
