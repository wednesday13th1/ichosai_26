import * as THREE from 'three';
import { createRabbit } from './rabbit.js';
import { animateRabbit } from './scenes.js';

export function createARLayer(container, onContextLost) {
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000,0);
  container.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(40,1,.1,20); camera.position.set(0,0,3.4);
  scene.add(new THREE.HemisphereLight(0xffffff,0x5e7a84,2.5));
  const light=new THREE.DirectionalLight(0xffe4b8,3);light.position.set(-2,4,5);scene.add(light);
  const rabbit=createRabbit();scene.add(rabbit.root);
  let active=false, elapsed=0, previous=0;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  function resize(){const {width,height}=container.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  const lost=(event)=>{event.preventDefault();onContextLost();};renderer.domElement.addEventListener('webglcontextlost',lost);
  renderer.setAnimationLoop((now)=>{
    const delta=previous?Math.min((now-previous)/1000,.05):0;previous=now;
    if(document.hidden)return;
    elapsed+=delta;
    animateRabbit(rabbit,active?elapsed:0,reduced.matches);
    if(!active){rabbit.root.position.set(0,-.7,0);rabbit.root.scale.setScalar(.67);rabbit.root.rotation.y=-.25;camera.position.y=.28;}else{rabbit.root.scale.setScalar(1);camera.position.y=0;}
    renderer.render(scene,camera);
  });
  return {start(){active=true;elapsed=0;},stop(){active=false;},dispose(){renderer.setAnimationLoop(null);observer.disconnect();renderer.domElement.removeEventListener('webglcontextlost',lost);const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);materials.add(o.material);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();}};
}

export function cameraErrorMessage(error){
  switch(error.name){
    case 'NotAllowedError': return 'カメラを許可してください。拒否した場合はブラウザのサイト設定から変更できます。';
    case 'NotFoundError': return 'カメラが見つかりません。カメラ付きのスマートフォンで開いてください。';
    case 'NotReadableError': return 'カメラを使用できません。他のアプリでカメラを閉じて、もう一度お試しください。';
    default:return 'カメラを起動できませんでした。SafariまたはChromeで開き直してください。';
  }
}
