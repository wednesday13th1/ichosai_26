import * as THREE from 'three';
import {createTeaCup,createTeapot} from '../objects.js';
import {addObject,animateObjects,applyResponsivePriority,BILLBOARD,disposeRoot,plane,roseTexture,texture} from './composition.js';
import {WORLD_CONFIGS} from './world-config.js';
const porcelain=()=>new THREE.MeshStandardMaterial({color:0xf6efe4,roughness:.58});
function cake(){const g=new THREE.Group(),base=new THREE.Mesh(new THREE.CylinderGeometry(.24,.26,.2,24),new THREE.MeshStandardMaterial({color:0xd8a6ac,roughness:.76})),icing=new THREE.Mesh(new THREE.CylinderGeometry(.245,.245,.035,24),porcelain());icing.position.y=.115;g.add(base,icing);return g;}
function steamTexture(){return texture(180,360,(x,w,h)=>{x.strokeStyle='rgba(246,239,228,.65)';x.lineWidth=12;x.lineCap='round';x.beginPath();x.moveTo(w*.55,h);x.bezierCurveTo(w*.1,h*.7,w*.9,h*.45,w*.42,0);x.stroke();});}
export function createTeaPartyScene(){
 const root=new THREE.Group(),animated=[],rose=roseTexture('#c98793'),steam=steamTexture();root.userData.definition=WORLD_CONFIGS['tea-party'];
 const table=new THREE.Mesh(new THREE.BoxGeometry(4.8,.14,1.2),new THREE.MeshStandardMaterial({color:0xf6efe4,roughness:.82,transparent:true,opacity:.88}));table.position.set(0,-1.52,-2.8);root.add(table);
 [[-1.7,1.45,-4.5,.72],[1.7,1.55,-4.8,.64],[-1.82,.55,-2.6,1.0],[1.82,.4,-3.1,.92]].forEach(([x,y,z,s],i)=>animated.push(addObject(root,plane(rose,s,s,{opacity:z<-4?.58:.87,mode:BILLBOARD.Y_AXIS,depth:z<-4?'far':'mid'}),{x,y,z,rotation:i%2?6:-7,phase:i,duration:15+i,drift:.07})));
 const cup=createTeaCup();cup.scale.setScalar(1.55);animated.push(addObject(root,cup,{x:1.55,y:-.58,z:-2.1,rotation:5,phase:5,duration:14,drift:.09}));
 const pot=createTeapot();pot.scale.setScalar(1.55);animated.push(addObject(root,pot,{x:-1.48,y:-.94,z:-2.55,rotation:-5,phase:7,duration:17,drift:.06}));
 const dessert=cake();dessert.scale.setScalar(1.3);animated.push(addObject(root,dessert,{x:1.02,y:-1.25,z:-1.55,phase:9,duration:16,drift:.045}));
 for(const [x,y,z,s,p]of[[-1.46,-.22,-2.5,.38,2],[1.55,.15,-3,.32,5]])animated.push(addObject(root,plane(steam,s,s*2,{opacity:.38,mode:BILLBOARD.FULL,depth:'mid'}),{x,y,z,phase:p,duration:12+p,drift:.08}));
 return{root,update(time,delta,{view,camera}={}){animateObjects(animated,time,view,camera);animated.forEach((o,i)=>{if(!o.isMesh&&o.userData.mode!==BILLBOARD.Y_AXIS)o.rotation.y=Math.sin(time*.32+i)*.035;});},responsive(width,height){applyResponsivePriority(animated,width,height);},reset(){animated.forEach(o=>o.position.copy(o.userData.base));},dispose(){disposeRoot(root);}};
}
