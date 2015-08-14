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
  import flash = Shumway.AVMX.AS.flash;

  export class AVM1SharedObject extends AVM1Object {
    private _as3SharedObject: flash.net.SharedObject;

    constructor(context: AVM1Context, as3SharedObject: flash.net.SharedObject) {
      super(context);
      this.alPrototype = context.globals.SharedObject.alGetPrototypeProperty();
      this._as3SharedObject = as3SharedObject;
    }
  }

  export class AVM1SharedObjectFunction extends AVM1Function {
    constructor(context: AVM1Context) {
      super(context);
      alDefineObjectProperties(this, {
        prototype: {
          value: new AVM1SharedObjectPrototype(context, this)
        },
        getLocal: {
          value: this.getLocal,
          writable: true
        }
      });
    }

    public getLocal(name: string, localPath?: string, secure?: boolean): AVM1SharedObject {
      name = alCoerceString(this.context, name);
      localPath = alCoerceString(this.context, localPath);
      secure = alToBoolean(this.context, secure);
      var as3SharedObject = this.context.sec.flash.net.SharedObject.axClass.getLocal(name, localPath, secure);
      return new AVM1SharedObject(this.context, as3SharedObject);
    }

  }

  export class AVM1SharedObjectPrototype extends AVM1Object {
    constructor(context: AVM1Context, fn: AVM1Function) {
      super(context);
      this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
      alDefineObjectProperties(this, {
        constructor: {
          value: fn,
          writable: true
        },
        data: {
          get: this.getData
        },
        clear: {
          value: this.clear,
          writable: true
        },
        flush: {
          value: this.flush,
          writable: true
        }
      })
    }

    private _as3SharedObject: flash.net.SharedObject; // mirror of AVM1SharedObject's one

    public getData(): any {
      // TODO implement transform from AVM2 -> AVM1 objects
      Debug.somewhatImplemented('AVM1SharedObject.getData');
      var data = (<any>this).__data || ((<any>this).__data = alNewObject(this.context));
      return data;
    }

    public clear(): void {
      this._as3SharedObject.clear();
    }

    public flush(minDiskSpace?: number): any {
      minDiskSpace = alCoerceNumber(this.context, minDiskSpace);
      this._as3SharedObject.flush(minDiskSpace);
      Debug.somewhatImplemented('AVM1SharedObject.flush');
      return false; // can be a string 'pending' or boolean
    }

    public getSize(): number {
      Debug.somewhatImplemented('AVM1SharedObject.getSize');
      return (<any>this).__data ? 10 : 0;
    }

    public setFps(updatesPerSecond: number) : boolean {
      updatesPerSecond = alCoerceNumber(this.context, updatesPerSecond) || 0;
      this._as3SharedObject.fps = updatesPerSecond;
      return this._as3SharedObject.fps === updatesPerSecond;
    }
  }

  // TODO event handlers for
  // onStatus(infoObject: AVM1Object)
  // onSync(objArray: AVM1Array)
}
