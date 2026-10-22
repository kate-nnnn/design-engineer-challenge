# Notes

## Audit of current version

Hiring managers go through 20–60 people between meetings, deciding in seconds. The screen should answer three questions at once: why this person, are they a fit, and how far through am I?

### User Experience

1. Works well: the loop is fast. A decision removes the person and selects the next one, and `↵` / `⌫` are shown on the buttons.
2. Works well: a pass and an intro can both be undone.
3. Unreviewed / Passed should be more explicit. I'd add **Invited** as a separate tab too.
4. A prompt box where AI helps select and filter applicants ("only people who've shipped payments infra", "who can start this month").
5. Search for candidates by name, company or skill. It could live in the same prompt box.
6. A short AI-generated summary should sit on top of the resume.
7. A failed decision (1 in 10 on the flaky mock API) puts the person back in the list after you've already moved on, with only "Something went wrong". It doesn't say who or whether it was a pass or an intro, and there's no Retry, so they're easy to miss or decide twice.
8. A profile that fails to load (Elif, ML role) is a dead end: a blank pane, "please try again" with no retry button, and the list-row data thrown away. It's a 404, so retrying would never work anyway.
9. No sense of progress: "13+ to review" is vague, with no done / left / time.
10. To check: viewer permissions (403), the paused and empty roles, the hiring-manager calendar gate, mobile.

### Layout and Composition

**List of people**

1. No order: "Expressed interest" (Priya is 6th on ML) sits among Clera's picks. The list could open with a **shortlist**, the top 5–10 matches for the role, for faster decisions.
2. Badges should say *why* it's a match, not the generic "We think it's a match". All source badges also have the same weight.
3. Noisy rows: duplicate company chips, a long school name takes over the row, school and company chips look alike, and there's no "waiting since".

**Resume**

4. The list could be narrower, and the resume should be in the centre, with more room.
5. Pass / Request intro could sit higher to catch attention. The bottom-right corner is where attention is lowest.
6. "Why it's a match" sits below the identity block in small grey text, but it's the most useful sentence.
7. Preferences could take less space. They repeat location, work setup and salary from the top: the important ones belong at the top, the rest after the other sections.

### Visual Design

1. Inconsistent typography, e.g. "Preferences" is much larger than "Experience" and "Education".
2. Little visual hierarchy, and no accent on the important things.
3. WCAG standards (colour contrast, text sizes) are probably not met.
4. Dark mode isn't dark enough and lacks contrast.
5. Muddy shadows and unnecessary elements make the interface look outdated.
6. "Why it's a match" loses information. A one-sentence reason (Daniel) or a missing one (Ines) shows nothing at all. Only the first paragraph is kept, so warnings in the bullets disappear ("Needs visa sponsorship", "May be too senior", "Data may be stale"). Long reasons are cut off mid-thought.
7. The profile menu says "Member", while the org header says "Owner".

## Plan for improvements

Started 10:41, 4 hours.

1. **Review (until 2:30):** improve it according to the notes above, starting with the signal first, the shortlist and order, a safe loop, and the layout. Then the states and the messy data.
2. **Home (2:30–3:15):** open roles, tasks to be done, visual statistics, and dates for open roles (like a timer), linking into Review.
3. **Settings (3:15–3:45):** company profile, team management, billing, and profile settings such as email.
4. **Final notes (3:45–4:00).**

## What I shipped

Everything is on the `challenge` branch and runs with `pnpm dev`.

### Review

1. **A new, minimal UI kit.** One flat background (white / `#151515`), Clera's teal as the only brand colour, a muted green for AI, Geist as the single font, Lucide icons, one radius scale, and no decorative shadows or warm outlines. Better contrast, readability and hierarchy, in light and dark mode.
2. **Signal first in the resume pane.** Name and key facts (years of experience, how they want to work, salary, visa), then **why it's a match** in its own box, with the warnings that used to be dropped ("Needs visa sponsorship", "May be too senior") called out. Pass and Request intro sit right under it, the same size, and stay pinned while you scroll.
3. **A queue you can trust.** Sorted by match score, with a **Best candidates** group (top 3, with their score) and **Other good candidates**. Real counts instead of the loaded page size, a progress line, and how long each person has been waiting.
4. **To review / Passed / Invited** tabs with counts. "Bring back" sits inside the Passed cards.
5. **A search box with quick filters** (Wants to meet, Top match, Weekly pick, Has something to check), placed where an AI assistant would live.
6. **A safe decision loop.** A failed save retries once quietly, then brings back only that person, in their old spot, and names them in the toast with Retry.
7. **States.** Viewers see "View only" with **Request access** instead of buttons that fail with a 403. The 404 profile (Elif) falls back to the list data. The paused and empty roles explain themselves. On mobile, the page scrolls with the search pinned.
8. **Messy data.** Every `fitReason` format, missing one-liners ("Current role not mentioned"), duplicate and overflowing companies ("+3 more"), clock skew and missing times, broken links hidden, empty work history, undated and overlapping jobs, and someone listed under two roles.

### Home

"What needs you this week": four big numbers (waiting on you, want to meet, waiting too long, intro calls this week), to-dos ordered by urgency, a week calendar of intro calls, and every role with what's waiting, its pipeline and how many days it's been open. Anyone waiting over a week is flagged in amber. Everything links into Review.

### Settings

One page with sticky tabs: **Company** (round logo with upload, name, tagline, website, location, size), **Team** (members at a glance, invites, and access requests that owners approve or decline), **Your profile** (name, email notifications) and a read-only **Billing** overview. Viewers see it read-only, apart from their own profile.

### Design system

I deliberately moved beyond the `v2-*` design system rather than extending it. I wanted the interface to be clearer for hiring managers and more modern, and to feel less like a generic, AI-generated template. I kept its token names and components, but overrode the values (colour, radius, shadows, borders, font) in one place, so every screen picked up the new look without rewriting components.

Next, I'd go further: a custom brand and UI elements, our own icons and motion that set the product apart from competitors, and a touch of whimsy, because that's at Clera's core.

## What I cut, or didn't get to

1. **Real AI.** The prompt box is a text search with quick filters, and the "AI summary on top of the resume" is the existing "why it's a match" text, cleaned up. Nothing calls a model.
2. **Managing members.** You can invite and approve access, but not change someone's role or remove them.
3. **Billing** is read-only, with no plan changes or invoices.
4. **Phosphor icons** remain in about 40 files outside the three screens (modals, other pages).
5. **The mobile profile sheet** doesn't have the "why it's a match" box yet.
6. **Small loose ends.** The sidebar still says "Member" under the owner. A viewer's "Requested" state resets after a reload. Home's "want to meet" and "something to check" counts only include the loaded page.
7. **No full accessibility or dark-mode audit.** I checked contrast for the main buttons and text, not every screen.

## What I'd do next

1. Connect the prompt box to a model: "only people who've shipped payments infra", "who can start this month".
2. A real match score and short summary from the backend, replacing the mock score.
3. Keyboard shortcuts on Passed and Invited, plus undo for "Bring back".
4. Role changes and removal in Team, and show access requests on Home too.
5. A proper accessibility pass (focus order, screen reader labels, contrast across dark mode).

## What I'd push back on in the brief

1. **"Use the data the mock API already has" for Home.** A useful "this week" view needs scheduled calls, which the API doesn't have. I added sample data rather than leave the calendar out.
2. **No match score in the data.** "Show what a hiring manager needs in the first two seconds" really wants a ranking. I added a stand-in score so the queue could show the best people first.
3. **The paged feed.** `totalCount` and the loaded items disagree, so any count in the UI is a choice to explain.
4. **The shared repo.** Clera's `main` already contained a previous candidate's finished submission. I started from the original starter commit (`7cc4da3`) on a separate branch so my work stays clearly mine.

## Mock data I added

Beyond the provided API, so it's clear what's real:

1. A `matchScore` on review items, a stable stand-in per person.
2. `/intro-calls`: sample upcoming calls for the Home calendar.
3. `/dashboard/review/invited`: people you've requested an intro to.
4. `/access-requests`: viewers asking for decision rights, plus approve and decline. Sam has a pending request in the demo state.
5. `/company`, `/members/invites` and `/api/user/settings`: company profile, invites and notification preferences, kept in memory until the server restarts. Billing figures are static.
