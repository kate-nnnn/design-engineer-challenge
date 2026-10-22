const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export interface WaitingLabel {
	text: string;
	title: string;
	/** Waiting long enough that the profile may be out of date. */
	stale: boolean;
}

// How long someone has been waiting on a decision. Clock skew can put receivedAt in the
// future, and some items were never stamped, so both are handled instead of trusted.
export function waitingLabel(receivedAt: string | null, now: number = Date.now()): WaitingLabel | null {
	if (!receivedAt) return null;
	const received = Date.parse(receivedAt);
	if (Number.isNaN(received)) return null;
	const title = `In your queue since ${new Date(received).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
	const age = now - received;
	if (age < MINUTE) return { text: "Just now", title, stale: false };
	if (age < HOUR) return { text: `${Math.floor(age / MINUTE)}m`, title, stale: false };
	if (age < DAY) return { text: `${Math.floor(age / HOUR)}h`, title, stale: false };
	if (age < 180 * DAY) return { text: `${Math.floor(age / DAY)}d`, title, stale: false };
	return { text: age < 365 * DAY ? "6mo+" : "1y+", title, stale: true };
}
