import test from 'node:test';
import assert from 'node:assert/strict';
import {HOLD_THRESHOLD_MS,MAX_RECORDING_MS,supportedVideoMime} from '../js/video-recorder.js';
test('long press and duration remain festival-safe',()=>{assert.ok(HOLD_THRESHOLD_MS>=450&&HOLD_THRESHOLD_MS<=600);assert.equal(MAX_RECORDING_MS,20000);});
test('video MIME selection uses the first supported codec',()=>{class Fake{static isTypeSupported(type){return type.includes('vp8')||type==='video/webm';}}assert.equal(supportedVideoMime(Fake),'video/webm;codecs=vp8');assert.equal(supportedVideoMime(undefined),'');});
