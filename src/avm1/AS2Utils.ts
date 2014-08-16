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
 * limitations undxr the License.
 */

///<reference path='references.ts' />
import ASNative = Shumway.AVM2.AS.ASNative;
import ASObject = Shumway.AVM2.AS.ASObject;
import flash = Shumway.AVM2.AS.flash;
module Shumway.AVM1 {
  export class AS2Utils extends ASNative {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; //["getAS2Object!"];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null;

    constructor() {
      false && super();
    }

    // JS -> AS Bindings
    // static getTarget:(A:ASObject) => any;
    // static addEventHandlerProxy:(A:ASObject, B:string, C:string, D:ASFunction = null) => any;


    // AS -> JS Bindings
    static addProperty(obj: ASObject, propertyName: string, getter: () => any,
                       setter: (v: any) => any, enumerable: boolean = true): any
    {
      obj.asDefinePublicProperty(propertyName, {
        get: getter,
        set: setter || undefined,
        enumerable: enumerable,
        configurable: true
      });
    }

    static resolveTarget(target_mc: any = undefined): any {
      return AS2Context.instance.resolveTarget(target_mc);
    }

    static resolveLevel(level: number): any {
      level = +level;
      return AS2Context.instance.resolveLevel(level);
    }

    static get currentStage(): any {
      return AS2Context.instance.stage;
    }

    static getAS2Object(as3Object) {
      return AVM1.getAS2Object(as3Object);
    }

    static _installObjectMethods(): any {
      var c = ASObject, p = c.asGetPublicProperty('prototype');
      c.asSetPublicProperty('registerClass', function registerClass(name, theClass) {
        var classes = AS2Context.instance.classes ||
          (AS2Context.instance.classes = {});
        classes[name] = theClass;
      });
      p.asDefinePublicProperty('addProperty', {
        value: function addProperty(name, getter, setter) {
          if (typeof name !== 'string' || name === '') {
            return false;
          }
          if (typeof getter !== 'function') {
            return false;
          }
          if (typeof setter !== 'function' && setter !== null) {
            return false;
          }
          this.asDefinePublicProperty(name, {
            get: getter,
            set: setter || undefined,
            configurable: true,
            enumerable: true
          });
          return true;
        },
        writable: false,
        enumerable: false,
        configurable: false
      });
    }
  }

  export function initDefaultListeners(thisArg) {
    var defaultListeners = thisArg.asGetPublicProperty('_as2DefaultListeners');
    if (!defaultListeners) {
      return;
    }
    for (var i = 0; i < defaultListeners.length; i++) {
      var p = defaultListeners[i];
      p.asGetPublicProperty('setter').call(thisArg, p.value);
    }
  }

  export function getAS2Object(as3Object) {
    if (!as3Object) {
      return null;
    }
    if (as3Object._as2Object) {
      return as3Object._as2Object;
    }
    if (flash.display.MovieClip.isType(as3Object)) {
      if (<flash.display.MovieClip>as3Object._as2SymbolClass) {
        var ctor: any = <flash.display.MovieClip>as3Object._as2SymbolClass;
        return new ctor(as3Object);
      }
      return new Shumway.AVM2.AS.avm1lib.AS2MovieClip(as3Object);
    }
    if (flash.display.SimpleButton.isType(as3Object)) {
      return new Shumway.AVM2.AS.avm1lib.AS2Button(as3Object);
    }
    if (flash.text.TextField.isType(as3Object)) {
      return new Shumway.AVM2.AS.avm1lib.AS2TextField(as3Object);
    }
    if (flash.display.BitmapData.isType(as3Object)) {
      return new as3Object;
    }

    return null;
  }
}
