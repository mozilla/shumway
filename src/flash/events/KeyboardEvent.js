function KeyboardEvent(type,
                       bubbles,
                       cancelable,
                       charCode,
                       keyCode,
                       keyLocation,
                       ctrlKey,
                       altKey,
                       shiftKey) {
  Object.defineProperties(
    type:        describeProperty(type),
    bubbles:     describeProperty(bubbles !== undefined ? !!bubbles : true),
    cancelable:  describeProperty(!!cancelable)
    charCode:    describeProperty(charCode || 0),
    keyCode:     describeProperty(keyCode || 0),
    keyLocation: describeProperty(keyLocation || 0),
    ctrlKey:     describeProperty(!!ctrlKey),
    altKey:      describeProperty(!!altKey),
    shiftKey:    describeProperty(!!shiftKey)
  );
}

Object.defineProperties(KeyboardEvent, {
  KEY_DOWN: describeConst('keyDown'),
  KEY_UP:   describeConst('keyUp')
});

KeyboardEvent.prototype = Object.create(new Event, {
  __class__: describeInternalProperty('flash.events.KeyboardEvent'),

  clone: describeMethod(function () {
    return new Event(
      this.type,
      this.bubbles,
      this.cancelable,
      this.charCodeValue,
      this.keyCodeValue,
      this.keyLocationValue,
      this.ctrlKeyValue,
      this.altKeyValue,
      this.shiftKeyValue
    );
  }),
  toString: describeMethod(function () {
    return this.formatToString(
      'KeyboardEvent',
      'type',
      'bubbles',
      'cancelable',
      'eventPhase',
      'charCode',
      'keyCode',
      'keyLocation',
      'ctrlKey',
      'altKey',
      'shiftKey'
    );
  }),
  updateAfterEvent: describeMethod(function () {
    notImplemented();
  })
});
