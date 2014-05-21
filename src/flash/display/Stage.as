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
  public native function Stage()

  public override function set name(value:String):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set mask(value:DisplayObject):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set visible(value:Boolean):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set x(value:Number):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set y(value:Number):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set z(value:Number):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set scaleX(value:Number):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set scaleY(value:Number):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set scaleZ(value:Number):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set rotation(value:Number):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set rotationX(value:Number):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set rotationY(value:Number):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set rotationZ(value:Number):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set alpha(value:Number):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set cacheAsBitmap(value:Boolean):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set opaqueBackground(value:Object):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set scrollRect(value:Rectangle):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set filters(value:Array):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set blendMode(value:String):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set transform(value:Transform):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set accessibilityProperties(value:AccessibilityProperties):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set scale9Grid(value:Rectangle):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set tabEnabled(value:Boolean):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set tabIndex(value:int):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set focusRect(value:Object):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set mouseEnabled(value:Boolean):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function set accessibilityImplementation(value:AccessibilityImplementation):void {
    Error.throwError(IllegalOperationError, 2071);
  }
  public override function get width():Number {
    requireOwnerPermissions();
    return super.width;
  }
  public override function set width(value:Number):void {
    requireOwnerPermissions();
    super.width = value;
  }
  public override function get height():Number {
    requireOwnerPermissions();
    return super.height;
  }
  public override function set height(value:Number):void {
    requireOwnerPermissions();
    super.height = value;
  }
  public override function get textSnapshot():TextSnapshot {
    Error.throwError(IllegalOperationError, 2071);
    return null;
  }
  public override function get mouseChildren():Boolean {
    requireOwnerPermissions();
    return super.mouseChildren;
  }
  public override function set mouseChildren(value:Boolean):void {
    requireOwnerPermissions();
    super.mouseChildren = value;
  }
  public override function get numChildren():int {
    requireOwnerPermissions();
    return super.numChildren;
  }
  public override function get tabChildren():Boolean {
    requireOwnerPermissions();
    return super.tabChildren;
  }
  public override function set tabChildren(value:Boolean):void {
    requireOwnerPermissions();
    super.tabChildren = value;
  }
  public override function set contextMenu(value:ContextMenu):void {
    Error.throwError(IllegalOperationError, 2071);
  }
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
  public function get constructor() {
    return null;
  }
  public function set constructor(c) {}
  public override function addChild(child:DisplayObject):DisplayObject {
    requireOwnerPermissions();
    return super.addChild(child);
  }
  public override function addChildAt(child:DisplayObject, index:int):DisplayObject {
    requireOwnerPermissions();
    return super.addChildAt(child, index);
  }
  public override function setChildIndex(child:DisplayObject,
                                         index:int):void {
    requireOwnerPermissions();
    super.setChildIndex(child, index);
  }
  public override function addEventListener(type:String, listener:Function,
                                            useCapture:Boolean = false, priority:int = 0,
                                            useWeakReference:Boolean = false):void
  {
    requireOwnerPermissions();
    super.addEventListener(type, listener, useCapture, priority, useWeakReference);
  }
  public override function hasEventListener(type:String):Boolean {
    requireOwnerPermissions();
    return super.hasEventListener(type);
  }
  public override function willTrigger(type:String):Boolean {
    requireOwnerPermissions();
    return super.willTrigger(type);
  }
  public override native function removeChildAt(index:int):DisplayObject;
  public override native function swapChildrenAt(index1:int, index2:int):void;
  public native function invalidate():void;
  public native function isFocusInaccessible():Boolean;
  private native function requireOwnerPermissions(): void;
  public override function dispatchEvent(event:Event):Boolean {
    requireOwnerPermissions();
    return super.dispatchEvent(event);
  }
}
}
