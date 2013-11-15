var Demo = (function() {

  var demo = function(ctx, stats) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.stats = stats;

    this.shape = "square";

    this.blurEnabled = true;
    this.blurQuality = 1;
    this.blurX = 16;
    this.blurY = 16;

    this.currentShape = null;
    this.canvasShape = document.createElement("canvas");
    this.ctxShape = this.canvasShape.getContext("2d");
    this.canvasShapeTmp = document.createElement("canvas");
    this.ctxShapeTmp = this.canvasShapeTmp.getContext("2d");

    this.drawShape();
    this.animate();
  };

  demo.prototype = {

    animate: function animate() {
      requestAnimFrame(this.animate.bind(this));

      if (this.hasShapeChanged()) {
        this.drawShape();
      }

      var w = 400;
      var h = 400;

      this.stats.begin();

      var img = this.ctxShape.getImageData(0, 0, w, h);
      var imgData = img.data;

      if (this.hasActiveFilters()) {
        var pimg = Module._malloc(imgData.length);
        Module.HEAPU8.set(imgData, pimg);

        FILTERS._preMultiplyAlpha(pimg, w, h);
        if (this.blurEnabled) {
          FILTERS._blur(pimg, w, h, this.blurX, this.blurY, this.blurQuality);
        }
        FILTERS._unpreMultiplyAlpha(pimg, w, h);

        imgData.set(Module.HEAPU8.subarray(pimg, pimg + imgData.length));
        Module._free(pimg);
      }

      this.ctxShapeTmp.putImageData(img, 0, 0);

      this.ctx.clearRect(0, 0, w, h);
      this.ctx.drawImage(this.canvasShapeTmp, 0, 0);

      this.stats.end();
    },

    drawShape: function drawShape() {
      switch (this.shape) {
        case "square":
          this.canvasShape.width = this.canvasShapeTmp.width = 400;
          this.canvasShape.height = this.canvasShapeTmp.height = 400;
          this.ctxShape.fillStyle = "rgba(255, 0, 0, 1)";
          this.ctxShape.fillRect(175, 175, 50, 50);
          break;
      }
    },

    hasActiveFilters: function hasActiveFilters() {
      return this.blurEnabled;
    },

    hasShapeChanged: function hasShapeChanged() {
      return this.shape !== this.currentShape;
    }

  };

  return demo;

})();
