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

var homePath;
var release;

var jsBuildPath = homePath + "src/";
var tsBuildPath = homePath + "build/ts/";

load(tsBuildPath + "avm2/global.js");
load(tsBuildPath + "utilities.js");


assert(homePath, "Host compartment needs to initialize homePath.");

load(jsBuildPath + "avm2/avm2Util.js");
load(tsBuildPath + "dataBuffer.js");
load(tsBuildPath + "options.js");
load(tsBuildPath + "settings.js");
load(tsBuildPath + "metrics.js");

var ArgumentParser = Shumway.Options.ArgumentParser;
var Option = Shumway.Options.Option;
var OptionSet = Shumway.Options.OptionSet;

var systemOptions = new OptionSet("System Options");
var shumwayOptions = systemOptions.register(new OptionSet("Shumway Options"));
load(tsBuildPath + "avm2/options.js");
var shellOptions = systemOptions.register(new OptionSet("AVM2 Shell Options"));
var traceWarnings = shellOptions.register(new Option("tw", "traceWarnings", "boolean", false, "prints warnings"));

Timer.start("Loading VM");

load(jsBuildPath + "avm2/constants.js");
load(tsBuildPath + "avm2/errors.js");
load(tsBuildPath + "avm2/opcodes.js");
load(tsBuildPath + "avm2/parser.js");
load(tsBuildPath + "avm2/bytecode.js");
load(jsBuildPath + "avm2/disassembler.js");

Timer.start("Loading Compiler");
load(tsBuildPath + "avm2/compiler/c4/ast.js");
load(tsBuildPath + "avm2/compiler/verifier.js");
load(jsBuildPath + "avm2/compiler/c4/ir.js");
load(tsBuildPath + "avm2/compiler/c4/looper.js");
load(jsBuildPath + "avm2/compiler/c4/backend.js");
load(jsBuildPath + "avm2/compiler/aot.js");
load(jsBuildPath + "avm2/compiler/builder.js");
Timer.stop();

Timer.start("Loading Runtime");
load(tsBuildPath + "avm2/trampoline.js");
load(tsBuildPath + "avm2/bindings.js");
load(tsBuildPath + "avm2/scope.js");

var playerglobalLoadedPromise;
var playerglobal;

load(tsBuildPath + "avm2/domain.js");
load(jsBuildPath + "avm2/xregexp.js");
load(tsBuildPath + "avm2/runtime.js");
load(jsBuildPath + "avm2/runtime-exports.js");
load(tsBuildPath + "avm2/interpreter.js");

load(tsBuildPath + "avm2/natives/int32Vector.js");
load(tsBuildPath + "avm2/natives/uint32Vector.js");
load(tsBuildPath + "avm2/natives/float64Vector.js");
load(tsBuildPath + "avm2/native.js");
load(tsBuildPath + "avm2/natives/genericVector.js");
load(tsBuildPath + "avm2/natives/dictionary.js");
load(tsBuildPath + "avm2/natives/proxy.js");
load(tsBuildPath + "avm2/natives/xml.js");
load(tsBuildPath + "avm2/natives/system.js");
load(tsBuildPath + "avm2/natives/byteArray.js");

Timer.stop();
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
