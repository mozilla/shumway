load("../util.js");
load("../options.js");

var stdout = new IndentingWriter();

var ArgumentParser = options.ArgumentParser;
var Option = options.Option;
var OptionSet = options.OptionSet;

var argumentParser = new ArgumentParser();

var systemOptions = new OptionSet("System Options");
var shellOptions = systemOptions.register(new OptionSet("AVM2 Shell Options"));
var disassemble = shellOptions.register(new Option("d", "disassemble", "boolean", false, "disassemble"));
var traceLevel = shellOptions.register(new Option("t", "traceLevel", "number", 0, "trace level"));
var traceGraphViz = shellOptions.register(new Option("v", "traceGraphViz" , "boolean", false, "trace GraphViz output"));
var execute = shellOptions.register(new Option("x", "execute", "boolean", false, "execute"));
var alwaysInterpret = shellOptions.register(new Option("i", "alwaysInterpret", "boolean", false, "always interpret"));
var help = shellOptions.register(new Option("h", "help", "boolean", false, "prints help"));
var traceMetrics = shellOptions.register(new Option("tm", "traceMetrics", "boolean", false, "prints collected metrics"));

load("../../../lib/DataView.js/DataView.js");

load("../constants.js");
load("../opcodes.js");
load("../parser.js");
load("../disassembler.js");
load("../analyze.js");
load("../metrics.js");

var Timer = metrics.Timer;

load("../compiler/lljs/src/estransform.js");
load("../compiler/lljs/src/escodegen.js");
load("../compiler/compiler.js");

load("../native.js");

load("../runtime.js");
load("../fuzzer.js");
load("../viz.js");
load("../interpreter.js");

argumentParser.addBoundOptionSet(systemOptions);

function printUsage() {
  stdout.writeLn("avm.js " + argumentParser.getUsage());
}

argumentParser.addArgument("h", "help", "boolean", {parse: function (x) {
  printUsage();
}});

argumentParser.addArgument("to", "traceOptions", "boolean", {parse: function (x) {
  systemOptions.trace(stdout);
}});

var abcFile = argumentParser.addArgument("abc", "abcFile", "string", {
  positional: true
});

try {
  argumentParser.parse(arguments);
} catch (x) {
  stdout.writeLn(x.message);
  quit();
}

var abc = new AbcFile(snarf(abcFile.value, "binary"), abcFile.value);
var methodBodies = abc.methodBodies;

if (disassemble.value) {
  abc.trace(stdout);
}

if (traceGraphViz.value) {
  stdout.enter("digraph {");
  var graph = 0;
  var opts = { massage: true };
  abc.methods.forEach(function (method) {
    method.analysis = new Analysis(method, opts);
    method.analysis.analyzeControlFlow();
    method.analysis.restructureControlFlow();
    if (method.analysis) {
      method.analysis.traceCFG(writer, method, "G" + graph + "_");
      graph += 1;
    }
  });
  stdout.leave("}");
}

if (execute.value) {
  try {
    executeAbc(new AbcFile(snarf("../generated/builtin.abc", "binary"), "builtin.abc", true), ALWAYS_INTERPRET);
    executeAbc(new AbcFile(snarf("../generated/playerGlobal.abc", "binary"), "playerGlobal.abc", true), ALWAYS_INTERPRET);

    var mode;
    if (alwaysInterpret.value) {
      mode = ALWAYS_INTERPRET;
    }
    executeAbc(abc, mode);
  } catch(e) {
    print(e);
    print("");
    print(e.stack);
  }

  if (traceLevel.value > 4) {
    /* Spew analysis information if not quiet. */
    stdout.enter("analyses {");
    abc.methods.forEach(function (method) {
      if (method.analysis) {
        method.analysis.trace(stdout);
      }
    });
    stdout.leave("}");
  }
}

if (traceMetrics.value) {
  metrics.Timer.trace(stdout);
}
