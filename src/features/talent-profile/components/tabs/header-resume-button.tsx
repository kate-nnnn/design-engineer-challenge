"use client";

import { FileText } from "lucide-react";
import { Button } from "@v2/components/ui/button";
import { useState } from "react";
import { usePrimaryResume } from "../../hooks/use-primary-resume";
import { ResumePreviewDialog } from "./resume-preview-dialog";

interface HeaderResumeButtonProps {
	talentId: string;
	scope?: { orgId?: string } | null;
}

function HeaderResumeButton({ talentId, scope }: HeaderResumeButtonProps) {
	const { data: resume } = usePrimaryResume(talentId, scope);
	const [previewOpen, setPreviewOpen] = useState(false);

	if (!resume?.found || !resume.signedUrl) return null;

	return (
		<>
			<Button
				variant="ghost"
				size="sm"
				className="gap-1.5 px-3"
				onClick={() => setPreviewOpen(true)}
				title="View resume"
			>
				<FileText size={14} />
				Resume
			</Button>
			<ResumePreviewDialog
				open={previewOpen}
				onOpenChange={setPreviewOpen}
				talentId={talentId}
				url={resume.signedUrl}
				fileName={resume.displayName ?? "Resume.pdf"}
				uploadedAt={scope?.orgId ? undefined : resume.uploadedAt}
			/>
		</>
	);
}
HeaderResumeButton.displayName = "HeaderResumeButton";

export { HeaderResumeButton };
