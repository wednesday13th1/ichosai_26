import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../js/main.js',import.meta.url),'utf8');

test('camera lifecycle waits for metadata and exposes explicit readiness states',()=>{
  for(const state of ["'idle'","'switching'","'ready'","'failed'"])assert.match(source,new RegExp(`cameraState=${state}`));
  assert.match(source,/waitForVideoMetadata\(\)/);
  assert.match(source,/loadedmetadata/);
});

test('background recovery reuses a live stream or opens one replacement stream',()=>{
  assert.match(source,/visibilitychange/);
  assert.match(source,/track\.readyState==='live'/);
  assert.match(source,/if\(layer\?\.isXR\|\|cameraSwitching\|\|capturePending\)return/);
});
