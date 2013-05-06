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

(function (exports) {
  var ArgumentParser = (function () {
    var Argument = (function () {
      function argument(shortName, longName, type, options) {
        this.shortName = shortName;
        this.longName = longName;
        this.type = type;
        options = options || {};
        this.positional = options.positional;
        this.parseFn = options.parse;
        this.value = options.defaultValue;
      }
      argument.prototype.parse = function parse(value) {
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
      };
      return argument;
    })();
    function argumentParser() {
      this.arguments = [];
    }
    argumentParser.prototype.addArgument = function addArgument(shortName, longName, type, options) {
      var argument = new Argument(shortName, longName, type, options);
      this.arguments.push(argument);
      return argument;
    };
    argumentParser.prototype.addBoundOption = function addBoundOption(option) {
      var options = {parse: function (x) {
        option.value = x;
      }};
      this.arguments.push(new Argument(option.shortName, option.longName, option.type, options));
    };
    argumentParser.prototype.addBoundOptionSet = function addBoundOptionSet(optionSet) {
      var self = this;
      optionSet.options.forEach(function (x) {
        if (x instanceof OptionSet) {
          self.addBoundOptionSet(x);
        } else {
          release || assert(x instanceof Option);
          self.addBoundOption(x);
        }
      });
    };
    argumentParser.prototype.getUsage = function getUsage() {
      var str = "";
      this.arguments.forEach(function (x) {
        if (!x.positional) {
          str += "[-" + x.shortName + "|--" + x.longName + (x.type === "boolean" ? "" : " " + x.type[0].toUpperCase()) + "]";
        } else {
          str += x.longName;
        }
        str += " ";
      });
      return str;
    };
    argumentParser.prototype.parse = function parse(args) {
      var nonPositionalArgumentMap = {};
      var positionalArgumentList = [];
      this.arguments.forEach(function (x) {
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
          release || assert(argument, "Argument " + argString + " is unknown.");
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
    };
    return argumentParser;
  })();

  var OptionSet = (function () {
    function optionSet (name) {
      this.name = name;
      this.options = [];
    }
    optionSet.prototype.register = function register(option) {
      this.options.push(option);
      return option;
    };
    optionSet.prototype.trace = function trace(writer) {
      writer.enter(this.name + " {");
      this.options.forEach(function (option) {
        option.trace(writer);
      });
      writer.leave("}");
    };
    return optionSet;
  })();

  var Option = (function () {
    function option(shortName, longName, type, defaultValue, description) {
      this.longName = longName;
      this.shortName = shortName;
      this.type = type;
      this.defaultValue = defaultValue;
      this.value = defaultValue;
      this.description = description;
    }
    option.prototype.parse = function parse(value) {
      this.value = value;
    };
    option.prototype.trace = function trace(writer) {
      writer.writeLn(("-" + this.shortName + "|--" + this.longName).padRight(" ", 30) +
                      " = " + this.type + " " + this.value + " [" + this.defaultValue + "]" +
                      " (" + this.description + ")");
    };
    return option;
  })();

  exports.Option = Option;
  exports.OptionSet = OptionSet;
  exports.ArgumentParser = ArgumentParser;

})(typeof exports === "undefined" ? (options = {}) : exports);
