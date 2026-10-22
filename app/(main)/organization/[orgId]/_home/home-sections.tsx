import { orgRoutes } from "@clera/route-factory";
import { cn } from "@v2/lib/utils";
import {
	ArrowRight,
	Briefcase,
	CalendarDays,
	CircleCheck,
	Hourglass,
	ListTodo,
	Pause,
	Sparkles,
	TriangleAlert,
	Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { HomeData, HomeRole } from "./load-home";

const DAY = 86_400_000;

function reviewHref(orgId: string, params: Record<string, string> = {}): string {
	const qs = new URLSearchParams(params).toString();
	return `${orgRoutes.review(orgId)}${qs ? `?${qs}` : ""}`;
}

function formatWait(days: number): string {
	if (days >= 365) return "over a year";
	if (days >= 60) return `${Math.floor(days / 30)} months`;
	return `${days} days`;
}

function callsThisWeek(data: HomeData): number {
	return data.calls.filter((call) => Date.parse(call.startsAt) - Date.now() < 7 * DAY).length;
}

export function HomeGreeting({ firstName }: { firstName: string | null }) {
	const now = new Date();
	const hour = now.getHours();
	const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
	return (
		<header className="flex flex-col gap-2">
			<p className="font-v2-body text-xs font-medium uppercase tracking-wider text-v2-text-tertiary">
				{now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
			</p>
			<h1 className="font-v2-heading text-3xl font-medium tracking-tight text-v2-text-primary md:text-4xl">
				Good {part}{firstName ? `, ${firstName}` : ""}
			</h1>
			<p className="font-v2-body text-base text-v2-text-secondary">Here's what needs you this week.</p>
		</header>
	);
}

interface StatCardProps {
	href: string;
	icon: ReactNode;
	label: string;
	value: number;
	caption: string;
	tone?: "default" | "brand" | "warning";
}

function StatCard({ href, icon, label, value, caption, tone = "default" }: StatCardProps) {
	return (
		<Link
			href={href}
			className={cn(
				"group flex flex-col gap-6 rounded-v2-lg border px-5 py-5 transition-colors",
				tone === "warning" && "border-transparent bg-v2-status-warning-bg",
				tone === "brand" && "border-transparent bg-v2-intro-bg",
				tone === "default" && "border-v2-border-pane hover:bg-v2-bg-warm",
			)}
		>
			<span
				className={cn(
					"flex items-center justify-between font-v2-body text-xs font-medium uppercase tracking-wider",
					tone === "warning" ? "text-v2-status-warning" : tone === "brand" ? "text-v2-intro-text" : "text-v2-text-tertiary",
				)}
			>
				{label}
				{icon}
			</span>
			<span className="flex flex-col gap-1">
				<span className="font-v2-heading text-5xl font-medium leading-none tracking-tight text-v2-text-primary tabular-nums">
					{value}
				</span>
				<span className="flex items-center gap-1 font-v2-body text-sm text-v2-text-secondary">
					{caption}
					<ArrowRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
				</span>
			</span>
		</Link>
	);
}

// Four numbers that answer "how much needs me?" at a glance. The amber one only shows up when
// someone has waited too long, and it's the first thing you see.
export function HomeStats({ orgId, data }: { orgId: string; data: HomeData }) {
	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
			<StatCard
				href={reviewHref(orgId, { role: "all" })}
				icon={<Users size={16} />}
				label="Waiting on you"
				value={data.waiting}
				caption="candidates to review"
			/>
			<StatCard
				href={reviewHref(orgId, { role: "all", streams: "interest" })}
				icon={<Sparkles size={16} />}
				label="Want to meet"
				value={data.askedToMeet}
				caption="asked for an intro"
				tone="brand"
			/>
			<StatCard
				href={reviewHref(orgId, { role: "all" })}
				icon={<Hourglass size={16} />}
				label="Waiting too long"
				value={data.longWaits.length}
				caption="over a week without a decision"
				tone={data.longWaits.length > 0 ? "warning" : "default"}
			/>
			<StatCard
				href={reviewHref(orgId, { role: "all", view: "invited" })}
				icon={<CalendarDays size={16} />}
				label="Intro calls"
				value={callsThisWeek(data)}
				caption="this week"
			/>
		</div>
	);
}

interface TodoProps {
	href: string;
	icon: ReactNode;
	title: string;
	detail: string;
	meta?: string;
	tone?: "default" | "warning" | "muted";
}

function Todo({ href, icon, title, detail, meta, tone = "default" }: TodoProps) {
	return (
		<li>
			<Link
				href={href}
				className="group flex items-center gap-4 rounded-v2-lg border border-v2-border-pane px-4 py-3.5 transition-colors hover:bg-v2-bg-warm"
			>
				<span
					className={cn(
						"flex size-9 shrink-0 items-center justify-center rounded-v2-md",
						tone === "warning" ? "bg-v2-status-warning-bg text-v2-status-warning" : "bg-v2-bg-active text-v2-text-primary",
					)}
				>
					{icon}
				</span>
				<span className="min-w-0 flex-1">
					<span
						className={cn(
							"block truncate font-v2-body text-sm font-medium",
							tone === "muted" ? "text-v2-text-secondary" : "text-v2-text-primary",
						)}
					>
						{title}
					</span>
					<span className="block truncate font-v2-body text-xs text-v2-text-tertiary">{detail}</span>
				</span>
				{meta && (
					<span
						className={cn(
							"shrink-0 font-v2-body text-xs tabular-nums",
							tone === "warning" ? "text-v2-status-warning" : "text-v2-text-tertiary",
						)}
					>
						{meta}
					</span>
				)}
			</Link>
		</li>
	);
}

// To-dos, most urgent first. Every row links straight to the place you'd act on it.
export function HomeTodos({ orgId, data }: { orgId: string; data: HomeData }) {
	const active = data.roles.filter((role) => !role.paused && role.waiting > 0).sort((a, b) => b.waiting - a.waiting);
	const paused = data.roles.filter((role) => role.paused && role.waiting > 0);
	const longest = data.longWaits[0];
	const count = (data.longWaits.length > 0 ? 1 : 0) + (data.askedToMeet > 0 ? 1 : 0) + active.length + paused.length;

	return (
		<section className="flex flex-col gap-4 rounded-v2-lg border border-v2-border-pane px-5 py-5">
			<h2 className="flex items-center gap-2.5 font-v2-body text-base font-medium text-v2-text-primary">
				<ListTodo size={18} aria-hidden />
				To-dos
				<span className="rounded-v2-sm bg-v2-bg-active px-1.5 font-v2-body text-xs text-v2-text-secondary tabular-nums">
					{count}
				</span>
			</h2>
			{count === 0 ? (
				<p className="flex items-center gap-2 font-v2-body text-sm text-v2-text-secondary">
					<CircleCheck size={16} aria-hidden className="text-v2-status-success" />
					Nothing waiting on you. Nice.
				</p>
			) : (
				<ul className="flex flex-col gap-2">
					{longest && (
						<Todo
							href={reviewHref(orgId, { role: longest.roleId ?? "all" })}
							icon={<Hourglass size={18} />}
							tone="warning"
							title={`Decide on ${data.longWaits.length} ${data.longWaits.length === 1 ? "person" : "people"} waiting over a week`}
							detail={`${longest.talentName} has waited longest`}
							meta={formatWait(longest.days)}
						/>
					)}
					{data.askedToMeet > 0 && (
						<Todo
							href={reviewHref(orgId, { role: "all", streams: "interest" })}
							icon={<Sparkles size={18} />}
							title={`Reply to ${data.askedToMeet} ${data.askedToMeet === 1 ? "person" : "people"} who want to meet you`}
							detail="They saw the role and asked for an intro"
						/>
					)}
					{active.map((role) => (
						<Todo
							key={role.id}
							href={reviewHref(orgId, { role: role.id })}
							icon={<Users size={18} />}
							title={`Review ${role.waiting} for ${role.name}`}
							detail={role.topScore != null ? `Best match ${role.topScore}%` : "No scores yet"}
							meta={`${role.waiting}`}
						/>
					))}
					{paused.map((role) => (
						<Todo
							key={role.id}
							href={orgRoutes.roles.list(orgId)}
							icon={<Pause size={18} />}
							tone="muted"
							title={`${role.name} is paused`}
							detail={`${role.waiting} waiting. Resume the role to review them`}
						/>
					))}
					{data.flagged > 0 && (
						<Todo
							href={reviewHref(orgId, { role: "all" })}
							icon={<TriangleAlert size={18} />}
							tone="muted"
							title={`${data.flagged} ${data.flagged === 1 ? "profile has" : "profiles have"} something to check`}
							detail="Visa, seniority or stale data flagged by Clera"
						/>
					)}
				</ul>
			)}
		</section>
	);
}

// A week of upcoming intro calls, from the sample /intro-calls mock endpoint.
export function HomeCalendar({ orgId, data }: { orgId: string; data: HomeData }) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const days = Array.from({ length: 7 }, (_, i) => new Date(today.getTime() + i * DAY));
	const callDays = new Set(data.calls.map((call) => new Date(call.startsAt).toDateString()));

	return (
		<section className="flex flex-col gap-5 rounded-v2-lg border border-v2-border-pane px-5 py-5">
			<div className="flex items-center justify-between gap-3">
				<h2 className="flex items-center gap-2.5 font-v2-body text-base font-medium text-v2-text-primary">
					<CalendarDays size={18} aria-hidden />
					{today.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
				</h2>
			</div>

			<div className="grid grid-cols-7 gap-1 text-center">
				{days.map((day, index) => {
					const hasCall = callDays.has(day.toDateString());
					const isToday = index === 0;
					return (
						<div
							key={day.toISOString()}
							className={cn(
								"flex flex-col items-center gap-1 rounded-v2-md py-2",
								isToday ? "bg-v2-brand-teal text-white" : "text-v2-text-primary",
							)}
						>
							<span className={cn("font-v2-body text-2xs", isToday ? "text-white/80" : "text-v2-text-tertiary")}>
								{day.toLocaleDateString(undefined, { weekday: "short" })}
							</span>
							<span className="font-v2-body text-base font-medium tabular-nums">{day.getDate()}</span>
							<span
								className={cn(
									"size-1 rounded-full",
									hasCall ? (isToday ? "bg-white" : "bg-v2-brand-teal") : "bg-transparent",
								)}
							/>
						</div>
					);
				})}
			</div>

			{data.calls.length === 0 ? (
				<p className="font-v2-body text-sm text-v2-text-secondary">No intro calls booked yet.</p>
			) : (
				<ul className="flex flex-col">
					{data.calls.map((call, index) => {
						const start = new Date(call.startsAt);
						const end = new Date(start.getTime() + call.durationMinutes * 60_000);
						const time = (date: Date) => date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
						return (
							<li key={call.id} className={cn("flex gap-4 py-3", index > 0 && "border-t border-v2-border-default")}>
								<span className="w-16 shrink-0 font-v2-body tabular-nums">
									<span className="block text-sm font-medium text-v2-text-primary">{time(start)}</span>
									<span className="block text-xs text-v2-text-tertiary">{time(end)}</span>
								</span>
								<span className="min-w-0 border-l-2 border-v2-brand-teal pl-3">
									<span className="block font-v2-body text-2xs text-v2-text-tertiary">
										{start.toLocaleDateString(undefined, { weekday: "long" })} · Intro call
									</span>
									<span className="block truncate font-v2-body text-sm font-medium text-v2-text-primary">
										{call.talentName}
									</span>
									<span className="block truncate font-v2-body text-xs text-v2-text-tertiary">{call.roleName}</span>
								</span>
							</li>
						);
					})}
				</ul>
			)}

			{data.longWaits.length > 0 && (
				<Link
					href={reviewHref(orgId, { role: "all" })}
					className="flex items-center gap-2.5 rounded-v2-md bg-v2-status-warning-bg px-3 py-2.5 font-v2-body text-xs text-v2-status-warning hover:brightness-[0.98]"
				>
					<Hourglass size={14} aria-hidden className="shrink-0" />
					<span className="min-w-0 flex-1">
						{data.longWaits.length} {data.longWaits.length === 1 ? "candidate is" : "candidates are"} still waiting
						for a decision, the longest for {formatWait(data.longWaits[0]?.days ?? 0)}
					</span>
					<ArrowRight size={14} className="shrink-0" />
				</Link>
			)}
		</section>
	);
}

function RoleRow({ orgId, role, maxWaiting }: { orgId: string; role: HomeRole; maxWaiting: number }) {
	const openDays = Math.max(0, Math.floor((Date.now() - Date.parse(role.openedAt)) / DAY));
	const share = maxWaiting > 0 ? (role.waiting / maxWaiting) * 100 : 0;
	return (
		<li>
			<Link
				href={role.paused ? orgRoutes.roles.list(orgId) : reviewHref(orgId, { role: role.id })}
				className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3 px-1 py-4 transition-colors hover:bg-v2-bg-warm md:grid-cols-[minmax(0,1.4fr)_5rem_5rem_5rem_minmax(0,1fr)]"
			>
				<span className="min-w-0">
					<span className="flex items-center gap-2">
						<span className="truncate font-v2-body text-sm font-medium text-v2-text-primary">{role.name}</span>
						<span
							className={cn(
								"shrink-0 rounded-full px-2 py-0.5 font-v2-body text-2xs font-medium",
								role.paused ? "bg-v2-bg-active text-v2-text-secondary" : "bg-v2-status-success-bg text-v2-status-success-text",
							)}
						>
							{role.paused ? "Paused" : "Active"}
						</span>
					</span>
					<span className="block truncate font-v2-body text-xs text-v2-text-tertiary">
						Hiring manager: {role.hiringManager}
					</span>
				</span>
				<RoleFigure value={role.waiting} label="waiting" strong={role.waiting > 0 && !role.paused} />
				<RoleFigure value={role.inPipeline} label="in pipeline" className="hidden md:flex" />
				<RoleFigure value={openDays} label="days open" className="hidden md:flex" />
				<span className="col-span-2 flex flex-col gap-1.5 md:col-span-1">
					<span className="h-2 overflow-hidden rounded-full bg-v2-bg-active">
						<span
							className={cn("block h-full rounded-full", role.paused ? "bg-v2-text-muted" : "bg-v2-brand-teal")}
							style={{ width: `${role.waiting > 0 ? Math.max(share, 4) : 0}%` }}
						/>
					</span>
					<span className="font-v2-body text-2xs text-v2-text-tertiary">
						{role.waiting === 0
							? "Nobody waiting. All caught up"
							: role.paused
								? "Paused. Not sending new people"
								: role.askedToMeet > 0
									? `${role.askedToMeet} want to meet you`
									: "Share of your review queue"}
					</span>
				</span>
			</Link>
		</li>
	);
}

function RoleFigure({
	value,
	label,
	strong = false,
	className,
}: {
	value: number;
	label: string;
	strong?: boolean;
	className?: string;
}) {
	return (
		<span className={cn("flex flex-col items-end md:items-start", className)}>
			<span
				className={cn(
					"font-v2-heading text-2xl font-medium leading-none tabular-nums",
					strong ? "text-v2-text-primary" : "text-v2-text-secondary",
				)}
			>
				{value}
			</span>
			<span className="mt-1 font-v2-body text-2xs text-v2-text-tertiary">{label}</span>
		</span>
	);
}

// Every role with where its queue stands, sorted by how much is waiting. The bar compares
// roles at a glance; days open works as the "timer" on each search.
export function HomeRoles({ orgId, data }: { orgId: string; data: HomeData }) {
	const maxWaiting = Math.max(...data.roles.map((role) => role.waiting), 0);
	const roles = [...data.roles].sort((a, b) => Number(a.paused) - Number(b.paused) || b.waiting - a.waiting);
	return (
		<section className="flex flex-col gap-2 rounded-v2-lg border border-v2-border-pane px-5 pt-5 pb-2">
			<div className="flex items-center justify-between">
				<h2 className="flex items-center gap-2.5 font-v2-body text-base font-medium text-v2-text-primary">
					<Briefcase size={18} aria-hidden />
					Open roles
					<span className="rounded-v2-sm bg-v2-bg-active px-1.5 font-v2-body text-xs text-v2-text-secondary tabular-nums">
						{data.roles.length}
					</span>
				</h2>
				<Link href={orgRoutes.roles.list(orgId)} className="font-v2-body text-xs font-medium text-v2-text-brand hover:underline">
					All roles
				</Link>
			</div>
			<ul className="flex flex-col divide-y divide-v2-border-default [&>li]:border-v2-border-default">
				{roles.map((role) => (
					<RoleRow key={role.id} orgId={orgId} role={role} maxWaiting={maxWaiting} />
				))}
			</ul>
		</section>
	);
}
