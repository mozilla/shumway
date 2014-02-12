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
public final class NetStreamInfo {
  public function NetStreamInfo(curBPS:Number, byteCount:Number, maxBPS:Number, audioBPS:Number, audioByteCount:Number, videoBPS:Number, videoByteCount:Number, dataBPS:Number, dataByteCount:Number, playbackBPS:Number, droppedFrames:Number, audioBufferByteLength:Number, videoBufferByteLength:Number, dataBufferByteLength:Number, audioBufferLength:Number, videoBufferLength:Number, dataBufferLength:Number, srtt:Number, audioLossRate:Number, videoLossRate:Number, metaData:Object = null, xmpData:Object = null, uri:String = null, resourceName:String = null, isLive:Boolean = true) {
    this._curBPS = curBPS;
    this._byteCount = byteCount;
    this._maxBPS = maxBPS;
    this._audioBPS = audioBPS;
    this._audioByteCount = audioByteCount;
    this._videoBPS = videoBPS;
    this._videoByteCount = videoByteCount;
    this._dataBPS = dataBPS;
    this._dataByteCount = dataByteCount;
    this._playbackBPS = playbackBPS;
    this._droppedFrames = droppedFrames;
    this._audioBufferByteLength = audioBufferByteLength;
    this._videoBufferByteLength = videoBufferByteLength;
    this._dataBufferByteLength = dataBufferByteLength;
    this._audioBufferLength = audioBufferLength;
    this._videoBufferLength = videoBufferLength;
    this._dataBufferLength = dataBufferLength;
    this._srtt = srtt;
    this._audioLossRate = audioLossRate;
    this._videoLossRate = videoLossRate;
    this._metaData = metaData;
    this._xmpData = xmpData;
    this._uri = uri;
    this._resourceName = resourceName;
    this._isLive = isLive;
  }
  public function get currentBytesPerSecond():Number {
    return _curBPS;
  }
  public function get byteCount():Number {
    return _byteCount;
  }
  public function get maxBytesPerSecond():Number {
    return _maxBPS;
  }
  public function get audioBytesPerSecond():Number {
    return _audioBPS;
  }
  public function get audioByteCount():Number {
    return _audioByteCount;
  }
  public function get videoBytesPerSecond():Number {
    return _videoBPS;
  }
  public function get videoByteCount():Number {
    return _videoByteCount;
  }
  public function get dataBytesPerSecond():Number {
    return _dataBPS;
  }
  public function get dataByteCount():Number {
    return _dataByteCount;
  }
  public function get playbackBytesPerSecond():Number {
    return _playbackBPS;
  }
  public function get droppedFrames():Number {
    return _droppedFrames;
  }
  public function get audioBufferByteLength():Number {
    return _audioBufferByteLength;
  }
  public function get videoBufferByteLength():Number {
    return _videoBufferByteLength;
  }
  public function get dataBufferByteLength():Number {
    return _dataBufferByteLength;
  }
  public function get audioBufferLength():Number {
    return _audioBufferLength;
  }
  public function get videoBufferLength():Number {
    return _videoBufferLength;
  }
  public function get dataBufferLength():Number {
    return _dataBufferLength;
  }
  public function get SRTT():Number {
    return _srtt;
  }
  public function get audioLossRate():Number {
    return _audioLossRate;
  }
  public function get videoLossRate():Number {
    return _videoLossRate;
  }
  public function get metaData():Object {
    return _metaData;
  }
  public function get xmpData():Object {
    return _xmpData;
  }
  public function get uri():String {
    return _uri;
  }
  public function get resourceName():String {
    return _resourceName;
  }
  public function get isLive():Boolean {
    return _isLive;
  }
  public function toString():String {
    notImplemented("toString");
    return "";
  }

  private var _curBPS:Number;
  private var _byteCount:Number;
  private var _maxBPS:Number;
  private var _audioBPS:Number;
  private var _audioByteCount:Number;
  private var _videoBPS:Number;
  private var _videoByteCount:Number;
  private var _dataBPS:Number;
  private var _dataByteCount:Number;
  private var _playbackBPS:Number;
  private var _droppedFrames:Number;
  private var _audioBufferByteLength:Number;
  private var _videoBufferByteLength:Number;
  private var _dataBufferByteLength:Number;
  private var _audioBufferLength:Number;
  private var _videoBufferLength:Number;
  private var _dataBufferLength:Number;
  private var _srtt:Number;
  private var _audioLossRate:Number;
  private var _videoLossRate:Number;
  private var _metaData:Object;
  private var _xmpData:Object;
  private var _uri:String;
  private var _resourceName:String;
  private var _isLive:Boolean;
}
}
