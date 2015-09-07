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
  import assert = Shumway.Debug.assert;
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
    release || assert(_sharedObjectStorage, "SharedObjectStorage is not available.");
    return _sharedObjectStorage;
  }

  export class SharedObject extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    constructor () {
      super();
      this._data = this.sec.createObject();
    }

    static _sharedObjects: any = Object.create(null);


    private static _defaultObjectEncoding = flash.net.ObjectEncoding.DEFAULT;
    static deleteAll(url: string): number /*int*/ {
      url = axCoerceString(url);
      notImplemented("public flash.net.SharedObject::static deleteAll"); return;
    }
    static getDiskUsage(url: string): number /*int*/ {
      url = axCoerceString(url);
      somewhatImplemented("public flash.net.SharedObject::static getDiskUsage");
      return 0;
    }

    private static _create(path: string, data: any, encoding: net.AMFEncoding): SharedObject {
      var obj = new this.sec.flash.net.SharedObject();
      obj._path = path;
      obj._data = data;
      obj._objectEncoding = encoding;
      Telemetry.instance.reportTelemetry({topic: 'feature', feature: Telemetry.Feature.SHAREDOBJECT_FEATURE});
      return obj;
    }

    static getLocal(name: string, localPath: string = null, secure: boolean = false): SharedObject {
      name = axCoerceString(name);
      localPath = axCoerceString(localPath);
      secure = !!secure;
      var path = (localPath || '') + '/' + name;
      if (this._sharedObjects[path]) {
        return this._sharedObjects[path];
      }
      var encodedData = getSharedObjectStorage().getItem(path);
      var data;
      var encoding = this._defaultObjectEncoding;
      if (encodedData) {
        try {
          var bytes = StringUtilities.decodeRestrictedBase64ToBytes(encodedData);
          var serializedData = new this.sec.flash.utils.ByteArray(bytes);
          data = serializedData.readObject();
          encoding = serializedData.objectEncoding;
        } catch (e) {
          Debug.warning('Error encountered while decoding LocalStorage entry. Resetting data.');
        }
        if (!data || typeof data !== 'object') {
          data = this.sec.createObject();
        }
      } else {
        data = this.sec.createObject();
      }
      var so = this._create(path, data, encoding);
      so._objectEncoding = encoding;
      this._sharedObjects[path] = so;
      return so;
    }

    static getRemote(name: string, remotePath: string = null, persistence: any = false,
                     secure: boolean = false): flash.net.SharedObject {
      name = axCoerceString(name); remotePath = axCoerceString(remotePath); secure = !!secure;
      notImplemented("public flash.net.SharedObject::static getRemote"); return;
    }

    static get defaultObjectEncoding(): number /*uint*/ {
      return this._defaultObjectEncoding;
    }
    static set defaultObjectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      this._defaultObjectEncoding = version;
    }

    private _path: string;
    private _data: Object;
    private _fps: number;
    private _objectEncoding: flash.net.AMFEncoding;
    private _pendingFlushId: number;
    // _client: ASObject;

    get data(): Object {
      // Make sure that any changes made to the object get stored.
      // This isn't how Flash does it, and not as efficient as it could be, but it'll
      // do for now.
      this.queueFlush();
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
      this.queueFlush();
    }

    connect(myConnection: NetConnection, params: string = null): void {
      notImplemented("public flash.net.SharedObject::connect");
    }

    send(): void {
      notImplemented("public flash.net.SharedObject::send");
    }

    close(): void {
      somewhatImplemented("public flash.net.SharedObject::close");
    }

    flush(minDiskSpace?: number): string {
      minDiskSpace = minDiskSpace | 0;
      somewhatImplemented("public flash.net.SharedObject::flush");
      if (!this._pendingFlushId) {
        return 'flushed';
      }
      clearTimeout(this._pendingFlushId);
      this._pendingFlushId = 0;
      // Check if the object is empty. If it is, don't create a stored object if one doesn't exist.
      var isEmpty = true;
      for (var key in this._data) {
        if (this._data.hasOwnProperty(key)) {
          isEmpty = false;
          break;
        }
      }
      if (isEmpty && !getSharedObjectStorage().getItem(this._path)) {
        return;
      }
      var serializedData = new this.sec.flash.utils.ByteArray();
      serializedData.objectEncoding = this._objectEncoding;
      serializedData.writeObject(this._data);
      var bytes = serializedData.getBytes();
      var encodedData = StringUtilities.base64EncodeBytes(bytes);
      if (!release) {
        var decoded = StringUtilities.decodeRestrictedBase64ToBytes(encodedData);
        Debug.assert(decoded.byteLength === bytes.byteLength);
        for (var i = 0; i < decoded.byteLength; i++) {
          Debug.assert(decoded[i] === bytes[i]);
        }
      }
      getSharedObjectStorage().setItem(this._path, encodedData);
      return 'flushed';
    }

    clear(): void {
      somewhatImplemented("public flash.net.SharedObject::clear");
      this._data = this.sec.createObject();
      getSharedObjectStorage().removeItem(this._path);
    }

    get size(): number {
      somewhatImplemented("public flash.net.SharedObject::get size");
      this.flush(0);
      var storedData = getSharedObjectStorage().getItem(this._path);
      return storedData ? storedData.length : 0;
    }

    set fps(updatesPerSecond: number) {
      somewhatImplemented("fps");
      this._fps = updatesPerSecond;
    }

    setProperty(propertyName: string, value: any = null):void {
      propertyName = '$Bg' + axCoerceString(propertyName);
      if (value === this._data[propertyName]) {
        return;
      }
      this._data[propertyName] = value;
      this.queueFlush();
    }

    private queueFlush() {
      if (this._pendingFlushId) {
        clearTimeout(this._pendingFlushId);
      }
      this._pendingFlushId = setTimeout(this.flush.bind(this), 100);
    }
  }
}
