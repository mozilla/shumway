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
var traceDomain = domainOptions.register(new Option("tdpa", "traceDomain", "boolean", false, "trace domain property access"));

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
  var global = new Global(abc.runtime, script);
  if (abc.domain.allowNatives) {
    global[Multiname.getPublicQualifiedName("unsafeJSNative")] = getNative;
  }
  script.executing = true;
  var scope = new Scope(null, script.global);
  // XXX interpreted methods populate stack with every call, compiled don't
  // pushing current runtime to the stack, so Runtime.currentDomain is successful
  Runtime.stack.push(abc.runtime);
  abc.runtime.createFunction(script.init, scope).call(script.global);
  Runtime.stack.pop();
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

    // Storage for custom natives
    this.natives = {};

    this.onClassCreated = new Callback();

    this.onMessage = new Callback();

    // If we are the system domain (the root), we should initialize the Class
    // and MethodClosure classes.
    if (base) {
      this.system = base.system;
    } else {
      this.system = this;

      var OWN_INITIALIZE   = 0x1;
      var SUPER_INITIALIZE = 0x2;

      var Class = this.Class = function Class(name, instance, callable) {
        this.debugName = name;

        if (instance) {
          release || assert(instance.prototype);
          this.instance = instance;
          this.instanceNoInitialize = instance;
          this.hasInitialize = 0;
          this.instance.class = this;
        }

        if (!callable) {
          callable = Domain.coerceCallable(this);
        } else if (callable === Domain.coerceCallable) {
          callable = Domain.coerceCallable(this);
        }
        defineNonEnumerableProperty(this, "call", callable.call);
        defineNonEnumerableProperty(this, "apply", callable.apply);
      };

      function setDefaultProperties(cls) {
        defineNonEnumerableProperty(cls.dynamicPrototype, Multiname.getPublicQualifiedName("constructor"), cls);
        defineReadOnlyProperty(cls.traitsPrototype, "class", cls);
        defineReadOnlyProperty(cls.instance, "class", cls);
        defineObjectShape(cls.traitsPrototype);
      }

      Class.prototype = {
        setSymbol: function setSymbol(props) {
          this.instance.prototype.symbol = props;
        },

        getSymbol: function getSymbol() {
          return this.instance.prototype.symbol;
        },

        initializeInstance: function initializeInstance(obj) {
          // Initialize should be nullary and nonrecursive. If the script
          // needs to pass in script objects to native land, there's usually a
          // ctor function.
          var c = this;
          var initializes = [];
          while (c) {
            if (c.hasInitialize & OWN_INITIALIZE) {
              initializes.push(c.instance.prototype.initialize);
            }
            c = c.baseClass;
          }
          var s;
          while ((s = initializes.pop())) {
            s.call(obj);
          }
          Counter.count("Initialize: " + this.classInfo.instanceInfo.name);
        },

        createInstance: function createInstance(args) {
          var o = Object.create(this.instance.prototype);
          this.instance.apply(o, args);
          return o;
        },

        createAsSymbol: function createAsSymbol(props) {
          var o = Object.create(this.instance.prototype);
          // Custom classes will have already have .symbol linked.
          if (o.symbol) {
            var symbol = Object.create(o.symbol);
            for (var prop in props) {
              symbol[prop] = props[prop];
            }
            o.symbol = symbol;
          } else {
            o.symbol = props;
          }
          return o;
        },

        extendNative: function (baseClass, native) {
          this.baseClass = baseClass;
          this.dynamicPrototype = Object.getPrototypeOf(native.prototype);
          this.instance.prototype = this.traitsPrototype = native.prototype;
          setDefaultProperties(this);
        },

        extendBuiltin: function(baseClass) {
          release || assert (baseClass);
          // Some natives handle their own prototypes/it's impossible to do the
          // traits/public prototype BS, e.g. Object, Array, etc.
          // FIXME: This is technically non-semantics preserving.
          this.baseClass = baseClass;
          this.dynamicPrototype = this.traitsPrototype = this.instance.prototype;
          setDefaultProperties(this);
        },

        extend: function (baseClass) {
          release || assert (baseClass);
          this.baseClass = baseClass;
          this.dynamicPrototype = Object.create(baseClass.dynamicPrototype);
          if (baseClass.hasInitialize) {
            var instanceNoInitialize = this.instance;
            var self = this;
            this.instance = function () {
              self.initializeInstance(this);
              instanceNoInitialize.apply(this, arguments);
            };
            defineReadOnlyProperty(this.instance, "class", instanceNoInitialize.class);
            this.hasInitialize |= SUPER_INITIALIZE;
          }
          this.instance.prototype = this.traitsPrototype = Object.create(this.dynamicPrototype);
          setDefaultProperties(this);
        },

        setDefaultProperties: function () {
          setDefaultProperties(this);
        },

        link: function (definition) {
          release || assert(definition);
          release || assert(this.dynamicPrototype);

          if (definition.initialize) {
            if (!this.hasInitialize) {
              var instanceNoInitialize = this.instance;
              var self = this;
              this.instance = function () {
                self.initializeInstance(this);
                instanceNoInitialize.apply(this, arguments);
              };
              defineReadOnlyProperty(this.instance, "class", instanceNoInitialize.class);
              this.instance.prototype = instanceNoInitialize.prototype;
            }
            this.hasInitialize |= OWN_INITIALIZE;
          }

          var dynamicPrototype = this.dynamicPrototype;
          var keys = Object.keys(definition);
          for (var i = 0; i < keys.length; i++) {
            var propertyName = keys[i];
            Object.defineProperty(dynamicPrototype, propertyName, Object.getOwnPropertyDescriptor(definition, propertyName));
          }

          function glueProperties(obj, properties) {
            var keys = Object.keys(properties);
            for (var i = 0; i < keys.length; i++) {
              var propertyName = keys[i];
              var propertySimpleName = properties[propertyName];
              assert (isString(propertySimpleName), "Make sure it's not a function.");
              var qn = Multiname.getQualifiedName(Multiname.fromSimpleName(propertySimpleName));
              release || assert(isString(qn));
              var descriptor = Object.getOwnPropertyDescriptor(obj, qn);
              if (descriptor && descriptor.get) {
                Object.defineProperty(obj, propertyName, descriptor);
              } else {
                Object.defineProperty(obj, propertyName, {
                  get: new Function("", "return this." + qn),
                  set: new Function("v", "this." + qn + " = v")
                });
              }
            }
          }

          function generatePropertiesFromTraits(traits) {
            var properties = createEmptyObject();
            traits.forEach(function (trait) {
              var ns = trait.name.getNamespace();
              if (!ns.isPublic()) {
                return;
              }
              properties[trait.name.getName()] = "public " + trait.name.getName();
            });
            return properties;
          }

          var glue = definition.__glue__;
          if (!glue) {
            return;
          }

          // Accessors for script properties from within AVM2.
          if (glue.script) {
            if (glue.script.instance) {
              if (isNumber(glue.script.instance)) {
                assert (glue.script.instance === Glue.ALL);
                glueProperties(dynamicPrototype, generatePropertiesFromTraits(this.classInfo.instanceInfo.traits));
              } else {
                glueProperties(dynamicPrototype, glue.script.instance);
              }
            }
            if (glue.script.static) {
              if (isNumber(glue.script.static)) {
                assert (glue.script.static === Glue.ALL);
                glueProperties(this, generatePropertiesFromTraits(this.classInfo.traits));
              } else {
                glueProperties(this, glue.script.static);
              }
            }
          }
        },

        linkNatives: function (definition) {
          var glue = definition.__glue__;
          // assert (glue && glue.native);
          // Binding to member methods marked as [native].
          this.native = glue.native;
        },

        verify: function () {
          var instance = this.instance;
          var tP = this.traitsPrototype;
          var dP = this.dynamicPrototype;
          assert (instance && tP && dP);
          assert (tP === instance.prototype);
          assert (dP === instance.prototype || dP === Object.getPrototypeOf(instance.prototype));
          assert (isClass(this));
          if (tP !== Object.prototype) {
            // We don't want to put "class" and "shape" on the Object.prototype.
            assert (Object.hasOwnProperty.call(tP, "class"));
            assert (Object.hasOwnProperty.call(tP, "shape"), "Classes should have a shape ID.");
          }
          assert (instance.class === this);
        },

        coerce: function (value) {
          return value;
        },

        isInstanceOf: function (value) {
          // TODO: Fix me.
          return this.isInstance(value);
        },

        isInstance: function (value) {
          if (value === null || typeof value !== "object") {
            return false;
          }
          return this.dynamicPrototype.isPrototypeOf(value);
        },

        toString: function () {
          return "[class " + this.classInfo.instanceInfo.name.name + "]";
        }
      };

      var callable = Domain.coerceCallable(Class);
      defineNonEnumerableProperty(Class, "call", callable.call);
      defineNonEnumerableProperty(Class, "apply", callable.apply);

      Class.instance = Class;
      Class.toString = Class.prototype.toString;

      // Traits are below the dynamic instant prototypes,
      // i.e. this.dynamicPrototype === Object.getPrototypeOf(this.instance.prototype)
      // and we cache the dynamic instant prototype as this.dynamicPrototype.
      //
      // Traits are not visible to the AVM script.
      Class.native = {
        instance: {
          prototype: {
            get: function () { return this.dynamicPrototype; }
          }
        }
      };

      var MethodClosure = this.MethodClosure = function MethodClosure($this, fn) {
        var bound = safeBind(fn, $this);
        defineNonEnumerableProperty(this, "call", bound.call.bind(bound));
        defineNonEnumerableProperty(this, "apply", bound.apply.bind(bound));
      };

      MethodClosure.prototype = {
        toString: function () {
          return "function Function() {}";
        }
      };
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

  Domain.constructingCallable = function constructingCallable(instance) {
    return {
      call: function ($this) {
        return new Function.bind.apply(instance, arguments);
      },
      apply: function ($this, args) {
        return new Function.bind.apply(instance, [$this].concat(args));
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
      release || assert(c instanceof this.system.Class);
      return c;
    },

    findClass: function findClass(simpleName) {
      if (simpleName in this.classCache) {
        return true;
      }
      return this.findProperty(Multiname.fromSimpleName(simpleName), false, true);
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

    findClassInfo: function findClassInfo(mn) {
      release || Multiname.isQName(mn);
      var qn = Multiname.getQualifiedName(mn);

      var ci = this.classInfoCache[qn];
      if (ci) {
        return ci;
      }
      if (this.base) {
        ci = this.base.findClassInfo(mn);
        if (ci) {
          return ci;
        }
      }
      var abcs = this.abcs;
      for (var i = 0; i < abcs.length; i++) {
        var abc = abcs[i];
        var scripts = abc.scripts;
        for (var j = 0; j < scripts.length; j++) {
          var script = scripts[j];
          var traits = script.traits;
          for (var k = 0; k < traits.length; k++) {
            var trait = traits[k];
            if (trait.isClass() && Multiname.getQualifiedName(trait.name) == qn) {
              return (this.classInfoCache[qn] = trait.classInfo);
            }
          }
        }
      }

      // Ask host to load the defining ABC
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
      if (traceClasses.value) {
        this.traceLoadedClasses();
      }
      console.timeEnd("Execute ABC: " + abc.name);
    },

    loadAbc: function loadAbc(abc) {
      if (traceExecution.value) {
        print("Loading: " + abc.name);
      }
      abc.domain = this;
      this.abcs.push(abc);
      abc.runtime = new Runtime(abc);
      if (!this.base) {
        Type.initializeTypes(this);
      }
    },

    broadcastMessage: function (message, origin) {
      this.onMessage.notify({
        data: message,
        origin: origin,
        source: this
      });
    },

    _getScriptObject: function () {
      if (!this.scriptObject) {
        var ApplicationDomainClass = avm2.systemDomain.getClass("flash.system.ApplicationDomain");
        var dom = ApplicationDomainClass.createInstance([this]); // wrapping native Domain
        release || assert(dom === this.scriptObject);
      }
      return this.scriptObject;
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
                  release || assert(scope.object);
                  str += scope.object.debugName || "T";
                  if ((scope = scope.parent)) {
                    str += " <: ";
                  }
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
