import * as THREE from 'three';
import { DOOR_WIDTH as WIDTH, DOOR_HEIGHT as HEIGHT } from './door.js';

// The Wonderland scene is NEVER added to the camera scene. Only its rectangular
// render texture is displayed, so no geometry or particle can escape the opening.
export function createPortal(renderer) {
  const world=new THREE.Scene();const skyCanvas=document.createElement('canvas');skyCanvas.width=2;skyCanvas.height=128;
  const skyContext=skyCanvas.getContext('2d');let skyTexture=null;
  if(skyContext){const gradient=skyContext.createLinearGradient(0,0,0,128);gradient.addColorStop(0,'#292356');gradient.addColorStop(.6,'#6956a3');gradient.addColorStop(1,'#4597a7');skyContext.fillStyle=gradient;skyContext.fillRect(0,0,2,128);skyTexture=new THREE.CanvasTexture(skyCanvas);skyTexture.colorSpace=THREE.SRGBColorSpace;}
  world.background=skyTexture||new THREE.Color(0x45418d);world.fog=new THREE.Fog(0x45418d,5,15);
  const camera=new THREE.PerspectiveCamera(40,WIDTH/HEIGHT,.08,25);
  const ambient=new THREE.HemisphereLight(0xa9c9ff,0x382355,2.4);world.add(ambient);
  const light=new THREE.DirectionalLight(0xffd2b0,3);light.position.set(-2,5,2);world.add(light);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(22,24),new THREE.MeshStandardMaterial({color:0x164f66,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.set(0,-.46,-7);world.add(floor);
  // A narrowing path and repeated depth layers establish a distant vanishing point.
  const path=new THREE.Mesh(new THREE.PlaneGeometry(.65,20),new THREE.MeshStandardMaterial({color:0x8275ad,roughness:1}));path.rotation.x=-Math.PI/2;path.position.set(0,-.455,-8);world.add(path);
  const stemMaterial=new THREE.MeshStandardMaterial({color:0xe3d8be,roughness:.9});
  const capMaterial=new THREE.MeshStandardMaterial({color:0xb83f9e,roughness:.6});
  const stemGeometry=new THREE.CylinderGeometry(.06,.10,.62,12);
  const capGeometry=new THREE.SphereGeometry(.43,18,10,0,Math.PI*2,0,Math.PI/2);
  for(const [x,z,scale] of [[-.40,-1.6,1.25],[.65,-3.8,1.7],[-1.5,-7,3.6]]){
    const mushroom=new THREE.Group();mushroom.position.set(x,-.46,z);mushroom.scale.setScalar(scale);
    const stem=new THREE.Mesh(stemGeometry,stemMaterial);stem.position.y=.31;mushroom.add(stem);
    const cap=new THREE.Mesh(capGeometry,capMaterial);cap.position.y=.6;cap.scale.y=.55;mushroom.add(cap);world.add(mushroom);
  }
  const cards=[];
  const cardGeometry=new THREE.PlaneGeometry(.11,.16);
  const cardMaterial=new THREE.MeshBasicMaterial({color:0xfff0d4,side:THREE.DoubleSide});
  const diamondGeometry=new THREE.PlaneGeometry(.035,.035);
  const diamondMaterial=new THREE.MeshBasicMaterial({color:0xb32460,side:THREE.DoubleSide});
  for(let i=0;i<7;i++){
    const card=new THREE.Group();const face=new THREE.Mesh(cardGeometry,cardMaterial);card.add(face);
    const mark=new THREE.Mesh(diamondGeometry,diamondMaterial);mark.position.z=.002;mark.rotation.z=Math.PI/4;card.add(mark);
    card.position.set(Math.sin(i*2.4)*(.25+i*.08),.03+(i%3)*.26,-.65-i*.5);card.userData.baseY=card.position.y;world.add(card);cards.push(card);
  }
  const positions=new Float32Array(64*3);
  for(let i=0;i<64;i++){positions[i*3]=Math.sin(i*17.1)*1.7;positions[i*3+1]=-.2+(i%17)/12;positions[i*3+2]=-.4-(i*1.37%7);}
  const particlesGeometry=new THREE.BufferGeometry();particlesGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));particlesGeometry.setDrawRange(0,28);
  const particles=new THREE.Points(particlesGeometry,new THREE.PointsMaterial({color:0xf4d39d,size:.016,transparent:true,opacity:.8,depthWrite:false}));world.add(particles);
  const material=new THREE.MeshBasicMaterial({toneMapped:false});
  const surface=new THREE.Mesh(new THREE.PlaneGeometry(WIDTH,HEIGHT),material);surface.position.z=-.012;
  let target=null, fallback=null, fallbackContext=null, mode='render-target', lastFrame=-Infinity;
  const eye=new THREE.Vector3();const clearColor=new THREE.Color();
  function simpleFallback(){
    mode='simple';target?.dispose();target=null;
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=400;fallbackContext=canvas.getContext('2d');
    fallback=new THREE.CanvasTexture(canvas);fallback.colorSpace=THREE.SRGBColorSpace;material.map=fallback;material.needsUpdate=true;
    if(!fallbackContext)material.color.set(0x6559ad);
  }
  try{
    target=new THREE.WebGLRenderTarget(384,600,{depthBuffer:true,stencilBuffer:false});target.texture.colorSpace=THREE.SRGBColorSpace;
    const previous=renderer.getRenderTarget();
    try{renderer.setRenderTarget(target);const gl=renderer.getContext();if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('Unavailable portal framebuffer');}
    finally{renderer.setRenderTarget(previous);}
    material.map=target.texture;
  }catch{simpleFallback();}
  function drawSimple(time,progress,discovered){
    const c=fallbackContext;if(!c)return;const sky=c.createLinearGradient(0,0,0,400);sky.addColorStop(0,discovered?'#7c69cf':'#443879');sky.addColorStop(1,'#2f92a1');c.fillStyle=sky;c.fillRect(0,0,256,400);
    c.fillStyle='#326d78';c.fillRect(0,265,256,135);c.fillStyle='#a4a0c0';c.beginPath();c.moveTo(122,230);c.lineTo(85,400);c.lineTo(180,400);c.lineTo(134,230);c.fill();
    for(const [x,y,s] of [[50,245,1.2],[206,265,.8]]){c.fillStyle='#e3d8be';c.fillRect(x-7*s,y,14*s,85*s);c.fillStyle='#c861ad';c.beginPath();c.ellipse(x,y,50*s,23*s,0,Math.PI,Math.PI*2);c.fill();}
    for(let i=0;i<(discovered?7:3);i++){c.save();c.translate(100+Math.sin(i*2.7)*65,100+i*27+Math.sin(time+i)*7);c.rotate(Math.sin(time*.3+i)*.4);c.fillStyle='#fff0d4';c.fillRect(-8,-12,16,24);c.fillStyle='#ae2d61';c.fillRect(-2,-3,4,6);c.restore();}
    for(let i=0;i<(discovered?32:12);i++){c.fillStyle='#ffe6aa';c.fillRect((i*47)%256,(i*31+time*6)%400,2,2);}
    fallback.needsUpdate=true;
  }
  return {surface,reset(){lastFrame=-Infinity;},get mode(){return mode;},
    render(time,progress,discovered,mainCamera,doorRoot,reduced){
      // Bound the extra pass to 30 fps (15 fps in the Canvas fallback).
      if(time-lastFrame<(mode==='simple'?1/15:1/30))return;lastFrame=time;
      if(mode==='simple'){drawSimple(reduced?0:time,progress,discovered);return;}
      doorRoot.updateWorldMatrix(true,false);eye.copy(mainCamera.position);doorRoot.worldToLocal(eye);eye.z=Math.max(.25,eye.z);
      camera.position.copy(eye);camera.rotation.set(0,0,0);
      // Off-axis frustum through the physical rectangle: orientation and the
      // virtual approach reveal more of the separate deep scene through it.
      const n=camera.near;
      camera.projectionMatrix.makePerspective((-WIDTH/2-eye.x)*n/eye.z,(WIDTH/2-eye.x)*n/eye.z,(HEIGHT/2-eye.y)*n/eye.z,(-HEIGHT/2-eye.y)*n/eye.z,n,camera.far);
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
      cards.forEach((card,i)=>{card.visible=i<(discovered?7:3);card.position.y=card.userData.baseY+(reduced?0:Math.sin(time*.9+i)*.06);card.rotation.y=reduced?.2:Math.sin(time*.5+i)*.5;card.rotation.z=Math.sin(i)*.3;});
      particlesGeometry.setDrawRange(0,discovered?64:28);particles.rotation.y=reduced?0:Math.sin(time*.15)*.12;ambient.intensity=discovered?3.1:2.4;
      const previous=renderer.getRenderTarget();const alpha=renderer.getClearAlpha();renderer.getClearColor(clearColor);
      try{renderer.setRenderTarget(target);renderer.render(world,camera);}
      catch{simpleFallback();}
      finally{renderer.setRenderTarget(previous);renderer.setClearColor(clearColor,alpha);}
    },
    dispose(){target?.dispose();fallback?.dispose();skyTexture?.dispose();const geometries=new Set(),materials=new Set();world.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
  };
}
