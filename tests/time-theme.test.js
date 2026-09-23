import test from 'node:test';
import assert from 'node:assert/strict';
import {getTimeTheme,resolveThemeDate,formatLocalTime,TIME_THEME_PRESETS} from '../js/time-theme.js';

const at=hour=>new Date(2026,8,9,hour,5);
test('time themes switch at the requested local-hour boundaries',()=>{
 assert.equal(getTimeTheme(at(5)).name,'night');
 assert.equal(getTimeTheme(at(6)).name,'morning');
 assert.equal(getTimeTheme(at(10)).name,'morning');
 assert.equal(getTimeTheme(at(11)).name,'morning');
 assert.equal(getTimeTheme(at(12)).name,'day');
 assert.equal(getTimeTheme(at(17)).name,'evening');
 assert.equal(getTimeTheme(at(19)).name,'evening');
 assert.equal(getTimeTheme(at(20)).name,'evening');
 assert.equal(getTimeTheme(at(21)).name,'night');
 assert.equal(getTimeTheme(at(4)).name,'night');
});
test('theme values blend during the final 30 minutes before a boundary',()=>{const before=new Date(2026,8,9,20,0),near=new Date(2026,8,9,20,50);assert.equal(getTimeTheme(before).blend,0);assert.ok(getTimeTheme(near).blend>.6);assert.equal(getTimeTheme(near).from,'evening');assert.equal(getTimeTheme(near).to,'night');});
test('time query creates a development-only mock date',()=>{assert.equal(resolveThemeDate('?time=17:15').getHours(),17);assert.equal(resolveThemeDate('?time=17:15').getMinutes(),15);});
test('local time formatter emits a minute-precision value',()=>assert.match(formatLocalTime(at(9)),/^0?9:05$/));
test('Tea Party remains warm after dark while Clock stays cool',()=>{const tea=Number.parseInt(TIME_THEME_PRESETS.night.worlds.world04.slice(1),16),clock=Number.parseInt(TIME_THEME_PRESETS.night.worlds.world01.slice(1),16);assert.ok(((tea>>16)&255)>(tea&255));assert.ok((clock&255)>((clock>>16)&255));});
test('Queen stays crimson in morning and daytime themes',()=>{for(const name of ['morning','day']){const color=Number.parseInt(TIME_THEME_PRESETS[name].worlds.world02.slice(1),16),red=(color>>16)&255,green=(color>>8)&255,blue=color&255;assert.ok(red>green*3);assert.ok(red>blue*2);}});
test('Tea Party keeps a warm morning tint',()=>{const color=Number.parseInt(TIME_THEME_PRESETS.morning.worlds.world04.slice(1),16),red=(color>>16)&255,blue=color&255;assert.ok(red>blue);});
