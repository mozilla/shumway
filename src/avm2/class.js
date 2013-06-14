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

/**
 * AVM2 Class
 */
var Class = (function () {
  var OWN_INITIALIZE   = 0x1;
  var SUPER_INITIALIZE = 0x2;

  function Class(name, instance, callable) {
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
  }

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
  return Class;
})();