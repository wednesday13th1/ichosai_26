export const SCENE_DURATION_MS=90_000;
export const EXPERIENCE_WORLDS=Object.freeze([
 {type:'world02',kicker:'WONDERLAND COURT',title:'QUEEN OF HEARTS',subtitle:''},
 {type:'world03',kicker:'WONDERLAND PATISSERIE',title:'EAT ME · DRINK ME',subtitle:'Curiouser & Curiouser'},
 {type:'world01',kicker:'THE RABBIT IS LATE',title:'CLOCK WORLD',subtitle:'Lost in Time'}
]);
export const nextWorldIndex=(index,length=EXPERIENCE_WORLDS.length)=>(index+1)%length;
export function formatRemaining(milliseconds){const seconds=Math.max(0,Math.ceil(milliseconds/1000)),minutes=Math.floor(seconds/60);return`${String(minutes).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
