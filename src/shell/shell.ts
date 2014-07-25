/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Let's you run Shumway from the command line.
 */

declare var scriptArgs;
declare var arguments;
declare var load;
declare var quit;
declare var read;
declare var include;

var homePath = "";
var jsBuildPath = homePath + "src/";
var tsBuildPath = homePath + "build/ts/";


if (typeof load === "undefined") {
  /* Trying to get Node.js to work. I've tried the V8 shell, but that has problems with reading arguments.
   load = function (path: string) {
    var fs = require("fs");
    eval.call(global, fs.readFileSync(path) + "");
  };
  */
}

load(tsBuildPath + "/base.js");
load(tsBuildPath + "/tools.js");

var systemOptions = new Shumway.Options.OptionSet("System Options");
var shumwayOptions = systemOptions.register(Shumway.Settings.shumwayOptions);
var shellOptions = systemOptions.register(new Shumway.Options.OptionSet("Shell Options"));

load(tsBuildPath + "/swf.js");
load(tsBuildPath + "/avm2.js");
load(tsBuildPath + "/flash.js");
load(tsBuildPath + "/avm1.js");
load(tsBuildPath + "/gfx-base.js");
load(tsBuildPath + "/player.js");

/**
 * Global unitTests array, unit tests add themselves to this. The list may have numbers, these indicate the
 * number of times to run the test following it. This makes it easy to disable test by pushing a zero in
 * front.
 */
var unitTests = [];

module Shumway.Shell {
  import assert = Shumway.Debug.assert;
  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import Option = Shumway.Options.Option;
  import OptionSet = Shumway.Options.OptionSet;
  import ArgumentParser = Shumway.Options.ArgumentParser;

  import Runtime = Shumway.AVM2.Runtime;
  import SwfTag = Shumway.SWF.Parser.SwfTag;

  class ShellPlayer extends Shumway.Player.Player {

  }

  var verbose = false;
  var writer = new IndentingWriter();

  export function main(commandLineArguments: string []) {
    var parseOption = shellOptions.register(new Option("p", "parse", "boolean", false, "Parse File(s)"));
    var verboseOption = shellOptions.register(new Option("v", "verbose", "boolean", false, "Verbose"));
    var releaseOption = shellOptions.register(new Option("r", "release", "boolean", false, "Release mode"));
    var executeOption = shellOptions.register(new Option("x", "execute", "boolean", false, "Execute File(s)"));
    var playerGlobalOption = shellOptions.register(new Option("g", "playerGlobal", "boolean", false, "Load Player Global"));

    var argumentParser = new ArgumentParser();
    argumentParser.addBoundOptionSet(systemOptions);

    function printUsage() {
      writer.enter("Shumway Command Line Interface");
      systemOptions.trace(writer);
      writer.leave("");
    }

    argumentParser.addArgument("h", "help", "boolean", {parse: function (x) {
      printUsage();
    }});

    var files = [];

    // Try and parse command line arguments.

    try {
      argumentParser.parse(commandLineArguments).filter(function (value, index, array) {
        if (value.endsWith(".abc") || value.endsWith(".swf") || value.endsWith(".js")) {
          files.push(value);
        } else {
          return true;
        }
      });
    } catch (x) {
      writer.writeLn(x.message);
      quit();
    }

    release = releaseOption.value;
    verbose = verboseOption.value;

    Shumway.Unit.writer = new IndentingWriter(!verbose);

    if (parseOption.value) {
      files.forEach(function (file) {
        var start = dateNow();
        writer.enter("Parsing: " + file);
        parseFile(file);
        var elapsed = dateNow() - start;
        verbose && writer.writeLn("Total Parse Time: " + (elapsed).toFixed(4));
        writer.outdent();
      });
    }

    if (executeOption.value) {
      initializeAVM2(playerGlobalOption.value);
      files.forEach(function (file) {
        executeFile(file);
      });
    }
  }

  function parseABCs(files: string []) {

  }

  function executeFile(file: string): boolean {
    if (file.endsWith(".js")) {
      executeUnitTest(file);
    }
    return true;
  }

  function executeUnitTest(file: string) {
    writer.writeLn("Running Unit Test: " + file);
    load(file);
    while (unitTests.length) {
      var test = unitTests.shift();
      var repeat = 1;
      if (typeof test === "number") {
        repeat = test;
        test = unitTests.shift();
      }
      if (verbose && test.name) {
        writer.writeLn("Test: " + test.name);
      }
      try {
        for (var i = 0; i < repeat; i++) {
          test();
        }
      } catch (x) {
        writer.redLn('Exception encountered while running ' + file + ':' + '(' + x + ')');
        writer.redLns(x.stack);
      }
    }
    writer.outdent();
  }

  function parseSymbol(tag, symbols) {
    var symbol;
    switch (tag.code) {
      case SwfTag.CODE_DEFINE_BITS:
      case SwfTag.CODE_DEFINE_BITS_JPEG2:
      case SwfTag.CODE_DEFINE_BITS_JPEG3:
      case SwfTag.CODE_DEFINE_BITS_JPEG4:
      case SwfTag.CODE_JPEG_TABLES:
        symbol = Shumway.SWF.Parser.defineImage(tag, symbols);
        break;
      case SwfTag.CODE_DEFINE_BITS_LOSSLESS:
      case SwfTag.CODE_DEFINE_BITS_LOSSLESS2:
        symbol = Shumway.SWF.Parser.defineBitmap(tag);
        break;
      case SwfTag.CODE_DEFINE_BUTTON:
      case SwfTag.CODE_DEFINE_BUTTON2:
        // symbol = Shumway.SWF.Parser.defineButton(tag, symbols);
        break;
      case SwfTag.CODE_DEFINE_EDIT_TEXT:
        symbol = Shumway.SWF.Parser.defineText(tag, symbols);
        break;
      case SwfTag.CODE_DEFINE_FONT:
      case SwfTag.CODE_DEFINE_FONT2:
      case SwfTag.CODE_DEFINE_FONT3:
      case SwfTag.CODE_DEFINE_FONT4:
        symbol = Shumway.SWF.Parser.defineFont(tag, symbols);
        break;
      case SwfTag.CODE_DEFINE_MORPH_SHAPE:
      case SwfTag.CODE_DEFINE_MORPH_SHAPE2:
      case SwfTag.CODE_DEFINE_SHAPE:
      case SwfTag.CODE_DEFINE_SHAPE2:
      case SwfTag.CODE_DEFINE_SHAPE3:
      case SwfTag.CODE_DEFINE_SHAPE4:
        symbol = Shumway.SWF.Parser.defineShape(tag, symbols);
        break;
      case SwfTag.CODE_DEFINE_SOUND:
        symbol = Shumway.SWF.Parser.defineSound(tag, symbols);
        break;
      default:
        // TODO: Handle all cases here.
        break;
    }
    symbols[tag.id] = symbol;
  }
  /**
   * Parses file.
   */
  function parseFile(file: string): boolean {
    function parseABC(buffer: ArrayBuffer) {
      new AbcFile(new Uint8Array(buffer), "ABC");
    }
    var buffers = [];
    if (file.endsWith(".swf")) {
      var SWF_TAG_CODE_DO_ABC = SwfTag.CODE_DO_ABC;
      var SWF_TAG_CODE_DO_ABC_ = SwfTag.CODE_DO_ABC_;
      try {
        Shumway.SWF.Parser.parse(read(file, "binary"), {
          oncomplete: function(result) {
            var symbols = {};
            var tags = result.tags;
            var counter = new Metrics.Counter(true);
            for (var i = 0; i < tags.length; i++) {
              var tag = tags[i];
              assert(tag.code !== undefined);
              var start = dateNow();
              if (tag.code === SWF_TAG_CODE_DO_ABC || tag.code === SWF_TAG_CODE_DO_ABC_) {
                parseABC(tag.data);
              } else {
                parseSymbol(tag, symbols);
              }
              counter.count(SwfTag[tag.code], 1, dateNow() - start);
            }
            if (verbose) {
              writer.enter("Tag Frequency:");
              counter.traceSorted(writer);
              writer.outdent();
            }
          }
        });
      } catch (x) {
        if (verbose) {
          writer.redLn("Cannot parse: " + file + ", reason: " + x);
          writer.redLns(x.stack);
        }
        return false;
      }
    } else if (file.endsWith(".abc")) {
      parseABC(read(file, "binary"));
    }
    return true;
  }

  function createAVM2(builtinPath, libraryPathInfo?) {
    var buffer = read(builtinPath, 'binary');
    Runtime.AVM2.initialize(Runtime.ExecutionMode.COMPILE, Runtime.ExecutionMode.COMPILE, null);
    var avm2Instance = Runtime.AVM2.instance;
    Shumway.AVM2.AS.linkNatives(avm2Instance);
    avm2Instance.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));
    if (libraryPathInfo) {
      loadPlayerglobal(libraryPathInfo.abcs, libraryPathInfo.catalog);
    }
  }

  function initializeAVM2(loadPlayerglobal: boolean) {
    var avm2Root = homePath + "src/avm2/";
    var builtinPath = avm2Root + "generated/builtin/builtin.abc";
    createAVM2(builtinPath, loadPlayerglobal ? {
      abcs: "build/playerglobal/playerglobal.abcs",
      catalog: "build/playerglobal/playerglobal.json"
    } : undefined);
  }

  function loadPlayerglobal(abcsPath, catalogPath) {
    var playerglobal = Shumway.AVM2.Runtime.playerglobal = {
      abcs: read(abcsPath, 'binary').buffer,
      map: Object.create(null),
      scripts: Object.create(null)
    };
    var catalog = JSON.parse(read(catalogPath));
    for (var i = 0; i < catalog.length; i++) {
      var abc = catalog[i];
      playerglobal.scripts[abc.name] = abc;
      if (typeof abc.defs === 'string') {
        playerglobal.map[abc.defs] = abc.name;
        writer.writeLn(abc.defs)
      } else {
        for (var j = 0; j < abc.defs.length; j++) {
          var def = abc.defs[j];
          playerglobal.map[def] = abc.name;
        }
      }
    }
  }
}

// Shell Entry Point

if (typeof console === "undefined") {
  var commandLineArguments: string [];
  if (typeof scriptArgs === "undefined") {
    commandLineArguments = arguments;
  } else {
    commandLineArguments = scriptArgs;
  }
  Shumway.Shell.main(commandLineArguments);
}