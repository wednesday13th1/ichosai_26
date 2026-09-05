import * as THREE from 'three';
import { createRabbit, animateRabbit, animateDoorRabbit } from './rabbit.js';
import { createChase, createPortalStory } from './scenes.js';
import { createDoor } from './door.js';
import { createPortal } from './portal.js';
import { isRabbitCentered, createApproachTracker } from './interaction.js';

export function createARLayer(container, onContextLost, interaction, onProgress = () => {}) {
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000,0);
  container.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(40,1,.1,20);
  camera.rotation.order='YXZ';
  scene.add(new THREE.HemisphereLight(0xffffff,0x5e7a84,2.5));
  const light=new THREE.DirectionalLight(0xffe4b8,3);light.position.set(-2,4,5);scene.add(light);
  const rabbit=createRabbit();
  const anchor=new THREE.Group();anchor.add(rabbit.root);scene.add(anchor);
  const projected=new THREE.Vector3();
  let active=false, previous=0, lastMessage='', lastState='', elapsed=0;
  const chase=createChase();
  const story=createPortalStory();
  const approach=createApproachTracker();
  let door=null,portal=null,portalPose=null;
  const portalProjected=new THREE.Vector3();
  function ensureDoor(){
    if(door)return;
    door=createDoor();door.root.position.set(.12,-.20,-.5);anchor.add(door.root);
    portal=createPortal(renderer);door.root.add(portal.surface);
  }
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  function resize(){const {width,height}=container.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  const lost=(event)=>{event.preventDefault();onContextLost();};renderer.domElement.addEventListener('webglcontextlost',lost);
  function place(pose){
    const distance=3.4;
    anchor.position.set(-Math.sin(pose.yaw)*Math.cos(pose.pitch)*distance,Math.sin(pose.pitch)*distance,-Math.cos(pose.yaw)*Math.cos(pose.pitch)*distance);
    anchor.rotation.y=pose.yaw;
  }
  renderer.setAnimationLoop((now)=>{
    const delta=previous?Math.min((now-previous)/1000,.05):0;previous=now;
    if(document.hidden)return;
    if(active){
      elapsed+=delta;
      const view=interaction.update();camera.position.set(0,0,0);camera.rotation.set(view.pitch,view.yaw,0,'YXZ');camera.updateMatrixWorld();
      let pose=chase.snapshot();
      let message,phaseState=null;
      if(!story.state){
        place(pose);
        projected.copy(anchor.position).project(camera);
        const halfFov=Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect);
        pose=chase.update(delta,view,halfFov,isRabbitCentered(projected));
        place(pose);animateRabbit(rabbit,pose,reduced.matches);
        portalPose=story.update(delta,pose,{focus:0,progress:0});
      }
      if(story.state){
        ensureDoor();interaction.setPortalMode(true);
        place(portalPose);
        door.root.updateWorldMatrix(true,false);
        door.root.getWorldPosition(portalProjected);portalProjected.project(camera);
        const observing=['PORTAL_VISIBLE','APPROACHING'].includes(story.state);
        const observation=observing?approach.update(delta,portalProjected):{focus:0,progress:portalPose.approach};
        // The first handoff frame already advanced the story above.
        if(portalPose.age>0||story.state!=='DOOR_APPEARING'||door.root.visible)portalPose=story.update(delta,pose,observation);
        phaseState=portalPose.state;
        door.update(phaseState,portalPose.age,portalPose.approach);
        animateDoorRabbit(rabbit,portalPose,reduced.matches);
        const discovered=phaseState==='PORTAL_DISCOVERED';
        if(['DOOR_OPENING','PORTAL_VISIBLE','APPROACHING','PORTAL_DISCOVERED'].includes(phaseState))portal.render(elapsed,portalPose.approach,discovered,camera,door.root,reduced.matches);
        message=phaseState==='DOOR_APPEARING'?'Was that always there?':phaseState==='PORTAL_VISIBLE'?'Come closer...':phaseState==='APPROACHING'?'Look inside.':discovered?(portalPose.age<3?'Welcome to Wonderland':''):'';
      }else{
        message=pose.state==='READY_FOR_DOOR' ? (pose.age<2.5?'Something is strange...':'') : pose.found?'Found him!':pose.state==='HIDE'||pose.state==='REAPPEAR'?'Where did he go?':'Follow me...';
      }
      const key=message+'|'+(elapsed<3.5)+'|'+phaseState;
      if(key!==lastMessage||pose.state!==lastState){lastMessage=key;lastState=pose.state;onProgress({...pose,phaseState,portalMode:portal?.mode,message,safety:elapsed<3.5});}
    }else{
      camera.position.set(0,.28,3.4);camera.rotation.set(0,0,0);anchor.position.set(0,0,0);anchor.rotation.set(0,0,0);
      rabbit.root.visible=true;rabbit.root.position.set(camera.aspect>1.4?-1.2:0,-.18,0);rabbit.root.scale.setScalar(.35);rabbit.root.rotation.y=-.25;rabbit.head.rotation.set(0,0,0);
    }
    renderer.render(scene,camera);
  });
  return {
    start(){active=true;elapsed=0;lastMessage='';lastState='';chase.reset();story.reset();approach.reset();portalPose=null;portal?.reset();if(door)door.root.visible=false;},
    stop(){active=false;interaction.setPortalMode(false);if(door)door.root.visible=false;},
    get rabbitState(){return chase.snapshot().state;},
    get phaseState(){return story.state;},
    dispose(){portal?.dispose();renderer.setAnimationLoop(null);observer.disconnect();renderer.domElement.removeEventListener('webglcontextlost',lost);const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);materials.add(o.material);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();}
  };
}

export function cameraErrorMessage(error){
  switch(error.name){
    case 'NotAllowedError': return 'カメラを許可してください。拒否した場合はブラウザのサイト設定から変更できます。';
    case 'NotFoundError': return 'カメラが見つかりません。カメラ付きのスマートフォンで開いてください。';
    case 'NotReadableError': return 'カメラを使用できません。他のアプリでカメラを閉じて、もう一度お試しください。';
    default:return 'カメラを起動できませんでした。SafariまたはChromeで開き直してください。';
  }
}
