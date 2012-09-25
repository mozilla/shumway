function TimerEvent(type, bubbles, cancelable) {
  Event.call(this);

  Object.defineProperties(this, {
    type:        describeConst(type),
    bubbles:     describeConst(bubbles !== undefined ? !!bubbles : true),
    cancelable:  describeConst(!!cancelable)
  });
}

Object.defineProperties(TimerEvent, {
  TIMER:    describeConst('timer'),
  TIMER_COMPLETE: describeConst('timerComplete')
});

TimerEvent.prototype = Object.create(Event.prototype, {
  __class__: describeInternalProperty('flash.events.TimerEvent'),

  clone: describeMethod(function () {
    return new TimerEvent(
      this.type,
      this.bubbles,
      this.cancelable
    );
  }),
  toString: describeMethod(function () {
    return this.formatToString('TimerEvent',
      'type',
      'bubbles',
      'cancelable'
    );
  })
});
