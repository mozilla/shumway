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
declare var snarf;

var homePath = "";
var jsBuildPath = homePath + "src/";
var tsBuildPath = homePath + "build/ts/";

load(tsBuildPath + "/base.js");
load(tsBuildPath + "/tools.js");
load(tsBuildPath + "/swf.js");
load(jsBuildPath + "/avm2/xregexp.js");
load(tsBuildPath + "/avm2.js");
load(tsBuildPath + "/flash.js");
load(tsBuildPath + "/player-shell.js");

module Shumway.Player.Shell {
  import Option = Shumway.Options.Option;
  import OptionSet = Shumway.Options.OptionSet;
  import ArgumentParser = Shumway.Options.ArgumentParser;

  class ShellPlayer extends Shumway.Player.Player {

  }

  var writer = new IndentingWriter();

  export function main(commandLineArguments: string []) {
    var systemOptions = new OptionSet("System Options");
    var shumwayOptions = systemOptions.register(new OptionSet("Shumway Options"));
    var shellOptions = systemOptions.register(new OptionSet("Shell Options"));

    var argumentParser = new ArgumentParser();
    argumentParser.addBoundOptionSet(systemOptions);

    function printUsage() {
      writer.enter("Shumway Command Line Interface");
      writer.writeLn("shell.js " + argumentParser.getUsage());
      writer.leave("");
    }

    argumentParser.addArgument("h", "help", "boolean", {parse: function (x) {
      printUsage();
    }});

    var files = [];

    try {
      argumentParser.parse(commandLineArguments).filter(function (value, index, array) {
        if (value.endsWith(".abc") || value.endsWith(".swf")) {
          files.push(value);
        } else {
          return true;
        }
      });
    } catch (x) {
      writer.writeLn(x.message);
      quit();
    }

    files.forEach(x => runSWF(x));
  }

  function runSWF(file: string) {
    var SWF_TAG_CODE_DO_ABC = Shumway.SWF.Parser.SwfTag.CODE_DO_ABC;
    var SWF_TAG_CODE_DO_ABC_ = Shumway.SWF.Parser.SwfTag.CODE_DO_ABC_;
    Shumway.SWF.Parser.parse(snarf(file, "binary"), {
      oncomplete: function(result) {
        var tags = result.tags;
        var abcs = []; // Group SWF ABCs in their own array.
        for (var i = 0, n = tags.length; i < n; i++) {
          var tag = tags[i];
          writer.writeLn(tag.code);
          if (tag.code === SWF_TAG_CODE_DO_ABC ||
            tag.code === SWF_TAG_CODE_DO_ABC_) {
            abcs.push(tag.data);
          }
        }
      }
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
  Shumway.Player.Shell.main(commandLineArguments)
}