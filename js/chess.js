import * as THREE from 'three';

const WHITE=0xe8e0d2,BLACK=0x171416,GOLD=0xb99754;
const materials=new Map();
function material(color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:color===BLACK?.22:.28,metalness:color===BLACK?.08:.05}));return materials.get(color);}
function lathe(points,mat,segments=36){return new THREE.Mesh(new THREE.LatheGeometry(points.map(([x,y])=>new THREE.Vector2(x,y)),segments),mat);}
function baseProfile(){return[[0,0],[.19,0],[.215,.025],[.21,.065],[.18,.09],[.16,.112],[.145,.14],[.108,.17],[.09,.27],[.105,.3],[.085,.325]];}
function crown(root,type,mat){
 if(type==='pawn'){const head=new THREE.Mesh(new THREE.SphereGeometry(.105,28,18),mat);head.position.y=.405;root.add(head);return;}
 if(type==='rook'){const tower=lathe([[.085,.32],[.12,.35],[.135,.43],[.145,.455]],mat);root.add(tower);for(let i=0;i<6;i++){const tooth=new THREE.Mesh(new THREE.BoxGeometry(.065,.07,.07),mat);tooth.position.set(Math.cos(i*Math.PI/3)*.115,.48,Math.sin(i*Math.PI/3)*.115);tooth.rotation.y=-i*Math.PI/3;root.add(tooth);}return;}
 if(type==='knight'){const neck=new THREE.Mesh(new THREE.ExtrudeGeometry(makeKnightShape(),{depth:.11,bevelEnabled:true,bevelSegments:2,bevelSize:.012,bevelThickness:.012}),mat);neck.scale.set(.9,.9,.9);neck.position.set(-.055,.29,-.055);root.add(neck);return;}
 const upper=lathe(type==='queen'?[[.085,.32],[.125,.37],[.095,.405],[.145,.47],[.12,.5]]:[[.085,.32],[.12,.38],[.105,.46],[.075,.5]],mat);root.add(upper);
 if(type==='queen'){for(let i=0;i<8;i++){const pearl=new THREE.Mesh(new THREE.SphereGeometry(.025,12,8),mat);pearl.position.set(Math.cos(i*Math.PI/4)*.12,.525,Math.sin(i*Math.PI/4)*.12);root.add(pearl);}const finial=new THREE.Mesh(new THREE.SphereGeometry(.045,16,10),material(GOLD));finial.position.y=.545;root.add(finial);}
 else{const vertical=new THREE.Mesh(new THREE.BoxGeometry(.045,.16,.045),mat),horizontal=new THREE.Mesh(new THREE.BoxGeometry(.135,.04,.04),mat);vertical.position.y=.575;horizontal.position.y=.59;root.add(vertical,horizontal);}
}
function makeKnightShape(){const s=new THREE.Shape();s.moveTo(.015,0);s.bezierCurveTo(-.02,.08,-.01,.15,.04,.22);s.bezierCurveTo(.09,.29,.04,.36,.12,.43);s.bezierCurveTo(.2,.39,.19,.29,.15,.23);s.lineTo(.22,.19);s.bezierCurveTo(.15,.12,.14,.04,.13,0);s.closePath();return s;}
export function createVictorianChessPiece(type='pawn',color=WHITE){const root=new THREE.Group(),mat=material(color);root.add(lathe(baseProfile(),mat));crown(root,type,mat);root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return root;}
export const ChessColors=Object.freeze({white:WHITE,black:BLACK,gold:GOLD});
