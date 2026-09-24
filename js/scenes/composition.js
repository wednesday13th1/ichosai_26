import * as THREE from 'three';

export const DEPTH=Object.freeze({
  far:{z:-5.2,opacity:.58,parallax:.03,speed:.55},
  mid:{z:-3.1,opacity:.84,parallax:.065,speed:.78},
  near:{z:-1.45,opacity:.97,parallax:.11,speed:1}
});
export const BILLBOARD=Object.freeze({FULL:'full',Y_AXIS:'y-axis',FIXED:'fixed'});
export const SIZES=Object.freeze({small:.34,medium:.62,large:1.05,hero:1.48});
export const SAFE_ZONE=Object.freeze({left:.28,right:.72,top:.24,bottom:.74});
export const MOTION_PHASE=Object.freeze({REST:'rest',BUILD:'build',HERO:'hero',RECOVERY:'recovery'});

export function createDepthLayers(root){const background=new THREE.Group(),midground=new THREE.Group(),foreground=new THREE.Group();background.name='background-depth';midground.name='midground-depth';foreground.name='foreground-depth';root.add(background,midground,foreground);return{background,midground,foreground};}
export function cycleState(time,duration=12,heroStart=.55,heroEnd=.76){const progress=((time%duration)+duration)%duration/duration;if(progress<.16)return{phase:MOTION_PHASE.REST,progress,local:progress/.16,hero:0};if(progress<heroStart){const local=(progress-.16)/(heroStart-.16);return{phase:MOTION_PHASE.BUILD,progress,local,hero:0};}if(progress<heroEnd){const local=(progress-heroStart)/(heroEnd-heroStart);return{phase:MOTION_PHASE.HERO,progress,local,hero:Math.sin(local*Math.PI)};}const local=(progress-heroEnd)/(1-heroEnd);return{phase:MOTION_PHASE.RECOVERY,progress,local,hero:0};}
export function easeInOut(t){const value=THREE.MathUtils.clamp(t,0,1);return value*value*(3-2*value);}
export function motionPreference(matches=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false){return Object.freeze({reduced:matches,scale:matches?.28:1,events:!matches});}
export function microMotion(time,{phase=0,duration=7,float=.03,rotate=.025,scale=.012}={}){const wave=Math.sin(time*Math.PI*2/duration+phase);return{y:wave*float,rotation:wave*rotate,scale:1+wave*scale,wave};}
export function createVisitVariation(count=3,random=Math.random){let variant=-1,enteredAt=null;return{reset(){let next=Math.floor(random()*count)%count;if(count>1&&next===variant)next=(next+1)%count;variant=next;enteredAt=null;return variant;},elapsed(time){if(enteredAt===null)enteredAt=time;return Math.max(0,time-enteredAt);},get variant(){return variant<0?0:variant;}};}
export function outsideSafeZone(x,y){return x<=SAFE_ZONE.left||x>=SAFE_ZONE.right||y<=SAFE_ZONE.top||y>=SAFE_ZONE.bottom;}
export function performanceTier({width=globalThis.innerWidth||390,height=globalThis.innerHeight||844,dpr=globalThis.devicePixelRatio||1,cores=globalThis.navigator?.hardwareConcurrency||4}={}){const pixels=width*height*Math.min(dpr,2)**2;if(cores<=4||pixels>3_600_000)return'low';if(cores>=8&&pixels<2_500_000)return'high';return'medium';}
export const qualitySettings=tier=>tier==='low'?{dpr:1.25,particles:.55,decorations:.68,shadows:false}:tier==='high'?{dpr:2,particles:1,decorations:1,shadows:true}:{dpr:1.65,particles:.78,decorations:.85,shadows:false};

export function texture(width,height,paint){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');paint(ctx,width,height);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;}
export function plane(map,width,height,{opacity=1,mode=BILLBOARD.FIXED,depth='mid'}={}){const material=new THREE.MeshBasicMaterial({map,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);mesh.userData={...mesh.userData,depth,mode,base:null,phase:0};return mesh;}
export function addObject(root,object,{x,y,z,rotation=0,phase=0,duration=14,drift=.08,priority=2,parallax,asset,size='medium',animation='slow-float'}={}){
  object.position.set(x,y,z);object.rotation.z=THREE.MathUtils.degToRad(rotation);
  const depth=object.userData.depth||'mid';
  Object.assign(object.userData,{asset:asset||object.name||'procedural',size,depth,shadow:`shadow-${depth}`,animation,base:object.position.clone(),baseRotation:object.rotation.clone(),phase,duration,drift,priority,parallax:parallax??DEPTH[depth].parallax});
  root.add(object);return object;
}
export function worldPosition({x,y,z}){return{x:(x-.5)*4.5,y:(.5-y)*3.65,z};}
export function addConfiguredObject(root,object,config){
  const position=worldPosition(config.position),animation=config.animation||{},maxPx=Math.max(animation.amplitudeX||0,animation.amplitudeY||0);
  object.userData.depth=config.depth;object.userData.mode=config.billboardMode;object.name=config.id;
  return addObject(root,object,{...position,rotation:config.rotation,phase:animation.phase||0,duration:animation.duration||14,drift:maxPx/150,priority:config.priority,parallax:DEPTH[config.depth].parallax,asset:config.asset,size:config.size.preferred,animation:animation.type});
}
export function animateObjects(objects,time,view={yaw:0,pitch:0},camera,theme={animationSpeed:1}){
  const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false,motionScale=reduced?.4:1,animationSpeed=theme.animationSpeed??1;
  for(const object of objects){
    const u=object.userData,omega=Math.PI*2/(u.duration||14)*animationSpeed,wave=Math.sin(time*omega+(u.phase||0));
    const yaw=THREE.MathUtils.clamp(view.yaw||0,-.42,.42),pitch=THREE.MathUtils.clamp(view.pitch||0,-.32,.32),strength=(u.parallax||.065)*1.9;
    object.position.y=u.base.y+wave*(u.drift||.08)*motionScale-pitch*strength;
    object.position.x=u.base.x+Math.cos(time*omega*.72+(u.phase||0))*(u.drift||.08)*.55*motionScale-yaw*strength;
    object.rotation.z=u.baseRotation.z+wave*THREE.MathUtils.degToRad(2.4)*motionScale;
    if(camera&&u.mode===BILLBOARD.FULL)object.quaternion.copy(camera.quaternion);
    else if(camera&&u.mode===BILLBOARD.Y_AXIS)object.rotation.y=camera.rotation.y;
  }
}
export function applyThemeToRoot(root,theme,worldKey,{tint=.22}={}){
  if(!theme)return;const accent=new THREE.Color(theme.worlds?.[worldKey]||theme.accent),moon=new THREE.Color(theme.ui);
  root.traverse(object=>{const materials=object.material?(Array.isArray(object.material)?object.material:[object.material]):[];materials.forEach(material=>{if(!material.userData.themeBase){material.userData.themeBase={color:material.color?.clone(),emissive:material.emissive?.clone(),emissiveIntensity:material.emissiveIntensity??0,opacity:material.opacity??1};}const base=material.userData.themeBase,preserved=material.userData.preserveColor;if(material.color&&base.color&&!preserved){material.color.copy(base.color).lerp(accent,tint*(object.userData.depth==='far'?.55:1));if(theme.name==='night')material.color.lerp(moon,.08);}if(material.emissive&&!preserved){material.emissive.copy(base.emissive||new THREE.Color()).lerp(accent,.8);material.emissiveIntensity=(base.emissiveIntensity||0)+theme.rimIntensity*(object.userData.depth==='near'?.22:.12);}if(material.isPointsMaterial){material.color.copy(accent);material.opacity=base.opacity*theme.particleOpacity;material.transparent=true;}material.needsUpdate=true;});});
}
export function applyResponsivePriority(objects,width=window.innerWidth,height=window.innerHeight){
  const compact=width<390,short=height<620;
  objects.forEach(object=>{object.visible=!(compact&&object.userData.priority===3);if(short&&object.userData.base){object.position.y=THREE.MathUtils.clamp(object.userData.base.y,-1.28,1.48);object.userData.base.y=object.position.y;}});
}
export function paperTexture(kind='page',accent='#1e1c1a'){return texture(320,440,(x,w,h)=>{x.fillStyle='#f2ebdd';x.fillRect(0,0,w,h);x.strokeStyle='rgba(60,52,43,.5)';x.lineWidth=5;x.strokeRect(9,9,w-18,h-18);x.fillStyle=accent;x.textAlign='center';if(kind==='card'){x.font='52px Georgia';x.textAlign='left';x.fillText('A',28,64);x.font='105px Georgia';x.textAlign='center';x.fillText('♠',w/2,h/2+35);}else{x.font='italic 24px Georgia';x.fillText('CHAPTER XII',w/2,70);x.fillStyle='rgba(42,37,31,.55)';for(let i=0;i<10;i++)x.fillRect(48,112+i*24,w-96,2);}});}
export function roseTexture(color='#9a0a24'){return texture(256,256,(x,w,h)=>{x.clearRect(0,0,w,h);for(let r=104;r>18;r-=14){x.beginPath();x.fillStyle=r%28?color:'#c72e45';for(let i=0;i<8;i++){const a=i*Math.PI/4+r*.01;x.ellipse(w/2+Math.cos(a)*r*.32,h/2+Math.sin(a)*r*.25,r*.28,r*.15,a,0,Math.PI*2);}x.fill();}x.fillStyle='#4a0010';x.beginPath();x.arc(w/2,h/2,22,0,Math.PI*2);x.fill();});}
export function disposeRoot(root){const geometries=new Set(),materials=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});geometries.forEach(g=>g.dispose());materials.forEach(m=>{m.map?.dispose();m.dispose();});}
