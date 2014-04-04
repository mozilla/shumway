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
///<reference path='references.ts' />

module Shumway.AVM2.ABC {
  import Timer = Shumway.Metrics.Timer;
  import isString = Shumway.isString;
  import isNumber = Shumway.isNumber;
  import isNumeric = Shumway.isNumeric;
  import isObject = Shumway.isObject;

  declare var TextDecoder;

  var textDecoder: any = null;
  if (typeof TextDecoder !== "undefined") {
    textDecoder = new TextDecoder();
  }

  export class AbcStream {
    private static _resultBuffer = new Int32Array(256);
    private _bytes: Uint8Array;
    private _view: DataView;
    private _position: number;

    constructor (bytes: Uint8Array) {
      this._bytes = bytes;
      this._view = new DataView(bytes.buffer, bytes.byteOffset);
      this._position = 0;
    }

    private static _getResultBuffer(length: number) {
      if (!AbcStream._resultBuffer || AbcStream._resultBuffer.length < length) {
        AbcStream._resultBuffer = new Int32Array(length * 2);
      }
      return AbcStream._resultBuffer;
    }

    get position(): number {
      return this._position;
    }
    remaining(): number  {
      return this._bytes.length - this._position;
    }
    seek(position: number) {
      this._position = position;
    }
    readU8(): number {
      return this._bytes[this._position++];
    }
    readU8s(count: number) {
      var b = new Uint8Array(count);
      b.set(this._bytes.subarray(this._position, this._position + count), 0);
      this._position += count;
      return b;
    }
    readS8(): number {
      return this._bytes[this._position++] << 24 >> 24;
    }
    readU32(): number {
      return this.readS32() >>> 0;
    }
    readU30(): number {
      var result = this.readU32();
      if (result & 0xc0000000) {
        // TODO: Spec says this is a corrupt ABC file, but it seems that some content
        // has this, e.g. 1000-0.abc
        // error("Corrupt ABC File");
        return result;
      }
      return result;
    }
    readU30Unsafe(): number {
      return this.readU32();
    }
    readS16(): number {
      return (this.readU30Unsafe() << 16) >> 16;
    }
    /**
     * Read a variable-length encoded 32-bit signed integer. The value may use one to five bytes (little endian),
     * each contributing 7 bits. The most significant bit of each byte indicates that the next byte is part of
     * the value. The spec indicates that the most significant bit of the last byte to be read is sign extended
     * but this turns out not to be the case in the real implementation, for instance 0x7f should technically be
     * -1, but instead it's 127. Moreover, what happens to the remaining 4 high bits of the fifth byte that is
     * read? Who knows, here we'll just stay true to the Tamarin implementation.
     */
      readS32(): number {
      var result = this.readU8();
      if (result & 0x80) {
        result = result & 0x7f | this.readU8() << 7;
        if (result & 0x4000) {
          result = result & 0x3fff | this.readU8() << 14;
          if (result & 0x200000) {
            result = result & 0x1fffff | this.readU8() << 21;
            if (result & 0x10000000) {
              result = result & 0x0fffffff | this.readU8() << 28;
              result = result & 0xffffffff;
            }
          }
        }
      }
      return result;
    }
    readWord(): number {
      var result = this._view.getUint32(this._position, true);
      this._position += 4;
      return result;
    }
    readS24(): number {
      var u = this.readU8() |
        (this.readU8() << 8) |
        (this.readU8() << 16);
      return (u << 8) >> 8;
    }
    readDouble(): number {
      var result = this._view.getFloat64(this._position, true);
      this._position += 8;
      return result;
    }
    readUTFString(length): string {
      /**
       * Use the TextDecoder API whenever available.
       * http://encoding.spec.whatwg.org/#concept-encoding-get
       */
      if (textDecoder) {
        var position = this._position;
        this._position += length;
        return textDecoder.decode(this._bytes.subarray(position, position + length));
      }

      var pos = this._position;
      var end = pos + length;
      var bytes = this._bytes;
      var i = 0;
      var result = AbcStream._getResultBuffer(length * 2);
      while (pos < end) {
        var c = bytes[pos++];
        if (c <= 0x7f) {
          result[i++] = c;
        } else if (c >= 0xc0) { // multibyte
          var code = 0;
          if (c < 0xe0) { // 2 bytes
            code = ((c & 0x1f) << 6) | (bytes[pos++] & 0x3f);
          } else if (c < 0xf0) { // 3 bytes
            code = ((c & 0x0f) << 12) | ((bytes[pos++] & 0x3f) << 6) | (bytes[pos++] & 0x3f);
          } else { // 4 bytes
            // turned into two characters in JS as surrogate pair
            code = (((c & 0x07) << 18) | ((bytes[pos++] & 0x3f) << 12) | ((bytes[pos++] & 0x3f) << 6) | (bytes[pos++] & 0x3f)) - 0x10000;
            // High surrogate
            result[i++] = ((code & 0xffc00) >>> 10) + 0xd800;
            // Low surrogate
            code = (code & 0x3ff) + 0xdc00;
          }
          result[i++] = code;
        } // Otherwise it's an invalid UTF8, skipped.
      }
      this._position = pos;
      return Shumway.StringUtilities.fromCharCodeArray(result.subarray(0, i));
    }
  }

  export class Parameter {
    name: string;
    type: Multiname;
    value: any;
    optional: boolean;
    constructor(name: string, type: Multiname, value: any, optional: boolean = false) {
      this.name = name;
      this.type = type;
      this.value = value;
      this.optional = optional;
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
    traits: any[];
    constructor(abc: AbcFile, index: number) {
      this.abc = abc;
      this.index = index;
    }
  }

  export class MethodInfo extends Info {
    flags: number;
    name: Multiname;
    debugName: string;
    parameters: Parameter[];
    returnType: Multiname;
    holder: any;
    hasBody: boolean;
    maxStack: number;
    localCount: number;
    initScopeDepth: number;
    maxScopeDepth: number;
    code: any;
    exceptions: any;
    isInstanceInitializer: boolean;
    isClassInitializer: boolean;
    isScriptInitializer: boolean;
    freeMethod: Function;
    lastBoundMethod: {
      scope: Shumway.AVM2.Runtime.Scope;
      boundMethod: Function;
    };
    activationPrototype: Object;
    static parseParameterNames: boolean = false;

    private static _getParameterName(i) {
      release || assert(i < 26);
      return String.fromCharCode("A".charCodeAt(0) + i);
    }

    constructor(abc: AbcFile, index: number, stream: AbcStream) {
      super(abc, index);
      var constantPool = abc.constantPool;
      var parameterCount = stream.readU30();
      this.returnType = constantPool.multinames[stream.readU30()];
      this.parameters = [];
      for (var i = 0; i < parameterCount; i++) {
        this.parameters.push(new Parameter(undefined, constantPool.multinames[stream.readU30()], undefined));
      }

      this.debugName = constantPool.strings[stream.readU30()];
      this.flags = stream.readU8();

      var optionalCount = 0;
      if (this.flags & METHOD.HasOptional) {
        optionalCount = stream.readU30();
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
        typeName: multinames[stream.readU30()],
        varName: multinames[stream.readU30()]
      };
      release || assert(!ex.typeName || !ex.typeName.isRuntime());
      release || assert(!ex.varName || ex.varName.isQName());
      return ex;
    }


    static parseBody (abc: AbcFile, stream: AbcStream) {
      var constantPool = abc.constantPool;
      var methods = abc.methods;

      var index = stream.readU30();
      var mi = methods[index];
      mi.index = index;
      mi.hasBody = true;
      mi.hash = abc.hash + 0x030000 + index;
      release || assert(!mi.isNative());
      mi.maxStack = stream.readU30();
      mi.localCount = stream.readU30();
      mi.initScopeDepth = stream.readU30();
      mi.maxScopeDepth = stream.readU30();
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
      super(abc, index);
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

  export class ClassInfo extends Info {
    metadata: any;
    runtimeId: number;
    init: MethodInfo;
    instanceInfo: InstanceInfo;
    defaultValue: any;
    native: any;
    classObject: Shumway.AVM2.Runtime.Class;
    static nextID: number = 1;
    constructor(abc: AbcFile, index: number, stream: AbcStream) {
      super(abc, index);
      this.runtimeId = ClassInfo.nextID ++;
      this.abc = abc;
      this.hash = abc.hash + 0x010000 + index;
      this.index = index;
      this.init = abc.methods[stream.readU30()];
      this.init.isClassInitializer = true;
      AbcFile.attachHolder(this.init, this);
      this.traits = Trait.parseTraits(abc, stream, this);
      this.instanceInfo = abc.instances[index];
      this.instanceInfo.classInfo = this;
      this.defaultValue = ClassInfo._getDefaultValue(this.instanceInfo.name);
    }

    private static _getDefaultValue(qn): any {
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
    static nextID: number = 1;
    constructor(abc: AbcFile, index: number, stream: AbcStream) {
      super(abc, index);
      this.runtimeId = ClassInfo.nextID ++;
      this.hash = abc.hash + 0x020000 + index;
      this.name = abc.name + "$script" + index;
      this.init = abc.methods[stream.readU30()];
      this.init.isScriptInitializer = true;
      AbcFile.attachHolder(this.init, this);
      this.traits = Trait.parseTraits(abc, stream, this);
      // this.traits.verified = true;
    }
    get entryPoint(): MethodInfo {
      return this.init;
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
    applicationDomain: any;

    constructor(bytes: Uint8Array, name: string, hash: number = 0) {
      Timer.start("Parse ABC");
      this.name = name;
      this.env = {};

      var computedHash;
      if (!hash || !release) {
        // Compute hash if one was not supplied or if we're in debug mode so we can do a sanity check.
        Timer.start("Adler");
        computedHash = Shumway.HashUtilities.hashBytesTo32BitsAdler(bytes, 0, bytes.length);
        Timer.stop();
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
      Timer.start("Parse constantPool");
      this.constantPool = new ConstantPool(stream, this);
      Timer.stop();

      // Method Infos
      Timer.start("Parse Method Infos");
      this.methods = [];
      n = stream.readU30();
      for (i = 0; i < n; ++i) {
        this.methods.push(new MethodInfo(this, i, stream));
      }
      Timer.stop();

      Timer.start("Parse MetaData Infos");
      // MetaData Infos
      this.metadata = [];
      n = stream.readU30();
      for (i = 0; i < n; ++i) {
        this.metadata.push(new MetaDataInfo(this, stream));
      }
      Timer.stop();

      Timer.start("Parse Instance Infos");
      // Instance Infos
      this.instances = [];
      n = stream.readU30();
      for (i = 0; i < n; ++i) {
        this.instances.push(new InstanceInfo(this, i, stream));
      }
      Timer.stop();

      Timer.start("Parse Class Infos");
      // Class Infos
      this.classes = [];
      for (i = 0; i < n; ++i) {
        this.classes.push(new ClassInfo(this, i, stream));
      }
      Timer.stop();

      Timer.start("Parse Script Infos");
      // Script Infos
      this.scripts = [];
      n = stream.readU30();
      for (i = 0; i < n; ++i) {
        this.scripts.push(new ScriptInfo(this, i, stream));
      }
      Timer.stop();

      Timer.start("Parse Method Body Info");
      // Method body info just live inside methods
      n = stream.readU30();
      for (i = 0; i < n; ++i) {
        MethodInfo.parseBody(this, stream);
      }
      Timer.stop();
      Timer.stop();
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
      if (prefix !== undefined) {
        this.prefix = prefix;
      }
      this.kind = kind;
      this.uri = uri;
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
          assert(false, "What's this code for?");
          this.uri = this.uri.substring(0, n - 1);
        }
      } else if (this.isUnique()) {
        assert (uniqueURIHash !== undefined);
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
      var data = new Int32Array(1 + uri.length + prefix.length);
      var j = 0;
      data[j++] = kind;
      var index = Namespace._knownURIs.indexOf(uri);
      if (index >= 0) {
        return kind << 2 | index;
      } else {
        for (var i = 0; i < uri.length; i++) {
          data[j++] = uri.charCodeAt(i);
        }
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
      mangledNamespace = Shumway.StringUtilities.variableLengthEncodeInt32(Namespace._hashNamespace(kind, uri, prefix));
      Namespace._mangledNamespaceMap[mangledNamespace] = {
        kind: kind, uri: uri, prefix: prefix
      };
      Namespace._mangledNamespaceCache[key] = mangledNamespace;
      return mangledNamespace;
    }

    public static fromQualifiedName(qn: string) {
      var length = Shumway.StringUtilities.fromEncoding(qn[0]);
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
      return release || assert(false, "Cannot find kind " + str);
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
      return Namespace._simpleNameCache[simpleName] = namespaceNames.map(function (name) {
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
   * Multinames are (namespace set, name) pairs that are resolved to QNames (qualified names) at runtime. The terminology
   * in general is very confusing so we follow some naming conventions to simplify things. First of all, in ActionScript 3
   * there are 10 types of multinames. Half of them end in an "A" are used to represent the names of XML attributes. Those
   * prefixed with "RT" are "runtime" multinames which means they get their namespace from the runtime execution stack.
   * Multinames suffixed with "L" are called "late" which means they get their name from the runtime execution stack.
   *
   *  QName - A QName (qualified name) is the simplest form of multiname, it has one name and one namespace.
   *  E.g. ns::n
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
   * Multinames are used very frequently so it's important that we optimize their use. In Shumway, QNames are
   * represented as either: Multiname objects, strings or numbers, depending on the information they need to carry.
   * Typically, most named QNames will be strings while numeric QNames will be treated as numbers. All other Multiname
   * types will be represented as Multiname objects.
   *
   * Please use the following conventions when dealing with multinames:
   *
   * In the AS3 bytecode specification the word "name" usually refers to multinames. We use the same property name in
   * Shumway thus leading to code such as |instanceInfo.name.name| which is quite ugly. If possible, avoid using the
   * word "name" to refer to multinames, instead use "mn" or "multiname" and use the word "name" to refer to the
   * name part of a Multiname.
   *
   * Multiname: multiname, mn
   * QName: qualifiedName, qn
   * Namespace: namespace, ns
   *
   * Because a qualified name can be either a Multiname object, a string, a number, or even a Number object use the static
   * Multiname methods to query multinames. For instance, use |Multiname.isRuntimeMultiname(mn)| instead of
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

    constructor(namespaces: Namespace [], name: string, flags: number = 0) {
      if (name !== undefined) {
        release || assert (name === null || isString(name), "Multiname name must be a string. " + name);
        // assert (!isNumeric(name), "Multiname name must not be numeric: " + name);
      }
      this.runtimeId = Multiname._nextID ++;
      this.namespaces = namespaces;
      this.name = name;
      this.flags = flags;
    }

    public static parse(constantPool: ConstantPool, stream: AbcStream, multinames: Multiname [], patchFactoryTypes: any []) {
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
          if (multinames[factoryTypeIndex]) {
            namespaces = multinames[factoryTypeIndex].namespaces;
            name = multinames[factoryTypeIndex].name;
          }
          var typeParameterCount = stream.readU32();
          release || assert(typeParameterCount === 1); // This is probably the number of type parameters.
          var typeParameterIndex = stream.readU32();
          release || assert (multinames[typeParameterIndex]);
          var mn = new Multiname(namespaces, name, flags);
          mn.typeParameter = multinames[typeParameterIndex];
          if (!multinames[factoryTypeIndex]) {
            patchFactoryTypes.push({multiname: mn, index: factoryTypeIndex});
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
      return "$" + namespace.qualifiedName + name;
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
        return new Multiname([Namespace.PUBLIC], qn);
      }
      if (qn[0] !== "$") {
        return;
      }
      var ns = Namespace.fromQualifiedName(qn.substring(1));
      return new Multiname([ns], qn.substring(1 + ns.qualifiedName.length));
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
      if (isNumeric(name)) {
        return toNumber(name);
      } else if (name !== null && isObject(name)) {
        return name;
      }
      // release || assert (isString(name) || isNullOrUndefined(name));
      return Multiname.qualifyName(Namespace.PUBLIC, name);
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
        new Multiname(Namespace.fromSimpleName(namespace), name);
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
      return this.flags & Multiname.ATTRIBUTE;
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
    public static TEMPORARY = new Multiname([], "");
  }

  export class MetaDataInfo {
    public name: string;
    public value: {key: string; value: string []} [];
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
    Arguments          = 0x1,
    Activation         = 0x2,
    Needrest           = 0x4,
    HasOptional        = 0x8,
    IgnoreRest         = 0x10,
    Native             = 0x20,
    Setsdxns           = 0x40,
    HasParamNames      = 0x80
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

  export enum SORT {
    CASEINSENSITIVE    = 0x01,
    DESCENDING         = 0x02,
    UNIQUESORT         = 0x04,
    RETURNINDEXEDARRAY = 0x08,
    NUMERIC            = 0x10
  }

  export enum OP {
    bkpt               = 0x01,
    nop                = 0x02,
    throw              = 0x03,
    getsuper           = 0x04,
    setsuper           = 0x05,
    dxns               = 0x06,
    dxnslate           = 0x07,
    kill               = 0x08,
    label              = 0x09,
    lf32x4             = 0x0A,
    sf32x4             = 0x0B,
    ifnlt              = 0x0C,
    ifnle              = 0x0D,
    ifngt              = 0x0E,
    ifnge              = 0x0F,
    jump               = 0x10,
    iftrue             = 0x11,
    iffalse            = 0x12,
    ifeq               = 0x13,
    ifne               = 0x14,
    iflt               = 0x15,
    ifle               = 0x16,
    ifgt               = 0x17,
    ifge               = 0x18,
    ifstricteq         = 0x19,
    ifstrictne         = 0x1A,
    lookupswitch       = 0x1B,
    pushwith           = 0x1C,
    popscope           = 0x1D,
    nextname           = 0x1E,
    hasnext            = 0x1F,
    pushnull           = 0x20,c,
    pushundefined      = 0x21,
    pushfloat          = 0x22,
    nextvalue          = 0x23,
    pushbyte           = 0x24,
    pushshort          = 0x25,
    pushtrue           = 0x26,
    pushfalse          = 0x27,
    pushnan            = 0x28,
    pop                = 0x29,
    dup                = 0x2A,
    swap               = 0x2B,
    pushstring         = 0x2C,
    pushint            = 0x2D,
    pushuint           = 0x2E,
    pushdouble         = 0x2F,
    pushscope          = 0x30,
    pushnamespace      = 0x31,
    hasnext2           = 0x32,
    li8                = 0x35,
    li16               = 0x36,
    li32               = 0x37,
    lf32               = 0x38,
    lf64               = 0x39,
    si8                = 0x3A,
    si16               = 0x3B,
    si32               = 0x3C,
    sf32               = 0x3D,
    sf64               = 0x3E,
    newfunction        = 0x40,
    call               = 0x41,
    construct          = 0x42,
    callmethod         = 0x43,
    callstatic         = 0x44,
    callsuper          = 0x45,
    callproperty       = 0x46,
    returnvoid         = 0x47,
    returnvalue        = 0x48,
    constructsuper     = 0x49,
    constructprop      = 0x4A,
    callsuperid        = 0x4B,
    callproplex        = 0x4C,
    callinterface      = 0x4D,
    callsupervoid      = 0x4E,
    callpropvoid       = 0x4F,
    sxi1               = 0x50,
    sxi8               = 0x51,
    sxi16              = 0x52,
    applytype          = 0x53,
    pushfloat4         = 0x54,
    newobject          = 0x55,
    newarray           = 0x56,
    newactivation      = 0x57,
    newclass           = 0x58,
    getdescendants     = 0x59,
    newcatch           = 0x5A,
    findpropstrict     = 0x5D,
    findproperty       = 0x5E,
    finddef            = 0x5F,
    getlex             = 0x60,
    setproperty        = 0x61,
    getlocal           = 0x62,
    setlocal           = 0x63,
    getglobalscope     = 0x64,
    getscopeobject     = 0x65,
    getproperty        = 0x66,
    getouterscope      = 0x67,
    initproperty       = 0x68,
    setpropertylate    = 0x69,
    deleteproperty     = 0x6A,
    deletepropertylate = 0x6B,
    getslot            = 0x6C,
    setslot            = 0x6D,
    getglobalslot      = 0x6E,
    setglobalslot      = 0x6F,
    convert_s          = 0x70,
    esc_xelem          = 0x71,
    esc_xattr          = 0x72,
    convert_i          = 0x73,
    convert_u          = 0x74,
    convert_d          = 0x75,
    convert_b          = 0x76,
    convert_o          = 0x77,
    checkfilter        = 0x78,
    convert_f          = 0x79,
    unplus             = 0x7a,
    convert_f4         = 0x7b,
    coerce             = 0x80,
    coerce_b           = 0x81,
    coerce_a           = 0x82,
    coerce_i           = 0x83,
    coerce_d           = 0x84,
    coerce_s           = 0x85,
    astype             = 0x86,
    astypelate         = 0x87,
    coerce_u           = 0x88,
    coerce_o           = 0x89,
    negate             = 0x90,
    increment          = 0x91,
    inclocal           = 0x92,
    decrement          = 0x93,
    declocal           = 0x94,
    typeof             = 0x95,
    not                = 0x96,
    bitnot             = 0x97,
    add                = 0xA0,
    subtract           = 0xA1,
    multiply           = 0xA2,
    divide             = 0xA3,
    modulo             = 0xA4,
    lshift             = 0xA5,
    rshift             = 0xA6,
    urshift            = 0xA7,
    bitand             = 0xA8,
    bitor              = 0xA9,
    bitxor             = 0xAA,
    equals             = 0xAB,
    strictequals       = 0xAC,
    lessthan           = 0xAD,
    lessequals         = 0xAE,
    greaterthan        = 0xAF,
    greaterequals      = 0xB0,
    instanceof         = 0xB1,
    istype             = 0xB2,
    istypelate         = 0xB3,
    in                 = 0xB4,
    increment_i        = 0xC0,
    decrement_i        = 0xC1,
    inclocal_i         = 0xC2,
    declocal_i         = 0xC3,
    negate_i           = 0xC4,
    add_i              = 0xC5,
    subtract_i         = 0xC6,
    multiply_i         = 0xC7,
    getlocal0          = 0xD0,
    getlocal1          = 0xD1,
    getlocal2          = 0xD2,
    getlocal3          = 0xD3,
    setlocal0          = 0xD4,
    setlocal1          = 0xD5,
    setlocal2          = 0xD6,
    setlocal3          = 0xD7,
    invalid            = 0xED,
    debug              = 0xEF,
    debugline          = 0xF0,
    debugfile          = 0xF1,
    bkptline           = 0xF2,
    timestamp          = 0xF3
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
    positionAfterUTFStrings: number;
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
      Timer.start("Parse Strings");
      // Parse Strings
      var strings = [""];
      n = stream.readU30();
      for (var i = 1; i < n; ++i) {
        strings.push(stream.readUTFString(stream.readU30()));
      }
      this.positionAfterUTFStrings = stream.position;
      Timer.stop();

      this.ints = ints;
      this.uints = uints;
      this.doubles = doubles;
      this.strings = strings;

      Timer.start("Parse Namespaces");
      // Namespaces
      var namespaces = [undefined];
      n = stream.readU30();
      for (var i = 1; i < n; ++i) {
        namespaces.push(Namespace.parse(this, stream, abc.hash + i));
      }
      Timer.stop();

      Timer.start("Parse Namespace Sets");
      // Namespace Sets
      var namespaceSets = [undefined];
      n = stream.readU30();
      for (var i = 1; i < n; ++i) {
        var count = stream.readU30();
        var set = [];
        set.runtimeId = ConstantPool._nextNamespaceSetID ++;
        for (var j = 0; j < count; ++j) {
          set.push(namespaces[stream.readU30()]);
        }
        namespaceSets.push(set);
      }
      Timer.stop();

      this.namespaces = namespaces;
      this.namespaceSets = namespaceSets;

      Timer.start("Parse Multinames");
      // Multinames
      var multinames = [undefined];
      var patchFactoryTypes = [];
      n = stream.readU30();
      for (var i = 1; i < n; ++i) {
        multinames.push(Multiname.parse(this, stream, multinames, patchFactoryTypes));
      }
//    patchFactoryTypes.forEach(function (patch) {
//      var multiname = multinames[patch.index];
//      release || assert (multiname);
//      patch.Multiname.name = Multiname.name;
//      patch.Multiname.namespaces = Multiname.namespaces;
//    });
      Timer.stop();

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

import AbcFile = Shumway.AVM2.ABC.AbcFile;
import AbcStream = Shumway.AVM2.ABC.AbcStream;
import ConstantPool = Shumway.AVM2.ABC.ConstantPool;
import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
import MetaDataInfo = Shumway.AVM2.ABC.MetaDataInfo;
import InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
import ScriptInfo = Shumway.AVM2.ABC.ScriptInfo;
import Trait = Shumway.AVM2.ABC.Trait;
import MethodInfo = Shumway.AVM2.ABC.MethodInfo;
import Multiname = Shumway.AVM2.ABC.Multiname;
import ASNamespace = Shumway.AVM2.ABC.Namespace;