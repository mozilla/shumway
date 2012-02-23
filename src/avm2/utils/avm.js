load("../util.js");
load("../avm2-runtime.js");
load("../DataView.js");
load("../constants.js");
load("../opcodes.js");
load("../parser.js");
load("../analyze.js");
load("../compiler.js");
load("../fuzzer.js");
load("../viz.js");
load("../disassembler.js");
load("../interpreter.js");

if (arguments.length == 0) {
  printUsage();
  quit();
}

function printUsage() {
  print("avm: [-d | -c | -x | -v] file");
  print("    -d = Disassemble .abc file.");
  print("    -c = Compile .abc file to .js.");
  print("    -x = Execute .abc file.");
  print("    -v = Generate GraphViz output.");
  print("    -z = Generate random .as source file.");
  print("    -q = Quiet.");
}

var file = arguments[arguments.length - 1];
var options = arguments.slice(0, arguments.length - 1);

var disassemble = options.indexOf("-d") >= 0;
var compile = options.indexOf("-c") >= 0;
var execute = options.indexOf("-x") >= 0;
var quiet = options.indexOf("-q") >= 0;
var viz = options.indexOf("-v") >= 0;
var fuzz = options.indexOf("-z") >= 0;

if (fuzz) {
  var writer = new IndentingWriter(false);
  var fuzzer = new Fuzzer(writer);
}

if (quiet) {
  traceExecution = null;
}

var abc = new AbcFile(snarf(file, "binary"));
var methodBodies = abc.methodBodies;

if (disassemble) {
  abc.trace(new IndentingWriter(false));
}

if (viz) {

  var writer = new IndentingWriter(false);
  writer.enter("digraph {");
  var graph = 0;
  var opts = { chokeOnClusterfucks: true,
               splitLoops: true };
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

if (compile) {
  try {
    print(compileAbc(abc));
  } catch(e) {
    print(e);
    print("");
    print(e.stack);
  }

  if (!quiet) {
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

if (execute) {
  interpretAbc(abc);
}
