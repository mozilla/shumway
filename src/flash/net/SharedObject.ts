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
// Class: SharedObject
module Shumway.AVMX.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;

  interface IStorage {
    getItem(key: string): string;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
  }

  var _sharedObjectStorage: IStorage;

  function getSharedObjectStorage(): IStorage  {
    if (!_sharedObjectStorage) {
      if (typeof ShumwayCom !== 'undefined' && ShumwayCom.createSpecialStorage) {
        _sharedObjectStorage = ShumwayCom.createSpecialStorage();
      } else {
        _sharedObjectStorage = (<any>window).sessionStorage;
      }
    }
    return _sharedObjectStorage;
  }

  export class SharedObject extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["connect", "close", "flush", "size", "fps", "send", "clear", "setProperty"];
    
    constructor () {
      super();
      this._data = Object.create(null);
    }

    static _sharedObjects: any = Object.create(null);

    private _path: string;

    // JS -> AS Bindings
    
    connect: (myConnection: flash.net.NetConnection, params?: string) => void;
    close: () => void;
    flush: (minDiskSpace?: number /*int*/) => string;
    size: number /*uint*/;
    fps: number;
    send: () => void;
    clear: () => void;
    setProperty: (propertyName: string, value?: ASObject) => void;
    
    // AS -> JS Bindings
    private static _defaultObjectEncoding: number /*uint*/ = 3 /* AMF3 */;
    static deleteAll(url: string): number /*int*/ {
      url = axCoerceString(url);
      notImplemented("public flash.net.SharedObject::static deleteAll"); return;
    }
    static getDiskUsage(url: string): number /*int*/ {
      url = axCoerceString(url);
      notImplemented("public flash.net.SharedObject::static getDiskUsage"); return;
    }
    static _create(path: string, data: any): SharedObject {
      var obj = new SharedObject();
      obj._path = path;
      obj._data = data;
      obj._objectEncoding = SharedObject._defaultObjectEncoding;
      Telemetry.instance.reportTelemetry({topic: 'feature', feature: Telemetry.Feature.SHAREDOBJECT_FEATURE});
      return obj;
    }
    static getLocal(name: string, localPath: string = null, secure: boolean = false): flash.net.SharedObject {
      name = axCoerceString(name); localPath = axCoerceString(localPath); secure = !!secure;
      var path = (localPath || '') + '/' + name;
      if (SharedObject._sharedObjects[path]) {
        return SharedObject._sharedObjects[path];
      }
      var data = getSharedObjectStorage().getItem(path);
      // TODO: JSON here probably needs to convert things into AS3 objects.
      var so = SharedObject._create(path, data ? JSON.parse(data) : {});
      // so._data[Multiname.getPublicQualifiedName("cookie")] = {};
      // so._data[Multiname.getPublicQualifiedName("cookie")][Multiname.getPublicQualifiedName("lc")] = 32;
      // so._data[Multiname.getPublicQualifiedName("levelCompleted")] = 32;
      // so._data[Multiname.getPublicQualifiedName("completeLevels")] = 32;
      SharedObject._sharedObjects[path] = so;
      return so;
    }
    static getRemote(name: string, remotePath: string = null, persistence: any = false, secure: boolean = false): flash.net.SharedObject {
      name = axCoerceString(name); remotePath = axCoerceString(remotePath); secure = !!secure;
      notImplemented("public flash.net.SharedObject::static getRemote"); return;
    }
    static get defaultObjectEncoding(): number /*uint*/ {
      return SharedObject._defaultObjectEncoding;
    }
    static set defaultObjectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      SharedObject._defaultObjectEncoding = version;
    }
    
    private _data: Object;
    // _size: number /*uint*/;
    // _fps: number;
    private _objectEncoding: number /*uint*/;
    // _client: ASObject;
    get data(): Object {
      return this._data;
    }
    get objectEncoding(): number /*uint*/ {
      return this._objectEncoding;
    }
    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      this._objectEncoding = version;
    }
    get client(): ASObject {
      notImplemented("public flash.net.SharedObject::get client"); return;
      // return this._client;
    }
    set client(object: ASObject) {
      object = object;
      notImplemented("public flash.net.SharedObject::set client"); return;
      // this._client = object;
    }
    setDirty(propertyName: string): void {
      propertyName = axCoerceString(propertyName);
      somewhatImplemented("public flash.net.SharedObject::setDirty");
    }
    invoke(index: number /*uint*/): any {
      index = index >>> 0;
      return this._invoke(index, Array.prototype.slice.call(arguments, 1));
    }
    invokeWithArgsArray(index: number /*uint*/, args: any []): any {
      index = index >>> 0;
      return this._invoke(index, args);
    }
    private _invoke(index: number, args: any[]) {
      var simulated = false, result;
      switch (index) {
        case 4: // get size()
          result = JSON.stringify(this._data).length - 2;
          simulated = true;
          break;
        case 6: // clear
          this._data = {};
          getSharedObjectStorage().removeItem(this._path);
          simulated = true;
          break;
        case 2: // flush
          getSharedObjectStorage().setItem(this._path, JSON.stringify(this._data));
          simulated = true;
          result = true;
          break;
        case 3: // close
          simulated = true;
          break;
      }
      (simulated ? somewhatImplemented : notImplemented)(
        "private flash.net.SharedObject::_invoke (" + index + ")");
      return result;
    }
  }
}
