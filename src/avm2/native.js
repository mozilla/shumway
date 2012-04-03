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

var classPatches = {
  "public$Array": [
    { instance: true, names: ["public$http$$$adobe$com$AS3$2006$builtin$push","public$push"], value: Array.prototype.push }
  ]
};

function patchBuiltinClass(cls) {
  var classQName = cls.classInfo.instance.name.getQualifiedName();
  var patches = classPatches[classQName];
  if (!patches) {
    return;
  }
  patches.forEach(function (patch) {
    var obj = patch.instance ? cls.prototype : cls;
    patch.names.forEach(function (name) {
      assert (name in obj);
      obj[name] = patch.value;
      if (traceExecution.value) {
        print("patched: " + (patch.instance ? " instance " : "") + name + " in class " + classQName);
      }
    });
  });
}
