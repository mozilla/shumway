natives.DisplayObjectClass = function DisplayObjectClass(scope, instance, baseClass) {
  function DisplayObject() {};
  var c = new Class("DisplayObject", DisplayObject, Class.passthroughCallable(DisplayObject));
  //
  // WARNING! This sets:
  //   DisplayObject.prototype = Object.create(baseClass.instance.prototype)
  //
  // If you want to manage prototypes manually, do this instead:
  //   c.baseClass = baseClass
  //
  c.extend(baseClass);
  var m = DisplayObject.prototype;
  var s = {};
  m["get root"] = function root() { notImplemented("DisplayObject.root"); };
  m["get stage"] = function stage() { notImplemented("DisplayObject.stage"); };
  m["get name"] = function name() { notImplemented("DisplayObject.name"); };
  // Signature: value:String -> void
  m["set name"] = function name(value) { notImplemented("DisplayObject.name"); };
  m["get parent"] = function parent() { notImplemented("DisplayObject.parent"); };
  m["get mask"] = function mask() { notImplemented("DisplayObject.mask"); };
  // Signature: value:DisplayObject -> void
  m["set mask"] = function mask(value) { notImplemented("DisplayObject.mask"); };
  m["get visible"] = function visible() { notImplemented("DisplayObject.visible"); };
  // Signature: value:Boolean -> void
  m["set visible"] = function visible(value) { notImplemented("DisplayObject.visible"); };
  m["get x"] = function x() { notImplemented("DisplayObject.x"); };
  // Signature: value:Number -> void
  m["set x"] = function x(value) { notImplemented("DisplayObject.x"); };
  m["get y"] = function y() { notImplemented("DisplayObject.y"); };
  // Signature: value:Number -> void
  m["set y"] = function y(value) { notImplemented("DisplayObject.y"); };
  m["get z"] = function z() { notImplemented("DisplayObject.z"); };
  // Signature: value:Number -> void
  m["set z"] = function z(value) { notImplemented("DisplayObject.z"); };
  m["get scaleX"] = function scaleX() { notImplemented("DisplayObject.scaleX"); };
  // Signature: value:Number -> void
  m["set scaleX"] = function scaleX(value) { notImplemented("DisplayObject.scaleX"); };
  m["get scaleY"] = function scaleY() { notImplemented("DisplayObject.scaleY"); };
  // Signature: value:Number -> void
  m["set scaleY"] = function scaleY(value) { notImplemented("DisplayObject.scaleY"); };
  m["get scaleZ"] = function scaleZ() { notImplemented("DisplayObject.scaleZ"); };
  // Signature: value:Number -> void
  m["set scaleZ"] = function scaleZ(value) { notImplemented("DisplayObject.scaleZ"); };
  m["get mouseX"] = function mouseX() { notImplemented("DisplayObject.mouseX"); };
  m["get mouseY"] = function mouseY() { notImplemented("DisplayObject.mouseY"); };
  m["get rotation"] = function rotation() { notImplemented("DisplayObject.rotation"); };
  // Signature: value:Number -> void
  m["set rotation"] = function rotation(value) { notImplemented("DisplayObject.rotation"); };
  m["get rotationX"] = function rotationX() { notImplemented("DisplayObject.rotationX"); };
  // Signature: value:Number -> void
  m["set rotationX"] = function rotationX(value) { notImplemented("DisplayObject.rotationX"); };
  m["get rotationY"] = function rotationY() { notImplemented("DisplayObject.rotationY"); };
  // Signature: value:Number -> void
  m["set rotationY"] = function rotationY(value) { notImplemented("DisplayObject.rotationY"); };
  m["get rotationZ"] = function rotationZ() { notImplemented("DisplayObject.rotationZ"); };
  // Signature: value:Number -> void
  m["set rotationZ"] = function rotationZ(value) { notImplemented("DisplayObject.rotationZ"); };
  m["get alpha"] = function alpha() { notImplemented("DisplayObject.alpha"); };
  // Signature: value:Number -> void
  m["set alpha"] = function alpha(value) { notImplemented("DisplayObject.alpha"); };
  m["get width"] = function width() { notImplemented("DisplayObject.width"); };
  // Signature: value:Number -> void
  m["set width"] = function width(value) { notImplemented("DisplayObject.width"); };
  m["get height"] = function height() { notImplemented("DisplayObject.height"); };
  // Signature: value:Number -> void
  m["set height"] = function height(value) { notImplemented("DisplayObject.height"); };
  m["get cacheAsBitmap"] = function cacheAsBitmap() { notImplemented("DisplayObject.cacheAsBitmap"); };
  // Signature: value:Boolean -> void
  m["set cacheAsBitmap"] = function cacheAsBitmap(value) { notImplemented("DisplayObject.cacheAsBitmap"); };
  m["get opaqueBackground"] = function opaqueBackground() { notImplemented("DisplayObject.opaqueBackground"); };
  // Signature: value:Object -> void
  m["set opaqueBackground"] = function opaqueBackground(value) { notImplemented("DisplayObject.opaqueBackground"); };
  m["get scrollRect"] = function scrollRect() { notImplemented("DisplayObject.scrollRect"); };
  // Signature: value:Rectangle -> void
  m["set scrollRect"] = function scrollRect(value) { notImplemented("DisplayObject.scrollRect"); };
  m["get filters"] = function filters() { notImplemented("DisplayObject.filters"); };
  // Signature: value:Array -> void
  m["set filters"] = function filters(value) { notImplemented("DisplayObject.filters"); };
  m["get blendMode"] = function blendMode() { notImplemented("DisplayObject.blendMode"); };
  // Signature: value:String -> void
  m["set blendMode"] = function blendMode(value) { notImplemented("DisplayObject.blendMode"); };
  m["get transform"] = function transform() { notImplemented("DisplayObject.transform"); };
  // Signature: value:Transform -> void
  m["set transform"] = function transform(value) { notImplemented("DisplayObject.transform"); };
  m["get scale9Grid"] = function scale9Grid() { notImplemented("DisplayObject.scale9Grid"); };
  // Signature: innerRectangle:Rectangle -> void
  m["set scale9Grid"] = function scale9Grid(innerRectangle) { notImplemented("DisplayObject.scale9Grid"); };
  // Signature: point:Point -> Point
  m.globalToLocal = function globalToLocal(point) { notImplemented("DisplayObject.globalToLocal"); };
  // Signature: point:Point -> Point
  m.localToGlobal = function localToGlobal(point) { notImplemented("DisplayObject.localToGlobal"); };
  // Signature: targetCoordinateSpace:DisplayObject -> Rectangle
  m.getBounds = function getBounds(targetCoordinateSpace) { notImplemented("DisplayObject.getBounds"); };
  // Signature: targetCoordinateSpace:DisplayObject -> Rectangle
  m.getRect = function getRect(targetCoordinateSpace) { notImplemented("DisplayObject.getRect"); };
  m["get loaderInfo"] = function loaderInfo() { notImplemented("DisplayObject.loaderInfo"); };
  // Signature: use_xy:Boolean, x:Number, y:Number, useShape:Boolean, hitTestObject:DisplayObject -> Boolean
  m._hitTest = function _hitTest(use_xy, x, y, useShape, hitTestObject) { notImplemented("DisplayObject._hitTest"); };
  m["get accessibilityProperties"] = function accessibilityProperties() { notImplemented("DisplayObject.accessibilityProperties"); };
  // Signature: value:AccessibilityProperties -> void
  m["set accessibilityProperties"] = function accessibilityProperties(value) { notImplemented("DisplayObject.accessibilityProperties"); };
  // Signature: point:Point -> Vector3D
  m.globalToLocal3D = function globalToLocal3D(point) { notImplemented("DisplayObject.globalToLocal3D"); };
  // Signature: point3d:Vector3D -> Point
  m.local3DToGlobal = function local3DToGlobal(point3d) { notImplemented("DisplayObject.local3DToGlobal"); };
  // Signature: value:Shader -> void
  m["set blendShader"] = function blendShader(value) { notImplemented("DisplayObject.blendShader"); };
  c.nativeMethods = m;
  c.nativeStatics = s;
  return c;
};