# Changelog

## Private Cloudflare deployment preparation — 2026-11-01

- Added a separate Workers deployment for the existing app, using Cloudflare Access JWT verification and an exact-email check before every static asset.
- Added eight security/routing tests, a reproducible Wrangler dry build, pinned tooling, and GitHub Actions checks. No authentication configuration or credential is committed.
- Cloudflare account sign-in succeeded. Zero Trust Free plan selection and Wrangler OAuth authorization are waiting for explicit approval. No new Cloudflare production app URL is claimed yet.

## Submission preparation — 2026-11-01

- Created the actual Devpost draft, saved the story and GitHub link, uploaded two explicitly labeled illustration-based UI screenshots, and verified the rendered preview.
- Inspected finalization: required Rules/Terms checkbox remains unchecked; real working-demo video and actual iPhone validation are pending.
- Confirmed the currently signed-in Chrome account is denied by the private hosting policy. Preserve private access at the user's explicit request.

## 0.2.0 — 2026-11-01

- Keep earlier unfinished details visible when another step becomes active, including in the resume summary and read-aloud text.
- Avoid suggesting completion for notes that also record unfinished work.
- Add content-free device diagnostics in Settings, with observed camera/voice/tracking outcomes and an explicit temporary storage probe.
- Improve backup download compatibility by attaching the download link before activation.
- Pass 23 automated tests; verify multi-step resume and the storage probe through desktop browser UI. Real iPhone validation remains pending.

## 2026-11-01

- Selected Threadback phone implementation for Arbiter Hacks V1 General Track.
- Created dedicated public GitHub repository and private Sites hosting project.
- Defined evidence-backed checkpoints, unfinished details, and honest alignment recovery as the central experience.
- Started implementation of local task state, camera workspace, voice checkpoints, and resume history.
- Implemented the core task lifecycle, checkpoint review, photo evidence, undo, backup import/export, and local persistence.
- Added planar ORB/RANSAC matching with inlier/geometry checks and hidden overlays when tracking is uncertain.
- Added a responsive phone navigation bar, accessible controls, and animated thread companion.
- Passed 17 automated tests and desktop browser checks for interruption recovery and photo persistence.
- Added GitHub Actions verification, synthetic fixture provenance, validation record, and an honest Devpost draft.

