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

module Shumway.AVM1.Natives {
  class AVM1ObjectPrototype extends AVM1Object {
    public constructor(context: AVM1Context) {
      super(context);
      // Initialization must be perfromed later after the Function creation.
      // See the _initializePrototype and createBuiltins below.
    }

    _initializePrototype() {
      var context = this.context;
      this.alSetOwnProperty('valueOf', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this._valueOf)
      });
      this.alSetOwnProperty('toString', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this._toString)
      });
    }

    public _valueOf() {
      return this;
    }

    public _toString() {
      if (alIsFunction(this)) {
        debugger;
        // Really weird case of functions.
        return '[type ' + alGetObjectClass(this) + ']';
      }
      return '[object ' + alGetObjectClass(this) + ']';
    }
  }

  export class AVM1ObjectFunction extends AVM1Function {
    public constructor(context: AVM1Context) {
      super(context);
      this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
      var proto = context.builtins.Object.alGetPrototypeProperty();
      this.alSetOwnProperty('prototype', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER | AVM1PropertyFlags.READ_ONLY,
        value: proto
      });
      proto.alSetOwnProperty('constructor', {
        flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
        value: this
      });

      var self = this;
      this.alSetOwnProperty('registerClass', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER | AVM1PropertyFlags.READ_ONLY,
        value: new AVM1NativeFunction(context, function registerClass(name, theClass) {
          context.registerClass(name, theClass);
        })
      });
      this.alSetOwnProperty('addProperty', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER | AVM1PropertyFlags.READ_ONLY,
        value: new AVM1NativeFunction(context, function addProperty(name, getter, setter) {
          if (typeof name !== 'string' || name === '') {
            return false;
          }
          if (!alIsFunction(getter)) {
            return false;
          }
          if (!alIsFunction(setter) && setter !== null) {
            return false;
          }
          var desc = self.alGetOwnProperty(name);
          if (desc && !!(desc.flags & AVM1PropertyFlags.DONT_DELETE)) {
            return false; // protected property
          }
          self.alSetOwnProperty(name, {
            flags: AVM1PropertyFlags.ACCESSOR,
            get: getter,
            set: setter || undefined
          });
          return true;
        })
      });
    }

    public alConstruct(args?: any[]): AVM1Object {
      if (args) {
        var value = args[0];
        if (value instanceof AVM1Object) {
          return value;
        }
        switch (typeof value) {
          case 'string':
          case 'boolean':
          case 'number':
            return alToObject(this.context, value);
        }
      }
      // null or undefined
      return alNewObject(this.context);
    }

    public alCall(thisArg: any, args?: any[]): any {
      if (!args || args[0] === null || args[0] === undefined) {
        return alNewObject(this.context);
      }
      return alToObject(this.context, args[0]);
    }
  }

  class AVM1FunctionPrototype extends AVM1Object {
    public constructor(context: AVM1Context) {
      super(context);
    }

    _initializePrototype() {
      var context = this.context;
      this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
      this.alSetOwnProperty('call', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER | AVM1PropertyFlags.READ_ONLY,
        value: new AVM1NativeFunction(context, this.call)
      });
      this.alSetOwnProperty('apply', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER | AVM1PropertyFlags.READ_ONLY,
        value: new AVM1NativeFunction(context, this.apply)
      });
    }

    public call(thisArg: any, ...args: any[]): any {
      this.alCall(thisArg, args);
    }

    public apply(thisArg: any, args?: any[]): any {
      this.alCall(thisArg, args);
    }
  }

  export class AVM1FunctionFunction extends AVM1Function {
    public constructor(context: AVM1Context) {
      super(context);

      this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
      var proto = context.builtins.Function.alGetPrototypeProperty();
      this.alSetOwnProperty('prototype', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER | AVM1PropertyFlags.READ_ONLY,
        value: proto
      });
      proto.alSetOwnProperty('constructor', {
        flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
        value: this
      });
    }

    // TODO asConstruct and asCall
  }

  export class AVM1BooleanNative extends AVM1Object {
    public value: boolean;

    public constructor(context: AVM1Context, value: boolean) {
      super(context);
      this.alPrototype = context.builtins.Boolean.alGetPrototypeProperty();
      this.alSetOwnConstructorProperty(context.builtins.Boolean);
      this.value = value;
    }

    public valueOf(): any {
      return this.value;
    }
  }

  export class AVM1BooleanPrototype extends AVM1Object {
    public constructor(context: AVM1Context) {
      super(context);
      this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
      this.alSetOwnProperty('valueOf', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this._valueOf)
      });
      this.alSetOwnProperty('toString', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this._toString)
      });
    }

    public _valueOf() {
      var native = alEnsureType<AVM1BooleanNative>(this, AVM1BooleanNative);
      return native.value;
    }

    public _toString() {
      var native = alEnsureType<AVM1BooleanNative>(this, AVM1BooleanNative);
      return native.value ? 'true' : 'false';
    }
  }

  export class AVM1BooleanFunction extends AVM1Function {
    public constructor(context: AVM1Context) {
      super(context);
      this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
      var proto = new AVM1BooleanPrototype(context);
      this.alSetOwnProperty('prototype', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER | AVM1PropertyFlags.READ_ONLY,
        value: proto
      });
      proto.alSetOwnProperty('constructor', {
        flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
        value: this
      });
    }

    public alConstruct(args?: any[]): AVM1Object {
      var value = args ? alToBoolean(this.context, args[0]) : false;
      return new AVM1BooleanNative(this.context, value);
    }

    public alCall(thisArg: any, args?: any[]): any {
      // TODO returns boolean value?
      var value = args ? alToBoolean(this.context, args[0]) : false;
      return value;
    }
  }

  export class AVM1NumberNative extends AVM1Object {
    public value: number;

    public constructor(context: AVM1Context, value: number) {
      super(context);
      this.alPrototype = context.builtins.Number.alGetPrototypeProperty();
      this.alSetOwnConstructorProperty(context.builtins.Number);
      this.value = value;
    }

    public valueOf(): any {
      return this.value;
    }
  }

  export class AVM1NumberPrototype extends AVM1Object {
    public constructor(context: AVM1Context) {
      super(context);
      this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
      this.alSetOwnProperty('valueOf', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this._valueOf)
      });
      this.alSetOwnProperty('toString', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this._toString)
      });
    }

    public _valueOf() {
      var native = alEnsureType<AVM1NumberNative>(this, AVM1NumberNative);
      return native.value;
    }

    public _toString(radix) {
      var native = alEnsureType<AVM1NumberNative>(this, AVM1NumberNative);
      return native.value.toString(radix || 10);
    }
  }

  export class AVM1NumberFunction extends AVM1Function {
    public constructor(context: AVM1Context) {
      super(context);
      this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
      var proto = new AVM1NumberPrototype(context);
      this.alSetOwnProperty('prototype', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER | AVM1PropertyFlags.READ_ONLY,
        value: proto
      });
      proto.alSetOwnProperty('constructor', {
        flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
        value: this
      });

      this.alSetOwnProperty('NaN', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER | AVM1PropertyFlags.READ_ONLY,
        value: NaN
      });
      // TODO more constants
    }

    public alConstruct(args?: any[]): AVM1Object {
      var value = args ? alToNumber(this.context, args[0]) : 0;
      return new AVM1NumberNative(this.context, value);
    }

    public alCall(thisArg: any, args?: any[]): any {
      // TODO returns number value?
      var value = args ? alToNumber(this.context, args[0]) : 0;
      return value;
    }
  }

  export class AVM1StringNative extends AVM1Object {
    public value: string;

    public constructor(context: AVM1Context, value: string) {
      super(context);
      this.alPrototype = context.builtins.String.alGetPrototypeProperty();
      this.alSetOwnConstructorProperty(context.builtins.String);
      this.value = value;
    }

    public toString(): string {
      return this.value;
    }
  }

  export class AVM1StringPrototype extends AVM1Object {
    public constructor(context: AVM1Context) {
      super(context);
      this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
      this.alSetOwnProperty('valueOf', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this._valueOf)
      });
      this.alSetOwnProperty('toString', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this._toString)
      });
    }

    public _valueOf() {
      var native = alEnsureType<AVM1StringNative>(this, AVM1StringNative);
      return native.value;
    }

    public _toString() {
      var native = alEnsureType<AVM1StringNative>(this, AVM1StringNative);
      return native.value;
    }
  }

  export class AVM1StringFunction extends AVM1Function {
    public constructor(context: AVM1Context) {
      super(context);
      this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
      var proto = new AVM1StringPrototype(context);
      this.alSetOwnProperty('prototype', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER | AVM1PropertyFlags.READ_ONLY,
        value: proto
      });
      proto.alSetOwnProperty('constructor', {
        flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
        value: this
      });
    }

    public alConstruct(args?: any[]): AVM1Object {
      var value = args ? alToString(this.context, args[0]) : '';
      return new AVM1StringNative(this.context, value);
    }

    public alCall(thisArg: any, args?: any[]): any {
      // TODO returns number value?
      var value = args ? alToString(this.context, args[0]) : '';
      return value;
    }
  }

  var cachedArrayPropertyDescriptor: AVM1PropertyDescriptor = {
    flags: AVM1PropertyFlags.DATA,
    value: undefined
  };

  export class AVM1ArrayNative extends AVM1Object {
    public value: any[];

    public constructor(context: AVM1Context, value: any[]) {
      super(context);
      this.alPrototype = context.builtins.Array.alGetPrototypeProperty();
      this.alSetOwnConstructorProperty(context.builtins.Array);
      this.value = value;
    }

    public alGetOwnProperty(p): AVM1PropertyDescriptor  {
      if (alIsIndex(this.context, p)) {
        var index = alToInt32(this.context, p);
        if (Object.getOwnPropertyDescriptor(this.value, <any>index)) {
          cachedArrayPropertyDescriptor.value = this.value[index];
          return cachedArrayPropertyDescriptor;
        }
      }
      return super.alGetOwnProperty(p);
    }

    public alSetOwnProperty(p, v: AVM1PropertyDescriptor) {
      if (alIsIndex(this.context, p)) {
        var index = alToInt32(this.context, p);
        if (!(v.flags & AVM1PropertyFlags.DATA) ||
            !!(v.flags & AVM1PropertyFlags.DONT_ENUM) ||
            !!(v.flags & AVM1PropertyFlags.DONT_DELETE)) {
          throw new Error('Special property is non-supported for array');
        }
        this.value[index] = v.value;
        return;
      }
      super.alSetOwnProperty(p, v);
    }

    public alDeleteOwnProperty(p) {
      if (alIsIndex(this.context, p)) {
        var index = alToInt32(this.context, p);
        delete this.value[index];
        return;
      }
      super.alDeleteOwnProperty(p);
    }

    public alGetOwnPropertiesKeys(): string[] {
      var keys = super.alGetOwnPropertiesKeys();
      return Object.getOwnPropertyNames(this.value).concat(keys);
    }
  }

  export class AVM1ArrayPrototype extends AVM1Object {
    public constructor(context: AVM1Context) {
      super(context);
      this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
      this.alSetOwnProperty('toString', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this._toString)
      });
      this.alSetOwnProperty('join', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this.join)
      });
      this.alSetOwnProperty('length', {
        flags: AVM1PropertyFlags.ACCESSOR | AVM1PropertyFlags.DONT_ENUM | AVM1PropertyFlags.DONT_DELETE,
        get: new AVM1NativeFunction(context, this.getLength),
        set: new AVM1NativeFunction(context, this.setLength)
      })
    }

    public _toString() {
      var join = this.context.builtins.Array.alGetPrototypeProperty().alGet('join');
      return join.alCall(this);
    }

    public getLength(): number {
      var arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
      return arr.length;
    }

    public setLength(length: number) {
      // TODO check length
      length = alToInt32(this.context, length) >>> 0;
      var arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
      arr.length = length;
    }

    public join(separator?: string): string {
      separator = separator === undefined ? ',' : alCoerceString(this.context, separator);
      if (this instanceof AVM1ArrayNative) {
        // Faster case for native array implementation
        if (this.getLength() === 0) {
          return '';
        }
        var arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
        if (arr.every(function (i) { return !(i instanceof AVM1Object); })) {
          return arr.join(separator);
        }
      }
      var context = this.context;
      var length = alToInt32(context, this.alGet('length')) >>> 0;
      if (length === 0) {
        return '';
      }
      var result = [];
      for (var i = 0; i < length; i++) {
        var item = this.alGet(i);
        result[i] = item === null || item === undefined ? '' : alCoerceString(context, item);
      }
      return result.join(separator);
    }
  }

  export class AVM1ArrayFunction extends AVM1Function {
    public constructor(context: AVM1Context) {
      super(context);
      this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
      var proto = new AVM1ArrayPrototype(context);
      this.alSetOwnProperty('prototype', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER | AVM1PropertyFlags.READ_ONLY,
        value: proto
      });
      proto.alSetOwnProperty('constructor', {
        flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
        value: this
      });
    }

    public alConstruct(args?: any[]): AVM1Object {
      if (args && typeof args[0] === 'number') {
        var len = args[0];
        if (len >>> 0 !== len) {
          throw new Error('Range error'); // TODO avm1 native
        }
        return new AVM1ArrayNative(this.context, new Array(len));
      }
      return new AVM1ArrayNative(this.context, args);
    }

    public alCall(thisArg: any, args?: any[]): any {
      return this.alConstruct.apply(this, args);
    }
  }

  class AVM1MathObject extends AVM1Object {
    public constructor(context: AVM1Context) {
      super(context);
      Lib.wrapAVM1NativeMembers(context, this, Math, [
        'E', 'LN10', 'LN2', 'LOG10E', 'LOG2E', 'PI', 'SQRT1_2', 'SQRT2',
        'abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor',
        'log', 'max', 'min', 'pow', 'random', 'round', 'sin', 'sqrt', 'tan'
      ], false);
    }
  }

  function alEnsureType<T extends AVM1Object>(obj: AVM1Object, cls: any /* typeof AVM1Object */): T {
    if (obj instanceof cls) {
      return <any>obj;
    }
    throw new Error('Invalid type');
  }


  export function installBuiltins(context: AVM1Context): void {
    var builtins = context.builtins;

    // Resolving cyclic dependency between Object/Function functions and their prototypes.
    var objectProto = new AVM1ObjectPrototype(context);
    var dummyObject = new AVM1Object(context);
    dummyObject.alSetOwnPrototypeProperty(objectProto);
    builtins.Object = dummyObject;
    var functionProto = new AVM1FunctionPrototype(context);
    var dummyFunction = new AVM1Object(context);
    dummyFunction.alSetOwnPrototypeProperty(functionProto);
    builtins.Function = dummyFunction;
    objectProto._initializePrototype();
    functionProto._initializePrototype();

    builtins.Object = new AVM1ObjectFunction(context);
    builtins.Function = new AVM1FunctionFunction(context);
    builtins.Boolean = new AVM1BooleanFunction(context);
    builtins.Number = new AVM1NumberFunction(context);
    builtins.String = new AVM1StringFunction(context);
    builtins.Array = new AVM1ArrayFunction(context);

    builtins.Math = new AVM1MathObject(context);
  }
}
