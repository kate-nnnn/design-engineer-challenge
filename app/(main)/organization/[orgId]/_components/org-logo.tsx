"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@v2/components/ui/avatar";
import { getInitials } from "@v2/utils/format";
import { Waves } from "lucide-react";

function OrgLogo({ name, logo, size }: { name: string; logo: string | null | undefined; size: 5 | 6 }) {
	const sizeClass = size === 6 ? "size-6" : "size-5";
	if (logo) {
		return (
			<Avatar className={sizeClass}>
				<AvatarImage src={logo} alt={name} />
				<AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
			</Avatar>
		);
	}
	return (
		<div
			aria-hidden
			className={`flex aspect-square ${sizeClass} items-center justify-center rounded-v2-sm bg-v2-brand-teal text-white`}
		>
			<Waves size={size === 6 ? 14 : 12} />
		</div>
	);
}
OrgLogo.displayName = "OrgLogo";

export { OrgLogo };
