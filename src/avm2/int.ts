module Shumway.AVMX {
  import assert = Shumway.Debug.assert;
  import popManyInto = Shumway.ArrayUtilities.popManyInto;

  /**
   * Helps the interpreter allocate fewer Scope objects.
   */
  export class ScopeStack {
    parent: Scope;
    stack: any [];
    isWith: boolean [];
    scopes: Scope [];
    constructor(parent: Scope) {
      this.parent = parent;
      this.stack = [];
      this.isWith = [];
    }

    public push(object: any, isWith: boolean) {
      this.stack.push(object);
      this.isWith.push(!!isWith);
    }

    public get(index): any {
      return this.stack[index];
    }

    public clear() {
      this.stack.length = 0;
      this.isWith.length = 0;
    }

    public pop() {
      this.isWith.pop();
      this.stack.pop();
      if (this.scopes && this.scopes.length > this.stack.length) {
        this.scopes.length--;
        release || assert(this.scopes.length === this.stack.length);
      }
    }

    public topScope(): Scope {
      if (!this.scopes) {
        if (this.stack.length === 0) {
          return this.parent;
        }
        this.scopes = [];
      }
      var parent = this.parent;
      for (var i = 0; i < this.stack.length; i++) {
        var object = this.stack[i], isWith = this.isWith[i], scope = this.scopes[i];
        if (!scope || scope.parent !== parent || scope.object !== object || scope.isWith !== isWith) {
          scope = this.scopes[i] = new Scope(parent, object, isWith);
        }
        parent = scope;
      }
      return parent;
    }
  }


  function popNameInto(stack: any [], mn: Multiname, rn: Multiname) {
    rn.id = mn.id;
    rn.kind = mn.kind;
    if (mn.isRuntimeName()) {
      var name = stack.pop();
      // Unwrap content script-created AXQName instances.
      if (name && name.axClass && name.axClass === name.sec.AXQName) {
        name = name.name;
        release || assert(name instanceof Multiname);
        rn.kind = mn.isAttribute() ? CONSTANT.RTQNameLA : CONSTANT.RTQNameL;
        rn.id = name.id;
        rn.name = name.name;
        rn.namespaces = name.namespaces;
        return;
      }
      rn.name = name;
      rn.id = -1;
    } else {
      rn.name = mn.name;
    }
    if (mn.isRuntimeNamespace()) {
      var ns = stack.pop();
      // Unwrap content script-created AXNamespace instances.
      if (ns._ns) {
        release || assert(ns.sec && ns.axClass === ns.sec.AXNamespace);
        ns = ns._ns;
      }
      rn.namespaces = [ns];
      rn.id = -1;
    } else {
      rn.namespaces = mn.namespaces;
    }
    interpreterWriter && interpreterWriter.greenLn("Name: " + rn.name);
  }


  export function interpret(self: Object, methodInfo: MethodInfo, savedScope: Scope, args: any [],
                            callee: AXFunction) {
    executionWriter && executionWriter.enter("> " + methodInfo);
    try {
      var result = _interpret(self, methodInfo, savedScope, args, callee);
      executionWriter && executionWriter.leave("< " + methodInfo.trait);
      return result;
    } catch (e) {
      executionWriter && executionWriter.leave("< " + methodInfo.trait + ", Exception: " + e);
      throw e;
    }
  }

  function _interpret(self: Object, methodInfo: MethodInfo, savedScope: Scope, callArgs: any [],
                      callee: AXFunction) {
    var applicationDomain = methodInfo.abc.applicationDomain;
    var sec = applicationDomain.sec;

    var abc = methodInfo.abc;
    var body = methodInfo.getBody();
    release || assert(body);

    var local = [self];
    var stack = [];
    var scopes = new ScopeStack(savedScope);
    var rn: Multiname = null;

    var argCount = callArgs.length;
    var arg;
    for (var i = 0, j = methodInfo.parameters.length; i < j; i++) {
      var p = methodInfo.parameters[i];
      if (i < argCount) {
        arg = callArgs[i];
      } else if (p.hasOptionalValue()) {
        arg = p.getOptionalValue();
      } else {
        arg = undefined;
      }
      rn = p.getType();
      if (rn && !rn.isAnyName()) {
        type = savedScope.getScopeProperty(rn, true, false);
        interpreterWriter && interpreterWriter.writeLn("Coercing argument to type " +
                                                       (type.axClass ?
                                                        type.axClass.name.toFQNString(false) :
                                                        type));
        arg = type.axCoerce(arg);
      }

      local.push(arg);
    }

    if (methodInfo.needsRest()) {
      local.push(sec.createArrayUnsafe(sliceArguments(callArgs, methodInfo.parameters.length)));
    } else if (methodInfo.needsArguments()) {
      var argsArray = sliceArguments(callArgs, 0);
      var argumentsArray = Object.create(sec.argumentsPrototype);
      argumentsArray.value = argsArray;
      argumentsArray.callee = callee;
      argumentsArray.receiver = self;
      argumentsArray.methodInfo = methodInfo;
      local.push(argumentsArray);
    }

    var args = [];
    var pc = 0;

    function u30(): number {
      var result = code[pc++];
      if (result & 0x80) {
        result = result & 0x7f | code[pc++] << 7;
        if (result & 0x4000) {
          result = result & 0x3fff | code[pc++] << 14;
          if (result & 0x200000) {
            result = result & 0x1fffff | code[pc++] << 21;
            if (result & 0x10000000) {
              result = result & 0x0fffffff | code[pc++] << 28;
              result = result & 0xffffffff;
            }
          }
        }
      }
      return result >>> 0;
    }

    function s24(): number {
      var u = code[pc++] | (code[pc++] << 8) | (code[pc++] << 16);
      return (u << 8) >> 8;
    }

    function box(v) {
      return sec.box(v);
    }

    // Boxes the top of the stack.
    function peekBox() {
      return sec.box(stack[stack.length - 1]);
    }

    var hasNext2Infos: HasNext2Info [];

    function getHasNext2Info(pc: number): HasNext2Info {
      if (!hasNext2Infos) {
        hasNext2Infos = [];
      }
      if (!hasNext2Infos[pc]) {
        hasNext2Infos[pc] = new HasNext2Info(null, 0);
      }
      return hasNext2Infos[pc];
    }

    rn = new Multiname(abc, 0, null, null, null);

    var code = body.code;
    var bc: Bytecode;
    var value, object, receiver, type, a, b, offset, index, result;

    var scopeStacksHeight = scopeStacks.length;
    scopeStacks.push(scopes);

    interpretLabel:
    while (true) {
      interpreterWriter && interpreterWriter.greenLn("" + pc + ": " + Bytecode[code[pc]] + " [" +
                                                     stack.map(
                                                         x => stringifyStackEntry(x)).join(", ") +
                                                     "]");
      try {
        bc = code[pc++];
        switch (bc) {
          case Bytecode.LABEL:
            continue;
          case Bytecode.THROW:
            throw stack.pop();
          case Bytecode.KILL:
            local[u30()] = undefined;
            break;
          case Bytecode.IFNLT:
            b = stack.pop();
            a = stack.pop();
            offset = s24();
            pc = !(a < b) ? pc + offset : pc;
            continue;
          case Bytecode.IFGE:
            b = stack.pop();
            a = stack.pop();
            offset = s24();
            pc = a >= b ? pc + offset : pc;
            continue;
          case Bytecode.IFNLE:
            b = stack.pop();
            a = stack.pop();
            offset = s24();
            pc = !(a <= b) ? pc + offset : pc;
            continue;
          case Bytecode.IFGT:
            b = stack.pop();
            a = stack.pop();
            offset = s24();
            pc = a > b ? pc + offset : pc;
            continue;
          case Bytecode.IFNGT:
            b = stack.pop();
            a = stack.pop();
            offset = s24();
            pc = !(a > b) ? pc + offset : pc;
            continue;
          case Bytecode.IFLE:
            b = stack.pop();
            a = stack.pop();
            offset = s24();
            pc = a <= b ? pc + offset : pc;
            continue;
          case Bytecode.IFNGE:
            b = stack.pop();
            a = stack.pop();
            offset = s24();
            pc = !(a >= b) ? pc + offset : pc;
            continue;
          case Bytecode.IFLT:
            b = stack.pop();
            a = stack.pop();
            offset = s24();
            pc = a < b ? pc + offset : pc;
            continue;
          case Bytecode.JUMP:
            pc = s24() + pc;
            continue;
          case Bytecode.IFTRUE:
            offset = s24();
            pc = !!stack.pop() ? pc + offset : pc;
            continue;
          case Bytecode.IFFALSE:
            offset = s24();
            pc = !stack.pop() ? pc + offset : pc;
            continue;
          case Bytecode.IFEQ:
            b = stack.pop();
            a = stack.pop();
            offset = s24();
            pc = axEquals(a, b, sec) ? pc + offset : pc;
            continue;
          case Bytecode.IFNE:
            b = stack.pop();
            a = stack.pop();
            offset = s24();
            pc = !axEquals(a, b, sec) ? pc + offset : pc;
            continue;
          case Bytecode.IFSTRICTEQ:
            b = stack.pop();
            a = stack.pop();
            offset = s24();
            pc = a === b ? pc + offset : pc;
            continue;
          case Bytecode.IFSTRICTNE:
            b = stack.pop();
            a = stack.pop();
            offset = s24();
            pc = a !== b ? pc + offset : pc;
            continue;
          case Bytecode.LOOKUPSWITCH:
            var basePC = pc - 1;
            var defaultOffset = s24();
            var caseCount = u30();
            index = stack.pop();
            if (index <= caseCount) {
              pc = pc + 3 * index; // Jump to case offset.
              pc = basePC + s24();
            } else {
              pc = basePC + defaultOffset;
            }
            continue;
          //case Bytecode.pushwith:
          //  scope.push(box(stack.pop()), true);
          //  break;
          case Bytecode.POPSCOPE:
            scopes.pop();
            break;
          case Bytecode.NEXTNAME:
            index = stack.pop();
            receiver = peekBox();
            stack[stack.length - 1] = receiver.axNextName(index);
            break;
          case Bytecode.NEXTVALUE:
            index = stack.pop();
            receiver = peekBox();
            stack[stack.length - 1] = receiver.axNextValue(index);
            break;
          case Bytecode.HASNEXT2:
            var hasNext2Info = getHasNext2Info(pc);
            var objectIndex = u30();
            var indexIndex = u30();
            hasNext2Info.next(box(local[objectIndex]), <number>local[indexIndex]);
            local[objectIndex] = hasNext2Info.object;
            local[indexIndex] = hasNext2Info.index;
            stack.push(!!hasNext2Info.index);
            break;
          case Bytecode.PUSHNULL:
            stack.push(null);
            break;
          case Bytecode.PUSHUNDEFINED:
            stack.push(undefined);
            break;
          case Bytecode.PUSHBYTE:
            stack.push(code[pc++] << 24 >> 24);
            break;
          case Bytecode.PUSHSHORT:
            stack.push(u30() << 16 >> 16);
            break;
          case Bytecode.PUSHSTRING:
            stack.push(abc.getString(u30()));
            break;
          case Bytecode.PUSHINT:
            stack.push(abc.ints[u30()]);
            break;
          case Bytecode.PUSHUINT:
            stack.push(abc.uints[u30()]);
            break;
          case Bytecode.PUSHDOUBLE:
            stack.push(abc.doubles[u30()]);
            break;
          case Bytecode.PUSHTRUE:
            stack.push(true);
            break;
          case Bytecode.PUSHFALSE:
            stack.push(false);
            break;
          case Bytecode.PUSHNAN:
            stack.push(NaN);
            break;
          case Bytecode.POP:
            stack.pop();
            break;
          case Bytecode.DUP:
            stack.push(stack[stack.length - 1]);
            break;
          case Bytecode.SWAP:
            value = stack[stack.length - 1];
            stack[stack.length - 1] = stack[stack.length - 2];
            stack[stack.length - 2] = value;
            break;
          case Bytecode.PUSHSCOPE:
            scopes.push(box(stack.pop()), false);
            break;
          case Bytecode.PUSHWITH:
            scopes.push(box(stack.pop()), true);
            break;
          case Bytecode.PUSHNAMESPACE:
            stack.push(sec.AXNamespace.FromNamespace(abc.getNamespace(u30())));
            break;
          case Bytecode.NEWFUNCTION:
            stack.push(sec.createFunction(abc.getMethodInfo(u30()), scopes.topScope(), true));
            break;
          case Bytecode.CALL:
            popManyInto(stack, u30(), args);
            object = stack.pop();
            value = stack[stack.length - 1];
            validateCall(sec, value, args.length);
            stack[stack.length - 1] = value.axApply(object, args);
            break;
          case Bytecode.CONSTRUCT:
            popManyInto(stack, u30(), args);
            receiver = peekBox();
            validateConstruct(sec, receiver, args.length);
            stack[stack.length - 1] = receiver.axConstruct(args);
            break;
          case Bytecode.RETURNVOID:
            release || assert(scopeStacks.length === scopeStacksHeight + 1);
            scopeStacks.length--;
            return;
          case Bytecode.RETURNVALUE:
            value = stack.pop();
            // TODO: ensure proper unwinding of the scope stack.
            if (methodInfo.returnTypeNameIndex) {
              receiver = methodInfo.getType();
              if (receiver) {
                value = receiver.axCoerce(value);
              }
            }
            release || assert(scopeStacks.length === scopeStacksHeight + 1);
            scopeStacks.length--;
            return value;
          case Bytecode.CONSTRUCTSUPER:
            popManyInto(stack, u30(), args);
            (<any>savedScope.object).superClass.tPrototype.axInitializer.apply(stack.pop(), args);
            break;
          case Bytecode.CONSTRUCTPROP:
            index = u30();
            popManyInto(stack, u30(), args);
            popNameInto(stack, abc.getMultiname(index), rn);
            receiver = peekBox();
            stack[stack.length - 1] = receiver.axConstructProperty(rn, args);
            break;
          case Bytecode.CALLPROPLEX:
          case Bytecode.CALLPROPERTY:
          case Bytecode.CALLPROPVOID:
            index = u30();
            argCount = u30();
            popManyInto(stack, argCount, args);
            popNameInto(stack, abc.getMultiname(index), rn);
            receiver = box(stack[stack.length - 1]);
            result = receiver.axCallProperty(rn, args, bc === Bytecode.CALLPROPLEX);
            if (bc === Bytecode.CALLPROPVOID) {
              stack.length--;
            } else {
              stack[stack.length - 1] = result;
            }
            break;
          case Bytecode.CALLSUPER:
          case Bytecode.CALLSUPERVOID:
            index = u30();
            argCount = u30();
            popManyInto(stack, argCount, args);
            popNameInto(stack, abc.getMultiname(index), rn);
            receiver = box(stack[stack.length - 1]);
            result = receiver.axCallSuper(rn, savedScope, args);
            if (bc === Bytecode.CALLSUPERVOID) {
              stack.length--;
            } else {
              stack[stack.length - 1] = result;
            }
            break;
          //case Bytecode.CALLSTATIC:
          //  index = u30();
          //  argCount = u30();
          //  popManyInto(stack, argCount, args);
          //  value = abc.getMetadataInfo(index);
          //  var receiver = box(stack[stack.length - 1]);
          //  stack.push(value.axApply(receiver, args));
          //  break;
          case Bytecode.APPLYTYPE:
            popManyInto(stack, u30(), args);
            stack[stack.length - 1] = sec.applyType(stack[stack.length - 1], args);
            break;
          case Bytecode.NEWOBJECT:
            object = Object.create(sec.AXObject.tPrototype);
            argCount = u30();
            // For LIFO-order iteration to be correct, we have to add items highest on the stack
            // first.
            for (var i = stack.length - argCount * 2; i < stack.length; i += 2) {
              value = stack[i + 1];
              object.axSetPublicProperty(stack[i], value);
            }
            stack.length -= argCount * 2;
            stack.push(object);
            break;
          case Bytecode.NEWARRAY:
            object = [];
            argCount = u30();
            for (var i = stack.length - argCount; i < stack.length; i++) {
              object.push(stack[i]);
            }
            stack.length -= argCount;
            stack.push(sec.AXArray.axBox(object));
            break;
          case Bytecode.NEWACTIVATION:
            stack.push(sec.createActivation(methodInfo, scopes.topScope()));
            break;
          case Bytecode.NEWCLASS:
            stack[stack.length - 1] = sec.createClass(
              abc.classes[u30()], stack[stack.length - 1], scopes.topScope()
            );
            break;
          case Bytecode.GETDESCENDANTS:
            popNameInto(stack, abc.getMultiname(u30()), rn);
            if (rn.name === undefined) {
              rn.name = '*';
            }
            result = axGetDescendants(stack[stack.length - 1], rn, sec);
            release || checkValue(result);
            stack[stack.length - 1] = result;
            break;
          case Bytecode.NEWCATCH:
            stack.push(sec.createCatch(body.catchBlocks[u30()], scopes.topScope()));
            break;
          case Bytecode.FINDPROPERTY:
          case Bytecode.FINDPROPSTRICT:
            popNameInto(stack, abc.getMultiname(u30()), rn);
            stack.push(scopes.topScope().findScopeProperty(rn, bc === Bytecode.FINDPROPSTRICT, false));
            break;
          case Bytecode.GETLEX:
            popNameInto(stack, abc.getMultiname(u30()), rn);
            object = scopes.topScope().findScopeProperty(rn, true, false);
            result = object.axGetProperty(rn);
            release || checkValue(result);
            stack.push(result);
            break;
          case Bytecode.INITPROPERTY:
          case Bytecode.SETPROPERTY:
            value = stack.pop();
            popNameInto(stack, abc.getMultiname(u30()), rn);
            receiver = box(stack.pop());
            receiver.axSetProperty(rn, value, Bytecode.INITPROPERTY, methodInfo);
            break;
          case Bytecode.GETPROPERTY:
            popNameInto(stack, abc.getMultiname(u30()), rn);
            receiver = peekBox();
            result = receiver.axGetProperty(rn);
            release || checkValue(result);
            stack[stack.length - 1] = result;
            break;
          case Bytecode.DELETEPROPERTY:
            popNameInto(stack, abc.getMultiname(u30()), rn);
            receiver = peekBox();
            stack[stack.length - 1] = receiver.axDeleteProperty(rn);
            break;
          case Bytecode.GETSUPER:
            popNameInto(stack, abc.getMultiname(u30()), rn);
            receiver = peekBox();
            result = receiver.axGetSuper(rn, savedScope);
            release || checkValue(result);
            stack[stack.length - 1] = result;
            break;
          case Bytecode.SETSUPER:
            value = stack.pop();
            popNameInto(stack, abc.getMultiname(u30()), rn);
            receiver = box(stack.pop());
            receiver.axSetSuper(rn, savedScope, value);
            break;
          case Bytecode.GETLOCAL:
            stack.push(local[u30()]);
            break;
          case Bytecode.SETLOCAL:
            local[u30()] = stack.pop();
            break;
          case Bytecode.GETGLOBALSCOPE:
            stack.push(savedScope.global.object);
            break;
          case Bytecode.GETSCOPEOBJECT:
            stack.push(scopes.get(code[pc++]));
            break;
          case Bytecode.GETSLOT:
            receiver = peekBox();
            result = receiver.axGetSlot(u30());
            release || checkValue(result);
            stack[stack.length - 1] = result;
            break;
          case Bytecode.SETSLOT:
            value = stack.pop();
            receiver = box(stack.pop());
            receiver.axSetSlot(u30(), value);
            break;
          case Bytecode.GETGLOBALSLOT:
            result = savedScope.global.object.axGetSlot(u30());
            release || checkValue(result);
            stack[stack.length - 1] = result;
            break;
          case Bytecode.SETGLOBALSLOT:
            value = stack.pop();
            savedScope.global.object.axSetSlot(u30(), value);
            break;
          case Bytecode.ESC_XATTR:
            stack[stack.length - 1] = AS.escapeAttributeValue(stack[stack.length - 1]);
            break;
          case Bytecode.ESC_XELEM:
            stack[stack.length - 1] = AS.escapeElementValue(stack[stack.length - 1]);
            break;
          case Bytecode.COERCE_I:
          case Bytecode.CONVERT_I:
            stack[stack.length - 1] |= 0;
            break;
          case Bytecode.COERCE_U:
          case Bytecode.CONVERT_U:
            stack[stack.length - 1] >>>= 0;
            break;
          case Bytecode.COERCE_D:
          case Bytecode.CONVERT_D:
            stack[stack.length - 1] = +stack[stack.length - 1];
            break;
          case Bytecode.COERCE_B:
          case Bytecode.CONVERT_B:
            stack[stack.length - 1] = !!stack[stack.length - 1];
            break;
          case Bytecode.COERCE_S:
            stack[stack.length - 1] = axCoerceString(stack[stack.length - 1]);
            break;
          case Bytecode.CONVERT_S:
            stack[stack.length - 1] = axConvertString(stack[stack.length - 1]);
            break;
          case Bytecode.CHECKFILTER:
            stack[stack.length - 1] = axCheckFilter(sec, stack[stack.length - 1]);
            break;
          case Bytecode.COERCE:
            popNameInto(stack, abc.getMultiname(u30()), rn);
            type = scopes.topScope().getScopeProperty(rn, true, false);
            stack[stack.length - 1] = type.axCoerce(stack[stack.length - 1]);
            break;
          case Bytecode.COERCE_A: /* NOP */
            break;
          case Bytecode.ASTYPE:
            popNameInto(stack, abc.getMultiname(u30()), rn);
            receiver = scopes.topScope().getScopeProperty(rn, true, false);
            stack[stack.length - 2] = receiver.axAsType(stack[stack.length - 1]);
            break;
          case Bytecode.ASTYPELATE:
            receiver = stack.pop();
            stack[stack.length - 1] = receiver.axAsType(stack[stack.length - 1]);
            break;
          case Bytecode.COERCE_O:
            object = stack[stack.length - 1];
            stack[stack.length - 1] = object == undefined ? null : object;
            break;
          case Bytecode.NEGATE:
            stack[stack.length - 1] = -stack[stack.length - 1];
            break;
          case Bytecode.INCREMENT:
            ++stack[stack.length - 1];
            break;
          case Bytecode.INCLOCAL:
            ++(<number []>local)[u30()];
            break;
          case Bytecode.DECREMENT:
            --stack[stack.length - 1];
            break;
          case Bytecode.DECLOCAL:
            --(<number []>local)[u30()];
            break;
          case Bytecode.TYPEOF:
            stack[stack.length - 1] = axTypeOf(stack[stack.length - 1], sec);
            break;
          case Bytecode.NOT:
            stack[stack.length - 1] = !stack[stack.length - 1];
            break;
          case Bytecode.BITNOT:
            stack[stack.length - 1] = ~stack[stack.length - 1];
            break;
          case Bytecode.ADD:
            b = stack.pop();
            a = stack[stack.length - 1];
            if (typeof a === "number" && typeof b === "number") {
              stack[stack.length - 1] = a + b;
            } else {
              stack[stack.length - 1] = axAdd(a, b, sec);
            }
            break;
          case Bytecode.SUBTRACT:
            stack[stack.length - 2] -= stack.pop();
            break;
          case Bytecode.MULTIPLY:
            stack[stack.length - 2] *= stack.pop();
            break;
          case Bytecode.DIVIDE:
            stack[stack.length - 2] /= stack.pop();
            break;
          case Bytecode.MODULO:
            stack[stack.length - 2] %= stack.pop();
            break;
          case Bytecode.LSHIFT:
            stack[stack.length - 2] <<= stack.pop();
            break;
          case Bytecode.RSHIFT:
            stack[stack.length - 2] >>= stack.pop();
            break;
          case Bytecode.URSHIFT:
            stack[stack.length - 2] >>>= stack.pop();
            break;
          case Bytecode.BITAND:
            stack[stack.length - 2] &= stack.pop();
            break;
          case Bytecode.BITOR:
            stack[stack.length - 2] |= stack.pop();
            break;
          case Bytecode.BITXOR:
            stack[stack.length - 2] ^= stack.pop();
            break;
          case Bytecode.EQUALS:
            a = stack[stack.length - 2];
            b = stack.pop();
            stack[stack.length - 1] = axEquals(a, b, sec);
            break;
          case Bytecode.STRICTEQUALS:
            stack[stack.length - 2] = stack[stack.length - 2] === stack.pop();
            break;
          case Bytecode.LESSTHAN:
            stack[stack.length - 2] = stack[stack.length - 2] < stack.pop();
            break;
          case Bytecode.LESSEQUALS:
            stack[stack.length - 2] = stack[stack.length - 2] <= stack.pop();
            break;
          case Bytecode.GREATERTHAN:
            stack[stack.length - 2] = stack[stack.length - 2] > stack.pop();
            break;
          case Bytecode.GREATEREQUALS:
            stack[stack.length - 2] = stack[stack.length - 2] >= stack.pop();
            break;
          case Bytecode.INSTANCEOF:
            receiver = stack.pop();
            stack[stack.length - 1] = receiver.axIsInstanceOf(stack[stack.length - 1]);
            break;
          case Bytecode.ISTYPE:
            popNameInto(stack, abc.getMultiname(u30()), rn);
            receiver = scopes.topScope().findScopeProperty(rn, true, false);
            stack[stack.length - 1] = receiver.axIsType(stack[stack.length - 1]);
            break;
          case Bytecode.ISTYPELATE:
            receiver = stack.pop();
            stack[stack.length - 1] = receiver.axIsType(stack[stack.length - 1]);
            break;
          case Bytecode.IN:
            receiver = box(stack.pop());
            var name = stack[stack.length - 1];
            if (name && name.axClass === sec.AXQName) {
              stack[stack.length - 1] = receiver.axHasProperty(name.name);
            } else {
              stack[stack.length - 1] = receiver.axHasPublicProperty(name);
            }
            break;
          case Bytecode.INCREMENT_I:
            stack[stack.length - 1] = (stack[stack.length - 1] | 0) + 1;
            break;
          case Bytecode.DECREMENT_I:
            stack[stack.length - 1] = (stack[stack.length - 1] | 0) - 1;
            break;
          case Bytecode.INCLOCAL_I:
            index = u30();
            (<number []>local)[index] = ((<number []>local)[index] | 0) + 1;
            break;
          case Bytecode.DECLOCAL_I:
            index = u30();
            (<number []>local)[index] = ((<number []>local)[index] | 0) - 1;
            break;
          case Bytecode.NEGATE_I:
            stack[stack.length - 1] = -(stack[stack.length - 1] | 0);
            break;
          case Bytecode.ADD_I:
            stack[stack.length - 2] = (stack[stack.length - 2]|0) + (stack.pop()|0) | 0;
            break;
          case Bytecode.SUBTRACT_I:
            stack[stack.length - 2] = (stack[stack.length - 2]|0) - (stack.pop()|0) | 0;
            break;
          case Bytecode.MULTIPLY_I:
            stack[stack.length - 2] = (stack[stack.length - 2]|0) * (stack.pop()|0) | 0;
            break;
          case Bytecode.GETLOCAL0:
          case Bytecode.GETLOCAL1:
          case Bytecode.GETLOCAL2:
          case Bytecode.GETLOCAL3:
            stack.push(local[bc - Bytecode.GETLOCAL0]);
            break;
          case Bytecode.SETLOCAL0:
          case Bytecode.SETLOCAL1:
          case Bytecode.SETLOCAL2:
          case Bytecode.SETLOCAL3:
            local[bc - Bytecode.SETLOCAL0] = stack.pop();
            break;
          case Bytecode.DXNS:
            scopes.topScope().defaultNamespace = new Namespace(null, NamespaceType.Public,
                                                               abc.getString(u30()));
            break;
          case Bytecode.DXNSLATE:
            scopes.topScope().defaultNamespace = new Namespace(null, NamespaceType.Public,
                                                               stack.pop());
            break;
          case Bytecode.DEBUG:
            pc ++; u30();
            pc ++; u30();
            break;
          case Bytecode.DEBUGLINE:
          case Bytecode.DEBUGFILE:
            u30();
            break;
          case Bytecode.NOP:
          case Bytecode.BKPT:
            break;
          default:
            Debug.notImplemented(Bytecode[bc]);
        }
      } catch (e) {
        // TODO: e = translateError(e);

        // All script exceptions must be primitive or have a security domain, if they don't then
        // this must be a VM exception.
        if (!isValidASValue(e)) {
          // We omit many checks in the interpreter loop above to keep the code small. These
          // checks can be done after the fact here by turning the VM-internal exception into a
          // proper error according to the current operation.
          e = createValidException(sec, e, bc, value, receiver, a, b, rn, scopeStacksHeight + 1);
        }

        var catchBlocks = body.catchBlocks;
        for (var i = 0; i < catchBlocks.length; i++) {
          var handler = catchBlocks[i];
          if (pc >= handler.start && pc <= handler.end) {
            var typeName = handler.getType();
            if (!typeName || applicationDomain.getClass(typeName).axIsType(e)) {
              stack.length = 0;
              stack.push(e);
              scopes.clear();
              pc = handler.target;
              continue interpretLabel;
            }
          }
        }

        release || assert(scopeStacks.length === scopeStacksHeight + 1);
        scopeStacks.length--;
        throw e;
      }
    }
  }

  function createValidException(sec: AXSecurityDomain, internalError, bc: Bytecode,
                                value: any, receiver: any, a: any, b: any, mn: Multiname,
                                expectedScopeStacksHeight: number) {
    var isProperErrorObject = internalError instanceof Error &&
                              typeof internalError.name === 'string' &&
                              typeof internalError.message === 'string';
    if (isProperErrorObject) {
      if (internalError.name === 'InternalError') {
        var obj = Object.create(sec.AXError.tPrototype);
        obj._errorID = 1023;
        // Stack exhaustion errors are annoying to catch: Identifying them requires
        // pattern-matching of error messages, and throwing them must be done very
        // carefully to not cause the next one.
        if (internalError.message === 'allocation size overflow') {
          obj.$Bgmessage = "allocation size overflow";
          return obj;
        }
        if (internalError.message.indexOf('recursion') > -1 ||
            internalError.name === 'RangeError' &&
            internalError.message.indexOf('call stack size exceeded') > -1)
        {
          obj.$Bgmessage = "Stack overflow occurred";
          scopeStacks.length = expectedScopeStacksHeight;
          return obj;
        }
      } else if (internalError.name === 'RangeError') {
        // ..
      }
    }
    var message: string;
    var isSuper = false;
    switch (bc) {
      case Bytecode.CALL:
        if (!value || !value.axApply) {
          return sec.createError('TypeError', Errors.CallOfNonFunctionError, 'value');
        }
        break;
      case Bytecode.CONSTRUCT:
        if (!receiver || !receiver.axConstruct) {
          return sec.createError('TypeError', Errors.ConstructOfNonFunctionError);
        }
        break;
      case Bytecode.CALLSUPERVOID:
      case Bytecode.CONSTRUCTSUPER:
        isSuper = true;
        // Fallthrough.
      case Bytecode.CALLPROPERTY:
      case Bytecode.CALLPROPVOID:
      case Bytecode.CALLPROPLEX:
      case Bytecode.CONSTRUCTPROP:
      case Bytecode.CALLSUPER:
        if (receiver === null) {
          return sec.createError('TypeError', Errors.ConvertNullToObjectError);
        }
        if (receiver === undefined) {
          return sec.createError('TypeError', Errors.ConvertUndefinedToObjectError);
        }
        if (!(receiver.axResolveMultiname(mn) in receiver)) {
          var axClass = isSuper ? receiver.axClass.superClass : receiver.axClass;
          if (axClass.classInfo.instanceInfo.isSealed()) {
            return sec.createError('ReferenceError', Errors.ReadSealedError, mn.name,
                                   axClass.name.toFQNString(false));
          }
          return sec.createError('TypeError', isSuper ?
                                              Errors.ConstructOfNonFunctionError :
                                              Errors.CallOfNonFunctionError, mn.name);
        }
        if (isProperErrorObject && internalError.name === 'RangeError' &&
            (internalError.message.indexOf('arguments array passed') > -1 ||
             internalError.message.indexOf('call stack size') > -1)) {
          return sec.createError('RangeError', Errors.StackOverflowError);
        }
        break;
      case Bytecode.GETSUPER:
        isSuper = true;
        // Fallthrough.
      case Bytecode.GETPROPERTY:
        if (receiver === null) {
          return sec.createError('TypeError', Errors.ConvertNullToObjectError);
        }
        if (receiver === undefined) {
          return sec.createError('TypeError', Errors.ConvertUndefinedToObjectError);
        }
        break;
      case Bytecode.INITPROPERTY:
      case Bytecode.SETPROPERTY:
        if (receiver === null) {
          return sec.createError('TypeError', Errors.ConvertNullToObjectError);
        }
        if (receiver === undefined) {
          return sec.createError('TypeError', Errors.ConvertUndefinedToObjectError);
        }
        var nm = receiver.axResolveMultiname(mn);
        if (nm in receiver && Object.getOwnPropertyDescriptor(receiver, nm).writable === false) {
          return sec.createError('ReferenceError', Errors.ConstWriteError, nm,
                                 receiver.axClass.name.name);
        }
        break;
      case Bytecode.INSTANCEOF:
        if (!receiver || !receiver.axIsInstanceOf) {
          return sec.createError('TypeError', Errors.CantUseInstanceofOnNonObjectError);
        }
        break;
      case Bytecode.ISTYPE:
      case Bytecode.ISTYPELATE:
        if (receiver === null) {
          return sec.createError('TypeError', Errors.ConvertNullToObjectError);
        }
        if (receiver === undefined) {
          return sec.createError('TypeError', Errors.ConvertUndefinedToObjectError);
        }
        if (!receiver.axIsType) {
          return sec.createError('TypeError', Errors.IsTypeMustBeClassError);
        }
        break;
      case Bytecode.IN:
        if (receiver === null) {
          return sec.createError('TypeError', Errors.ConvertNullToObjectError);
        }
        if (receiver === undefined) {
          return sec.createError('TypeError', Errors.ConvertUndefinedToObjectError);
        }
        break;
      case Bytecode.IFEQ:
      case Bytecode.IFNE:
      case Bytecode.EQUALS:
        if (typeof a !== typeof b) {
          if (typeof a === 'object' && a && typeof b !== 'object' ||
              typeof b === 'object' && b && typeof a !== 'object') {
            return sec.createError('TypeError', Errors.ConvertToPrimitiveError, 'Object');
          }
        }
        break;
      default:
        // Pattern-match some otherwise-annoying-to-convert exceptions. This is all best-effort,
        // so we fail if we're not sure about something.
        if (!internalError || typeof internalError.message !== 'string' ||
            typeof internalError.stack !== 'string' ||
            typeof internalError.name !== 'string') {
          break;
        }
        message = internalError.message;
        var stack = internalError.stack.split('\n');
        var lastFunctionEntry = stack[0].indexOf('at ') === 0 ? stack[0].substr(3) : stack[0];
        switch (internalError.name) {
          case 'TypeError':
            if (lastFunctionEntry.indexOf('AXBasePrototype_valueOf') === 0 ||
                lastFunctionEntry.indexOf('AXBasePrototype_toString') === 0)
            {
              return sec.createError('TypeError', Errors.CallOfNonFunctionError, 'value');
            }
        }
    }
    // To be sure we don't let VM exceptions flow into the player, box them manually here,
    // even in release builds.
    message = 'Uncaught VM-internal exception during op ' + Bytecode[bc] + ': ';
    var stack;
    try {
      message += internalError.toString();
      stack = internalError.stack;
    } catch (e) {
      message += '[Failed to stringify exception]';
    }
    // In the extension, we can just kill all the things.
    var player = sec['player'];
    console.error(message, '\n', stack);
    if (player) {
      //player.executeFSCommand('quit', [message]);
      //} else if (typeof jsGlobal.quit === 'function') {
      //  jsGlobal.quit();
    }
    // In other packagings, at least throw a valid value.
    return sec.createError('Error', Errors.InternalErrorIV);
  }

  function stringifyStackEntry(x: any) {
    if (!x || !x.toString) {
      return String(x);
    }
    if (x.$BgtoString && x.$BgtoString.isInterpreted) {
      return '<unprintable ' + (x.axClass ? x.axClass.name.toFQNString(false) : 'object') + '>';
    }
    try {
      return x.toString();
    } catch (e) {
      return '<unprintable ' + (x.axClass ? x.axClass.name.toFQNString(false) : 'object') + '>';
    }
  }
}
