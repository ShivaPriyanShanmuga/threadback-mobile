# Threadback: Arbiter submission and research notes

Public-source review: November 1, 2026. This document records requirements and proposed evaluation; it does not claim that the app, video, user study, or submission is finished.

## Confirmed event requirements

Arbiter's General Track accepts working software or hardware without a topic restriction. Eligibility is students aged 13+, subject to the listed country exclusions. Teams may have 1–4 members, including a solo entrant; each team submits once to one track. Required deliverables are a public repository, a working demonstration video hosted on YouTube or Vimeo, and a description of functionality, implementation, and next steps. The video limit is awkwardly worded as “2 to 3 minutes max”; target 2:30. Missing the repository or video makes an entry ineligible. No mandatory sponsor API, model, or framework is stated on the reviewed pages. The overview's General first prize breakdown is $100 cash plus $2,000 in credits; the Rules page's prize section remains TBD.

Sources: [Overview and requirements](https://arbiter-hacks-v1.devpost.com/), [Rules](https://arbiter-hacks-v1.devpost.com/rules).

The General scoring weights are technical execution 35%, innovation/originality 25%, completeness/polish 25%, and presentation/demo clarity 15%. Those weights favor a complete, inspectable interruption/resumption experience with recovery paths. Source: [General rubric](https://arbiter-hacks-v1.devpost.com/rules).

Submissions began October 20, 2026 at 9 a.m. Pacific Daylight Time and close December 20 at 9 p.m. Pacific Standard Time: **December 21 at 12:00 a.m. Eastern**, i.e. the end of December 20 in the user's timezone. Judging runs through December 30; winners are scheduled for December 31. Source: [Schedule](https://arbiter-hacks-v1.devpost.com/details/dates).

## Actual uncertainties, without invented restrictions

- The published rules do not explicitly answer whether AI coding assistants are allowed, whether earlier prototypes can be extended, or whether the same underlying project may enter another event. A public participant asks about AI assistants and pre-event work; the retrieved discussion has **0 comments**. An unanswered question is neither permission nor a ban. Source: [Public discussion](https://arbiter-hacks-v1.devpost.com/forum_topics/45578-arbiter-v1-pre-event-prototype-ai-tools-and-minor-eligibility).
- The confirmed start date alone does not establish an all-code-must-be-new requirement. Preserve dated commits and provenance for the new phone implementation, earlier concept, reused code, and assets. Disclose those accurately in the submission. Do not label earlier work as newly created or pretend an organizer has approved reuse.
- Public written requirements establish only what the app does, how it was built, and what comes next. Authenticated Devpost submission fields may request additional metadata; those have not been inspected by this research task. Do not invent exact custom questions or consent terms.
- Student/age/country eligibility ultimately needs accurate entrant information. Prior registration does not prove all eligibility conditions are satisfied.
- Public Updates directs participants to Discord for announcements. This research did not join Discord, send an inquiry, or treat inaccessible announcements as verified. Source: [Updates](https://arbiter-hacks-v1.devpost.com/updates).

## Prior art and defensible differentiation

**AR support for resuming interrupted tasks is established prior art.** A CHI 2025 paper tested cue availability in a physical sorting task with 120 participants. Its introduction also discusses earlier AR checklist and task-tracking work. The paper highlights how cue reliability affects resumption strategies and errors. Important nuance: its reliability manipulation concerned whether a cue appeared, not a guarantee about confidently pointing to the wrong object. Its findings therefore do not validate arbitrary inaccurate markers. Source: Bahnsen, Dischinger, Grundgeiger, [AR Cue Reliability for Interrupted Task Resumption Affects Users' Resumption Strategies and Performance](https://doi.org/10.1145/3706598.3713685), CHI 2025.

The earlier CHI 2024 work studied AR resumption cues for both computer and tangible tasks. The title and DOI are also cited in the accessible CHI 2025 paper: [Augmented Reality Cues Facilitate Task Resumption after Interruptions in Computer-Based and Physical Tasks](https://doi.org/10.1145/3613904.3642666). Consult the paper directly before quoting numerical effects from it.

Proposed product contributions, to demonstrate rather than claim as unprecedented:

1. **Unfinished-detail memory.** Preserve distinctions such as positioned/fastened, selected/verified, or drafted/sent. A checklist completion tick cannot capture these alone.
2. **Evidence-backed checkpoints.** Link every progress assertion to the user's statement, selected snapshot, timestamp, and relevant region. Keep observation, inference, and confirmed fact visibly distinct.
3. **A coherent resume packet.** Generate “last confirmed completion → unresolved detail → next action” from saved state, with an inspectable timeline and corrections.
4. **Reliable recovery.** If the workspace cannot be matched, hide spatial claims and offer the saved reference image or manual re-alignment. Reopening storage successfully is not proof of spatial relocalization.
5. **Low-effort phone interaction.** Voice checkpoint, brief confirmation when necessary, and one reusable reference target make the phone adaptation practical. Use manual fallback without portraying it as automatic vision.

The most credible pitch: **“A visual bookmark for unfinished physical work, preserving the details a checklist forgets.”** Avoid claims of inventing AR reminders, universally understanding all tasks, proving completion from a camera alone, or monitoring while the app is closed.

## Proposed validation protocol

### Reproducible developer checks (can run without study participants)

- Three tasks: assemble a small organizer, sort a project kit, and prepare a pack of items. Include states that look complete but remain unconfirmed.
- Script initial state, two checkpoints, an interruption, reload, resume, correction, undo, and final completion.
- Assert that notes, pending steps, regions, evidence, and timestamps survive reload; no unresolved detail is promoted to done by a recap.
- Assert deterministic handling of contradictory updates, missing images, failed storage writes, cancelled speech, lost camera access, orientation changes, and invalid imported files.
- Re-localization trials: return to the same target, move the camera, partially occlude the target, remove it, and deliberately present a different target. Log whether the app correctly shows tracked, uncertain, or unaligned. Measure marker error against known target coordinates where possible.
- Run real-device Safari tests on the user's iPhone. Desktop tests and prerecorded camera fixtures must be reported separately from live iPhone verification.

### Optional small usability pilot (not completed)

- Recruit 4–8 consenting volunteers if feasible; use ordinary craft/sorting tasks, not safety-critical activities.
- Counterbalance two comparable tasks: a conventional checklist vs. Threadback. Introduce the same 45–60 second distraction after a matched checkpoint. Avoid reusing the exact task in the second condition.
- Measure **resumption time** from return prompt to first correct action; **first-action errors**; repeated/skipped work; accuracy of recalling unresolved details; checkpoint entry time; and self-reported confidence.
- Record the actual sample and individual measurements. Report medians and range as exploratory results, not evidence of statistical significance or broad clinical/productivity benefit.
- Distinguish incorrect memory from failed alignment. A pretty overlay does not count as successful guidance when it points to the wrong part.

## Suggested 2:30 demo structure

- 0:00–0:15: Show the real interruption problem: “It looks assembled—but did I fasten this piece?”
- 0:15–0:40: Start a task and create a voice checkpoint; show the saved evidence and unfinished detail.
- 0:40–1:00: Confirm one completed step, leave another unresolved, then close/reload the app. Label any time compression.
- 1:00–1:35: Return, reacquire the workspace, run the resume scan, and show last completion/unresolved detail/next action.
- 1:35–1:55: Demonstrate honest failure recovery: move/remove the reference and show that the app requests alignment instead of pretending certainty.
- 1:55–2:15: Complete the real next action, correct a checkpoint, and show persistence/history.
- 2:15–2:30: Explain the implementation contribution and measured checks; end with the actual repository and playable URL.

All demo statements must match the shipping implementation. Label sample scenes, fixtures, simulated speech, prerecorded footage, and unverified device behavior. Show actual camera/voice use if claiming those features work live.

## Submission writing guidance

Use a concise description centered on interruption recovery, then describe data/state handling, camera evidence, tracking/alignment, speech input, and the resume interface as actually implemented. Include known limits, dated work provenance, AI assistance, and third-party licenses. Suggested disclosure skeleton (fill only with verified facts): “The Threadback concept was previously explored for AR glasses. This entry implements [specific new phone work] during [dates]. [Reused components] are identified in [file]. AI assistance was used for [actual tasks]; validation and remaining limits are documented in [file].”

Do not claim winning odds, unique invention, user-study improvements, automatic progress recognition, or full ARKit tracking without supporting evidence. Prepare a clear working demo and technically honest writeup: together with functioning code, these directly address the published rubric.
