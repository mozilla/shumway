/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var domainOptions = systemOptions.register(new OptionSet("Domain Options"));
var traceClasses = domainOptions.register(new Option("tc", "traceClasses", "boolean", false, "trace class creation"));
var traceDomain = domainOptions.register(new Option("td", "traceDomain", "boolean", false, "trace domain property access"));

var EXECUTION_MODE = {
  INTERPRET: 0x1,
  COMPILE: 0x2
};

function executeScript(script) {
  var abc = script.abc;
  if (disassemble.value) {
    abc.trace(new IndentingWriter());
  }
  if (traceExecution.value) {
    print("Executing: " + abc.name + " " + script);
  }
  release || assert(!script.executing && !script.executed);
  var global = new Global(script);
  if (abc.domain.allowNatives) {
    global[Multiname.getPublicQualifiedName("unsafeJSNative")] = getNative;
  }
  script.executing = true;
  var scope = new Scope(null, script.global);
  // XXX interpreted methods populate stack with every call, compiled don't
  // pushing current runtime to the stack, so Runtime.currentDomain is successful
  createFunction(script.init, scope).call(script.global);
  script.executed = true;
}

function ensureScriptIsExecuted(script, reason) {
  if (!script.executed && !script.executing) {
    if (traceExecution.value >= 2) {
      print("Executing Script For: " + reason);
    }
    executeScript(script);
  }
}

var Glue = createEmptyObject();
Glue.PUBLIC_PROPERTIES = 0x1;
Glue.PUBLIC_METHODS    = 0x2;
Glue.ALL               = Glue.PUBLIC_PROPERTIES | Glue.PUBLIC_METHODS;

var Domain = (function () {

  function Domain(vm, base, mode, allowNatives) {
    assert (vm instanceof AVM2, vm);
    assert (isNullOrUndefined(base) || base instanceof Domain);

    this.vm = vm;

    // ABCs that belong to this domain.
    this.abcs = [];

    // ABCs that have been loaded
    this.loadedAbcs = {};

    // Classes that have been loaded.
    this.loadedClasses = [];

    // Classes cache.
    this.classCache = createEmptyObject();

    // Script cache.
    this.scriptCache = createEmptyObject();

    // Class Info cache.
    this.classInfoCache = createEmptyObject();

    // Our parent.
    this.base = base;

    // Do we allow natives?
    this.allowNatives = allowNatives;

    // Do we compile or interpret?
    this.mode = mode;

    this.onMessage = new Callback();

    // If we are the system domain (the root), we should initialize the Class
    // and MethodClosure classes.
    if (base) {
      this.system = base.system;
    } else {
      this.system = this;
    }
  }

  Domain.passthroughCallable = function passthroughCallable(f) {
    return {
      call: function ($this) {
        Array.prototype.shift.call(arguments);
        return f.apply($this, arguments);
      },
      apply: function ($this, args) {
        return f.apply($this, args);
      }
    };
  };

  Domain.coerceCallable = function coerceCallable(type) {
    return {
      call: function ($this, value) {
        return coerce(value, type);
      },
      apply: function ($this, args) {
        return coerce(args[0], type);
      }
    };
  };

  Domain.constructingCallable = function constructingCallable(instanceConstructor) {
    return {
      call: function ($this) {
        return new Function.bind.apply(instanceConstructor, arguments);
      },
      apply: function ($this, args) {
        return new Function.bind.apply(instanceConstructor, [$this].concat(args));
      }
    };
  };

  Domain.prototype = {
    getProperty: function getProperty(multiname, strict, execute) {
      var resolved = this.findDefiningScript(multiname, execute);
      if (resolved) {
        if (!resolved.script.executing) {
          // console.info("Getting " + multiname + " but script is not executed");
          return undefined;
        }
        return resolved.script.global[Multiname.getQualifiedName(resolved.trait.name)];
      }
      if (strict) {
        return unexpected("Cannot find property " + multiname);
      }

      return undefined;
    },

    getClass: function getClass(simpleName) {
      var cache = this.classCache;
      var c = cache[simpleName];
      if (!c) {
        c = cache[simpleName] = this.getProperty(Multiname.fromSimpleName(simpleName), true, true);
      }
      release || assert(c instanceof Class);
      return c;
    },

    findClass: function findClass(simpleName) {
      if (simpleName in this.classCache) {
        return true;
      }
      return this.findDomainProperty(Multiname.fromSimpleName(simpleName), false, true);
    },

    findDomainProperty: function findDomainProperty(multiname, strict, execute) {
      if (traceDomain.value) {
        print("Domain.findDomainProperty: " + multiname);
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

    findClassInfo: function findClassInfo(mn) {
      var originalQn; // Remember for later in this function
      if (Multiname.isQName(mn)) {
        // This deals with the case where mn is already a qn.
        originalQn = Multiname.getQualifiedName(mn);
        var ci = this.classInfoCache[originalQn];
        if (ci) {
          return ci;
        }
      } else {
        var ci = this.classInfoCache[mn.id];
        if (ci) {
          return ci;
        }
      }
      if (this.base) {
        // Recurse with the mn as is.
        ci = this.base.findClassInfo(mn);
        if (ci) {
          return ci;
        }
      }
      // The class info may be among the loaded ABCs, go looking for it.
      var abcs = this.abcs;
      for (var i = 0; i < abcs.length; i++) {
        var abc = abcs[i];
        var scripts = abc.scripts;
        for (var j = 0; j < scripts.length; j++) {
          var script = scripts[j];
          var traits = script.traits;
          for (var k = 0; k < traits.length; k++) {
            var trait = traits[k];
            if (trait.isClass()) {
              var traitName = Multiname.getQualifiedName(trait.name);
              // So here mn is either a Multiname or a QName.
              if (originalQn) {
                if (traitName === originalQn) {
                  return (this.classInfoCache[originalQn] = trait.classInfo);
                }
              } else {
                for (var m = 0, n = mn.namespaces.length; m < n; m++) {
                  var qn = mn.getQName(m);
                  if (traitName === Multiname.getQualifiedName(qn)) {
                    return (this.classInfoCache[qn] = trait.classInfo);
                  }
                }
              }
            }
          }
        }
      }
      // Still no luck, so let's ask host to load the defining ABC and try again.
      if (!this.base && this.vm.findDefiningAbc) {
        var abc = this.vm.findDefiningAbc(mn);
        if (abc !== null && !this.loadedAbcs[abc.name]) {
          this.loadedAbcs[abc.name] = true;
          this.loadAbc(abc);
          return this.findClassInfo(mn);
        }
      }
      return undefined;
    },

    installNative: function(name, func) {
      natives[name] = function() {
        return func;
      };
    },

    /**
     * Find the first script that defines a multiname.
     *
     * ABCs are added to the list in load order, so a later loaded ABC with a
     * definition of conflicting name will never be resolved.
     */
    findDefiningScript: function findDefiningScript(mn, execute) {
      var resolved = this.scriptCache[mn.id];
      if (resolved && (resolved.script.executed || !execute)) {
        return resolved;
      }

      if (this.base) {
        resolved = this.base.findDefiningScript(mn, execute);
        if (resolved) {
          return resolved;
        }
      }

      Counter.count("Domain: findDefiningScript");

      var abcs = this.abcs;
      for (var i = 0; i < abcs.length; i++) {
        var abc = abcs[i];
        var scripts = abc.scripts;
        for (var j = 0; j < scripts.length; j++) {
          var script = scripts[j];
          var traits = script.traits;
          if (mn instanceof Multiname) {
            for (var k = 0; k < traits.length; k++) {
              var trait = traits[k];
              if (mn.hasQName(trait.name)) {
                if (execute) {
                  ensureScriptIsExecuted(script, trait.name);
                }
                return (this.scriptCache[mn.id] = { script: script, trait: trait });
              }
            }
          } else {
            unexpected();
          }
        }
      }

      // Ask host to execute the defining ABC
      if (!this.base && this.vm.findDefiningAbc) {
        var abc = this.vm.findDefiningAbc(mn);
        if (abc !== null && !this.loadedAbcs[abc.name]) {
          this.loadedAbcs[abc.name] = true;
          this.loadAbc(abc);
          return this.findDefiningScript(mn, execute);
        }
      }

      return undefined;
    },

    executeAbc: function executeAbc(abc) {
      console.time("Execute ABC: " + abc.name);
      this.loadAbc(abc);
      executeScript(abc.lastScript);
      console.timeEnd("Execute ABC: " + abc.name);
    },

    loadAbc: function loadAbc(abc) {
      if (traceExecution.value) {
        print("Loading: " + abc.name);
      }
      abc.domain = this;
      this.abcs.push(abc);
      if (!this.base) {
        Type.initializeTypes(this);
      }
    },

    broadcastMessage: function (type, message, origin) {
      if ($DEBUG) {
        Timer.start("broadcast: " + message._type);
      }
      this.onMessage.notify1(type, {
        data: message,
        origin: origin,
        source: this
      });
      if ($DEBUG) {
        Timer.stop();
      }
    },

    traceLoadedClasses: function (lastOnly) {
      var writer = new IndentingWriter();
      lastOnly || writer.enter("Loaded Classes And Interfaces");
      var classes = lastOnly ? [this.loadedClasses.last()] : this.loadedClasses;
      classes.forEach(function (cls) {
        if (cls !== Class) {
          cls.trace(writer);
        }
      });
      lastOnly || writer.leave("");
    }
  };

  return Domain;

})();
