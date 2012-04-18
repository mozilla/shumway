function Sprite() {
  this.graphics = null;
  this.buttonMode = false;
  this.dropTarget = null;
  this.hitArea = null;
  this.useHandCursor = false;
  this.soundTransform = null;
}

Sprite.prototype = new DisplayObjectContainer;
Sprite.prototype.startDrag = function (lockCenter, bounds) { notImplemented(); };
Sprite.prototype.stopDrag = function () { notImplemented(); };
Sprite.prototype.startTouchDrag = function (touchPointID, lockCenter, bounds) {
  notImplemented();
};
Sprite.prototype.stopTouchDrag = function () { notImplemented(); };
Sprite.prototype.constructChildren = function () { notImplemented(); };

natives.SpriteClass = function (scope, instance, baseClass) {
  var c = new Class("Sprite", Sprite, Class.passthroughCallable(Sprite));
  c.baseClass = baseClass;
  c.nativeMethods = Sprite.prototype;

  c.nativeMethods["get graphics"] = function () {
    if (!this.graphics) {
      this.graphics = new (toplevel.getTypeByName(
        Multiname.fromSimpleName("flash.display.Graphics"),
        true,
        true
      ).instance);
    }
    return this.graphics;
  };

  c.makeSimpleNativeAccessors("get", ["buttonMode",
                                      "dropTarget",
                                      "hitArea",
                                      "useHandCursor",
                                      "soundTransform"]);
  c.makeSimpleNativeAccessors("set", ["buttonMode",
                                      "hitArea",
                                      "useHandCursor",
                                      "soundTransform"]);
  return c;
};
