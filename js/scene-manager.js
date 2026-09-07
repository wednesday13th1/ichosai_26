export const SceneType=Object.freeze({CLOCK:'clock',CARDS:'cards',CHESS:'chess',TEA_PARTY:'tea-party'});
const valid=new Set(Object.values(SceneType));
export function createSceneManager(initial=SceneType.CLOCK){let scene=valid.has(initial)?initial:SceneType.CLOCK;return{setScene(next){if(!valid.has(next))throw new Error(`Unknown scene: ${next}`);scene=next;return scene;},getScene(){return scene;},reset(){scene=SceneType.CLOCK;return scene;}};}
