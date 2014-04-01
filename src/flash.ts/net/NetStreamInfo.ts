/**
 * Copyright 2013 Mozilla Foundation
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
 * limitations undxr the License.
 */
// Class: NetStreamInfo
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class NetStreamInfo extends ASNative {
    static initializer: any = null;
    constructor (curBPS: number, byteCount: number, maxBPS: number, audioBPS: number, audioByteCount: number, videoBPS: number, videoByteCount: number, dataBPS: number, dataByteCount: number, playbackBPS: number, droppedFrames: number, audioBufferByteLength: number, videoBufferByteLength: number, dataBufferByteLength: number, audioBufferLength: number, videoBufferLength: number, dataBufferLength: number, srtt: number, audioLossRate: number, videoLossRate: number, metaData: ASObject = null, xmpData: ASObject = null, uri: string = null, resourceName: string = null, isLive: boolean = true) {
      curBPS = +curBPS; byteCount = +byteCount; maxBPS = +maxBPS; audioBPS = +audioBPS; audioByteCount = +audioByteCount; videoBPS = +videoBPS; videoByteCount = +videoByteCount; dataBPS = +dataBPS; dataByteCount = +dataByteCount; playbackBPS = +playbackBPS; droppedFrames = +droppedFrames; audioBufferByteLength = +audioBufferByteLength; videoBufferByteLength = +videoBufferByteLength; dataBufferByteLength = +dataBufferByteLength; audioBufferLength = +audioBufferLength; videoBufferLength = +videoBufferLength; dataBufferLength = +dataBufferLength; srtt = +srtt; audioLossRate = +audioLossRate; videoLossRate = +videoLossRate; metaData = metaData; xmpData = xmpData; uri = "" + uri; resourceName = "" + resourceName; isLive = !!isLive;
      false && super();
      notImplemented("Dummy Constructor: public flash.net.NetStreamInfo");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    m_currentBytesPerSecond: number;
    m_byteCount: number;
    m_maxBytesPerSecond: number;
    m_audioBytesPerSecond: number;
    m_audioByteCount: number;
    m_videoBytesPerSecond: number;
    m_videoByteCount: number;
    m_dataBytesPerSecond: number;
    m_dataByteCount: number;
    m_playbackBytesPerSecond: number;
    m_droppedFrames: number;
    m_audioBufferByteLength: number;
    m_videoBufferByteLength: number;
    m_dataBufferByteLength: number;
    m_audioBufferLength: number;
    m_videoBufferLength: number;
    m_dataBufferLength: number;
    m_srtt: number;
    m_audioLossRate: number;
    m_videoLossRate: number;
    m_metaData: ASObject;
    m_xmpData: ASObject;
    m_resourceName: string;
    m_uri: string;
    m_isLive: boolean;
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
    // Instance AS -> JS Bindings
  }
}
