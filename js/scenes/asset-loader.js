import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export const MODEL_PATHS=Object.freeze({
  pocketWatch:'/assets/models/pocket-watch.glb',playingCard:'/assets/models/playing-card.glb',rose:'/assets/models/rose.glb',gear:'/assets/models/gear.glb',teapot:'/assets/models/teapot.glb',teacup:'/assets/models/teacup.glb'
});

const loader=new GLTFLoader(),cache=new Map();
const bundledModels=import.meta.glob('/assets/models/*.{glb,gltf}',{eager:true,query:'?url',import:'default'});
function cloneAsset(asset){return{scene:asset.scene.clone(true),animations:asset.animations||[]};}
export function loadOptionalModel(key,{timeout=4500}={}){
  const sourcePath=MODEL_PATHS[key],url=bundledModels[sourcePath];if(!url)return Promise.resolve(null);if(cache.has(url))return cache.get(url).then(asset=>asset?cloneAsset(asset):null);
  const request=new Promise(resolve=>{let settled=false;const timer=setTimeout(()=>{if(!settled){settled=true;resolve(null);}},timeout);loader.load(url,gltf=>{if(settled)return;settled=true;clearTimeout(timer);resolve({scene:gltf.scene,animations:gltf.animations||[]});},undefined,()=>{if(settled)return;settled=true;clearTimeout(timer);resolve(null);});});
  cache.set(url,request);return request.then(asset=>asset?cloneAsset(asset):null);
}
export async function upgradeWithModel(holder,key,{scale=1,rotation=new THREE.Euler(),playAnimations=true}={}){const asset=await loadOptionalModel(key);if(!asset||!holder.parent)return false;const model=asset.scene;model.scale.setScalar(scale);model.rotation.copy(rotation);model.traverse(object=>{if(object.isMesh){object.castShadow=false;object.receiveShadow=false;}});holder.clear();holder.add(model);holder.userData.modelSource=MODEL_PATHS[key];if(playAnimations&&asset.animations.length){const mixer=new THREE.AnimationMixer(model);asset.animations.forEach(clip=>mixer.clipAction(clip).play());holder.userData.animationMixer=mixer;}return true;}
export function updateModelAnimation(holder,delta){holder.userData.animationMixer?.update(delta);}
export function disposeModelAnimation(holder){holder.userData.animationMixer?.stopAllAction();holder.userData.animationMixer?.uncacheRoot(holder.children[0]);delete holder.userData.animationMixer;}
export function clearModelCache(){cache.clear();}
