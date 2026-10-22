import { parseFitReason } from "@clera/shared-utils";
import { Sparkles, TriangleAlert } from "lucide-react";

interface ReviewFitReasonProps {
	reason: string | null;
}

// The reason Clera picked someone is the first thing a hiring manager reads, so it sits at body size
// right under the name. Risks from the bullets are kept and called out instead of being dropped.
export function ReviewFitReason({ reason }: ReviewFitReasonProps) {
	const parsed = parseFitReason(reason);

	return (
		<div className="rounded-v2-lg bg-v2-bg-card px-5 py-4 shadow-v2-ai-glow">
			<p className="flex items-center gap-1.5 font-v2-body text-xs font-medium text-v2-text-brand">
				<Sparkles size={14} aria-hidden className="text-v2-ai-neon" />
				Why it's a match
			</p>
			{parsed ? (
				<>
					<p className="mt-2 font-v2-body text-base leading-relaxed text-v2-text-primary">{parsed.hook}</p>
					{parsed.points.length > 0 && (
						<ul className="mt-3 flex flex-col gap-1.5">
							{parsed.points.map((point) =>
								point.caution ? (
									<li
										key={point.text}
										className="flex items-start gap-1.5 self-start rounded-v2-md bg-v2-status-warning-bg px-2.5 py-1.5 font-v2-body text-sm text-v2-status-warning"
									>
										<TriangleAlert size={14} className="mt-px shrink-0" aria-label="Worth checking" />
										{point.text}
									</li>
								) : (
									<li
										key={point.text}
										className="flex items-start gap-2 font-v2-body text-sm leading-snug text-v2-text-secondary"
									>
										<span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-v2-text-muted" />
										{point.text}
									</li>
								),
							)}
						</ul>
					)}
				</>
			) : (
				<p className="mt-2 font-v2-body text-sm text-v2-text-muted">
					No note from Clera on this one. Their experience is below.
				</p>
			)}
		</div>
	);
}

ReviewFitReason.displayName = "ReviewFitReason";
