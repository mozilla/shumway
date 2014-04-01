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
// Class: NetStreamMulticastInfo
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class NetStreamMulticastInfo extends ASNative {
    static initializer: any = null;
    constructor (sendDataBytesPerSecond: number, sendControlBytesPerSecond: number, receiveDataBytesPerSecond: number, receiveControlBytesPerSecond: number, bytesPushedToPeers: number, fragmentsPushedToPeers: number, bytesRequestedByPeers: number, fragmentsRequestedByPeers: number, bytesPushedFromPeers: number, fragmentsPushedFromPeers: number, bytesRequestedFromPeers: number, fragmentsRequestedFromPeers: number, sendControlBytesPerSecondToServer: number, receiveDataBytesPerSecondFromServer: number, bytesReceivedFromServer: number, fragmentsReceivedFromServer: number, receiveDataBytesPerSecondFromIPMulticast: number, bytesReceivedFromIPMulticast: number, fragmentsReceivedFromIPMulticast: number) {
      sendDataBytesPerSecond = +sendDataBytesPerSecond; sendControlBytesPerSecond = +sendControlBytesPerSecond; receiveDataBytesPerSecond = +receiveDataBytesPerSecond; receiveControlBytesPerSecond = +receiveControlBytesPerSecond; bytesPushedToPeers = +bytesPushedToPeers; fragmentsPushedToPeers = +fragmentsPushedToPeers; bytesRequestedByPeers = +bytesRequestedByPeers; fragmentsRequestedByPeers = +fragmentsRequestedByPeers; bytesPushedFromPeers = +bytesPushedFromPeers; fragmentsPushedFromPeers = +fragmentsPushedFromPeers; bytesRequestedFromPeers = +bytesRequestedFromPeers; fragmentsRequestedFromPeers = +fragmentsRequestedFromPeers; sendControlBytesPerSecondToServer = +sendControlBytesPerSecondToServer; receiveDataBytesPerSecondFromServer = +receiveDataBytesPerSecondFromServer; bytesReceivedFromServer = +bytesReceivedFromServer; fragmentsReceivedFromServer = +fragmentsReceivedFromServer; receiveDataBytesPerSecondFromIPMulticast = +receiveDataBytesPerSecondFromIPMulticast; bytesReceivedFromIPMulticast = +bytesReceivedFromIPMulticast; fragmentsReceivedFromIPMulticast = +fragmentsReceivedFromIPMulticast;
      false && super();
      notImplemented("Dummy Constructor: public flash.net.NetStreamMulticastInfo");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    m_sendDataBytesPerSecond: number;
    m_sendControlBytesPerSecond: number;
    m_receiveDataBytesPerSecond: number;
    m_receiveControlBytesPerSecond: number;
    m_bytesPushedToPeers: number;
    m_fragmentsPushedToPeers: number;
    m_bytesRequestedByPeers: number;
    m_fragmentsRequestedByPeers: number;
    m_bytesPushedFromPeers: number;
    m_fragmentsPushedFromPeers: number;
    m_bytesRequestedFromPeers: number;
    m_fragmentsRequestedFromPeers: number;
    m_sendControlBytesPerSecondToServer: number;
    m_receiveDataBytesPerSecondFromServer: number;
    m_bytesReceivedFromServer: number;
    m_fragmentsReceivedFromServer: number;
    m_receiveDataBytesPerSecondFromIPMulticast: number;
    m_bytesReceivedFromIPMulticast: number;
    m_fragmentsReceivedFromIPMulticast: number;
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
    // Instance AS -> JS Bindings
  }
}
