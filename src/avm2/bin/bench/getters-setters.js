function makeForwardingGetterClosure(target) {
  return function () {
    return this[target];
  }
}

function makeForwardingSetterClosure(target) {
  return function (value) {
    this[target] = value;
  }
}

function makeForwardingGetterFunction(target) {
  return new Function("return this[\"" + target + "\"]");
}

function makeForwardingSetterFunction(target) {
  return new Function("value", "this[\"" + target + "\"] = value;");
}

if (typeof print === "undefined") {
  print = console.info;
}

var start = new Date();
for (var i = 0; i < 100000; i++) {
  makeForwardingGetterFunction("X");
}
print("Make Getters: took: " + (new Date() - start));

start = new Date();
function X () {
  this.a = 1;
}
Object.defineProperty(X.prototype, "b", {
  get: makeForwardingGetterClosure("a"),
  set: makeForwardingSetterClosure("a")
});
var x = new X();
for (var i = 0; i < 5000000; i++) {
  x.b += i;
}
print("Closures on Prototype: " + x.a + " took: " + (new Date() - start));

start = new Date();
function Y () {
  this.a = 1;
}
Object.defineProperty(Y.prototype, "b", {
  get: makeForwardingGetterFunction("a"),
  set: makeForwardingSetterFunction("a")
});
var y = new Y();
for (var i = 0; i < 5000000; i++) {
  y.b += i;
}
print("Functions on Prototype: " + y.a + " took: " + (new Date() - start));

start = new Date();
x = {a: 1};
Object.defineProperty(x, "b", {
  get: makeForwardingGetterClosure("a"),
  set: makeForwardingSetterClosure("a")
});
for (var i = 0; i < 5000000; i++) {
  x.b += i;
}
print("Closures on Object: " + x.a + " took: " + (new Date() - start));

start = new Date();
y = {a: 1};
Object.defineProperty(y, "b", {
  get: makeForwardingGetterFunction("a"),
  set: makeForwardingSetterFunction("a")
});
for (var i = 0; i < 5000000; i++) {
  y.b += i;
}
print("Functions on Object: " + y.a + " took: " + (new Date() - start));