var VideoDefinition = (function () {
  var def = {
    initialize: function initialize() {
      this._element = document.createElement('video');
      this._element.controls = false;
      this._element.setAttribute("style", "position: absolute; top:0; left:0; z-index: -100;");
      this._added = false;
    },

    attachNetStream: function (netStream) {
      this._netStream = netStream;
      this._element.src = netStream._url;
    },
    ctor: function(width, height) {
      if (width === undefined) width = 320;
      if (height === undefined) height = 240;
      this._videoWidth = width;
      this._videoHeight = height;
      this._bbox = {left:0, top:0, right:width, bottom:height};

      this._videoScaleX = 1;
      this._videoScaleY = 1;
      this._element.addEventListener('loadedmetadata', function () {
        this._videoScaleX = this._videoWidth / this._element.videoWidth;
        this._videoScaleY = this._videoHeight / this._element.videoHeight;
        this._markAsDirty();
      }.bind(this));
    },
    draw: function (ctx) {
      if (!this._added) {
        ctx.canvas.parentNode.appendChild(this._element);
        this._element.play();
        this._added = true;
      }

      ctx.beginPath();
      ctx.rect(0, 0, this._videoWidth, this._videoHeight);
      ctx.clip();
      ctx.clearRect(0, 0, this._videoWidth, this._videoHeight);

      ctx.save();
      ctx.scale(this._videoScaleX, this._videoScaleY);
      var matrix = ctx.currentTransform;
      var cssTransform = "transform: matrix(" + matrix.a + ", " +
        matrix.b + ", " + matrix.c + ", " + matrix.d + ", " + matrix.e + ", " +
        matrix.f + ");";
      if (this._currentCssTransform !== cssTransform) {
        this._currentCssTransform = cssTransform;
        this._element.setAttribute("style", "position: absolute; top:0; left:0; z-index: -100;" +
                                   "transform-origin: 0px 0px 0;" + cssTransform);
        this._markAsDirty();
      }
      ctx.restore();
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
