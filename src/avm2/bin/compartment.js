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

load(homePath + "src/global.js");
load(homePath + "src/utilities.js");

var homePath;
var release;

assert(homePath, "Host compartment needs to initialize homePath.");

load(homePath + "src/avm2/settings.js");
load(homePath + "src/avm2/avm2Util.js");
load(homePath + "src/options.js");
load(homePath + "src/settings.js");
load(homePath + "src/avm2/metrics.js");

var systemOptions = new OptionSet("System Options");
var traceLevel = systemOptions.register(new Option("t", "traceLevel", "number", 0, "trace level"));
var traceWarnings = systemOptions.register(new Option("tw", "traceWarnings", "boolean", false, "prints warnings"));

Timer.start("Loading VM");

load(homePath + "src/avm2/constants.js");
load(homePath + "src/avm2/errors.js");
load(homePath + "src/avm2/opcodes.js");
load(homePath + "src/avm2/parser.js");
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

Timer.start("Loading Runtime");
load(homePath + "lib/ByteArray.js");
load(homePath + "src/avm2/trampoline.js");
load(homePath + "src/avm2/bindings.js");
load(homePath + "src/avm2/scope.js");

var playerglobalLoadedPromise;
var playerglobal;

load(homePath + "src/avm2/domain.js");
load(homePath + "src/avm2/class.js");
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
load(homePath + "src/avm2/dictionary.js");
load(homePath + "src/avm2/native.js");
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
