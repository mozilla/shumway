var fs = require('fs');
var esprima = require('esprima');
var estraverse = require('estraverse');

var arguments = process.argv;
if (arguments.length < 3) {
  quit(0);
}
var passPatterns = [];
var failPatterns = [];
var failExceptionPatterns = [];

fs.readFileSync("utils/spell/dictionary").toString().split("\n").forEach(function (k) {
  if (k[0] === "-") {
    failPatterns.push(k.substring(1));
  } else if (k[0] === "+") {
    passPatterns.push(k.substring(1));
  } else if (k[0] === "~") {
    failExceptionPatterns.push(k.substring(1));
  }
});

for (var i = 2; i < arguments.length; i++) {
  var file = arguments[i];
  var identifiers = Object.create(null);
  var comments = [];

  var ast = esprima.parse(fs.readFileSync(file), {loc: true, comment: true});
  // console.log(JSON.stringify(esprima.parse(fs.readFileSync(file)), null, 4));
  estraverse.traverse(ast, {
    leave: function (node, parent) {
      if (node.comments) {
        comments.push.apply(comments, node.comments);
      }
      if (node.type == 'Identifier') {
        // console.log(node.name + " @ " + node.loc.start.line);
        if (!identifiers[node.name]) {
          identifiers[node.name] = file + ":" + node.loc.start.line;
        }
      }
    }
  });

  for (var k in identifiers) {
    var words = [k]; // split(k);
    for (var j = 0; j < words.length; j++) {
      var word = words[j];
      if (isFailWord(word)) {
        var location = identifiers[k]
        console.info("Identifier \"" + k + "\" (" + word + ")" + " is a fail word. " + location);
        continue;
      }
      if (!isPassWord(word)) {
        var location = identifiers[k]
        console.info("Identifier \"" + k + "\" (" + word + ")" + " is not a pass word. " + location);
      }
    }
  }

  comments.forEach(function (comment) {
    var commentValue = comment.value;
    if (comment.type === "Line" && commentValue.indexOf("<reference") >= 0) {
      // Ignore TS references. ///<reference ...
      return;
    }
    // Ignore tslint comments.
    if (commentValue.indexOf("tslint") >= 0) {
      return;
    }

    var commentTokens = commentValue.trim().match(/[a-zA-Z0-9]+/g);
    if (commentTokens) {
      for (var i = 0; i < commentTokens.length; i++) {
        var token = commentTokens[i];
        var words = [token];
        for (var j = 0; j < words.length; j++) {
          var word = words[j];
          if (isFailWord(word)) {
            var location = identifiers[k]
            console.info("Comment \"" + word + "\" is a fail word. " + file + ":" + comment.loc.start.line);
            continue;
          }
          if (!isPassWord(word)) {
            console.info("Comment \"" + word + "\" is not a pass word. " + file + ":" + comment.loc.start.line);
          }
        }
      }
    }
  });
}

function isPassWord(name) {
  for (var i = 0; i < passPatterns.length; i++) {
    if (name.match(passPatterns[i])) {
      return true;
    }
  }
  return false;
}

function isFailWord(name) {
  for (var i = 0; i < failPatterns.length; i++) {
    if (name.match(failPatterns[i])) {
      return !isFailExceptionWord(name);
    }
  }
  return false;
}

function isFailExceptionWord(name) {
  for (var i = 0; i < failExceptionPatterns.length; i++) {
    if (name.match(failExceptionPatterns[i])) {
      return true;
    }
  }
  return false;
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