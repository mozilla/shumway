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
  import ASObject = Shumway.AVM2.AS.ASObject;
  import flash = Shumway.AVM2.AS.flash;

  export interface IAVM1SymbolBase {
    isAVM1Instance: boolean;
    as3Object: flash.display.DisplayObject;
    context: AVM1Context;
    initAVM1SymbolInstance(context: AVM1Context, as3Object: flash.display.DisplayObject);
    updateAllEvents();
  }

  export class AVM1EventHandler {
    constructor(public propertyName: string,
                public eventName: string,
                public argsConverter: Function = null) { }

    public onBind(target: IAVM1SymbolBase): void {}
    public onUnbind(target: IAVM1SymbolBase): void {}
  }

  export class AVM1NativeObject {
    _context: AVM1Context;

    public get context() {
      return this._context;
    }

    public initAVM1ObjectInstance(context: AVM1Context) {
      release && Debug.assert(context);
      this._context = context;
    }
  }

  export class AVM1SymbolBase<T extends flash.display.DisplayObject> extends AVM1NativeObject implements IAVM1SymbolBase, IAVM1EventPropertyObserver {
    public get isAVM1Instance(): boolean {
      return !!this._as3Object;
    }

    _as3Object: T;

    public get as3Object(): T {
      return this._as3Object;
    }

    public initAVM1SymbolInstance(context: AVM1Context, as3Object: T) {
      this.initAVM1ObjectInstance(context);
      release && Debug.assert(as3Object);
      this._as3Object = as3Object;
    }

    private _eventsMap: Map<AVM1EventHandler>;
    private _events: AVM1EventHandler[];
    private _eventsListeners: Map<Function>;

    public bindEvents(events: AVM1EventHandler[], autoUnbind: boolean = true) {
      this._events = events;
      var eventsMap = Object.create(null);
      this._eventsMap = eventsMap;
      this._eventsListeners = Object.create(null);
      var observer = this;
      var context = this.context;
      events.forEach(function (event: AVM1EventHandler) {
        eventsMap[event.propertyName] = event;
        context.registerEventPropertyObserver(event.propertyName, observer);
        observer._updateEvent(event);
      });

      if (autoUnbind) {
        observer.as3Object.addEventListener('removedFromStage', function removedHandler() {
          observer.as3Object.removeEventListener('removedFromStage', removedHandler);
          observer.unbindEvents();
        });
      }
    }

    public unbindEvents() {
      var events = this._events;
      var observer = this;
      var context = this.context;
      events.forEach(function (event: AVM1EventHandler) {
        context.unregisterEventPropertyObserver(event.propertyName, observer);
        observer._removeEventListener(event);
      });
      this._events = null;
      this._eventsMap = null;
      this._eventsListeners = null;
    }

    public updateAllEvents() {
      this._events.forEach(function (event: AVM1EventHandler) {
        this._updateEvent(event);
      }, this)
    }

    private _updateEvent(event: AVM1EventHandler) {
      if (avm1HasEventProperty(this.context, this, event.propertyName)) {
        this._addEventListener(event);
      } else {
        this._removeEventListener(event);
      }
    }

    private _addEventListener(event: AVM1EventHandler) {
      var listener: any = this._eventsListeners[event.propertyName];
      if (!listener) {
        listener = function avm1EventHandler() {
          var args = event.argsConverter ? event.argsConverter.apply(null, arguments) : null;
          avm1BroadcastEvent(this.context, this, event.propertyName, args);
        }.bind(this);
        this.as3Object.addEventListener(event.eventName, listener);
        event.onBind(this);
        this._eventsListeners[event.propertyName] = listener;
      }
    }

    private _removeEventListener(event: AVM1EventHandler) {
      var listener: any = this._eventsListeners[event.propertyName];
      if (listener) {
        event.onUnbind(this);
        this.as3Object.removeEventListener(event.eventName, listener);
        this._eventsListeners[event.propertyName] = null;
      }
    }

    public onEventPropertyModified(propertyName) {
      var event = this._eventsMap[propertyName];
      this._updateEvent(event);
    }
  }

  export function avm1HasEventProperty(context: AVM1Context, target: any, propertyName: string): boolean {
    if (context.utils.hasProperty(target, propertyName)) {
      return true;
    }
    var _listeners = context.utils.getProperty(target, '_listeners');
    if (!_listeners) {
      return false;
    }
    return _listeners.some(function (listener) {
      return context.utils.hasProperty(listener, propertyName);
    });
  }

  export function avm1BroadcastEvent(context: AVM1Context, target: any, propertyName: string, args: any[] = null): void {
    var handler: Function = context.utils.getProperty(target, propertyName);
    if (isFunction(handler)) {
      handler.apply(target, args);
    }
    var _listeners = context.utils.getProperty(this, '_listeners');
    if (Array.isArray(_listeners)) {
      _listeners.forEach(function (listener) {
        var handlerOnListener:Function = context.utils.getProperty(listener, propertyName);
        if (isFunction(handlerOnListener)) {
          handlerOnListener.apply(target, args);
        }
      });
    }
  }

  export class AVM1Utils {
    static addProperty(obj: any, propertyName: string, getter: () => any,
                       setter: (v:any) => any, enumerable:boolean = true): any
    {
      obj.asDefinePublicProperty(propertyName, {
        get: getter,
        set: setter || undefined,
        enumerable: enumerable,
        configurable: true
      });
    }

    static resolveTarget<T extends IAVM1SymbolBase>(target_mc: any = undefined): T {
      return AVM1Context.instance.resolveTarget(target_mc);
    }

    // Temporary solution as suggested by Yury. Will be refactored soon.
    static resolveMovieClip<T extends IAVM1SymbolBase>(target: any = undefined): T {
      return target ? AVM1Context.instance.resolveTarget(target) : undefined;
    }

    static resolveLevel(level: number): AVM1MovieClip {
      level = +level;
      return AVM1Context.instance.resolveLevel(level);
    }

    static get currentStage(): flash.display.Stage {
      return (<IAVM1SymbolBase>AVM1Context.instance.root).as3Object.stage;
    }

    static get swfVersion(): number {
      return AVM1Context.instance.loaderInfo.swfVersion;
    }

    public static getTarget(mc: IAVM1SymbolBase) {
      var nativeObject = mc.as3Object;
      if (nativeObject === nativeObject.root) {
        return '/';
      }
      var path = '';
      do {
        path = '/' + nativeObject.name + path;
        nativeObject = nativeObject.parent;
      } while (nativeObject !== nativeObject.root);
      return path;
    }
  }

  function createAVM1Object(ctor, nativeObject: flash.display.DisplayObject, context: AVM1Context) {
    // We need to walk on __proto__ to find right ctor.prototype.
    var proto = ctor.prototype;
    while (proto && !proto.initAVM1SymbolInstance) {
      proto = proto.asGetPublicProperty('__proto__');
    }
    release || Debug.assert(proto);

    var avm1Object: any = Object.create(proto);
    avm1Object.asSetPublicProperty('__proto__', ctor.asGetPublicProperty('prototype'));
    avm1Object.asDefinePublicProperty('__constructor__', {
      value: ctor,
      writable: true,
      enumerable: false,
      configurable: false
    });
    (<any>nativeObject)._as2Object = avm1Object;
    (<IAVM1SymbolBase>avm1Object).initAVM1SymbolInstance(context, nativeObject);
    ctor.call(avm1Object);
    return avm1Object;
  }

  export function getAVM1Object(as3Object, context: AVM1Context) {
    if (!as3Object) {
      return null;
    }
    if (as3Object._as2Object) {
      return as3Object._as2Object;
    }
    if (flash.display.MovieClip.isType(as3Object)) {
      if (<flash.display.MovieClip>as3Object._avm1SymbolClass) {
        return createAVM1Object(<flash.display.MovieClip>as3Object._avm1SymbolClass, as3Object, context);
      }
      return createAVM1Object(context.globals.MovieClip, as3Object, context);
    }
    if (flash.display.SimpleButton.isType(as3Object)) {
      return createAVM1Object(context.globals.Button, as3Object, context);
    }
    if (flash.text.TextField.isType(as3Object)) {
      return createAVM1Object(context.globals.TextField, as3Object, context);
    }
    if (flash.display.BitmapData.isType(as3Object)) {
      return new as3Object;
    }

    return null;
  }

  export function wrapAVM1Object<T>(obj: T, members: string[]): T  {
    var wrap: any;
    if (typeof obj === 'function') {
      // Coping all members if we wrapping a function
      wrap = function () {
        return (<any>obj).apply(this, arguments);
      };
      Object.getOwnPropertyNames(obj).forEach(function (name) {
        if (wrap.hasOwnProperty(name)) {
          // Object.defineProperty will error e.g. on name or length
          return;
        }
        Object.defineProperty(wrap, name,
          Object.getOwnPropertyDescriptor(obj, name));
      });
    } else {
      // Using prototype chain in case of the object
      Debug.assert(typeof obj === 'object' && obj !== null);
      wrap = Object.create(obj);
    }
    if (!members) {
      return wrap;
    }
    members.forEach(function (memberName) {
      var definedAs = memberName;
      // We can re-map property names by specifying memberName in the format:
      //   "as2_property_name=>ts_property_name"
      var i = memberName.indexOf('=>');
      if (i >= 0) {
        definedAs = memberName.substring(0, i);
        memberName = memberName.substring(i + 2);
      }

      var getter = function() {
        return this[memberName];
      };
      var setter = function(value) {
        this[memberName] = value;
      };
      wrap.asDefinePublicProperty(definedAs, {
        get: getter,
        set: setter,
        enumerable: false,
        configurable: true
      });
    });
    return wrap;
  }

  export function wrapAVM1Class<T>(fn: T, staticMembers: string[], members: string[]): T  {
    var wrappedFn = wrapAVM1Object(fn, staticMembers);
    var prototype = (<any>fn).prototype;
    var wrappedPrototype = wrapAVM1Object(prototype, members);
    wrappedFn.asSetPublicProperty('prototype', wrappedPrototype);
    return wrappedFn;
  }

  export declare class PlaceObjectState {
    symbolId: number;
    symbol: { avm1Context: AVM1Context; };
    variableName: string;
    events: any[];
  }

  var isAvm1ObjectMethodsInstalled: boolean = false;

  export function installObjectMethods(): any {
    if (isAvm1ObjectMethodsInstalled) {
      return;
    }
    isAvm1ObjectMethodsInstalled = true;
    var c: any = Shumway.AVM2.AS.ASObject, p = c.asGetPublicProperty('prototype');
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
    // TODO move this initialization closer to the interpreter
    Object.defineProperty(p, '__proto__avm1', {
      value: null,
      writable: true,
      enumerable: false
    });
    p.asDefinePublicProperty('__proto__', {
      get: function () {
        return this.__proto__avm1;
      },
      set: function (proto) {
        if (proto === this.__proto__avm1) {
          return;
        }
        if (!proto) {
          this.__proto__avm1 = null;
          return;
        }

        // checking for circular references
        var p = proto;
        while (p) {
          if (p === this) {
            return; // potencial loop found
          }
          p = p.__proto__avm1;
        }
        this.__proto__avm1 = proto;
      },
      enumerable: false,
      configurable: false
    });
  }

  export function initializeAVM1Object(as3Object: any, state: PlaceObjectState) {
    var instanceAVM1 = getAVM1Object(as3Object, state.symbol.avm1Context);
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
        eventFlag |= 0;
        if (!(flags & (eventFlag | 0))) {
          continue;
        }
        var eventName = ClipEventMappings[eventFlag];
        //if (eventName === 'mouseDown' || eventName === 'mouseUp' || eventName === 'mouseMove') {
        //  // FIXME regressed, avm1 mouse events shall be received all the time.
        //  stageListeners.push({eventName: eventName, handler: handler});
        //  as3Object.stage.addEventListener(eventName, handler);
        //} else {
        // AVM1 MovieClips are set to button mode if one of the button-related event listeners is
        // set. This behaviour is triggered regardless of the actual value they are set to.
        switch (eventFlag) {
          case AVM1ClipEvents.Release:
          case AVM1ClipEvents.ReleaseOutside:
          case AVM1ClipEvents.RollOver:
          case AVM1ClipEvents.RollOut:
            as3Object.buttonMode = true;
        }
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
                            receiver: IAVM1SymbolBase) {
    return receiver.context.executeActions(actionsData, receiver);
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
