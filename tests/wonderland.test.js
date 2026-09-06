import test from 'node:test';
import assert from 'node:assert/strict';
import {createWonderlandStory,WonderlandState} from '../js/scenes.js';
function advance(story,seconds){return story.update(seconds);}
test('story follows its timed progression and never ends',()=>{const s=createWonderlandStory();assert.equal(s.state,WonderlandState.NORMAL);advance(s,1.5);assert.equal(s.state,WonderlandState.GROWING);advance(s,3);assert.equal(s.state,WonderlandState.GIANT);advance(s,3);assert.equal(s.state,WonderlandState.SHRINKING);advance(s,3);assert.equal(s.state,WonderlandState.TINY);advance(s,4);assert.equal(s.state,WonderlandState.GRAVITY_BREAK);advance(s,2);assert.equal(s.state,WonderlandState.WONDERLAND);advance(s,600);assert.equal(s.state,WonderlandState.WONDERLAND);s.reset();assert.equal(s.state,WonderlandState.NORMAL);});
test('long frames preserve time across transitions',()=>{const s=createWonderlandStory();assert.equal(s.update(16.5).state,WonderlandState.WONDERLAND);});
