import test from 'node:test';
import assert from 'node:assert/strict';
import {createSceneManager,SceneType} from '../js/scene-manager.js';
const stub=()=>({root:{visible:true},updates:[],resets:0,update(...args){this.updates.push(args);},reset(){this.resets++;}});
test('scene manager exposes the four stable scene names',()=>assert.deepEqual(Object.values(SceneType),['clock','cards','chess','tea-party']));
test('scene manager hides inactive roots and delegates lifecycle',()=>{const clock=stub(),cards=stub(),chess=stub(),teaParty=stub(),manager=createSceneManager({clock,cards,chess,teaParty});manager.setScene(SceneType.CARDS);assert.equal(manager.getActiveScene(),cards);assert.equal(cards.root.visible,true);assert.equal(clock.root.visible,false);manager.update(2,.016);assert.deepEqual(cards.updates,[[2,.016]]);manager.reset();assert.equal(cards.resets,2);manager.setScene('unknown');assert.equal(manager.getActiveScene(),cards);assert.equal(cards.root.visible,false);});
