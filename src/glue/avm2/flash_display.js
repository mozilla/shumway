

natives.DisplayObjectClass = function DisplayObjectClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("DisplayObject", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {
    // root :: void -> DisplayObject
    "get root": function root() {
      notImplemented("DisplayObject.root");
    },

    // stage :: void -> Stage
    "get stage": function stage() {
      notImplemented("DisplayObject.stage");
    },

    // name :: void -> String
    "get name": function name() {
      notImplemented("DisplayObject.name");
    },

    // name :: value:String -> void
    "set name": function name(value) {
      notImplemented("DisplayObject.name");
    },

    // parent :: void -> DisplayObjectContainer
    "get parent": function parent() {
      notImplemented("DisplayObject.parent");
    },

    // mask :: void -> DisplayObject
    "get mask": function mask() {
      notImplemented("DisplayObject.mask");
    },

    // mask :: value:DisplayObject -> void
    "set mask": function mask(value) {
      notImplemented("DisplayObject.mask");
    },

    // visible :: void -> Boolean
    "get visible": function visible() {
      notImplemented("DisplayObject.visible");
    },

    // visible :: value:Boolean -> void
    "set visible": function visible(value) {
      notImplemented("DisplayObject.visible");
    },

    // x :: void -> Number
    "get x": function x() {
      return this.d.x;
    },

    // x :: value:Number -> void
    "set x": function x(value) {
      this.d.x = value;
    },

    // y :: void -> Number
    "get y": function y() {
      return this.d.y;
    },

    // y :: value:Number -> void
    "set y": function y(value) {
      this.d.y = value;
    },

    // z :: void -> Number
    "get z": function z() {
      notImplemented("DisplayObject.z");
    },

    // z :: value:Number -> void
    "set z": function z(value) {
      notImplemented("DisplayObject.z");
    },

    // scaleX :: void -> Number
    "get scaleX": function scaleX() {
      notImplemented("DisplayObject.scaleX");
    },

    // scaleX :: value:Number -> void
    "set scaleX": function scaleX(value) {
      notImplemented("DisplayObject.scaleX");
    },

    // scaleY :: void -> Number
    "get scaleY": function scaleY() {
      notImplemented("DisplayObject.scaleY");
    },

    // scaleY :: value:Number -> void
    "set scaleY": function scaleY(value) {
      notImplemented("DisplayObject.scaleY");
    },

    // scaleZ :: void -> Number
    "get scaleZ": function scaleZ() {
      notImplemented("DisplayObject.scaleZ");
    },

    // scaleZ :: value:Number -> void
    "set scaleZ": function scaleZ(value) {
      notImplemented("DisplayObject.scaleZ");
    },

    // mouseX :: void -> Number
    "get mouseX": function mouseX() {
      notImplemented("DisplayObject.mouseX");
    },

    // mouseY :: void -> Number
    "get mouseY": function mouseY() {
      notImplemented("DisplayObject.mouseY");
    },

    // rotation :: void -> Number
    "get rotation": function rotation() {
      notImplemented("DisplayObject.rotation");
    },

    // rotation :: value:Number -> void
    "set rotation": function rotation(value) {
      notImplemented("DisplayObject.rotation");
    },

    // rotationX :: void -> Number
    "get rotationX": function rotationX() {
      notImplemented("DisplayObject.rotationX");
    },

    // rotationX :: value:Number -> void
    "set rotationX": function rotationX(value) {
      notImplemented("DisplayObject.rotationX");
    },

    // rotationY :: void -> Number
    "get rotationY": function rotationY() {
      notImplemented("DisplayObject.rotationY");
    },

    // rotationY :: value:Number -> void
    "set rotationY": function rotationY(value) {
      notImplemented("DisplayObject.rotationY");
    },

    // rotationZ :: void -> Number
    "get rotationZ": function rotationZ() {
      notImplemented("DisplayObject.rotationZ");
    },

    // rotationZ :: value:Number -> void
    "set rotationZ": function rotationZ(value) {
      notImplemented("DisplayObject.rotationZ");
    },

    // alpha :: void -> Number
    "get alpha": function alpha() {
      notImplemented("DisplayObject.alpha");
    },

    // alpha :: value:Number -> void
    "set alpha": function alpha(value) {
      notImplemented("DisplayObject.alpha");
    },

    // width :: void -> Number
    "get width": function width() {
      notImplemented("DisplayObject.width");
    },

    // width :: value:Number -> void
    "set width": function width(value) {
      notImplemented("DisplayObject.width");
    },

    // height :: void -> Number
    "get height": function height() {
      notImplemented("DisplayObject.height");
    },

    // height :: value:Number -> void
    "set height": function height(value) {
      notImplemented("DisplayObject.height");
    },

    // cacheAsBitmap :: void -> Boolean
    "get cacheAsBitmap": function cacheAsBitmap() {
      notImplemented("DisplayObject.cacheAsBitmap");
    },

    // cacheAsBitmap :: value:Boolean -> void
    "set cacheAsBitmap": function cacheAsBitmap(value) {
      notImplemented("DisplayObject.cacheAsBitmap");
    },

    // opaqueBackground :: void -> Object
    "get opaqueBackground": function opaqueBackground() {
      notImplemented("DisplayObject.opaqueBackground");
    },

    // opaqueBackground :: value:Object -> void
    "set opaqueBackground": function opaqueBackground(value) {
      notImplemented("DisplayObject.opaqueBackground");
    },

    // scrollRect :: void -> Rectangle
    "get scrollRect": function scrollRect() {
      notImplemented("DisplayObject.scrollRect");
    },

    // scrollRect :: value:Rectangle -> void
    "set scrollRect": function scrollRect(value) {
      notImplemented("DisplayObject.scrollRect");
    },

    // filters :: void -> Array
    "get filters": function filters() {
      notImplemented("DisplayObject.filters");
    },

    // filters :: value:Array -> void
    "set filters": function filters(value) {
      notImplemented("DisplayObject.filters");
    },

    // blendMode :: void -> String
    "get blendMode": function blendMode() {
      notImplemented("DisplayObject.blendMode");
    },

    // blendMode :: value:String -> void
    "set blendMode": function blendMode(value) {
      notImplemented("DisplayObject.blendMode");
    },

    // transform :: void -> Transform
    "get transform": function transform() {
      notImplemented("DisplayObject.transform");
    },

    // transform :: value:Transform -> void
    "set transform": function transform(value) {
      notImplemented("DisplayObject.transform");
    },

    // scale9Grid :: void -> Rectangle
    "get scale9Grid": function scale9Grid() {
      notImplemented("DisplayObject.scale9Grid");
    },

    // scale9Grid :: innerRectangle:Rectangle -> void
    "set scale9Grid": function scale9Grid(innerRectangle) {
      notImplemented("DisplayObject.scale9Grid");
    },

    // globalToLocal :: point:Point -> Point
    globalToLocal: function globalToLocal(point) {
      notImplemented("DisplayObject.globalToLocal");
    },

    // localToGlobal :: point:Point -> Point
    localToGlobal: function localToGlobal(point) {
      notImplemented("DisplayObject.localToGlobal");
    },

    // getBounds :: targetCoordinateSpace:DisplayObject -> Rectangle
    getBounds: function getBounds(targetCoordinateSpace) {
      notImplemented("DisplayObject.getBounds");
    },

    // getRect :: targetCoordinateSpace:DisplayObject -> Rectangle
    getRect: function getRect(targetCoordinateSpace) {
      notImplemented("DisplayObject.getRect");
    },

    // loaderInfo :: void -> LoaderInfo
    "get loaderInfo": function loaderInfo() {
      notImplemented("DisplayObject.loaderInfo");
    },

    // _hitTest :: use_xy:Boolean, x:Number, y:Number, useShape:Boolean, hitTestObject:DisplayObject -> Boolean
    _hitTest: function _hitTest(use_xy, x, y, useShape, hitTestObject) {
      notImplemented("DisplayObject._hitTest");
    },

    // accessibilityProperties :: void -> AccessibilityProperties
    "get accessibilityProperties": function accessibilityProperties() {
      notImplemented("DisplayObject.accessibilityProperties");
    },

    // accessibilityProperties :: value:AccessibilityProperties -> void
    "set accessibilityProperties": function accessibilityProperties(value) {
      notImplemented("DisplayObject.accessibilityProperties");
    },

    // globalToLocal3D :: point:Point -> Vector3D
    globalToLocal3D: function globalToLocal3D(point) {
      notImplemented("DisplayObject.globalToLocal3D");
    },

    // local3DToGlobal :: point3d:Vector3D -> Point
    local3DToGlobal: function local3DToGlobal(point3d) {
      notImplemented("DisplayObject.local3DToGlobal");
    },

    // blendShader :: value:Shader -> void
    "set blendShader": function blendShader(value) {
      notImplemented("DisplayObject.blendShader");
    }
  };

  return c;
};


natives.InteractiveObjectClass = function InteractiveObjectClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("InteractiveObject", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {
    // tabEnabled :: void -> Boolean
    "get tabEnabled": function tabEnabled() {
      notImplemented("InteractiveObject.tabEnabled");
    },

    // tabEnabled :: enabled:Boolean -> void
    "set tabEnabled": function tabEnabled(enabled) {
      notImplemented("InteractiveObject.tabEnabled");
    },

    // tabIndex :: void -> int
    "get tabIndex": function tabIndex() {
      notImplemented("InteractiveObject.tabIndex");
    },

    // tabIndex :: index:int -> void
    "set tabIndex": function tabIndex(index) {
      notImplemented("InteractiveObject.tabIndex");
    },

    // focusRect :: void -> Object
    "get focusRect": function focusRect() {
      notImplemented("InteractiveObject.focusRect");
    },

    // focusRect :: focusRect:Object -> void
    "set focusRect": function focusRect(focusRect) {
      notImplemented("InteractiveObject.focusRect");
    },

    // mouseEnabled :: void -> Boolean
    "get mouseEnabled": function mouseEnabled() {
      notImplemented("InteractiveObject.mouseEnabled");
    },

    // mouseEnabled :: enabled:Boolean -> void
    "set mouseEnabled": function mouseEnabled(enabled) {
      notImplemented("InteractiveObject.mouseEnabled");
    },

    // doubleClickEnabled :: void -> Boolean
    "get doubleClickEnabled": function doubleClickEnabled() {
      notImplemented("InteractiveObject.doubleClickEnabled");
    },

    // doubleClickEnabled :: enabled:Boolean -> void
    "set doubleClickEnabled": function doubleClickEnabled(enabled) {
      notImplemented("InteractiveObject.doubleClickEnabled");
    },

    // accessibilityImplementation :: void -> AccessibilityImplementation
    "get accessibilityImplementation": function accessibilityImplementation() {
      notImplemented("InteractiveObject.accessibilityImplementation");
    },

    // accessibilityImplementation :: value:AccessibilityImplementation -> void
    "set accessibilityImplementation": function accessibilityImplementation(value) {
      notImplemented("InteractiveObject.accessibilityImplementation");
    },

    // softKeyboardInputAreaOfInterest :: void -> Rectangle
    "get softKeyboardInputAreaOfInterest": function softKeyboardInputAreaOfInterest() {
      notImplemented("InteractiveObject.softKeyboardInputAreaOfInterest");
    },

    // softKeyboardInputAreaOfInterest :: value:Rectangle -> void
    "set softKeyboardInputAreaOfInterest": function softKeyboardInputAreaOfInterest(value) {
      notImplemented("InteractiveObject.softKeyboardInputAreaOfInterest");
    },

    // needsSoftKeyboard :: void -> Boolean
    "get needsSoftKeyboard": function needsSoftKeyboard() {
      notImplemented("InteractiveObject.needsSoftKeyboard");
    },

    // needsSoftKeyboard :: value:Boolean -> void
    "set needsSoftKeyboard": function needsSoftKeyboard(value) {
      notImplemented("InteractiveObject.needsSoftKeyboard");
    },

    // requestSoftKeyboard :: void -> Boolean
    requestSoftKeyboard: function requestSoftKeyboard() {
      notImplemented("InteractiveObject.requestSoftKeyboard");
    },

    // contextMenu :: void -> ContextMenu
    "get contextMenu": function contextMenu() {
      notImplemented("InteractiveObject.contextMenu");
    },

    // contextMenu :: cm:ContextMenu -> void
    "set contextMenu": function contextMenu(cm) {
      notImplemented("InteractiveObject.contextMenu");
    }
  };

  return c;
};


natives.ContainerClass = function ContainerClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("DisplayObjectContainer", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {
    // addChild :: child:DisplayObject -> DisplayObject
    addChild: function addChild(child) {
      this.d.addChild(child.d);
    },

    // addChildAt :: child:DisplayObject, index:int -> DisplayObject
    addChildAt: function addChildAt(child, index) {
      this.d.addChild(child.d, index);
    },

    // removeChild :: child:DisplayObject -> DisplayObject
    removeChild: function removeChild(child) {
      notImplemented("DisplayObjectContainer.removeChild");
    },

    // removeChildAt :: index:int -> DisplayObject
    removeChildAt: function removeChildAt(index) {
      notImplemented("DisplayObjectContainer.removeChildAt");
    },

    // getChildIndex :: child:DisplayObject -> int
    getChildIndex: function getChildIndex(child) {
      notImplemented("DisplayObjectContainer.getChildIndex");
    },

    // setChildIndex :: child:DisplayObject, index:int -> void
    setChildIndex: function setChildIndex(child, index) {
      notImplemented("DisplayObjectContainer.setChildIndex");
    },

    // getChildAt :: index:int -> DisplayObject
    getChildAt: function getChildAt(index) {
      notImplemented("DisplayObjectContainer.getChildAt");
    },

    // getChildByName :: name:String -> DisplayObject
    getChildByName: function getChildByName(name) {
      notImplemented("DisplayObjectContainer.getChildByName");
    },

    // numChildren :: void -> int
    "get numChildren": function numChildren() {
      notImplemented("DisplayObjectContainer.numChildren");
    },

    // textSnapshot :: void -> TextSnapshot
    "get textSnapshot": function textSnapshot() {
      notImplemented("DisplayObjectContainer.textSnapshot");
    },

    // getObjectsUnderPoint :: point:Point -> Array
    getObjectsUnderPoint: function getObjectsUnderPoint(point) {
      notImplemented("DisplayObjectContainer.getObjectsUnderPoint");
    },

    // areInaccessibleObjectsUnderPoint :: point:Point -> Boolean
    areInaccessibleObjectsUnderPoint: function areInaccessibleObjectsUnderPoint(point) {
      notImplemented("DisplayObjectContainer.areInaccessibleObjectsUnderPoint");
    },

    // tabChildren :: void -> Boolean
    "get tabChildren": function tabChildren() {
      notImplemented("DisplayObjectContainer.tabChildren");
    },

    // tabChildren :: enable:Boolean -> void
    "set tabChildren": function tabChildren(enable) {
      notImplemented("DisplayObjectContainer.tabChildren");
    },

    // mouseChildren :: void -> Boolean
    "get mouseChildren": function mouseChildren() {
      notImplemented("DisplayObjectContainer.mouseChildren");
    },

    // mouseChildren :: enable:Boolean -> void
    "set mouseChildren": function mouseChildren(enable) {
      notImplemented("DisplayObjectContainer.mouseChildren");
    },

    // contains :: child:DisplayObject -> Boolean
    contains: function contains(child) {
      notImplemented("DisplayObjectContainer.contains");
    },

    // swapChildrenAt :: index1:int, index2:int -> void
    swapChildrenAt: function swapChildrenAt(index1, index2) {
      notImplemented("DisplayObjectContainer.swapChildrenAt");
    },

    // swapChildren :: child1:DisplayObject, child2:DisplayObject -> void
    swapChildren: function swapChildren(child1, child2) {
      notImplemented("DisplayObjectContainer.swapChildren");
    },

    // removeChildren :: beginIndex:int=0, endIndex:int=2147483647 -> void
    removeChildren: function removeChildren(beginIndex, endIndex) {
      notImplemented("DisplayObjectContainer.removeChildren");
    }
  };

  return c;
};


natives.SpriteClass = function SpriteClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("Sprite", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {
    // graphics :: void -> Graphics
    "get graphics": function graphics() {
      notImplemented("Sprite.graphics");
    },

    // buttonMode :: void -> Boolean
    "get buttonMode": function buttonMode() {
      notImplemented("Sprite.buttonMode");
    },

    // buttonMode :: value:Boolean -> void
    "set buttonMode": function buttonMode(value) {
      notImplemented("Sprite.buttonMode");
    },

    // startDrag :: lockCenter:Boolean=false, bounds:Rectangle=null -> void
    startDrag: function startDrag(lockCenter, bounds) {
      notImplemented("Sprite.startDrag");
    },

    // stopDrag :: void -> void
    stopDrag: function stopDrag() {
      notImplemented("Sprite.stopDrag");
    },

    // startTouchDrag :: touchPointID:int, lockCenter:Boolean=false, bounds:Rectangle=null -> void
    startTouchDrag: function startTouchDrag(touchPointID, lockCenter, bounds) {
      notImplemented("Sprite.startTouchDrag");
    },

    // stopTouchDrag :: touchPointID:int -> void
    stopTouchDrag: function stopTouchDrag(touchPointID) {
      notImplemented("Sprite.stopTouchDrag");
    },

    // dropTarget :: void -> DisplayObject
    "get dropTarget": function dropTarget() {
      notImplemented("Sprite.dropTarget");
    },

    // constructChildren :: void -> void
    constructChildren: function constructChildren() {
      print("Sprite.constructChildren");
    },

    // hitArea :: void -> Sprite
    "get hitArea": function hitArea() {
      notImplemented("Sprite.hitArea");
    },

    // hitArea :: value:Sprite -> void
    "set hitArea": function hitArea(value) {
      notImplemented("Sprite.hitArea");
    },

    // useHandCursor :: void -> Boolean
    "get useHandCursor": function useHandCursor() {
      notImplemented("Sprite.useHandCursor");
    },

    // useHandCursor :: value:Boolean -> void
    "set useHandCursor": function useHandCursor(value) {
      notImplemented("Sprite.useHandCursor");
    },

    // soundTransform :: void -> SoundTransform
    "get soundTransform": function soundTransform() {
      notImplemented("Sprite.soundTransform");
    },

    // soundTransform :: sndTransform:SoundTransform -> void
    "set soundTransform": function soundTransform(sndTransform) {
      notImplemented("Sprite.soundTransform");
    }
  };

  return c;
};

natives.MovieClipClass = function MovieClipClass(runtime, scope, instance, baseClass) {
  function ctor() {
    this.d = new MovieClip();
    return instance.apply(this, arguments);
  }
  var c = new runtime.domain.system.Class("MovieClip", ctor, Domain.passthroughCallable(ctor));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {
    // currentFrame :: void -> int
    "get currentFrame": function currentFrame() {
      notImplemented("MovieClip.currentFrame");
    },

    // framesLoaded :: void -> int
    "get framesLoaded": function framesLoaded() {
      notImplemented("MovieClip.framesLoaded");
    },

    // totalFrames :: void -> int
    "get totalFrames": function totalFrames() {
      notImplemented("MovieClip.totalFrames");
    },

    // trackAsMenu :: void -> Boolean
    "get trackAsMenu": function trackAsMenu() {
      notImplemented("MovieClip.trackAsMenu");
    },

    // trackAsMenu :: value:Boolean -> void
    "set trackAsMenu": function trackAsMenu(value) {
      notImplemented("MovieClip.trackAsMenu");
    },

    // play :: void -> void
    play: function play() {
      notImplemented("MovieClip.play");
    },

    // stop :: void -> void
    stop: function stop() {
      notImplemented("MovieClip.stop");
    },

    // nextFrame :: void -> void
    nextFrame: function nextFrame() {
      notImplemented("MovieClip.nextFrame");
    },

    // prevFrame :: void -> void
    prevFrame: function prevFrame() {
      notImplemented("MovieClip.prevFrame");
    },

    // gotoAndPlay :: frame:Object, scene:String=null -> void
    gotoAndPlay: function gotoAndPlay(frame, scene) {
      notImplemented("MovieClip.gotoAndPlay");
    },

    // gotoAndStop :: frame:Object, scene:String=null -> void
    gotoAndStop: function gotoAndStop(frame, scene) {
      notImplemented("MovieClip.gotoAndStop");
    },

    // addFrameScript :: void -> void
    addFrameScript: function addFrameScript() {
      notImplemented("MovieClip.addFrameScript");
    },

    // scenes :: void -> Array
    "get scenes": function scenes() {
      notImplemented("MovieClip.scenes");
    },

    // currentScene :: void -> Scene
    "get currentScene": function currentScene() {
      notImplemented("MovieClip.currentScene");
    },

    // currentLabel :: void -> String
    "get currentLabel": function currentLabel() {
      notImplemented("MovieClip.currentLabel");
    },

    // currentFrameLabel :: void -> String
    "get currentFrameLabel": function currentFrameLabel() {
      notImplemented("MovieClip.currentFrameLabel");
    },

    // prevScene :: void -> void
    prevScene: function prevScene() {
      notImplemented("MovieClip.prevScene");
    },

    // nextScene :: void -> void
    nextScene: function nextScene() {
      notImplemented("MovieClip.nextScene");
    },

    // enabled :: void -> Boolean
    "get enabled": function enabled() {
      notImplemented("MovieClip.enabled");
    },

    // enabled :: value:Boolean -> void
    "set enabled": function enabled(value) {
      notImplemented("MovieClip.enabled");
    },

    // isPlaying :: void -> Boolean
    "get isPlaying": function isPlaying() {
      notImplemented("MovieClip.isPlaying");
    }
  };

  return c;
};