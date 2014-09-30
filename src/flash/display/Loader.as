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
import flash.events.UncaughtErrorEvents;
import flash.net.URLRequest;
import flash.system.LoaderContext;
import flash.utils.ByteArray;

[native(cls='LoaderClass')]
public class Loader extends DisplayObjectContainer {
  public native function Loader();
  public native function get content():DisplayObject;
  public native function get contentLoaderInfo():LoaderInfo;
  public native function get uncaughtErrorEvents():UncaughtErrorEvents;

  public native override function addChild(child:DisplayObject):DisplayObject;
  public native override function addChildAt(child:DisplayObject, index:int):DisplayObject;
  public native override function removeChild(child:DisplayObject):DisplayObject;
  public native override function removeChildAt(index:int):DisplayObject;
  public native override function setChildIndex(child:DisplayObject, index:int):void;

  public native function load(request:URLRequest, context:LoaderContext = null): void;
  public native function loadBytes(bytes:ByteArray, context:LoaderContext = null): void;
  public native function close():void;
  public native function unload():void;
  public native function unloadAndStop(gc:Boolean = true):void;
}
}
