import { wrapAngle } from './interaction.js';
export const RabbitState = Object.freeze({APPEAR:'APPEAR',WAIT:'WAIT',RUN:'RUN',HIDE:'HIDE',REAPPEAR:'REAPPEAR',READY_FOR_DOOR:'READY_FOR_DOOR'});
const ease = t => t*t*(3-2*t);
const patterns = [{side:-1,pitch:0},{side:1,pitch:.10},{side:-1,pitch:-.08}];

// All timing is driven by one render-loop clock; no timers or automatic finds.
export function createChase(onChange = () => {}) {
  let state, age, count, yaw, pitch, fromYaw, fromPitch, targetYaw, targetPitch, searchView, dwell, foundAge;
  function transition(next) { state=next;age=0;dwell=0;onChange({state,count}); }
  function reset(){count=0;yaw=0;pitch=0;foundAge=Infinity;transition(RabbitState.APPEAR);}
  function run(view,halfFov){
    const pattern=patterns[count];
    fromYaw=yaw;fromPitch=pitch;searchView=view.yaw;
    // A modest turn beyond the current viewport. Runs alternate sides.
    targetYaw=view.yaw+pattern.side*(halfFov+.23);
    targetPitch=view.pitch+pattern.pitch;
    transition(RabbitState.RUN);
  }
  function update(dt,view,halfFov,centered){
    age+=dt;foundAge+=dt;
    if(state===RabbitState.APPEAR && age>=.8) transition(RabbitState.WAIT);
    else if(state===RabbitState.WAIT && age>=1.6) run(view,halfFov);
    else if(state===RabbitState.RUN){
      const progress=ease(Math.min(age/1.6,1));
      yaw=fromYaw+(targetYaw-fromYaw)*progress;pitch=fromPitch+(targetPitch-fromPitch)*progress;
      if(age>=1.6)transition(RabbitState.HIDE);
    } else if(state===RabbitState.HIDE && age>=1) transition(RabbitState.REAPPEAR);
    else if(state===RabbitState.REAPPEAR && age>=.7){
      const searched=Math.abs(wrapAngle(view.yaw-searchView))>.10;
      dwell=centered && searched ? dwell+dt : 0;
      if(dwell>=.35){
        count++;foundAge=0;
        if(count===3){fromYaw=yaw;fromPitch=pitch;transition(RabbitState.READY_FOR_DOOR);}
        else transition(RabbitState.WAIT);
      }
    } else if(state===RabbitState.READY_FOR_DOOR){
      // Finish gently in the current view, ready for a Phase 3 handoff.
      const progress=ease(Math.min(age/.7,1));
      yaw=fromYaw+wrapAngle(view.yaw-fromYaw)*progress;pitch=fromPitch+(view.pitch-fromPitch)*progress;
    }
    return snapshot();
  }
  function snapshot(){return {state,age,count,yaw,pitch,found:foundAge<.5,foundAge,visible:state!==RabbitState.HIDE};}
  reset();return {reset,update,snapshot};
}

export const PortalState = Object.freeze({DOOR_APPEARING:'DOOR_APPEARING',RABBIT_ENTERING:'RABBIT_ENTERING',DOOR_OPENING:'DOOR_OPENING',PORTAL_VISIBLE:'PORTAL_VISIBLE',APPROACHING:'APPROACHING',PORTAL_DISCOVERED:'PORTAL_DISCOVERED'});

export function createPortalStory() {
  let state=null,age=0,yaw=0,pitch=0,approach=0;
  function transition(next){state=next;age=0;}
  return {
    reset(){state=null;age=0;approach=0;},
    update(dt,chase,observation){
      if(!state){
        if(chase.state==='READY_FOR_DOOR'&&chase.age>=1.2){yaw=chase.yaw;pitch=chase.pitch;transition(PortalState.DOOR_APPEARING);}
      }else{
        age+=dt;
        if(state===PortalState.DOOR_APPEARING&&age>=1.2)transition(PortalState.RABBIT_ENTERING);
        else if(state===PortalState.RABBIT_ENTERING&&age>=3.6)transition(PortalState.DOOR_OPENING);
        else if(state===PortalState.DOOR_OPENING&&age>=1.2)transition(PortalState.PORTAL_VISIBLE);
        else if(state===PortalState.PORTAL_VISIBLE&&observation.focus>.7)transition(PortalState.APPROACHING);
        else if(state===PortalState.APPROACHING){approach=observation.progress;if(approach>=1)transition(PortalState.PORTAL_DISCOVERED);}
      }
      return {state,age,yaw,pitch,approach};
    },
    get state(){return state;}
  };
}
