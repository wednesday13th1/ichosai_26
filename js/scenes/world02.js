import * as THREE from 'three';
import {createChessPiece} from '../objects.js';
import {ChessColors} from '../chess.js';
import {addObject,animateObjects,applyResponsivePriority,applyThemeToRoot,BILLBOARD,disposeRoot,paperTexture,plane,roseTexture,texture} from './composition.js';
import {WORLD_CONFIGS} from './world-config.js';

function heartCard(){return texture(320,440,(x,w,h)=>{x.fillStyle='#f2e9de';x.fillRect(0,0,w,h);x.strokeStyle='#4a0010';x.lineWidth=7;x.strokeRect(9,9,w-18,h-18);x.fillStyle='#9a0a24';x.font='60px Georgia';x.fillText('Q',24,66);x.textAlign='center';x.font='130px Georgia';x.fillText('♥',w/2,h/2+45);});}
function drape(){return texture(800,250,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'#2a0a10');g.addColorStop(.25,'#8e1028');g.addColorStop(.5,'#42000e');g.addColorStop(.75,'#9a0a24');g.addColorStop(1,'#2a0a10');x.fillStyle=g;x.beginPath();x.moveTo(0,0);x.lineTo(w,0);for(let i=w;i>=0;i-=80)x.quadraticCurveTo(i-40,h*(i%160?1:.68),i-80,h*.7);x.closePath();x.fill();});}
function crown(){return texture(360,230,(x,w,h)=>{x.fillStyle='#b89a55';x.beginPath();x.moveTo(35,h-30);x.lineTo(20,60);x.lineTo(110,115);x.lineTo(180,25);x.lineTo(250,115);x.lineTo(340,60);x.lineTo(325,h-30);x.closePath();x.fill();x.strokeStyle='#f2e9de';x.lineWidth=4;x.stroke();});}
export function createWorld02(){
 const root=new THREE.Group(),animated=[],rose=roseTexture(),card=heartCard();root.userData.definition=WORLD_CONFIGS.world02;
 root.add(addObject(new THREE.Group(),plane(drape(),5.2,1.5,{opacity:.92,depth:'near'}),{x:0,y:1.9,z:-2.2,phase:1,duration:22,drift:.035}));
 animated.push(addObject(root,plane(crown(),1.18,.76,{opacity:.36,depth:'far'}),{x:1.45,y:.52,z:-5.1,rotation:5,phase:2,duration:18,drift:.05,priority:3}));
 [[-1.72,.6,-2.5,1.22],[1.75,.35,-3.1,1.05],[-1.7,-.75,-1.45,.82]].forEach(([x,y,z,s],i)=>animated.push(addObject(root,plane(rose,s,s,{opacity:z>-2?.98:.88,mode:BILLBOARD.Y_AXIS,depth:z>-2?'near':'mid'}),{x,y,z,rotation:i?8:-6,phase:i+3,duration:13+i*2,drift:.08})));
 [[1.7,-.7,-1.35,.68,8],[-1.55,1.35,-3.4,.46,-7],[1.7,1.3,-4.2,.38,5]].forEach(([x,y,z,s,r],i)=>animated.push(addObject(root,plane(i===2?paperTexture('card','#1e1c1a'):card,s,s*1.38,{opacity:z>-2?.98:.82,depth:z>-2?'near':'mid'}),{x,y,z,rotation:r,phase:i+7,duration:14+i*2,drift:.09})));
 const boardMaterials=[new THREE.MeshStandardMaterial({color:0xeee5d6,roughness:.72}),new THREE.MeshStandardMaterial({color:0x4a0010,roughness:.76})];[[-1.9,-1.02,-2.1],[1.82,-.88,-2.55],[-1.42,-.68,-3.18],[1.34,-.55,-3.72]].forEach(([x,y,z],i)=>{for(let cell=0;cell<2;cell++){const tile=new THREE.Mesh(new THREE.BoxGeometry(.5,.04,.5),boardMaterials[(i+cell)%2]);tile.rotation.set((i-1.5)*.04,(cell?-.1:.08),(cell-.5)*.06);animated.push(addObject(root,tile,{x:x+cell*.42,y:y+cell*.08,z:z-cell*.32,phase:9+i+cell,duration:16+i,drift:.025,priority:1,animation:'fragmented-board'}));}});
 [['queen',ChessColors.white,-1.55,-.53,-3.08,.72],['rook',ChessColors.black,1.7,-.68,-2.5,.68],['knight',ChessColors.white,1.22,-.22,-3.8,.55]].forEach(([type,color,x,y,z,s],i)=>{const piece=createChessPiece(type,color);piece.scale.setScalar(s);animated.push(addObject(root,piece,{x,y,z,phase:14+i,duration:18+i,drift:.018,priority:1,animation:'suspended-piece'}));});
 const points=[],geo=new THREE.BufferGeometry();for(let i=0;i<22;i++)points.push(((i*41)%100)/26-1.9,((i*73)%100)/35-1.15,-1.4-(i%4)*.7);geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));root.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xc72e45,size:.045,transparent:true,opacity:.72})));
 let theme=null;return{root,update(time,delta,{view,camera,theme:nextTheme}={}){animateObjects(animated,time,view,camera,nextTheme||theme);},setTheme(next){theme=next;applyThemeToRoot(root,next,'world02',{tint:.28});},responsive(width,height){applyResponsivePriority(animated,width,height);},reset(){animated.forEach(o=>o.position.copy(o.userData.base));},dispose(){disposeRoot(root);}};
}
