import test from 'node:test';
import assert from 'node:assert/strict';
import {createSceneManager,SceneType} from '../js/scene-manager.js';
test('scene manager selects each Wonderland and resets safely',()=>{const manager=createSceneManager();assert.equal(manager.getScene(),SceneType.CLOCK);for(const scene of Object.values(SceneType)){assert.equal(manager.setScene(scene),scene);assert.equal(manager.getScene(),scene);}assert.throws(()=>manager.setScene('rabbit-hole'),/Unknown scene/);assert.equal(manager.reset(),SceneType.CLOCK);});
