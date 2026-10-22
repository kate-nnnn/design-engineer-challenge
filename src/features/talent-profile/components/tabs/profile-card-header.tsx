import type { ComponentType } from "react";
import { SectionHeading } from "@v2/components/data-display";
import { cn } from "@v2/lib/utils";

interface ProfileCardHeaderProps {
	icon: ComponentType<{ size?: number; className?: string }>;
	title: string;
	children?: React.ReactNode;
	className?: string;
}

function ProfileCardHeader({ icon: Icon, title, children, className }: ProfileCardHeaderProps) {
	return (
		<div className={cn("flex items-center justify-between px-0 py-3", className)}>
			<div className="flex items-center gap-2.5">
				<Icon size={18} className="text-v2-text-primary" />
				<SectionHeading as="h3" className="text-base sm:text-base">
					{title}
				</SectionHeading>
			</div>
			{children}
		</div>
	);
}
ProfileCardHeader.displayName = "ProfileCardHeader";

export { ProfileCardHeader };
