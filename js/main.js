import { createARLayer, cameraErrorMessage } from './ar.js';
const video=document.querySelector('#camera');
const entry=document.querySelector('#entry');
const enter=document.querySelector('#enter');
const hud=document.querySelector('#hud');
const status=document.querySelector('#status');
let layer, stream, generation=0, starting=false;
function stop(message='カメラを許可して、白うさぎを見つけよう。') {
  generation++;starting=false;
  if(stream)stream.getTracks().forEach(track=>track.stop());
  stream=null;video.pause();video.srcObject=null;layer?.stop();
  document.body.classList.remove('active');entry.hidden=false;hud.hidden=true;
  enter.disabled=false;enter.innerHTML='Enter Wonderland <span aria-hidden="true">↗</span>';status.textContent=message;
}
function ensureLayer(){
  if(!layer)layer=createARLayer(document.querySelector('#ar-layer'),()=>{
    stop('表示が中断されました。もう一度ボタンを押してください。');
    layer?.dispose();layer=null;
  });
}
try{ensureLayer();}catch{status.textContent='ボタンを押して、体験を開始してください。';}
enter.addEventListener('click',async()=>{
  if(starting)return;
  if(!window.isSecureContext){status.textContent='カメラを使うにはHTTPSのURLで開いてください。';return;}
  if(!navigator.mediaDevices?.getUserMedia){status.textContent='SafariまたはChromeで、このページを開いてください。';return;}
  try{ensureLayer();}catch{status.textContent='3D表示を開始できません。ブラウザを更新して、もう一度お試しください。';return;}
  starting=true;const request=++generation;enter.disabled=true;status.textContent='カメラの使用を許可してください…';
  try {
    const result=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}});
    if(request!==generation){result.getTracks().forEach(t=>t.stop());return;}
    stream=result;video.srcObject=stream;video.muted=true;await video.play();
    if(request!==generation)return;
    stream.getVideoTracks().forEach(track=>track.addEventListener('ended',()=>stop('カメラが中断されました。もう一度開始してください。'),{once:true}));
    layer.start();entry.hidden=true;hud.hidden=false;document.body.classList.add('active');starting=false;document.querySelector('#exit').focus();
  }catch(error){if(request===generation)stop(cameraErrorMessage(error));}
});
document.querySelector('#exit').addEventListener('click',()=>{stop();enter.focus();});
window.addEventListener('pagehide',()=>stop());
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(stream||starting))stop('おかえりなさい。ボタンを押して再開できます。');});
