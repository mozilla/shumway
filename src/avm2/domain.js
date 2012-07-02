var domainOptions = systemOptions.register(new OptionSet("Domain Options"));
var traceClasses = domainOptions.register(new Option("tc", "traceClasses", "boolean", false, "trace class creation"));
var traceDomain = domainOptions.register(new Option("tdpa", "traceDomain", "boolean", false, "trace domain property access"));

const ALWAYS_INTERPRET = 0x1;
const HEURISTIC_JIT = 0x2;

var Domain = (function () {

  function Domain(base, mode, allowNatives) {
    // ABCs that belong to this domain.
    this.abcs = [];

    // Classes that have been loaded.
    this.loadedClasses = [];

    // Classes cache.
    this.cache = {};

    // Our parent.
    this.base = base;

    // Do we allow natives?
    this.allowNatives = allowNatives;

    // Do we compile or interpret?
    this.mode = mode;
  }

  function executeScript(abc, script) {
    if (disassemble.value) {
      abc.trace(new IndentingWriter());
    }
    if (traceExecution.value) {
      print("Executing: " + abc.name);
    }
    assert(!script.executing && !script.executed);
    script.executing = true;
    abc.runtime.createFunction(script.init, null).call(script.global);
    script.executed = true;
  }

  function ensureScriptIsExecuted(abc, script) {
    if (!script.executed && !script.executing) {
      executeScript(abc, script);
    }
  }

  Domain.prototype = {
    getProperty: function getProperty(multiname, strict, execute) {
      var resolved = this.findDefiningScript(multiname, execute);
      if (resolved) {
        return resolved.script.global[resolved.name.getQualifiedName()];
      }
      if (strict) {
        return unexpected("Cannot find property " + multiname);
      }

      return undefined;
    },

    getClass: function getClass(simpleName) {
      var cache = this.cache;
      var c = cache[simpleName];
      if (!c) {
        c = cache[simpleName] = this.getProperty(Multiname.fromSimpleName(simpleName), true, true);
      }
      assert(c instanceof Class);
      return c;
    },

    findProperty: function findProperty(multiname, strict, execute) {
      if (traceDomain.value) {
        print("Domain.findProperty: " + multiname);
      }
      var resolved = this.findDefiningScript(multiname, execute);
      if (resolved) {
        return resolved.script.global;
      }
      if (strict) {
        return unexpected("Cannot find property " + multiname);
      } else {
        return undefined;
      }
      return undefined;
    },

    /**
     * Find the first script that defines a multiname.
     *
     * ABCs are added to the list in load order, so a later loaded ABC with a
     * definition of conflicting name will never be resolved.
     */
    findDefiningScript: function findDefiningScript(multiname, execute) {
      if (this.base) {
        var resolved = this.base.findDefiningScript(multiname, execute);
        if (resolved) {
          return resolved;
        }
      }

      var abcs = this.abcs;
      for (var i = 0, j = abcs.length; i < j; i++) {
        var abc = abcs[i];
        var scripts = abc.scripts;
        for (var k = 0, l = scripts.length; k < l; k++) {
          var script = scripts[k];
          if (!script.loaded) {
            continue;
          }
          var global = script.global;
          if (multiname.isQName()) {
            if (global.hasOwnProperty(multiname.getQualifiedName())) {
              if (traceDomain.value) {
                print("Domain findDefiningScript: " + multiname + " in " + abc + ", script: " + k);
                print("Script is executed ? " + script.executed + ", should we: " + execute + " is it in progress: " + script.executing);
                print("Value is: " + script.global[multiname.getQualifiedName()]);
              }
              if (execute) {
                ensureScriptIsExecuted(abc, script);
              }
              return { script: script, name: multiname };
            }
          } else {
            var resolved = resolveMultiname(global, multiname, false);
            if (resolved) {
              if (execute) {
                ensureScriptIsExecuted(abc, script);
              }
              return { script: script, name: resolved };
            }
          }
        }
      }
      return undefined;
    },

    executeAbc: function executeAbc(abc) {
      this.loadAbc(abc);
      executeScript(abc, abc.lastScript);
      if (traceClasses.value) {
        this.traceLoadedClasses();
      }
    },

    loadAbc: function loadAbc(abc) {
      if (traceExecution.value) {
        print("Loading: " + abc.name);
      }

      abc.domain = this;
      var runtime = new Runtime(abc);
      abc.runtime = runtime;

      /**
       * Initialize all the scripts inside the abc block and their globals in
       * reverse order, since some content depends on the last script being
       * initialized first or some shit.
       */
      var scripts = abc.scripts;
      var allowNatives = this.allowNatives;
      for (var i = scripts.length - 1; i >= 0; i--) {
        var script = scripts[i];
        var global = new Global(runtime, script);

        if (allowNatives) {
          global.public$unsafeJSNative = getNative;
        }
      }

      this.abcs.push(abc);
    },

    traceLoadedClasses: function () {
      var writer = new IndentingWriter();
      function traceProperties(obj) {
        for (var key in obj) {
          var str = key;
          var descriptor = Object.getOwnPropertyDescriptor(obj, key);
          if (descriptor) {
            if (descriptor.get) {
              str += " getter";
            }
            if (descriptor.set) {
              str += " setter";
            }
            if (descriptor.value) {
              var value = obj[key];
              if (value instanceof Scope) {
                str += ": ";
                var scope = value;
                while (scope) {
                  assert (scope.object);
                  str += scope.object.debugName || "T";
                  if (scope = scope.parent) {
                    str += " <: ";
                  };
                }
              } else if (value instanceof Function) {
                str += ": " + (value.name ? value.name : "anonymous");
              } else if (value) {
                str += ": " + value;
              }
            }
          }
          writer.writeLn(str);
        }
      }
      writer.enter("Loaded Classes");
      this.loadedClasses.forEach(function (cls) {
        var description = cls.debugName + (cls.baseClass ? " extends " + cls.baseClass.debugName : "");
        writer.enter(description + " {");
        writer.enter("instance");
        traceProperties(cls.prototype);
        writer.leave("");
        writer.enter("static");
        traceProperties(cls);
        writer.leave("");
        writer.leave("}");
      });
      writer.leave("");
    }
  };

  return Domain;

})();
