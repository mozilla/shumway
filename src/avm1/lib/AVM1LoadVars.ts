/**
 * Copyright 2015 Mozilla Foundation
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

///<reference path='../references.ts' />

module Shumway.AVM1.Lib {
  import ASObject = Shumway.AVMX.AS.ASObject;
  import flash = Shumway.AVMX.AS.flash;
  import axCoerceString = Shumway.AVMX.axCoerceString;

  export interface IAVM1DataObject {
    isAVM1DataObject: boolean;
    _as3Loader: flash.net.URLLoader;
    getBytesLoaded(): number;
    getBytesTotal(): number;
  }

  export function loadAVM1DataObject(context: AVM1Context, url: string,
                                     method: string, contentType: string,
                                     data: any, target: IAVM1DataObject): void {
    var request = new context.sec.flash.net.URLRequest(url);
    if (method) {
      request.method = method;
    }
    if (contentType) {
      request.contentType = contentType;
    }
    if (data) {
      release || Debug.assert(typeof data === 'string');
      request.data = data;
    }
    var loader = new context.sec.flash.net.URLLoader(request);
    loader.dataFormat = 'text'; // flash.net.URLLoaderDataFormat.TEXT;
    var completeHandler = context.sec.boxFunction(function (event: flash.events.Event): void {
      loader.removeEventListener(flash.events.Event.COMPLETE, completeHandler);
      release || Debug.assert(typeof loader.data === 'string');
      avm1BroadcastEvent(context, target, 'onData', [loader.data]);
    });
    loader.addEventListener(flash.events.Event.COMPLETE, completeHandler);
    target._as3Loader = loader;
  }

  export class AVM1LoadVarsFunction extends AVM1Function {
    constructor(context: AVM1Context) {
      super(context);
      this.alSetOwnPrototypeProperty(new AVM1LoadVarsPrototype(context, this));
    }

    alConstruct(args?: any[]): AVM1Object  {
      var obj = new AVM1Object(this.context);
      obj.alPrototype = this.alGetPrototypeProperty();
      (<IAVM1DataObject><any>obj).isAVM1DataObject = true;
      return obj;
    }

    alCall(thisArg: any, args?: any[]): any {
      return this.alConstruct(args);
    }
  }

  export class AVM1LoadVarsPrototype extends AVM1Object implements IAVM1DataObject {
    constructor(context: AVM1Context, fn: AVM1LoadVarsFunction) {
      super(context);
      alDefineObjectProperties(this, {
        constructor: {
          value: fn,
          writable: true
        },
        toString: {
          value: this._toString
        },
        load: {
          value: this.load
        },
        onData: {
          value: this.defaultOnData
        },
        decode: {
          value: this.decode
        },
        send: {
          value: this.load
        },
        sendAndload: {
          value: this.load
        }
      });
    }

    isAVM1DataObject: boolean;
    _as3Loader: flash.net.URLLoader;

    getBytesLoaded(): number {
      if (!this._as3Loader) {
        return undefined;
      }
      return this._as3Loader.bytesLoaded;
    }

    getBytesTotal(): number {
      if (!this._as3Loader) {
        return undefined;
      }
      return this._as3Loader.bytesTotal;
    }

    load(url: string): boolean {
      url = alCoerceString(this.context, url);
      if (!url) {
        return false;
      }

      loadAVM1DataObject(this.context, url, null, null, null, this);
      return true;
    }

    defaultOnData(src: string) {
      if (isNullOrUndefined(src)) {
        avm1BroadcastEvent(this.context, this, 'onLoad', [false]);
        return;
      }
      AVM1LoadVarsPrototype.prototype.decode.call(this, src);
      this.alPut('loaded', true);
      avm1BroadcastEvent(this.context, this, 'onLoad', [true]);
    }

    decode(queryString: string): void {
      queryString = alCoerceString(this.context, queryString);
      var as3Variables = new this.context.sec.flash.net.URLVariables();
      as3Variables._ignoreDecodingErrors = true;
      as3Variables.decode(queryString);
      AVMX.forEachPublicProperty(as3Variables, function (name, value) {
        // TODO Are we leaking some AS3 properties/fields here?
        if (typeof value === 'string') {
          this.alPut(name, value);
        }
      }, this);
    }

    _toString(): string {
      var context = this.context;
      var as3Variables = new context.sec.flash.net.URLVariables();
      alForEachProperty(this, function (name) {
        if (this.alHasOwnProperty(name)) {
          as3Variables.axSetPublicProperty(name, alToString(context, this.alGet(name)));
        }
      }, this);
      return as3Variables.axCallPublicProperty('toString', null);
    }

    send(url: string, target: string, method?: string): boolean {
      url = alCoerceString(this.context, url);
      method = isNullOrUndefined(method) ? 'POST' : alCoerceString(this.context, method);
      Debug.notImplemented('AVM1LoadVarsPrototype.send');
      return false;
    }

    sendAndLoad(url: string, target: AVM1Object, method?: string): boolean {
      url = alCoerceString(this.context, url);
      method = isNullOrUndefined(method) ? 'POST' : alCoerceString(this.context, method);
      if (!url || !(target instanceof AVM1Object)) {
        return false;
      }
      if (!(<IAVM1DataObject><any>target).isAVM1DataObject) {
        return false;
      }
      var contentType = this.alGet('contentType');
      contentType = isNullOrUndefined(contentType) ?
        'application/x-www-form-urlencoded' :
        alCoerceString(this.context, contentType);
      var data = alToString(this.context, this);
      loadAVM1DataObject(this.context, url, method, contentType, data, <IAVM1DataObject><any>target);
      return true;
    }
  }
}