import * as THREE from 'three';
import {createPlayingCard,createRose,createTeaCup,createTeapot} from '../objects.js';
import {applyResponsivePriority,applyThemeToRoot,createDepthLayers,cycleState,disposeRoot,easeInOut} from './composition.js';
import {upgradeWithModel} from './asset-loader.js';
import {WORLD_CONFIGS} from './world-config.js';

export const TEA_PARALLAX=Object.freeze({far:.20,mid:.50,near:.90});
const PARALLAX_RANGE=.22;

function dessert(color=0xc98793){const group=new THREE.Group(),plate=new THREE.Mesh(new THREE.CylinderGeometry(.22,.24,.025,20),new THREE.MeshStandardMaterial({color:0xeee4d3,roughness:.6})),cake=new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,.17,20),new THREE.MeshStandardMaterial({color,roughness:.72}));cake.position.y=.1;group.add(plate,cake);return group;}
export function createWorld04(){
 const root=new THREE.Group(),{background,midground,foreground}=createDepthLayers(root),animated=[],depthObjects=[];root.userData.definition=WORLD_CONFIGS.world04;
 const debugOcclusion=typeof location!=='undefined'&&new URLSearchParams(location.search).get('debugOcclusion')==='1';
 const table=new THREE.Mesh(new THREE.BoxGeometry(4.7,.1,1.15),new THREE.MeshStandardMaterial({color:0xe8ddcc,roughness:.9,transparent:true,opacity:.82}));table.position.set(0,-1.2,-3.25);midground.add(table);
 const pot=new THREE.Group();pot.name='TeaPotPivot';const teaPotGroup=createTeapot();teaPotGroup.rotation.y=Math.PI;pot.add(teaPotGroup);pot.position.set(.45,.48,-3.15);pot.scale.setScalar(.58);pot.userData={base:pot.position.clone(),priority:1,depth:'mid',parallax:TEA_PARALLAX.mid*PARALLAX_RANGE};midground.add(pot);animated.push(pot);depthObjects.push(pot);
 const cup=new THREE.Group();cup.add(createTeaCup());cup.position.set(-.45,-.08,-3.35);cup.scale.setScalar(.65);cup.userData={base:cup.position.clone(),priority:1,depth:'mid',parallax:TEA_PARALLAX.mid*PARALLAX_RANGE};midground.add(cup);animated.push(cup);depthObjects.push(cup);upgradeWithModel(cup,'teacup',{scale:.8});
 [[-.9,.96,-5.8,.68],[.88,.86,-6.2,.62],[-.31,-.55,-1.25,.72],[.31,-.62,-1.05,.68]].forEach(([x,y,z,s],i)=>{const flower=createRose(i%2?0xd6a1aa:0xb97887);flower.position.set(x,y,z);flower.scale.setScalar(s);const depth=i<2?'far':'near';flower.userData={base:flower.position.clone(),priority:i<2?2:1,depth,phase:i,parallax:TEA_PARALLAX[depth]*PARALLAX_RANGE};(depth==='far'?background:foreground).add(flower);depthObjects.push(flower);animated.push(flower);});
 [[-.68,.25,-6.6,'♥','Q',-.38],[.68,.18,-5.5,'♠','A',.3]].forEach(([x,y,z,suit,value,rotation],i)=>{const card=createPlayingCard(suit,value);card.position.set(x,y,z);card.rotation.z=rotation;card.scale.setScalar(.42);card.userData={base:card.position.clone(),baseRotation:rotation,priority:2,depth:'far',phase:i+4,parallax:TEA_PARALLAX.far*PARALLAX_RANGE};background.add(card);depthObjects.push(card);animated.push(card);});
 const debugCard=debugOcclusion?createPlayingCard('♦','T'):null;if(debugCard){debugCard.name='occlusion-debug-card';debugCard.position.set(-1.1,0,-5.2);debugCard.scale.setScalar(.55);debugCard.userData={base:debugCard.position.clone(),priority:1,depth:'far',phase:0,parallax:TEA_PARALLAX.far*PARALLAX_RANGE};background.add(debugCard);}
 [[-.62,-.9,-3.7,0xc98793],[.66,-1.02,-3.45,0xd6b18b]].forEach(([x,y,z,color])=>{const cake=dessert(color);cake.position.set(x,y,z);cake.scale.setScalar(.68);cake.userData={base:cake.position.clone(),priority:2,depth:'mid',phase:6,parallax:TEA_PARALLAX.mid*PARALLAX_RANGE};midground.add(cake);depthObjects.push(cake);animated.push(cake);});
 const drops=[];for(let i=0;i<12;i++){const drop=new THREE.Mesh(new THREE.SphereGeometry(.024,6,5),new THREE.MeshBasicMaterial({color:0xd7ab72,transparent:true,opacity:0,depthWrite:false}));drop.userData.offset=i/12;foreground.add(drop);drops.push(drop);}
 const pourWorld=new THREE.Vector3(),pourLocal=new THREE.Vector3();let theme=null;function update(time,delta,{view={yaw:0,pitch:0},theme:nextTheme}={}){const active=nextTheme||theme||{animationSpeed:1},t=time*active.animationSpeed,state=cycleState(t,10,.4,.7),hero=easeInOut(state.hero),yaw=THREE.MathUtils.clamp(view.yaw||0,-.38,.38),pitch=THREE.MathUtils.clamp(view.pitch||0,-.28,.28),build=state.phase==='build'?easeInOut(state.local):state.phase==='rest'?0:1,recover=state.phase==='recovery'?1-easeInOut(state.local):1,pour=hero*recover;
  depthObjects.forEach((object,i)=>{const u=object.userData,parallax=u.parallax;object.position.x=u.base.x-yaw*parallax;object.position.y=u.base.y-pitch*parallax+Math.sin(t*.32+(u.phase||i))*(u.depth==='near'?.035:.02);});
  if(debugCard)debugCard.position.x=-1.1+((t%6)/6)*2.2;
  pot.position.x-=build*.1;pot.position.y+=build*.12;pot.rotation.z=pour*.48+Math.sin(t*.45)*.012;cup.position.y+=build*.06+hero*.07;cup.rotation.z=Math.sin(t*.6)*.025;
  root.updateMatrixWorld(true);teaPotGroup.userData.pourOrigin.getWorldPosition(pourWorld);pourLocal.copy(pourWorld);foreground.worldToLocal(pourLocal);drops.forEach(drop=>{const p=(state.local*1.8+drop.userData.offset)%1;if(state.phase==='hero'){drop.visible=true;drop.material.opacity=Math.sin(p*Math.PI)*.75;drop.position.set(pourLocal.x+Math.sin(p*Math.PI)*.025,pourLocal.y-p*.72,pourLocal.z);}else{drop.visible=false;drop.material.opacity=0;}});
 }
 function responsive(width,height){const spread=THREE.MathUtils.clamp(width/height/.51,.9,1.45);depthObjects.forEach(object=>{if(object.userData.originalX===undefined)object.userData.originalX=object.userData.base.x;object.userData.base.x=object.userData.originalX*spread;});applyResponsivePriority(animated,width,height);}
 return{root,update,setTheme(next){theme=next;applyThemeToRoot(root,next,'world04',{tint:.25});},responsive,reset(){animated.forEach(o=>o.userData.base&&o.position.copy(o.userData.base));pot.rotation.set(0,0,0);cup.rotation.set(0,0,0);drops.forEach(drop=>{drop.visible=false;drop.material.opacity=0;});},dispose(){disposeRoot(root);}};
}
