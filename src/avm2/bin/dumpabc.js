load("../../../lib/DataView.js/DataView.js");

var SWF = {};
load("../../swf/util.js");
load("../../swf/types.js");
load("../../swf/structs.js");
load("../../swf/tags.js");
load("../../swf/inflate.js");
load("../../swf/stream.js");
load("../../swf/templates.js");
load("../../swf/generator.js");
load("../../swf/parser.js");
load("../../swf/bitmap.js");
load("../../swf/button.js");
load("../../swf/font.js");
load("../../swf/image.js");
load("../../swf/label.js");
load("../../swf/shape.js");
load("../../swf/text.js");

load("../util.js");
load("../options.js");
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
load("../interpreter.js");

function printUsage() {
  stdout.writeLn("dumpabc.js " + argumentParser.getUsage());
}

argumentParser.addArgument("h", "help", "boolean", {parse: function (x) { printUsage(); }});
var swfFile = argumentParser.addArgument("swf", "swf", "string", { positional: true });

try {
  argumentParser.parse(arguments);
} catch (x) {
  stdout.writeLn(x.message);
  quit();
}

function forEachABC(swf, cb) {
  var dictionary = { };
  var controlTags = [];
  var buffer = snarf(swf, "binary");

  SWF.parse(buffer, {
    onprogress: function(result) {
      var tags = result.tags.slice(i);
      var tag = tags[tags.length - 1];
      if (!('id' in tag) && !('ref' in tag)) {
        var pframes = cast(controlTags.concat(tags), dictionary, function (x) {});
        controlTags = [];
        var i = 0;
        var pframe;
        while (pframe = pframes[i++]) {
          var blocks = pframe.abcBlocks;
          if (blocks) {
            var j = 0;
            var block;
            while (block = blocks[j++]) {
              cb(block);
            }
          }
        }
      }
    },
  });
}

print (swfFile.value);

var writer = new IndentingWriter();
var first = true;
forEachABC(swfFile.value, function (bytes) {
  if (!first) {
    print ("---");
  }
  print (base64ArrayBuffer(bytes));
  first = false;
});
