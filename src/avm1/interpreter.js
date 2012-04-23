/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function executeActions(actionsData, context, scopeContainer, registers) {
  function defineFunction(functionName, parametersNames, registerAllocation, actionsData) {
    scope[functionName] = {
      params: parametersNames,
      registerAllocation: registerAllocation || [],
      actionsData: actionsData
    };
  }
  function findInScopes(name, location) {
    for (var p = scopeContainer; p; p = p.next) {
      if (name in p.scope) {
        if (location) {
          location.scopeContainer = p;
          location.scope = p.scope;
        }
        return p.scope[name];
      }
    }
    return;
  }
  function getFunction(functionName) {
    var fn = scope[functionName];
    if (!fn) throw 'Function "' + functionName + '" is not found';
    if (!fn.wrapped) {
      fn.wrapped = (function() {
        var newScope = {};
        var newScopeContainer = scopeContainer.create(newScope);

        for (var i = 0; i < arguments.length || i < fn.params.length; i++)
          newScope[fn.params[i]] = arguments[i];
        var regs = [];
        for (var i = 0; i < fn.registerAllocation.length; i++) {
          var registerAllocation = fn.registerAllocation[i];
          if (!registerAllocation)
            continue;
          if (registerAllocation.type == 'param') {
            regs[i] = arguments[registerAllocation.index];
          } else { // var
            // TODO
          }
        }

        return executeActions(fn.actionsData, context, newScopeContainer, regs);
      });
    }
    return fn.wrapped;
  }
  function getObjectByName(objectName) {
    // objectName "can include slash-path or dot-path syntax"
    throw 'Not implemented';
  }
  function deleteProperty(propertyName) {
    for (var p = scopeContainer; p; p = p.next) {
      if (propertyName in p.scope) {
        delete p.scope[propertyName];
        break;
      }
    }
  }
  function getVariable(variableName) {
    // "/A/B:FOO references the FOO variable in the movie clip with a target path of /A/B."
    if (variableName.indexOf(':') >= 0)
      throw 'Not implemented: getting variable from the different context';

    for (var p = scopeContainer; p; p = p.next) {
      if (propertyName in p.scope) {
        return p.scope[propertyName];
      }
    }
  }
  function setVariable(variableName, value) {
    if (variableName.indexOf(':') >= 0)
      throw 'Not implemented: setting variable in the different context';

    scope[variableName] = value;
  }
  function processWith(obj, withBlock) {
    var newScopeContainer = scopeContainer.create(obj);
    executeActions(withBlock, context, newScopeContainer, registers);
  }
  function processTry(catchIsRegisterFlag, finallyBlockFlag, catchBlockFlag, catchTarget,
                      tryBlock, catchBlock, finallyBlock) {
    try {
      executeActions(tryBlock, context, scopeContainer, registers);
    } catch (e) {
      if (!catchBlockFlag)
        throw e;
      if (typeof catchTarget === 'string')
        scope[catchTarget] = e;
      else
        registers[catchTarget] = e;
      executeActions(catchBlock, context, scopeContainer, registers);
    } finally {
      if (finallyBlockFlag)
        executeActions(finallyBlock, context, scopeContainer, registers);
    }
  }

  var stream = new ActionsDataStream(actionsData, context.swfVersion);
  var _global = context._global;
  var functions = {};
  var stack = [];
  var scope = scopeContainer.scope;
  var constantPool;
  var isSwfVersion5 = context.swfVersion >= 5;
  while (stream.position < stream.end) {
    var actionCode = stream.readUI8();
    var length = actionCode >= 0x80 ? stream.readUI16() : 0;
    var nextPosition = stream.position + length;

    switch (actionCode) {
      // SWF 3 actions
      case 0x81: // ActionGotoFrame
        var frame = stream.readUI16();
        _global.gotoAndPlay(frame);
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
        var frame = stream.readUI16();
        var skipCount = stream.readUI8();
        _global.waitForFrame(frame, skipCount);
        break;
      case 0x8B: // ActionSetTarget
        var targetName = stream.readString();
        _global.setTarget(targetName);
        break;
      case 0x8C: // ActionGoToLabel
        var label = stream.readString();
        _global.gotoLabel(label);
        break;
      // SWF 4 actions
      case 0x96: // ActionPush
        while (stream.position < nextPosition) {
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
        break;
      case 0x17: // ActionPop
        stack.pop();
        break;
      case 0x0A: // ActionAdd
        var a = +stack.pop();
        var b = +stack.pop();
        stack.push(a + b);
        break;
      case 0x0B: // ActionSubtract
        var a = +stack.pop();
        var b = +stack.pop();
        stack.push(b - a);
        break;
      case 0x0C: // ActionMultiply
        var a = +stack.pop();
        var b = +stack.pop();
        stack.push(a * b);
        break;
      case 0x0D: // ActionDivide
        var a = +stack.pop();
        var b = +stack.pop();
        var c = b / a;
        stack.push(isSwfVersion5 ? c : isFinite(c) ? c : '#ERROR#');
        break;
      case 0x0E: // ActionEquals
        var a = +stack.pop();
        var b = +stack.pop();
        var f = a == b;
        stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        break;
      case 0x0F: // ActionLess
        var a = +stack.pop();
        var b = +stack.pop();
        var f = b < a;
        stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        break;
      case 0x010: // ActionAnd
        var a = +stack.pop();
        var b = +stack.pop();
        var f = a && b;
        stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        break;
      case 0x011: // ActionOr
        var a = +stack.pop();
        var b = +stack.pop();
        var f = a || b;
        stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        break;
      case 0x012: // ActionNot
        var f = !!(+stack.pop());
        stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        break;
      case 0x13: // ActionStringEquals
        var sa = '' + stack.pop();
        var sb = '' + stack.pop();
        var f = sa == sb;
        stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        break;
      case 0x14: // ActionStringLength
      case 0x31: // ActionMBStringLength
        stack.push(_global.length(stack.pop()));
        var sa = '' + stack.pop();
        stack.push(sa.length);
        break;
      case 0x21: // ActionStringAdd
        var sa = '' + stack.pop();
        var sb = '' + stack.pop();
        stack.push(b + a);
        break;
      case 0x15: // ActionStringExtract
        var count = stack.pop();
        var index = stack.pop();
        var value = stack.pop();
        stack.push(_global.substring(value, index, count));
        break;
      case 0x35: // ActionMBStringExtract
        var count = stack.pop();
        var index = stack.pop();
        var value = stack.pop();
        stack.push(_global.mbsubstring(value, index, count));
        break;
      case 0x29: // ActionStringLess
        var sa = '' + stack.pop();
        var sb = '' + stack.pop();
        var f = sb < sa;
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
        var branchOffset = stream.readSI16();
        pc += branchOffset;
        break;
      case 0x9D: // ActionIf
        var branchOffset = stream.readSI16();
        var f = !!stack.pop();
        if (f)
          pc += branchOffset;
        break;
      case 0x9E: // ActionCall
        var label = stack.pop();
        _global.call(label);
        break;
      case 0x1C: // ActionGetVariable
        var variableName = '' + stack.pop();
        stack.push(getVariable(variableName));
        break;
      case 0x1D: // ActionSetVariable
        var value = stack.pop();
        var variableName = '' + stack.pop();
        setVariable(variableName, value);
        break;
      case 0x9A: // ActionGetURL2
        var flags = stream.readUI8();
        var method;
        switch ((flags >> 6) & 3) {
          case 1:
            method = 'GET';
            break;
          case 2:
            method  = 'POST';
            break;
        }
        var loadMethod = !!(flags & 2) ?
          (!!(flags & 1) ? _global.loadVariables : _global.loadMovie) :
          (!!(flags & 1) ? _global.loadVariablesNum : _global.loadMovieNum);
        var target = stack.pop();
        var url = stack.pop();
        loadMethod.call(_global, url, target, method);
        break;
      case 0x9F: // ActionGotoFrame2
        var flags = stream.readUI8();
        var gotoParams = [stack.pop()];
        if (!!(flags & 2))
          gotoParams.push(stream.readUI16());
        var gotoMethod = !!(flags & 1) ? _global.gotoAndPlay : _global.gotoAndStop;
        gotoMethod.apply(_global, gotoParams);
        break;
      case 0x20: // ActionSetTarget2
        var target = stack.pop();
        _global.setTarget(target);
        break;
      case 0x22: // ActionGetProperty
        var index = stack.pop();
        var target = stack.pop();
        stack.push(_global.getProperty(target, index));
        break;
      case 0x23: // ActionSetProperty
        var value = stack.pop();
        var index = stack.pop();
        var target = stack.pop();
        _global.setProperty(target, index, value);
        break;
      case 0x24: // ActionCloneSprite
        var depth = stack.pop();
        var target = stack.pop();
        var source = stack.pop();
        _global.duplicateMovieClip(source, target, depth);
        break;
      case 0x25: // ActionRemoveSprite
        var target = stack.pop();
        _global.unloadMovie(target);
        break;
      case 0x27: // ActionStartDrag
        var target = stack.pop();
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
        var skipCount = stream.readUI8();
        var label = stack.pop();
        _global.waitForFrame(label, skipCount);
        break;
      case 0x26: // ActionTrace
        var value = stack.pop();
        _global.trace(value);
        break;
      case 0x34: // ActionGetTime
        stack.push(_global.getTime());
        break;
      case 0x30: // ActionRandomNumber
        stack.push(_global.random(stack.pop()));
        break;
      // SWF 5
      case 0x3D: // ActionCallFunction
        var functionName = stack.pop();
        var numArgs = stack.pop();
        var args = [];
        for (var i = 0; i < numArgs; i++)
          args.push(stack.pop());
        var fn = getFunction(functionName);
        var result = fn.apply(null, args);
        stack.push(result);
        break;
      case 0x52: // ActionCallMethod
        var methodName = stack.pop();
        var obj = stack.pop();
        var numArgs = stack.pop();
        var args = [];
        for (var i = 0; i < numArgs; i++)
          args.push(stack.pop());
        var method = methodName ? obj[methodName] : obj;
        var result = method.apply(obj, args);
        stack.push(result);
        break;
      case 0x88: // ActionConstantPool
        var count = stream.readUI16();
        constantPool = [];
        for (var i = 0; i < count; i++)
          constantPool.push(stream.readString());
        break;
      case 0x9B: // ActionDefineFunction
        var functionName = stream.readString();
        var numParams = stream.readUI16();
        var functionParams = [];
        for (var i = 0; i < numParams; i++)
          functionParams.push(stream.readString());
        var codeSize = stream.readUI16();
        nextPosition += codeSize;

        defineFunction(functionName, functionParams, null,
          stream.readBytes(codeSize));
        break;
      case 0x3C: // ActionDefineLocal
        var value = stack.pop();
        var name = stack.pop();
        scope[name] = value;
        break;
      case 0x41: // ActionDefineLocal2
        var name = stack.pop();
        scope[name] = void(0);
        break;
      case 0x3A: // ActionDelete
        var name = stack.pop();
        var obj = stack.pop();
        delete obj[name];
        break;
      case 0x3B: // ActionDelete2
        var name = stack.pop();
        deleteProperty(name);
        break;
      case 0x46: // ActionEnumerate
        var objectName = stack.pop();
        stack.push(null);
        var obj = getObjectByName(objectName);
        for (var name in obj)
          stack.push(name);
        break;
      case 0x49: // ActionEquals2
        var arg1 = stack.pop();
        var arg2 = stack.pop();
        stack.push(arg1 == arg2);
        break;
      case 0x4E: // ActionGetMember
        var name = stack.pop();
        var obj = stack.pop();
        stack.push(obj[name]);
        break;
      case 0x42: // ActionInitArray
        var numArgs = stack.pop();
        var arr = [];
        for (var i = 0; i < numArgs; i++)
          arr.push(stack.pop());
        stack.push(arr);
        break;
      case 0x43: // ActionInitObject
        var numArgs = stack.pop();
        var obj = {};
        for (var i = 0; i < numArgs; i++) {
          var name = stack.pop();
          var value = stack.pop();
          obj[name] = value;
        }
        stack.push(obj);
        break;
      case 0x53: // ActionNewMethod
        var methodName = stack.pop();
        var obj = stack.pop();
        var numArgs = stack.pop();
        var args = [];
        for (var i = 0; i < numArgs; i++)
          args.push(stack.pop());
        var method = methodName ? obj[methodName] : obj;
        var result = {};
        result.constructor = method;
        method.apply(result, args);
        stack.push(result);
        break;
      case 0x40: // ActionNewObject
        var objectName = stack.pop();
        var obj = getObjectByName(objectName);
        var numArgs = stack.pop();
        var args = [];
        for (var i = 0; i < numArgs; i++)
          args.push(stack.pop());
        var result = {};
        result.constructor = method;
        obj.apply(result, args);
        stack.push(result);
        break;
      case 0x4F: // ActionSetMember
        var value = stack.pop();
        var name = stack.pop();
        var obj = stack.pop();
        obj[name] = value;
        break;
      case 0x45: // ActionTargetPath
        var obj = stack.pop();
        stack.push(isMovieClip(obj) ? obj.getTargetPath() : void(0));
        break;
      case 0x94: // ActionWith
        var codeSize = stream.readUI16();
        var obj = stack.pop();
        nextPosition += codeSize;
        processWith(obj, stream.readBytes(codeSize));
        break;
      case 0x4A: // ActionToNumber
        stack.push(+stack.pop());
        break;
      case 0x4B: // ActionToString
        stack.push("" + stack.pop());
        break;
      case 0x44: // ActionTypeOf
        var obj = stack.pop();
        var result = isMovieClip(obj) ? 'movieclip' : typeof obj;
        stack.push(result);
        break;
      case 0x47: // ActionAdd2
        var arg1 = stack.pop();
        var arg2 = stack.pop();
        stack.push(arg1 + arg2);
        break;
      case 0x48: // ActionLess2
        var arg1 = stack.pop();
        var arg2 = stack.pop();
        stack.push(arg2 < arg1);
        break;
      case 0x3F: // ActionModulo
        var arg1 = stack.pop();
        var arg2 = stack.pop();
        stack.push(arg1 % arg2);
        break;
      case 0x60: // ActionBitAnd
        var arg1 = stack.pop();
        var arg2 = stack.pop();
        stack.push(arg1 & arg2);
        break;
      case 0x63: // ActionBitLShift
        var arg1 = stack.pop();
        var arg2 = stack.pop();
        stack.push(arg1 << arg2);
        break;
      case 0x61: // ActionBitOr
        var arg1 = stack.pop();
        var arg2 = stack.pop();
        stack.push(arg1 | arg2);
        break;
      case 0x64: // ActionBitRShift
        var arg1 = stack.pop();
        var arg2 = stack.pop();
        stack.push(arg1 >> arg2);
        break;
      case 0x65: // ActionBitURShift
        var arg1 = stack.pop();
        var arg2 = stack.pop();
        stack.push(arg1 >>> arg2);
        break;
      case 0x62: // ActionBitXor
        var arg1 = stack.pop();
        var arg2 = stack.pop();
        stack.push(arg1 ^ arg2);
        break;
      case 0x51: // ActionDecrement
        var arg1 = stack.pop();
        stack.push(arg1 - 1);
        break;
      case 0x50: // ActionIncrement
        var arg1 = stack.pop();
        stack.push(arg1 + 1);
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
        var register = stream.readUI8();
        var obj = stack.pop();
        registers[register] = obj;
        break;
      // SWF 6
      case 0x54: // ActionInstanceOf
        var constr = stack.pop();
        var obj = stack.pop();
        stack.push(obj instanceof constr);
        break;
      case 0x55: // ActionEnumerate2
        var obj = stack.pop();
        stack.push(null);
        for (var name in obj)
          stack.push(name);
        break;
      case 0x66: // ActionStrictEquals
        var arg1 = stack.pop();
        var arg2 = stack.pop();
        stack.push(arg1 === arg2);
        break;
      case 0x67: // ActionGreater
        var arg1 = stack.pop();
        var arg2 = stack.pop();
        stack.push(arg2 > arg1);
        break;
      case 0x68: // ActionStringGreater
        var sa = '' + stack.pop();
        var sb = '' + stack.pop();
        var f = sb > sa;
        stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        break;
      // SWF 7
      case 0x8E: // ActionDefineFunction2
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
        nextPosition += codeSize;

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

        defineFunction(functionName, functionParams, registerAllocation,
          stream.readBytes(codeSize));
        break;
      case 0x69: // ActionExtends
        var constrSuper = stack.pop();
        var constrSub = stack.pop();
        var obj = Object.create(constrSuper.prototype, {
          constructor: { value: constrSub, enumerable: false }
        });
        constrSub.prototype = obj;
        break;
      case 0x2B: // ActionCastOp
        var obj =  stack.pop();
        var constr = stack.pop();
        stack.push(obj instanceof constr ? obj : null);
        break;
      case 0x2C: // ActionImplementsOp
        var constr = stack.pop();
        var interfacesCount = stack.pop();
        var interfaces = [];
        for (var i = 0; i < interfacesCount; i++)
          interfaces.push(stack.pop());
        constr.$interfaces = interfaces;
        break;
      case 0x8F: // ActionTry
        var flags = stream.readUI8();
        var catchIsRegisterFlag = !!(flags & 4);
        var finallyBlockFlag = !!(flags & 2);
        var catchBlockFlag = !!(flags & 1);
        var trySize = stream.readUI16();
        var catchSize = stream.readU16();
        var finallySize = stream.readU16();
        var catchTarget = catchIsRegisterFlag ? stream.readUI8() : stream.readString();
        nextPosition += trySize + catchSize + finallySize;
        processTry(catchIsRegisterFlag, finallyBlockFlag, catchBlockFlag, catchTarget,
          stream.readBytes(trySize), stream.readBytes(catchSize), stream.readBytes(finallySize));
        break;
      case 0x2A: // ActionThrow
        var obj = stack.pop();
        throw obj;
      case 0: // End of actions
        return;
      default:
        throw 'Unknown action code: ' + actionCode;
    }
    stream.position = nextPosition;
  }
}
