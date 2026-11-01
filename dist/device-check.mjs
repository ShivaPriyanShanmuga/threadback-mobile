// Device checks never collect task titles, transcripts, photographs, or audio.
// Capability availability is deliberately separate from observed success.
const outcomes = new Set(['not-tried', 'opened', 'captured', 'denied', 'failed', 'passed']);
const outcome = value => outcomes.has(value) ? value : 'not-tried';
const count = value => Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;

export function deviceReport(capabilities, observations) {
  return {
    format: 'threadback-device-check-v1',
    generatedAt: new Date().toISOString(),
    containsTaskContent: false,
    capabilities: {
      secureContext: capabilities.secureContext === true,
      cameraAPI: capabilities.cameraAPI === true,
      speechRecognition: capabilities.speechRecognition === true,
      indexedDB: capabilities.indexedDB === true,
      platform: ['iPhone', 'iPad', 'other'].includes(capabilities.platform) ? capabilities.platform : 'other',
    },
    observed: {
      camera: { outcome: outcome(observations.camera?.outcome), width: count(observations.camera?.width), height: count(observations.camera?.height) },
      speech: { outcome: outcome(observations.speech?.outcome) },
      storage: { outcome: outcome(observations.storage?.outcome) },
      planarTracking: {
        sampledFrames: count(observations.tracking?.samples),
        matchedFrames: count(observations.tracking?.matched),
        rejectedFrames: count(observations.tracking?.rejected),
        meanProcessingMs: observations.tracking?.samples ? count(observations.tracking.totalMs / observations.tracking.samples) : 0,
      },
    },
    interpretation: 'Available features are not passed tests. Camera opened and speech captured only describe this browser session. Frame matching does not establish physical accuracy or object identity.',
  };
}

export class DeviceCheck {
  constructor() {
    this.observations = { camera: { outcome: 'not-tried' }, speech: { outcome: 'not-tried' }, storage: { outcome: 'not-tried' }, tracking: { samples: 0, matched: 0, rejected: 0, totalMs: 0 } };
    try {
      const stored = JSON.parse(sessionStorage.getItem('threadback.device-check.v1'));
      if (stored?.observed) {
        this.observations.camera = stored.observed.camera;
        this.observations.speech = stored.observed.speech;
        this.observations.storage = stored.observed.storage;
      }
    } catch { /* A blocked session store must not prevent the app working. */ }
  }
  record(kind, status, dimensions = {}) {
    if (!['camera', 'speech', 'storage'].includes(kind)) return;
    this.observations[kind] = { outcome: outcome(status), ...(kind === 'camera' ? { width: count(dimensions.width), height: count(dimensions.height) } : {}) };
    try { sessionStorage.setItem('threadback.device-check.v1', JSON.stringify(this.report())); } catch { /* best-effort metadata only */ }
  }
  track(result, elapsedMs) {
    const t = this.observations.tracking;
    t.samples++; if (result.ok) t.matched++; else t.rejected++;
    t.totalMs += Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
  }
  report() {
    const agent = globalThis.navigator?.userAgent || '';
    return deviceReport({ secureContext: globalThis.isSecureContext === true, cameraAPI: !!globalThis.navigator?.mediaDevices?.getUserMedia, speechRecognition: !!(globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition), indexedDB: !!globalThis.indexedDB, platform: /iPhone/.test(agent) ? 'iPhone' : /iPad/.test(agent) ? 'iPad' : 'other' }, this.observations);
  }
}
