const MouseEventDefinition = (function () {
  var def = {
    __class__: 'flash.events.MouseEvent',

    updateAfterEvent: function () {
      notImplemented();
    }
  };

  def.__glue__ = {
    scriptProperties: {
      relatedObject: 'private m_relatedObject',
      ctrlKey: 'private m_ctrlKey',
      altKey: 'private m_altKey',
      shiftKey: 'private m_shiftKey',
      buttonDown: 'private m_buttonDown',
      delta: 'private m_delta',
      isRelatedObjectInaccessible: 'private m_isRelatedObjectInaccessible'
    },

    scriptStatics: {
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

    nativeMethods: {
      "get localX": function () { return this.localX; },
      "get localY": function () { return this.localY; },
      "set localX": function (v) { this.localX = v; },
      "set localY": function (v) { this.localY = v; },
      getStageX: function () { notImplemented() },
      getStageY: function () { notImplemented() },
      updateAfterEvent: def.updateAfterEvent
    }
  };

  return def;
}).call(this);
