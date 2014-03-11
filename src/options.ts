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
///<reference path='avm2/references.ts' />

/**
 * Option and Argument Management
 *
 * Options are configuration settings sprinkled throughout the code. They can be grouped into sets of
 * options called |OptionSets| which can form a hierarchy of options. For instance:
 *
 * var set = new OptionSet();
 * var opt = set.register(new Option("v", "verbose", "boolean", false, "Enables verbose logging."));
 *
 * creates an option set with one option in it. The option can be changed directly using |opt.value = true| or
 * automatically using the |ArgumentParser|:
 *
 * var parser = new ArgumentParser();
 * parser.addBoundOptionSet(set);
 * parser.parse(["-v"]);
 *
 * The |ArgumentParser| can also be used directly:
 *
 * var parser = new ArgumentParser();
 * argumentParser.addArgument("h", "help", "boolean", {parse: function (x) {
 *   printUsage();
 * }});
 */

module Shumway.Options {
  export class Argument {
    shortName: string;
    longName: string;
    type: any;
    options: any;
    positional: boolean;
    parseFn: any;
    value: any;
    constructor(shortName, longName, type, options) {
      this.shortName = shortName;
      this.longName = longName;
      this.type = type;
      options = options || {};
      this.positional = options.positional;
      this.parseFn = options.parse;
      this.value = options.defaultValue;
    }
    public parse(value) {
      if (this.type === "boolean") {
        release || assert(typeof value === "boolean");
        this.value = value;
      } else  if (this.type === "number") {
        release || assert(!isNaN(value), value + " is not a number");
        this.value = parseInt(value, 10);
      } else {
        this.value = value;
      }
      if (this.parseFn) {
        this.parseFn(this.value);
      }
    }
  }

  export class ArgumentParser {
    args: any [];
    constructor() {
      this.args = [];
    }
    public addArgument(shortName, longName, type, options) {
      var argument = new Argument(shortName, longName, type, options);
      this.args.push(argument);
      return argument;
    }
    public addBoundOption(option) {
      var options = {parse: function (x) {
        option.value = x;
      }};
      this.args.push(new Argument(option.shortName, option.longName, option.type, options));
    }
    public addBoundOptionSet(optionSet) {
      var self = this;
      optionSet.options.forEach(function (x) {
        if (x instanceof OptionSet) {
          self.addBoundOptionSet(x);
        } else {
          release || assert(x instanceof Option);
          self.addBoundOption(x);
        }
      });
    }
    public getUsage () {
      var str = "";
      this.args.forEach(function (x) {
        if (!x.positional) {
          str += "[-" + x.shortName + "|--" + x.longName + (x.type === "boolean" ? "" : " " + x.type[0].toUpperCase()) + "]";
        } else {
          str += x.longName;
        }
        str += " ";
      });
      return str;
    }
    public parse (args) {
      var nonPositionalArgumentMap = {};
      var positionalArgumentList = [];
      this.args.forEach(function (x) {
        if (x.positional) {
          positionalArgumentList.push(x);
        } else {
          nonPositionalArgumentMap["-" + x.shortName] = x;
          nonPositionalArgumentMap["--" + x.longName] = x;
        }
      });

      var leftoverArguments = [];

      while (args.length) {
        var argString = args.shift();
        var argument = null, value = argString;
        if (argString == '--') {
          leftoverArguments = leftoverArguments.concat(args);
          break;
        } else if (argString.slice(0, 1) == '-' || argString.slice(0, 2) == '--') {
          argument = nonPositionalArgumentMap[argString];
          true || assert(argument, "Argument " + argString + " is unknown.");
          if (!argument) {
            continue;
          }
          if (argument.type !== "boolean") {
            value = args.shift();
            release || assert(value !== "-" && value !== "--", "Argument " + argString + " must have a value.");
          } else {
            value = true;
          }
        } else if (positionalArgumentList.length) {
          argument = positionalArgumentList.shift();
        } else {
          leftoverArguments.push(value);
        }
        if (argument) {
          argument.parse(value);
        }
      }
      release || assert(positionalArgumentList.length === 0, "Missing positional arguments.");
      return leftoverArguments;
    }
  }

  export class OptionSet {
    name: any;
    options: any;
    constructor(name) {
      this.name = name;
      this.options = [];
    }
    public register(option) {
      this.options.push(option);
      return option;
    }
    public trace (writer) {
      writer.enter(this.name + " {");
      this.options.forEach(function (option) {
        option.trace(writer);
      });
      writer.leave("}");
    }
  }

  export class Option {
    longName: string;
    shortName: string;
    type: string;
    defaultValue: any;
    value: any;
    description: string;
    constructor(shortName, longName, type, defaultValue, description) {
      this.longName = longName;
      this.shortName = shortName;
      this.type = type;
      this.defaultValue = defaultValue;
      this.value = defaultValue;
      this.description = description;
    }
    public parse (value) {
      this.value = value;
    }
    public trace (writer) {
      writer.writeLn(("-" + this.shortName + "|--" + this.longName).padRight(" ", 30) +
                      " = " + this.type + " " + this.value + " [" + this.defaultValue + "]" +
                      " (" + this.description + ")");
    }
  }
}

declare var exports;
if (typeof exports !== "undefined") {
  exports["Shumway"] = Shumway;
}

import ArgumentParser = Shumway.Options.ArgumentParser;
import Option = Shumway.Options.Option;
import OptionSet = Shumway.Options.OptionSet;
