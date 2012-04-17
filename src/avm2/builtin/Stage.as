package flash.display {

  import flash.events.Event;
  import flash.geom.Transform;
  import flash.geom.Rectangle;
  import flash.accessibility.AccessibilityProperties;
  import flash.accessibility.AccessibilityImplementation;
  import flash.text.TextSnapshot;
  import flash.ui.ContextMenu;

  // [API("661")]
  public final class FocusDirection {
    public function FocusDirection() {}
    public static const TOP:String = "top";
    public static const BOTTOM:String = "bottom";
    public static const NONE:String = "none";
  }

  [native(cls="StageClass")]
  [Event(name="mouseLeave", type="flash.events.Event")]
  public class Stage extends DisplayObjectContainer {
    // Dummy constructor
    public function Stage() {}
    private static const kInvalidParamError:uint = 2004;

    [Exclude(name="accessibilityImplementation", kind="property")]
    public native function get frameRate():Number;
    public native function set frameRate(value:Number):void;
    public native function invalidate():void;
    public native function get scaleMode():String;
    public native function set scaleMode(value:String):void;
    public native function get align():String;
    public native function set align(value:String):void;
    public native function get stageWidth():int;
    public native function set stageWidth(value:int):void;
    public native function get stageHeight():int;
    public native function set stageHeight(value:int):void;
    public native function get showDefaultContextMenu():Boolean;
    public native function set showDefaultContextMenu(value:Boolean):void;
    public native function get focus():InteractiveObject;
    public native function set focus(newFocus:InteractiveObject):void;
    // [Version("10")]
    [compat]
    public native function get colorCorrection():String;
    // [Version("10")]
    [compat]
    public native function set colorCorrection(value:String):void;
    // [Version("10")]
    [compat]
    public native function get colorCorrectionSupport():String;
    public native function isFocusInaccessible():Boolean;
    public native function get stageFocusRect():Boolean;
    public native function set stageFocusRect(on:Boolean):void;
    public native function get quality():String;
    public native function set quality(value:String):void;
    public native function get displayState():String;
    public function set displayState(value:String):void { notImplemented("displayState"); }
    private native function set_displayState(value:String):void;
    private native function get simulatedDisplayState():String;
    private native function set simulatedDisplayState(value:String):void;
    public native function get fullScreenSourceRect():Rectangle;
    public native function set fullScreenSourceRect(value:Rectangle):void;
    private native function get simulatedFullScreenSourceRect():Rectangle;
    private native function set simulatedFullScreenSourceRect(value:Rectangle):void;
    //[API("667")]
    public native function get stageVideos():Vector;
    // [API("674")]
    [compat]
    public native function get stage3Ds():Vector;
    // [API("670")]
    public native function get color():uint;
    // [API("670")]
    public native function set color(color:uint):void;
    public native function get fullScreenWidth():uint;
    private native function get_simulatedFullScreenWidth():uint;
    public native function get fullScreenHeight():uint;
    private native function get_simulatedFullScreenHeight():uint;
    // [Version("10.0.32")]
    // public native function get wmodeGPU():Boolean;
    // [API("670")]
    [compat]
    public native function get softKeyboardRect():Rectangle;
    public override function set name(value:String):void { notImplemented("name"); }
    public override function set mask(value:DisplayObject):void { notImplemented("mask"); }
    public override function set visible(value:Boolean):void { notImplemented("visible"); }
    public override function set x(value:Number):void { notImplemented("x"); }
    public override function set y(value:Number):void { notImplemented("y"); }
    // [Version("10")]
    [compat]
    public override function set z(value:Number):void { notImplemented("z"); }
    public override function set scaleX(value:Number):void { notImplemented("scaleX"); }
    public override function set scaleY(value:Number):void { notImplemented("scaleY"); }
    // [Version("10")]
    [compat]
    public override function set scaleZ(value:Number):void { notImplemented("scaleZ"); }
    public override function set rotation(value:Number):void { notImplemented("rotation"); }
    // [Version("10")]
    [compat]
    public override function set rotationX(value:Number):void { notImplemented("rotationX"); }
    // [Version("10")]
    [compat]
    public override function set rotationY(value:Number):void { notImplemented("rotationY"); }
    // [Version("10")]
    [compat]
    public override function set rotationZ(value:Number):void { notImplemented("rotationZ"); }
    public override function set alpha(value:Number):void { notImplemented("alpha"); }
    public override function set cacheAsBitmap(value:Boolean):void { notImplemented("cacheAsBitmap"); }
    public override function set opaqueBackground(value:Object):void { notImplemented("opaqueBackground"); }
    public override function set scrollRect(value:Rectangle):void { notImplemented("scrollRect"); }
    public override function set filters(value:Array):void { notImplemented("filters"); }
    public override function set blendMode(value:String):void { notImplemented("blendMode"); }
    public override function set transform(value:Transform):void { notImplemented("transform"); }
    public override function set accessibilityProperties(value:AccessibilityProperties):void { notImplemented("accessibilityProperties"); }
    public override function set scale9Grid(value:Rectangle):void { notImplemented("scale9Grid"); }
    public override function set tabEnabled(value:Boolean):void { notImplemented("tabEnabled"); }
    public override function set tabIndex(value:int):void { notImplemented("tabIndex"); }
    public override function set focusRect(value:Object):void { notImplemented("focusRect"); }
    public override function set mouseEnabled(value:Boolean):void { notImplemented("mouseEnabled"); }
    public override function set accessibilityImplementation(value:AccessibilityImplementation):void { notImplemented("accessibilityImplementation"); }
    public override function addChild(child:DisplayObject):DisplayObject { notImplemented("addChild"); }
    public override function addChildAt(child:DisplayObject, index:int):DisplayObject { notImplemented("addChildAt"); }
    public override function setChildIndex(child:DisplayObject, index:int):void { notImplemented("setChildIndex"); }
    public override function addEventListener(type:String, listener:Function, useCapture:Boolean=false, priority:int=0, useWeakReference:Boolean=false):void { notImplemented("addEventListener"); }
    public override function dispatchEvent(event:Event):Boolean { notImplemented("dispatchEvent"); }
    public override function hasEventListener(type:String):Boolean { notImplemented("hasEventListener"); }
    public override function willTrigger(type:String):Boolean { notImplemented("willTrigger"); }
    public override function get width():Number { notImplemented("width"); }
    public override function set width(value:Number):void { notImplemented("width"); }
    public override function get height():Number { notImplemented("height"); }
    public override function set height(value:Number):void { notImplemented("height"); }
    public override function get textSnapshot():TextSnapshot { notImplemented("textSnapshot"); }
    public override function get mouseChildren():Boolean { notImplemented("mouseChildren"); }
    public override function set mouseChildren(value:Boolean):void { notImplemented("mouseChildren"); }
    public override function get numChildren():int { notImplemented("numChildren"); }
    public override function get tabChildren():Boolean { notImplemented("tabChildren"); }
    public override function set tabChildren(value:Boolean):void { notImplemented("tabChildren"); }
    // [API("670")]
    public native function get allowsFullScreen():Boolean;
    public override native function removeChildAt(index:int):DisplayObject;
    public override native function swapChildrenAt(index1:int, index2:int):void;
    private native function requireOwnerPermissions():void;
    // [API("674")]
    [compat]
    public native function get displayContextInfo():String;
    public function get constructor() { notImplemented("constructor"); }
    public function set constructor(c) { notImplemented("constructor"); }
    public override function set contextMenu(value:ContextMenu):void { notImplemented("contextMenu"); }
  }

}
