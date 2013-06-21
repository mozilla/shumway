/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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
/*global AS2Globals, AS2MovieClip, Multiname, ActionsDataStream,
         createBuiltinType */

var AVM1_TRACE_ENABLED = false;
var AVM1_ERRORS_IGNORED = true;
var MAX_AVM1_INSTRUCTIONS_LIMIT = 100000;
var MAX_AVM1_ERRORS_LIMIT = 1000;

function AS2ScopeListItem(scope, next) {
  this.scope = scope;
  this.next = next;
}
AS2ScopeListItem.prototype = {
  create: function (scope) {
    return new AS2ScopeListItem(scope, this);
  }
};

function AS2Context(swfVersion) {
  this.swfVersion = swfVersion;
  this.globals = new AS2Globals(this);
  this.initialScope = new AS2ScopeListItem(this.globals, null);
  this.assets = {};
  this.instructionsExecuted = 0;
  this.errorsIgnored = 0;
  this.deferScriptExecution = true;
  this.pendingScripts = [];
}
AS2Context.instance = null;
AS2Context.prototype = {
  addAssets: function(assets) {
    for (var i = 0; i < assets.length; i++) {
      if (assets[i].className) {
        this.assets[assets[i].className] = assets[i];
      }
    }
  },
  resolveTarget: function(target) {
    if (!target) {
      target = this.defaultTarget;
    } else if (typeof target === 'string') {
      target = lookupAS2Children(target, this.defaultTarget, this.globals._root);
    }
    if (typeof target !== 'object' || target === null ||
        !('$nativeObject' in target)) {
      throw new Error('Invalid AS2 target object: ' +
                      Object.prototype.toString.call(target));
    }

    return target;
  },
  resolveLevel: function(level) {
    return this.resolveTarget(this.globals['_level' + level]);
  },
  addToPendingScripts: function (fn) {
    if (!this.deferScriptExecution) {
      return fn();
    }
    this.pendingScripts.push(fn);
  },
  flushPendingScripts: function () {
    var scripts = this.pendingScripts;
    while (scripts.length) {
      scripts.shift()();
    }
    this.deferScriptExecution = false;
  }
};
function AS2Error(error) {
  this.error = error;
}

function as2GetType(v) {
  if (v === null) {
    return 'null';
  }

  var type = typeof v;
  if (type === 'function') {
    return 'object';
  }
  if (type === 'object' && v instanceof AS2MovieClip) {
    return 'movieclip';
  }
  return type;
}

function as2ToPrimitive(value) {
  return as2GetType(value) !== 'object' ? value : value.valueOf();
}

function as2ToAddPrimitive(value) {
  if (as2GetType(value) !== 'object') {
    return value;
  }

  if (value instanceof Date && AS2Context.instance.swfVersion >= 6) {
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
  case 'object':
    return true;
  }
}

function as2ToNumber(value) {
  value = as2ToPrimitive(value);
  switch (as2GetType(value)) {
  case 'undefined':
  case 'null':
    return AS2Context.instance.swfVersion >= 7 ? NaN : 0;
  default:
    return AS2Context.instance.swfVersion >= 5 ? NaN : 0;
  case 'null':
    return NaN;
  case 'boolean':
    return value ? 1 : +0;
  case 'number':
    return value;
  case 'string':
    if (value === '' && AS2Context.instance.swfVersion < 5) {
      return 0;
    }
    return +value;
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
  return (result < 0 ? -1 : 1) * Math.floor(Math.abs(result));
}

function as2ToInt32(value) {
  var result = as2ToNumber(value);
  return (isNaN(result) || !isFinite(result) || result === 0) ? 0 :
    (result | 0);
}

function as2ToString(value) {
  switch (as2GetType(value)) {
  case 'undefined':
    return AS2Context.instance.swfVersion >= 7 ? 'undefined' : '';
  case 'null':
    return 'null';
  case 'boolean':
    return value ? 'true' : 'false';
  case 'number':
    return value.toString();
  case 'string':
    return value;
  case 'undefined':
    return 'undefined';
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
    return avm2PublicName;
  }
  if (name in obj) {
    return name;
  }
  var lowerCaseName = name.toLowerCase();
  for (var i in obj) {
    if (i.toLowerCase() === lowerCaseName) {
      return i;
    }
  }
  return null;
}

function executeActions(actionsData, context, scope, assets) {
  var actionTracer = ActionTracerFactory.get();

  var scopeContainer = context.initialScope.create(scope);
  var savedContext = AS2Context.instance;
  try {
    AS2Context.instance = context;
    context.defaultTarget = scope;
    context.globals['this'] = scope;
    if (assets) {
      context.addAssets(assets);
    }
    actionTracer.message('ActionScript Execution Starts');
    actionTracer.indent();
    interpretActions(actionsData, scopeContainer, null, []);
  } finally {
    context.instructionsExecuted = 0;
    context.errorsIgnored = 0;

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

function interpretActions(actionsData, scopeContainer,
                          constantPool, registers) {
  var currentContext = AS2Context.instance;

  function setTarget(targetPath) {
    if (!targetPath) {
      currentContext.defaultTarget = scope;
      return;
    }

    try {
      currentContext.defaultTarget =
        lookupAS2Children(targetPath, defaultTarget, _global._root);
    } catch (e) {
      currentContext.defaultTarget = null;
      throw e;
    }
  }

  function defineFunction(functionName, parametersNames,
                          registersAllocation, actionsData) {
    var fn = (function() {
      var newScope = { 'this': this, 'arguments': arguments };
      var newScopeContainer = scopeContainer.create(newScope);
      var i;

      for (i = 0; i < arguments.length || i < parametersNames.length; i++) {
        newScope[parametersNames[i]] = arguments[i];
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
                throw new Error('Not implemented: super');
              case '_global':
                registers[i] = _global;
                break;
              case '_parent':
                registers[i] = _global._parent;
                break;
              case '_root':
                registers[i] = _global._root;
                break;
            }
          }
        }
      }

      var savedContext = AS2Context.instance;
      var resetCounters;
      try
      {
        // switching contexts if called outside main thread
        AS2Context.instance = currentContext;
        resetCounters = currentContext.instructionsExecuted === 0;
        currentContext.defaultTarget = scope;
        actionTracer.indent();
        return interpretActions(actionsData, newScopeContainer,
          constantPool, registers);
      } finally {
        if (resetCounters) {
          currentContext.instructionsExecuted = 0;
          currentContext.errorsIgnored = 0;
        }
        actionTracer.unindent();
        currentContext.defaultTarget = defaultTarget;
        AS2Context.instance = savedContext;
      }
    });
    if (functionName) {
      fn.name = functionName;
    }
    return fn;
  }
  function deleteProperty(propertyName) {
    for (var p = scopeContainer; p; p = p.next) {
      if (propertyName in p.scope) {
        p.scope[propertyName] = undefined; // in some cases we need to cleanup events binding
        delete p.scope[propertyName];
        return !(propertyName in p.scope);
      }
    }
    return false;
  }
  function resolveVariableName(variableName) {
    var obj, name, i;
    if (variableName.indexOf(':') >= 0) {
      // "/A/B:FOO references the FOO variable in the movie clip with a target path of /A/B."
      var parts = variableName.split(':');
      obj = lookupAS2Children(parts[0], defaultTarget, _global._root);
      name = parts[1];
    } else if (variableName.indexOf('.') >= 0) {
      // new object reference
      var objPath = variableName.split('.');
      name = objPath.pop();
      obj = _global;
      for (i = 0; i < objPath.length; i++) {
        obj = obj[objPath[i]];
        if (!obj) {
          throw new Error(objPath.slice(0, i + 1) + ' is undefined');
        }
      }
    }

    if (!obj) {
      return; // local variable
    }

    var resolvedName = as2ResolveProperty(obj, name);
    return { obj: obj, name: resolvedName || name };
  }
  function getVariable(variableName) {
    // fast check if variable in the current scope
    if (variableName in scope) {
      return scope[variableName];
    }

    var target = resolveVariableName(variableName);
    if (target) {
      return target.obj[target.name];
    }
    // trying movie clip children (if object is a MovieClip)
    var mc = defaultTarget instanceof AS2MovieClip &&
             defaultTarget.$lookupChild(variableName);
    if (mc) {
      return mc;
    }
    for (var p = scopeContainer; p; p = p.next) {
      var resolvedName = as2ResolveProperty(p.scope, variableName);
      if (resolvedName) {
        return p.scope[resolvedName];
      }
    }
  }
  function setVariable(variableName, value) {
    // fast check if variable in the current scope
    if (variableName in scope) {
      scope[variableName] = value;
      return;
    }

    var target = resolveVariableName(variableName);
    if (target) {
      target.obj[target.name] = value;
      return;
    }
    var _this = scope.this || getVariable('this');
    _this[variableName] = value;
  }
  function getFunction(functionName) {
    var fn = getVariable(functionName);
    if (!(fn instanceof Function)) {
      throw new Error('Function "' + functionName + '" is not found');
    }
    return fn;
  }
  function getObjectByName(objectName) {
    var obj = getVariable(objectName);
    if (!(obj instanceof Object)) {
      throw new Error('Object "' + objectName + '" is not found');
    }
    return obj;
  }
  function processWith(obj, withBlock) {
    var newScopeContainer = scopeContainer.create(Object(obj));
    interpretActions(withBlock, newScopeContainer, constantPool, registers);
  }
  function processTry(catchIsRegisterFlag, finallyBlockFlag, catchBlockFlag, catchTarget,
                      tryBlock, catchBlock, finallyBlock) {
    try {
      interpretActions(tryBlock, scopeContainer, constantPool, registers);
    } catch (e) {
      if (!catchBlockFlag) {
        throw e;
      }
      if (!(e instanceof AS2Error)) {
        throw e;
      }
      if (typeof catchTarget === 'string') {
        scope[catchTarget] = e.error;
      } else {
        registers[catchTarget] = e.error;
      }
      interpretActions(catchBlock, scopeContainer, constantPool, registers);
    } finally {
      if (finallyBlockFlag) {
        interpretActions(finallyBlock, scopeContainer, constantPool, registers);
      }
    }
  }
  function validateArgsCount(numArgs, maxAmount) {
    if (isNaN(numArgs) || numArgs < 0 || numArgs > maxAmount ||
        numArgs != (0|numArgs)) {
      throw new Error('Invalid number of arguments: ' + numArgs);
    }
  }
  function readArgs(stack) {
    var numArgs = +stack.pop();
    validateArgsCount(numArgs, stack.length);
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(stack.pop());
    }
    return args;
  }

  var stream = new ActionsDataStream(actionsData, currentContext.swfVersion);
  var _global = currentContext.globals;
  var defaultTarget = currentContext.defaultTarget;
  var stack = [];
  var scope = scopeContainer.scope;
  var isSwfVersion5 = currentContext.swfVersion >= 5;
  var actionTracer = ActionTracerFactory.get();
  var nextPosition;

  if (scope.$nativeObject && scope.$nativeObject._deferScriptExecution) {
    currentContext.deferScriptExecution = true;
  }

  function skipActions(count) {
    while (count > 0 && stream.position < stream.end) {
      var actionCode = stream.readUI8();
      var length = actionCode >= 0x80 ? stream.readUI16() : 0;
      stream.position += length;
      count--;
    }
    nextPosition = stream.position;
  }

  var recoveringFromError = false;
  var executionAborted = false;
  var stackItemsExpected;
  // will try again if we are skipping errors
  while (stream.position < stream.end && !executionAborted) {
    try {

  while (stream.position < stream.end) {
    if (currentContext.instructionsExecuted++ >= MAX_AVM1_INSTRUCTIONS_LIMIT) {
      executionAborted = true;
      throw new Error('long running script -- AVM1 instruction limit is reached');
    }

    var actionCode = stream.readUI8();
    var length = actionCode >= 0x80 ? stream.readUI16() : 0;
    nextPosition = stream.position + length;
    stackItemsExpected = 0;

    actionTracer.print(stream.position, actionCode, stack);

    var frame, type, count, index, target, method, constr, codeSize, offset;
    var name, variableName, methodName, functionName, targetName;
    var paramName, resolvedName, objectName;
    var value, a, b, c, f, sa, sb, obj, args, fn, result, flags, i;
    var dragParams, register;
    switch (actionCode | 0) {
      // SWF 3 actions
      case 0x81: // ActionGotoFrame
        frame = stream.readUI16();
        _global.gotoAndPlay(frame + 1);
        break;
      case 0x83: // ActionGetURL
        var urlString = stream.readString();
        var targetString = stream.readString();
        _global.getURL(urlString, targetString);
        break;
      case 0x04: // ActionNextFrame
        _global.nextFrame();
        break;
      case 0x05: // ActionPreviousFrame
        _global.prevFrame();
        break;
      case 0x06: // ActionPlay
        _global.play();
        break;
      case 0x07: // ActionStop
        _global.stop();
        break;
      case 0x08: // ActionToggleQuality
        _global.toggleHighQuality();
        break;
      case 0x09: // ActionStopSounds
        _global.stopAllSounds();
        break;
      case 0x8A: // ActionWaitForFrame
        frame = stream.readUI16();
        count = stream.readUI8();
        if (!_global.ifFrameLoaded(frame)) {
          skipActions(count);
        }
        break;
      case 0x8B: // ActionSetTarget
        targetName = stream.readString();
        setTarget(targetName);
        break;
      case 0x8C: // ActionGoToLabel
        var label = stream.readString();
        _global.gotoLabel(label);
        break;
      // SWF 4 actions
      case 0x96: // ActionPush
        while (stream.position < nextPosition) {
          type = stream.readUI8();
          switch (type) {
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
        break;
      case 0x17: // ActionPop
        stack.pop();
        break;
      case 0x0A: // ActionAdd
        a = as2ToNumber(stack.pop());
        b = as2ToNumber(stack.pop());
        stack.push(a + b);
        break;
      case 0x0B: // ActionSubtract
        a = as2ToNumber(stack.pop());
        b = as2ToNumber(stack.pop());
        stack.push(b - a);
        break;
      case 0x0C: // ActionMultiply
        a = as2ToNumber(stack.pop());
        b = as2ToNumber(stack.pop());
        stack.push(a * b);
        break;
      case 0x0D: // ActionDivide
        a = as2ToNumber(stack.pop());
        b = as2ToNumber(stack.pop());
        c = b / a;
        stack.push(isSwfVersion5 ? c : isFinite(c) ? c : '#ERROR#');
        break;
      case 0x0E: // ActionEquals
        a = as2ToNumber(stack.pop());
        b = as2ToNumber(stack.pop());
        f = a == b;
        stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        break;
      case 0x0F: // ActionLess
        a = as2ToNumber(stack.pop());
        b = as2ToNumber(stack.pop());
        f = b < a;
        stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        break;
      case 0x10: // ActionAnd
        a = as2ToBoolean(stack.pop());
        b = as2ToBoolean(stack.pop());
        f = a && b;
        stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        break;
      case 0x11: // ActionOr
        a = as2ToBoolean(stack.pop());
        b = as2ToBoolean(stack.pop());
        f = a || b;
        stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        break;
      case 0x12: // ActionNot
        f = !as2ToBoolean(stack.pop());
        stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        break;
      case 0x13: // ActionStringEquals
        sa = as2ToString(stack.pop());
        sb = as2ToString(stack.pop());
        f = sa == sb;
        stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        break;
      case 0x14: // ActionStringLength
      case 0x31: // ActionMBStringLength
        sa = as2ToString(stack.pop());
        stack.push(_global.length(sa));
        break;
      case 0x21: // ActionStringAdd
        sa = as2ToString(stack.pop());
        sb = as2ToString(stack.pop());
        stack.push(sb + sa);
        break;
      case 0x15: // ActionStringExtract
        count = stack.pop();
        index = stack.pop();
        value = as2ToString(stack.pop());
        stack.push(_global.substring(value, index, count));
        break;
      case 0x35: // ActionMBStringExtract
        count = stack.pop();
        index = stack.pop();
        value = as2ToString(stack.pop());
        stack.push(_global.mbsubstring(value, index, count));
        break;
      case 0x29: // ActionStringLess
        sa = as2ToString(stack.pop());
        sb = as2ToString(stack.pop());
        f = sb < sa;
        stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        break;
      case 0x18: // ActionToInteger
        stack.push(_global.int(stack.pop()));
        break;
      case 0x32: // ActionCharToAscii
        stack.push(_global.chr(stack.pop()));
        break;
      case 0x36: // ActionMBCharToAscii
        stack.push(_global.mbchr(stack.pop()));
        break;
      case 0x33: // ActionAsciiToChar
        stack.push(_global.ord(stack.pop()));
        break;
      case 0x37: // ActionMBAsciiToChar
        stack.push(_global.mbord(stack.pop()));
        break;
      case 0x99: // ActionJump
        offset = stream.readSI16();
        nextPosition += offset;
        break;
      case 0x9D: // ActionIf
        offset = stream.readSI16();
        f = !!stack.pop();
        if (f) {
          nextPosition += offset;
        }
        break;
      case 0x9E: // ActionCall
        label = stack.pop();
        _global.call(label);
        break;
      case 0x1C: // ActionGetVariable
        variableName = '' + stack.pop();
        stackItemsExpected++;
        stack.push(getVariable(variableName));
        break;
      case 0x1D: // ActionSetVariable
        value = stack.pop();
        variableName = '' + stack.pop();
        setVariable(variableName, value);
        break;
      case 0x9A: // ActionGetURL2
        flags = stream.readUI8();
        var httpMethod;
        switch ((flags >> 6) & 3) {
          case 1:
            httpMethod = 'GET';
            break;
          case 2:
            httpMethod  = 'POST';
            break;
        }
        var loadMethod = !!(flags & 2) ?
          (!!(flags & 1) ? _global.loadVariables : _global.loadMovie) :
          (!!(flags & 1) ? _global.loadVariablesNum : _global.loadMovieNum);
        target = stack.pop();
        var url = stack.pop();
        loadMethod.call(_global, url, target, httpMethod);
        break;
      case 0x9F: // ActionGotoFrame2
        flags = stream.readUI8();
        var gotoParams = [stack.pop()];
        if (!!(flags & 2)) {
          gotoParams.push(stream.readUI16());
        }
        var gotoMethod = !!(flags & 1) ? _global.gotoAndPlay : _global.gotoAndStop;
        gotoMethod.apply(_global, gotoParams);
        break;
      case 0x20: // ActionSetTarget2
        target = stack.pop();
        setTarget(target);
        break;
      case 0x22: // ActionGetProperty
        index = stack.pop();
        target = stack.pop();
        stackItemsExpected++;
        stack.push(_global.getProperty(target, index));
        break;
      case 0x23: // ActionSetProperty
        value = stack.pop();
        index = stack.pop();
        target = stack.pop();
        _global.setProperty(target, index, value);
        break;
      case 0x24: // ActionCloneSprite
        var depth = stack.pop();
        target = stack.pop();
        var source = stack.pop();
        _global.duplicateMovieClip(source, target, depth);
        break;
      case 0x25: // ActionRemoveSprite
        target = stack.pop();
        _global.unloadMovie(target);
        break;
      case 0x27: // ActionStartDrag
        target = stack.pop();
        var lockcenter = stack.pop();
        var constrain = !stack.pop() ? null : {
          y2: stack.pop(),
          x2: stack.pop(),
          y1: stack.pop(),
          x1: stack.pop()
        };
        dragParams = [target, lockcenter];
        if (constrain) {
          dragParams = dragParams.push(constrain.x1, constrain.y1,
            constrain.x2, constrain.y2);
        }
        _global.startDrag.apply(_global, dragParams);
        break;
      case 0x28: // ActionEndDrag
        _global.stopDrag();
        break;
      case 0x8D: // ActionWaitForFrame2
        count = stream.readUI8();
        frame = stack.pop();
        if (!_global.ifFrameLoaded(frame)) {
          skipActions(count);
        }
        break;
      case 0x26: // ActionTrace
        value = stack.pop();
        _global.trace(value);
        break;
      case 0x34: // ActionGetTime
        stack.push(_global.getTimer());
        break;
      case 0x30: // ActionRandomNumber
        stack.push(_global.random(stack.pop()));
        break;
      // SWF 5
      case 0x3D: // ActionCallFunction
        functionName = stack.pop();
        args = readArgs(stack);
        stackItemsExpected++;
        fn = getFunction(functionName);
        result = fn.apply(scope, args);
        stack.push(result);
        break;
      case 0x52: // ActionCallMethod
        methodName = stack.pop();
        obj = stack.pop();
        args = readArgs(stack);
        stackItemsExpected++;
        if (methodName) {
          obj = Object(obj);
          resolvedName = as2ResolveProperty(obj, methodName);
          if (!resolvedName) {
            throw new Error('Method ' + methodName + ' is not defined.');
          }
          result = obj[resolvedName].apply(obj, args);
        } else {
          result = obj.apply(defaultTarget, args);
        }
        stack.push(result);
        break;
      case 0x88: // ActionConstantPool
        count = stream.readUI16();
        constantPool = [];
        for (i = 0; i < count; i++) {
          constantPool.push(stream.readString());
        }
        break;
      case 0x9B: // ActionDefineFunction
        functionName = stream.readString();
        count = stream.readUI16();
        args = [];
        for (i = 0; i < count; i++) {
          args.push(stream.readString());
        }
        codeSize = stream.readUI16();
        nextPosition += codeSize;

        fn = defineFunction(functionName, args, null,
                            stream.readBytes(codeSize));
        if (functionName) {
          scope[functionName] = fn;
        } else {
          stack.push(fn);
        }
        break;
      case 0x3C: // ActionDefineLocal
        value = stack.pop();
        name = stack.pop();
        scope[name] = value;
        break;
      case 0x41: // ActionDefineLocal2
        name = stack.pop();
        scope[name] = void(0);
        break;
      case 0x3A: // ActionDelete
        name = stack.pop();
        obj = stack.pop();
        obj[name] = undefined; // in some cases we need to cleanup events binding
        delete obj[name];
        stack.push(!(name in obj));
        break;
      case 0x3B: // ActionDelete2
        name = stack.pop();
        result = deleteProperty(name);
        stack.push(result);
        break;
      case 0x46: // ActionEnumerate
        objectName = stack.pop();
        stack.push(null);
        obj = getObjectByName(objectName);
        for (name in obj) {
          stack.push(name);
        }
        break;
      case 0x49: // ActionEquals2
        a = stack.pop();
        b = stack.pop();
        stack.push(a == b);
        break;
      case 0x4E: // ActionGetMember
        name = stack.pop();
        obj = stack.pop();
        resolvedName = as2ResolveProperty(obj, name);
        stack.push(obj[resolvedName || name]);
        break;
      case 0x42: // ActionInitArray
        obj = readArgs(stack);
        stack.push(obj);
        break;
      case 0x43: // ActionInitObject
        count = +stack.pop();
        validateArgsCount(count, stack.length >> 1);
        obj = {};
        for (i = 0; i < count; i++) {
          value = stack.pop();
          name = stack.pop();
          obj[name] = value;
        }
        stack.push(obj);
        break;
      case 0x53: // ActionNewMethod
        methodName = stack.pop();
        obj = stack.pop();
        args = readArgs(stack);
        stackItemsExpected++;
        if (methodName) {
          resolvedName = as2ResolveProperty(obj, methodName);
          if (!resolvedName) {
            throw new Error('Method ' + methodName + ' is not defined.');
          }
          method = obj[resolvedName];
        } else {
          method = obj;
        }
        // XXX: this is non-semantics-preserving, but it's
        // necessary to make constructors for runtime objects
        // work.
        result = new (method.bind.apply(method, [null].concat(args)))();
        if (!result) {
          result = Object.create(method.prototype || Object.prototype);
          result.constructor = method;
          method.apply(result, args);
        }
        stack.push(result);
        break;
      case 0x40: // ActionNewObject
        objectName = stack.pop();
        obj = getObjectByName(objectName);
        args = readArgs(stack);
        stackItemsExpected++;
        result = createBuiltinType(obj, args);
        if (typeof result === 'undefined') {
          // obj in not a built-in type
          result = Object.create(obj.prototype || Object.prototype);
          obj.apply(result, args);
          result.constructor = obj;
        }
        stack.push(result);
        break;
      case 0x4F: // ActionSetMember
        value = stack.pop();
        name = stack.pop();
        obj = stack.pop();
        obj[name] = value;
        break;
      case 0x45: // ActionTargetPath
        obj = stack.pop();
        stack.push(as2GetType(obj) === 'movieclip' ? obj._target : void(0));
        break;
      case 0x94: // ActionWith
        codeSize = stream.readUI16();
        obj = stack.pop();
        nextPosition += codeSize;
        processWith(obj, stream.readBytes(codeSize));
        break;
      case 0x4A: // ActionToNumber
        stack.push(as2ToNumber(stack.pop()));
        break;
      case 0x4B: // ActionToString
        stack.push(as2ToString(stack.pop()));
        break;
      case 0x44: // ActionTypeOf
        obj = stack.pop();
        result = as2GetType(obj);
        stack.push(result);
        break;
      case 0x47: // ActionAdd2
        a = as2ToAddPrimitive(stack.pop());
        b = as2ToAddPrimitive(stack.pop());
        if (typeof a === 'string' || typeof b === 'string') {
          stack.push(as2ToString(b) + as2ToString(a));
        } else {
          stack.push(as2ToNumber(b) + as2ToNumber(a));
        }
        break;
      case 0x48: // ActionLess2
        a = stack.pop();
        b = stack.pop();
        stack.push(as2Compare(b, a));
        break;
      case 0x3F: // ActionModulo
        a = as2ToNumber(stack.pop());
        b = as2ToNumber(stack.pop());
        stack.push(b % a);
        break;
      case 0x60: // ActionBitAnd
        a = as2ToInt32(stack.pop());
        b = as2ToInt32(stack.pop());
        stack.push(b & a);
        break;
      case 0x63: // ActionBitLShift
        a = as2ToInt32(stack.pop());
        b = as2ToInt32(stack.pop());
        stack.push(b << a);
        break;
      case 0x61: // ActionBitOr
        a = as2ToInt32(stack.pop());
        b = as2ToInt32(stack.pop());
        stack.push(b | a);
        break;
      case 0x64: // ActionBitRShift
        a = as2ToInt32(stack.pop());
        b = as2ToInt32(stack.pop());
        stack.push(b >> a);
        break;
      case 0x65: // ActionBitURShift
        a = as2ToInt32(stack.pop());
        b = as2ToInt32(stack.pop());
        stack.push(b >>> a);
        break;
      case 0x62: // ActionBitXor
        a = as2ToInt32(stack.pop());
        b = as2ToInt32(stack.pop());
        stack.push(b ^ a);
        break;
      case 0x51: // ActionDecrement
        a = as2ToNumber(stack.pop());
        a--;
        stack.push(a);
        break;
      case 0x50: // ActionIncrement
        a = as2ToNumber(stack.pop());
        a++;
        stack.push(a);
        break;
      case 0x4C: // ActionPushDuplicate
        stack.push(stack[stack.length - 1]);
        break;
      case 0x3E: // ActionReturn
        return stack.pop(); // return
      case 0x4D: // ActionStackSwap
        stack.push(stack.pop(), stack.pop());
        break;
      case 0x87: // ActionStoreRegister
        register = stream.readUI8();
        registers[register] = stack[stack.length - 1];
        break;
      // SWF 6
      case 0x54: // ActionInstanceOf
        constr = stack.pop();
        obj = stack.pop();
        stack.push(as2InstanceOf(Object(obj), constr));
        break;
      case 0x55: // ActionEnumerate2
        obj = stack.pop();
        stack.push(null);
        for (name in obj) {
          stack.push(name);
        }
        break;
      case 0x66: // ActionStrictEquals
        a = stack.pop();
        b = stack.pop();
        stack.push(b === a);
        break;
      case 0x67: // ActionGreater
        a = stack.pop();
        b = stack.pop();
        stack.push(as2Compare(a, b));
        break;
      case 0x68: // ActionStringGreater
        sa = as2ToString(stack.pop());
        sb = as2ToString(stack.pop());
        f = sb > sa;
        stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        break;
      // SWF 7
      case 0x8E: // ActionDefineFunction2
        functionName = stream.readString();
        count = stream.readUI16();
        var registerCount = stream.readUI8();
        flags = stream.readUI16();
        var registerAllocation = [];
        args = [];
        for (i = 0; i < count; i++) {
          register = stream.readUI8();
          paramName = stream.readString();
          args.push(paramName);
          if (register) {
            registerAllocation[register] = {
              type: 'param',
              name: paramName,
              index: i
            };
          }
        }
        codeSize = stream.readUI16();
        nextPosition += codeSize;

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

        fn = defineFunction(functionName, args,
                            registerAllocation, stream.readBytes(codeSize));
        if (functionName) {
          scope[functionName] = fn;
        } else {
          stack.push(fn);
        }
        break;
      case 0x69: // ActionExtends
        var constrSuper = stack.pop();
        constr = stack.pop();
        obj = Object.create(constrSuper.prototype, {
          constructor: { value: constr, enumerable: false }
        });
        constr.prototype = obj;
        break;
      case 0x2B: // ActionCastOp
        obj =  stack.pop();
        constr = stack.pop();
        stack.push(as2InstanceOf(obj, constr) ? obj : null);
        break;
      case 0x2C: // ActionImplementsOp
        constr = stack.pop();
        count = +stack.pop();
        validateArgsCount(count, stack.length);
        var interfaces = [];
        for (i = 0; i < count; i++) {
          interfaces.push(stack.pop());
        }
        constr.$interfaces = interfaces;
        break;
      case 0x8F: // ActionTry
        flags = stream.readUI8();
        var catchIsRegisterFlag = !!(flags & 4);
        var finallyBlockFlag = !!(flags & 2);
        var catchBlockFlag = !!(flags & 1);
        var trySize = stream.readUI16();
        var catchSize = stream.readUI16();
        var finallySize = stream.readUI16();
        var catchTarget = catchIsRegisterFlag ? stream.readUI8() : stream.readString();
        nextPosition += trySize + catchSize + finallySize;
        processTry(catchIsRegisterFlag, finallyBlockFlag, catchBlockFlag, catchTarget,
          stream.readBytes(trySize), stream.readBytes(catchSize), stream.readBytes(finallySize));
        break;
      case 0x2A: // ActionThrow
        obj = stack.pop();
        throw new AS2Error(obj);
      // Not documented by the spec
      case 0x2D: // ActionFSCommand2
        args = readArgs(stack);
        stackItemsExpected++;
        result = _global.fscommand.apply(null, args);
        stack.push(result);
        break;
      case 0x89: // ActionStrictMode
        var mode = stream.readUI8();
        break;
      case 0: // End of actions
        return;
      default:
        throw new Error('Unknown action code: ' + actionCode);
    }
    stream.position = nextPosition;
    recoveringFromError = false;
  }

    // handling AVM1 errors
    } catch (e) {
      if (!AVM1_ERRORS_IGNORED || executionAborted) {
        throw e;
      }
      if (e instanceof AS2Error) {
        throw e;
      }
      stream.position = nextPosition;
      if (stackItemsExpected > 0) {
        while (stackItemsExpected--) {
          stack.push(undefined);
        }
      }
      if (!recoveringFromError) {
        if (currentContext.errorsIgnored++ >= MAX_AVM1_ERRORS_LIMIT) {
          executionAborted = true;
          throw new Error('long running script -- AVM1 errors limit is reached');
        }
        console.error('AVM1 error: ' + e);
        recoveringFromError = true;
      }
    }
  }
}

var ActionTracerFactory = (function() {
  var indentation = 0;
  var tracer = {
    print: function(position, actionCode, stack) {
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
    message: function(str) {
      console.log('AVM1 trace: ------- ' + str);
    }
  };
  var nullTracer = {
    print: function() {},
    indent: function() {},
    unindent: function() {},
    message: function() {}
  };

  function ActionTracerFactory() {}
  ActionTracerFactory.get = (function() {
    return AVM1_TRACE_ENABLED ? tracer : nullTracer;
  });
  return ActionTracerFactory;
})();

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

// exports for testing
if (typeof GLOBAL !== 'undefined') {
  GLOBAL.executeActions = executeActions;
  GLOBAL.AS2Context = AS2Context;
}
