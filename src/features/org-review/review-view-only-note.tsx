"use client";

import { Button } from "@v2/components/ui/button";
import { Check, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReviewViewOnlyNoteProps {
	orgId: string;
}

type RequestState = "idle" | "sending" | "sent";

// Shown where the decision buttons would be, so a viewer knows why they can't act
// instead of finding out from a failed request, and can ask for access in one click.
export function ReviewViewOnlyNote({ orgId }: ReviewViewOnlyNoteProps) {
	const [state, setState] = useState<RequestState>("idle");

	const requestAccess = async () => {
		setState("sending");
		try {
			const response = await fetch(`/api/organizations/${orgId}/access-requests`, { method: "POST" });
			if (!response.ok) throw new Error(String(response.status));
			setState("sent");
			toast.success("Access requested", { description: "Your team's owners will see your request." });
		} catch {
			setState("idle");
			toast.error("Couldn't send your request", { description: "Try again in a moment." });
		}
	};

	return (
		<div className="my-2 flex flex-wrap items-center justify-between gap-3 rounded-v2-md bg-v2-bg-active px-4 py-3 font-v2-body text-sm text-v2-text-secondary">
			<span className="flex min-w-0 items-center gap-2.5">
				<Eye size={16} aria-hidden className="shrink-0 text-v2-text-primary" />
				<span>
					<span className="font-medium text-v2-text-primary">View only.</span> Ask an owner on your team to request
					intros or pass.
				</span>
			</span>
			<Button
				variant="ghost"
				size="sm"
				className="shrink-0 gap-1.5 px-3"
				disabled={state !== "idle"}
				onClick={requestAccess}
			>
				{state === "sent" && <Check size={14} />}
				{state === "sent" ? "Requested" : state === "sending" ? "Requesting…" : "Request access"}
			</Button>
		</div>
	);
}

ReviewViewOnlyNote.displayName = "ReviewViewOnlyNote";
