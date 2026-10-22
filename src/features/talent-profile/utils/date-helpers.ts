import { formatCalendarYear, formatMonthYear } from "@clera/shared-utils";

function durationLabel(start: string | null, end: string | null): string | null {
	if (!start) return null;
	const s = new Date(start).getTime();
	const e = end ? new Date(end).getTime() : Date.now();
	const months = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24 * 30.44)));
	if (months >= 12) {
		const y = Math.floor(months / 12);
		const m = months % 12;
		return m > 0 ? `${y}y ${m}m` : `${y}y`;
	}
	return `${months}m`;
}

/**
 * `ended` marks a job that is over but has no end date, so it reads "end date unknown"
 * instead of "Present". A role with no dates at all reads "Dates unknown".
 */
function dateRangeLabel(
	start: string | null,
	end: string | null,
	format: "month-year" | "year",
	ended = false,
): string | null {
	const formatBound = format === "year" ? formatCalendarYear : formatMonthYear;
	const startLabel = formatBound(start);
	const endLabel = formatBound(end);
	if (!startLabel) return endLabel ?? "Dates unknown";
	return `${startLabel} — ${endLabel || (ended ? "end date unknown" : "Present")}`;
}

export { dateRangeLabel, durationLabel };
