import test from 'node:test';
import assert from 'node:assert/strict';
import {discoveryPosition} from '../js/scenes/discovery-ring.js';

test('discovery ring maps six sectors into stable world coordinates',()=>{
  const points=[0,60,120,180,240,300].map(angle=>discoveryPosition(angle,3,.4));
  points.forEach(point=>{assert.ok(Math.abs(Math.hypot(point.x,point.z)-3)<1e-10);assert.equal(point.y,.4);});
  assert.ok(points[0].z<0&&points[3].z>0);
  assert.ok(points[1].x>0&&points[5].x<0);
});
