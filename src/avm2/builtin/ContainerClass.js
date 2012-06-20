natives.ContainerClass = function ContainerClass(scope, instance, baseClass) {
  function DisplayObjectContainer() {};
  var c = new Class("DisplayObjectContainer", DisplayObjectContainer, Class.passthroughCallable(DisplayObjectContainer));
  //
  // WARNING! This sets:
  //   DisplayObjectContainer.prototype = Object.create(baseClass.instance.prototype)
  //
  // If you want to manage prototypes manually, do this instead:
  //   c.baseClass = baseClass
  //
  c.extend(baseClass);
  var m = DisplayObjectContainer.prototype;
  var s = {};
  // Signature: child:DisplayObject -> DisplayObject
  m.addChild = function addChild(child) { notImplemented("DisplayObjectContainer.addChild"); };
  // Signature: child:DisplayObject, index:int -> DisplayObject
  m.addChildAt = function addChildAt(child, index) { notImplemented("DisplayObjectContainer.addChildAt"); };
  // Signature: child:DisplayObject -> DisplayObject
  m.removeChild = function removeChild(child) { notImplemented("DisplayObjectContainer.removeChild"); };
  // Signature: index:int -> DisplayObject
  m.removeChildAt = function removeChildAt(index) { notImplemented("DisplayObjectContainer.removeChildAt"); };
  // Signature: child:DisplayObject -> int
  m.getChildIndex = function getChildIndex(child) { notImplemented("DisplayObjectContainer.getChildIndex"); };
  // Signature: child:DisplayObject, index:int -> void
  m.setChildIndex = function setChildIndex(child, index) { notImplemented("DisplayObjectContainer.setChildIndex"); };
  // Signature: index:int -> DisplayObject
  m.getChildAt = function getChildAt(index) { notImplemented("DisplayObjectContainer.getChildAt"); };
  // Signature: name:String -> DisplayObject
  m.getChildByName = function getChildByName(name) { notImplemented("DisplayObjectContainer.getChildByName"); };
  m["get numChildren"] = function numChildren() { notImplemented("DisplayObjectContainer.numChildren"); };
  m["get textSnapshot"] = function textSnapshot() { notImplemented("DisplayObjectContainer.textSnapshot"); };
  // Signature: point:Point -> Array
  m.getObjectsUnderPoint = function getObjectsUnderPoint(point) { notImplemented("DisplayObjectContainer.getObjectsUnderPoint"); };
  // Signature: point:Point -> Boolean
  m.areInaccessibleObjectsUnderPoint = function areInaccessibleObjectsUnderPoint(point) { notImplemented("DisplayObjectContainer.areInaccessibleObjectsUnderPoint"); };
  m["get tabChildren"] = function tabChildren() { notImplemented("DisplayObjectContainer.tabChildren"); };
  // Signature: enable:Boolean -> void
  m["set tabChildren"] = function tabChildren(enable) { notImplemented("DisplayObjectContainer.tabChildren"); };
  m["get mouseChildren"] = function mouseChildren() { notImplemented("DisplayObjectContainer.mouseChildren"); };
  // Signature: enable:Boolean -> void
  m["set mouseChildren"] = function mouseChildren(enable) { notImplemented("DisplayObjectContainer.mouseChildren"); };
  // Signature: child:DisplayObject -> Boolean
  m.contains = function contains(child) { notImplemented("DisplayObjectContainer.contains"); };
  // Signature: index1:int, index2:int -> void
  m.swapChildrenAt = function swapChildrenAt(index1, index2) { notImplemented("DisplayObjectContainer.swapChildrenAt"); };
  // Signature: child1:DisplayObject, child2:DisplayObject -> void
  m.swapChildren = function swapChildren(child1, child2) { notImplemented("DisplayObjectContainer.swapChildren"); };
  // Signature: beginIndex:int=0, endIndex:int=2147483647 -> void
  m.removeChildren = function removeChildren(beginIndex, endIndex) { notImplemented("DisplayObjectContainer.removeChildren"); };
  c.nativeMethods = m;
  c.nativeStatics = s;
  return c;
};