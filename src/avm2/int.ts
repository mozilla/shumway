module Shumway.AVMX {
  import assert = Shumway.Debug.assert;
  var writer = new IndentingWriter();

  import box = Shumway.ObjectUtilities.boxValue;
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
    }

    public topScope(): Scope {
      if (!this.scopes) {
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
    rn.kind = mn.kind;
    if (mn.isRuntimeName()) {
      rn.name = stack.pop();
    } else {
      rn.name = mn.name;
    }
    if (mn.isRuntimeNamespace()) {
      rn.namespaces = [stack.pop()];
    } else {
      rn.namespaces = mn.namespaces;
    }
  }


  export function interpret(self: Object, methodInfo: MethodInfo, savedScope: Scope, args: any []) {
    writer.enter("> " + methodInfo);
    try {
      var result = _interpret(self, methodInfo, savedScope, args);
      writer.leave("< " + methodInfo);
      return result;
    } catch (e) {
      writer.leave("< " + methodInfo + ", Exception: " + e);
      throw e;
    }
  }

  function _interpret(self: Object, methodInfo: MethodInfo, savedScope: Scope, args: any []) {
    var abc = methodInfo.abc;
    var body = methodInfo.getBody();
    release || assert(body);

    var local = [self];
    var stack = [];
    var scope = new ScopeStack(savedScope);

    var argCount = args.length;
    var arg;
    for (var i = 0, j = methodInfo.parameters.length; i < j; i++) {
      var p = methodInfo.parameters[i];
      if (i < argCount) {
        arg = args[i];
      } else {
        // arg = p.
      }
      local.push(arg);
    }

    var pc = 0;

    function s32(): number {
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
      return result;
    }

    function u30(): number {
      return s32() >>> 0;
    }

    function u32(): number {
      return s32() >>> 0;
    }

    var rn = new Multiname(abc, 0, null, null, null);

    var code = body.code;
    var value;

    while (true) {
      writer.greenLn("" + pc + ", BC: " + Bytecode[code[pc]] + " [" + stack.map(String).join(", ") + "]");
      try {
        var bc = code[pc++];
        switch (bc) {
          case Bytecode.THROW:
            throw stack.pop();
          //case Bytecode.GETSUPER:
          //  popNameInto(stack, multinames[bc.index], mn);
          //  stack.push(stack.pop().asGetSuper (
          //    savedScope, mn.namespaces, mn.name, mn.flags
          //  ));
          //  break;
          //case Bytecode.setsuper:
          //  value = stack.pop();
          //  popNameInto(stack, multinames[bc.index], mn);
          //  stack.pop().asSetSuper (
          //    savedScope, mn.namespaces, mn.name, mn.flags, value
          //  );
          //  break;
          //case Bytecode.kill:
          //  locals[bc.index] = undefined;
          //  break;
          //case Bytecode.ifnlt:
          //  b = stack.pop();
          //  a = stack.pop();
          //  pc = !(a < b) ? bc.offset : pc + 1;
          //  continue;
          //case Bytecode.ifge:
          //  b = stack.pop();
          //  a = stack.pop();
          //  pc = a >= b ? bc.offset : pc + 1;
          //  continue;
          //case Bytecode.ifnle:
          //  b = stack.pop();
          //  a = stack.pop();
          //  pc = !(a <= b) ? bc.offset : pc + 1;
          //  continue;
          //case Bytecode.ifgt:
          //  b = stack.pop();
          //  a = stack.pop();
          //  pc = a > b ? bc.offset : pc + 1;
          //  continue;
          //case Bytecode.ifngt:
          //  b = stack.pop();
          //  a = stack.pop();
          //  pc = !(a > b) ? bc.offset : pc + 1;
          //  continue;
          //case Bytecode.ifle:
          //  b = stack.pop();
          //  a = stack.pop();
          //  pc = a <= b ? bc.offset : pc + 1;
          //  continue;
          //case Bytecode.ifnge:
          //  b = stack.pop();
          //  a = stack.pop();
          //  pc = !(a >= b) ? bc.offset : pc + 1;
          //  continue;
          //case Bytecode.iflt:
          //  b = stack.pop();
          //  a = stack.pop();
          //  pc = a < b ? bc.offset : pc + 1;
          //  continue;
          //case Bytecode.jump:
          //  pc = bc.offset;
          //  continue;
          //case Bytecode.iftrue:
          //  pc = !!stack.pop() ? bc.offset : pc + 1;
          //  continue;
          //case Bytecode.iffalse:
          //  pc = !stack.pop() ? bc.offset : pc + 1;
          //  continue;
          //case Bytecode.ifeq:
          //  b = stack.pop();
          //  a = stack.pop();
          //  pc = asEquals(a, b) ? bc.offset : pc + 1;
          //  continue;
          //case Bytecode.ifne:
          //  b = stack.pop();
          //  a = stack.pop();
          //  pc = !asEquals(a, b) ? bc.offset : pc + 1;
          //  continue;
          //case Bytecode.ifstricteq:
          //  b = stack.pop();
          //  a = stack.pop();
          //  pc = a === b ? bc.offset : pc + 1;
          //  continue;
          //case Bytecode.ifstrictne:
          //  b = stack.pop();
          //  a = stack.pop();
          //  pc = a !== b ? bc.offset : pc + 1;
          //  continue;
          //case Bytecode.lookupswitch:
          //  index = stack.pop();
          //  if (index < 0 || index >= bc.offsets.length) {
          //    index = bc.offsets.length - 1; // The last target is the default.
          //  }
          //  pc = bc.offsets[index];
          //  continue;
          //case Bytecode.pushwith:
          //  scope.push(box(stack.pop()), true);
          //  break;
          case Bytecode.POPSCOPE:
            scope.pop();
            break;
          //case Bytecode.nextname:
          //  index = stack.pop();
          //  stack[stack.length - 1] = box(stack[stack.length - 1]).asNextName(index);
          //  break;
          //case Bytecode.nextvalue:
          //  index = stack.pop();
          //  stack[stack.length - 1] = box(stack[stack.length - 1]).asNextValue(index);
          //  break;
          //case Bytecode.hasnext2:
          //  var hasNext2Info = hasNext2Infos[pc] || (hasNext2Infos[pc] = new HasNext2Info(null, 0));
          //  object = locals[bc.object];
          //  index = locals[bc.index];
          //  hasNext2Info.object = object;
          //  hasNext2Info.index = index;
          //  Object(object).asHasNext2(hasNext2Info);
          //  locals[bc.object] = hasNext2Info.object;
          //  locals[bc.index] = hasNext2Info.index;
          //  stack.push(!!hasNext2Info.index);
          //  break;
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
          //case Bytecode.swap:
          //  object = stack[stack.length - 1];
          //  stack[stack.length - 1] = stack[stack.length - 2];
          //  stack[stack.length - 2] = object;
          //  break;
          case Bytecode.PUSHSCOPE:
            scope.push(box(stack.pop()), false);
            break;
          //case Bytecode.newfunction:
          //  stack.push(createFunction(methods[bc.index], scope.topScope(), true, false));
          //  break;
          //case Bytecode.call:
          //  popManyInto(stack, bc.argCount, args);
          //  object = stack.pop();
          //  stack[stack.length - 1] = stack[stack.length - 1].asApply(object, args);
          //  break;
          //case Bytecode.construct:
          //  popManyInto(stack, bc.argCount, args);
          //  stack[stack.length - 1] = construct(stack[stack.length - 1], args);
          //  break;
          case Bytecode.RETURNVOID:
            return;
          case Bytecode.RETURNVALUE:
            if (methodInfo.returnType) {
              // return asCoerceByMultiname(method, method.returnType, stack.pop());
            }
            return stack.pop();
          //case Bytecode.constructsuper:
          //  popManyInto(stack, bc.argCount, args);
          //  object = stack.pop();
          //  savedScope.object.baseClass.instanceConstructorNoInitialize.apply(object, args);
          //  break;
          //case Bytecode.constructprop:
          //  popManyInto(stack, bc.argCount, args);
          //  popNameInto(stack, multinames[bc.index], mn);
          //  object = box(stack[stack.length - 1]);
          //  object = object.asConstructProperty(mn.namespaces, mn.name, mn.flags, args);
          //  stack[stack.length - 1] = object;
          //  break;
          //case Bytecode.callsuperid:
          //  Shumway.Debug.notImplemented("Bytecode.callsuperid");
          //  break;
          // case Bytecode.CALLPROPLEX:
          case Bytecode.CALLPROPERTY:
          case Bytecode.CALLPROPVOID:
            var index = u30();
            var argCount = u30();
            popManyInto(stack, argCount, args);
            popNameInto(stack, abc.getMultiname(index), rn);
            var result = box(stack.pop()).axCallProperty(rn, args);
            if (bc !== Bytecode.CALLPROPVOID) {
              stack.push(result);
            }
            break;
          //case Bytecode.callsuper:
          //case Bytecode.callsupervoid:
          //  popManyInto(stack, bc.argCount, args);
          //  popNameInto(stack, multinames[bc.index], mn);
          //  result = stack.pop().asCallSuper (
          //    savedScope, mn.namespaces, mn.name, mn.flags, args
          //  );
          //  if (op !== Bytecode.callsupervoid) {
          //    stack.push(result);
          //  }
          //  break;
          //case Bytecode.applytype:
          //  popManyInto(stack, bc.argCount, args);
          //  stack[stack.length - 1] = applyType(method, stack[stack.length - 1], args);
          //  break;
          //case Bytecode.newobject:
          //  object = {};
          //  for (var i = 0; i < bc.argCount; i++) {
          //    value = stack.pop();
          //    object[Multiname.getPublicQualifiedName(stack.pop())] = value;
          //  }
          //  stack.push(object);
          //  break;
          //case Bytecode.newarray:
          //  object = [];
          //  popManyInto(stack, bc.argCount, args);
          //  object.push.apply(object, args);
          //  stack.push(object);
          //  break;
          //case Bytecode.newactivation:
          //  release || assert(method.needsActivation());
          //  stack.push(asCreateActivation(method));
          //  break;
          case Bytecode.NEWCLASS:
            stack[stack.length - 1] = createClass(
              abc.classes[u30()], stack[stack.length - 1], scope.topScope()
            );
            break;
          //case Bytecode.getdescendants:
          //  popNameInto(stack, multinames[bc.index], mn);
          //  if (mn.name === undefined) {
          //    mn.name = '*';
          //  }
          //  stack.push(getDescendants(stack.pop(), mn));
          //  break;
          //case Bytecode.newcatch:
          //  release || assert(exceptions[bc.index].scopeObject);
          //  stack.push(exceptions[bc.index].scopeObject);
          //  break;
          case Bytecode.FINDPROPERTY:
          case Bytecode.FINDPROPSTRICT:
            popNameInto(stack, abc.getMultiname(u30()), rn);
            stack.push(scope.topScope().findScopeProperty(rn, bc === Bytecode.FINDPROPSTRICT, false));
            break;
          //case Bytecode.getlex:
          //  multiname = multinames[bc.index];
          //  object = scope.topScope().findScopeProperty (
          //    multiname.namespaces, multiname.name, multiname.flags, method, true, false
          //  );
          //  stack.push(object.asGetProperty(multiname.namespaces, multiname.name, multiname.flags));
          //  break;
          case Bytecode.INITPROPERTY:
          case Bytecode.SETPROPERTY:
            value = stack.pop();
            popNameInto(stack, abc.getMultiname(u30()), rn);
            box(stack.pop()).axSetProperty(rn, value);
            break;
          case Bytecode.GETLOCAL:
            stack.push(local[u30()]);
            break;
          //case Bytecode.setlocal:
          //  locals[bc.index] = stack.pop();
          //  break;
          //case Bytecode.getglobalscope:
          //  stack.push(savedScope.global.object);
          //  break;
          //case Bytecode.getscopeobject:
          //  stack.push(scope.get(bc.index));
          //  break;
          case Bytecode.GETPROPERTY:
            popNameInto(stack, abc.getMultiname(u30()), rn);
            stack[stack.length - 1] = box(stack[stack.length - 1]).axGetProperty(rn);
            break;
          //case Bytecode.deleteproperty:
          //  popNameInto(stack, multinames[bc.index], mn);
          //  stack[stack.length - 1] = box(stack[stack.length - 1]).asDeleteProperty(mn.namespaces, mn.name, mn.flags);
          //  break;
          //case Bytecode.getslot:
          //  stack[stack.length - 1] = asGetSlot(stack[stack.length - 1], bc.index);
          //  break;
          //case Bytecode.setslot:
          //  value = stack.pop();
          //  object = stack.pop();
          //  asSetSlot(object, bc.index, value);
          //  break;
          //case Bytecode.convert_s:
          //  stack[stack.length - 1] = asCoerceString(stack[stack.length - 1]);
          //  break;
          //case Bytecode.esc_xattr:
          //  stack[stack.length - 1] = Runtime.escapeXMLAttribute(stack[stack.length - 1]);
          //  break;
          //case Bytecode.esc_xelem:
          //  stack[stack.length - 1] = Runtime.escapeXMLElement(stack[stack.length - 1]);
          //  break;
          //case Bytecode.coerce_i:
          //case Bytecode.convert_i:
          //  stack[stack.length - 1] |= 0;
          //  break;
          //case Bytecode.coerce_u:
          //case Bytecode.convert_u:
          //  stack[stack.length - 1] >>>= 0;
          //  break;
          //case Bytecode.coerce_d:
          //case Bytecode.convert_d:
          //  stack[stack.length - 1] = +stack[stack.length - 1];
          //  break;
          //case Bytecode.coerce_b:
          //case Bytecode.convert_b:
          //  stack[stack.length - 1] = !!stack[stack.length - 1];
          //  break;
          //case Bytecode.checkfilter:
          //  stack[stack.length - 1] = checkFilter(stack[stack.length - 1]);
          //  break;
          //case Bytecode.coerce:
          //  stack[stack.length - 1] = asCoerce(domain.getType(multinames[bc.index]), stack[stack.length - 1]);
          //  break;
          case Bytecode.COERCE_A: /* NOP */
            break;
          //case Bytecode.coerce_s:
          //  stack[stack.length - 1] = asCoerceString(stack[stack.length - 1]);
          //  break;
          //case Bytecode.astype:
          //  stack[stack.length - 2] = asAsType(domain.getType(multinames[bc.index]), stack[stack.length - 1]);
          //  break;
          //case Bytecode.astypelate:
          //  stack[stack.length - 2] = asAsType(stack.pop(), stack[stack.length - 1]);
          //  break;
          //case Bytecode.coerce_o:
          //  object = stack[stack.length - 1];
          //  stack[stack.length - 1] = object == undefined ? null : object;
          //  break;
          //case Bytecode.negate:
          //  stack[stack.length - 1] = -stack[stack.length - 1];
          //  break;
          //case Bytecode.increment:
          //  ++stack[stack.length - 1];
          //  break;
          //case Bytecode.inclocal:
          //  ++locals[bc.index];
          //  break;
          //case Bytecode.decrement:
          //  --stack[stack.length - 1];
          //  break;
          //case Bytecode.declocal:
          //  --locals[bc.index];
          //  break;
          //case Bytecode.typeof:
          //  stack[stack.length - 1] = asTypeOf(stack[stack.length - 1]);
          //  break;
          //case Bytecode.not:
          //  stack[stack.length - 1] = !stack[stack.length - 1];
          //  break;
          //case Bytecode.bitnot:
          //  stack[stack.length - 1] = ~stack[stack.length - 1];
          //  break;
          //case Bytecode.add:
          //  stack[stack.length - 2] = asAdd(stack[stack.length - 2], stack.pop());
          //  break;
          //case Bytecode.subtract:
          //  stack[stack.length - 2] -= stack.pop();
          //  break;
          //case Bytecode.multiply:
          //  stack[stack.length - 2] *= stack.pop();
          //  break;
          case Bytecode.DIVIDE:
            stack[stack.length - 2] /= stack.pop();
            break;
          //case Bytecode.modulo:
          //  stack[stack.length - 2] %= stack.pop();
          //  break;
          //case Bytecode.lshift:
          //  stack[stack.length - 2] <<= stack.pop();
          //  break;
          //case Bytecode.rshift:
          //  stack[stack.length - 2] >>= stack.pop();
          //  break;
          //case Bytecode.urshift:
          //  stack[stack.length - 2] >>>= stack.pop();
          //  break;
          //case Bytecode.bitand:
          //  stack[stack.length - 2] &= stack.pop();
          //  break;
          //case Bytecode.bitor:
          //  stack[stack.length - 2] |= stack.pop();
          //  break;
          //case Bytecode.bitxor:
          //  stack[stack.length - 2] ^= stack.pop();
          //  break;
          //case Bytecode.equals:
          //  stack[stack.length - 2] = asEquals(stack[stack.length - 2], stack.pop());
          //  break;
          //case Bytecode.strictequals:
          //  stack[stack.length - 2] = stack[stack.length - 2] === stack.pop();
          //  break;
          //case Bytecode.lessthan:
          //  stack[stack.length - 2] = stack[stack.length - 2] < stack.pop();
          //  break;
          //case Bytecode.lessequals:
          //  stack[stack.length - 2] = stack[stack.length - 2] <= stack.pop();
          //  break;
          //case Bytecode.greaterthan:
          //  stack[stack.length - 2] = stack[stack.length - 2] > stack.pop();
          //  break;
          //case Bytecode.greaterequals:
          //  stack[stack.length - 2] = stack[stack.length - 2] >= stack.pop();
          //  break;
          //case Bytecode.instanceof:
          //  stack[stack.length - 2] = asIsInstanceOf(stack.pop(), stack[stack.length - 1]);
          //  break;
          //case Bytecode.istype:
          //  stack[stack.length - 1] = asIsType(domain.getType(multinames[bc.index]), stack[stack.length - 1]);
          //  break;
          //case Bytecode.istypelate:
          //  stack[stack.length - 2] = asIsType(stack.pop(), stack[stack.length - 1]);
          //  break;
          //case Bytecode.in:
          //  stack[stack.length - 2] = box(stack.pop()).asHasProperty(null, stack[stack.length - 1]);
          //  break;
          //case Bytecode.increment_i:
          //  stack[stack.length - 1] = (stack[stack.length - 1] | 0) + 1;
          //  break;
          //case Bytecode.decrement_i:
          //  stack[stack.length - 1] = (stack[stack.length - 1] | 0) - 1;
          //  break;
          //case Bytecode.inclocal_i:
          //  locals[bc.index] = (locals[bc.index] | 0) + 1;
          //  break;
          //case Bytecode.declocal_i:
          //  locals[bc.index] = (locals[bc.index] | 0) - 1;
          //  break;
          //case Bytecode.negate_i:
          //  // Negation entails casting to int
          //  stack[stack.length - 1] = ~stack[stack.length - 1];
          //  break;
          //case Bytecode.add_i:
          //  stack[stack.length - 2] = stack[stack.length - 2] + stack.pop() | 0;
          //  break;
          //case Bytecode.subtract_i:
          //  stack[stack.length - 2] = stack[stack.length - 2] - stack.pop() | 0;
          //  break;
          //case Bytecode.multiply_i:
          //  stack[stack.length - 2] = stack[stack.length - 2] * stack.pop() | 0;
          //  break;
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
          //case Bytecode.dxns:
          //  Shumway.AVM2.AS.ASXML.defaultNamespace = strings[bc.index];
          //  break;
          //case Bytecode.dxnslate:
          //  Shumway.AVM2.AS.ASXML.defaultNamespace = stack.pop();
          //  break;
          //case Bytecode.debug:
          //case Bytecode.debugline:
          //case Bytecode.debugfile:
            break;
          default:
            Debug.notImplemented(Bytecode[bc]);
        }
      } catch (e) {
        writer.writeLn("Error: " + e);
        writer.writeLn("Stack: " + e.stack);
        jsGlobal.quit();
      }
    }
  }
}
