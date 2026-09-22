import test from 'node:test';
import assert from 'node:assert/strict';
import {createVisitVariation,cycleState,microMotion,MOTION_PHASE,motionPreference,outsideSafeZone,performanceTier,qualitySettings} from '../js/scenes/composition.js';

test('motion cycle exposes a deliberate hero photo window',()=>{assert.equal(cycleState(0,10).phase,MOTION_PHASE.REST);assert.equal(cycleState(6.55,10).phase,MOTION_PHASE.HERO);assert.ok(cycleState(6.55,10).hero>.9);assert.equal(cycleState(9,10).phase,MOTION_PHASE.RECOVERY);});
test('safe-zone helper protects the central portrait region',()=>{assert.equal(outsideSafeZone(.5,.5),false);assert.equal(outsideSafeZone(.12,.5),true);assert.equal(outsideSafeZone(.5,.9),true);});
test('low capability devices select reduced render settings',()=>{const tier=performanceTier({width:430,height:932,dpr:3,cores:4});assert.equal(tier,'low');assert.equal(qualitySettings(tier).shadows,false);assert.ok(qualitySettings(tier).dpr<2);});
test('micro motion remains bounded and reduced motion disables events',()=>{const sample=microMotion(2,{phase:.4,duration:6,float:.04,rotate:.03,scale:.02});assert.ok(Math.abs(sample.y)<=.04);assert.ok(Math.abs(sample.rotation)<=.03);assert.ok(sample.scale>=.98&&sample.scale<=1.02);assert.deepEqual(motionPreference(true),{reduced:true,scale:.28,events:false});});
test('world revisit variation is fixed during a visit and changes on re-entry',()=>{const values=[.1,.1],visit=createVisitVariation(3,()=>values.shift()??.1);assert.equal(visit.reset(),0);assert.equal(visit.variant,0);assert.equal(visit.elapsed(12),0);assert.equal(visit.elapsed(14),2);assert.equal(visit.reset(),1);assert.equal(visit.variant,1);});
