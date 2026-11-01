# Roadmap and completion record

## Working product

- [ ] Camera start/stop, permission-denial recovery, and photo capture.
- [x] Create, rename, and persist multiple tasks with editable steps.
- [ ] Voice and typed checkpoints with review before state changes.
- [x] Separate completed work, unfinished details, and next action.
- [ ] Markers, planar alignment, low-confidence recovery, and explicit tracking status.
- [x] Pause, reload, and resume from a saved evidence-backed packet.
- [x] Undo, correction, import/export, and local-data controls.
- [x] Phone layout, keyboard access, reduced motion, empty/error states.

## Verification

- [x] State tests: persistence, conflicting notes, undo, import validation.
- [x] Tracker tests: known transforms, unrelated frames, insufficient features.
- [x] Desktop browser full task lifecycle.
- [x] Multi-step unresolved-detail regression and content-free device reporting (23 automated tests; desktop storage probe verified).
- [ ] Actual iPhone camera, microphone, storage, reload, and tracking checks.
- [x] HTTPS deployment confirmed.

## Submission

- [x] Public repository with reproducible instructions and clear provenance.
- [ ] Honest 2–3 minute working-demo video hosted on YouTube/Vimeo.
- [x] Devpost project description, screenshots, limitations, and future work.
- [x] Saved and previewed Devpost draft: https://devpost.com/software/threadback-oadtch (DRAFT, 3/4 steps done).
- [ ] Eligibility and required agreement checks resolved at submission.
- [ ] Submission receipt verified.

No item is marked complete without evidence. Hackathon results and judging are external; completing the entry cannot guarantee a win.


Live build: https://threadback-workspace.wirylapel.chatgpt.site (private to approved accounts).
GitHub CI passed for implementation commit 0260a0149e862d66563361a3f6ba14e71fdf915a: https://github.com/ShivaPriyanShanmuga/threadback-mobile/actions/runs/41308447757
Camera/voice and tracking are implemented, but their working-product boxes remain unchecked until actual iPhone verification.

Devpost draft creation succeeded after refreshing the reCAPTCHA connection failure. The final terms checkbox remains unchecked and the video URL is empty. No track selector was present in the inspected registration/finalization forms; confirm General routing before submitting. Hosting remains private by explicit user preference. A private viewer grant resolved the tester's 403 and the live app opened successfully under that account in Chrome. Actual iPhone checks remain pending.
