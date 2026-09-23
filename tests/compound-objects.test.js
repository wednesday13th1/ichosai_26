import test from 'node:test';
import assert from 'node:assert/strict';
import {createPocketClock,createTeaCup} from '../js/objects.js';
import {createWorld03} from '../js/scenes/world03.js';

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

test('Chess world contains floating pieces without a board or platform',()=>{
  const world=createWorld03(),pieces=[];world.root.traverse(object=>{if(object.name?.startsWith('ChessPiece-')||object.name?.startsWith('ChessDiscovery-'))pieces.push(object);});
  assert.equal(world.root.getObjectByName('ChessFloor'),undefined);
  assert.ok(pieces.length>=8&&pieces.length<=12);
  const before=pieces.map(piece=>piece.userData.base.clone());
  world.update(12,.016,{view:{yaw:Math.PI,pitch:.7},theme:{animationSpeed:1}});
  pieces.forEach((piece,index)=>{assert.equal(piece.position.x,before[index].x);assert.equal(piece.position.z,before[index].z);});
  world.dispose();
});

test('Chess animation remains bounded and deterministic after five minutes',()=>{
  const world=createWorld03(),pieces=[];world.root.traverse(object=>{if(object.name?.startsWith('ChessPiece-')||object.name?.startsWith('ChessDiscovery-'))pieces.push(object);});
  world.reset();world.update(300,.016,{theme:{animationSpeed:1}});
  pieces.forEach(piece=>{const u=piece.userData;assert.ok(Math.abs(piece.position.y-u.base.y)<=u.floatAmplitude+.0001);assert.ok(piece.scale.x>=u.baseScale*(1-u.scaleAmplitude)-.0001);assert.ok(piece.scale.x<=u.baseScale*(1+u.scaleAmplitude)+.0001);assert.ok([piece.position.x,piece.position.y,piece.position.z,piece.scale.x,piece.quaternion.x,piece.quaternion.y,piece.quaternion.z,piece.quaternion.w].every(Number.isFinite));});
  world.dispose();
});
