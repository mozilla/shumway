var interpreterOptions = systemOptions.register(new OptionSet("Interpreter Options"));

var traceInterpreter = interpreterOptions.register(new Option("ti", "traceInterpreter", "number", 0, "trace interpreter execution"));

var Interpreter = (function () {

  const Operator = Compiler.Operator;

  /**
   * N.B. These operators are two-part in that they require you to negate the
   * result, so they can't be straightforwardly used for compilation.
   */
  const NLT = new Operator("!<", function (l, r) { return !(l < r); }, true, true);
  const NLE = new Operator("!<=", function (l, r) { return !(l <= r); }, true, true);
  const NGT = new Operator("!>", function (l, r) { return !(l > r); }, true, true);
  const NGE = new Operator("!>=", function (l, r) { return !(l >= r); }, true, true);

  function Interpreter(abc) {
    this.abc = abc;
  }

  Interpreter.prototype = {
    interpretMethod: function interpretMethod($this, method, savedScope, args) {
      assert(method.analysis);

      const abc = this.abc;
      const ints = abc.constantPool.ints;
      const uints = abc.constantPool.uints;
      const doubles = abc.constantPool.doubles;
      const strings = abc.constantPool.strings;
      const methods = abc.methods;
      const multinames = abc.constantPool.multinames;
      const runtime = abc.runtime;

      var exceptions = method.exceptions;

      var locals = [$this];
      var scope = savedScope;
      var scopeHeight = 0;
      var stack = [];

      const Apslice = [].slice;
      var parameterCount = method.parameters.length;

      locals.push.apply(locals, Apslice.call(args, 0, parameterCount));

      if (method.needsRest()) {
        locals.push(Apslice.call(args, parameterCount));
      } else if (method.needsArguments()) {
        locals.push(Apslice.call(args, 0));
      }

      function applyNew(constructor, args) {
        return new (Function.bind.apply(constructor.instance, [,].concat(args)));
      }

      function evaluateBinary(operator) {
        var b = stack.pop();
        var a = stack.pop();
        stack.push(operator.fn(a, b));
      }

      function evaluateUnary(operator) {
        stack.push(operator.fn(stack.pop()));
      }

      function branchBinary(operator, bc, pc) {
        var b = stack.pop();
        var a = stack.pop();
        return operator.fn(a, b) ? bc.offset : pc + 1;
      }

      function branchUnary(operator, bc, pc) {
        return operator.fn(stack.pop()) ? bc.offset : pc + 1;
      }

      function createMultiname(multiname) {
        if (multiname.isRuntime()) {
          var namespaces = multiname.namespaces, name = multiname.name;
          if (multiname.isRuntimeName()) {
            name = stack.pop();
          }
          if (multiname.isRuntimeNamespace()) {
            namespaces = [stack.pop()];
          }
          multiname = new Multiname(namespaces, name);
        }
        assert(!multiname.isRuntime());
        return multiname;
      }

      var args, obj, objsuper, type, index, multiname, ns, name, res;
      var bytecodes = method.analysis.bytecodes;
      var sourcePosition = {file: undefined, line: undefined};

      if (traceInterpreter.value > 0) {
        var methodName = method.name ? method.name.getQualifiedName() : "unknown";
        print("methodName: " + methodName);
        method.trace(new IndentingWriter(), abc);
      }

      interpret:
      for (var pc = 0, end = bytecodes.length; pc < end; ) {
        if (traceInterpreter.value > 0) {
          print("position: " + sourcePosition.file + ": " + sourcePosition.line);
        }

        try {
          var bc = bytecodes[pc];
          var op = bc.op;

          switch (op) {
          case OP_bkpt:           notImplemented(); break;
          case OP_throw:
            throw stack.pop();
          case OP_getsuper:       notImplemented(); break;
          case OP_setsuper:       notImplemented(); break;
          case OP_dxns:           notImplemented(); break;
          case OP_dxnslate:       notImplemented(); break;
          case OP_kill:
            locals[bc.index] = undefined;
            break;
          case OP_lf32x4:         notImplemented(); break;
          case OP_sf32x4:         notImplemented(); break;
          case OP_ifnlt:
            pc = branchBinary(NLT, bc, pc);
            continue;
          case OP_ifge:
            pc = branchBinary(Operator.GE, bc, pc);
            continue;
          case OP_ifnle:
            pc = branchBinary(NLE, bc, pc);
            continue;
          case OP_ifgt:
            pc = branchBinary(Operator.GT, bc, pc);
            continue;
          case OP_ifngt:
            pc = branchBinary(NGT, bc, pc);
            continue;
          case OP_ifle:
            pc = branchBinary(Operator.LE, bc, pc);
            continue;
          case OP_ifnge:
            pc = branchBinary(NGE, bc, pc);
            continue;
          case OP_iflt:
            pc = branchBinary(Operator.LT, bc, pc);
            continue;
          case OP_jump:
            pc = bc.offset;
            continue;
          case OP_iftrue:
            pc = branchUnary(Operator.TRUE, bc, pc);
            continue;
          case OP_iffalse:
            pc = branchUnary(Operator.FALSE, bc, pc);
            continue;
          case OP_ifeq:
            pc = branchBinary(Operator.EQ, bc, pc);
            continue;
          case OP_ifne:
            pc = branchBinary(Operator.NE, bc, pc);
            continue;
          case OP_ifstricteq:
            pc = branchBinary(Operator.SEQ, bc, pc);
            continue;
          case OP_ifstrictne:
            pc = branchBinary(Operator.SNE, bc, pc);
            continue;
          case OP_lookupswitch:
            index = stack.pop();
            if (index < 0 || index >= bc.offsets.length) {
              /* The last target is the default. */
              index = bc.offsets.length - 1;
            }
            pc = bc.offsets[index];
            continue;
          case OP_pushwith:
            scope = new Scope(scope, stack.pop());
            scopeHeight++;
            break;
          case OP_popscope:
            scope = scope.parent;
            scopeHeight--;
            break;
          case OP_nextname:
            index = stack.pop();
            obj = stack.pop();
            stack.push(nextName(obj, index));
            break;
          case OP_nextvalue:
            index = stack.pop();
            obj = stack.pop();
            stack.push(nextValue(obj, index));
            break;
          case OP_hasnext:
            notImplemented();
            break;
          case OP_hasnext2:
            res = hasNext2(locals[bc.object], locals[bc.index]);
            locals[bc.object] = res.object;
            locals[bc.index] = res.index;
            stack.push(!!res.index);
            break;
          case OP_pushnull:
            stack.push(null);
            break;
          case OP_pushundefined:
            stack.push(undefined);
            break;
          case OP_pushfloat:      notImplemented(); break;
          case OP_pushbyte:
          case OP_pushshort:
            stack.push(bc.value);
            break;
          case OP_pushstring:
            stack.push(strings[bc.index]);
            break;
          case OP_pushint:
            stack.push(ints[bc.index]);
            break;
          case OP_pushuint:
            stack.push(uints[bc.index]);
            break;
          case OP_pushdouble:
            stack.push(doubles[bc.index]);
            break;
          case OP_pushtrue:
            stack.push(true);
            break;
          case OP_pushfalse:
            stack.push(false);
            break;
          case OP_pushnan:
            stack.push(NaN);
            break;
          case OP_pop:
            stack.pop();
            break;
          case OP_dup:
            stack.push(stack.top());
            break;
          case OP_swap:
            stack.push(stack.pop(), stack.pop());
            break;
          case OP_pushscope:
            scope = new Scope(scope, stack.pop());
            scopeHeight++;
            break;
          case OP_pushnamespace:  notImplemented(); break;
          case OP_li8:            notImplemented(); break;
          case OP_li16:           notImplemented(); break;
          case OP_li32:           notImplemented(); break;
          case OP_lf32:           notImplemented(); break;
          case OP_lf64:           notImplemented(); break;
          case OP_si8:            notImplemented(); break;
          case OP_si16:           notImplemented(); break;
          case OP_si32:           notImplemented(); break;
          case OP_sf32:           notImplemented(); break;
          case OP_sf64:           notImplemented(); break;
          case OP_newfunction:
            stack.push(runtime.createFunction(methods[bc.index], scope));
            break;
          case OP_call:
            args = stack.popMany(bc.argCount);
            obj = stack.pop();
            stack.push(stack.pop().apply(obj, args));
            break;
          case OP_construct:
            args = stack.popMany(bc.argCount);
            obj = stack.pop();
            stack.push(applyNew(obj, args));
            break;
          case OP_callmethod:     notImplemented(); break;
          case OP_callstatic:     notImplemented(); break;
          case OP_callsuper:
            args = stack.popMany(bc.argCount);
            multiname = createMultiname(multinames[bc.index]);
            obj = stack.pop();
            objsuper = obj.public$constructor.baseClass.instance.prototype;
            stack.push(getProperty(objsuper, multiname).apply(obj, args));
            break;
          case OP_callproperty:
            args = stack.popMany(bc.argCount);
            multiname = createMultiname(multinames[bc.index]);
            obj = stack.pop();
            stack.push(getProperty(obj, multiname).apply(obj, args));
            break;
          case OP_returnvoid:
            return;
          case OP_returnvalue:
            return stack.pop();
          case OP_constructsuper:
            args = stack.popMany(bc.argCount);
            obj = stack.pop();
            savedScope.object.baseClass.instance.apply(obj, args);
            break;
          case OP_constructprop:
            args = stack.popMany(bc.argCount);
            multiname = createMultiname(multinames[bc.index]);
            obj = stack.pop();
            stack.push(applyNew(getProperty(obj, multiname), args));
            break;
          case OP_callsuperid:    notImplemented(); break;
          case OP_callproplex:
            args = stack.popMany(bc.argCount);
            multiname = createMultiname(multinames[bc.index]);
            obj = stack.pop();
            stack.push(getProperty(obj, multiname).apply(null, args));
            break;
          case OP_callinterface:  notImplemented(); break;
          case OP_callsupervoid:
            args = stack.popMany(bc.argCount);
            multiname = createMultiname(multinames[bc.index]);
            obj = stack.pop();
            objsuper = obj.public$constructor.baseClass.instance.prototype;
            getProperty(objsuper, multiname).apply(obj, args);
            break;
          case OP_callpropvoid:
            args = stack.popMany(bc.argCount);
            multiname = createMultiname(multinames[bc.index]);
            obj = stack.pop();
            getProperty(obj, multiname).apply(obj, args);
            break;
          case OP_sxi1:           notImplemented(); break;
          case OP_sxi8:           notImplemented(); break;
          case OP_sxi16:          notImplemented(); break;
          case OP_applytype:
            args = stack.popMany(bc.argCount);
            stack.push(applyType(stack.pop(), args));
            break;
          case OP_pushfloat4:     notImplemented(); break;
          case OP_newobject:
            obj = {};
            for (var i = 0; i < bc.argCount; i++) {
              var pair = stack.popMany(2);
              obj[pair[0]] = pair[1];
            }
            stack.push(obj);
            break;
          case OP_newarray:
            obj = [];
            obj.push.apply(obj, stack.popMany(bc.argCount));
            stack.push(obj);
            break;
          case OP_newactivation:
            assert (method.needsActivation());
            stack.push(runtime.createActivation(method));
            break;
          case OP_newclass:
            stack.push(runtime.createClass(abc.classes[bc.index], stack.pop(), scope));
            break;
          case OP_getdescendants:
            multiname = createMultiname(multinames[bc.index]);
            stack.push(getDescendants(multiname, stack.pop()));
            break;
          case OP_newcatch:
            assert(exceptions[bc.index].scopeObject);
            stack.push(new Scope(scope, exceptions[bc.index].scopeObject));
            break;
          case OP_findpropstrict:
            multiname = createMultiname(multinames[bc.index]);
            stack.push(scope.findProperty(multiname, true));
            break;
          case OP_findproperty:
            multiname = createMultiname(multinames[bc.index]);
            stack.push(scope.findProperty(multiname, false));
            break;
          case OP_finddef:        notImplemented(); break;
          case OP_getlex:
            // TODO: Cache the resolved multiname so it doesn't have to be
            // resolved again in getProperty
            multiname = createMultiname(multinames[bc.index]);
            stack.push(getProperty(scope.findProperty(multiname, true), multiname, true));
            break;
          case OP_initproperty:
          case OP_setproperty:
            value = stack.pop();
            multiname = createMultiname(multinames[bc.index]);
            setProperty(stack.pop(), multiname, value);
            break;
          case OP_getlocal:
            stack.push(locals[bc.index]);
            break;
          case OP_setlocal:
            locals[bc.index] = stack.pop();
            break;
          case OP_getglobalscope:
            stack.push(scope.global.object);
            break;
          case OP_getscopeobject:
            obj = scope;
            for (var i = 0; i < (scopeHeight - 1) - bc.index; i++) {
              obj = obj.parent;
            }
            stack.push(obj.object);
            break;
          case OP_getproperty:
            multiname = createMultiname(multinames[bc.index]);
            stack.push(getProperty(stack.pop(), multiname, true));
            break;
          case OP_getouterscope:      notImplemented(); break;
          case OP_setpropertylate:    notImplemented(); break;
          case OP_deleteproperty:
            multiname = createMultiname(multinames[bc.index]);
            obj = stack.pop();
            stack.push(deleteProperty(obj, multiname));
            break;
          case OP_deletepropertylate: notImplemented(); break;
          case OP_getslot:
            stack.push(getSlot(stack.pop(), bc.index));
            break;
          case OP_setslot:
            value = stack.pop();
            obj = stack.pop();
            setSlot(obj, bc.index, value);
            break;
          case OP_getglobalslot:  notImplemented(); break;
          case OP_setglobalslot:  notImplemented(); break;
          case OP_convert_s:      notImplemented(); break;
          case OP_esc_xelem:      notImplemented(); break;
          case OP_esc_xattr:      notImplemented(); break;
          case OP_coerce_i:
          case OP_convert_i:
            stack.push(toInt(stack.pop()));
            break;
          case OP_coerce_u:
          case OP_convert_u:
            stack.push(toUint(stack.pop()));
            break;
          case OP_coerce_d:
          case OP_convert_d:
            stack.push(toDouble(stack.pop()));
            break;
          case OP_coerce_b:
          case OP_convert_b:
            stack.push(toBoolean(stack.pop()));
            break;
          case OP_convert_o:      notImplemented(); break;
          case OP_checkfilter:
            stack.push(checkFilter(stack.pop()));
            break;
          case OP_convert_f:      notImplemented(); break;
          case OP_unplus:         notImplemented(); break;
          case OP_convert_f4:     notImplemented(); break;
          case OP_coerce:
            value = stack.pop();
            multiname = multinames[bc.index];
            stack.push(coerce(value, toplevel.getTypeByName(multiname, true, true)));
            break;
          case OP_coerce_a:       /* NOP */ break;
          case OP_coerce_s:
            stack.push(coerceString(stack.pop()));
            break;
          case OP_astype:         notImplemented(); break;
          case OP_astypelate:     notImplemented(); break;
          case OP_coerce_o:
            obj = stack.pop();
            stack.push(obj == undefined ? null : obj);
          case OP_negate:
            evaluateUnary(Operator.NEG);
            break;
          case OP_increment:
            stack.push(1);
            evaluateBinary(Operator.ADD);
            break;
          case OP_inclocal:
            ++locals[bc.index];
            break;
          case OP_decrement:
            stack.push(1);
            evaluateBinary(Operator.SUB);
            break;
          case OP_declocal:
            --locals[bc.index];
            break;
          case OP_typeof:
            stack.push(typeof stack.pop());
            break;
          case OP_not:
            evaluateUnary(Operator.FALSE);
            break;
          case OP_bitnot:
            evaluateUnary(Operator.BITWISE_NOT);
            break;
          case OP_add_d:          notImplemented(); break;
          case OP_add:
            evaluateBinary(Operator.ADD);
            break;
          case OP_subtract:
            evaluateBinary(Operator.SUB);
            break;
          case OP_multiply:
            evaluateBinary(Operator.MUL);
            break;
          case OP_divide:
            evaluateBinary(Operator.DIV);
            break;
          case OP_modulo:
            evaluateBinary(Operator.MOD);
            break;
          case OP_lshift:
            evaluateBinary(Operator.LSH);
            break;
          case OP_rshift:
            evaluateBinary(Operator.RSH);
            break;
          case OP_urshift:
            evaluateBinary(Operator.URSH);
            break;
          case OP_bitand:
            evaluateBinary(Operator.AND);
            break;
          case OP_bitor:
            evaluateBinary(Operator.OR);
            break;
          case OP_bitxor:
            evaluateBinary(Operator.XOR);
            break;
          case OP_equals:
            evaluateBinary(Operator.EQ);
            break;
          case OP_strictequals:
            evaluateBinary(Operator.SEQ);
            break;
          case OP_lessthan:
            evaluateBinary(Operator.LT);
            break;
          case OP_lessequals:
            evaluateBinary(Operator.LE);
            break;
          case OP_greaterthan:
            evaluateBinary(Operator.GT);
            break;
          case OP_greaterequals:
            evaluateBinary(Operator.GE);
            break;
          case OP_instanceof:
            type = stack.pop();
            value = stack.pop();
            stack.push(instanceOf(value, type));
            break;
          case OP_istype:
            value = stack.pop();
            multiname = multinames[bc.index];
            assert (!multiname.isRuntime());
            type = toplevel.getTypeByName(multiname, true, true);
            stack.push(isType(value, type));
            break;
          case OP_istypelate:
            type = stack.pop();
            value = stack.pop();
            stack.push(isType(value, type));
            break;
          case OP_in:             notImplemented(); break;
          case OP_increment_i:
            stack.push(stack.pop() | 0);
            stack.push(1);
            evaluateBinary(Operator.ADD);
            break;
          case OP_decrement_i:
            stack.push(stack.pop() | 0);
            stack.push(1);
            evaluateBinary(Operator.SUB);
            break;
          case OP_inclocal_i:
            locals[bc.index] = (locals[bc.index] | 0) + 1;
            break;
          case OP_declocal_i:
            locals[bc.index] = (locals[bc.index] | 0) - 1;
            break;
          case OP_negate_i:
            stack.push(stack.pop() | 0);
            evaluateUnary(Operator.NEG);
            break;
          case OP_add_i:
            evaluateBinary(Operator.ADD);
            stack.push(stack.pop() | 0);
            break;
          case OP_subtract_i:
            evaluateBinary(Operator.SUB);
            stack.push(stack.pop() | 0);
            break;
          case OP_multiply_i:
            evaluateBinary(Operator.MUL);
            stack.push(stack.pop() | 0);
            break;
          case OP_getlocal0:
          case OP_getlocal1:
          case OP_getlocal2:
          case OP_getlocal3:
            stack.push(locals[op - OP_getlocal0]);
            break;
          case OP_setlocal0:
          case OP_setlocal1:
          case OP_setlocal2:
          case OP_setlocal3:
            locals[op - OP_setlocal0] = stack.pop();
            break;
          case OP_debug:
          case OP_debugline:
            sourcePosition.line = bc.lineNumber;
            break;
          case OP_debugfile:
            sourcePosition.file = strings[bc.index];
            break;
          case OP_bkptline:       notImplemented(); break;
          case OP_timestamp:      notImplemented(); break;
          default:
            console.info("Not Implemented: " + opcodeName(bc));
          }

          pc++;
        } catch (e) {
          if (exceptions.length < 1) {
            throw e;
          }

          e = translateError(e);

          for (var i = 0, j = exceptions.length; i < j; i++) {
            var handler = exceptions[i];
            if (pc >= handler.start && pc <= handler.end &&
                (!handler.typeName ||
                 toplevel.getTypeByName(handler.typeName, true, true).isInstance(e))) {
              if (!handler.scopeObject) {
                if (handler.varName) {
                  var varTrait = Object.create(Trait.prototype);
                  varTrait.kind = TRAIT_Slot;
                  varTrait.name = handler.varName;
                  varTrait.typeName = handler.typeName;
                  varTrait.holder = method;
                  handler.scopeObject = runtime.applyTraits({}, new Traits([varTrait]));
                } else {
                  handler.scopeObject = {};
                }
              }

              scope = savedScope;
              scopeHeight = 0;
              stack.length = 0;
              stack.push(e);
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

})();
