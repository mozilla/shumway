var VideoDefinition = (function () {
  var def = {
    initialize: function initialize() {
      this._element = document.createElement('video');
      this._element.controls = true;
      this._element.setAttribute("style", "position: absolute; top: 0px; left: 0px");
      this._added = false;
    },

    attachNetStream: function (netStream) {
      this._netStream = netStream;
      this._element.src = netStream._url;
    },
    ctor: function(width, height) {
      // notImplemented();
    },
    draw: function (ctx) {
      if (!this._added) {
        ctx.canvas.parentNode.appendChild(this._element);
        this._element.play();
        this._added = true;
      }
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        attachNetStream: def.attachNetStream,
        ctor: def.ctor
      }
    }
  };

  return def;
}).call(this);
