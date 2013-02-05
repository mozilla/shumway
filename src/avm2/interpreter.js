var interpreterOptions = systemOptions.register(new OptionSet("Interpreter Options"));

var traceInterpreter = interpreterOptions.register(new Option("ti", "traceInterpreter", "number", 0, "trace interpreter execution"));


var interpreterBytecodeCount = 0;

var Interpreter = (function () {

  function Interpreter(abc) {
    this.abc = abc;
  }

  var Apslice = [].slice;

  function applyNew(constructor, args) {
    return new (Function.bind.apply(constructor.instance, [,].concat(args)));
  }


  function createMultiname(stack, mn) {
    if (Multiname.isRuntime(mn)) {
      var namespaces = mn.namespaces, name = mn.name;
      if (Multiname.isRuntimeName(mn)) {
        name = stack.pop();
      }
      if (isNumeric(name)) {
        release || assert(!Multiname.isRuntimeNamespace(mn));
        return name;
      }
      if (Multiname.isRuntimeNamespace(mn)) {
        namespaces = [stack.pop()];
      }
      mn = new Multiname(namespaces, name);
    }
    release || assert(!Multiname.isRuntime(mn));
    return mn;
  }

  Interpreter.prototype = {
    interpretMethod: function interpretMethod($this, method, savedScope, args) {
      release || assert(method.analysis);
      Counter.count("Interpret Method");
      var abc = this.abc;
      var ints = abc.constantPool.ints;
      var uints = abc.constantPool.uints;
      var doubles = abc.constantPool.doubles;
      var strings = abc.constantPool.strings;
      var methods = abc.methods;
      var multinames = abc.constantPool.multinames;
      var runtime = abc.runtime;
      var domain = abc.domain;
      var rtstack = Runtime.stack;

      var exceptions = method.exceptions;

      var locals = [$this];
      var scope = savedScope;
      var scopeHeight = 0;
      var stack = [];

      var parameterCount = method.parameters.length;
      var argCount = args.length;

      rtstack.push(runtime);

      var value;
      for (var i = 0; i < parameterCount; i++) {
        var parameter = method.parameters[i];
        if (i < argCount) {
          value = args[i];
        } else {
          value = parameter.value;
        }

        if (parameter.type && !parameter.type.isAnyName()) {
          value = coerce(value, domain.getProperty(parameter.type, true, true));
        }

        locals.push(value);
      }

      if (method.needsRest()) {
        locals.push(Apslice.call(args, parameterCount));
      } else if (method.needsArguments()) {
        locals.push(Apslice.call(args, 0));
      }

      var obj, objsuper, type, index, multiname, ns, name, res, a, b;
      var bytecodes = method.analysis.bytecodes;
      var sourcePosition = {file: undefined, line: undefined};

      if (traceInterpreter.value > 0) {
        var methodName = method.name ? Multiname.getQualifiedName(method.name) : "unknown";
        print("methodName: " + methodName);
        method.trace(new IndentingWriter(), abc);
      }

      interpret:
      for (var pc = 0, end = bytecodes.length; pc < end; ) {
        interpreterBytecodeCount ++;
        if (traceInterpreter.value > 0 && sourcePosition.file !== undefined) {
          print("position: " + sourcePosition.file + ": " + sourcePosition.line);
        }
        try {
          var bc = bytecodes[pc];
          var op = bc.op;

          switch (op) {
          case OP_bkpt:           notImplemented(); break;
          case OP_throw:
            throw stack.pop();
          case OP_getsuper:
            multiname = createMultiname(stack, multinames[bc.index]);
            stack.push(getSuper(stack.pop(), multiname));
            break;
          case OP_setsuper:
            value = stack.pop();
            multiname = createMultiname(stack, multinames[bc.index]);
            stack.push(setSuper(stack.pop(), multiname, value));
            break;
          case OP_dxns:           notImplemented(); break;
          case OP_dxnslate:       notImplemented(); break;
          case OP_kill:
            locals[bc.index] = undefined;
            break;
          case OP_lf32x4:         notImplemented(); break;
          case OP_sf32x4:         notImplemented(); break;
          case OP_ifnlt:
            b = stack.pop();
            a = stack.pop();
            pc = !(a < b) ? bc.offset : pc + 1;
            continue;
          case OP_ifge:
            b = stack.pop();
            a = stack.pop();
            pc = a >= b ? bc.offset : pc + 1;
            continue;
          case OP_ifnle:
            b = stack.pop();
            a = stack.pop();
            pc = !(a <= b) ? bc.offset : pc + 1;
            continue;
          case OP_ifgt:
            b = stack.pop();
            a = stack.pop();
            pc = a > b ? bc.offset : pc + 1;
            continue;
          case OP_ifngt:
            b = stack.pop();
            a = stack.pop();
            pc = !(a > b) ? bc.offset : pc + 1;
            continue;
          case OP_ifle:
            b = stack.pop();
            a = stack.pop();
            pc = a <= b ? bc.offset : pc + 1;
            continue;
          case OP_ifnge:
            b = stack.pop();
            a = stack.pop();
            pc = !(a >= b) ? bc.offset : pc + 1;
            continue;
          case OP_iflt:
            b = stack.pop();
            a = stack.pop();
            pc = a < b ? bc.offset : pc + 1;
            continue;
          case OP_jump:
            pc = bc.offset;
            continue;
          case OP_iftrue:
            pc = !!stack.pop() ? bc.offset : pc + 1;
            continue;
          case OP_iffalse:
            pc = !stack.pop() ? bc.offset : pc + 1;
            continue;
          case OP_ifeq:
            b = stack.pop();
            a = stack.pop();
            pc = a == b ? bc.offset : pc + 1;
            continue;
          case OP_ifne:
            b = stack.pop();
            a = stack.pop();
            pc = a != b ? bc.offset : pc + 1;
            continue;
          case OP_ifstricteq:
            b = stack.pop();
            a = stack.pop();
            pc = a === b ? bc.offset : pc + 1;
            continue;
          case OP_ifstrictne:
            b = stack.pop();
            a = stack.pop();
            pc = a !== b ? bc.offset : pc + 1;
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
            scope = new Scope(scope, stack.pop(), true);
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
            stack.push(runtime.createFunction(methods[bc.index], scope, true));
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
            multiname = createMultiname(stack, multinames[bc.index]);
            obj = stack.pop();
            stack.push(getSuper(obj, multiname).apply(obj, args));
            break;
          case OP_callproperty:
            args = stack.popMany(bc.argCount);
            multiname = createMultiname(stack, multinames[bc.index]);
            obj = stack.pop();
            stack.push(getProperty(obj, multiname).apply(obj, args));
            break;
          case OP_returnvoid:
            rtstack.pop();
            return;
          case OP_returnvalue:
            rtstack.pop();
            return stack.pop();
          case OP_constructsuper:
            args = stack.popMany(bc.argCount);
            obj = stack.pop();
            savedScope.object.baseClass.instanceNoInitialize.apply(obj, args);
            break;
          case OP_constructprop:
            args = stack.popMany(bc.argCount);
            multiname = createMultiname(stack, multinames[bc.index]);
            obj = stack.pop();
            stack.push(applyNew(getProperty(obj, multiname), args));
            break;
          case OP_callsuperid:    notImplemented(); break;
          case OP_callproplex:
            args = stack.popMany(bc.argCount);
            multiname = createMultiname(stack, multinames[bc.index]);
            obj = stack.pop();
            stack.push(getProperty(obj, multiname).apply(null, args));
            break;
          case OP_callinterface:  notImplemented(); break;
          case OP_callsupervoid:
            args = stack.popMany(bc.argCount);
            multiname = createMultiname(stack, multinames[bc.index]);
            obj = stack.pop();
            getSuper(obj, multiname).apply(obj, args);
            break;
          case OP_callpropvoid:
            args = stack.popMany(bc.argCount);
            multiname = createMultiname(stack, multinames[bc.index]);
            obj = stack.pop();
            getProperty(obj, multiname).apply(obj, args);
            break;
          case OP_sxi1:           notImplemented(); break;
          case OP_sxi8:           notImplemented(); break;
          case OP_sxi16:          notImplemented(); break;
          case OP_applytype:
            args = stack.popMany(bc.argCount);
            stack.push(runtime.applyType(stack.pop(), args));
            break;
          case OP_pushfloat4:     notImplemented(); break;
          case OP_newobject:
            obj = {};
            for (var i = 0; i < bc.argCount; i++) {
              var value = stack.pop();
              obj[Multiname.getPublicQualifiedName(stack.pop())] = value;
            }
            stack.push(obj);
            break;
          case OP_newarray:
            obj = [];
            obj.push.apply(obj, stack.popMany(bc.argCount));
            stack.push(obj);
            break;
          case OP_newactivation:
            release || assert(method.needsActivation());
            stack.push(createActivation(method));
            break;
          case OP_newclass:
            stack.push(runtime.createClass(abc.classes[bc.index], stack.pop(), scope));
            break;
          case OP_getdescendants:
            multiname = createMultiname(stack, multinames[bc.index]);
            stack.push(getDescendants(multiname, stack.pop()));
            break;
          case OP_newcatch:
            release || assert(exceptions[bc.index].scopeObject);
            stack.push(exceptions[bc.index].scopeObject);
            break;
          case OP_findpropstrict:
            multiname = createMultiname(stack, multinames[bc.index]);
            stack.push(scope.findProperty(multiname, domain, true));
            break;
          case OP_findproperty:
            multiname = createMultiname(stack, multinames[bc.index]);
            stack.push(scope.findProperty(multiname, domain, false));
            break;
          case OP_finddef:        notImplemented(); break;
          case OP_getlex:
            // TODO: Cache the resolved multiname so it doesn't have to be
            // resolved again in getProperty
            multiname = createMultiname(stack, multinames[bc.index]);
            stack.push(getProperty(scope.findProperty(multiname, domain, true), multiname));
            break;
          case OP_initproperty:
          case OP_setproperty:
            value = stack.pop();
            multiname = createMultiname(stack, multinames[bc.index]);
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
            var scopeDistance = (scopeHeight - 1) - bc.index;
            release || assert(scopeDistance >= 0);
            for (var i = 0; i < scopeDistance; i++) {
              obj = obj.parent;
            }
            stack.push(obj.object);
            break;
          case OP_getproperty:
            multiname = createMultiname(stack, multinames[bc.index]);
            stack.push(getProperty(stack.pop(), multiname));
            break;
          case OP_getouterscope:      notImplemented(); break;
          case OP_setpropertylate:    notImplemented(); break;
          case OP_deleteproperty:
            multiname = createMultiname(stack, multinames[bc.index]);
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
          case OP_convert_s:
            stack.push(toString(stack.pop()));
            break;
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
            stack.push(coerce(value, domain.getProperty(multiname, true, true)));
            break;
          case OP_coerce_a:       /* NOP */ break;
          case OP_coerce_s:
            stack.push(coerceString(stack.pop()));
            break;
          case OP_astype:         notImplemented(); break;
          case OP_astypelate:
            type = stack.pop();
            value = stack.pop();
            stack.push(asInstance(value, type));
            break;
          case OP_coerce_o:
            obj = stack.pop();
            stack.push(obj == undefined ? null : obj);
            break;
          case OP_negate:
            stack.push(-stack.pop());
            break;
          case OP_increment:
            a = stack.pop();
            stack.push(a + 1);
            break;
          case OP_inclocal:
            ++locals[bc.index];
            break;
          case OP_decrement:
            stack.push(1);
            b = stack.pop();
            a = stack.pop();
            stack.push(a - b);
            break;
          case OP_declocal:
            --locals[bc.index];
            break;
          case OP_typeof:
            stack.push(typeOf(stack.pop()));
            break;
          case OP_not:
            stack.push(!stack.pop());
            break;
          case OP_bitnot:
            stack.push(~stack.pop());
            break;
          case OP_add:
            b = stack.pop();
            a = stack.pop();
            stack.push(a + b);
            break;
          case OP_subtract:
            b = stack.pop();
            a = stack.pop();
            stack.push(a - b);
            break;
          case OP_multiply:
            b = stack.pop();
            a = stack.pop();
            stack.push(a * b);
            break;
          case OP_divide:
            b = stack.pop();
            a = stack.pop();
            stack.push(a / b);
            break;
          case OP_modulo:
            b = stack.pop();
            a = stack.pop();
            stack.push(a % b);
            break;
          case OP_lshift:
            b = stack.pop();
            a = stack.pop();
            stack.push(a << b);
            break;
          case OP_rshift:
            b = stack.pop();
            a = stack.pop();
            stack.push(a >> b);
            break;
          case OP_urshift:
            b = stack.pop();
            a = stack.pop();
            stack.push(a >>> b);
            break;
          case OP_bitand:
            b = stack.pop();
            a = stack.pop();
            stack.push(a & b);
            break;
          case OP_bitor:
            b = stack.pop();
            a = stack.pop();
            stack.push(a | b);
            break;
          case OP_bitxor:
            b = stack.pop();
            a = stack.pop();
            stack.push(a ^ b);
            break;
          case OP_equals:
            b = stack.pop();
            a = stack.pop();
            stack.push(a == b);
            break;
          case OP_strictequals:
            b = stack.pop();
            a = stack.pop();
            stack.push(a === b);
            break;
          case OP_lessthan:
            b = stack.pop();
            a = stack.pop();
            stack.push(a < b);
            break;
          case OP_lessequals:
            b = stack.pop();
            a = stack.pop();
            stack.push(a <= b);
            break;
          case OP_greaterthan:
            b = stack.pop();
            a = stack.pop();
            stack.push(a > b);
            break;
          case OP_greaterequals:
            b = stack.pop();
            a = stack.pop();
            stack.push(a >= b);
            break;
          case OP_instanceof:
            type = stack.pop();
            value = stack.pop();
            stack.push(isInstanceOf(value, type));
            break;
          case OP_istype:
            value = stack.pop();
            multiname = multinames[bc.index];
            release || assert(!multiname.isRuntime());
            type = domain.getProperty(multiname, true, true);
            stack.push(isInstance(value, type));
            break;
          case OP_istypelate:
            type = stack.pop();
            value = stack.pop();
            stack.push(isInstance(value, type));
            break;
          case OP_in:
            obj = stack.pop();
            multiname = Multiname.getPublicQualifiedName(stack.pop());
            stack.push(hasProperty(obj, multiname));
            break;
          case OP_increment_i:
            stack.push(stack.pop() | 0);
            stack.push(1);
            b = stack.pop();
            a = stack.pop();
            stack.push(a + b);
            break;
          case OP_decrement_i:
            stack.push(stack.pop() | 0);
            stack.push(1);
            b = stack.pop();
            a = stack.pop();
            stack.push(a - b);
            break;
          case OP_inclocal_i:
            locals[bc.index] = (locals[bc.index] | 0) + 1;
            break;
          case OP_declocal_i:
            locals[bc.index] = (locals[bc.index] | 0) - 1;
            break;
          case OP_negate_i:
            stack.push(~(stack.pop() | 0));
            break;
          case OP_add_i:
            b = stack.pop();
            a = stack.pop();
            stack.push((a + b) | 0);
            break;
          case OP_subtract_i:
            b = stack.pop();
            a = stack.pop();
            stack.push((a - b) | 0);
            break;
          case OP_multiply_i:
            b = stack.pop();
            a = stack.pop();
            stack.push((a * b) | 0);
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

          e = runtime.translateError(e);
          for (var i = 0, j = exceptions.length; i < j; i++) {
            var handler = exceptions[i];
            if (pc >= handler.start && pc <= handler.end &&
                (!handler.typeName ||
                 domain.getProperty(handler.typeName, true, true).isInstance(e))) {
              Runtime.unwindStackTo(runtime);
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
