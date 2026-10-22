"use client";

import { Send, X } from "lucide-react";
import { Button } from "@v2/components/ui/button";
import { cn } from "@v2/lib/utils";

interface ReviewCardActionsProps {
	talentName: string;
	isPending: boolean;
	isPinned: boolean;
	onIntro: () => void;
	onPass: () => void;
}

const ACTION_CLASSES = "flex size-8 items-center justify-center rounded-v2-md border transition-colors";

export function ReviewCardActions({ talentName, isPending, isPinned, onIntro, onPass }: ReviewCardActionsProps) {
	return (
		<div
			className={cn(
				"absolute right-4 bottom-4 flex items-center gap-1.5 transition-opacity",
				isPinned
					? "opacity-100"
					: "pointer-events-none opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100",
			)}
		>
			<Button
				type="button"
				variant="unstyled"
				size="unstyled"
				aria-label={`Pass on ${talentName}`}
				disabled={isPending}
				onClick={onPass}
				className={cn(ACTION_CLASSES, "border-v2-pass-border bg-v2-pass-bg text-v2-pass-text hover:bg-v2-pass-bg-hover")}
			>
				<X size={14} />
			</Button>
			<Button
				type="button"
				variant="unstyled"
				size="unstyled"
				aria-label={`Request an intro to ${talentName}`}
				disabled={isPending}
				onClick={onIntro}
				className={cn(ACTION_CLASSES, "border-v2-intro-border bg-v2-intro-bg text-v2-intro-text hover:bg-v2-intro-bg-hover")}
			>
				<Send size={14} />
			</Button>
		</div>
	);
}

ReviewCardActions.displayName = "ReviewCardActions";
