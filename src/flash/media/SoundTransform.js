function SoundTransform(volume, pan) {
  EventDispatcher.call(this);

  this.volume = volume;
  this.pan = pan || 0;
}

SoundTransform.prototype = Object.create(null, {
  __class__: describeInternalProperty('flash.media.SoundTransform'),

  _timerDispatch: describeMethod(function () {
  })
});
