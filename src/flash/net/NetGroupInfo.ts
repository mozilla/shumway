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
// Class: NetGroupInfo
module Shumway.AVMX.AS.flash.net {
  export class NetGroupInfo extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null;
    
    constructor(postingSendDataBytesPerSecond: number, postingSendControlBytesPerSecond: number,
                postingReceiveDataBytesPerSecond: number,
                postingReceiveControlBytesPerSecond: number, routingSendBytesPerSecond: number,
                routingReceiveBytesPerSecond: number, objectReplicationSendBytesPerSecond: number,
                objectReplicationReceiveBytesPerSecond: number)
    {
      super();
      this.postingSendDataBytesPerSecond = +postingSendDataBytesPerSecond;
      this.postingSendControlBytesPerSecond = +postingSendControlBytesPerSecond;
      this.postingReceiveDataBytesPerSecond = +postingReceiveDataBytesPerSecond;
      this.postingReceiveControlBytesPerSecond = +postingReceiveControlBytesPerSecond;
      this.routingSendBytesPerSecond = +routingSendBytesPerSecond;
      this.routingReceiveBytesPerSecond = +routingReceiveBytesPerSecond;
      this.objectReplicationSendBytesPerSecond = +objectReplicationSendBytesPerSecond;
      this.objectReplicationReceiveBytesPerSecond = +objectReplicationReceiveBytesPerSecond;
    }
    
    postingSendDataBytesPerSecond: number;
    postingSendControlBytesPerSecond: number;
    postingReceiveDataBytesPerSecond: number;
    postingReceiveControlBytesPerSecond: number;
    routingSendBytesPerSecond: number;
    routingReceiveBytesPerSecond: number;
    objectReplicationSendBytesPerSecond: number;
    objectReplicationReceiveBytesPerSecond: number;
  }
}
