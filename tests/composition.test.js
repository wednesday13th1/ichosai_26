import test from 'node:test';
import assert from 'node:assert/strict';
import {cycleState,MOTION_PHASE,outsideSafeZone,performanceTier,qualitySettings} from '../js/scenes/composition.js';

test('motion cycle exposes a deliberate hero photo window',()=>{assert.equal(cycleState(0,10).phase,MOTION_PHASE.REST);assert.equal(cycleState(6.55,10).phase,MOTION_PHASE.HERO);assert.ok(cycleState(6.55,10).hero>.9);assert.equal(cycleState(9,10).phase,MOTION_PHASE.RECOVERY);});
test('safe-zone helper protects the central portrait region',()=>{assert.equal(outsideSafeZone(.5,.5),false);assert.equal(outsideSafeZone(.12,.5),true);assert.equal(outsideSafeZone(.5,.9),true);});
test('low capability devices select reduced render settings',()=>{const tier=performanceTier({width:430,height:932,dpr:3,cores:4});assert.equal(tier,'low');assert.equal(qualitySettings(tier).shadows,false);assert.ok(qualitySettings(tier).dpr<2);});
