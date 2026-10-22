// Profile links arrive as typed by people ("not provided", "htp://name", "linkedin.com/in/").
// Returns a safe href only when the link points somewhere real, otherwise null.
export function usableHref(url: string | null | undefined): string | null {
	const trimmed = url?.trim();
	if (!trimmed || /\s/.test(trimmed)) return null;
	if (/^[a-z]+:\/\//i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) return null;
	let parsed: URL;
	try {
		parsed = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
	} catch {
		return null;
	}
	if (!parsed.hostname.includes(".")) return null;
	const path = parsed.pathname.replace(/\/+$/, "");
	if (/linkedin\.com$/i.test(parsed.hostname) && !/^\/(in|pub)\/[^/]+/i.test(path)) return null;
	if (/github\.com$/i.test(parsed.hostname) && path.length <= 1) return null;
	return parsed.toString();
}
