import { TalentEntityChips } from "@v2/components/data-display";
import { UserAvatar } from "@v2/components/ui/avatar";
import { Button } from "@v2/components/ui/button";
import { CircleAlert, RotateCw } from "lucide-react";
import type { ReviewItem } from "./types";

interface ReviewProfileUnavailableProps {
	item: ReviewItem;
	notFound: boolean;
	onRetry: () => void;
}

// When the full profile can't load, the list already knows enough to decide on: name,
// headline, companies and why Clera picked them. Show that instead of an empty pane.
export function ReviewProfileUnavailable({ item, notFound, onRetry }: ReviewProfileUnavailableProps) {
	const firstName = item.talentName.split(" ")[0] || item.talentName;
	return (
		<div className="flex flex-col gap-4 rounded-v2-lg border border-v2-border-pane px-5 py-5">
			<div className="flex items-center gap-3.5">
				<UserAvatar name={item.talentName} size="lg" className="size-16" fallbackClassName="text-base" />
				<div className="min-w-0">
					<p className="truncate font-v2-body text-lg font-medium text-v2-text-primary">{item.talentName}</p>
					{(item.talentOneliner || item.headline) && (
						<p className="truncate font-v2-body text-sm text-v2-text-secondary">{item.talentOneliner ?? item.headline}</p>
					)}
				</div>
			</div>
			<TalentEntityChips companies={item.companies} school={item.school} maxVisible={4} />
			<div className="flex items-center justify-between gap-3 rounded-v2-md bg-v2-bg-active px-4 py-3">
				<p className="flex items-center gap-2 font-v2-body text-sm text-v2-text-secondary">
					<CircleAlert size={16} aria-hidden className="shrink-0 text-v2-text-primary" />
					{notFound
						? `We don't have ${firstName}'s full profile yet. You can still decide from this summary.`
						: `${firstName}'s full profile didn't load.`}
				</p>
				{!notFound && (
					<Button variant="ghost" size="sm" className="shrink-0 gap-1.5 px-3" onClick={onRetry}>
						<RotateCw size={14} />
						Retry
					</Button>
				)}
			</div>
		</div>
	);
}

ReviewProfileUnavailable.displayName = "ReviewProfileUnavailable";
