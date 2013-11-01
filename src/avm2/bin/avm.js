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

console = {
  time: function (name) {
    Timer.start(name)
  },
  timeEnd: function (name) {
    Timer.stop(name)
  },
  warn: function (s) {
    if (traceWarnings.value) {
      print(s);
    }
  },
  info: function (s) {
    print(s);
  }
};


/**
 * Load Bare AVM2 Dependencies
 */

load(homePath + "src/avm2/settings.js");
load(homePath + "src/avm2/avm2Util.js");
load(homePath + "src/avm2/options.js");

var stdout = new IndentingWriter();

var ArgumentParser = options.ArgumentParser;
var Option = options.Option;
var OptionSet = options.OptionSet;

var argumentParser = new ArgumentParser();

var systemOptions = new OptionSet("System Options");
var shellOptions = systemOptions.register(new OptionSet("AVM2 Shell Options"));
var disassemble = shellOptions.register(new Option("d", "disassemble", "boolean", false, "disassemble"));
var traceLevel = shellOptions.register(new Option("t", "traceLevel", "number", 0, "trace level"));
var traceWarnings = shellOptions.register(new Option("tw", "traceWarnings", "boolean", false, "prints warnings"));
var execute = shellOptions.register(new Option("x", "execute", "boolean", false, "execute"));
var alwaysInterpret = shellOptions.register(new Option("i", "alwaysInterpret", "boolean", false, "always interpret"));
var help = shellOptions.register(new Option("h", "help", "boolean", false, "prints help"));
var traceMetrics = shellOptions.register(new Option("tm", "traceMetrics", "boolean", false, "prints collected metrics"));
var releaseMode = shellOptions.register(new Option("rel", "release", "boolean", false, "run in release mode (!release is the default)"));

load(homePath + "src/avm2/metrics.js");
load(homePath + "src/avm2/domain.js")
load(homePath + "src/avm2/constants.js");
load(homePath + "src/avm2/opcodes.js");
load(homePath + "src/avm2/parser.js");
load(homePath + "src/avm2/disassembler.js");


var Timer = metrics.Timer;
var Counter = new metrics.Counter();


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
argumentParser.addArgument("r", "rootPath", "string", {
  parse: function (x) {
    rootPath = x;
  }
});

/* Old style script arguments */
if (typeof scriptArgs === "undefined") {
  scriptArgs = arguments;
}

var originalArgs = scriptArgs.slice(0);

try {
  argumentParser.parse(scriptArgs).filter(function (x) {
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

Counter.setEnabled(traceMetrics.value);

function timeIt(fn, message, count) {
  count = count || 0;
  var start = performance.now();
  var product = 1;
  for (var i = 0; i < count; i++) {
    var s = performance.now();
    fn();
    product *= (performance.now() - s);
  }
  var elapsed = (performance.now() - start);
  print("Measure: " + message + " Count: " + count + " Elapsed: " + elapsed.toFixed(4) + " (" + (elapsed / count).toFixed(4) + ") (" + Math.pow(product, (1 / count)).toFixed(4) + ")");
}

var abcFiles = [];
var self = {};
var SWF;
for (var f = 0; f < files.length; f++) {
  var file = files[f];
  if (file.endsWith(".swf")) {
    if (!SWF) {
      /**
       * Load SWF Dependencies
       */
      SWF = {};
      load(homePath + "src/swf/swf.js");
      load(homePath + "src/flash/util.js");
      load(homePath + "src/swf/types.js");
      load(homePath + "src/swf/structs.js");
      load(homePath + "src/swf/tags.js");
      load(homePath + "src/swf/inflate.js");
      load(homePath + "src/swf/stream.js");
      load(homePath + "src/swf/templates.js");
      load(homePath + "src/swf/generator.js");
      load(homePath + "src/swf/handlers.js");
      load(homePath + "src/swf/parser.js");
      load(homePath + "src/swf/bitmap.js");
      load(homePath + "src/swf/button.js");
      load(homePath + "src/swf/font.js");
      load(homePath + "src/swf/image.js");
      load(homePath + "src/swf/label.js");
      load(homePath + "src/swf/shape.js");
      load(homePath + "src/swf/text.js");
    }
    print("Processing; " + file);
    SWF.parse(snarf(file, "binary"), {
      oncomplete: function(result) {
        var tags = result.tags;
        for (var i = 0, n = tags.length; i < n; i++) {
          var tag = tags[i];
          if (tag.code === SWF_TAG_CODE_DO_ABC) {
            abcFiles.push(tag.data);
          }
        }
      }
    });
  } else {
    release || assert(file.endsWith(".abc"));
    abcFiles.push(file);
  }
}

function grabAbc(fileOrBuffer) {
  if (isString(fileOrBuffer)) {
    return new AbcFile(snarf(fileOrBuffer, "binary"), fileOrBuffer);
  } else {
    var buffer = new Uint8Array(fileOrBuffer); // Copy into local compartment.
    return new AbcFile(buffer, fileOrBuffer);
  }
}

if (execute.value) {
  if (false) {
    timeIt(function () {
      runVM();
    }, "Create Compartment", 5);
  } else {
    runVM();
  }

} else if (disassemble.value) {
  abcFiles.map(function (abcFile) {
    return grabAbc(abcFile);
  }).forEach(function (abc) {
      abc.trace(stdout);
    });
}

var securityDomains = [];

function runVM() {
  var securityDomain = new SecurityDomain();
  var compartment = securityDomain.compartment;
  var argumentParser = new compartment.ArgumentParser();
  argumentParser.addBoundOptionSet(compartment.systemOptions);
  argumentParser.parse(originalArgs.slice(0));
  var sysMode = alwaysInterpret.value ? EXECUTION_MODE.INTERPRET : EXECUTION_MODE.COMPILE;
  var appMode = alwaysInterpret.value ? EXECUTION_MODE.INTERPRET : EXECUTION_MODE.COMPILE;
  securityDomain.initializeShell(sysMode, appMode);
  runAbcs(securityDomain, abcFiles.map(function (abcFile) {
    return securityDomain.compartment.grabAbc(abcFile);
  }));
}

function runAbcs(securityDomain, abcs) {
  for (var i = 0; i < abcs.length; i++) {
    if (i < files.lenth - 1) {
      securityDomain.applicationDomain.loadAbc(abcs[i]);
    } else {
      securityDomain.applicationDomain.executeAbc(abcs[i]);
    }
  }
}