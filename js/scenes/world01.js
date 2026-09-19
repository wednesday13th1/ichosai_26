import * as THREE from 'three';
import {createChessPiece} from '../objects.js';
import {ChessColors} from '../chess.js';
import {addObject,animateObjects,applyResponsivePriority,applyThemeToRoot,BILLBOARD,disposeRoot,paperTexture,plane} from './composition.js';
import {WORLD_CONFIGS} from './world-config.js';

function createFloatingBoard(animated){const group=new THREE.Group(),ivory=new THREE.MeshStandardMaterial({color:0xe7ddca,roughness:.76,transparent:true,opacity:.76}),ink=new THREE.MeshStandardMaterial({color:0x242123,roughness:.82,transparent:true,opacity:.7});const cells=[[-1.82,-1.3,-2.35,0],[-1.34,-1.22,-2.55,1],[-1.78,-.98,-3.05,1],[-1.28,-.91,-3.28,0],[1.34,-1.25,-2.65,1],[1.83,-1.14,-2.88,0],[1.31,-.88,-3.42,0],[1.82,-.78,-3.7,1],[-.7,-1.12,-5.15,0],[.72,-1.02,-5.4,1]];cells.forEach(([x,y,z,dark],i)=>{const tile=new THREE.Mesh(new THREE.BoxGeometry(.48,.045,.48),dark?ink:ivory);tile.rotation.set((i%3-1)*.05,(i%2?.08:-.06),(i%4-1.5)*.025);animated.push(addObject(group,tile,{x,y,z,phase:i*.7,duration:15+i*.35,drift:.018,priority:i>7?3:1,animation:'floating-fragment'}));});return group;}

function createArchitecture(color){
  const group=new THREE.Group(),stone=new THREE.MeshStandardMaterial({color,roughness:.88,transparent:true,opacity:.52});
  const column=new THREE.Mesh(new THREE.CylinderGeometry(.16,.22,2.8,10),stone),capital=new THREE.Mesh(new THREE.BoxGeometry(.52,.13,.38),stone),arch=new THREE.Mesh(new THREE.TorusGeometry(.62,.095,8,24,Math.PI),stone);
  capital.position.y=1.38;arch.position.set(0,1.15,0);arch.rotation.z=Math.PI;group.add(column,capital,arch);return group;
}

function addPiece(group,animated,{type,color,x,y,z,scale,rotation=0,priority=2,phase=0}){
  const piece=createChessPiece(type,color);piece.scale.set(scale*.82,scale*1.2,scale*.82);piece.rotation.y=rotation;
  addObject(group,piece,{x,y,z,phase,duration:18+phase,drift:.012,priority,animation:'still'});animated.push(piece);return piece;
}

export function createWorld01(){
  const root=new THREE.Group(),environment=new THREE.Group(),background=new THREE.Group(),midground=new THREE.Group(),foreground=new THREE.Group(),atmosphere=new THREE.Group(),animated=[];
  root.userData.definition=WORLD_CONFIGS.world01;root.add(environment,background,midground,foreground,atmosphere);environment.add(createFloatingBoard(animated));
  const leftArchitecture=createArchitecture(0x625b52),rightArchitecture=createArchitecture(0x443f3c);leftArchitecture.position.set(-2.35,-.22,-5.8);rightArchitecture.position.set(2.35,-.16,-6.2);rightArchitecture.scale.setScalar(1.08);background.add(leftArchitecture,rightArchitecture);
  addPiece(midground,animated,{type:'rook',color:ChessColors.black,x:-1.72,y:-1.12,z:-2.75,scale:1.72,rotation:.22,priority:1});
  addPiece(midground,animated,{type:'queen',color:ChessColors.white,x:1.7,y:-1.08,z:-3.05,scale:1.62,rotation:-.18,priority:1,phase:2});
  addPiece(background,animated,{type:'king',color:ChessColors.black,x:.92,y:-.98,z:-5.25,scale:.72,rotation:.16,phase:4});
  addPiece(background,animated,{type:'knight',color:ChessColors.white,x:-1.1,y:-.96,z:-4.65,scale:.88,rotation:-.42,phase:6});
  const cardMap=paperTexture('card','#342f2c');[[-2.02,.92,-4.6,.42,-12],[2.04,1.05,-5.1,.36,10]].forEach(([x,y,z,s,r],i)=>{const card=plane(cardMap,s,s*1.38,{opacity:.38,mode:BILLBOARD.Y_AXIS,depth:'far'});animated.push(addObject(atmosphere,card,{x,y,z,rotation:r,phase:i+7,duration:19+i*2,drift:.025,priority:3}));});
  function responsive(width,height){const aspect=width/Math.max(height,1),spread=aspect>1?1.28:aspect<.62?.88:1;leftArchitecture.position.x=-2.35*spread;rightArchitecture.position.x=2.35*spread;animated.forEach(object=>{if(object.userData.originalX===undefined)object.userData.originalX=object.userData.base?.x;if(object.userData.base&&Math.abs(object.userData.originalX)>.6)object.userData.base.x=object.userData.originalX*spread;});applyResponsivePriority(animated,width,height);}
  let theme=null;return{root,update(time,delta,{view,camera,theme:nextTheme}={}){animateObjects(animated,time,view,camera,nextTheme||theme);},setTheme(next){theme=next;applyThemeToRoot(root,next,'world01',{tint:.19});},responsive,reset(){animated.forEach(o=>o.position.copy(o.userData.base));},dispose(){disposeRoot(root);}};
}
