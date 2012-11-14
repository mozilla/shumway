var MouseEventDefinition = (function () {
  var def = {
    __class__: 'flash.events.MouseEvent',

    updateAfterEvent: function () {
      notImplemented();
    }
  };

  def.__glue__ = {
    script: {
      instance: {
        relatedObject: 'private m_relatedObject',
        ctrlKey: 'private m_ctrlKey',
        altKey: 'private m_altKey',
        shiftKey: 'private m_shiftKey',
        buttonDown: 'private m_buttonDown',
        delta: 'private m_delta',
        isRelatedObjectInaccessible: 'private m_isRelatedObjectInaccessible'
      },

      static: {
        CLICK:        'public CLICK',
        DOUBLE_CLICK: 'public DOUBLE_CLICK',
        MOUSE_DOWN:   'public MOUSE_DOWN',
        MOUSE_MOVE:   'public MOUSE_MOVE',
        MOUSE_OUT:    'public MOUSE_OUT',
        MOUSE_OVER:   'public MOUSE_OVER',
        MOUSE_UP:     'public MOUSE_UP',
        MOUSE_WHEEL:  'public MOUSE_WHEEL',
        ROLL_OUT:     'public ROLL_OUT',
        ROLL_OVER:    'public ROLL_OVER'
      },
    },

    native: {
      instance: {
        localX: {
          get: function () { return this.localX; },
          set: function (v) { this.localX = v; }
        },
        localY: {
          get: function () { return this.localY; },
          set: function (v) { this.localY = v; },
        },
        getStageX: function () { notImplemented() },
        getStageY: function () { notImplemented() },
        updateAfterEvent: def.updateAfterEvent
      }
    }
  };

  return def;
}).call(this);
