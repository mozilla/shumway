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

var homePath = "../../../";

if (environment.SHUMWAY_HOME) {
  homePath = environment.SHUMWAY_HOME.trim();
  if (homePath.lastIndexOf("/") != homePath.length - 1) {
	  homePath = homePath + "/";
  }
}

load(homePath + "lib/DataView.js/DataView.js");

/**
 * Load AVM2 Dependencies
 */

load(homePath + "src/avm2/config.js");
load(homePath + "src/avm2/util.js");

var options; load(homePath + "src/avm2/options.js");
var stdout = new IndentingWriter();

var ArgumentParser = options.ArgumentParser;
var Option = options.Option;
var OptionSet = options.OptionSet;

var argumentParser = new ArgumentParser();

var systemOptions = new OptionSet("System Options");
var shellOptions = systemOptions.register(new OptionSet("AVM2 Shell Options"));
var disassemble = shellOptions.register(new Option("d", "disassemble", "boolean", false, "disassemble"));
var traceLevel = shellOptions.register(new Option("t", "traceLevel", "number", 0, "trace level"));
var traceGraphViz = shellOptions.register(new Option("v", "traceGraphViz" , "boolean", false, "trace GraphViz output"));
var execute = shellOptions.register(new Option("x", "execute", "boolean", false, "execute"));
var alwaysInterpret = shellOptions.register(new Option("i", "alwaysInterpret", "boolean", false, "always interpret"));
var compileSys = shellOptions.register(new Option("csys", "compileSystemDomain", "boolean", false, "compile system domain"));
var help = shellOptions.register(new Option("h", "help", "boolean", false, "prints help"));
var traceMetrics = shellOptions.register(new Option("tm", "traceMetrics", "boolean", false, "prints collected metrics"));
var traceJson = shellOptions.register(new Option("tj", "traceJson", "boolean", false, "prints vm information in JSON format"));
var traceWarnings = shellOptions.register(new Option("tw", "traceWarnings", "boolean", false, "prints warnings"));
var releaseMode = shellOptions.register(new Option("rel", "release", "boolean", false, "run in release mode (!release is the default)"));
var unsafeMode = shellOptions.register(new Option("u", "unsafe", "boolean", false, "run in unsafe mode"));

var test = shellOptions.register(new Option("test", "test", "boolean", false, "test"));

var metrics; load(homePath + "src/avm2/metrics.js");
var Timer = metrics.Timer;
var Counter = new metrics.Counter();

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
var estransform; load(homePath + "src/avm2/compiler/lljs/src/estransform.js");
var escodegen; load(homePath + "src/avm2/compiler/lljs/src/escodegen.js");
load(homePath + "src/avm2/compiler/inferrer.js");
load(homePath + "src/avm2/compiler/c4/ir.js");
load(homePath + "src/avm2/compiler/c4/looper.js");
load(homePath + "src/avm2/compiler/c4/backend.js");
load(homePath + "src/avm2/compiler/builder.js");
Timer.stop();

load(homePath + "src/avm2/domain.js")
load(homePath + "src/avm2/class.js");
load(homePath + "src/avm2/xregexp.js");
load(homePath + "src/avm2/runtime.js");
load(homePath + "src/avm2/viz.js");
load(homePath + "src/avm2/interpreter.js");
load(homePath + "src/avm2/xml.js");
load(homePath + "src/avm2/proxy.js");
load(homePath + "src/avm2/json2.js");
load(homePath + "src/avm2/native.js");
load(homePath + "src/avm2/vm.js");
Timer.stop();

argumentParser.addBoundOptionSet(systemOptions);

function printUsage() {
  stdout.writeLn("avm.js " + argumentParser.getUsage());
}

argumentParser.addArgument("h", "help", "boolean", {parse: function (x) {
  printUsage();
}});

argumentParser.addArgument("to", "traceOptions", "boolean", {parse: function (x) {
  systemOptions.trace(stdout);
}});


var argv = [];
var files = [];

var rootPath = "";
argumentParser.addArgument("r", "rootPath", "string", {parse: function (x) {
  rootPath = x;
}});

try {
  argumentParser.parse(arguments).filter(function (x) {
    if (x.endsWith(".abc") || x.endsWith(".swf")) {
      files.push(rootPath + x);
    } else {
      argv.push(rootPath + x);
    }
  });
} catch (x) {
  stdout.writeLn(x.message);
  quit();
}

release = releaseMode.value;
debug = !release;
compatibility = !unsafeMode.value;

Counter.setEnabled(traceMetrics.value);

function grabABC(abcname) {
  var filename = abcname + ".abc";
  var stream = snarf(homePath + "src/avm2/generated/" + abcname + "/" + filename, "binary");
  return new AbcFile(stream, filename);
}

var avm2;
if (execute.value) {
  var sysMode = alwaysInterpret.value ? EXECUTION_MODE.INTERPRET : (compileSys.value ? null : EXECUTION_MODE.INTERPRET);
  var appMode = alwaysInterpret.value ? EXECUTION_MODE.INTERPRET : null;
  avm2 = new AVM2(sysMode, appMode);
  Timer.start("Initialize");
  avm2.systemDomain.executeAbc(grabABC("builtin"));
  avm2.systemDomain.executeAbc(grabABC("shell"));
  avm2.systemDomain.installNative("getArgv", function() {
    return argv;
  });
  avm2.systemDomain.executeAbc(grabABC("avmplus"));
  Timer.stop();
}

for (var f = 0; f < files.length; f++) {
  var file = files[f];
  if (file.endsWith(".swf")) {
    SWF.parse(snarf(file, "binary"), {
      oncomplete: function(result) {
        var tags = result.tags;
        for (var i = 0, n = tags.length; i < n; i++) {
          var tag = tags[i];
          if (tag.type === "abc") {
            processAbc(new AbcFile(tag.data, file.value + " [Tag ID: " + i + "]"));
          } else if (tag.type === "symbols") {
            for (var j = tag.references.length - 1; j >= 0; j--) {
              if (tag.references[j].id === 0) {
                avm2.applicationDomain.getProperty(
                  Multiname.fromSimpleName(tag.references[j].name),
                  true, true
                );
                break;
              }
            }
          }
        }
      }
    });
  } else {
    release || assert(file.endsWith(".abc"));
    processAbc(new AbcFile(snarf(file, "binary"), file), f < files.length - 1);
  }
}

function processAbc(abc, loadOnly) {
  var methodBodies = abc.methodBodies;

  if (disassemble.value) {
    abc.trace(stdout);
  }

  if (execute.value) {
    release || assert(avm2);
    try {
      if (loadOnly) {
        avm2.applicationDomain.loadAbc(abc);
      } else {
        avm2.applicationDomain.executeAbc(abc);
      }
    } catch(e) {
      print(e);
      print("");
      print(e.stack);
    }

    if (traceLevel.value > 4) {
      /* Spew analysis information if not quiet. */
      stdout.enter("analyses {");
      abc.methods.forEach(function (method) {
        if (method.analysis) {
          method.analysis.trace(stdout);
        }
      });
      stdout.leave("}");
    }
  }
}

if (traceMetrics.value) {
  metrics.Timer.trace(stdout, traceJson.value);
  Counter.trace(stdout, traceJson.value);
}
