import assert from "node:assert/strict";
import { test } from "node:test";
import { usableHref } from "./usable-href.ts";

test("drops links that go nowhere", () => {
	for (const bad of [null, "", "not provided", "htp://noah-becker", "linkedin.com/in/", "https://github.com/"]) {
		assert.equal(usableHref(bad), null, String(bad));
	}
});

test("keeps real links and adds the protocol", () => {
	assert.equal(usableHref("linkedin.com/in/noah"), "https://linkedin.com/in/noah");
	assert.equal(usableHref("https://github.com/example-0022"), "https://github.com/example-0022");
	assert.equal(usableHref("example.com/lukas-portfolio"), "https://example.com/lukas-portfolio");
});
