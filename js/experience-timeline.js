export const SCENE_DURATION_MS=90_000;
export const EXPERIENCE_WORLDS=Object.freeze([
 {type:'world02',kicker:'♛  QUEEN OF HEARTS',title:'QUEEN OF HEARTS'},
 {type:'world03',kicker:'EAT ME  ·  DRINK ME',title:'CURIOUSER & CURIOUSER'},
 {type:'world01',kicker:'THE RABBIT IS LATE',title:'CLOCK WORLD'}
]);
export const nextWorldIndex=(index,length=EXPERIENCE_WORLDS.length)=>(index+1)%length;
export function formatRemaining(milliseconds){const seconds=Math.max(0,Math.ceil(milliseconds/1000)),minutes=Math.floor(seconds/60);return`${String(minutes).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
