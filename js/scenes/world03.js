import * as THREE from 'three';
import {createPocketClock} from '../objects.js';
import {addObject,applyResponsivePriority,applyThemeToRoot,BILLBOARD,disposeRoot,plane,texture} from './composition.js';
import {WORLD_CONFIGS} from './world-config.js';

function numeralTexture(value){return texture(256,160,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#d7c6a6';x.textAlign='center';x.textBaseline='middle';x.font='italic 88px Georgia';x.fillText(value,w/2,h/2);});}
function chainBetween(start,end){const middle=start.clone().lerp(end,.5);middle.x+=(end.y-start.y)*.06;middle.z-=.12;const curve=new THREE.CatmullRomCurve3([start,middle,end]);return new THREE.Mesh(new THREE.TubeGeometry(curve,22,.012,6,false),new THREE.MeshStandardMaterial({color:0x76552f,metalness:.5,roughness:.58,transparent:true,opacity:.55}));}
function setClockOpacity(clock,opacity){clock.traverse(object=>{if(object.material){object.material.transparent=opacity<1;object.material.opacity=opacity;}});}

export function createWorld03(){
  const root=new THREE.Group(),environment=new THREE.Group(),background=new THREE.Group(),midground=new THREE.Group(),foreground=new THREE.Group(),atmosphere=new THREE.Group(),animated=[],clocks=[];
  root.userData.definition=WORLD_CONFIGS.world03;root.add(environment,background,midground,foreground,atmosphere);
  const specs=[
    {group:foreground,x:1.78,y:-.12,z:-2.05,scale:2.2,tilt:-.08,phase:.4,duration:8.7,opacity:.96,priority:1},
    {group:midground,x:-1.62,y:.64,z:-3.75,scale:1.18,tilt:.09,phase:2.2,duration:7.4,opacity:.88,priority:1},
    {group:midground,x:1.72,y:1.16,z:-4.15,scale:1.02,tilt:-.06,phase:4.1,duration:9.5,opacity:.8,priority:2},
    {group:background,x:-1.16,y:1.48,z:-5.65,scale:.72,tilt:.05,phase:5.5,duration:8.2,opacity:.57,priority:2},
    {group:background,x:1.48,y:-.68,z:-6.35,scale:.54,tilt:-.04,phase:1.3,duration:9.8,opacity:.48,priority:3},
    {group:foreground,x:-1.82,y:-.72,z:-2.35,scale:.82,tilt:.07,phase:3.1,duration:6.9,opacity:.92,priority:2}
  ];
  specs.forEach((spec,i)=>{const clock=createPocketClock(2+i*2,7+i*8);clock.scale.setScalar(spec.scale);clock.userData.mode=BILLBOARD.Y_AXIS;clock.userData.depth=spec.z<-5?'far':spec.z<-3.3?'mid':'near';setClockOpacity(clock,spec.opacity);addObject(spec.group,clock,{x:spec.x,y:spec.y,z:spec.z,rotation:THREE.MathUtils.radToDeg(spec.tilt),phase:spec.phase,duration:spec.duration,drift:.018,priority:spec.priority,animation:'suspended-sway'});animated.push(clock);clocks.push(clock);});
  environment.add(chainBetween(new THREE.Vector3(-2.05,2.25,-4.1),new THREE.Vector3(-1.62,.96,-3.78)),chainBetween(new THREE.Vector3(.92,2.35,-3.45),new THREE.Vector3(.82,.74,-3.08)),chainBetween(new THREE.Vector3(2.18,2.18,-5.1),new THREE.Vector3(1.72,1.65,-4.18)));
  ['III','VI','IX','XII'].forEach((value,i)=>{const side=i%2?-1:1,numeral=plane(numeralTexture(value),.58,.36,{opacity:.3,depth:'far'});addObject(atmosphere,numeral,{x:side*(1.2+(i%3)*.3),y:1.48-i*.72,z:-6.6,rotation:(i-1.5)*5,phase:i+8,duration:18+i,drift:.012,priority:3});animated.push(numeral);});
  const dustGeo=new THREE.BufferGeometry(),points=[];for(let i=0;i<24;i++)points.push(((i*47)%101)/25-2,((i*71)%101)/28-1.3,-3.2-(i%5)*.65);dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));atmosphere.add(new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xc5aa76,size:.018,transparent:true,opacity:.38,depthWrite:false})));
  let theme=null;function update(time,delta,{view={yaw:0,pitch:0},camera,theme:nextTheme}={}){const activeTheme=nextTheme||theme||{animationSpeed:1},reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false,motion=reduced?.4:1;animated.forEach(object=>{const u=object.userData,w=Math.PI*2/u.duration*activeTheme.animationSpeed,wave=Math.sin(time*w+u.phase),yaw=THREE.MathUtils.clamp(view.yaw||0,-.42,.42),pitch=THREE.MathUtils.clamp(view.pitch||0,-.32,.32),depthFactor=u.depth==='near'?2.15:u.depth==='far'?.72:1.25;object.position.set(u.base.x-yaw*u.parallax*depthFactor,u.base.y+wave*u.drift*motion-pitch*u.parallax*depthFactor,u.base.z);object.rotation.z=u.baseRotation.z+wave*(.018+(u.priority===1?.009:0))*motion;if(camera&&u.mode===BILLBOARD.Y_AXIS)object.rotation.y=camera.rotation.y;});clocks.forEach((clock,i)=>clock.traverse(object=>{if(object.userData.clockHand)object.rotation.z=object.userData.baseAngle+time*activeTheme.animationSpeed*(object.userData.clockHand==='minute'?.045:.006)+i*.04;}));}
  function responsive(width,height){const aspect=width/Math.max(height,1),spread=aspect>1?1.27:aspect<.62?.9:1;animated.forEach(object=>{if(object.userData.originalX===undefined)object.userData.originalX=object.userData.base?.x;if(object.userData.base&&Math.abs(object.userData.originalX)>.55)object.userData.base.x=object.userData.originalX*spread;});applyResponsivePriority(animated,width,height);}
  return{root,update,setTheme(next){theme=next;applyThemeToRoot(root,next,'world03',{tint:.34});},responsive,reset(){animated.forEach(o=>o.position.copy(o.userData.base));},dispose(){disposeRoot(root);}};
}
