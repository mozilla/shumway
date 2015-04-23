/*
 * Copyright 2014 Mozilla Foundation
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

module Shumway.AVM2.ABC {
  import isString = Shumway.isString;
  import isNumber = Shumway.isNumber;
  import isNumeric = Shumway.isNumeric;
  import isObject = Shumway.isObject;
  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;

  export class Parameter {
    /**
     * Whether this parameter is used in the method.
     */
    isUsed: boolean;
    constructor (
      public name: string,
      public type: Multiname,
      public value: any,
      public optional: boolean) {
      // ...
    }
  }

  export class Trait {
    name: Multiname;
    abc: AbcFile;
    holder: Info;
    hasDefaultValue: boolean;
    value: any;
    kind: TRAIT;
    attributes: number;
    slotId: number;
    dispId: number;
    typeName: Multiname;
    methodInfo: MethodInfo;
    classInfo: ClassInfo;
    metadata: any;
    public trace: (writer: IndentingWriter) => void;
    constructor(abc: AbcFile, stream: AbcStream, holder: Info) {
      var constantPool = abc.constantPool;
      var methods = abc.methods;
      var classes = abc.classes;
      var metadata = abc.metadata;

      this.holder = holder;
      this.name = constantPool.multinames[stream.readU30()];
      var tag = stream.readU8();

      this.kind = tag & 0x0F;
      this.attributes = (tag >> 4) & 0x0F;
      release || assert(Multiname.isQName(this.name), "Name must be a QName: " + this.name + ", kind: " + this.kind);

      switch (this.kind) {
        case TRAIT.Slot:
        case TRAIT.Const:
          this.slotId = stream.readU30();
          this.typeName = constantPool.multinames[stream.readU30()];
          var valueIndex = stream.readU30();
          this.value = undefined;
          if (valueIndex !== 0) {
            this.hasDefaultValue = true;
            this.value = constantPool.getValue(stream.readU8(), valueIndex);
          }
          break;
        case TRAIT.Method:
        case TRAIT.Setter:
        case TRAIT.Getter:
          this.dispId = stream.readU30();
          this.methodInfo = methods[stream.readU30()];
          this.methodInfo.name = this.name;
          this.methodInfo.flags |= MethodTypeFlagByTraitKind[this.kind];
          // make sure that the holder was not already set
          AbcFile.attachHolder(this.methodInfo, this.holder);
          this.methodInfo.abc = abc;
          break;
        case TRAIT.Class:
          this.slotId = stream.readU30();
          release || assert(classes, "Classes should be passed down here, I'm guessing whenever classes are being parsed.");
          this.classInfo = classes[stream.readU30()];
          break;
        case TRAIT.Function:
          // TRAIT.Function is a leftover. it's not supported at all in
          // Tamarin/Flash and will cause a verify error.
          release || assert(false, "Function encountered in the wild, should not happen");
          break;
        default:
          release || assert(false, "Unknown trait kind: " + TRAIT[this.kind]);
      }

      if (this.attributes & ATTR.Metadata) {
        var traitMetadata;
        for (var i = 0, j = stream.readU30(); i < j; i++) {
          var md = metadata[stream.readU30()];
          if (md.name === "__go_to_definition_help" ||
              md.name === "__go_to_ctor_definition_help") {
            continue;
          }
          if (!traitMetadata) {
            traitMetadata = {};
          }
          traitMetadata[md.name] = md;
        }
        if (traitMetadata) {
          // FIXME: we should probably only set Class metadata on the classInfo.
          if (this.isClass()) {
            this.classInfo.metadata = traitMetadata;
          }
          this.metadata = traitMetadata;
        }
      }
    }

    public isSlot() {
      return this.kind === TRAIT.Slot;
    }

    public isConst() {
      return this.kind === TRAIT.Const;
    }

    public isMethod() {
      return this.kind === TRAIT.Method;
    }

    public isClass() {
      return this.kind === TRAIT.Class;
    }

    public isGetter() {
      return this.kind === TRAIT.Getter;
    }

    public isSetter() {
      return this.kind === TRAIT.Setter;
    }

    public isAccessor() {
      return this.isGetter() || this.isSetter();
    }

    public isMethodOrAccessor() {
      return this.isMethod() || this.isGetter() || this.isSetter();
    }

    public isProtected() {
      release || assert (Multiname.isQName(this.name));
      return this.name.namespaces[0].isProtected();
    }

    public kindName() {
      switch (this.kind) {
        case TRAIT.Slot:      return "Slot";
        case TRAIT.Const:     return "Const";
        case TRAIT.Method:    return "Method";
        case TRAIT.Setter:    return "Setter";
        case TRAIT.Getter:    return "Getter";
        case TRAIT.Class:     return "Class";
        case TRAIT.Function:  return "Function";
      }
      Shumway.Debug.unexpected();
    }

    public isOverride() {
      return this.attributes & ATTR.Override;
    }

    public isFinal() {
      return this.attributes & ATTR.Final;
    }

    public toString() {
      var str = Shumway.IntegerUtilities.getFlags(this.attributes, "final|override|metadata".split("|"));
      if (str) {
        str += " ";
      }
      str += Multiname.getQualifiedName(this.name);
      switch (this.kind) {
        case TRAIT.Slot:
        case TRAIT.Const:
          return str + ", typeName: " + this.typeName + ", slotId: " + this.slotId + ", value: " + this.value;
        case TRAIT.Method:
        case TRAIT.Setter:
        case TRAIT.Getter:
          return str + ", " + this.kindName() + ": " + this.methodInfo.name;
        case TRAIT.Class:
          return str + ", slotId: " + this.slotId + ", class: " + this.classInfo;
        case TRAIT.Function: // TODO
          break;
      }
    }

    static parseTraits(abc: AbcFile, stream: AbcStream, holder: Info): Trait[] {
      var count = stream.readU30();
      var traits = [];
      for (var i = 0; i < count; i++) {
        traits.push(new Trait(abc, stream, holder));
      }
      return traits;
    }
  }

  export class Info {
    abc: AbcFile;
    index: number;
    hash: number;
    traits: any[] = null;
    public trace: (writer: IndentingWriter) => void;
    constructor(abc: AbcFile, index: number, hash: Hashes) {
      this.abc = abc;
      this.index = index;
      this.hash = abc.hash & Hashes.AbcMask | hash | (index << Hashes.IndexOffset);
    }
  }

  export class MethodInfo extends Info {
    static parseParameterNames: boolean = false;

    flags: number; // Initialized in ctor.
    name: Multiname;
    displayName: string; // Initialized in ctor.
    parameters: Parameter[]; // Initialized in ctor.
    returnType: Multiname; // Initialized in ctor.
    holder: Info = null;
    maxStack: number = 0;
    localCount: number = 0;
    initScopeDepth: number = 0;
    maxScopeDepth: number = 0;
    code: Uint8Array = null;
    exceptions: any[] = null;
    freeMethod: Function = null;
    cachedMethodOrTrampoline: Function = null;
    cachedMemoizer: Runtime.IMemoizer = null;
    classScope: Runtime.Scope = null;
    lastBoundMethod: {
      scope: Shumway.AVM2.Runtime.Scope;
      boundMethod: Function;
    } = null;
    activationPrototype: Object = null;
    analysis: Analysis = null;

    get hasBody() {
      return !!(this.flags & METHOD.HasBody);
    }
    set hasBody(val: boolean) {
      release || assert(val); // This shouldn't ever be reset.
      this.flags |= METHOD.HasBody;
    }
    get isInstanceInitializer() {
      return !!(this.flags & METHOD.InstanceInitializer);
    }
    set isInstanceInitializer(val: boolean) {
      release || assert(val); // This shouldn't ever be reset.
      this.flags |= METHOD.InstanceInitializer;
    }
    get isClassInitializer() {
      return !!(this.flags & METHOD.ClassInitializer);
    }
    set isClassInitializer(val: boolean) {
      release || assert(val); // This shouldn't ever be reset.
      this.flags |= METHOD.ClassInitializer;
    }
    get isScriptInitializer() {
      return !!(this.flags & METHOD.ScriptInitializer);
    }
    set isScriptInitializer(val: boolean) {
      release || assert(val); // This shouldn't ever be reset.
      this.flags |= METHOD.ScriptInitializer;
    }
    get isMethod() {
      return !!(this.flags & METHOD.MethodTrait);
    }
    set isMethod(val: boolean) {
      release || assert(val); // This shouldn't ever be reset.
      release || assert(!(this.flags & (METHOD.InstanceInitializer | METHOD.ClassInitializer |
                                        METHOD.ScriptInitializer | METHOD.GetterTrait |
                                        METHOD.SetterTrait)));
      this.flags |= METHOD.MethodTrait;
    }
    get isGetter() {
      return !!(this.flags & METHOD.GetterTrait);
    }
    set isGetter(val: boolean) {
      release || assert(val); // This shouldn't ever be reset.
      release || assert(!(this.flags & (METHOD.InstanceInitializer | METHOD.ClassInitializer |
                                        METHOD.ScriptInitializer | METHOD.MethodTrait |
                                        METHOD.SetterTrait)));
      this.flags |= METHOD.GetterTrait;
    }
    get isSetter() {
      return !!(this.flags & METHOD.SetterTrait);
    }
    set isSetter(val: boolean) {
      release || assert(val); // This shouldn't ever be reset.
      release || assert(!(this.flags & (METHOD.InstanceInitializer | METHOD.ClassInitializer |
                                        METHOD.ScriptInitializer | METHOD.MethodTrait |
                                        METHOD.GetterTrait)));
      this.flags |= METHOD.SetterTrait;
    }

    private static _getParameterName(i) {
      if (i < 26) {
        return String.fromCharCode("A".charCodeAt(0) + i);
      }
      return "P" + (i - 26);
    }

    constructor(abc: AbcFile, index: number, stream: AbcStream) {
      super(abc, index, Hashes.MethodInfo);
      var constantPool = abc.constantPool;
      var parameterCount = stream.readU30();
      this.returnType = constantPool.multinames[stream.readU30()];
      this.parameters = [];
      for (var i = 0; i < parameterCount; i++) {
        this.parameters.push(new Parameter(undefined, constantPool.multinames[stream.readU30()],
                                           undefined, false));
      }

      var name = constantPool.strings[stream.readU30()];
      release || (this.displayName = name);
      this.flags = stream.readU8();

      if (this.flags & METHOD.HasOptional) {
        var optionalCount = stream.readU30();
        release || assert(parameterCount >= optionalCount);
        for (var i = parameterCount - optionalCount; i < parameterCount; i++) {
          var valueIndex = stream.readU30();
          this.parameters[i].value = constantPool.getValue(stream.readU8(), valueIndex);
          this.parameters[i].optional = true;
        }
      }

      if (this.flags & METHOD.HasParamNames) {
        for (var i = 0; i < parameterCount; i++) {
          // NOTE: We can't get the parameter name as described in the spec because
          // some SWFs have invalid parameter names. Tamarin doesn't parse parameter
          // names correctly, so we must follow that same behaviour.
          if (MethodInfo.parseParameterNames) {
            this.parameters[i].name = constantPool.strings[stream.readU30()];
          } else {
            stream.readU30();
            this.parameters[i].name = MethodInfo._getParameterName(i);
          }
        }
      } else {
        for (var i = 0; i < parameterCount; i++) {
          this.parameters[i].name = MethodInfo._getParameterName(i);
        }
      }
    }

    public toString() {
      var flags = Shumway.IntegerUtilities.getFlags(this.flags, "NEED_ARGUMENTS|NEED_ACTIVATION|NEED_REST|HAS_OPTIONAL|||SET_DXN|HAS_PARAM_NAMES".split("|"));
      return (flags ? flags + " " : "") + this.name;
    }
    public hasOptional(): boolean {
      return !!(this.flags & METHOD.HasOptional);
    }
    public needsActivation(): boolean {
      return !!(this.flags & METHOD.Activation);
    }
    public needsRest(): boolean {
      return !!(this.flags & METHOD.Needrest);
    }
    public needsArguments(): boolean {
      return !!(this.flags & METHOD.Arguments);
    }
    public isNative(): boolean {
      return !!(this.flags & METHOD.Native);
    }
    public isClassMember(): boolean {
      return this.holder instanceof ClassInfo;
    }
    public isInstanceMember(): boolean {
      return this.holder instanceof InstanceInfo;
    }
    public isScriptMember(): boolean {
      return this.holder instanceof ScriptInfo;
    }
    public hasSetsDxns(): boolean {
      return !!(this.flags & METHOD.Setsdxns);
    }

    static parseException(abc, stream) {
      var multinames = abc.constantPool.multinames;

      var ex = {
        start: stream.readU30(),
        end: stream.readU30(),
        target: stream.readU30(),
        typeNameIndex: stream.readU30(),
        typeName: undefined,
        varName: multinames[stream.readU30()]
      };
      ex.typeName = multinames[ex.typeNameIndex];
      release || assert(!ex.typeName || !ex.typeName.isRuntime());
      release || assert(!ex.varName || ex.varName.isQName());
      return ex;
    }


    static parseBody (abc: AbcFile, stream: AbcStream) {
      var methods = abc.methods;

      var index = stream.readU30();
      var mi = methods[index];
      mi.index = index;
      mi.hasBody = true;
      release || assert(!mi.isNative());
      mi.maxStack = stream.readU30();
      mi.localCount = stream.readU30();
      mi.initScopeDepth = stream.readU30();
      mi.maxScopeDepth = stream.readU30();
      // TODO: don't copy the underlying data, it should be stable.
      mi.code = stream.readU8s(stream.readU30());

      var exceptions = [];
      var exceptionCount = stream.readU30();
      for (var i = 0; i < exceptionCount; ++i) {
        exceptions.push(MethodInfo.parseException(abc, stream));
      }
      mi.exceptions = exceptions;
      mi.traits = Trait.parseTraits(abc, stream, mi);
    }

    public hasExceptions() {
      return this.exceptions.length > 0;
    }

    public trace: (writer: IndentingWriter) => void;
  }

  export class InstanceInfo extends Info {
    runtimeId: number;
    name: Multiname;
    superName: Multiname;
    protectedNs: Namespace;
    flags: number;
    interfaces: Multiname [];
    init: MethodInfo;
    classInfo: ClassInfo;
    traits: Trait [];
    static nextID: number = 1;
    constructor(abc: AbcFile, index: number, stream: AbcStream) {
      super(abc, index, Hashes.InstanceInfo);
      this.runtimeId = InstanceInfo.nextID ++;
      var constantPool = abc.constantPool;
      var methods = abc.methods;

      this.name = constantPool.multinames[stream.readU30()];
      release || assert(Multiname.isQName(this.name));
      this.superName = constantPool.multinames[stream.readU30()];
      this.flags = stream.readU8();
      this.protectedNs = undefined;
      if (this.flags & CONSTANT.ClassProtectedNs) {
        this.protectedNs = constantPool.namespaces[stream.readU30()];
      }
      var interfaceCount = stream.readU30();
      this.interfaces = [];
      for (var i = 0; i < interfaceCount; i++) {
        this.interfaces[i] = constantPool.multinames[stream.readU30()];
      }
      this.init = methods[stream.readU30()];
      this.init.isInstanceInitializer = true;
      this.init.name = this.name;
      AbcFile.attachHolder(this.init, this);
      this.traits = Trait.parseTraits(abc, stream, this);
    }

    public toString() {
      var flags = Shumway.IntegerUtilities.getFlags(this.flags & 8, "sealed|final|interface|protected".split("|"));
      var str = (flags ? flags + " " : "") + this.name;
      if (this.superName) {
        str += " extends " + this.superName;
      }
      return str;
    }
    public isFinal(): boolean { return !!(this.flags & CONSTANT.ClassFinal); }
    public isSealed(): boolean { return !!(this.flags & CONSTANT.ClassSealed); }
    public isInterface(): boolean { return !!(this.flags & CONSTANT.ClassInterface); }
  }

  /**
   * Defines various constants to deal with unique encodings of ABC constants.
   */
  export enum Hashes {
    AbcMask         = 0x0000FFFF,
    KindMask        = 0x00070000,
    ClassInfo       = 0x00000000,
    InstanceInfo    = 0x00010000,
    MethodInfo      = 0x00020000,
    ScriptInfo      = 0x00030000,
    NamespaceSet    = 0x00040000,
    IndexOffset     = 19
  }

  export class ClassInfo extends Info {
    metadata: any;
    runtimeId: number;
    init: MethodInfo;
    instanceInfo: InstanceInfo;
    defaultValue: any;
    native: any;
    classObject: Shumway.AVM2.AS.ASClass;
    static nextID: number = 1;
    constructor(abc: AbcFile, index: number, stream: AbcStream) {
      super(abc, index, Hashes.ClassInfo);
      this.runtimeId = ClassInfo.nextID ++;
      this.init = abc.methods[stream.readU30()];
      this.init.isClassInitializer = true;
      AbcFile.attachHolder(this.init, this);
      this.traits = Trait.parseTraits(abc, stream, this);
      this.instanceInfo = abc.instances[index];
      this.instanceInfo.classInfo = this;
      this.defaultValue = ClassInfo.getDefaultValue(this.instanceInfo.name);
    }

    public static getDefaultValue(qn): any {
      if (Multiname.getQualifiedName(qn) === Multiname.Int ||
        Multiname.getQualifiedName(qn) === Multiname.Uint) {
        return 0;
      } else if (Multiname.getQualifiedName(qn) === Multiname.Number) {
        return NaN;
      } else if (Multiname.getQualifiedName(qn) === Multiname.Boolean) {
        return false;
      } else {
        return null;
      }
    }

    toString() {
      return this.instanceInfo.name.toString();
    }
  }

  export class ScriptInfo extends Info {
    runtimeId: number;
    hash: number;
    init: MethodInfo;
    name: string;
    traits: Trait [];
    global: Shumway.AVM2.Runtime.Global;
    loaded: boolean;
    executed: boolean;
    executing: boolean;
    constructor(abc: AbcFile, index: number, stream: AbcStream) {
      super(abc, index, Hashes.ScriptInfo);
      this.runtimeId = ClassInfo.nextID ++;
      this.name = abc.name + "$script" + index;
      this.init = abc.methods[stream.readU30()];
      this.init.isScriptInitializer = true;
      AbcFile.attachHolder(this.init, this);
      this.traits = Trait.parseTraits(abc, stream, this);
    }
    public toString() {
      return this.name;
    }
  }

  export class AbcFile {
    name: string;
    hash: number;
    constantPool: ConstantPool;
    methods: MethodInfo [];
    metadata: MetaDataInfo [];
    instances: InstanceInfo [];
    classes: ClassInfo [];
    scripts: ScriptInfo [];
    env: any;
    applicationDomain: Shumway.AVM2.Runtime.ApplicationDomain;
    public trace: (writer: IndentingWriter) => void;
    constructor(bytes: Uint8Array, name: string, hash: number = 0) {
      enterTimeline("Parse ABC");
      this.name = name;
      this.env = {};

      var computedHash;
      if (!hash || !release) {
        // Compute hash if one was not supplied or if we're in debug mode so we can do a sanity
        // check.
        enterTimeline("Adler");
        computedHash = Shumway.HashUtilities.hashBytesTo32BitsAdler(bytes, 0, bytes.length);
        leaveTimeline();
      }
      if (hash) {
        this.hash = hash;
        // Sanity check.
        release || assert(hash === computedHash);
      } else {
        this.hash = computedHash;
      }
      var n, i;
      var stream = new AbcStream(bytes);
      AbcFile._checkMagic(stream);
      enterTimeline("Parse constantPool");
      this.constantPool = new ConstantPool(stream, this);
      leaveTimeline();

      // Method Infos
      enterTimeline("Parse Method Infos");
      this.methods = [];
      n = stream.readU30();
      for (i = 0; i < n; ++i) {
        this.methods.push(new MethodInfo(this, i, stream));
      }
      leaveTimeline();

      enterTimeline("Parse MetaData Infos");
      // MetaData Infos
      this.metadata = [];
      n = stream.readU30();
      for (i = 0; i < n; ++i) {
        this.metadata.push(new MetaDataInfo(this, stream));
      }
      leaveTimeline();

      enterTimeline("Parse Instance Infos");
      // Instance Infos
      this.instances = [];
      n = stream.readU30();
      for (i = 0; i < n; ++i) {
        this.instances.push(new InstanceInfo(this, i, stream));
      }
      leaveTimeline();

      enterTimeline("Parse Class Infos");
      // Class Infos
      this.classes = [];
      for (i = 0; i < n; ++i) {
        this.classes.push(new ClassInfo(this, i, stream));
      }
      leaveTimeline();

      enterTimeline("Parse Script Infos");
      // Script Infos
      this.scripts = [];
      n = stream.readU30();
      for (i = 0; i < n; ++i) {
        this.scripts.push(new ScriptInfo(this, i, stream));
      }
      leaveTimeline();

      enterTimeline("Parse Method Body Info");
      // Method body info just live inside methods
      n = stream.readU30();
      for (i = 0; i < n; ++i) {
        MethodInfo.parseBody(this, stream);
      }
      leaveTimeline();
      leaveTimeline();
    }

    private static _checkMagic(stream: AbcStream) {
      var magic = stream.readWord();
      var flashPlayerBrannan = 46 << 16 | 15;
      if (magic < flashPlayerBrannan) {
        throw new Error("Invalid ABC File (magic = " + Number(magic).toString(16) + ")");
      }
    }

    get lastScript() {
      release || assert(this.scripts.length > 0);
      return this.scripts[this.scripts.length - 1];
    }

    static attachHolder(mi: MethodInfo, holder: Info) {
      release || assert(!mi.holder);
      mi.holder = holder;
    }

    public toString() {
      return this.name;
    }

    public getConstant(hash: number): any {
      release || assert((this.hash & Hashes.AbcMask) === (hash & Hashes.AbcMask));
      var index = hash >> Hashes.IndexOffset;
      switch (hash & Hashes.KindMask) {
        case Hashes.ClassInfo:
          return this.classes[index];
        case Hashes.InstanceInfo:
          return this.instances[index];
        case Hashes.MethodInfo:
          return this.methods[index];
        case Hashes.ScriptInfo:
          return this.scripts[index];
        case Hashes.NamespaceSet:
          return this.constantPool.namespaceSets[index];
        default:
          notImplemented("Kind");
      }
    }
  }

  export class Namespace {
    private static  _publicPrefix = "public";

    private static _kinds: Map<string> = (() => {
      var map = Shumway.ObjectUtilities.createMap<string>();
      map[CONSTANT.Namespace] = Namespace._publicPrefix;
      map[CONSTANT.PackageInternalNs] = "packageInternal";
      map[CONSTANT.PrivateNs] = "private";
      map[CONSTANT.ProtectedNamespace] = "protected";
      map[CONSTANT.ExplicitNamespace] = "explicit";
      map[CONSTANT.StaticProtectedNs] = "staticProtected";
      return map;
    })();

    /**
     * According to Tamarin, this is 0xe000 + 660, with 660 being an "odd legacy
     * wart".
     */
    private static _MIN_API_MARK              = 0xe294;
    private static _MAX_API_MARK              = 0xf8ff;

    public kind: number;
    public uri: string;
    public prefix: string;
    public qualifiedName: string;

    /**
     * Private namespaces need unique URIs |uniqueURIHash|, for such cases we compute a hash value
     * based on the ABC's hash. We could have easily given them a unique runtimeId but this wouldn't
     * have worked for AOT compilation.
     */
    constructor(kind: CONSTANT, uri: string = "", prefix?: string, uniqueURIHash?: number) {
      if (uri === undefined) {
        uri = "";
      }
      this.kind = kind;
      this.uri = uri;
      this.prefix = prefix;
      this.qualifiedName = undefined;
      this._buildNamespace(uniqueURIHash);
    }

    private _buildNamespace(uniqueURIHash?: number) {
      if (this.kind === CONSTANT.PackageNamespace) {
        this.kind = CONSTANT.Namespace;
      }
      if (this.isPublic() && this.uri) {
        /* Strip the api version mark for now. */
        var n = this.uri.length - 1;
        var mark = this.uri.charCodeAt(n);
        if (mark > Namespace._MIN_API_MARK) {
          release || assert(false, "What's this code for?");
          this.uri = this.uri.substring(0, n - 1);
        }
      } else if (this.isUnique()) {
        release || assert (uniqueURIHash !== undefined);
        this.uri = "private " + uniqueURIHash;
      }
      if (this.kind === CONSTANT.StaticProtectedNs) {
        // FIXME: We need to deal with static protected namespaces the same way as
        // for instance protected namespaces. For now, let's just reset the URI so
        // that name resolution works out.
        this.uri = "*";
      }
      this.qualifiedName = Namespace._qualifyNamespace(this.kind, this.uri, this.prefix ? this.prefix : "");
    }

    private static _knownURIs = [
      ""
    ];

    private static _hashNamespace(kind: CONSTANT, uri: string, prefix: string) {
      var index = Namespace._knownURIs.indexOf(uri);
      if (index >= 0) {
        return kind << 2 | index;
      }
      var data = new Int32Array(1 + uri.length + prefix.length);
      var j = 0;
      data[j++] = kind;
      for (var i = 0; i < uri.length; i++) {
        data[j++] = uri.charCodeAt(i);
      }
      for (var i = 0; i < prefix.length; i++) {
        data[j++] = prefix.charCodeAt(i);
      }
      return Shumway.HashUtilities.hashBytesTo32BitsMD5(data, 0, j);
    }

    private static _mangledNamespaceCache = Shumway.ObjectUtilities.createMap<string>();
    private static _mangledNamespaceMap = Shumway.ObjectUtilities.createMap<{
      kind: CONSTANT; uri: string; prefix: string;
    }>();

    /**
     * Mangles a namespace URI to a more sensible name. The process is reversible
     * using lookup tables.
     */
    private static _qualifyNamespace(kind: CONSTANT, uri: string, prefix: string) {
      var key = kind + uri;
      var mangledNamespace = Namespace._mangledNamespaceCache[key];
      if (mangledNamespace) {
        return mangledNamespace;
      }
      // The AS3 namespace is special-cased to make the names readable and hence usable in
      // for statically using them in JS-implemented builtins.
      if (key === "8http://adobe.com/AS3/2006/builtin") {
        mangledNamespace = '$AS3_';
      } else {
        var hash = Namespace._hashNamespace(kind, uri, prefix);
        mangledNamespace = Shumway.StringUtilities.variableLengthEncodeInt32(hash);
      }
      Namespace._mangledNamespaceMap[mangledNamespace] = {
        kind: kind, uri: uri, prefix: prefix
      };
      Namespace._mangledNamespaceCache[key] = mangledNamespace;
      return mangledNamespace;
    }

    public static fromQualifiedName(qn: string) {
      var firstChar = qn.charCodeAt(0);
      // Names starting with '$' are special-cased very common names.
      var length = firstChar === 36 /* '$' */ ?
                   qn.indexOf('_', 1):
                   Shumway.StringUtilities.fromEncoding(firstChar);
      var mangledNamespace = qn.substring(0, length + 1);
      var ns = Namespace._mangledNamespaceMap[mangledNamespace];
      return new Namespace(ns.kind, ns.uri, ns.prefix);
    }

    public static kindFromString(str: string): CONSTANT {
      for (var kind in Namespace._kinds) {
        if (Namespace._kinds[kind] === str) {
          return <CONSTANT>kind;
        }
      }
      release || assert(false, "Cannot find kind " + str);
      return NaN;
    }

    public static createNamespace(uri: string, prefix: string = undefined) {
      return new Namespace(CONSTANT.Namespace, uri, prefix);
    }

    public static parse(constantPool: ConstantPool, stream: AbcStream, hash: number): Namespace {
      var kind = stream.readU8();
      var uri = constantPool.strings[stream.readU30()];
      return new Namespace(kind, uri, undefined, hash);
    }

    public isPublic(): boolean {
      return this.kind === CONSTANT.Namespace || this.kind === CONSTANT.PackageNamespace;
    }

    public isProtected(): boolean {
      return this.kind === CONSTANT.ProtectedNamespace || this.kind === CONSTANT.StaticProtectedNs;
    }

    public isPrivate(): boolean {
      return this.kind === CONSTANT.PrivateNs;
    }

    public isPackageInternal(): boolean {
      return this.kind === CONSTANT.PackageInternalNs;
    }

    public isUnique(): boolean {
      return this.kind === CONSTANT.PrivateNs && !this.uri;
    }

    public isDynamic(): boolean {
      return this.isPublic() && !this.uri;
    }

    public getURI(): string {
      return this.uri;
    }

    public toString(): string {
      return Namespace._kinds[this.kind] + (this.uri ? " " + this.uri : "");
    }

    public clone(): Namespace {
      var ns = Object.create(Namespace.prototype);
      ns.kind = this.kind;
      ns.uri = this.uri;
      ns.prefix = this.prefix;
      ns.qualifiedName = this.qualifiedName;
      return ns;
    }

    public isEqualTo(other: Namespace): boolean {
      return this.qualifiedName === other.qualifiedName;
    }

    public inNamespaceSet(set: Namespace[]): boolean {
      for (var i = 0; i < set.length; i++) {
        if (set[i].qualifiedName === this.qualifiedName) {
          return true;
        }
      }
      return false;
    }

    public getAccessModifier(): string {
      return Namespace._kinds[this.kind];
    }

    public getQualifiedName(): string{
      return this.qualifiedName;
    }


    public static PUBLIC = new Namespace(CONSTANT.Namespace);
    public static PROTECTED = new Namespace(CONSTANT.ProtectedNamespace);
    public static PROXY = new Namespace(CONSTANT.Namespace, "http://www.adobe.com/2006/actionscript/flash/proxy");
    public static VECTOR = new Namespace(CONSTANT.Namespace, "__AS3__.vec");
    public static VECTOR_PACKAGE = new Namespace(CONSTANT.PackageInternalNs, "__AS3__.vec");
    public static BUILTIN = new Namespace(CONSTANT.PrivateNs, "builtin.as$0");


    private static _simpleNameCache = Shumway.ObjectUtilities.createMap<Namespace []>();

    /**
     * Creates a set of namespaces from one or more comma delimited simple names, for example:
     * flash.display
     * private flash.display
     * [flash.display, private flash.display]
     */
    public static fromSimpleName(simpleName): Namespace [] {
      if (simpleName in Namespace._simpleNameCache) {
        return Namespace._simpleNameCache[simpleName];
      }
      var namespaceNames;
      if (simpleName.indexOf("[") === 0) {
        release || assert(simpleName[simpleName.length - 1] === "]");
        namespaceNames = simpleName.substring(1, simpleName.length - 1).split(",");
      } else {
        namespaceNames = [simpleName];
      }
      return Namespace._simpleNameCache[simpleName] = namespaceNames.map(function (name: string) {
        name = name.trim();
        var kindName, uri;
        if (name.indexOf(" ") > 0) {
          kindName = name.substring(0, name.indexOf(" ")).trim();
          uri = name.substring(name.indexOf(" ") + 1).trim();
        } else {
          var kinds = Namespace._kinds;
          if (name === kinds[CONSTANT.Namespace]        ||
            name === kinds[CONSTANT.PackageInternalNs]  ||
            name === kinds[CONSTANT.PrivateNs]          ||
            name === kinds[CONSTANT.ProtectedNamespace] ||
            name === kinds[CONSTANT.ExplicitNamespace]  ||
            name === kinds[CONSTANT.StaticProtectedNs]) {
            kindName = name;
            uri = "";
          } else {
            kindName = Namespace._publicPrefix;
            uri = name;
          }
        }
        return new Namespace(Namespace.kindFromString(kindName), uri);
      });
    }
  }

  // TOTAL HACK ALERT !!!
  Namespace.prototype = Object.create(Namespace.prototype);


  /**
   * Section 2.3 and 4.4.3
   *
   * Multinames are (namespace set, name) pairs that are resolved to QNames (qualified names) at
   * runtime. The terminology in general is very confusing so we follow some naming conventions to
   * simplify things. First of all, in ActionScript 3 there are 10 types of multinames. Half of
   * them end in an "A" are used to represent the names of XML attributes. Those prefixed with "RT"
   * are "runtime" multinames which means they get their namespace from the runtime execution
   * stack. Multinames suffixed with "L" are called "late" which means they get their name from the
   * runtime execution stack.
   *
   *  QName - A QName (qualified name) is the simplest form of multiname, it has one name and one
   * namespace. E.g. ns::n
   *
   *  RTQName - A QName whose namespace part is resolved at runtime.
   *  E.g. [x]::n
   *
   *  RTQNameL - An RTQName whose name part is resolved at runtime.
   *  E.g. [x]::[y]
   *
   *  Multiname - A multiname with a namespace set.
   *  E.g. {ns0, ns1, ns2, ...}::n
   *
   *  MultinameL - A multiname with a namespace set whose name part is resolved at runtime.
   *  E.g. {ns0, ns1, ns2, ...}::[y]
   *
   * Multinames are used very frequently so it's important that we optimize their use. In Shumway,
   * QNames are represented as either: Multiname objects, strings or numbers, depending on the
   * information they need to carry. Typically, most named QNames will be strings while numeric
   * QNames will be treated as numbers. All other Multiname types will be represented as Multiname
   * objects.
   *
   * Please use the following conventions when dealing with multinames:
   *
   * In the AS3 bytecode specification the word "name" usually refers to multinames. We use the
   * same property name in Shumway thus leading to code such as |instanceInfo.name.name| which is
   * quite ugly. If possible, avoid using the word "name" to refer to multinames, instead use "mn"
   * or "multiname" and use the word "name" to refer to the name part of a Multiname.
   *
   * Multiname: multiname, mn
   * QName: qualifiedName, qn
   * Namespace: namespace, ns
   *
   * Because a qualified name can be either a Multiname object, a string, a number, or even a
   * Number object use the static Multiname methods to query multinames. For instance, use
   * |Multiname.isRuntimeMultiname(mn)| instead of
   * |mn.isRuntimeMultiname()| since the latter will fail if |mn| is not a Multiname object.
   */

  /**
   * Name Mangling
   *
   * All Shumway QNames are mangled using the following format:
   *
   * "$" (Variable Length Mangled Namespace) Name
   *
   * Namespaces are hashed to 32 bit integers and are converted to a base64 variable length string
   * encoding that can still be parsed as a valid JS identifier. We can encode 32 bits hashes with
   * six sets of 6 bits. This leaves us with 4 unused bits that can be used to encode the length
   * of the string.
   *
   */
  export class Multiname {
    public static ATTRIBUTE         = 0x01;
    public static RUNTIME_NAMESPACE = 0x02;
    public static RUNTIME_NAME      = 0x04;
    private static _nextID = 0;

    public namespaces: Namespace [];
    public name: string;
    public flags: number;
    public runtimeId: number;
    public typeParameter: Multiname;
    public qualifiedName: any;
    private _qualifiedNameCache: Map<Multiname>;
    private static _publicQualifiedNameCache: Map<string> = Shumway.ObjectUtilities.createMap<string>();

    constructor(namespaces: Namespace [], name: string, flags: number) {
      if (!release && name !== undefined) {
        assert (name === null || isString(name), "Multiname name must be a string. " + name);
        // release || assert (!isNumeric(name), "Multiname name must not be numeric: " + name);
      }
      this.runtimeId = Multiname._nextID ++;
      this.namespaces = namespaces;
      this.name = name;
      this.flags = flags|0;
    }

    public static parse(constantPool: ConstantPool, stream: AbcStream, multinames: Multiname [], typeNamePatches: any [], multinameIndex: number) {
      var index = 0;
      var kind = stream.readU8();
      var name, namespaces = [], flags = 0;
      switch (kind) {
        case CONSTANT.QName: case CONSTANT.QNameA:
          index = stream.readU30();
          if (index) {
            namespaces = [constantPool.namespaces[index]];
          } else {
            flags &= ~Multiname.RUNTIME_NAME;    // any name
          }
          index = stream.readU30();
          if (index) {
            name = constantPool.strings[index];
          }
          break;
        case CONSTANT.RTQName: case CONSTANT.RTQNameA:
          index = stream.readU30();
          if (index) {
            name = constantPool.strings[index];
          } else {
            flags &= ~Multiname.RUNTIME_NAME;
          }
          flags |= Multiname.RUNTIME_NAMESPACE;
          break;
        case CONSTANT.RTQNameL: case CONSTANT.RTQNameLA:
          flags |= Multiname.RUNTIME_NAMESPACE;
          flags |= Multiname.RUNTIME_NAME;
          break;
        case CONSTANT.Multiname: case CONSTANT.MultinameA:
          index = stream.readU30();
          if (index) {
            name = constantPool.strings[index];
          } else {
            flags &= ~Multiname.RUNTIME_NAME;
          }
          index = stream.readU30();
          release || assert(index !== 0);
          namespaces = constantPool.namespaceSets[index];
          break;
        case CONSTANT.MultinameL: case CONSTANT.MultinameLA:
          flags |= Multiname.RUNTIME_NAME;
          index = stream.readU30();
          release || assert(index !==  0);
          namespaces = constantPool.namespaceSets[index];
          break;
        /**
         * This is undocumented, looking at Tamarin source for this one.
         */
        case CONSTANT.TypeName:
          var factoryTypeIndex = stream.readU32();
          var typeParameterCount = stream.readU32();
          release || assert(typeParameterCount === 1); // This is probably the number of type
                                                       // parameters.
          var typeParameterIndex = stream.readU32();
          var mn = undefined;
          // If both |factoryTypeIndex| and |typeParameterIndex| are parsed then we can construct
          // the type.
          if (multinames[factoryTypeIndex] && multinames[typeParameterIndex]) {
            mn = new Multiname(multinames[factoryTypeIndex].namespaces, multinames[factoryTypeIndex].name, flags);
            mn.typeParameter = multinames[typeParameterIndex];
          } else {
            // Otherwise we have to patch it later since they are foward referenced.
            typeNamePatches.push({
              index: multinameIndex,
              factoryTypeIndex: factoryTypeIndex,
              typeParameterIndex: typeParameterIndex,
              flags: flags
            });
          }
          return mn;
        default:
          Shumway.Debug.unexpected();
          break;
      }
      switch (kind) {
        case CONSTANT.QNameA:
        case CONSTANT.RTQNameA:
        case CONSTANT.RTQNameLA:
        case CONSTANT.MultinameA:
        case CONSTANT.MultinameLA:
          flags |= Multiname.ATTRIBUTE;
          break;
      }

      return new Multiname(namespaces, name, flags);
    }

    /**
     * Tests if the specified value is a valid Multiname.
     */
    public static isMultiname(mn): boolean {
      return typeof mn === "number" ||
        typeof mn === "string"      ||
        mn instanceof Multiname     ||
        mn instanceof Number;
    }

    public static needsResolution(mn): boolean {
      return mn instanceof Multiname && mn.namespaces.length > 1;
    }

    /**
     * Tests if the specified value is a valid qualified name.
     */
    public static isQName(mn): boolean {
      if (mn instanceof Multiname) {
        return mn.namespaces && mn.namespaces.length === 1;
      }
      return true;
    }

    /**
     * Tests if the specified multiname has a runtime name.
     */
    public static isRuntimeName(mn): boolean {
      return mn instanceof Multiname && mn.isRuntimeName();
    }

    /**
     * Tests if the specified multiname has a runtime namespace.
     */
    public static isRuntimeNamespace(mn): boolean {
      return mn instanceof Multiname && mn.isRuntimeNamespace();
    }

    /**
     * Tests if the specified multiname has a runtime name or namespace.
     */
    public static isRuntime(mn): boolean {
      return mn instanceof Multiname && mn.isRuntimeName() || mn.isRuntimeNamespace();
    }

    /**
     * Gets the qualified name for this multiname, this is either the identity or
     * a mangled Multiname object.
     */
    public static getQualifiedName(mn): any {
      release || assert (Multiname.isQName(mn));
      if (mn instanceof Multiname) {
        if (mn.qualifiedName !== undefined) {
          return mn.qualifiedName;
        }
        var name = String(mn.name);
        if (isNumeric(name) && mn.namespaces[0].isPublic()) {
          // release || assert (mn.namespaces[0].isPublic());
          return mn.qualifiedName = name;
        }
        mn = mn.qualifiedName = Multiname.qualifyName(mn.namespaces[0], name);
      }
      return mn;
    }

    public static qualifyName(namespace, name): string {
      return Shumway.StringUtilities.concat3("$", namespace.qualifiedName, name);
    }

    public static stripPublicQualifier(qn): string {
      var publicQualifier = "$" + Namespace.PUBLIC.qualifiedName;
      var index = qn.indexOf(publicQualifier);
      if (index !== 0) {
        return undefined;
      }
      return qn.substring(publicQualifier.length);
    }

    /**
     * Creates a Multiname from a mangled qualified name. The format should be of
     * the form "$"(mangledNamespace)(name).
     */
    public static fromQualifiedName(qn): Multiname {
      if (qn instanceof Multiname) {
        return qn;
      }
      if (isNumeric(qn)) {
        return new Multiname([Namespace.PUBLIC], qn, 0);
      }
      if (qn[0] !== "$") {
        return;
      }
      var ns = Namespace.fromQualifiedName(qn.substring(1));
      return new Multiname([ns], qn.substring(1 + ns.qualifiedName.length), 0);
    }

    public static getNameFromPublicQualifiedName(qn): string {
      var mn = Multiname.fromQualifiedName(qn);
      release || assert (mn.getNamespace().isPublic());
      return mn.name;
    }

    /**
     * Same as |getQualifiedName| but it also includes the type parameter if
     * it has one.
     */
    public static getFullQualifiedName(mn): string {
      var qn = Multiname.getQualifiedName(mn);
      if (mn instanceof Multiname && mn.typeParameter) {
        qn += "$" + Multiname.getFullQualifiedName(mn.typeParameter);
      }
      return qn;
    }

    public static getPublicQualifiedName(name): any {
      var qname;
      // _publicQualifiedNameCache is only used for string names -- number
      // names are easy and object names are less common and also difficult to
      // use as cache keys.
      if (typeof name === "string") {
        qname = Multiname._publicQualifiedNameCache[name];
        if (qname) {
          return qname;
        }
      }

      if (isNumeric(name)) {
        return toNumber(name);
      } else if (name !== null && isObject(name)) {
        return name;
      }
      // release || assert (isString(name) || isNullOrUndefined(name));
      qname = Multiname.qualifyName(Namespace.PUBLIC, name);
      if (typeof name === "string") {
        Multiname._publicQualifiedNameCache[name] = qname;
      }
      return qname;
    }

    public static isPublicQualifiedName(qn): boolean {
      return typeof qn === "number" || isNumeric(qn) || qn.indexOf(Namespace.PUBLIC.qualifiedName) === 1;
    }

    public static getAccessModifier(mn): string {
      release || assert(Multiname.isQName(mn));
      if (typeof mn === "number" || typeof mn === "string" || mn instanceof Number) {
        return "public";
      }
      release || assert(mn instanceof Multiname);
      return mn.namespaces[0].getAccessModifier();
    }

    public static isNumeric(mn): boolean {
      if (typeof mn === "number") {
        return true;
      } else if (typeof mn === "string") {
        return isNumeric(mn);
      }

      return !isNaN(parseInt(Multiname.getName(mn), 10));
    }

    public static getName(mn: Multiname): string {
      release || assert(mn instanceof Multiname);
      release || assert(!mn.isRuntimeName());
      return mn.getName();
    }

    public static isAnyName(mn): boolean {
      return typeof mn === "object" && !mn.isRuntimeName() && !mn.name;
    }

    private static _simpleNameCache = Shumway.ObjectUtilities.createMap<Multiname>();

    /**
     * Creates a multiname from a simple name qualified with one ore more namespaces, for example:
     * flash.display.Graphics
     * private flash.display.Graphics
     * [private flash.display, private flash, public].Graphics
     */
    public static fromSimpleName(simpleName: string): Multiname {
      release || assert(simpleName);
      if (simpleName in Multiname._simpleNameCache) {
        return Multiname._simpleNameCache[simpleName];
      }

      var nameIndex, namespaceIndex, name, namespace;
      nameIndex = simpleName.lastIndexOf(".");
      if (nameIndex <= 0) {
        nameIndex = simpleName.lastIndexOf(" ");
      }

      if (nameIndex > 0 && nameIndex < simpleName.length - 1) {
        name = simpleName.substring(nameIndex + 1).trim();
        namespace = simpleName.substring(0, nameIndex).trim();
      } else {
        name = simpleName;
        namespace = "";
      }
      return Multiname._simpleNameCache[simpleName] =
        new Multiname(Namespace.fromSimpleName(namespace), name, 0);
    }

    public getQName(index: number): Multiname {
      release || assert(index >= 0 && index < this.namespaces.length);
      if (!this._qualifiedNameCache) {
        this._qualifiedNameCache = Shumway.ObjectUtilities.createArrayMap<Multiname>();
      }
      var name = this._qualifiedNameCache[index];
      if (!name) {
        name = this._qualifiedNameCache[index] =
          new Multiname([this.namespaces[index]], this.name, this.flags);
      }
      return name;
    }

    public hasQName(qn): boolean {
      release || assert (qn instanceof Multiname);
      if (this.name !== qn.name) {
        return false;
      }
      for (var i = 0; i < this.namespaces.length; i++) {
        if (this.namespaces[i].isEqualTo(qn.namespaces[0])) {
          return true;
        }
      }
      return false;
    }

    public isAttribute() {
      return !!(this.flags & Multiname.ATTRIBUTE);
    }

    public isAnyName(): boolean {
      return Multiname.isAnyName(this);
    }

    public isAnyNamespace(): boolean {
      // x.* has the same meaning as x.*::*, so look for the former case and give
      // it the same meaning of the latter.
      return !this.isRuntimeNamespace() &&
        (this.namespaces.length === 0 || (this.isAnyName() && this.namespaces.length !== 1));
    }

    public isRuntimeName(): boolean {
      return !!(this.flags & Multiname.RUNTIME_NAME);
    }

    public isRuntimeNamespace(): boolean {
      return !!(this.flags & Multiname.RUNTIME_NAMESPACE);
    }

    public isRuntime(): boolean {
      return !!(this.flags & (Multiname.RUNTIME_NAME | Multiname.RUNTIME_NAMESPACE));
    }

    public isQName(): boolean {
      return this.namespaces.length === 1 && !this.isAnyName();
    }

    public isSimpleStatic(): boolean {
      return !(this.flags & (Multiname.RUNTIME_NAME | Multiname.RUNTIME_NAMESPACE)) &&
             this.namespaces.length === 1;
    }

    public hasTypeParameter(): boolean {
      return !!this.typeParameter;
    }

    public getName(): any {
      return this.name;
    }

    public getOriginalName(): string {
      release || assert(this.isQName());
      var name = this.namespaces[0].uri;
      if (name) {
        name += ".";
      }
      return name + this.name;
    }

    public getNamespace(): Namespace {
      release || assert(!this.isRuntimeNamespace());
      release || assert(this.namespaces.length === 1);
      return this.namespaces[0];
    }

    public nameToString(): string {
      if (this.isAnyName()) {
        return "*";
      } else {
        var name = this.getName();
        return this.isRuntimeName() ? "[]" : name;
      }
    }

    public hasObjectName(): boolean {
      return typeof this.name === "object";
    }

    public toString() {
      var str = this.isAttribute() ? "@" : "";
      if (this.isAnyNamespace()) {
        str += "*::" + this.nameToString();
      } else if (this.isRuntimeNamespace()) {
        str += "[]::" + this.nameToString();
      } else if (this.namespaces.length === 1 && this.isQName()) {
        str += this.namespaces[0].toString() + "::";
        str += this.nameToString();
      } else {
        str += "{";
        for (var i = 0, count = this.namespaces.length; i < count; i++) {
          str += this.namespaces[i].toString();
          if (i + 1 < count) {
            str += ",";
          }
        }
        str += "}::" + this.nameToString();
      }

      if (this.hasTypeParameter()) {
        str += "<" + this.typeParameter.toString() + ">";
      }
      return str;
    }

    public static Int       = Multiname.getPublicQualifiedName("int");
    public static Uint      = Multiname.getPublicQualifiedName("uint");
    public static Class     = Multiname.getPublicQualifiedName("Class");
    public static Array     = Multiname.getPublicQualifiedName("Array");
    public static Object    = Multiname.getPublicQualifiedName("Object");
    public static String    = Multiname.getPublicQualifiedName("String");
    public static Number    = Multiname.getPublicQualifiedName("Number");
    public static Boolean   = Multiname.getPublicQualifiedName("Boolean");
    public static Function  = Multiname.getPublicQualifiedName("Function");
    public static XML       = Multiname.getPublicQualifiedName("XML");
    public static XMLList   = Multiname.getPublicQualifiedName("XMLList");

    public static TO_STRING = Multiname.getPublicQualifiedName("toString");
    public static VALUE_OF  = Multiname.getPublicQualifiedName("valueOf");
    public static TEMPORARY = new Multiname([], "", 0);
  }

  export class MetaDataInfo {
    public name: string;
    public value: {key: string; value: string []} [];
    public trace: (writer: IndentingWriter) => void;
    constructor(abc: AbcFile, stream: AbcStream) {
      var strings = abc.constantPool.strings;
      var name = this.name = strings[stream.readU30()];
      var itemCount = stream.readU30();
      var keys: string [] = [];
      var items = [];

      for (var i = 0; i < itemCount; i++) {
        keys[i] = strings[stream.readU30()];
      }

      for (var i = 0; i < itemCount; i++) {
        var key = keys[i];
        items[i] = { key: key, value: strings[stream.readU30()] };
        // for the 'native' tag, store all properties directly on the tag's
        // object, too. There's not going to be any duplicates.
        if (key && name === "native") {
          release || assert(!this.hasOwnProperty(key));
          this[key] = items[i].value;
        }
      }

      this.value = items;
    }

    toString() {
      return "[" + this.name + "]";
    }
  }

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
    ScriptInitializer   = 0x800,
    MethodTrait         = 0x1000,
    GetterTrait         = 0x2000,
    SetterTrait         = 0x4000
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

  export var MethodTypeFlagByTraitKind = {
    1: METHOD.MethodTrait,
    2: METHOD.GetterTrait,
    3: METHOD.SetterTrait,
  };

  export enum ATTR {
    Final              = 0x01,
    Override           = 0x02,
    Metadata           = 0x04
  }

  export enum SORT {
    CASEINSENSITIVE    = 0x01,
    DESCENDING         = 0x02,
    UNIQUESORT         = 0x04,
    RETURNINDEXEDARRAY = 0x08,
    NUMERIC            = 0x10
  }

  export class ConstantPool {
    static _nextNamespaceSetID: number = 1;
    ints: number[];
    uints: number[];
    doubles: number[];
    strings: string[];
    multinames: Multiname [];
    namespaces: Namespace [];
    namespaceSets: Namespace [][];
    public trace: (writer: IndentingWriter) => void;
    constructor (stream: AbcStream, abc: AbcFile) {
      var n;
      // Parse Integers
      var ints = [0];
      n = stream.readU30();
      for (var i = 1; i < n; ++i) {
        ints.push(stream.readS32());
      }
      // Parse Unsigned Integers
      var uints = [0];
      n = stream.readU30();
      for (var i = 1; i < n; ++i) {
        uints.push(stream.readU32());
      }
      // Parse Doubles
      var doubles = [NaN];
      n = stream.readU30();
      for (var i = 1; i < n; ++i) {
        doubles.push(stream.readDouble());
      }
      enterTimeline("Parse Strings");
      // Parse Strings
      var strings = [""];
      n = stream.readU30();
      for (var i = 1; i < n; ++i) {
        strings.push(stream.readUTFString(stream.readU30()));
      }
      leaveTimeline();

      this.ints = ints;
      this.uints = uints;
      this.doubles = doubles;
      this.strings = strings;

      enterTimeline("Parse Namespaces");
      // Namespaces
      var namespaces = [undefined];
      n = stream.readU30();
      for (var i = 1; i < n; ++i) {
        namespaces.push(Namespace.parse(this, stream, abc.hash + i));
      }
      leaveTimeline();

      enterTimeline("Parse Namespace Sets");
      // Namespace Sets
      var namespaceSets = [undefined];
      n = stream.readU30();
      for (var i = 1; i < n; ++i) {
        var count = stream.readU30();
        var namespaceSet = [];
        namespaceSet.runtimeId = ConstantPool._nextNamespaceSetID ++;
        namespaceSet.hash = abc.hash & Hashes.AbcMask | Hashes.NamespaceSet | (i << Hashes.IndexOffset);
        for (var j = 0; j < count; ++j) {
          namespaceSet.push(namespaces[stream.readU30()]);
        }
        namespaceSets.push(namespaceSet);
      }
      leaveTimeline();

      this.namespaces = namespaces;
      this.namespaceSets = namespaceSets;

      enterTimeline("Parse Multinames");
      // Multinames
      var multinames = [undefined];
      var typeNamePatches = [];
      n = stream.readU30();
      for (var i = 1; i < n; ++i) {
        multinames.push(Multiname.parse(this, stream, multinames, typeNamePatches, i));
      }
      for (var i = 0; i < typeNamePatches.length; i++) {
        var patch = typeNamePatches[i];
        var factoryType = multinames[patch.factoryTypeIndex];
        var typeParameter = multinames[patch.typeParameterIndex];
        release || assert(factoryType && typeParameter);
        var mn = new Multiname(factoryType.namespaces, factoryType.name, patch.flags);
        mn.typeParameter = typeParameter;
        multinames[patch.index] = mn;
      }
      leaveTimeline();

      this.multinames = multinames;
    }

    getValue(kind: CONSTANT, index: number): any {
      switch (kind) {
        case CONSTANT.Int:
          return this.ints[index];
        case CONSTANT.UInt:
          return this.uints[index];
        case CONSTANT.Double:
          return this.doubles[index];
        case CONSTANT.Utf8:
          return this.strings[index];
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
          return this.namespaces[index];
        case CONSTANT.QName:
        case CONSTANT.MultinameA:
        case CONSTANT.RTQName:
        case CONSTANT.RTQNameA:
        case CONSTANT.RTQNameL:
        case CONSTANT.RTQNameLA:
        case CONSTANT.NameL:
        case CONSTANT.NameLA:
          return this.multinames[index];
        case CONSTANT.Float:
          Shumway.Debug.warning("TODO: CONSTANT.Float may be deprecated?");
          break;
        default:
          release || assert(false, "Not Implemented Kind " + kind);
      }
    }
  }
}
