"use client";

import type { AccessRequest, CompanyProfile, NotificationPrefs, PendingInvite } from "@mock/settings";
import { Button } from "@v2/components/ui/button";
import { UserAvatar } from "@v2/components/ui/avatar";
import { cn } from "@v2/lib/utils";
import { Building2, Check, Eye, Mail, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

interface Member {
	id: string;
	name: string;
	email: string;
	role: "owner" | "viewer";
	isYou: boolean;
}

interface Me {
	firstName: string;
	lastName: string;
	email: string;
	notifications: NotificationPrefs;
}

interface SettingsViewProps {
	orgId: string;
	canEdit: boolean;
	company: CompanyProfile;
	members: Member[];
	invites: PendingInvite[];
	accessRequests: AccessRequest[];
	me: Me | null;
}

const FIELD =
	"w-full rounded-v2-md border border-v2-border-default bg-v2-bg-card px-3.5 py-2.5 font-v2-body text-sm text-v2-text-primary placeholder:text-v2-text-placeholder focus-visible:border-v2-brand-teal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-v2-brand-teal disabled:cursor-not-allowed disabled:bg-v2-bg-warm disabled:text-v2-text-secondary";

const SECTIONS = [
	{ id: "company", label: "Company" },
	{ id: "team", label: "Team" },
	{ id: "profile", label: "Your profile" },
	{ id: "billing", label: "Billing" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

// Highlights the tab for whichever section sits under the sticky tab bar while you scroll.
function useActiveSection(): [SectionId, (id: SectionId) => void] {
	const [active, setActive] = useState<SectionId>("company");
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((entry) => entry.isIntersecting);
				if (visible[0]) setActive(visible[0].target.id as SectionId);
			},
			{ rootMargin: "-120px 0px -60% 0px" },
		);
		for (const section of SECTIONS) {
			const node = document.getElementById(section.id);
			if (node) observer.observe(node);
		}
		return () => observer.disconnect();
	}, []);
	const jump = (id: SectionId) => {
		setActive(id);
		document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
	};
	return [active, jump];
}

const TAGLINE_MAX = 120;
const SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];

async function send(url: string, method: string, body: unknown): Promise<string | null> {
	const response = await fetch(url, {
		method,
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	});
	if (response.ok) return null;
	const data = (await response.json().catch(() => null)) as { error?: string } | null;
	return data?.error ?? "Something went wrong. Try again.";
}

// One scrolling settings page with the same big tabs as Review, sticky on top. Rows follow Frame
// (label and help text on the left, the field on the right); Team shows its numbers like Oyster.
export function SettingsView(props: SettingsViewProps) {
	const [active, jump] = useActiveSection();
	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col px-5 pt-6 pb-16 md:px-8">
			<header className="flex flex-col gap-0.5 pb-6">
				<h1 className="font-v2-heading text-lg font-medium tracking-tight text-v2-text-primary md:text-xl">Settings</h1>
				<p className="font-v2-body text-sm text-v2-text-secondary">Your company, your team, and how Clera works for you.</p>
			</header>
			<nav
				aria-label="Settings sections"
				className="sticky top-0 z-10 -mx-1 flex gap-5 overflow-x-auto border-b border-v2-border-default bg-v2-bg-page px-1 pt-2 pb-4"
			>
				{SECTIONS.map(({ id, label }) => (
					<button
						key={id}
						type="button"
						aria-current={active === id ? "true" : undefined}
						onClick={() => jump(id)}
						className={cn(
							"shrink-0 font-v2-body text-xl font-medium tracking-tight transition-colors",
							active === id ? "text-v2-text-primary" : "text-v2-text-muted hover:text-v2-text-secondary",
						)}
					>
						{label}
					</button>
				))}
			</nav>

			<div className="flex min-w-0 flex-col gap-14 pt-8">
				{!props.canEdit && (
					<p className="-mb-6 flex items-center gap-2.5 rounded-v2-md bg-v2-bg-active px-4 py-3 font-v2-body text-sm text-v2-text-secondary">
						<Eye size={16} aria-hidden className="shrink-0 text-v2-text-primary" />
						<span>
							<span className="font-medium text-v2-text-primary">View only.</span> Ask an owner to change company or team
							settings. You can still edit your own profile.
						</span>
					</p>
				)}
				<CompanySection orgId={props.orgId} canEdit={props.canEdit} company={props.company} />
				<TeamSection
					orgId={props.orgId}
					canEdit={props.canEdit}
					members={props.members}
					invites={props.invites}
					accessRequests={props.accessRequests}
				/>
				{props.me && <ProfileSection me={props.me} />}
				<BillingSection />
			</div>
		</div>
	);
}

function Section({
	id,
	title,
	description,
	actions,
	children,
}: {
	id: string;
	title: string;
	description: string;
	actions?: ReactNode;
	children: ReactNode;
}) {
	return (
		<section id={id} className="scroll-mt-24">
			<div className="flex flex-wrap items-end justify-between gap-4 border-b border-v2-border-default pb-5">
				<div>
					<h2 className="font-v2-heading text-base font-medium text-v2-text-primary">{title}</h2>
					<p className="mt-1 font-v2-body text-sm text-v2-text-secondary">{description}</p>
				</div>
				{actions}
			</div>
			<div className="flex flex-col divide-y divide-v2-border-default">{children}</div>
		</section>
	);
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
	return (
		<div className="grid grid-cols-1 gap-3 py-6 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:gap-10">
			<div>
				<p className="font-v2-body text-sm font-medium text-v2-text-primary">{label}</p>
				{hint && <p className="mt-0.5 font-v2-body text-xs text-v2-text-tertiary">{hint}</p>}
			</div>
			<div className="min-w-0">{children}</div>
		</div>
	);
}

function CompanySection({ orgId, canEdit, company }: { orgId: string; canEdit: boolean; company: CompanyProfile }) {
	const router = useRouter();
	const [draft, setDraft] = useState(company);
	const [saving, setSaving] = useState(false);
	const dirty = JSON.stringify(draft) !== JSON.stringify(company);
	const update = (patch: Partial<CompanyProfile>) => setDraft((prev) => ({ ...prev, ...patch }));

	const save = async () => {
		setSaving(true);
		const problem = await send(`/api/organizations/${orgId}/company`, "PATCH", draft);
		setSaving(false);
		if (problem) {
			toast.error("Couldn't save the company profile", { description: problem });
			return;
		}
		toast.success("Company profile saved");
		router.refresh();
	};

	return (
		<Section
			id="company"
			title="Company profile"
			description="What candidates see when we introduce you."
			actions={
				canEdit && (
					<div className="flex items-center gap-2">
						{dirty && (
							<Button variant="ghost" size="sm" className="px-3" onClick={() => setDraft(company)} disabled={saving}>
								Cancel
							</Button>
						)}
						<Button variant="primary" size="sm" className="px-4" onClick={save} disabled={!dirty || saving}>
							{saving ? "Saving…" : "Save changes"}
						</Button>
					</div>
				)
			}
		>
			<Row label="Logo" hint="Shown on intro emails and your public role pages.">
				<div className="flex items-center gap-4">
					<span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-v2-border-default bg-v2-bg-warm">
						{draft.logo ? (
							// biome-ignore lint/performance/noImgElement: local mock logo
							<img src={draft.logo} alt="" className="size-full object-cover" />
						) : (
							<Building2 size={22} className="text-v2-text-tertiary" />
						)}
					</span>
					<div className="flex flex-col gap-1.5">
						{canEdit && (
							<label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-v2-md border border-v2-border-default bg-v2-bg-card px-3 py-2 font-v2-body text-sm text-v2-text-body transition-colors hover:bg-v2-bg-active">
								<Upload size={14} aria-hidden />
								Upload new
								<input
									type="file"
									accept="image/svg+xml,image/png,image/jpeg"
									className="sr-only"
									onChange={(event) => {
										const file = event.target.files?.[0];
										event.target.value = "";
										if (!file) return;
										if (file.size > 512 * 1024) {
											toast.error("That image is too large", { description: "Use a file under 512 KB." });
											return;
										}
										const reader = new FileReader();
										reader.onload = () => update({ logo: String(reader.result) });
										reader.readAsDataURL(file);
									}}
								/>
							</label>
						)}
						<p className="font-v2-body text-xs text-v2-text-tertiary">SVG, PNG or JPG, at least 256×256px, under 512 KB.</p>
					</div>
				</div>
			</Row>
			<Row label="Company name" hint="Used everywhere Clera mentions you.">
				<input
					className={FIELD}
					value={draft.name}
					disabled={!canEdit}
					maxLength={60}
					onChange={(e) => update({ name: e.target.value })}
				/>
			</Row>
			<Row label="Tagline" hint="One line candidates read first.">
				<textarea
					className={cn(FIELD, "min-h-24 resize-none")}
					value={draft.tagline}
					disabled={!canEdit}
					maxLength={TAGLINE_MAX}
					onChange={(e) => update({ tagline: e.target.value })}
				/>
				<p className="mt-1.5 font-v2-body text-xs text-v2-text-tertiary tabular-nums">
					{TAGLINE_MAX - draft.tagline.length} characters left
				</p>
			</Row>
			<Row label="Website">
				<input
					className={FIELD}
					value={draft.website}
					disabled={!canEdit}
					inputMode="url"
					onChange={(e) => update({ website: e.target.value })}
				/>
			</Row>
			<Row label="Location and size" hint="Helps us pick people who can join you.">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
					<input
						className={FIELD}
						value={draft.location}
						disabled={!canEdit}
						onChange={(e) => update({ location: e.target.value })}
						aria-label="Location"
					/>
					<select
						className={FIELD}
						value={draft.size}
						disabled={!canEdit}
						onChange={(e) => update({ size: e.target.value })}
						aria-label="Company size"
					>
						{SIZES.map((size) => (
							<option key={size} value={size}>
								{size} people
							</option>
						))}
					</select>
				</div>
			</Row>
		</Section>
	);
}

function TeamSection({
	orgId,
	canEdit,
	members,
	invites,
	accessRequests,
}: {
	orgId: string;
	canEdit: boolean;
	members: Member[];
	invites: PendingInvite[];
	accessRequests: AccessRequest[];
}) {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<PendingInvite["role"]>("viewer");
	const [inviteError, setInviteError] = useState<string | null>(null);
	const [busy, setBusy] = useState<string | null>(null);
	const owners = members.filter((member) => member.role === "owner");

	const invite = async () => {
		setBusy("invite");
		const problem = await send(`/api/organizations/${orgId}/members/invites`, "POST", { email, role });
		setBusy(null);
		if (problem) {
			setInviteError(problem);
			return;
		}
		toast.success(`Invite sent to ${email.trim()}`);
		setEmail("");
		router.refresh();
	};

	const decide = async (request: AccessRequest, decision: "approve" | "decline") => {
		setBusy(request.userId);
		const problem = await send(`/api/organizations/${orgId}/access-requests/${request.userId}`, "POST", { decision });
		setBusy(null);
		if (problem) {
			toast.error("Couldn't update access", { description: problem });
			return;
		}
		toast.success(decision === "approve" ? `${request.name} can now decide on candidates` : "Request declined");
		router.refresh();
	};

	return (
		<Section id="team" title="Team" description="Owners decide on candidates. Viewers can follow along.">
			<div className="grid grid-cols-3 gap-6 py-8">
				<BigFigure label="Members" value={members.length} />
				<BigFigure label="Owners" value={owners.length} />
				<div>
					<p className="font-v2-body text-xs text-v2-text-tertiary">Can decide</p>
					<div className="mt-3 flex -space-x-2">
						{owners.map((owner) => (
							<UserAvatar key={owner.id} name={owner.name} className="size-9 ring-2 ring-v2-bg-page" />
						))}
					</div>
				</div>
			</div>

			{accessRequests.length > 0 && (
				<div className="flex flex-col gap-2 py-6">
					<p className="font-v2-body text-sm font-medium text-v2-text-primary">Access requests</p>
					{accessRequests.map((request) => (
						<div
							key={request.userId}
							className="flex flex-wrap items-center gap-3 rounded-v2-lg bg-v2-intro-bg px-4 py-3"
						>
							<UserAvatar name={request.name} className="size-9" />
							<span className="min-w-0 flex-1">
								<span className="block font-v2-body text-sm font-medium text-v2-text-primary">{request.name}</span>
								<span className="block font-v2-body text-xs text-v2-text-secondary">
									Asked to request intros and pass on candidates · {timeAgo(request.requestedAt)}
								</span>
							</span>
							{canEdit && (
								<span className="flex gap-2">
									<Button
										variant="ghost"
										size="sm"
										className="px-3"
										disabled={busy === request.userId}
										onClick={() => decide(request, "decline")}
									>
										Decline
									</Button>
									<Button
										variant="primary"
										size="sm"
										className="gap-1.5 px-3"
										disabled={busy === request.userId}
										onClick={() => decide(request, "approve")}
									>
										<Check size={14} />
										Approve
									</Button>
								</span>
							)}
						</div>
					))}
				</div>
			)}

			<ul className="flex flex-col py-2">
				{members.map((member) => (
					<li key={member.id} className="flex items-center gap-3 py-3">
						<UserAvatar name={member.name} className="size-9" />
						<span className="min-w-0 flex-1">
							<span className="block truncate font-v2-body text-sm font-medium text-v2-text-primary">
								{member.name}
								{member.isYou && <span className="font-normal text-v2-text-tertiary"> (you)</span>}
							</span>
							<span className="block truncate font-v2-body text-xs text-v2-text-tertiary">{member.email}</span>
						</span>
						<RoleTag role={member.role} />
					</li>
				))}
				{invites.map((pending) => (
					<li key={pending.email} className="flex items-center gap-3 py-3">
						<span className="flex size-9 items-center justify-center rounded-full border border-dashed border-v2-border-medium text-v2-text-tertiary">
							<Mail size={14} aria-hidden />
						</span>
						<span className="min-w-0 flex-1">
							<span className="block truncate font-v2-body text-sm text-v2-text-primary">{pending.email}</span>
							<span className="block font-v2-body text-xs text-v2-text-tertiary">Invite sent, waiting to join</span>
						</span>
						<RoleTag role={pending.role} />
					</li>
				))}
			</ul>

			{canEdit && (
				<Row label="Invite someone" hint="They'll get an email to join Tidewater Labs on Clera.">
					<form
						className="flex flex-col gap-2 sm:flex-row"
						onSubmit={(event) => {
							event.preventDefault();
							void invite();
						}}
					>
						<input
							className={FIELD}
							type="email"
							placeholder="name@company.com"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								setInviteError(null);
							}}
							aria-label="Email"
							aria-invalid={!!inviteError}
						/>
						<select
							className={cn(FIELD, "sm:w-36")}
							value={role}
							onChange={(e) => setRole(e.target.value as PendingInvite["role"])}
							aria-label="Role"
						>
							<option value="viewer">Viewer</option>
							<option value="owner">Owner</option>
						</select>
						<Button
							type="submit"
							variant="primary"
							size="sm"
							className="h-auto shrink-0 px-6 py-2.5 whitespace-nowrap"
							disabled={busy === "invite"}
						>
							{busy === "invite" ? "Sending…" : "Send invite"}
						</Button>
					</form>
					{inviteError && <p className="mt-1.5 font-v2-body text-xs text-v2-status-error">{inviteError}</p>}
				</Row>
			)}
		</Section>
	);
}

function timeAgo(iso: string): string {
	const minutes = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.round(minutes / 60);
	return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

function RoleTag({ role }: { role: "owner" | "viewer" }) {
	return (
		<span
			className={cn(
				"shrink-0 rounded-full px-2 py-0.5 font-v2-body text-2xs font-medium",
				role === "owner" ? "bg-v2-intro-bg text-v2-intro-text" : "bg-v2-bg-active text-v2-text-secondary",
			)}
		>
			{role === "owner" ? "Owner" : "Viewer"}
		</span>
	);
}

function BigFigure({ label, value }: { label: string; value: number }) {
	return (
		<div>
			<p className="font-v2-body text-xs text-v2-text-tertiary">{label}</p>
			<p className="mt-1 font-v2-heading text-5xl font-medium leading-none tracking-tight text-v2-text-primary tabular-nums">
				{value}
			</p>
		</div>
	);
}

const NOTIFICATION_OPTIONS: Array<{ key: keyof NotificationPrefs; label: string; hint: string }> = [
	{ key: "wantsToMeet", label: "Someone wants to meet you", hint: "An email as soon as a candidate asks for an intro." },
	{ key: "waitingTooLong", label: "Candidates waiting too long", hint: "A nudge when someone has waited over a week." },
	{ key: "weeklyDigest", label: "Weekly digest", hint: "Monday morning: who's waiting, per role." },
];

function ProfileSection({ me }: { me: Me }) {
	const router = useRouter();
	const [draft, setDraft] = useState(me);
	const [saving, setSaving] = useState(false);
	const dirty = JSON.stringify(draft) !== JSON.stringify(me);

	const save = async () => {
		setSaving(true);
		const problem = await send("/api/user/settings", "PATCH", {
			firstName: draft.firstName,
			lastName: draft.lastName,
			notifications: draft.notifications,
		});
		setSaving(false);
		if (problem) {
			toast.error("Couldn't save your profile", { description: problem });
			return;
		}
		toast.success("Profile saved");
		router.refresh();
	};

	return (
		<Section
			id="profile"
			title="Your profile"
			description="How you appear to your team, and what Clera emails you about."
			actions={
				<div className="flex items-center gap-2">
					{dirty && (
						<Button variant="ghost" size="sm" className="px-3" onClick={() => setDraft(me)} disabled={saving}>
							Cancel
						</Button>
					)}
					<Button variant="primary" size="sm" className="px-4" onClick={save} disabled={!dirty || saving}>
						{saving ? "Saving…" : "Save changes"}
					</Button>
				</div>
			}
		>
			<Row label="Name">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<input
						className={FIELD}
						value={draft.firstName}
						onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
						aria-label="First name"
					/>
					<input
						className={FIELD}
						value={draft.lastName}
						onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
						aria-label="Last name"
					/>
				</div>
			</Row>
			<Row label="Email" hint="You sign in with this, so it can't be changed here.">
				<input className={FIELD} value={draft.email} disabled aria-label="Email" />
			</Row>
			<Row label="Email notifications">
				<div className="flex flex-col gap-4">
					{NOTIFICATION_OPTIONS.map((option) => (
						<label key={option.key} className="flex cursor-pointer items-start gap-3">
							<input
								type="checkbox"
								className="mt-0.5 size-4 accent-v2-brand-teal"
								checked={draft.notifications[option.key]}
								onChange={(e) =>
									setDraft({ ...draft, notifications: { ...draft.notifications, [option.key]: e.target.checked } })
								}
							/>
							<span>
								<span className="block font-v2-body text-sm text-v2-text-primary">{option.label}</span>
								<span className="block font-v2-body text-xs text-v2-text-tertiary">{option.hint}</span>
							</span>
						</label>
					))}
				</div>
			</Row>
		</Section>
	);
}

function BillingSection() {
	const used = 6;
	const included = 20;
	return (
		<Section id="billing" title="Billing" description="Your plan and how much of it you've used.">
			<div className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-3">
				<div>
					<p className="font-v2-body text-xs text-v2-text-tertiary">Plan</p>
					<p className="mt-1 font-v2-heading text-2xl font-medium text-v2-text-primary">Growth</p>
					<p className="font-v2-body text-xs text-v2-text-tertiary">Billed monthly</p>
				</div>
				<div>
					<p className="font-v2-body text-xs text-v2-text-tertiary">Intros this month</p>
					<p className="mt-1 font-v2-heading text-2xl font-medium text-v2-text-primary tabular-nums">
						{used} <span className="text-base text-v2-text-tertiary">of {included}</span>
					</p>
					<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-v2-bg-active">
						<div className="h-full rounded-full bg-v2-brand-teal" style={{ width: `${(used / included) * 100}%` }} />
					</div>
				</div>
				<div>
					<p className="font-v2-body text-xs text-v2-text-tertiary">Next invoice</p>
					<p className="mt-1 font-v2-heading text-2xl font-medium text-v2-text-primary">1 Nov</p>
					<p className="font-v2-body text-xs text-v2-text-tertiary">Sent to robin@tidewater.example</p>
				</div>
			</div>
		</Section>
	);
}
