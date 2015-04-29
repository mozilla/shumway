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
  import AXClass = Shumway.AVMX.AXClass;

  // Base class/function for all AVM1 filters.
  class AVM1BitmapFilterFunction extends AVM1Function {
    constructor(context: AVM1Context) {
      super(context);
      this.alSetOwnPrototypeProperty(new AVM1BitmapFilterPrototype(context, this));
    }

    alConstruct(args?: any[]): AVM1Object {
      var obj = new AVM1Object(this.context);
      obj.alPrototype = this.alGetPrototypeProperty();
      return obj;
    }
  }

  class AVM1BitmapFilterPrototype extends AVM1Object {
    asFilterConverter: IFilterConverter;

    constructor(context: AVM1Context, fn: AVM1Function) {
      super(context);
      alDefineObjectProperties(this, {
        constructor: {
          value: fn,
          writable: true
        },
        clone: {
          value: this.clone,
          writable: true
        }
      });
    }

    clone(): AVM1Object {
      var obj = new AVM1Object(this.context);
      obj.alPrototype = this.alGetPrototypeProperty();
      return obj;
    }
  }

  interface IFilterConverter {
    toAS3Filter(as2Object: AVM1Object): ASObject;
    fromAS3Filter(as3Object: ASObject): AVM1Object;
    getAS3Class(): AXClass;
  }

  // Automates creation of the AVM1 filter classes.
  function createFilterClass(context: AVM1Context, filtersObj: AVM1Object, base: AVM1Function,
                             name: string, fields: string[]): void {
    // Simple constructor for the class function.
    function construct(args?: any[]): AVM1Object {
      var as2Object = new AVM1Object(context);
      as2Object.alPrototype = wrappedProto;
      if (args) {
        for (var i = 0; i < args.length; i++) {
          as2Object.alPut(fields[i << 1], args[i]);
        }
      }
      return as2Object;
    }

    function clone(): AVM1Object {
      var as2Object = new AVM1Object(context);
      as2Object.alPrototype = wrappedProto;
      for (var i = 0; i < fields.length; i += 2) {
        as2Object.alPut(fields[i], this.alGet(fields[i]));
      }
      return as2Object;
    }

    function getAS3Class(): AXClass {
      // The AS3 class name shall match
      return context.sec.flash.filters[name].axClass;
    }

    function toAS3Filter(as2Object: AVM1Object): ASObject {
      var as3Object: ASObject = <any> getAS3Class().axConstruct([]);
      // Just copying all defined properties.
      for (var i = 0; i < fields.length; i += 2) {
        var as2Value = as2Object.alGet(fields[i]);
        if (as2Value === undefined) {
          continue; // skipping undefined
        }
        as3Object.axSetPublicProperty(fields[i],
          convertToAS3Field(context, as2Value, fields[i + 1]));
      }
      return as3Object;
    }

    function fromAS3Filter(as3Object: ASObject): AVM1Object {
      var as2Object = new AVM1Object(context);
      as2Object.alPrototype = wrappedProto;
      for (var i = 0; i < fields.length; i += 2) {
        as2Object.alPut(fields[i],
          convertFromAS3Field(context, as3Object.axGetPublicProperty(fields[i]), fields[i + 1]));
      }
      return as2Object;
    }

    // Creates new prototype object and function for the class.
    var proto = base.alGetPrototypeProperty();
    var wrappedProto: AVM1BitmapFilterPrototype = Object.create(AVM1BitmapFilterPrototype.prototype);
    AVM1Object.call(wrappedProto, context);
    wrappedProto.alPrototype = proto;

    var wrapped: AVM1BitmapFilterFunction = Object.create(AVM1BitmapFilterFunction.prototype);
    AVM1Function.call(wrapped, context);
    wrapped.alSetOwnPrototypeProperty(wrappedProto);
    wrapped.alConstruct = construct;

    alDefineObjectProperties(wrappedProto, {
      constructor: {
        value: wrapped,
        writable: true
      },
      clone: {
        value: clone,
        writable: true
      }
    });

    // ... and also attaches conversion utility.
    wrappedProto.asFilterConverter = {
      toAS3Filter: toAS3Filter,
      fromAS3Filter: fromAS3Filter,
      getAS3Class: getAS3Class
    };

    filtersObj.alPut(name, wrapped);
  }

  export function createFiltersClasses(context: AVM1Context): AVM1Object {
    var filters = alNewObject(context);
    var base = new AVM1BitmapFilterFunction(context);
    filters.alPut('BitmapFilter', base);
    // TODO make field types non-string
    createFilterClass(context, filters, base, 'BevelFilter',
      ['distance', 'Number', 'angle', 'Number', 'highlightColor', 'Number',
        'highlightAlpha', 'Number', 'shadowColor', 'Number', 'shadowAlpha', 'Number',
        'blurX', 'Number', 'blurY', 'Number', 'strength', 'Number', 'quality', 'Number',
        'type', 'String', 'knockout', 'Boolean']);
    createFilterClass(context, filters, base, 'BlurFilter',
      ['blurX', 'Number', 'blurY', 'Number', 'quality', 'Number']);
    createFilterClass(context, filters, base, 'ColorMatrixFilter',
      ['matrix', 'Numbers']);
    createFilterClass(context, filters, base, 'ConvolutionFilter',
      ['matrixX', 'Number', 'matrixY', 'Number', 'matrix', 'Numbers',
        'divisor', 'Number', 'bias', 'Number', 'preserveAlpha', 'Boolean',
        'clamp', 'Boolean', 'color', 'Number', 'alpha', 'Number']);
    createFilterClass(context, filters, base, 'DisplacementMapFilter',
      ['mapBitmap', 'BitmapData', 'mapPoint', 'Point', 'componentX', 'Number',
        'componentY', 'Number', 'scaleX', 'Number', 'scaleY', 'Number',
        'mode', 'String', 'color', 'Number', 'alpha', 'Number']);
    createFilterClass(context, filters, base, 'DropShadowFilter',
      ['distance', 'Number', 'angle', 'Number', 'color', 'Number',
        'alpha', 'Number', 'blurX', 'Number', 'blurY', 'Number',
        'strength', 'Number', 'quality', 'Number', 'inner', 'Boolean',
        'knockout', 'Boolean', 'hideObject', 'Boolean']);
    createFilterClass(context, filters, base, 'GlowFilter',
      ['color', 'Number', 'alpha', 'Number', 'blurX', 'Number', 'blurY', 'Number',
        'strength', 'Number', 'quality', 'Number', 'inner', 'Boolean', 'knockout', 'Boolean']);
    createFilterClass(context, filters, base, 'GradientBevelFilter',
      ['distance', 'Number', 'angle', 'Number', 'colors', 'Numbers',
        'alphas', 'Numbers', 'ratios', 'Numbers', 'blurX', 'Number', 'blurY', 'Number',
        'strength', 'Number', 'quality', 'Number', 'type', 'String', 'knockout', 'Boolean']);
    createFilterClass(context, filters, base, 'GradientGlowFilter',
      ['distance', 'Number', 'angle', 'Number', 'colors', 'Numbers',
        'alphas', 'Numbers', 'ratios', 'Numbers', 'blurX', 'Number', 'blurY', 'Number',
        'strength', 'Number', 'quality', 'Number', 'type', 'String', 'knockout', 'Boolean']);
    return filters;
  }

  function convertToAS3Field(context: AVM1Context, value: any, type: string): any {
    switch (type) {
      case 'String':
        return alToString(context, value);
      case 'Boolean':
        return alToBoolean(context, value);
      case 'Number':
        return alToNumber(context, value);
      case 'Numbers':
        var arr = [];
        if (value) {
          for (var i = 0, length = value.alGet('length'); i < length; i++) {
            arr[i] = alToNumber(context, value.alGet(i));
          }
        }
        return context.sec.createArray(arr);
      case 'BitmapData':
        // TODO implement BitmapData conversion
        return undefined;
      case 'Point':
        return toAS3Point(value);
      default:
        release || Debug.assert(false, 'Unknown convertToAS3Field type: ' + type);
    }
  }

  function convertFromAS3Field(context: AVM1Context, value: any, type: string): any {
    switch (type) {
      case 'String':
      case 'Boolean':
      case 'Number':
        return value;
      case 'Numbers':
        var arr = [];
        if (value) {
          for (var i = 0, length = value.value.length; i < length; i++) {
            arr[i] = +value.value[i];
          }
        }
        return new Natives.AVM1ArrayNative(context, arr);
      case 'BitmapData':
        // TODO implement BitmapData conversion
        return undefined;
      case 'Point':
        return AVM1Point.fromAS3Point(context, value);
      default:
        release || Debug.assert(false, 'Unknown convertFromAS3Field type: ' + type);
    }
  }

  var knownFilters: string[] = ['BevelFilter', 'BlurFilter', 'ColorMatrixFilter',
    'ConvolutionFilter', 'DisplacementMapFilter', 'DropShadowFilter', 'GlowFilter',
    'GradientBevelFilter', 'GradientGlowFilter'];

  export function convertToAS3Filters(context: AVM1Context, as2Filters: AVM1Object): ASObject {
    var arr = [];
    if (as2Filters) {
      for (var i = 0, length = as2Filters.alGet('length'); i < length; i++) {
        var as2Filter = as2Filters.alGet(i);
        var proto = as2Filter.alPrototype;
        while (proto && !(<AVM1BitmapFilterPrototype>proto).asFilterConverter) {
          proto = proto.alPrototype;
        }
        if (proto) {
          arr.push((<AVM1BitmapFilterPrototype>proto).asFilterConverter.toAS3Filter(as2Filter));
        }
      }
    }
    return context.sec.createArray(arr);
  }

  export function convertFromAS3Filters(context: AVM1Context, as3Filters: ASObject): AVM1Object {
    var arr = [];
    if (as3Filters) {

      var classes = context.globals.alGet('flash').alGet('filters');
      for (var i = 0, length = as3Filters.axGetPublicProperty('length'); i < length; i++) {
        var as3Filter = as3Filters.axGetPublicProperty(i);
        // TODO inefficient search, refactor
        knownFilters.forEach((filterName: string) => {
          var filterClass = classes.alGet(filterName);
          var proto: AVM1BitmapFilterPrototype = filterClass.alGetPrototypeProperty();
          if (proto.asFilterConverter && proto.asFilterConverter.getAS3Class().axIsType(as3Filter)) {
            arr.push(proto.asFilterConverter.fromAS3Filter(as3Filter));
          }
        });
      }
    }
    return new Natives.AVM1ArrayNative(context, arr);
  }
}
