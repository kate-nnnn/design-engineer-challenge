import type { Metadata } from "next";
import { formatPageTitle } from "@/utils/pageTitle";
import { HomeCalendar, HomeGreeting, HomeRoles, HomeStats, HomeTodos } from "./_home/home-sections";
import { loadHome } from "./_home/load-home";

export const metadata: Metadata = { title: formatPageTitle("Home") };

// Home answers "what needs me this week?": big numbers first, then to-dos and the week's
// intro calls side by side, then where each role stands. Everything links into Review.
export default async function OrgHomePage({ params }: { params: Promise<{ orgId: string }> }) {
	const { orgId } = await params;
	const data = await loadHome();

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pt-6 pb-10 md:px-8">
			<HomeGreeting firstName={data.firstName} />
			<HomeStats orgId={orgId} data={data} />
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
				<HomeTodos orgId={orgId} data={data} />
				<HomeCalendar orgId={orgId} data={data} />
			</div>
			<HomeRoles orgId={orgId} data={data} />
		</div>
	);
}
