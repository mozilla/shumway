function MouseEvent(type,
                    bubbles,
                    cancelable,
                    localX,
                    localY,
                    relatedObject,
                    ctrlKey,
                    altKey,
                    shiftKey,
                    buttonDown,
                    delta){
  Object.defineProperties(
    type:          descProp(type),
    bubbles:       descProp(bubbles !== undefined ? !!bubbles : true),
    cancelable:    descProp(!!cancelable)
    localX:        descProp(localX || 0),
    localY:        descProp(localY || 0),
    relatedObject: descProp(relatedObject || null),
    ctrlKey:       descProp(!!ctrlKey),
    altKey:        descProp(!!altKey),
    shiftKey:      descProp(!!shiftKey),
    buttonDown:    descProp(!!buttonDown),
    delta:         descProp(delta || 0)
  );
}

Object.defineProperties(MouseEvent, {
  CLICK:        descConst('click'),
  DOUBLE_CLICK: descConst('doubleClick'),
  MOUSE_DOWN:   descConst('mouseDown'),
  MOUSE_MOVE:   descConst('mouseMove'),
  MOUSE_OUT:    descConst('mouseOut'),
  MOUSE_OVER:   descConst('mouseOver'),
  MOUSE_UP:     descConst('mouseUp'),
  MOUSE_WHEEL:  descConst('mouseWheel'),
  ROLL_OUT:     descConst('rollOut'),
  ROLL_OVER:    descConst('rollOver')

});

MouseEvent.prototype = Object.create(new Event, {
  stageX: descAccessor(function () {
    notImplemented();
  }),
  stageY: descAccessor(function () {
    notImplemented();
  }),
  isRelatedObjectInaccessible: descAccessor(
    function () {
      return false;
    },
    function () {
      notImplemented();
    }
  ),

  clone: descMethod(function () {
    return new Event (
      this.type,
      this.bubbles,
      this.cancelable,
      this.localX,
      this.localY,
      this.relatedObject,
      this.ctrlKey,
      this.altKey,
      this.shiftKey,
      this.buttonDown,
      this.delta
    );
  }),
  toString: descMethod(function () {
    return this.formatToString(
      'MouseEvent',
      'type',
      'bubbles',
      'cancelable',
      'eventPhase',
      'localX',
      'localY',
      'stageX',
      'stageY',
      'relatedObject',
      'ctrlKey',
      'altKey',
      'shiftKey',
      'buttonDown',
      'delta'
    );
  }),
  updateAfterEvent: descMethod(function () {
    notImplemented();
  })
});
