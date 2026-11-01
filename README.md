# Threadback

**A visual bookmark for unfinished physical work.**

Threadback preserves the details a checklist forgets: what you completed, what you started but have not finished, and the exact next action. Designed for an iPhone camera and voice checkpoints, with an equally usable desktop workspace.

Built for **Arbiter Hacks V1 — General Track**. This is a new phone implementation of a previously discussed AR-glasses concept. No glasses implementation is represented as new work here.

## Development

Node 22+; no dependency installation or build step is required.

```sh
npm start
npm test
```

Open the printed localhost URL on this computer. An iPhone needs the deployed HTTPS URL for camera/microphone access; this computer's localhost URL is not reachable from a phone. Camera, microphone, and storage compatibility must be checked on the actual phone.

## Build status

The core workspace is implemented: create tasks, review typed/voice checkpoints, preserve unfinished details, pause/resume, save photo evidence, place markers, undo changes, and export/import local backups. See [docs/ROADMAP.md](docs/ROADMAP.md), [docs/VALIDATION.md](docs/VALIDATION.md), and [CHANGELOG.md](CHANGELOG.md) for verified behavior and remaining work. The included example workspace is an illustration and is always labeled as an example. It is not a live-camera or AI-recognition demonstration.

## Architecture

- Buildless HTML/CSS/ES modules; camera capture through `getUserMedia`.
- Local task state and snapshots; no account required for local data.
- Explicit event history, checkpoint review, reversible progress updates, and resume packets.
- JSFeat (MIT) for local planar feature matching; no claim of general room-scale 3D tracking.
- Voice support depends on browser speech-recognition availability; typing remains available.
- Note extraction currently uses explicit text cues, not a cloud AI model. Photos are not analyzed for task completion.

## Provenance

Public development repository: https://github.com/ShivaPriyanShanmuga/threadback-mobile

AI assistance is used for implementation and design. The research and limitations will be documented before submission. The organizers' public rules have not explicitly resolved AI-assistance or concept reuse; this is disclosed as an unresolved question, not treated as permission or prohibition.

