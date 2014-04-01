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
// Class: GroupSpecifier
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GroupSpecifier extends ASNative {
    static initializer: any = null;
    constructor (name: string) {
      name = "" + name;
      false && super();
      notImplemented("Dummy Constructor: public flash.net.GroupSpecifier");
    }
    // Static   JS -> AS Bindings
    static encodePostingAuthorization: (password: string) => string;
    static encodePublishAuthorization: (password: string) => string;
    static encodeIPMulticastAddressSpec: (address: string, port: any = null, source: string = null) => string;
    static encodeBootstrapPeerIDSpec: (peerID: string) => string;
    static SaltedSHA256: (salt: string, bytes: flash.utils.ByteArray) => string;
    static encodeIPMulticastAddress: (address: string, port: any, source: string) => string;
    static hexByte: (byte: number /*uint*/) => string;
    static vlu: (num: number /*uint*/) => string;
    static toOption: (optionID: number /*uint*/, hexBytes: string) => string;
    static inet_ptohex4: (address: string, port: any = null) => string;
    static inet_ptohex6: (address: string, port: any = null) => string;
    static byteArrayToHex: (bytes: flash.utils.ByteArray) => string;
    static stringToBytes: (str: string) => flash.utils.ByteArray;
    static SHA256: (arr: flash.utils.ByteArray) => string;
    // Static   AS -> JS Bindings
    static calcSHA256Digest(input: flash.utils.ByteArray): string {
      input = input;
      notImplemented("public flash.net.GroupSpecifier::static calcSHA256Digest"); return;
    }
    static GetCryptoRandomString(length: number /*uint*/): string {
      length = length >>> 0;
      notImplemented("public flash.net.GroupSpecifier::static GetCryptoRandomString"); return;
    }
    // Instance JS -> AS Bindings
    makeUnique: () => void;
    routingEnabled: boolean;
    multicastEnabled: boolean;
    objectReplicationEnabled: boolean;
    postingEnabled: boolean;
    clearIPMulticastAddresses: () => void;
    clearBootstrapPeers: () => void;
    peerToPeerDisabled: boolean;
    ipMulticastMemberUpdatesEnabled: boolean;
    setPublishPassword: (password: string = null, salt: string = null) => void;
    setPostingPassword: (password: string = null, salt: string = null) => void;
    serverChannelEnabled: boolean;
    addBootstrapPeer: (peerID: string) => void;
    addIPMulticastAddress: (address: string, port: any = null, source: string = null) => void;
    groupspecWithoutAuthorizations: () => string;
    groupspecExtras: () => string;
    groupspecWithAuthorizations: () => string;
    authorizations: () => string;
    m_routing: string;
    m_multicast: string;
    m_objectReplication: string;
    m_posting: string;
    m_publishAuthHash: string;
    m_postingAuthHash: string;
    m_ipMulticastAddresses: string;
    m_bootstrapPeers: string;
    m_openServerChannel: string;
    m_disablePeerToPeer: string;
    m_tag: string;
    m_unique: string;
    m_publishAuth: string;
    m_postingAuth: string;
    m_ipMulticastMemberUpdates: string;
    // Instance AS -> JS Bindings
  }
}
