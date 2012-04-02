var natives = {
  "public$trace": function (message) {
    print(message);
  },
  "staticProtected$Object$_setPropertyIsEnumerable": function (obj, name, isEnum) {
    Object.defineProperty(obj, name, {enumerable: isEnum});
  }
};