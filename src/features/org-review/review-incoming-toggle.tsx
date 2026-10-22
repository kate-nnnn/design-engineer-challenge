"use client";

import { cn } from "@v2/lib/utils";

export type ReviewView = "review" | "passed" | "invited";

interface ReviewIncomingToggleProps {
	view: ReviewView;
	onChange: (view: ReviewView) => void;
	counts: Partial<Record<ReviewView, number>>;
}

const TABS: Array<{ id: ReviewView; label: string }> = [
	{ id: "review", label: "To review" },
	{ id: "passed", label: "Passed" },
	{ id: "invited", label: "Invited" },
];

const TAB = "inline-flex items-start gap-1 font-v2-body text-xl font-medium tracking-tight transition-colors";

export function ReviewIncomingToggle({ view, onChange, counts }: ReviewIncomingToggleProps) {
	return (
		<div role="tablist" aria-label="Candidates" className="flex items-end gap-5">
			{TABS.map((tab) => {
				const active = view === tab.id;
				const count = counts[tab.id];
				return (
					<button
						key={tab.id}
						type="button"
						role="tab"
						aria-selected={active}
						className={cn(TAB, active ? "text-v2-text-primary" : "text-v2-text-muted hover:text-v2-text-secondary")}
						onClick={() => onChange(tab.id)}
					>
						{tab.label}
						{count !== undefined && <sup className="mt-0.5 text-sm font-normal tabular-nums">{count}</sup>}
					</button>
				);
			})}
		</div>
	);
}

ReviewIncomingToggle.displayName = "ReviewIncomingToggle";
