import assert from "node:assert/strict";
import { test } from "node:test";
import { waitingLabel } from "./waiting-since.ts";

const now = Date.parse("2026-10-22T12:00:00Z");
const ago = (ms: number) => new Date(now - ms).toISOString();

test("never stamped or unparseable shows nothing", () => {
	assert.equal(waitingLabel(null, now), null);
	assert.equal(waitingLabel("not a date", now), null);
});

test("a future time from clock skew reads as just now", () => {
	assert.equal(waitingLabel(ago(-3 * 3_600_000), now)?.text, "Just now");
});

test("short, medium and very old waits", () => {
	assert.equal(waitingLabel(ago(5 * 60_000), now)?.text, "5m");
	assert.equal(waitingLabel(ago(3 * 86_400_000), now)?.text, "3d");
	const old = waitingLabel(ago(400 * 86_400_000), now);
	assert.equal(old?.text, "1y+");
	assert.equal(old?.stale, true);
});
