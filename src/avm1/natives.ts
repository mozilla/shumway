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

    public initializePrototype() {
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
      return '[object ' + alGetObjectClass(this) + ']';
    }
  }

  export class AVM1ObjectFunction extends AVM1Object {
    public constructor(context: AVM1Context) {
      super(context);
    }

    public initialize(objectProto: AVM1Object, functionProto: AVM1Object) {
      this._setPrototype(functionProto);
      var proto = objectProto;
      this.alSetOwnProperty('prototype', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: proto
      });
      proto.alSetOwnProperty('constructor', {
        flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
        value: this
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

    public initializePrototype(objectProto: AVM1Object) {
      var context = this.context;
      this._setPrototype(objectProto);
      this.alSetOwnProperty('call', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this.call)
      });
      this.alSetOwnProperty('apply', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
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

  export class AVM1FunctionFunction extends AVM1Object {
    public constructor(context: AVM1Context) {
      super(context);
    }

    public initialize(functionProto) {
      this._setPrototype(functionProto);
      var proto = functionProto;
      this.alSetOwnProperty('prototype', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
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
      this._setPrototype(context.builtins.Boolean.alPrototypeProperty);
      this.value = value;
    }

    public valueOf(): any {
      return this.value;
    }
  }

  export class AVM1BooleanPrototype extends AVM1Object {
    public constructor(context: AVM1Context) {
      super(context);
      this._setPrototype(context.builtins.Object.alPrototypeProperty);
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
      // TODO type check
      var native: AVM1BooleanNative = <any>this;
      return native.value;
    }

    public _toString() {
      // TODO type check
      var native: AVM1BooleanNative = <any>this;
      return native.value ? 'true' : 'false';
    }
  }

  export class AVM1BooleanFunction extends AVM1Function {
    public constructor(context: AVM1Context) {
      super(context);
      this._setPrototype(context.builtins.Function.alPrototypeProperty);
      var proto = new AVM1BooleanPrototype(context);
      this.alSetOwnProperty('prototype', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
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
      this._setPrototype(context.builtins.Number.alPrototypeProperty);
      this.value = value;
    }

    public valueOf(): any {
      return this.value;
    }
  }

  export class AVM1NumberPrototype extends AVM1Object {
    public constructor(context: AVM1Context) {
      super(context);
      this._setPrototype(context.builtins.Object.alPrototypeProperty);
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
      // TODO type check
      var native: AVM1NumberNative = <any>this;
      return native.value;
    }

    public _toString(radix) {
      // TODO type check
      var native: AVM1NumberNative = <any>this;
      return native.value.toString(radix || 10);
    }
  }

  export class AVM1NumberFunction extends AVM1Function {
    public constructor(context: AVM1Context) {
      super(context);
      this._setPrototype(context.builtins.Function.alPrototypeProperty);
      var proto = new AVM1NumberPrototype(context);
      this.alSetOwnProperty('prototype', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: proto
      });
      proto.alSetOwnProperty('constructor', {
        flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
        value: this
      });

      this.alSetOwnProperty('NaN', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
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
      this._setPrototype(context.builtins.String.alPrototypeProperty);
      this.value = value;
    }

    public toString(): string {
      return this.value;
    }
  }

  export class AVM1StringPrototype extends AVM1Object {
    public constructor(context: AVM1Context) {
      super(context);
      this._setPrototype(context.builtins.Object.alPrototypeProperty);
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
      // TODO type check
      var native: AVM1StringNative = <any>this;
      return native.value;
    }

    public _toString() {
      // TODO type check
      var native: AVM1StringNative = <any>this;
      return native.value;
    }
  }

  export class AVM1StringFunction extends AVM1Function {
    public constructor(context: AVM1Context) {
      super(context);
      this._setPrototype(context.builtins.Function.alPrototypeProperty);
      var proto = new AVM1StringPrototype(context);
      this.alSetOwnProperty('prototype', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
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

  export class AVM1ArrayNative extends AVM1Object {
    public value: any[];

    public constructor(context: AVM1Context, value: any[]) {
      super(context);
      this._setPrototype(context.builtins.Array.alPrototypeProperty);
      this.value = value;
    }
  }

  export class AVM1ArrayPrototype extends AVM1Object {
    public constructor(context: AVM1Context) {
      super(context);
      this._setPrototype(context.builtins.Object.alPrototypeProperty);
      this.alSetOwnProperty('toString', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this._toString)
      });
    }

    public _toString() {
      var join = this.context.builtins.Array.alPrototypeProperty.alGet('join');
      return join.alCall(this);
    }
  }

  export class AVM1ArrayFunction extends AVM1Function {
    public constructor(context: AVM1Context) {
      super(context);
      this._setPrototype(context.builtins.Function.alPrototypeProperty);
      var proto = new AVM1ArrayPrototype(context);
      this.alSetOwnProperty('prototype', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
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
      wrapAVM1NativeMembers(context, this, Math, [
        'E', 'LN10', 'LN2', 'LOG10E', 'LOG2E', 'PI', 'SQRT1_2', 'SQRT2',
        'abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor',
        'log', 'max', 'min', 'pow', 'random', 'round', 'sin', 'sqrt', 'tan'
      ], false);
    }
  }

  export function installBuiltins(context: AVM1Context): void {
    var builtins = context.builtins;

    // Resolving cyclic dependency between Object/Function functions and their prototypes.
    var objectProto = new AVM1ObjectPrototype(context);
    var functionProto = new AVM1FunctionPrototype(context);
    var objectFn = new AVM1ObjectFunction(context);
    builtins.Object = objectFn;
    var functionFn = new AVM1FunctionFunction(context);
    builtins.Function = functionFn;
    functionFn.initialize(functionProto);
    functionProto.initializePrototype(objectProto);
    objectProto.initializePrototype();
    objectFn.initialize(objectProto, functionProto);

    builtins.Boolean = new AVM1BooleanFunction(context);
    builtins.Number = new AVM1NumberFunction(context);
    builtins.String = new AVM1StringFunction(context);
    builtins.Array = new AVM1ArrayFunction(context);

    builtins.Math = new AVM1MathObject(context);
  }
}
