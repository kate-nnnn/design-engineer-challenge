"use client";

import { EmptyState } from "@v2/components/data-display";
import type { OrgTalentTracking } from "@v2/components/tracking";
import { isNotFound, useOrgTalentProfile } from "@v2/features/org-talent-profile";
import { TalentProfileContent } from "@v2/features/talent-profile";
import type { ReactNode } from "react";

interface TalentBoardDetailPaneProps {
	orgId: string;
	talentId: string | null;
	tracking: OrgTalentTracking;
	identiconSeed?: string | null;
	displayNameOverride?: string | null;
	fallback: ReactNode;
	/** Shown when the profile can't load. Gets whether it's missing for good, and a retry. */
	errorFallback?: (state: { notFound: boolean; retry: () => void }) => ReactNode;
	profileMeta?: ReactNode;
	profileBelowFacts?: ReactNode;
	footer?: ReactNode;
	/** Decision controls shown right under the summary, where the eye lands after reading why it's a match. */
	decision?: ReactNode;
	emptyHeading?: string;
	emptyDescription?: string;
}

function TalentBoardDetailPane({
	orgId,
	talentId,
	tracking,
	identiconSeed,
	displayNameOverride,
	fallback,
	errorFallback,
	profileMeta,
	profileBelowFacts,
	footer,
	decision,
	emptyHeading = "Select a candidate",
	emptyDescription = "Pick someone on the left to see their full profile here.",
}: TalentBoardDetailPaneProps) {
	const { data: bundle, isError, error, refetch } = useOrgTalentProfile(orgId, talentId ?? "");

	if (!talentId) {
		return <EmptyState heading={emptyHeading} description={emptyDescription} />;
	}

	return (
		<div className="flex h-full flex-col">
			<div key={talentId} data-talent-board-pane="" className="min-h-0 flex-1 overflow-y-auto">
				{bundle ? (
					<TalentProfileContent
						bundle={bundle}
						occupationOverride={bundle.header.oneLiner}
						identiconSeed={identiconSeed}
						displayNameOverride={displayNameOverride}
						tracking={tracking}
						aboveHeader={profileMeta}
						belowFacts={profileBelowFacts}
						afterSummary={decision}
					/>
				) : (
					<>
						{isError && errorFallback ? (
							<div className="mx-auto flex w-full max-w-230 flex-col gap-4 px-5 pt-8 sm:px-8">
								{errorFallback({ notFound: isNotFound(error), retry: () => void refetch() })}
								{profileBelowFacts}
							</div>
						) : isError ? (
							<EmptyState heading="Could not load profile" description="Something went wrong. Please try again." />
						) : (
							fallback
						)}
						{decision && <div className="mx-auto w-full max-w-230 px-5 sm:px-8">{decision}</div>}
					</>
				)}
			</div>
			{footer && <div className="sticky bottom-0 rounded-b-v2-lg bg-v2-bg-card">{footer}</div>}
		</div>
	);
}
TalentBoardDetailPane.displayName = "TalentBoardDetailPane";

export type { TalentBoardDetailPaneProps };
export { TalentBoardDetailPane };
