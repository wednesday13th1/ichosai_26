import test from 'node:test';
import assert from 'node:assert/strict';
import {getTimeTheme,formatLocalTime} from '../js/time-theme.js';

const at=hour=>new Date(2026,8,9,hour,5);
test('time themes switch at the requested local-hour boundaries',()=>{
 assert.equal(getTimeTheme(at(5)).name,'morning');
 assert.equal(getTimeTheme(at(10)).name,'morning');
 assert.equal(getTimeTheme(at(11)).name,'afternoon');
 assert.equal(getTimeTheme(at(16)).name,'golden');
 assert.equal(getTimeTheme(at(19)).name,'night');
 assert.equal(getTimeTheme(at(4)).name,'night');
});
test('local time formatter emits a minute-precision value',()=>assert.match(formatLocalTime(at(9)),/^0?9:05$/));
