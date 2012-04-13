function Sprite() {
  this.graphics = new Grapics;
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
  var c = new Class("Sprite", Sprite, C(Sprite));
  c.extend(baseClass);

  c.getters = [
    "graphics",
    "buttonMode",
    "dropTarget",
    "hitArea",
    "useHandCursor",
    "soundTransform"
  ].reduce(function (getters, prop) {
    getters[prop] = function () {
      return this[prop];
    };
    return getters;
  }, {});

  c.setters = [
    "buttonMode",
    "hitArea",
    "useHandCursor",
    "soundTransform"
  ].reduce(function (setters, prop) {
    setters[prop] = function (v) {
      return this[prop] = v;
    };
    return setters;
  }, {});

  return c;
};
