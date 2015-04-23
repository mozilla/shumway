/**
 * Copyright 2014 Mozilla Foundation
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Class: NetStreamInfo
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class NetStreamInfo extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["currentBytesPerSecond", "byteCount", "maxBytesPerSecond", "audioBytesPerSecond", "audioByteCount", "videoBytesPerSecond", "videoByteCount", "dataBytesPerSecond", "dataByteCount", "playbackBytesPerSecond", "droppedFrames", "audioBufferByteLength", "videoBufferByteLength", "dataBufferByteLength", "audioBufferLength", "videoBufferLength", "dataBufferLength", "SRTT", "audioLossRate", "videoLossRate", "metaData", "xmpData", "uri", "resourceName", "isLive", "toString", "_curBPS", "_byteCount", "_maxBPS", "_audioBPS", "_audioByteCount", "_videoBPS", "_videoByteCount", "_dataBPS", "_dataByteCount", "_playbackBPS", "_droppedFrames", "_audioBufferByteLength", "_videoBufferByteLength", "_dataBufferByteLength", "_audioBufferLength", "_videoBufferLength", "_dataBufferLength", "_srtt", "_audioLossRate", "_videoLossRate", "_metaData", "_xmpData", "_uri", "_resourceName", "_isLive"];
    
    constructor (curBPS: number, byteCount: number, maxBPS: number, audioBPS: number, audioByteCount: number, videoBPS: number, videoByteCount: number, dataBPS: number, dataByteCount: number, playbackBPS: number, droppedFrames: number, audioBufferByteLength: number, videoBufferByteLength: number, dataBufferByteLength: number, audioBufferLength: number, videoBufferLength: number, dataBufferLength: number, srtt: number, audioLossRate: number, videoLossRate: number, metaData: ASObject = null, xmpData: ASObject = null, uri: string = null, resourceName: string = null, isLive: boolean = true) {
      curBPS = +curBPS; byteCount = +byteCount; maxBPS = +maxBPS; audioBPS = +audioBPS; audioByteCount = +audioByteCount; videoBPS = +videoBPS; videoByteCount = +videoByteCount; dataBPS = +dataBPS; dataByteCount = +dataByteCount; playbackBPS = +playbackBPS; droppedFrames = +droppedFrames; audioBufferByteLength = +audioBufferByteLength; videoBufferByteLength = +videoBufferByteLength; dataBufferByteLength = +dataBufferByteLength; audioBufferLength = +audioBufferLength; videoBufferLength = +videoBufferLength; dataBufferLength = +dataBufferLength; srtt = +srtt; audioLossRate = +audioLossRate; videoLossRate = +videoLossRate; metaData = metaData; xmpData = xmpData; uri = asCoerceString(uri); resourceName = asCoerceString(resourceName); isLive = !!isLive;
      false && super();
      dummyConstructor("public flash.net.NetStreamInfo");
    }
    
    // JS -> AS Bindings
    
    currentBytesPerSecond: number;
    byteCount: number;
    maxBytesPerSecond: number;
    audioBytesPerSecond: number;
    audioByteCount: number;
    videoBytesPerSecond: number;
    videoByteCount: number;
    dataBytesPerSecond: number;
    dataByteCount: number;
    playbackBytesPerSecond: number;
    droppedFrames: number;
    audioBufferByteLength: number;
    videoBufferByteLength: number;
    dataBufferByteLength: number;
    audioBufferLength: number;
    videoBufferLength: number;
    dataBufferLength: number;
    SRTT: number;
    audioLossRate: number;
    videoLossRate: number;
    metaData: ASObject;
    xmpData: ASObject;
    uri: string;
    resourceName: string;
    isLive: boolean;
    _curBPS: number;
    _byteCount: number;
    _maxBPS: number;
    _audioBPS: number;
    _audioByteCount: number;
    _videoBPS: number;
    _videoByteCount: number;
    _dataBPS: number;
    _dataByteCount: number;
    _playbackBPS: number;
    _droppedFrames: number;
    _audioBufferByteLength: number;
    _videoBufferByteLength: number;
    _dataBufferByteLength: number;
    _audioBufferLength: number;
    _videoBufferLength: number;
    _dataBufferLength: number;
    _srtt: number;
    _audioLossRate: number;
    _videoLossRate: number;
    _metaData: ASObject;
    _xmpData: ASObject;
    _uri: string;
    _resourceName: string;
    _isLive: boolean;
    
    // AS -> JS Bindings
    
    // _currentBytesPerSecond: number;
    // _byteCount: number;
    // _maxBytesPerSecond: number;
    // _audioBytesPerSecond: number;
    // _audioByteCount: number;
    // _videoBytesPerSecond: number;
    // _videoByteCount: number;
    // _dataBytesPerSecond: number;
    // _dataByteCount: number;
    // _playbackBytesPerSecond: number;
    // _droppedFrames: number;
    // _audioBufferByteLength: number;
    // _videoBufferByteLength: number;
    // _dataBufferByteLength: number;
    // _audioBufferLength: number;
    // _videoBufferLength: number;
    // _dataBufferLength: number;
    // _SRTT: number;
    // _audioLossRate: number;
    // _videoLossRate: number;
    // _metaData: ASObject;
    // _xmpData: ASObject;
    // _uri: string;
    // _resourceName: string;
    // _isLive: boolean;
  }
}
