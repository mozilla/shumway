/*
 * Copyright 2013 Mozilla Foundation
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

declare module avm1lib {
  export class AS2Globals {
    constructor();
    getURL(url: string, target, method?: string);
    nextFrame();
    prevFrame();
    play();
    stop();
    toggleHighQuality();
    stopAllSounds();
    ifFrameLoaded(scene, frame?): boolean;
    gotoLabel(label);
    length(s): number;
    substring(s: string, index: number, count: number): string;
    mbsubstring(s: string, index: number, count: number): string;
    int(obj): number;
    chr(code: number): string;
    mbchr(code: number): string;
    ord(ch: string): number;
    mbord(ch: string): number;
    call(frame: number);
    loadVariables(url: string, target, method);
    loadMovie(url:string, target, method);
    gotoAndPlay();
    gotoAndStop();
    getAS2Property(target, index: number);
    setAS2Property(target, index:number, value);
    duplicateMovieClip(target, newname: string, depth: number);
    removeMovieClip(target);
    startDrag();
    stopDrag();
    trace(msg);
    getTimer();
    random(max: number);
    fscommand();
  }
  export class AS2MovieClip {
    $lookupChild(path: string): AS2MovieClip;
  }
}

module Shumway.AVM1 {
  import ActionsDataStream = Shumway.AVM1.ActionsDataStream;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import forEachPublicProperty = Shumway.AVM2.Runtime.forEachPublicProperty;
  import construct = Shumway.AVM2.Runtime.construct;
  import isNumeric = Shumway.isNumeric;
  import notImplemented = Shumway.Debug.notImplemented;
  import Option = Shumway.Options.Option;
  import OptionSet = Shumway.Options.OptionSet;


  declare var avm2;
  declare var Proxy;

  declare class TelemetryService {
    static reportTelemetry(data);
  }

  declare class Error {
    constructor(obj: string);
  }

  declare var systemOptions: OptionSet;

  var avm1Options = systemOptions.register(new OptionSet("AVM1 Options"));
  export var avm1TraceEnabled = avm1Options.register(new Option("t1", "traceAvm1", "boolean", false, "trace AVM1 execution"));
  export var avm1ErrorsEnabled = avm1Options.register(new Option("e1", "errorsAvm1", "boolean", false, "fail on AVM1 errors"));

  var MAX_AVM1_HANG_TIMEOUT = 1000;
  var MAX_AVM1_ERRORS_LIMIT = 1000;
  var MAX_AVM1_STACK_LIMIT = 256;

  class AS2ScopeListItem {
    constructor(public scope, public next?: AS2ScopeListItem) {
    }
    create(scope) {
      return new AS2ScopeListItem(scope, this);
    }
  }

  export class AS2Context {
    public static instance: AS2Context = null;
    public stage;
    public classes;
    public globals: avm1lib.AS2Globals;
    constructor() {}
    public static create(swfVersion: number): AS2Context {
      return new AS2ContextImpl(swfVersion);
    }
    public flushPendingScripts() {}
    public addAsset(className: string, symbolProps) {}
    public getAsset(className: string) {}
    public resolveTarget(target) {}
    public resolveLevel(level: number) {}
    public addToPendingScripts(fn) {}
  }

  class AS2ContextImpl extends AS2Context {
    swfVersion: number;
    initialScope: AS2ScopeListItem;
    assets;
    isActive: boolean;
    executionProhibited: boolean;
    abortExecutionAt: number;
    stackDepth: number;
    isTryCatchListening: boolean;
    errorsIgnored: number;
    deferScriptExecution: boolean;
    pendingScripts;
    defaultTarget;
    constructor(swfVersion: number) {
      super();
      this.swfVersion = swfVersion;
      this.globals = new avm1lib.AS2Globals();
      this.initialScope = new AS2ScopeListItem(this.globals, null);
      this.assets = {};
      this.isActive = false;
      this.executionProhibited = false;
      this.abortExecutionAt = 0;
      this.stackDepth = 0;
      this.isTryCatchListening = false;
      this.errorsIgnored = 0;
      this.deferScriptExecution = true;
      this.pendingScripts = [];
    }
    addAsset(className: string, symbolProps) {
      this.assets[className] = symbolProps;
    }
    getAsset(className: string) {
      return this.assets[className];
    }
    resolveTarget(target) {
      if (!target) {
        target = this.defaultTarget;
      } else if (typeof target === 'string') {
        target = lookupAS2Children(target, this.defaultTarget,
          this.globals.asGetPublicProperty('_root'));
      }
      if (typeof target !== 'object' || target === null ||
        !('$nativeObject' in target)) {
        throw new Error('Invalid AS2 target object: ' +
          Object.prototype.toString.call(target));
      }

      return target;
    }
    resolveLevel(level: number) {
      return this.resolveTarget(this.globals['_level' + level]);
    }
    addToPendingScripts(fn) {
      if (!this.deferScriptExecution) {
        return fn();
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
  }

  class AS2Error {
    constructor(public error) {}
  }

  class AS2CriticalError extends Error  {
    constructor(message: string, public error?) {
      super(message)
    }
  }

  function isAS2MovieClip(obj) {
    return typeof obj === 'object' && obj &&
      obj instanceof avm1lib.AS2MovieClip;
  }

  function as2GetType(v) {
    if (v === null) {
      return 'null';
    }

    var type = typeof v;
    if (type === 'function') {
      return 'object';
    }
    if (type === 'object' && isAS2MovieClip(v)) {
      return 'movieclip';
    }
    return type;
  }

  function as2ToPrimitive(value) {
    return as2GetType(value) !== 'object' ? value : value.valueOf();
  }

  function as2GetCurrentSwfVersion() : number {
    return (<AS2ContextImpl> AS2Context.instance).swfVersion;
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

  function as2ToBoolean(value) {
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

  function as2ToNumber(value) {
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

  function as2ToInteger(value) {
    var result = as2ToNumber(value);
    if (isNaN(result)) {
      return 0;
    }
    if (!isFinite(result) || result === 0) {
      return result;
    }
    return (result < 0 ? -1 : 1) * Math.abs(result)|0;
  }

  function as2ToInt32(value) {
    var result = as2ToNumber(value);
    return (isNaN(result) || !isFinite(result) || result === 0) ? 0 :
      (result | 0);
  }

// TODO: We should just override Function.prototype.toString and change this to
// only have a special case for 'undefined'.
  function as2ToString(value) {
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
        return value.$targetPath;
      case 'object':
        var result = value.toString !== Function.prototype.toString ?
          value.toString() : value;
        if (typeof result === 'string') {
          return result;
        }
        return typeof value === 'function' ? '[type Function]'
          : '[type Object]';
    }
  }

  function as2Compare(x, y) {
    var x2 = as2ToPrimitive(x);
    var y2 = as2ToPrimitive(y);
    if (typeof x2 === 'string' && typeof y2 === 'string') {
      return x2 < y2;
    } else {
      return as2ToNumber(x2) < as2ToNumber(y2);
    }
  }

  function as2InstanceOf(obj, constructor) {
    if (obj instanceof constructor) {
      return true;
    }
    // TODO interface check
    return false;
  }

  function as2ResolveProperty(obj, name) {
    // checking if avm2 public property is present
    var avm2PublicName = Multiname.getPublicQualifiedName(name);
    if (avm2PublicName in obj) {
      return name;
    }
    if (isNumeric(name)) {
      return null;
    }
    var lowerCaseName = avm2PublicName.toLowerCase();
    for (var i in obj) {
      if (i.toLowerCase() === lowerCaseName) {
        notImplemented("FIX THIS");
        // return i.substr(Multiname.PUBLIC_QUALIFIED_NAME_PREFIX.length);
      }
    }
    return null;
  }

  function as2GetPrototype(obj) {
    return obj && obj.asGetPublicProperty('prototype');
  }

  function isAvm2Class(obj) {
    return typeof obj === 'object' && obj !== null && 'instanceConstructor' in obj;
  }

  function as2CreatePrototypeProxy(obj) {
    var prototype = obj.asGetPublicProperty('prototype');
    if (typeof Proxy === 'undefined') {
      console.error('ES6 proxies are not found');
      return prototype;
    }
    return Proxy.create({
      getOwnPropertyDescriptor: function(name) {
        return Object.getOwnPropertyDescriptor(prototype, name);
      },
      getPropertyDescriptor:  function(name) {
        // ES6: return getPropertyDescriptor(prototype, name);
        for (var p = prototype; p; p = Object.getPrototypeOf(p)) {
          var desc = Object.getOwnPropertyDescriptor(p, name);
          if (desc) return desc;
        }
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
      defineProperty: function(name, desc) {
        if (desc) {
          if (typeof desc.value === 'function' && desc.value._setClass) {
            desc.value._setClass(obj);
          }
          if (typeof desc.get === 'function' && desc.get._setClass) {
            desc.get._setClass(obj);
          }
          if (typeof desc.set === 'function' && desc.set._setClass) {
            desc.set._setClass(obj);
          }
        }
        return Object.defineProperty(prototype, name, desc);
      },
      delete: function(name) {
        return delete prototype[name];
      },
      fix: function() {
        return undefined;
      }
    });
  }

  export function executeActions(actionsData, as2Context: AS2Context, scope) {
    var context = <AS2ContextImpl> as2Context;
    if (context.executionProhibited) {
      return; // no more avm1 for this context
    }

    var actionTracer = ActionTracerFactory.get();

    var scopeContainer = context.initialScope.create(scope);
    var savedContext = AS2Context.instance;
    try {
      AS2Context.instance = context;
      context.isActive = true;
      context.abortExecutionAt = Date.now() + MAX_AVM1_HANG_TIMEOUT;
      context.errorsIgnored = 0;
      context.defaultTarget = scope;
      context.globals.asSetPublicProperty('this', scope);
      actionTracer.message('ActionScript Execution Starts');
      actionTracer.indent();
      interpretActions(actionsData, scopeContainer, null, []);
    } catch (e) {
      if (e instanceof AS2CriticalError) {
        console.error('Disabling AVM1 execution');
        context.executionProhibited = true;
      }
      throw e; // TODO shall we just ignore it?
    } finally {
      context.isActive = false;
      actionTracer.unindent();
      actionTracer.message('ActionScript Execution Stops');
      AS2Context.instance = savedContext;
    }
  }

  function lookupAS2Children(targetPath, defaultTarget, root) {
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
      obj = obj.$lookupChild(path[0]);
      if (!obj) {
        throw new Error(path[0] + ' (expr ' + targetPath + ') is not found in ' +
          prevObj._target);
      }
      path.shift();
    }
    return obj;
  }


  function createBuiltinType(obj, args) {
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
      return {};
    }
  }

  var AS2_SUPER_STUB = {};

  interface ExecutionContext {
    context: AS2ContextImpl;
    global: avm1lib.AS2Globals;
    defaultTarget: avm1lib.AS2MovieClip;
    scopeContainer: AS2ScopeListItem;
    scope: any;
    actionTracer: ActionTracer;
    constantPool: any;
    registers: any[];
    stream: ActionsDataStream;
    nextPosition: number;
    stack: any[];
    stackItemsExpected: number;
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
      var defaultTarget = ectx.defaultTarget;
      var scope = ectx.scope;

      if (!targetPath) {
        currentContext.defaultTarget = scope;
        return;
      }

      try {
        currentContext.defaultTarget =
          lookupAS2Children(targetPath, defaultTarget, _global.asGetPublicProperty('_root'));
      } catch (e) {
        currentContext.defaultTarget = null;
        throw e;
      }
    }
    function avm1DefineFunction(ectx: ExecutionContext, functionName: string,
                                parametersNames: string[],
                                registersAllocation, actionsData) {
      var currentContext = ectx.context;
      var _global = ectx.global;
      var scopeContainer = ectx.scopeContainer;
      var scope = ectx.scope;
      var actionTracer = ectx.actionTracer;
      var defaultTarget = ectx.defaultTarget;
      var constantPool = ectx.constantPool;

      var ownerClass;
      var fn = (function() {
        var newScope = {};
        newScope.asSetPublicProperty('this', this);
        newScope.asSetPublicProperty('arguments', arguments);
        newScope.asSetPublicProperty('super', AS2_SUPER_STUB);
        newScope.asSetPublicProperty('__class', ownerClass);
        var newScopeContainer = scopeContainer.create(newScope);
        var i;
        for (i = 0; i < arguments.length || i < parametersNames.length; i++) {
          newScope.asSetPublicProperty(parametersNames[i], arguments[i]);
        }
        var registers = [];
        if (registersAllocation) {
          for (i = 0; i < registersAllocation.length; i++) {
            var registerAllocation = registersAllocation[i];
            if (!registerAllocation) {
              continue;
            }
            if (registerAllocation.type == 'param') {
              registers[i] = arguments[registerAllocation.index];
            } else { // var
              switch (registerAllocation.name) {
                case 'this':
                  registers[i] = this;
                  break;
                case 'arguments':
                  registers[i] = arguments;
                  break;
                case 'super':
                  registers[i] = AS2_SUPER_STUB;
                  break;
                case '_global':
                  registers[i] = _global;
                  break;
                case '_parent':
                  registers[i] = scope.asGetPublicProperty('_parent');
                  break;
                case '_root':
                  registers[i] = _global.asGetPublicProperty('_root');
                  break;
              }
            }
          }
        }

        var savedContext = AS2Context.instance;
        var savedIsActive = currentContext.isActive;
        try
        {
          // switching contexts if called outside main thread
          AS2Context.instance = currentContext;
          if (!savedIsActive) {
            currentContext.abortExecutionAt = Date.now() + MAX_AVM1_HANG_TIMEOUT;
            currentContext.errorsIgnored = 0;
            currentContext.isActive = true;
          }
          currentContext.defaultTarget = scope;
          actionTracer.indent();
          currentContext.stackDepth++;
          if (currentContext.stackDepth >= MAX_AVM1_STACK_LIMIT) {
            throw new AS2CriticalError('long running script -- AVM1 recursion limit is reached');
          }
          return interpretActions(actionsData, newScopeContainer,
            constantPool, registers);
        } finally {
          currentContext.isActive = savedIsActive;
          currentContext.stackDepth--;
          actionTracer.unindent();
          currentContext.defaultTarget = defaultTarget;
          AS2Context.instance = savedContext;
        }
      });

      ownerClass = fn;
      var fnObj: any = fn;
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
    function avm1ResolveVariableName(ectx, variableName, nonStrict?) {
      var _global = ectx.global;
      var defaultTarget = ectx.defaultTarget;

      var obj, name, i;
      if (variableName.indexOf(':') >= 0) {
        // "/A/B:FOO references the FOO variable in the movie clip with a target path of /A/B."
        var parts = variableName.split(':');
        obj = lookupAS2Children(parts[0], defaultTarget,
          _global.asGetPublicProperty('_root'));
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

      var resolvedName = as2ResolveProperty(obj, name);
      var resolved = resolvedName !== null;
      if (resolved || nonStrict) {
        return { obj: obj, name: resolvedName || name, resolved: resolved };
      }

      return null;
    }
    function avm1GetThis(ectx: ExecutionContext) {
      var scopeContainer = ectx.scopeContainer;
      var scope = ectx.scope;

      var _this = scope.asGetPublicProperty('this');
      if (_this) {
        return _this;
      }
      for (var p = scopeContainer; p; p = p.next) {
        var resolvedName = as2ResolveProperty(p.scope, 'this');
        if (resolvedName !== null) {
          return p.scope.asGetPublicProperty(resolvedName);
        }
      }
    }
    function avm1GetVariable(ectx: ExecutionContext, variableName: string) {
      var scopeContainer = ectx.scopeContainer;
      var scope = ectx.scope;
      var defaultTarget = ectx.defaultTarget;

      // fast check if variable in the current scope
      if (scope.asHasProperty(undefined, variableName, 0)) {
        return scope.asGetPublicProperty(variableName);
      }

      var target = avm1ResolveVariableName(ectx, variableName);
      if (target) {
        return target.obj.asGetPublicProperty(target.name);
      }
      var resolvedName;
      var _this = avm1GetThis(ectx);
      for (var p = scopeContainer; p; p = p.next) {
        resolvedName = as2ResolveProperty(p.scope, variableName);
        if (resolvedName !== null) {
          return p.scope.asGetPublicProperty(resolvedName);
        }
      }
      if(_this && (resolvedName = as2ResolveProperty(_this, variableName))) {
        return _this.asGetPublicProperty(resolvedName);
      }
      // trying movie clip children (if object is a MovieClip)
      var mc = isAS2MovieClip(defaultTarget) &&
        defaultTarget.$lookupChild(variableName);
      if (mc) {
        return mc;
      }
    }
    function avm1SetVariable(ectx: ExecutionContext, variableName: string, value) {
      var scopeContainer = ectx.scopeContainer;
      var scope = ectx.scope;

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
      var resolvedName;
      var _this = avm1GetThis(ectx);
      if(_this && (resolvedName = as2ResolveProperty(_this, variableName))) {
        return _this.asSetPublicProperty(resolvedName, value);
      }

      for (var p = scopeContainer; p.next; p = p.next) { // excluding globals
        resolvedName = as2ResolveProperty(p.scope, variableName);
        if (resolvedName !== null) {
          return p.scope.asSetPublicProperty(resolvedName, value);
        }
      }
      (_this || scope).asSetPublicProperty(variableName, value);
    }
    function avm1GetFunction(ectx: ExecutionContext, functionName: string) {
      var fn = avm1GetVariable(ectx, functionName);
      if (!(fn instanceof Function)) {
        throw new Error('Function "' + functionName + '" is not found');
      }
      return fn;
    }
    function avm1GetObjectByName(ectx: ExecutionContext, objectName: string) {
      var obj = avm1GetVariable(ectx, objectName);
      if (!(obj instanceof Object)) {
        throw new Error('Object "' + objectName + '" is not found');
      }
      return obj;
    }
    function avm1ProcessWith(ectx, obj, withBlock) {
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
      try {
        currentContext.isTryCatchListening = true;
        interpretActions(tryBlock, scopeContainer, constantPool, registers);
      } catch (e) {
        currentContext.isTryCatchListening = savedTryCatchState;
        if (!catchBlockFlag) {
          throw e;
        }
        if (!(e instanceof AS2Error)) {
          throw e;
        }
        if (typeof catchTarget === 'string') {
          scope.asSetPublicProperty(catchTarget, e.error);
        } else {
          registers[catchTarget] = e.error;
        }
        interpretActions(catchBlock, scopeContainer, constantPool, registers);
      } finally {
        currentContext.isTryCatchListening = savedTryCatchState;
        if (finallyBlockFlag) {
          interpretActions(finallyBlock, scopeContainer, constantPool, registers);
        }
      }
    }
    function avm1SkipActions(ectx: ExecutionContext, count: number) {
      var stream = ectx.stream;

      while (count > 0 && stream.position < stream.end) {
        var actionCode = stream.readUI8();
        var length = actionCode >= 0x80 ? stream.readUI16() : 0;
        stream.position += length;
        count--;
      }

      ectx.nextPosition = stream.position;
    }

    // SWF 3 actions
    function avm1_0x81_ActionGotoFrame(ectx: ExecutionContext) {
      var stream = ectx.stream;
      var _global = ectx.global;
      var nextPosition = ectx.nextPosition;

      var frame = stream.readUI16();
      var nextActionCode = stream.readUI8();
      nextPosition++;
      var methodName = nextActionCode === 0x06 ? 'gotoAndPlay' : 'gotoAndStop';
      _global[methodName](frame + 1);

      ectx.nextPosition = nextPosition;
    }
    function avm1_0x83_ActionGetURL(ectx: ExecutionContext) {
      var stream = ectx.stream;
      var _global = ectx.global;

      var urlString = stream.readString();
      var targetString = stream.readString();
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
    function avm1_0x8A_ActionWaitForFrame(ectx: ExecutionContext) {
      var stream = ectx.stream;
      var _global = ectx.global;

      var frame = stream.readUI16();
      var count = stream.readUI8();
      if (!_global.ifFrameLoaded(frame)) {
        avm1SkipActions(ectx, count);
      }
    }
    function avm1_0x8B_ActionSetTarget(ectx: ExecutionContext) {
      var stream = ectx.stream;

      var targetName = stream.readString();
      avm1SetTarget(ectx, targetName);
    }
    function avm1_0x8C_ActionGoToLabel(ectx: ExecutionContext) {
      var stream = ectx.stream;
      var _global = ectx.global;

      var label = stream.readString();
      _global.gotoLabel(label);
    }
    // SWF 4 actions
    function avm1_0x96_ActionPush(ectx: ExecutionContext) {
      var stream = ectx.stream;
      var registers = ectx.registers;
      var constantPool = ectx.constantPool;
      var nextPosition = ectx.nextPosition;
      var stack = ectx.stack;

      var type, value;
      while (stream.position < nextPosition) {
        type = stream.readUI8();
        switch (type | 0) {
          case 0: // STRING
            value = stream.readString();
            break;
          case 1: // FLOAT
            value = stream.readFloat();
            break;
          case 2: // null
            value = null;
            break;
          case 3: // undefined
            value = void(0);
            break;
          case 4: // Register number
            value = registers[stream.readUI8()];
            break;
          case 5: // Boolean
            value = stream.readBoolean();
            break;
          case 6: // Double
            value = stream.readDouble();
            break;
          case 7: // Integer
            value = stream.readInteger();
            break;
          case 8: // Constant8
            value = constantPool[stream.readUI8()];
            break;
          case 9: // Constant16
            value = constantPool[stream.readUI16()];
            break;
          default:
            throw new Error('Unknown value type: ' + type);
        }
        stack.push(value);
      }
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

      stack.push(_global.chr(stack.pop()));
    }
    function avm1_0x36_ActionMBCharToAscii(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var _global = ectx.global;

      stack.push(_global.mbchr(stack.pop()));
    }
    function avm1_0x33_ActionAsciiToChar(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var _global = ectx.global;

      stack.push(_global.ord(stack.pop()));
    }
    function avm1_0x37_ActionMBAsciiToChar(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var _global = ectx.global;

      stack.push(_global.mbord(stack.pop()));
    }
    function avm1_0x99_ActionJump(ectx: ExecutionContext) {
      var stream = ectx.stream;
      var nextPosition = ectx.nextPosition;

      var offset = stream.readSI16();
      nextPosition += offset;

      ectx.nextPosition = nextPosition;
    }
    function avm1_0x9D_ActionIf(ectx: ExecutionContext) {
      var stream = ectx.stream;
      var nextPosition = ectx.nextPosition;
      var stack = ectx.stack;

      var offset = stream.readSI16();
      var f = !!stack.pop();
      if (f) {
        nextPosition += offset;
      }

      ectx.nextPosition = nextPosition;
    }
    function avm1_0x9E_ActionCall(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var _global = ectx.global;

      var label = stack.pop();
      _global.call(label);
    }
    function avm1_0x1C_ActionGetVariable(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var stackItemsExpected = ectx.stackItemsExpected;

      var variableName = '' + stack.pop();

      stackItemsExpected++;
      ectx.stackItemsExpected = stackItemsExpected;

      stack.push(avm1GetVariable(ectx, variableName));
    }
    function avm1_0x1D_ActionSetVariable(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var value = stack.pop();
      var variableName = '' + stack.pop();
      avm1SetVariable(ectx, variableName, value);
    }
    function avm1_0x9A_ActionGetURL2(ectx: ExecutionContext) {
      var stream = ectx.stream;
      var _global = ectx.global;
      var stack = ectx.stack;

      var flags = stream.readUI8();
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
    function avm1_0x9F_ActionGotoFrame2(ectx: ExecutionContext) {
      var stream = ectx.stream;
      var _global = ectx.global;
      var stack = ectx.stack;

      var flags = stream.readUI8();
      var gotoParams = [stack.pop()];
      if (!!(flags & 2)) {
        gotoParams.push(stream.readUI16());
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
      var stackItemsExpected = ectx.stackItemsExpected;

      var index = stack.pop();
      var target = stack.pop();

      stackItemsExpected++;
      ectx.stackItemsExpected = stackItemsExpected;

      stack.push(_global.getAS2Property(target, index));
    }
    function avm1_0x23_ActionSetProperty(ectx: ExecutionContext) {
      var _global = ectx.global;
      var stack = ectx.stack;

      var value = stack.pop();
      var index = stack.pop();
      var target = stack.pop();
      _global.setAS2Property(target, index, value);
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
    function avm1_0x8D_ActionWaitForFrame2(ectx: ExecutionContext) {
      var stream = ectx.stream;
      var _global = ectx.global;
      var stack = ectx.stack;

      var count = stream.readUI8();
      var frame = stack.pop();
      if (!_global.ifFrameLoaded(frame)) {
        avm1SkipActions(ectx, count);
      }
    }
    function avm1_0x26_ActionTrace(ectx: ExecutionContext) {
      var _global = ectx.global;
      var stack = ectx.stack;

      var value = stack.pop();
      _global.trace(value);
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
      var stackItemsExpected = ectx.stackItemsExpected;
      var scope = ectx.scope;

      var functionName = stack.pop();
      var args = avm1ReadFunctionArgs(stack);

      stackItemsExpected++;
      ectx.stackItemsExpected = stackItemsExpected;

      var fn = avm1GetFunction(ectx, functionName);
      var result = fn.apply(scope, args);
      stack.push(result);
    }
    function avm1_0x52_ActionCallMethod(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var stackItemsExpected = ectx.stackItemsExpected;

      var methodName = stack.pop();
      var obj = stack.pop();
      var args = avm1ReadFunctionArgs(stack);
      var target, resolvedName, result;

      stackItemsExpected++;
      ectx.stackItemsExpected = stackItemsExpected;

      // checking "if the method name is blank or undefined"
      if (methodName !== null && methodName !== undefined &&
        methodName !== '') {
        if (obj === null || obj === undefined) {
          throw new Error('Cannot call method ' + methodName + ' of ' + typeof obj);
        } else if (obj !== AS2_SUPER_STUB) {
          target = Object(obj);
        } else {
          target = as2GetPrototype(avm1GetVariable(ectx, '__class').__super);
          obj = avm1GetVariable(ectx, 'this');
        }
        resolvedName = as2ResolveProperty(target, methodName);
        if (resolvedName === null) {
          throw new Error('Method ' + methodName + ' is not defined.');
        }
        result = target.asGetPublicProperty(resolvedName).apply(obj, args);
      } else if (obj !== AS2_SUPER_STUB) {
        result = obj.apply(obj, args);
      } else {
        result = avm1GetVariable(ectx, '__class').__super.apply(
          avm1GetVariable(ectx, 'this'), args);
      }
      stack.push(result);
    }
    function avm1_0x88_ActionConstantPool(ectx: ExecutionContext) {
      var stream = ectx.stream;

      var count = stream.readUI16();
      var constantPool = [];
      for (var i = 0; i < count; i++) {
        constantPool.push(stream.readString());
      }
      ectx.constantPool = constantPool;
    }
    function avm1_0x9B_ActionDefineFunction(ectx: ExecutionContext) {
      var stream = ectx.stream;
      var nextPosition = ectx.nextPosition;
      var stack = ectx.stack;
      var scope = ectx.scope;

      var functionName = stream.readString();
      var count = stream.readUI16();
      var args = [];
      for (var i = 0; i < count; i++) {
        args.push(stream.readString());
      }
      var codeSize = stream.readUI16();

      nextPosition += codeSize;
      ectx.nextPosition = nextPosition;

      var fn = avm1DefineFunction(ectx, functionName, args, null,
        stream.readBytes(codeSize));
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
      var obj = avm1GetObjectByName(ectx, objectName);
      forEachPublicProperty(obj, function (name) {
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
        var resolvedName = as2ResolveProperty(Object(obj), name);
        stack.push(resolvedName === null ? undefined :
          obj.asGetPublicProperty(resolvedName));
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
      var stackItemsExpected = ectx.stackItemsExpected;

      var methodName = stack.pop();
      var obj = stack.pop();
      var args = avm1ReadFunctionArgs(stack);
      var resolvedName, method, result;

      stackItemsExpected++;
      ectx.stackItemsExpected = stackItemsExpected;

      // checking "if the name of the method is blank"
      if (methodName !== null && methodName !== undefined &&
        methodName !== '') {
        resolvedName = as2ResolveProperty(obj, methodName);
        if (resolvedName === null) {
          throw new Error('Method ' + methodName + ' is not defined.');
        }
        if (obj === null || obj === undefined) {
          throw new Error('Cannot call new using method ' + resolvedName + ' of ' + typeof obj);
        }
        method = obj.asGetPublicProperty(resolvedName);
      } else {
        if (obj === null || obj === undefined) {
          throw new Error('Cannot call new using ' + typeof obj);
        }
        method = obj;
      }
      if (isAvm2Class(obj)) {
        result = construct(obj, args);
      } else {
        result = Object.create(as2GetPrototype(method) || as2GetPrototype(Object));
        method.apply(result, args);
      }
      result.constructor = method;
      stack.push(result);
    }
    function avm1_0x40_ActionNewObject(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var stackItemsExpected = ectx.stackItemsExpected;

      var objectName = stack.pop();
      var obj = avm1GetObjectByName(ectx, objectName);
      var args = avm1ReadFunctionArgs(stack);

      stackItemsExpected++;
      ectx.stackItemsExpected = stackItemsExpected;

      var result = createBuiltinType(obj, args);
      if (typeof result === 'undefined') {
        // obj in not a built-in type
        if (isAvm2Class(obj)) {
          result = construct(obj, args);
        } else {
          result = Object.create(as2GetPrototype(obj) || as2GetPrototype(Object));
          obj.apply(result, args);
        }
        result.constructor = obj;
      }
      stack.push(result);
    }
    function avm1_0x4F_ActionSetMember(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var value = stack.pop();
      var name = stack.pop();
      var obj = stack.pop();
      obj.asSetPublicProperty(name, value);
    }
    function avm1_0x45_ActionTargetPath(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var obj = stack.pop();
      stack.push(as2GetType(obj) === 'movieclip' ? obj._target : void(0));
    }
    function avm1_0x94_ActionWith(ectx: ExecutionContext) {
      var stream = ectx.stream;
      var nextPosition = ectx.nextPosition;
      var stack = ectx.stack;

      var codeSize = stream.readUI16();
      var obj = stack.pop();

      nextPosition += codeSize;
      ectx.nextPosition = nextPosition;

      avm1ProcessWith(ectx, obj, stream.readBytes(codeSize));
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
    function avm1_0x87_ActionStoreRegister(ectx: ExecutionContext) {
      var stream = ectx.stream;
      var stack = ectx.stack;
      var registers = ectx.registers;

      var register = stream.readUI8();
      registers[register] = stack[stack.length - 1];
    }
    // SWF 6
    function avm1_0x54_ActionInstanceOf(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var constr = stack.pop();
      var obj = stack.pop();
      stack.push(as2InstanceOf(Object(obj), constr));
    }
    function avm1_0x55_ActionEnumerate2(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var obj = stack.pop();
      stack.push(null);

      forEachPublicProperty(obj, function (name) {
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
    function avm1_0x8E_ActionDefineFunction2(ectx: ExecutionContext) {
      var stream = ectx.stream;
      var nextPosition = ectx.nextPosition;
      var stack = ectx.stack;
      var scope = ectx.scope;

      var functionName = stream.readString();
      var count = stream.readUI16();
      var registerCount = stream.readUI8();
      var flags = stream.readUI16();
      var registerAllocation = [];
      var args = [];
      for (var i = 0; i < count; i++) {
        var register = stream.readUI8();
        var paramName = stream.readString();
        args.push(paramName);
        if (register) {
          registerAllocation[register] = {
            type: 'param',
            name: paramName,
            index: i
          };
        }
      }
      var codeSize = stream.readUI16();

      nextPosition += codeSize;
      ectx.nextPosition = nextPosition;

      var j = 1;
      // order this, arguments, super, _root, _parent, and _global
      if (flags & 0x0001) { // preloadThis
        registerAllocation[j++] = { type: 'var', name: 'this' };
      }
      if (flags & 0x0004) { // preloadArguments
        registerAllocation[j++] = { type: 'var', name: 'arguments' };
      }
      if (flags & 0x0010) { // preloadSuper
        registerAllocation[j++] = { type: 'var', name: 'super' };
      }
      if (flags & 0x0040) { // preloadRoot
        registerAllocation[j++] = { type: 'var', name: '_root' };
      }
      if (flags & 0x0080) { // preloadParent
        registerAllocation[j++] = { type: 'var', name: '_parent' };
      }
      if (flags & 0x0100) { // preloadGlobal
        registerAllocation[j++] = { type: 'var', name: '_global' };
      }

      var fn = avm1DefineFunction(ectx, functionName, args,
        registerAllocation, stream.readBytes(codeSize));
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
      constr.$interfaces = interfaces;
    }
    function avm1_0x8F_ActionTry(ectx: ExecutionContext) {
      var stream = ectx.stream;
      var nextPosition = ectx.nextPosition;

      var flags = stream.readUI8();
      var catchIsRegisterFlag = !!(flags & 4);
      var finallyBlockFlag = !!(flags & 2);
      var catchBlockFlag = !!(flags & 1);
      var trySize = stream.readUI16();
      var catchSize = stream.readUI16();
      var finallySize = stream.readUI16();
      var catchTarget: any = catchIsRegisterFlag ? stream.readUI8() : stream.readString();

      nextPosition += trySize + catchSize + finallySize;
      ectx.nextPosition = nextPosition;

      avm1ProcessTry(ectx, catchIsRegisterFlag,
        finallyBlockFlag, catchBlockFlag, catchTarget,
        stream.readBytes(trySize), stream.readBytes(catchSize), stream.readBytes(finallySize));
    }
    function avm1_0x2A_ActionThrow(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var obj = stack.pop();
      throw new AS2Error(obj);
    }
    function avm1_0x2D_ActionFSCommand2(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var stackItemsExpected = ectx.stackItemsExpected;
      var _global = ectx.global;

      var args = avm1ReadFunctionArgs(stack);

      stackItemsExpected++;
      ectx.stackItemsExpected = stackItemsExpected;

      var result = _global.fscommand.apply(null, args);
      stack.push(result);
    }
    function avm1_0x89_ActionStrictMode(ectx: ExecutionContext) {
      var stream = ectx.stream;

      var mode = stream.readUI8();
    }

    function interpretAction(executionContext) {
      var stream = executionContext.stream;
      var stack = executionContext.stack;

      var actionCode = stream.readUI8();
      var length = actionCode >= 0x80 ? stream.readUI16() : 0;
      var nextPosition = stream.position + length;
      executionContext.nextPosition = nextPosition;

      var actionTracer = executionContext.actionTracer;
      actionTracer.print(stream.position, actionCode, stack);

      switch (actionCode | 0) {
        // SWF 3 actions
        case 0x81: // ActionGotoFrame
          avm1_0x81_ActionGotoFrame(executionContext);
          break;
        case 0x83: // ActionGetURL
          avm1_0x83_ActionGetURL(executionContext);
          break;
        case 0x04: // ActionNextFrame
          avm1_0x04_ActionNextFrame(executionContext);
          break;
        case 0x05: // ActionPreviousFrame
          avm1_0x05_ActionPreviousFrame(executionContext);
          break;
        case 0x06: // ActionPlay
          avm1_0x06_ActionPlay(executionContext);
          break;
        case 0x07: // ActionStop
          avm1_0x07_ActionStop(executionContext);
          break;
        case 0x08: // ActionToggleQuality
          avm1_0x08_ActionToggleQuality(executionContext);
          break;
        case 0x09: // ActionStopSounds
          avm1_0x09_ActionStopSounds(executionContext);
          break;
        case 0x8A: // ActionWaitForFrame
          avm1_0x8A_ActionWaitForFrame(executionContext);
          break;
        case 0x8B: // ActionSetTarget
          avm1_0x8B_ActionSetTarget(executionContext);
          break;
        case 0x8C: // ActionGoToLabel
          avm1_0x8C_ActionGoToLabel(executionContext);
          break;
        // SWF 4 actions
        case 0x96: // ActionPush
          avm1_0x96_ActionPush(executionContext);
          break;
        case 0x17: // ActionPop
          avm1_0x17_ActionPop(executionContext);
          break;
        case 0x0A: // ActionAdd
          avm1_0x0A_ActionAdd(executionContext);
          break;
        case 0x0B: // ActionSubtract
          avm1_0x0B_ActionSubtract(executionContext);
          break;
        case 0x0C: // ActionMultiply
          avm1_0x0C_ActionMultiply(executionContext);
          break;
        case 0x0D: // ActionDivide
          avm1_0x0D_ActionDivide(executionContext);
          break;
        case 0x0E: // ActionEquals
          avm1_0x0E_ActionEquals(executionContext);
          break;
        case 0x0F: // ActionLess
          avm1_0x0F_ActionLess(executionContext);
          break;
        case 0x10: // ActionAnd
          avm1_0x10_ActionAnd(executionContext);
          break;
        case 0x11: // ActionOr
          avm1_0x11_ActionOr(executionContext);
          break;
        case 0x12: // ActionNot
          avm1_0x12_ActionNot(executionContext);
          break;
        case 0x13: // ActionStringEquals
          avm1_0x13_ActionStringEquals(executionContext);
          break;
        case 0x14: // ActionStringLength
          avm1_0x14_ActionStringLength(executionContext);
          break;
        case 0x31: // ActionMBStringLength
          avm1_0x31_ActionMBStringLength(executionContext);
          break;
        case 0x21: // ActionStringAdd
          avm1_0x21_ActionStringAdd(executionContext);
          break;
        case 0x15: // ActionStringExtract
          avm1_0x15_ActionStringExtract(executionContext);
          break;
        case 0x35: // ActionMBStringExtract
          avm1_0x35_ActionMBStringExtract(executionContext);
          break;
        case 0x29: // ActionStringLess
          avm1_0x29_ActionStringLess(executionContext);
          break;
        case 0x18: // ActionToInteger
          avm1_0x18_ActionToInteger(executionContext);
          break;
        case 0x32: // ActionCharToAscii
          avm1_0x32_ActionCharToAscii(executionContext);
          break;
        case 0x36: // ActionMBCharToAscii
          avm1_0x36_ActionMBCharToAscii(executionContext);
          break;
        case 0x33: // ActionAsciiToChar
          avm1_0x33_ActionAsciiToChar(executionContext);
          break;
        case 0x37: // ActionMBAsciiToChar
          avm1_0x37_ActionMBAsciiToChar(executionContext);
          break;
        case 0x99: // ActionJump
          avm1_0x99_ActionJump(executionContext);
          break;
        case 0x9D: // ActionIf
          avm1_0x9D_ActionIf(executionContext);
          break;
        case 0x9E: // ActionCall
          avm1_0x9E_ActionCall(executionContext);
          break;
        case 0x1C: // ActionGetVariable
          avm1_0x1C_ActionGetVariable(executionContext);
          break;
        case 0x1D: // ActionSetVariable
          avm1_0x1D_ActionSetVariable(executionContext);
          break;
        case 0x9A: // ActionGetURL2
          avm1_0x9A_ActionGetURL2(executionContext);
          break;
        case 0x9F: // ActionGotoFrame2
          avm1_0x9F_ActionGotoFrame2(executionContext);
          break;
        case 0x20: // ActionSetTarget2
          avm1_0x20_ActionSetTarget2(executionContext);
          break;
        case 0x22: // ActionGetProperty
          avm1_0x22_ActionGetProperty(executionContext);
          break;
        case 0x23: // ActionSetProperty
          avm1_0x23_ActionSetProperty(executionContext);
          break;
        case 0x24: // ActionCloneSprite
          avm1_0x24_ActionCloneSprite(executionContext);
          break;
        case 0x25: // ActionRemoveSprite
          avm1_0x25_ActionRemoveSprite(executionContext);
          break;
        case 0x27: // ActionStartDrag
          avm1_0x27_ActionStartDrag(executionContext);
          break;
        case 0x28: // ActionEndDrag
          avm1_0x28_ActionEndDrag(executionContext);
          break;
        case 0x8D: // ActionWaitForFrame2
          avm1_0x8D_ActionWaitForFrame2(executionContext);
          break;
        case 0x26: // ActionTrace
          avm1_0x26_ActionTrace(executionContext);
          break;
        case 0x34: // ActionGetTime
          avm1_0x34_ActionGetTime(executionContext);
          break;
        case 0x30: // ActionRandomNumber
          avm1_0x30_ActionRandomNumber(executionContext);
          break;
        // SWF 5
        case 0x3D: // ActionCallFunction
          avm1_0x3D_ActionCallFunction(executionContext);
          break;
        case 0x52: // ActionCallMethod
          avm1_0x52_ActionCallMethod(executionContext);
          break;
        case 0x88: // ActionConstantPool
          avm1_0x88_ActionConstantPool(executionContext);
          break;
        case 0x9B: // ActionDefineFunction
          avm1_0x9B_ActionDefineFunction(executionContext);
          break;
        case 0x3C: // ActionDefineLocal
          avm1_0x3C_ActionDefineLocal(executionContext);
          break;
        case 0x41: // ActionDefineLocal2
          avm1_0x41_ActionDefineLocal2(executionContext);
          break;
        case 0x3A: // ActionDelete
          avm1_0x3A_ActionDelete(executionContext);
          break;
        case 0x3B: // ActionDelete2
          avm1_0x3B_ActionDelete2(executionContext);
          break;
        case 0x46: // ActionEnumerate
          avm1_0x46_ActionEnumerate(executionContext);
          break;
        case 0x49: // ActionEquals2
          avm1_0x49_ActionEquals2(executionContext);
          break;
        case 0x4E: // ActionGetMember
          avm1_0x4E_ActionGetMember(executionContext);
          break;
        case 0x42: // ActionInitArray
          avm1_0x42_ActionInitArray(executionContext);
          break;
        case 0x43: // ActionInitObject
          avm1_0x43_ActionInitObject(executionContext);
          break;
        case 0x53: // ActionNewMethod
          avm1_0x53_ActionNewMethod(executionContext);
          break;
        case 0x40: // ActionNewObject
          avm1_0x40_ActionNewObject(executionContext);
          break;
        case 0x4F: // ActionSetMember
          avm1_0x4F_ActionSetMember(executionContext);
          break;
        case 0x45: // ActionTargetPath
          avm1_0x45_ActionTargetPath(executionContext);
          break;
        case 0x94: // ActionWith
          avm1_0x94_ActionWith(executionContext);
          break;
        case 0x4A: // ActionToNumber
          avm1_0x4A_ActionToNumber(executionContext);
          break;
        case 0x4B: // ActionToString
          avm1_0x4B_ActionToString(executionContext);
          break;
        case 0x44: // ActionTypeOf
          avm1_0x44_ActionTypeOf(executionContext);
          break;
        case 0x47: // ActionAdd2
          avm1_0x47_ActionAdd2(executionContext);
          break;
        case 0x48: // ActionLess2
          avm1_0x48_ActionLess2(executionContext);
          break;
        case 0x3F: // ActionModulo
          avm1_0x3F_ActionModulo(executionContext);
          break;
        case 0x60: // ActionBitAnd
          avm1_0x60_ActionBitAnd(executionContext);
          break;
        case 0x63: // ActionBitLShift
          avm1_0x63_ActionBitLShift(executionContext);
          break;
        case 0x61: // ActionBitOr
          avm1_0x61_ActionBitOr(executionContext);
          break;
        case 0x64: // ActionBitRShift
          avm1_0x64_ActionBitRShift(executionContext);
          break;
        case 0x65: // ActionBitURShift
          avm1_0x65_ActionBitURShift(executionContext);
          break;
        case 0x62: // ActionBitXor
          avm1_0x62_ActionBitXor(executionContext);
          break;
        case 0x51: // ActionDecrement
          avm1_0x51_ActionDecrement(executionContext);
          break;
        case 0x50: // ActionIncrement
          avm1_0x50_ActionIncrement(executionContext);
          break;
        case 0x4C: // ActionPushDuplicate
          avm1_0x4C_ActionPushDuplicate(executionContext);
          break;
        case 0x3E: // ActionReturn
          avm1_0x3E_ActionReturn(executionContext);
          break;
        case 0x4D: // ActionStackSwap
          avm1_0x4D_ActionStackSwap(executionContext);
          break;
        case 0x87: // ActionStoreRegister
          avm1_0x87_ActionStoreRegister(executionContext);
          break;
        // SWF 6
        case 0x54: // ActionInstanceOf
          avm1_0x54_ActionInstanceOf(executionContext);
          break;
        case 0x55: // ActionEnumerate2
          avm1_0x55_ActionEnumerate2(executionContext);
          break;
        case 0x66: // ActionStrictEquals
          avm1_0x66_ActionStrictEquals(executionContext);
          break;
        case 0x67: // ActionGreater
          avm1_0x67_ActionGreater(executionContext);
          break;
        case 0x68: // ActionStringGreater
          avm1_0x68_ActionStringGreater(executionContext);
          break;
        // SWF 7
        case 0x8E: // ActionDefineFunction2
          avm1_0x8E_ActionDefineFunction2(executionContext);
          break;
        case 0x69: // ActionExtends
          avm1_0x69_ActionExtends(executionContext);
          break;
        case 0x2B: // ActionCastOp
          avm1_0x2B_ActionCastOp(executionContext);
          break;
        case 0x2C: // ActionImplementsOp
          avm1_0x2C_ActionImplementsOp(executionContext);
          break;
        case 0x8F: // ActionTry
          avm1_0x8F_ActionTry(executionContext);
          break;
        case 0x2A: // ActionThrow
          avm1_0x2A_ActionThrow(executionContext);
          break;
        // Not documented by the spec
        case 0x2D: // ActionFSCommand2
          avm1_0x2D_ActionFSCommand2(executionContext);
          break;
        case 0x89: // ActionStrictMode
          avm1_0x89_ActionStrictMode(executionContext);
          break;
        case 0: // End of actions
          executionContext.isEndOfActions = true;
          break;
        default:
          throw new Error('Unknown action code: ' + actionCode);
      }

      var nextPosition = executionContext.nextPosition;
      stream.position = nextPosition;
    }

    function interpretActionWithRecovery(executionContext) {
      var stackItemsExpected = 0;
      executionContext.stackItemsExpected = stackItemsExpected;

      try {
        interpretAction(executionContext);

        executionContext.recoveringFromError = false;
      } catch (e) {
        // handling AVM1 errors
        var currentContext = executionContext.context;
        if ((avm1ErrorsEnabled.value && !currentContext.isTryCatchListening) ||
          e instanceof AS2CriticalError) {
          throw e;
        }
        if (e instanceof AS2Error) {
          throw e;
        }

        var AVM1_ERROR_TYPE = 1;
        TelemetryService.reportTelemetry({topic: 'error', error: AVM1_ERROR_TYPE});

        var stream = executionContext.stream;
        var stack = executionContext.stack;

        var nextPosition = executionContext.nextPosition;
        stream.position = nextPosition;

        stackItemsExpected = executionContext.stackItemsExpected;
        while (stackItemsExpected > 0) {
          stack.push(undefined);
          stackItemsExpected--;
        }
        if (!executionContext.recoveringFromError) {
          if (currentContext.errorsIgnored++ >= MAX_AVM1_ERRORS_LIMIT) {
            throw new AS2CriticalError('long running script -- AVM1 errors limit is reached');
          }
          console.error('AVM1 error: ' + e);
          avm2.exceptions.push({source: 'avm1', message: e.message,
            stack: e.stack});
          executionContext.recoveringFromError = true;
        }
      }
    }

    function interpretActions(actionsData, scopeContainer, constantPool, registers) {
      var currentContext = <AS2ContextImpl> AS2Context.instance;

      var stream = new ActionsDataStream(actionsData, currentContext.swfVersion);
      var stack = [];
      var isSwfVersion5 = currentContext.swfVersion >= 5;
      var actionTracer = ActionTracerFactory.get();
      var scope = scopeContainer.scope;

      var executionContext = {
        context: currentContext,
        global: currentContext.globals,
        defaultTarget: currentContext.defaultTarget,
        scopeContainer: scopeContainer,
        scope: scope,
        actionTracer: actionTracer,
        constantPool: constantPool,
        registers: registers,
        stream: stream,
        nextPosition: 0,
        stack: stack,
        stackItemsExpected: 0,
        isSwfVersion5: isSwfVersion5,
        recoveringFromError: false,
        isEndOfActions: false
      };

      if (scope.$nativeObject && scope.$nativeObject._deferScriptExecution) {
        currentContext.deferScriptExecution = true;
      }

      var instructionsExecuted = 0;
      var abortExecutionAt = currentContext.abortExecutionAt;

      // will try again if we are skipping errors
      while (stream.position < stream.end && !executionContext.isEndOfActions) {
        // let's check timeout every 100 instructions
        if (instructionsExecuted++ % 100 === 0 && Date.now() >= abortExecutionAt) {
          throw new AS2CriticalError('long running script -- AVM1 instruction hang timeout');
        }

        interpretActionWithRecovery(executionContext);
      }
      return stack.pop();
    }

  interface ActionTracer {
    print: (position: number, actionCode: number, stack: any[]) => void;
    indent: () => void;
    unindent: () => void;
    message: (msg: string) => void;
  }

  class ActionTracerFactory {
    private static tracer : ActionTracer = (
      () => {
        var indentation = 0;
        return {
          print: function(position: number, actionCode: number, stack: any[]) {
            var stackDump = [];
            for(var q = 0; q < stack.length; q++) {
              var item = stack[q];
              stackDump.push(item && typeof item === 'object' ?
                '[' + (item.constructor && item.constructor.name ? item.constructor.name : 'Object') + ']' : item);
            }

            var indent = new Array(indentation + 1).join('..');

            console.log('AVM1 trace: ' + indent + position + ': ' +
              ActionNamesMap[actionCode] + '(' + actionCode.toString(16) + '), ' +
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
      print: function(position: number, actionCode: number, stack: any[]) {},
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

  var ActionNamesMap = {
    0x00: 'EOA',
    0x04: 'ActionNextFrame',
    0x05: 'ActionPreviousFrame',
    0x06: 'ActionPlay',
    0x07: 'ActionStop',
    0x08: 'ActionToggleQuality',
    0x09: 'ActionStopSounds',
    0x0A: 'ActionAdd',
    0x0B: 'ActionSubtract',
    0x0C: 'ActionMultiply',
    0x0D: 'ActionDivide',
    0x0E: 'ActionEquals',
    0x0F: 'ActionLess',
    0x10: 'ActionAnd',
    0x11: 'ActionOr',
    0x12: 'ActionNot',
    0x13: 'ActionStringEquals',
    0x14: 'ActionStringLength',
    0x15: 'ActionStringExtract',
    0x17: 'ActionPop',
    0x18: 'ActionToInteger',
    0x1C: 'ActionGetVariable',
    0x1D: 'ActionSetVariable',
    0x20: 'ActionSetTarget2',
    0x21: 'ActionStringAdd',
    0x22: 'ActionGetProperty',
    0x23: 'ActionSetProperty',
    0x24: 'ActionCloneSprite',
    0x25: 'ActionRemoveSprite',
    0x26: 'ActionTrace',
    0x27: 'ActionStartDrag',
    0x28: 'ActionEndDrag',
    0x29: 'ActionStringLess',
    0x2A: 'ActionThrow',
    0x2B: 'ActionCastOp',
    0x2C: 'ActionImplementsOp',
    0x2D: 'ActionFSCommand2',
    0x30: 'ActionRandomNumber',
    0x31: 'ActionMBStringLength',
    0x32: 'ActionCharToAscii',
    0x33: 'ActionAsciiToChar',
    0x34: 'ActionGetTime',
    0x35: 'ActionMBStringExtrac',
    0x36: 'ActionMBCharToAscii',
    0x37: 'ActionMBAsciiToChar',
    0x3A: 'ActionDelete',
    0x3B: 'ActionDelete2',
    0x3C: 'ActionDefineLocal',
    0x3D: 'ActionCallFunction',
    0x3E: 'ActionReturn',
    0x3F: 'ActionModulo',
    0x40: 'ActionNewObject',
    0x41: 'ActionDefineLocal2',
    0x42: 'ActionInitArray',
    0x43: 'ActionInitObject',
    0x44: 'ActionTypeOf',
    0x45: 'ActionTargetPath',
    0x46: 'ActionEnumerate',
    0x47: 'ActionAdd2',
    0x48: 'ActionLess2',
    0x49: 'ActionEquals2',
    0x4A: 'ActionToNumber',
    0x4B: 'ActionToString',
    0x4C: 'ActionPushDuplicate',
    0x4D: 'ActionStackSwap',
    0x4E: 'ActionGetMember',
    0x4F: 'ActionSetMember',
    0x50: 'ActionIncrement',
    0x51: 'ActionDecrement',
    0x52: 'ActionCallMethod',
    0x53: 'ActionNewMethod',
    0x54: 'ActionInstanceOf',
    0x55: 'ActionEnumerate2',
    0x60: 'ActionBitAnd',
    0x61: 'ActionBitOr',
    0x62: 'ActionBitXor',
    0x63: 'ActionBitLShift',
    0x64: 'ActionBitRShift',
    0x65: 'ActionBitURShift',
    0x66: 'ActionStrictEquals',
    0x67: 'ActionGreater',
    0x68: 'ActionStringGreater',
    0x69: 'ActionExtends',
    0x81: 'ActionGotoFrame',
    0x83: 'ActionGetURL',
    0x87: 'ActionStoreRegister',
    0x88: 'ActionConstantPool',
    0x89: 'ActionStrictMode',
    0x8A: 'ActionWaitForFrame',
    0x8B: 'ActionSetTarget',
    0x8C: 'ActionGoToLabel',
    0x8D: 'ActionWaitForFrame2',
    0x8E: 'ActionDefineFunction',
    0x8F: 'ActionTry',
    0x94: 'ActionWith',
    0x96: 'ActionPush',
    0x99: 'ActionJump',
    0x9A: 'ActionGetURL2',
    0x9B: 'ActionDefineFunction',
    0x9D: 'ActionIf',
    0x9E: 'ActionCall',
    0x9F: 'ActionGotoFrame2'
  };
}
