load("../util.js");
load("../avm2-runtime.js");
load("../DataView.js");
load("../constants.js");
load("../opcodes.js");
load("../parser.js");
load("../analyze.js");
load("../compiler.js");
load("../disassembler.js");
load("../interpreter.js");

if (arguments.length == 0) {
    printUsage();
    quit();
}

function printUsage() {
    print("avm: [-d | -c | -x] file");
    print("      -d = Disassemble .abc file.");
    print("      -c = Compile .abc file to .js.");
    print("      -x = Execute .abc file.");
    print("      -q = Quiet.");
}

var file = arguments[arguments.length - 1];
var options = arguments.slice(0, arguments.length - 1);

var disassemble = options.indexOf("-d") >= 0;
var compile = options.indexOf("-c") >= 0;
var execute = options.indexOf("-x") >= 0;
var quiet = options.indexOf("-q") >= 0;

if (quiet) {
    traceExecution = null;
}

var abc = new AbcFile(snarf(file, "binary"));
var methodBodies = abc.methodBodies;

if (disassemble) {
    abc.trace(new IndentingWriter(false));
}

if (compile) {
    print(compileAbc(abc));

    if (!quiet) {
        /* Spew analysis information if not quiet. */
        var writer = new IndentingWriter(false);
        writer.enter("analyses {");
        abc.methods.forEach(function (method) {
            if (method.codeAnalysis) {
                method.codeAnalysis.trace(writer);
            }
        });
        writer.leave("}");
    }
}

if (execute) {
    interpretAbc(abc);
}
