import {createARLayer,cameraErrorMessage} from './ar.js';
import {createInteraction} from './interaction.js';

const $=s=>document.querySelector(s);
const video=$('#camera'),landing=$('#landing'),permission=$('#permission'),hud=$('#hud'),status=$('#status'),surface=$('#experience'),guide=$('#look-guide'),preview=$('#photo-preview'),photo=$('#captured-photo'),flash=$('#flash'),heading=$('.world-heading'),thumbnail=$('#thumbnail');
const worlds=[
  {type:'world01',number:'01',title:'DOWN<br>THE HOLE',subtitle:'Curiouser and curiouser'},
  {type:'world02',number:'02',title:"QUEEN’S<br>COURT",subtitle:'Paint the roses red'},
  {type:'world03',number:'03',title:'LOST<br>IN TIME',subtitle:'We are all late here'},
  {type:'world04',number:'04',title:'MAD TEA<br>PARTY',subtitle:'Take another cup of tea'}
];
let layer,stream,generation=0,latestBlob,latestUrl,facing='environment',worldIndex=0,captureTimer=0,touchStart=null;
const interaction=createInteraction(surface);

function ensureLayer(){if(!layer)layer=createARLayer($('#ar-layer'),()=>stop('3D display was interrupted.'),interaction);}
function stopTracks(){stream?.getTracks().forEach(track=>track.stop());stream=null;video.pause();video.srcObject=null;}
function stop(message=''){generation++;clearTimeout(captureTimer);interaction.stop();stopTracks();layer?.stop();document.body.classList.remove('active');hud.hidden=true;preview.hidden=true;permission.hidden=false;status.textContent=message;}
async function openCamera(request){stopTracks();const next=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:facing},width:{ideal:1920},height:{ideal:1080}}});if(request!==generation){next.getTracks().forEach(t=>t.stop());return false;}stream=next;video.srcObject=stream;await video.play();video.classList.toggle('mirrored',facing==='user');return true;}
function showGuide(){guide.classList.remove('out');setTimeout(()=>guide.classList.add('out'),3200);}

function setWorld(index,immediate=false){
  worldIndex=(index+worlds.length)%worlds.length;const world=worlds[worldIndex];
  if(!immediate)heading.classList.add('switching');
  setTimeout(()=>{$('#world-number').textContent=world.number;$('#world-title').innerHTML=world.title;$('#world-subtitle').textContent=world.subtitle;document.querySelectorAll('#world-selector button').forEach((b,i)=>{b.classList.toggle('active',i===worldIndex);b.setAttribute('aria-current',i===worldIndex?'true':'false');});layer?.setScene(world.type);heading.classList.remove('switching');},immediate?0:320);
}

$('#enter').addEventListener('click',()=>{landing.hidden=true;permission.hidden=false;});
$('#allow-camera').addEventListener('click',async()=>{
  if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){status.textContent='Open this page over HTTPS in Safari or Chrome.';return;}
  status.textContent='Opening camera…';const request=++generation;
  try{ensureLayer();await interaction.requestPermission();if(!await openCamera(request))return;permission.hidden=true;setWorld(0,true);interaction.start();layer.start();hud.hidden=false;document.body.classList.add('active');status.textContent='';showGuide();}
  catch(error){status.textContent=cameraErrorMessage(error);}
});
document.querySelectorAll('#world-selector button').forEach((button,index)=>button.addEventListener('click',()=>setWorld(index)));

surface.addEventListener('touchstart',event=>{if(hud.hidden||event.target.closest('button'))return;const touch=event.changedTouches[0];touchStart={x:touch.clientX,y:touch.clientY};},{passive:true});
surface.addEventListener('touchend',event=>{if(!touchStart)return;const touch=event.changedTouches[0],dx=touch.clientX-touchStart.x,dy=touch.clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.35)setWorld(worldIndex+(dx<0?1:-1));},{passive:true});

function drawCover(ctx,source,sw,sh,w,h,mirror=false){const scale=Math.max(w/sw,h/sh),dw=sw*scale,dh=sh*scale;ctx.save();if(mirror){ctx.translate(w,0);ctx.scale(-1,1);}ctx.drawImage(source,(w-dw)/2,(h-dh)/2,dw,dh);ctx.restore();}
function captureFrame(){if(!stream||!video.videoWidth)return;const rect=surface.getBoundingClientRect(),ratio=Math.min(2,1600/Math.max(rect.width,rect.height)),canvas=document.createElement('canvas');canvas.width=Math.round(rect.width*ratio);canvas.height=Math.round(rect.height*ratio);const ctx=canvas.getContext('2d');drawCover(ctx,video,video.videoWidth,video.videoHeight,canvas.width,canvas.height,facing==='user');ctx.drawImage(layer.canvas,0,0,canvas.width,canvas.height);canvas.toBlob(blob=>{if(!blob)return;latestBlob=blob;if(latestUrl)URL.revokeObjectURL(latestUrl);latestUrl=URL.createObjectURL(blob);photo.src=latestUrl;thumbnail.style.backgroundImage=`url(${latestUrl})`;thumbnail.querySelector('span').hidden=true;hud.hidden=true;preview.hidden=false;layer.resume();},'image/png');}
function capture(){if(!stream||!video.videoWidth)return;layer.pause();flash.classList.remove('fire');void flash.offsetWidth;captureTimer=setTimeout(()=>flash.classList.add('fire'),80);setTimeout(captureFrame,160);setTimeout(()=>layer.resume(),300);}
async function save(){if(!latestBlob)return;const file=new File([latestBlob],`wonderland-${Date.now()}.png`,{type:'image/png'});try{if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'Wonderland'});return;}}catch(error){if(error.name==='AbortError')return;}const a=document.createElement('a');a.href=latestUrl;a.download=file.name;a.click();}

$('#shutter').addEventListener('click',capture);thumbnail.addEventListener('click',()=>{if(latestUrl){hud.hidden=true;preview.hidden=false;}});$('#retake').addEventListener('click',()=>{preview.hidden=true;hud.hidden=false;layer.resume();});$('#save-photo').addEventListener('click',save);$('#exit').addEventListener('click',()=>stop());
$('#flip-camera').addEventListener('click',async()=>{facing=facing==='environment'?'user':'environment';const request=++generation;try{await openCamera(request);}catch(error){status.textContent=cameraErrorMessage(error);}});
window.addEventListener('pagehide',()=>{stopTracks();if(latestUrl)URL.revokeObjectURL(latestUrl);});
