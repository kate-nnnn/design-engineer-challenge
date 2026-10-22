import { ExperienceDetailsBody } from "./experience-details-body";

interface ExperienceDetailsDisclosureProps {
	description: string | null;
	resumeBullets: string[];
}

// Details are short and they are what a hiring manager is scanning for, so they show
// in full instead of behind a "Details" toggle.
function ExperienceDetailsDisclosure({ description, resumeBullets }: ExperienceDetailsDisclosureProps) {
	if (!description && resumeBullets.length === 0) return null;
	return <ExperienceDetailsBody description={description} resumeBullets={resumeBullets} />;
}
ExperienceDetailsDisclosure.displayName = "ExperienceDetailsDisclosure";

export { ExperienceDetailsDisclosure };
