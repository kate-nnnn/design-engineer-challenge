import { notificationsFor, settings } from "@mock/settings";
import { currentUser } from "@mock/store";
import { USERS } from "@mock/users";
import type { Metadata } from "next";
import { formatPageTitle } from "@/utils/pageTitle";
import { SettingsView } from "./settings-view";

export const metadata: Metadata = { title: formatPageTitle("Settings") };
export const dynamic = "force-dynamic";

export default async function CompanySettingsPage({ params }: { params: Promise<{ orgId: string }> }) {
	const { orgId } = await params;
	const me = await currentUser();

	return (
		<SettingsView
			orgId={orgId}
			canEdit={me?.orgRole === "owner"}
			company={settings.company}
			members={USERS.map((user) => ({
				id: user.id,
				name: `${user.firstName} ${user.lastName}`,
				email: user.email,
				role: user.orgRole === "owner" ? "owner" : "viewer",
				isYou: user.id === me?.id,
			}))}
			invites={settings.invites}
			accessRequests={[...settings.accessRequests.values()]}
			me={
				me
					? { firstName: me.firstName, lastName: me.lastName, email: me.email, notifications: notificationsFor(me.id) }
					: null
			}
		/>
	);
}
