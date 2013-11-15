var Demo = (function() {

  var demo = function(ctx, stats) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.stats = stats;

    this.shape = "logo";

    this.blurEnabled = true;
    this.blurQuality = 2;
    this.blurX = 16;
    this.blurY = 16;

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

  demo.prototype = {

    animate: function animate() {
      requestAnimFrame(this.animate.bind(this));

      if (this.dirty) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.drawShape();
        this.dirty = false;
      }

      if (this.filterBounds === null) {
        return;
      }

      var w = this.canvasShape.width;
      var h = this.canvasShape.height;

      this.stats.begin();

      var img = this.ctxShape.getImageData(0, 0, w, h);
      var imgData = img.data;

      if (this.hasActiveFilters()) {
        var pimg = Module._malloc(imgData.length);
        Module.HEAPU8.set(imgData, pimg);

        FILTERS._preMultiplyAlpha(pimg, w, h);
        if (this.blurEnabled) {
          FILTERS._blur(pimg, w, h, this.blurX, this.blurY, +this.blurQuality);
        }
        FILTERS._unpreMultiplyAlpha(pimg, w, h);

        imgData.set(Module.HEAPU8.subarray(pimg, pimg + imgData.length));
        Module._free(pimg);
      }

      this.ctxShapeTmp.putImageData(img, 0, 0);

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.canvasShapeTmp, (this.canvas.width - this.filterBounds.w) / 2, (this.canvas.height - this.filterBounds.h) / 2);

      this.stats.end();
    },

    drawShape: function drawShape() {
      switch (this.shape) {
        case "square":
          this.bounds = { x: 175, y: 175, w: 50, h: 50 };
          this.calcFilterBounds();
          this.canvasShape.width = this.canvasShapeTmp.width = this.filterBounds.w;
          this.canvasShape.height = this.canvasShapeTmp.height = this.filterBounds.h;
          this.ctxShape.save();
          this.ctxShape.translate(-this.filterBounds.x, -this.filterBounds.y);
          this.ctxShape.fillStyle = "rgba(255, 0, 0, 1)";
          this.ctxShape.fillRect(175, 175, 50, 50);
          this.ctxShape.restore();
          break;
        case "logo":
          var img = new Image();
          var that = this;
          img.onload = function() {
            that.bounds = { x: 0, y: 0, w: 200, h: 195 };
            that.calcFilterBounds();
            that.canvasShape.width = that.canvasShapeTmp.width = that.filterBounds.w;
            that.canvasShape.height = that.canvasShapeTmp.height = that.filterBounds.h;
            that.ctxShape.save();
            that.ctxShape.translate(-that.filterBounds.x, -that.filterBounds.y);
            that.ctxShape.drawImage(img, 0, 0);
            that.ctxShape.restore();
          };
          img.src = "assets/firefox_logo.png";
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
        if (this.blurEnabled) {
          var bq = +this.blurQuality;
          var bx = this.blurX * (bq + 1);
          var by = this.blurY * (bq + 1);
          fb.x -= bx;
          fb.y -= by;
          fb.w += (bx << 1);
          fb.h += (by << 1);
        }
      }
    },

    hasActiveFilters: function hasActiveFilters() {
      return this.blurEnabled;
    }

  };

  return demo;

})();
