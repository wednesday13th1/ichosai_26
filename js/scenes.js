// Phase 1: screen-relative motion only. No physical tracking or later scenes.
export function animateRabbit(rig, elapsed, reducedMotion = false) {
  const cycle = elapsed % 8;
  const moving = cycle < 3 || cycle > 6;
  const progress = cycle < 3 ? cycle / 3 : cycle < 6 ? 1 : 1-(cycle-6)/2;
  const hop = moving && !reducedMotion ? Math.abs(Math.sin(elapsed*7))*.065 : 0;
  rig.root.position.set((progress-.5)*.23,-.66+hop, -progress*.18);
  rig.root.rotation.y = reducedMotion ? -.15 : moving ? -.38 : .15*Math.sin((cycle-3)*1.7);
  rig.head.rotation.y = moving ? 0 : .25*Math.sin((cycle-3)*1.4);
}
