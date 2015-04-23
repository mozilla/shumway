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
import flash.accessibility.AccessibilityProperties;
import flash.events.EventDispatcher;
import flash.geom.Point;
import flash.geom.Rectangle;
import flash.geom.Transform;
import flash.geom.Vector3D;

[native(cls='DisplayObjectClass')]
public class DisplayObject extends EventDispatcher implements IBitmapDrawable {
  public native function DisplayObject()
  public native function get root():DisplayObject;
  public native function get stage():Stage;
  public native function get name():String;
  public native function set name(value:String):void;
  public native function get parent():DisplayObjectContainer;
  public native function get mask():DisplayObject;
  public native function set mask(value:DisplayObject):void;
  public native function get visible():Boolean;
  public native function set visible(value:Boolean):void;
  public native function get x():Number;
  public native function set x(value:Number):void;
  public native function get y():Number;
  public native function set y(value:Number):void;
  public native function get z():Number;
  public native function set z(value:Number):void;
  public native function get scaleX():Number;
  public native function set scaleX(value:Number):void;
  public native function get scaleY():Number;
  public native function set scaleY(value:Number):void;
  public native function get scaleZ():Number;
  public native function set scaleZ(value:Number):void;
  public native function get mouseX():Number;
  public native function get mouseY():Number;
  public native function get rotation():Number;
  public native function set rotation(value:Number):void;
  public native function get rotationX():Number;
  public native function set rotationX(value:Number):void;
  public native function get rotationY():Number;
  public native function set rotationY(value:Number):void;
  public native function get rotationZ():Number;
  public native function set rotationZ(value:Number):void;
  public native function get alpha():Number;
  public native function set alpha(value:Number):void;
  public native function get width():Number;
  public native function set width(value:Number):void;
  public native function get height():Number;
  public native function set height(value:Number):void;
  public native function get cacheAsBitmap():Boolean;
  public native function set cacheAsBitmap(value:Boolean):void;
  public native function get opaqueBackground():Object;
  public native function set opaqueBackground(value:Object):void;
  public native function get scrollRect():Rectangle;
  public native function set scrollRect(value:Rectangle):void;
  public native function get filters():Array;
  public native function set filters(value:Array):void;
  public native function get blendMode():String;
  public native function set blendMode(value:String):void;
  public native function get transform():Transform;
  public native function set transform(value:Transform):void;
  public native function get scale9Grid():Rectangle;
  public native function set scale9Grid(innerRectangle:Rectangle):void;

  public native function get loaderInfo():LoaderInfo;

  public native function get accessibilityProperties():AccessibilityProperties;

  public native function set accessibilityProperties(value:AccessibilityProperties):void;

//  public native function set blendShader(value:Shader):void;

  public native function globalToLocal(point:Point):Point;

  public native function localToGlobal(point:Point):Point;

  public native function getBounds(targetCoordinateSpace:DisplayObject):Rectangle;

  public native function getRect(targetCoordinateSpace:DisplayObject):Rectangle;

  public native function hitTestObject(obj:DisplayObject):Boolean;

  public native function hitTestPoint(x:Number, y:Number, shapeFlag:Boolean = false):Boolean;

  public native function globalToLocal3D(point:Point):Vector3D;

  public native function local3DToGlobal(point3d:Vector3D):Point;
}
}
