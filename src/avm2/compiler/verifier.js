var verifierOptions = systemOptions.register(new OptionSet("Verifier Options"));

var Verifier = (function() {

  /**
   * Abstract program state.
   */
  var State = (function() {
    var id = 0;

    function state() {
      this.id = id++;

      // TODO this should be removed or at least the limit should be
      // increased to a bigger number
      if (id > 1000) {
        throw new VerifierError("Probably in an infinite loop.");
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
             ", $[" + this.scope.join(", ") + "]>";
    };
    state.prototype.equals = function(other) {
      //TODO update this function for Reference types
      if (!arraysEquals(this.stack, other.stack) ||
          !arraysEquals(this.scope, other.scope) ||
          !arraysEquals(this.local, other.local)) {
          return false;
      }
      return true;
    };
    function arraysEquals(a, b) {
      if(a.length != b.length) {
        return false;
      }
      for (var i = a.length - 1; i >= 0; i--) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      return true;
    }
    function mergeArrays(a, b) {
      for (var i = a.length - 1; i >= 0; i--) {
        a[i] = a[i].merge(b[i]);
      }
    }
    state.prototype.merge = function(other) {
      mergeArrays(this.local, other.local);
      mergeArrays(this.stack, other.stack);
      mergeArrays(this.scope, other.scope);
    };

    return state;
  })();

  function VerifierError(message) {
    this.name = "VerifierError";
    this.message = message || "";
  }

  function verifier(abc) {
    this.writer = new IndentingWriter();
    this.abc = abc;

    var domain = this.abc.domain;

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

      function getType(simpleName) {
        var name = Multiname.fromSimpleName(simpleName);
        var type = domain.getProperty(name, false, false);
       // assert (type, "Cannot find type: " + name);
        return type;
      }

      type.fromName = function fromName(name) {
        if (name === undefined) {
          return type.Atom.Undefined;
        } else if (name.getQualifiedName() === "public$int") {
          return type.Int;
        } else if (name.getQualifiedName() === "public$Object") {
          return type.Atom.Object;
        } else if (name.getQualifiedName() === "public$Number") {
          return type.Number;
        }
        var ty = domain.getProperty(name, false, false);
        assert (ty, name + " not found");
        return type.fromReference(ty);
      };

      type.fromReference = function fromReference(value) {
        // assert(value);
        var ty = new type("Reference");
        ty.value = value;
        return ty;
      };

      type.Reference = {};
      type.Reference.Null = new type("Reference", null);
      type.Reference.String = new type("Reference", getType("String"));
      type.Reference.Array = new type("Reference", getType("Array"));

      type.check = function check(a, b) {
        assert (a.kind === b.kind);
      };

      type.prototype.isNumeric = function isNumeric() {
        return this === type.Number || this === type.Int || this === type.Uint;
      };

      type.prototype.merge = function(other) {
        // TODO: Merging Atom.Undefined and Atom.Any bellow is a hack to
        // circumvent the fact that the verifier's type hierrchy doesn't
        // form a semilatice and solve the incompatible types merge situations
        if (this === other) {
          return this;
        } else if (this.kind === "Atom" && other.kind === "Atom") {
          return type.Atom.Any;
        } else if (this.kind === "Reference" && other.kind === "Reference") {
          // TODO: Actually merge reference types.
          return type.Reference.Null;
        } else if ((this === Type.Int && other === Type.Number) ||
                   (this === Type.Number && other === Type.Int)) {
          return type.Number;
        } else if (this === Type.Atom.Undefined || other === Type.Atom.Undefined) {
            return Type.Atom.Undefined;
        } else if (this === Type.Atom.Any || other === Type.Atom.Any) {
            return Type.Atom.Any;
        }
        unexpected("Cannot merge types : " + this + " and " + other);
      };

      return type;
    })();

    this.verification = (function() {
      function verification(verifier, methodInfo, scope) {
        this.scope = scope; // this.scope is the saved scope
        this.verifier = verifier;
        this.methodInfo = methodInfo;
        this.writer = new IndentingWriter();
      }

      verification.prototype.verify = function verify() {
        var mi = this.methodInfo;
        var writer = traceLevel.value <= 1 ? null : this.writer;
  
        var blocks = mi.analysis.blocks;

        if (writer) {
          this.methodInfo.trace(writer, this.verifier.abc);
        }

        // We can't deal with rest and arguments yet.
        if (mi.needsRest() || mi.needsArguments()) {
          return;
        }

        var entryState = new State();
        
        assert (mi.localCount >= mi.parameters.length + 1);
        // First local is the type of |this|.
        entryState.local.push(Type.Atom);
        // Initialize entry state with parameter types.
        for (var i = 0; i < mi.parameters.length; i++) {
          entryState.local.push(Type.fromName(mi.parameters[i].type));
        }

        if (writer) {
          entryState.trace(writer);
        }

        var worklist = [];

        blocks[0].entryState = entryState;

        worklist.push(blocks[0]);

        while (worklist.length) {
          var block = worklist.shift();
          var currEntryState = block.entryState;
          var currExitState = block.exitState = currEntryState.clone();
          
          // passed state gets mutated so it effectively becomes the exit state
          this.verifyBlock(block, currExitState);

          block.succs.forEach(function (successor) {

            if (worklist.indexOf(successor) !== -1) { // the block is already in the worklist
              if (writer) {
                writer.writeLn("Forward Merged Block: " + successor.bid + " " +
                               currExitState.toString() + " with " + successor.entryState.toString());
              }
              // merge existing item entry state with current block exit state
              successor.entryState.merge(currExitState);
              if (writer) {
                writer.writeLn("Merged State: " + successor.entryState);
              }
              return;
            }

            // backward branch scenario
            if (successor.entryState) { // test wheter the successor was already processed or not
              // if successor processed, but current exit state differs from it's entry state
              // then merge the states and add it in the work list
              if (!successor.entryState.equals(currExitState)) {
                if (writer) {
                  writer.writeLn("Backward Merged Block: " + successor.bid + " " +
                                  currExitState.toString() + " with " + successor.entryState.toString());
                }
                successor.entryState.merge(currExitState);
                worklist.push(successor);

                if (writer) {
                  writer.writeLn("Merged State: " + successor.entryState);
                }
              }
              // if successor processed and current exit state equals with it's entry state
              // then return; there is no need to add it in the work list
              return;
            }

            // add unvisited succesor block to the worklist
            //  it's entry state is current block exit state
            successor.entryState = currExitState.clone();
            worklist.push(successor);
            if (writer) {
              writer.writeLn("Added Block: " + successor.bid +
                             " to worklist: " + successor.entryState.toString());
            }

          });
        }
      };

      verification.prototype.verifyBlock = function verifyBlock(block, state) {
        var savedScope = this.scope;

        var local = state.local;
        var stack = state.stack;
        var scope = state.scope;

        var writer = traceLevel.value <= 1 ? null : this.writer;
        var bytecodes = this.methodInfo.analysis.bytecodes;

        var abc = this.verifier.abc;
        var multinames = abc.constantPool.multinames;
        var mmethods = abc.mmethods;

        var obj, func, mi, multiname, lVal, rVal, val;

        function popMultiname(index) {
          var multiname = multinames[index];
          if (multiname.isRuntime()) {
            var namespaces = multiname.namespaces;
            var name = multiname.name;
            if (multiname.isRuntimeName()) {
              // here we actually deal with abstract multinames,
              // i.e. name actually holds the type of the corresponding entity
              name = state.stack.pop();
              name.holdsType = true;
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
          if (type && type.kind === "Reference" && type.value instanceof domain.system.Class) {
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
            // TODO: Type.fromName expects a multiname but in case of constants
            // the slots of the global object are strings.
            // This can be replicated by running tests/regress/correctness/arrays.abc
            return Type.fromName(slots[index].name);
          }
        }

        if (writer) {
          writer.enter("verifyBlock: " + block.bid +
                       ", range: [" + block.position + ", " + block.end.position +
                       "], entryState: " + state.toString() + " {");
        }

        for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
          var bc = bytecodes[bci];
          var op = bc.op;

          switch (op) {
          case OP_bkpt:
            // Nop.
            break;
          case OP_throw:
            pop();
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
            state.local[bc.index] = Type.Atom.Undefined;
            break;
          case OP_lf32x4:
            notImplemented(bc);
            break;
          case OP_sf32x4:
            notImplemented(bc);
            break;
          case OP_ifnlt:
          case OP_ifge:
          case OP_ifnle:
          case OP_ifgt:
          case OP_ifngt:
          case OP_ifle:
          case OP_ifnge:
          case OP_iflt:
          case OP_ifeq:
          case OP_ifne:
          case OP_ifstricteq:
          case OP_ifstrictne:
            pop();
            pop();
            break;
          case OP_jump:
            // Nop.
            break;
          case OP_iftrue:
          case OP_iffalse:
            pop();
            break;
          case OP_lookupswitch:
            pop(Type.int);
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
            stack.popMany(bc.argCount);
            obj = pop();
            func = pop();
            push(Type.Atom.Any);
            break;
          case OP_construct:
            stack.popMany(bc.argCount);
            obj = pop();
            push(Type.Reference); //TODO infer obj's type ??
            break;
          case OP_callmethod:
            // callmethod is always invalid
            // http://hg.mozilla.org/tamarin-redux/file/eb8f916bb232/core/Verifier.cpp#l1846
            throw new VerifierError("callmethod");
          case OP_callstatic:
            notImplemented(bc);
            break;
          case OP_callsuper:
            stack.popMany(bc.argCount);
            multiname = popMultiname(bc.index);
            obj = pop();
            resolveTrait(obj, multiname); // ??
            //TODO: Implement resolveTrait and figure out the return type of the call
            push(Type.Atom.Any);
            break;
          case OP_callproperty:
            stack.popMany(bc.argCount);
            multiname = popMultiname(bc.index);
            obj = pop();
            resolveTrait(obj, multiname);
            //TODO: Implement resolveTrait and figure out the return type of the call
            push(Type.Atom.Any);
            break;
          case OP_returnvoid:
            // Nop.
            break;
          case OP_returnvalue:
            pop();
            break;
          case OP_constructsuper:
            stack.popMany(bc.argCount);
            stack.pop();
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
            multiname = popMultiname(bc.index);
            pop();
            // attach the property type to the setproperty bytecode
            if(multiname.name.holdsType) {
              bc.propertyType = multiname.name;
            }
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
            // Get scope object from index position of the scope stack
            // TODO: Verify this for correctness; should it look through saved
            // scope chain instead ?
            push(scope[bc.index]);
            break;
          case OP_getproperty:
            multiname = popMultiname(bc.index);
            pop();
            if(multiname.name.holdsType) {
              push(multiname.name);
              bc.propertyType = multiname.name;
            } else {
              push(Type.Atom.Any);
            }
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
            // The multiname in case of coerce bytecode cannot be
            // a runtime multiname and should be in the constant pool
            pop();
            push(Type.fromName(multinames[bc.index]));
            break;
          case OP_coerce_a:
            // Note: ignoring the effect of coerce_a is a little, temporary hack
            // to preserve types on stack since asc inserts a coerce_a
            // after every push (e.g. pushbyte)
            
            // pop();
            // push(Type.Atom.Any);
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
            pop();
            // TODO: Push string type on the stack?
            push(Type.Atom.Any);
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
          case OP_multiply:
          case OP_divide:
          case OP_modulo:
            pop();
            pop();
            push(Type.Number);
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
        if (writer) {
          writer.leave("}");
          writer.enter("verifiedBlock: " + block.bid +
                       ", range: [" + block.position + ", " + block.end.position +
                       "], exitState: " + state.toString());
        }
      };

      return verification;
    })();
  }

  verifier.prototype.verifyMethod = function(methodInfo, scope) {
    try {
      new this.verification(this, methodInfo, scope).verify();
    } catch (e) {
      if (e instanceof VerifierError) {
        return;
      }
      throw e;
    }
  };

  return verifier;
})();
