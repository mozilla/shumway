function EventPhase(){
}

Object.defineProperties(EventPhase, {
  CAPTURING_PHASE: descConst(1),
  AT_TARGET:       descConst(2),
  BUBBLING_PHASE:  descConst(3)
});
