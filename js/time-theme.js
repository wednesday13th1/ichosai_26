const THEMES=Object.freeze({
 morning:{name:'morning',label:'GOOD MORNING, ALICE',subtext:'THE STORY IS JUST BEGINNING',sky:0xf6e4c6,ground:0x57504a,key:0xfff0cf,keyIntensity:1.1,particle:0xc9ae74},
 afternoon:{name:'afternoon',label:'A VERY CURIOUS AFTERNOON',subtext:'',sky:0xefe4ce,ground:0x29231f,key:0xffefd3,keyIntensity:1.25,particle:0xb79a61},
 golden:{name:'golden',label:'THE QUEEN IS WAITING',subtext:'',sky:0xe8d6b4,ground:0x4e1820,key:0xffc979,keyIntensity:1.4,particle:0xc49a55},
 night:{name:'night',label:'CURIOUSER AFTER DARK',subtext:"DON'T BE LATE.",sky:0x151c29,ground:0x080a0f,key:0xbfcbea,keyIntensity:.78,particle:0xbbc2c9}
});

export function getTimeTheme(date=new Date()){
 const hour=date.getHours();
 if(hour>=5&&hour<11)return THEMES.morning;
 if(hour>=11&&hour<16)return THEMES.afternoon;
 if(hour>=16&&hour<19)return THEMES.golden;
 return THEMES.night;
}

export function applyTimeTheme(date=new Date()){
 const theme=getTimeTheme(date),root=document.documentElement;
 root.dataset.timeTheme=theme.name;
 const title=document.querySelector('#time-theme-label'),subtitle=document.querySelector('#time-theme-subtext');
 if(title)title.textContent=theme.label;
 if(subtitle){subtitle.textContent=theme.subtext;subtitle.hidden=!theme.subtext;}
 root.dispatchEvent(new CustomEvent('wonderlandthemechange',{detail:theme}));
 return theme;
}

export function formatLocalTime(date=new Date()){
 return new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',hour12:false}).format(date);
}
