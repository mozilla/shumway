var fs = require("fs");

var REF = "../../src/flash.ts/references.ts";
var INSPECTOR = "../../examples/inspector/inspector.html";

var references = fs.readFileSync(REF, { encoding: "utf8" });
var inspector = fs.readFileSync(INSPECTOR, { encoding: "utf8" });

function patchInspectorInclude(match) {
  var isIncluded = typeof match[1] === "undefined";
  var path = match[2].replace("/", "\\/");
  var regexInspector = new RegExp('(<!--)?(<script src="\.\.\/\.\.\/src\/flash\.ts\/(' + path + ')\.js"><\/script>)(-->)?', "ig");
  var replaceWith = isIncluded ? "$2" : "<!--$2-->";
  inspector = inspector.replace(regexInspector, replaceWith);
}

var regexRef = /(\/\/ )?\/\/\/<reference path='(.*)\.ts' \/>/ig;
var matchRef;
while(matchRef = regexRef.exec(references)) {
  if (matchRef[2].indexOf("../") !== 0) {
    patchInspectorInclude(matchRef);
  }
}

fs.writeFileSync(INSPECTOR, inspector, { encoding: "utf8" });
