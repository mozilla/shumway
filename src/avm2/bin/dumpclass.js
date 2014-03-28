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

load("../../../lib/DataView.js/DataView.js");

var SWF = {};
load("../avm2Util.js");
load("../../swf/types.js");
load("../../swf/structs.js");
load("../../swf/tags.js");
load("../../swf/inflate.js");
load("../../swf/stream.js");
load("../../swf/templates.js");
load("../../swf/generator.js");
load("../../swf/handlers.js");
load("../../swf/parser.js");
load("../../swf/bitmap.js");
load("../../swf/button.js");
load("../../swf/font.js");
load("../../swf/image.js");
load("../../swf/label.js");
load("../../swf/shape.js");
load("../../swf/text.js");

load("../../options.js");

load("../metrics.js");

var Timer = metrics.Timer;
var stdout = new IndentingWriter();
var ArgumentParser = options.ArgumentParser;
var Option = options.Option;
var OptionSet = options.OptionSet;

var argumentParser = new ArgumentParser();
var systemOptions = new OptionSet("System Options");

load("../constants.js");
load("../opcodes.js");
load("../parser.js");
load("../disassembler.js");
load("../analyze.js");
load("../compiler/lljs/src/estransform.js");
load("../compiler/lljs/src/escodegen.js");
load("../compiler/compiler.js");
load("../native.js");
load("../runtime.js");
load("../viz.js");
load("../interpreter.js");

function printUsage() {
  stdout.writeLn("dumpclass.js " + argumentParser.getUsage());
}

argumentParser.addArgument("h", "help", "boolean", {parse: function (x) { printUsage(); }});
var swfFile = argumentParser.addArgument("swf", "swf", "string", { positional: true });
var className = argumentParser.addArgument("class", "class", "string", { positional: true });

try {
  argumentParser.parse(arguments);
} catch (x) {
  stdout.writeLn(x.message);
  quit();
}

function forEachABC(swf, cb) {
  SWF.parse(snarf(swf, "binary"), {
    oncomplete: function(result) {
      var tags = result.tags;
      var abcCount = 0;
      for (var i = 0, n = tags.length; i < n; i++) {
        var tag = tags[i];
        if (tag.type === "abc") {
          cb(new AbcFile(tag.data));
        }
      }
    }
  });
}

var writer = new IndentingWriter();
var tracer = new SourceTracer(writer);
forEachABC(swfFile.value, function (abc) {
  abc.scripts.forEach(function (script) {
    script.traits.traits.forEach(function (trait) {
      if (trait.isClass()) {
        var cname = trait.classInfo.instanceInfo.name;
        if (cname.getName() === className.value) {
          writer.enter("package " + cname.namespaces[0].uri + " {\n");
          tracer.traceMetadata(trait.metadata);
          tracer.traceClass(trait.classInfo);
          writer.leave("\n}");
          tracer.traceClassStub(trait);
        }
      }
    });
  });
});
