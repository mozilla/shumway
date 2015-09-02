module Shumway.AVMX {
  import assert = Shumway.Debug.assert;
  import AbcStream = Shumway.AVM2.ABC.AbcStream;

  var writer = new IndentingWriter();

  /**
   * Naming Conventions:
   *
   *  mn:   multiname;
   *  nm:   name
   *  ns:   namespace
   *  nss:  namespace set
   *
   * Parsing is a combination of lazy and eager evaluation. String parsing is deferred until
   * it is needed for multiname parsing.
   */

  export enum CONSTANT {
    Undefined          = 0x00,
    Utf8               = 0x01,
    Float              = 0x02,
    Int                = 0x03,
    UInt               = 0x04,
    PrivateNs          = 0x05,
    Double             = 0x06,
    QName              = 0x07,
    Namespace          = 0x08,
    Multiname          = 0x09,
    False              = 0x0A,
    True               = 0x0B,
    Null               = 0x0C,
    QNameA             = 0x0D,
    MultinameA         = 0x0E,
    RTQName            = 0x0F,
    RTQNameA           = 0x10,
    RTQNameL           = 0x11,
    RTQNameLA          = 0x12,
    NameL              = 0x13,
    NameLA             = 0x14,
    NamespaceSet       = 0x15,
    PackageNamespace   = 0x16,
    PackageInternalNs  = 0x17,
    ProtectedNamespace = 0x18,
    ExplicitNamespace  = 0x19,
    StaticProtectedNs  = 0x1A,
    MultinameL         = 0x1B,
    MultinameLA        = 0x1C,
    TypeName           = 0x1D,

    ClassSealed        = 0x01,
    ClassFinal         = 0x02,
    ClassInterface     = 0x04,
    ClassProtectedNs   = 0x08
  }

  export enum METHOD {
    NeedArguments       = 0x1,
    Activation          = 0x2,
    NeedRest            = 0x4,
    HasOptional         = 0x8,
    IgnoreRest          = 0x10,
    Native              = 0x20,
    Setsdxns            = 0x40,
    HasParamNames       = 0x80,
    // Flags that're derived at runtime, not present in the bytecode.
    HasBody             = 0x100,
    InstanceInitializer = 0x200,
    ClassInitializer    = 0x400,
    ScriptInitializer   = 0x800
  }

  export enum TRAIT {
    Slot               = 0,
    Method             = 1,
    Getter             = 2,
    Setter             = 3,
    Class              = 4,
    Function           = 5,
    Const              = 6,
    GetterSetter       = 7 // This is a runtime addition, not a valid ABC Trait type.
  }

  export enum ATTR {
    Final              = 0x01,
    Override           = 0x02,
    Metadata           = 0x04
  }

  export enum NamespaceType {
    Public          = 0,
    Protected       = 1,
    PackageInternal = 2,
    Private         = 3,
    Explicit        = 4,
    StaticProtected = 5
  }

  export enum SORT {
    CASEINSENSITIVE = 1,
    DESCENDING = 2,
    UNIQUESORT = 4,
    RETURNINDEXEDARRAY = 8,
    NUMERIC = 16,
  }

  export class MetadataInfo {
    constructor(
      public abc: ABCFile,
      public name: String | number,
      public keys: Uint32Array,
      public values: Uint32Array
    ) {
      // ...
    }

    getName(): string {
      if (typeof this.name === "number") {
        this.name = this.abc.getString(<number>this.name);
      }
      return <string>this.name;
    }

    getKeyAt(i: number): string {
      return this.abc.getString(this.keys[i]);
    }

    getValueAt(i: number): string {
      return this.abc.getString(this.values[i]);
    }

    getValue(key: string): string {
      for (var i = 0; i < this.keys.length; i++) {
        if (this.abc.getString(this.keys[i]) === key) {
          return this.abc.getString(this.values[i]);
        }
      }
      return null;
    }
  }

  /**
   * The Traits class represents the collection of compile-time traits associated with a type.
   * It's not used for runtime name resolution on instances; instead, the combined traits for
   * a type and all its super types is resolved and translated to an instance of RuntimeTraits.
   */
  export class Traits {
    private _resolved = false;
    constructor(
      public traits: TraitInfo []
    ) {
      // ...
    }

    resolve() {
      if (this._resolved) {
        return;
      }
      for (var i = 0; i < this.traits.length; i++) {
        this.traits[i].resolve();
      }
      this._resolved = true;
    }

    attachHolder(holder: Info) {
      for (var i = 0; i < this.traits.length; i++) {
        release || assert(!this.traits[i].holder);
        this.traits[i].holder = holder;
      }
    }

    trace(writer: IndentingWriter = new IndentingWriter()) {
      this.resolve();
      this.traits.forEach(x => writer.writeLn(x.toString()));
    }

    /**
     * Searches for a trait with the specified name.
     */
    private indexOf(mn: Multiname): number {
      release || assert(this._resolved);
      var mnName = mn.name;
      var nss = mn.namespaces;
      var traits = this.traits;
      for (var i = 0; i < traits.length; i++) {
        var trait = traits[i];
        var traitMn = <Multiname>trait.name;
        if (traitMn.name === mnName) {
          var ns = traitMn.namespaces[0];
          for (var j = 0; j < nss.length; j++) {
            if (ns === nss[j]) {
              return i;
            }
          }
        }
      }
      return -1;
    }

    getTrait(mn: Multiname): TraitInfo {
      var i = this.indexOf(mn);
      return i >= 0 ? this.traits[i] : null;
    }

    /**
     * Turns a list of compile-time traits into runtime traits with resolved bindings.
     *
     * Runtime traits are stored in 2-dimensional maps. The outer dimension is keyed on the
     * trait's local name. The inner dimension is a map of mangled namespace names to traits.
     *
     * Lookups are thus O(n) in the number of namespaces present in the query, instead of O(n+m)
     * in the number of traits (n) on the type times the number of namespaces present in the
     * query (m).
     *
     * Negative result note: an implementation with ECMAScript Maps with Namespace objects as
     * keys was tried and found to be much slower than the Object-based one implemented here.
     * Mostly, the difference was in how well accesses are optimized in JS engines, with Maps
     * being new-ish and less well-optimized.
     *
     * Additionally, all protected traits get added to a map with their unqualified name as key.
     * That map is created with the super type's map on its prototype chain. If a type overrides
     * a protected trait, it gets set as that type's value for the unqualified name. Additionally,
     * its name is canonicalized to use the namespace used in the initially introducing type.
     * During name lookup, we first check for a hit in that map and (after verifying that the mn
     * has a correct protected name in its namespaces set) return the most recent trait. That way,
     * all lookups always get the most recent trait, even if they originate from a super class.
     */
    resolveRuntimeTraits(superTraits: RuntimeTraits, protectedNs: Namespace,
                         scope: Scope): RuntimeTraits {
      // Resolve traits so that indexOf works out.
      this.resolve();

      var protectedNsMappings = Object.create(superTraits ? superTraits.protectedNsMappings : null);
      var result = new RuntimeTraits(superTraits, protectedNs, protectedNsMappings);

      // Add all of the child traits, replacing or extending parent traits where necessary.
      for (var i = 0; i < this.traits.length; i++) {
        var trait = this.traits[i];
        var name = <Multiname>trait.name;
        var runtimeTrait = new RuntimeTraitInfo(name, trait.kind, trait.abc);
        if (name.namespaces[0].type === NamespaceType.Protected) {
          // Names for protected traits get canonicalized to the name of the type that initially
          // introduces the trait.
          if (result.protectedNsMappings[name.name]) {
            runtimeTrait.name = result.protectedNsMappings[name.name].name;
          }
          result.protectedNsMappings[name.name] = runtimeTrait;
        }

        var currentTrait = result.addTrait(runtimeTrait);

        switch (trait.kind) {
          case TRAIT.Method:
            var method = createMethodForTrait(<MethodTraitInfo>trait, scope);
            runtimeTrait.value = method;
            break;
          case TRAIT.Getter:
            runtimeTrait.get = createMethodForTrait(<MethodTraitInfo>trait, scope);
            if (currentTrait && currentTrait.set) {
              runtimeTrait.set = currentTrait.set;
              runtimeTrait.kind = TRAIT.GetterSetter;
            }
            break;
          case TRAIT.Setter:
            runtimeTrait.set = createMethodForTrait(<MethodTraitInfo>trait, scope);
            if (currentTrait && currentTrait.get) {
              runtimeTrait.get = currentTrait.get;
              runtimeTrait.kind = TRAIT.GetterSetter;
            }
            break;
          case TRAIT.Slot:
          case TRAIT.Const:
          case TRAIT.Class:
            // Only non-const slots need to be writable. Everything else is fixed.
            runtimeTrait.writable = true;
            var slotTrait = <SlotTraitInfo>trait;
            runtimeTrait.slot = slotTrait.slot;
            runtimeTrait.value = slotTrait.getDefaultValue();
            runtimeTrait.typeName = <Multiname>slotTrait.typeName;
            // TODO: Throw error for const without default.
            result.addSlotTrait(runtimeTrait);
        }
      }
      return result;
    }
  }

  function createMethodForTrait(methodTraitInfo: MethodTraitInfo, scope: Scope) {
    if (methodTraitInfo.method) {
      return methodTraitInfo.method;
    }
    var methodInfo = methodTraitInfo.getMethodInfo();
    var method;
    if (methodInfo.flags & METHOD.Native) {
      var metadata = methodInfo.getNativeMetadata();
      if (metadata || methodTraitInfo.holder instanceof ScriptInfo) {
        if (metadata) {
          method = AS.getNative(metadata.getValueAt(0));
        } else {
          var mn = methodTraitInfo.getName();
          method = AS.getNative(mn.uri + '.' + mn.name);
        }
        method = createGlobalNative(method, scope.object.sec);
      } else {
        method = AS.getMethodOrAccessorNative(methodTraitInfo);
      }
      if (!release) {
        method.toString = function () {
          return "Native " + methodTraitInfo.toString();
        };
        method.isInterpreted = false;
      }
    } else {
      method = function () {
        var self = this === jsGlobal ? scope.global.object : this;
        return interpret(self, methodInfo, scope, <any>arguments, null);
      };
      if (!release) {
        method.toString = function () {
          return "Interpreted " + methodTraitInfo.toString();
        };
        method.isInterpreted = true;
      }
    }
    if (!release && flashlog && methodInfo.trait) {
      method = (function (wrapped, methodInfo) {
        var traceMsg = methodInfo.toFlashlogString();
        var result: any = function () {
          flashlog.writeAS3Trace(traceMsg);
          return wrapped.apply(this, arguments);
        };
        result.toString = wrapped.toString;
        result.isInterpreted = wrapped.isInterpreted;
        return result;
      })(method, methodInfo);
    }

    methodTraitInfo.method = method;
    method.methodInfo = methodInfo;
    if (!release) {
      try {
        Object.defineProperty(method, 'name', {value: methodInfo.getName()});
      } catch (e) {
        // Ignore errors in browsers that don't allow overriding Function#length;
      }
    }
    method.methodInfo = methodInfo;
    return method;
  }

  function createGlobalNative(native: Function, sec: AXSecurityDomain) {

    return function() {
      switch (arguments.length) {
        case 0: return native(sec);
        case 1: return native(sec, arguments[0]);
        case 2: return native(sec, arguments[0], arguments[1]);
        case 3: return native(sec, arguments[0], arguments[1], arguments[2]);
        default:
          var args: any[] = [sec];
          for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
          }
          return native.apply(this, args);
      }
    };
  }

  export class TraitInfo {
    public holder: Info;
    public metadata: MetadataInfo [] | Uint32Array;

    constructor(
      public abc: ABCFile,
      public kind: TRAIT,
      public name: Multiname | number
    ) {
      this.metadata = null;
      this.holder = null;
    }

    getMetadata(): MetadataInfo [] {
      if (!this.metadata) {
        return null;
      }
      if (this.metadata instanceof Uint32Array) {
        var metadata = new Array(this.metadata.length);
        for (var i = 0; i < this.metadata.length; i++) {
          metadata[i] = this.abc.getMetadataInfo(<number>this.metadata[i]);
        }
        this.metadata = metadata;
      }
      return <MetadataInfo []>this.metadata;
    }

    getName(): Multiname {
      return <Multiname>this.name;
    }

    resolve() {
      if (typeof this.name === "number") {
        this.name = this.abc.getMultiname(<number>this.name);
      }
    }

    toString() {
      return TRAIT[this.kind] + " " + this.name;
    }

    toFlashlogString(): string {
      this.resolve();
      return this.getName().toFlashlogString();
    }

    isConst(): boolean {
      return this.kind === TRAIT.Const;
    }

    isSlot(): boolean {
      return this.kind === TRAIT.Slot;
    }

    isMethod(): boolean {
      return this.kind === TRAIT.Method;
    }

    isGetter(): boolean {
      return this.kind === TRAIT.Getter;
    }

    isSetter(): boolean {
      return this.kind === TRAIT.Setter;
    }

    isAccessor(): boolean {
      return this.kind === TRAIT.Getter ||
             this.kind === TRAIT.Setter;
    }

    isMethodOrAccessor(): boolean {
      return this.isAccessor() || this.kind === TRAIT.Method;
    }
  }

  export class RuntimeTraits {
    public slots: RuntimeTraitInfo[] = [];

    private _traits: MapObject<MapObject<RuntimeTraitInfo>>;
    private _nextSlotID: number = 1;

    constructor(public superTraits: RuntimeTraits,
                public protectedNs: Namespace, public protectedNsMappings: any) {
      var traits = this._traits = Object.create(null);
      if (!superTraits) {
        return;
      }
      var superMappings = superTraits._traits;
      for (var key in superMappings) {
        traits[key] = Object.create(superMappings[key]);
      }
    }

    /**
     * Adds the given trait and returns any trait that might already exist under that name.
     *
     * See the comment for `Trait#resolveRuntimeTraits` for an explanation of the lookup scheme.
     */
    public addTrait(trait: RuntimeTraitInfo): RuntimeTraitInfo {
      var mn = trait.name;
      var mappings = this._traits[mn.name];
      if (!mappings) {
        mappings = this._traits[mn.name] = Object.create(null);
      }
      var nsName = mn.namespaces[0].mangledName;
      var current = mappings[nsName];
      mappings[nsName] = trait;
      return current;
    }

    public addSlotTrait(trait: RuntimeTraitInfo) {
      var slot = trait.slot;
      if (!slot) {
        slot = trait.slot = this._nextSlotID++;
      } else {
        this._nextSlotID = slot + 1;
      }
      release || assert(!this.slots[slot]);
      this.slots[slot] = trait;
    }

    /**
     * Returns the trait matching the given multiname parts, if any.
     *
     * See the comment for `Trait#resolveRuntimeTraits` for an explanation of the lookup scheme.
     */
    getTrait(namespaces: Namespace[], name: string): RuntimeTraitInfo {
      release || assert(typeof name === 'string');
      var mappings = this._traits[name];
      if (!mappings) {
        return null;
      }
      var trait: RuntimeTraitInfo;
      for (var i = 0; i < namespaces.length; i++) {
        var ns = namespaces[i];
        trait = mappings[ns.mangledName];
        if (trait) {
          return trait;
        }
        if (ns.type === NamespaceType.Protected) {
          var protectedScope = this;
          while (protectedScope) {
            if (protectedScope.protectedNs === ns) {
              trait = protectedScope.protectedNsMappings[name];
              if (trait) {
                return trait;
              }
            }
            protectedScope = protectedScope.superTraits;
          }
        }
      }
      return null;
    }

    getTraitsList() {
      var list = [];
      var names = this._traits;
      for (var name in names) {
        var mappings = names[name];
        for (var nsName in mappings) {
          list.push(mappings[nsName]);
        }
      }
      return list;
    }

    getSlotPublicTraitNames(): string [] {
      var slots = this.slots;
      var names = [];
      for (var i = 1; i < slots.length; i++) {
        var slot = slots[i];
        if (!(<Multiname>slot.name).namespace.isPublic()) {
          continue;
        }
        names.push((<Multiname>slot.name).name);
      }
      return names;
    }

    getSlot(i: number): RuntimeTraitInfo {
      return this.slots[i];
    }
  }

  export class RuntimeTraitInfo {
    configurable: boolean = true; // Always true.
    enumerable: boolean; // Always false.
    writable: boolean;
    get: () => any;
    set: (v: any) => void;
    slot: number;
    value: any;
    typeName: Multiname;

    private _type: AXClass;

    constructor(public name: Multiname, public kind: TRAIT, private abc: ABCFile) {
      this._type = undefined;
      this.typeName = null;
    }

    getType(): AXClass {
      if (this._type !== undefined) {
        return this._type;
      }
      if (this.typeName === null) {
        return this._type = null;
      }
      var type = this.abc.applicationDomain.getClass(this.typeName);
      return this._type = (type && type.axCoerce) ? type : null;
    }
  }

  var typeDefaultValues = {
    __proto__: null,
    $BgNumber: NaN,
    $Bgint: 0,
    $Bguint: 0,
    $BgBoolean: false
  };

  export class SlotTraitInfo extends TraitInfo {
    constructor(
      abc: ABCFile,
      kind: TRAIT,
      name: Multiname | number,
      public slot: number,
      public typeName: Multiname | number,
      public defaultValueKind: CONSTANT,
      public defaultValueIndex: number
    ) {
      super(abc, kind, name);
    }

    resolve() {
      super.resolve();
      if (typeof this.typeName === "number") {
        this.typeName = this.abc.getMultiname(<number>this.typeName);
      }
    }

    getTypeName() {
      this.resolve();
      return <Multiname>this.typeName;
    }

    getDefaultValue(): any {
      if (this.defaultValueKind === -1) {
        if (this.typeName === null) {
          return undefined;
        }
        var value = typeDefaultValues[(<Multiname>this.typeName).getMangledName()];
        return value === undefined ? null : value;
      }
      return this.abc.getConstant(this.defaultValueKind, this.defaultValueIndex);
    }
  }

  export class MethodTraitInfo extends TraitInfo {
    public method: Function = null;
    constructor(
      abc: ABCFile,
      kind: TRAIT,
      name: Multiname | number,
      public methodInfo: MethodInfo | number
    ) {
      super(abc, kind, name);
    }

    getMethodInfo(): MethodInfo {
      return <MethodInfo>this.methodInfo;
    }

    resolve() {
      super.resolve();
      if (typeof this.methodInfo === "number") {
        this.methodInfo = this.abc.getMethodInfo(<number>this.methodInfo);
      }
    }
  }

  export class ClassTraitInfo extends SlotTraitInfo {
    constructor(
      abc: ABCFile,
      kind: TRAIT,
      name: Multiname | number,
      slot: number,
      public classInfo: ClassInfo
    ) {
      super(abc, kind, name, slot, 0, 0, -1);
    }
  }

  export class ParameterInfo {
    constructor(
      public abc: ABCFile,
      public type: Multiname | number,
      /**
       * Don't rely on the name being correct.
       */
      public name: string | number,
      public optionalValueKind: CONSTANT,
      public optionalValueIndex: number
    ) {
      // ...
    }

    getName(): string {
      if (typeof this.name === "number") {
        this.name = this.abc.getString(<number>this.name);
      }
      return <string>this.name;
    }

    getType(): Multiname {
      if (typeof this.type === "number") {
        this.type = this.abc.getMultiname(<number>this.type);
      }
      return <Multiname>this.type;
    }

    hasOptionalValue(): boolean {
      return this.optionalValueKind >= 0;
    }

    getOptionalValue(): any {
      return this.abc.getConstant(this.optionalValueKind, this.optionalValueIndex);
    }

    toString() {
      var str = "";
      if (this.name) {
        str += this.getName();
      } else {
        str += "?";
      }
      if (this.type) {
        str += ": " + this.getType().name;
      }
      if (this.optionalValueKind >= 0) {
        str += " = " + this.abc.getConstant(this.optionalValueKind, this.optionalValueIndex);
      }
      return str;
    }
  }

  export class Info {

  }

  export class InstanceInfo extends Info {
    public classInfo: ClassInfo = null;
    public runtimeTraits: RuntimeTraits = null;

    private _interfaces: Set<AXClass>;

    constructor(
      public abc: ABCFile,
      public name: Multiname | number,
      public superName: Multiname | number,
      public flags: number,
      public protectedNs: number,
      public interfaceNameIndices: number [],
      public initializer: MethodInfo | number,
      public traits: Traits
    ) {
      super();
      this._interfaces = null;
    }

    getInitializer(): MethodInfo {
      if (typeof this.initializer === "number") {
        this.initializer = this.abc.getMethodInfo(<number>this.initializer);
      }
      return <MethodInfo>this.initializer;
    }

    getName(): Multiname {
      if (typeof this.name === "number") {
        this.name = this.abc.getMultiname(<number>this.name);
      }
      return <Multiname>this.name;
    }

    getClassName(): string {
      var name = this.getName();
      if (name.namespaces[0].uri) {
        return name.namespaces[0].uri + "." + name.name;
      }
      return name.name;
    }

    getSuperName(): Multiname {
      if (typeof this.superName === "number") {
        this.superName = this.abc.getMultiname(<number>this.superName);
      }
      return <Multiname>this.superName;
    }

    getInterfaces(ownerClass: AXClass): Set<AXClass> {
      if (this._interfaces) {
        return this._interfaces;
      }

      var superClassInterfaces;
      var superClass = ownerClass.superClass;
      if (superClass) {
        superClassInterfaces = superClass.classInfo.instanceInfo.getInterfaces(superClass);
      }
      var SetCtor: any = Set;
      var interfaces = this._interfaces = new SetCtor(superClassInterfaces);
      for (var i = 0; i < this.interfaceNameIndices.length; i++) {
        var mn = this.abc.getMultiname(this.interfaceNameIndices[i]);
        var type = this.abc.applicationDomain.getClass(mn);
        interfaces.add(type);
        var implementedInterfaces = type.classInfo.instanceInfo.getInterfaces(type);
        implementedInterfaces.forEach((iface) => interfaces.add(iface));
      }
      return interfaces;
    }

    toString() {
      return "InstanceInfo " + this.getName().name;
    }

    toFlashlogString(): string {
      return this.getName().toFlashlogString();
    }

    trace(writer: IndentingWriter) {
      writer.enter("InstanceInfo: " + this.getName());
      this.superName && writer.writeLn("Super: " + this.getSuperName());
      this.traits.trace(writer);
      writer.outdent();
    }

    isInterface(): boolean {
      return !!(this.flags & CONSTANT.ClassInterface);
    }

    isSealed(): boolean {
      return !!(this.flags & CONSTANT.ClassSealed);
    }

    isFinal(): boolean {
      return !!(this.flags & CONSTANT.ClassFinal);
    }
  }

  export class ScriptInfo extends Info {
    public global: AXGlobal = null;
    public state: ScriptInfoState = ScriptInfoState.None;
    constructor(
      public abc: ABCFile,
      public initializer: number,
      public traits: Traits
    ) {
      super();
    }

    getInitializer(): MethodInfo {
      return this.abc.getMethodInfo(this.initializer);
    }

    trace(writer: IndentingWriter) {
      writer.enter("ScriptInfo");
      this.traits.trace(writer);
      writer.outdent();
    }
  }

  export class ClassInfo extends Info {
    public trait: ClassTraitInfo = null;
    public runtimeTraits: RuntimeTraits = null;
    constructor(
      public abc: ABCFile,
      public instanceInfo: InstanceInfo,
      public initializer: MethodInfo | number,
      public traits: Traits
    ) {
      super();
    }

    getNativeMetadata(): MetadataInfo {
      if (!this.trait) {
        return null;
      }
      var metadata = this.trait.getMetadata();
      if (!metadata) {
        return null;
      }
      for (var i = 0; i < metadata.length; i++) {
        if (metadata[i].getName() === "native") {
          return metadata[i];
        }
      }
      return null;
    }

    getInitializer(): MethodInfo {
      if (typeof this.initializer === "number") {
        return this.initializer = this.abc.getMethodInfo(<number>this.initializer);
      }
      return <MethodInfo>this.initializer;
    }

    toString() {
      return "ClassInfo " + this.instanceInfo.getName();
    }

    trace(writer: IndentingWriter) {
      writer.enter("ClassInfo");
      this.traits.trace(writer);
      writer.outdent();
    }
  }

  export class ExceptionInfo {
    public catchPrototype: Object = null;
    private _traits: Traits = null;
    constructor(
      public abc: ABCFile,
      public start: number,
      public end: number,
      public target: number,
      public type: Multiname | number,
      public varName: number
    ) {
      // ...
    }

    getType(): Multiname {
      if (typeof this.type === "number") {
        this.type = this.abc.getMultiname(<number>this.type);
      }
      return <Multiname>this.type;
    }

    getTraits(): Traits {
      if (!this._traits) {
        var traits = [];
        if (this.varName) {
          traits.push(new SlotTraitInfo(this.abc, TRAIT.Slot, this.varName, 1, this.type, 0, 0));
        }
        this._traits = new Traits(traits);
        this._traits.resolve();
      }
      return this._traits;
    }
  }

  export class MethodBodyInfo extends Info {
    public activationPrototype: Object = null;
    constructor(
      public maxStack: number,
      public localCount: number,
      public initScopeDepth: number,
      public maxScopeDepth: number,
      public code: Uint8Array,
      public catchBlocks: ExceptionInfo [],
      public traits: Traits
    ) {
      super();
    }

    trace(writer: IndentingWriter) {
      writer.writeLn("Code: " + this.code.length);
      var stream = new BytecodeStream(this.code);
      while (stream.currentBytecode() !== Bytecode.END) {
        writer.writeLn(stream.currentBCI + ": " + Bytecode[stream.currentBytecode()]);
        stream.next();
      }
    }
  }

  export class MethodInfo {
    public trait: MethodTraitInfo = null;
    public minArgs: number;
    private _body: MethodBodyInfo;
    private _returnType: AXClass;
    constructor(
      public abc: ABCFile,
      private _index: number,
      public name: number,
      public returnTypeNameIndex: number,
      public parameters: ParameterInfo [],
      public optionalCount: number,
      public flags: number
    ) {
      this._body = null;
      this.minArgs = parameters.length - optionalCount;
    }

    getNativeMetadata(): MetadataInfo {
      if (!this.trait) {
        return null;
      }
      var metadata = this.trait.getMetadata();
      if (!metadata) {
        return null;
      }
      for (var i = 0; i < metadata.length; i++) {
        if (metadata[i].getName() === "native") {
          return metadata[i];
        }
      }
      return null;
    }

    getBody(): MethodBodyInfo {
      return this._body || (this._body = this.abc.getMethodBodyInfo(this._index));
    }

    getType(): AXClass {
      if (this._returnType !== undefined) {
        return this._returnType;
      }
      if (this.returnTypeNameIndex === 0) {
        this._returnType = null;
      } else {
        var mn = this.abc.getMultiname(this.returnTypeNameIndex);
        this._returnType = this.abc.applicationDomain.getClass(mn);
      }
      return this._returnType;
    }

    getName(): string {
      if (this.name) {
        return this.abc.getString(this.name);
      }
      if (this.trait) {
        return this.trait.getName().name;
      }
      return 'anonymous';
    }

    toString() {
      var str = "anonymous";
      if (this.name) {
        str = this.abc.getString(this.name);
      }
      str += " (" + this.parameters.join(", ") + ")";
      if (this.returnTypeNameIndex) {
        str += ": " + this.abc.getMultiname(this.returnTypeNameIndex).name;
      }
      return str;
    }

    toFlashlogString(): string {
      var trait = this.trait;
      var prefix = trait.kind === TRAIT.Getter ? 'get ' :
                   trait.kind === TRAIT.Setter ? 'set ' : '';
      var name = trait.toFlashlogString();
      var holder = trait.holder;
      var holderName;
      if (holder && holder instanceof InstanceInfo) {
        holderName = (<InstanceInfo>holder).toFlashlogString();
        prefix = holderName + '/' + prefix;
      }
      if (holder && holder instanceof ClassInfo && (<ClassInfo>holder).trait) {
        holderName = (<ClassInfo>holder).trait.toFlashlogString();
        prefix = holderName + '$/' + prefix;
      }
      var prefixPos;
      if (holderName && (prefixPos = name.indexOf('::')) > 0 &&
          holderName.indexOf(name.substring(0, prefixPos + 2)) === 0) {
        name = name.substring(prefixPos + 2);
      }
      return 'MTHD ' + prefix + name + ' ()';
    }

    isNative(): boolean {
      return !!(this.flags & METHOD.Native);
    }

    needsRest(): boolean {
      return !!(this.flags & METHOD.NeedRest);
    }

    needsArguments(): boolean {
      return !!(this.flags & METHOD.NeedArguments);
    }
  }

  export class Multiname {
    private static _nextID = 1;
    public id: number = Multiname._nextID ++;
    private _mangledName: string = null;
    constructor(
      public abc: ABCFile,
      public index: number,
      public kind: CONSTANT,
      public namespaces: Namespace [],
      public name: any,
      public parameterType: Multiname = null
    ) {
      // ...
    }

    public static FromFQNString(fqn: string, nsType: NamespaceType) {
      var lastDot = fqn.lastIndexOf('.');
      var uri = lastDot === -1 ? '' : fqn.substr(0, lastDot);
      var name = lastDot === -1 ? fqn : fqn.substr(lastDot + 1);
      var ns = internNamespace(nsType, uri);
      return new Multiname(null, 0, CONSTANT.RTQName, [ns], name);
    }

    private _nameToString(): string {
      if (this.isAnyName()) {
        return "*";
      }
      return this.isRuntimeName() ? "[" + this.name + "]" : this.name;
    }

    public isRuntime(): boolean {
      switch (this.kind) {
        case CONSTANT.QName:
        case CONSTANT.QNameA:
        case CONSTANT.Multiname:
        case CONSTANT.MultinameA:
          return false;
      }
      return true;
    }

    public isRuntimeName(): boolean {
      switch (this.kind) {
        case CONSTANT.RTQNameL:
        case CONSTANT.RTQNameLA:
        case CONSTANT.MultinameL:
        case CONSTANT.MultinameLA:
          return true;
      }
      return false;
    }

    public isRuntimeNamespace(): boolean {
      switch (this.kind) {
        case CONSTANT.RTQName:
        case CONSTANT.RTQNameA:
        case CONSTANT.RTQNameL:
        case CONSTANT.RTQNameLA:
          return true;
      }
      return false;
    }

    public isAnyName(): boolean {
      return this.name === null;
    }

    public isAnyNamespace(): boolean {
      if (this.isRuntimeNamespace() || this.namespaces.length > 1) {
        return false;
      }
      return this.namespaces.length === 0 || this.namespaces[0].uri === "";

      // x.* has the same meaning as x.*::*, so look for the former case and give
      // it the same meaning of the latter.
      // return !this.isRuntimeNamespace() &&
      //  (this.namespaces.length === 0 || (this.isAnyName() && this.namespaces.length !== 1));
    }

    public isQName(): boolean {
      var kind = this.kind;
      var result = kind === CONSTANT.TypeName ||
                   kind === CONSTANT.QName || kind === CONSTANT.QNameA ||
                   kind >= CONSTANT.RTQName && kind <= CONSTANT.RTQNameLA;
      release || assert(!(result && this.namespaces.length !== 1));
      return result;
    }

    public get namespace(): Namespace {
      release || assert(this.isQName());
      return this.namespaces[0];
    }

    public get uri(): string {
      release || assert(this.isQName());
      return this.namespaces[0].uri;
    }

    public get prefix(): string {
      release || assert(this.isQName());
      return this.namespaces[0].prefix;
    }

    public set prefix(prefix: string) {
      release || assert(this.isQName());
      var ns = this.namespaces[0];
      if (ns.prefix === prefix) {
        return;
      }
      this.namespaces[0] = internPrefixedNamespace(ns.type, ns.uri, prefix);
    }

    public equalsQName(mn: Multiname): boolean {
      release || assert(this.isQName());
      return this.name === mn.name && this.namespaces[0].uri === mn.namespaces[0].uri;
    }

    public matches(mn: Multiname): boolean {
      release || assert(this.isQName());
      var anyName = mn.isAnyName();
      if (anyName && !mn.isQName()) {
        return true;
      }
      if (!anyName && this.name !== mn.name) {
        return false;
      }
      var uri = this.namespaces[0].uri;
      for (var i = mn.namespaces.length; i--;) {
        if (mn.namespaces[i].uri === uri) {
          return true;
        }
      }
      return false;
    }
    public isAttribute(): boolean {
      switch (this.kind) {
        case CONSTANT.QNameA:
        case CONSTANT.RTQNameA:
        case CONSTANT.RTQNameLA:
        case CONSTANT.MultinameA:
        case CONSTANT.MultinameLA:
          return true;
      }
      return false;
    }

    public getMangledName(): string {
      release || assert(this.isQName());
      return this._mangledName || this._mangleName();
    }

    private _mangleName() {
      release || assert(!this._mangledName);
      var mangledName = "$" + this.namespaces[0].mangledName + axCoerceString(this.name);
      if (!this.isRuntime()) {
        this._mangledName = mangledName;
      }
      return mangledName;
    }

    public getPublicMangledName(): any {
      if (isNumeric(this.name)) {
        return this.name;
      }
      return "$Bg" + axCoerceString(this.name);
    }

    public static isPublicQualifiedName(value: any): boolean {
      return value.indexOf('$Bg') === 0;
    }

    public static getPublicMangledName(name: string): any {
      if (isNumeric(name)) {
        return name;
      }
      return "$Bg" + name;
    }

    public toFQNString(useColons: boolean) {
      release || assert(this.isQName());
      var prefix = this.namespaces[0].uri;
      if (prefix.length) {
        prefix += (useColons ? '::' : '.');
      }
      return prefix + this.name;
    }

    public toString() {
      var str = CONSTANT[this.kind] + " ";
      str += this.isAttribute() ? "@" : "";
      if (this.isRuntimeNamespace()) {
        var namespaces = this.namespaces ? this.namespaces.map(x => String(x)).join(", ") : null;
        str += "[" + namespaces + "]::" + this._nameToString();
      } else if (this.isQName()) {
        str += this.namespaces[0] + "::";
        str += this._nameToString();
      } else {
        str += "{" + this.namespaces.map(x => String(x)).join(", ") + "}";
        str += "::" + this._nameToString();
      }
      if (this.parameterType) {
        str += "<" + this.parameterType + ">";
      }
      return str;
    }

    toFlashlogString(): string {
      var namespaceUri = this.uri;
      return namespaceUri ? namespaceUri + "::" + this.name : this.name;
    }

    /**
     * Removes the public prefix, or returns undefined if the prefix doesn't exist.
     */
    public static stripPublicMangledName(name: string): any {
      if (name.indexOf("$Bg") === 0) {
        return name.substring(3);
      }
      return undefined;
    }

    public static FromSimpleName(simpleName: string): Multiname {
      var nameIndex = simpleName.lastIndexOf(".");
      if (nameIndex <= 0) {
        nameIndex = simpleName.lastIndexOf(" ");
      }

      var uri = '';
      var name;
      if (nameIndex > 0 && nameIndex < simpleName.length - 1) {
        name = simpleName.substring(nameIndex + 1).trim();
        uri = simpleName.substring(0, nameIndex).trim();
      } else {
        name = simpleName;
      }
      var ns = internNamespace(NamespaceType.Public, uri);
      return new Multiname(null, 0, CONSTANT.RTQName, [ns], name);
    }
  }

  // Used in _hashNamespace so we don't need to allocate a new buffer each time.
  var namespaceHashingBuffer = new Int32Array(100);

  export class Namespace {
    public mangledName: string = null;
    constructor(public type: NamespaceType, public uri: string, public prefix: string) {
      assert (type !== undefined);
      this.mangleName();
      if (!release) {
        Object.freeze(this);
      }
    }

    toString() {
      return NamespaceType[this.type] + (this.uri !== "" ? ":" + this.uri : "");
    }

    private static _knownNames = [
      ""
    ];

    private static _hashNamespace(type: NamespaceType, uri: string, prefix: string) {
      uri = uri + '';
      prefix = prefix + '';
      var index = Namespace._knownNames.indexOf(uri);
      if (index >= 0) {
        return type << 2 | index;
      }
      var length = 1 + uri.length + prefix.length;
      var data = length < 101 ? namespaceHashingBuffer : new Int32Array(length);
      var j = 0;
      data[j++] = type;
      for (var i = 0; i < uri.length; i++) {
        data[j++] = uri.charCodeAt(i);
      }
      for (var i = 0; i < prefix.length; i++) {
        data[j++] = prefix.charCodeAt(i);
      }
      return Shumway.HashUtilities.hashBytesTo32BitsMD5(data, 0, j);
    }

    private mangleName() {
      if (this.type === NamespaceType.Public && this.uri === '') {
        this.mangledName = 'Bg';
        return;
      }
      var nsHash = Namespace._hashNamespace(this.type, this.uri, this.prefix);
      this.mangledName = Shumway.StringUtilities.variableLengthEncodeInt32(nsHash);
    }

    public isPublic(): boolean {
      return this.type === NamespaceType.Public;
    }

    public get reflectedURI() {
      // For public names without a URI, Tamarin uses `null`, we use `""`.
      // Hence: special-casing for reflection.
      return this.uri || (this.type === NamespaceType.Public ? null : this.uri);
    }

    public static PUBLIC: Namespace;
  }

  var _namespaces: MapObject<Namespace> = {};

  export function internNamespace(type: NamespaceType, uri: string) {
    var key = type + uri;
    return _namespaces[key] || (_namespaces[key] = new Namespace(type, uri, ''));
  }

  export function internPrefixedNamespace(type: NamespaceType, uri: string, prefix: string) {
    var key = type + uri + prefix;
    var ns = _namespaces[key];
    if (!ns) {
      ns = _namespaces[key] = new Namespace(type, uri, prefix);
    }
    return ns;
  }

  Namespace.PUBLIC = internNamespace(NamespaceType.Public, "");

  export class ABCFile {
    public ints: Int32Array;
    public uints: Uint32Array;
    public doubles: Float64Array;

    /**
     * Environment this ABC is loaded into.
     * In the shell, this is just a wrapper around an applicationDomain, but in the
     * SWF player, it's a flash.display.LoaderInfo object.
     */
    public env: {app: AXApplicationDomain; url: string};

    public get applicationDomain() {
      release || assert(this.env.app);
      return this.env.app;
    }

    private _stream: AbcStream;

    private _strings: string [];
    private _stringOffsets: Uint32Array;

    private _namespaces: Namespace [];
    private _namespaceOffsets: Uint32Array;

    private _namespaceSets: Namespace [][];
    private _namespaceSetOffsets: Uint32Array;

    private _multinames: Multiname [];
    private _multinameOffsets: Uint32Array;

    private _metadata: MetadataInfo [];
    private _metadataInfoOffsets: Uint32Array;

    private _methods: MethodInfo [];
    private _methodBodies: MethodBodyInfo [];
    private _methodInfoOffsets: Uint32Array;

    public classes: ClassInfo [];
    public scripts: ScriptInfo [];
    public instances: InstanceInfo [];

    constructor(
      env: {app: AXApplicationDomain; url: string},
      private _buffer: Uint8Array
    ) {
      this.env = env;
      this._stream = new AbcStream(_buffer);
      this._checkMagic();

      this._parseConstantPool();
      this._parseNamespaces();
      this._parseNamespaceSets();
      this._parseMultinames();

      this._parseMethodInfos();
      this._parseMetaData();
      this._parseInstanceAndClassInfos();
      this._parseScriptInfos();
      this._parseMethodBodyInfos();
    }

    private _parseConstantPool() {
      this._parseNumericConstants();
      this._parseStringConstants();
    }

    private _parseNumericConstants() {
      var n = 0, s = this._stream;

      // Parse Signed Integers
      n = s.readU30();
      var ints = new Int32Array(n);
      ints[0] = 0;
      for (var i = 1; i < n; i++) {
        ints[i] = s.readS32();
      }
      this.ints = ints;

      // Parse Unsigned Integers
      n = s.readU30();
      var uints = new Uint32Array(n);
      uints[0] = 0;
      for (var i = 1; i < n; i++) {
        uints[i] = s.readS32();
      }
      this.uints = uints;

      // Parse Doubles
      n = s.readU30();
      var doubles = new Float64Array(n);
      doubles[0] = NaN;
      for (var i = 1; i < n; i++) {
        doubles[i] = s.readDouble();
      }
      this.doubles = doubles;
    }

    private _parseStringConstants() {
      var n = 0, s = this._stream;
      n = s.readU30();
      this._strings = new Array(n);
      this._strings[0] = null;

      // Record the offset of each string in |stringOffsets|. This array has one extra
      // element so that we can compute the length of the last string.
      var stringOffsets = this._stringOffsets = new Uint32Array(n);
      stringOffsets[0] = -1;
      for (var i = 1; i < n; i++) {
        stringOffsets[i] = s.position;
        s.advance(s.readU30());
      }
    }

    private _parseNamespaces() {
      var s = this._stream;
      var n = s.readU30();
      this._namespaces = new Array(n);
      var namespaceOffsets = this._namespaceOffsets = new Uint32Array(n);
      namespaceOffsets[0] = -1;
      for (var i = 1; i < n; i++) {
        namespaceOffsets[i] = s.position;
        s.readU8(); // Kind
        s.readU30(); // String
      }
    }

    private _parseNamespaceSets() {
      var s = this._stream;
      var n = s.readU30();
      this._namespaceSets = new Array(n);
      var namespaceSetOffsets = this._namespaceSetOffsets = new Uint32Array(n);
      namespaceSetOffsets[0] = -1;
      for (var i = 1; i < n; i++) {
        namespaceSetOffsets[i] = s.position;
        var c = s.readU30(); // Count
        for (var j = 0; j < c; j++) {
          s.readU30(); // Namespace
        }
      }
    }

    private _consumeMultiname() {
      var s = this._stream;
      var kind = s.readU8();
      switch (kind) {
        case CONSTANT.QName: case CONSTANT.QNameA:
          s.readU30();
          s.readU30();
          break;
        case CONSTANT.RTQName: case CONSTANT.RTQNameA:
          s.readU30();
          break;
        case CONSTANT.RTQNameL: case CONSTANT.RTQNameLA:
          break;
        case CONSTANT.Multiname: case CONSTANT.MultinameA:
          s.readU30();
          s.readU30();
          break;
        case CONSTANT.MultinameL: case CONSTANT.MultinameLA:
          s.readU30();
          break;
        case CONSTANT.TypeName:
          s.readU32();
          var typeParameterCount = s.readU32();
          release || assert(typeParameterCount === 1); // This is probably the number of type
                                                       // parameters.
          s.readU32();
          break;
        default:
          Shumway.Debug.unexpected(kind);
          break;
      }
    }

    private _parseMultinames() {
      var s = this._stream;
      var n = s.readU30();
      this._multinames = new Array(n);
      var multinameOffsets = this._multinameOffsets = new Uint32Array(n);
      multinameOffsets[0] = -1;
      for (var i = 1; i < n; i++) {
        multinameOffsets[i] = s.position;
        this._consumeMultiname();
      }
    }

    private _parseMultiname(i: number): Multiname {
      var stream = this._stream;

      var namespaceIsRuntime = false;
      var namespaceIndex;
      var useNamespaceSet = true;
      var nameIndex = 0;

      var kind = stream.readU8();
      switch (kind) {
        case CONSTANT.QName:
        case CONSTANT.QNameA:
          namespaceIndex = stream.readU30();
          useNamespaceSet = false;
          nameIndex = stream.readU30();
          break;
        case CONSTANT.RTQName: case CONSTANT.RTQNameA:
          namespaceIsRuntime = true;
          nameIndex = stream.readU30();
          break;
        case CONSTANT.RTQNameL: case CONSTANT.RTQNameLA:
          namespaceIsRuntime = true;
          break;
        case CONSTANT.Multiname: case CONSTANT.MultinameA:
          nameIndex = stream.readU30();
          namespaceIndex = stream.readU30();
          break;
        case CONSTANT.MultinameL: case CONSTANT.MultinameLA:
          namespaceIndex = stream.readU30();
          if (!release && namespaceIndex === 0) {
            // TODO: figure out what to do in this case. What would Tamarin do?
            Debug.warning("Invalid multiname: namespace-set index is 0");
          }
          break;
        /**
         * This is undocumented, looking at Tamarin source for this one.
         */
        case CONSTANT.TypeName:
          var mn = stream.readU32();
          var typeParameterCount = stream.readU32();
          if (!release && typeParameterCount !== 1) {
            // TODO: figure out what to do in this case. What would Tamarin do?
            Debug.warning("Invalid multiname: bad type parameter count " + typeParameterCount);
          }
          var typeParameter = this.getMultiname(stream.readU32());
          var factory = this.getMultiname(mn);
          return new Multiname(this, i, kind, factory.namespaces, factory.name, typeParameter);
        default:
          Shumway.Debug.unexpected();
          break;
      }

      // A name index of 0 means that it's a runtime name.
      var name = nameIndex === 0 ? null : this.getString(nameIndex);
      var namespaces;
      if (namespaceIsRuntime) {
        namespaces = null;
      } else {
        namespaces = useNamespaceSet ?
                     this.getNamespaceSet(namespaceIndex) :
                     [this.getNamespace(namespaceIndex)];
      }

      return new Multiname(this, i, kind, namespaces, name);
    }

    private _checkMagic() {
      var magic = this._stream.readWord();
      var flashPlayerBrannan = 46 << 16 | 15;
      if (magic < flashPlayerBrannan) {
        this.env.app.sec.throwError('VerifierError', Errors.InvalidMagicError, magic >> 16,
                                    magic & 0xffff);
      }
    }

    /**
     * String duplicates exist in practice but are extremely rare.
     */
    private _checkForDuplicateStrings(): boolean {
      var a = [];
      for (var i = 0; i < this._strings.length; i++) {
        a.push(this.getString(i));
      }
      a.sort();
      for (var i = 0; i < a.length - 1; i++) {
        if (a[i] === a[i + 1]) {
          return true;
        }
      }
      return false;
    }

    /**
     * Returns the string at the specified index in the string table.
     */
    public getString(i: number): string {
      release || assert(i >= 0 && i < this._stringOffsets.length);
      var str = this._strings[i];
      if (str === undefined) {
        var s = this._stream;
        s.seek(this._stringOffsets[i]);
        var l = s.readU30();
        str = this._strings[i] = s.readUTFString(l);
      }
      return str;
    }

    /**
     * Returns the multiname at the specified index in the multiname table.
     */
    public getMultiname(i: number): Multiname {
      if (i < 0 || i >= this._multinameOffsets.length) {
        this.applicationDomain.sec.throwError("VerifierError",
                                                         Errors.CpoolIndexRangeError, i,
                                                         this._multinameOffsets.length);
      }
      if (i === 0) {
        return null;
      }
      var mn = this._multinames[i];
      if (mn === undefined) {
        var s = this._stream;
        s.seek(this._multinameOffsets[i]);
        mn = this._multinames[i] = this._parseMultiname(i);
      }
      return mn;
    }

    /**
     * Returns the namespace at the specified index in the namespace table.
     */
    public getNamespace(i: number): Namespace {
      if (i < 0 || i >= this._namespaceOffsets.length) {
        this.applicationDomain.sec.throwError("VerifierError", Errors.CpoolIndexRangeError, i,
                                              this._namespaceOffsets.length);
      }
      if (i === 0) {
        return Namespace.PUBLIC;
      }
      var ns = this._namespaces[i];
      if (ns !== undefined) {
        return ns;
      }
      var s = this._stream;
      s.seek(this._namespaceOffsets[i]);
      var kind = s.readU8();
      var uriIndex = s.readU30();
      var uri = uriIndex ? this.getString(uriIndex) : undefined;
      var type: NamespaceType;
      switch (kind) {
        case CONSTANT.Namespace:
        case CONSTANT.PackageNamespace:
          type = NamespaceType.Public;
          break;
        case CONSTANT.PackageInternalNs:
          type = NamespaceType.PackageInternal;
          break;
        case CONSTANT.ProtectedNamespace:
          type = NamespaceType.Protected;
          break;
        case CONSTANT.ExplicitNamespace:
          type = NamespaceType.Explicit;
          break;
        case CONSTANT.StaticProtectedNs:
          type = NamespaceType.StaticProtected;
          break;
        case CONSTANT.PrivateNs:
          type = NamespaceType.Private;
          break;
        default:
          this.applicationDomain.sec.throwError("VerifierError",
                                                Errors.CpoolEntryWrongTypeError, i);
      }
      if (uri && type !== NamespaceType.Private) {
        // TODO: deal with API versions here. Those are suffixed to the uri. We used to
        // just strip them out, but we also had an assert against them occurring at all,
        // so it might be the case that we don't even need to do anything at all.
      } else if (uri === undefined) {
        // Only private namespaces gets the empty string instead of undefined. A comment
        // in Tamarin source code indicates this might not be intentional, but oh well.
        uri = '';
      }
      ns = this._namespaces[i] = internNamespace(type, uri);
      return ns;
    }

    /**
     * Returns the namespace set at the specified index in the namespace set table.
     */
    public getNamespaceSet(i: number): Namespace [] {
      if (i < 0 || i >= this._namespaceSets.length) {
        this.applicationDomain.sec.throwError("VerifierError", Errors.CpoolIndexRangeError, i,
                                              this._namespaceSets.length);
      }
      if (i === 0) {
        return null;
      }
      var nss = this._namespaceSets[i];
      if (nss === undefined) {
        var s = this._stream;
        var o = this._namespaceSetOffsets[i];
        s.seek(o);
        var c = s.readU30(); // Count
        nss = this._namespaceSets[i] = new Array(c);
        o = s.position;
        for (var j = 0; j < c; j++) {
          s.seek(o);
          var x = s.readU30();
          o = s.position; // The call to |getNamespace| can change our current position.
          nss[j] = this.getNamespace(x);
        }
      }
      return nss;
    }

    private _parseMethodInfos() {
      var s = this._stream;
      var n = s.readU30();
      this._methods = new Array(n);
      this._methodInfoOffsets = new Uint32Array(n);
      for (var i = 0; i < n; ++i) {
        this._methodInfoOffsets[i] = s.position;
        this._consumeMethodInfo();
      }
    }

    private _consumeMethodInfo() {
      var s = this._stream;
      var parameterCount = s.readU30();
      s.readU30(); // Return Type
      var parameterOffset = s.position;
      for (var i = 0; i < parameterCount; i++) {
        s.readU30();
      }
      var nm = s.readU30();
      var flags = s.readU8();
      if (flags & METHOD.HasOptional) {
        var optionalCount = s.readU30();
        release || assert(parameterCount >= optionalCount);
        for (var i = parameterCount - optionalCount; i < parameterCount; i++) {
          s.readU30(); // Value Index
          s.readU8(); // Value Kind
        }
      }
      if (flags & METHOD.HasParamNames) {
        for (var i = 0; i < parameterCount; i++) {
          s.readU30();
        }
      }
    }

    private _parseMethodInfo(j: number) {
      var s = this._stream;
      var parameterCount = s.readU30();
      var returnType = s.readU30();
      var parameterOffset = s.position;
      var parameters = new Array<ParameterInfo>(parameterCount);
      for (var i = 0; i < parameterCount; i++) {
        parameters[i] = new ParameterInfo(this, s.readU30(), 0, -1, -1);
      }
      var name = s.readU30();
      var flags = s.readU8();
      var optionalCount = 0;
      if (flags & METHOD.HasOptional) {
        optionalCount = s.readU30();
        release || assert(parameterCount >= optionalCount);
        for (var i = parameterCount - optionalCount; i < parameterCount; i++) {
          parameters[i].optionalValueIndex = s.readU30();
          parameters[i].optionalValueKind = s.readU8();
        }
      }
      if (flags & METHOD.HasParamNames) {
        for (var i = 0; i < parameterCount; i++) {
          // NOTE: We can't get the parameter name as described in the spec because some SWFs have
          // invalid parameter names. Tamarin ignores parameter names and so do we.
          parameters[i].name = s.readU30();
        }
      }
      return new MethodInfo(this, j, name, returnType, parameters, optionalCount, flags);
    }

    /**
     * Returns the method info at the specified index in the method info table.
     */
    public getMethodInfo(i: number) {
      release || assert(i >= 0 && i < this._methodInfoOffsets.length);
      var mi = this._methods[i];
      if (mi === undefined) {
        var s = this._stream;
        s.seek(this._methodInfoOffsets[i]);
        mi = this._methods[i] = this._parseMethodInfo(i);
      }
      return mi;
    }

    public getMethodBodyInfo(i: number) {
      return this._methodBodies[i];
    }

    private _parseMetaData() {
      var s = this._stream;
      var n = s.readU30();
      this._metadata = new Array(n);
      var metadataInfoOffsets = this._metadataInfoOffsets = new Uint32Array(n);
      for (var i = 0; i < n; i++) {
        metadataInfoOffsets[i] = s.position;
        s.readU30(); // Name
        var itemCount = s.readU30(); // Item Count
        for (var j = 0; j < itemCount; j++) {
          s.readU30();
          s.readU30();
        }
      }
    }

    public getMetadataInfo(i: number): MetadataInfo {
      release || assert(i >= 0 && i < this._metadata.length);
      var mi = this._metadata[i];
      if (mi === undefined) {
        var s = this._stream;
        s.seek(this._metadataInfoOffsets[i]);
        var name = s.readU30(); // Name
        var itemCount = s.readU30(); // Item Count
        var keys = new Uint32Array(itemCount);
        for (var j = 0; j < itemCount; j++) {
          keys[j] = s.readU30();
        }
        var values = new Uint32Array(itemCount);
        for (var j = 0; j < itemCount; j++) {
          values[j] = s.readU30();
        }
        mi = this._metadata[i] = new MetadataInfo(this, name, keys, values);
      }
      return mi;
    }

    private _parseInstanceAndClassInfos() {
      var s = this._stream;
      var n = s.readU30();
      var instances = this.instances = new Array(n);
      for (var i = 0; i < n; i++) {
        instances[i] = this._parseInstanceInfo();
      }
      this._parseClassInfos(n);
      var o = s.position;
      for (var i = 0; i < n; i++) {
        instances[i].classInfo = this.classes[i];
      }
      s.seek(o);
    }

    private _parseInstanceInfo(): InstanceInfo {
      var s = this._stream;
      var name = s.readU30();
      var superName = s.readU30();
      var flags = s.readU8();
      var protectedNsIndex = 0;
      if (flags & CONSTANT.ClassProtectedNs) {
        protectedNsIndex = s.readU30();
      }
      var interfaceCount = s.readU30();
      var interfaces = [];
      for (var i = 0; i < interfaceCount; i++) {
        interfaces[i] = s.readU30();
      }
      var initializer = s.readU30();
      var traits = this._parseTraits();
      var instanceInfo = new InstanceInfo(this, name, superName, flags, protectedNsIndex,
                                          interfaces, initializer, traits);
      traits.attachHolder(instanceInfo);
      return instanceInfo;
    }

    private _parseTraits() {
      var s = this._stream;
      var n = s.readU30();
      var traits = [];
      for (var i = 0; i < n; i++) {
        traits.push(this._parseTrait());
      }
      return new Traits(traits);
    }

    private _parseTrait() {
      var s = this._stream;
      var name = s.readU30();
      var tag = s.readU8();

      var kind = tag & 0x0F;
      var attributes = (tag >> 4) & 0x0F;

      var trait: TraitInfo;
      switch (kind) {
        case TRAIT.Slot:
        case TRAIT.Const:
          var slot = s.readU30();
          var type = s.readU30();
          var valueIndex = s.readU30();
          var valueKind = -1;
          if (valueIndex !== 0) {
            valueKind = s.readU8();
          }
          trait = new SlotTraitInfo(this, kind, name, slot, type, valueKind, valueIndex);
          break;
        case TRAIT.Method:
        case TRAIT.Getter:
        case TRAIT.Setter:
          var dispID = s.readU30(); // Tamarin optimization.
          var methodInfoIndex = s.readU30();
          var o = s.position;
          var methodInfo = this.getMethodInfo(methodInfoIndex);
          trait = methodInfo.trait = new MethodTraitInfo(this, kind, name, methodInfo);
          s.seek(o);
          break;
        case TRAIT.Class:
          var slot = s.readU30();
          var classInfo = this.classes[s.readU30()];
          trait = classInfo.trait = new ClassTraitInfo(this, kind, name, slot, classInfo);
          break;
        default:
          this.applicationDomain.sec.throwError("VerifierError",
                                                           Errors.UnsupportedTraitsKindError, kind);
      }

      if (attributes & ATTR.Metadata) {
        var n = s.readU30();
        var metadata = new Uint32Array(n);
        for (var i = 0; i < n; i++) {
          metadata[i] = s.readU30();
        }
        trait.metadata = metadata;
      }
      return trait;
    }

    private _parseClassInfos(n: number) {
      var s = this._stream;
      var classes = this.classes = new Array(n);
      for (var i = 0; i < n; i++) {
        classes[i] = this._parseClassInfo(i);
      }
    }

    private _parseClassInfo(i: number) {
      var s = this._stream;
      var initializer = s.readU30();
      var traits = this._parseTraits();
      var classInfo = new ClassInfo(this, this.instances[i], initializer, traits);
      traits.attachHolder(classInfo);
      return classInfo;
    }

    private _parseScriptInfos() {
      var s = this._stream;
      var n = s.readU30();
      var scripts = this.scripts = new Array(n);
      for (var i = 0; i < n; i++) {
        scripts[i] = this._parseScriptInfo();
      }
    }

    private _parseScriptInfo() {
      var s = this._stream;
      var initializer = s.readU30();
      var traits = this._parseTraits();
      var scriptInfo = new ScriptInfo(this, initializer, traits);
      traits.attachHolder(scriptInfo);
      return scriptInfo;
    }

    private _parseMethodBodyInfos() {
      var s = this._stream;
      var methodBodies = this._methodBodies = new Array(this._methods.length);
      var n = s.readU30();
      var o = s.position;
      for (var i = 0; i < n; i++) {
        var methodInfo = s.readU30();
        var maxStack = s.readU30();
        var localCount = s.readU30();
        var initScopeDepth = s.readU30();
        var maxScopeDepth = s.readU30();
        var code = s.viewU8s(s.readU30());

        var e = s.readU30();
        var exceptions = new Array(e);
        for (var j = 0; j < e; ++j) {
          exceptions[j] = this._parseException();
        }
        var traits = this._parseTraits();
        methodBodies[methodInfo] = new MethodBodyInfo(maxStack, localCount, initScopeDepth, maxScopeDepth, code, exceptions, traits);
        traits.attachHolder(methodBodies[methodInfo]);
      }
    }

    private _parseException() {
      var s = this._stream;
      var start = s.readU30();
      var end = s.readU30();
      var target = s.readU30();
      var type = s.readU30();
      var varName = s.readU30();
      return new ExceptionInfo(this, start, end, target, type, varName);
    }

    public getConstant(kind: CONSTANT, i: number): any {
      switch (kind) {
        case CONSTANT.Int:
          return this.ints[i];
        case CONSTANT.UInt:
          return this.uints[i];
        case CONSTANT.Double:
          return this.doubles[i];
        case CONSTANT.Utf8:
          return this.getString(i);
        case CONSTANT.True:
          return true;
        case CONSTANT.False:
          return false;
        case CONSTANT.Null:
          return null;
        case CONSTANT.Undefined:
          return undefined;
        case CONSTANT.Namespace:
        case CONSTANT.PackageInternalNs:
          return this.getNamespace(i);
        case CONSTANT.QName:
        case CONSTANT.MultinameA:
        case CONSTANT.RTQName:
        case CONSTANT.RTQNameA:
        case CONSTANT.RTQNameL:
        case CONSTANT.RTQNameLA:
        case CONSTANT.NameL:
        case CONSTANT.NameLA:
          return this.getMultiname(i);
        case CONSTANT.Float:
          Shumway.Debug.warning("TODO: CONSTANT.Float may be deprecated?");
          break;
        default:
          release || assert(false, "Not Implemented Kind " + kind);
      }
    }

    stress() {
      for (var i = 0; i < this._multinames.length; i++) {
        this.getMultiname(i);
      }
      for (var i = 0; i < this._namespaceSets.length; i++) {
        this.getNamespaceSet(i);
      }
      for (var i = 0; i < this._namespaces.length; i++) {
        this.getNamespace(i);
      }
      for (var i = 0; i < this._strings.length; i++) {
        this.getString(i);
      }
    }

    trace(writer: IndentingWriter) {
      writer.writeLn("Multinames: " + this._multinames.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this._multinames.length; i++) {
          writer.writeLn(i + " " + this.getMultiname(i));
        }
        writer.outdent();
      }

      writer.writeLn("Namespace Sets: " + this._namespaceSets.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this._namespaceSets.length; i++) {
          writer.writeLn(i + " " + this.getNamespaceSet(i));
        }
        writer.outdent();
      }

      writer.writeLn("Namespaces: " + this._namespaces.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this._namespaces.length; i++) {
          writer.writeLn(i + " " + this.getNamespace(i));
        }
        writer.outdent();
      }

      writer.writeLn("Strings: " + this._strings.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this._strings.length; i++) {
          writer.writeLn(i + " " + this.getString(i));
        }
        writer.outdent();
      }

      writer.writeLn("MethodInfos: " + this._methods.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this._methods.length; i++) {
          writer.writeLn(i + " " + this.getMethodInfo(i));
          if (this._methodBodies[i]) {
            this._methodBodies[i].trace(writer);
          }
        }
        writer.outdent();
      }

      writer.writeLn("InstanceInfos: " + this.instances.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this.instances.length; i++) {
          writer.writeLn(i + " " + this.instances[i]);
          this.instances[i].trace(writer);
        }
        writer.outdent();
      }

      writer.writeLn("ClassInfos: " + this.classes.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this.classes.length; i++) {
          this.classes[i].trace(writer);
        }
        writer.outdent();
      }

      writer.writeLn("ScriptInfos: " + this.scripts.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this.scripts.length; i++) {
          this.scripts[i].trace(writer);
        }
        writer.outdent();
      }
    }
  }

  export class ABCCatalog {
    map: Shumway.MapObject<Shumway.MapObject<string>>;
    abcs: Uint8Array;
    scripts: Shumway.MapObject<any>;
    app: AXApplicationDomain;

    constructor(app: AXApplicationDomain, abcs: Uint8Array, index: any) {
      this.app = app;
      this.map = ObjectUtilities.createMap<Shumway.MapObject<string>>();
      this.abcs = abcs;
      this.scripts = ObjectUtilities.createMap<string>();
      for (var i = 0; i < index.length; i++) {
        var abc = index[i];
        this.scripts[abc.name] = abc;
        release || assert(Array.isArray(abc.defs));
        for (var j = 0; j < abc.defs.length; j++) {
          var def = abc.defs[j].split(':');
          var nameMappings = this.map[def[1]];
          if (!nameMappings) {
            nameMappings = this.map[def[1]] = Object.create(null);
          }
          nameMappings[def[0]] = abc.name;
        }
      }
    }

    getABCByScriptName(scriptName: string): ABCFile {
      var entry = this.scripts[scriptName];
      if (!entry) {
        return null;
      }
      var env = {url: scriptName, app: this.app};
      return new ABCFile(env, this.abcs.subarray(entry.offset, entry.offset + entry.length));
    }

    getABCByMultiname(mn: Multiname): ABCFile {
      var mappings = this.map[mn.name];
      if (!mappings) {
        return null;
      }
      var namespaces = mn.namespaces;
      for (var i = 0; i < namespaces.length; i++) {
        var ns = namespaces[i];
        var scriptName = mappings[ns.uri];
        if (scriptName) {
          return this.getABCByScriptName(scriptName);
        }
      }
      return null;
    }
  }
}
