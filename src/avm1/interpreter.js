/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var isAVM1TraceEnabled = false;

function executeActions(actionsData, context, scopeContainer,
                        constantPool, registers) {
  var interpreterContext = {};
  interpreterContext.defineFunction = (function(functionName,
    parametersNames, registersAllocation, actionsData) {
    var constantPool = this.constantPool;
    var fn = (function() {
      var newScope = { 'this': this, 'arguments': arguments };
      var newScopeContainer = scopeContainer.create(newScope);

      for (var i = 0; i < arguments.length || i < parametersNames.length; i++)
        newScope[parametersNames[i]] = arguments[i];
      var registers = [];
      if (registersAllocation) {
        for (var i = 0; i < registersAllocation.length; i++) {
          var registerAllocation = registersAllocation[i];
          if (!registerAllocation)
            continue;
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
                throw 'Not implemented: super';
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

      try
      {
        actionTracer.indent();
        return executeActions(actionsData, context, newScopeContainer,
          constantPool, registers);
      } finally {
        actionTracer.unindent();
      }
    });
    if (functionName)
      fn.name = functionName;
    return fn;
  });
  interpreterContext.deleteProperty = (function(propertyName) {
    for (var p = scopeContainer; p; p = p.next) {
      if (propertyName in p.scope) {
        delete p.scope[propertyName];
        return !(propertyName in p.scope);
      }
    }
    return false;
  });
  function resolveVariableName(variableName) {
    var objPath, name;
    if (variableName.indexOf(':') >= 0) {
      // "/A/B:FOO references the FOO variable in the movie clip with a target path of /A/B."
      var parts = variableName.split(':');
      objPath = parts[0].split('/');
      objPath[0] = '_root';
      name = parts[1];
    } else if (variableName.indexOf('.') >= 0) {
      // new object reference
      objPath = m[1].split('.');
      name = objPath.pop();
    }

    if(!objPath)
      return; // local variable

    var p = _global;
    for (var i = 0; i < objPath.length; i++) {
      p = p[objPath[i]];
      if (!p)
        throw objPath.slice(0, i + 1) + ' is undefined';
    }
    return { obj: p, name: name };
  }
  interpreterContext.getVariable = (function(variableName) {
    // fast check if variable in the current scope
    if (variableName in scope) {
      return scope[variableName];
    }

    var target = resolveVariableName(variableName);
    if (target)
      return target.obj[target.name];

    for (var p = scopeContainer; p; p = p.next) {
      if (variableName in p.scope) {
        return p.scope[variableName];
      }
    }
  });
  interpreterContext.setVariable = (function(variableName, value) {
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

    scope[variableName] = value;
  });
  interpreterContext.getFunction = (function(functionName) {
    var fn = this.getVariable(functionName);
    if (!(fn instanceof Function))
      throw 'Function "' + functionName + '" is not found';
    return fn;
  });
  interpreterContext.getObjectByName = (function(objectName) {
    var obj = this.getVariable(objectName);
    if (!(obj instanceof Object))
      throw 'Object "' + objectName + '" is not found';
    return obj;
  });
  interpreterContext.processWith = (function(obj, withBlock) {
    var newScopeContainer = scopeContainer.create(Object(obj));
    executeActions(withBlock, context, newScopeContainer, this.constantPool, registers);
  });
  interpreterContext.processTry = (function(catchIsRegisterFlag, finallyBlockFlag, catchBlockFlag, catchTarget,
                      tryBlock, catchBlock, finallyBlock) {
    try {
      executeActions(tryBlock, context, scopeContainer, this.constantPool, registers);
    } catch (e) {
      if (!catchBlockFlag)
        throw e;
      if (typeof catchTarget === 'string')
        scope[catchTarget] = e;
      else
        registers[catchTarget] = e;
      executeActions(catchBlock, context, scopeContainer, this.constantPool, registers);
    } finally {
      if (finallyBlockFlag)
        executeActions(finallyBlock, context, scopeContainer, this.constantPool, registers);
    }
  });

  registers = registers || [];
  var stack = [];
  var stream = new ActionsDataStream(actionsData, context.swfVersion);
  var scope = scopeContainer.scope;

  interpreterContext.stream = stream;
  interpreterContext.constantPool = constantPool;
  interpreterContext.global = context.globals;
  interpreterContext.defaultScope = context.globals._root;
  interpreterContext.scope = scope;
  interpreterContext.isSwfVersion5 = context.swfVersion >= 5;
  interpreterContext.stopped = false;

  var actionTracer = ActionTracerFactory.get();

  while (stream.position < stream.end) {
    var actionCode = stream.readUI8();
    var length = actionCode >= 0x80 ? stream.readUI16() : 0;
    interpreterContext.nextPosition = stream.position + length;

    actionTracer.print(stream.position, actionCode, stack);
    var actionCodeFn = ActionCodes[actionCode];
    if (!actionCodeFn)
      throw 'Unknown action code: ' + actionCode;

    actionCodeFn(stack, registers, interpreterContext);

    if(interpreterContext.stopped)
      return interpreterContext.returnValue;

    stream.position = interpreterContext.nextPosition;
  }
}

var ActionTracerFactory = (function() {
  var indentation = 0;
  var tracer = {
    print: function(position, actionCode, stack) {
      var stackDump = [];
      for(var q = 0; q < stack.length; q++) {
        var item = stack[q];
        stackDump.push(item && item instanceof Object ?
          '[' + (item.constructor.name || 'Object') + ']' : item);
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
    }
  };
  var nullTracer = {
    print: function() {},
    indent: function() {},
    unindent: function() {}
  };

  function ActionTracerFactory() {}
  ActionTracerFactory.get = (function() {
    return isAVM1TraceEnabled ? tracer : nullTracer;
  });
  return ActionTracerFactory;
})();

var ActionCodes = [
// 0x0X
  function EOA(stack, registers, interpreterContext) {
    interpreterContext.stopped = true;
  },
  null,
  null,
  null,
  function ActionNextFrame(stack, registers, interpreterContext) {
    interpreterContext.global.nextFrame();
  },
  function ActionPreviousFrame(stack, registers, interpreterContext) {
    interpreterContext.global.prevFrame();
  },
  function ActionPlay(stack, registers, interpreterContext) {
    interpreterContext.global.play();
  },
  function ActionStop(stack, registers, interpreterContext) {
    interpreterContext.global.stop();
  },
  function ActionToggleQuality(stack, registers, interpreterContext) {
    interpreterContext.global.toggleHighQuality();
  },
  function ActionStopSounds(stack, registers, interpreterContext) {
    interpreterContext.global.stopAllSounds();
  },
  function ActionAdd(stack, registers, interpreterContext) {
    var a = +stack.pop();
    var b = +stack.pop();
    stack.push(b + a);
  },
  function ActionSubtract(stack, registers, interpreterContext) {
    var a = +stack.pop();
    var b = +stack.pop();
    stack.push(b - a);
  },
  function ActionMultiply(stack, registers, interpreterContext) {
    var a = +stack.pop();
    var b = +stack.pop();
    stack.push(b * a);
  },
  function ActionDivide(stack, registers, interpreterContext) {
    var a = +stack.pop();
    var b = +stack.pop();
    var c = b / a;
    stack.push(interpreterContext.isSwfVersion5 ? c : isFinite(c) ? c : '#ERROR#');
  },
  function ActionEquals(stack, registers, interpreterContext) {
    var a = +stack.pop();
    var b = +stack.pop();
    var f = a == b;
    stack.push(interpreterContext.isSwfVersion5 ? f : f ? 1 : 0);
  },
  function ActionLess(stack, registers, interpreterContext) {
    var a = +stack.pop();
    var b = +stack.pop();
    var f = b < a;
    stack.push(interpreterContext.isSwfVersion5 ? f : f ? 1 : 0);
  },
// 0x1X
  function ActionAnd(stack, registers, interpreterContext) {
    var a = stack.pop();
    var b = stack.pop();
    var f = a && b;
    stack.push(interpreterContext.isSwfVersion5 ? f : f ? 1 : 0);
  },
  function ActionOr(stack, registers, interpreterContext) {
    var a = stack.pop();
    var b = stack.pop();
    var f = a || b;
    stack.push(interpreterContext.isSwfVersion5 ? f : f ? 1 : 0);
  },
  function ActionNot(stack, registers, interpreterContext) {
    var f = !stack.pop();
    stack.push(interpreterContext.isSwfVersion5 ? f : f ? 1 : 0);
  },
  function ActionStringEquals(stack, registers, interpreterContext) {
    var sa = '' + stack.pop();
    var sb = '' + stack.pop();
    var f = sa == sb;
    stack.push(interpreterContext.isSwfVersion5 ? f : f ? 1 : 0);
  },
  function ActionStringLength(stack, registers, interpreterContext) {
    stack.push(interpreterContext.global.length(stack.pop()));
  },
  function ActionStringExtract(stack, registers, interpreterContext) {
    var count = stack.pop();
    var index = stack.pop();
    var value = stack.pop();
    stack.push(interpreterContext.global.substring(value, index, count));
  },
  null,
  function ActionPop(stack, registers, interpreterContext) {
    stack.pop();
  },
  function ActionToInteger(stack, registers, interpreterContext) {
    stack.push(interpreterContext.global.int(stack.pop()));
  },
  null,
  null,
  null,
  function ActionGetVariable(stack, registers, interpreterContext) {
    var variableName = '' + stack.pop();
    stack.push(interpreterContext.getVariable(variableName));
  },
  function ActionSetVariable(stack, registers, interpreterContext) {
    var value = stack.pop();
    var variableName = '' + stack.pop();
    interpreterContext.setVariable(variableName, value);
  },
  null,
  null,
// 0x2X
  function ActionSetTarget2(stack, registers, interpreterContext) {
    var target = stack.pop();
    interpreterContext.global.setTarget(target);
  },
  function ActionStringAdd(stack, registers, interpreterContext) {
    var sa = '' + stack.pop();
    var sb = '' + stack.pop();
    stack.push(sb + sa);
  },
  function ActionGetProperty(stack, registers, interpreterContext) {
    var index = stack.pop();
    var target = stack.pop();
    stack.push(interpreterContext.global.getProperty(target, index));
  },
  function ActionSetProperty(stack, registers, interpreterContext) {
    var value = stack.pop();
    var index = stack.pop();
    var target = stack.pop();
    interpreterContext.global.setProperty(target, index, value);
  },
  function ActionCloneSprite(stack, registers, interpreterContext) {
    var depth = stack.pop();
    var target = stack.pop();
    var source = stack.pop();
    interpreterContext.global.duplicateMovieClip(source, target, depth);
  },
  function ActionRemoveSprite(stack, registers, interpreterContext) {
    var target = stack.pop();
    interpreterContext.global.unloadMovie(target);
  },
  function ActionTrace(stack, registers, interpreterContext) {
    var value = stack.pop();
    interpreterContext.global.trace(value);
  },
  function ActionStartDrag(stack, registers, interpreterContext) {
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
      dragParams = dragParams.push(constrain.x1, constrain.y1,
        constrain.x2, constrain.y2);
    }
    interpreterContext.global.startDrag.apply(interpreterContext.global, dragParams);
  },
  function ActionEndDrag(stack, registers, interpreterContext) {
    interpreterContext.global.stopDrag();
  },
  function ActionStringLess(stack, registers, interpreterContext) {
    var sa = '' + stack.pop();
    var sb = '' + stack.pop();
    var f = sb < sa;
    stack.push(interpreterContext.isSwfVersion5 ? f : f ? 1 : 0);
  },
  function ActionThrow(stack, registers, interpreterContext) {
    var obj = stack.pop();
    throw obj;
  },
  function ActionCastOp(stack, registers, interpreterContext) {
    var obj =  stack.pop();
    var constr = stack.pop();
    // TODO use ActionInstanceOf
    stack.push(obj instanceof constr ? obj : null);
  },
  function ActionImplementsOp(stack, registers, interpreterContext) {
    var constr = stack.pop();
    var interfacesCount = stack.pop();
    var interfaces = [];
    for (var i = 0; i < interfacesCount; i++)
      interfaces.push(stack.pop());
    constr.$interfaces = interfaces;
  },
  null,
  null,
  null,
// 0x3X
  function ActionRandomNumber(stack, registers, interpreterContext) {
    stack.push(interpreterContext.global.random(stack.pop()));
  },
  function ActionMBStringLength(stack, registers, interpreterContext) {
    stack.push(interpreterContext.global.length(stack.pop()));
  },
  function ActionCharToAscii(stack, registers, interpreterContext) {
    stack.push(interpreterContext.global.chr(stack.pop()));
  },
  function ActionAsciiToChar(stack, registers, interpreterContext) {
    stack.push(interpreterContext.global.ord(stack.pop()));
  },
  function ActionGetTime(stack, registers, interpreterContext) {
    stack.push(interpreterContext.global.getTime());
  },
  function ActionMBStringExtrac(stack, registers, interpreterContext) {
    var count = stack.pop();
    var index = stack.pop();
    var value = stack.pop();
    stack.push(interpreterContext.global.mbsubstring(value, index, count));
  },
  function ActionMBCharToAscii(stack, registers, interpreterContext) {
    stack.push(interpreterContext.global.mbchr(stack.pop()));
  },
  function ActionMBAsciiToChar(stack, registers, interpreterContext) {
    stack.push(interpreterContext.global.mbord(stack.pop()));
  },
  null,
  null,
  function ActionDelete(stack, registers, interpreterContext) {
    var name = stack.pop();
    var obj = stack.pop();
    delete obj[name];
    stack.push(!(name in obj)); // XXX undocumented ???
  },
  function ActionDelete2(stack, registers, interpreterContext) {
    var name = stack.pop();
    var result = interpreterContext.deleteProperty(name);
    stack.push(result); // XXX undocumented ???
  },
  function ActionDefineLocal(stack, registers, interpreterContext) {
    var value = stack.pop();
    var name = stack.pop();
    interpreterContext.scope[name] = value;
  },
  function ActionCallFunction(stack, registers, interpreterContext) {
    var functionName = stack.pop();
    var numArgs = stack.pop();
    var args = [];
    for (var i = 0; i < numArgs; i++)
      args.push(stack.pop());
    var fn = interpreterContext.getFunction(functionName);
    var result = fn.apply(interpreterContext.scope, args);
    stack.push(result);
  },
  function ActionReturn(stack, registers, interpreterContext) {
    interpreterContext.stopped = true;
    interpreterContext.returnValue = stack.pop();
  },
  function ActionModulo(stack, registers, interpreterContext) {
    var arg1 = stack.pop();
    var arg2 = stack.pop();
    stack.push(arg2 % arg1);
  },
// 0x4X
  function ActionNewObject(stack, registers, interpreterContext) {
    var objectName = stack.pop();
    var obj = interpreterContext.getObjectByName(objectName);
    var numArgs = stack.pop();
    var args = [];
    for (var i = 0; i < numArgs; i++)
      args.push(stack.pop());
    var result = createBuiltinType(obj, args);
    if (typeof result === 'undefined') {
      // obj in not a built-in type
      result = {};
      obj.apply(result, args);
      result.constructor = obj;
    }
    stack.push(result);
  },
  function ActionDefineLocal2(stack, registers, interpreterContext) {
    var name = stack.pop();
    interpreterContext.scope[name] = void(0);
  },
  function ActionInitArray(stack, registers, interpreterContext) {
    var numArgs = stack.pop();
    var arr = [];
    for (var i = 0; i < numArgs; i++)
      arr.push(stack.pop());
    stack.push(arr);
  },
  function ActionInitObject(stack, registers, interpreterContext) {
    var numArgs = stack.pop();
    var obj = {};
    for (var i = 0; i < numArgs; i++) {
      var value = stack.pop();
      var name = stack.pop();
      obj[name] = value;
    }
    stack.push(obj);
  },
  function ActionTypeOf(stack, registers, interpreterContext) {
    var obj = stack.pop();
    var result = isMovieClip(obj) ? 'movieclip' : typeof obj;
    stack.push(result);
  },
  function ActionTargetPath(stack, registers, interpreterContext) {
    var obj = stack.pop();
    stack.push(isMovieClip(obj) ? obj.getTargetPath() : void(0));
  },
  function ActionEnumerate(stack, registers, interpreterContext) {
    var objectName = stack.pop();
    stack.push(null);
    var obj = interpreterContext.getObjectByName(objectName);
    for (var name in obj)
      stack.push(name);
  },
  function ActionAdd2(stack, registers, interpreterContext) {
    var arg1 = stack.pop();
    var arg2 = stack.pop();
    stack.push(arg2 + arg1);
  },
  function ActionLess2(stack, registers, interpreterContext) {
    var arg1 = stack.pop();
    var arg2 = stack.pop();
    stack.push(arg2 < arg1);
  },
  function ActionEquals2(stack, registers, interpreterContext) {
    var arg1 = stack.pop();
    var arg2 = stack.pop();
    stack.push(arg1 == arg2);
  },
  function ActionToNumber(stack, registers, interpreterContext) {
    stack.push(+stack.pop());
  },
  function ActionToString(stack, registers, interpreterContext) {
    stack.push("" + stack.pop());
  },
  function ActionPushDuplicate(stack, registers, interpreterContext) {
    stack.push(stack[stack.length - 1]);
  },
  function ActionStackSwap(stack, registers, interpreterContext) {
    stack.push(stack.pop(), stack.pop());
  },
  function ActionGetMember(stack, registers, interpreterContext) {
    var name = stack.pop();
    var obj = stack.pop();
    stack.push(obj[name]);
  },
  function ActionSetMember(stack, registers, interpreterContext) {
    var value = stack.pop();
    var name = stack.pop();
    var obj = stack.pop();
    obj[name] = value;
  },
// 0x5X
  function ActionIncrement(stack, registers, interpreterContext) {
    var arg1 = stack.pop();
    arg1++;
    stack.push(arg1);
  },
  function ActionDecrement(stack, registers, interpreterContext) {
    var arg1 = stack.pop();
    arg1--;
    stack.push(arg1);
  },
  function ActionCallMethod(stack, registers, interpreterContext) {
    var methodName = stack.pop();
    var obj = stack.pop();
    var numArgs = stack.pop();
    var args = [];
    for (var i = 0; i < numArgs; i++)
      args.push(stack.pop());
    var result;
    if (methodName) {
      obj = Object(obj);
      if (!(methodName in obj))
        throw 'Method ' + methodName + ' is not defined.';
      result = obj[methodName].apply(obj, args);
    } else
      result = obj.apply(interpreterContext.defaultScope, args);
    stack.push(result);
  },
  function ActionNewMethod(stack, registers, interpreterContext) {
    var methodName = stack.pop();
    var obj = stack.pop();
    var numArgs = stack.pop();
    var args = [];
    for (var i = 0; i < numArgs; i++)
      args.push(stack.pop());
    var result = {};
    if (methodName) {
      if (!(methodName in obj))
        throw 'Method ' + methodName + ' is not defined.';
      obj[methodName].apply(result, args);
    } else
      obj.apply(result, args);
    result.constructor = method;
    method.apply(result, args);
    stack.push(result);
  },
  function ActionInstanceOf(stack, registers, interpreterContext) {
    var constr = stack.pop();
    var obj = stack.pop();
    // TODO check interfaces
    stack.push(Object(obj) instanceof constr);
  },
  function ActionEnumerate2(stack, registers, interpreterContext) {
    var obj = stack.pop();
    stack.push(null);
    for (var name in obj)
      stack.push(name);
  },
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
// 0x6X
  function ActionBitAnd(stack, registers, interpreterContext) {
    var arg1 = stack.pop();
    var arg2 = stack.pop();
    stack.push(arg2 & arg1);
  },
  function ActionBitOr(stack, registers, interpreterContext) {
    var arg1 = stack.pop();
    var arg2 = stack.pop();
    stack.push(arg2 | arg1);
  },
  function ActionBitXor(stack, registers, interpreterContext) {
    var arg1 = stack.pop();
    var arg2 = stack.pop();
    stack.push(arg2 ^ arg1);
  },
  function ActionBitLShift(stack, registers, interpreterContext) {
    var arg1 = stack.pop();
    var arg2 = stack.pop();
    stack.push(arg2 << arg1);
  },
  function ActionBitRShift(stack, registers, interpreterContext) {
    var arg1 = stack.pop();
    var arg2 = stack.pop();
    stack.push(arg2 >> arg1);
  },
  function ActionBitURShift(stack, registers, interpreterContext) {
    var arg1 = stack.pop();
    var arg2 = stack.pop();
    stack.push(arg2 >>> arg1);
  },
  function ActionStrictEquals(stack, registers, interpreterContext) {
    var arg1 = stack.pop();
    var arg2 = stack.pop();
    stack.push(arg1 === arg2);
  },
  function ActionGreater(stack, registers, interpreterContext) {
    var arg1 = stack.pop();
    var arg2 = stack.pop();
    stack.push(arg2 > arg1);
  },
  function ActionStringGreater(stack, registers, interpreterContext) {
    var sa = '' + stack.pop();
    var sb = '' + stack.pop();
    var f = sb > sa;
    stack.push(interpreterContext.isSwfVersion5 ? f : f ? 1 : 0);
  },
  function ActionExtends(stack, registers, interpreterContext) {
    var constrSuper = stack.pop();
    var constrSub = stack.pop();
    var obj = Object.create(constrSuper.prototype, {
      constructor: { value: constrSub, enumerable: false }
    });
    constrSub.prototype = obj;
  },
  null,
  null,
  null,
  null,
  null,
  null,
// 0x7X
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
// 0x80
  null,
  function ActionGotoFrame(stack, registers, interpreterContext) {
    var frame = interpreterContext.stream.readUI16();
    interpreterContext.global.gotoAndPlay(frame);
  },
  null,
  function ActionGetURL(stack, registers, interpreterContext) {
    var stream = interpreterContext.stream;
    var urlString = stream.readString();
    var targetString = stream.readString();
    interpreterContext.global.getURL(urlString, targetString);
  },
  null,
  null,
  null,
  function ActionStoreRegister(stack, registers, interpreterContext) {
    var register = interpreterContext.stream.readUI8();
    registers[register] = stack[stack.length - 1];
  },
  function ActionConstantPool(stack, registers, interpreterContext) {
    var stream = interpreterContext.stream;
    var count = stream.readUI16();
    var constantPool = [];
    for (var i = 0; i < count; i++)
      constantPool.push(stream.readString());
    interpreterContext.constantPool = constantPool;
  },
  null,
  function ActionWaitForFrame(stack, registers, interpreterContext) {
    var stream = interpreterContext.stream;
    var frame = stream.readUI16();
    var skipCount = stream.readUI8();
    interpreterContext.global.waitForFrame(frame, skipCount);
  },
  function ActionSetTarget(stack, registers, interpreterContext) {
    var targetName = interpreterContext.stream.readString();
    interpreterContext.global.setTarget(targetName);
  },
  function ActionGoToLabel(stack, registers, interpreterContext) {
    var label = interpreterContext.stream.readString();
    interpreterContext.global.gotoLabel(label);
  },
  function ActionWaitForFrame2(stack, registers, interpreterContext) {
    var skipCount = interpreterContext.stream.readUI8();
    var label = stack.pop();
    interpreterContext.global.waitForFrame(label, skipCount);
  },
  function ActionDefineFunction2(stack, registers, interpreterContext) {
    var stream = interpreterContext.stream;
    var functionName = stream.readString();
    var numParams = stream.readUI16();
    var registerCount = stream.readUI8();
    var flags = stream.readUI16();
    var registerAllocation = [];
    var functionParams = [];
    for (var i = 0; i < numParams; i++) {
      var register = stream.readUI8();
      var paramName = stream.readString();
      functionParams.push(paramName);
      if (register) {
        registerAllocation[register] = {
          type: 'param',
          name: paramName,
          index: i
        };
      }
    }
    var codeSize = stream.readUI16();
    interpreterContext.nextPosition += codeSize;

    var j = 1;
    // order this, arguments, super, _root, _parent, and _global
    if (flags & 0x0001) // preloadThis
      registerAllocation[j++] = { type: 'var', name: 'this' };
    if (flags & 0x0004) // preloadArguments
      registerAllocation[j++] = { type: 'var', name: 'arguments' };
    if (flags & 0x0010) // preloadSuper
      registerAllocation[j++] = { type: 'var', name: 'super' };
    if (flags & 0x0040) // preloadRoot
      registerAllocation[j++] = { type: 'var', name: '_root' };
    if (flags & 0x0080) // preloadParent
      registerAllocation[j++] = { type: 'var', name: '_parent' };
    if (flags & 0x0100) // preloadGlobal
      registerAllocation[j++] = { type: 'var', name: '_global' };

    var fn = interpreterContext.defineFunction(functionName, functionParams,
      registerAllocation, stream.readBytes(codeSize));
    if (functionName)
      interpreterContext.scope[functionName] = fn;
    else
      stack.push(fn);
  },
  function ActionTry(stack, registers, interpreterContext) {
    var stream = interpreterContext.stream;
    var flags = stream.readUI8();
    var catchIsRegisterFlag = !!(flags & 4);
    var finallyBlockFlag = !!(flags & 2);
    var catchBlockFlag = !!(flags & 1);
    var trySize = stream.readUI16();
    var catchSize = stream.readUI16();
    var finallySize = stream.readUI16();
    var catchTarget = catchIsRegisterFlag ? stream.readUI8() : stream.readString();
    interpreterContext.nextPosition += trySize + catchSize + finallySize;
    interpreterContext.processTry(catchIsRegisterFlag, finallyBlockFlag, catchBlockFlag, catchTarget,
      stream.readBytes(trySize), stream.readBytes(catchSize), stream.readBytes(finallySize));
  },
// 0x9X
  null,
  null,
  null,
  null,
  function ActionWith(stack, registers, interpreterContext) {
    var stream = interpreterContext.stream;
    var codeSize = stream.readUI16();
    var obj = stack.pop();
    interpreterContext.nextPosition += codeSize;
    interpreterContext.processWith(obj, stream.readBytes(codeSize));
  },
  null,
  function ActionPush(stack, registers, interpreterContext) {
    var stream = interpreterContext.stream;
    var constantPool = interpreterContext.constantPool;
    while (stream.position < interpreterContext.nextPosition) {
      var type = stream.readUI8();
      var value;
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
          throw 'Uknown value type: ' + type;
      }
      stack.push(value);
    }
  },
  null,
  null,
  function ActionJump(stack, registers, interpreterContext) {
    var branchOffset = interpreterContext.stream.readSI16();
    interpreterContext.nextPosition += branchOffset;
  },
  function ActionGetURL2(stack, registers, interpreterContext) {
    var stream = interpreterContext.stream;
    var flags = stream.readUI8();
    var httpMethod;
    switch ((flags >> 6) & 3) {
      case 1:
        httpMethod = 'GET';
        break;
      case 2:
        httpMethod  = 'POST';
        break;
    }
    var global = interpreterContext.global;
    var loadMethod = !!(flags & 2) ?
      (!!(flags & 1) ? global.loadVariables : global.loadMovie) :
      (!!(flags & 1) ? global.loadVariablesNum : global.loadMovieNum);
    var target = stack.pop();
    var url = stack.pop();
    loadMethod.call(global, url, target, httpMethod);
  },
  function ActionDefineFunction(stack, registers, interpreterContext) {
    var stream = interpreterContext.stream;
    var functionName = stream.readString();
    var numParams = stream.readUI16();
    var functionParams = [];
    for (var i = 0; i < numParams; i++)
      functionParams.push(stream.readString());
    var codeSize = stream.readUI16();
    interpreterContext.nextPosition += codeSize;

    var fn = interpreterContext.defineFunction(functionName, functionParams,
      null, stream.readBytes(codeSize));
    if (functionName)
      interpreterContext.scope[functionName] = fn;
    else
      stack.push(fn);
  },
  null,
  function ActionIf(stack, registers, interpreterContext) {
    var branchOffset = interpreterContext.stream.readSI16();
    var f = !!stack.pop();
    if (f)
      interpreterContext.nextPosition += branchOffset;
  },
  function ActionCall(stack, registers, interpreterContext) {
    var label = stack.pop();
    interpreterContext.global.call(label);
  },
  function ActionGotoFrame2(stack, registers, interpreterContext) {
    var stream = interpreterContext.stream;
    var flags = stream.readUI8();
    var gotoParams = [stack.pop()];
    if (!!(flags & 2))
      gotoParams.push(stream.readUI16());
    var gotoMethod = !!(flags & 1) ? interpreterContext.global.gotoAndPlay :
      interpreterContext.global.gotoAndStop;
    gotoMethod.apply(_global, gotoParams);
  }
];

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
  0x8A: 'ActionWaitForFrame',
  0x8B: 'ActionSetTarget',
  0x8C: 'ActionGoToLabel',
  0x8D: 'ActionWaitForFrame2',
  0x8E: 'ActionDefineFunction2',
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
