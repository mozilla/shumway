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

module Shumway.AVM2 {

  import Scope = Shumway.AVM2.Runtime.Scope;
  import asCoerceByMultiname = Shumway.AVM2.Runtime.asCoerceByMultiname;
  import asGetSlot = Shumway.AVM2.Runtime.asGetSlot;
  import asSetSlot = Shumway.AVM2.Runtime.asSetSlot;
  import asCoerce = Shumway.AVM2.Runtime.asCoerce;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import asAsType = Shumway.AVM2.Runtime.asAsType;
  import asTypeOf = Shumway.AVM2.Runtime.asTypeOf;
  import asIsInstanceOf = Shumway.AVM2.Runtime.asIsInstanceOf;
  import asIsType = Shumway.AVM2.Runtime.asIsType;
  import applyType = Shumway.AVM2.Runtime.applyType;
  import createFunction = Shumway.AVM2.Runtime.createFunction;
  import createClass = Shumway.AVM2.Runtime.createClass;
  import getDescendants = Shumway.AVM2.Runtime.getDescendants;
  import checkFilter = Shumway.AVM2.Runtime.checkFilter;
  import asAdd = Shumway.AVM2.Runtime.asAdd;
  import translateError = Shumway.AVM2.Runtime.translateError;
  import asCreateActivation = Shumway.AVM2.Runtime.asCreateActivation;
  import sliceArguments = Shumway.AVM2.Runtime.sliceArguments;
  import boxValue = Shumway.ObjectUtilities.boxValue;
  import popManyInto = Shumway.ArrayUtilities.popManyInto;
  import construct = Shumway.AVM2.Runtime.construct;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import assert = Shumway.Debug.assert;
  import HasNext2Info = Shumway.AVM2.Runtime.HasNext2Info;

  var counter = Shumway.Metrics.Counter.instance;

  /**
   * Helps the interpreter allocate fewer Scope objects.
   */
  class ScopeStack {
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

  function popNameInto(stack: any [], mn: Multiname, out: Multiname) {
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

  export class Interpreter {
    public static interpretMethod($this, method, savedScope, methodArgs) {
      release || assert(method.analysis);
      countTimeline("Interpret Method");
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
          value = asCoerceByMultiname(method, parameter.type, value);
        }
        locals.push(value);
      }

      if (method.needsRest()) {
        locals.push(sliceArguments(methodArgs, parameterCount));
      } else if (method.needsArguments()) {
        locals.push(sliceArguments(methodArgs, 0,
                                   methodArgs.asGetPublicProperty('callee')));
      }

      var bytecodes = method.analysis.bytecodes;

      var object, index, multiname, result, a, b, args = [], mn = Multiname.TEMPORARY;
      var hasNext2Infos: HasNext2Info [] = [];
      interpretLabel:
      for (var pc = 0, end = bytecodes.length; pc < end; ) {
        try {
          var bc = bytecodes[pc];
          var op = bc.op;
          switch (op | 0) {
          case OP.throw:
            throw stack.pop();
          case OP.getsuper:
            popNameInto(stack, multinames[bc.index], mn);
            stack.push(stack.pop().asGetSuper (
              savedScope, mn.namespaces, mn.name, mn.flags
            ));
            break;
          case OP.setsuper:
            value = stack.pop();
            popNameInto(stack, multinames[bc.index], mn);
            stack.pop().asSetSuper (
              savedScope, mn.namespaces, mn.name, mn.flags, value
            );
            break;
          case OP.kill:
            locals[bc.index] = undefined;
            break;
          case OP.ifnlt:
            b = stack.pop();
            a = stack.pop();
            pc = !(a < b) ? bc.offset : pc + 1;
            continue;
          case OP.ifge:
            b = stack.pop();
            a = stack.pop();
            pc = a >= b ? bc.offset : pc + 1;
            continue;
          case OP.ifnle:
            b = stack.pop();
            a = stack.pop();
            pc = !(a <= b) ? bc.offset : pc + 1;
            continue;
          case OP.ifgt:
            b = stack.pop();
            a = stack.pop();
            pc = a > b ? bc.offset : pc + 1;
            continue;
          case OP.ifngt:
            b = stack.pop();
            a = stack.pop();
            pc = !(a > b) ? bc.offset : pc + 1;
            continue;
          case OP.ifle:
            b = stack.pop();
            a = stack.pop();
            pc = a <= b ? bc.offset : pc + 1;
            continue;
          case OP.ifnge:
            b = stack.pop();
            a = stack.pop();
            pc = !(a >= b) ? bc.offset : pc + 1;
            continue;
          case OP.iflt:
            b = stack.pop();
            a = stack.pop();
            pc = a < b ? bc.offset : pc + 1;
            continue;
          case OP.jump:
            pc = bc.offset;
            continue;
          case OP.iftrue:
            pc = !!stack.pop() ? bc.offset : pc + 1;
            continue;
          case OP.iffalse:
            pc = !stack.pop() ? bc.offset : pc + 1;
            continue;
          case OP.ifeq:
            b = stack.pop();
            a = stack.pop();
            pc = asEquals(a, b) ? bc.offset : pc + 1;
            continue;
          case OP.ifne:
            b = stack.pop();
            a = stack.pop();
            pc = !asEquals(a, b) ? bc.offset : pc + 1;
            continue;
          case OP.ifstricteq:
            b = stack.pop();
            a = stack.pop();
            pc = a === b ? bc.offset : pc + 1;
            continue;
          case OP.ifstrictne:
            b = stack.pop();
            a = stack.pop();
            pc = a !== b ? bc.offset : pc + 1;
            continue;
          case OP.lookupswitch:
            index = stack.pop();
            if (index < 0 || index >= bc.offsets.length) {
              index = bc.offsets.length - 1; // The last target is the default.
            }
            pc = bc.offsets[index];
            continue;
          case OP.pushwith:
            scopeStack.push(boxValue(stack.pop()), true);
            break;
          case OP.popscope:
            scopeStack.pop();
            break;
          case OP.nextname:
            index = stack.pop();
            stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asNextName(index);
            break;
          case OP.nextvalue:
            index = stack.pop();
            stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asNextValue(index);
            break;
          case OP.hasnext2:
            var hasNext2Info = hasNext2Infos[pc] || (hasNext2Infos[pc] = new HasNext2Info(null, 0));
            object = locals[bc.object];
            index = locals[bc.index];
            hasNext2Info.object = object;
            hasNext2Info.index = index;
            Object(object).asHasNext2(hasNext2Info);
            locals[bc.object] = hasNext2Info.object;
            locals[bc.index] = hasNext2Info.index;
            stack.push(!!hasNext2Info.index);
            break;
          case OP.pushnull:
            stack.push(null);
            break;
          case OP.pushundefined:
            stack.push(undefined);
            break;
          case OP.pushbyte:
          case OP.pushshort:
            stack.push(bc.value);
            break;
          case OP.pushstring:
            stack.push(strings[bc.index]);
            break;
          case OP.pushint:
            stack.push(ints[bc.index]);
            break;
          case OP.pushuint:
            stack.push(uints[bc.index]);
            break;
          case OP.pushdouble:
            stack.push(doubles[bc.index]);
            break;
          case OP.pushtrue:
            stack.push(true);
            break;
          case OP.pushfalse:
            stack.push(false);
            break;
          case OP.pushnan:
            stack.push(NaN);
            break;
          case OP.pop:
            stack.pop();
            break;
          case OP.dup:
            stack.push(stack[stack.length - 1]);
            break;
          case OP.swap:
            object = stack[stack.length - 1];
            stack[stack.length - 1] = stack[stack.length - 2];
            stack[stack.length - 2] = object;
            break;
          case OP.pushscope:
            scopeStack.push(boxValue(stack.pop()), false);
            break;
          case OP.newfunction:
            stack.push(createFunction(methods[bc.index], scopeStack.topScope(), true, false));
            break;
          case OP.call:
            popManyInto(stack, bc.argCount, args);
            object = stack.pop();
            stack[stack.length - 1] = stack[stack.length - 1].asApply(object, args);
            break;
          case OP.construct:
            popManyInto(stack, bc.argCount, args);
            stack[stack.length - 1] = construct(stack[stack.length - 1], args);
            break;
          case OP.returnvoid:
            return;
          case OP.returnvalue:
            if (method.returnType) {
              return asCoerceByMultiname(method, method.returnType, stack.pop());
            }
            return stack.pop();
          case OP.constructsuper:
            popManyInto(stack, bc.argCount, args);
            object = stack.pop();
            savedScope.object.baseClass.instanceConstructorNoInitialize.apply(object, args);
            break;
          case OP.constructprop:
            popManyInto(stack, bc.argCount, args);
            popNameInto(stack, multinames[bc.index], mn);
            object = boxValue(stack[stack.length - 1]);
            object = object.asConstructProperty(mn.namespaces, mn.name, mn.flags, args);
            stack[stack.length - 1] = object;
            break;
          case OP.callsuperid:
            Shumway.Debug.notImplemented("OP.callsuperid");
            break;
          case OP.callproplex:
          case OP.callproperty:
          case OP.callpropvoid:
            popManyInto(stack, bc.argCount, args);
            popNameInto(stack, multinames[bc.index], mn);
            result = boxValue(stack.pop()).asCallProperty (
              mn.namespaces, mn.name, mn.flags, op === OP.callproplex, args
            );
            if (op !== OP.callpropvoid) {
              stack.push(result);
            }
            break;
          case OP.callsuper:
          case OP.callsupervoid:
            popManyInto(stack, bc.argCount, args);
            popNameInto(stack, multinames[bc.index], mn);
            result = stack.pop().asCallSuper (
              savedScope, mn.namespaces, mn.name, mn.flags, args
            );
            if (op !== OP.callsupervoid) {
              stack.push(result);
            }
            break;
          case OP.applytype:
            popManyInto(stack, bc.argCount, args);
            stack[stack.length - 1] = applyType(method, stack[stack.length - 1], args);
            break;
          case OP.newobject:
            object = {};
            for (var i = 0; i < bc.argCount; i++) {
              value = stack.pop();
              object[Multiname.getPublicQualifiedName(stack.pop())] = value;
            }
            stack.push(object);
            break;
          case OP.newarray:
            object = [];
            popManyInto(stack, bc.argCount, args);
            object.push.apply(object, args);
            stack.push(object);
            break;
          case OP.newactivation:
            release || assert(method.needsActivation());
            stack.push(asCreateActivation(method));
            break;
          case OP.newclass:
            stack[stack.length - 1] = createClass (
              abc.classes[bc.index], stack[stack.length - 1], scopeStack.topScope()
            );
            break;
          case OP.getdescendants:
            popNameInto(stack, multinames[bc.index], mn);
            if (mn.name === undefined) {
              mn.name = '*';
            }
            stack.push(getDescendants(stack.pop(), mn));
            break;
          case OP.newcatch:
            release || assert(exceptions[bc.index].scopeObject);
            stack.push(exceptions[bc.index].scopeObject);
            break;
          case OP.findproperty:
          case OP.findpropstrict:
            popNameInto(stack, multinames[bc.index], mn);
            stack.push(scopeStack.topScope().findScopeProperty (
              mn.namespaces, mn.name, mn.flags, method, op === OP.findpropstrict, false
            ));
            break;
          case OP.getlex:
            multiname = multinames[bc.index];
            object = scopeStack.topScope().findScopeProperty (
              multiname.namespaces, multiname.name, multiname.flags, method, true, false
            );
            stack.push(object.asGetProperty(multiname.namespaces, multiname.name, multiname.flags));
            break;
          case OP.initproperty:
          case OP.setproperty:
            value = stack.pop();
            popNameInto(stack, multinames[bc.index], mn);
            boxValue(stack.pop()).asSetProperty(mn.namespaces, mn.name, mn.flags, value);
            break;
          case OP.getlocal:
            stack.push(locals[bc.index]);
            break;
          case OP.setlocal:
            locals[bc.index] = stack.pop();
            break;
          case OP.getglobalscope:
            stack.push(savedScope.global.object);
            break;
          case OP.getscopeobject:
            stack.push(scopeStack.get(bc.index));
            break;
          case OP.getproperty:
            popNameInto(stack, multinames[bc.index], mn);
            stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asGetProperty(mn.namespaces, mn.name, mn.flags);
            break;
          case OP.deleteproperty:
            popNameInto(stack, multinames[bc.index], mn);
            stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asDeleteProperty(mn.namespaces, mn.name, mn.flags);
            break;
          case OP.getslot:
            stack[stack.length - 1] = asGetSlot(stack[stack.length - 1], bc.index);
            break;
          case OP.setslot:
            value = stack.pop();
            object = stack.pop();
            asSetSlot(object, bc.index, value);
            break;
          case OP.convert_s:
            stack[stack.length - 1] = asCoerceString(stack[stack.length - 1]);
            break;
          case OP.esc_xattr:
            stack[stack.length - 1] = Runtime.escapeXMLAttribute(stack[stack.length - 1]);
            break;
          case OP.esc_xelem:
            stack[stack.length - 1] = Runtime.escapeXMLElement(stack[stack.length - 1]);
            break;
          case OP.coerce_i:
          case OP.convert_i:
            stack[stack.length - 1] |= 0;
            break;
          case OP.coerce_u:
          case OP.convert_u:
            stack[stack.length - 1] >>>= 0;
            break;
          case OP.coerce_d:
          case OP.convert_d:
            stack[stack.length - 1] = +stack[stack.length - 1];
            break;
          case OP.coerce_b:
          case OP.convert_b:
            stack[stack.length - 1] = !!stack[stack.length - 1];
            break;
          case OP.checkfilter:
            stack[stack.length - 1] = checkFilter(stack[stack.length - 1]);
            break;
          case OP.coerce:
            stack[stack.length - 1] = asCoerce(domain.getType(multinames[bc.index]), stack[stack.length - 1]);
            break;
          case OP.coerce_a:
            /* NOP */ break;
          case OP.coerce_s:
            stack[stack.length - 1] = asCoerceString(stack[stack.length - 1]);
            break;
          case OP.astype:
            stack[stack.length - 2] = asAsType(domain.getType(multinames[bc.index]), stack[stack.length - 1]);
            break;
          case OP.astypelate:
            stack[stack.length - 2] = asAsType(stack.pop(), stack[stack.length - 1]);
            break;
          case OP.coerce_o:
            object = stack[stack.length - 1];
            stack[stack.length - 1] = object == undefined ? null : object;
            break;
          case OP.negate:
            stack[stack.length - 1] = -stack[stack.length - 1];
            break;
          case OP.increment:
            ++stack[stack.length - 1];
            break;
          case OP.inclocal:
            ++locals[bc.index];
            break;
          case OP.decrement:
            --stack[stack.length - 1];
            break;
          case OP.declocal:
            --locals[bc.index];
            break;
          case OP.typeof:
            stack[stack.length - 1] = asTypeOf(stack[stack.length - 1]);
            break;
          case OP.not:
            stack[stack.length - 1] = !stack[stack.length - 1];
            break;
          case OP.bitnot:
            stack[stack.length - 1] = ~stack[stack.length - 1];
            break;
          case OP.add:
            stack[stack.length - 2] = asAdd(stack[stack.length - 2], stack.pop());
            break;
          case OP.subtract:
            stack[stack.length - 2] -= stack.pop();
            break;
          case OP.multiply:
            stack[stack.length - 2] *= stack.pop();
            break;
          case OP.divide:
            stack[stack.length - 2] /= stack.pop();
            break;
          case OP.modulo:
            stack[stack.length - 2] %= stack.pop();
            break;
          case OP.lshift:
            stack[stack.length - 2] <<= stack.pop();
            break;
          case OP.rshift:
            stack[stack.length - 2] >>= stack.pop();
            break;
          case OP.urshift:
            stack[stack.length - 2] >>>= stack.pop();
            break;
          case OP.bitand:
            stack[stack.length - 2] &= stack.pop();
            break;
          case OP.bitor:
            stack[stack.length - 2] |= stack.pop();
            break;
          case OP.bitxor:
            stack[stack.length - 2] ^= stack.pop();
            break;
          case OP.equals:
            stack[stack.length - 2] = asEquals(stack[stack.length - 2], stack.pop());
            break;
          case OP.strictequals:
            stack[stack.length - 2] = stack[stack.length - 2] === stack.pop();
            break;
          case OP.lessthan:
            stack[stack.length - 2] = stack[stack.length - 2] < stack.pop();
            break;
          case OP.lessequals:
            stack[stack.length - 2] = stack[stack.length - 2] <= stack.pop();
            break;
          case OP.greaterthan:
            stack[stack.length - 2] = stack[stack.length - 2] > stack.pop();
            break;
          case OP.greaterequals:
            stack[stack.length - 2] = stack[stack.length - 2] >= stack.pop();
            break;
          case OP.instanceof:
            stack[stack.length - 2] = asIsInstanceOf(stack.pop(), stack[stack.length - 1]);
            break;
          case OP.istype:
            stack[stack.length - 1] = asIsType(domain.getType(multinames[bc.index]), stack[stack.length - 1]);
            break;
          case OP.istypelate:
            stack[stack.length - 2] = asIsType(stack.pop(), stack[stack.length - 1]);
            break;
          case OP.in:
            stack[stack.length - 2] = boxValue(stack.pop()).asHasProperty(null, stack[stack.length - 1]);
            break;
          case OP.increment_i:
            stack[stack.length - 1] = (stack[stack.length - 1] | 0) + 1;
            break;
          case OP.decrement_i:
            stack[stack.length - 1] = (stack[stack.length - 1] | 0) - 1;
            break;
          case OP.inclocal_i:
            locals[bc.index] = (locals[bc.index] | 0) + 1;
            break;
          case OP.declocal_i:
            locals[bc.index] = (locals[bc.index] | 0) - 1;
            break;
          case OP.negate_i:
            // Negation entails casting to int
            stack[stack.length - 1] = ~stack[stack.length - 1];
            break;
          case OP.add_i:
            stack[stack.length - 2] = stack[stack.length - 2] + stack.pop() | 0;
            break;
          case OP.subtract_i:
            stack[stack.length - 2] = stack[stack.length - 2] - stack.pop() | 0;
            break;
          case OP.multiply_i:
            stack[stack.length - 2] = stack[stack.length - 2] * stack.pop() | 0;
            break;
          case OP.getlocal0:
          case OP.getlocal1:
          case OP.getlocal2:
          case OP.getlocal3:
            stack.push(locals[op - OP.getlocal0]);
            break;
          case OP.setlocal0:
          case OP.setlocal1:
          case OP.setlocal2:
          case OP.setlocal3:
            locals[op - OP.setlocal0] = stack.pop();
            break;
          case OP.dxns:
            Shumway.AVM2.AS.ASXML.defaultNamespace = strings[bc.index];
            break;
          case OP.dxnslate:
            Shumway.AVM2.AS.ASXML.defaultNamespace = stack.pop();
            break;
          case OP.debug:
          case OP.debugline:
          case OP.debugfile:
            break;
          default:
            Shumway.Debug.notImplemented(Shumway.AVM2.opcodeName(op));
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
                domain.getType(handler.typeName).isType(e))) {
              stack.length = 0;
              stack.push(e);
              scopeStack.clear();
              pc = handler.offset;
              continue interpretLabel;
            }
          }
          throw e;
        }
      }
    }
  }
}
