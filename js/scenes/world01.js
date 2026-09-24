import * as THREE from 'three';
import {createPocketClock} from '../objects.js';
import {applyResponsivePriority,applyThemeToRoot,createDepthLayers,createVisitVariation,disposeRoot,microMotion,motionPreference} from './composition.js';
import {discoveryPosition} from './discovery-ring.js';

export function createWorld01(){
 const root=new THREE.Group(),animated=[],visit=createVisitVariation(3),motion=motionPreference(),{background,midground,foreground}=createDepthLayers(root);root.name='ClockWorldRoot';root.userData.objectCount=22;
 const heights=[.75,-.25,.28,-.62,.48,-.1,.68,-.42];
 for(let sector=0;sector<8;sector++)for(let slot=0;slot<(sector<6?3:2);slot++){
  const angle=sector*45+(slot-1)*12,radius=2.35+slot*.48+(sector%2)*.12,clock=createPocketClock((sector*3+slot*2)%12,(sector*11+slot*17)%60),holder=new THREE.Group(),scale=.42+slot*.1+(sector%3)*.025;
  holder.name=`Clock-${sector}-${slot}`;holder.add(clock);holder.position.copy(discoveryPosition(angle,radius,heights[sector]+(slot-1)*.28));holder.rotation.set((slot-1)*.08,THREE.MathUtils.degToRad(angle),slot%2?.08:-.06);holder.scale.setScalar(scale);
  holder.userData={base:holder.position.clone(),baseRotation:holder.rotation.clone(),baseScale:scale,phase:sector*.79+slot*1.13,priority:slot===2?3:2,depth:slot===0?'near':slot===2?'far':'mid',hands:clock.children.filter(child=>child.userData.clockHand)};
  (slot===0?foreground:slot===2?background:midground).add(holder);animated.push(holder);
 }
 let theme=null;function update(time,delta,{theme:nextTheme}={}){const active=nextTheme||theme||{animationSpeed:1},t=visit.elapsed(time)*active.animationSpeed;animated.forEach((object,i)=>{const u=object.userData,m=microMotion(t,{phase:u.phase,duration:6.5+i%5,float:.035*motion.scale,rotate:.025*motion.scale,scale:.022*motion.scale});object.position.y=u.base.y+m.y;object.position.x=u.base.x+Math.cos(t*.31+u.phase)*.018*motion.scale;object.rotation.x=u.baseRotation.x+m.rotation*.35;object.rotation.y=u.baseRotation.y+t*(i%2?-.018:.014)*motion.scale;object.rotation.z=u.baseRotation.z+m.rotation;object.scale.setScalar(u.baseScale*m.scale);u.hands.forEach((hand,index)=>hand.rotation.z=hand.userData.baseAngle+t*(index?.05:.14)*(index?-1:1));});}
 function responsive(width,height){applyResponsivePriority(animated,width,height);}
 return{root,update,setTheme(next){theme=next;applyThemeToRoot(root,next,'world01',{tint:.16});},responsive,reset(){visit.reset();animated.forEach(object=>{object.position.copy(object.userData.base);object.rotation.copy(object.userData.baseRotation);object.scale.setScalar(object.userData.baseScale);object.userData.hands.forEach(hand=>{hand.position.set(0,0,.032);hand.rotation.set(0,0,hand.userData.baseAngle);});});},dispose(){disposeRoot(root);}};
}
