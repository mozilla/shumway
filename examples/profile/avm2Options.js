var Counter = new metrics.Counter(true);
var Timer = metrics.Timer;
var Option = options.Option;
var OptionSet = options.OptionSet;
var systemOptions = new OptionSet("System Options");
var disassemble = systemOptions.register(new Option("d", "disassemble", "boolean", false, "disassemble"));
var traceLevel = systemOptions.register(new Option("t", "traceLevel", "number", 0, "trace level"));