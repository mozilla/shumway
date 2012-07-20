load("../../../lib/DataView.js/DataView.js");

/**
 * Load SWF Dependencies
 */
var SWF = {};
load("../../swf/util.js");
load("../../swf/types.js");
load("../../swf/structs.js");
load("../../swf/tags.js");
load("../../swf/inflate.js");
load("../../swf/stream.js");
load("../../swf/templates.js");
load("../../swf/generator.js");
load("../../swf/parser.js");
load("../../swf/bitmap.js");
load("../../swf/button.js");
load("../../swf/font.js");
load("../../swf/image.js");
load("../../swf/label.js");
load("../../swf/shape.js");
load("../../swf/text.js");

/**
 * Load AVM2 Dependencies
 */

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
var loadPlayerGlobal = shellOptions.register(new Option("p", "loadPlayerGlobal", "boolean", false, "load player global"));
var help = shellOptions.register(new Option("h", "help", "boolean", false, "prints help"));
var traceMetrics = shellOptions.register(new Option("tm", "traceMetrics", "boolean", false, "prints collected metrics"));

load("../constants.js");
load("../opcodes.js");
load("../parser.js");
load("../disassembler.js");
load("../analyze.js");
load("../metrics.js");

var Timer = metrics.Timer;

load("../compiler/lljs/src/estransform.js");
load("../compiler/lljs/src/escodegen.js");
load("../compiler/verifier.js");
load("../compiler/compiler.js");

load("../domain.js");
load("../runtime.js");
load("../viz.js");
load("../interpreter.js");
load("../native.js");

load("../vm.js");

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

function grabABC(abcname) {
    return snarf("../generated/" + abcname + "/" + abcname + ".abc", "binary");
}

function installAvmPlus(vm) {
  var domain = vm.systemDomain;
  domain.installNative("getArgv", function() {
    return argv;
  });

  domain.executeAbc(new AbcFile(grabABC("avmplus"), "avmplus.abc"));
}

var vm;
if (execute.value) {
  var sysMode = alwaysInterpret.value ? ALWAYS_INTERPRET : null;
  var appMode = alwaysInterpret.value ? ALWAYS_INTERPRET : null;
  vm = new AVM2(grabABC("builtin"), sysMode, appMode);
  installAvmPlus(vm);
  if (loadPlayerGlobal.value) {
    vm.loadPlayerGlobal(snarf("../generated/playerGlobal.swf", "binary"));
  } else {
    vm.systemDomain.executeAbc(new AbcFile(grabABC("shell"), "shell.abc"));
  }
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
              vm.applicationDomain.getProperty(
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
  assert(file.value.endsWith(".abc"));
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
    assert(vm);
    try {
      vm.applicationDomain.executeAbc(abc);
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
  metrics.Timer.trace(stdout);
}
