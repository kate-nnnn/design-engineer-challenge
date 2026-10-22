"use client";

import { Banknote, Briefcase, Building2, IdCard } from "lucide-react";
import { formatYoeShort } from "@v2/utils/format";
import type { ReactNode } from "react";
import type { PreferencesData } from "@/services/api/talents";
import { formatCompensation } from "./preferences/preference-fields";

interface IdentityFactsRowProps {
	preferences: Pick<
		PreferencesData,
		"workEnvironment" | "salaryLowerBound" | "salaryUpperBound" | "salaryCurrency" | "visaSponsorshipNeeded"
	>;
	yearsExperience?: number | null;
}

function hasFacts({ preferences, yearsExperience = null }: IdentityFactsRowProps): boolean {
	return Boolean(
		formatYoeShort(yearsExperience) ||
			preferences.workEnvironment.length > 0 ||
			formatCompensation(preferences) ||
			preferences.visaSponsorshipNeeded !== null,
	);
}

function IdentityFactsRow({ preferences, yearsExperience = null }: IdentityFactsRowProps) {
	const facts: Array<{ key: string; icon: ReactNode; text: string }> = [];

	const yoe = formatYoeShort(yearsExperience);
	if (yoe) facts.push({ key: "yoe", icon: <Briefcase size={16} />, text: `${yoe} experience` });

	if (preferences.workEnvironment.length > 0) {
		facts.push({
			key: "workEnv",
			icon: <Building2 size={16} />,
			text: preferences.workEnvironment.join(" / "),
		});
	}

	const compensation = formatCompensation(preferences);
	if (compensation) facts.push({ key: "comp", icon: <Banknote size={16} />, text: compensation });

	if (preferences.visaSponsorshipNeeded !== null) {
		facts.push({
			key: "visa",
			icon: <IdCard size={16} />,
			text: preferences.visaSponsorshipNeeded ? "Visa sponsorship required" : "No visa sponsorship needed",
		});
	}

	if (facts.length === 0) return null;

	return (
		<div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1.5">
			{facts.map((fact) => (
				<span key={fact.key} className="inline-flex items-center gap-2 text-v2-text-secondary">
					<span className="shrink-0 text-v2-text-primary">{fact.icon}</span>
					<span className="font-v2-body text-sm">{fact.text}</span>
				</span>
			))}
		</div>
	);
}
IdentityFactsRow.displayName = "IdentityFactsRow";

export { hasFacts, IdentityFactsRow };
