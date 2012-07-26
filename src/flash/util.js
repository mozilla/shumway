function describeAccessor(get, set) {
  return { get: get, set: set, configurable: true, enumerable: true };
}
function describeConst(val) {
  return { value: val, configurable: true, enumerable: true };
}
function describeInternalProperty(val) {
  return { value: val, writable: true };
}
function describeLazyProperty(name, getter) {
  return describeAccessor(function () {
    var val = getter.call(this);
    Object.defineProperty(this, name, describeProperty(val));
    return val;
  });
}
function describeMethod(fn) {
  return describeProperty(fn);
}
function describeProperty(val) {
  return { value: val, writable: true, configurable: true, enumerable: true };
}

function illegalOperation() {
  throw Error('Illegal Operation');
}
