module Shumway.AVM2 {
  import Option = Shumway.Options.Option;
  import OptionSet = Shumway.Options.OptionSet;

  declare var shumwayOptions: OptionSet;

  var avm2Options = shumwayOptions.register(new OptionSet("AVM2"));

  export module Runtime {
    var options = avm2Options.register(new OptionSet("Runtime"));
    export var traceExecution = options.register(new Option("tx", "traceExecution", "number", 0, "trace script execution", { choices: { "off":0, "normal":2, "verbose":3 } }));
    export var traceCallExecution = options.register(new Option("txc", "traceCallExecution", "number", 0, "trace call execution", { choices: { "off":0, "normal":1, "verbose":2 } }));
    export var traceFunctions = options.register(new Option("t", "traceFunctions", "number", 0, "trace functions", { choices: { "off":0, "compiled":1, "compiled & abc":2 } }));
    export var traceClasses = options.register(new Option("tc", "traceClasses", "boolean", false, "trace class creation"));
    export var traceDomain = options.register(new Option("td", "traceDomain", "boolean", false, "trace domain property access"));
    export var debuggerMode = options.register(new Option("db", "debuggerMode", "boolean", true, "enable debugger mode"));

    export var functionBreak = new Option("fb", "functionBreak", "number", -1, "Inserts a debugBreak at function index #");
    export var compileOnly = new Option("co", "compileOnly", "number", -1, "Compiles only function number");
    export var compileUntil = new Option("cu", "compileUntil", "number", -1, "Compiles only until a function number");

    export var globalMultinameAnalysis = options.register(new Option("ga", "globalMultinameAnalysis", "boolean", false, "Global multiname analysis."));
    export var codeCaching = options.register(new Option("cc", "codeCaching", "boolean", false, "Enable code caching."));

    export var compilerEnableExceptions = options.register(new Option("cex", "exceptions", "boolean", false, "Compile functions with catch blocks."));
    export var compilerMaximumMethodSize = options.register(new Option("cmms", "maximumMethodSize", "number", 4 * 1024, "Compiler maximum method size."));

    export enum ExecutionMode {
      INTERPRET   = 0x1,
      COMPILE     = 0x2
    }
  }

  export module Compiler {
    export var options = avm2Options.register(new OptionSet("Compiler"));
    export var traceLevel = options.register(new Option("tc4", "tc4", "number", 0, "Compiler Trace Level"));
    export var breakAt = options.register(new Option("", "breakAt", "string", "", "Set a break point at methods whose qualified name matches this string."));
  }

  export module Verifier {
    export var options = avm2Options.register(new OptionSet("Verifier"));
    export var enabled = options.register(new Option("verifier", "verifier", "boolean", false, "Enable verifier."));
    export var traceLevel = options.register(new Option("tv", "tv", "number", 0, "Verifier Trace Level"));
  }
}