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
    type:          describeProperty(type),
    bubbles:       describeProperty(bubbles !== undefined ? !!bubbles : true),
    cancelable:    describeProperty(!!cancelable)
    localX:        describeProperty(localX || 0),
    localY:        describeProperty(localY || 0),
    relatedObject: describeProperty(relatedObject || null),
    ctrlKey:       describeProperty(!!ctrlKey),
    altKey:        describeProperty(!!altKey),
    shiftKey:      describeProperty(!!shiftKey),
    buttonDown:    describeProperty(!!buttonDown),
    delta:         describeProperty(delta || 0)
  );
}

Object.defineProperties(MouseEvent, {
  CLICK:        describeConst('click'),
  DOUBLE_CLICK: describeConst('doubleClick'),
  MOUSE_DOWN:   describeConst('mouseDown'),
  MOUSE_MOVE:   describeConst('mouseMove'),
  MOUSE_OUT:    describeConst('mouseOut'),
  MOUSE_OVER:   describeConst('mouseOver'),
  MOUSE_UP:     describeConst('mouseUp'),
  MOUSE_WHEEL:  describeConst('mouseWheel'),
  ROLL_OUT:     describeConst('rollOut'),
  ROLL_OVER:    describeConst('rollOver')
});

MouseEvent.prototype = Object.create(new Event, {
  __class__: describeInternalProperty('flash.events.MouseEvent'),

  isRelatedObjectInaccessible: describeAccessor(
    function () {
      return false;
    },
    function () {
      notImplemented();
    }
  ),
  stageX: describeAccessor(function () {
    notImplemented();
  }),
  stageY: describeAccessor(function () {
    notImplemented();
  }),

  clone: describeMethod(function () {
    return new Event(
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
  toString: describeMethod(function () {
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
  updateAfterEvent: describeMethod(function () {
    notImplemented();
  })
});
