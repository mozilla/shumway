/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var jsGlobal = (function() { return this || (1, eval)('this'); })();

var console = {
  time: function (name) {
    Timer.start(name)
  },
  timeEnd: function (name) {
    Timer.stop(name)
  },
  warn: function (s) {
    if (traceWarnings.value) {
      print(RED + s + ENDC);
    }
  },
  info: function (s) {
    print(s);
  }
};

load(homePath + "src/avm2/settings.js");
load(homePath + "src/avm2/utilities.js");
load(homePath + "src/avm2/avm2Util.js");

var IndentingWriter = Shumway.IndentingWriter;

if (false) {
  var oldLoad = load;
  load = function measureLoad(path) {
    var start = performance.now();
    oldLoad(path);
    print("Loaded: " + path.padRight(' ', 64) + " in " + (performance.now() - start).toFixed(4));
  }
}

load(homePath + "src/avm2/options.js");

var ArgumentParser = Shumway.Options.ArgumentParser;
var Option = Shumway.Options.Option;
var OptionSet = Shumway.Options.OptionSet;

load(homePath + "src/avm2/metrics.js");
var Timer = Shumway.Metrics.Timer;
var Counter = new Shumway.Metrics.Counter();

var systemOptions = new OptionSet("System Options");
var traceLevel = systemOptions.register(new Option("t", "traceLevel", "number", 0, "trace level"));
var traceWarnings = systemOptions.register(new Option("tw", "traceWarnings", "boolean", false, "prints warnings"));

Timer.start("Loading VM");
load(homePath + "src/avm2/constants.js");
load(homePath + "src/avm2/errors.js");

var Errors = Shumway.AVM2.Errors;
var getErrorMessage = Shumway.AVM2.getErrorMessage;
var formatErrorMessage = Shumway.AVM2.formatErrorMessage;
var translateErrorMessage = Shumway.AVM2.translateErrorMessage;

load(homePath + "src/avm2/opcodes.js");

var opcodeTable = Shumway.AVM2.opcodeTable;
var opcodeName = Shumway.AVM2.opcodeName;

load(homePath + "src/avm2/parser.js");

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

load(homePath + "src/avm2/disassembler.js");
load(homePath + "src/avm2/analyze.js");

Timer.start("Loading Compiler");
load(homePath + "src/avm2/compiler/lljs/src/estransform.js");
load(homePath + "src/avm2/compiler/lljs/src/escodegen.js");
load(homePath + "src/avm2/compiler/inferrer.js");
load(homePath + "src/avm2/compiler/c4/ir.js");
load(homePath + "src/avm2/compiler/c4/looper.js");
load(homePath + "src/avm2/compiler/c4/transform.js");
load(homePath + "src/avm2/compiler/c4/backend.js");
load(homePath + "src/avm2/compiler/aot.js");
load(homePath + "src/avm2/compiler/builder.js");
Timer.stop();

load(homePath + "lib/ByteArray.js");

load(homePath + "src/avm2/trampoline.js");
load(homePath + "src/avm2/bindings.js");
load(homePath + "src/avm2/scope.js");

var playerglobalLoadedPromise;
var playerglobal;

load(homePath + "src/avm2/domain.js");
var ApplicationDomain = Shumway.AVM2.Runtime.ApplicationDomain;
var AVM2 = Shumway.AVM2.Runtime.AVM2;
var EXECUTION_MODE = Shumway.AVM2.Runtime.EXECUTION_MODE;

load(homePath + "src/avm2/class.js");


var Binding = Shumway.AVM2.Runtime.Binding;
var Bindings = Shumway.AVM2.Runtime.Bindings;
var ActivationBindings = Shumway.AVM2.Runtime.ActivationBindings;
var CatchBindings = Shumway.AVM2.Runtime.CatchBindings;
var ScriptBindings = Shumway.AVM2.Runtime.ScriptBindings;
var ClassBindings = Shumway.AVM2.Runtime.ClassBindings;
var InstanceBindings = Shumway.AVM2.Runtime.InstanceBindings;
var Interface = Shumway.AVM2.Runtime.Interface;
var Class = Shumway.AVM2.Runtime.Class;

var domainOptions = systemOptions.register(new OptionSet("ApplicationDomain Options"));
var traceClasses = domainOptions.register(new Option("tc", "traceClasses", "boolean", false, "trace class creation"));
var traceDomain = domainOptions.register(new Option("td", "traceDomain", "boolean", false, "trace domain property access"));


load(homePath + "src/avm2/xregexp.js");

load(homePath + "src/avm2/runtime.js");
load(homePath + "src/avm2/runtime-exports.js");
load(homePath + "src/avm2/interpreter.js");

load(homePath + "src/avm2/viz.js");

load(homePath + "src/avm2/xml.js");
load(homePath + "src/avm2/vectors-numeric.js");
load(homePath + "src/avm2/vectors-generic.js");
load(homePath + "src/avm2/array.js");
load(homePath + "src/avm2/proxy.js");
load(homePath + "src/avm2/json2.js");
load(homePath + "src/avm2/dictionary.js");
load(homePath + "src/avm2/native.js");
Timer.stop();


function grabAbc(fileOrBuffer) {
  if (isString(fileOrBuffer)) {
//    var buffer = snarf(fileOrBuffer, "binary");
//    for (var i = 0; i < 10; i++) {
//      var start = performance.now();
//      new AbcFile(buffer, "file");
//      print("Parsed: " + fileOrBuffer + " in " + (performance.now() - start).toFixed(4));
//    }
    return new AbcFile(snarf(fileOrBuffer, "binary"), fileOrBuffer);
  } else {
    var buffer = new Uint8Array(fileOrBuffer); // Copy into local compartment.
    return new AbcFile(buffer);
  }
}