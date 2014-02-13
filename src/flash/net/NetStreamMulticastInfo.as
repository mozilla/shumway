/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package flash.net {
public final class NetStreamMulticastInfo {
  public function NetStreamMulticastInfo(sendDataBytesPerSecond: Number,
                                         sendControlBytesPerSecond: Number,
                                         receiveDataBytesPerSecond: Number,
                                         receiveControlBytesPerSecond: Number,
                                         bytesPushedToPeers: Number, fragmentsPushedToPeers: Number,
                                         bytesRequestedByPeers: Number,
                                         fragmentsRequestedByPeers: Number,
                                         bytesPushedFromPeers: Number,
                                         fragmentsPushedFromPeers: Number,
                                         bytesRequestedFromPeers: Number,
                                         fragmentsRequestedFromPeers: Number,
                                         sendControlBytesPerSecondToServer: Number,
                                         receiveDataBytesPerSecondFromServer: Number,
                                         bytesReceivedFromServer: Number,
                                         fragmentsReceivedFromServer: Number,
                                         receiveDataBytesPerSecondFromIPMulticast: Number,
                                         bytesReceivedFromIPMulticast: Number,
                                         fragmentsReceivedFromIPMulticast: Number)
  {
    this._sendDataBytesPerSecond = sendDataBytesPerSecond;
    this._sendControlBytesPerSecond = sendControlBytesPerSecond;
    this._receiveDataBytesPerSecond = receiveDataBytesPerSecond;
    this._receiveControlBytesPerSecond = receiveControlBytesPerSecond;
    this._bytesPushedToPeers = bytesPushedToPeers;
    this._fragmentsPushedToPeers = fragmentsPushedToPeers;
    this._bytesRequestedByPeers = bytesRequestedByPeers;
    this._fragmentsRequestedByPeers = fragmentsRequestedByPeers;
    this._bytesPushedFromPeers = bytesPushedFromPeers;
    this._fragmentsPushedFromPeers = fragmentsPushedFromPeers;
    this._bytesRequestedFromPeers = bytesRequestedFromPeers;
    this._fragmentsRequestedFromPeers = fragmentsRequestedFromPeers;
    this._sendControlBytesPerSecondToServer = sendControlBytesPerSecondToServer;
    this._receiveDataBytesPerSecondFromServer = receiveDataBytesPerSecondFromServer;
    this._bytesReceivedFromServer = bytesReceivedFromServer;
    this._fragmentsReceivedFromServer = fragmentsReceivedFromServer;
    this._receiveDataBytesPerSecondFromIPMulticast = receiveDataBytesPerSecondFromIPMulticast;
    this._bytesReceivedFromIPMulticast = bytesReceivedFromIPMulticast;
    this._fragmentsReceivedFromIPMulticast = fragmentsReceivedFromIPMulticast;
  }
  private var _sendDataBytesPerSecond: Number;
  private var _sendControlBytesPerSecond: Number;
  private var _receiveDataBytesPerSecond: Number;
  private var _receiveControlBytesPerSecond: Number;
  private var _bytesPushedToPeers: Number;
  private var _fragmentsPushedToPeers: Number;
  private var _bytesRequestedByPeers: Number;
  private var _fragmentsRequestedByPeers: Number;
  private var _bytesPushedFromPeers: Number;
  private var _fragmentsPushedFromPeers: Number;
  private var _bytesRequestedFromPeers: Number;
  private var _fragmentsRequestedFromPeers: Number;
  private var _sendControlBytesPerSecondToServer: Number;
  private var _receiveDataBytesPerSecondFromServer: Number;
  private var _bytesReceivedFromServer: Number;
  private var _fragmentsReceivedFromServer: Number;
  private var _receiveDataBytesPerSecondFromIPMulticast: Number;
  private var _bytesReceivedFromIPMulticast: Number;
  private var _fragmentsReceivedFromIPMulticast: Number;
  public function get sendDataBytesPerSecond(): Number {
    return _sendDataBytesPerSecond;
  }
  public function get sendControlBytesPerSecond(): Number {
    return _sendControlBytesPerSecond;
  }
  public function get receiveDataBytesPerSecond(): Number {
    return _receiveDataBytesPerSecond;
  }
  public function get receiveControlBytesPerSecond(): Number {
    return _receiveControlBytesPerSecond;
  }
  public function get bytesPushedToPeers(): Number {
    return _bytesPushedToPeers;
  }
  public function get fragmentsPushedToPeers(): Number {
    return _fragmentsPushedToPeers;
  }
  public function get bytesRequestedByPeers(): Number {
    return _bytesRequestedByPeers;
  }
  public function get fragmentsRequestedByPeers(): Number {
    return _fragmentsRequestedByPeers;
  }
  public function get bytesPushedFromPeers(): Number {
    return _bytesPushedFromPeers;
  }
  public function get fragmentsPushedFromPeers(): Number {
    return _fragmentsPushedFromPeers;
  }
  public function get bytesRequestedFromPeers(): Number {
    return _bytesRequestedFromPeers;
  }
  public function get fragmentsRequestedFromPeers(): Number {
    return _fragmentsRequestedFromPeers;
  }
  public function get sendControlBytesPerSecondToServer(): Number {
    return _sendControlBytesPerSecondToServer;
  }
  public function get receiveDataBytesPerSecondFromServer(): Number {
    return _receiveDataBytesPerSecondFromServer;
  }
  public function get bytesReceivedFromServer(): Number {
    return _bytesReceivedFromServer;
  }
  public function get fragmentsReceivedFromServer(): Number {
    return _fragmentsReceivedFromServer;
  }
  public function get receiveDataBytesPerSecondFromIPMulticast(): Number {
    return _receiveDataBytesPerSecondFromIPMulticast;
  }
  public function get bytesReceivedFromIPMulticast(): Number {
    return _bytesReceivedFromIPMulticast;
  }
  public function get fragmentsReceivedFromIPMulticast(): Number {
    return _fragmentsReceivedFromIPMulticast;
  }
  public function toString(): String {
    return 'sendDataBytesPerSecond=' + _sendDataBytesPerSecond +
           ' sendControlBytesPerSecond=' + _sendControlBytesPerSecond +
           ' receiveDataBytesPerSecond=' + _receiveDataBytesPerSecond +
           ' receiveControlBytesPerSecond=' + _receiveControlBytesPerSecond +
           ' bytesPushedToPeers=' + _bytesPushedToPeers +
           ' fragmentsPushedToPeers=' + _fragmentsPushedToPeers +
           ' bytesRequestedByPeers=' + _bytesRequestedByPeers +
           ' fragmentsRequestedByPeers=' + _fragmentsRequestedByPeers +
           ' bytesPushedFromPeers=' + _bytesPushedFromPeers +
           ' fragmentsPushedFromPeers=' + _fragmentsPushedFromPeers +
           ' bytesRequestedFromPeers=' + _bytesRequestedFromPeers +
           ' fragmentsRequestedFromPeers=' + _fragmentsRequestedFromPeers +
           ' sendControlBytesPerSecondToServer=' + _sendControlBytesPerSecondToServer +
           ' receiveDataBytesPerSecondFromServer=' + _receiveDataBytesPerSecondFromServer +
           ' bytesReceivedFromServer=' + _bytesReceivedFromServer +
           ' fragmentsReceivedFromServer=' + _fragmentsReceivedFromServer +
           ' receiveDataBytesPerSecondFromIPMulticast=' + _receiveDataBytesPerSecondFromIPMulticast +
           ' bytesReceivedFromIPMulticast=' + _bytesReceivedFromIPMulticast +
           ' fragmentsReceivedFromIPMulticast=' + _fragmentsReceivedFromIPMulticast;
  }
}
}
