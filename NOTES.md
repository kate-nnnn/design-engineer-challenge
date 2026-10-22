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
