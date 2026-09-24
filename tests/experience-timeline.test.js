import test from 'node:test';
import assert from 'node:assert/strict';
import {EXPERIENCE_WORLDS,formatRemaining,nextWorldIndex,SCENE_DURATION_MS} from '../js/experience-timeline.js';
test('experience loops Queen Eat Drink Clock every 90 seconds',()=>{assert.equal(SCENE_DURATION_MS,90000);assert.deepEqual(EXPERIENCE_WORLDS.map(w=>w.type),['world02','world03','world01']);let index=0;for(let i=0;i<10;i++)index=nextWorldIndex(index);assert.equal(index,1);assert.equal(formatRemaining(90000),'01:30');assert.equal(formatRemaining(1),'00:01');});
