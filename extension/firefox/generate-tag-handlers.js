load("../../src/swf/util.js");
load("../../src/swf/types.js");
load("../../src/swf/structs.js");
load("../../src/swf/tags.js");
load("../../src/swf/templates.js");
load("../../src/swf/handlers.js");
load("../../src/swf/generator.js");

var members = [];

for (var tag in tagHandler) {
  var handler = tagHandler[tag];
  if (typeof handler === 'object') {
  	members.push(tag + ':' + generateParser(handler, 'swfVersion', 'tagCode'));
  }
}

print('var tagHandler={\n');
print(members.join(',\n'));
print('}\n');

print('var readHeader = ' + generateParser(MOVIE_HEADER) + ';\n');
