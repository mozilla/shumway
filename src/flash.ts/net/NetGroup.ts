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
// Class: NetGroup
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class NetGroup extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor (connection: flash.net.NetConnection, groupspec: string) {
      connection = connection; groupspec = "" + groupspec;
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.NetGroup");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    onStatus: (info: any) => void;
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
    // Instance AS -> JS Bindings
    ctor(connection: flash.net.NetConnection, groupspec: string): void {
      connection = connection; groupspec = "" + groupspec;
      notImplemented("public flash.net.NetGroup::ctor"); return;
    }
    invoke(index: number /*uint*/): any {
      index = index >>> 0;
      notImplemented("public flash.net.NetGroup::invoke"); return;
    }
    get info(): flash.net.NetGroupInfo {
      notImplemented("public flash.net.NetGroup::get info"); return;
    }
    convertPeerIDToGroupAddress(peerID: string): string {
      peerID = "" + peerID;
      notImplemented("public flash.net.NetGroup::convertPeerIDToGroupAddress"); return;
    }
    get localCoverageFrom(): string {
      notImplemented("public flash.net.NetGroup::get localCoverageFrom"); return;
    }
    get localCoverageTo(): string {
      notImplemented("public flash.net.NetGroup::get localCoverageTo"); return;
    }
  }
}
