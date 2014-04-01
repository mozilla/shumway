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
// Class: SharedObject
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class SharedObject extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.SharedObject");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static deleteAll(url: string): number /*int*/ {
      url = "" + url;
      notImplemented("public flash.net.SharedObject::static deleteAll"); return;
    }
    static getDiskUsage(url: string): number /*int*/ {
      url = "" + url;
      notImplemented("public flash.net.SharedObject::static getDiskUsage"); return;
    }
    static getLocal(name: string, localPath: string = null, secure: boolean = false): flash.net.SharedObject {
      name = "" + name; localPath = "" + localPath; secure = !!secure;
      notImplemented("public flash.net.SharedObject::static getLocal"); return;
    }
    static getRemote(name: string, remotePath: string = null, persistence: ASObject = false, secure: boolean = false): flash.net.SharedObject {
      name = "" + name; remotePath = "" + remotePath; persistence = persistence; secure = !!secure;
      notImplemented("public flash.net.SharedObject::static getRemote"); return;
    }
    get defaultObjectEncoding(): number /*uint*/ {
      notImplemented("public flash.net.SharedObject::get defaultObjectEncoding"); return;
    }
    set defaultObjectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("public flash.net.SharedObject::set defaultObjectEncoding"); return;
    }
    // Instance JS -> AS Bindings
    connect: (myConnection: flash.net.NetConnection, params: string = null) => void;
    close: () => void;
    flush: (minDiskSpace: number /*int*/ = 0) => string;
    size: number /*uint*/;
    fps: number;
    send: () => void;
    clear: () => void;
    setProperty: (propertyName: string, value: ASObject = null) => void;
    // Instance AS -> JS Bindings
    get data(): ASObject {
      notImplemented("public flash.net.SharedObject::get data"); return;
    }
    get objectEncoding(): number /*uint*/ {
      notImplemented("public flash.net.SharedObject::get objectEncoding"); return;
    }
    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("public flash.net.SharedObject::set objectEncoding"); return;
    }
    get client(): ASObject {
      notImplemented("public flash.net.SharedObject::get client"); return;
    }
    set client(object: ASObject) {
      object = object;
      notImplemented("public flash.net.SharedObject::set client"); return;
    }
    setDirty(propertyName: string): void {
      propertyName = "" + propertyName;
      notImplemented("public flash.net.SharedObject::setDirty"); return;
    }
    invoke(index: number /*uint*/): any {
      index = index >>> 0;
      notImplemented("public flash.net.SharedObject::invoke"); return;
    }
    invokeWithArgsArray(index: number /*uint*/, args: any []): any {
      index = index >>> 0; args = args;
      notImplemented("public flash.net.SharedObject::invokeWithArgsArray"); return;
    }
  }
}
