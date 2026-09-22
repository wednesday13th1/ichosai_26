const motion=(duration,phase,amplitudeX,amplitudeY,rotationAmplitude=2)=>({type:'float',duration,phase,amplitudeX,amplitudeY,rotationAmplitude});
const parallax={far:{maxX:6,maxY:4},mid:{maxX:12,maxY:8},near:{maxX:22,maxY:14}};
const object=(id,asset,x,y,z,width,rotation,depth,opacity,billboardMode,priority,animation)=>({
  id,asset,position:{x,y,z},size:{min:width*.8,preferred:width,max:width*1.2},rotation,depth,opacity,billboardMode,shadow:`shadow-${depth}`,priority,animation,parallax:parallax[depth]
});

export const WORLD_CONFIGS=Object.freeze({
  world01:{id:'01',title:'CLOCKWORK DREAM',density:.35,palette:{ivory:'#F2EBDD',grey:'#7A746C',ink:'#1E1C1A',blue:'#A6B7C2',silver:'#9B948A'},objects:[
    object('heroClock','procedural:antique-clock',.80,.34,-3.1,.38,-7,'mid',.92,'y-axis',1,motion(14,-3,8,14)),
    object('cardA','procedural:playing-card',.12,.42,-1.6,.14,18,'near',.96,'fixed',2,motion(12,1,16,12,4)),
    object('cardB','procedural:playing-card',.87,.63,-1.45,.18,-11,'near',.97,'fixed',2,motion(14,3,18,14,3)),
    object('pageA','procedural:book-page',.20,.20,-4.8,.13,-14,'far',.58,'fixed',3,motion(16,0,5,7)),
    object('frameA','procedural:antique-frame',.10,.29,-3.8,.22,4,'mid',.72,'y-axis',2,motion(19,2,8,8)),
    object('checkerboard','procedural:checkerboard',.50,.88,-3.9,1.2,0,'far',.52,'fixed',1,motion(24,0,0,0,0))
  ]},
  world02:{id:'02',title:"QUEEN'S COURT",density:.45,palette:{burgundy:'#4A0010',crimson:'#9A0A24',rose:'#C72E45',cherry:'#2A0A10',gold:'#B89A55',ivory:'#F2E9DE'},objects:[
    object('velvet','procedural:velvet-drape',.50,.05,-2.2,1,0,'near',.92,'fixed',1,motion(22,1,4,5,1)),
    object('roseLeft','procedural:rose-cluster',.08,.48,-2.5,.38,-6,'mid',.88,'y-axis',1,motion(13,3,9,12)),
    object('roseRight','procedural:rose-cluster',.92,.42,-3.1,.34,8,'mid',.87,'y-axis',1,motion(15,4,8,10)),
    object('heartCardNear','procedural:heart-card',.88,.68,-1.35,.22,8,'near',.98,'fixed',1,motion(14,7,18,13,4)),
    object('heartCardFar','procedural:heart-card',.12,.23,-3.4,.14,-7,'mid',.82,'fixed',2,motion(16,8,10,8)),
    object('crownHint','procedural:crown',.84,.37,-5.1,.28,5,'far',.36,'fixed',3,motion(18,2,5,5))
  ]},
  world03:{id:'03',title:'THROUGH THE CHESSBOARD',density:.40,palette:{sepia:'#8A7052',bronze:'#9A7448',stone:'#77736B',ivory:'#EFE5D1',gold:'#B39355'},objects:[
    object('clockHero','procedural:antique-clock',.08,.38,-3.4,.50,-8,'mid',.86,'y-axis',1,motion(14,1,9,11)),
    object('clockSmall','procedural:antique-clock',.90,.20,-4.8,.12,6,'far',.58,'y-axis',2,motion(16,.25,5,6)),
    object('clockLarge','procedural:antique-clock',.89,.67,-2.35,.34,-8,'mid',.86,'y-axis',2,motion(18,2,10,12)),
    object('clockNear','procedural:antique-clock',.12,.82,-1.35,.18,6,'near',.97,'y-axis',2,motion(20,3,14,13)),
    ...['III','VII','IX','XI'].map((n,i)=>object(`numeral${n}`,`procedural:numeral-${n}`,i%2?.12:.85,.22+i*.18,-5.3,.16,(i-2)*5,'far',.2,'fixed',3,motion(20+i,i+5,4,4)))
  ]},
  world04:{id:'04',title:'MAD TEA PARTY',density:.41,palette:{cream:'#F6EFE4',dustyRose:'#D8A6AC',rose:'#C98793',sage:'#A9B29B',gold:'#C9AD76'},objects:[
    object('flowersLeft','procedural:rose-cluster',.08,.38,-2.6,.38,-7,'mid',.87,'y-axis',1,motion(15,0,8,11)),
    object('flowersRight','procedural:rose-cluster',.92,.34,-3.1,.34,6,'mid',.87,'y-axis',1,motion(16,1,7,10)),
    object('hangingLeft','procedural:hanging-flowers',.12,.10,-4.5,.22,-7,'far',.58,'y-axis',2,motion(17,2,5,7)),
    object('floatingCup','procedural:teacup-saucer',.86,.58,-2.1,.24,5,'mid',.94,'fixed',1,motion(14,5,11,14)),
    object('teapot','procedural:teapot',.10,.70,-2.55,.30,-5,'mid',.90,'fixed',2,motion(17,7,8,8)),
    object('cake','procedural:cake',.72,.83,-1.55,.20,0,'near',.97,'fixed',2,motion(16,9,10,6)),
    object('tableHint','procedural:tea-table',.50,.91,-2.8,1,0,'mid',.88,'fixed',1,motion(24,0,0,0,0))
  ]}
});
