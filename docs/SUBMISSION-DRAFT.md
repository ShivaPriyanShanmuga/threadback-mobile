# Devpost draft — not yet submitted

## Project name
Threadback

## Tagline
A visual bookmark for unfinished physical work.

## Inspiration
An interruption does more than stop a task: it erases the small unresolved details that make returning difficult. A checklist may say a divider was started, but miss the important distinction between positioned and glued. Threadback preserves that distinction beside the workspace and brings it back with a clear next move.

## What it does
Create a workspace, add a few steps, and capture typed or voice checkpoints. Each confirmed checkpoint can preserve a note, unfinished detail, next action, and photo evidence. Pause and return to a resume packet separating the last completed step, unfinished work, and next action. User-placed visual markers and a small animated companion help connect those notes to the workspace.

## How we built it
A buildless browser app designed for an iPhone, with a desktop layout for review. ES modules implement bounded task state, explicit progress transitions, undo, and backup validation. LocalStorage holds task metadata and IndexedDB holds photos. Camera capture uses getUserMedia. Browser speech recognition captures voice notes when supported. JSFeat ORB features and RANSAC homography estimation support local planar alignment, with geometric/inlier confidence checks and hidden overlays when matching is uncertain.

## What is original in this entry
The implementation centers on evidence-backed unfinished-detail memory and a coherent interruption/resume flow. AR reminders and interruption cues have prior art; we do not claim to invent them. See the research notes and validation record.

## Provenance and AI assistance
The Threadback concept was previously discussed for an AR-glasses hackathon, and a separate glasses repository exists. This entry is a new phone/browser implementation started November 1, 2026. AI coding assistance was used in its design, implementation, tests, and documentation. The included example and test fixtures are code-native illustrations and are labeled accordingly. Current note extraction is rule-based, not an AI model; sample scenes do not demonstrate live AI recognition. Organizer clarification on AI assistance and prior-concept reuse remains unresolved in the public rules/discussion.

## Validation
Eighteen automated tests currently pass, including checkpoint state/persistence, contradiction handling, undo snapshots, backup validation, transform geometry, known synthetic motion recovery, and false-match rejection. Desktop browser checks cover creating a task, marking progress, pausing with an unfinished detail, reloading, importing a photo, and attaching photo evidence. Actual iPhone checks and final demo footage remain pending; update this section only after testing.

## What is next
Complete actual iPhone validation, improve viewpoint/lighting robustness, add optional grounded AI suggestions without making unverified completion decisions, and evaluate whether saved resume packets help people recover task context. We have not conducted a user study or established a measured productivity benefit.

## Submission checklist
- Public source: https://github.com/ShivaPriyanShanmuga/threadback-mobile
- Working URL: https://threadback-workspace.wirylapel.chatgpt.site (currently owner-private; judge access must be resolved before submission)
- Video URL: pending real working-demo recording and upload
- Track: General
- Required eligibility/agreements: not yet reviewed in the final submission form

