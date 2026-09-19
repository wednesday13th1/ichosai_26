import test from 'node:test';
import assert from 'node:assert/strict';
import {createSceneManager,SceneType} from '../js/scene-manager.js';
const stub=()=>({root:{visible:true},updates:[],resets:0,themes:[],update(...args){this.updates.push(args);},reset(){this.resets++;},setTheme(theme){this.themes.push(theme);}});
test('scene manager exposes the four stable world names',()=>assert.deepEqual(Object.values(SceneType),['world01','world02','world03','world04']));
test('scene manager hides inactive roots and delegates lifecycle',()=>{const world01=stub(),world02=stub(),world03=stub(),world04=stub(),manager=createSceneManager({world01,world02,world03,world04});manager.setScene(SceneType.WORLD_02);assert.equal(manager.getActiveScene(),world02);assert.equal(world02.root.visible,true);assert.equal(world01.root.visible,false);manager.update(2,.016);assert.deepEqual(world02.updates,[[2,.016]]);manager.reset();assert.equal(world02.resets,2);manager.setScene('unknown');assert.equal(manager.getActiveScene(),world02);assert.equal(world02.root.visible,false);});
test('scene manager broadcasts time themes to every world',()=>{const worlds=[stub(),stub(),stub(),stub()],manager=createSceneManager({world01:worlds[0],world02:worlds[1],world03:worlds[2],world04:worlds[3]});manager.setTheme({name:'golden'});assert.ok(worlds.every(world=>world.themes[0].name==='golden'));});
