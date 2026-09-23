import test from 'node:test';
import assert from 'node:assert/strict';
import {createPocketClock,createTeaCup} from '../js/objects.js';

const gradient={addColorStop(){}};
const context={fillRect(){},strokeRect(){},beginPath(){},arc(){},stroke(){},moveTo(){},lineTo(){},fillText(){},createRadialGradient(){return gradient;}};
globalThis.document={createElement(){return{width:0,height:0,getContext(){return context;}};}};

test('clock hands rotate through centered pivots without translating their meshes',()=>{
  const clock=createPocketClock(10,8),minute=clock.getObjectByName('MinuteHandPivot'),hour=clock.getObjectByName('HourHandPivot');
  assert.equal(clock.name,'ClockRoot');
  for(const pivot of [minute,hour]){
    assert.equal(pivot.parent,clock);
    assert.deepEqual(pivot.position.toArray().slice(0,2),[0,0]);
    assert.deepEqual(pivot.children[0].position.toArray(),[0,0,0]);
  }
  const local=[minute.position.clone(),hour.position.clone()];
  clock.scale.x=-1;minute.rotation.z+=1;hour.rotation.z-=1;
  assert.ok(minute.position.equals(local[0]));
  assert.ok(hour.position.equals(local[1]));
});

test('cup and saucer share one stable root and opening marker',()=>{
  const cup=createTeaCup();
  assert.equal(cup.name,'CupRoot');
  assert.equal(cup.getObjectByName('Cup')?.parent,cup);
  assert.equal(cup.getObjectByName('Saucer')?.parent,cup);
  assert.equal(cup.userData.opening?.parent,cup);
});
