import test from 'node:test';
import assert from 'node:assert/strict';
import {applyTimeToFilter,CAMERA_FILTERS,cssFilter} from '../js/camera-filters.js';

test('every Wonderland world owns one centralized camera grade',()=>{assert.deepEqual(Object.keys(CAMERA_FILTERS),['world01','world02','world03','world04']);assert.equal(CAMERA_FILTERS.world02.name,'CRIMSON GARDEN');});
test('Queen grade enriches color without excessive brightness',()=>{const queen=CAMERA_FILTERS.world02;assert.ok(queen.saturation>=1.1&&queen.saturation<=1.18);assert.ok(queen.contrast>=1.05&&queen.contrast<=1.12);assert.ok(queen.overlayOpacity<=.09);assert.ok(queen.brightness<=1.03);});
test('CSS filter output contains only composable mobile color operations',()=>{assert.match(cssFilter(CAMERA_FILTERS.world03),/^saturate\(.+\) contrast\(.+\) brightness\(.+\) sepia\(.+\) hue-rotate\(.+deg\)$/);});
test('time variation stays subtle and keeps night photography bright',()=>{const base=CAMERA_FILTERS.world02,morning=applyTimeToFilter(base,'morning'),night=applyTimeToFilter(base,'night');assert.ok(morning.overlayOpacity<base.overlayOpacity);assert.ok(night.overlayOpacity>base.overlayOpacity);assert.ok(night.brightness>=base.brightness);assert.ok(night.brightness<=1.08);});
