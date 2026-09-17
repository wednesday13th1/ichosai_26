import * as THREE from 'three';
import {createTeaCup,createTeapot} from '../objects.js';
import {addObject,animateObjects,applyResponsivePriority,BILLBOARD,disposeRoot,plane,texture} from './composition.js';
import {WORLD_CONFIGS} from './world-config.js';

const material=(color,roughness=.72)=>new THREE.MeshStandardMaterial({color,roughness});
function createDessert(kind=0){
  const group=new THREE.Group(),plateMat=material(0xeee4d3,.48),gold=material(0xb28b53,.38),plate=new THREE.Mesh(new THREE.CylinderGeometry(.22,.24,.025,20),plateMat);group.add(plate);
  if(kind===0){const cake=new THREE.Mesh(new THREE.CylinderGeometry(.15,.16,.17,20),material(0xc98c99)),icing=new THREE.Mesh(new THREE.CylinderGeometry(.155,.155,.035,20),material(0xf0dfcf));cake.position.y=.1;icing.position.y=.2;group.add(cake,icing);}
  else if(kind===1){for(let i=0;i<3;i++){const shell=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.045,16),material([0xbb7180,0xd6b18b,0xc8919d][i]));shell.rotation.z=Math.PI/2;shell.position.set((i-1)*.12,.07+(i%2)*.05,0);group.add(shell);}}
  else{const stem=new THREE.Mesh(new THREE.CylinderGeometry(.018,.025,.18,10),gold),top=new THREE.Mesh(new THREE.CylinderGeometry(.16,.18,.025,20),plateMat),tart=new THREE.Mesh(new THREE.CylinderGeometry(.1,.11,.08,18),material(0xb66c67));stem.position.y=.1;top.position.y=.2;tart.position.y=.255;group.add(stem,top,tart);}
  return group;
}
function createFloralCluster(){
  const group=new THREE.Group(),leafMat=material(0x52654d,.8),roseMats=[material(0xb97887,.7),material(0xd4a4aa,.72),material(0xeee0d3,.76)];
  for(let i=0;i<3;i++){const rose=new THREE.Mesh(new THREE.SphereGeometry(.13-i*.018,10,7),roseMats[i]);rose.scale.set(1,.7,1);rose.position.set((i-1)*.17,(i%2)*.13,0);group.add(rose);for(let p=0;p<5;p++){const petal=new THREE.Mesh(new THREE.SphereGeometry(.07,8,5),roseMats[i]);const a=p*Math.PI*2/5;petal.scale.set(1.35,.48,.72);petal.position.set(rose.position.x+Math.cos(a)*.09,rose.position.y+Math.sin(a)*.07,.035);petal.rotation.z=a;group.add(petal);}}
  for(const [x,y,r] of [[-.3,-.04,-.7],[.3,.02,.65],[-.12,.23,.15],[.15,-.16,-.25]]){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.095,8,5),leafMat);leaf.scale.set(1.7,.42,.45);leaf.position.set(x,y,-.03);leaf.rotation.z=r;group.add(leaf);}return group;
}
function createTableInstallation(){
  const group=new THREE.Group(),cloth=material(0xe8ddcc,.92),wood=material(0x5b3b30,.78),top=new THREE.Mesh(new THREE.CylinderGeometry(1.78,1.9,.12,32),cloth),skirt=new THREE.Mesh(new THREE.CylinderGeometry(1.72,1.45,.82,32,1,true,0,Math.PI),cloth),edge=new THREE.Mesh(new THREE.TorusGeometry(1.75,.035,7,32,Math.PI),material(0xc8b8a3,.82)),leg=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,.95,14),wood);
  top.scale.z=.45;top.position.y=.02;skirt.scale.z=.43;skirt.rotation.y=Math.PI/2;skirt.position.set(0,-.39,.03);edge.scale.z=.44;edge.rotation.set(Math.PI/2,0,0);edge.position.set(0,-.025,.18);leg.position.y=-.53;group.add(top,skirt,edge,leg);
  const pot=createTeapot();pot.scale.setScalar(1.36);pot.position.set(-.63,.33,.03);pot.rotation.y=.2;group.add(pot);
  [[-.05,.21,.02,.88],[.48,.22,-.01,.84],[.92,.2,.02,.76],[-1.05,.2,.04,.72]].forEach(([x,y,z,s],i)=>{const cup=createTeaCup(i);cup.scale.setScalar(s);cup.position.set(x,y,z);cup.rotation.y=(i-1.5)*.22;group.add(cup);});
  [createDessert(0),createDessert(1),createDessert(2)].forEach((dessert,i)=>{dessert.scale.setScalar(.8);dessert.position.set([.18,.72,-.92][i],.16,[.08,.03,.02][i]);group.add(dessert);});return group;
}

export function createWorld04(){
  const root=new THREE.Group(),environment=new THREE.Group(),background=new THREE.Group(),midground=new THREE.Group(),foreground=new THREE.Group(),atmosphere=new THREE.Group(),animated=[];
  root.userData.definition=WORLD_CONFIGS.world04;root.add(environment,background,midground,foreground,atmosphere);
  const tableInstallation=createTableInstallation();tableInstallation.position.set(0,-1.16,-3.05);tableInstallation.scale.setScalar(1.02);midground.add(tableInstallation);
  const cluster=createFloralCluster(),leftFrame=new THREE.Group(),rightFrame=new THREE.Group(),upperFrame=new THREE.Group();
  [[-.18,-.95,1.25],[-.08,-.35,1.05],[-.16,.32,.9],[-.08,.93,.72]].forEach(([x,y,s],i)=>{const flower=cluster.clone(true);flower.position.set(x,y,-.08*i);flower.scale.setScalar(s);flower.rotation.z=-.2+i*.13;leftFrame.add(flower);});
  [[.18,-.9,1.18],[.08,-.27,1.0],[.16,.38,.88],[.06,.98,.68]].forEach(([x,y,s],i)=>{const flower=cluster.clone(true);flower.position.set(x,y,-.08*i);flower.scale.setScalar(s);flower.rotation.z=.18-i*.12;rightFrame.add(flower);});
  for(let i=0;i<3;i++){const flower=cluster.clone(true);flower.position.set((i-1)*.62,0,-.12*i);flower.scale.setScalar(.62-i*.05);upperFrame.add(flower);}
  leftFrame.position.set(-2,.25,-2.7);rightFrame.position.set(2,.22,-2.9);upperFrame.position.set(0,1.72,-4.8);foreground.add(leftFrame,rightFrame);background.add(upperFrame);
  [[-1.55,.92,-3.1,.88,-.2],[1.62,1.13,-3.35,.78,.24],[2,.3,-2.75,.62,-.16]].forEach(([x,y,z,s,r],i)=>{const cup=createTeaCup(i);cup.scale.setScalar(s);cup.rotation.y=r;cup.userData.mode=BILLBOARD.Y_AXIS;animated.push(addObject(atmosphere,cup,{x,y,z,phase:i*2.1,duration:6.2+i*1.25,drift:.032+i*.005,priority:i===2?3:2,animation:'gentle-float'}));});
  const hazeMap=texture(256,256,(x,w,h)=>{const g=x.createRadialGradient(w/2,h/2,10,w/2,h/2,w/2);g.addColorStop(0,'rgba(255,235,220,.16)');g.addColorStop(1,'rgba(255,235,220,0)');x.fillStyle=g;x.fillRect(0,0,w,h);});const haze=plane(hazeMap,4.8,3.8,{opacity:.36,depth:'far'});haze.position.set(0,.15,-6.8);atmosphere.add(haze);
  function responsive(width,height){const aspect=width/Math.max(height,1),spread=aspect>1?1.3:aspect<.62?.9:1;leftFrame.position.x=-2*spread;rightFrame.position.x=2*spread;tableInstallation.scale.x=aspect>1?1.13:aspect<.62?.94:1.02;animated.forEach(object=>{if(object.userData.originalX===undefined)object.userData.originalX=object.userData.base?.x;if(object.userData.base)object.userData.base.x=object.userData.originalX*spread;});applyResponsivePriority(animated,width,height);}
  return{root,update(time,delta,{view,camera}={}){animateObjects(animated,time,view,camera);leftFrame.rotation.z=Math.sin(time*.42)*.008;rightFrame.rotation.z=-Math.sin(time*.38)*.008;},responsive,reset(){animated.forEach(o=>o.position.copy(o.userData.base));},dispose(){disposeRoot(root);}};
}
