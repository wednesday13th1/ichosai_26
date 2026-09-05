import * as THREE from 'three';

// Replace this factory with a GLTFLoader adapter later; keep the returned rig API.
export function createRabbit() {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const white = new THREE.MeshStandardMaterial({ color: 0xf5eee3, roughness: .82 });
  const pink = new THREE.MeshStandardMaterial({ color: 0xdcb6ad, roughness: .9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x172128, roughness: .3 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc4a665, metalness: .5, roughness: .4 });
  const geometry = new THREE.SphereGeometry(1, 20, 14);
  function part(parent, material, scale, position) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(...scale); mesh.position.set(...position); parent.add(mesh); return mesh;
  }
  part(body, white, [.28,.38,.24], [0,.40,0]);
  part(body, white, [.13,.11,.23], [-.19,.1,.1]);
  part(body, white, [.13,.11,.23], [.19,.1,.1]);
  part(body, white, [.13,.14,.12], [0,.28,-.26]);
  const head = new THREE.Group(); head.position.set(0,.79,.04); body.add(head);
  part(head, white, [.24,.24,.23], [0,0,0]);
  for(const side of [-1,1]) {
    const ear = part(head, white, [.075,.33,.07], [side*.12,.34,-.035]); ear.rotation.z=-side*.14;
    const inner = part(head, pink, [.038,.25,.015], [side*.12,.35,.027]); inner.rotation.z=-side*.14;
    part(head, dark, [.032,.04,.024], [side*.103,.045,.205]);
    part(head, white, [.085,.065,.06], [side*.066,-.09,.20]);
    const arm=part(body,white,[.085,.22,.085],[side*.255,.43,.10]); arm.rotation.z=side*.22;
  }
  part(head,pink,[.032,.024,.023],[0,-.065,.259]);
  part(body,gold,[.072,.072,.022],[.13,.44,.235]);
  return { root, head };
}

export function animateRabbit(rig, chase, reducedMotion) {
  const { state, age, foundAge } = chase;
  const appearing = state === 'APPEAR' || state === 'REAPPEAR';
  const progress = appearing ? Math.min(age/.7,1) : 1;
  const scale = .2 + .8*(1-(1-progress)**3);
  rig.root.visible=chase.visible;
  rig.root.scale.setScalar(scale*.65);
  const hop = reducedMotion ? 0 : state==='RUN' ? Math.abs(Math.sin(age*11))*.10 : appearing ? Math.sin(progress*Math.PI)*.14 : foundAge<.5 ? Math.sin(foundAge/.5*Math.PI)*.15 : Math.sin(age*2)*.018;
  rig.root.position.y=-.43+hop;
  rig.root.rotation.y=state==='RUN' ? -.65 : Math.sin(age*1.8)*.16;
  rig.head.rotation.y=state==='WAIT' ? Math.sin(age*2.2)*.28 : 0;
  rig.head.rotation.x=state==='WAIT' ? Math.max(0,Math.sin(age*3))*.25 : 0;
}

export function animateDoorRabbit(rig,pose,reduced){
  const {state,age}=pose;
  rig.head.rotation.set(0,0,0);
  rig.root.visible=state==='DOOR_APPEARING'||state==='RABBIT_ENTERING';
  if(!rig.root.visible)return;
  rig.root.position.set(0,-.43,0);rig.root.scale.setScalar(.65);
  if(state==='DOOR_APPEARING'){rig.root.rotation.y=-.4;return;}
  // Look at the door, look back, run, pause on the threshold, enter.
  if(age<1){rig.head.rotation.y=age<.5?-.6:.35;return;}
  const travel=Math.min((age-1)/1.3,1);const eased=travel*travel*(3-2*travel);
  const entering=Math.max(0,Math.min((age-2.7)/.9,1));
  rig.root.position.set(.12*eased,-.43-.18*eased+(reduced?0:Math.sin(travel*Math.PI*5)**2*.025),-.42*eased-.14*entering);
  rig.root.scale.setScalar((.65-.37*eased)*(1-entering));
  rig.root.rotation.y=age<2.3?Math.PI*.85:age<2.7?0:Math.PI;
}
