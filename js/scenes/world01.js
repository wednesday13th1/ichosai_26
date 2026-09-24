import * as THREE from 'three';
import {createPocketClock} from '../objects.js';
import {applyResponsivePriority,applyThemeToRoot,createDepthLayers,createVisitVariation,disposeRoot,microMotion,motionPreference} from './composition.js';
import {discoveryPosition} from './discovery-ring.js';

export function createWorld01(){
 const root=new THREE.Group(),animated=[],visit=createVisitVariation(3),motion=motionPreference(),{background,midground,foreground}=createDepthLayers(root);root.name='ClockWorldRoot';root.userData.objectCount=24;
 const heights=[.75,-.25,.28,-.62,.48,-.1,.68,-.42];
 for(let sector=0;sector<8;sector++)for(let slot=0;slot<3;slot++){
  const angle=sector*45+(slot-1)*12,radius=2.35+slot*.48+(sector%2)*.12,clock=createPocketClock((sector*3+slot*2)%12,(sector*11+slot*17)%60),holder=new THREE.Group(),scale=.42+slot*.1+(sector%3)*.025;
  holder.name=`Clock-${sector}-${slot}`;holder.add(clock);holder.position.copy(discoveryPosition(angle,radius,heights[sector]+(slot-1)*.28));holder.rotation.set((slot-1)*.08,THREE.MathUtils.degToRad(angle),slot%2?.08:-.06);holder.scale.setScalar(scale);
  const hands=[];clock.traverse(child=>{if(child.userData.clockHand)hands.push(child);});holder.userData={base:holder.position.clone(),baseRotation:holder.rotation.clone(),baseScale:scale,phase:sector*.79+slot*1.13,priority:slot===2?3:2,depth:slot===0?'near':slot===2?'far':'mid',hands,hero:slot===0};
  (slot===0?foreground:slot===2?background:midground).add(holder);animated.push(holder);
 }
 let theme=null;function update(time,delta,{theme:nextTheme}={}){const active=nextTheme||theme||{animationSpeed:1},t=visit.elapsed(time)*active.animationSpeed;animated.forEach((object,i)=>{const u=object.userData,m=microMotion(t,{phase:u.phase,duration:4.4+i%4*.65,float:(u.hero?.28:.2)*motion.scale,rotate:(u.hero?.2:.14)*motion.scale,scale:(u.hero?.18:.14)*motion.scale}),heroPulse=u.hero?Math.max(0,Math.sin(t*.62+u.phase))*.28:0;object.position.y=u.base.y+m.y;object.position.z=u.base.z+heroPulse*.32;object.position.x=u.base.x+Math.cos(t*.42+u.phase)*.07*motion.scale;object.rotation.x=u.baseRotation.x+m.rotation*.45;object.rotation.y=u.baseRotation.y+Math.sin(t*.25+u.phase)*.14*motion.scale;object.rotation.z=u.baseRotation.z+m.rotation;object.scale.setScalar(u.baseScale*(m.scale+heroPulse));u.hands.forEach((hand,index)=>hand.rotation.z=hand.userData.baseAngle+t*(index?.22:.055)*(index?-1:1)*(1+(i%3)*.12));});}
 function responsive(width,height){applyResponsivePriority(animated,width,height);}
 return{root,update,setTheme(next){theme=next;applyThemeToRoot(root,next,'world01',{tint:.16});},responsive,reset(){visit.reset();animated.forEach(object=>{object.position.copy(object.userData.base);object.rotation.copy(object.userData.baseRotation);object.scale.setScalar(object.userData.baseScale);object.userData.hands.forEach(hand=>{hand.position.set(0,0,.032);hand.rotation.set(0,0,hand.userData.baseAngle);});});},dispose(){disposeRoot(root);}};
}
