var verifierOptions = systemOptions.register(new OptionSet("Verifier Options"));

var Verifier = (function(abc) {

  var Type = (function () {
    function type(name) {
      this.name = name;
    }
    type.prototype.toString = function () {
      return this.name;
    };
    type.Atom = new type("Atom");
    type.Int = new type("Int");
    type.Uint = new type("Uint");
    type.Boolean = new type("Boolean");
    type.Number = new type("Number");
    type.Reference = new type("Reference");

    type.fromValue = function fromValue(value) {
      if (value === undefined) {
        return type.Atom;
      }
      notImplemented(value);
    };

    return type;
  })();


  /**
   * Abstract program state.
   */
  var State = (function() {
    var stateCounter = 0;

    function state() {
      this.stack = [];
      this.scope = [];
      this.local = [];

      this.id = stateCounter++;
    }
    state.prototype.clone = function clone() {
      var s = new State();
      s.stack = this.stack.slice(0);
      s.scope = this.scope.slice(0);
      s.local = this.local.slice(0);
      return s;
    };
    state.prototype.trace = function trace(writer) {
      writer.writeLn("S: " + this.id +
                     ", local: [" + this.local.join(", ") + "]" +
                     ", stack: [" + this.stack.join(", ") + "]" +
                     ", scope: [" + this.scope.join(", ") + "]");
    };
    return state;
  })();

  var Verification = (function() {
    function verification(verifier, methodInfo) {
      this.verifier = verifier;
      this.methodInfo = methodInfo;
      this.writer = new IndentingWriter();
    }

    verification.prototype.verify = function verify() {

      // this.methodInfo.analysis.trace(new IndentingWriter());
      var mi = this.methodInfo;
      var blocks = mi.analysis.blocks;

      // We can't deal with rest and arguments yet.
      if (mi.needsRest() || mi.needsArguments()) {
        return;
      }

      var state = new State();
 
      assert (mi.localCount >= mi.parameters.length + 1);
      for (var i = 0; i < mi.parameters.length; i++) {
        state.local.push(Type.fromValue(mi.parameters[i].type));
      }

      state.trace(this.writer);

      for (var i = 0; i < blocks.length; i++) {
        // this.verifyBlock(blocks[i]);
      }
    };

    verification.prototype.verifyBlock = function verifyBlock(block, state) {
      var writer = this.writer;
      var bytecodes = this.methodInfo.analysis.bytecodes;
      for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
        var bc = bytecodes[bci];
        var op = bc.op;

        if (writer) {
          writer.writeLn("bytecode bci: " + bci + ", originalBci: " + bc.originalPosition + ", " + bc);
        }

        switch (op) {
        case OP_bkpt:
          notImplemented();
          break;
        case OP_throw:
          notImplemented();
          break;
        case OP_getsuper:
          notImplemented();
          break;
        case OP_setsuper:
          notImplemented();
          break;
        case OP_dxns:
          notImplemented();
          break;
        case OP_dxnslate:
          notImplemented();
          break;
        case OP_kill:
          notImplemented();
          break;
        case OP_lf32x4:
          notImplemented();
          break;
        case OP_sf32x4:
          notImplemented();
          break;
        case OP_ifnlt:
          notImplemented();
          break;
        case OP_ifge:
          notImplemented();
          break;
        case OP_ifnle:
          notImplemented();
          break;
        case OP_ifgt:
          notImplemented();
          break;
        case OP_ifngt:
          notImplemented();
          break;
        case OP_ifle:
          notImplemented();
          break;
        case OP_ifnge:
          notImplemented();
          break;
        case OP_iflt:
          notImplemented();
          break;
        case OP_jump:
          notImplemented();
          break;
        case OP_iftrue:
          notImplemented();
          break;
        case OP_iffalse:
          notImplemented();
          break;
        case OP_ifeq:
          notImplemented();
          break;
        case OP_ifne:
          notImplemented();
          break;
        case OP_ifstricteq:
          notImplemented();
          break;
        case OP_ifstrictne:
          notImplemented();
          break;
        case OP_lookupswitch:
          notImplemented();
          break;
        case OP_pushwith:
          notImplemented();
          break;
        case OP_popscope:
          notImplemented();
          break;
        case OP_nextname:
          notImplemented();
          break;
        case OP_nextvalue:
          notImplemented();
          break;
        case OP_hasnext:
          notImplemented();
          break;
        case OP_hasnext2:
          notImplemented();
          break;
        case OP_pushnull:
          notImplemented();
          break;
        case OP_pushundefined:
          notImplemented();
          break;
        case OP_pushfloat:
          notImplemented();
          break;
        case OP_pushbyte:
          notImplemented();
          break;
        case OP_pushshort:
          notImplemented();
          break;
        case OP_pushstring:
          notImplemented();
          break;
        case OP_pushint:
          notImplemented();
          break;
        case OP_pushuint:
          notImplemented();
          break;
        case OP_pushdouble:
          notImplemented();
          break;
        case OP_pushtrue:
          notImplemented();
          break;
        case OP_pushfalse:
          notImplemented();
          break;
        case OP_pushnan:
          notImplemented();
          break;
        case OP_pop:
          notImplemented();
          break;
        case OP_dup:
          notImplemented();
          break;
        case OP_swap:
          notImplemented();
          break;
        case OP_pushscope:
          notImplemented();
          break;
        case OP_pushnamespace:
          notImplemented();
          break;
        case OP_li8:
          notImplemented();
          break;
        case OP_li16:
          notImplemented();
          break;
        case OP_li32:
          notImplemented();
          break;
        case OP_lf32:
          notImplemented();
          break;
        case OP_lf64:
          notImplemented();
          break;
        case OP_si8:
          notImplemented();
          break;
        case OP_si16:
          notImplemented();
          break;
        case OP_si32:
          notImplemented();
          break;
        case OP_sf32:
          notImplemented();
          break;
        case OP_sf64:
          notImplemented();
          break;
        case OP_newfunction:
          notImplemented();
          break;
        case OP_call:
          notImplemented();
          break;
        case OP_construct:
          notImplemented();
          break;
        case OP_callmethod:
          notImplemented();
          break;
        case OP_callstatic:
          notImplemented();
          break;
        case OP_callsuper:
          notImplemented();
          break;
        case OP_callproperty:
          notImplemented();
          break;
        case OP_returnvoid:
          notImplemented();
          break;
        case OP_returnvalue:
          notImplemented();
          break;
        case OP_constructsuper:
          notImplemented();
          break;
        case OP_constructprop:
          notImplemented();
          break;
        case OP_callsuperid:
          notImplemented();
          break;
        case OP_callproplex:
          notImplemented();
          break;
        case OP_callinterface:
          notImplemented();
          break;
        case OP_callsupervoid:
          notImplemented();
          break;
        case OP_callpropvoid:
          notImplemented();
          break;
        case OP_sxi1:
          notImplemented();
          break;
        case OP_sxi8:
          notImplemented();
          break;
        case OP_sxi16:
          notImplemented();
          break;
        case OP_applytype:
          notImplemented();
          break;
        case OP_pushfloat4:
          notImplemented();
          break;
        case OP_newobject:
          notImplemented();
          break;
        case OP_newarray:
          notImplemented();
          break;
        case OP_newactivation:
          notImplemented();
          break;
        case OP_newclass:
          notImplemented();
          break;
        case OP_getdescendants:
          notImplemented();
          break;
        case OP_newcatch:
          notImplemented();
          break;
        case OP_findpropstrict:
          notImplemented();
          break;
        case OP_findproperty:
          notImplemented();
          break;
        case OP_finddef:
          notImplemented();
          break;
        case OP_getlex:
          notImplemented();
          break;
        case OP_initproperty:
        case OP_setproperty:
          notImplemented();
          break;
        case OP_getlocal:
          notImplemented();
          break;
        case OP_setlocal:
          notImplemented();
          break;
        case OP_getglobalscope:
          notImplemented();
          break;
        case OP_getscopeobject:
          notImplemented();
          break;
        case OP_getproperty:
          notImplemented();
          break;
        case OP_getouterscope:
          notImplemented();
          break;
        case OP_setpropertylate:
          notImplemented();
          break;
        case OP_deleteproperty:
          notImplemented();
          break;
        case OP_deletepropertylate:
          notImplemented();
          break;
        case OP_getslot:
          notImplemented();
          break;
        case OP_setslot:
          notImplemented();
          break;
        case OP_getglobalslot:
          notImplemented();
          break;
        case OP_setglobalslot:
          notImplemented();
          break;
        case OP_convert_s:
          notImplemented();
          break;
        case OP_esc_xelem:
          notImplemented();
          break;
        case OP_esc_xattr:
          notImplemented();
          break;
        case OP_coerce_i:
        case OP_convert_i:
          notImplemented();
          break;
        case OP_coerce_u:
        case OP_convert_u:
          notImplemented();
          break;
        case OP_coerce_d:
        case OP_convert_d:
          notImplemented();
          break;
        case OP_coerce_b:
        case OP_convert_b:
          notImplemented();
          break;
        case OP_convert_o:
          notImplemented();
          break;
        case OP_checkfilter:
          notImplemented();
          break;
        case OP_convert_f:
          notImplemented();
          break;
        case OP_unplus:
          notImplemented();
          break;
        case OP_convert_f4:
          notImplemented();
          break;
        case OP_coerce:
          notImplemented();
          break;
        case OP_coerce_a:
          /* NOP */
          break;
        case OP_coerce_s:
          notImplemented();
          break;
        case OP_astype:
          notImplemented();
          break;
        case OP_astypelate:
          notImplemented();
          break;
        case OP_coerce_o:
          notImplemented();
          break;
        case OP_negate:
          notImplemented();
          break;
        case OP_increment:
          notImplemented();
          break;
        case OP_inclocal:
          notImplemented();
          break;
        case OP_decrement:
          notImplemented();
          break;
        case OP_declocal:
          notImplemented();
          break;
        case OP_typeof:
          notImplemented();
          break;
        case OP_not:
          notImplemented();
          break;
        case OP_bitnot:
          notImplemented();
          break;
        case OP_add_d:
          notImplemented();
          break;
        case OP_add:
          notImplemented();
          break;
        case OP_subtract:
          notImplemented();
          break;
        case OP_multiply:
          notImplemented();
          break;
        case OP_divide:
          notImplemented();
          break;
        case OP_modulo:
          notImplemented();
          break;
        case OP_lshift:
          notImplemented();
          break;
        case OP_rshift:
          notImplemented();
          break;
        case OP_urshift:
          notImplemented();
          break;
        case OP_bitand:
          notImplemented();
          break;
        case OP_bitor:
          notImplemented();
          break;
        case OP_bitxor:
          notImplemented();
          break;
        case OP_equals:
          notImplemented();
          break;
        case OP_strictequals:
          notImplemented();
          break;
        case OP_lessthan:
          notImplemented();
          break;
        case OP_lessequals:
          notImplemented();
          break;
        case OP_greaterthan:
          notImplemented();
          break;
        case OP_greaterequals:
          notImplemented();
          break;
        case OP_instanceof:
          notImplemented();
          break;
        case OP_istype:
          notImplemented();
          break;
        case OP_istypelate:
          notImplemented();
          break;
        case OP_in:
          notImplemented();
          break;
        case OP_increment_i:
          notImplemented();
          break;
        case OP_decrement_i:
          notImplemented();
          break;
        case OP_inclocal_i:
          notImplemented();
          break;
        case OP_declocal_i:
          notImplemented();
          break;
        case OP_negate_i:
          notImplemented();
          break;
        case OP_add_i:
          notImplemented();
          break;
        case OP_subtract_i:
          notImplemented();
          break;
        case OP_multiply_i:
          notImplemented();
          break;
        case OP_getlocal0:
        case OP_getlocal1:
        case OP_getlocal2:
        case OP_getlocal3:
          notImplemented();
          break;
        case OP_setlocal0:
        case OP_setlocal1:
        case OP_setlocal2:
        case OP_setlocal3:
          notImplemented();
          break;
        case OP_debug:
          /* NOP */
          break;
        case OP_debugline:
          notImplemented();
          break;
        case OP_debugfile:
          notImplemented();
          break;
        case OP_bkptline:
          notImplemented();
          break;
        case OP_timestamp:
          notImplemented();
          break;
        default:
          console.info("Not Implemented: " + bc);
        }

        /*
        if (writer) {
          state.trace(writer);
          writer.enter("body: {");
          for (var i = 0; i < body.length; i++) {
            writer.writeLn(generate(body[i]));
          }
          writer.leave("}");
        }
        */
      }
    };

    return verification;
  })();

  function verifier(abc) {
    this.writer = new IndentingWriter();
    this.abc = abc;
  }

  verifier.prototype.verifyMethod = function(methodInfo) {
    new Verification(this, methodInfo).verify();
  };

  return verifier;
})();