"use client";

import { Sparkles, Star, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@v2/components/ui/tooltip";
import { cn } from "@v2/lib/utils";
import type { ReviewStream } from "./types";

interface StreamBadgeProps {
	stream: ReviewStream;
	className?: string;
}

export const STREAM_CONFIG = {
	curated: {
		label: "Top match",
		tooltip: "Clera surfaced this candidate as a strong fit for the role, but they haven't been asked yet.",
		icon: Zap,
		iconClassName: "text-v2-brand-green",
		className: "bg-v2-brand-green/10 text-v2-brand-green",
	},
	drop: {
		label: "Weekly pick",
		tooltip: "Part of a handpicked drop of outstanding candidates we sent you this week.",
		icon: Sparkles,
		iconClassName: "text-v2-status-info",
		className: "bg-v2-status-info/10 text-v2-status-info",
	},
	interest: {
		label: "Wants to meet",
		tooltip: "This candidate saw the role and told us they want to work with you.",
		icon: Star,
		iconClassName: "text-v2-status-warning",
		className: "bg-v2-status-warning/15 text-v2-status-warning",
	},
} as const;

export function StreamBadge({ stream, className }: StreamBadgeProps) {
	const { label, tooltip, icon: Icon, className: toneClassName } = STREAM_CONFIG[stream];
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<span
					className={cn(
						"inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-v2-body text-2xs font-medium max-sm:py-1",
						toneClassName,
						className,
					)}
				>
					<Icon size={10} aria-hidden="true" />
					<span>{label}</span>
				</span>
			</TooltipTrigger>
			<TooltipContent className="max-w-55">{tooltip}</TooltipContent>
		</Tooltip>
	);
}

StreamBadge.displayName = "StreamBadge";
