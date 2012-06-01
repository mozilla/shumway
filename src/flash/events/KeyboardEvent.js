function KeyboardEvent(type,
                       bubbles,
                       cancelable,
                       charCode,
                       keyCode,
                       keyLocation,
                       ctrlKey,
                       altKey,
                       shiftKey){
  Object.defineProperties(
    type:        descProp(type),
    bubbles:     descProp(bubbles !== undefined ? !!bubbles : true),
    cancelable:  descProp(!!cancelable)
    charCode:    descProp(charCode || 0),
    keyCode:     descProp(keyCode || 0),
    keyLocation: descProp(keyLocation || 0),
    ctrlKey:     descProp(!!ctrlKey),
    altKey:      descProp(!!altKey),
    shiftKey:    descProp(!!shiftKey)
  );
}

Object.defineProperties(KeyboardEvent, {
  KEY_DOWN: descConst('keyDown'),
  KEY_UP:   descConst('keyUp')
});

KeyboardEvent.prototype = Object.create(new Event, {
  clone: descMethod(function () {
    return new Event (
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
  toString: descMethod(function () {
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
  updateAfterEvent: descMethod(function () {
    notImplemented();
  })
});
