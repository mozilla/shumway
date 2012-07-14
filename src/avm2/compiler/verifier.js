var verifierOptions = systemOptions.register(new OptionSet("Verifier Options"));

var Verifier = (function(abc) {

  var Type = (function () {

    function type(kind, value) {
      this.kind = kind;
      this.value = value;
    }

    type.prototype.toString = function () {
      if (this.value) {
        return this.kind + ": " + this.value;
      }
      return this.kind;
    };

    // Consists of Any, Undefined and Object
    type.Atom = new type("Atom");
    type.Atom.Any = new type("Atom", "Any");
    type.Atom.Undefined = new type("Atom", "Undefined");
    type.Atom.Object = new type("Atom", "Object");

    type.Int = new type("Int");
    type.Uint = new type("Uint");
    type.Boolean = new type("Boolean");
    type.Number = new type("Number");

    // Consists of Null and any sub class of Object
    // type.Reference = new type("Reference");

    type.fromName = function fromName(domain, name) {
      if (name === undefined) {
        return type.Atom.Undefined;
      } else if (name.getQualifiedName() === "public$int") {
        return type.Int;
      } else if (name.getQualifiedName() === "public$Object") {
        return type.Atom.Object;
      }
      return type.fromReference(domain.getProperty(name, false, false));
    };

    type.fromReference = function fromReference(value) {
      var ty = new type("Reference");
      ty.value = value;
      return ty;
    };

    type.Reference = {};
    type.Reference.Null = new type("Reference", null);
    type.Reference.String = new type("Reference", "String");

    type.check = function check(a, b) {
      assert (a.kind === b.kind);
    };

    type.prototype.isNumeric = function isNumeric() {
      return this === type.Number || this === type.Int || this === type.Uint;
    };

    type.prototype.merge = function(other) {
      if (this === other) {
        return this;
      } else if (this.kind === "Atom" && other.kind === "Atom") {
        return type.Atom.Any;
      } else if (this.kind === "Reference" && other.kind === "Reference") {
        // TODO: Actually merge reference types.
        return type.Reference.Null;
      }
      unexpected("Cannot merge types : " + this + " and " + other);
    };

    return type;
  })();

  /**
   * Abstract program state.
   */
  var State = (function() {
    var id = 0;
    function state() {
      this.id = id++;

      if (id > 100) {
        throw VerifierError("Probably in an infinite loop.");
      }

      this.stack = [];
      this.scope = [];
      this.local = [];
    }
    state.prototype.clone = function clone() {
      var s = new State();
      s.originalId = this.id;
      s.stack = this.stack.slice(0);
      s.scope = this.scope.slice(0);
      s.local = this.local.slice(0);
      return s;
    };
    state.prototype.trace = function trace(writer) {
      writer.writeLn(this.toString());
    };
    state.prototype.toString = function () {
      return "<" + this.id + (this.originalId ? ":" + this.originalId : "") +
             ", L[" + this.local.join(", ") + "]" +
             ", S[" + this.stack.join(", ") + "]" +
             ", $[" + this.scope.join(", ") + "]>"
    };
    function mergeArrays(a, b) {
      for (var i = a.length - 1; i >= 0; i--) {
        a[i] = a[i].merge(b[i]);
      }
    }
    state.prototype.merge = function (other) {
      mergeArrays(this.local, other.local);
      mergeArrays(this.stack, other.stack);
      mergeArrays(this.scope, other.scope);
    }
    return state;
  })();

  function VerifierError(message) {
    this.name = "VerifierError";
    this.message = message || "";
  }

  var Verification = (function() {
    function verification(verifier, domain, methodInfo, scope) {
      this.scope = scope;
      this.domain = domain;
      this.verifier = verifier;
      this.methodInfo = methodInfo;
      this.writer = new IndentingWriter();
      this.methodInfo.trace(this.writer, this.verifier.abc);
    }

    verification.prototype.verify = function verify() {
      var mi = this.methodInfo;
      var writer = this.writer;
      var blocks = mi.analysis.blocks;

      // We can't deal with rest and arguments yet.
      if (mi.needsRest() || mi.needsArguments()) {
        return;
      }

      var state = new State();

      assert (mi.localCount >= mi.parameters.length + 1);
      // First local is the type of |this|.
      state.local.push(Type.Atom);
      // Initialize entry state with parameter types.
      for (var i = 0; i < mi.parameters.length; i++) {
        state.local.push(Type.fromName(this.domain, mi.parameters[i].type));
      }

      state.trace(this.writer);

      var worklist = [];

      worklist.push({block: blocks[0], state: state});

      function inWorklist(block) {
        for (var i = 0; i < worklist.length; i++) {
          if (worklist[i].block === block) {
            return worklist[i];
          }
        }
        return false;
      }

      while (worklist.length) {
        var item = worklist.shift();
        var block = item.block;
        var state = item.state;
        this.verifyBlock(block, state);
        block.succs.forEach(function (successor) {
          var item = inWorklist(successor);
          if (item) {
            writer.writeLn("Merged Block: " + successor.bid + " " + 
                           state.toString() + " with " + item.state.toString());
            item.state.merge(state);
            writer.writeLn("Merged State: " + item.state);
            return;
          }
          var entryState = state.clone();
          worklist.push({block: successor, state: entryState});
          writer.writeLn("Added Block: " + successor.bid +
                         " to worklist: " + entryState.toString());

        });
      }
    };

    verification.prototype.verifyBlock = function verifyBlock(block, state) {
      var savedScope = this.scope;

      var local = state.local;
      var stack = state.stack;
      var scope = state.scope;

      var writer = this.writer;
      var domain = this.domain;
      var bytecodes = this.methodInfo.analysis.bytecodes;

      var abc = this.verifier.abc;
      var multinames = abc.constantPool.multinames;

      var obj, multiname, lVal, rVal, val;

      function popMultiname(index) {
        var multiname = multinames[index];
        if (multiname.isRuntime()) {
          var namespaces = multiname.namespaces;
          var name = multiname.name;
          if (multiname.isRuntimeName()) {
            name = state.stack.pop();
          }
          if (multiname.isRuntimeNamespace()) {
            namespaces = [state.stack.pop()];
          }
          return new Multiname(namespaces, name);
        } else {
          return multiname;
        }
      }

      function findProperty(multiname, strict) {
        if (savedScope) {
          var obj = savedScope.findProperty(multiname, domain, false);
          return Type.fromReference(obj);
        }
      }

      function resolveTrait(type, multiname) {
        if (type.kind === "Reference" && type.value instanceof domain.system.Class) {
          // ...
        }
      }

      function push(v) {
        stack.push(v);
      }

      function pop(type) {
        var v = stack.pop();
        if (type) {
          Type.check(v, type);
        }
        return v;
      }

      function getSlot(type, index) {
        if (type.kind !== "Reference") {
          return Type.Atom;
        }
        var slots;
        if (type.value instanceof Global) {
          slots = type.value.slots;
          assert (slots);
          return Type.fromName(slots[index].name);
        }
      }

      writer.enter("verifyBlock: " + block.bid +
                   ", range: [" + block.position + ", " + block.end.position +
                   "], entryState: " + state.toString() + " {");

      for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
        var bc = bytecodes[bci];
        var op = bc.op;

        switch (op) {
        case OP_bkpt:
          // Nop.
          break;
        case OP_throw:
          notImplemented(bc);
          break;
        case OP_getsuper:
          notImplemented(bc);
          break;
        case OP_setsuper:
          notImplemented(bc);
          break;
        case OP_dxns:
          notImplemented(bc);
          break;
        case OP_dxnslate:
          notImplemented(bc);
          break;
        case OP_kill:
          notImplemented(bc);
          break;
        case OP_lf32x4:
          notImplemented(bc);
          break;
        case OP_sf32x4:
          notImplemented(bc);
          break;
        case OP_ifnlt:
          notImplemented(bc);
          break;
        case OP_ifge:
          notImplemented(bc);
          break;
        case OP_ifnle:
          notImplemented(bc);
          break;
        case OP_ifgt:
          notImplemented(bc);
          break;
        case OP_ifngt:
          notImplemented(bc);
          break;
        case OP_ifle:
          notImplemented(bc);
          break;
        case OP_ifnge:
          notImplemented(bc);
          break;
        case OP_iflt:
          pop();
          pop();
          break;
        case OP_jump:
          // Nop.
          break;
        case OP_iftrue:
          pop();
          break;
        case OP_iffalse:
          pop();
          break;
        case OP_ifeq:
          notImplemented(bc);
          break;
        case OP_ifne:
          notImplemented(bc);
          break;
        case OP_ifstricteq:
          notImplemented(bc);
          break;
        case OP_ifstrictne:
          notImplemented(bc);
          break;
        case OP_lookupswitch:
          notImplemented(bc);
          break;
        case OP_popscope:
          scope.pop();
          break;
        case OP_nextname:
        case OP_nextvalue:
          pop(Type.Int);
          pop();
          push(Type.Atom.Any);
          break;
        case OP_hasnext:
          notImplemented(bc);
          break;
        case OP_hasnext2:
          Type.check(local[bc.object], Type.Atom.Any);
          Type.check(local[bc.index], Type.Int);
          push(Type.Boolean);
          break;
        case OP_pushnull:
          push(Type.Reference.Null);
          break;
        case OP_pushundefined:
          push(Type.Atom.Undefined);
          break;
        case OP_pushfloat:
          notImplemented(bc);
          break;
        case OP_pushbyte:
          push(Type.Int);
          break;
        case OP_pushshort:
          push(Type.Int);
          break;
        case OP_pushstring:
          push(Type.Reference.String);
          break;
        case OP_pushint:
          push(Type.Int);
          break;
        case OP_pushuint:
          push(Type.Uint);
          break;
        case OP_pushdouble:
          push(Type.Number);
          break;
        case OP_pushtrue:
          push(Type.Boolean);
          break;
        case OP_pushfalse:
          push(Type.Boolean);
          break;
        case OP_pushnan:
          push(Type.Number);
          break;
        case OP_pop:
          pop();
          break;
        case OP_dup:
          val = pop();
          push(val);
          push(val);
          break;
        case OP_swap:
          lVal = pop();
          rVal = pop();
          push(lVal);
          push(rVal);
          break;
        case OP_pushwith:
        case OP_pushscope:
          scope.push(pop());
          break;
        case OP_pushnamespace:
          push(Type.Atom.Object);
          break;
        case OP_li8:
        case OP_li16:
        case OP_li32:
          push(Type.Int);
          break;
        case OP_lf32:
        case OP_lf64:
          push(Type.Number);
          break;
        case OP_si8:
        case OP_si16:
        case OP_si32:
          pop(Type.Int);
          break;
        case OP_sf32:
        case OP_sf64:
          pop(Type.Number);
          break;
        case OP_newfunction:
          throw new VerifierError("Not Supported");
        case OP_call:
         notImplemented(bc);
          break;
        case OP_construct:
          notImplemented(bc);
          break;
        case OP_callmethod:
          // callmethod is always invalid
          // http://hg.mozilla.org/tamarin-redux/file/eb8f916bb232/core/Verifier.cpp#l1846
          throw new VerifierError("callmethod");
        case OP_callstatic:
          notImplemented(bc);
          break;
        case OP_callsuper:
          notImplemented(bc);
          break;
        case OP_callproperty:
          stack.popMany(bc.argCount);
          multiname = popMultiname(bc.index);
          obj = pop();
          resolveTrait(obj, multiname);
          break;
        case OP_returnvoid:
          // Nop.
          break;
        case OP_returnvalue:
          pop();
          break;
        case OP_constructsuper:
          notImplemented(bc);
          break;
        case OP_constructprop:
          notImplemented(bc);
          break;
        case OP_callsuperid:
          notImplemented(bc);
          break;
        case OP_callproplex:
          notImplemented(bc);
          break;
        case OP_callinterface:
          notImplemented(bc);
          break;
        case OP_callsupervoid:
          notImplemented(bc);
          break;
        case OP_callpropvoid:
          notImplemented(bc);
          break;
        case OP_sxi1:
        case OP_sxi8:
        case OP_sxi16:
          // Sign extend, nop.
          break;
        case OP_applytype:
          notImplemented(bc);
          break;
        case OP_pushfloat4:
          notImplemented(bc);
          break;
        case OP_newobject:
          // Pops keys and values, pushes result.
          stack.popMany(bc.argCount * 2);
          push(Type.Atom.Object);
          break;
        case OP_newarray:
          // Pops values, pushes result.
          stack.popMany(bc.argCount);
          push(Type.Atom.Object);
          break;
        case OP_newactivation:
          notImplemented(bc);
          break;
        case OP_newclass:
          throw new VerifierError("Not Supported");
        case OP_getdescendants:
          notImplemented(bc);
          break;
        case OP_newcatch:
          notImplemented(bc);
          break;
        case OP_findpropstrict:
          multiname = popMultiname(bc.index);
          stack.push(findProperty(multiname, true));
          break;
        case OP_findproperty:
          multiname = popMultiname(bc.index);
          stack.push(findProperty(multiname, false));
          break;
        case OP_finddef:
          notImplemented(bc);
          break;
        case OP_getlex:
          notImplemented(bc);
          break;
        case OP_initproperty:
        case OP_setproperty:
          pop();
          popMultiname(bc.index);
          pop();
          break;
        case OP_getlocal:
          push(local[bc.index]);
          break;
        case OP_setlocal:
          local[bc.index] = pop();
          break;
        case OP_getglobalscope:
          push(Type.fromReference(savedScope.global.object));
          break;
        case OP_getscopeobject:
          notImplemented(bc);
          break;
        case OP_getproperty:
          notImplemented(bc);
          break;
        case OP_getouterscope:
          notImplemented(bc);
          break;
        case OP_setpropertylate:
          notImplemented(bc);
          break;
        case OP_deleteproperty:
          notImplemented(bc);
          break;
        case OP_deletepropertylate:
          notImplemented(bc);
          break;
        case OP_getslot:
          push(getSlot(pop(), bc.index));
          break;
        case OP_setslot:
          notImplemented(bc);
          break;
        case OP_getglobalslot:
          notImplemented(bc);
          break;
        case OP_setglobalslot:
          notImplemented(bc);
          break;
        case OP_convert_s:
          pop();
          push(Type.Reference.String);
          break;
        case OP_esc_xelem:
          pop();
          push(Type.Reference.String);
          break;
        case OP_esc_xattr:
          pop();
          push(Type.Reference.String);
          break;
        case OP_coerce_i:
        case OP_convert_i:
          pop();
          push(Type.Int);
          break;
        case OP_coerce_u:
        case OP_convert_u:
          pop();
          push(Type.Uint);
          break;
        case OP_coerce_d:
        case OP_convert_d:
          pop();
          push(Type.Number);
          break;
        case OP_coerce_b:
        case OP_convert_b:
          pop();
          push(Type.Boolean);
          break;
        case OP_convert_o:
          notImplemented(bc);
          break;
        case OP_checkfilter:
          notImplemented(bc);
          break;
        case OP_convert_f:
          pop();
          push(Type.Number);
          break;
        case OP_unplus:
          notImplemented(bc);
          break;
        case OP_convert_f4:
          notImplemented(bc);
          break;
        case OP_coerce:
          notImplemented(bc);
          break;
        case OP_coerce_a:
          pop();
          push(Type.Atom.Any);
          break;
        case OP_coerce_s:
          pop();
          push(Type.Reference.String);
          break;
        case OP_astype:
          notImplemented(bc);
          break;
        case OP_astypelate:
          notImplemented(bc);
          break;
        case OP_coerce_o:
          notImplemented(bc);
          break;
        case OP_negate:
        case OP_increment:
        case OP_decrement:
          pop();
          push(Type.Number);
          break;
        case OP_inclocal:
        case OP_declocal:
          local[bc.index] = Type.Number;
          break;
        case OP_typeof:
          notImplemented(bc);
          break;
        case OP_not:
          pop();
          push(Type.Boolean);
          break;
        case OP_add:
          rVal = pop();
          lVal = pop();
          if (lVal.isNumeric() && rVal.isNumeric()) {
            push(Type.Number);
          } else {
            // TODO: Other Cases
            push(Type.Atom);
          }
          break;
        case OP_subtract:
          notImplemented(bc);
          break;
        case OP_multiply:
          notImplemented(bc);
          break;
        case OP_divide:
          notImplemented(bc);
          break;
        case OP_modulo:
          notImplemented(bc);
          break;
        case OP_bitand:
        case OP_bitor:
        case OP_bitxor:
        case OP_lshift:
        case OP_rshift:
        case OP_urshift:
          pop();
          pop();
          push(Type.Int);
          break;
        case OP_bitnot:
          pop();
          push(Type.Int);
          break;
        case OP_equals:
        case OP_strictequals:
        case OP_lessthan:
        case OP_lessequals:
        case OP_greaterthan:
        case OP_greaterequals:
        case OP_instanceof:
        case OP_in:
          pop();
          pop();
          push(Type.Boolean);
          break;
        case OP_istype:
          notImplemented(bc);
          break;
        case OP_istypelate:
          notImplemented(bc);
          break;
        case OP_inclocal_i:
        case OP_declocal_i:
          local[bc.index] = Type.Int;
          break;
        case OP_decrement_i:
        case OP_increment_i:
        case OP_negate_i:
          pop();
          push(Type.Int);
          break;
        case OP_add_i:
          notImplemented(bc);
          break;
        case OP_subtract_i:
          notImplemented(bc);
          break;
        case OP_multiply_i:
          notImplemented(bc);
          break;
        case OP_getlocal0:
        case OP_getlocal1:
        case OP_getlocal2:
        case OP_getlocal3:
          push(local[op - OP_getlocal0]);
          break;
        case OP_setlocal0:
        case OP_setlocal1:
        case OP_setlocal2:
        case OP_setlocal3:
          local[op - OP_setlocal0] = pop();
          break;
        case OP_debug:
          // Nop.
          break;
        case OP_debugline:
          // Nop.
          break;
        case OP_debugfile:
          // Nop.
          break;
        case OP_bkptline:
          // Nop.
          break;
        case OP_timestamp:
          // Nop.
          break;
        default:
          console.info("Not Implemented: " + bc);
        }

        if (writer) {
          writer.writeLn("state: " + state.toString() + " -- after bci: " + bci + ", " + bc);
        }
      }
      writer.leave("}");
    };

    return verification;
  })();

  function verifier(abc) {
    this.writer = new IndentingWriter();
    this.abc = abc;
  }

  verifier.prototype.verifyMethod = function(domain, methodInfo, scope) {
    try {
      new Verification(this, domain, methodInfo, scope).verify();
    } catch (e) {
      if (e instanceof VerifierError) {
        return;
      }
      throw e;
    }
  };

  return verifier;
})();
