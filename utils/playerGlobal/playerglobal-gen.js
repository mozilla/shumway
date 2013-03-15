// This script is used to generate 'playerglobal.js'.
// (based on src/avm2/bin/dumpabc.js)

load("../../lib/DataView.js/DataView.js");

this.self = this;
load("../../src/swf/swf.js");
load("../../src/swf/util.js");
load("../../src/swf/types.js");
load("../../src/swf/structs.js");
load("../../src/swf/tags.js");
load("../../src/swf/inflate.js");
load("../../src/swf/stream.js");
load("../../src/swf/templates.js");
load("../../src/swf/generator.js");
load("../../src/swf/handlers.js");
load("../../src/swf/parser.js");
load("../../src/swf/bitmap.js");
load("../../src/swf/button.js");
load("../../src/swf/font.js");
load("../../src/swf/image.js");
load("../../src/swf/label.js");
load("../../src/swf/shape.js");
load("../../src/swf/text.js");

load("../../src/avm2/util.js");

var str = snarf("catalog.json");
var obj = JSON.parse(str);
var abcs = obj.swc.libraries.library.script;
var catalog = {};
for (var i = 0; i < abcs.length; i++) {
  var abc = abcs[i];
  var abcname = abc["@name"];
  var defs = abc.def;
  var names = [];
  if (defs instanceof Array) {
    for (var j = 0; j < defs.length; j++) {
      names.push(defs[j]["@id"]);
    }
  } else {
    names.push(defs["@id"]);
  }
  catalog[abcname] = {defs: names};
}


SWF.parse(snarf("bin/library.swf", "binary"), {
  oncomplete: function(result) {
    var tags = result.tags;
    var abcCount = 0;
    var offset = 0;
    var files = [];
    for (var i = 0, n = tags.length; i < n; i++) {
      var tag = tags[i];
      if (tag.code === 82) {
        files.push({name: tag.name, offset: offset, length: + tag.data.length, data: tag.data});
        offset += tag.data.length;
      }
    }
    var bits = new Uint8Array(offset);
    var index = [];
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var name = file.name;
      bits.set(file.data, file.offset);
      index.push({name: file.name, offset: file.offset, length: file.length, defs: catalog[name].defs});
      delete file.data;
    }

    var out =
      "var playerGlobalNames = {};\n" +
      "var playerGlobalScripts = {};\n" +
      "(function () {\n" +
      "  var index = " + JSON.stringify(index, null, 2) + ";\n" +
      "  for (var i = 0; i < index.length; i++) {\n" +
      "    var abc = index[i];\n" +
      "    playerGlobalScripts[abc.name] = abc;\n" +
      "    if (typeof abc.defs === 'string') {\n" +
      "      playerGlobalNames[abc.defs] = abc.name;\n" +
      "    } else {\n" +
      "      for (var j = 0; j < abc.defs.length; j++) {\n" +
      "        var def = abc.defs[j];\n" +
      "        playerGlobalNames[def] = abc.name;\n" +
      "      }\n" +
      "    }\n" +
      "  }\n" +
      "})()";

    print(out);
  }
});
