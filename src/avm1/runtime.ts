/*
 * Copyright 2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module Shumway.AVM1 {

  export enum AVM1PropertyFlags {
    DONT_ENUM = 1,
    DONT_DELETE = 2,
    READ_ONLY = 4,
    DATA = 64,
    ACCESSOR = 128,
    NATIVE_MEMBER = DATA | DONT_DELETE | DONT_ENUM | READ_ONLY,
    ASSETPROP_MASK = DONT_DELETE | DONT_ENUM | READ_ONLY
  }

  export enum AVM1DefaultValueHint {
    NUMBER,
    STRING
  }

  export interface IAVM1Callable {
    alCall(thisArg: any, args?: any[]): any;
  }

  export interface AVM1PropertyDescriptor {
    flags: AVM1PropertyFlags;
    value?: any;
    get?: IAVM1Callable;
    set?: IAVM1Callable;
    id?: string;
  }

  var ESCAPED_PROPERTY_PREFIX = '__avm1';

  function escapeAVM1Property(name: string): string {
    return name[0] === '_' && name[1] === '_' ? ESCAPED_PROPERTY_PREFIX + name : name;
  }

  function unescapeAVM1Property(name: string): string {
    return name[0] === '_' && name.indexOf(ESCAPED_PROPERTY_PREFIX) === 0 ? name.substring(ESCAPED_PROPERTY_PREFIX.length) : name;
  }

  export class AVM1Object implements IAVM1Callable {
    private _ownProperties: any;
    private _prototype: AVM1Object;

    private _avm1Context: AVM1Context;

    public get context(): AVM1Context {
      return this._avm1Context;
    }

    public constructor(avm1Context: AVM1Context) {
      this._avm1Context = avm1Context;
      this._ownProperties = Object.create(null);
      this._prototype = null;

      var self = this;
      this.alSetOwnProperty('__proto__', {
        flags: AVM1PropertyFlags.ACCESSOR | AVM1PropertyFlags.DONT_DELETE | AVM1PropertyFlags.DONT_ENUM,
        get: { alCall: function (thisArg: any, args?: any[]): any { return self._getPrototype(); }},
        set: { alCall: function (thisArg: any, args?: any[]): any { self._setPrototype(args[0]); }},
      });
    }

    _getPrototype(): AVM1Object {
      return this._prototype;
    }

    _setPrototype(v: AVM1Object) {
      // TODO recursive chain check
      this._prototype = v;
    }

    public get alPrototypeProperty(): AVM1Object {
      return this.alGet('prototype');
    }

    public alGetOwnProperty(p): AVM1PropertyDescriptor {
      return this._ownProperties[escapeAVM1Property(p)];
    }

    public alSetOwnProperty(p, desc: AVM1PropertyDescriptor): void {
      this._ownProperties[escapeAVM1Property(p)] = desc;
    }

    public alDeleteOwnProperty(p) {
      delete this._ownProperties[escapeAVM1Property(p)];
    }

    public alGetOwnPropertiesKeys(): string[] {
      var keys: string[] = [];
      for (var i in this._ownProperties) {
        var desc = this._ownProperties[i];
        if (!(desc.flags & AVM1PropertyFlags.DONT_ENUM)) {
          var name = unescapeAVM1Property(i);
          keys.push(name);
        }
      }
      return keys;
    }

    public alGetProperty(p): AVM1PropertyDescriptor {
      var desc = this.alGetOwnProperty(p);
      if (desc) {
        return desc;
      }
      if (this._prototype === null) {
        return undefined;
      }
      return this._prototype.alGetProperty(p);
    }

    public alGet(p): any {
      var desc = this.alGetProperty(p);
      if (!desc) {
        return undefined;
      }
      if ((desc.flags & AVM1PropertyFlags.DATA)) {
        return desc.value;
      }
      release || Debug.assert((desc.flags & AVM1PropertyFlags.ACCESSOR));
      var getter = desc.get;
      if (!getter) {
        return undefined;
      }
      return getter.alCall(this);
    }

    public alCanPut(p): boolean {
      var desc = this.alGetOwnProperty(p);
      if (desc) {
        if ((desc.flags & AVM1PropertyFlags.ACCESSOR)) {
          return !!desc.set;
        } else {
          return !(desc.flags & AVM1PropertyFlags.READ_ONLY);
        }
      }
      var proto = this._prototype;
      if (!proto) {
        return true;
      }
      return proto.alCanPut(p);
    }

    public alPut(p, v) {
      if (!this.alCanPut(p)) {
        return;
      }
      var ownDesc = this.alGetOwnProperty(p);
      if (ownDesc && (ownDesc.flags & AVM1PropertyFlags.DATA)) {
        var newDesc: AVM1PropertyDescriptor = {
          flags: AVM1PropertyFlags.DATA,
          value: v
        };
        this.alSetOwnProperty(p, newDesc);
        return;
      }
      var desc = this.alGetProperty(p);
      if (desc && (desc.flags & AVM1PropertyFlags.ACCESSOR)) {
        var setter = desc.set;
        release || Debug.assert(setter);
        setter.alCall(this, [v]);
      } else {
        var newDesc: AVM1PropertyDescriptor = {
          flags: AVM1PropertyFlags.DATA,
          value: v
        };
        this.alSetOwnProperty(p, newDesc);
      }
    }

    public alHasProperty(p): boolean  {
      var desc = this.alGetProperty(p);
      return !!desc;
    }

    public alDeleteProperty(p): boolean {
      var desc = this.alGetOwnProperty(p);
      if (!desc) {
        return true;
      }
      if ((desc.flags & AVM1PropertyFlags.DONT_DELETE)) {
        return false;
      }
      this.alDeleteOwnProperty(p);
      return true;
    }

    public alDefaultValue(hint: AVM1DefaultValueHint = AVM1DefaultValueHint.NUMBER): any {
      if (hint === AVM1DefaultValueHint.STRING) {
        var toString = this.alGet('toString');
        if (toString instanceof AVM1Object) {
          var str = toString.alCall(this);
          return str;
        }
        var valueOf = this.alGet('valueOf');
        if (valueOf instanceof AVM1Object) {
          var val = valueOf.alCall(this);
          return val;
        }
      } else {
        release || Debug.assert(hint === AVM1DefaultValueHint.NUMBER);
        var valueOf = this.alGet('valueOf');
        if (valueOf instanceof AVM1Object) {
          var val = valueOf.alCall(this);
          return val;
        }
        var toString = this.alGet('toString');
        if (toString instanceof AVM1Object) {
          var str = toString.alCall(this);
          return str;
        }
      }
      // TODO is this a default?
      return '[type ' + alGetObjectClass(this) + ']';
    }

    public alConstruct(args?: any[]): AVM1Object {
      throw new Error('not implemented AVM1Object.alConstruct');
    }

    public alCall(thisArg: any, args?: any[]): any {
      throw new Error('not implemented AVM1Object.alCall');
    }

    public alGetKeys(): string[] {
      var ownKeys = this.alGetOwnPropertiesKeys();
      var proto = this._prototype;
      if (!proto) {
        return ownKeys;
      }

      // TODO avoid duplicated keys
      var otherKeys = proto.alGetKeys();
      return ownKeys.concat(otherKeys);
    }
  }

  export class AVM1Function extends AVM1Object {
    public constructor(context: AVM1Context) {
      super(context);
      this._setPrototype(context.builtins.Function.alPrototypeProperty);
    }
  }

  export class AVM1NativeFunction extends AVM1Function {
    private _fn: Function;
    private _ctor: Function;

    public constructor(context: AVM1Context, fn: Function, ctor?: Function) {
      super(context);
      this._fn = fn;
      if (ctor) {
        this._ctor = ctor;
      }
    }

    public alConstruct(args?: any[]): AVM1Object {
      if (!this._ctor) {
        throw new Error('not a constructor');
      }
      return this._ctor.apply(this, args);
    }

    public alCall(thisArg: any, args?: any[]): any {
      if (!this._fn) {
        throw new Error('not callable');
      }
      return this._fn.apply(thisArg, args);
    }
  }

  export class AVM1EvalFunction extends AVM1Function {
    public constructor(context: AVM1Context) {
      super(context);
    }
    public alConstruct(args?: any[]): AVM1Object  {
      var obj = new AVM1Object(this.context);
      var objPrototype = this.alPrototypeProperty;
      if (!(objPrototype instanceof AVM1Object)) {
        objPrototype = this.context.builtins.Object.alPrototypeProperty;
      }
      obj._setPrototype(objPrototype);
      var result = this.alCall(obj, args);
      return result instanceof AVM1Object ? result : obj;
    }

    public alCall(thisArg: any, args?: any[]): any {
      throw new Error('not implemented: AVM1EvalFunction.alCall');
    }
  }

  function AVM1TypeError(msg?) {
  }
  AVM1TypeError.prototype = Object.create(Error.prototype);

  export function alToPrimitive(context: AVM1Context, v, preferredType?: AVM1DefaultValueHint) {
    if (!(v instanceof AVM1Object)) {
      return v;
    }
    var obj: AVM1Object = v;
    return preferredType !== undefined ? obj.alDefaultValue(preferredType) : obj.alDefaultValue();
  }

  export function alToBoolean(context: AVM1Context, v): boolean {
    switch (typeof v) {
      case 'undefined':
        return false;
      case 'object':
        return v !== null;
      case 'boolean':
        return v;
      case 'string':
      case 'number':
        return !!v;
      default:
        release || Debug.assert(false);
    }
  }

  function alStringToNumber(s: string): number  {
    return +s;
  }

  export function alToNumber(context: AVM1Context, v): number {
    if (typeof v === 'object' && v !== null) {
      v = alToPrimitive(context, v, AVM1DefaultValueHint.NUMBER);
    }
    switch (typeof v) {
      case 'undefined':
        return NaN;
      case 'object':
        if (v === null) {
          return 0;
        }
        // TODO
        return v;
      case 'boolean':
        return v ? 1 : 0;
      case 'number':
        return v;
      case 'string':
        return alStringToNumber(v);
      default:
        release || Debug.assert(false);
    }
  }

  export function alToInteger(context: AVM1Context, v): number {
    var n = alToNumber(context, v);
    if (isNaN(n)) {
      return 0;
    }
    if (n === 0 || n === Number.POSITIVE_INFINITY || n === Number.NEGATIVE_INFINITY) {
      return n;
    }
    return n < 0 ? Math.ceil(n) : Math.floor(n);
  }

  export function alToInt32(context: AVM1Context, v): number  {
    var n = alToNumber(context, v);
    return n | 0;
  }

  export function alNumberToString(n: number): string {
    return n + '';
  }

  export function alToString(context: AVM1Context, v): string {
    if (typeof v === 'object' && v !== null) {
      v = alToPrimitive(context, v, AVM1DefaultValueHint.STRING);
    }
    switch (typeof v) {
      case 'undefined':
        return 'undefined';
      case 'object':
        if (v === null) {
          return 'null';
        }
        // TODO
        return v;
      case 'boolean':
        return v ? 'true' : 'false';
      case 'number':
        return alNumberToString(v);
      case 'string':
        return v;
      default:
        release || Debug.assert(false);
    }
  }

  export function alToObject(context: AVM1Context, v): AVM1Object {
    switch (typeof v) {
      case 'undefined':
        throw new AVM1TypeError();
      case 'object':
        if (v === null) {
          throw new AVM1TypeError();
        }
        // TODO
        return v;
      case 'boolean':
        return new Natives.AVM1BooleanNative(context, v);
      case 'number':
        return new Natives.AVM1NumberNative(context, v);
      case 'string':
        return new Natives.AVM1StringNative(context, v);
      default:
        release || Debug.assert(false);
    }
  }

  export function alNewObject(context: AVM1Context): AVM1Object {
    var obj = new AVM1Object(context);
    obj._setPrototype(context.builtins.Object.alPrototypeProperty);
    return obj;
  }

  export function alGetObjectClass(obj: AVM1Object): string  {
    if (obj instanceof AVM1Function) {
      return 'Function';
    }
    // TODO more cases
    return 'Object';
  }

  export function wrapAVM1NativeMembers(context: AVM1Context, wrap: AVM1Object, obj: any, members: string[], prefixFunctions: boolean = false): void  {
    function wrapFunctionWithPrefix(fn) {
      return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(context);
        return fn.apply(this, args);
      };
    }

    if (!members) {
      return;
    }
    members.forEach(function (memberName) {
      var desc;
      for (var p = obj; p; p = Object.getPrototypeOf(p)) {
        desc = Object.getOwnPropertyDescriptor(p, memberName);
        if (desc) {
          break;
        }
      }
      if (!desc) {
        return;
      }
      if (desc.get || desc.set) {
        wrap.alSetOwnProperty(memberName, {
          flags: AVM1PropertyFlags.ACCESSOR | AVM1PropertyFlags.DONT_ENUM | AVM1PropertyFlags.DONT_DELETE,
          get: new AVM1NativeFunction(context, desc.get),
          set: new AVM1NativeFunction(context, desc.set)
        })
      } else {
        var value = desc.value;
        if (typeof value === 'function') {
          value = new AVM1NativeFunction(context,
            prefixFunctions ? wrapFunctionWithPrefix(value) : value);
        }
        wrap.alSetOwnProperty(memberName, {
          flags: AVM1PropertyFlags.NATIVE_MEMBER,
          value: value
        })
      }
    });
  }

  export function wrapAVM1NativeClass(context: AVM1Context, wrapAsFunction: boolean, cls: Function, staticMembers: string[], members: string[]): AVM1Object  {
    var wrappedFn = wrapAsFunction ?
      new AVM1NativeFunction(context, function () {}, function () {}) :
      new AVM1Object(context);
    wrapAVM1NativeMembers(context, wrappedFn, cls, staticMembers, true);
    var wrappedPrototype = Object.create(cls.prototype);
    cls.call(wrappedPrototype, context);
    wrapAVM1NativeMembers(context, wrappedPrototype, cls.prototype, members, false);
    wrappedFn.alPut('prototype', wrappedPrototype);
    wrappedPrototype.alSetOwnProperty('constructor', {
      flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
      value: wrappedFn
    });
    return wrappedFn;
  }

  export function alCoerceString(x) {
    return Shumway.AVMX.asCoerceString(x);
  }

  export function alForEachProperty(obj: AVM1Object, fn: (name: string) => void, thisArg?: any) {
    obj.alGetKeys().forEach(fn, thisArg);
  }

  export function alIsFunction(obj: any): boolean  {
    return obj instanceof AVM1Function;
  }

  export function alCallProperty(obj: AVM1Object, p, args: any[]): any {
    var callable: IAVM1Callable = obj.alGet(p);
    callable.alCall(obj, args);
  }
}

