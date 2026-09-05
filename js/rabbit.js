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
