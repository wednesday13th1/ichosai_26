import * as THREE from 'three';

export function discoveryPosition(angleDeg,radius,height){
  const angle=THREE.MathUtils.degToRad(angleDeg);
  return new THREE.Vector3(Math.sin(angle)*radius,height,-Math.cos(angle)*radius);
}
