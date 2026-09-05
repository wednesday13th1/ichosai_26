import * as THREE from 'three';

export const wrapAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
export function isRabbitCentered(point) {
  return point.z > -1 && point.z < 1 && Math.abs(point.x) < .38 && Math.abs(point.y) < .5;
}

// Relative viewing direction only: no position tracking, compass or world anchors.
export function createInteraction(surface, onModeChange = () => {}) {
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  const quaternion = new THREE.Quaternion();
  const correction = new THREE.Quaternion(-Math.sqrt(.5), 0, 0, Math.sqrt(.5));
  const screenCorrection = new THREE.Quaternion();
  const forward = new THREE.Vector3();
  const zAxis = new THREE.Vector3(0, 0, 1);
  let enabled = false, mode = 'touch', baseline = null, portalMode = false;
  let yaw = 0, pitch = 0, offsetYaw = 0, offsetPitch = 0, pointer = null;
  let startedAt = 0, lastSensorAt = 0;
  const rad = THREE.MathUtils.degToRad;
  function setMode(next) { if (mode !== next) { mode = next; onModeChange(mode); } }
  function orientation(event) {
    if (!enabled || ![event.alpha,event.beta,event.gamma].every(Number.isFinite)) return;
    euler.set(rad(event.beta), rad(event.alpha), -rad(event.gamma), 'YXZ');
    quaternion.setFromEuler(euler).multiply(correction);
    screenCorrection.setFromAxisAngle(zAxis, -rad(window.screen.orientation?.angle ?? window.orientation ?? 0));
    quaternion.multiply(screenCorrection);
    forward.set(0,0,-1).applyQuaternion(quaternion);
    const sample = {yaw: Math.atan2(-forward.x,-forward.z), pitch: Math.asin(THREE.MathUtils.clamp(forward.y,-1,1))};
    lastSensorAt = performance.now();
    if (!baseline) { baseline = sample; offsetYaw = yaw; offsetPitch = pitch; }
    yaw = offsetYaw + wrapAngle(sample.yaw-baseline.yaw);
    pitch = THREE.MathUtils.clamp(offsetPitch+sample.pitch-baseline.pitch,-.65,.65);
    setMode('sensor');
  }
  function rebase() { baseline = null; offsetYaw = yaw; offsetPitch = pitch; }
  function down(event) {
    if (!enabled || portalMode || event.target.closest('button') || (mode === 'sensor' && performance.now()-lastSensorAt < 2500)) return;
    setMode('touch'); pointer={id:event.pointerId,x:event.clientX,y:event.clientY}; surface.setPointerCapture(event.pointerId);
  }
  function move(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    yaw += (event.clientX-pointer.x)/Math.max(surface.clientWidth,1)*1.4;
    pitch = THREE.MathUtils.clamp(pitch+(event.clientY-pointer.y)/Math.max(surface.clientHeight,1),-.65,.65);
    pointer.x=event.clientX;pointer.y=event.clientY;baseline=null;
  }
  function up() { pointer=null; }
  window.addEventListener('deviceorientation',orientation);
  window.addEventListener('orientationchange',rebase);
  window.screen.orientation?.addEventListener('change',rebase);
  surface.addEventListener('pointerdown',down);surface.addEventListener('pointermove',move);
  surface.addEventListener('pointerup',up);surface.addEventListener('pointercancel',up);
  return {
    // Must be invoked synchronously from the Enter button's user gesture.
    requestPermission() {
      try { return Promise.resolve(typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function' ? DeviceOrientationEvent.requestPermission() : 'granted').catch(()=>'denied'); }
      catch { return Promise.resolve('denied'); }
    },
    setPortalMode(value){portalMode=value;pointer=null;},
    get mode(){return mode;},
    start(){portalMode=false;enabled=true;yaw=0;pitch=0;baseline=null;lastSensorAt=0;startedAt=performance.now();mode='pending';onModeChange(mode);},
    update(){if(enabled && mode!=='touch' && performance.now()-(lastSensorAt||startedAt)>2500){setMode('touch');}return {yaw,pitch};},
    stop(){enabled=false;pointer=null;baseline=null;},
    dispose(){this.stop();window.removeEventListener('deviceorientation',orientation);window.removeEventListener('orientationchange',rebase);window.screen.orientation?.removeEventListener('change',rebase);surface.removeEventListener('pointerdown',down);surface.removeEventListener('pointermove',move);surface.removeEventListener('pointerup',up);surface.removeEventListener('pointercancel',up);}
  };
}

// Deliberate gaze dwell, not a physical distance measurement.
export function createApproachTracker() {
  let focus=0,progress=0;
  return {
    reset(){focus=0;progress=0;},
    update(dt,point){
      const visible=point.z>-1&&point.z<1&&Math.abs(point.x)<.45&&Math.abs(point.y)<.55;
      focus=visible?focus+dt:0;
      if(visible&&focus>.7)progress=Math.min(1,progress+dt/5);
      return {visible,focus,progress};
    }
  };
}
