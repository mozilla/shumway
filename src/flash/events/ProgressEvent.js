function ProgressEvent(type, bubbles, cancelable, bytesLoaded, bytesTotal){
  Object.defineProperties(this, {
    type:        descConst(type),
    bubbles:     descConst(bubbles !== undefined ? !!bubbles : true),
    cancelable:  descConst(!!cancelable),
    bytesLoaded: descProp(bytesLoaded || 0),
    bytesTotal:  descProp(bytesTotal || 0)
  });
}

Object.defineProperties(ProgressEvent, {
  PROGRESS:    descConst('progress'),
  SOCKET_DATA: descConst('socketData')
});

ProgressEvent.prototype = Object.create(new Event, {
  clone: descMethod(function () {
    return new ProgressEvent(
      this.type,
      this.bubbles,
      this.cancelable,
      this.bytesLoaded,
      this.bytesTotal
    );
  }),
  toString: descMethod(function () {
    return this.formatToString('ProgressEvent',
      'type',
      'bubbles',
      'cancelable',
      'eventPhase',
      'bytesLoaded',
      'bytesTotal'
    );
  })
});
