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
import flash.events.Event;
import flash.events.EventDispatcher;
import flash.events.UncaughtErrorEvents;
import flash.system.ApplicationDomain;
import flash.utils.ByteArray;

[native(cls='LoaderInfoClass')]
public class LoaderInfo extends EventDispatcher {
  public static native function getLoaderInfoByDefinition(object:Object):LoaderInfo;
  public native function LoaderInfo()
  public native function get loaderURL():String;
  public native function get url():String;
  public native function get isURLInaccessible():Boolean;
  public native function get bytesLoaded():uint;
  public native function get bytesTotal():uint;
  public native function get applicationDomain():ApplicationDomain;
  public native function get swfVersion():uint;
  public native function get actionScriptVersion():uint;
  public native function get frameRate():Number;
  public native function get parameters():Object;
  public native function get width():int;;
  public native function get height():int;
  public native function get contentType():String;
  public native function get sharedEvents():EventDispatcher;
  public native function get parentSandboxBridge():Object;
  public native function set parentSandboxBridge(door:Object):void;
  public native function get childSandboxBridge():Object;
  public native function set childSandboxBridge(door:Object):void;
  public native function get sameDomain():Boolean;
  public native function get childAllowsParent():Boolean;
  public native function get parentAllowsChild():Boolean;
  public native function get loader():Loader;
  public native function get content():DisplayObject;
  public native function get bytes():ByteArray;
  public native function get uncaughtErrorEvents():UncaughtErrorEvents;
//  public native override function dispatchEvent(event:Event):Boolean;
}
}
