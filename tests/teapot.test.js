import test from 'node:test';
import assert from 'node:assert/strict';
import {createTeapot} from '../js/objects.js';

test('teapot is one rigid named group with every visible component attached',()=>{
  const pot=createTeapot();
  const lidGroup=pot.getObjectByName('LidRoot');
  assert.equal(pot.name,'TeapotRoot');
  assert.deepEqual(['Body','Spout','Handle'].map(name=>pot.getObjectByName(name)?.parent),Array(3).fill(pot));
  assert.equal(lidGroup.parent,pot);
  assert.equal(pot.getObjectByName('Lid')?.parent,lidGroup);
  assert.equal(pot.getObjectByName('Knob')?.parent,lidGroup);
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

test('animating the teapot root never changes component-local transforms',()=>{
  const pot=createTeapot(),parts=['Body','LidRoot','Spout','Handle'].map(name=>pot.getObjectByName(name)),before=parts.map(part=>({position:part.position.toArray(),rotation:part.rotation.toArray()}));
  pot.position.set(.3,.2,-2);pot.rotation.set(.1,Math.PI,.2);pot.scale.setScalar(.7);pot.updateMatrixWorld(true);
  parts.forEach((part,index)=>{assert.deepEqual(part.position.toArray(),before[index].position);assert.deepEqual(part.rotation.toArray(),before[index].rotation);});
});

test('spout and both handle ends overlap the body attachment envelope',()=>{
  const pot=createTeapot(),bounds=pot.userData.attachmentBounds;
  assert.ok(bounds.spout.min.x<bounds.body.max.x);
  assert.ok(bounds.handle.max.x>bounds.body.min.x);
  assert.ok(bounds.handle.min.y<0&&bounds.handle.max.y>0);
});
