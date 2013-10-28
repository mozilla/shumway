/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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


load(homePath + "src/avm2/settings.js");
load(homePath + "src/avm2/avm2Util.js");


if (false) {
  var oldLoad = load;
  load = function measureLoad(path) {
    var start = performance.now();
    oldLoad(path);
    print("Loaded: " + path.padRight(' ', 64) + " in " + (performance.now() - start).toFixed(4));
  }
}

load(homePath + "src/avm2/options.js");
var ArgumentParser = options.ArgumentParser;
var Option = options.Option;
var OptionSet = options.OptionSet;

load(homePath + "src/avm2/metrics.js");
var Timer = metrics.Timer;
var Counter = new metrics.Counter();

var systemOptions = new OptionSet("System Options");
var traceLevel = systemOptions.register(new Option("t", "traceLevel", "number", 0, "trace level"));
var traceWarnings = systemOptions.register(new Option("tw", "traceWarnings", "boolean", false, "prints warnings"));

var console = {
  time: function (name) {
    Timer.start(name)
  },
  timeEnd: function (name) {
    Timer.stop(name)
  },
  warn: function (s) { },
  info: function (s) { }
};

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

load(homePath + "src/avm2/domain.js")
load(homePath + "src/avm2/class.js");
load(homePath + "src/avm2/xregexp.js");
load(homePath + "src/avm2/runtime.js");
load(homePath + "src/avm2/viz.js");
load(homePath + "src/avm2/interpreter.js");
load(homePath + "src/avm2/xml.js");
load(homePath + "src/avm2/vectors.js");
load(homePath + "src/avm2/proxy.js");
load(homePath + "src/avm2/json2.js");
load(homePath + "src/avm2/dictionary.js");
load(homePath + "src/avm2/native.js");
load(homePath + "src/avm2/vm.js");
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
    return new AbcFile(buffer, fileOrBuffer);
  }
}