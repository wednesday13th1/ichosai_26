import * as THREE from 'three';
import {createChessPiece} from '../objects.js';
import {ChessColors} from '../chess.js';
import {addObject,animateObjects,applyResponsivePriority,BILLBOARD,disposeRoot,paperTexture,plane} from './composition.js';
import {WORLD_CONFIGS} from './world-config.js';

function createPerspectiveFloor(){
  const material=new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,side:THREE.DoubleSide,
    uniforms:{ivory:{value:new THREE.Color(0xe7ddca)},charcoal:{value:new THREE.Color(0x242123)},opacity:{value:.72}},
    vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`varying vec2 vUv; uniform vec3 ivory; uniform vec3 charcoal; uniform float opacity;
      float softEdge(float value,float edge){return smoothstep(0.0,edge,value)*smoothstep(0.0,edge,1.0-value);}
      void main(){vec2 grid=vec2(vUv.x*8.0,vUv.y*15.0);float square=mod(floor(grid.x)+floor(grid.y),2.0);vec3 color=mix(ivory,charcoal,square);float sides=softEdge(vUv.x,.14);float nearFade=smoothstep(0.0,.12,vUv.y);float horizonFade=1.0-smoothstep(.80,1.0,vUv.y);float irregular=.94+.06*sin(vUv.y*38.0+sin(vUv.x*21.0));gl_FragColor=vec4(color,opacity*sides*nearFade*horizonFade*irregular);}`
  });
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(7.6,11.5),material);floor.rotation.x=-Math.PI/2;floor.position.set(0,-1.52,-5.15);return floor;
}

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
  root.userData.definition=WORLD_CONFIGS.world01;root.add(environment,background,midground,foreground,atmosphere);environment.add(createPerspectiveFloor());
  const leftArchitecture=createArchitecture(0x625b52),rightArchitecture=createArchitecture(0x443f3c);leftArchitecture.position.set(-2.35,-.22,-5.8);rightArchitecture.position.set(2.35,-.16,-6.2);rightArchitecture.scale.setScalar(1.08);background.add(leftArchitecture,rightArchitecture);
  addPiece(midground,animated,{type:'rook',color:ChessColors.black,x:-1.72,y:-1.47,z:-2.75,scale:1.72,rotation:.22,priority:1});
  addPiece(midground,animated,{type:'queen',color:ChessColors.white,x:1.7,y:-1.48,z:-3.05,scale:1.62,rotation:-.18,priority:1,phase:2});
  addPiece(background,animated,{type:'king',color:ChessColors.black,x:.92,y:-1.43,z:-5.25,scale:.72,rotation:.16,phase:4});
  addPiece(background,animated,{type:'knight',color:ChessColors.white,x:-1.1,y:-1.44,z:-4.65,scale:.88,rotation:-.42,phase:6});
  const cardMap=paperTexture('card','#342f2c');[[-2.02,.92,-4.6,.42,-12],[2.04,1.05,-5.1,.36,10]].forEach(([x,y,z,s,r],i)=>{const card=plane(cardMap,s,s*1.38,{opacity:.38,mode:BILLBOARD.Y_AXIS,depth:'far'});animated.push(addObject(atmosphere,card,{x,y,z,rotation:r,phase:i+7,duration:19+i*2,drift:.025,priority:3}));});
  function responsive(width,height){const aspect=width/Math.max(height,1),spread=aspect>1?1.28:aspect<.62?.88:1;leftArchitecture.position.x=-2.35*spread;rightArchitecture.position.x=2.35*spread;animated.forEach(object=>{if(object.userData.originalX===undefined)object.userData.originalX=object.userData.base?.x;if(object.userData.base&&Math.abs(object.userData.originalX)>.6)object.userData.base.x=object.userData.originalX*spread;});applyResponsivePriority(animated,width,height);}
  return{root,update(time,delta,{view,camera}={}){animateObjects(animated,time,view,camera);},responsive,reset(){animated.forEach(o=>o.position.copy(o.userData.base));},dispose(){disposeRoot(root);}};
}
