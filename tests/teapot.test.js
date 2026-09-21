import test from 'node:test';
import assert from 'node:assert/strict';
import {createTeapot} from '../js/objects.js';

test('teapot is one rigid named group with every visible component attached',()=>{
  const pot=createTeapot();
  assert.equal(pot.name,'TeaPotGroup');
  assert.deepEqual(['Body','Spout','Handle','Lid','Knob'].map(name=>pot.getObjectByName(name)?.parent),Array(5).fill(pot));
});

test('pour origin is a child of the teapot and sits at the spout tip',()=>{
  const pot=createTeapot(),origin=pot.getObjectByName('PourOrigin');
  assert.equal(origin?.parent,pot);
  assert.equal(pot.userData.pourOrigin,origin);
  assert.ok(origin.position.x>.49);
  assert.ok(origin.position.y>.28);
});
