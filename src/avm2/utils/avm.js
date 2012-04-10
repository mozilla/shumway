load("../util.js");

var options = new OptionSet("option(s)");

var disassemble = options.register(new Option("disassemble", "d", false, "disassemble"));
var traceLevel = options.register(new Option("traceLevel", "t", 0, "trace level"));
var traceGraphViz = options.register(new Option("traceGraphViz", "v", false, "trace GraphViz output"));
var execute = options.register(new Option("execute", "x", false, "execute"));
var alwaysInterpret = options.register(new Option("alwaysInterpret", "i", false, "always interpret"));
var help = options.register(new Option("help", "h", false, "prints help"));

load("../DataView.js");
load("../constants.js");
load("../opcodes.js");
load("../parser.js");
load("../disassembler.js");
load("../analyze.js");
load("../compiler.js");
load("../native.js");
load("../runtime.js");
load("../fuzzer.js");
load("../viz.js");
load("../interpreter.js");

/* TODO: Load SWF code to parse ABCs from playerglobals.swf.
var swfScripts = 'util.js,swf.js,types.js,structs.js,tags.js,inflate.js,stream.js,templates.js,' +
                 'generator.js,parser.js,bitmap.js,font.js,image.js,label.js,shape.js,text.js,cast.js';

load.apply(null, swfScripts.split(',').map(function (file) { return "../../swf/" + file; }));
*/

if (arguments.length === 0) {
  printUsage();
  quit();
}

function printUsage() {
  print("avm: [option(s)] file");
  options.trace(new IndentingWriter());
}

var file = arguments[arguments.length - 1];
options.parse(arguments.slice(0, arguments.length - 1));

if (help.value) {
  printUsage();
  quit();
}

var abc = new AbcFile(snarf(file, "binary"), file);
var methodBodies = abc.methodBodies;

if (disassemble.value) {
  abc.trace(new IndentingWriter(false));
}

if (traceGraphViz.value) {
  var writer = new IndentingWriter(false);
  writer.enter("digraph {");
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
  writer.leave("}");
}

if (execute.value) {
  // for (var i = 0; i < 375; i++) {
  //   var libPath = "../playerGlobal/library-" + i + ".abc";
  //   prepareAbc(new AbcFile(snarf(libPath, "binary"), libPath, true), ALWAYS_INTERPRET);
  // }
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
    var writer = new IndentingWriter(false);
    writer.enter("analyses {");
    abc.methods.forEach(function (method) {
      if (method.analysis) {
        method.analysis.trace(writer);
      }
    });
    writer.leave("}");
  }
}
