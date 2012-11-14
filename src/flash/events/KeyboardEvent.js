var KeyboardEventDefinition = (function () {
  var def = {
    __class__: 'flash.events.KeyboardEvent',

    updateAfterEvent: function () {
      notImplemented();
    },
    get keyCode() {
      return this.private$flash$events$KeyboardEvent$m_keyCode;
    }
  };

  def.__glue__ = {
    script: {
      instance: scriptProperties("private", ["m_keyCode",
                                             "m_keyLocation"]),
      static: scriptProperties("public", ["KEY_DOWN",
                                          "KEY_UP"])
    },

    native: {
      instance: {
        charCode: {
          get: function () { return this.charCode; },
          set: function (v) { this.charCode = v; }
        },
        ctrlKey: {
          get: function () { return this.ctrlKey; },
          set: function (v) { this.ctrlKey = v; }
        },
        altKey: {
          get: function () { return this.altKey; },
          set: function (v) { this.altKey = v; }
        },
        shiftKey: {
          get: function () { return this.shiftKey; },
          set: function (v) { this.shiftKey = v; }
        },
        updateAfterEvent: def.updateAfterEvent
      }
    }
  };

  return def;
}).call(this);
