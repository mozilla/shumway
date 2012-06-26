function Event(type, bubbles, cancelable) {
  Object.defineProperties(this, {
    type:       descProp(type),
    bubbles:    descProp(!!bubbles),
    cancelable: descProp(!!cancelable)
  });

  this._canceled = false;
  this._eventPhase = EventPhase.AT_TARGET;
  this._currentTarget = null;
  this._target = null;
}

Object.defineProperties(Event, {
  ACTIVATE:                     descConst('activate'),
  ADDED:                        descConst('added'),
  ADDED_TO_STAGE:               descConst('addedToStage'),
  CANCEL:                       descConst('cancel'),
  CHANGE:                       descConst('change'),
  CLEAR:                        descConst('clear'),
  CLOSE:                        descConst('close'),
  COMPLETE:                     descConst('complete'),
  CONNECT:                      descConst('connect'),
  COPY:                         descConst('copy'),
  CUT:                          descConst('cut'),
  DEACTIVATE:                   descConst('deactivate'),
  ENTER_FRAME:                  descConst('enterFrame'),
  FRAME_CONSTRUCTED:            descConst('frameConstructed'),
  EXIT_FRAME:                   descConst('exitFrame'),
  ID3:                          descConst('id3'),
  INIT:                         descConst('init'),
  MOUSE_LEAVE:                  descConst('mouseLeave'),
  OPEN:                         descConst('open'),
  PASTE:                        descConst('paste'),
  REMOVED:                      descConst('removed'),
  REMOVED_FROM_STAGE:           descConst('removedFromStage'),
  RENDER:                       descConst('render'),
  RESIZE:                       descConst('resize'),
  SCROLL:                       descConst('scroll'),
  TEXT_INTERACTION_MODE_CHANGE: descConst('textInteractionModeChange'),
  SELECT:                       descConst('select'),
  SELECT_ALL:                   descConst('selectAll'),
  SOUND_COMPLETE:               descConst('soundComplete'),
  TAB_CHILDREN_CHANGE:          descConst('tabChildrenChange'),
  TAB_INDEX_CHANGE:             descConst('tabIndexChange'),
  UNLOAD:                       descConst('unload'),
  FULLSCREEN:                   descConst('fullscreen'),
  HTML_BOUNDS_CHANGE:           descConst('htmlBoundsChange'),
  HTML_RENDER:                  descConst('htmlRender'),
  HTML_DOM_INITIALIZE:          descConst('htmlDOMInitialize'),
  LOCATION_CHANGE:              descConst('locationChange'),
  VIDEO_FRAME:                  descConst('videoFrame')
});

Event.prototype = Object.create(null, {
  clone: descMethod(function () {
    return new Event(this.type, this.bubbles, this.cancelable);
  }),
  currentTarget: descAccessor(function () {
    return this._currentTarget;
  }),
  eventPhase: descAccessor(function () {
    return this._eventPhase;
  }),
  formatToString: descMethod(function (className) {
    var str = '[' + className;
    for (var i = 0, n = arguments.length; i < n; i++) {
      var prop = arguments[i];
      var val = this[prop];
      str += ' ' + prop + '=' + (val instanceof String ? '"' + val + '"' : val);
    }
    str += ']';
    return str;
  }),
  isDefaultPrevented: descMethod(function () {
    return this._isDefaultPrevented;
  }),
  preventDefault: descMethod(function () {
    this._isDefaultPrevented = true;
  }),
  stopImmediatePropagation: descMethod(function () {
    notImplemented();
  }),
  stopPropagation: descMethod(function () {
    notImplemented();
  }),
  target: descAccessor(function () {
    return this._target;
  }),
  toString: descMethod(function () {
    return this.formatToString('Event', 'type', 'bubbles', 'cancelable', 'eventPhase');
  })
});
