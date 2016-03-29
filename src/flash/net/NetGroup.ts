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
// Class: NetGroup
module Shumway.AVMX.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class NetGroup extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["close", "replicationStrategy", "replicationStrategy", "addHaveObjects", "removeHaveObjects", "addWantObjects", "removeWantObjects", "writeRequestedObject", "denyRequestedObject", "estimatedMemberCount", "neighborCount", "receiveMode", "receiveMode", "post", "sendToNearest", "sendToNeighbor", "sendToAllNeighbors", "addNeighbor", "addMemberHint"];
    
    constructor (connection: flash.net.NetConnection, groupspec: string) {
      super();
      connection = connection; groupspec = axCoerceString(groupspec);
    }
    
    // JS -> AS Bindings
    
    close: () => void;
    replicationStrategy: string;
    addHaveObjects: (startIndex: number, endIndex: number) => void;
    removeHaveObjects: (startIndex: number, endIndex: number) => void;
    addWantObjects: (startIndex: number, endIndex: number) => void;
    removeWantObjects: (startIndex: number, endIndex: number) => void;
    writeRequestedObject: (requestID: number /*int*/, object: ASObject) => void;
    denyRequestedObject: (requestID: number /*int*/) => void;
    estimatedMemberCount: number;
    neighborCount: number;
    receiveMode: string;
    post: (message: ASObject) => string;
    sendToNearest: (message: ASObject, groupAddress: string) => string;
    sendToNeighbor: (message: ASObject, sendMode: string) => string;
    sendToAllNeighbors: (message: ASObject) => string;
    addNeighbor: (peerID: string) => boolean;
    addMemberHint: (peerID: string) => boolean;
    
    // AS -> JS Bindings
    
    // _replicationStrategy: string;
    // _estimatedMemberCount: number;
    // _neighborCount: number;
    // _receiveMode: string;
    // _info: flash.net.NetGroupInfo;
    // _localCoverageFrom: string;
    // _localCoverageTo: string;
    get info(): flash.net.NetGroupInfo {
      release || notImplemented("public flash.net.NetGroup::get info"); return;
      // return this._info;
    }
    convertPeerIDToGroupAddress(peerID: string): string {
      peerID = axCoerceString(peerID);
      release || notImplemented("public flash.net.NetGroup::convertPeerIDToGroupAddress"); return;
    }
    get localCoverageFrom(): string {
      release || notImplemented("public flash.net.NetGroup::get localCoverageFrom"); return;
      // return this._localCoverageFrom;
    }
    get localCoverageTo(): string {
      release || notImplemented("public flash.net.NetGroup::get localCoverageTo"); return;
      // return this._localCoverageTo;
    }
  }
}
