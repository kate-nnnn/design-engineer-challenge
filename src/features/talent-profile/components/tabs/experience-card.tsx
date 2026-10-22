"use client";

import { groupRolesByEmployer } from "@clera/shared-utils";
import { Briefcase, RotateCw } from "lucide-react";
import { Button } from "@v2/components/ui/button";
import { Card } from "@v2/components/ui/card";
import { Skeleton } from "@v2/components/ui/skeleton";
import { cn } from "@v2/lib/utils";
import { normalizeYoe } from "@v2/utils/format";
import { useMemo, useState } from "react";
import type { MergedProfile } from "@/services/api/talents";
import { useRecalculateYoe } from "../../hooks/use-recalculate-yoe";
import { ExperienceTenureRow } from "./experience-tenure-row";
import { ProfileCardHeader } from "./profile-card-header";
import { ShowMoreFooter } from "./show-more-footer";
import { YoeEditDialog } from "./yoe-edit-dialog";
import { YoeHistoryPopover } from "./yoe-history-popover";

type Experience = MergedProfile["experiences"][number];

interface ExperienceCardProps {
	talentId: string;
	experiences: Experience[];
	yearsExperience?: number | null;
	isLoading?: boolean;
	initialVisible?: number;
	showYoeInternals?: boolean;
	showRecalculate?: boolean;
	showFundingAmount?: boolean;
	className?: string;
}

function ExperienceCard({
	talentId,
	experiences,
	yearsExperience,
	isLoading,
	initialVisible = 3,
	showYoeInternals = true,
	showRecalculate = true,
	showFundingAmount = false,
	className,
}: ExperienceCardProps) {
	const [showAll, setShowAll] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const dbYoe = normalizeYoe(yearsExperience);
	const recalculateYears = useRecalculateYoe(talentId);
	// Several jobs marked current at once is worth a second look before an intro.
	const currentCount = new Set(experiences.filter((exp) => exp.isCurrent).map((exp) => exp.company.name)).size;
	const tenures = useMemo(
		() => groupRolesByEmployer(experiences.map((exp) => ({ ...exp, companyName: exp.company.name }))),
		[experiences],
	);

	return (
		<Card variant="flat" className={cn("overflow-hidden", className)}>
			<ProfileCardHeader icon={Briefcase} title="Experience">
				<div className="flex items-center gap-1.5">
					{currentCount > 1 && (
						<span className="rounded-v2-full bg-v2-status-warning-bg px-2 py-0.5 font-v2-body text-2xs text-v2-status-warning">
							{currentCount} current roles
						</span>
					)}
					{dbYoe !== null &&
						dbYoe > 0 &&
						(showYoeInternals ? (
							<YoeHistoryPopover talentId={talentId} yearsExperience={dbYoe} onEditClick={() => setEditOpen(true)} />
						) : (
							<span className="font-v2-body text-xs text-v2-text-muted">{dbYoe}y</span>
						))}
					{showRecalculate && (
						<Button
							variant="ghost"
							size="icon"
							disabled={recalculateYears.isPending}
							onClick={() => recalculateYears.mutate()}
							className="size-auto border-0 bg-transparent p-0 shadow-none text-v2-text-muted hover:bg-transparent hover:text-v2-text-secondary"
							aria-label="Recalculate years of experience"
						>
							<RotateCw size={14} className={cn(recalculateYears.isPending && "animate-spin")} />
						</Button>
					)}
				</div>
			</ProfileCardHeader>
			{showYoeInternals && (
				<YoeEditDialog talentId={talentId} currentYoe={dbYoe} open={editOpen} onOpenChange={setEditOpen} />
			)}

			{isLoading ? (
				<div className="flex flex-col gap-px border-t border-v2-border-warm/50">
					<ExperienceSkeleton />
					<ExperienceSkeleton />
				</div>
			) : tenures.length === 0 ? (
				<div className="pb-3">
					<p className="font-v2-body text-sm text-v2-text-secondary">No work history yet.</p>
				</div>
			) : (
				<>
					<div className="flex flex-col gap-px border-t border-v2-border-warm/50">
						{(showAll ? tenures : tenures.slice(0, initialVisible)).map((tenure) => (
							<ExperienceTenureRow
								key={`${tenure.companyName}-${tenure.roles[0].title}-${tenure.startDate}`}
								tenure={tenure}
								showFundingAmount={showFundingAmount}
							/>
						))}
					</div>
					{tenures.length > initialVisible && (
						<ShowMoreFooter
							expanded={showAll}
							onToggle={() => setShowAll((v) => !v)}
							moreCount={tenures.length - initialVisible}
						/>
					)}
				</>
			)}
		</Card>
	);
}
ExperienceCard.displayName = "ExperienceCard";

function ExperienceSkeleton() {
	return (
		<div className="flex gap-3 py-2.5">
			<Skeleton className="size-11 shrink-0 rounded-v2-md" />
			<div className="flex flex-1 flex-col gap-1.5">
				<Skeleton className="h-3.5 w-48" />
				<Skeleton className="h-3 w-32" />
				<div className="flex gap-1">
					<Skeleton className="h-4.5 w-16 rounded-v2-sm" />
					<Skeleton className="h-4.5 w-14 rounded-v2-sm" />
				</div>
			</div>
		</div>
	);
}
ExperienceSkeleton.displayName = "ExperienceSkeleton";

export { ExperienceCard };
