import * as THREE from 'three';
import {createChessPiece} from '../objects.js';
import {ChessColors} from '../chess.js';
import {applyResponsivePriority,applyThemeToRoot,createDepthLayers,createVisitVariation,disposeRoot,microMotion,motionPreference,texture} from './composition.js';
import {WORLD_CONFIGS} from './world-config.js';

function checkerTexture(){return texture(768,512,(x,w,h)=>{x.fillStyle='#e8e0d2';x.fillRect(0,0,w,h);const cols=10,rows=8,cw=w/cols,rh=h/rows;for(let row=0;row<rows;row++)for(let col=0;col<cols;col++)if((row+col)%2===0){x.fillStyle='#171416';x.fillRect(col*cw,row*rh,cw+.5,rh+.5);}x.strokeStyle='rgba(185,151,84,.55)';x.lineWidth=5;x.strokeRect(3,3,w-6,h-6);});}
function opRing(radius,color,opacity){const material=new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide});return new THREE.Mesh(new THREE.RingGeometry(radius*.82,radius,64),material);}

export function createWorld03(){
 const root=new THREE.Group(),{background,midground,foreground}=createDepthLayers(root),animated=[],pieces=[],rings=[],visit=createVisitVariation(3),motion=motionPreference();root.userData.definition=WORLD_CONFIGS.world03;
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(4.6,2.1,10,8),new THREE.MeshStandardMaterial({map:checkerTexture(),color:0xffffff,roughness:.88,metalness:0,transparent:true,opacity:.82,side:THREE.DoubleSide}));floor.name='ChessFloor';floor.position.set(0,-1.42,-4.25);floor.rotation.x=-1.08;floor.userData={base:floor.position.clone(),priority:1,depth:'far',phase:Math.random()*Math.PI*2};background.add(floor);
 [[-1.36,.72,-6.1,.58,ChessColors.white,.14],[1.42,.64,-6.3,.48,ChessColors.black,-.1]].forEach(([x,y,z,s,color,rotation],i)=>{const ring=opRing(s,color,i?.11:.14);ring.position.set(x,y,z);ring.rotation.z=rotation;ring.userData={base:ring.position.clone(),baseRotation:rotation,phase:Math.random()*Math.PI*2,priority:2,depth:'far'};background.add(ring);rings.push(ring);animated.push(ring);});
 const pieceData=[[-.72,-.7,-3.25,.82,'queen',ChessColors.white,'mid'],[.72,-.72,-3.45,.78,'king',ChessColors.black,'mid'],[-.5,-.98,-2.15,.62,'knight',ChessColors.black,'near'],[.5,-1.02,-2.3,.58,'rook',ChessColors.white,'near']];
 pieceData.forEach(([x,y,z,s,type,color,depth],i)=>{const piece=createChessPiece(type,color);piece.position.set(x,y,z);piece.scale.setScalar(s);piece.userData={base:piece.position.clone(),baseScale:s,phase:Math.random()*Math.PI*2,priority:i>1?2:1,depth,float:i===0||i===3};(depth==='near'?foreground:midground).add(piece);pieces.push(piece);animated.push(piece);});
 let theme=null;
 function update(time,delta,{view={yaw:0,pitch:0},theme:nextTheme}={}){const active=nextTheme||theme||{animationSpeed:1},elapsed=visit.elapsed(time),t=elapsed*active.animationSpeed,yaw=THREE.MathUtils.clamp(view.yaw||0,-.38,.38),pitch=THREE.MathUtils.clamp(view.pitch||0,-.28,.28),variant=visit.variant;
  const floorMotion=microMotion(t,{phase:floor.userData.phase,duration:9,float:0,rotate:motion.reduced?0:.008,scale:motion.reduced?0:.008});floor.rotation.z=floorMotion.rotation;floor.material.opacity=.8+(variant===2?.06:0);floor.position.y=floor.userData.base.y-pitch*.035;
  rings.forEach((ring,i)=>{const m=microMotion(t,{phase:ring.userData.phase,duration:8+i*1.7,float:.018*motion.scale,rotate:.012*motion.scale,scale:.012*motion.scale});ring.position.set(ring.userData.base.x-yaw*.035,ring.userData.base.y+m.y-pitch*.025,ring.userData.base.z);ring.rotation.z=ring.userData.baseRotation+m.rotation;ring.scale.setScalar(variant===0?m.scale:1);ring.material.opacity=(i?.1:.13)+(variant===0?.055:0);});
  pieces.forEach((piece,i)=>{const u=piece.userData,m=microMotion(t,{phase:u.phase,duration:5.2+i*.8,float:u.float?.045*motion.scale:.012*motion.scale,rotate:.018*motion.scale,scale:.006*motion.scale});piece.position.set(u.base.x-yaw*(u.depth==='near'?.16:.08),u.base.y+m.y-pitch*(u.depth==='near'?.11:.065),u.base.z);piece.rotation.z=m.rotation*(i%2?-1:1);piece.scale.setScalar(u.baseScale*(variant===1?m.scale:1));});
 }
 function responsive(width,height){const aspect=width/Math.max(height,1),spread=aspect>1?1.18:aspect<.62?.9:1;floor.userData.base.y=aspect>1?-1.65:-1.42;pieces.forEach(piece=>{if(piece.userData.originalX===undefined)piece.userData.originalX=piece.userData.base.x;piece.userData.base.x=piece.userData.originalX*spread;});applyResponsivePriority(animated,width,height);}
 return{root,update,setTheme(next){theme=next;applyThemeToRoot(root,next,'world03',{tint:.18});},responsive,reset(){visit.reset();animated.forEach(o=>o.userData.base&&o.position.copy(o.userData.base));},dispose(){disposeRoot(root);}};
}
