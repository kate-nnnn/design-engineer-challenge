import assert from "node:assert/strict";
import { test } from "node:test";
import { parseFitReason } from "./submission-reason-format.ts";

test("keeps a single sentence the hook extractor drops", () => {
	const parsed = parseFitReason("Strong fintech background and has worked on KYC pipelines.");
	assert.deepEqual(parsed, { hook: "Strong fintech background and has worked on KYC pipelines.", points: [] });
});

test("returns null when there is nothing to show", () => {
	assert.equal(parseFitReason(null), null);
	assert.equal(parseFitReason("  \n "), null);
});

test("keeps every bullet and flags the risky ones", () => {
	const parsed = parseFitReason("Why this fit: Shipped retrieval.\n\n• PhD, 4 papers\n• Needs visa sponsorship for the UK");
	assert.equal(parsed?.hook, "Shipped retrieval.");
	assert.deepEqual(parsed?.points, [
		{ text: "PhD, 4 papers", caution: false },
		{ text: "Needs visa sponsorship for the UK", caution: true },
	]);
});

test("handles literal \\n, Slack markup and numbered lists", () => {
	assert.equal(parseFitReason("*Why this fit:* Wrote <https://x.example|the engine>.\\n\\n• _Rust_")?.hook, "Wrote the engine.");
	const numbered = parseFitReason("1) Asked for an intro herself.\n2) Managed 4 designers");
	assert.equal(numbered?.hook, "Asked for an intro herself.");
	assert.deepEqual(numbered?.points, [{ text: "Managed 4 designers", caution: false }]);
});
