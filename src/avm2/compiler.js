function mangleQName(multiname) {
  assert(multiname.isQName());
  return multiname.getNamespace(0) + "$" + multiname.getName();
}

var Compiler = (function () {

  var C = Control;

  C.LabeledBreak.prototype.compile = function (mcx) {
    notImplemented();
  };

  C.LabeledContinue.prototype.compile = function (mcx) {
    notImplemented();
  };

  C.Break.compile = function (mcx) {
    notImplemented();
  };

  C.Continue.compile = function (mcx) {
    notImplemented();
  };

  C.Return.compile = function (mcx) {
    notImplemented();
  };

  C.Clusterfuck.prototype.compile = function (mcx) {
    notImplemented();
  };

  C.Seq.prototype.compile = function (mcx) {
    notImplemented();
  };

  var LoopCompiler = {
    compile: function (mcx) {
      notImplemented();
    }
  };

  C.Loop.prototype.compile = function (mcx) {
    var worklist = mcx.worklist;

    this.exit && worklist.push(this.exit);
    worklist.push(LoopCompiler);
    worklist.push(this.body);
  };

  var IfCompiler = {
    compile: function (mcx) {
      notImplemented();
    }
  };

  var IfElseCompiler = {
    compile: function (mcx) {
      notImplemented();
    }
  };

  C.If.prototype.compile = function (mcx) {
    var worklist = mcx.worklist;

    this.exit && worklist.push(this.exit);
    if (this.else) {
      worklist.push(IfElseCompiler);
      worklist.push(this.else);
    } else {
      worklist.push(IfCompiler);
    }
    worklist.push(this.then);
  };

  function MethodCompilerContext(method) {
    this.worklist = [method.codeAnalysis.controlTree];
    this.blocks = [];
  }

  function Compiler(abc) {
    this.abc = abc;
  }

  var Cp = Compiler.prototype;

  Cp.compileMethod = function compileMethod(method) {
    assert(method.codeAnalysis);
    var mcx = new MethodCompilerContext(method);
    var worklist = mcx.worklist;
    var b;
    while (b = worklist.pop()) {
      b.compile(mcx);
    }
  }

  return Compiler;

})();

// :FIXME: Temporary driver.
function compileAbc(abc) {
  var method = abc.lastScript.init;
  method.codeAnalysis = new Analysis(method.code);
  method.codeAnalysis.analyzeControlFlow();
}