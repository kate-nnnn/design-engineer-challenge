"use client";

import { dateRangeLabel, durationLabel } from "../../utils";
import { ExperienceDetailsBody } from "./experience-details-body";

interface ExperienceRoleLineProps {
	title: string | null;
	startDate: string | null;
	endDate: string | null;
	isLatest: boolean;
	description: string | null;
	resumeBullets: string[];
}

const TITLE_TEXT = "min-w-0 truncate font-v2-body text-2xs font-medium text-v2-text-primary";

function ExperienceRoleLine({
	title,
	startDate,
	endDate,
	isLatest,
	description,
	resumeBullets,
}: ExperienceRoleLineProps) {
	const range = dateRangeLabel(startDate, endDate, "month-year");
	const duration = durationLabel(startDate, endDate);
	const hasDetails = Boolean(description) || resumeBullets.length > 0;

	return (
		<li className="relative flex flex-col gap-0.5 pl-4">
			<span
				className={`absolute left-0 top-1.5 size-1.5 rounded-v2-full ${isLatest ? "bg-v2-text-brand-green" : "bg-v2-text-muted"}`}
				aria-hidden="true"
			/>
			<div className="flex items-baseline justify-between gap-2">
				<span className={TITLE_TEXT}>{title}</span>
				<span className="shrink-0 font-v2-body text-2xs text-v2-text-muted">
					{range}
					{duration && ` · ${duration}`}
				</span>
			</div>
			{hasDetails && <ExperienceDetailsBody description={description} resumeBullets={resumeBullets} />}
		</li>
	);
}
ExperienceRoleLine.displayName = "ExperienceRoleLine";

export { ExperienceRoleLine };
