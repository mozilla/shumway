var natives = {
  "public$trace": function trace(message) {
    print(message);
  },
  "staticProtected$Object$_setPropertyIsEnumerable": function _setPropertyIsEnumerable(obj, name, isEnum) {
    Object.defineProperty(obj, name, {enumerable: isEnum});
  },
  "private$Number$_minValue": function _minValue() {
    return Number.MIN_VALUE;
  }
};
