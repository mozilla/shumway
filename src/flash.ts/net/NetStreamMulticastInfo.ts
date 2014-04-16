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
 * limitations under the License.
 */
// Class: NetStreamMulticastInfo
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class NetStreamMulticastInfo extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["_sendDataBytesPerSecond", "_sendControlBytesPerSecond", "_receiveDataBytesPerSecond", "_receiveControlBytesPerSecond", "_bytesPushedToPeers", "_fragmentsPushedToPeers", "_bytesRequestedByPeers", "_fragmentsRequestedByPeers", "_bytesPushedFromPeers", "_fragmentsPushedFromPeers", "_bytesRequestedFromPeers", "_fragmentsRequestedFromPeers", "_sendControlBytesPerSecondToServer", "_receiveDataBytesPerSecondFromServer", "_bytesReceivedFromServer", "_fragmentsReceivedFromServer", "_receiveDataBytesPerSecondFromIPMulticast", "_bytesReceivedFromIPMulticast", "_fragmentsReceivedFromIPMulticast", "sendDataBytesPerSecond", "sendControlBytesPerSecond", "receiveDataBytesPerSecond", "receiveControlBytesPerSecond", "bytesPushedToPeers", "fragmentsPushedToPeers", "bytesRequestedByPeers", "fragmentsRequestedByPeers", "bytesPushedFromPeers", "fragmentsPushedFromPeers", "bytesRequestedFromPeers", "fragmentsRequestedFromPeers", "sendControlBytesPerSecondToServer", "receiveDataBytesPerSecondFromServer", "bytesReceivedFromServer", "fragmentsReceivedFromServer", "receiveDataBytesPerSecondFromIPMulticast", "bytesReceivedFromIPMulticast", "fragmentsReceivedFromIPMulticast", "toString"];
    
    constructor (sendDataBytesPerSecond: number, sendControlBytesPerSecond: number, receiveDataBytesPerSecond: number, receiveControlBytesPerSecond: number, bytesPushedToPeers: number, fragmentsPushedToPeers: number, bytesRequestedByPeers: number, fragmentsRequestedByPeers: number, bytesPushedFromPeers: number, fragmentsPushedFromPeers: number, bytesRequestedFromPeers: number, fragmentsRequestedFromPeers: number, sendControlBytesPerSecondToServer: number, receiveDataBytesPerSecondFromServer: number, bytesReceivedFromServer: number, fragmentsReceivedFromServer: number, receiveDataBytesPerSecondFromIPMulticast: number, bytesReceivedFromIPMulticast: number, fragmentsReceivedFromIPMulticast: number) {
      sendDataBytesPerSecond = +sendDataBytesPerSecond; sendControlBytesPerSecond = +sendControlBytesPerSecond; receiveDataBytesPerSecond = +receiveDataBytesPerSecond; receiveControlBytesPerSecond = +receiveControlBytesPerSecond; bytesPushedToPeers = +bytesPushedToPeers; fragmentsPushedToPeers = +fragmentsPushedToPeers; bytesRequestedByPeers = +bytesRequestedByPeers; fragmentsRequestedByPeers = +fragmentsRequestedByPeers; bytesPushedFromPeers = +bytesPushedFromPeers; fragmentsPushedFromPeers = +fragmentsPushedFromPeers; bytesRequestedFromPeers = +bytesRequestedFromPeers; fragmentsRequestedFromPeers = +fragmentsRequestedFromPeers; sendControlBytesPerSecondToServer = +sendControlBytesPerSecondToServer; receiveDataBytesPerSecondFromServer = +receiveDataBytesPerSecondFromServer; bytesReceivedFromServer = +bytesReceivedFromServer; fragmentsReceivedFromServer = +fragmentsReceivedFromServer; receiveDataBytesPerSecondFromIPMulticast = +receiveDataBytesPerSecondFromIPMulticast; bytesReceivedFromIPMulticast = +bytesReceivedFromIPMulticast; fragmentsReceivedFromIPMulticast = +fragmentsReceivedFromIPMulticast;
      false && super();
      notImplemented("Dummy Constructor: public flash.net.NetStreamMulticastInfo");
    }
    
    // JS -> AS Bindings
    
    _sendDataBytesPerSecond: number;
    _sendControlBytesPerSecond: number;
    _receiveDataBytesPerSecond: number;
    _receiveControlBytesPerSecond: number;
    _bytesPushedToPeers: number;
    _fragmentsPushedToPeers: number;
    _bytesRequestedByPeers: number;
    _fragmentsRequestedByPeers: number;
    _bytesPushedFromPeers: number;
    _fragmentsPushedFromPeers: number;
    _bytesRequestedFromPeers: number;
    _fragmentsRequestedFromPeers: number;
    _sendControlBytesPerSecondToServer: number;
    _receiveDataBytesPerSecondFromServer: number;
    _bytesReceivedFromServer: number;
    _fragmentsReceivedFromServer: number;
    _receiveDataBytesPerSecondFromIPMulticast: number;
    _bytesReceivedFromIPMulticast: number;
    _fragmentsReceivedFromIPMulticast: number;
    sendDataBytesPerSecond: number;
    sendControlBytesPerSecond: number;
    receiveDataBytesPerSecond: number;
    receiveControlBytesPerSecond: number;
    bytesPushedToPeers: number;
    fragmentsPushedToPeers: number;
    bytesRequestedByPeers: number;
    fragmentsRequestedByPeers: number;
    bytesPushedFromPeers: number;
    fragmentsPushedFromPeers: number;
    bytesRequestedFromPeers: number;
    fragmentsRequestedFromPeers: number;
    sendControlBytesPerSecondToServer: number;
    receiveDataBytesPerSecondFromServer: number;
    bytesReceivedFromServer: number;
    fragmentsReceivedFromServer: number;
    receiveDataBytesPerSecondFromIPMulticast: number;
    bytesReceivedFromIPMulticast: number;
    fragmentsReceivedFromIPMulticast: number;
    
    // AS -> JS Bindings
    
    // _sendDataBytesPerSecond: number;
    // _sendControlBytesPerSecond: number;
    // _receiveDataBytesPerSecond: number;
    // _receiveControlBytesPerSecond: number;
    // _bytesPushedToPeers: number;
    // _fragmentsPushedToPeers: number;
    // _bytesRequestedByPeers: number;
    // _fragmentsRequestedByPeers: number;
    // _bytesPushedFromPeers: number;
    // _fragmentsPushedFromPeers: number;
    // _bytesRequestedFromPeers: number;
    // _fragmentsRequestedFromPeers: number;
    // _sendControlBytesPerSecondToServer: number;
    // _receiveDataBytesPerSecondFromServer: number;
    // _bytesReceivedFromServer: number;
    // _fragmentsReceivedFromServer: number;
    // _receiveDataBytesPerSecondFromIPMulticast: number;
    // _bytesReceivedFromIPMulticast: number;
    // _fragmentsReceivedFromIPMulticast: number;
  }
}
