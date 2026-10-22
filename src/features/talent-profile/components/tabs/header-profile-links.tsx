"use client";

import { Github, Globe, Linkedin, Twitter } from "lucide-react";
import { Button } from "@v2/components/ui/button";
import type { ReactNode } from "react";
import { ensureProtocol, extractHost, hostRepeatsLabel } from "../../utils/external-links";

interface HeaderProfileLinksProps {
	linkedinUrl?: string | null;
	githubUrl: string | null;
	xUrl: string | null;
	portfolioUrl: string | null;
}

function HeaderProfileLinks({ linkedinUrl = null, githubUrl, xUrl, portfolioUrl }: HeaderProfileLinksProps) {
	if (!linkedinUrl && !githubUrl && !xUrl && !portfolioUrl) return null;

	return (
		<span className="flex flex-wrap items-center justify-end gap-1.5">
			{linkedinUrl && <HeaderLinkButton href={linkedinUrl} label="LinkedIn" icon={<Linkedin size={14} />} hideHost />}
			{portfolioUrl && <HeaderLinkButton href={portfolioUrl} label="Portfolio" icon={<Globe size={14} />} hideHost />}
			{githubUrl && <HeaderLinkButton href={githubUrl} label="GitHub" icon={<Github size={14} />} hideHost />}
			{xUrl && <HeaderLinkButton href={xUrl} label="X" icon={<Twitter size={14} />} hideHost />}
		</span>
	);
}
HeaderProfileLinks.displayName = "HeaderProfileLinks";

interface HeaderLinkButtonProps {
	href: string;
	label: string;
	icon: ReactNode;
	hideHost?: boolean;
}

function HeaderLinkButton({ href, label, icon, hideHost = false }: HeaderLinkButtonProps) {
	const host = extractHost(href);
	const showHost = !hideHost && host.length > 0 && !hostRepeatsLabel(host, label);
	return (
		<Button asChild variant="ghost" size="sm" className="gap-1.5 px-3" title={`Open ${label}`}>
			<a href={ensureProtocol(href)} target="_blank" rel="noopener noreferrer">
				{icon}
				{label}
				{showHost && <span className="max-w-45 truncate text-v2-text-tertiary">{host}</span>}
			</a>
		</Button>
	);
}
HeaderLinkButton.displayName = "HeaderLinkButton";

export { HeaderProfileLinks };
