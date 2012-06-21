load("../../../lib/DataView.js/DataView.js");

load("../constants.js");
load("../parser.js");
try {
  var abc = parseAbcFile(snarf(arguments[0], "binary"));
  print("Constant pool for: " + arguments[0]);
  print(JSON.stringify(abc.constantPool, null, 2));
} catch (e) {
  print(e);
  print(e.stack);
}
