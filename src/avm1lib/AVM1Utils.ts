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
module Shumway.AVM2.AS.avm1lib {
  import ASNative = Shumway.AVM2.AS.ASNative;
  import ASObject = Shumway.AVM2.AS.ASObject;
  import flash = Shumway.AVM2.AS.flash;
  import AVM1Context = Shumway.AVM1.AVM1Context;

  export class AVM1Utils extends ASNative {

    // Called whenever the class is initialized.
    static classInitializer:any = null;

    // Called whenever an instance of the class is initialized.
    static initializer:any = null;

    // List of static symbols to link.
    static classSymbols: string [] = ["createFlashObject!"];//["getAVM1Object!"];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null;

    constructor() {
      false && super();
    }

    // JS -> AS Bindings
    // static getTarget:(A:ASObject) => any;
    // static addEventHandlerProxy:(A:ASObject, B:string, C:string, D:ASFunction = null) => any;
    static createFlashObject: () => any;

    // AS -> JS Bindings
    static addProperty(obj: ASObject, propertyName: string, getter: () => any,
                       setter: (v:any) => any, enumerable:boolean = true): any
    {
      obj.asDefinePublicProperty(propertyName, {
        get: getter,
        set: setter || undefined,
        enumerable: enumerable,
        configurable: true
      });
    }

    static resolveTarget(target_mc: any = undefined): any {
      return AVM1Context.instance.resolveTarget(target_mc);
    }

    // Temporary solution as suggested by Yury. Will be refactored soon.
    static resolveMovieClip(target: any = undefined): any {
      return target ? AVM1Context.instance.resolveTarget(target) : undefined;
    }

    static resolveLevel(level: number): any {
      level = +level;
      return AVM1Context.instance.resolveLevel(level);
    }

    static get currentStage(): any {
      return AVM1Context.instance.root._nativeAS3Object.stage;
    }

    static get swfVersion(): any {
      return AVM1Context.instance.loaderInfo.swfVersion;
    }

    static getAVM1Object(as3Object) {
      return avm1lib.getAVM1Object(as3Object);
    }

    static _installObjectMethods(): any {
      var c = ASObject, p = c.asGetPublicProperty('prototype');
      c.asSetPublicProperty('registerClass', function registerClass(name, theClass) {
        AVM1Context.instance.registerClass(name, theClass);
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

    static addEventHandlerProxy(obj: ASObject, propertyName: string, eventName: string,
                                argsConverter?: Function) {

      var currentHandler: Function = null;
      var handlerRunner: Function = null;

      function getter(): Function {
        return currentHandler;
      }

      function setter(newHandler: Function) {
        if (!this._as3Object) { // prototype/class ?
          var defaultListeners = this._as2DefaultListeners || (this._as2DefaultListeners = []);
          defaultListeners.push({setter: setter, value: newHandler});
          // see also initDefaultListeners()
          return;
        }
        // AVM1 MovieClips are set to button mode if one of the button-related event listeners is
        // set. This behaviour is triggered regardless of the actual value they are set to.
        if (propertyName === 'onRelease' ||
            propertyName === 'onReleaseOutside' ||
            propertyName === 'onRollOut' ||
            propertyName === 'onRollOver') {
          this._as3Object.buttonMode = true;
        }
        if (currentHandler === newHandler) {
          return;
        }
        if (currentHandler != null) {
          this._as3Object.removeEventListener(eventName, handlerRunner);
        }
        currentHandler = newHandler;
        if (currentHandler != null) {
          handlerRunner = (function (obj: Object, handler: Function) {
            return function handlerRunner() {
              var args = argsConverter != null ? argsConverter(arguments) : null;
              return handler.apply(obj, args);
            };
          })(this, currentHandler);
          this._as3Object.addEventListener(eventName, handlerRunner);
        } else {
          handlerRunner = null;
        }
      }
      AVM1Utils.addProperty(obj, propertyName, getter, setter, false);
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

  export function createFlashObject() {
    return AVM1Utils.createFlashObject();
  }

  export function getAVM1Object(as3Object) {
    if (!as3Object) {
      return null;
    }
    if (as3Object._as2Object) {
      return as3Object._as2Object;
    }
    if (flash.display.MovieClip.isType(as3Object)) {
      if (<flash.display.MovieClip>as3Object._avm1SymbolClass) {
        return Shumway.AVM2.AS.avm1lib.AVM1MovieClip._initFromConstructor(
          <flash.display.MovieClip>as3Object._avm1SymbolClass, as3Object);
      }
      return new Shumway.AVM2.AS.avm1lib.AVM1MovieClip(as3Object);
    }
    if (flash.display.SimpleButton.isType(as3Object)) {
      return new Shumway.AVM2.AS.avm1lib.AVM1Button(as3Object);
    }
    if (flash.text.TextField.isType(as3Object)) {
      return new Shumway.AVM2.AS.avm1lib.AVM1TextField(as3Object);
    }
    if (flash.display.BitmapData.isType(as3Object)) {
      return new as3Object;
    }

    return null;
  }

  export declare class PlaceObjectState {
    symbolId: number;
    variableName: string;
    events: any[];
  }
  export function initializeAVM1Object(as3Object: any, state: PlaceObjectState) {
    var instanceAVM1 = getAVM1Object(as3Object);
    release || Debug.assert(instanceAVM1);

    if (state.variableName) {
      instanceAVM1.asSetPublicProperty('variable', state.variableName);
    }

    var events = state.events;
    if (!events) {
      return;
    }
    //var stageListeners = [];
    for (var j = 0; j < events.length; j++) {
      var swfEvent = events[j];
      var actionsData;
      if (swfEvent.actionsData) {
        actionsData = new AVM1.AVM1ActionsData(swfEvent.actionsData,
                                               's' + state.symbolId + 'e' + j);
        swfEvent.actionsData = null;
        swfEvent.compiled = actionsData;
      } else {
        actionsData = swfEvent.compiled;
      }
      release || Debug.assert(actionsData);
      var handler = clipEventHandler.bind(null, actionsData, instanceAVM1);
      var flags = swfEvent.flags;
      for (var eventFlag in ClipEventMappings) {
        if (!(flags & (eventFlag | 0))) {
          continue;
        }
        var eventName = ClipEventMappings[eventFlag];
        //if (eventName === 'mouseDown' || eventName === 'mouseUp' || eventName === 'mouseMove') {
        //  // FIXME regressed, avm1 mouse events shall be received all the time.
        //  stageListeners.push({eventName: eventName, handler: handler});
        //  as3Object.stage.addEventListener(eventName, handler);
        //} else {
          as3Object.addEventListener(eventName, handler);
        //}
      }
    }
    //if (stageListeners.length > 0) {
    //  as3Object.addEventListener('removedFromStage', function () {
    //    for (var i = 0; i < stageListeners.length; i++) {
    //      this.removeEventListener(stageListeners[i].eventName, stageListeners[i].fn, false);
    //    }
    //  }, false);
    //}
  }

  function clipEventHandler(actionsData: AVM1.AVM1ActionsData,
                            receiver: {_nativeAS3Object: flash.display.DisplayObject}) {
    return receiver._nativeAS3Object.loaderInfo._avm1Context.executeActions(actionsData, receiver);
  }

  import AVM1ClipEvents = SWF.Parser.AVM1ClipEvents;
  var ClipEventMappings = Object.create(null);
  ClipEventMappings[AVM1ClipEvents.Load] = 'load';
  // AVM1's enterFrame happens at the same point in the cycle as AVM2's frameConstructed.
  ClipEventMappings[AVM1ClipEvents.EnterFrame] = 'frameConstructed';
  ClipEventMappings[AVM1ClipEvents.Unload] = 'unload';
  ClipEventMappings[AVM1ClipEvents.MouseMove] = 'mouseMove';
  ClipEventMappings[AVM1ClipEvents.MouseDown] = 'mouseDown';
  ClipEventMappings[AVM1ClipEvents.MouseUp] = 'mouseUp';
  ClipEventMappings[AVM1ClipEvents.KeyDown] = 'keyDown';
  ClipEventMappings[AVM1ClipEvents.KeyUp] = 'keyUp';
  ClipEventMappings[AVM1ClipEvents.Data] = {toString: function() {Debug.warning('Data ClipEvent not implemented');}};
  ClipEventMappings[AVM1ClipEvents.Initialize] = 'initialize';
  ClipEventMappings[AVM1ClipEvents.Press] = 'mouseDown';
  ClipEventMappings[AVM1ClipEvents.Release] = 'click';
  ClipEventMappings[AVM1ClipEvents.ReleaseOutside] = 'releaseOutside';
  ClipEventMappings[AVM1ClipEvents.RollOver] = 'mouseOver';
  ClipEventMappings[AVM1ClipEvents.RollOut] = 'mouseOut';
  ClipEventMappings[AVM1ClipEvents.DragOver] = {toString: function() {Debug.warning('DragOver ClipEvent not implemented');}};
  ClipEventMappings[AVM1ClipEvents.DragOut] =  {toString: function() {Debug.warning('DragOut ClipEvent not implemented');}};
  ClipEventMappings[AVM1ClipEvents.KeyPress] =  {toString: function() {Debug.warning('KeyPress ClipEvent not implemented');}};
  ClipEventMappings[AVM1ClipEvents.Construct] =  'construct';
}
