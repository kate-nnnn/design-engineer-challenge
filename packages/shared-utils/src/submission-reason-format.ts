import { stripSlackMrkdwn } from "./slack.ts";

export function isSlackMrkdwnHeadline(headline: string): boolean {
	if (/<[^>]+\|[^>]+>/.test(headline)) return true;
	if (headline.startsWith("*") && headline.endsWith("*") && headline.includes(" · ")) return true;
	return false;
}

export function formatWithBulletPoints(text: string): string {
	if (!text) return "";
	return text
		.split("\n")
		.map((line) => {
			const trimmedLine = line.trim();
			if (!trimmedLine) return "";
			if (/^[•\-*]\s/.test(trimmedLine)) return trimmedLine;
			return `• ${trimmedLine}`;
		})
		.filter((line) => line)
		.join("\n");
}

const FIT_REASON_HOOK_LABELS = [
	"Why now",
	"Why this fit",
	"Why this seat",
	"Why him",
	"Why her",
	"Why them",
	"The pitch",
	"Standout",
] as const;

const LEADING_ENUMERATOR_PATTERN = /^\(?\d+[.)]\s*/;
const KNOWN_HOOK_LABEL_PATTERN = new RegExp(`^(?:${FIT_REASON_HOOK_LABELS.join("|")}):\\s+`);
const GENERIC_HOOK_LABEL_PATTERN = /^[A-Z][A-Za-z' ]{0,24}:\s+/;
const SENTENCE_PATTERN = /[^.!?]+[.!?]+["')\]]*\s*/g;
const FIT_REASON_HOOK_MAX_CHARS = 220;
const FIT_REASON_HOOK_MAX_SENTENCES = 2;

function firstBlockOf(text: string): string {
	const blankLineIndex = text.search(/\n[ \t]*\n/);
	if (blankLineIndex >= 0) return text.slice(0, blankLineIndex);
	const newlineIndex = text.indexOf("\n");
	if (newlineIndex >= 0) return text.slice(0, newlineIndex);
	return text;
}

function stripHookLabel(text: string): string {
	const knownStripped = text.replace(KNOWN_HOOK_LABEL_PATTERN, "");
	if (knownStripped !== text && knownStripped.trim().length > 0) return knownStripped;
	const genericStripped = text.replace(GENERIC_HOOK_LABEL_PATTERN, "");
	if (genericStripped !== text && genericStripped.trim().length > 0) return genericStripped;
	return text;
}

function limitSentences(text: string, maxSentences: number): string {
	const sentences = text.match(SENTENCE_PATTERN);
	if (!sentences || sentences.length <= maxSentences) return text.trim();
	return sentences.slice(0, maxSentences).join("").trim();
}

function truncateAtWordBoundary(text: string, maxChars: number): string {
	if (text.length <= maxChars) return text;
	const slice = text.slice(0, maxChars);
	const lastSpace = slice.lastIndexOf(" ");
	const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
	return `${cut.trimEnd()}…`;
}

export interface FitReasonPoint {
	text: string;
	caution: boolean;
}

export interface ParsedFitReason {
	hook: string;
	points: FitReasonPoint[];
}

// Bullets that would change a hiring manager's mind. Matched at the start of the point.
const CAUTION_PATTERN =
	/^(?:needs?\b|not\b|no\b|may\b|data may\b|short\b|two concurrent\b|more [\w-]+ than\b|her profile failed|his profile failed|profile is sparse|in final rounds)/i;
const LIST_ITEM_PATTERN = /^\s*(?:[•\-*]|\(?\d+[.)])\s+/;

function cleanLine(line: string): string {
	return stripSlackMrkdwn(line).replace(LIST_ITEM_PATTERN, "").replace(/^- /, "").trim();
}

// Keeps the whole reason, unlike extractFitReasonHook: the lead sentence becomes the hook,
// every bullet survives, and the ones that read as a risk are marked so they can stand out.
export function parseFitReason(input: string | null | undefined): ParsedFitReason | null {
	if (!input) return null;
	const normalized = input.replace(/\\n/g, "\n").trim();
	if (!normalized) return null;

	const lines = normalized
		.split("\n")
		.map(cleanLine)
		.filter((line) => line.length > 0);
	if (lines.length === 0) return null;

	const [first, ...rest] = lines;
	const hook = stripHookLabel(first).trim();
	const points = rest.map((text) => ({ text, caution: CAUTION_PATTERN.test(text) }));

	return { hook, points };
}

export function extractFitReasonHook(input: string | null | undefined): string | null {
	if (!input) return null;
	const normalized = input.replace(/\\n/g, "\n");
	if (!normalized.trim()) return null;
	if (!normalized.includes("\n")) return null;

	const stripped = stripSlackMrkdwn(firstBlockOf(normalized)).trim();
	if (!stripped) return null;

	const withoutEnumerator = stripped.replace(LEADING_ENUMERATOR_PATTERN, "").trim();
	const withoutLabel = stripHookLabel(withoutEnumerator || stripped).trim();
	if (!withoutLabel) return null;

	const limited = limitSentences(withoutLabel, FIT_REASON_HOOK_MAX_SENTENCES);
	const capped = truncateAtWordBoundary(limited, FIT_REASON_HOOK_MAX_CHARS);

	return capped.length > 0 ? capped : null;
}
