load("../util.js");
load("../avm2-runtime.js");
load("../DataView.js");
load("../constants.js");
load("../opcodes.js");
load("../parser.js");
load("../compiler.js");
load("../interpreter.js");
load("../disassembler.js");

if (arguments.length == 0) {
    printUsage();
    quit();
}

function printUsage() {
    print("avm: [-d] file");
    print("      -d = Disassemble .abc file.");
    print("      -x = Execute .abc file.");
}

var file = arguments[arguments.length - 1];
var options = arguments.slice(0, arguments.length - 1);

var disassemble = options.indexOf("-d") >= 0;
var execute = options.indexOf("-x") >= 0;


var abc = parseAbcFile(snarf(file, "binary"));
var writer = new IndentingWriter(false);
var methodBodies = abc.methodBodies;

if (disassemble) {
    traceConstantPool(writer, abc.constantPool);
    for (var i = 0; i < methodBodies.length; i++) {
        traceMethodBodyInfo(writer, abc.constantPool, methodBodies[i]);
    }
}

if (execute) {
    interpretAbc(abc);
}

/*
try {
    var abc = parseAbcFile(snarf(arguments[0], "binary"));
    print("Constant pool for: " + arguments[0]);
    print(JSON.stringify(abc.constantPool, null, 2));
} catch (e) {
    print(e);
    print(e.stack);
}
*/