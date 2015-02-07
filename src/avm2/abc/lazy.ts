module Shumway.AVM2.ABCX {
  import assert = Shumway.Debug.assert;
  import hashBytesTo32BitsAdler = Shumway.HashUtilities.hashBytesTo32BitsAdler;
  import AbcStream = Shumway.AVM2.ABC.AbcStream;

  var writer = new IndentingWriter();

  /**
   * Naming Conventions:
   *
   *  nm:   name
   *  ns:   namespace
   *  nss:  namespace set
   *  nx:   namespace or namespace set (negative numbers)
   *  mn:   multiname
   *
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
    Arguments           = 0x1,
    Activation          = 0x2,
    Needrest            = 0x4,
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
    Const              = 6
  }

  export enum ATTR {
    Final              = 0x01,
    Override           = 0x02,
    Metadata           = 0x04
  }

  export class MetadataInfo {

  }

  export class TraitInfo {
    public metadata: Uint32Array [];
    constructor(
      public kind: TRAIT,
      public name: number
    ) {
      this.metadata = null;
    }

    toString(abc: ABCFile) {
      return TRAIT[this.kind] + " " + abc.getMultiname(this.name);
    }
  }

  export class SlotTraitInfo extends TraitInfo {
    constructor(
      kind: TRAIT,
      name: number,
      public slot: number,
      public type: number,
      public defaultValueKind: CONSTANT,
      public defaultValueIndex: number
    ) {
      super(kind, name);
    }
  }

  export class MethodTraitInfo extends TraitInfo {
    constructor(
      kind: TRAIT,
      name: number,
      public methodInfo: number
    ) {
      super(kind, name);
    }
  }

  export class ClassTraitInfo extends TraitInfo {
    constructor(
      kind: TRAIT,
      name: number,
      public classInfo: number
    ) {
      super(kind, name);
    }
  }

  export class ParameterInfo {
    constructor(
      public abc: ABCFile,
      public type: number,
      /**
       * Don't rely on the name being correct.
       */
      public name: number,
      public optionalValueKind: CONSTANT,
      public optionalValueIndex: number
    ) {
      // ...
    }

    toString() {
      var str = "";
      if (this.name) {
        str += this.abc.getString(this.name);
      } else {
        str += "?";
      }
      if (this.type) {
        str += ": " + this.abc.getMultiname(this.type).getNameString();
      }
      if (this.optionalValueKind >= 0) {
        str += " = " + this.abc.getConstant(this.optionalValueKind, this.optionalValueIndex);
      }
      return str;
    }
  }

  export class InstanceInfo {
    constructor(
      public abc: ABCFile,
      public name: number,
      public superName: number,
      public flags: number,
      public protectedNs: number,
      public interfaces: number [],
      public initializer: number,
      public traits: TraitInfo []
    ) {
      // ...
    }

    toString() {
      return this.abc.getMultiname(this.name).getNameString();
    }

    trace(writer: IndentingWriter) {
      writer.enter("InstanceInfo: " + this.abc.getMultiname(this.name).getNameString());
      this.superName && writer.writeLn("Super: " + this.abc.getMultiname(this.superName).getNameString());
      this.traits.forEach(x => writer.writeLn(x.toString(this.abc)));
      writer.outdent();
    }
  }

  export class ScriptInfo {
    constructor(
      public abc: ABCFile,
      public initializer: number,
      public traits: TraitInfo []
    ) {
      // ...
    }

    trace(writer: IndentingWriter) {
      writer.enter("ScriptInfo: " + this.traits.length);
      this.traits.forEach(x => writer.writeLn(x.toString(this.abc)));
      writer.outdent();
    }
  }

  export class ClassInfo {
    constructor(
      public abc: ABCFile,
      public instanceInfo: number,
      public initializer: number,
      public traits: TraitInfo []
    ) {
      // ...
    }

    trace(writer: IndentingWriter) {
      writer.enter("ClassInfo: " + this.traits.length);
      this.traits.forEach(x => writer.writeLn(x.toString(this.abc)));
      writer.outdent();
    }
  }

  export class ExceptionInfo {
    constructor(
      public start: number,
      public end: number,
      public target: number,
      public type: number,
      public varName: number
    ) {
      // ...
    }
  }

  export class MethodBodyInfo {
    constructor(
      public maxStack: number,
      public localCount: number,
      public initScopeDepth: number,
      public maxScopeDepth: number,
      public code: Uint8Array,
      public exceptions: ExceptionInfo [],
      public traits: TraitInfo []
    ) {
      // ...
    }

    trace(writer: IndentingWriter) {
      writer.writeLn("Code: " + this.code.length);
    }
  }

  export class MethodInfo {
    public body: MethodBodyInfo;
    constructor(
      public abc: ABCFile,
      public name: number,
      public returnType: number,
      public parameters: ParameterInfo [],
      public optionalCount: number,
      public flags: number
    ) {
      this.body = null;
    }

    toString() {
      var str = "anonymous";
      if (this.name) {
        str = this.abc.getString(this.name);
      }
      str += " (" + this.parameters.join(", ") + ")";
      if (this.returnType) {
        str += ": " + this.abc.getMultiname(this.returnType).getNameString();
      }
      return str;
    }
  }

  export class Multiname {
    constructor(
      public abc: ABCFile,
      public kind: CONSTANT,
      public nx: number,
      public name: number,
      public parameterType: number = 0
    ) {
      // ...
    }

    getNameString(): string {
      return this.abc.getString(this.name);
    }

    private _nameToString(): string {
      if (this.isAnyName()) {
        return "*";
      }
      return this.isRuntimeName() ? "[]" : this.getNameString();
    }

    public toString() {
      var str = this.isAttribute() ? "@" : "";
      if (this.isAnyNamespace()) {
        str += "*::" + this._nameToString();
      } else if (this.isRuntimeNamespace()) {
        str += "[]::" + this._nameToString();
      } else if (this.isQName()) {
        str += this.abc.getNamespace(this.nx) + "::";
        str += this._nameToString();
      } else {
        var nss = Math.abs(this.nx) - 1;
        str += "{" + this.abc.getNamespaceSet(nss).map(x => String(x)).join(", ") + "}";
        str += "::" + this._nameToString();
      }
      if (this.parameterType > 0) {
        str += "<" + this.abc.getMultiname(this.parameterType) + ">";
      }
      return str;
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
      return !this.isRuntimeName() && this.name === 0;
    }

    public isAnyNamespace(): boolean {
      if (this.isRuntimeNamespace()) {
        return false;
      }
      return this.nx === 0;

      // x.* has the same meaning as x.*::*, so look for the former case and give
      // it the same meaning of the latter.
      // return !this.isRuntimeNamespace() &&
      //  (this.namespaces.length === 0 || (this.isAnyName() && this.namespaces.length !== 1));
    }

    public isQName(): boolean {
      return this.nx >= 0 && !this.isAnyName();
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
  }

  export class Namespace {
    constructor(public abc: ABCFile, public kind: CONSTANT, public name: number) {
      assert (kind !== undefined);
      // ...
    }

    getNameString(): string {
      return this.name === 0 ? "*" : this.abc.getString(this.name);
    }

    toString() {
      return CONSTANT[this.kind] + " " + this.getNameString();
    }
  }

  export class ABCFile {
    public hash: number;
    public ints: Int32Array;
    public uints: Uint32Array;
    public doubles: Float64Array;

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

    private _classes: ClassInfo [];
    private _scripts: ScriptInfo [];
    private _instances: InstanceInfo [];

    constructor(
      private _buffer: Uint8Array,
      private _fileName?: string
    ) {
      this._stream = new AbcStream(_buffer);
      this.hash = hashBytesTo32BitsAdler(_buffer, 0, _buffer.length);
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

      this.trace(writer);
      // this.stress();
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
          release || assert(typeParameterCount === 1); // This is probably the number of type parameters.
          s.readU32();
          break;
        default:
          Shumway.Debug.unexpected();
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

    private _parseMultiname(): Multiname {
      var s = this._stream;

      var nx;
      var nm;

      var kind = s.readU8();
      switch (kind) {
        case CONSTANT.QName:
        case CONSTANT.QNameA:
          nx = s.readU30();
          nm = s.readU30();
          break;
        case CONSTANT.RTQName: case CONSTANT.RTQNameA:
          nm = s.readU30();
          break;
        case CONSTANT.RTQNameL: case CONSTANT.RTQNameLA:
          break;
        case CONSTANT.Multiname: case CONSTANT.MultinameA:
          nm = s.readU30();
          nx = -1 - s.readU30();
          break;
        case CONSTANT.MultinameL: case CONSTANT.MultinameLA:
          nx = -1 - s.readU30();
          release || assert(nx !== 0, "NX is zero.");
          break;
        /**
         * This is undocumented, looking at Tamarin source for this one.
         */
        case CONSTANT.TypeName:
          var mn = s.readU32();
          var typeParameterCount = s.readU32();
          release || assert(typeParameterCount === 1, "typeParameterCount is bad " + typeParameterCount); // This is probably the number of type parameters.
          var typeParameterMn = s.readU32();
          var factory = this.getMultiname(mn);
          return new Multiname(this, kind, factory.nx, factory.name, typeParameterMn);
        default:
          Shumway.Debug.unexpected();
          break;
      }
      return new Multiname(this, kind, nx, nm);
    }

    private _checkMagic() {
      var magic = this._stream.readWord();
      var flashPlayerBrannan = 46 << 16 | 15;
      if (magic < flashPlayerBrannan) {
        throw new Error("Invalid ABC File (magic = " + Number(magic).toString(16) + ")");
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
      release || assert(i >= 0 && i < this._multinameOffsets.length);
      if (i === 0) {
        return null;
      }
      var mn = this._multinames[i];
      if (mn === undefined) {
        var s = this._stream;
        s.seek(this._multinameOffsets[i]);
        mn = this._multinames[i] = this._parseMultiname();
      }
      return mn;
    }

    /**
     * Returns the namespace at the specified index in the namespace table.
     */
    public getNamespace(i: number): Namespace {
      release || assert(i >= 0 && i < this._namespaceOffsets.length);
      if (i === 0) {
        return null;
      }
      var ns = this._namespaces[i];
      if (ns === undefined) {
        var s = this._stream;
        s.seek(this._namespaceOffsets[i]);
        ns = this._namespaces[i] = new Namespace(this, s.readU8(), s.readU30());
      }
      return ns;
    }

    /**
     * Returns the namespace set at the specified index in the namespace set table.
     */
    public getNamespaceSet(i: number): Namespace [] {
      release || assert(i >= 0 && i < this._namespaceSets.length);
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

    private _parseMethodInfo() {
      var s = this._stream;
      var parameterCount = s.readU30();
      var returnType = s.readU30();
      var parameterOffset = s.position;
      var parameters = new Array(parameterCount);
      for (var i = 0; i < parameterCount; i++) {
        parameters[i] = new ParameterInfo(this, s.readU30(), 0, -1, -1);
      }
      var name = s.readU30();
      var flags = s.readU8();
      if (flags & METHOD.HasOptional) {
        var optionalCount = s.readU30();
        release || assert(parameterCount >= optionalCount);
        for (var i = parameterCount - optionalCount; i < parameterCount; i++) {
          parameters[i].value = s.readU30();
          parameters[i].kind = s.readU8();
        }
      }
      if (flags & METHOD.HasParamNames) {
        for (var i = 0; i < parameterCount; i++) {
          // NOTE: We can't get the parameter name as described in the spec because some SWFs have
          // invalid parameter names. Tamarin ignores parameter names and so do we.
          parameters[i].name = s.readU30();
        }
      }
      return new MethodInfo(this, name, returnType, parameters, optionalCount, flags);
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
        mi = this._methods[i] = this._parseMethodInfo();
      }
      return mi;
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

    private _parseInstanceAndClassInfos() {
      var s = this._stream;
      var n = s.readU30();
      var instances = this._instances = new Array(n);
      for (var i = 0; i < n; i++) {
        instances[i] = this._parseInstanceInfo();
      }
      this._parseClassInfos(n);
    }

    private _parseInstanceInfo() {
      var s = this._stream;
      var name = s.readU30();
      var superName = s.readU30();
      var flags = s.readU8();
      var protectedNs = 0;
      if (flags & CONSTANT.ClassProtectedNs) {
        protectedNs = s.readU30();
      }
      var interfaceCount = s.readU30();
      var interfaces = [];
      for (var i = 0; i < interfaceCount; i++) {
        interfaces[i] = s.readU30();
      }
      var initializer = s.readU30();
      var traits = this._parseTraits();
      return new InstanceInfo(this, name, superName, flags, protectedNs, interfaces, initializer, traits);
    }

    private _parseTraits() {
      var s = this._stream;
      var n = s.readU30();
      var traits = [];
      for (var i = 0; i < n; i++) {
        traits.push(this._parseTrait());
      }
      return traits;
    }

    private _parseTrait() {
      var s = this._stream;
      var name = s.readU30();
      var tag = s.readU8();

      var kind = tag & 0x0F;
      var attributes = (tag >> 4) & 0x0F;

      var trait;
      switch (kind) {
        case TRAIT.Slot:
        case TRAIT.Const:
          var slot = s.readU30();
          var type = s.readU30();
          var valueIndex = s.readU30();
          var valueKind = 0;
          if (valueIndex !== 0) {
            valueKind = s.readU8();
          }
          trait = new SlotTraitInfo(kind, name, slot, type, valueIndex, valueKind);
          break;
        case TRAIT.Method:
        case TRAIT.Setter:
        case TRAIT.Getter:
          var dispID = s.readU30(); // Tamarin optimization.
          var methodInfo = s.readU30();
          // this.methodInfo.name = this.name;
          trait = new MethodTraitInfo(kind, name, methodInfo);
          break;
        case TRAIT.Class:
          var slot = s.readU30();
          var classInfo = s.readU30();
          trait = new ClassTraitInfo(kind, name, classInfo);
          break;
        default:
          release || assert(false, "Unknown trait kind: " + TRAIT[kind] + " " + kind);
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
      var classes = this._classes = new Array(n);
      for (var i = 0; i < n; i++) {
        classes[i] = this._parseClassInfo(i);
      }
    }

    private _parseClassInfo(i: number) {
      var s = this._stream;
      var initializer = s.readU30();
      var traits = this._parseTraits();
      return new ClassInfo(this, i, initializer, traits);
    }

    private _parseScriptInfos() {
      var s = this._stream;
      var n = s.readU30();
      var scripts = this._scripts = new Array(n);
      for (var i = 0; i < n; i++) {
        scripts[i] = this._parseScriptInfo();
      }
    }

    private _parseScriptInfo() {
      var s = this._stream;
      var initializer = s.readU30();
      var traits = this._parseTraits();
      return new ScriptInfo(this, initializer, traits);
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
          exceptions[i] = this._parseException();
        }
        var traits = this._parseTraits();
        methodBodies[methodInfo] = new MethodBodyInfo(maxStack, localCount, initScopeDepth, maxScopeDepth, code, exceptions, traits);
      }
    }

    private _parseException() {
      var s = this._stream;
      var start = s.readU30();
      var end = s.readU30();
      var target = s.readU30();
      var type = s.readU30();
      var varName = s.readU30();
      return new ExceptionInfo(start, end, target, type, varName);
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
      return false;
      writer.writeLn("");
      writer.writeLn("");

      writer.writeLn("Multinames: " + this._multinames.length);
      writer.writeLn("Namespace Sets: " + this._namespaceSets.length);
      writer.writeLn("Namespaces: " + this._namespaces.length);
      writer.writeLn("Strings: " + this._strings.length);
      writer.writeLn("Methods: " + this._methods.length);
      writer.writeLn("InstanceInfos: " + this._instances.length);
      writer.writeLn("ClassInfos: " + this._classes.length);
      writer.writeLn("ScriptInfos: " + this._scripts.length);

      writer.writeLn("");

      writer.writeLn("Multinames: " + this._multinames.length);
      if (false) {
        writer.indent();
        for (var i = 0; i < this._multinames.length; i++) {
          writer.writeLn(i + " " + this.getMultiname(i));
        }
        writer.outdent();
      }

      writer.writeLn("Namespace Sets: " + this._namespaceSets.length);
      if (false) {
        writer.indent();
        for (var i = 0; i < this._namespaceSets.length; i++) {
          writer.writeLn(i + " " + this.getNamespaceSet(i));
        }
        writer.outdent();
      }

      writer.writeLn("Namespaces: " + this._namespaces.length);
      if (false) {
        writer.indent();
        for (var i = 0; i < this._namespaces.length; i++) {
          writer.writeLn(i + " " + this.getNamespace(i));
        }
        writer.outdent();
      }

      writer.writeLn("Strings: " + this._strings.length);
      if (false) {
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

      writer.writeLn("InstanceInfos: " + this._instances.length);
      if (false) {
        writer.indent();
        for (var i = 0; i < this._instances.length; i++) {
          writer.writeLn(i + " " + this._instances[i]);
          this._instances[i].trace(writer);
        }
        writer.outdent();
      }

      writer.writeLn("ClassInfos: " + this._classes.length);
      if (false) {
        writer.indent();
        for (var i = 0; i < this._classes.length; i++) {
          this._classes[i].trace(writer);
        }
        writer.outdent();
      }

      writer.writeLn("ScriptInfos: " + this._scripts.length);
      if (false) {
        writer.indent();
        for (var i = 0; i < this._scripts.length; i++) {
          this._scripts[i].trace(writer);
        }
        writer.outdent();
      }
    }
  }
}