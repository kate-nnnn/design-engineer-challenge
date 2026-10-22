"use client";

import { parseFitReason } from "@clera/shared-utils";
import { cn } from "@v2/lib/utils";
import { Sparkles, X } from "lucide-react";
import { type ReviewItem, streamOf } from "./types";

export const QUICK_FILTERS = [
	{ id: "asked", label: "Asked to meet you", test: (item: ReviewItem) => streamOf(item.bucket) === "interest" },
	{ id: "picks", label: "Clera's picks", test: (item: ReviewItem) => streamOf(item.bucket) === "curated" },
	{ id: "drop", label: "This week's drop", test: (item: ReviewItem) => streamOf(item.bucket) === "drop" },
	{
		id: "flags",
		label: "Has something to check",
		test: (item: ReviewItem) => parseFitReason(item.fitReason)?.points.some((point) => point.caution) ?? false,
	},
] as const;

export type QuickFilterId = (typeof QUICK_FILTERS)[number]["id"];

interface ReviewPromptBoxProps {
	value: string;
	onChange: (value: string) => void;
	activeFilter: QuickFilterId | null;
	onFilterChange: (filter: QuickFilterId | null) => void;
}

// Plain text search for now: name, one-liner, companies and school. It sits where the AI
// assistant will live, so asking for "payments engineers in Berlin" can later go to the model.
export function matchesReviewQuery(item: ReviewItem, query: string, filter: QuickFilterId | null = null): boolean {
	if (filter && !QUICK_FILTERS.find((quick) => quick.id === filter)?.test(item)) return false;
	const needle = query.trim().toLowerCase();
	if (!needle) return true;
	const haystack = [
		item.talentName,
		item.talentOneliner,
		item.headline,
		item.school?.name,
		...item.companies.map((company) => company.name),
	]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
	return needle.split(/\s+/).every((word) => haystack.includes(word));
}

export function ReviewPromptBox({ value, onChange, activeFilter, onFilterChange }: ReviewPromptBoxProps) {
	return (
		<div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2.5 bg-linear-to-t from-v2-bg-page from-75% to-transparent px-1 pt-12 pb-1">
			<div className="pointer-events-auto flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
				{QUICK_FILTERS.map((quick) => {
					const active = activeFilter === quick.id;
					return (
						<button
							key={quick.id}
							type="button"
							aria-pressed={active}
							onClick={() => onFilterChange(active ? null : quick.id)}
							className={cn(
								"shrink-0 rounded-v2-md border px-2.5 py-1.5 font-v2-body text-xs transition-colors",
								active
									? "border-v2-brand-teal bg-v2-status-success-bg text-v2-text-brand"
									: "border-v2-border-default bg-v2-bg-card text-v2-text-secondary hover:text-v2-text-primary",
							)}
						>
							{quick.label}
						</button>
					);
				})}
			</div>
			<label className="pointer-events-auto flex min-h-16 items-start gap-2.5 rounded-v2-lg bg-v2-bg-card px-4 py-3.5 shadow-v2-ai-glow">
				<Sparkles size={16} aria-hidden className="mt-0.5 shrink-0 text-v2-ai-neon" />
				<span className="sr-only">Search candidates or ask AI</span>
				<input
					type="text"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					onKeyDown={(event) => {
						// Keep the board's ↵ / ⌫ shortcuts from firing while typing here.
						event.stopPropagation();
						if (event.key === "Escape") onChange("");
					}}
					placeholder="Search, or ask AI to find someone…"
					className="min-w-0 flex-1 bg-transparent font-v2-body text-sm text-v2-text-primary outline-none placeholder:text-v2-text-placeholder"
				/>
				{value && (
					<button
						type="button"
						onClick={() => onChange("")}
						aria-label="Clear search"
						className="shrink-0 text-v2-text-muted transition-colors hover:text-v2-text-primary"
					>
						<X size={16} />
					</button>
				)}
			</label>
		</div>
	);
}

ReviewPromptBox.displayName = "ReviewPromptBox";
