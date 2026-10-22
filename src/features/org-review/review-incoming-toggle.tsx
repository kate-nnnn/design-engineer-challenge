"use client";

import { cn } from "@v2/lib/utils";

interface ReviewIncomingToggleProps {
	showPassed: boolean;
	onChange: (showPassed: boolean) => void;
	/** Shown next to "To review", e.g. "12" or "12+" when the feed is paged. */
	unreviewedCount?: string;
}

const TAB = "inline-flex items-start gap-1 font-v2-body text-xl font-medium tracking-tight transition-colors";

export function ReviewIncomingToggle({ showPassed, onChange, unreviewedCount }: ReviewIncomingToggleProps) {
	return (
		<div role="tablist" aria-label="Candidates" className="flex items-end gap-8">
			<button
				type="button"
				role="tab"
				aria-selected={!showPassed}
				className={cn(TAB, showPassed ? "text-v2-text-muted hover:text-v2-text-secondary" : "text-v2-text-primary")}
				onClick={() => onChange(false)}
			>
				To review
				{unreviewedCount && <sup className="mt-0.5 text-sm font-normal tabular-nums">{unreviewedCount}</sup>}
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={showPassed}
				className={cn(TAB, showPassed ? "text-v2-text-primary" : "text-v2-text-muted hover:text-v2-text-secondary")}
				onClick={() => onChange(true)}
			>
				Passed
			</button>
		</div>
	);
}

ReviewIncomingToggle.displayName = "ReviewIncomingToggle";
