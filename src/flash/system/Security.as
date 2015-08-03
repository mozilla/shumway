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

package flash.system {

[native(cls='SecurityClass')]
public final class Security {
  public static const REMOTE:String = "remote";
  public static const LOCAL_WITH_FILE:String = "localWithFile";
  public static const LOCAL_WITH_NETWORK:String = "localWithNetwork";
  public static const LOCAL_TRUSTED:String = "localTrusted";
  public static const APPLICATION:String = "application";
  public static native function get exactSettings():Boolean;
  public static native function set exactSettings(value:Boolean):void;
  public static native function get disableAVM1Loading():Boolean;
  public static native function set disableAVM1Loading(value:Boolean):void;
  public static native function get sandboxType():String;
  public static native function get pageDomain():String;
  public static native function allowDomain(...domains):void;
  public static native function allowInsecureDomain(...domains):void;
  public static native function loadPolicyFile(url:String):void;
  public static native function showSettings(panel:String = "default"):void;
  internal static native function duplicateSandboxBridgeInputArguments(toplevel:Object,
                                                                       args:Array):Array;
  internal static native function duplicateSandboxBridgeOutputArgument(toplevel:Object, arg);
  public function Security() {}
}
}
