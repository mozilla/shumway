/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package flash.display {
import flash.accessibility.AccessibilityImplementation;
import flash.accessibility.AccessibilityProperties;
import flash.errors.IllegalOperationError;
import flash.events.Event;
import flash.geom.Rectangle;
import flash.geom.Transform;
import flash.text.TextSnapshot;
import flash.ui.ContextMenu;

[native(cls='StageClass')]
public class Stage extends DisplayObjectContainer {
  public native function Stage();
  override public native function set name(value:String):void;
  override public native function set mask(value:DisplayObject):void;
  override public native function set visible(value:Boolean):void;
  override public native function set x(value:Number):void;
  override public native function set y(value:Number):void;
  override public native function set z(value:Number):void;
  override public native function set scaleX(value:Number):void;
  override public native function set scaleY(value:Number):void;
  override public native function set scaleZ(value:Number):void;
  override public native function set rotation(value:Number):void;
  override public native function set rotationX(value:Number):void;
  override public native function set rotationY(value:Number):void;
  override public native function set rotationZ(value:Number):void;
  override public native function set alpha(value:Number):void;
  override public native function set cacheAsBitmap(value:Boolean):void;
  override public native function set opaqueBackground(value:Object):void;
  override public native function set scrollRect(value:Rectangle):void;
  override public native function set filters(value:Array):void;
  override public native function set blendMode(value:String):void;
  override public native function set transform(value:Transform):void;
  override public native function set accessibilityProperties(value:AccessibilityProperties):void;
  override public native function set scale9Grid(value:Rectangle):void;
  override public native function set tabEnabled(value:Boolean):void;
  override public native function set tabIndex(value:int):void;
  override public native function set focusRect(value:Object):void;
  override public native function set mouseEnabled(value:Boolean):void;
  override public native function set accessibilityImplementation(value:AccessibilityImplementation):void;
  override public native function get textSnapshot():TextSnapshot;
  override public native function set contextMenu(value:ContextMenu):void;

  override public native function get width():Number;
  override public native function set width(value:Number):void;
  override public native function get height():Number;
  override public native function set height(value:Number):void;
  override public native function get mouseChildren():Boolean;
  override public native function set mouseChildren(value:Boolean):void;
  override public native function get numChildren():int;
  override public native function get tabChildren():Boolean;
  override public native function set tabChildren(value:Boolean):void;
  override public native function addChild(child:DisplayObject):DisplayObject;
  override public native function addChildAt(child:DisplayObject, index:int):DisplayObject;
  override public native function setChildIndex(child:DisplayObject,
                                                index:int):void;
  override public native function addEventListener(type:String, listener:Function,
                                                   useCapture:Boolean = false, priority:int = 0,
                                                   useWeakReference:Boolean = false):void;
  override public native function hasEventListener(type:String):Boolean;
  override public native function willTrigger(type:String):Boolean;
  override public native function dispatchEvent(event:Event):Boolean;

  public native function get frameRate():Number;
  public native function set frameRate(value:Number):void;
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
  public native function get colorCorrection():String;
  public native function set colorCorrection(value:String):void;
  public native function get colorCorrectionSupport():String;
  public native function get stageFocusRect():Boolean;
  public native function set stageFocusRect(on:Boolean):void;
  public native function get quality():String;
  public native function set quality(value:String):void;
  public native function get displayState():String;
  public native function set displayState(value:String):void;
  public native function get fullScreenSourceRect():Rectangle;
  public native function set fullScreenSourceRect(value:Rectangle):void;
  public native function get mouseLock():Boolean;
  public native function set mouseLock(value:Boolean):void;
  public native function get stageVideos():Vector;
  public native function get stage3Ds():Vector;
  public native function get color():uint;
  public native function set color(color:uint):void;
  public native function get fullScreenWidth():uint;
  public native function get fullScreenHeight():uint;
  public native function get wmodeGPU():Boolean;
  public native function get softKeyboardRect():Rectangle;
  public native function get allowsFullScreen():Boolean;
  public native function get allowsFullScreenInteractive():Boolean;
  public native function get contentsScaleFactor():Number;
  public native function get displayContextInfo():String;
  public override native function removeChildAt(index:int):DisplayObject;
  public override native function swapChildrenAt(index1:int, index2:int):void;
  public native function invalidate():void;
  public native function isFocusInaccessible():Boolean;
}
}
