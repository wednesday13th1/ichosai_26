import * as THREE from 'three';

export const DOOR_WIDTH = .55;
export const DOOR_HEIGHT = .86;
const smooth = t => t*t*(3-2*t);

export function createDoor() {
  const root = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({color:0x184d51,roughness:.7});
  const inset = new THREE.MeshStandardMaterial({color:0x10383e,roughness:.8});
  const brass = new THREE.MeshStandardMaterial({color:0xd8b877,metalness:.65,roughness:.38});
  const frame = new THREE.MeshStandardMaterial({color:0xceb589,roughness:.8,emissive:0x795733,emissiveIntensity:.15});
  const box = new THREE.BoxGeometry(1,1,1);
  function block(parent,material,x,y,z,w,h,d){const m=new THREE.Mesh(box,material);m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;}
  for(const x of [-1,1])block(root,frame,x*(DOOR_WIDTH/2+.035),0,0,.07,DOOR_HEIGHT+.12,.09);
  for(const y of [-1,1])block(root,frame,0,y*(DOOR_HEIGHT/2+.03),0,DOOR_WIDTH+.14,.06,.09);
  const hinge=new THREE.Group();hinge.position.set(-DOOR_WIDTH/2,0,.035);root.add(hinge);
  block(hinge,wood,DOOR_WIDTH/2,0,0,DOOR_WIDTH,DOOR_HEIGHT,.035);
  for(const y of [-.22,.18]){
    block(hinge,brass,DOOR_WIDTH/2,y,.023,DOOR_WIDTH-.10,.28,.013);
    block(hinge,inset,DOOR_WIDTH/2,y,.032,DOOR_WIDTH-.12,.255,.014);
  }
  const knob=new THREE.Mesh(new THREE.SphereGeometry(.025,12,8),brass);knob.position.set(DOOR_WIDTH-.075,-.035,.07);hinge.add(knob);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(DOOR_WIDTH+.21,DOOR_HEIGHT+.21),new THREE.MeshBasicMaterial({color:0xdbbf81,transparent:true,opacity:.08,depthWrite:false}));
  glow.position.z=-.055;root.add(glow);
  root.visible=false;
  return {root,
    update(state,age,approach){
      root.visible=!!state;
      const appear=state==='DOOR_APPEARING'?smooth(Math.min(age/1.2,1)):1;
      root.scale.setScalar((.05+.95*appear)*(1+approach*.65));
      const open=state==='DOOR_OPENING'?smooth(Math.min(age/1.2,1)):['PORTAL_VISIBLE','APPROACHING','PORTAL_DISCOVERED'].includes(state)?1:0;
      hinge.rotation.y=-open*Math.PI*.57;
      glow.material.opacity=.06+.08*(1-appear);
    }
  };
}
