function Video() {
  DisplayObject.call(this);
}

Video.prototype = Object.create(DisplayObject.prototype, {
  __class__: describeInternalProperty('flash.media.Video')
});
