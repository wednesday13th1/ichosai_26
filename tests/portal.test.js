import test from 'node:test';
import assert from 'node:assert/strict';
import { createPortalStory } from '../js/scenes.js';
import { createApproachTracker } from '../js/interaction.js';
const ready={state:'READY_FOR_DOOR',age:1.3,yaw:.2,pitch:.1};
const centered={x:0,y:0,z:.9};
const outside={x:2,y:0,z:.9};
test('phase three requires completed chase and a visible gaze to discover',()=>{
  const story=createPortalStory(),tracker=createApproachTracker();
  let pose;
  for(let i=0;i<500;i++)pose=story.update(1/60,{state:'WAIT',age:20},{focus:0,progress:0});
  assert.equal(pose.state,null);
  const states=[];
  for(let i=0;i<500;i++){
    pose=story.update(1/60,ready,{focus:0,progress:0});
    if(states.at(-1)!==pose.state)states.push(pose.state);
  }
  assert.deepEqual(states,['DOOR_APPEARING','RABBIT_ENTERING','DOOR_OPENING','PORTAL_VISIBLE']);
  for(let i=0;i<1200;i++)pose=story.update(1/60,ready,tracker.update(1/60,outside));
  assert.equal(pose.state,'PORTAL_VISIBLE');assert.equal(pose.approach,0);
  for(let i=0;i<160;i++)pose=story.update(1/60,ready,tracker.update(1/60,centered));
  assert.equal(pose.state,'APPROACHING');const progress=pose.approach;
  for(let i=0;i<300;i++)pose=story.update(1/60,ready,tracker.update(1/60,outside));
  assert.equal(pose.approach,progress);
  for(let i=0;i<400;i++)pose=story.update(1/60,ready,tracker.update(1/60,centered));
  assert.equal(pose.state,'PORTAL_DISCOVERED');assert.equal(pose.approach,1);
  story.reset();tracker.reset();assert.equal(story.state,null);assert.equal(tracker.update(.1,centered).progress,0);
});
test('behind-camera projection never advances the pseudo approach',()=>{
 const tracker=createApproachTracker();let result;
 for(let i=0;i<1000;i++)result=tracker.update(1/60,{x:0,y:0,z:1.2});
 assert.equal(result.progress,0);
});
