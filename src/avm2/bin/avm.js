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

load(homePath + "src/global.js");
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
var shellOptions = systemOptions.register(new OptionSet("AVM2 Shell Options"));
var disassemble = shellOptions.register(new Option("d", "disassemble", "boolean", false, "disassemble"));
var traceLevel = shellOptions.register(new Option("t", "traceLevel", "number", 0, "trace level"));
var traceWarnings = shellOptions.register(new Option("tw", "traceWarnings", "boolean", false, "prints warnings"));
var execute = shellOptions.register(new Option("x", "execute", "boolean", false, "execute"));
var compile = shellOptions.register(new Option("c", "compile", "boolean", false, "compile"));
var compileAll = shellOptions.register(new Option("ca", "compileAll", "boolean", false, "compile"));
var compileBuiltins = shellOptions.register(new Option("cb", "compileBuiltins", "boolean", false, "compile"));
var alwaysInterpret = shellOptions.register(new Option("i", "alwaysInterpret", "boolean", false, "always interpret"));
var help = shellOptions.register(new Option("h", "help", "boolean", false, "prints help"));
var traceMetrics = shellOptions.register(new Option("tm", "traceMetrics", "boolean", false, "prints collected metrics"));
var releaseMode = shellOptions.register(new Option("rel", "release", "boolean", false, "run in release mode (!release is the default)"));

load(homePath + "src/avm2/metrics.js");
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
var EXECUTION_MODE = Shumway.AVM2.Runtime.EXECUTION_MODE;

// var ApplicationDomain = Shumway.AVM2.Runtime.ApplicationDomain;
var SecurityDomain = Shumway.AVM2.Runtime.SecurityDomain;

load(homePath + "src/avm2/disassembler.js");

var Timer = Shumway.Metrics.Timer;
var Counter = new Shumway.Metrics.Counter();

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

var abcBuffers = [];

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
    SWF.parse(snarf(file, "binary"), {
      oncomplete: function(result) {
        var tags = result.tags;
        var abcs = []; // Group SWF ABCs in their own array.
        for (var i = 0, n = tags.length; i < n; i++) {
          var tag = tags[i];
          if (tag.code === SWF_TAG_CODE_DO_ABC) {
            abcs.push(tag.data);
          }
        }
        abcBuffers.push(abcs);
      }
    });
  } else {
    release || assert(file.endsWith(".abc"));
    abcBuffers.push([snarf(file, "binary")]);
  }
}

function grabAbc(buffer) {
  var localBuffer = new Uint8Array(buffer); // Copy into local compartment.
  return new AbcFile(localBuffer);
}

if (execute.value || compile.value || compileAll.value || compileBuiltins.value) {
  if (false) {
    timeIt(function () {
      runVM();
    }, "Create Compartment", 10);
  } else {
    runVM();
  }
} else if (disassemble.value) {
  grabAbcs(abcBuffers).forEach(function (abcArray) {
    abcArray.forEach(function (abc) {
      abc.trace(stdout);
    });
  });
}

function grabAbcs(abcBuffers) {
  return abcBuffers.map(function (abcBuffer) {
    return abcBuffer.map(function (abcBuffer) {
      return grabAbc(abcBuffer);
    });
  });
}

function grabAbcsInCompartment(compartment, abcBuffers) {
  return abcBuffers.map(function (abcBuffer) {
    return abcBuffer.map(function (abcBuffer) {
      return compartment.grabAbc(abcBuffer);
    });
  });
}

function runVM() {
  var securityDomain = new SecurityDomain();
  var compartment = securityDomain.compartment;
  var argumentParser = new compartment.ArgumentParser();
  argumentParser.addBoundOptionSet(compartment.systemOptions);
  argumentParser.parse(originalArgs.slice(0));
  var sysMode = alwaysInterpret.value ? EXECUTION_MODE.INTERPRET : EXECUTION_MODE.COMPILE;
  var appMode = alwaysInterpret.value ? EXECUTION_MODE.INTERPRET : EXECUTION_MODE.COMPILE;
  securityDomain.initializeShell(sysMode, appMode);
  runAbcs(securityDomain, grabAbcsInCompartment(securityDomain.compartment, abcBuffers));
  return securityDomain;
}

function runAbcs(securityDomain, abcArrays) {
  var writer = new IndentingWriter();
  var compileQueue = [];
  for (var i = 0; i < abcArrays.length; i++) {
    var abcArray = abcArrays[i];
    for (var j = 0; j < abcArray.length; j++) {
      var abc = abcArray[j];
      if (compileAll.value) {
        securityDomain.applicationDomain.loadAbc(abc, writer);
        compileQueue.push(abc);
      } else if (i < abcArrays.length - 1) {
        securityDomain.applicationDomain.loadAbc(abc);
      } else if (compile.value) {
        compileQueue.push(abc);
      } else {
        securityDomain.applicationDomain.executeAbc(abc);
      }
    }
  }
  if (compileBuiltins.value) {
    securityDomain.systemDomain.abcs.forEach(function (abc) {
      writer.writeLn("// " + abc.name);
      writer.enter("CC[" + abc.hash + "] = ");
      securityDomain.systemDomain.compileAbc(abc, writer);
      writer.leave(";");
    });
  }

  compileQueue.forEach(function (abc) {
    writer.writeLn("// " + abc.name);
    writer.enter("CC[" + abc.hash + "] = ");
    securityDomain.applicationDomain.compileAbc(abc, writer);
    writer.leave(";");
  });
}
