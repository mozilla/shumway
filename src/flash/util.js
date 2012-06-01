function descProperty(val, enumerable, writable, configurable) {
  return {
    value: val,
    enumerable: enumerable,
    writable: writable,
    configurable: configurable
  };
}
function descMethod(func, enumerable, writable, configurable) {
  return descProperty(func, enumerable, writable, configurable);
}
function descAccessor(get, set, enumerable, writable, configurable) {
  return {
    get: get,
    set: set,
    enumerable: enumerable,
    writable: writable,
    configurable: configurable
  };
}
function descConst(val) {
  return { value:  val };
}
