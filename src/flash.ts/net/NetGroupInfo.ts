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
// Class: NetGroupInfo
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class NetGroupInfo extends ASNative {
    static initializer: any = null;
    constructor (postingSendDataBytesPerSecond: number, postingSendControlBytesPerSecond: number, postingReceiveDataBytesPerSecond: number, postingReceiveControlBytesPerSecond: number, routingSendBytesPerSecond: number, routingReceiveBytesPerSecond: number, objectReplicationSendBytesPerSecond: number, objectReplicationReceiveBytesPerSecond: number) {
      postingSendDataBytesPerSecond = +postingSendDataBytesPerSecond; postingSendControlBytesPerSecond = +postingSendControlBytesPerSecond; postingReceiveDataBytesPerSecond = +postingReceiveDataBytesPerSecond; postingReceiveControlBytesPerSecond = +postingReceiveControlBytesPerSecond; routingSendBytesPerSecond = +routingSendBytesPerSecond; routingReceiveBytesPerSecond = +routingReceiveBytesPerSecond; objectReplicationSendBytesPerSecond = +objectReplicationSendBytesPerSecond; objectReplicationReceiveBytesPerSecond = +objectReplicationReceiveBytesPerSecond;
      false && super();
      notImplemented("Dummy Constructor: public flash.net.NetGroupInfo");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    m_postingSendDataBytesPerSecond: number;
    m_postingSendControlBytesPerSecond: number;
    m_postingReceiveDataBytesPerSecond: number;
    m_postingReceiveControlBytesPerSecond: number;
    m_routingSendBytesPerSecond: number;
    m_routingReceiveBytesPerSecond: number;
    m_objectReplicationSendBytesPerSecond: number;
    m_objectReplicationReceiveBytesPerSecond: number;
    postingSendDataBytesPerSecond: number;
    postingSendControlBytesPerSecond: number;
    postingReceiveDataBytesPerSecond: number;
    postingReceiveControlBytesPerSecond: number;
    routingSendBytesPerSecond: number;
    routingReceiveBytesPerSecond: number;
    objectReplicationSendBytesPerSecond: number;
    objectReplicationReceiveBytesPerSecond: number;
    // Instance AS -> JS Bindings
  }
}
