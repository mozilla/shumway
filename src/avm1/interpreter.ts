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
  import isNumeric = Shumway.isNumeric;
  import notImplemented = Shumway.Debug.notImplemented;
  import Telemetry = Shumway.Telemetry;
  import assert = Shumway.Debug.assert;

  declare var Proxy;
  declare class Error {
    constructor(obj: string);
  }
  declare class InternalError extends Error {
    constructor(obj: string);
  }

  export var Debugger = {
    pause: false,
    breakpoints: {}
  };

  function avm1Warn(message: string, arg1?: any, arg2?: any, arg3?: any, arg4?: any) {
    if (avm1ErrorsEnabled.value) {
      try {
        throw new Error(message); // using throw as a way to break in browsers debugger
      } catch (e) { /* ignoring since handled */ }
    }
    if (avm1WarningsEnabled.value) {
      Debug.warning.apply(console, arguments);
    }
  }

  export var MAX_AVM1_HANG_TIMEOUT = 1000;
  export var CHECK_AVM1_HANG_EVERY = 1000;
  var MAX_AVM1_ERRORS_LIMIT = 1000;
  var MAX_AVM1_STACK_LIMIT = 256;

  enum AVM1ScopeListItemFlags {
    DEFAULT = 0,
    TARGET = 1,
    REPLACE_TARGET = 2
  }

  class AVM1ScopeListItem {
    flags: AVM1ScopeListItemFlags;
    replaceTargetBy: AVM1Object; // Very optional, set when REPLACE_TARGET used

    constructor (public scope: AVM1Object, public previousScopeItem: AVM1ScopeListItem) {
      this.flags = AVM1ScopeListItemFlags.DEFAULT;
    }
  }

  // Similar to function scope, mostly for 'this'.
  class GlobalPropertiesScope extends AVM1Object {
    constructor(context: AVM1Context, thisArg: AVM1Object) {
      super(context);
      this.alSetOwnProperty('this', new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA |
                                                               AVM1PropertyFlags.DONT_ENUM |
                                                               AVM1PropertyFlags.DONT_DELETE |
                                                               AVM1PropertyFlags.READ_ONLY,
                                                               thisArg));
      this.alSetOwnProperty('_global', new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA |
                                                                  AVM1PropertyFlags.DONT_ENUM |
                                                                  AVM1PropertyFlags.DONT_DELETE |
                                                                  AVM1PropertyFlags.READ_ONLY,
                                                                  context.globals));
    }
  }

  class AVM1CallFrame {
    public inSequence: boolean;

    public calleeThis: AVM1Object;
    public calleeSuper: AVM1Object; // set if super call was used
    public calleeFn: AVM1Function;
    public calleeArgs: any[];

    constructor(public previousFrame: AVM1CallFrame,
                public currentThis: AVM1Object,
                public fn: AVM1Function,
                public args: any[],
                public ectx: ExecutionContext) {
      this.inSequence = !previousFrame ? false :
        (previousFrame.calleeThis === currentThis && previousFrame.calleeFn === fn);

      this.resetCallee();
    }

    setCallee(thisArg: AVM1Object, superArg: AVM1Object, fn: AVM1Function, args: any[]) {
      this.calleeThis = thisArg;
      this.calleeSuper = superArg;
      this.calleeFn = fn;
      if (!release) {
        this.calleeArgs = args;
      }
    }

    resetCallee() {
      this.calleeThis = null;
      this.calleeSuper = null;
      this.calleeFn = null;
    }
  }

  class AVM1RuntimeUtilsImpl implements IAVM1RuntimeUtils {
    private  _context: AVM1Context;

    constructor(context: AVM1Context) {
      this._context = context;
    }

    public hasProperty(obj, name): boolean {
      return as2HasProperty(this._context, obj, name);
    }

    public getProperty(obj, name): any {
      return as2GetProperty(this._context, obj, name);
    }

    public setProperty(obj, name, value: any): void {
      return as2SetProperty(this._context, obj, name, value);
    }

    public warn(msg: string): void {
      avm1Warn.apply(null, arguments);
    }
  }

  class AVM1ContextImpl extends AVM1Context {
    initialScope: AVM1ScopeListItem;
    isActive: boolean;
    executionProhibited: boolean;
    abortExecutionAt: number;
    actionTracer: ActionTracer;
    stackDepth: number;
    frame: AVM1CallFrame;
    isTryCatchListening: boolean;
    errorsIgnored: number;
    deferScriptExecution: boolean;
    actions: Lib.AVM1NativeActions;

    constructor(loaderInfo: Shumway.AVMX.AS.flash.display.LoaderInfo) {
      var swfVersion = loaderInfo.swfVersion;
      super(swfVersion);

      this.loaderInfo = loaderInfo;
      this.sec = loaderInfo.sec; // REDUX:
      this.globals = Lib.AVM1Globals.createGlobalsObject(this);
      this.actions = new Lib.AVM1NativeActions(this);
      this.initialScope = new AVM1ScopeListItem(this.globals, null);
      this.utils = new AVM1RuntimeUtilsImpl(this);
      this.isActive = false;
      this.executionProhibited = false;
      this.actionTracer = avm1TraceEnabled.value ? new ActionTracer() : null;
      this.abortExecutionAt = 0;
      this.stackDepth = 0;
      this.frame = null;
      this.isTryCatchListening = false;
      this.errorsIgnored = 0;
      this.deferScriptExecution = true;
    }
    _getExecutionContext(): ExecutionContext {
      // We probably entering this function from some native function,
      // so faking execution context. Let's reuse last created context.
      return this.frame.ectx;
    }
    resolveTarget(target: any) : any {
      var ectx = this._getExecutionContext();
      return avm1ResolveTarget(ectx, target, true);
    }
    resolveRoot() : any {
      var ectx = this._getExecutionContext();
      return avm1ResolveRoot(ectx);
    }
    checkTimeout() {
      if (Date.now() >= this.abortExecutionAt) {
        throw new AVM1CriticalError('long running script -- AVM1 instruction hang timeout');
      }
    }
    pushCallFrame(thisArg: AVM1Object, fn: AVM1Function, args: any[], ectx: ExecutionContext) : AVM1CallFrame {
      var nextFrame = new AVM1CallFrame(this.frame, thisArg, fn, args, ectx);
      this.frame = nextFrame;
      return nextFrame;
    }
    popCallFrame() {
      var previousFrame = this.frame.previousFrame;
      this.frame = previousFrame;
      return previousFrame;
    }
    executeActions(actionsData: AVM1ActionsData, scopeObj): void {
      if (this.executionProhibited) {
        return; // no more avm1 for this context
      }

      var savedIsActive = this.isActive;
      if (!savedIsActive) {
        this.isActive = true;
        this.abortExecutionAt = avm1TimeoutDisabled.value ?
          Number.MAX_VALUE : Date.now() + MAX_AVM1_HANG_TIMEOUT;
        this.errorsIgnored = 0;
      }
      var caughtError;
      try {
        executeActionsData(this, actionsData, scopeObj);
      } catch (e) {
        caughtError = e;
      }
      this.isActive = savedIsActive;
      if (caughtError) {
        // Note: this doesn't use `finally` because that's a no-go for performance.
        throw caughtError;
      }
    }
    public executeFunction(fn: AVM1Function, thisArg, args: any[]): any {
      if (this.executionProhibited) {
        return; // no more avm1 for this context
      }

      var savedIsActive = this.isActive;
      if (!savedIsActive) {
        this.isActive = true;
        this.abortExecutionAt = avm1TimeoutDisabled.value ?
          Number.MAX_VALUE : Date.now() + MAX_AVM1_HANG_TIMEOUT;
        this.errorsIgnored = 0;
      }
      var caughtError;
      var result;
      try {
        result = fn.alCall(thisArg, args);
      } catch (e) {
        caughtError = e;
      }
      this.isActive = savedIsActive;
      if (caughtError) {
        // Note: this doesn't use `finally` because that's a no-go for performance.
        throw caughtError;
      }
      return result;
    }
  }

  AVM1Context.create = function(loaderInfo: Shumway.AVMX.AS.flash.display.LoaderInfo): AVM1Context {
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
      obj instanceof Lib.AVM1MovieClip;
  }

  function as2GetType(v): string {
    if (v === null) {
      return 'null';
    }

    var type = typeof v;
    if (typeof v === 'object') {
      if (v instanceof Lib.AVM1MovieClip) {
        return 'movieclip';
      }
      if (v instanceof AVM1Function) {
        return 'function';
      }
    }
    return type;
  }

  function as2ToAddPrimitive(context: AVM1Context, value: any): any {
    return alToPrimitive(context, value);
  }

  /**
   * Performs "less" comparison of two arugments.
   * @returns {boolean} Returns true if x is less than y, otherwise false
   */
  function as2Compare(context: AVM1Context, x: any, y: any): boolean {
    var x2 = alToPrimitive(context, x);
    var y2 = alToPrimitive(context, y);
    if (typeof x2 === 'string' && typeof y2 === 'string') {
      var xs = alToString(context, x2), ys = alToString(context, y2);
      return xs < ys;
    } else {
      var xn = alToNumber(context, x2), yn = alToNumber(context, y2);
      return isNaN(xn) || isNaN(yn) ? undefined : xn < yn;
    }
  }

  /**
   * Performs equality comparison of two arugments. The equality comparison
   * algorithm from EcmaScript 3, Section 11.9.3 is applied.
   * http://ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262,%203rd%20edition,%20December%201999.pdf#page=67
   * @returns {boolean} Coerces x and y to the same type and returns true if they're equal, false otherwise.
   */
  function as2Equals(context: AVM1Context, x: any, y: any): boolean {
    // Spec steps 1 through 13 can be condensed to ...
    if (typeof x === typeof y) {
      return x === y;
    }
    // Spec steps 14 and 15.
    if (x == null && y == null) {
      return true;
    }
    // Spec steps 16 and 17.
    if (typeof x === 'number' && typeof y === 'string') {
      // Unfolding the recursion for `as2Equals(context, x, alToNumber(y))`
      return y === '' ? false : x === +y; // in AVM1, ToNumber('') === NaN
    }
    if (typeof x === 'string' && typeof y === 'number') {
      // Unfolding the recursion for `as2Equals(context, alToNumber(x), y)`
      return x === '' ? false : +x === y; // in AVM1, ToNumber('') === NaN
    }
    // Spec step 18.
    if (typeof x === 'boolean') {
      // Unfolding the recursion for `as2Equals(context, alToNumber(x), y)`
      x = +x; // typeof x === 'number'
      if (typeof y === 'number' || typeof y === 'string') {
        return y === '' ? false : x === +y;
      }
      // Fall through for typeof y === 'object', 'boolean', 'undefined' cases
    }
    // Spec step 19.
    if (typeof y === 'boolean') {
      // Unfolding the recursion for `as2Equals(context, x, alToNumber(y))`
      y = +y; // typeof y === 'number'
      if (typeof x === 'number' || typeof x === 'string') {
        return x === '' ? false : +x === y;
      }
      // Fall through for typeof x === 'object', 'undefined' cases
    }
    // Spec step 20.
    if ((typeof x === 'number' || typeof x === 'string') &&
        typeof y === 'object' && y !== null) {
      y = alToPrimitive(context, y);
      if (typeof y === 'object') {
        return false; // avoiding infinite recursion
      }
      return as2Equals(context, x, y);
    }
    // Spec step 21.
    if (typeof x === 'object' && x !== null &&
        (typeof y === 'number' || typeof y === 'string')) {
      x = alToPrimitive(context, x);
      if (typeof x === 'object') {
        return false; // avoiding infinite recursion
      }
      return as2Equals(context, x, y);
    }
    return false;
  }

  function as2InstanceOf(obj, constructor): boolean {
    // TODO refactor this -- quick and dirty hack for now
    if (isNullOrUndefined(obj) || isNullOrUndefined(constructor)) {
      return false;
    }

    if (constructor === Shumway.AVMX.AS.ASString) {
      return typeof obj === 'string';
    } else if (constructor === Shumway.AVMX.AS.ASNumber) {
      return typeof obj === 'number';
    } else if (constructor === Shumway.AVMX.AS.ASBoolean) {
      return typeof obj === 'boolean';
    } else if (constructor === Shumway.AVMX.AS.ASArray) {
      return Array.isArray(obj);
    } else if (constructor === Shumway.AVMX.AS.ASFunction) {
      return typeof obj === 'function';
    } else if (constructor === Shumway.AVMX.AS.ASObject) {
      return typeof obj === 'object';
    }

    var baseProto = constructor.alGetPrototypeProperty();
    if (!baseProto) {
      return false;
    }
    var proto = obj;
    while (proto) {
      if (proto === baseProto) {
        return true; // found the type if the chain
      }
      proto = proto.alPrototype;
    }
    // TODO interface check
    return false;
  }

  function as2HasProperty(context: AVM1Context, obj: any, name: any): boolean {
    var avm1Obj: AVM1Object = alToObject(context, obj);
    name = context.normalizeName(name);
    return avm1Obj.alHasProperty(name);
  }

  function as2GetProperty(context: AVM1Context, obj: any, name: any): any {
    var avm1Obj: AVM1Object = alToObject(context, obj);
    return avm1Obj.alGet(name);
  }

  function as2SetProperty(context: AVM1Context, obj: any, name: any, value: any): void {
    var avm1Obj: AVM1Object = alToObject(context, obj);
    avm1Obj.alPut(name, value);
    as2SyncEvents(context, name);
  }

  function as2DeleteProperty(context: AVM1Context, obj: any, name: any): any {
    var avm1Obj: AVM1Object = alToObject(context, obj);
    name = context.normalizeName(name);
    var result = avm1Obj.alDeleteProperty(name);
    as2SyncEvents(context, name);
    return result;
  }

  function as2SyncEvents(context: AVM1Context, name): void {
    name = alCoerceString(context, name);
    if (name[0] !== 'o' || name[1] !== 'n') { // TODO check case?
      return;
    }
    // Maybe an event property, trying to broadcast change.
    (<AVM1ContextImpl>context).broadcastEventPropertyChange(name);
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
    if (alIsFunction(ctor)) {
      result = (<AVM1Function>ctor).alConstruct(args);
    } else {
      // AVM1 simply ignores attempts to invoke non-methods.
      return undefined;
    }
    return result;
  }

  function as2Enumerate(obj, fn: (name) => void, thisArg): void {
    var processed = Object.create(null); // TODO remove/refactor
    alForEachProperty(obj, function (name) {
      if (processed[name]) {
        return; // skipping already reported properties
      }
      fn.call(thisArg, name);
      processed[name] = true;
    }, thisArg);
  }

  function avm1FindSuperPropertyOwner(context: AVM1Context, frame: AVM1CallFrame, propertyName: string): AVM1Object {
    if (context.swfVersion < 6) {
      return null;
    }

    var proto: AVM1Object = (frame.inSequence && frame.previousFrame.calleeSuper);
    if (!proto) {
      // Finding first object in prototype chain link that has the property.
      proto = frame.currentThis;
      while (proto && !proto.alHasOwnProperty(propertyName)) {
        proto = proto.alPrototype;
      }
      if (!proto) {
        return null;
      }
    }

    // Skipping one chain link
    proto = proto.alPrototype;
    return proto;
  }

  var DEFAULT_REGISTER_COUNT = 4;

  function executeActionsData(context: AVM1ContextImpl, actionsData: AVM1ActionsData, scope) {
    var actionTracer = context.actionTracer;

    var globalPropertiesScopeList = new AVM1ScopeListItem(
      new GlobalPropertiesScope(context, scope), context.initialScope);
    var scopeList = new AVM1ScopeListItem(scope, globalPropertiesScopeList);
    scopeList.flags |= AVM1ScopeListItemFlags.TARGET;
    var caughtError;

    release || (actionTracer && actionTracer.message('ActionScript Execution Starts'));
    release || (actionTracer && actionTracer.indent());

    var ectx = ExecutionContext.create(context, scopeList, [], DEFAULT_REGISTER_COUNT);
    context.pushCallFrame(scope, null, null, ectx);
    try {
      interpretActionsData(ectx, actionsData);
    } catch (e) {
      caughtError = as2CastError(e);
    }
    ectx.dispose();

    if (caughtError instanceof AVM1CriticalError) {
      context.executionProhibited = true;
      console.error('Disabling AVM1 execution');
    }
    context.popCallFrame();
    release || (actionTracer && actionTracer.unindent());
    release || (actionTracer && actionTracer.message('ActionScript Execution Stops'));
    if (caughtError) {
      // Note: this doesn't use `finally` because that's a no-go for performance.
      throw caughtError; // TODO shall we just ignore it?
    }
  }

  function createBuiltinType(context: AVM1Context, cls, args: any[]): any {
    var builtins = context.builtins;
    var obj = undefined;
    if (cls === builtins.Array || cls === builtins.Object ||
        cls === builtins.Date || cls === builtins.String ||
        cls === builtins.Function) {
       obj = cls.alConstruct(args);
    }
    if (cls === builtins.Boolean || cls === builtins.Number) {
      obj = cls.alConstruct(args).value;
    }
    if (obj instanceof AVM1Object) {
      var desc = new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
                                            cls);
      (<AVM1Object>obj).alSetOwnProperty('__constructor__', desc);
    }
    return obj;
  }

  class AVM1SuperWrapper extends AVM1Object {
    public callFrame: AVM1CallFrame;
    public constructor(context: AVM1Context, callFrame: AVM1CallFrame) {
      super(context);
      this.callFrame = callFrame;
      this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
    }
  }

  class AVM1Arguments extends Natives.AVM1ArrayNative {
    public constructor(context: AVM1Context, args: any[],
                       callee: AVM1Function, caller: AVM1Function) {
      super(context, args);
      alDefineObjectProperties(this, {
        callee: {
          value: callee
        },
        caller: {
          value: caller
        }
      });
    }
  }

  class ExecutionContext {
    static MAX_CACHED_EXECUTIONCONTEXTS = 20;
    static cache: ExecutionContext[];

    static alInitStatic() {
      this.cache = [];
    }

    context: AVM1ContextImpl;
    actions: Lib.AVM1NativeActions;
    scopeList: AVM1ScopeListItem;
    constantPool: any[];
    registers: any[];
    stack: any[];
    frame: AVM1CallFrame;
    isSwfVersion5: boolean;
    recoveringFromError: boolean;
    isEndOfActions: boolean;

    constructor(context: AVM1ContextImpl, scopeList: AVM1ScopeListItem, constantPool: any[], registerCount: number) {
      this.context = context;
      this.actions = context.actions;
      this.isSwfVersion5 = context.swfVersion >= 5;
      this.registers = [];
      this.stack = [];
      this.frame = null;
      this.recoveringFromError = false;
      this.isEndOfActions = false;

      this.reset(scopeList, constantPool, registerCount);
    }

    reset(scopeList: AVM1ScopeListItem, constantPool: any[], registerCount: number) {
      this.scopeList = scopeList;
      this.constantPool = constantPool;
      this.registers.length = registerCount;
    }

    clean(): void {
      this.scopeList = null;
      this.constantPool = null;
      this.registers.length = 0;
      this.stack.length = 0;
      this.frame = null;
      this.recoveringFromError = false;
      this.isEndOfActions = false;
    }

    pushScope(newScopeList?: AVM1ScopeListItem): ExecutionContext  {
      var newContext = <ExecutionContext>Object.create(this);
      newContext.stack = [];
      if (!isNullOrUndefined(newScopeList)) {
        newContext.scopeList = newScopeList;
      }
      return newContext;
    }

    dispose() {
      this.clean();
      var state: typeof ExecutionContext = this.context.getStaticState(ExecutionContext);
      if (state.cache.length < ExecutionContext.MAX_CACHED_EXECUTIONCONTEXTS) {
        state.cache.push(this);
      }
    }

    static create(context: AVM1ContextImpl, scopeList: AVM1ScopeListItem, constantPool: any[], registerCount: number): ExecutionContext {
      var state: typeof ExecutionContext = context.getStaticState(ExecutionContext);
      var ectx: ExecutionContext;
      if (state.cache.length > 0) {
        ectx = state.cache.pop();
        ectx.reset(scopeList, constantPool, registerCount);
      } else {
        ectx = new ExecutionContext(context, scopeList, constantPool, registerCount);
      }
      return ectx;
    }
  }

  /**
   * Interpreted function closure.
   */
  class AVM1InterpreterScope extends AVM1Object {
    constructor(context: AVM1ContextImpl) {
      super(context);
      this.alPut('toString', new AVM1NativeFunction(context, this._toString));
    }

    _toString() {
      // It shall return 'this'
      return this;
    }
  }

  class AVM1InterpretedFunction extends AVM1EvalFunction {
    functionName: string;
    actionsData: AVM1ActionsData;
    parametersNames: string[];
    registersAllocation: ArgumentAssignment[];
    suppressArguments: ArgumentAssignmentType;

    scopeList: AVM1ScopeListItem;
    constantPool: any[];
    skipArguments: boolean[];
    registersLength: number;

    constructor(context: AVM1ContextImpl,
                ectx: ExecutionContext,
                actionsData: AVM1ActionsData,
                functionName: string,
                parametersNames: string[],
                registersCount: number,
                registersAllocation: ArgumentAssignment[],
                suppressArguments: ArgumentAssignmentType) {
      super(context);

      this.functionName = functionName;
      this.actionsData = actionsData;
      this.parametersNames = parametersNames;
      this.registersAllocation = registersAllocation;
      this.suppressArguments = suppressArguments;

      this.scopeList = ectx.scopeList;
      this.constantPool = ectx.constantPool;

      var skipArguments: boolean[] = null;
      var registersAllocationCount = !registersAllocation ? 0 : registersAllocation.length;
      for (var i = 0; i < registersAllocationCount; i++) {
        var registerAllocation = registersAllocation[i];
        if (registerAllocation &&
          registerAllocation.type === ArgumentAssignmentType.Argument) {
          if (!skipArguments) {
            skipArguments = [];
          }
          skipArguments[registersAllocation[i].index] = true;
        }
      }
      this.skipArguments = skipArguments;

      var registersLength = Math.min(registersCount, 255); // max allowed for DefineFunction2
      registersLength = Math.max(registersLength, registersAllocationCount + 1);
      this.registersLength = registersLength;
    }

    public alCall(thisArg: any, args?: any[]): any {
      var currentContext = <AVM1ContextImpl>this.context;
      if (currentContext.executionProhibited) {
        return; // no more avm1 execution, ever
      }

      var newScope = new AVM1InterpreterScope(currentContext);
      var newScopeList = new AVM1ScopeListItem(newScope, this.scopeList);
      var oldScope = this.scopeList.scope;

      thisArg = thisArg || oldScope; // REDUX no isGlobalObject check?
      args = args || [];

      var ectx = ExecutionContext.create(currentContext, newScopeList,
                                         this.constantPool, this.registersLength);
      var caller = currentContext.frame ? currentContext.frame.fn : undefined;
      var frame = currentContext.pushCallFrame(thisArg, this, args, ectx);

      var supperWrapper;
      var suppressArguments = this.suppressArguments;
      if (!(suppressArguments & ArgumentAssignmentType.Arguments)) {
        newScope.alPut('arguments', new AVM1Arguments(currentContext, args, this, caller));
      }
      if (!(suppressArguments & ArgumentAssignmentType.This)) {
        newScope.alPut('this', thisArg);
      }
      if (!(suppressArguments & ArgumentAssignmentType.Super)) {
        supperWrapper = new AVM1SuperWrapper(currentContext, frame);
        newScope.alPut('super', supperWrapper);
      }

      var i;
      var registers = ectx.registers;
      var registersAllocation = this.registersAllocation;
      var registersAllocationCount = !registersAllocation ? 0 : registersAllocation.length;
      for (i = 0; i < registersAllocationCount; i++) {
        var registerAllocation = registersAllocation[i];
        if (registerAllocation) {
          switch (registerAllocation.type) {
            case ArgumentAssignmentType.Argument:
              registers[i] = args[registerAllocation.index];
              break;
            case ArgumentAssignmentType.This:
              registers[i] = thisArg;
              break;
            case ArgumentAssignmentType.Arguments:
              registers[i] = new AVM1Arguments(currentContext, args, this, caller);
              break;
            case ArgumentAssignmentType.Super:
              supperWrapper = supperWrapper || new AVM1SuperWrapper(currentContext, frame);
              registers[i] = supperWrapper;
              break;
            case ArgumentAssignmentType.Global:
              registers[i] = currentContext.globals;
              break;
            case ArgumentAssignmentType.Parent:
              registers[i] = oldScope.alGet('_parent');
              break;
            case ArgumentAssignmentType.Root:
              registers[i] = avm1ResolveRoot(ectx);
              break;
          }
        }
      }
      var parametersNames = this.parametersNames;
      var skipArguments = this.skipArguments;
      for (i = 0; i < args.length || i < parametersNames.length; i++) {
        if (skipArguments && skipArguments[i]) {
          continue;
        }
        newScope.alPut(parametersNames[i], args[i]);
      }

      var result;
      var caughtError;
      var actionTracer = currentContext.actionTracer;
      var actionsData = this.actionsData;
      release || (actionTracer && actionTracer.indent());
      if (++currentContext.stackDepth >= MAX_AVM1_STACK_LIMIT) {
        throw new AVM1CriticalError('long running script -- AVM1 recursion limit is reached');
      }

      try {
        result = interpretActionsData(ectx, actionsData);
      } catch (e) {
        caughtError = e;
      }

      currentContext.stackDepth--;
      currentContext.popCallFrame();
      ectx.dispose();
      release || (actionTracer && actionTracer.unindent());
      if (caughtError) {
        // Note: this doesn't use `finally` because that's a no-go for performance.
        throw caughtError;
      }
      return result;
    }
  }

    function fixArgsCount(numArgs: number /* int */, maxAmount: number): number {
      if (isNaN(numArgs) || numArgs < 0) {
        avm1Warn('Invalid amount of arguments: ' + numArgs);
        return 0;
      }
      numArgs |= 0;
      if (numArgs > maxAmount) {
        avm1Warn('Truncating amount of arguments: from ' + numArgs + ' to ' + maxAmount);
        return maxAmount;
      }
      return numArgs;
    }
    function avm1ReadFunctionArgs(stack: any[]) {
      var numArgs = +stack.pop();
      numArgs = fixArgsCount(numArgs, stack.length);
      var args = [];
      for (var i = 0; i < numArgs; i++) {
        args.push(stack.pop());
      }
      return args;
    }
    function avm1SetTarget(ectx: ExecutionContext, targetPath: string) {
      var newTarget = null;
      if (targetPath) {
        try {
          newTarget = avm1ResolveTarget(ectx, targetPath, false);
          if (!avm1IsTarget(newTarget)) {
            avm1Warn('Invalid AVM1 target object: ' + targetPath);
            newTarget = undefined;
          }
        } catch (e) {
          avm1Warn('Unable to set target: ' + e);
        }
      }

      if (newTarget) {
        ectx.scopeList.flags |= AVM1ScopeListItemFlags.REPLACE_TARGET;
        ectx.scopeList.replaceTargetBy = newTarget;
      } else {
        ectx.scopeList.flags &= ~AVM1ScopeListItemFlags.REPLACE_TARGET;
        ectx.scopeList.replaceTargetBy = null;
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
                                suppressArguments: ArgumentAssignmentType): AVM1Function {
      return new AVM1InterpretedFunction(ectx.context, ectx, actionsData, functionName,
        parametersNames, registersCount, registersAllocation, suppressArguments);
    }

    function avm1VariableNameHasPath(variableName: string): boolean {
      return variableName && (variableName.indexOf('.') >= 0 || variableName.indexOf(':') >= 0 || variableName.indexOf('/') >= 0 );
    }

    const enum AVM1ResolveVariableFlags {
      READ = 1,
      WRITE = 2,
      DELETE = READ,
      GET_VALUE = 32,
      DISALLOW_TARGET_OVERRIDE = 64,
      ONLY_TARGETS = 128
    }

    interface IAVM1ResolvedVariableResult {
      scope: AVM1Object;
      propertyName: string;
      value: any;
    }

    var cachedResolvedVariableResult: IAVM1ResolvedVariableResult = {
      scope: null,
      propertyName: null,
      value: undefined
    };

    function avm1IsTarget(target): boolean {
      // TODO refactor
      return target instanceof AVM1Object && Lib.hasAS3ObjectReference(target);
    }

    function avm1ResolveSimpleVariable(scopeList: AVM1ScopeListItem, variableName: string, flags: AVM1ResolveVariableFlags): IAVM1ResolvedVariableResult {
      release || Debug.assert(alIsName(scopeList.scope.context, variableName));
      var currentTarget;
      var resolved = cachedResolvedVariableResult;
      for (var p = scopeList; p; p = p.previousScopeItem) {
        if ((p.flags & AVM1ScopeListItemFlags.REPLACE_TARGET) &&
            !(flags & AVM1ResolveVariableFlags.DISALLOW_TARGET_OVERRIDE) &&
            !currentTarget) {
          currentTarget = p.replaceTargetBy;
        }
        if ((p.flags & AVM1ScopeListItemFlags.TARGET)) {
          if ((flags & AVM1ResolveVariableFlags.WRITE)) {
            // last scope/target we can modify (exclude globals)
            resolved.scope = currentTarget || p.scope;
            resolved.propertyName = variableName;
            resolved.value = (flags & AVM1ResolveVariableFlags.GET_VALUE) ? resolved.scope.alGet(variableName) : undefined;
            return resolved;
          }
          if ((flags & AVM1ResolveVariableFlags.READ) && currentTarget) {
            if (currentTarget.alHasProperty(variableName)) {
              resolved.scope = currentTarget;
              resolved.propertyName = variableName;
              resolved.value = (flags & AVM1ResolveVariableFlags.GET_VALUE) ? currentTarget.alGet(variableName) : undefined;
              return resolved;
            }
            continue;
          }
        }

        if (p.scope.alHasProperty(variableName)) {
          resolved.scope = p.scope;
          resolved.propertyName = variableName;
          resolved.value = (flags & AVM1ResolveVariableFlags.GET_VALUE) ? p.scope.alGet(variableName) : undefined;
          return resolved;
        }
      }

      release || Debug.assert(!(flags & AVM1ResolveVariableFlags.WRITE));
      return undefined;
    }

    function avm1ResolveVariable(ectx: ExecutionContext, variableName: string, flags: AVM1ResolveVariableFlags): IAVM1ResolvedVariableResult {
      // For now it is just very much magical -- designed to pass some of the swfdec tests
      // FIXME refactor
      release || Debug.assert(variableName);
      // Canonicalizing the name here is ok even for paths: the only thing that (potentially)
      // happens is that the name is converted to lower-case, which is always valid for paths.
      // The original name is saved because the final property name needs to be extracted from
      // it for property name paths.
      var originalName = variableName;
      variableName = ectx.context.normalizeName(variableName);
      if (!avm1VariableNameHasPath(variableName)) {
        return avm1ResolveSimpleVariable(ectx.scopeList, variableName, flags);
      }

      var i = 0, j = variableName.length;
      var markedAsTarget = true;
      var resolved, ch, needsScopeResolution;
      var propertyName = null, scope = null, obj = undefined;
      if (variableName[0] === '/') {
        resolved = avm1ResolveSimpleVariable(ectx.scopeList, '_root', AVM1ResolveVariableFlags.READ | AVM1ResolveVariableFlags.GET_VALUE);
        if (resolved) {
          propertyName = resolved.propertyName;
          scope = resolved.scope;
          obj = resolved.value;
        }
        i++;
        needsScopeResolution = false;
      } else {
        resolved = null;
        needsScopeResolution = true;
      }

      if (i >= j) {
        return resolved;
      }

      var q = i;
      while (i < j) {
        if (!needsScopeResolution && !(obj instanceof AVM1Object)) {
          avm1Warn('Unable to resolve variable on invalid object ' + variableName.substring(q, i - 1) + ' (expr ' + variableName + ')');
          return null;
        }

        var propertyName;
        var q = i;
        if (variableName[i] === '.' && variableName[i + 1] === '.') {
          i += 2;
          propertyName = '_parent';
        } else {
          while (i < j && ((ch = variableName[i]) !== '/' && ch !== '.' && ch !== ':')) {
            i++;
          }
          propertyName = variableName.substring(q, i);
        }
        if (propertyName === '' && i < j) {
          // Ignoring double delimiters in the middle of the path
          i++;
          continue;
        }

        scope = obj;
        var valueFound = false;

        if (markedAsTarget) {
          // Trying movie clip children first
          var child = obj instanceof Lib.AVM1MovieClip ? (<Lib.AVM1MovieClip>obj)._lookupChildByName(propertyName) : undefined;
          if (child) {
            valueFound = true;
            obj = child;
          }
        }
        if (!valueFound) {
          if (needsScopeResolution) {
            resolved = avm1ResolveSimpleVariable(ectx.scopeList, propertyName, flags);
            if (resolved) {
              valueFound = true;
              propertyName = resolved.propertyName;
              scope = resolved.scope;
              obj = resolved.value;
            }
            needsScopeResolution = false;
          } else if (obj.alHasProperty(propertyName)) {
            obj = obj.alGet(propertyName);
            valueFound = true;
          }
        }
        if (!valueFound && propertyName[0] === '_') {
          // FIXME hacking to pass some swfdec test cases
          if (propertyName === '_level0') {
            obj = ectx.context.resolveLevel(0);
            valueFound = true;
          } else if (propertyName === '_root') {
            obj = avm1ResolveRoot(ectx);
            valueFound = true;
          }
        }

        if (!valueFound && !(flags & AVM1ResolveVariableFlags.WRITE)) {
          avm1Warn('Unable to resolve ' + propertyName + ' on ' + variableName.substring(q, i - 1) +
                   ' (expr ' + variableName + ')');
          return null;
        }

        if (i >= j) {
          break;
        }

        var delimiter = variableName[i++];
        if (delimiter === '/' && ((ch = variableName[i]) === ':' || ch === '.')) {
          delimiter = variableName[i++];
        }
        markedAsTarget = delimiter === '/';
      }

      resolved = cachedResolvedVariableResult;
      resolved.scope = scope;
      resolved.propertyName = originalName.substring(q, i);
      resolved.value = (flags & AVM1ResolveVariableFlags.GET_VALUE) ? obj : undefined;
      return resolved;
    }


    function avm1GetTarget(ectx: ExecutionContext, allowOverride: boolean): AVM1Object  {
      var scopeList = ectx.scopeList;
      for (var p = scopeList; p.previousScopeItem; p = p.previousScopeItem) {
        if ((p.flags & AVM1ScopeListItemFlags.REPLACE_TARGET) &&
            allowOverride) {
          return p.replaceTargetBy;
        }
        if ((p.flags & AVM1ScopeListItemFlags.TARGET)) {
          return p.scope;
        }
      }

      release || Debug.assert(false, 'Shall not reach this statement');
      return undefined;
    }

    function avm1ResolveTarget(ectx: ExecutionContext, target: any, fromCurrentTarget: boolean): AVM1Object {
      var result: AVM1Object;
      if (avm1IsTarget(target)) {
        result = target;
      } else {
        target = isNullOrUndefined(target) ? '' : alToString(this, target);
        if (target) {
          var targetPath = alToString(ectx.context, target);
          var resolved = avm1ResolveVariable(ectx, targetPath,
            AVM1ResolveVariableFlags.READ |
            AVM1ResolveVariableFlags.ONLY_TARGETS |
            AVM1ResolveVariableFlags.GET_VALUE |
            (fromCurrentTarget ? 0 : AVM1ResolveVariableFlags.DISALLOW_TARGET_OVERRIDE));
          if (!resolved || !avm1IsTarget(resolved.value)) {
            avm1Warn('Invalid AVM1 target object: ' + targetPath);
            result = undefined;
          } else {
            result = resolved.value;
          }
        } else {
          result = avm1GetTarget(ectx, true);
        }
      }
      return result;
    }

    function avm1ResolveRoot(ectx: ExecutionContext): AVM1Object {
      var target = avm1GetTarget(ectx, true);
      return (<Lib.AVM1MovieClip>target).get_root();
    }

    function avm1ProcessWith(ectx: ExecutionContext, obj, withBlock) {
      if (isNullOrUndefined(obj)) {
        // Not executing anything in the block.
        avm1Warn('The with statement object cannot be undefined.');
        return;
      }
      var context = ectx.context;
      var scopeList = ectx.scopeList;

      var newScopeList = new AVM1ScopeListItem(alToObject(context, obj), scopeList);
      var newEctx = ectx.pushScope(newScopeList);
      interpretActionsData(newEctx, withBlock);
    }
    function avm1ProcessTry(ectx: ExecutionContext,
                            catchIsRegisterFlag, finallyBlockFlag,
                            catchBlockFlag, catchTarget,
                            tryBlock, catchBlock, finallyBlock) {
      var currentContext = ectx.context;
      var scopeList = ectx.scopeList;
      var registers = ectx.registers;

      var savedTryCatchState = currentContext.isTryCatchListening;
      var caughtError;
      try {
        currentContext.isTryCatchListening = true;
        interpretActionsData(ectx.pushScope(), tryBlock);
      } catch (e) {
        currentContext.isTryCatchListening = savedTryCatchState;
        if (!catchBlockFlag || !(e instanceof AVM1Error)) {
          caughtError = e;
        } else {
          if (typeof catchTarget === 'string') { // TODO catchIsRegisterFlag?
            var scope = scopeList.scope;
            scope.alPut(catchTarget, e.error);
          } else {
            registers[catchTarget] = e.error;
          }
          interpretActionsData(ectx.pushScope(), catchBlock);
        }
      }
      currentContext.isTryCatchListening = savedTryCatchState;
      if (finallyBlockFlag) {
        interpretActionsData(ectx.pushScope(), finallyBlock);
      }
      if (caughtError) {
        throw caughtError;
      }
    }

    // SWF 3 actions
    function avm1_0x81_ActionGotoFrame(ectx: ExecutionContext, args: any[]) {
      var frame: number = args[0];
      var play: boolean = args[1];
      if (play) {
        ectx.actions.gotoAndPlay(frame + 1);
      } else {
        ectx.actions.gotoAndStop(frame + 1);
      }
    }
    function avm1_0x83_ActionGetURL(ectx: ExecutionContext, args: any[]) {
      var actions = ectx.actions;

      var urlString: string = args[0];
      var targetString: string = args[1];
      ectx.actions.getURL(urlString, targetString);
    }
    function avm1_0x04_ActionNextFrame(ectx: ExecutionContext) {
      ectx.actions.nextFrame();
    }
    function avm1_0x05_ActionPreviousFrame(ectx: ExecutionContext) {
      ectx.actions.prevFrame();
    }
    function avm1_0x06_ActionPlay(ectx: ExecutionContext) {
      ectx.actions.play();
    }
    function avm1_0x07_ActionStop(ectx: ExecutionContext) {
      ectx.actions.stop();
    }
    function avm1_0x08_ActionToggleQuality(ectx: ExecutionContext) {
      ectx.actions.toggleHighQuality();
    }
    function avm1_0x09_ActionStopSounds(ectx: ExecutionContext) {
      ectx.actions.stopAllSounds();
    }
    function avm1_0x8A_ActionWaitForFrame(ectx: ExecutionContext, args: any[]) {
      var frame: number = args[0];
      var count: number = args[1];
      return !ectx.actions.ifFrameLoaded(frame);
    }
    function avm1_0x8B_ActionSetTarget(ectx: ExecutionContext, args: any[]) {
      var targetName: string = args[0];
      avm1SetTarget(ectx, targetName);
    }
    function avm1_0x8C_ActionGoToLabel(ectx: ExecutionContext, args: any[]) {
      var label: string = args[0];
      var play: boolean = args[1];
      if (play) {
        ectx.actions.gotoAndPlay(label);
      } else {
        ectx.actions.gotoAndStop(label);
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
          var registerNumber = (<ParsedPushRegisterAction> value).registerNumber;
          if (registerNumber < 0 || registerNumber >= registers.length) {
            stack.push(undefined);
          } else {
            stack.push(registers[registerNumber]);
          }
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

      var a = alToNumber(ectx.context, stack.pop());
      var b = alToNumber(ectx.context, stack.pop());
      stack.push(a + b);
    }
    function avm1_0x0B_ActionSubtract(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = alToNumber(ectx.context, stack.pop());
      var b = alToNumber(ectx.context, stack.pop());
      stack.push(b - a);
    }
    function avm1_0x0C_ActionMultiply(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = alToNumber(ectx.context, stack.pop());
      var b = alToNumber(ectx.context, stack.pop());
      stack.push(a * b);
    }
    function avm1_0x0D_ActionDivide(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var a = alToNumber(ectx.context, stack.pop());
      var b = alToNumber(ectx.context, stack.pop());
      var c = b / a;
      stack.push(isSwfVersion5 ? <any>c : isFinite(c) ? <any>c : '#ERROR#');
    }
    function avm1_0x0E_ActionEquals(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var a = alToNumber(ectx.context, stack.pop());
      var b = alToNumber(ectx.context, stack.pop());
      var f = a == b;
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    function avm1_0x0F_ActionLess(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var a = alToNumber(ectx.context, stack.pop());
      var b = alToNumber(ectx.context, stack.pop());
      var f = b < a;
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    function avm1_0x10_ActionAnd(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var a = alToBoolean(ectx.context, stack.pop());
      var b = alToBoolean(ectx.context, stack.pop());
      var f = a && b;
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    function avm1_0x11_ActionOr(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var a = alToBoolean(ectx.context, stack.pop());
      var b = alToBoolean(ectx.context, stack.pop());
      var f = a || b;
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    function avm1_0x12_ActionNot(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var f = !alToBoolean(ectx.context, stack.pop());
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    function avm1_0x13_ActionStringEquals(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var sa = alToString(ectx.context, stack.pop());
      var sb = alToString(ectx.context, stack.pop());
      var f = sa == sb;
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    function avm1_0x14_ActionStringLength(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var sa = alToString(ectx.context, stack.pop());
      stack.push(ectx.actions.length_(sa));
    }
    function avm1_0x31_ActionMBStringLength(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var sa = alToString(ectx.context, stack.pop());
      stack.push(ectx.actions.length_(sa));
    }
    function avm1_0x21_ActionStringAdd(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var sa = alToString(ectx.context, stack.pop());
      var sb = alToString(ectx.context, stack.pop());
      stack.push(sb + sa);
    }
    function avm1_0x15_ActionStringExtract(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var count = stack.pop();
      var index = stack.pop();
      var value = alToString(ectx.context, stack.pop());
      stack.push(ectx.actions.substring(value, index, count));
    }
    function avm1_0x35_ActionMBStringExtract(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var count = stack.pop();
      var index = stack.pop();
      var value = alToString(ectx.context, stack.pop());
      stack.push(ectx.actions.mbsubstring(value, index, count));
    }
    function avm1_0x29_ActionStringLess(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var sa = alToString(ectx.context, stack.pop());
      var sb = alToString(ectx.context, stack.pop());
      var f = sb < sa;
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    function avm1_0x18_ActionToInteger(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var value = alToInt32(ectx.context, stack.pop());
      stack.push(value);
    }
    function avm1_0x32_ActionCharToAscii(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var ch = stack.pop();
      var charCode = ectx.actions.ord(ch);
      stack.push(charCode);
    }
    function avm1_0x36_ActionMBCharToAscii(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var ch = stack.pop();
      var charCode = ectx.actions.mbord(ch);
      stack.push(charCode);
    }
    function avm1_0x33_ActionAsciiToChar(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var charCode = +stack.pop();
      var ch = ectx.actions.chr(charCode);
      stack.push(ch);
    }
    function avm1_0x37_ActionMBAsciiToChar(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var charCode = +stack.pop();
      var ch = ectx.actions.mbchr(charCode);
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

      var label = stack.pop();
      ectx.actions.call(label);
    }
    function avm1_0x1C_ActionGetVariable(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var variableName = '' + stack.pop();

      var sp = stack.length;
      stack.push(undefined);

      var resolved = avm1ResolveVariable(ectx, variableName,
        AVM1ResolveVariableFlags.READ | AVM1ResolveVariableFlags.GET_VALUE);
      if (isNullOrUndefined(resolved)) {
        if (avm1WarningsEnabled.value) {
          avm1Warn("AVM1 warning: cannot look up variable '" + variableName + "'");
        }
        return;
      }
      stack[sp] = resolved.value;
    }
    function avm1_0x1D_ActionSetVariable(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var value = stack.pop();
      var variableName = '' + stack.pop();
      var resolved = avm1ResolveVariable(ectx, variableName, AVM1ResolveVariableFlags.WRITE);
      if (!resolved) {
        if (avm1WarningsEnabled.value) {
          avm1Warn("AVM1 warning: cannot look up variable '" + variableName + "'");
        }
        return;
      }
      release || assert(resolved.propertyName);
      resolved.scope.alPut(resolved.propertyName, value);
      as2SyncEvents(ectx.context, resolved.propertyName);
    }
    function avm1_0x9A_ActionGetURL2(ectx: ExecutionContext, args: any[]) {
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
      var loadVariablesFlag = flags & 1 << 7;
      if (loadVariablesFlag) {
        ectx.actions.loadVariables(url, target, sendVarsMethod);
      } else if (!loadTargetFlag) {
        ectx.actions.getURL(url, target, sendVarsMethod);
      } else {
        ectx.actions.loadMovie(url, target, sendVarsMethod);
      }
    }
    function avm1_0x9F_ActionGotoFrame2(ectx: ExecutionContext, args: any[]) {
      var stack = ectx.stack;

      var flags: number = args[0];
      var gotoParams = [stack.pop()];
      if (!!(flags & 2)) {
        gotoParams.push(args[1]);
      }
      var gotoMethod = !!(flags & 1) ? ectx.actions.gotoAndPlay : ectx.actions.gotoAndStop;
      gotoMethod.apply(ectx.actions, gotoParams);
    }
    function avm1_0x20_ActionSetTarget2(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var target = alToString(ectx.context, stack.pop());
      avm1SetTarget(ectx, target);
    }
    function avm1_0x22_ActionGetProperty(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var index = stack.pop();
      var target = stack.pop();

      var sp = stack.length;
      stack.push(undefined);

      var resolved = avm1ResolveTarget(ectx, target, true);
      var propertyName = MovieClipProperties[index];
      if (resolved && propertyName) {
        stack[sp] = resolved.alGet(propertyName);
      }
    }
    function avm1_0x23_ActionSetProperty(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var value = stack.pop();
      var index = stack.pop();
      var target = stack.pop();

      var resolved = avm1ResolveTarget(ectx, target, true);
      var propertyName = MovieClipProperties[index];
      if (resolved && propertyName) {
        resolved.alPut(propertyName, value);
      }
    }
    function avm1_0x24_ActionCloneSprite(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var depth = stack.pop();
      var target = stack.pop();
      var source = stack.pop();
      ectx.actions.duplicateMovieClip(source, target, depth);
    }
    function avm1_0x25_ActionRemoveSprite(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var target = stack.pop();
      ectx.actions.removeMovieClip(target);
    }
    function avm1_0x27_ActionStartDrag(ectx: ExecutionContext) {
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
      ectx.actions.startDrag.apply(ectx.actions, dragParams);
    }
    function avm1_0x28_ActionEndDrag(ectx: ExecutionContext) {
      ectx.actions.stopDrag();
    }
    function avm1_0x8D_ActionWaitForFrame2(ectx: ExecutionContext, args: any[]) {
      var stack = ectx.stack;

      var count: number = args[0];
      var frame = stack.pop();
      return !ectx.actions.ifFrameLoaded(frame);
    }
    function avm1_0x26_ActionTrace(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var value = stack.pop();
      ectx.actions.trace(value);
    }
    function avm1_0x34_ActionGetTime(ectx: ExecutionContext) {
      var stack = ectx.stack;

      stack.push(ectx.actions.getTimer());
    }
    function avm1_0x30_ActionRandomNumber(ectx: ExecutionContext) {
      var stack = ectx.stack;

      stack.push(ectx.actions.random(stack.pop()));
    }
    // SWF 5
    function avm1_0x3D_ActionCallFunction(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var functionName = stack.pop();
      var args = avm1ReadFunctionArgs(stack);

      var sp = stack.length;
      stack.push(undefined);

      var resolved = avm1ResolveVariable(ectx, functionName,
        AVM1ResolveVariableFlags.READ | AVM1ResolveVariableFlags.GET_VALUE);
      if (isNullOrUndefined(resolved)) {
        avm1Warn("AVM1 warning: cannot look up function '" + functionName + "'");
        return;
      }
      var fn = resolved.value;
      // AVM1 simply ignores attempts to invoke non-functions.
      if (!alIsFunction(fn)) {
        avm1Warn("AVM1 warning: function '" + functionName +
                                          (fn ? "' is not callable" : "' is undefined"));
        return;
      }
      release || assert(stack.length === sp + 1);
      // REDUX
      stack[sp] = fn.alCall(resolved.scope || null, args);
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

      var frame: AVM1CallFrame = ectx.context.frame;
      var superArg: AVM1Object;
      var fn: AVM1Function;

      // Per spec, a missing or blank method name causes the container to be treated as
      // a function to call.
      if (isNullOrUndefined(methodName) || methodName === '') {
        if (obj instanceof AVM1SuperWrapper) {
          var superFrame = (<AVM1SuperWrapper>obj).callFrame;
          superArg = avm1FindSuperPropertyOwner(ectx.context, superFrame, '__constructor__');
          if (superArg) {
            fn = superArg.alGet('__constructor__');
            target = superFrame.currentThis;
          }
        } else {
          // For non-super calls, we call obj with itself as the target.
          // TODO: ensure this is correct.
          fn = obj;
          target = obj;
        }
        // AVM1 simply ignores attempts to invoke non-functions.
        if (alIsFunction(fn)) {
          frame.setCallee(target, superArg, fn, args);
          stack[sp] = fn.alCall(target, args);
          frame.resetCallee();
        } else {
          avm1Warn("AVM1 warning: obj '" + obj + (obj ? "' is not callable" : "' is undefined"));
        }
        release || assert(stack.length === sp + 1);
        return;
      }

      if (obj instanceof AVM1SuperWrapper) {
        var superFrame = (<AVM1SuperWrapper>obj).callFrame;
        var superArg = avm1FindSuperPropertyOwner(ectx.context, superFrame, methodName);
        if (superArg) {
          fn = superArg.alGet(methodName);
          target = superFrame.currentThis;
        }
     } else {
        fn = as2GetProperty(ectx.context, obj, methodName);
        target = alToObject(ectx.context, obj);
      }

      // AVM1 simply ignores attempts to invoke non-methods.
      if (!alIsFunction(fn)) {
        avm1Warn("AVM1 warning: method '" + methodName + "' on object", obj,
                                        (isNullOrUndefined(fn) ?
                                                               "is undefined" :
                                                               "is not callable"));
        return;
      }
      release || assert(stack.length === sp + 1);
      frame.setCallee(target, superArg, fn, args);
      stack[sp] = fn.alCall(target, args);
      frame.resetCallee();
    }
    function avm1_0x88_ActionConstantPool(ectx: ExecutionContext, args: any[]) {
      var constantPool: any[] = args[0];
      ectx.constantPool = constantPool;
    }
    function avm1_0x9B_ActionDefineFunction(ectx: ExecutionContext, args: any[]) {
      var stack = ectx.stack;

      var functionBody = args[0];
      var functionName: string = args[1];
      var functionParams: string[] = args[2];

      var fn = avm1DefineFunction(ectx, functionBody, functionName,
        functionParams, 4, null, 0);
      if (functionName) {
        var scope = ectx.scopeList.scope;
        scope.alPut(functionName, fn);
        as2SyncEvents(ectx.context, functionName);
      } else {
        stack.push(fn);
      }
    }
    function avm1_0x3C_ActionDefineLocal(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var scope = ectx.scopeList.scope;

      var value = stack.pop();
      var name = stack.pop();
      scope.alPut(name, value);
    }
    function avm1_0x41_ActionDefineLocal2(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var scope = ectx.scopeList.scope;

      var name = stack.pop();
      scope.alPut(name, undefined);
    }
    function avm1_0x3A_ActionDelete(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var name = stack.pop();
      var obj = stack.pop();
      if (Shumway.isNullOrUndefined(obj)) {
        // AVM1 just ignores delete on non-existant containers.
        avm1Warn("AVM1 warning: cannot delete member '" + name + "' on undefined object");
        return;
      }
      stack.push(as2DeleteProperty(ectx.context, obj, name));
      as2SyncEvents(ectx.context, name);
    }
    function avm1_0x3B_ActionDelete2(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var name = stack.pop();
      var resolved = avm1ResolveVariable(ectx, name, AVM1ResolveVariableFlags.DELETE);
      if (isNullOrUndefined(resolved)) {
        avm1Warn("AVM1 warning: cannot look up variable '" + name + "'");
        return;
      }
      stack.push(as2DeleteProperty(ectx.context, resolved.scope, name));
      as2SyncEvents(ectx.context, name);
    }
    function avm1_0x46_ActionEnumerate(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var objectName = stack.pop();
      stack.push(null);
      var resolved = avm1ResolveVariable(ectx, objectName,
        AVM1ResolveVariableFlags.READ | AVM1ResolveVariableFlags.GET_VALUE);
      if (isNullOrUndefined(resolved)) {
        avm1Warn("AVM1 warning: cannot look up variable '" + objectName + "'");
        return;
      }
      var obj = resolved.value;
      if (isNullOrUndefined(obj)) {
        avm1Warn("AVM1 warning: cannot iterate over undefined object");
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
      stack.push(as2Equals(ectx.context, a, b));
    }
    function avm1_0x4E_ActionGetMember(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var name = stack.pop();
      var obj = stack.pop();
      stack.push(undefined);

      if (isNullOrUndefined(obj)) {
        // AVM1 just ignores gets on non-existant containers.
        avm1Warn("AVM1 warning: cannot get member '" + name + "' on undefined object");
        return;
      }

      if (obj instanceof AVM1SuperWrapper) {
        var superFrame = (<AVM1SuperWrapper>obj).callFrame;
        var superArg = avm1FindSuperPropertyOwner(ectx.context, superFrame, name);
        if (superArg) {
          stack[stack.length - 1] = superArg.alGet(name);
        }
        return;
      }

      stack[stack.length - 1] = as2GetProperty(ectx.context, obj, name);
    }
    function avm1_0x42_ActionInitArray(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var obj = new Natives.AVM1ArrayNative(ectx.context, avm1ReadFunctionArgs(stack));
      stack.push(obj);
    }
    function avm1_0x43_ActionInitObject(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var count = +stack.pop();
      count = fixArgsCount(count, stack.length >> 1);
      var obj: AVM1Object = alNewObject(ectx.context);
      for (var i = 0; i < count; i++) {
        var value = stack.pop();
        var name = stack.pop();
        obj.alPut(name, value);
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
        ctor = as2GetProperty(ectx.context, obj, methodName);
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

      var resolved = avm1ResolveVariable(ectx, objectName,
        AVM1ResolveVariableFlags.READ | AVM1ResolveVariableFlags.GET_VALUE);
      if (isNullOrUndefined(resolved)) {
        avm1Warn("AVM1 warning: cannot look up object '" + objectName + "'");
        return;
      }
      var obj = resolved.value;
      var result = createBuiltinType(ectx.context, obj, args);
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

      if (obj instanceof AVM1SuperWrapper) {
        avm1Warn("AVM1 warning: cannot set member '" + name + "' on super");
        return;
      }

      as2SetProperty(ectx.context, obj, name, value);
    }
    function avm1_0x45_ActionTargetPath(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var obj = stack.pop();
      stack.push(isAVM1MovieClip(obj) ? obj._target : void(0));
    }
    function avm1_0x94_ActionWith(ectx: ExecutionContext, args: any[]) {
      var stack = ectx.stack;

      var withBody = args[0];
      var obj = stack.pop();

      avm1ProcessWith(ectx, obj, withBody);
    }
    function avm1_0x4A_ActionToNumber(ectx: ExecutionContext) {
      var stack = ectx.stack;

      stack.push(alToNumber(ectx.context, stack.pop()));
    }
    function avm1_0x4B_ActionToString(ectx: ExecutionContext) {
      var stack = ectx.stack;

      stack.push(alToString(ectx.context, stack.pop()));
    }
    function avm1_0x44_ActionTypeOf(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var obj = stack.pop();
      var result = as2GetType(obj);
      stack.push(result);
    }
    function avm1_0x47_ActionAdd2(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = as2ToAddPrimitive(ectx.context, stack.pop());
      var b = as2ToAddPrimitive(ectx.context, stack.pop());
      if (typeof a === 'string' || typeof b === 'string') {
        stack.push(alToString(ectx.context, b) + alToString(ectx.context, a));
      } else {
        stack.push(alToNumber(ectx.context, b) + alToNumber(ectx.context, a));
      }
    }
    function avm1_0x48_ActionLess2(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = stack.pop();
      var b = stack.pop();
      stack.push(as2Compare(ectx.context, b, a));
    }
    function avm1_0x3F_ActionModulo(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = alToNumber(ectx.context, stack.pop());
      var b = alToNumber(ectx.context, stack.pop());
      stack.push(b % a);
    }
    function avm1_0x60_ActionBitAnd(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = alToInt32(ectx.context, stack.pop());
      var b = alToInt32(ectx.context, stack.pop());
      stack.push(b & a);
    }
    function avm1_0x63_ActionBitLShift(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = alToInt32(ectx.context, stack.pop());
      var b = alToInt32(ectx.context, stack.pop());
      stack.push(b << a);
    }
    function avm1_0x61_ActionBitOr(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = alToInt32(ectx.context, stack.pop());
      var b = alToInt32(ectx.context, stack.pop());
      stack.push(b | a);
    }
    function avm1_0x64_ActionBitRShift(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = alToInt32(ectx.context, stack.pop());
      var b = alToInt32(ectx.context, stack.pop());
      stack.push(b >> a);
    }
    function avm1_0x65_ActionBitURShift(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = alToInt32(ectx.context, stack.pop());
      var b = alToInt32(ectx.context, stack.pop());
      stack.push(b >>> a);
    }
    function avm1_0x62_ActionBitXor(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = alToInt32(ectx.context, stack.pop());
      var b = alToInt32(ectx.context, stack.pop());
      stack.push(b ^ a);
    }
    function avm1_0x51_ActionDecrement(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = alToNumber(ectx.context, stack.pop());
      a--;
      stack.push(a);
    }
    function avm1_0x50_ActionIncrement(ectx: ExecutionContext) {
      var stack = ectx.stack;

      var a = alToNumber(ectx.context, stack.pop());
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
      if (register < 0 || register >= registers.length) {
        return; // ignoring bad registers references
      }
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
      stack.push(as2Compare(ectx.context, a, b));
    }
    function avm1_0x68_ActionStringGreater(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var isSwfVersion5 = ectx.isSwfVersion5;

      var sa = alToString(ectx.context, stack.pop());
      var sb = alToString(ectx.context, stack.pop());
      var f = sb > sa;
      stack.push(isSwfVersion5 ? <any>f : f ? 1 : 0);
    }
    // SWF 7
    function avm1_0x8E_ActionDefineFunction2(ectx: ExecutionContext, args: any[]) {
      var stack = ectx.stack;
      var scope = ectx.scopeList.scope;

      var functionBody = args[0];
      var functionName: string = args[1];
      var functionParams: string[] = args[2];
      var registerCount: number = args[3];
      var registerAllocation = args[4];
      var suppressArguments = args[5];

      var fn = avm1DefineFunction(ectx, functionBody, functionName,
        functionParams, registerCount, registerAllocation, suppressArguments);
      if (functionName) {
        scope.alPut(functionName, fn);
        as2SyncEvents(ectx.context, functionName);
      } else {
        stack.push(fn);
      }
    }
    function avm1_0x69_ActionExtends(ectx: ExecutionContext) {
      var stack = ectx.stack;
      var context = ectx.context;

      var constrSuper = alToObject(context, stack.pop());
      var constr = alToObject(context, stack.pop());
      var prototype = constr.alGetPrototypeProperty();
      var prototypeSuper = constrSuper.alGetPrototypeProperty();
      prototype.alPrototype = prototypeSuper;
      var desc = new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
                                            constrSuper);
      prototype.alSetOwnProperty('__constructor__', desc);
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
      fixArgsCount(count, stack.length);
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

      var args = avm1ReadFunctionArgs(stack);

      var sp = stack.length;
      stack.push(undefined);

      var result = ectx.actions.fscommand.apply(ectx.actions, args);
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
            // REDUX
            //var avm2 = Shumway.AVM2.Runtime.AVM2;
            //avm2.instance.exceptions.push({source: 'avm1', message: e.message,
            //  stack: e.stack});
            //executionContext.recoveringFromError = true;
          }
        }
      };
    }

    export function generateActionCalls() {
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

      var actionTracer = executionContext.context.actionTracer;
      release || (actionTracer && actionTracer.print(parsedAction, stack));

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
          // REDUX
          //var avm2 = Shumway.AVM2.Runtime.AVM2;
          //avm2.instance.exceptions.push({source: 'avm1', message: e.message,
          //  stack: e.stack});
          executionContext.recoveringFromError = true;
        }
      }
      return result;
    }

    function analyzeAndCompileActionsData(ectx: ExecutionContext, actionsData: AVM1ActionsData): void {
      var context = ectx.context;
      var compiled;

      if (avm1WellknownActionsCompilationsEnabled.value) {
        compiled = findWellknowCompilation(actionsData, context);
        if (compiled) {
          actionsData.compiled = compiled;
          return;
        }
      }

      var parser = new ActionsDataParser(actionsData, context.swfVersion);
      var analyzer = new ActionsDataAnalyzer();
      analyzer.registersLimit = ectx.registers.length;
      analyzer.parentResults = actionsData.parent && <AnalyzerResults>actionsData.parent.ir;
      var ir: AnalyzerResults = analyzer.analyze(parser);
      actionsData.ir = ir;

      if (avm1CompilerEnabled.value) {
        try {
          var c = new ActionsDataCompiler();
          compiled = c.generate(ir);
          actionsData.compiled = compiled;
        } catch (e) {
          console.error('Unable to compile AVM1 function: ' + e);
        }
      }

    }

    function interpretActionsData(ectx: ExecutionContext, actionsData: AVM1ActionsData) {
      if (!actionsData.ir && !actionsData.compiled) {
        analyzeAndCompileActionsData(ectx, actionsData);
      }

      var currentContext = ectx.context;
      var scopeList = ectx.scopeList;

      var scope = scopeList.scope;
      var as3Object = (<any>scope)._as3Object; // FIXME refactor
      if (as3Object && as3Object._deferScriptExecution) {
        currentContext.deferScriptExecution = true;
      }

      var compiled = actionsData.compiled;
      if (compiled) {
        release || (currentContext.actionTracer && currentContext.actionTracer.message('Running compiled ' + actionsData.id));
        return compiled(ectx);
      }

      var instructionsExecuted = 0;
      var abortExecutionAt = currentContext.abortExecutionAt;

      if (avm1DebuggerEnabled.value &&
          (Debugger.pause || Debugger.breakpoints[(<AnalyzerResults>ir).dataId])) {
        debugger;
      }

      var ir = actionsData.ir;
      release || Debug.assert(ir);

      var position = 0;
      var nextAction: ActionCodeBlockItem = (<AnalyzerResults>ir).actions[position];
      // will try again if we are skipping errors
      while (nextAction && !ectx.isEndOfActions) {
        // let's check timeout/Date.now every some number of instructions
        if (instructionsExecuted++ % CHECK_AVM1_HANG_EVERY === 0 && Date.now() >= abortExecutionAt) {
          throw new AVM1CriticalError('long running script -- AVM1 instruction hang timeout');
        }

        var shallBranch: boolean = interpretActionWithRecovery(ectx, nextAction.action);
        if (shallBranch) {
          position = nextAction.conditionalJumpTo;
        } else {
          position = nextAction.next;
        }
        nextAction = (<AnalyzerResults>ir).actions[position];
      }
      var stack = ectx.stack;
      return stack.pop();
    }

  class ActionTracer {
    private _indentation = 0;
    private _indentStringCache = [];
    private _getIndentString(): string {
      return this._indentStringCache[this._indentation] ||
        (this._indentStringCache[this._indentation] = new Array(this._indentation + 1).join('..'));
    }
    print(parsedAction: ParsedAction, stack: any[]): void {
      var position: number = parsedAction.position;
      var actionCode: number = parsedAction.actionCode;
      var actionName: string = parsedAction.actionName;
      var stackDump = [];
      for (var q = 0; q < stack.length; q++) {
        var item = stack[q];
        if (item && typeof item === 'object') {
          var constr = item.alGetConstructorProperty();
          stackDump.push('[' + (constr ? constr.name : 'Object') + ']');

        } else {
          stackDump.push(item);
        }
      }

      console.log('AVM1 trace: ' + this._getIndentString() + position + ': ' +
                  actionName + '(' + actionCode.toString(16) + '), ' +
                  'stack=' + stackDump);
    }
    indent(): void {
      this._indentation++;
    }
    unindent(): void {
      this._indentation--;
    }
    message(msg: string): void {
      console.log('AVM1 trace: ------- ' + msg);
    }
  }

  export enum MovieClipProperties {
    _x,
    _y,
    _xscale,
    _yscale,
    _currentframe,
    _totalframes,
    _alpha,
    _visible,
    _width,
    _height,
    _rotation,
    _target,
    _framesloaded,
    _name,
    _droptarget,
    _url,
    _highquality,
    _focusrect,
    _soundbuftime,
    _quality,
    _xmouse,
    _ymouse
  }
}
