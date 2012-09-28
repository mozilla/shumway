function Video() {
  DisplayObject.call(this);
  this._element = document.createElement('video');
  this._element.controls = true;
  this._element.setAttribute("style", "position: absolute; top: 0px; left: 0px");
  this._added = false;
}

Video.prototype = Object.create(DisplayObject.prototype, {
  __class__: describeInternalProperty('flash.media.Video'),
  attachNetStream: describeMethod(function (netStream) {
    this._netStream = netStream;
    this._element.src = netStream._url;
  }),
  draw: describeMethod(function (ctx) {
    if (!this._added) {
      ctx.canvas.parentNode.appendChild(this._element);
      this._element.play();
      this._added = true;
    }
  })
});
