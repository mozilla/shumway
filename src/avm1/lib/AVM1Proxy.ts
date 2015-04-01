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

///<reference path='../references.ts' />

module Shumway.AVM1.Lib {
  import flash = Shumway.AVMX.AS.flash;
  import notImplemented = Shumway.Debug.notImplemented;
  import Namespace = Shumway.AVMX.Namespace;
  import ASObject = Shumway.AVMX.AS.ASObject;

  var _asGetProperty = null; // REDUX Object.prototype.asGetProperty;
  var _asSetProperty = null; // REDUX Object.prototype.asSetProperty;
  var _asCallProperty = null; // REDUX Object.prototype.asCallProperty;
  var _asHasProperty = null; // REDUX Object.prototype.asHasProperty;
  var _asHasOwnProperty = null; // REDUX Object.prototype.asHasOwnProperty;
  var _asHasTraitProperty = null; // REDUX Object.prototype.asHasTraitProperty;
  var _asDeleteProperty = null; // REDUX Object.prototype.asDeleteProperty;

  export class AVM1Proxy<T> extends ASObject {
    private _target:T;

    constructor() {
      super();
    }

    public setTarget(target:T) {
      this._target = target;
    }

    private _isInternalProperty(namespaces:Namespace [], name:any, flags:number):boolean {
      if (!this._target) {
        return true;
      }
      if (namespaces) {
        return true;
      }
      if (name === '__proto__' || name === '__constructor__') {
        return true;
      }
      return false;
    }

    public asGetProperty(namespaces:Namespace [], name:any, flags:number) {
      var self:Object = this;
      if (this._isInternalProperty(namespaces, name, flags)) {
        return _asGetProperty.call(self, namespaces, name, flags);
      }
      return (<any>this._target).axGetPublicProperty(name); // REDUX
    }

    public asGetNumericProperty(name:number) {
      return (<any>this._target).asGetNumericProperty(name); // REDUX
    }

    public asSetNumericProperty(name:number, value) {
      return (<any>this._target).asSetNumericProperty(name, value); // REDUX
    }

    public asSetProperty(namespaces:Namespace [], name:any, flags:number, value:any) {
      var self:Object = this;
      if (this._isInternalProperty(namespaces, name, flags)) {
        _asSetProperty.call(self, namespaces, name, flags, value);
        return;
      }
      return (<any>this._target).axSetPublicProperty(name, value); // REDUX
    }

    public asCallProperty(namespaces:Namespace [], name:any, flags:number, isLex:boolean, args:any []):any {
      var self:Object = this;
      if (this._isInternalProperty(namespaces, name, flags)) {
        return _asCallProperty.call(self, namespaces, name, flags, false, args);
      }
      return (<any>this._target).axCallPublicProperty(name, args); // REDUX
    }

    public asHasProperty(namespaces:Namespace [], name:any, flags:number):any {
      var self:Object = this;
      if (this._isInternalProperty(namespaces, name, flags)) {
        return _asHasProperty.call(self, namespaces, name, flags);
      }
      return (<any>this._target).asHasProperty(undefined, name, 0); // REDUX
    }

    public asHasOwnProperty(namespaces:Namespace [], name:any, flags:number):any {
      var self:Object = this;
      if (this._isInternalProperty(namespaces, name, flags)) {
        return _asHasOwnProperty.call(self, namespaces, name, flags);
      }
      return (<any>this._target).asHasOwnProperty(undefined, name, 0); // REDUX
    }

    public asDeleteProperty(namespaces:Namespace [], name:any, flags:number):any {
      var self:Object = this;
      if (_asHasTraitProperty.call(self, namespaces, name, flags)) {
        return _asDeleteProperty.call(self, namespaces, name, flags);
      }
      notImplemented("AVM1Proxy asDeleteProperty");
      return false;
    }

    public asNextName(index:number):any {
      notImplemented("AVM1Proxy asNextName");
    }

    public asNextValue(index:number):any {
      notImplemented("AVM1Proxy asNextValue");
    }

    public asNextNameIndex(index:number):number {
      notImplemented("AVM1Proxy asNextNameIndex");
      return;
    }

    public proxyNativeMethod(name:string) {
      var boundMethod = this._target[name].bind(this._target);
      (<any>this._target).axSetPublicProperty(name, boundMethod); // REDUX
    }

    public static wrap<T>(securityDomain: ISecurityDomain, cls: T, natives: { methods?: string[]; }) {
      // REDUX
      var wrapped = <any>function () {
        var nativeThis: any = Object.create((<any>cls).prototype);
        AVM1TextFormat.apply(nativeThis, arguments);

        var proxy: AVM1Proxy<T> = this;
        proxy.setTarget(nativeThis);

        if (natives && natives.methods) {
          natives.methods.forEach(proxy.proxyNativeMethod, proxy);
        }
      };
      wrapped.prototype = AVM1Proxy.prototype;
      return securityDomain.boxFunction(wrapped);
    }
  }
}