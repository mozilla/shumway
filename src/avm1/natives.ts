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

// Implementation of the built-in ActionScript classes. Here we will implement
// functions and object prototypes that will be exposed to the AVM1 code.

module Shumway.AVM1.Natives {

  // Object natives
  // TODO implement all the Object class and its prototype natives

  class AVM1ObjectPrototype extends AVM1Object {
    public constructor(context: IAVM1Context) {
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
          var desc = this.alGetOwnProperty(name);
          if (desc && !!(desc.flags & AVM1PropertyFlags.DONT_DELETE)) {
            return false; // protected property
          }
          this.alSetOwnProperty(name, {
            flags: AVM1PropertyFlags.ACCESSOR,
            get: getter,
            set: setter || undefined
          });
          return true;
        })
      });
    }

    public _valueOf() {
      return this;
    }

    public _toString() {
      if (alIsFunction(this)) {
        // Really weird case of functions.
        return '[type ' + alGetObjectClass(this) + ']';
      }
      return '[object ' + alGetObjectClass(this) + ']';
    }
  }

  export class AVM1ObjectFunction extends AVM1Function {
    public constructor(context: IAVM1Context) {
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

      this.alSetOwnProperty('registerClass', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER | AVM1PropertyFlags.READ_ONLY,
        value: new AVM1NativeFunction(context, function registerClass(name, theClass) {
          context.registerClass(name, theClass);
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

  // Function natives
  // TODO implement all the Function class and its prototype natives

  class AVM1FunctionPrototype extends AVM1Object {
    public constructor(context: IAVM1Context) {
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
    public constructor(context: IAVM1Context) {
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

  // Boolean natives

  export class AVM1BooleanNative extends AVM1Object {
    public value: boolean;

    public constructor(context: IAVM1Context, value: boolean) {
      super(context);
      this.alPrototype = context.builtins.Boolean.alGetPrototypeProperty();
      this.alSetOwnConstructorProperty(context.builtins.Boolean);
      this.value = value;
    }

    public valueOf(): any {
      return this.value;
    }
  }

  // TODO implement all the Boolean class and its prototype natives

  export class AVM1BooleanPrototype extends AVM1Object {
    public constructor(context: IAVM1Context) {
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
    public constructor(context: IAVM1Context) {
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

  // Number natives

  export class AVM1NumberNative extends AVM1Object {
    public value: number;

    public constructor(context: IAVM1Context, value: number) {
      super(context);
      this.alPrototype = context.builtins.Number.alGetPrototypeProperty();
      this.alSetOwnConstructorProperty(context.builtins.Number);
      this.value = value;
    }

    public valueOf(): any {
      return this.value;
    }
  }

  // TODO implement all the Number class and its prototype natives

  export class AVM1NumberPrototype extends AVM1Object {
    public constructor(context: IAVM1Context) {
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
    public constructor(context: IAVM1Context) {
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

  // String natives

  export class AVM1StringNative extends AVM1Object {
    public value: string;

    public constructor(context: IAVM1Context, value: string) {
      super(context);
      this.alPrototype = context.builtins.String.alGetPrototypeProperty();
      this.alSetOwnConstructorProperty(context.builtins.String);
      this.value = value;
    }

    public toString(): string {
      return this.value;
    }
  }

  // TODO implement all the String class and its prototype natives

  export class AVM1StringPrototype extends AVM1Object {
    public constructor(context: IAVM1Context) {
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

      this.alSetOwnProperty('charAt', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this.charAt)
      });
      this.alSetOwnProperty('charCodeAt', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this.charCodeAt)
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

    public charAt(index: number): string {
      var native = alEnsureType<AVM1StringNative>(this, AVM1StringNative);
      return native.value.charAt(alToInteger(this.context, index));
    }

    public charCodeAt(index: number): number {
      var native = alEnsureType<AVM1StringNative>(this, AVM1StringNative);
      return native.value.charCodeAt(alToInteger(this.context, index));
    }
  }

  export class AVM1StringFunction extends AVM1Function {
    public constructor(context: IAVM1Context) {
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

  // Array natives

  var cachedArrayPropertyDescriptor: AVM1PropertyDescriptor = {
    flags: AVM1PropertyFlags.DATA,
    value: undefined
  };

  export class AVM1ArrayNative extends AVM1Object {
    public value: any[];

    public constructor(context: IAVM1Context, value: any[]) {
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
      var itemIndices = [];
      for (var i in this.value) {
        itemIndices.push(i);
      }
      return itemIndices.concat(keys);
    }
  }

  enum AVM1ArraySortOnOptions {
    CASEINSENSITIVE = 1,
    DESCENDING = 2,
    UNIQUESORT = 4,
    RETURNINDEXEDARRAY = 8,
    NUMERIC = 16
  }

  // TODO implement all the Array class and its prototype natives

  export class AVM1ArrayPrototype extends AVM1Object {
    public constructor(context: IAVM1Context) {
      super(context);
      this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
      this.alSetOwnProperty('join', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this.join)
      });
      this.alSetOwnProperty('length', {
        flags: AVM1PropertyFlags.ACCESSOR | AVM1PropertyFlags.DONT_ENUM | AVM1PropertyFlags.DONT_DELETE,
        get: new AVM1NativeFunction(context, this.getLength),
        set: new AVM1NativeFunction(context, this.setLength)
      });
      this.alSetOwnProperty('concat', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this.concat)
      });
      this.alSetOwnProperty('pop', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this.pop)
      });
      this.alSetOwnProperty('push', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this.push)
      });
      this.alSetOwnProperty('slice', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this.slice)
      });
      this.alSetOwnProperty('splice', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this.splice)
      });
      this.alSetOwnProperty('sort', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this.sort)
      });
      this.alSetOwnProperty('sortOn', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this.sortOn)
      });
      this.alSetOwnProperty('toString', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this._toString)
      });
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
      if (!isIndex(length)) {
        return; // no action on invalid length
      }
      length = alToInt32(this.context, length) >>> 0;

      var arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
      arr.length = length;
    }

    public concat(...items: any[]): AVM1Object {
      if (this instanceof AVM1ArrayNative) {
        // Faster case for native array implementation
        var arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
        for (var i = 0; i < arr.length; i++) {
          if (items[i] instanceof AVM1ArrayNative) {
            items[i] = alEnsureType<AVM1ArrayNative>(items[i], AVM1ArrayNative).value;
          }
        }
        return new AVM1ArrayNative(this.context,
          Array.prototype.concat.apply(arr, items));
      }
      // TODO implement generic method
      Debug.notImplemented('AVM1ArrayNative.concat');
    }

    public join(separator?: string): string {
      separator = separator === undefined ? ',' : alCoerceString(this.context, separator);
      if (this instanceof AVM1ArrayNative) {
        // Faster case for native array implementation
        var arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
        if (arr.length === 0) {
          return '';
        }
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

    public pop(): any {
      if (this instanceof AVM1ArrayNative) {
        // Faster case for native array implementation
        var arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
        return arr.pop();
      }
      // TODO implement generic method
      Debug.notImplemented('AVM1ArrayNative.pop');
    }

    public push(...items: any[]): number {
      if (this instanceof AVM1ArrayNative) {
        // Faster case for native array implementation
        var arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
        return Array.prototype.push.apply(arr, items);
      }
      // TODO implement generic method
      Debug.notImplemented('AVM1ArrayNative.push');
    }

    public slice(start: number, end?: number): AVM1Object {
      start = alToInteger(this.context, start);
      end = end !== undefined ? alToInteger(this.context, end) : undefined;
      if (this instanceof AVM1ArrayNative) {
        // Faster case for native array implementation
        var arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
        return new AVM1ArrayNative(this.context, arr.slice(start, end));
      }
      // TODO implement generic method
      Debug.notImplemented('AVM1ArrayNative.slice');
    }

    public splice(start: number, deleteCount: number, ...items: any[]): AVM1Object {
      start = alToInteger(this.context, start);
      deleteCount = alToInteger(this.context, deleteCount);
      if (this instanceof AVM1ArrayNative) {
        // Faster case for native array implementation
        var arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
        return new AVM1ArrayNative(this.context,
          Array.prototype.splice.apply(arr, [start, deleteCount].concat(items)));
      }
      // TODO implement generic method
      Debug.notImplemented('AVM1ArrayNative.splice');
    }

    public sort(comparefn?: AVM1Function): AVM1Object {
      var arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
      if (!alIsFunction(comparefn)) {
        arr.sort();
      } else {
        arr.sort(<any>comparefn.toJSFunction());
      }
      return this;
    }

    public sortOn(fieldNames: AVM1Object, options: any): AVM1Object {
      var context = this.context;
      // The field names and options we'll end up using.
      var fieldNamesList: string[] = [];
      var optionsList: number[] = [];
      if (alIsString(context, fieldNames)) {
        fieldNamesList = [alToString(context, fieldNames)];
        optionsList = [alToInt32(context, options)];
      } else if (alIsArray(context, fieldNames)) {
        fieldNamesList = [];
        optionsList = [];
        var optionsArray: AVM1Object = alIsArray(context, options) ? options : null;
        var length = alToInteger(context, fieldNames.alGet('length'));
        if (optionsArray) {
          // checking in length of fieldNames == options
          var optionsLength = alToInteger(context, optionsArray.alGet('length'));
          if (length !== optionsLength) {
            optionsArray = null;
          }
        }
        for (var i = 0; i < length; i++) {
          fieldNamesList.push(alToString(context, fieldNames.alGet(i)));
          optionsList.push(optionsArray ? alToInt32(context, optionsArray.alGet(i)) : 0);
        }
      } else {
        // Field parameters are incorrect.
        return undefined;
      }

      // TODO revisit this code
      var optionsVal: number = optionsList[0];
      release || Shumway.Debug.assertNotImplemented(!(optionsVal & AVM1ArraySortOnOptions.UNIQUESORT), "UNIQUESORT");
      release || Shumway.Debug.assertNotImplemented(!(optionsVal & AVM1ArraySortOnOptions.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");

      var comparer = (a, b) => {
        var aObj = alToObject(context, a);
        var bObj = alToObject(context, b);
        if (!a || !b) {
          return !a ? !b ? 0 : -1 : +1;
        }
        for (var i = 0; i < fieldNamesList.length; i++) {
          var aField = aObj.alGet(fieldNamesList[i]);
          var bField = bObj.alGet(fieldNamesList[i]);
          var result;
          if (optionsList[i] & AVM1ArraySortOnOptions.NUMERIC) {
            var aNum = alToNumber(context, aField);
            var bNum = alToNumber(context, bField);
            result = aNum < bNum ? -1 : aNum > bNum ? +1 : 0;
          } else {
            var aStr = alToString(context, aField);
            var bStr = alToString(context, bField);
            if (optionsList[i] & AVM1ArraySortOnOptions.CASEINSENSITIVE) {
              aStr = aStr.toLowerCase();
              bStr = bStr.toLowerCase();
            }
            result = aStr < bStr ? -1 : aStr > bStr ? +1 : 0;
          }
          if (result !== 0) {
            return !(optionsList[i] & AVM1ArraySortOnOptions.DESCENDING) ? result : -result;
          }
        }
        return 0;
      };

      var arr = alEnsureType<AVM1ArrayNative>(this, AVM1ArrayNative).value;
      arr.sort(comparer);

      // Strange, the documentation said to do not return anything.
      return this;
    }
  }

  export class AVM1ArrayFunction extends AVM1Function {
    public constructor(context: IAVM1Context) {
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

  // Math natives

  class AVM1MathObject extends AVM1Object {
    public constructor(context: IAVM1Context) {
      super(context);
      // TODO remove dependency on wrapAVM1NativeMembers
      Lib.wrapAVM1NativeMembers(this.context, this, Math, [
        'E', 'LN10', 'LN2', 'LOG10E', 'LOG2E', 'PI', 'SQRT1_2', 'SQRT2',
        'abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor',
        'log', 'max', 'min', 'pow', 'random', 'round', 'sin', 'sqrt', 'tan'
      ], false);
    }
  }

  // Date natives

  class AVM1DateNative extends AVM1Object {
    public value: Date;

    public constructor(context: IAVM1Context, value: Date) {
      super(context);
      this.alPrototype = context.builtins.Date.alGetPrototypeProperty();
      this.alSetOwnConstructorProperty(context.builtins.Date);
      this.value = value;
    }

    public alDefaultValue(hint?: AVM1DefaultValueHint): any {
      if (hint !== undefined) {
        return super.alDefaultValue(hint);
      }

      if (this.context.swfVersion >= 6) {
        return super.alDefaultValue(AVM1DefaultValueHint.STRING);
      } else {
        return super.alDefaultValue(AVM1DefaultValueHint.NUMBER);
      }
    }
  }

  // TODO implement all the Date class and its prototype natives

  class AVM1DatePrototype extends AVM1Object {
    public constructor(context: IAVM1Context) {
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
      this.alSetOwnProperty('getTime', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this.getTime)
      });
    }

    public _valueOf() {
      var native = alEnsureType<AVM1DateNative>(this, AVM1DateNative);
      return native.value.valueOf();
    }

    public _toString() {
      var native = alEnsureType<AVM1DateNative>(this, AVM1DateNative);
      return native.value.toString();
    }

    public getTime(): number {
      return alEnsureType<AVM1DateNative>(this, AVM1DateNative).value.valueOf();
    }
  }

  class AVM1DateFunction extends AVM1Function {
    public constructor(context: IAVM1Context) {
      super(context);
      this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
      var proto = new AVM1DatePrototype(context);
      this.alSetOwnProperty('prototype', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER | AVM1PropertyFlags.READ_ONLY,
        value: proto
      });
      proto.alSetOwnProperty('constructor', {
        flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
        value: this
      });

      this.alSetOwnProperty('UTC', {
        flags: AVM1PropertyFlags.NATIVE_MEMBER,
        value: new AVM1NativeFunction(context, this._UTC)
      });

    }

    public alConstruct(args?: any[]): AVM1Object {
      var context = this.context;
      var value: Date;
      switch (args.length) {
        case 0:
          value = new Date();
          break;
        case 1:
          value = new Date(alToPrimitive(context, args[0]));
          break;
        case 2:
          var numbers = [];
          for (var i = 0; i < args.length; i++) {
            numbers.push(alToNumber(context, args[i]));
          }
          value = new Date(
            alToNumber(context, args[0]),
            alToNumber(context, args[1]),
            args.length > 2 ? alToNumber(context, args[2]) : 1,
            args.length > 3 ? alToNumber(context, args[3]) : 0,
            args.length > 4 ? alToNumber(context, args[4]) : 0,
            args.length > 5 ? alToNumber(context, args[5]) : 0,
            args.length > 6 ? alToNumber(context, args[6]) : 0);
          break;
      }
      return new AVM1DateNative(context, value);
    }

    public alCall(thisArg: any, args?: any[]): any {
      return alCallProperty(this.alConstruct.apply(this, args), 'toString');
    }

    public _UTC(year: number, month: number, date?: number, hours?: number, seconds?: number, ms?: number): number {
      var context = this.context;
      return Date.UTC(
        alToNumber(context, arguments[0]),
        alToNumber(context, arguments[1]),
        arguments.length > 2 ? alToNumber(context, arguments[2]) : 1,
        arguments.length > 3 ? alToNumber(context, arguments[3]) : 0,
        arguments.length > 4 ? alToNumber(context, arguments[4]) : 0,
        arguments.length > 5 ? alToNumber(context, arguments[5]) : 0,
        arguments.length > 6 ? alToNumber(context, arguments[6]) : 0);
    }
  }


  function alEnsureType<T extends AVM1Object>(obj: AVM1Object, cls: any /* typeof AVM1Object */): T {
    if (obj instanceof cls) {
      return <any>obj;
    }
    throw new Error('Invalid type');
  }

  /**
   * Installs built-ins on the AVM1Context. It shall be a first call before
   * any AVM1Object is instantiated.
   * @param {IAVM1Context} context
   */
  export function installBuiltins(context: IAVM1Context): void {
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
    builtins.Date = new AVM1DateFunction(context);
    builtins.Math = new AVM1MathObject(context);
  }
}
