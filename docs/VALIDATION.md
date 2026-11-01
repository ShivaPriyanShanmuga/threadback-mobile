# Validation record

This record distinguishes implemented behavior, synthetic tests, browser checks, and actual-device checks. Synthetic fixtures and an emulated viewport do not prove iPhone camera or speech performance.

## 2026-11-01 — automated checks

`npm run check`: 17 passing tests, plus ES-module syntax checks.

- Step advancement and full completion.
- Interrupted state persists after JSON serialization and validation.
- Completion requires explicit confirmation.
- Resolved details are not resurrected from historical checkpoints.
- Contradictory completed/unfinished states are rejected.
- Last-completed history respects event order.
- Immutable changes allow undo.
- Negative phrases do not suggest completion.
- Independent extraction of unfinished detail and next action.
- Backup validation, duplicate identifiers, unsafe markers, and size bounds.
- Perspective transform inversion and geometry rejection.
- Actual JSFeat ORB/RANSAC tracker recovers a known synthetic translation.
- Unrelated and textureless frames are rejected.

Illustration-derived fixture check at 320×203: 57 inliers, 0.775 px reprojection error for a known 42×24 px translation in the 1200×760 source. This is one controlled example, not a real-device accuracy benchmark.

## Desktop browser checks completed

- Created a three-step workspace through the interface.
- Marked the first step done and verified advancement to the second.
- Saved a checkpoint with unfinished detail and exact next action.
- Confirmed contradictory completion is blocked in the UI.
- Paused and reloaded; status, progress, unfinished detail, and next action persisted.
- Imported a clearly labeled synthetic PNG through the actual file chooser.
- Attached that image to a checkpoint and verified thumbnail persistence after reload.
- Inspected the 390 px layout; document width equals viewport width (no horizontal overflow).

## Still required before final submission

- Actual iPhone Safari camera permission/start/stop and orientation checks.
- Actual iPhone microphone/speech availability and denial recovery.
- Actual workspace photo tracking, occlusion/loss/recovery, and moved-object behavior.
- Export/import round-trip and screenshot/companion interaction checks.
- Hosted deployment and offline shell checks.
- Real working-demo footage; no sample scene may be described as live recognition.

## Product limitations

- This version uses rule-based note extraction, not cloud AI vision or an LLM.
- Markers are user-placed on a visually tracked plane. They do not identify objects or follow independently moving objects.
- ORB/RANSAC matching needs texture, reasonable lighting, and limited viewpoint change. Markers are hidden when confidence checks fail.
- The app stops the camera when it becomes hidden. It does not observe work in the background.
- Local browser storage can be cleared or evicted. Export backup is the supported portability path.
- Speech recognition depends on browser/provider support and may use the provider's service. Typed notes always remain available.

