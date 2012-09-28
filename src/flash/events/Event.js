const EventDefinition = (function () {
  var EVENT_PHASE_CAPTURING_PHASE = 1;
  var EVENT_PHASE_AT_TARGET       = 2;
  var EVENT_PHASE_BUBBLING_PHASE  = 3;

  return {
    __class__: 'flash.events.Event',

    initialize: function () {
      this._canceled = false;
      this._eventPhase = EVENT_PHASE_AT_TARGET;
      this._currentTarget = null;
      this._target = null;
    }

    ctor: function (type, bubbles, cancelable) {
      this.type = type;
      this.bubbles = !!bubbles;
      this.cancelable = !!cancelable;
    },

    clone: function () {
      return new Event(this.type, this.bubbles, this.cancelable);
    },
    get currentTarget() {
      return this._currentTarget;
    },
    get eventPhase() {
      return this._eventPhase;
    },
    isDefaultPrevented: function () {
      return this._isDefaultPrevented;
    },
    preventDefault: function () {
      this._isDefaultPrevented = true;
    },
    stopImmediatePropagation: function () {
      notImplemented();
    },
    stopPropagation: function () {
      notImplemented();
    },
    get target: () {
      return this._target;
    },
  };

  def.__glue__ = {
    scriptStatics: {
      ACTIVATE:                     'public ACTIVATE',
      ADDED:                        'public ADDED',
      ADDED_TO_STAGE:               'public ADDED_TO_STAGE',
      CANCEL:                       'public CANCEL',
      CHANGE:                       'public CHANGE',
      CLEAR:                        'public CLEAR',
      CLOSE:                        'public CLOSE',
      COMPLETE:                     'public COMPLETE',
      CONNECT:                      'public CONNECT',
      COPY:                         'public COPY',
      CUT:                          'public CUT',
      DEACTIVATE:                   'public DEACTIVATE',
      ENTER_FRAME:                  'public ENTER_FRAME',
      FRAME_CONSTRUCTED:            'public FRAME_CONSTRUCTED',
      EXIT_FRAME:                   'public EXIT_FRAME',
      ID3:                          'public ID3',
      INIT:                         'public INIT',
      MOUSE_LEAVE:                  'public MOUSE_LEAVE',
      OPEN:                         'public OPEN',
      PASTE:                        'public PASTE',
      REMOVED:                      'public REMOVED',
      REMOVED_FROM_STAGE:           'public REMOVED_FROM_STAGE',
      RENDER:                       'public RENDER',
      RESIZE:                       'public RESIZE',
      SCROLL:                       'public SCROLL',
      TEXT_INTERACTION_MODE_CHANGE: 'public TEXT_INTERACTION_MODE_CHANGE',
      SELECT:                       'public SELECT',
      SELECT_ALL:                   'public SELECT_ALL',
      SOUND_COMPLETE:               'public SOUND_COMPLETE',
      TAB_CHILDREN_CHANGE:          'public TAB_CHILDREN_CHANGE',
      TAB_INDEX_CHANGE:             'public TAB_INDEX_CHANGE',
      UNLOAD:                       'public UNLOAD',
      FULLSCREEN:                   'public FULLSCREEN',
      HTML_BOUNDS_CHANGE:           'public HTML_BOUNDS_CHANGE',
      HTML_RENDER:                  'public HTML_RENDER',
      HTML_DOM_INITIALIZE:          'public HTML_DOM_INITIALIZE',
      LOCATION_CHANGE:              'public LOCATION_CHANGE',
      VIDEO_FRAME:                  'public VIDEO_FRAME'
    }
  };

  return def;
}).call(this);
