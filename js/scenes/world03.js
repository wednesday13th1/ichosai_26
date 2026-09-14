import * as THREE from 'three';
import {createPocketClock} from '../objects.js';
import {addObject,animateObjects,applyResponsivePriority,BILLBOARD,disposeRoot,plane,texture} from './composition.js';
import {WORLD_CONFIGS} from './world-config.js';

function numeralTexture(value){return texture(256,160,(x,w,h)=>{x.fillStyle='#f1e7d2';x.textAlign='center';x.textBaseline='middle';x.font='italic 92px Georgia';x.fillText(value,w/2,h/2);});}
export function createWorld03(){
  const root=new THREE.Group(),animated=[],clocks=[];root.userData.definition=WORLD_CONFIGS.world03;
  const specs=[[-1.72,.62,-3.4,2.15,1,1],[1.7,1.18,-4.8,.82,-1,.25],[1.68,-.65,-2.35,1.42,4,2],[-1.5,-.8,-1.35,.68,.035,3]];
  specs.forEach(([x,y,z,scale,speed,phase],i)=>{const clock=createPocketClock(2+i*2,11+i*7);clock.scale.setScalar(scale);clock.userData.speed=speed;clock.userData.phase=phase;clock.userData.mode=BILLBOARD.Y_AXIS;clock.userData.depth=z<-4?'far':z<-2?'mid':'near';clock.traverse(o=>{if(o.material){o.material.transparent=true;o.material.opacity=z<-4?.58:z<-2?.86:.97;}});addObject(root,clock,{x,y,z,rotation:i%2?6:-8,phase,duration:14+i*2,drift:.055+i*.012,priority:i===0?1:2});animated.push(clock);clocks.push(clock);});
  ['III','VII','IX','XI'].forEach((value,i)=>{const side=i%2?-1:1;animated.push(addObject(root,plane(numeralTexture(value),.78,.48,{opacity:.2,depth:'far'}),{x:side*(1.15+(i%2)*.38),y:1.45-i*.77,z:-5.3,rotation:(i-2)*5,phase:i+5,duration:20+i,drift:.04,priority:3}));});
  const chainMat=new THREE.MeshBasicMaterial({color:0xb08b52,transparent:true,opacity:.42});for(const x of[-1.85,1.86]){const chain=new THREE.Group();for(let i=0;i<13;i++){const link=new THREE.Mesh(new THREE.TorusGeometry(.055,.009,6,12),chainMat);link.position.y=1.7-i*.18;link.rotation.y=i%2?Math.PI/2:0;chain.add(link);}chain.position.set(x,0,-3.8);root.add(chain);}
  return{root,update(time,delta,{view,camera}={}){animateObjects(animated,time,view,camera);clocks.forEach(clock=>clock.children.filter(o=>o.geometry?.type==='PlaneGeometry').forEach((hand,j)=>{hand.rotation.z+=delta*clock.userData.speed*(j?1:.16);}));},responsive(width,height){applyResponsivePriority(animated,width,height);},reset(){animated.forEach(o=>o.position.copy(o.userData.base));},dispose(){disposeRoot(root);}};
}
