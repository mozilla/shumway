var builtins = {
  "public$Object": {
    "staticProtected$Object$_setPropertyIsEnumerable": {
      value: function _setPropertyIsEnumerable(obj, name, isEnum) {
        Object.defineProperty(obj, name, {enumerable: isEnum});
      }
    }
  },
  "public$String": {
    "public$http$$$adobe$com$AS3$2006$builtin$charCodeAt": { instance: true, value: String.prototype.charCodeAt },
    "public$http$$$adobe$com$AS3$2006$builtin$fromCharCode": { value: String.fromCharCode },
    "public$http$$$adobe$com$AS3$2006$builtin$charAt": { instance: true, value: String.prototype.charAt },
    "private$String$_split": {
      value: function (self, delimiter, limit) {
        return String.prototype.split.call(self, delimiter, limit);
      }
    },
    "private$String$_replace": {
      value: function (self, pattern, repl) {
        print ("WWWW " + pattern + " - " + repl + " - " + self);
        return String.prototype.replace.call(self, pattern, repl);
      }
    },
    "public$http$$$adobe$com$AS3$2006$builtin$substring": { instance: true, value: String.prototype.substring }
  },
  "public$Array": {
    "public$http$$$adobe$com$AS3$2006$builtin$push": { instance: true, value: Array.prototype.push },
    "private$Array$_slice": {
      value: function (self, startIndex, endIndex) {
        return Array.prototype.slice.call(self, startIndex, endIndex);
      }
    },
    "private$Array$_concat": {
      value: function (self, array) {
        return Array.prototype.concat.apply(self, array);
      }
    }
  },
  "public$Number": {
    "private$Number$_minValue": {
      value: function _minValue() {
        return Number.MIN_VALUE;
      }
    },
    "private$Number$_numberToString": {
      value: function _numberToString(number) {
        return Number(number).toString();
      }
    }
  },
  "public$Math": {
    "public$floor": { value: Math.floor },
    "public$sqrt": { value: Math.sqrt },
    "public$ceil": { value: Math.ceil },
    "public$abs": { value: Math.abs },
    "public$max": { value: Math.max },
    "public$min": { value: Math.min }
  },
  "public$Date": {
    "public$http$$$adobe$com$AS3$2006$builtin$getTime": { instance: true, value: Date.prototype.getTime }
  },
  "public$Error": {
    "public$getErrorMessage": {
      value: function(errorID) {
        return "ERROR: " + errorID;
      }
    }
  },
  "script": {
    "public$trace": {
      value: function trace(message) {
        print(message);
      }
    },
    "public$parseInt": { value: parseInt }

//    "public$http$$$adobe$com$AS3$2006$builtin$charCodeAt": {
//      value: String.prototype.charCodeAt
//    }
  }
};

function getBuiltin(trait) {
  var method = trait.method;
  var groupName;
  var instance = undefined;
  if (trait.holder instanceof ScriptInfo) {
    groupName = "script";
  } else if (trait.holder instanceof InstanceInfo) {
    groupName = trait.holder.name.getQualifiedName();
    instance = true;
  } else if (trait.holder instanceof ClassInfo) {
    groupName = trait.holder.instance.name.getQualifiedName();
  } else {
    groupName = "public";
  }
  var methodName = method.name.getQualifiedName();
  var methods = builtins[groupName];
  if (methods) {
    var builtin = methods[methodName];
    if (builtin && methods.hasOwnProperty(methodName) && builtin.instance === instance) {
      /* Because we add AS3 properties to Object.prototype, we cause all objects (JS and AS) to
       * inherit these properties. We need to make sure that the methodName property is really defined
       * in the builtin map, and not in the Object.prototype. */
      if (traceExecution.value) {
        print("intercepted builtin: " + (builtin.instance ? " instance " : "") + methodName + " in class " + groupName + " val: " + builtin.value);
      }
      return builtin.value;
    }
  }
  if (method.isNative()) {
    // print("HERE? " + methodName + " in " + groupName);
    return function() {
      print("Calling undefined native method: " + methodName + " in group: " + groupName + " instance: " + instance);
    };
  }
  return null;
}

function patchClassBuiltins(cls) {
  var className = cls.classInfo.instance.name.getQualifiedName();
  var methods = builtins[className];
  if (!methods) {
    return;
  }
  Object.keys(methods).forEach(function (builtinName) {
    var builtin = methods[builtinName];
    var obj = builtin.instance ? cls.prototype : cls;
    assert (builtinName in obj);
    obj[builtinName] = builtin.value;
    if (traceExecution.value) {
      print("patched: " + (builtin.instance ? " instance " : "") + builtinName + " in class " + className);
    }
  });
}


