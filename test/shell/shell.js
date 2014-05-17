

/**
 * Load Bare AVM2 Dependencies
 */

var homePath = "../../";

load(homePath + "src/avm2/settings.js");
load(homePath + "src/avm2/global.js");
load(homePath + "src/utilities.js");
load(homePath + "src/options.js");
load(homePath + "src/settings.js");
load(homePath + "src/avm2/avm2Util.js");

var IndentingWriter = Shumway.IndentingWriter;
var stdout = new IndentingWriter();
var ArgumentParser = Shumway.Options.ArgumentParser;
var Option = Shumway.Options.Option;
var OptionSet = Shumway.Options.OptionSet;

var argumentParser = new ArgumentParser();
var systemOptions = new OptionSet("System Options");
var shellOptions = systemOptions.register(new OptionSet("Shell Options"));
var alwaysInterpret = shellOptions.register(new Option("i", "alwaysInterpret", "boolean", false, "always interpret"));

load(homePath + "src/metrics.js");
load(homePath + "src/avm2/constants.js");
load(homePath + "src/avm2/opcodes.js");
load(homePath + "src/avm2/parser.js");
load(homePath + "src/avm2/domain.js");

var AbcFile = Shumway.AVM2.ABC.AbcFile;
var AbcStream = Shumway.AVM2.ABC.AbcStream;
var ConstantPool = Shumway.AVM2.ABC.ConstantPool;
var ClassInfo = Shumway.AVM2.ABC.ClassInfo;
var MetaDataInfo = Shumway.AVM2.ABC.MetaDataInfo;
var InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
var ScriptInfo = Shumway.AVM2.ABC.ScriptInfo;
var Trait = Shumway.AVM2.ABC.Trait;
var MethodInfo = Shumway.AVM2.ABC.MethodInfo;
var Multiname = Shumway.AVM2.ABC.Multiname;
var ASNamespace = Shumway.AVM2.ABC.Namespace;
var EXECUTION_MODE = Shumway.AVM2.Runtime.ExecutionMode;

var SecurityDomain = Shumway.AVM2.Runtime.SecurityDomain;

/* Old style script arguments */
if (typeof scriptArgs === "undefined") {
  scriptArgs = arguments;
}

var originalArgs = scriptArgs.slice(0);

function initializeVM() {
  var securityDomain = new SecurityDomain("compartment.js");
  var compartment = securityDomain.compartment;
  var argumentParser = new compartment.ArgumentParser();
  argumentParser.addBoundOptionSet(compartment.systemOptions);
  argumentParser.parse(originalArgs.slice(0));
  var sysMode = alwaysInterpret.value ? EXECUTION_MODE.INTERPRET : EXECUTION_MODE.COMPILE;
  var appMode = alwaysInterpret.value ? EXECUTION_MODE.INTERPRET : EXECUTION_MODE.COMPILE;
  securityDomain.initializeShell(sysMode, appMode);
  return securityDomain;
}

var securityDomain = initializeVM();

var libraryPath = {
  abcs: homePath + "playerglobal/playerglobal.abcs",
  catalog: homePath + "playerglobal/playerglobal.json"
}

securityDomain.compartment.AVM2.loadPlayerglobal(libraryPath.abcs, libraryPath.catalog);

securityDomain.compartment.eval("print(flash.geom.Rectangle);");

