function descAccessor(get, set) {
  return {
    get: get,
    set: set,
    configurable: true,
    enumerable: true
  };
}
function descConst(val) {
  return {
    value: val,
    configurable: true,
    enumerable: true
  };
}
function descLazyProp(name, getter) {
  return descAccessor(function () {
    var val = getter.call(this);
    Object.defineProperty(this, name, descProp(val));
    return val;
  });
}
function descMethod(fn) {
  return descProp(fn);
}
function descProp(val) {
  return {
    value: val,
    writable: true,
    enumerable: true
  };
}

function illegalOperation() {
  throw Error('Illegal Operation');
}
