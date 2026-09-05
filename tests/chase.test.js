import test from 'node:test';
import assert from 'node:assert/strict';
import { createChase, RabbitState } from '../js/scenes.js';
import { isRabbitCentered, wrapAngle } from '../js/interaction.js';

function advance(chase,seconds,view={yaw:0,pitch:0},centered=false){let pose;for(let i=0;i<Math.ceil(seconds*60);i++)pose=chase.update(1/60,view,.22,centered);return pose;}
test('waits for a real search; completes exactly three finds and exposes terminal state',()=>{
  const chase=createChase();
  assert.equal(chase.snapshot().state,RabbitState.APPEAR);
  advance(chase,1);assert.equal(chase.snapshot().state,RabbitState.WAIT);
  advance(chase,1.5);assert.equal(chase.snapshot().state,RabbitState.RUN);
  advance(chase,1.7);assert.equal(chase.snapshot().state,RabbitState.HIDE);
  advance(chase,1.1);assert.equal(chase.snapshot().state,RabbitState.REAPPEAR);
  advance(chase,20,{yaw:0,pitch:0},true);assert.equal(chase.snapshot().count,0);
  const directions=[];
  for(let count=1;count<=3;count++){
    const target=chase.snapshot();directions.push(target.yaw);
    const view={yaw:target.yaw,pitch:target.pitch};
    advance(chase,.2,view,true);assert.equal(chase.snapshot().count,count-1);
    advance(chase,.2,view,false); // A brief crossing must not count.
    advance(chase,.4,view,true);assert.equal(chase.snapshot().count,count);
    if(count<3){assert.equal(chase.snapshot().state,RabbitState.WAIT);advance(chase,5,view,false);assert.equal(chase.snapshot().state,RabbitState.REAPPEAR);}
  }
  assert.ok(directions[0]<0 && directions[1]>directions[0] && directions[2]<directions[1]);
  assert.equal(chase.snapshot().state,RabbitState.READY_FOR_DOOR);
  advance(chase,60,{yaw:.2,pitch:.1},true);assert.equal(chase.snapshot().count,3);
  assert.ok(Math.abs(chase.snapshot().yaw-.2)<.001);
  chase.reset();assert.equal(chase.snapshot().count,0);assert.equal(chase.snapshot().state,RabbitState.APPEAR);
});
test('center window rejects edges and targets behind camera',()=>{
  assert.ok(isRabbitCentered({x:.3,y:.4,z:.95}));
  for(const point of [{x:.6,y:0,z:0},{x:0,y:.6,z:0},{x:0,y:0,z:1.2}])assert.equal(isRabbitCentered(point),false);
  assert.ok(Math.abs(wrapAngle(2*Math.PI-.1)+.1)<1e-8);
});
