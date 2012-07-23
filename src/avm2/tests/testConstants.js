// These arrays are copied verbatim from testConstants.as
var strings = [
    "Hello world",  // ascii chars
    "\u00A5",       // "¥" - 2 bytes of utf8
    "\u20AC",       // "€" - 3 bytes
    "\uD83C\uDF55", // \u1f355 "slice of pizza" - 4 bytes
];

var doubles = [
    3.14159,
    0.0001,
    -0.0001,
    1000.01,
    -1000.01,
    1.23e100,
    -1.23e100,
    9.87e-100,
    -9.87e-100,
];

load("../../../lib/DataView.js/DataView.js");

load("../constants.js");
load("../parser.js");
var abc = parseAbcFile(snarf("testConstants.abc", "binary"));
var constants = abc.constantPool;

for(var i = 0; i < strings.length; i++) {
    if (strings[i] !== constants.strings[i+1])
        print("String constant " + strings[i] + " failed");
}

for(var i = 0; i < doubles.length; i++) {
    if (doubles[i] !== constants.doubles[i+1])
        print("Double constant " + doubles[i] + " failed");
}

