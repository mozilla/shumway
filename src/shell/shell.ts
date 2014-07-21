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

module Shumway.Shell {
  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import Option = Shumway.Options.Option;
  import OptionSet = Shumway.Options.OptionSet;
  import ArgumentParser = Shumway.Options.ArgumentParser;

  import Runtime = Shumway.AVM2.Runtime;

  class ShellPlayer extends Shumway.Player.Player {

  }

  var writer = new IndentingWriter();

  export function main(commandLineArguments: string []) {
    var parseOption = shellOptions.register(new Option("p", "parse", "boolean", false, "Parse File(s)"));
    var releaseOption = shellOptions.register(new Option("r", "release", "boolean", false, "Release mode"));
    var executeOption = shellOptions.register(new Option("x", "execute", "boolean", false, "Execute File(s)"));

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

    if (parseOption.value) {
      files.forEach(x => parseSWF(x));
    }

    if (executeOption.value) {
      initializeAVM2();
      createABCs(files).forEach(function (abc: AbcFile) {
        writer.writeLn("Execute: " + abc);
        Runtime.AVM2.instance.systemDomain.executeAbc(abc);
      });
    }
  }

  function createABCs(files: string []): AbcFile [] {
    var abcs = [];
    files.forEach(function (file) {
      writer.writeLn(file);
      if (file.endsWith(".abc")) {
        abcs.push(new AbcFile(new Uint8Array(read(file, 'binary')), file));
      } else {
        Shumway.Debug.unexpected(file);
      }
    });
    return abcs;
  }

  /**
   * Parses a SWF's tags.
   */
  function parseSWF(file: string) {
    var SWF_TAG_CODE_DO_ABC = Shumway.SWF.Parser.SwfTag.CODE_DO_ABC;
    var SWF_TAG_CODE_DO_ABC_ = Shumway.SWF.Parser.SwfTag.CODE_DO_ABC_;
    Shumway.SWF.Parser.parse(read(file, "binary"), {
      oncomplete: function(result) {
        var tags = result.tags;
        for (var i = 0, n = tags.length; i < n; i++) {
          var tag = tags[i];
        }
        writer.writeLn("Parsed: " + tags.length + " tags.");
      }
    });
  }

  function createAVM2(builtinPath, libraryPathInfo) {
    var buffer = read(builtinPath, 'binary');
    Runtime.AVM2.initialize(Runtime.ExecutionMode.COMPILE, Runtime.ExecutionMode.COMPILE, null);
    var avm2Instance = Runtime.AVM2.instance;
    Shumway.AVM2.AS.linkNatives(avm2Instance);
    avm2Instance.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));

    /*
    console.time("Execute builtin.abc");
    // Avoid loading more Abcs while the builtins are loaded
    avm2.builtinsLoaded = false;
    avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));
    avm2.builtinsLoaded = true;
    console.timeEnd("Execute builtin.abc");
    loadPlayerglobal(libraryPathInfo.abcs, libraryPathInfo.catalog);
    */
  }

  function initializeAVM2() {
    var avm2Root = homePath + "src/avm2/";
    var builtinPath = avm2Root + "generated/builtin/builtin.abc";
    createAVM2(builtinPath, {
      abcs: "build/playerglobal/playerglobal.abcs",
      catalog: "build/playerglobal/playerglobal.json"
    });
  }
}

if (typeof console === "undefined") {
  var commandLineArguments: string [];
  if (typeof scriptArgs === "undefined") {
    commandLineArguments = arguments;
  } else {
    commandLineArguments = scriptArgs;
  }
  Shumway.Shell.main(commandLineArguments)
}