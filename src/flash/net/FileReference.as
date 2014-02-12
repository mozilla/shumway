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

package flash.net {
import flash.events.EventDispatcher;
import flash.utils.ByteArray;

[native(cls="FileReferenceClass")]
public class FileReference extends EventDispatcher {
  public function FileReference() {
  }
  public native function get creationDate():Date;
  public native function get creator():String;
  public native function get modificationDate():Date;
  public native function get name():String;
  public native function get size():Number;
  public native function get type():String;
  public native function cancel():void;
  public native function download(request:URLRequest, defaultFileName:String = null):void;
  public native function upload(request:URLRequest, uploadDataFieldName:String = "Filedata", testUpload:Boolean = false):void;
  public native function get data():ByteArray;
  public function load():void {
    notImplemented("load");
  }
  public function save(data, defaultFileName:String = null):void {
    notImplemented("save");
  }
  public native function browse(typeFilter:Array = null):Boolean;
}
}
