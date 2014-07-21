
module Shumway.GFX.Canvas2D {
  import assert = Shumway.Debug.assert;

  var originalSave = CanvasRenderingContext2D.prototype.save;
  var originalClip = CanvasRenderingContext2D.prototype.clip;
  var originalFill = CanvasRenderingContext2D.prototype.fill;
  var originalStroke = CanvasRenderingContext2D.prototype.stroke;
  var originalRestore = CanvasRenderingContext2D.prototype.restore;
  var originalBeginPath = CanvasRenderingContext2D.prototype.beginPath;

  function debugSave() {
    if (this.stackDepth === undefined) {
      this.stackDepth = 0;
    }
    if (this.clipStack === undefined) {
      this.clipStack = [0];
    } else {
      this.clipStack.push(0);
    }
    this.stackDepth ++;
    originalSave.call(this);
  }

  function debugRestore() {
    this.stackDepth --;
    this.clipStack.pop();
    originalRestore.call(this);
  }

  function debugFill() {
    assert(!this.buildingClippingRegionDepth);
    originalFill.apply(this, arguments);
  }

  function debugStroke() {
    assert(debugClipping.value || !this.buildingClippingRegionDepth);
    originalStroke.apply(this, arguments);
  }

  function debugBeginPath() {
    originalBeginPath.call(this);
  }

  function debugClip() {
    if (this.clipStack === undefined) {
      this.clipStack = [0];
    }
    this.clipStack[this.clipStack.length - 1] ++;
    if (debugClipping.value) {
      this.strokeStyle = ColorStyle.Pink;
      this.stroke.apply(this, arguments);
    } else {
      originalClip.apply(this, arguments);
    }
  }

  export function notifyReleaseChanged() {
    if (release) {
      CanvasRenderingContext2D.prototype.save = originalSave;
      CanvasRenderingContext2D.prototype.clip = originalClip;
      CanvasRenderingContext2D.prototype.fill = originalFill;
      CanvasRenderingContext2D.prototype.stroke = originalStroke;
      CanvasRenderingContext2D.prototype.restore = originalRestore;
      CanvasRenderingContext2D.prototype.beginPath = originalBeginPath;
    } else {
      CanvasRenderingContext2D.prototype.save = debugSave;
      CanvasRenderingContext2D.prototype.clip = debugClip;
      CanvasRenderingContext2D.prototype.fill = debugFill;
      CanvasRenderingContext2D.prototype.stroke = debugStroke;
      CanvasRenderingContext2D.prototype.restore = debugRestore;
      CanvasRenderingContext2D.prototype.beginPath = debugBeginPath;
    }
  }

  CanvasRenderingContext2D.prototype.enterBuildingClippingRegion = function () {
    if (!this.buildingClippingRegionDepth) {
      this.buildingClippingRegionDepth = 0;
    }
    this.buildingClippingRegionDepth ++;
  };

  CanvasRenderingContext2D.prototype.leaveBuildingClippingRegion = function () {
    this.buildingClippingRegionDepth --;
  };
}
