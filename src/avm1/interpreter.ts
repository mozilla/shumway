/*
 * Copyright 2014 Mozilla Foundation
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
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import forEachPublicProperty = Shumway.AVM2.Runtime.forEachPublicProperty;
  import construct = Shumway.AVM2.Runtime.construct;
  import isNumeric = Shumway.isNumeric;
  import isFunction = Shumway.isFunction;
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import sliceArguments = Shumway.AVM2.Runtime.sliceArguments;
  import Option = Shumway.Options.Option;
  import OptionSet = Shumway.Options.OptionSet;
  import Telemetry = Shumway.Telemetry;
  import assert = Shumway.Debug.assert;

  declare var Proxy;
  declare class Error {
    constructor(obj: string);
  }
  declare class InternalError extends Error {
    constructor(obj: string);
  }

  import shumwayOptions = Shumway.Settings.shumwayOptions;

  var avm1Options = shumwayOptions.register(new OptionSet("AVM1"));
  export var avm1TraceEnabled = avm1Options.register(new Option("t1", "traceAvm1", "boolean", false, "trace AVM1 execution"));
  export var avm1ErrorsEnabled = avm1Options.register(new Option("e1", "errorsAvm1", "boolean", false, "fail on AVM1 warnings and errors"));
  export var avm1TimeoutDisabled = avm1Options.register(new Option("ha1", "nohangAvm1", "boolean", false, "disable fail on AVM1 hang"));
  export var avm1CompilerEnabled = avm1Options.register(new Option("ca1", "compileAvm1", "boolean", true, "compiles AVM1 code"));
  export var avm1DebuggerEnabled = avm1Options.register(new Option("da1", "debugAvm1", "boolean", false, "allows AVM1 code debugging"));

  export var Debugger = {
    pause: false,
    breakpoints: {}
  };

  function avm1Warn(message?: any, ...optionalParams: any[]) {
    if (avm1ErrorsEnabled.value) {
      try {
        throw new Error(message); // using throw as a way to break in browsers debugger
      } catch (e) { /* ignoring since handled */ }
    }
    warn.apply(null, arguments);
  }

  var MAX_AVM1_HANG_TIMEOUT = 1000;
  var CHECK_AVM1_HANG_EVERY = 1000;
  var MAX_AVM1_ERRORS_LIMIT = 1000;
  var MAX_AVM1_STACK_LIMIT = 256;

  var as2IdentifiersDictionary = [
    "addCallback", "addListener", "addProperty", "addRequestHeader",
    "AsBroadcaster", "attachAudio", "attachMovie", "attachSound", "attachVideo",
    "beginFill", "beginGradientFill", "blendMode", "blockIndent",
    "broadcastMessage", "cacheAsBitmap", "CASEINSENSITIVE", "charAt",
    "charCodeAt", "checkPolicyFile", "clearInterval", "clearRequestHeaders",
    "concat", "createEmptyMovieClip", "curveTo", "DESCENDING", "displayState",
    "duplicateMovieClip", "E", "endFill", "exactSettings", "fromCharCode",
    "fullScreenSourceRect", "getBounds", "getBytesLoaded", "getBytesTotal",
    "getDate", "getDay", "getDepth", "getDepth", "getDuration", "getFullYear",
    "getHours", "getLocal", "getMilliseconds", "getMinutes", "getMonth",
    "getNewTextFormat", "getPan", "getPosition", "getRGB", "getSeconds",
    "getSize", "getTextFormat", "getTime", "getTimezoneOffset", "getTransform",
    "getUTCDate", "getUTCDay", "getUTCFullYear", "getUTCHours",
    "getUTCMilliseconds", "getUTCMinutes", "getUTCMonth", "getUTCSeconds",
    "getUTCYear", "getVolume", "getYear", "globalToLocal", "gotoAndPlay",
    "gotoAndStop", "hasAccessibility", "hasAudio", "hasAudioEncoder",
    "hasEmbeddedVideo", "hasIME", "hasMP3", "hasOwnProperty", "hasPrinting",
    "hasScreenBroadcast", "hasScreenPlayback", "hasStreamingAudio",
    "hasStreamingVideo", "hasVideoEncoder", "hitTest", "indexOf", "isActive",
    "isDebugger", "isFinite", "isNaN", "isPropertyEnumerable", "isPrototypeOf",
    "lastIndexOf", "leftMargin", "letterSpacing", "lineStyle", "lineTo", "LN10",
    "LN10E", "LN2", "LN2E", "loadSound", "localFileReadDisable", "localToGlobal",
    "MAX_VALUE", "MIN_VALUE", "moveTo", "NaN", "NEGATIVE_INFINITY", "nextFrame",
    "NUMERIC", "onChanged", "onData", "onDragOut", "onDragOver", "onEnterFrame",
    "onFullScreen", "onKeyDown", "onKeyUp", "onKillFocus", "onLoad",
    "onMouseDown", "onMouseMove", "onMouseUp", "onPress", "onRelease",
    "onReleaseOutside", "onResize", "onResize", "onRollOut", "onRollOver",
    "onScroller", "onSetFocus", "onStatus", "onSync", "onUnload", "parseFloat",
    "parseInt", "PI", "pixelAspectRatio", "playerType", "POSITIVE_INFINITY",
    "prevFrame", "registerClass", "removeListener", "removeMovieClip",
    "removeTextField", "replaceSel", "RETURNINDEXEDARRAY", "rightMargin",
    "scale9Grid", "scaleMode", "screenColor", "screenDPI", "screenResolutionX",
    "screenResolutionY", "serverString", "setClipboard", "setDate", "setDuration",
    "setFps", "setFullYear", "setHours", "setInterval", "setMask",
    "setMilliseconds", "setMinutes", "setMonth", "setNewTextFormat", "setPan",
    "setPosition", "setRGB", "setSeconds", "setTextFormat", "setTime",
    "setTimeout", "setTransform", "setTransform", "setUTCDate", "setUTCFullYear",
    "setUTCHours", "setUTCMilliseconds", "setUTCMinutes", "setUTCMonth",
    "setUTCSeconds", "setVolume", "setYear", "showMenu", "showRedrawRegions",
    "sortOn", "SQRT1_2", "SQRT2", "startDrag", "stopDrag", "swapDepths",
    "tabEnabled", "tabIndex", "tabIndex", "tabStops", "toLowerCase", "toString",
    "toUpperCase", "trackAsMenu", "UNIQUESORT", "updateAfterEvent",
    "updateProperties", "useCodepage", "useHandCursor", "UTC", "valueOf"];
  var as2IdentifiersCaseMap: Map<string> = null;

  class AVM1ScopeListItem {
    constructor(public scope, public next: AVM1ScopeListItem) {
    }

    create(scope) {
      return new AVM1ScopeListItem(scope, this);
    }
  }

  class AVM1FunctionClosure extends Shumway.AVM2.AS.ASObject {
    constructor() {
      super();
      this.asSetPublicProperty('toString', this.toString);
    }

    toString(): string {
      return <string><any>this;
    }
  }

  class AVM1ContextImpl extends AVM1Context {
    initialScope: AVM1ScopeListItem;
    isActive: boolean;
    executionProhibited: boolean;
    abortExecutionAt: number;
    stackDepth: number;
    isTryCatchListening: boolean;
    errorsIgnored: number;
    deferScriptExecution: boolean;
    pendingScripts;
    defaultTarget;
    currentTarget;

    private assets: Map<number>;
    private assetsSymbols: Array<any>;
    private assetsClasses: Array<any>;

    constructor(loaderInfo: Shumway.AVM2.AS.flash.display.LoaderInfo) {
      super();
      this.loaderInfo = loaderInfo;
      this.globals = new Shumway.AVM2.AS.avm1lib.AVM1Globals();
      if (loaderInfo.swfVersion >= 8) {
        this.globals.asSetPublicProperty("flash",
          Shumway.AVM2.AS.avm1lib.createFlashObject());
      }
      this.initialScope = new AVM1ScopeListItem(this.globals, null);
      this.assets = {};
      // TODO: remove this list and always retrieve symbols from LoaderInfo.
      this.assetsSymbols = [];
      this.assetsClasses = [];
      this.isActive = false;
      this.executionProhibited = false;
      this.abortExecutionAt = 0;
      this.stackDepth = 0;
      this.isTryCatchListening = false;
      this.errorsIgnored = 0;
      this.deferScriptExecution = true;
      this.pendingScripts = [];
    }
    addAsset(className: string, symbolId: number, symbolProps) {
      this.assets[className] = symbolId;
      this.assetsSymbols[symbolId] = symbolProps;

    }
    registerClass(className: string, theClass) {
      var symbolId = this.assets[className];
      if (symbolId === undefined) {
        Debug.error('Cannot register ' + className + ' class for symbol');
        return;
      }
      this.assetsClasses[symbolId] = theClass;
    }
    getAsset(className: string) : AVM1ExportedSymbol {
      var symbolId = this.assets[className];
      if (symbolId === undefined) {
        return undefined;
      }
      var symbol = this.assetsSymbols[symbolId];
      if (!symbol) {
        symbol = this.loaderInfo.getSymbolById(symbolId);
        if (!symbol) {
          Debug.warning("Symbol " + symbolId + " is not defined.");
          return undefined;
        }
        this.assetsSymbols[symbolId] = symbol;
      }
      return {
        symbolId: symbolId,
        symbolProps: symbol,
        theClass: this.assetsClasses[symbolId]
      };
    }
    resolveTarget(target) : any {
      var currentTarget = this.currentTarget || this.defaultTarget;
      if (!target) {
        target = currentTarget;
      } else if (typeof target === 'string') {
        target = lookupAVM1Children(target, currentTarget,
          this.resolveLevel(0));
      }
      if (typeof target !== 'object' || target === null ||
        !('_nativeAS3Object' in target)) {
        throw new Error('Invalid AVM1 target object: ' +
          Object.prototype.toString.call(target));
      }

      return target;
    }
    resolveLevel(level: number) : any {
      // TODO levels 1, 2, etc.
      // TODO _lockroot
      if (level === 0) {
        return this.root;
      }
      return undefined;
    }
    addToPendingScripts(fn: Function) {
      if (!this.deferScriptExecution) {
        fn();
        return;
      }
      this.pendingScripts.push(fn);
    }
    flushPendingScripts() {
      var scripts = this.pendingScripts;
      while (scripts.length) {
        scripts.shift()();
      }
      this.deferScriptExecution = false;
    }

    executeActions(actionsData: AVM1ActionsData, scopeObj) {
      executeActions(actionsData, this, scopeObj);
    }
  }

  AVM1Context.create = function(loaderInfo: Shumway.AVM2.AS.flash.display.LoaderInfo): AVM1Context {
    return new AVM1ContextImpl(loaderInfo);
  };

  class AVM1Error {
    constructor(public error) {}
  }

  class AVM1CriticalError extends Error  {
    constructor(message: string, public error?) {
      super(message);
    }
  }

  function isAVM1MovieClip(obj): boolean {
    return typeof obj === 'object' && obj &&
      obj instanceof Shumway.AVM2.AS.avm1lib.AVM1MovieClip;
  }

  function as2GetType(v): string {
    if (v === null) {
      return 'null';
    }

    var type = typeof v;
    if (type === 'function') {
      return 'object';
    }
    if (type === 'object' && isAVM1MovieClip(v)) {
      return 'movieclip';
    }
    return type;
  }

  function as2ToPrimitive(value) {
    return as2GetType(value) !== 'object' ? value : value.valueOf();
  }

  function as2GetCurrentSwfVersion() : number {
    return AVM1Context.instance.loaderInfo.swfVersion;
  }

  function as2ToAddPrimitive(value) {
    if (as2GetType(value) !== 'object') {
      return value;
    }

    if (value instanceof Date && as2GetCurrentSwfVersion() >= 6) {
      return value.toString();
    } else {
      return value.valueOf();
    }
  }

  function as2ToBoolean(value): boolean {
    switch (as2GetType(value)) {
      default:
      case 'undefined':
      case 'null':
        return false;
      case 'boolean':
        return value;
      case 'number':
        return value !== 0 && !isNaN(value);
      case 'string':
        return value.length !== 0;
      case 'movieclip':
      case 'object':
        return true;
    }
  }

  function as2ToNumber(value): number {
    value = as2ToPrimitive(value);
    switch (as2GetType(value)) {
      case 'undefined':
      case 'null':
        return as2GetCurrentSwfVersion() >= 7 ? NaN : 0;
      case 'boolean':
        return value ? 1 : +0;
      case 'number':
        return value;
      case 'string':
        if (value === '' && as2GetCurrentSwfVersion() < 5) {
          return 0;
        }
        return +value;
      default:
        return as2GetCurrentSwfVersion() >= 5 ? NaN : 0;
    }
  }

  function as2ToInteger(value): number {
    var result = as2ToNumber(value);
    if (isNaN(result)) {
      return 0;
    }
    if (!isFinite(result) || result === 0) {
      return result;
    }
    return (result < 0 ? -1 : 1) * Math.abs(result)|0;
  }

  function as2ToInt32(value): number {
    var result = as2ToNumber(value);
    return (isNaN(result) || !isFinite(result) || result === 0) ? 0 :
      (result | 0);
  }

// TODO: We should just override Function.prototype.toString and change this to
// only have a special case for 'undefined'.
  function as2ToString(value): string {
    switch (as2GetType(value)) {
      case 'undefined':
        return as2GetCurrentSwfVersion() >= 7 ? 'undefined' : '';
      case 'null':
        return 'null';
      case 'boolean':
        return value ? 'true' : 'false';
      case 'number':
        return value.toString();
      case 'string':
        return value;
      case 'movieclip':
        return (<Shumway.AVM2.AS.avm1lib.AVM1MovieClip> value).__targetPath;
      case 'object':
        if (typeof value === 'function' &&
            value.asGetPublicProperty('toString') ===
              AVM2.AS.ASFunction.traitsPrototype.asGetPublicProperty('toString')) {
          // Printing AVM1 thing instead of 'function Function() {}' when
          // native AS3 Function.prototype.toString is found.
          return '[type Function]';
        }
        var result = value.asCallPublicProperty('toString', null);
        if (typeof result === 'string') {
          return result;
        }
        return typeof value === 'function' ? '[type Function]'
          : '[type Object]';
    }
  }

  function as2Compare(x, y): boolean {
    var x2 = as2ToPrimitive(x);
    var y2 = as2ToPrimitive(y);
    if (typeof x2 === 'string' && typeof y2 === 'string') {
      return x2 < y2;
    } else {
      return as2ToNumber(x2) < as2ToNumber(y2);
    }
  }

  function as2InstanceOf(obj, constructor): boolean {
    if (obj instanceof constructor) {
      return true;
    }
    // TODO interface check
    return false;
  }

  function as2ResolveProperty(obj, name: string, normalize: boolean): string {
    // AVM1 just ignores lookups on non-existant containers
    if (isNullOrUndefined(obj)) {
      avm1Warn("AVM1 warning: cannot look up member '" + name + "' on undefined object");
      return null;
    }
    obj = Object(obj);
    // checking if avm2 public property is present
    if (obj.asHasProperty(undefined, name, 0)) {
      return name;
    }
    if (isNumeric(name)) {
      return null;
    }

    // versions 6 and below ignore identifier case
    if (as2GetCurrentSwfVersion() > 6) {
      return null;
    }

    // First checking all lowercase property.
    var lowerCaseName = name.toLowerCase();
    if (obj.asHasProperty(undefined, lowerCaseName, 0)) {
      return lowerCaseName;
    }

    // Checking the dictionary of the well-known normalized names.
    if (as2IdentifiersCaseMap === null) {
      as2IdentifiersCaseMap = Object.create(null);
      as2IdentifiersDictionary.forEach(function (key) {
        as2IdentifiersCaseMap[key.toLowerCase()] = key;
      });
    }
    var normalizedName = as2IdentifiersCaseMap[lowerCaseName] || null;
    if (normalizedName && obj.asHasProperty(undefined, normalizedName, 0)) {
      return normalizedName;
    }

    // Just enumerating through existing properties.
    var foundName = null;
    as2Enumerate(obj, function (name) {
      if (name.toLowerCase() === lowerCaseName) {
        foundName = name;
      }
    }, null);
    return foundName || (normalize ? normalizedName : null);
  }

  function as2GetProperty(obj, name: string) {
    // AVM1 just ignores lookups on non-existant containers
    if (isNullOrUndefined(obj)) {
      avm1Warn("AVM1 warning: cannot get property '" + name + "' on undefined object");
      return undefined;
    }
    obj = Object(obj);
    return obj.asGetPublicProperty(name);
  }

  function as2GetPrototype(obj) {
    return obj && obj.asGetPublicProperty('prototype');
  }

  function as2CastError(ex) {
    if (typeof InternalError !== 'undefined' &&
        ex instanceof InternalError && (<any>ex).message === 'too much recursion') {
      // HACK converting too much recursion into AVM1CriticalError
      return new AVM1CriticalError('long running script -- AVM1 recursion limit is reached');
    }
    return ex;
  }

  function as2Construct(ctor, args) {
    var result;
    if (isAvm2Class(ctor)) {
      result = construct(ctor, args);
    } else {
      // AVM1 simply ignores attempts to invoke non-methods.
      if (!isFunction(ctor)) {
        return undefined;
      }

      result = Object.create(as2GetPrototype(ctor) || as2GetPrototype(AVM1Object));
      ctor.apply(result, args);
    }
    result.constructor = ctor;
    return result;
  }

  function as2Enumerate(obj, fn, thisArg) {
    forEachPublicProperty(obj, fn, thisArg);
  }

  function isAvm2Class(obj): boolean {
    return obj instanceof Shumway.AVM2.AS.ASClass;
  }

  interface AVM1Function {
    instanceConstructor: Function;
    debugName: string; // for AVM2 debugging
    name: string; // Function's name
    _setClass(cls);
  }

  function as2CreatePrototypeProxy(obj) {
    var prototype = obj.asGetPublicProperty('prototype');
    if (typeof Proxy === 'undefined') {
      console.error('ES6 proxies are not found');
      return prototype;
    }
    return Proxy.create({
      getOwnPropertyDescriptor: function(name: string) {
        return Object.getOwnPropertyDescriptor(prototype, name);
      },
      getPropertyDescriptor: function(name: string) {
        // ES6: return getPropertyDescriptor(prototype, name);
        for (var p = prototype; p; p = Object.getPrototypeOf(p)) {
          var desc = Object.getOwnPropertyDescriptor(p, name);
          if (desc) {
            return desc;
          }
        }
        return undefined;
      },
      getOwnPropertyNames: function() {
        return Object.getOwnPropertyNames(prototype);
      },
      getPropertyNames: function() {
        // ES6: return getPropertyNames(prototype, name);
        var names = Object.getOwnPropertyNames(prototype);
        for (var p = Object.getPrototypeOf(prototype); p;
             p = Object.getPrototypeOf(p)) {
          names = names.concat(Object.getOwnPropertyNames(p));
        }
        return names;
      },
      defineProperty: function(name: string, desc) {
        if (desc) {
          if (typeof desc.value === 'function' &&
              '_setClass' in desc.value) {
            (<AVM1Function> desc.value)._setClass(obj);
          }
          if (typeof desc.get === 'function' &&
              '_setClass' in desc.get) {
            (<AVM1Function> desc.get)._setClass(obj);
          }
          if (typeof desc.set === 'function' &&
              '_setClass' in desc.set) {
            (<AVM1Function> desc.set)._setClass(obj);
          }
        }
        return Object.defineProperty(prototype, name, desc);
      },
      delete: function(name: string) {
        return delete prototype[name];
      },
      fix: function() {
        return undefined;
      }
    });
  }

  export function executeActions(actionsData: AVM1ActionsData, as2Context: AVM1Context, scope) {
    var context = <AVM1ContextImpl> as2Context;
    if (context.executionProhibited) {
      return; // no more avm1 for this context
    }

    var actionTracer = ActionTracerFactory.get();

    var scopeContainer = context.initialScope.create(scope);
    var savedContext = AVM1Context.instance;
    var caughtError;
    try {
      AVM1Context.instance = context;
      context.isActive = true;
      context.abortExecutionAt = avm1TimeoutDisabled.value ? Number.MAX_VALUE :
        Date.now() + MAX_AVM1_HANG_TIMEOUT;
      context.errorsIgnored = 0;
      context.defaultTarget = scope;
      context.currentTarget = null;
      actionTracer.message('ActionScript Execution Starts');
      actionTracer.indent();
      interpretActions(actionsData, scopeContainer, [], []);
    } catch (e) {
      caughtError = as2CastError(e);
      if (caughtError instanceof AVM1CriticalError) {
        context.executionProhibited = true;
        console.error('Disabling AVM1 execution');
      }
    }
    context.isActive = false;
    context.defaultTarget = null;
    context.currentTarget = null;
    actionTracer.unindent();
    actionTracer.message('ActionScript Execution Stops');
    AVM1Context.instance = savedContext;
    if (caughtError) {
      // Note: this doesn't use `finally` because that's a no-go for performance.
      throw caughtError; // TODO shall we just ignore it?
    }
  }

  function lookupAVM1Children(targetPath: string, defaultTarget, root) {
    var path = targetPath.split(/[\/.]/g);
    if (path[path.length - 1] === '') {
      path.pop();
    }
    var obj = defaultTarget;
    if (path[0] === '' || path[0] === '_level0' || path[0] === '_root') {
      obj = root;
      path.shift();
    }
    while (path.length > 0) {
      var prevObj = obj;
      obj = obj.__lookupChild(path[0]);
      if (!obj) {
        throw new Error(path[0] + ' (expr ' + targetPath + ') is not found in ' +
          prevObj._target);
      }
      path.shift();
    }
    return obj;
  }

  class AVM1Object extends Shumway.AVM2.AS.ASObject {
  }

  function createBuiltinType(obj, args: any[]) {
    if (obj === Array) {
      // special case of array
      var result = args;
      if (args.length == 1 && typeof args[0] === 'number') {
        result = [];
        result.length = args[0];
      }
      return result;
    }
    if (obj === Boolean || obj === Number || obj === String || obj === Function) {
      return obj.apply(null, args);
    }
    if (obj === Date) {
      switch (args.length) {
        case 0:
          return new Date();
        case 1:
          return new Date(args[0]);
        default:
          return new Date(args[0], args[1],
            args.length > 2 ? args[2] : 1,
            args.length > 3 ? args[3] : 0,
            args.length > 4 ? args[4] : 0,
            args.length > 5 ? args[5] : 0,
            args.length > 6 ? args[6] : 0);
      }
    }
    if (obj === Object) {
      return new AVM1Object();
    }
    return undefined;
  }

  var AVM1_SUPER_STUB = {};

  interface ExecutionContext {
    context: AVM1ContextImpl;
    global: Shumway.AVM2.AS.avm1lib.AVM1Globals;
    scopeContainer: AVM1ScopeListItem;
    scope: any;
    actionTracer: ActionTracer;
    constantPool: any;
    registers: any[];
    stack: any[];
    isSwfVersion5: boolean;
    recoveringFromError: boolean;
    isEndOfActions: boolean;
  }

    function avm1ValidateArgsCount(numArgs: number, maxAmount: number) {
      if (isNaN(numArgs) || numArgs < 0 || numArgs > maxAmount ||
        numArgs != (0|numArgs)) {
        throw new Error('Invalid number of arguments: ' + numArgs);
      }
    }
    function avm1ReadFunctionArgs(stack: any[]) {
      var numArgs = +stack.pop();
      avm1ValidateArgsCount(numArgs, stack.length);
      var args = [];
      for (var i = 0; i < numArgs; i++) {
        args.push(stack.pop());
      }
      return args;
    }
    function avm1SetTarget(ectx: ExecutionContext, targetPath: string) {
      var currentContext = ectx.context;
      var _global = ectx.global;

      if (!targetPath) {
        currentContext.currentTarget = null;
        return;
      }

      try {
        var currentTarget = lookupAVM1Children(targetPath,
          currentContext.currentTarget || currentContext.defaultTarget,
          currentContext.resolveLevel(0));
        currentContext.currentTarget = currentTarget;
      } catch (e) {
        currentContext.currentTarget = null;
        throw e;
      }
    }
    function isGlobalObject(obj) {
      return obj === this;
    }

    function avm1DefineFunction(ectx: ExecutionContext,
                                actionsData: AVM1ActionsData,
                                functionName: string,
                                parametersNames: string[],
                                registersCount: number,
                                registersAllocation: ArgumentAssignment[],
                                suppressArguments: ArgumentAssignmentType) {
      var currentContext = ectx.context;
      var _global = ectx.global;
      var scopeContainer = ectx.scopeContainer;
      var scope = ectx.scope;
      var actionTracer = ectx.actionTracer;
      var defaultTarget = currentContext.defaultTarget;
      var constantPool = ectx.constantPool;

      var skipArguments = null;
      if (registersAllocation) {
        for (var i = 0; i < registersAllocation.length; i++) {
          var registerAllocation = registersAllocation[i];
          if (registerAllocation &&
              registerAllocation.type === ArgumentAssignmentType.Argument) {
            if (!skipArguments) {
              skipArguments = [];
            }
            skipArguments[registersAllocation[i].index] = true;
          }
        }
      }

      var ownerClass;
      var fn = (function() {
        if (currentContext.executionProhibited) {
          return; // no more avm1 execution, ever
        }

        var newScopeContainer;
        var newScope: any = new AVM1FunctionClosure();
        var thisArg = isGlobalObject(this) ? scope : this;
        var argumentsClone;

        if (!(suppressArguments & ArgumentAssignmentType.Arguments)) {
          argumentsClone = sliceArguments(arguments, 0);
          newScope.asSetPublicProperty('arguments', argumentsClone);
        }
        if (!(suppressArguments & ArgumentAssignmentType.This)) {
          newScope.asSetPublicProperty('this', thisArg);
        }
        if (!(suppressArguments & ArgumentAssignmentType.Super)) {
          newScope.asSetPublicProperty('super', AVM1_SUPER_STUB);
        }
        newScope.asSetPublicProperty('__class', ownerClass);
        newScopeContainer = scopeContainer.create(newScope);
        var i;
        var registers = [];
        if (registersAllocation) {
          for (i = 0; i < registersAllocation.length; i++) {
            var registerAllocation = registersAllocation[i];
            if (!registerAllocation) {
              continue;
            }
            switch (registerAllocation.type) {
              case ArgumentAssignmentType.Argument:
                registers[i] = arguments[registerAllocation.index];
                break;
              case ArgumentAssignmentType.This:
                registers[i] = thisArg;
                break;
              case ArgumentAssignmentType.Arguments:
                argumentsClone = argumentsClone || sliceArguments(arguments, 0);
                registers[i] = argumentsClone;
                break;
              case ArgumentAssignmentType.Super:
                registers[i] = AVM1_SUPER_STUB;
                break;
              case ArgumentAssignmentType.Global:
                registers[i] = _global;
                break;
              case ArgumentAssignmentType.Parent:
                registers[i] = scope.asGetPublicProperty('_parent');
                break;
              case ArgumentAssignmentType.Root:
                registers[i] = currentContext.resolveLevel(0);
                break;
            }
          }
        }
        for (i = 0; i < arguments.length || i < parametersNames.length; i++) {
          if (skipArguments && skipArguments[i]) {
            continue;
          }
          newScope.asSetPublicProperty(parametersNames[i], arguments[i]);
        }

        var savedContext = AVM1Context.instance;
        var savedIsActive = currentContext.isActive;
        var savedDefaultTarget = currentContext.defaultTarget;
        var savedCurrentTarget = currentContext.currentTarget;
        var result;
        var caughtError;
        try {
          // switching contexts if called outside main thread
          AVM1Context.instance = currentContext;
          if (!savedIsActive) {
            currentContext.abortExecutionAt = avm1TimeoutDisabled.value ?
              Number.MAX_VALUE : Date.now() + MAX_AVM1_HANG_TIMEOUT;
            currentContext.errorsIgnored = 0;
            currentContext.isActive = true;
          }
          currentContext.defaultTarget = defaultTarget;
          currentContext.currentTarget = null;
          actionTracer.indent();
          if (++currentContext.stackDepth >= MAX_AVM1_STACK_LIMIT) {
            throw new AVM1CriticalError('long running script -- AVM1 recursion limit is reached');
          }
          result = interpretActions(actionsData, newScopeContainer, constantPool, registers);
        } catch (e) {
          caughtError = e;
        }
        currentContext.defaultTarget = savedDefaultTarget;
        currentContext.currentTarget = savedCurrentTarget;
        currentContext.isActive = savedIsActive;
        currentContext.stackDepth--;
        actionTracer.unindent();
        AVM1Context.instance = savedContext;
        if (caughtError) {
          // Note: this doesn't use `finally` because that's a no-go for performance.
          throw caughtError;
        }
        return result;
      });

      ownerClass = fn;
      var fnObj: AVM1Function = <AVM1Function> <any> fn;
      fnObj._setClass = function (class_) {
        ownerClass = class_;
      };

      fnObj.instanceConstructor = fn;
      fnObj.debugName = 'avm1 ' + (functionName || '<function>');
      if (functionName) {
        fnObj.name = functionName;
      }
      return fn;
    }
    function avm1DeleteProperty(ectx, propertyName) {
      var scopeContainer = ectx.scopeContainer;

      for (var p = scopeContainer; p; p = p.next) {
        if (p.scope.asHasProperty(undefined, propertyName, 0)) {
          p.scope.asSetPublicProperty(propertyName, undefined); // in some cases we need to cleanup events binding
          return p.scope.asDeleteProperty(undefined, propertyName, 0);
        }
      }
      return false;
    }
    function avm1ResolveVariableName(ectx: ExecutionContext, variableName: string, nonStrict: boolean) {
      var _global = ectx.global;
      var currentContext = ectx.context;
      var currentTarget = currentContext.currentTarget || currentContext.defaultTarget;

      var obj, name, i;
      if (variableName.indexOf(':') >= 0) {
        // "/A/B:FOO references the FOO variable in the movie clip with a target path of /A/B."
        var parts = variableName.split(':');
        obj = lookupAVM1Children(parts[0], currentTarget,
          currentContext.resolveLevel(0));
        if (!obj) {
          throw new Error(parts[0] + ' is undefined');
        }
        name = parts[1];
      } else if (variableName.indexOf('.') >= 0) {
        // new object reference
        var objPath = variableName.split('.');
        name = objPath.pop();
        obj = _global;
        for (i = 0; i < objPath.length; i++) {
          obj = obj.asGetPublicProperty(objPath[i]) || obj[objPath[i]];
          if (!obj) {
            throw new Error(objPath.slice(0, i + 1) + ' is undefined');
          }
        }
      }

      if (!obj) {
        return null; // local variable
      }

      var resolvedName = as2ResolveProperty(obj, name, false);
      var resolved = resolvedName !== null;
      if (resolved || nonStrict) {
        return { obj: obj, name: resolvedName || name, resolved: resolved };
      }

      return null;
    }
    function avm1GetVariable(ectx: ExecutionContext, variableName: string) {
      var scopeContainer = ectx.scopeContainer;
      var currentContext = ectx.context;
      var currentTarget = currentContext.currentTarget || currentContext.defaultTarget;
      var scope = ectx.scope;

      // fast check if variable in the current scope
      if (scope.asHasProperty(undefined, variableName, 0)) {
        return scope.asGetPublicProperty(variableName);
      }

      var target = avm1ResolveVariableName(ectx, variableName, false);
      if (target) {
        return target.obj.asGetPublicProperty(target.name);
      }

      var resolvedName;
      if ((resolvedName = as2ResolveProperty(scope, variableName, false))) {
        return scope.asGetPublicProperty(resolvedName);
      }
      for (var p = scopeContainer; p; p = p.next) {
        resolvedName = as2ResolveProperty(p.scope, variableName, false);
        if (resolvedName !== null) {
          return p.scope.asGetPublicProperty(resolvedName);
        }
      }

      if (currentTarget.asHasProperty(undefined, variableName, 0)) {
        return currentTarget.asGetPublicProperty(variableName);
      }

      // TODO refactor that
      if (variableName === 'this') {
        return currentTarget;
      }

      return undefined;
    }
    function avm1SetVariable(ectx: ExecutionContext, variableName: string, value) {
      var scopeContainer = ectx.scopeContainer;
      var currentContext = ectx.context;
      var currentTarget = currentContext.currentTarget || currentContext.defaultTarget;
      var scope = ectx.scope;

      if (currentContext.currentTarget) {
        currentTarget.asSetPublicProperty(variableName, value);
        return;
      }

      // fast check if variable in the current scope
      if (scope.asHasProperty(undefined, variableName, 0)) {
        scope.asSetPublicProperty(variableName, value);
        return;
      }

      var target = avm1ResolveVariableName(ectx, variableName, true);
      if (target) {
        target.obj.asSetPublicProperty(target.name, value);
        return;
      }

      for (var p = scopeContainer; p.next; p = p.next) { // excluding globals
        var resolvedName = as2ResolveProperty(p.scope, variableName, false);
        if (resolvedName !== null) {
          p.scope.asSetPublicProperty(resolvedName, value);
          return;
        }
      }

      currentTarget.asSetPublicProperty(variableName, value);
    }
    function avm1ProcessWith(ectx: ExecutionContext, obj, withBlock) {
      var scopeContainer = ectx.scopeContainer;
      var constantPool = ectx.constantPool;
      var registers = ectx.registers;

      var newScopeContainer = scopeContainer.create(Object(obj));
      interpretActions(withBlock, newScopeContainer, constantPool, registers);
    }
    function avm1ProcessTry(ectx: ExecutionContext,
                            catchIsRegisterFlag, finallyBlockFlag,
                            catchBlockFlag, catchTarget,
                            tryBlock, catchBlock, finallyBlock) {
      var currentContext = ectx.context;
      var scopeContainer = ectx.scopeContainer;
      var scope = ectx.scope;
      var constantPool = ectx.constantPool;
      var registers = ectx.registers;

      var savedTryCatchState = currentContext.isTryCatchListening;
      var caughtError;
      try {
        currentContext.isTryCatchListening = true;
        interpretActions(tryBlock, scopeContainer, constantPool, registers);
      } catch (e) {
        currentContext.isTryCatchListening = savedTryCatchState;
        if (!catchBlockFlag || !(e instanceof AVM1Error)) {
          caughtError = e;
        } else {
          if (typeof catchTarget === 'string') { // TODO catchIsRegisterFlag?
            scope.asSetPublicProperty(catchTarget, e.error);
          } else {
            registers[catchTarget] = e.error;
          }
          interpretActions(catchBlock, scopeContainer, constantPool, registers);
        }
      }
      currentContext.isTryCatchListening = savedTryCatchState;
      if (finallyBlockFlag) {
        interpretActions(finallyBlock, scopeContainer, constantPool, registers);
      }
      if (caughtError) {
        throw caughtError;
      }
    }

    // SWF 3 actions
    function avm1_0x81_ActionGotoFrame(ectx: ExecutionContext, args: any[]) {
      var _global = ectx.global;

      var frame: number = args[0];
      var play: boolean = args[1];
      if (play) {
        _global.gotoAndPlay(frame + 1);
      } else {
        _global.gotoAndStop(frame + 1);
      }
    }
    function avm1_0x83_ActionGetURL(ectx: ExecutionContext, args: any[]) {
      var _global = ectx.global;

      var urlString: string = args[0];
      var targetString: string = args[1];
      _global.getURL(urlString, targetString);
    }
    function avm1_0x04_ActionNextFrame(ectx: ExecutionContext) {
      var _global = ectx.global;

      _global.nextFrame();
    }
    function avm1_0x05_ActionPreviousFrame(ectx: ExecutionContext) {
      var _global = ectx.global;

      _global.prevFrame();
    }
    function avm1_0x06_ActionPlay(ectx: ExecutionContext) {
      var _global = ectx.global;

      _global.play();
    }
    function avm1_0x07_ActionStop(ectx: ExecutionContext) {
      var _global = ectx.global;

      _global.stop();
    }
    function avm1_0x08_ActionToggleQuality(ectx: ExecutionContext) {
      var _global = ectx.global;

      _global.toggleHighQuality();
    }
    function avm1_0x09_ActionStopSounds(ectx: ExecutionContext) {
      var _global = ectx.global;

      _global.stopAllSounds();
    }
    function avm1_0x8A_ActionWaitForFrame(ectx: ExecutionContext, args: any[]) {
      var _global = ectx.global;

      var frame: number = args[0];
      var count: number = args[1];
      return !_global.ifFrameLoaded(frame);
    }
    function avm1_0x8B_ActionSetTarget(ectx: ExecutionContext, args: any[]) {
      var targetName: string = args[0];
      avm1SetTarget(ectx, targetName);
    }
    function avm1_0x8C_ActionGoToLabel(ectx: ExecutionContext, args: any[]) {
      var _global = ectx.global;

      var label: string = args[0];
      var play: boolean = args[1];
      if (play) {
        _global.gotoAndPlay(label);
      } else {
        _global.gotoAndStop(label);
      }
    }
    // SWF 4 actions
    function avm1_0x96_ActionPush(ectx: ExecutionContext, args: any[]) {
      var registers = ectx.registers;
      var constantPool = ectx.constantPool;
      var stack = ectx.stack;

      args.forEach(function (value) {
        if (value instanceof ParsedPushConstantAction) {
          stack.push(constantPool[(<ParsedPushConstantAction> value).constantIndex]);
        } else if (value instanceof ParsedPushRegisterAction) {
          stack.push(registers[(<ParsedPushRegisterAction> value).registerNumber]);
        } else {
          stack.push(value);
        }
      });
    }
    function avm1_0x17_ActionPop(ectx: ExecutionContext) {
      var stack = ectx.stack;

      stack.pop();
    }
    function avm1_0x0A_ActionAdd(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = as2ToNumber(stack.pop());
      var b = as2ToNumber(stack.pop());
      stack.push(a + b);
    }
    function avm1_0x0B_ActionSubtract(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = as2ToNumber(stack.pop());
      var b = as2ToNumber(stack.pop());
      stack.push(b - a);
    }
    function avm1_0x0C_ActionMultiply(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = as2ToNumber(stack.pop());
      var b = as2ToNumber(stack.pop());
      stack.push(a * b);
    }
    function avm1_0x0D_ActionDivide(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var a = as2ToNumber(stack.pop());
      var b = as2ToNumber(stack.pop());
      var c = b / a;
      stack.push(isSwfVersion5 ? <any>c : isFinite(c) ? <any>c : '#ERROR#');
    }
    function avm1_0x0E_ActionEquals(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var a = as2ToNumber(stack.pop());
      var b = as2ToNumber(stack.pop());
      var f = a == b;
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    function avm1_0x0F_ActionLess(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var a = as2ToNumber(stack.pop());
      var b = as2ToNumber(stack.pop());
      var f = b < a;
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    function avm1_0x10_ActionAnd(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var a = as2ToBoolean(stack.pop());
      var b = as2ToBoolean(stack.pop());
      var f = a && b;
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    function avm1_0x11_ActionOr(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var a = as2ToBoolean(stack.pop());
      var b = as2ToBoolean(stack.pop());
      var f = a || b;
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    function avm1_0x12_ActionNot(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var f = !as2ToBoolean(stack.pop());
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    function avm1_0x13_ActionStringEquals(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var sa = as2ToString(stack.pop());
      var sb = as2ToString(stack.pop());
      var f = sa == sb;
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    function avm1_0x14_ActionStringLength(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var _global = ectx.global;

      var sa = as2ToString(stack.pop());
      stack.push(_global.length(sa));
    }
    function avm1_0x31_ActionMBStringLength(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var _global = ectx.global;

      var sa = as2ToString(stack.pop());
      stack.push(_global.length(sa));
    }
    function avm1_0x21_ActionStringAdd(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var sa = as2ToString(stack.pop());
      var sb = as2ToString(stack.pop());
      stack.push(sb + sa);
    }
    function avm1_0x15_ActionStringExtract(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var _global = ectx.global;

      var count = stack.pop();
      var index = stack.pop();
      var value = as2ToString(stack.pop());
      stack.push(_global.substring(value, index, count));
    }
    function avm1_0x35_ActionMBStringExtract(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var _global = ectx.global;

      var count = stack.pop();
      var index = stack.pop();
      var value = as2ToString(stack.pop());
      stack.push(_global.mbsubstring(value, index, count));
    }
    function avm1_0x29_ActionStringLess(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var sa = as2ToString(stack.pop());
      var sb = as2ToString(stack.pop());
      var f = sb < sa;
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    function avm1_0x18_ActionToInteger(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var _global = ectx.global;

      stack.push(_global.int(stack.pop()));
    }
    function avm1_0x32_ActionCharToAscii(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var _global = ectx.global;

      var ch = stack.pop();
      var charCode = _global.ord(ch);
      stack.push(charCode);
    }
    function avm1_0x36_ActionMBCharToAscii(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var _global = ectx.global;

      var ch = stack.pop();
      var charCode = _global.mbord(ch);
      stack.push(charCode);
    }
    function avm1_0x33_ActionAsciiToChar(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var _global = ectx.global;

      var charCode = +stack.pop();
      var ch = _global.chr(charCode);
      stack.push(ch);
    }
    function avm1_0x37_ActionMBAsciiToChar(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var _global = ectx.global;

      var charCode = +stack.pop();
      var ch = _global.mbchr(charCode);
      stack.push(ch);
    }
    function avm1_0x99_ActionJump(ectx: ExecutionContext, args: any[]) {
      // implemented in the analyzer
    }
    function avm1_0x9D_ActionIf(ectx: ExecutionContext, args: any[]) {
      var stack = ectx.stack;

      var offset: number = args[0];
      return !!stack.pop();
    }
    function avm1_0x9E_ActionCall(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var _global = ectx.global;

      var label = stack.pop();
      _global.call(label);
    }
    function avm1_0x1C_ActionGetVariable(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var variableName = '' + stack.pop();

      var sp = stack.length;
      stack.push(undefined);

      stack[sp] = avm1GetVariable(ectx, variableName);
    }
    function avm1_0x1D_ActionSetVariable(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var value = stack.pop();
      var variableName = '' + stack.pop();
      avm1SetVariable(ectx, variableName, value);
    }
    function avm1_0x9A_ActionGetURL2(ectx: ExecutionContext, args: any[]) {
      var _global = ectx.global;
      var stack = ectx.stack;

      var flags: number = args[0];
      var target = stack.pop();
      var url = stack.pop();
      var sendVarsMethod;
      if (flags & 1) {
        sendVarsMethod = 'GET';
      } else if (flags & 2) {
        sendVarsMethod = 'POST';
      }
      var loadTargetFlag = flags & 1 << 6;
      if (!loadTargetFlag) {
        _global.getURL(url, target, sendVarsMethod);
        return;
      }
      var loadVariablesFlag = flags & 1 << 7;
      if (loadVariablesFlag) {
        _global.loadVariables(url, target, sendVarsMethod);
      } else {
        _global.loadMovie(url, target, sendVarsMethod);
      }
    }
    function avm1_0x9F_ActionGotoFrame2(ectx: ExecutionContext, args: any[]) {
      var _global = ectx.global;
      var stack = ectx.stack;

      var flags: number = args[0];
      var gotoParams = [stack.pop()];
      if (!!(flags & 2)) {
        gotoParams.push(args[1]);
      }
      var gotoMethod = !!(flags & 1) ? _global.gotoAndPlay : _global.gotoAndStop;
      gotoMethod.apply(_global, gotoParams);
    }
    function avm1_0x20_ActionSetTarget2(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var target = stack.pop();
      avm1SetTarget(ectx, target);
    }
    function avm1_0x22_ActionGetProperty(ectx: ExecutionContext) {
      var _global = ectx.global;
      var stack = ectx.stack;

      var index = stack.pop();
      var target = stack.pop();

      var sp = stack.length;
      stack.push(undefined);

      stack[sp] = _global.getAVM1Property(target, index);
    }
    function avm1_0x23_ActionSetProperty(ectx: ExecutionContext) {
      var _global = ectx.global;
      var stack = ectx.stack;

      var value = stack.pop();
      var index = stack.pop();
      var target = stack.pop();
      _global.setAVM1Property(target, index, value);
    }
    function avm1_0x24_ActionCloneSprite(ectx: ExecutionContext) {
      var _global = ectx.global;
      var stack = ectx.stack;

      var depth = stack.pop();
      var target = stack.pop();
      var source = stack.pop();
      _global.duplicateMovieClip(source, target, depth);
    }
    function avm1_0x25_ActionRemoveSprite(ectx: ExecutionContext) {
      var _global = ectx.global;
      var stack = ectx.stack;

      var target = stack.pop();
      _global.removeMovieClip(target);
    }
    function avm1_0x27_ActionStartDrag(ectx: ExecutionContext) {
      var _global = ectx.global;
      var stack = ectx.stack;

      var target = stack.pop();
      var lockcenter = stack.pop();
      var constrain = !stack.pop() ? null : {
        y2: stack.pop(),
        x2: stack.pop(),
        y1: stack.pop(),
        x1: stack.pop()
      };
      var dragParams = [target, lockcenter];
      if (constrain) {
        dragParams = dragParams.concat(constrain.x1, constrain.y1,
          constrain.x2, constrain.y2);
      }
      _global.startDrag.apply(_global, dragParams);
    }
    function avm1_0x28_ActionEndDrag(ectx: ExecutionContext) {
      var _global = ectx.global;

      _global.stopDrag();
    }
    function avm1_0x8D_ActionWaitForFrame2(ectx: ExecutionContext, args: any[]) {
      var _global = ectx.global;
      var stack = ectx.stack;

      var count: number = args[0];
      var frame = stack.pop();
      return !_global.ifFrameLoaded(frame);
    }
    function avm1_0x26_ActionTrace(ectx: ExecutionContext) {
      var _global = ectx.global;
      var stack = ectx.stack;

      var value = stack.pop();
      _global.trace(as2ToString(value));
    }
    function avm1_0x34_ActionGetTime(ectx: ExecutionContext) {
      var _global = ectx.global;
      var stack = ectx.stack;

      stack.push(_global.getTimer());
    }
    function avm1_0x30_ActionRandomNumber(ectx: ExecutionContext) {
      var _global = ectx.global;
      var stack = ectx.stack;

      stack.push(_global.random(stack.pop()));
    }
    // SWF 5
    function avm1_0x3D_ActionCallFunction(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var functionName = stack.pop();
      var args = avm1ReadFunctionArgs(stack);

      var sp = stack.length;
      stack.push(undefined);

      var fn = avm1GetVariable(ectx, functionName);
      // AVM1 simply ignores attempts to invoke non-functions.
      if (!(fn instanceof Function)) {
        avm1Warn("AVM1 warning: function '" + functionName +
                                          (fn ? "' is not callable" : "' is undefined"));
        return;
      }
      release || assert(stack.length === sp + 1);
      stack[sp] = fn.apply(null, args);
    }
    function avm1_0x52_ActionCallMethod(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var methodName = stack.pop();
      var obj = stack.pop();
      var args = avm1ReadFunctionArgs(stack);
      var target;

      var sp = stack.length;
      stack.push(undefined);

      // AVM1 simply ignores attempts to invoke methods on non-existing objects.
      if (isNullOrUndefined(obj)) {
        avm1Warn("AVM1 warning: method '" + methodName + "' can't be called on undefined object");
        return;
      }

      // Per spec, a missing or blank method name causes the container to be treated as
      // a function to call.
      if (isNullOrUndefined(methodName) || methodName === '') {
        if (obj === AVM1_SUPER_STUB) {
          obj = avm1GetVariable(ectx, '__class').__super;
          target = avm1GetVariable(ectx, 'this');
        } else {
          // For non-super calls, we call obj with itself as the target.
          // TODO: ensure this is correct.
          target = obj;
        }
        // AVM1 simply ignores attempts to invoke non-functions.
        if (isFunction(obj)) {
          stack[sp] = obj.apply(target, args);
        } else {
          avm1Warn("AVM1 warning: obj '" + obj + (obj ? "' is not callable" : "' is undefined"));
        }
        release || assert(stack.length === sp + 1);
        return;
      }

      if (obj === AVM1_SUPER_STUB) {
        target = as2GetPrototype(avm1GetVariable(ectx, '__class').__super);
        obj = avm1GetVariable(ectx, 'this');
      } else {
        target = obj;
      }
      var resolvedName = as2ResolveProperty(target, methodName, false);
      var fn = resolvedName && target.asGetPublicProperty(resolvedName);

      // AVM1 simply ignores attempts to invoke non-methods.
      if (!isFunction(fn)) {
        avm1Warn("AVM1 warning: method '" + methodName + "' on object", obj,
                                        (isNullOrUndefined(fn) ?
                                                               "is undefined" :
                                                               "is not callable"));
        return;
      }
      release || assert(stack.length === sp + 1);
      stack[sp] = fn.apply(obj, args);
    }
    function avm1_0x88_ActionConstantPool(ectx: ExecutionContext, args: any[]) {
      var constantPool: any[] = args[0];
      ectx.constantPool = constantPool;
    }
    function avm1_0x9B_ActionDefineFunction(ectx: ExecutionContext, args: any[]) {
      var stack = ectx.stack;
      var scope = ectx.scope;

      var functionBody = args[0];
      var functionName: string = args[1];
      var functionParams: string[] = args[2];

      var fn = avm1DefineFunction(ectx, functionBody, functionName,
        functionParams, 0, null, 0);
      if (functionName) {
        scope.asSetPublicProperty(functionName, fn);
      } else {
        stack.push(fn);
      }
    }
    function avm1_0x3C_ActionDefineLocal(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var scope = ectx.scope;

      var value = stack.pop();
      var name = stack.pop();
      scope.asSetPublicProperty(name, value);
    }
    function avm1_0x41_ActionDefineLocal2(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var scope = ectx.scope;

      var name = stack.pop();
      scope.asSetPublicProperty(name, undefined);
    }
    function avm1_0x3A_ActionDelete(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var name = stack.pop();
      var obj = stack.pop();
      // in some cases we need to cleanup events binding
      obj.asSetPublicProperty(name, undefined);
      stack.push(obj.asDeleteProperty(undefined, name, 0));
    }
    function avm1_0x3B_ActionDelete2(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var name = stack.pop();
      var result = avm1DeleteProperty(ectx, name);
      stack.push(result);
    }
    function avm1_0x46_ActionEnumerate(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var objectName = stack.pop();
      stack.push(null);
      var obj = avm1GetVariable(ectx, objectName);
      // AVM1 just ignores lookups on non-existant containers. We warned in GetVariable already.
      if (isNullOrUndefined(obj)) {
        return;
      }
      as2Enumerate(obj, function (name) {
        stack.push(name);
      }, null);
    }
    function avm1_0x49_ActionEquals2(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = stack.pop();
      var b = stack.pop();
      stack.push(a == b);
    }
    function avm1_0x4E_ActionGetMember(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var name = stack.pop();
      var obj = stack.pop();
      if (name === 'prototype') {
        // special case to track members
        stack.push(as2CreatePrototypeProxy(obj));
      } else {
        var resolvedName = as2ResolveProperty(obj, name, false);
        stack.push(resolvedName === null ? undefined :
          as2GetProperty(obj, resolvedName));
      }
    }
    function avm1_0x42_ActionInitArray(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var obj = avm1ReadFunctionArgs(stack);
      stack.push(obj);
    }
    function avm1_0x43_ActionInitObject(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var count = +stack.pop();
      avm1ValidateArgsCount(count, stack.length >> 1);
      var obj = {};
      for (var i = 0; i < count; i++) {
        var value = stack.pop();
        var name = stack.pop();
        obj.asSetPublicProperty(name, value);
      }
      stack.push(obj);
    }
    function avm1_0x53_ActionNewMethod(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var methodName = stack.pop();
      var obj = stack.pop();
      var args = avm1ReadFunctionArgs(stack);

      var sp = stack.length;
      stack.push(undefined);

      // AVM1 simply ignores attempts to construct methods on non-existing objects.
      if (isNullOrUndefined(obj)) {
        avm1Warn("AVM1 warning: method '" + methodName + "' can't be constructed on undefined object");
        return;
      }

      var ctor;

      // Per spec, a missing or blank method name causes the container to be treated as
      // a function to construct.
      if (isNullOrUndefined(methodName) || methodName === '') {
        ctor = obj;
      } else {
        var resolvedName = as2ResolveProperty(obj, methodName, false);
        ctor = obj.asGetPublicProperty(resolvedName);
      }

      var result = as2Construct(ctor, args);
      if (result === undefined) {
        avm1Warn("AVM1 warning: method '" + methodName + "' on object", obj, "is not constructible");
      }
      stack[sp] = result;
      release || assert(stack.length === sp + 1);
    }
    function avm1_0x40_ActionNewObject(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var objectName = stack.pop();
      var args = avm1ReadFunctionArgs(stack);

      var sp = stack.length;
      stack.push(undefined);

      var obj = avm1GetVariable(ectx, objectName);

      var result = createBuiltinType(obj, args);
      if (result === undefined) {
        // obj in not a built-in type
        result = as2Construct(obj, args);
        if (result === undefined) {
          avm1Warn("AVM1 warning: object '" + objectName +
               (obj ? "' is not constructible" : "' is undefined"));
        }
      }
      release || assert(stack.length === sp + 1);
      stack[sp] = result;
    }
    function avm1_0x4F_ActionSetMember(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var value = stack.pop();
      var name = stack.pop();
      var obj = stack.pop();

      if (isNullOrUndefined(obj)) {
        // AVM1 just ignores sets on non-existant containers
        avm1Warn("AVM1 warning: cannot set member '" + name + "' on undefined object");
        return;
      }

      var resolvedName = as2ResolveProperty(obj, name, true);
      obj.asSetPublicProperty(resolvedName === null ? name : resolvedName, value);
    }
    function avm1_0x45_ActionTargetPath(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var obj = stack.pop();
      stack.push(as2GetType(obj) === 'movieclip' ? obj._target : void(0));
    }
    function avm1_0x94_ActionWith(ectx: ExecutionContext, args: any[]) {
      var stack = ectx.stack;

      var withBody = args[0];
      var obj = stack.pop();

      avm1ProcessWith(ectx, obj, withBody);
    }
    function avm1_0x4A_ActionToNumber(ectx: ExecutionContext) {
      var stack = ectx.stack;

      stack.push(as2ToNumber(stack.pop()));
    }
    function avm1_0x4B_ActionToString(ectx: ExecutionContext) {
      var stack = ectx.stack;

      stack.push(as2ToString(stack.pop()));
    }
    function avm1_0x44_ActionTypeOf(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var obj = stack.pop();
      var result = as2GetType(obj);
      stack.push(result);
    }
    function avm1_0x47_ActionAdd2(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = as2ToAddPrimitive(stack.pop());
      var b = as2ToAddPrimitive(stack.pop());
      if (typeof a === 'string' || typeof b === 'string') {
        stack.push(as2ToString(b) + as2ToString(a));
      } else {
        stack.push(as2ToNumber(b) + as2ToNumber(a));
      }
    }
    function avm1_0x48_ActionLess2(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = stack.pop();
      var b = stack.pop();
      stack.push(as2Compare(b, a));
    }
    function avm1_0x3F_ActionModulo(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = as2ToNumber(stack.pop());
      var b = as2ToNumber(stack.pop());
      stack.push(b % a);
    }
    function avm1_0x60_ActionBitAnd(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = as2ToInt32(stack.pop());
      var b = as2ToInt32(stack.pop());
      stack.push(b & a);
    }
    function avm1_0x63_ActionBitLShift(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = as2ToInt32(stack.pop());
      var b = as2ToInt32(stack.pop());
      stack.push(b << a);
    }
    function avm1_0x61_ActionBitOr(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = as2ToInt32(stack.pop());
      var b = as2ToInt32(stack.pop());
      stack.push(b | a);
    }
    function avm1_0x64_ActionBitRShift(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = as2ToInt32(stack.pop());
      var b = as2ToInt32(stack.pop());
      stack.push(b >> a);
    }
    function avm1_0x65_ActionBitURShift(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = as2ToInt32(stack.pop());
      var b = as2ToInt32(stack.pop());
      stack.push(b >>> a);
    }
    function avm1_0x62_ActionBitXor(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = as2ToInt32(stack.pop());
      var b = as2ToInt32(stack.pop());
      stack.push(b ^ a);
    }
    function avm1_0x51_ActionDecrement(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = as2ToNumber(stack.pop());
      a--;
      stack.push(a);
    }
    function avm1_0x50_ActionIncrement(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = as2ToNumber(stack.pop());
      a++;
      stack.push(a);
    }
    function avm1_0x4C_ActionPushDuplicate(ectx: ExecutionContext) {
      var stack = ectx.stack;

      stack.push(stack[stack.length - 1]);
    }
    function avm1_0x3E_ActionReturn(ectx: ExecutionContext) {
      ectx.isEndOfActions = true;
    }
    function avm1_0x4D_ActionStackSwap(ectx: ExecutionContext) {
      var stack = ectx.stack;

      stack.push(stack.pop(), stack.pop());
    }
    function avm1_0x87_ActionStoreRegister(ectx: ExecutionContext, args: any[]) {
      var stack = ectx.stack;
      var registers = ectx.registers;

      var register: number = args[0];
      registers[register] = stack[stack.length - 1];
    }
    // SWF 6
    function avm1_0x54_ActionInstanceOf(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var constr = stack.pop();
      var obj = stack.pop();
      stack.push(as2InstanceOf(obj, constr));
    }
    function avm1_0x55_ActionEnumerate2(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var obj = stack.pop();
      stack.push(null);

      // AVM1 just ignores lookups on non-existant containers
      if (isNullOrUndefined(obj)) {
        avm1Warn("AVM1 warning: cannot iterate over undefined object");
        return;
      }

      as2Enumerate(obj, function (name) {
        stack.push(name);
      }, null);
    }
    function avm1_0x66_ActionStrictEquals(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = stack.pop();
      var b = stack.pop();
      stack.push(b === a);
    }
    function avm1_0x67_ActionGreater(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = stack.pop();
      var b = stack.pop();
      stack.push(as2Compare(a, b));
    }
    function avm1_0x68_ActionStringGreater(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var sa = as2ToString(stack.pop());
      var sb = as2ToString(stack.pop());
      var f = sb > sa;
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    // SWF 7
    function avm1_0x8E_ActionDefineFunction2(ectx: ExecutionContext, args: any[]) {
      var stack = ectx.stack;
      var scope = ectx.scope;

      var functionBody = args[0];
      var functionName: string = args[1];
      var functionParams: string[] = args[2];
      var registerCount: number = args[3];
      var registerAllocation = args[4];
      var suppressArguments = args[5];

      var fn = avm1DefineFunction(ectx, functionBody, functionName,
        functionParams, registerCount, registerAllocation, suppressArguments);
      if (functionName) {
        scope.asSetPublicProperty(functionName, fn);
      } else {
        stack.push(fn);
      }
    }
    function avm1_0x69_ActionExtends(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var constrSuper = stack.pop();
      var constr = stack.pop();
      var obj = Object.create(constrSuper.traitsPrototype || as2GetPrototype(constrSuper), {
        constructor: { value: constr, enumerable: false }
      });
      constr.__super = constrSuper;
      constr.prototype = obj;
    }
    function avm1_0x2B_ActionCastOp(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var obj =  stack.pop();
      var constr = stack.pop();
      stack.push(as2InstanceOf(obj, constr) ? obj : null);
    }
    function avm1_0x2C_ActionImplementsOp(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var constr = stack.pop();
      var count = +stack.pop();
      avm1ValidateArgsCount(count, stack.length);
      var interfaces = [];
      for (var i = 0; i < count; i++) {
        interfaces.push(stack.pop());
      }
      constr._as2Interfaces = interfaces;
    }
    function avm1_0x8F_ActionTry(ectx: ExecutionContext, args: any[]) {
      var catchIsRegisterFlag: boolean = args[0];
      var catchTarget = args[1];
      var tryBody = args[2];
      var catchBlockFlag: boolean = args[3];
      var catchBody = args[4];
      var finallyBlockFlag: boolean = args[5];
      var finallyBody = args[6];

      avm1ProcessTry(ectx, catchIsRegisterFlag,
        finallyBlockFlag, catchBlockFlag, catchTarget,
        tryBody, catchBody, finallyBody);
    }
    function avm1_0x2A_ActionThrow(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var obj = stack.pop();
      throw new AVM1Error(obj);
    }
    function avm1_0x2D_ActionFSCommand2(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var _global = ectx.global;

      var args = avm1ReadFunctionArgs(stack);

      var sp = stack.length;
      stack.push(undefined);

      var result = _global.fscommand.apply(null, args);
      stack[sp] = result;
    }
    function avm1_0x89_ActionStrictMode(ectx: ExecutionContext, args: any[]) {
      var mode: number = args[0];
    }

    function wrapAvm1Error(fn: Function): Function {
      return function avm1ErrorWrapper(executionContext: ExecutionContext, args: any[]) {
        var currentContext: AVM1ContextImpl;
        try {
          fn(executionContext, args);

          executionContext.recoveringFromError = false;
        } catch (e) {
          // handling AVM1 errors
          currentContext = executionContext.context;
          e = as2CastError(e);
          if (e instanceof AVM1CriticalError) {
            throw e;
          }
          if (e instanceof AVM1Error) {
            throw e;
          }

          Telemetry.instance.reportTelemetry({topic: 'error', error: Telemetry.ErrorTypes.AVM1_ERROR});

          if (!executionContext.recoveringFromError) {
            if (currentContext.errorsIgnored++ >= MAX_AVM1_ERRORS_LIMIT) {
              throw new AVM1CriticalError('long running script -- AVM1 errors limit is reached');
            }
            console.log(typeof e);
            console.log(Object.getPrototypeOf(e));
            console.log(Object.getPrototypeOf(Object.getPrototypeOf(e)));
            console.error('AVM1 error: ' + e);
            var avm2 = Shumway.AVM2.Runtime.AVM2;
            avm2.instance.exceptions.push({source: 'avm1', message: e.message,
              stack: e.stack});
            executionContext.recoveringFromError = true;
          }
        }
      };
    }

    function generateActionCalls() {
      var wrap: Function;
      if (!avm1ErrorsEnabled.value) {
        wrap = wrapAvm1Error;
      } else {
        wrap = function (fn: Function) { return fn; };
      }
      return {
        ActionGotoFrame: wrap(avm1_0x81_ActionGotoFrame),
        ActionGetURL: wrap(avm1_0x83_ActionGetURL),
        ActionNextFrame: wrap(avm1_0x04_ActionNextFrame),
        ActionPreviousFrame: wrap(avm1_0x05_ActionPreviousFrame),
        ActionPlay: wrap(avm1_0x06_ActionPlay),
        ActionStop: wrap(avm1_0x07_ActionStop),
        ActionToggleQuality: wrap(avm1_0x08_ActionToggleQuality),
        ActionStopSounds: wrap(avm1_0x09_ActionStopSounds),
        ActionWaitForFrame: wrap(avm1_0x8A_ActionWaitForFrame),
        ActionSetTarget: wrap(avm1_0x8B_ActionSetTarget),
        ActionGoToLabel: wrap(avm1_0x8C_ActionGoToLabel),
        ActionPush: wrap(avm1_0x96_ActionPush),
        ActionPop: wrap(avm1_0x17_ActionPop),
        ActionAdd: wrap(avm1_0x0A_ActionAdd),
        ActionSubtract: wrap(avm1_0x0B_ActionSubtract),
        ActionMultiply: wrap(avm1_0x0C_ActionMultiply),
        ActionDivide: wrap(avm1_0x0D_ActionDivide),
        ActionEquals: wrap(avm1_0x0E_ActionEquals),
        ActionLess: wrap(avm1_0x0F_ActionLess),
        ActionAnd: wrap(avm1_0x10_ActionAnd),
        ActionOr: wrap(avm1_0x11_ActionOr),
        ActionNot: wrap(avm1_0x12_ActionNot),
        ActionStringEquals: wrap(avm1_0x13_ActionStringEquals),
        ActionStringLength: wrap(avm1_0x14_ActionStringLength),
        ActionMBStringLength: wrap(avm1_0x31_ActionMBStringLength),
        ActionStringAdd: wrap(avm1_0x21_ActionStringAdd),
        ActionStringExtract: wrap(avm1_0x15_ActionStringExtract),
        ActionMBStringExtract: wrap(avm1_0x35_ActionMBStringExtract),
        ActionStringLess: wrap(avm1_0x29_ActionStringLess),
        ActionToInteger: wrap(avm1_0x18_ActionToInteger),
        ActionCharToAscii: wrap(avm1_0x32_ActionCharToAscii),
        ActionMBCharToAscii: wrap(avm1_0x36_ActionMBCharToAscii),
        ActionAsciiToChar: wrap(avm1_0x33_ActionAsciiToChar),
        ActionMBAsciiToChar: wrap(avm1_0x37_ActionMBAsciiToChar),
        ActionJump: wrap(avm1_0x99_ActionJump),
        ActionIf: wrap(avm1_0x9D_ActionIf),
        ActionCall: wrap(avm1_0x9E_ActionCall),
        ActionGetVariable: wrap(avm1_0x1C_ActionGetVariable),
        ActionSetVariable: wrap(avm1_0x1D_ActionSetVariable),
        ActionGetURL2: wrap(avm1_0x9A_ActionGetURL2),
        ActionGotoFrame2: wrap(avm1_0x9F_ActionGotoFrame2),
        ActionSetTarget2: wrap(avm1_0x20_ActionSetTarget2),
        ActionGetProperty: wrap(avm1_0x22_ActionGetProperty),
        ActionSetProperty: wrap(avm1_0x23_ActionSetProperty),
        ActionCloneSprite: wrap(avm1_0x24_ActionCloneSprite),
        ActionRemoveSprite: wrap(avm1_0x25_ActionRemoveSprite),
        ActionStartDrag: wrap(avm1_0x27_ActionStartDrag),
        ActionEndDrag: wrap(avm1_0x28_ActionEndDrag),
        ActionWaitForFrame2: wrap(avm1_0x8D_ActionWaitForFrame2),
        ActionTrace: wrap(avm1_0x26_ActionTrace),
        ActionGetTime: wrap(avm1_0x34_ActionGetTime),
        ActionRandomNumber: wrap(avm1_0x30_ActionRandomNumber),
        ActionCallFunction: wrap(avm1_0x3D_ActionCallFunction),
        ActionCallMethod: wrap(avm1_0x52_ActionCallMethod),
        ActionConstantPool: wrap(avm1_0x88_ActionConstantPool),
        ActionDefineFunction: wrap(avm1_0x9B_ActionDefineFunction),
        ActionDefineLocal: wrap(avm1_0x3C_ActionDefineLocal),
        ActionDefineLocal2: wrap(avm1_0x41_ActionDefineLocal2),
        ActionDelete: wrap(avm1_0x3A_ActionDelete),
        ActionDelete2: wrap(avm1_0x3B_ActionDelete2),
        ActionEnumerate: wrap(avm1_0x46_ActionEnumerate),
        ActionEquals2: wrap(avm1_0x49_ActionEquals2),
        ActionGetMember: wrap(avm1_0x4E_ActionGetMember),
        ActionInitArray: wrap(avm1_0x42_ActionInitArray),
        ActionInitObject: wrap(avm1_0x43_ActionInitObject),
        ActionNewMethod: wrap(avm1_0x53_ActionNewMethod),
        ActionNewObject: wrap(avm1_0x40_ActionNewObject),
        ActionSetMember: wrap(avm1_0x4F_ActionSetMember),
        ActionTargetPath: wrap(avm1_0x45_ActionTargetPath),
        ActionWith: wrap(avm1_0x94_ActionWith),
        ActionToNumber: wrap(avm1_0x4A_ActionToNumber),
        ActionToString: wrap(avm1_0x4B_ActionToString),
        ActionTypeOf: wrap(avm1_0x44_ActionTypeOf),
        ActionAdd2: wrap(avm1_0x47_ActionAdd2),
        ActionLess2: wrap(avm1_0x48_ActionLess2),
        ActionModulo: wrap(avm1_0x3F_ActionModulo),
        ActionBitAnd: wrap(avm1_0x60_ActionBitAnd),
        ActionBitLShift: wrap(avm1_0x63_ActionBitLShift),
        ActionBitOr: wrap(avm1_0x61_ActionBitOr),
        ActionBitRShift: wrap(avm1_0x64_ActionBitRShift),
        ActionBitURShift: wrap(avm1_0x65_ActionBitURShift),
        ActionBitXor: wrap(avm1_0x62_ActionBitXor),
        ActionDecrement: wrap(avm1_0x51_ActionDecrement),
        ActionIncrement: wrap(avm1_0x50_ActionIncrement),
        ActionPushDuplicate: wrap(avm1_0x4C_ActionPushDuplicate),
        ActionReturn: wrap(avm1_0x3E_ActionReturn),
        ActionStackSwap: wrap(avm1_0x4D_ActionStackSwap),
        ActionStoreRegister: wrap(avm1_0x87_ActionStoreRegister),
        ActionInstanceOf: wrap(avm1_0x54_ActionInstanceOf),
        ActionEnumerate2: wrap(avm1_0x55_ActionEnumerate2),
        ActionStrictEquals: wrap(avm1_0x66_ActionStrictEquals),
        ActionGreater: wrap(avm1_0x67_ActionGreater),
        ActionStringGreater: wrap(avm1_0x68_ActionStringGreater),
        ActionDefineFunction2: wrap(avm1_0x8E_ActionDefineFunction2),
        ActionExtends: wrap(avm1_0x69_ActionExtends),
        ActionCastOp: wrap(avm1_0x2B_ActionCastOp),
        ActionImplementsOp: wrap(avm1_0x2C_ActionImplementsOp),
        ActionTry: wrap(avm1_0x8F_ActionTry),
        ActionThrow: wrap(avm1_0x2A_ActionThrow),
        ActionFSCommand2: wrap(avm1_0x2D_ActionFSCommand2),
        ActionStrictMode: wrap(avm1_0x89_ActionStrictMode)
      };
    }

    function interpretAction(executionContext: ExecutionContext, parsedAction: ParsedAction): boolean {
      var stack = executionContext.stack;

      var actionCode: number = parsedAction.actionCode;
      var args: any[] = parsedAction.args;

      var actionTracer = executionContext.actionTracer;
      actionTracer.print(parsedAction, stack);

      var shallBranch = false;
      switch (actionCode | 0) {
        // SWF 3 actions
        case ActionCode.ActionGotoFrame:
          avm1_0x81_ActionGotoFrame(executionContext, args);
          break;
        case ActionCode.ActionGetURL:
          avm1_0x83_ActionGetURL(executionContext, args);
          break;
        case ActionCode.ActionNextFrame:
          avm1_0x04_ActionNextFrame(executionContext);
          break;
        case ActionCode.ActionPreviousFrame:
          avm1_0x05_ActionPreviousFrame(executionContext);
          break;
        case ActionCode.ActionPlay:
          avm1_0x06_ActionPlay(executionContext);
          break;
        case ActionCode.ActionStop:
          avm1_0x07_ActionStop(executionContext);
          break;
        case ActionCode.ActionToggleQuality:
          avm1_0x08_ActionToggleQuality(executionContext);
          break;
        case ActionCode.ActionStopSounds:
          avm1_0x09_ActionStopSounds(executionContext);
          break;
        case ActionCode.ActionWaitForFrame:
          shallBranch = avm1_0x8A_ActionWaitForFrame(executionContext, args);
          break;
        case ActionCode.ActionSetTarget:
          avm1_0x8B_ActionSetTarget(executionContext, args);
          break;
        case ActionCode.ActionGoToLabel:
          avm1_0x8C_ActionGoToLabel(executionContext, args);
          break;
        // SWF 4 actions
        case ActionCode.ActionPush:
          avm1_0x96_ActionPush(executionContext, args);
          break;
        case ActionCode.ActionPop:
          avm1_0x17_ActionPop(executionContext);
          break;
        case ActionCode.ActionAdd:
          avm1_0x0A_ActionAdd(executionContext);
          break;
        case ActionCode.ActionSubtract:
          avm1_0x0B_ActionSubtract(executionContext);
          break;
        case ActionCode.ActionMultiply:
          avm1_0x0C_ActionMultiply(executionContext);
          break;
        case ActionCode.ActionDivide:
          avm1_0x0D_ActionDivide(executionContext);
          break;
        case ActionCode.ActionEquals:
          avm1_0x0E_ActionEquals(executionContext);
          break;
        case ActionCode.ActionLess:
          avm1_0x0F_ActionLess(executionContext);
          break;
        case ActionCode.ActionAnd:
          avm1_0x10_ActionAnd(executionContext);
          break;
        case ActionCode.ActionOr:
          avm1_0x11_ActionOr(executionContext);
          break;
        case ActionCode.ActionNot:
          avm1_0x12_ActionNot(executionContext);
          break;
        case ActionCode.ActionStringEquals:
          avm1_0x13_ActionStringEquals(executionContext);
          break;
        case ActionCode.ActionStringLength:
          avm1_0x14_ActionStringLength(executionContext);
          break;
        case ActionCode.ActionMBStringLength:
          avm1_0x31_ActionMBStringLength(executionContext);
          break;
        case ActionCode.ActionStringAdd:
          avm1_0x21_ActionStringAdd(executionContext);
          break;
        case ActionCode.ActionStringExtract:
          avm1_0x15_ActionStringExtract(executionContext);
          break;
        case ActionCode.ActionMBStringExtract:
          avm1_0x35_ActionMBStringExtract(executionContext);
          break;
        case ActionCode.ActionStringLess:
          avm1_0x29_ActionStringLess(executionContext);
          break;
        case ActionCode.ActionToInteger:
          avm1_0x18_ActionToInteger(executionContext);
          break;
        case ActionCode.ActionCharToAscii:
          avm1_0x32_ActionCharToAscii(executionContext);
          break;
        case ActionCode.ActionMBCharToAscii:
          avm1_0x36_ActionMBCharToAscii(executionContext);
          break;
        case ActionCode.ActionAsciiToChar:
          avm1_0x33_ActionAsciiToChar(executionContext);
          break;
        case ActionCode.ActionMBAsciiToChar:
          avm1_0x37_ActionMBAsciiToChar(executionContext);
          break;
        case ActionCode.ActionJump:
          avm1_0x99_ActionJump(executionContext, args);
          break;
        case ActionCode.ActionIf:
          shallBranch = avm1_0x9D_ActionIf(executionContext, args);
          break;
        case ActionCode.ActionCall:
          avm1_0x9E_ActionCall(executionContext);
          break;
        case ActionCode.ActionGetVariable:
          avm1_0x1C_ActionGetVariable(executionContext);
          break;
        case ActionCode.ActionSetVariable:
          avm1_0x1D_ActionSetVariable(executionContext);
          break;
        case ActionCode.ActionGetURL2:
          avm1_0x9A_ActionGetURL2(executionContext, args);
          break;
        case ActionCode.ActionGotoFrame2:
          avm1_0x9F_ActionGotoFrame2(executionContext, args);
          break;
        case ActionCode.ActionSetTarget2:
          avm1_0x20_ActionSetTarget2(executionContext);
          break;
        case ActionCode.ActionGetProperty:
          avm1_0x22_ActionGetProperty(executionContext);
          break;
        case ActionCode.ActionSetProperty:
          avm1_0x23_ActionSetProperty(executionContext);
          break;
        case ActionCode.ActionCloneSprite:
          avm1_0x24_ActionCloneSprite(executionContext);
          break;
        case ActionCode.ActionRemoveSprite:
          avm1_0x25_ActionRemoveSprite(executionContext);
          break;
        case ActionCode.ActionStartDrag:
          avm1_0x27_ActionStartDrag(executionContext);
          break;
        case ActionCode.ActionEndDrag:
          avm1_0x28_ActionEndDrag(executionContext);
          break;
        case ActionCode.ActionWaitForFrame2:
          shallBranch = avm1_0x8D_ActionWaitForFrame2(executionContext, args);
          break;
        case ActionCode.ActionTrace:
          avm1_0x26_ActionTrace(executionContext);
          break;
        case ActionCode.ActionGetTime:
          avm1_0x34_ActionGetTime(executionContext);
          break;
        case ActionCode.ActionRandomNumber:
          avm1_0x30_ActionRandomNumber(executionContext);
          break;
        // SWF 5
        case ActionCode.ActionCallFunction:
          avm1_0x3D_ActionCallFunction(executionContext);
          break;
        case ActionCode.ActionCallMethod:
          avm1_0x52_ActionCallMethod(executionContext);
          break;
        case ActionCode.ActionConstantPool:
          avm1_0x88_ActionConstantPool(executionContext, args);
          break;
        case ActionCode.ActionDefineFunction:
          avm1_0x9B_ActionDefineFunction(executionContext, args);
          break;
        case ActionCode.ActionDefineLocal:
          avm1_0x3C_ActionDefineLocal(executionContext);
          break;
        case ActionCode.ActionDefineLocal2:
          avm1_0x41_ActionDefineLocal2(executionContext);
          break;
        case ActionCode.ActionDelete:
          avm1_0x3A_ActionDelete(executionContext);
          break;
        case ActionCode.ActionDelete2:
          avm1_0x3B_ActionDelete2(executionContext);
          break;
        case ActionCode.ActionEnumerate:
          avm1_0x46_ActionEnumerate(executionContext);
          break;
        case ActionCode.ActionEquals2:
          avm1_0x49_ActionEquals2(executionContext);
          break;
        case ActionCode.ActionGetMember:
          avm1_0x4E_ActionGetMember(executionContext);
          break;
        case ActionCode.ActionInitArray:
          avm1_0x42_ActionInitArray(executionContext);
          break;
        case ActionCode.ActionInitObject:
          avm1_0x43_ActionInitObject(executionContext);
          break;
        case ActionCode.ActionNewMethod:
          avm1_0x53_ActionNewMethod(executionContext);
          break;
        case ActionCode.ActionNewObject:
          avm1_0x40_ActionNewObject(executionContext);
          break;
        case ActionCode.ActionSetMember:
          avm1_0x4F_ActionSetMember(executionContext);
          break;
        case ActionCode.ActionTargetPath:
          avm1_0x45_ActionTargetPath(executionContext);
          break;
        case ActionCode.ActionWith:
          avm1_0x94_ActionWith(executionContext, args);
          break;
        case ActionCode.ActionToNumber:
          avm1_0x4A_ActionToNumber(executionContext);
          break;
        case ActionCode.ActionToString:
          avm1_0x4B_ActionToString(executionContext);
          break;
        case ActionCode.ActionTypeOf:
          avm1_0x44_ActionTypeOf(executionContext);
          break;
        case ActionCode.ActionAdd2:
          avm1_0x47_ActionAdd2(executionContext);
          break;
        case ActionCode.ActionLess2:
          avm1_0x48_ActionLess2(executionContext);
          break;
        case ActionCode.ActionModulo:
          avm1_0x3F_ActionModulo(executionContext);
          break;
        case ActionCode.ActionBitAnd:
          avm1_0x60_ActionBitAnd(executionContext);
          break;
        case ActionCode.ActionBitLShift:
          avm1_0x63_ActionBitLShift(executionContext);
          break;
        case ActionCode.ActionBitOr:
          avm1_0x61_ActionBitOr(executionContext);
          break;
        case ActionCode.ActionBitRShift:
          avm1_0x64_ActionBitRShift(executionContext);
          break;
        case ActionCode.ActionBitURShift:
          avm1_0x65_ActionBitURShift(executionContext);
          break;
        case ActionCode.ActionBitXor:
          avm1_0x62_ActionBitXor(executionContext);
          break;
        case ActionCode.ActionDecrement:
          avm1_0x51_ActionDecrement(executionContext);
          break;
        case ActionCode.ActionIncrement:
          avm1_0x50_ActionIncrement(executionContext);
          break;
        case ActionCode.ActionPushDuplicate:
          avm1_0x4C_ActionPushDuplicate(executionContext);
          break;
        case ActionCode.ActionReturn:
          avm1_0x3E_ActionReturn(executionContext);
          break;
        case ActionCode.ActionStackSwap:
          avm1_0x4D_ActionStackSwap(executionContext);
          break;
        case ActionCode.ActionStoreRegister:
          avm1_0x87_ActionStoreRegister(executionContext, args);
          break;
        // SWF 6
        case ActionCode.ActionInstanceOf:
          avm1_0x54_ActionInstanceOf(executionContext);
          break;
        case ActionCode.ActionEnumerate2:
          avm1_0x55_ActionEnumerate2(executionContext);
          break;
        case ActionCode.ActionStrictEquals:
          avm1_0x66_ActionStrictEquals(executionContext);
          break;
        case ActionCode.ActionGreater:
          avm1_0x67_ActionGreater(executionContext);
          break;
        case ActionCode.ActionStringGreater:
          avm1_0x68_ActionStringGreater(executionContext);
          break;
        // SWF 7
        case ActionCode.ActionDefineFunction2:
          avm1_0x8E_ActionDefineFunction2(executionContext, args);
          break;
        case ActionCode.ActionExtends:
          avm1_0x69_ActionExtends(executionContext);
          break;
        case ActionCode.ActionCastOp:
          avm1_0x2B_ActionCastOp(executionContext);
          break;
        case ActionCode.ActionImplementsOp:
          avm1_0x2C_ActionImplementsOp(executionContext);
          break;
        case ActionCode.ActionTry:
          avm1_0x8F_ActionTry(executionContext, args);
          break;
        case ActionCode.ActionThrow:
          avm1_0x2A_ActionThrow(executionContext);
          break;
        // Not documented by the spec
        case ActionCode.ActionFSCommand2:
          avm1_0x2D_ActionFSCommand2(executionContext);
          break;
        case ActionCode.ActionStrictMode:
          avm1_0x89_ActionStrictMode(executionContext, args);
          break;
        case ActionCode.None: // End of actions
          executionContext.isEndOfActions = true;
          break;
        default:
          throw new Error('Unknown action code: ' + actionCode);
      }
      return shallBranch;
    }

    function interpretActionWithRecovery(executionContext: ExecutionContext,
                                         parsedAction: ParsedAction): boolean {
      var currentContext: AVM1ContextImpl;
      var result;
      try {
        result = interpretAction(executionContext, parsedAction);

        executionContext.recoveringFromError = false;

      } catch (e) {
        // handling AVM1 errors
        currentContext = executionContext.context;
        e = as2CastError(e);
        if ((avm1ErrorsEnabled.value && !currentContext.isTryCatchListening) ||
          e instanceof AVM1CriticalError) {
          throw e;
        }
        if (e instanceof AVM1Error) {
          throw e;
        }

        Telemetry.instance.reportTelemetry({topic: 'error', error: Telemetry.ErrorTypes.AVM1_ERROR});

        if (!executionContext.recoveringFromError) {
          if (currentContext.errorsIgnored++ >= MAX_AVM1_ERRORS_LIMIT) {
            throw new AVM1CriticalError('long running script -- AVM1 errors limit is reached');
          }
          console.error('AVM1 error: ' + e);
          var avm2 = Shumway.AVM2.Runtime.AVM2;
          avm2.instance.exceptions.push({source: 'avm1', message: e.message,
            stack: e.stack});
          executionContext.recoveringFromError = true;
        }
      }
      return result;
    }

    function interpretActions(actionsData: AVM1ActionsData, scopeContainer, constantPool, registers) {
      var currentContext = <AVM1ContextImpl> AVM1Context.instance;

      if (!actionsData.ir) {
        var stream = new ActionsDataStream(actionsData.bytes, currentContext.loaderInfo.swfVersion);
        var parser = new ActionsDataParser(stream);
        parser.dataId = actionsData.id;
        var analyzer = new ActionsDataAnalyzer();
        actionsData.ir = analyzer.analyze(parser);

        if (avm1CompilerEnabled.value) {
          try {
            var c = new ActionsDataCompiler();
            (<any> actionsData.ir).compiled = c.generate(actionsData.ir);
          } catch (e) {
            console.error('Unable to compile AVM1 function: ' + e);
          }
        }
      }
      var ir: AnalyzerResults = actionsData.ir;
      var compiled: Function = (<any> ir).compiled;

      var stack = [];
      var isSwfVersion5 = currentContext.loaderInfo.swfVersion >= 5;
      var actionTracer = ActionTracerFactory.get();
      var scope = scopeContainer.scope;

      var executionContext = {
        context: currentContext,
        global: currentContext.globals,
        scopeContainer: scopeContainer,
        scope: scope,
        actionTracer: actionTracer,
        constantPool: constantPool,
        registers: registers,
        stack: stack,
        isSwfVersion5: isSwfVersion5,
        recoveringFromError: false,
        isEndOfActions: false
      };

      if (scope._nativeAS3Object &&
          scope._nativeAS3Object._deferScriptExecution) {
        currentContext.deferScriptExecution = true;
      }

      if (compiled) {
        return compiled(executionContext);
      }

      var instructionsExecuted = 0;
      var abortExecutionAt = currentContext.abortExecutionAt;

      if (avm1DebuggerEnabled.value &&
          (Debugger.pause || Debugger.breakpoints[ir.dataId])) {
        debugger;
      }

      var position = 0;
      var nextAction: ActionCodeBlockItem = ir.actions[position];
      // will try again if we are skipping errors
      while (nextAction && !executionContext.isEndOfActions) {
        // let's check timeout/Date.now every some number of instructions
        if (instructionsExecuted++ % CHECK_AVM1_HANG_EVERY === 0 && Date.now() >= abortExecutionAt) {
          throw new AVM1CriticalError('long running script -- AVM1 instruction hang timeout');
        }

        var shallBranch: boolean = interpretActionWithRecovery(executionContext, nextAction.action);
        if (shallBranch) {
          position = nextAction.conditionalJumpTo;
        } else {
          position = nextAction.next;
        }
        nextAction = ir.actions[position];
      }
      return stack.pop();
    }

  // Bare-minimum JavaScript code generator to make debugging better.
  class ActionsDataCompiler {
    static cachedCalls;
    constructor() {
      if (!ActionsDataCompiler.cachedCalls) {
        ActionsDataCompiler.cachedCalls = generateActionCalls();
      }
    }
    private convertArgs(args: any[], id: number, res): string {
      var parts: string[] = [];
      for (var i: number = 0; i < args.length; i++) {
        var arg = args[i];
        if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
          if (arg instanceof ParsedPushConstantAction) {
            var hint = '';
            var currentConstantPool = res.constantPool;
            if (currentConstantPool) {
              var constant = currentConstantPool[(<ParsedPushConstantAction> arg).constantIndex];
              hint = constant === undefined ? 'undefined' : JSON.stringify(constant);
              // preventing code breakage due to bad constant
              hint = hint.indexOf('*/') >= 0 ? '' : ' /* ' + hint + ' */';
            }
            parts.push('constantPool[' + (<ParsedPushConstantAction> arg).constantIndex + ']' + hint);
          } else if (arg instanceof ParsedPushRegisterAction) {
            parts.push('registers[' + (<ParsedPushRegisterAction> arg).registerNumber + ']');
          } else if (arg instanceof AVM1ActionsData) {
            var resName = 'code_' + id + '_' + i;
            res[resName] = arg;
            parts.push('res.' + resName);
          } else {
            notImplemented('Unknown AVM1 action argument type');
          }
        } else if (arg === undefined) {
          parts.push('undefined'); // special case
        } else {
          parts.push(JSON.stringify(arg));
        }
      }
      return parts.join(',');
    }
    private convertAction(item: ActionCodeBlockItem, id: number, res, indexInBlock: number): string {
      switch (item.action.actionCode) {
        case ActionCode.ActionJump:
        case ActionCode.ActionReturn:
          return '';
        case ActionCode.ActionConstantPool:
          res.constantPool = item.action.args[0];
          return '  constantPool = [' + this.convertArgs(item.action.args[0], id, res) + '];\n' +
                 '  ectx.constantPool = constantPool;\n';
        case ActionCode.ActionPush:
          return '  stack.push(' + this.convertArgs(item.action.args, id, res) + ');\n';
        case ActionCode.ActionStoreRegister:
          return '  registers[' + item.action.args[0] + '] = stack[stack.length - 1];\n';
        case ActionCode.ActionWaitForFrame:
        case ActionCode.ActionWaitForFrame2:
          return '  if (calls.' + item.action.actionName + '(ectx,[' +
            this.convertArgs(item.action.args, id, res) + '])) { position = ' + item.conditionalJumpTo + '; ' +
            'checkTimeAfter -= ' + (indexInBlock + 1) + '; break; }\n';
        case ActionCode.ActionIf:
          return '  if (!!stack.pop()) { position = ' + item.conditionalJumpTo + '; ' +
            'checkTimeAfter -= ' + (indexInBlock + 1) + '; break; }\n';
        default:
          var result = '  calls.' + item.action.actionName + '(ectx' +
            (item.action.args ? ',[' + this.convertArgs(item.action.args, id, res) + ']' : '') +
            ');\n';
          return result;
      }
    }
    private checkAvm1Timeout(ectx: ExecutionContext) {
      if (Date.now() >= ectx.context.abortExecutionAt) {
        throw new AVM1CriticalError('long running script -- AVM1 instruction hang timeout');
      }
    }
    generate(ir: AnalyzerResults): Function {
      var blocks = ir.blocks;
      var res = {};
      var uniqueId = 0;
      var debugName = ir.dataId;
      var fn = 'return function avm1gen_' + debugName + '(ectx) {\n' +
        'var position = 0;\n' +
        'var checkTimeAfter = 0;\n' +
        'var constantPool = ectx.constantPool, registers = ectx.registers, stack = ectx.stack;\n';
      if (avm1DebuggerEnabled.value) {
        fn += '/* Running ' + debugName + ' */ ' +
          'if (Shumway.AVM1.Debugger.pause || Shumway.AVM1.Debugger.breakpoints.' +
          debugName + ') { debugger; }\n'
      }
      fn += 'while (!ectx.isEndOfActions) {\n' +
        'if (checkTimeAfter <= 0) { checkTimeAfter = ' + CHECK_AVM1_HANG_EVERY + '; checkTimeout(ectx); }\n' +
        'switch(position) {\n';
        blocks.forEach((b: ActionCodeBlock) => {
          fn += ' case ' + b.label + ':\n';
          b.items.forEach((item: ActionCodeBlockItem, index: number) => {
            fn += this.convertAction(item, uniqueId++, res, index);
          });
          fn += '  position = ' + b.jump + ';\n' +
                '  checkTimeAfter -= ' + b.items.length + ';\n' +
                '  break;\n'
        });
      fn += ' default: ectx.isEndOfActions = true; break;\n}\n}\n' +
        'return stack.pop();};';
      return (new Function ('calls', 'res', 'checkTimeout', fn))(
        ActionsDataCompiler.cachedCalls, res, this.checkAvm1Timeout);
    }
  }

  interface ActionTracer {
    print: (parsedAction: ParsedAction, stack: any[]) => void;
    indent: () => void;
    unindent: () => void;
    message: (msg: string) => void;
  }

  class ActionTracerFactory {
    private static tracer : ActionTracer = (
      () => {
        var indentation = 0;
        return {
          print: function(parsedAction: ParsedAction, stack: any[]) {
            var position: number = parsedAction.position;
            var actionCode: number = parsedAction.actionCode;
            var actionName: string = parsedAction.actionName;
            var stackDump = [];
            for(var q = 0; q < stack.length; q++) {
              var item = stack[q];
              stackDump.push(item && typeof item === 'object' ?
                '[' + (item.constructor && item.constructor.name ? item.constructor.name : 'Object') + ']' : item);
            }

            var indent = new Array(indentation + 1).join('..');

            console.log('AVM1 trace: ' + indent + position + ': ' +
              actionName + '(' + actionCode.toString(16) + '), ' +
              'stack=' + stackDump);
          },
          indent: function() {
            indentation++;
          },
          unindent: function() {
            indentation--;
          },
          message: function(msg: string) {
            console.log('AVM1 trace: ------- ' + msg);
          }
        };
      }
    )();

    private static nullTracer : ActionTracer = {
      print: function(parsedAction: ParsedAction, stack: any[]) {},
      indent: function() {},
      unindent: function() {},
      message: function(msg: string) {}
    };

    static get(): ActionTracer {
      return avm1TraceEnabled.value ?
        ActionTracerFactory.tracer :
        ActionTracerFactory.nullTracer;
    }
  }

}
