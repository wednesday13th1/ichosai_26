import test from 'node:test';
import assert from 'node:assert/strict';
import {getTimeTheme,resolveThemeDate,formatLocalTime} from '../js/time-theme.js';

const at=hour=>new Date(2026,8,9,hour,5);
test('time themes switch at the requested local-hour boundaries',()=>{
 assert.equal(getTimeTheme(at(5)).name,'night');
 assert.equal(getTimeTheme(at(6)).name,'morning');
 assert.equal(getTimeTheme(at(10)).name,'morning');
 assert.equal(getTimeTheme(at(11)).name,'day');
 assert.equal(getTimeTheme(at(16)).name,'golden');
 assert.equal(getTimeTheme(at(19)).name,'night');
 assert.equal(getTimeTheme(at(4)).name,'night');
});
test('theme values blend during the final 30 minutes before a boundary',()=>{const before=new Date(2026,8,9,18,0),near=new Date(2026,8,9,18,20);assert.equal(getTimeTheme(before).blend,0);assert.ok(getTimeTheme(near).blend>.6);assert.equal(getTimeTheme(near).from,'golden');assert.equal(getTimeTheme(near).to,'night');});
test('time query creates a development-only mock date',()=>{assert.equal(resolveThemeDate('?time=17:15').getHours(),17);assert.equal(resolveThemeDate('?time=17:15').getMinutes(),15);});
test('local time formatter emits a minute-precision value',()=>assert.match(formatLocalTime(at(9)),/^0?9:05$/));
