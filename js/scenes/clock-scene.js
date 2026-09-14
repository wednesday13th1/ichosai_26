import * as THREE from 'three';
import {createPocketClock} from '../objects.js';
import {addObject,animateObjects,applyResponsivePriority,BILLBOARD,disposeRoot,paperTexture,plane,texture} from './composition.js';
import {WORLD_CONFIGS} from './world-config.js';

function checkerTexture(){return texture(512,512,(x,w)=>{const s=w/8;for(let r=0;r<8;r++)for(let c=0;c<8;c++){x.fillStyle=(r+c)%2?'#1e1c1a':'#f2ebdd';x.fillRect(c*s,r*s,s,s);}});}
function frameTexture(){return texture(320,420,(x,w,h)=>{x.strokeStyle='#9b948a';x.lineWidth=24;x.strokeRect(18,18,w-36,h-36);x.strokeStyle='rgba(242,235,221,.65)';x.lineWidth=3;x.strokeRect(38,38,w-76,h-76);});}
export function createClockScene(){
  const root=new THREE.Group(),animated=[];root.userData.definition=WORLD_CONFIGS.clock;
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(6.4,5.2),new THREE.MeshBasicMaterial({map:checkerTexture(),transparent:true,opacity:.52,side:THREE.DoubleSide,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.set(0,-1.65,-3.9);root.add(floor);
  const pageMap=paperTexture('page'),cardMap=paperTexture('card'),frameMap=frameTexture();
  [[-1.72,1.45,-4.8,.42,.58,-8],[1.55,1.62,-5.1,.38,.55,7]].forEach(([x,y,z,w,o,r],i)=>animated.push(addObject(root,plane(pageMap,w,w*1.35,{opacity:o,depth:'far'}),{x,y,z,rotation:r,phase:i,duration:16+i*2,drift:.07,priority:3})));
  animated.push(addObject(root,plane(frameMap,.85,1.12,{opacity:.72,mode:BILLBOARD.Y_AXIS,depth:'mid'}),{x:-1.7,y:.86,z:-3.8,rotation:4,phase:2,duration:19,drift:.06,priority:2}));
  const clock=createPocketClock(10,8);clock.scale.setScalar(1.75);clock.userData.mode=BILLBOARD.Y_AXIS;clock.userData.depth='mid';clock.traverse(o=>{if(o.material){o.material.transparent=true;o.material.opacity=.92;}});animated.push(addObject(root,clock,{x:1.72,y:.48,z:-3.1,rotation:-7,phase:3,duration:15,drift:.08,priority:1}));
  [[-1.72,.55,-2.8,.48,.84,18],[-1.72,-.58,-1.6,.62,.96,-7],[1.62,-.72,-1.45,.7,.97,-11]].forEach(([x,y,z,w,o,r],i)=>animated.push(addObject(root,plane(cardMap,w,w*1.39,{opacity:o,depth:z>-2?'near':'mid'}),{x,y,z,rotation:r,phase:i+4,duration:12+i*2,drift:.1,priority:i?2:3})));
  const particles=new THREE.BufferGeometry(),positions=[];for(let i=0;i<18;i++)positions.push(((i*43)%100)/25-2,((i*67)%100)/28-1.2,-2.5-(i%4)*.6);particles.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));root.add(new THREE.Points(particles,new THREE.PointsMaterial({color:0xa6b7c2,size:.025,transparent:true,opacity:.42})));
  return{root,update(time,delta,{view,camera}={}){animateObjects(animated,time,view,camera);},responsive(width,height){applyResponsivePriority(animated,width,height);},reset(){animated.forEach(o=>o.position.copy(o.userData.base));},dispose(){disposeRoot(root);}};
}
