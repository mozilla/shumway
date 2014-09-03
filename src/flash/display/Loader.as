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
import flash.errors.IllegalOperationError;
import flash.events.UncaughtErrorEvents;
import flash.net.URLRequest;
import flash.system.ApplicationDomain;
import flash.system.LoaderContext;
import flash.system.SecurityDomain;
import flash.utils.ByteArray;

[native(cls='LoaderClass')]
public class Loader extends DisplayObjectContainer {
  public native function Loader();
  public native function get content():DisplayObject;
  public native function get contentLoaderInfo():LoaderInfo;
  public function get uncaughtErrorEvents():UncaughtErrorEvents {
    var events:UncaughtErrorEvents = _getUncaughtErrorEvents();
    if (!events) {
      events = new UncaughtErrorEvents();
      _setUncaughtErrorEvents(events);
    }
    return events;
  }
  public override function addChild(child:DisplayObject):DisplayObject {
    Error.throwError(IllegalOperationError, 2069);
    return null;
  }
  public override function addChildAt(child:DisplayObject, index:int):DisplayObject {
    Error.throwError(IllegalOperationError, 2069);
    return null;
  }
  public override function removeChild(child:DisplayObject):DisplayObject {
    Error.throwError(IllegalOperationError, 2069);
    return null;
  }
  public override function removeChildAt(index:int):DisplayObject {
    Error.throwError(IllegalOperationError, 2069);
    return null;
  }
  public override function setChildIndex(child:DisplayObject, index:int):void
  {
    Error.throwError(IllegalOperationError, 2069);
  }
  public native function load(request:URLRequest, context:LoaderContext = null): void;
  public native function loadBytes(bytes:ByteArray, context:LoaderContext = null): void;
  public function close():void {
    _close();
  }
  public function unload():void {
    _unload(false, false);
  }
  public function unloadAndStop(gc:Boolean = true):void {
    _unload(true, gc);
  }

  private native function _close():void;
  private native function _unload(stopExecution:Boolean, gc:Boolean):void;
  private native function _getJPEGLoaderContextdeblockingfilter(context:LoaderContext):Number;
  private native function _getUncaughtErrorEvents():UncaughtErrorEvents;
  private native function _setUncaughtErrorEvents(value:UncaughtErrorEvents):void;
  private native function _load(request:URLRequest, checkPolicyFile:Boolean,
                                applicationDomain:ApplicationDomain, securityDomain:SecurityDomain,
                                requestedContentParent:DisplayObjectContainer, parameters:Object,
                                deblockingFilter:Number, allowCodeExecution:Boolean,
                                imageDecodingPolicy:String):void;
  private native function _loadBytes(bytes:ByteArray, checkPolicyFile:Boolean,
                                applicationDomain:ApplicationDomain, securityDomain:SecurityDomain,
                                requestedContentParent:DisplayObjectContainer, parameters:Object,
                                deblockingFilter:Number, allowCodeExecution:Boolean,
                                imageDecodingPolicy:String):void;
}
}
