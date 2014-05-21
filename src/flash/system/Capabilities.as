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

[native(cls='CapabilitiesClass')]
public final class Capabilities {
  public static native function get isEmbeddedInAcrobat():Boolean;
  public static native function get hasEmbeddedVideo():Boolean;
  public static native function get hasAudio():Boolean;
  public static native function get avHardwareDisable():Boolean;
  public static native function get hasAccessibility():Boolean;
  public static native function get hasAudioEncoder():Boolean;
  public static native function get hasMP3():Boolean;
  public static native function get hasPrinting():Boolean;
  public static native function get hasScreenBroadcast():Boolean;
  public static native function get hasScreenPlayback():Boolean;
  public static native function get hasStreamingAudio():Boolean;
  public static native function get hasStreamingVideo():Boolean;
  public static native function get hasVideoEncoder():Boolean;
  public static native function get isDebugger():Boolean;
  public static native function get localFileReadDisable():Boolean;
  public static native function get language():String;
  public static native function get manufacturer():String;
  public static native function get os():String;
  public static native function get cpuArchitecture():String;
  public static native function get playerType():String;
  public static native function get serverString():String;
  public static native function get version():String;
  public static native function get screenColor():String;
  public static native function get pixelAspectRatio():Number;
  public static native function get screenDPI():Number;
  public static native function get screenResolutionX():Number;
  public static native function get screenResolutionY():Number;
  public static native function get touchscreenType():String;
  public static native function get hasIME():Boolean;
  public static native function get hasTLS():Boolean;
  public static native function get maxLevelIDC():String;
  public static native function get supports32BitProcesses():Boolean;
  public static native function get supports64BitProcesses():Boolean;
  public static native function get _internal():uint;
  public static native function hasMultiChannelAudio(type:String):Boolean;
  public function Capabilities() {}
}
}
