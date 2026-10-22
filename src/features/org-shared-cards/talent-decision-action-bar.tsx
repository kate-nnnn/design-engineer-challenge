"use client";

import { Send, X } from "lucide-react";
import { Button } from "@v2/components/ui/button";
import { useMediaQuery } from "@v2/hooks/use-media-query";
import { cn } from "@v2/lib/utils";
import type { ReactNode } from "react";
import { TalentDecisionTooltip } from "./talent-decision-tooltip";

interface TalentDecisionActionBarProps {
	alreadyInterested: boolean;
	isPending?: boolean;
	onInterview: () => void;
	onPass: () => void;
	showShortcuts?: boolean;
	leadingAction?: ReactNode;
	className?: string;
}

const KBD = "ml-1 rounded-v2-sm bg-current/10 px-1.5 py-0.5 text-2xs leading-4";

const PASS_CLASSES =
	"flex-1 gap-1.5 border-v2-pass-border bg-v2-pass-bg font-medium text-v2-pass-text hover:bg-v2-pass-bg-hover";
const INTRO_CLASSES =
	"flex-1 gap-1.5 border-v2-intro-border bg-v2-intro-bg font-medium text-v2-intro-text hover:bg-v2-intro-bg-hover";

export function TalentDecisionActionBar({
	alreadyInterested,
	isPending = false,
	onInterview,
	onPass,
	showShortcuts = true,
	leadingAction,
	className,
}: TalentDecisionActionBarProps) {
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const showHints = showShortcuts && isDesktop;
	return (
		<div className={cn("flex items-center gap-2 border-t border-v2-border-divider px-4 py-3", className)}>
			{leadingAction}
			<TalentDecisionTooltip label="Not a fit for this role. Moves to Passed, undo anytime.">
				<Button variant="ghost" className={PASS_CLASSES} disabled={isPending} onClick={onPass}>
					<X size={16} />
					Pass
					{showHints && <span className={KBD}>⌫</span>}
				</Button>
			</TalentDecisionTooltip>
			<TalentDecisionTooltip
				label={
					alreadyInterested
						? "They already asked to meet you. We set the intro up right away."
						: "You want to meet them. We reach out and set up the intro."
				}
			>
				<Button variant="ghost" className={INTRO_CLASSES} disabled={isPending} onClick={onInterview}>
					<Send size={16} />
					{alreadyInterested ? "Make an intro" : "Request intro"}
					{showHints && <span className={KBD}>↵</span>}
				</Button>
			</TalentDecisionTooltip>
		</div>
	);
}

TalentDecisionActionBar.displayName = "TalentDecisionActionBar";
