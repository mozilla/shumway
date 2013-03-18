var TextFieldDefinition = (function () {
  var def = {
    __class__: 'flash.text.TextField',

    initialize: function () {
      this._defaultTextFormat = null;

      var s = this.symbol;
      if (s) {
        this.draw = s.draw || this.draw;
        this.text = s.text || '';
      }
    },

    _getAS2Object: function () {
      if (!this.$as2Object) {
        new AS2TextField().$attachNativeObject(this);
      }
      return this.$as2Object;
    },

    replaceText: function(begin, end, str) {
      this._text = this._text.substring(0, begin) + str + this._text.substring(end);
      this._markAsDirty();
    },

    draw: function (c) {
      // TODO
      var bbox = this._bbox;
      if (!bbox) {
        return;
      }
      c.save();
      c.beginPath();
      c.rect(bbox.left, bbox.top, bbox.right - bbox.left, bbox.bottom - bbox.top);
      c.clip();
      c.fillText(this.text, bbox.left, bbox.bottom);
      c.restore();
    },

    get text() {
      return this._text;
    },
    set text(val) {
      if (this._text !== val) {
        this._text = val;
        this._markAsDirty();
      }
    },

    get defaultTextFormat() {
      return this._defaultTextFormat;
    },
    set	defaultTextFormat(val) {
      this._defaultTextFormat = val;
    },

    getTextFormat: function (beginIndex /*:int = -1*/, endIndex /*:int = -1*/) {
      return null; // TODO
    },
    setTextFormat: function (format, beginIndex /*:int = -1*/, endIndex /*:int = -1*/) {
      // TODO
    },
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        text: desc(def, "text"),
        defaultTextFormat: desc(def, "defaultTextFormat"),
        draw: def.draw,
        replaceText: def.replaceText,
        getTextFormat: def.getTextFormat,
        setTextFormat: def.setTextFormat,
      }
    }
  };

  return def;
}).call(this);
