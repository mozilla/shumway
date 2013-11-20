var Demo = (function() {

  var demo = function(ctx, stats) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.stats = stats;

    this.shape = "logo";

    this.blur = {
      enabled: true,
      quality: 1,
      blurX: 4,
      blurY: 4
    };
    this.dropshadow = {
      enabled: false,
      distance: 4,
      angle: 45,
      color: "#000000",
      alpha: 1.0,
      blurX: 4.0,
      blurY: 4.0,
      strength: 1.0,
      quality: 1,
      inner: false,
      knockout: false,
      hideObject: false
    };

    this.currentShape = null;
    this.canvasShape = document.createElement("canvas");
    this.ctxShape = this.canvasShape.getContext("2d");
    this.canvasShapeTmp = document.createElement("canvas");
    this.ctxShapeTmp = this.canvasShapeTmp.getContext("2d");

    this.dirty = true;
    this.bounds = null;
    this.filterBounds = null;

    this.animate();
  };

  function doBlur(pimg, w, h, blurParams) {
    var bx = blurParams.blurX;
    var by = blurParams.blurY;
    FILTERS.blur(pimg, w, h, bx, by, blurParams.quality, 0);
  }

  function doDropshadow(pimg, w, h, dsParams) {
    var a = dsParams.angle * Math.PI / 180;
    var dy = Math.round(Math.sin(a) * dsParams.distance);
    var dx = Math.round(Math.cos(a) * dsParams.distance);
    var bx = dsParams.blurX;
    var by = dsParams.blurY;
    var color = parseInt(dsParams.color.substr(1), 16);
    var flags = (dsParams.inner ? 1 : 0) | (dsParams.knockout ? 2 : 0) | (dsParams.hideObject ? 4 : 0);
    FILTERS.dropshadow(pimg, w, h, dx, dy, color, dsParams.alpha, bx, by, dsParams.strength, dsParams.quality, flags);
  }

  demo.prototype = {

    animate: function animate() {
      requestAnimFrame(this.animate.bind(this));

      if (this.dirty) {
        this.blur.quality = +this.blur.quality;
        this.dropshadow.quality = +this.dropshadow.quality;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.drawShape();
        this.dirty = false;
      }

      var w = this.canvasShape.width;
      var h = this.canvasShape.height;

      this.stats.begin();

      var img = this.ctxShape.getImageData(0, 0, w, h);
      var imgData = img.data;

      if (this.hasActiveFilters()) {
        var pimg = Module._malloc(imgData.length);
        Module.HEAPU8.set(imgData, pimg);

        FILTERS.preMultiplyAlpha(pimg, w, h);
        if (this.dropshadow.enabled) {
          doDropshadow(pimg, w, h, this.dropshadow);
        }
        if (this.blur.enabled) {
          doBlur(pimg, w, h, this.blur);
        }
        FILTERS.unpreMultiplyAlpha(pimg, w, h);

        imgData.set(Module.HEAPU8.subarray(pimg, pimg + imgData.length));
        Module._free(pimg);
      }

      this.ctxShapeTmp.putImageData(img, 0, 0);
      this.ctxShapeTmp.strokeStyle = "rgba(0, 0, 0, 0.2)";
      this.ctxShapeTmp.strokeRect(0, 0, this.canvasShapeTmp.width, this.canvasShapeTmp.height);

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(
        this.canvasShapeTmp,
        (this.canvas.width - this.bounds.w) / 2 + this.filterBounds.x,
        (this.canvas.height - this.bounds.h) / 2 + this.filterBounds.y
      );

      this.stats.end();
    },

    drawShape: function drawShape() {
      switch (this.shape) {
        case "square":
          this.bounds = { x: 0, y: 0, w: 50, h: 50 };
          this.calcFilterBounds();
          this.canvasShape.width = this.canvasShapeTmp.width = this.filterBounds.w;
          this.canvasShape.height = this.canvasShapeTmp.height = this.filterBounds.h;
          this.ctxShape.save();
          this.ctxShape.translate(-this.filterBounds.x, -this.filterBounds.y);
          this.ctxShape.fillStyle = "rgba(255, 0, 0, 1)";
          this.ctxShape.fillRect(0, 0, 50, 50);
          this.ctxShape.restore();
          break;
        case "logo":
          var that = this;
          var logo = this._logoImg;
          this.bounds = { x: 0, y: 0, w: 200, h: 195 };
          this.calcFilterBounds();
          this.canvasShape.width = this.canvasShapeTmp.width = this.filterBounds.w;
          this.canvasShape.height = this.canvasShapeTmp.height = this.filterBounds.h;
          function drawLogo() {
            that.ctxShape.save();
            that.ctxShape.translate(-that.filterBounds.x, -that.filterBounds.y);
            that.ctxShape.drawImage(logo, 0, 0);
            that.ctxShape.restore();
          }
          if (typeof logo == "undefined") {
            logo = this._logoImg = new Image();
            logo.onload = drawLogo;
            logo.src = "assets/firefox_logo.png";
          } else {
            drawLogo();
          }
          break;
      }
      this.currentShape = this.shape;
    },

    calcFilterBounds: function calcFilterBounds() {
      var fb = this.filterBounds = {
        x: this.bounds.x,
        y: this.bounds.y,
        w: this.bounds.w,
        h: this.bounds.h
      };
      if (this.hasActiveFilters()) {
        var bq, bx, by;
        var dsParams = this.dropshadow;
        var blurParams = this.blur;
        if (dsParams.enabled) {
          var a = dsParams.angle * Math.PI / 180;
          var dy = Math.round(Math.sin(a) * dsParams.distance);
          var dx = Math.round(Math.cos(a) * dsParams.distance);
          bq = dsParams.quality;
          bx = dsParams.blurX * bq;
          by = dsParams.blurY * bq;
          fb.x -= bx - Math.min(dx, 0);
          fb.y -= by - Math.min(dy, 0);
          fb.w += bx * 2 + Math.abs(dx);
          fb.h += by * 2 + Math.abs(dy);
        }
        if (blurParams.enabled) {
          bq = blurParams.quality;
          bx = blurParams.blurX * bq;
          by = blurParams.blurY * bq;
          fb.x -= bx;
          fb.y -= by;
          fb.w += bx * 2;
          fb.h += by * 2;
        }
      }
    },

    hasActiveFilters: function hasActiveFilters() {
      return this.blur.enabled || this.dropshadow.enabled;
    }

  };

  return demo;

})();
