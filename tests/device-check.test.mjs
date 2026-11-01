import test from 'node:test';
import assert from 'node:assert/strict';
import {deviceReport} from '../dist/device-check.mjs';

test('available browser features never imply completed device tests',()=>{
  const report=deviceReport({secureContext:true,cameraAPI:true,speechRecognition:true,indexedDB:true,platform:'iPhone'},{});
  assert.equal(report.capabilities.cameraAPI,true);
  assert.equal(report.observed.camera.outcome,'not-tried');
  assert.equal(report.observed.speech.outcome,'not-tried');
  assert.equal(report.observed.storage.outcome,'not-tried');
});

test('a support report cannot carry project content, photos, audio, or transcripts',()=>{
  const secret='private-project-content-should-never-appear';
  const report=deviceReport({platform:'iPhone',userAgent:secret}, {
    title:secret,camera:{outcome:'opened',width:1280,height:720,photo:secret},
    speech:{outcome:'captured',transcript:secret,audio:secret},
    storage:{outcome:'passed',notes:secret},tracking:{samples:10,matched:7,rejected:3,totalMs:900,frame:secret},
  });
  assert.equal(JSON.stringify(report).includes(secret),false);
  assert.equal(report.containsTaskContent,false);
  assert.equal(report.observed.camera.width,1280);
  assert.equal(report.observed.planarTracking.meanProcessingMs,90);
});

test('invalid diagnostics are bounded and retain no arbitrary strings',()=>{
  const report=deviceReport({platform:'unknown device'}, {camera:{outcome:'made-up',width:Infinity,height:-3},speech:{outcome:'error containing a note'},tracking:{samples:NaN,matched:-2}});
  assert.equal(report.capabilities.platform,'other');
  assert.equal(report.observed.camera.outcome,'not-tried');
  assert.equal(report.observed.camera.width,0);
  assert.equal(report.observed.camera.height,0);
  assert.equal(report.observed.speech.outcome,'not-tried');
  assert.equal(report.observed.planarTracking.sampledFrames,0);
});
