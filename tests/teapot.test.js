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

test('Tea Party porcelain stays warm and matte instead of flat white',()=>{
  const pot=createTeapot(),body=pot.getObjectByName('Body'),knob=pot.getObjectByName('Knob');
  assert.ok(body.material.roughness>=.55&&body.material.roughness<=.8);
  assert.ok(body.material.metalness<=.2);
  assert.ok(knob.material.roughness>=.55&&knob.material.metalness<=.2);
  assert.ok(body.material.color.r>body.material.color.b);
});
