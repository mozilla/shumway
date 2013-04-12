var VideoDefinition = (function () {
  var def = {
    initialize: function initialize() {
      this._element = document.createElement('video');
      this._element.setAttribute("style",
          "position: absolute; top:0; left:0; z-index: 100; background: black;");
      this._element.controls = true;
      this._added = false;
    },

    attachNetStream: function (netStream) {
      this._netStream = netStream;
      netStream._urlReady.then(function (url) {
        this._element.src = url;
      }.bind(this));
    },
    ctor: function(width, height) {
      if (width == null) width = 320;
      if (height == null) height = 240;
      this._width = this._videoWidth = width;
      this._height = this._videoHeight = height;
      this._videoScaleX = 1;
      this._videoScaleY = 1;

      this._bbox = {left: 0, top: 0, right: width, bottom: height};

      this._element.addEventListener('loadedmetadata', function () {
        this._videoScaleX = this._width / this._element.videoWidth;
        this._videoScaleY = this._height / this._element.videoHeight;
        this._element.width = this._element.videoWidth;
        this._element.height = this._element.videoHeight;
      }.bind(this));
    },
    draw: function (ctx) {
      if (!this._added) {
        ctx.canvas.parentNode.appendChild(this._element);
        this._element.play();
        this._added = true;
      }

      ctx.beginPath();
      ctx.rect(0, 0, this._width, this._height);
      ctx.clip();
      ctx.clearRect(0, 0, this._width, this._height);

      var scaleX = this._videoScaleX;
      var scaleY = this._videoScaleY;
      var cssTransform = 'transform: scale(' + scaleX + ', ' + scaleY + '); ';
      if (this._currentCssTransform !== cssTransform) {
        this._currentCssTransform = cssTransform;
        this._element.setAttribute("style", "position: absolute; top:0; left:0; z-index: -100;" +
                                   prefix("transform-origin: 0px 0px 0;") +
                                   prefix(cssTransform));
        this._markAsDirty();
      }
    }
  };

  function prefix(prop) {
    return prop + ' -webkit-' + prop + '-ms-' + '-o-' + prop;
  }

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
