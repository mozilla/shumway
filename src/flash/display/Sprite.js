function Sprite() {
  this.graphics = {};
  this.buttonMode = false;
  this.hitArea = null;
  this.useHandCursor = true;
  this.soundTransform = {};
}

Sprite.prototype = Object.create(new DisplayObjectContainer, {
  toString: descMethod(function () {
    return '[object Sprite]';
  }),
  startDrag: descMethod(function (lockCenter, bounds) {
    notImplemented();
  }),
  stopDrag: descMethod(function () {
    notImplemented();
  }),
  startTouchDrag: descMethod(function (touchPointID, lockCenter, bounds) {
    notImplemented();
  }),
  stopTouchDrag: descMethod(function (touchPointID) {
    notImplemented();
  })
});
