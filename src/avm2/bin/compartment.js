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

load(tsBuildPath + "/base.js");
load(tsBuildPath + "/tools.js");

var ArgumentParser = Shumway.Options.ArgumentParser;
var Timer = new Shumway.Metrics.Timer();
var Option = Shumway.Options.Option;
var OptionSet = Shumway.Options.OptionSet;

var systemOptions = new OptionSet("System Options");
var shumwayOptions = systemOptions.register(new OptionSet("Shumway Options"));

Shumway.Settings = {
  shumwayOptions: shumwayOptions
};

var shellOptions = systemOptions.register(new OptionSet("AVM2 Shell Options"));
var traceWarnings = shellOptions.register(new Option("tw", "traceWarnings", "boolean", false, "prints warnings"));

load(tsBuildPath + "avm2.js");
load(jsBuildPath + "avm2/disassembler.js");

// load(tsBuildPath + "avm2/compiler/aot.js");

function grabAbc(fileOrBuffer) {
  if (Shumway.isString(fileOrBuffer)) {
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
