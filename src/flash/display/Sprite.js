function Sprite() {
  this.graphics = null;
  this.buttonMode = false;
  this.dropTarget = null;
  this.hitArea = null;
  this.useHandCursor = false;
  this.soundTransform = null;
}

var p = Sprite.prototype = new DisplayObjectContainer;
p.startDrag = function (lockCenter, bounds) { notImplemented(); };
p.stopDrag = function () { notImplemented(); };
p.startTouchDrag = function (touchPointID, lockCenter, bounds) { notImplemented(); };
p.stopTouchDrag = function () { notImplemented(); };
p.constructChildren = function () { notImplemented(); };

natives.SpriteClass = function (scope, instance, baseClass) {
  var c = new Class("Sprite", Sprite, Class.passthroughCallable(Sprite));
  c.baseClass = baseClass;
  c.nativeMethods = p;

  c.nativeMethods["get graphics"] = function () {
    if (!this.graphics) {
      var ns = Namespace.createNamespace('flash.display');
      var mn = new Multiname([ns], 'Graphics');
      this.graphics = new (toplevel.getTypeByName(mn, true, true).instance);
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
