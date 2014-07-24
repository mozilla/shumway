var fs = require('fs');
var esprima = require('esprima');
var estraverse = require('estraverse');

var arguments = process.argv;
if (arguments.length > 2) {
  var identifiers = Object.create(null);
  for (var i = 2; i < arguments.length; i++) {
    var file = arguments[i];
    var ast = esprima.parse(fs.readFileSync(file), {loc: true});
    // console.log(JSON.stringify(esprima.parse(fs.readFileSync(file)), null, 4));
    estraverse.traverse(ast, {
      leave: function (node, parent) {
        if (node.type == 'Identifier') {
          // console.log(node.name + " @ " + node.loc.start.line);
          if (!identifiers[node.name]) {
            identifiers[node.name] = file + ":" + node.loc.start.line;
          }
        }
      }
    });
  }


  var dictionary = Object.create(null);

  fs.readFileSync("utils/spell/dictionary").toString().split("\n").forEach(function (k) {
    dictionary[k] = true;
  });

  for (var k in identifiers) {
    var words = split(k);
    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      if (!dictionary[word.toLowerCase()]) {
        var location = identifiers[k]
        console.info("Identifier \"" + k + "\" (" + word + ")" + " is not a word. " + location);
      }
    }
  }
}

function unCamelCase(name) {
  return name
    // insert a space between lower & upper
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // space before last upper in a sequence followed by lower
    .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3');
}

function split(name) {
  // It's okay to have names prefixed with "_".
  if (name[0] === "_") {
    name = name.substring(1);
  }
  if (name.toUpperCase() === name) {
    return name.split("_");
  }
  return unCamelCase(name).split(" ");
}