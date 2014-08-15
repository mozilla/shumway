/*
 * Copyright 2014 Mozilla Foundation
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

///<reference path='references.ts' />
module Shumway.Options {
  import isObject = Shumway.isObject;
  import isNullOrUndefined = Shumway.isNullOrUndefined;
  import assert = Shumway.Debug.assert;

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
        if (argString === '--') {
          leftoverArguments = leftoverArguments.concat(args);
          break;
        } else if (argString.slice(0, 1) === '-' || argString.slice(0, 2) === '--') {
          argument = nonPositionalArgumentMap[argString];
          // release || assert(argument, "Argument " + argString + " is unknown.");
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
    name: string;
    settings: any;
    options: any;
    open: boolean = false;
    constructor(name: string, settings: any = null) {
      this.name = name;
      this.settings = settings || {};
      this.options = [];
    }
    public register(option) {
      if (option instanceof OptionSet) {
        // check for duplicate option sets (bail if found)
        for (var i = 0; i < this.options.length; i++) {
          var optionSet = this.options[i];
          if (optionSet instanceof OptionSet && optionSet.name === option.name) {
            return optionSet;
          }
        }
      }
      this.options.push(option);
      if (this.settings) {
        if (option instanceof OptionSet) {
          var optionSettings = this.settings[option.name];
          if (isObject(optionSettings)) {
            option.settings = optionSettings.settings;
            option.open = optionSettings.open;
          }
        } else {
          // build_bundle chokes on this:
          // if (!isNullOrUndefined(this.settings[option.longName])) {
          if (typeof this.settings[option.longName] !== "undefined") {
            switch (option.type) {
              case "boolean":
                option.value = !!this.settings[option.longName];
                break;
              case "number":
                option.value = +this.settings[option.longName];
                break;
              default:
                option.value = this.settings[option.longName];
                break;
            }
          }
        }
      }
      return option;
    }
    public trace(writer) {
      writer.enter(this.name + " {");
      this.options.forEach(function (option) {
        option.trace(writer);
      });
      writer.leave("}");
    }
    public getSettings() {
      var settings = {};
      this.options.forEach(function(option) {
        if (option instanceof OptionSet) {
          settings[option.name] = {
            settings: option.getSettings(),
            open: option.open
          };
        } else {
          settings[option.longName] = option.value;
        }
      });
      return settings;
    }
    public setSettings(settings: any) {
      if (!settings) {
        return;
      }
      this.options.forEach(function (option) {
        if (option instanceof OptionSet) {
          if (option.name in settings) {
            option.setSettings(settings[option.name].settings);
          }
        } else {
          if (option.longName in settings) {
            option.value = settings[option.longName];
          }
        }
      });
    }
  }

  export class Option {
    longName: string;
    shortName: string;
    type: string;
    defaultValue: any;
    value: any;
    description: string;
    config: any;
    /**
     * Dat GUI control.
     */
    // TODO remove, player will not have access to the DOM
    ctrl: any;
    // config:
    //  { range: { min: 1, max: 5, step: 1 } }
    //  { list: [ "item 1", "item 2", "item 3" ] }
    //  { choices: { "choice 1": 1, "choice 2": 2, "choice 3": 3 } }
    constructor(shortName, longName, type, defaultValue, description, config = null) {
      this.longName = longName;
      this.shortName = shortName;
      this.type = type;
      this.defaultValue = defaultValue;
      this.value = defaultValue;
      this.description = description;
      this.config = config;
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
