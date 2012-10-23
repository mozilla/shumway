load("../../../lib/DataView.js/DataView.js");

/**
 * Load AVM2 Dependencies
 */

load("../util.js");

var options; load("../options.js");
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
var compileSys = shellOptions.register(new Option("csys", "compileSystemDomain", "boolean", false, "compile system domain"));
var help = shellOptions.register(new Option("h", "help", "boolean", false, "prints help"));
var traceMetrics = shellOptions.register(new Option("tm", "traceMetrics", "boolean", false, "prints collected metrics"));
var traceJson = shellOptions.register(new Option("tj", "traceJson", "boolean", false, "prints vm information in JSON format"));

var metrics; load("../metrics.js");
var Timer = metrics.Timer;
var Counter = new metrics.Counter();

Timer.start("Loading VM");
load("../constants.js");
load("../errors.js");
load("../opcodes.js");
load("../parser.js");
load("../disassembler.js");
load("../analyze.js");

Timer.start("Loading Compiler");
var estransform; load("../compiler/lljs/src/estransform.js");
var escodegen; load("../compiler/lljs/src/escodegen.js");
load("../compiler/inferrer.js");
load("../compiler/compiler.js");
Timer.stop();


load("../domain.js");
load("../runtime.js");
load("../viz.js");
load("../interpreter.js");
load("../native.js");
load("../vm.js");
Timer.stop();

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

var file = argumentParser.addArgument("file", "file", "string", {
  positional: true
});

var argv;

try {
  argv = argumentParser.parse(arguments);
} catch (x) {
  stdout.writeLn(x.message);
  quit();
}

Counter.setEnabled(traceMetrics.value);

function grabABC(abcname) {
  var filename = abcname + ".abc";
  var stream = snarf("../generated/" + abcname + "/" + filename, "binary");
  return new AbcFile(stream, filename);
}

var avm2;
if (execute.value) {
  var sysMode = alwaysInterpret.value ? EXECUTION_MODE.INTERPRET : (compileSys.value ? null : EXECUTION_MODE.INTERPRET);
  var appMode = alwaysInterpret.value ? EXECUTION_MODE.INTERPRET : null;
  avm2 = new AVM2(sysMode, appMode);
  Timer.start("Initialize");
  avm2.systemDomain.executeAbc(grabABC("builtin"));
  avm2.systemDomain.executeAbc(grabABC("shell"));
  avm2.systemDomain.installNative("getArgv", function() {
    return argv;
  });
  avm2.systemDomain.executeAbc(grabABC("avmplus"));
  Timer.stop();
}

if (file.value.endsWith(".swf")) {
  SWF.parse(snarf(file.value, "binary"), {
    oncomplete: function(result) {
      var tags = result.tags;
      for (var i = 0, n = tags.length; i < n; i++) {
        var tag = tags[i];
        if (tag.type === "abc") {
          processAbc(new AbcFile(tag.data, file.value + " [Tag ID: " + i + "]"));
        } else if (tag.type === "symbols") {
          for (var j = tag.references.length - 1; j >= 0; j--) {
            if (tag.references[j].id === 0) {
              avm2.applicationDomain.getProperty(
                Multiname.fromSimpleName(tag.references[j].name),
                true, true
              );
              break;
            }
          }
        }
      }
    }
  });
} else {
  release || assert(file.value.endsWith(".abc"));
  processAbc(new AbcFile(snarf(file.value, "binary"), file.value));
}

function processAbc(abc) {
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
        method.analysis.traceCFG(stdout, method, "G" + graph + "_");
        graph += 1;
      }
    });
    stdout.leave("}");
  }

  if (execute.value) {
    release || assert(avm2);
    try {
      avm2.applicationDomain.executeAbc(abc);
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
}

if (traceMetrics.value) {
  metrics.Timer.trace(stdout, traceJson.value);
  Counter.trace(stdout, traceJson.value);
}
