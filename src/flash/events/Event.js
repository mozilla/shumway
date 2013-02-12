var EventDefinition = (function () {
  var EVENT_PHASE_CAPTURING_PHASE = 1;
  var EVENT_PHASE_AT_TARGET       = 2;
  var EVENT_PHASE_BUBBLING_PHASE  = 3;

  var def = {
    __class__: 'flash.events.Event',

    initialize: function () {
      this._canceled = false;
      this._eventPhase = EVENT_PHASE_AT_TARGET;
      this._currentTarget = null;
      this._target = null;
    },

    get currentTarget() {
      return this._currentTarget;
    },
    get eventPhase() {
      return this._eventPhase;
    },
    get target() {
      return this._target;
    },

    ctor: function (type, bubbles, cancelable) {
      Counter.count("Event: " + type);
      this.type = type;
      this.bubbles = !!bubbles;
      this.cancelable = !!cancelable;
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
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    script: {
      static: scriptProperties("public", ['ACTIVATE',
                                          'ADDED',
                                          'ADDED_TO_STAGE',
                                          'CANCEL',
                                          'CHANGE',
                                          'CLEAR',
                                          'CLOSE',
                                          'COMPLETE',
                                          'CONNECT',
                                          'COPY',
                                          'CUT',
                                          'DEACTIVATE',
                                          'ENTER_FRAME',
                                          'FRAME_CONSTRUCTED',
                                          'EXIT_FRAME',
                                          'ID3',
                                          'INIT',
                                          'MOUSE_LEAVE',
                                          'OPEN',
                                          'PASTE',
                                          'PROGRESS',
                                          'REMOVED',
                                          'REMOVED_FROM_STAGE',
                                          'RENDER',
                                          'RESIZE',
                                          'SCROLL',
                                          'TEXT_INTERACTION_MODE_CHANGE',
                                          'SELECT',
                                          'SELECT_ALL',
                                          'SOUND_COMPLETE',
                                          'TAB_CHILDREN_CHANGE',
                                          'TAB_INDEX_CHANGE',
                                          'UNLOAD',
                                          'FULLSCREEN',
                                          'HTML_BOUNDS_CHANGE',
                                          'HTML_RENDER',
                                          'HTML_DOM_INITIALIZE',
                                          'LOCATION_CHANGE',
                                          'VIDEO_FRAME'])
    },

    native: {
      instance: {
        type: {
          get: function () { return this.type; }
        },
        bubbles: {
          get: function () { return this.bubbles; }
        },
        cancelable: {
          get: function () { return this.cancelable; }
        },
        target: desc(def, "target"),
        currentTarget: desc(def, "currentTarget"),
        eventPhase: desc(def, "eventPhase"),
        ctor: def.ctor,
        stopPropagation: def.stopPropagation,
        stopImmediatePropagation: def.stopImmediatePropagation,
        isDefaultPrevented: def.isDefaultPrevented
      }
    }
  };

  return def;
}).call(this);
