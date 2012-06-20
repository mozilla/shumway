natives.SpriteClass = function SpriteClass(scope, instance, baseClass) {
  function Sprite() {};
  var c = new Class("Sprite", Sprite, Class.passthroughCallable(Sprite));
  //
  // WARNING! This sets:
  //   Sprite.prototype = Object.create(baseClass.instance.prototype)
  //
  // If you want to manage prototypes manually, do this instead:
  //   c.baseClass = baseClass
  //
  c.extend(baseClass);
  var m = Sprite.prototype;
  var s = {};
  m["get graphics"] = function graphics() { notImplemented("Sprite.graphics"); };
  m["get buttonMode"] = function buttonMode() { notImplemented("Sprite.buttonMode"); };
  // Signature: value:Boolean -> void
  m["set buttonMode"] = function buttonMode(value) { notImplemented("Sprite.buttonMode"); };
  // Signature: lockCenter:Boolean=false, bounds:Rectangle=null -> void
  m.startDrag = function startDrag(lockCenter, bounds) { notImplemented("Sprite.startDrag"); };
  m.stopDrag = function stopDrag() { notImplemented("Sprite.stopDrag"); };
  // Signature: touchPointID:int, lockCenter:Boolean=false, bounds:Rectangle=null -> void
  m.startTouchDrag = function startTouchDrag(touchPointID, lockCenter, bounds) { notImplemented("Sprite.startTouchDrag"); };
  // Signature: touchPointID:int -> void
  m.stopTouchDrag = function stopTouchDrag(touchPointID) { notImplemented("Sprite.stopTouchDrag"); };
  m["get dropTarget"] = function dropTarget() { notImplemented("Sprite.dropTarget"); };
  m.constructChildren = function constructChildren() { notImplemented("Sprite.constructChildren"); };
  m["get hitArea"] = function hitArea() { notImplemented("Sprite.hitArea"); };
  // Signature: value:Sprite -> void
  m["set hitArea"] = function hitArea(value) { notImplemented("Sprite.hitArea"); };
  m["get useHandCursor"] = function useHandCursor() { notImplemented("Sprite.useHandCursor"); };
  // Signature: value:Boolean -> void
  m["set useHandCursor"] = function useHandCursor(value) { notImplemented("Sprite.useHandCursor"); };
  m["get soundTransform"] = function soundTransform() { notImplemented("Sprite.soundTransform"); };
  // Signature: sndTransform:SoundTransform -> void
  m["set soundTransform"] = function soundTransform(sndTransform) { notImplemented("Sprite.soundTransform"); };
  c.nativeMethods = m;
  c.nativeStatics = s;
  return c;
};