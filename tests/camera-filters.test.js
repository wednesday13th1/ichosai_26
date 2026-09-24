import test from 'node:test';
import assert from 'node:assert/strict';
import {applyTimeToFilter,CAMERA_FILTERS,cssFilter} from '../js/camera-filters.js';
test('the three automatic worlds own distinct camera grades',()=>{assert.deepEqual(Object.keys(CAMERA_FILTERS),['world01','world02','world03']);assert.equal(CAMERA_FILTERS.world02.name,'VICTORIAN CRIMSON');assert.equal(CAMERA_FILTERS.world03.name,'RETRO SURREAL');assert.equal(CAMERA_FILTERS.world01.name,'WARM VINTAGE TIME');});
test('Queen grade protects the central portrait',()=>{const q=CAMERA_FILTERS.world02;assert.ok(q.overlayOpacity>=.3);assert.ok(q.centerOpacity<q.overlayOpacity);assert.deepEqual(q.overlay,[87,11,24]);});
test('Clock and Eat Drink grades are warm and composable',()=>{assert.ok(CAMERA_FILTERS.world01.sepia>=.1);assert.ok(CAMERA_FILTERS.world03.sepia>=.07);assert.match(cssFilter(CAMERA_FILTERS.world03),/^saturate\(.+\) contrast\(.+\) brightness\(.+\) sepia\(.+\) hue-rotate\(.+deg\)$/);});
test('time variation stays subtle',()=>{const base=CAMERA_FILTERS.world02,morning=applyTimeToFilter(base,'morning'),night=applyTimeToFilter(base,'night');assert.ok(morning.overlayOpacity<base.overlayOpacity);assert.ok(night.overlayOpacity>base.overlayOpacity);assert.ok(night.brightness<=1.08);});
