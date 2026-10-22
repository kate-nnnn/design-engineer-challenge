import { Skeleton } from "@v2/components/ui/skeleton";
import { cn } from "@v2/lib/utils";
import { LogoLabel } from "./logo-label";

export interface TalentEntityChip {
	name: string;
	logoUrl: string | null;
}

interface TalentEntityChipsProps {
	companies: TalentEntityChip[];
	school?: TalentEntityChip | null;
	className?: string;
	isLoading?: boolean;
	/** Chips shown before the rest collapse into "+N more". Keeps the row on one line. */
	maxVisible?: number;
}

const CHIP = "inline-flex max-w-40 shrink-0 items-center";

export function TalentEntityChips({ companies, school, className, isLoading, maxVisible = 3 }: TalentEntityChipsProps) {
	if (isLoading && companies.length === 0 && !school) {
		return (
			<div className={cn("flex items-center gap-1.5", className)} aria-hidden>
				<Skeleton className="h-5 w-24 rounded-v2-full" />
				<Skeleton className="h-5 w-16 rounded-v2-full" />
			</div>
		);
	}

	// The same company can appear twice in the feed (a second stint), so show it once.
	const seen = new Set<string>();
	const entities = [...companies, ...(school ? [school] : [])].filter((entity) => {
		const key = entity.name.trim().toLowerCase();
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
	if (entities.length === 0) return null;

	const visible = entities.slice(0, maxVisible);
	const hidden = entities.length - visible.length;

	return (
		<div
			className={cn(
				"flex min-w-0 flex-nowrap items-center gap-3 overflow-hidden font-v2-body text-xs text-v2-text-secondary",
				className,
			)}
		>
			{visible.map((entity) => (
				<span key={entity.name} className={CHIP} title={entity.name}>
					<LogoLabel logoUrl={entity.logoUrl} label={entity.name} />
				</span>
			))}
			{hidden > 0 && (
				<span className="shrink-0 whitespace-nowrap text-v2-text-tertiary" title={entities.slice(maxVisible).map((e) => e.name).join(", ")}>
					+{hidden} more
				</span>
			)}
		</div>
	);
}

TalentEntityChips.displayName = "TalentEntityChips";
