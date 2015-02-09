interface IMetaObjectProtocol {
  axHasPropertyInternal(mn: Shumway.AVMX.Multiname): boolean;
  axSetProperty(mn: Shumway.AVMX.Multiname, value: any);
}

interface Object extends IMetaObjectProtocol {

}

module Shumway.AVMX {

  export enum ScriptInfoState {
    None      = 0,
    Executing = 1,
    Executed  = 2
  }

  import assert = Shumway.Debug.assert;
  import boxValue = Shumway.ObjectUtilities.boxValue;
  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
  import defineNonEnumerableGetterOrSetter = Shumway.ObjectUtilities.defineNonEnumerableGetterOrSetter;
  import getOwnPropertyDescriptor = Shumway.ObjectUtilities.getOwnPropertyDescriptor;

  import sliceArguments = Shumway.AVM2.Runtime.sliceArguments;

  var writer = new IndentingWriter();

  function axHasPropertyInternal(mn: Multiname): boolean {
    return this.traits.indexOf(mn) >= 0;
  }

  function axSetProperty(mn: Multiname, value: any) {
    writer.writeLn("axSetProperty: " + mn + " " + value);
    this.traits.trace(writer);
    var t = this.traits.getTrait(mn);
    if (t) {
      this[t.getName().getMangledName()] = value;
      return;
    }
    assert(false, "Cannot set property: " + mn);
  }

  function axGetProperty(mn: Multiname): any {
    writer.writeLn("axGetProperty: " + mn);
    this.traits.trace(writer);
    var t = this.traits.getTrait(mn);
    if (t) {
      return this[t.getName().getMangledName()];
    }
    assert(false, "Cannot get property: " + mn);
  }

  function axCallProperty(mn: Multiname, args: any []): any {
    writer.writeLn("axCallProperty: " + mn);
    this.traits.trace(writer);
    var t = this.traits.getTrait(mn);
    if (t) {
      var method = this[t.getName().getMangledName()];
      return method.apply(this, args);
    }
    assert(false, "Cannot call property: " + mn);
  }

  defineNonEnumerableProperty(Object.prototype, "axHasPropertyInternal", axHasPropertyInternal);
  defineNonEnumerableProperty(Object.prototype, "axSetProperty", axSetProperty);
  defineNonEnumerableProperty(Object.prototype, "axGetProperty", axGetProperty);
  defineNonEnumerableProperty(Object.prototype, "axCallProperty", axCallProperty);

  /**
   * All objects with Traits must implement this interface.
   */
  export interface ITraits {
    traits: Traits;
  }

  export class Scope {
    parent: Scope;
    global: Scope;
    object: Object;
    isWith: boolean;
    cache: any;

    constructor(parent: Scope, object: any, isWith: boolean = false) {
      this.parent = parent;
      this.object = boxValue(object);
      this.global = parent ? parent.global : this;
      this.isWith = isWith;
      this.cache = [];
    }

    public findDepth(object: any): number {
      var current = this;
      var depth = 0;
      while (current) {
        if (current.object === object) {
          return depth;
        }
        depth ++;
        current = current.parent;
      }
      return -1;
    }

    public getScopeObjects(): Object [] {
      var objects = [];
      var current = this;
      while (current) {
        objects.unshift(current.object);
        current = current.parent;
      }
      return objects;
    }

    public findScopeProperty(mn: Multiname, strict: boolean, scopeOnly: boolean): Object {
      writer.writeLn("findScopeProperty: " + mn + " in " + this.object);
      var object: Object;
      if (!mn.isRuntime() && !scopeOnly) {
        if ((object = this.cache[mn.index])) {
          return object;
        }
      }
      // Scope lookups should not be trapped by proxies.
      if (this.object.axHasPropertyInternal(mn)) {
        return (this.isWith || mn.isRuntime()) ? this.object : (this.cache[mn.index] = this.object);
      }
      if (this.parent) {
        var object = this.parent.findScopeProperty(mn, strict, scopeOnly);
        if (mn.kind === CONSTANT.QName) {
          this.cache[mn.index] = object;
        }
        return object;
      }
      if (scopeOnly) {
        return null;
      }
      // If we can't find the property look in the domain.
      var globalObject = <Global><any>this.global.object;
      if ((object = globalObject.applicationDomain.findProperty(mn, strict, true))) {
        return object;
      }
      assert(!strict, "Cannot find property " + mn);
      // Can't find it still, return the global object.
      return <any>globalObject;
    }
  }

  export class Global implements ITraits {
    traits: Traits;

    constructor(
      public applicationDomain: ApplicationDomain,
      public scriptInfo: ScriptInfo
    ) {
      this.traits = scriptInfo.traits;
      this.traits.resolve();
    }

    toString() {
      return "[Global Object]";
    }

    asHasPropertyInternalMn(mn: Multiname): boolean {
      this.scriptInfo.trace(writer);
      writer.writeLn("Found: " + this.scriptInfo.traits.indexOf(mn));
      return false;
    }
  }

  /**
   * Provides security isolation between application domains.
   */
  export class SecurityDomain {
    public system: ApplicationDomain;
    public application: ApplicationDomain;
    constructor() {
      this.system = new ApplicationDomain(null);
      this.system.securityDomain = this;
      this.application = new ApplicationDomain(this.system);
    }
    findDefiningABC(mn: Multiname): ABCFile {
      return null;
    }
  }

  /**
   * All code lives within an application domain.
   */
  export class ApplicationDomain {
    /**
     * All application domains have a reference to the root, or system application domain.
     */
    public system: ApplicationDomain;

    /**
     * Parent application domain.
     */
    public parent: ApplicationDomain;

    public securityDomain: SecurityDomain;

    private _abcs: ABCFile [];

    constructor(parent: ApplicationDomain) {
      this.securityDomain = null;
      this.parent = parent;
      this.system = parent ? parent.system : this;
      this._abcs = [];
    }

    public loadABC(abc: ABCFile) {
      assert (this._abcs.indexOf(abc) < 0);
      this._abcs.push(abc);
      abc.setApplicationDomain(this);
    }

    public loadAndExecuteABC(abc: ABCFile) {
      this.loadABC(abc);
      var lastScript = abc.scripts[abc.scripts.length - 1];
      this._executeScript(lastScript);
    }

    public findClassInfo(name: string) {
      for (var i = 0; i < this._abcs.length; i++) {
        var abc = this._abcs[i];
        for (var j = 0; j < abc.instances.length; j++) {
          var c = abc.classes[j];
          if (c.instanceInfo.getName().name === name) {
            return c;
          }
        }
      }
      return null;
    }

    private _executeScript(scriptInfo: ScriptInfo) {
      assert (scriptInfo.state === ScriptInfoState.None);

      writer.writeLn("Running Script: " + scriptInfo);
      var global = new Global(this, scriptInfo);
      scriptInfo.global = global;
      var scope = new Scope(null, global, false);

      scriptInfo.state = ScriptInfoState.Executing;
      interpret(<any>global, scriptInfo.getInitializer(), scope, []);
      scriptInfo.state = ScriptInfoState.Executed;
    }

    public findProperty(mn: Multiname, strict: boolean, execute: boolean): Global {
      writer.writeLn("Domain::findProperty: " + mn + " " + mn.index);
      var script = this.findDefiningScript(mn, execute);
      if (script) {
        return script.global;
      }
      return null;
    }

    public findDefiningScript(mn: Multiname, execute: boolean): ScriptInfo {
      // Look in parent domain first.
      if (this.parent) {
        var script = this.parent.findDefiningScript(mn, execute);
        if (script) {
          return script;
        }
      }

      // Search through the loaded abcs.
      for (var i = 0; i < this._abcs.length; i++) {
        var abc = this._abcs[i];
        var scripts = abc.scripts;
        for (var j = 0; j < scripts.length; j++) {
          var script = scripts[j];
          var traits = script.traits;
          traits.resolve();
          var index = traits.indexOf(mn);
          if (index > 0) {
            if (execute) {
              this._ensureScriptIsExecuted(script);
            }
            return script;
          }
        }
      }

      // Still no luck, so let's ask the security domain to load additional ABCs and try again.
      var abc = this.system.securityDomain.findDefiningABC(mn);
      if (abc) {
        this.loadABC(abc);
        return this.findDefiningScript(mn, execute);
      }

      return null;
    }

    private _ensureScriptIsExecuted(script: ScriptInfo) {
      writer.writeLn("Script State: " + script.state);
      if (script.state === ScriptInfoState.None) {
        this._executeScript(script);
      }
    }
  }

  function createMethodForTrait(methodTraitInfo: MethodTraitInfo, scope: Scope) {
    var methodInfo = methodTraitInfo.getMethodInfo();
    var method;
    if (methodInfo.flags === METHOD.Native) {
      var natives = getNativesForHolder(methodTraitInfo.holder);
      var mangledName = methodTraitInfo.getName().getMangledName();
      method = natives && natives[mangledName];
      assert (method, "Cannot find native: " + mangledName);
    } else {
      method = function () {
        return interpret(this, methodInfo, scope, sliceArguments(arguments));
      };
    }
    if (!release) {
      method.toString = function () {
        return "Interpret " + methodTraitInfo.toString();
      }
    }
    return method;
  }

  function getNativesForHolder(holder: Info): Object {
    writer.writeLn("Holder: " + holder);
    if (holder instanceof ClassInfo) {
      var classInfo: ClassInfo = <ClassInfo>holder;
      if (classInfo.instanceInfo.getName().name === "Object") {
        return {
          "$_setPropertyIsEnumerable": function (object: Object, name: string, enumerable: boolean) {
            var descriptor = getOwnPropertyDescriptor(object, name);
            descriptor.enumerable = enumerable;
            Object.defineProperty(object, name, descriptor);
          },
          "$_dontEnumPrototype": function (object: Object, name: string, enumerable: boolean) {

          },
          "$_init": function (object: Object, name: string, enumerable: boolean) {

          }
        };
      }
    } else if (holder instanceof InstanceInfo) {
      var instanceInfo: InstanceInfo = <InstanceInfo>holder;
      if (instanceInfo.getName().name === "Class") {
        return {
          "$prototype": function () {
            return this._dynamicPrototype;
          }
        };
      }
    } else if (holder instanceof ScriptInfo) {
      var scriptInfo: ScriptInfo = <ScriptInfo>holder;
    }
  }

  function applyTraitsBindings(object: Object, traits: Traits, scope: Scope) {
    var T = traits.traits;
    for (var i = 0; i < T.length; i++) {
      var t = T[i];
      if (t.kind === TRAIT.Method || t.kind === TRAIT.Getter || t.kind === TRAIT.Setter) {
        var method = createMethodForTrait(<MethodTraitInfo>t, scope);
        var mangledName = t.getName().getMangledName();
        if (t.kind === TRAIT.Method) {
          defineNonEnumerableProperty(object, mangledName, method);
        } else {
          defineNonEnumerableGetterOrSetter(object, mangledName, method, t.kind === TRAIT.Getter)
        }
      }
    }
  }

  export class Klass implements ITraits {
    public traits: Traits;
    private _traitsPrototype: Object;
    private _dynamicPrototype: Object;

    constructor(
      public classInfo: ClassInfo,
      public superKlass: Klass,
      public scope: Scope
    ) {
      this._applyClassTraits();
      this._dynamicPrototype = superKlass ? Object.create(superKlass._dynamicPrototype) : Object.prototype;
      this._traitsPrototype = Object.create(this._dynamicPrototype);
    }

    private _applyClassTraits() {
      var classClassInfo = this.classInfo.abc.applicationDomain.findClassInfo("Class");

      this.traits = classClassInfo.instanceInfo.traits.concat(this.classInfo.traits);
      this.traits.resolve();
      applyTraitsBindings(this, this.traits, this.scope);
      this.traits.trace(writer);
    }

    toString() {
      return "[Klass " + this.classInfo.instanceInfo.getName().name + "]";
    }
  }

  export function createClass(classInfo: ClassInfo, superKlass: Klass, scope: Scope): Klass {
    var klass = new Klass(classInfo, superKlass, scope);


    interpret(klass, classInfo.getInitializer(), scope, []);

    return klass;
  }
}