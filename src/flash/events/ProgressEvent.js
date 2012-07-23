function ProgressEvent(type, bubbles, cancelable, bytesLoaded, bytesTotal) {
  Object.defineProperties(this, {
    type:        describeConst(type),
    bubbles:     describeConst(bubbles !== undefined ? !!bubbles : true),
    cancelable:  describeConst(!!cancelable),
    bytesLoaded: describeProperty(bytesLoaded || 0),
    bytesTotal:  describeProperty(bytesTotal || 0)
  });
}

Object.defineProperties(ProgressEvent, {
  PROGRESS:    describeConst('progress'),
  SOCKET_DATA: describeConst('socketData')
});

ProgressEvent.prototype = Object.create(new Event, {
  __class__: describeProperty('flash.events.ProgressEvent'),

  clone: describeMethod(function () {
    return new ProgressEvent(
      this.type,
      this.bubbles,
      this.cancelable,
      this.bytesLoaded,
      this.bytesTotal
    );
  }),
  toString: describeMethod(function () {
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
