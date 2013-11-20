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

var Interpreter = new ((function () {
  function Interpreter() {

  }

  function popNameInto(stack, mn, out) {
    out.flags = mn.flags;
    if (mn.isRuntimeName()) {
      out.name = stack.pop();
    } else {
      out.name = mn.name;
    }
    if (mn.isRuntimeNamespace()) {
      out.namespaces = [stack.pop()];
    } else {
      out.namespaces = mn.namespaces;
    }
  }

  Interpreter.prototype = {
    interpretMethod: function interpretMethod($this, method, savedScope, methodArgs) {
      release || assert(method.analysis);
      Counter.count("Interpret Method");
      var abc = method.abc;
      var ints = abc.constantPool.ints;
      var uints = abc.constantPool.uints;
      var doubles = abc.constantPool.doubles;
      var strings = abc.constantPool.strings;
      var methods = abc.methods;
      var multinames = abc.constantPool.multinames;
      var domain = abc.applicationDomain;
      var exceptions = method.exceptions;

      var locals = [$this];
      var stack = [], scopeStack = new ScopeStack(savedScope);

      var parameterCount = method.parameters.length;
      var argCount = methodArgs.length;

      var value;
      for (var i = 0; i < parameterCount; i++) {
        var parameter = method.parameters[i];
        if (i < argCount) {
          value = methodArgs[i];
        } else {
          value = parameter.value;
        }
        if (parameter.type && !parameter.type.isAnyName()) {
          value = asCoerceByMultiname(domain, parameter.type, value);
        }
        locals.push(value);
      }

      if (method.needsRest()) {
        locals.push(sliceArguments(methodArgs, parameterCount));
      } else if (method.needsArguments()) {
        locals.push(sliceArguments(methodArgs, 0));
      }

      var bytecodes = method.analysis.bytecodes;

      var object, index, multiname, result, a, b, args = [], mn = Multiname.TEMPORARY;

      interpret:
      for (var pc = 0, end = bytecodes.length; pc < end; ) {
        try {
          var bc = bytecodes[pc];
          var op = bc.op;
          switch (op | 0) {
          case 0x03: // OP_throw
            throw stack.pop();
          case 0x04: // OP_getsuper
            popNameInto(stack, multinames[bc.index], mn);
            stack.push(stack.pop().asGetSuper (
              savedScope, mn.namespaces, mn.name, mn.flags
            ));
            break;
          case 0x05: // OP_setsuper
            value = stack.pop();
            popNameInto(stack, multinames[bc.index], mn);
            stack.pop().asSetSuper (
              savedScope, mn.namespaces, mn.name, mn.flags, value
            );
            break;
          case 0x08: // OP_kill
            locals[bc.index] = undefined;
            break;
          case 0x0C: // OP_ifnlt
            b = stack.pop();
            a = stack.pop();
            pc = !(a < b) ? bc.offset : pc + 1;
            continue;
          case 0x18: // OP_ifge
            b = stack.pop();
            a = stack.pop();
            pc = a >= b ? bc.offset : pc + 1;
            continue;
          case 0x0D: // OP_ifnle
            b = stack.pop();
            a = stack.pop();
            pc = !(a <= b) ? bc.offset : pc + 1;
            continue;
          case 0x17: // OP_ifgt
            b = stack.pop();
            a = stack.pop();
            pc = a > b ? bc.offset : pc + 1;
            continue;
          case 0x0E: // OP_ifngt
            b = stack.pop();
            a = stack.pop();
            pc = !(a > b) ? bc.offset : pc + 1;
            continue;
          case 0x16: // OP_ifle
            b = stack.pop();
            a = stack.pop();
            pc = a <= b ? bc.offset : pc + 1;
            continue;
          case 0x0F: // OP_ifnge
            b = stack.pop();
            a = stack.pop();
            pc = !(a >= b) ? bc.offset : pc + 1;
            continue;
          case 0x15: // OP_iflt
            b = stack.pop();
            a = stack.pop();
            pc = a < b ? bc.offset : pc + 1;
            continue;
          case 0x10: // OP_jump
            pc = bc.offset;
            continue;
          case 0x11: // OP_iftrue
            pc = !!stack.pop() ? bc.offset : pc + 1;
            continue;
          case 0x12: // OP_iffalse
            pc = !stack.pop() ? bc.offset : pc + 1;
            continue;
          case 0x13: // OP_ifeq
            b = stack.pop();
            a = stack.pop();
            pc = a == b ? bc.offset : pc + 1;
            continue;
          case 0x14: // OP_ifne
            b = stack.pop();
            a = stack.pop();
            pc = a != b ? bc.offset : pc + 1;
            continue;
          case 0x19: // OP_ifstricteq
            b = stack.pop();
            a = stack.pop();
            pc = a === b ? bc.offset : pc + 1;
            continue;
          case 0x1A: // OP_ifstrictne
            b = stack.pop();
            a = stack.pop();
            pc = a !== b ? bc.offset : pc + 1;
            continue;
          case 0x1B: // OP_lookupswitch
            index = stack.pop();
            if (index < 0 || index >= bc.offsets.length) {
              index = bc.offsets.length - 1; // The last target is the default.
            }
            pc = bc.offsets[index];
            continue;
          case 0x1C: // OP_pushwith
            scopeStack.push(boxValue(stack.pop()), true);
            break;
          case 0x1D: // OP_popscope
            scopeStack.pop();
            break;
          case 0x1E: // OP_nextname
            index = stack.pop();
            stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asNextName(index);
            break;
          case 0x23: // OP_nextvalue
            index = stack.pop();
            stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asNextValue(index);
            break;
          case 0x32: // OP_hasnext2
            result = asHasNext2(locals[bc.object], locals[bc.index]);
            locals[bc.object] = result.object;
            locals[bc.index] = result.index;
            stack.push(!!result.index);
            break;
          case 0x20: // OP_pushnull
            stack.push(null);
            break;
          case 0x21: // OP_pushundefined
            stack.push(undefined);
            break;
          case 0x24: // OP_pushbyte
          case 0x25: // OP_pushshort
            stack.push(bc.value);
            break;
          case 0x2C: // OP_pushstring
            stack.push(strings[bc.index]);
            break;
          case 0x2D: // OP_pushint
            stack.push(ints[bc.index]);
            break;
          case 0x2E: // OP_pushuint
            stack.push(uints[bc.index]);
            break;
          case 0x2F: // OP_pushdouble
            stack.push(doubles[bc.index]);
            break;
          case 0x26: // OP_pushtrue
            stack.push(true);
            break;
          case 0x27: // OP_pushfalse
            stack.push(false);
            break;
          case 0x28: // OP_pushnan
            stack.push(NaN);
            break;
          case 0x29: // OP_pop
            stack.pop();
            break;
          case 0x2A: // OP_dup
            stack.push(stack[stack.length - 1]);
            break;
          case 0x2B: // OP_swap
            object = stack[stack.length - 1];
            stack[stack.length - 1] = stack[stack.length - 2];
            stack[stack.length - 2] = object;
            break;
          case 0x30: // OP_pushscope
            scopeStack.push(boxValue(stack.pop()));
            break;
          case 0x40: // OP_newfunction
            stack.push(createFunction(methods[bc.index], scopeStack.topScope(), true));
            break;
          case 0x41: // OP_call
            popManyInto(stack, bc.argCount, args);
            object = stack.pop();
            stack[stack.length - 1] = stack[stack.length - 1].apply(object, args);
            break;
          case 0x42: // OP_construct
            popManyInto(stack, bc.argCount, args);
            stack[stack.length - 1] = construct(stack[stack.length - 1], args);
            break;
          case 0x47: // OP_returnvoid
            return;
          case 0x48: // OP_returnvalue
            if (method.returnType) {
              return asCoerceByMultiname(domain, method.returnType, stack.pop());
            }
            return stack.pop();
          case 0x49: // OP_constructsuper
            popManyInto(stack, bc.argCount, args);
            object = stack.pop();
            savedScope.object.baseClass.instanceConstructorNoInitialize.apply(object, args);
            break;
          case 0x4A: // OP_constructprop
            popManyInto(stack, bc.argCount, args);
            popNameInto(stack, multinames[bc.index], mn);
            object = boxValue(stack[stack.length - 1]);
            object = object.asConstructProperty(mn.namespaces, mn.name, mn.flags, args);
            stack[stack.length - 1] = object;
            break;
          case 0x4B: // OP_callsuperid
            notImplemented();
            break;
          case 0x4C: // OP_callproplex
          case 0x46: // OP_callproperty
          case 0x4F: // OP_callpropvoid
            popManyInto(stack, bc.argCount, args);
            popNameInto(stack, multinames[bc.index], mn);
            result = boxValue(stack.pop()).asCallProperty (
              mn.namespaces, mn.name, mn.flags, op === OP_callproplex, args
            );
            if (op !== OP_callpropvoid) {
              stack.push(result);
            }
            break;
          case 0x45: // OP_callsuper
          case 0x4E: // OP_callsupervoid
            popManyInto(stack, bc.argCount, args);
            popNameInto(stack, multinames[bc.index], mn);
            result = stack.pop().asCallSuper (
              savedScope, mn.namespaces, mn.name, mn.flags, args
            );
            if (op !== OP_callsupervoid) {
              stack.push(result);
            }
            break;
          case 0x53: // OP_applytype
            popManyInto(stack, bc.argCount, args);
            stack[stack.length - 1] = applyType(domain, stack[stack.length - 1], args);
            break;
          case 0x55: // OP_newobject
            object = {};
            for (var i = 0; i < bc.argCount; i++) {
              value = stack.pop();
              object[Multiname.getPublicQualifiedName(stack.pop())] = value;
            }
            stack.push(object);
            break;
          case 0x56: // OP_newarray
            object = [];
            popManyInto(stack, bc.argCount, args);
            object.push.apply(object, args);
            stack.push(object);
            break;
          case 0x57: // OP_newactivation
            release || assert(method.needsActivation());
            stack.push(createActivation(method));
            break;
          case 0x58: // OP_newclass
            stack[stack.length - 1] = createClass (
              abc.classes[bc.index], stack[stack.length - 1], scopeStack.topScope()
            );
            break;
          case 0x59: // OP_getdescendants
            popNameInto(stack, multinames[bc.index], mn);
            stack.push(getDescendants(stack.pop(), mn));
            break;
          case 0x5A: // OP_newcatch
            release || assert(exceptions[bc.index].scopeObject);
            stack.push(exceptions[bc.index].scopeObject);
            break;
          case 0x5E: // OP_findproperty
          case 0x5D: // OP_findpropstrict
            popNameInto(stack, multinames[bc.index], mn);
            stack.push(scopeStack.topScope().findScopeProperty (
              mn.namespaces, mn.name, mn.flags, domain, op === OP_findpropstrict
            ));
            break;
          case 0x60: // OP_getlex
            multiname = multinames[bc.index];
            object = scopeStack.topScope().findScopeProperty (
              multiname.namespaces, multiname.name, multiname.flags, domain, true
            );
            stack.push(object.asGetProperty(multiname.namespaces, multiname.name, multiname.flags));
            break;
          case 0x68: // OP_initproperty
          case 0x61: // OP_setproperty
            value = stack.pop();
            popNameInto(stack, multinames[bc.index], mn);
            boxValue(stack.pop()).asSetProperty(mn.namespaces, mn.name, mn.flags, value);
            break;
          case 0x62: // OP_getlocal
            stack.push(locals[bc.index]);
            break;
          case 0x63: // OP_setlocal
            locals[bc.index] = stack.pop();
            break;
          case 0x64: // OP_getglobalscope
            stack.push(savedScope.global.object);
            break;
          case 0x65: // OP_getscopeobject
            stack.push(scopeStack.get(bc.index));
            break;
          case 0x66: // OP_getproperty
            popNameInto(stack, multinames[bc.index], mn);
            stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asGetProperty(mn.namespaces, mn.name, mn.flags);
            break;
          case 0x6A: // OP_deleteproperty
            popNameInto(stack, multinames[bc.index], mn);
            stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asDeleteProperty(mn.namespaces, mn.name, mn.flags);
            break;
          case 0x6C: // OP_getslot
            stack[stack.length - 1] = asGetSlot(stack[stack.length - 1], bc.index);
            break;
          case 0x6D: // OP_setslot
            value = stack.pop();
            object = stack.pop();
            asSetSlot(object, bc.index, value);
            break;
          case 0x70: // OP_convert_s
            stack[stack.length - 1] = stack[stack.length - 1] + '';
            break;
          case 0x83: // OP_coerce_i
          case 0x73: // OP_convert_i
            stack[stack.length - 1] |= 0;
            break;
          case 0x88: // OP_coerce_u
          case 0x74: // OP_convert_u
            stack[stack.length - 1] >>>= 0;
            break;
          case 0x84: // OP_coerce_d
          case 0x75: // OP_convert_d
            stack[stack.length - 1] = +stack[stack.length - 1];
            break;
          case 0x81: // OP_coerce_b
          case 0x76: // OP_convert_b
            stack[stack.length - 1] = !!stack[stack.length - 1];
            break;
          case 0x78: // OP_checkfilter
            stack[stack.length - 1] = checkFilter(stack[stack.length - 1]);
            break;
          case 0x80: // OP_coerce
            stack[stack.length - 1] = asCoerce(domain.getType(multinames[bc.index]), stack[stack.length - 1]);
            break;
          case 0x82: // OP_coerce_a
            /* NOP */ break;
          case 0x85: // OP_coerce_s
            stack[stack.length - 1] = asCoerceString(stack[stack.length - 1]);
            break;
          case 0x87: // OP_astypelate
            stack[stack.length - 2] = asAsType(stack.pop(), stack[stack.length - 1]);
            break;
          case 0x89: // OP_coerce_o
            object = stack[stack.length - 1];
            stack[stack.length - 1] = object == undefined ? null : object;
            break;
          case 0x90: // OP_negate
            stack[stack.length - 1] = -stack[stack.length - 1];
            break;
          case 0x91: // OP_increment
            ++stack[stack.length - 1];
            break;
          case 0x92: // OP_inclocal
            ++locals[bc.index];
            break;
          case 0x93: // OP_decrement
            --stack[stack.length - 1];
            break;
          case 0x94: // OP_declocal
            --locals[bc.index];
            break;
          case 0x95: // OP_typeof
            stack[stack.length - 1] = asTypeOf(stack[stack.length - 1]);
            break;
          case 0x96: // OP_not
            stack[stack.length - 1] = !stack[stack.length - 1];
            break;
          case 0x97: // OP_bitnot
            stack[stack.length - 1] = ~stack[stack.length - 1];
            break;
          case 0xA0: // OP_add
            stack[stack.length - 2] = asAdd(stack[stack.length - 2], stack.pop());
            break;
          case 0xA1: // OP_subtract
            stack[stack.length - 2] -= stack.pop();
            break;
          case 0xA2: // OP_multiply
            stack[stack.length - 2] *= stack.pop();
            break;
          case 0xA3: // OP_divide
            stack[stack.length - 2] /= stack.pop();
            break;
          case 0xA4: // OP_modulo
            stack[stack.length - 2] %= stack.pop();
            break;
          case 0xA5: // OP_lshift
            stack[stack.length - 2] <<= stack.pop();
            break;
          case 0xA6: // OP_rshift
            stack[stack.length - 2] >>= stack.pop();
            break;
          case 0xA7: // OP_urshift
            stack[stack.length - 2] >>>= stack.pop();
            break;
          case 0xA8: // OP_bitand
            stack[stack.length - 2] &= stack.pop();
            break;
          case 0xA9: // OP_bitor
            stack[stack.length - 2] |= stack.pop();
            break;
          case 0xAA: // OP_bitxor
            stack[stack.length - 2] ^= stack.pop();
            break;
          case 0xAB: // OP_equals
            stack[stack.length - 2] = stack[stack.length - 2] == stack.pop();
            break;
          case 0xAC: // OP_strictequals
            stack[stack.length - 2] = stack[stack.length - 2] === stack.pop();
            break;
          case 0xAD: // OP_lessthan
            stack[stack.length - 2] = stack[stack.length - 2] < stack.pop();
            break;
          case 0xAE: // OP_lessequals
            stack[stack.length - 2] = stack[stack.length - 2] <= stack.pop();
            break;
          case 0xAF: // OP_greaterthan
            stack[stack.length - 2] = stack[stack.length - 2] > stack.pop();
            break;
          case 0xB0: // OP_greaterequals
            stack[stack.length - 2] = stack[stack.length - 2] >= stack.pop();
            break;
          case 0xB1: // OP_instanceof
            stack[stack.length - 2] = asIsInstanceOf(stack.pop(), stack[stack.length - 1]);
            break;
          case 0xB2: // OP_istype
            stack[stack.length - 1] = asIsType(domain.getType(multinames[bc.index]), stack[stack.length - 1]);
            break;
          case 0xB3: // OP_istypelate
            stack[stack.length - 2] = asIsType(stack.pop(), stack[stack.length - 1]);
            break;
          case 0xB4: // OP_in
            stack[stack.length - 2] = boxValue(stack.pop()).asHasProperty(null, stack[stack.length - 1]);
            break;
          case 0xC0: // OP_increment_i
            stack[stack.length - 1] = (stack[stack.length - 1] | 0) + 1;
            break;
          case 0xC1: // OP_decrement_i
            stack[stack.length - 1] = (stack[stack.length - 1] | 0) - 1;
            break;
          case 0xC2: // OP_inclocal_i
            locals[bc.index] = (locals[bc.index] | 0) + 1;
            break;
          case 0xC3: // OP_declocal_i
            locals[bc.index] = (locals[bc.index] | 0) - 1;
            break;
          case 0xC4: // OP_negate_i
            // Negation entails casting to int
            stack[stack.length - 1] = ~stack[stack.length - 1];
            break;
          case 0xC5: // OP_add_i
            stack[stack.length - 2] = stack[stack.length - 2] + stack.pop() | 0;
            break;
          case 0xC6: // OP_subtract_i
            stack[stack.length - 2] = stack[stack.length - 2] - stack.pop() | 0;
            break;
          case 0xC7: // OP_multiply_i
            stack[stack.length - 2] = stack[stack.length - 2] * stack.pop() | 0;
            break;
          case 0xD0: // OP_getlocal0
          case 0xD1: // OP_getlocal1
          case 0xD2: // OP_getlocal2
          case 0xD3: // OP_getlocal3
            stack.push(locals[op - OP_getlocal0]);
            break;
          case 0xD4: // OP_setlocal0
          case 0xD5: // OP_setlocal1
          case 0xD6: // OP_setlocal2
          case 0xD7: // OP_setlocal3
            locals[op - OP_setlocal0] = stack.pop();
            break;
          case 0xEF: // OP_debug
          case 0xF0: // OP_debugline
          case 0xF1: // OP_debugfile
            break;
          default:
            notImplemented(opcodeName(op));
          }
          pc++;
        } catch (e) {
          if (exceptions.length < 1) {
            throw e;
          }

          e = translateError(domain, e);
          for (var i = 0, j = exceptions.length; i < j; i++) {
            var handler = exceptions[i];
            if (pc >= handler.start && pc <= handler.end &&
              (!handler.typeName ||
                domain.getType(handler.typeName).isInstance(e))) {
              stack.length = 0;
              stack.push(e);
              scopeStack.clear();
              pc = handler.offset;
              continue interpret;
            }
          }
          throw e;
        }
      }
    }
  };

  return Interpreter;

})());
