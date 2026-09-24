import test from 'node:test';
import assert from 'node:assert/strict';
import {createSceneManager,SceneType} from '../js/scene-manager.js';
const stub=()=>({root:{visible:true,position:{x:0}},updates:[],resets:0,themes:[],update(...args){this.updates.push(args);},reset(){this.resets++;},setTheme(theme){this.themes.push(theme);}});
test('scene manager exposes only the three production worlds',()=>assert.deepEqual(Object.values(SceneType),['world01','world02','world03']));
test('scene manager hides inactive roots and delegates lifecycle',()=>{const worlds=[stub(),stub(),stub()],manager=createSceneManager({world01:worlds[0],world02:worlds[1],world03:worlds[2]});manager.setScene(SceneType.WORLD_02);assert.equal(manager.getActiveScene(),worlds[1]);assert.equal(worlds[0].root.visible,false);manager.update(2,.016);assert.deepEqual(worlds[1].updates,[[2,.016]]);});
test('scene manager broadcasts themes to all worlds',()=>{const worlds=[stub(),stub(),stub()],manager=createSceneManager({world01:worlds[0],world02:worlds[1],world03:worlds[2]});manager.setTheme({name:'golden'});assert.ok(worlds.every(world=>world.themes[0].name==='golden'));});
test('ten automatic cycles leave exactly one active scene',()=>{const worlds=[stub(),stub(),stub()],manager=createSceneManager({world01:worlds[0],world02:worlds[1],world03:worlds[2]});for(let i=0;i<10;i++){manager.setScene(Object.values(SceneType)[i%3],i>0);manager.update(i*90,2);}assert.equal(worlds.filter(world=>world.root.visible).length,1);});
