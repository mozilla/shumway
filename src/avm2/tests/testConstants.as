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
