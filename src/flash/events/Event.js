var EVENT_PHASE_CAPTURING_PHASE = 1;
var EVENT_PHASE_AT_TARGET       = 2;
var EVENT_PHASE_BUBBLING_PHASE  = 3;

function Event(type, bubbles, cancelable) {
  Object.defineProperties(this, {
    type:       describeProperty(type),
    bubbles:    describeProperty(!!bubbles),
    cancelable: describeProperty(!!cancelable)
  });

  this._canceled = false;
  this._eventPhase = EVENT_PHASE_AT_TARGET;
  this._currentTarget = null;
  this._target = null;
}

Object.defineProperties(Event, {
  ACTIVATE:                     describeConst('activate'),
  ADDED:                        describeConst('added'),
  ADDED_TO_STAGE:               describeConst('addedToStage'),
  CANCEL:                       describeConst('cancel'),
  CHANGE:                       describeConst('change'),
  CLEAR:                        describeConst('clear'),
  CLOSE:                        describeConst('close'),
  COMPLETE:                     describeConst('complete'),
  CONNECT:                      describeConst('connect'),
  COPY:                         describeConst('copy'),
  CUT:                          describeConst('cut'),
  DEACTIVATE:                   describeConst('deactivate'),
  ENTER_FRAME:                  describeConst('enterFrame'),
  FRAME_CONSTRUCTED:            describeConst('frameConstructed'),
  EXIT_FRAME:                   describeConst('exitFrame'),
  ID3:                          describeConst('id3'),
  INIT:                         describeConst('init'),
  MOUSE_LEAVE:                  describeConst('mouseLeave'),
  OPEN:                         describeConst('open'),
  PASTE:                        describeConst('paste'),
  REMOVED:                      describeConst('removed'),
  REMOVED_FROM_STAGE:           describeConst('removedFromStage'),
  RENDER:                       describeConst('render'),
  RESIZE:                       describeConst('resize'),
  SCROLL:                       describeConst('scroll'),
  TEXT_INTERACTION_MODE_CHANGE: describeConst('textInteractionModeChange'),
  SELECT:                       describeConst('select'),
  SELECT_ALL:                   describeConst('selectAll'),
  SOUND_COMPLETE:               describeConst('soundComplete'),
  TAB_CHILDREN_CHANGE:          describeConst('tabChildrenChange'),
  TAB_INDEX_CHANGE:             describeConst('tabIndexChange'),
  UNLOAD:                       describeConst('unload'),
  FULLSCREEN:                   describeConst('fullscreen'),
  HTML_BOUNDS_CHANGE:           describeConst('htmlBoundsChange'),
  HTML_RENDER:                  describeConst('htmlRender'),
  HTML_DOM_INITIALIZE:          describeConst('htmlDOMInitialize'),
  LOCATION_CHANGE:              describeConst('locationChange'),
  VIDEO_FRAME:                  describeConst('videoFrame')
});

Event.prototype = Object.create(null, {
  __class__: describeProperty('flash.events.Event'),

  clone: describeMethod(function () {
    return new Event(this.type, this.bubbles, this.cancelable);
  }),
  currentTarget: describeAccessor(function () {
    return this._currentTarget;
  }),
  eventPhase: describeAccessor(function () {
    return this._eventPhase;
  }),
  formatToString: describeMethod(function (className) {
    var str = '[' + className;
    for (var i = 0, n = arguments.length; i < n; i++) {
      var prop = arguments[i];
      var val = this[prop];
      str += ' ' + prop + '=' + (val instanceof String ? '"' + val + '"' : val);
    }
    str += ']';
    return str;
  }),
  isDefaultPrevented: describeMethod(function () {
    return this._isDefaultPrevented;
  }),
  preventDefault: describeMethod(function () {
    this._isDefaultPrevented = true;
  }),
  stopImmediatePropagation: describeMethod(function () {
    notImplemented();
  }),
  stopPropagation: describeMethod(function () {
    notImplemented();
  }),
  target: describeAccessor(function () {
    return this._target;
  }),
  toString: describeMethod(function () {
    return this.formatToString('Event', 'type', 'bubbles', 'cancelable', 'eventPhase');
  })
});
