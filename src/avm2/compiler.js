/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function Emitter() {
  this.stmts = [];
  this.exprs = [];
}

Emitter.prototype = {
  stmt: function stmt(s) {
    if (!s) {
      s = this.exprs.pop();
    }
    this.stmts.push(s + ";");
  },

  decl: function decl() {
    this.stmts.push(this.exprs.pop());
  },

  expr: function expr(e) {
    this.exprs.push(e);
  },

  assign: function assign() {
    var lhs = this.exprs.pop();
    var rhs = this.exprs.pop();
    this.stmt(lhs + "=" + rhs);
  },

  call: function assign(nargs) {
    var lhs = this.exprs.pop();
    var args = this.exprs.slice(-nargs).reverse()
    this.expr("(" + lhs + ")(" + args.join(",") + ")");
  },

  ret: function ret() {
    this.stmt("return " + this.exprs.pop());
  },

  func: function func(name, nparams, body) {
    var tmpEmit = new Emitter;
    body(tmpEmit);
    var params = [];
    for (var i = 0; i < nparams; i++) {
      params.push("param" + i);
    }
    this.expr("function " + name + "(" + params.join(",") + ") {" +
          tmpEmit.finish() + "}");
  },

  varDecl: function varDecl(name) {
    this.stmt("var " + name);
  },

  thunk: function thunk(body) {
    this.func("", 0, body);
  },

  setProp: function setProp(scope, multiname) {
    if (multiname.isQName()) {
      this.expr(scope + "." + mangleQName(multiname));
      this.assign();
      return;
    }
    this.expr(multiname.index);
    this.expr(scope + ".setBinding");
    this.call(2);
    this.stmt();
  },

  findProp: function findProp(scope, multiname) {
    if (multiname.isQName()) {
      this.expr(scope + "." + mangleQName(multiname));
    }
    this.expr(multiname.index);
    this.expr(scope + ".findBinding");
    this.call(1);
  },

  finish: function finish() {
    var out = this.stmts.join("\n");
    this.stmts = [];
    this.exprs = [];
    return out;
  }
}

function mangleQName(multiname) {
  assert(multiname.isQName());
  return multiname.getNamespace(0) + "$$" + multiname.getName();
}

var Compiler = (function () {

  const args = "args";
  const localScope = "scope";
  const parentScope = "parentScope";
  const proto = "prototype";

  function defaultValue(typeName) {
    if (typeName === undefined)
      return "undefined";

    /* :XXX: Is this right? */
    switch (typeName.name) {
    case "Boolean":
      return "false";
    case "int":
      return "0";
    case "Number":
      return "NaN";
    case "uint":
      return "0";
    default:
      return "null";
    }
  }

  /*
   * Classes in AVM are split into two parts:
   *  - instance_info, which describe layout of class instances.
   *  - class_info, which describe layout of classes themselves, i.e. static
   *  properties.
   *
   * Some AVM terms:
   *  iinit  - instance initializer, i.e. constructor
   *  cinit  - class initializer, i.e. static constructor
   *  traits - descriptions of properties
   *
   * AVM classes are compiled to JS functions using the folowing mappings:
   *
   * Classes are functions with their iinit folded in,
   *   class C { public function C(args) { ... } }
   *   =>
   *   function C(args) { ... }
   *
   * Class traits (static properties) are set on C itself,
   *   class C { ... public static const CPROP: int = 0 ... }
   *   =>
   *   ... C.public$$CPROP = 0 ...
   *
   * Instance traits of type TRAIT_Slot, TRAIT_Const are set in the beginning
   * of the JS function,
   *   class C { public var x }
   *   =>
   *   function C() { this.public$$x = undefined }
   *
   * Instance traits of type TRAIT_Method, TRAIT_Getter, TRAIT_Setter are set
   * on C.prototype,
   *   class C { public function m() { ... } }
   *   =>
   *   C.prototype.public$$m = function () { ... }
   *
   * Classes' cinit functions are compiled as a special function init and are
   * called at the toplevel.
   *   class C { ... }
   *   =>
   *   C.init = function C$init() { }; ...; C.init();
   *
   * Inheritance is dealt with by copying instance properties and chaining
   * prototypes,
   *   class C extends B { ... }
   *   =>
   *   function C() { B(); ... }
   *   C.prototype = B.prototype;
   */

  function isSlot(t) {
    return (t.kind === TRAIT_Slot ||
        t.kind === TRAIT_Const);
  }

  function isMethod(t) {
    return (t.kind === TRAIT_Method ||
        t.kind === TRAIT_Setter ||
        t.kind === TRAIT_Setter);
  }


  function Compiler(abc) {
    this.abc = abc;
  }

  var Cp = Compiler.prototype;

  Cp.compileClass = function compileClass(emit, classInfo) {
    var instanceInfo = classInfo.instance;
    var itraits = instanceInfo.traits;
    var className = instanceInfo.name.getName();

    emit.thunk(function (emit) {
      emit.func(className, 0, function (emit) {
        itraits.filter(isSlot).forEach(this.compileSlot.bind(this, emit));
      });
      emit.decl();

      /*
      emit.expr("abc.classes[" + i + "]");
      emit.expr(className + ".class");
      emit.assign();
      */

      if (instanceInfo.superName) {
        emit.findProp(localScope, instanceInfo.superName);
        emit.expr(className + ".super");
        emit.assign();
      }

      emit.varDecl(proto);

      emit.expr("new " + className + ".super");
      emit.expr(proto);
      emit.assign();

      emit.expr(className);
      emit.expr(proto + ".constructor");
      emit.assign();

      emit.expr(className + ".class.instance.traits");
      emit.expr(proto + ".traits");
      emit.assign();

      /* The instance initializer. */
      var tmpEmit = new Emitter;
      this.compileMethod(tmpEmit, instanceInfo.init);
      emit.expr(tmpEmit.finish());
      emit.expr(proto + ".init");
      emit.assign();

      itraits.filter(isMethod).forEach(function (trait) {
        this.compileMethod(tmpEmit, trait.method);
        emit.expr(tmpEmit.finish());
        emit.setProp(proto, trait.name);
      });

      emit.expr(proto);
      emit.expr(className + "." + proto);
      emit.assign();

      /* The static initializer. */
      // compileCode(emit, classInfo.init.code);

      emit.expr(className);
      emit.ret();
    });
  };

  Cp.compileSlot = function compileSlot(emit, trait) {
    assert(trait.kind === TRAIT_Slot || trait.kind === TRAIT_Const);

    if (trait.kind === TRAIT_Slot) {
      emit.expr(defaultValue(trait.typeName));
      emit.setProp("this", trait.name);
    } else {
      /* Where's my quasiquote? */
      propDesc = { value: defaultValue(trait.typeName),
             writable: false,
             configurable: false };
      emit.expr(JSON.stringify(propDesc));
      emit.expr(mangleQName(traits.name));
      emit.expr("this");
      emit.expr("Object.defineProperty");
      emit.call(3);
      emit.stmt();
    }
  };

  Cp.compileMethod = function compileMethod(emit, method) {
    emit.func(method.name ? method.name.getName() : "", 0, function (emit) {
      emit.ret();
    });
    emit.decl();

    if (!method.codeAnalysis) {
      var analysis = new Analysis(method.code);
      analysis.analyzeControlFlow();

      method.codeAnalysis = analysis;
    }
  };

  Cp.compileTraits = function compileTraits(emit, traits) {
    for (var i = 0, j = traits.length; i < j; i++) {
      var trait = traits[i];

      switch (trait.kind) {
      case TRAIT_Slot:
      case TRAIT_Const:
        this.compileSlot(emit, trait);
        break;
      case TRAIT_Method:
      case TRAIT_Setter:
      case TRAIT_Getter:
        this.compileMethod(emit, trait.method);
        break;
      case TRAIT_Class:
        this.compileClass(emit, trait.class);
        break;
      default:
        unexpected();
      }
    }
  };

  Cp.compileScript = function compileScript(emit, script) {
    this.compileTraits(emit, script.traits);
    this.compileMethod(emit, script.init);
  };

  return Compiler;

})();

function compileAbc(abc) {
  var cc = new Compiler(abc);
  var emit = new Emitter;
  cc.compileScript(emit, abc.lastScript);
  return emit.finish();
}

function runScript(scope, abc, code) {
  /*
   * The compiled code requires a scope object named 'scope' and an abcFile
   * named 'abc' in scope!
   */
  return eval(code);
}

/*
function compileAbc(abc) {
  var constants = abc.constants;
  var strings = constants.strings;
  var names = constants.names;
  var scripts = abc.scripts;

  for (var i = 0, j = scripts.length; i < j; i++)
    compileScript(scripts[i]);

  function compileBody(body) {
    var maxStack = body.maxStack;
    var localCount = body.localCount;
    var src = "";

    src += "function f(ctx,";
    for (var i = 0; i < localCount; ++i)
      src += ("L" + i + ((i + 1 < localCount) ? "," : ""));
    src += ") {\n";
    src += "var "; // temporary
    for (var i = 0; i < maxStack; ++i)
      src += ("S" + i + ((i + 1 < maxStack) ? "," : ""));
    src += ";\n";
    src += "var label = 0;\n";
    src += "again: while (true) switch (label) {\n";
    src += "case 0:\n";

    function emit(code) {
      src += code;
      src += ";\n";
    }

    function local(n) {
      return "L" + n;
    }

    var sp = 0;

    function push() {
      return "S" + (sp++);
    }
    function pop() {
      return "S" + (--sp);
    }

    function assign(lval, rval) {
      emit(lval + "=" + rval);
    }

    var stream = new Stream(body.code);
    var start = stream.pos;

    function here() {
      return stream.pos - start;
    }
    function target() {
      var offset = stream.readS24();
      return here() + offset;
    }
    function if1(cond) {
      emit("if (" + cond + pop() + ") { label = " + target() + "; continue again; }");
    }
    function if2(neg, cond) {
      var v2 = pop(), v1 = pop();
      emit("if (" + neg + "(" + v1 + cond + v2 + ")) { label = " + target() + "; continue again; }");
    }
    function unary(expr) {
      var val = pop();
      assign(push(), expr.replace("$1", val, "g"));
    }
    function binary(expr) {
      var v2 = pop(), v1 = pop();
      assign(push(), expr.replace("$1", v1, "g").replace("$2", v2, "g"));
    }

    function quote(s) {
      return "\"" + s + "\"";
    }

    function popN(n) {
      var args = [];
      while (n--)
        args.push(pop());
      return args;
    }

    function multiname(index) {
      var mn = names[index ? index : stream.readU30()];
      if (!mn.name)
        emit("var name = " + pop());
      if (!mn.ns && !mn.nsset)
        emit("var ns = " + pop());
      return mn;
    }

    function mangle(ns, name) {
      return ns + "$" + name.replace("$", "_$", "g");
    }

    function propName(obj, mn) {
      if (mn.ns && mn.name)
        return mangle(mn.ns, mn.name);
      var ns = mn.ns ? quote(mn.ns) : (mn.nsset ? ("ctx.resolveNSSet(" + obj + "," + mn.idx + ")") : "ns");
      var name = mn.name ? quote(mn.name) : "name";
      return "ctx.mangle(" + ns + "," + name + ")";
    }

    function prop(obj, mn) {
      return obj + ((mn.ns && mn.name) ?
              "." + mangle(mn.ns, mn.name) :
              "[" + propName(obj, mn) + "]");
    }

    function call(fun, receiver, args) {
      return fun + "(" + args.reverse().join(",") + ")";
    }

    function construct(fun, args) {
      return "new " + call(fun, "(void 0)", args);
    }

    while (stream.remaining() > 0) {
      var h = here();
      if (h)
        src += "case " + h + ":\n";
      var op = stream.readU8();
      src += "// " + Number(op).toString(16) + "\n";
      switch (op) {
      case 0x02: // nop
        break;
      case 0x03: // throw
        emit("throw(" + pop() + ")");
        break;
      case 0x04: // getsuper
        var mn = multiname();
        var obj = pop();
        assign(push(), prop("ctx.super(" + obj + ")", mn));
        break;
      case 0x05: // setsuper
        var val = pop();
        var mn = multiname();
        var obj = pop();
        assign(prop("ctx.super(" + obj + ")", mn), val);
        break;
      case 0x08: // kill
        assign(local(stream.readU30()), "(void 0)");
        break;
      case 0x09: // label
        break;
      case 0x0c: // ifnlt
        if2("!", "<");
        break;
      case 0x0d: // ifnle
        if2("!", "<=");
        break;
      case 0x0e: // ifngt
        if2("!", ">");
        break;
      case 0x0f: // ifnge
        if2("!", ">=");
        break;
      case 0x10: // goto
        emit("label = " + target() + "; continue again");
        break;
      case 0x11: // iftrue
        if1("!!");
        break;
      case 0x12: // iffalse
        if1("!");
        break;
      case 0x13: // ifeq
        if2("", "==");
        break;
      case 0x14: // ifne
        if2("", "!=");
        break;
      case 0x15: // iflt
        if2("", "<");
        break;
      case 0x16: // ifle
        if2("", "<=");
        break;
      case 0x17: // ifgt
        if2("", ">");
        break;
      case 0x18: // ifge
        if2("", ">=");
        break;
      case 0x19: // ifstricteq
        if2("", "===");
        break;
      case 0x1a: // ifstrictne
        if2("", "!==");
        break;
      // case 0x1b: lookupswitch
      case 0x1c: // pushwith
        emit("ctx.pushwith(" + pop() + ")");
        break;
      case 0x1d: // popscope
        emit("ctx.popscope()");
        break;
      case 0x1e: // nextname
        var index = pop(), obj = pop();
        assign(push(), "nextname(" + obj + "," + index + ")");
        break;
      case 0x1f: // hasnext
        var index = pop(), obj = pop();
        assign(push(), "hasnext(" + obj + "," + index + ")");
        break;
      case 0x20: // pushnull
        assign(push(), "null");
        break;
      case 0x21: // pushundefined
        assign(push(), "undefined");
        break;
      case 0x23: // nextvalue
        assign(push(), "nextvalue(" + obj + "," + index + ")");
        break;
      case 0x24: // pushbyte
        assign(push(), stream.readU8());
        break;
      case 0x25: // pushshort
        assign(push(), stream.readU30());
        break;
      case 0x26: // pushtrue
      case 0x27: // pushfalse
        assign(push(), op == 0x26);
        break;
      case 0x28: // pushnan
        assign(push(), "NaN");
        break;
      case 0x29: // pop
        pop();
        break;
      case 0x2a: // dup
        var a = pop();
        assign(push(), a);
        assign(push(), a);
        break;
      case 0x2b: // swap
        var a = pop(), b = pop();
        assign(push(), a);
        assign(push(), b);
        break;
      case 0x2c: // pushstring
        assign(push(), quote(constants.strings[stream.readU30()]));
        break;
      case 0x2d: // pushint
        assign(push(), constants.int32[stream.readU30()]);
        break;
      case 0x2e: // pushuint
        assign(push(), constants.uint32[stream.readU30()]);
        break;
      case 0x2f: // pushdouble
        assign(push(), constants.doubles[stream.readU30()]);
        break;
      case 0x30: // pushscope
        emit("ctx.pushscope(" + pop() + ")");
        break;
      case 0x31: // pushnamespace
        assign(push(), constants.ns[stream.readU30()]);
        break;
      case 0x32: // hasnext2
        var obj = stream.readU30(), index = stream.readU30();
        assign(local(index), "ctx.hasnext2(" + local(obj) + "," + local(index) + ")");
        assign(local(obj), "ctx.hasnext2_obj");
        break;
      case 0x40: // newfunction
        assign(push(), "ctx.clone(" + stream.readU30() + ")");
        break;
      case 0x41: // call
        var argc = stream.readU30();
        var args = popN(argc);
        var receiver = pop();
        var fun = pop();
        assign(push(), call(fun, receiver, args));
        break;
      case 0x42: // construct
        var argc = stream.readU30();
        var args = popN(argc);
        var fun = pop();
        assign(push(), construct(fun, args));
        break;
      case 0x43: // callmethod
      case 0x44: // callstatic
      case 0x45: // callsuper
      case 0x4e: // callsupervoid
        var index = stream.readU30(), argc = stream.readU30();
        var args = popN(argc);
        var receiver = pop();
        switch (op) {
        case 0x43:
          var x = receiver + ".methods";
          break;
        case 0x44:
          var x = "ctx.methods";
          break;
        case 0x45:
        case 0x46:
          var x = "ctx.super(" + receiver + ")" + ".methods";
          break;
        }
        var x = call(x + "[" + index + "]", receiver, args);
        (op == 0x46) ? emit(x) : assign(push(), x);
        break;
      case 0x46: // callproperty
      case 0x4c: // callproplex
      case 0x4f: // callpropvoid
        var index = stream.readU30(), argc = stream.readU30();
        var args = popN(argc);
        var mn = multiname(index);
        var obj = pop();
        var x = call(prop(obj, mn), obj, args);
        (op == 0x4f) ? emit(x) : assign(push(), x);
        break;
      case 0x47: // returnvoid
        emit("return");
        break;
      case 0x48: // return value
        emit("return " + pop());
        break;
      case 0x49: // constructsuper
        var argc = stream.readU30();
        var args = popN(argc);
        var obj = pop();
        emit(call("ctx.super(" + obj + ").constructor", obj, args));
        break;
      case 0x4a: // constructprop
        var index = stream.readU30(), argc = stream.readU30();
        var args = popN(argc);
        var mn = multiname(index);
        var obj = pop();
        assign(push(), construct(prop(obj, mn), args));
        break;
      case 0x55: // newobject
        var argc = stream.readU30();
        var x = "";
        while (argc--) {
          var val = pop();
          x = "obj[" + pop() + "] = " + val + "; " + x;
        }
        assign(push(), "var obj = ({}); " + x + "obj");
        break;
      case 0x56: // newarray
        var argc = stream.readU30();
        assign(push(), "[" + popN(argc).reverse().join(",") + "]");
        break;
      case 0x57: // newactivation
        assign(push(), "ctx.newactivation()");
        break;
      case 0x58: // newclass
        var index = stream.readU30();
        assign(push(), "ctx.newclass(" + stream.readU30() + "," + pop());
        break;
      case 0x59: // getdescendants
        var mn = multiname();
        var obj = pop();
        assign(push(), "ctx.getdescendants(" + obj + "," + propName(obj, mn) + ")");
        break;
      case 0x5a: // newcatch
        assign(push(), "ctx.newcatch(" + stream.readU30() + ")");
        break;
      case 0x5d: // findpropstrict
      case 0x5e: // findproperty
        var mn = multiname();
        var helper = (op == 0x5d) ? "findpropstrict" : "findproperty";
        assign(push(), "ctx." + helper + "(" + propName("ctx.scope", mn) + ")");
        break;
      case 0x60: // getlex
        var mn = multiname();
        assign(push(), prop("ctx.scope", mn));
        break;
      case 0x61: // setproperty
        var val = pop();
        var mn = multiname();
        var obj = pop();
        assign(prop(obj, mn), val);
        break;
      case 0x62: // getlocal
        assign(push(), local(stream.readU30()));
        break;
      case 0x63: // setlocal
        assign(local(stream.readU30()), pop());
        break;
      case 0x64: // getglobalscope
        assign(push(), "ctx.global");
        break;
      case 0x65: // getscopeobject
        assign(push(), "ctx.getscopeobject[" + stream.readU30() + "]");
        break;
      case 0x66: // getproperty
      case 0x67: // initproperty
        var mn = multiname();
        var obj = pop();
        assign(push(), prop(obj, mn));
        break;
      case 0x6a: // deleteproperty
        var mn = multiname();
        var obj = pop();
        emit("delete " + prop(obj, mn));
        break;
      case 0x6c: // getslot
        var obj = pop();
        assign(push(), obj + ".slot" + stream.readU30());
        break;
      case 0x6d: // setslot
        var val = pop();
        var obj = pop();
        assign(obj + ".slot" + stream.readU30(), val);
        break;
      case 0x6e: // getglobalslot
        assign(push(), "ctx.global.slot" + stream.readU30());
        break;
      case 0x6f: // setglobalslot
        emit("ctx.global.slot" + stream.readU30(), pop());
        break;
      case 0x70: // convert_s
      case 0x71: // esc_xelem
      case 0x72: // esc_xattr
        unary("'' + $1");
        break;
      case 0x73: // convert_i
        unary("0|$1");
        break;
      case 0x74: // convert_u
        unary("$1 >>> 0");
        break;
      case 0x75: // convert_d
        unary("0 + $1");
        break;
      case 0x76: // convert_b
        unary("$1?true:false");
        break;
      case 0x77: // convert_o
        unary("Object.valueOf.call($1)");
        break;
      case 0x78: // checkfilter
        unary("($1.(0),$1)");
        break;
      case 0x80: // coerce
        var val = pop();
        var mn = multiname();
        assign(push(), "ctx.coerce(" + val + "," + quote(propName(null, mn)) + ")");
        break;
      case 0x82: // coerce_a
        break;
      case 0x85: // coerce_s
        unary("($1 == null || $1 == undefined) ? null : (\"\" + $1)");
        break;
      case 0x86: // astype
        var val = pop();
        var mn = multiname();
        assign(push(), "ctx.astype(" + val + "," + quote(propName(null, mn)) + ")");
        break;
      case 0x87: // astypelate
        var type = pop();
        var val = pop();
        assign(push(), "ctx.astypelate(" + val + "," + type);
        break;
      case 0x90: // negate
        unary("-$1");
        break;
      case 0x91: // increment
        unary("$1 + 1");
        break;
      case 0x92: // inclocal
        emit("++" + local(stream.readU30()));
        break;
      case 0x93: // decrement
        unary("$1 - 1");
        break;
      case 0x94: // declocal
        emit("--" + local(stream.readU30()));
        break;
      case 0x95: // typeof
        unary("typeof $1");
        break;
      case 0x96: // not
        unary("!!$1");
        break;
      case 0x97: // bitnot
        unary("~$1");
        break;
      case 0xa0: // add
        binary("$1+$2");
        break;
      case 0xa1: // substract
        binary("$1-$2");
        break;
      case 0xa2: // multiply
        binary("$1*$2");
        break;
      case 0xa3: // divide
        binary("$1/$2");
        break;
      case 0xa4: // modulo
        binary("$1%$2");
        break;
      case 0xa5: // lshift
        binary("$1<<$2");
        break;
      case 0xa6: // rshift
        binary("$1>>$2");
        break;
      case 0xa7: // urshift
        binary("$1>>>$2");
        break;
      case 0xa8: // bitand
        binary("$1&$2");
        break;
      case 0xa9: // bitor
        binary("$1|$2");
        break;
      case 0xaa: // bitxor
        binary("$1^$2");
        break;
      case 0xab: // equals
        binary("$1==$2");
        break;
      case 0xac: // strictequals
        binary("$1===$2");
        break;
      case 0xad: // lessthan
        binary("$1<$2");
        break;
      case 0xae: // lessequals
        binary("$1<=$2");
        break;
      case 0xaf: // greaterequals
        binary("$1>=$2");
        break;
      case 0xb1: // instanceof
        binary("$1 instanceof $2");
        break;
      case 0xb2: // istype
        var mn = multiname();
        unary("ctx.istype($1," + quote(propName(null, mn)) + ")");
        break;
      case 0xb3: // istypelate
        var type = pop();
        unary("ctx.istype($1," + type);
        break;
      case 0xb4: // in
        binary("$1 in $2");
        break;
      case 0xc0: // increment_i
        unary("(0|$1)+1");
        break;
      case 0xc1: // decrement_i
        unary("(0|$1)-1");
        break;
      case 0xc2: // inclocal_i
        var ref = stream.readU30();
        emit(ref + "|=0");
        emit("++" + ref);
        break;
      case 0xc3: // declocal_i
        var ref = stream.readU30();
        emit(ref + "|=0");
        emit("--" + ref);
        break;
      case 0xc4: // negate_i
        unary("-(0|$1)");
        break;
      case 0xc5: // add_i
        binary("(0|$1)+(0|$2)");
        break;
      case 0xc6: // subtract_i
        binary("(0|$1)-(0|$2)");
        break;
      case 0xc7: // multiply_i
        binary("(0|$1)*(0|$2)");
        break;
      case 0xd0: case 0xd1: case 0xd2: case 0xd3: // getlocalX
        assign(push(), local(op - 0xd0));
        break;
      case 0xd4: case 0xd5: case 0xd6: case 0xd7: // setlocalX
        assign(local(op - 0xd4), pop());
        break;
      case 0xef:
        stream.readU8(); // debug_type
        stream.readU30(); // index
        stream.readU8(); // reg
        stream.readU30(); // extra
        break;
      case 0xf0:
        stream.readU30(); // linenum
        break;
      case 0xf1:
        stream.readU30(); // debugfile
        break;
      default:
        print(src);
        throw new Error("not implemented: " + Number(op).toString(16));
      }
    }
    src += "}\n}\n";
    print(src);
    return src;
  }

  // Compile all method bodies
  var methodBodies = abc.methodBodies;
  var length = methodBodies.length;
  /*
  for (var n = 0; n < length; ++n)
    methodBodies[n].compiled = Function(compileBody(methodBodies[n]));

  //compile(methods[scripts[0].init]);
  return abc;
}
*/