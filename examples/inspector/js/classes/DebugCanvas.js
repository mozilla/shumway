var DebugCanvasRenderingContext2D = (function () {
  function debugCanvasRenderingContext2D(target, counter, options) {
    this.target = target;
    this.counter = counter;
    this.options = options;
  };
  debugCanvasRenderingContext2D.Options = {
    disableStroke: false,
    disableFill: false,
    disableClip: false,
    disableFillText: false,
    disableDrawImage: false
  };
  debugCanvasRenderingContext2D.prototype = {
    onEnter: function (name, args) {
      this.counter.count(name);
    },
    onLeave: function (name) {

    },
    get canvas()  {
      return this.target.canvas;
    },
    set canvas(value)  {
      this.target.canvas = value;
    },
    get globalAlpha()  {
      return this.target.globalAlpha;
    },
    set globalAlpha(value)  {
      this.target.globalAlpha = value;
    },
    get globalCompositeOperation()  {
      return this.target.globalCompositeOperation;
    },
    set globalCompositeOperation(value)  {
      this.target.globalCompositeOperation = value;
    },
    get fillStyle()  {
      return this.target.fillStyle;
    },
    set fillStyle(value)  {
      this.target.fillStyle = value;
    },
    get strokeStyle()  {
      return this.target.strokeStyle;
    },
    set strokeStyle(value)  {
      this.target.strokeStyle = value;
    },
    get lineWidth()  {
      return this.target.lineWidth;
    },
    set lineWidth(value)  {
      this.target.lineWidth = value;
    },
    get lineCap()  {
      return this.target.lineCap;
    },
    set lineCap(value)  {
      this.target.lineCap = value;
    },
    get lineJoin()  {
      return this.target.lineJoin;
    },
    set lineJoin(value)  {
      this.target.lineJoin = value;
    },
    get miterLimit()  {
      return this.target.miterLimit;
    },
    set miterLimit(value)  {
      this.target.miterLimit = value;
    },
    get shadowOffsetX()  {
      return this.target.shadowOffsetX;
    },
    set shadowOffsetX(value)  {
      this.target.shadowOffsetX = value;
    },
    get shadowOffsetY()  {
      return this.target.shadowOffsetY;
    },
    set shadowOffsetY(value)  {
      this.target.shadowOffsetY = value;
    },
    get shadowBlur()  {
      return this.target.shadowBlur;
    },
    set shadowBlur(value)  {
      this.target.shadowBlur = value;
    },
    get shadowColor()  {
      return this.target.shadowColor;
    },
    set shadowColor(value)  {
      this.target.shadowColor = value;
    },
    get font()  {
      return this.target.font;
    },
    set font(value)  {
      this.target.font = value;
    },
    get textAlign()  {
      return this.target.textAlign;
    },
    set textAlign(value)  {
      this.target.textAlign = value;
    },
    get textBaseline()  {
      return this.target.textBaseline;
    },
    set textBaseline(value)  {
      this.target.textBaseline = value;
    },
    save: function() {
      this.onEnter("save", arguments);
      var result = this.target.save();
      this.onLeave("save");
      return result;
    },
    restore: function() {
      this.onEnter("restore", arguments);
      var result = this.target.restore();
      this.onLeave("restore");
      return result;
    },
    scale: function(x,y) {
      this.onEnter("scale", arguments);
      var result = this.target.scale.apply(this.target, arguments);
      this.onLeave("scale");
      return result;
    },
    rotate: function(angle) {
      this.onEnter("rotate", arguments);
      var result = this.target.rotate.apply(this.target, arguments);
      this.onLeave("rotate");
      return result;
    },
    translate: function(x,y) {
      this.onEnter("translate", arguments);
      var result = this.target.translate.apply(this.target, arguments);
      this.onLeave("translate");
      return result;
    },
    transform: function(m11,m12,m21,m22,dx,dy) {
      this.onEnter("transform", arguments);
      var result = this.target.transform.apply(this.target, arguments);
      this.onLeave("transform");
      return result;
    },
    setTransform: function(m11,m12,m21,m22,dx,dy) {
      this.onEnter("setTransform", arguments);
      var result = this.target.setTransform.apply(this.target, arguments);
      this.onLeave("setTransform");
      return result;
    },
    createLinearGradient: function(x0,y0,x1,y1) {
      this.onEnter("createLinearGradient", arguments);
      var result = this.target.createLinearGradient.apply(this.target, arguments);
      this.onLeave("createLinearGradient");
      return result;
    },
    createRadialGradient: function(x0,y0,r0,x1,y1,r1) {
      this.onEnter("createRadialGradient", arguments);
      var result = this.target.createRadialGradient.apply(this.target, arguments);
      this.onLeave("createRadialGradient");
      return result;
    },
    createPattern: function(image,repetition) {
      this.onEnter("createPattern", arguments);
      var result = this.target.createPattern.apply(this.target, arguments);
      this.onLeave("createPattern");
      return result;
    },
    clearRect: function(x,y,w,h) {
      this.onEnter("clearRect", arguments);
      var result = this.target.clearRect.apply(this.target, arguments);
      this.onLeave("clearRect");
      return result;
    },
    fillRect: function(x,y,w,h) {
      this.onEnter("fillRect", arguments);
      var result = this.target.fillRect.apply(this.target, arguments);
      this.onLeave("fillRect");
      return result;
    },
    strokeRect: function(x,y,w,h) {
      this.onEnter("strokeRect", arguments);
      var result = this.target.strokeRect.apply(this.target, arguments);
      this.onLeave("strokeRect");
      return result;
    },
    beginPath: function() {
      this.onEnter("beginPath", arguments);
      var result = this.target.beginPath.apply(this.target, arguments);
      this.onLeave("beginPath");
      return result;
    },
    closePath: function() {
      this.onEnter("closePath", arguments);
      var result = this.target.closePath.apply(this.target, arguments);
      this.onLeave("closePath");
      return result;
    },
    moveTo: function(x,y) {
      this.onEnter("moveTo", arguments);
      var result = this.target.moveTo.apply(this.target, arguments);
      this.onLeave("moveTo");
      return result;
    },
    lineTo: function(x,y) {
      this.onEnter("lineTo", arguments);
      var result = this.target.lineTo.apply(this.target, arguments);
      this.onLeave("lineTo");
      return result;
    },
    quadraticCurveTo: function(cpx,cpy,x,y) {
      this.onEnter("quadraticCurveTo", arguments);
      var result = this.target.quadraticCurveTo.apply(this.target, arguments);
      this.onLeave("quadraticCurveTo");
      return result;
    },
    bezierCurveTo: function(cp1x,cp1y,cp2x,cp2y,x,y) {
      this.onEnter("bezierCurveTo", arguments);
      var result = this.target.bezierCurveTo.apply(this.target, arguments);
      this.onLeave("bezierCurveTo");
      return result;
    },
    arcTo: function(x1,y1,x2,y2,radius) {
      this.onEnter("arcTo", arguments);
      var result = this.target.arcTo.apply(this.target, arguments);
      this.onLeave("arcTo");
      return result;
    },
    rect: function(x,y,w,h) {
      this.onEnter("rect", arguments);
      var result = this.target.rect.apply(this.target, arguments);
      this.onLeave("rect");
      return result;
    },
    arc: function(x,y,radius,startAngle,endAngle,anticlockwise) {
      this.onEnter("arc", arguments);
      var result = this.target.arc.apply(this.target, arguments);
      this.onLeave("arc");
      return result;
    },
    fill: function() {
      if (this.options.disableFill) return;
      this.onEnter("fill", arguments);
      var result = this.target.fill.apply(this.target, arguments);
      this.onLeave("fill");
      return result;
    },
    stroke: function() {
      if (this.options.disableStroke) return;
      this.onEnter("stroke", arguments);
      var result = this.target.stroke.apply(this.target, arguments);
      this.onLeave("stroke");
      return result;
    },
    clip: function() {
      if (this.options.disableClip) return;
      this.onEnter("clip", arguments);
      var result = this.target.clip.apply(this.target, arguments);
      this.onLeave("clip");
      return result;
    },
    isPointInPath: function(x,y) {
      this.onEnter("isPointInPath", arguments);
      var result = this.target.isPointInPath.apply(this.target, arguments);
      this.onLeave("isPointInPath");
      return result;
    },
    drawFocusRing: function(element,xCaret,yCaret,canDrawCustom) {
      this.onEnter("drawFocusRing", arguments);
      var result = this.target.drawFocusRing.apply(this.target, arguments);
      this.onLeave("drawFocusRing");
      return result;
    },
    fillText: function(text,x,y,maxWidth) {
      if (this.options.disableFillText) return;
      this.onEnter("fillText", arguments);
      var result = this.target.fillText.apply(this.target, arguments);
      this.onLeave("fillText");
      return result;
    },
    strokeText: function(text,x,y,maxWidth) {
      this.onEnter("strokeText", arguments);
      var result = this.target.strokeText.apply(this.target, arguments);
      this.onLeave("strokeText");
      return result;
    },
    measureText: function(text) {
      this.onEnter("measureText", arguments);
      var result = this.target.measureText.apply(this.target, arguments);
      this.onLeave("measureText");
      return result;
    },
    drawImage: function(img_elem,dx_or_sx,dy_or_sy,dw_or_sw,dh_or_sh,dx,dy,dw,dh) {
      if (this.options.disableDrawImage) return;
      this.onEnter("drawImage", arguments);
      var result = this.target.drawImage.apply(this.target, arguments);
      this.onLeave("drawImage");
      return result;
    },
    createImageData: function(imagedata_or_sw,sh) {
      this.onEnter("createImageData", arguments);
      var result = this.target.createImageData.apply(this.target, arguments);
      this.onLeave("createImageData");
      return result;
    },
    getImageData: function(sx,sy,sw,sh) {
      this.onEnter("getImageData", arguments);
      var result = this.target.getImageData.apply(this.target, arguments);
      this.onLeave("getImageData");
      return result;
    },
    putImageData: function(image_data,dx,dy,dirtyX,dirtyY,dirtyWidth,dirtyHeight) {
      this.onEnter("putImageData", arguments);
      var result = this.target.putImageData.apply(this.target, arguments);
      this.onLeave("putImageData");
      return result;
    }
  };
  return debugCanvasRenderingContext2D;
})();