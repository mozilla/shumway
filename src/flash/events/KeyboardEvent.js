const KeyboardEventDefinition = (function () {
  var def = {
    __class__: 'flash.events.KeyboardEvent',

    updateAfterEvent: function () {
      notImplemented();
    }
  };

  def.__glue__ = {
    scriptProperties: {
      keyCode: "private m_keyCode",
      keyLocation: "private m_keyLocation"
    },

    scriptStatics: {
      KEY_DOWN: "public KEY_DOWN",
      KEY_UP: "public KEY_UP"
    },

    nativeMethods: {
      "get charCode": function () { return this.charCode; },
      "get ctrlKey": function () { return this.ctrlKey; },
      "get altKey": function () { return this.altKey; },
      "get shiftKey": function () { return this.shiftKey; },
      "set charCode": function (v) { this.charCode = v; },
      "set ctrlKey": function (v) { this.ctrlKey = v; },
      "set altKey": function (v) { this.altKey = v; },
      "set shiftKey": function (v) { this.shiftKey = v; },
      updateAfterEvent: def.updateAfterEvent
    }
  };

  return def;
}).call(this);
