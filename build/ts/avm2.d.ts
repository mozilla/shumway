/// <reference path="base.d.ts" />
/// <reference path="tools.d.ts" />
declare module Shumway.AVMX {
    var timelineBuffer: Tools.Profiler.TimelineBuffer;
    var counter: Metrics.Counter;
    function countTimeline(name: string, value?: number): void;
    function enterTimeline(name: string, data?: any): void;
    function leaveTimeline(data?: any): void;
}
declare module Shumway.AVMX {
    interface ErrorInfo {
        code: number;
        message: string;
    }
    var Errors: {
        NotImplementedError: {
            code: number;
            message: string;
        };
        InvalidPrecisionError: {
            code: number;
            message: string;
        };
        InvalidRadixError: {
            code: number;
            message: string;
        };
        InvokeOnIncompatibleObjectError: {
            code: number;
            message: string;
        };
        ArrayIndexNotIntegerError: {
            code: number;
            message: string;
        };
        CallOfNonFunctionError: {
            code: number;
            message: string;
        };
        ConstructOfNonFunctionError: {
            code: number;
            message: string;
        };
        ConvertNullToObjectError: {
            code: number;
            message: string;
        };
        ConvertUndefinedToObjectError: {
            code: number;
            message: string;
        };
        ClassNotFoundError: {
            code: number;
            message: string;
        };
        DescendentsError: {
            code: number;
            message: string;
        };
        StackOverflowError: {
            code: number;
            message: string;
        };
        CpoolIndexRangeError: {
            code: number;
            message: string;
        };
        CpoolEntryWrongTypeError: {
            code: number;
            message: string;
        };
        CheckTypeFailedError: {
            code: number;
            message: string;
        };
        CannotAssignToMethodError: {
            code: number;
            message: string;
        };
        CantUseInstanceofOnNonObjectError: {
            code: number;
            message: string;
        };
        IsTypeMustBeClassError: {
            code: number;
            message: string;
        };
        InvalidMagicError: {
            code: number;
            message: string;
        };
        UnsupportedTraitsKindError: {
            code: number;
            message: string;
        };
        PrototypeTypeError: {
            code: number;
            message: string;
        };
        ConvertToPrimitiveError: {
            code: number;
            message: string;
        };
        InvalidURIError: {
            code: number;
            message: string;
        };
        WriteSealedError: {
            code: number;
            message: string;
        };
        WrongArgumentCountError: {
            code: number;
            message: string;
        };
        UndefinedVarError: {
            code: number;
            message: string;
        };
        ReadSealedError: {
            code: number;
            message: string;
        };
        ConstWriteError: {
            code: number;
            message: string;
        };
        XMLPrefixNotBound: {
            code: number;
            message: string;
        };
        XMLUnterminatedElementTag: {
            code: number;
            message: string;
        };
        XMLOnlyWorksWithOneItemLists: {
            code: number;
            message: string;
        };
        XMLAssignmentToIndexedXMLNotAllowed: {
            code: number;
            message: string;
        };
        XMLMarkupMustBeWellFormed: {
            code: number;
            message: string;
        };
        XMLAssigmentOneItemLists: {
            code: number;
            message: string;
        };
        XMLMalformedElement: {
            code: number;
            message: string;
        };
        XMLUnterminatedCData: {
            code: number;
            message: string;
        };
        XMLUnterminatedXMLDecl: {
            code: number;
            message: string;
        };
        XMLUnterminatedDocTypeDecl: {
            code: number;
            message: string;
        };
        XMLUnterminatedComment: {
            code: number;
            message: string;
        };
        XMLUnterminatedElement: {
            code: number;
            message: string;
        };
        XMLNamespaceWithPrefixAndNoURI: {
            code: number;
            message: string;
        };
        RegExpFlagsArgumentError: {
            code: number;
            message: string;
        };
        InvalidBaseClassError: {
            code: number;
            message: string;
        };
        XMLInvalidName: {
            code: number;
            message: string;
        };
        XMLIllegalCyclicalLoop: {
            code: number;
            message: string;
        };
        FilterError: {
            code: number;
            message: string;
        };
        OutOfRangeError: {
            code: number;
            message: string;
        };
        VectorFixedError: {
            code: number;
            message: string;
        };
        TypeAppOfNonParamType: {
            code: number;
            message: string;
        };
        WrongTypeArgCountError: {
            code: number;
            message: string;
        };
        JSONCyclicStructure: {
            code: number;
            message: string;
        };
        JSONInvalidReplacer: {
            code: number;
            message: string;
        };
        JSONInvalidParseInput: {
            code: number;
            message: string;
        };
        InvalidRangeError: {
            code: number;
            message: string;
        };
        NullArgumentError: {
            code: number;
            message: string;
        };
        InvalidArgumentError: {
            code: number;
            message: string;
        };
        ArrayFilterNonNullObjectError: {
            code: number;
            message: string;
        };
        InvalidParamError: {
            code: number;
            message: string;
        };
        ParamRangeError: {
            code: number;
            message: string;
        };
        NullPointerError: {
            code: number;
            message: string;
        };
        InvalidEnumError: {
            code: number;
            message: string;
        };
        CantInstantiateError: {
            code: number;
            message: string;
        };
        InvalidBitmapData: {
            code: number;
            message: string;
        };
        EOFError: {
            code: number;
            message: string;
            fqn: string;
        };
        CompressedDataError: {
            code: number;
            message: string;
            fqn: string;
        };
        EmptyStringError: {
            code: number;
            message: string;
        };
        ProxyGetPropertyError: {
            code: number;
            message: string;
        };
        ProxySetPropertyError: {
            code: number;
            message: string;
        };
        ProxyCallPropertyError: {
            code: number;
            message: string;
        };
        ProxyHasPropertyError: {
            code: number;
            message: string;
        };
        ProxyDeletePropertyError: {
            code: number;
            message: string;
        };
        ProxyGetDescendantsError: {
            code: number;
            message: string;
        };
        ProxyNextNameIndexError: {
            code: number;
            message: string;
        };
        ProxyNextNameError: {
            code: number;
            message: string;
        };
        ProxyNextValueError: {
            code: number;
            message: string;
        };
        TooFewArgumentsError: {
            code: number;
            message: string;
        };
        ParamTypeError: {
            code: number;
            message: string;
        };
        SocketConnectError: {
            code: number;
            message: string;
        };
        CantAddSelfError: {
            code: number;
            message: string;
        };
        NotAChildError: {
            code: number;
            message: string;
        };
        UnhandledError: {
            code: number;
            message: string;
        };
        AllowDomainArgumentError: {
            code: number;
            message: string;
        };
        DelayRangeError: {
            code: number;
            message: string;
        };
        ExternalInterfaceNotAvailableError: {
            code: number;
            message: string;
        };
        InvalidLoaderMethodError: {
            code: number;
            message: string;
        };
        InvalidStageMethodError: {
            code: number;
            message: string;
        };
        TimelineObjectNameSealedError: {
            code: number;
            message: string;
        };
        AlreadyConnectedError: {
            code: number;
            message: string;
        };
        CloseNotConnectedError: {
            code: number;
            message: string;
        };
        ArgumentSizeError: {
            code: number;
            message: string;
        };
        AsyncError: {
            code: number;
            message: string;
        };
        LoadingObjectNotSWFError: {
            code: number;
            message: string;
        };
        LoadingObjectNotInitializedError: {
            code: number;
            message: string;
        };
        DecodeParamError: {
            code: number;
            message: string;
        };
        SceneNotFoundError: {
            code: number;
            message: string;
        };
        FrameLabelNotFoundError: {
            code: number;
            message: string;
        };
        InvalidLoaderInfoMethodError: {
            code: number;
            message: string;
        };
        SecuritySwfNotAllowedError: {
            code: number;
            message: string;
        };
        UnknownFileTypeError: {
            code: number;
            message: string;
        };
        CantAddParentError: {
            code: number;
            message: string;
        };
        Matrix3DRefCannontBeShared: {
            code: number;
            message: string;
        };
        ObjectWithStringsParamError: {
            code: number;
            message: string;
        };
        AllowCodeImportError: {
            code: number;
            message: string;
        };
        PermissionDenied: {
            code: number;
            message: string;
        };
        InternalErrorIV: {
            code: number;
            message: string;
        };
    };
    function getErrorMessage(index: number): string;
    function getErrorInfo(index: number): ErrorInfo;
    function formatErrorMessage(error: any, ...args: any[]): string;
    function translateErrorMessage(error: any): any;
}
declare module Shumway.AVM2 {
    module Runtime {
        var traceRuntime: any;
        var traceExecution: any;
        var traceInterpreter: any;
        var debuggerMode: any;
        const enum ExecutionMode {
            INTERPRET = 1,
            COMPILE = 2,
        }
    }
    module Compiler {
    }
    module Verifier {
    }
}
declare module Shumway.AVM2.ABC {
    class AbcStream {
        private static _resultBuffer;
        private _bytes;
        private _view;
        private _position;
        constructor(bytes: Uint8Array);
        private static _getResultBuffer(length);
        position: number;
        remaining(): number;
        seek(position: number): void;
        advance(length: number): void;
        readU8(): number;
        readU8s(count: number): Uint8Array;
        viewU8s(count: number): Uint8Array;
        readS8(): number;
        readU32(): number;
        readU30(): number;
        readU30Unsafe(): number;
        readS16(): number;
        /**
         * Read a variable-length encoded 32-bit signed integer. The value may use one to five bytes (little endian),
         * each contributing 7 bits. The most significant bit of each byte indicates that the next byte is part of
         * the value. The spec indicates that the most significant bit of the last byte to be read is sign extended
         * but this turns out not to be the case in the real implementation, for instance 0x7f should technically be
         * -1, but instead it's 127. Moreover, what happens to the remaining 4 high bits of the fifth byte that is
         * read? Who knows, here we'll just stay true to the Tamarin implementation.
         */
        readS32(): number;
        readWord(): number;
        readS24(): number;
        readDouble(): number;
        readUTFString(length: any): string;
    }
}
declare module Shumway.AVMX {
    const enum Bytecode {
        BKPT = 1,
        NOP = 2,
        THROW = 3,
        GETSUPER = 4,
        SETSUPER = 5,
        DXNS = 6,
        DXNSLATE = 7,
        KILL = 8,
        LABEL = 9,
        LF32X4 = 10,
        SF32X4 = 11,
        IFNLT = 12,
        IFNLE = 13,
        IFNGT = 14,
        IFNGE = 15,
        JUMP = 16,
        IFTRUE = 17,
        IFFALSE = 18,
        IFEQ = 19,
        IFNE = 20,
        IFLT = 21,
        IFLE = 22,
        IFGT = 23,
        IFGE = 24,
        IFSTRICTEQ = 25,
        IFSTRICTNE = 26,
        LOOKUPSWITCH = 27,
        PUSHWITH = 28,
        POPSCOPE = 29,
        NEXTNAME = 30,
        HASNEXT = 31,
        PUSHNULL = 32,
        PUSHUNDEFINED = 33,
        PUSHFLOAT = 34,
        NEXTVALUE = 35,
        PUSHBYTE = 36,
        PUSHSHORT = 37,
        PUSHTRUE = 38,
        PUSHFALSE = 39,
        PUSHNAN = 40,
        POP = 41,
        DUP = 42,
        SWAP = 43,
        PUSHSTRING = 44,
        PUSHINT = 45,
        PUSHUINT = 46,
        PUSHDOUBLE = 47,
        PUSHSCOPE = 48,
        PUSHNAMESPACE = 49,
        HASNEXT2 = 50,
        LI8 = 53,
        LI16 = 54,
        LI32 = 55,
        LF32 = 56,
        LF64 = 57,
        SI8 = 58,
        SI16 = 59,
        SI32 = 60,
        SF32 = 61,
        SF64 = 62,
        NEWFUNCTION = 64,
        CALL = 65,
        CONSTRUCT = 66,
        CALLMETHOD = 67,
        CALLSTATIC = 68,
        CALLSUPER = 69,
        CALLPROPERTY = 70,
        RETURNVOID = 71,
        RETURNVALUE = 72,
        CONSTRUCTSUPER = 73,
        CONSTRUCTPROP = 74,
        CALLSUPERID = 75,
        CALLPROPLEX = 76,
        CALLINTERFACE = 77,
        CALLSUPERVOID = 78,
        CALLPROPVOID = 79,
        SXI1 = 80,
        SXI8 = 81,
        SXI16 = 82,
        APPLYTYPE = 83,
        PUSHFLOAT4 = 84,
        NEWOBJECT = 85,
        NEWARRAY = 86,
        NEWACTIVATION = 87,
        NEWCLASS = 88,
        GETDESCENDANTS = 89,
        NEWCATCH = 90,
        FINDPROPSTRICT = 93,
        FINDPROPERTY = 94,
        FINDDEF = 95,
        GETLEX = 96,
        SETPROPERTY = 97,
        GETLOCAL = 98,
        SETLOCAL = 99,
        GETGLOBALSCOPE = 100,
        GETSCOPEOBJECT = 101,
        GETPROPERTY = 102,
        GETOUTERSCOPE = 103,
        INITPROPERTY = 104,
        UNUSED_69 = 105,
        DELETEPROPERTY = 106,
        UNUSED_6B = 107,
        GETSLOT = 108,
        SETSLOT = 109,
        GETGLOBALSLOT = 110,
        SETGLOBALSLOT = 111,
        CONVERT_S = 112,
        ESC_XELEM = 113,
        ESC_XATTR = 114,
        CONVERT_I = 115,
        CONVERT_U = 116,
        CONVERT_D = 117,
        CONVERT_B = 118,
        CONVERT_O = 119,
        CHECKFILTER = 120,
        CONVERT_F = 121,
        UNPLUS = 122,
        CONVERT_F4 = 123,
        BC_7C = 124,
        BC_7D = 125,
        BC_7E = 126,
        BC_7F = 127,
        COERCE = 128,
        COERCE_B = 129,
        COERCE_A = 130,
        COERCE_I = 131,
        COERCE_D = 132,
        COERCE_S = 133,
        ASTYPE = 134,
        ASTYPELATE = 135,
        COERCE_U = 136,
        COERCE_O = 137,
        NEGATE = 144,
        INCREMENT = 145,
        INCLOCAL = 146,
        DECREMENT = 147,
        DECLOCAL = 148,
        TYPEOF = 149,
        NOT = 150,
        BITNOT = 151,
        UNUSED_98 = 152,
        UNUSED_99 = 153,
        UNUSED_9A = 154,
        UNUSED_9B = 155,
        UNUSED_9C = 156,
        UNUSED_9D = 157,
        UNUSED_9E = 158,
        UNUSED_9F = 159,
        ADD = 160,
        SUBTRACT = 161,
        MULTIPLY = 162,
        DIVIDE = 163,
        MODULO = 164,
        LSHIFT = 165,
        RSHIFT = 166,
        URSHIFT = 167,
        BITAND = 168,
        BITOR = 169,
        BITXOR = 170,
        EQUALS = 171,
        STRICTEQUALS = 172,
        LESSTHAN = 173,
        LESSEQUALS = 174,
        GREATERTHAN = 175,
        GREATEREQUALS = 176,
        INSTANCEOF = 177,
        ISTYPE = 178,
        ISTYPELATE = 179,
        IN = 180,
        UNUSED_B5 = 181,
        UNUSED_B6 = 182,
        UNUSED_B7 = 183,
        UNUSED_B8 = 184,
        UNUSED_B9 = 185,
        UNUSED_BA = 186,
        UNUSED_BB = 187,
        UNUSED_BC = 188,
        UNUSED_BD = 189,
        UNUSED_BE = 190,
        UNUSED_BF = 191,
        INCREMENT_I = 192,
        DECREMENT_I = 193,
        INCLOCAL_I = 194,
        DECLOCAL_I = 195,
        NEGATE_I = 196,
        ADD_I = 197,
        SUBTRACT_I = 198,
        MULTIPLY_I = 199,
        UNUSED_C8 = 200,
        UNUSED_C9 = 201,
        UNUSED_CA = 202,
        UNUSED_CB = 203,
        UNUSED_CC = 204,
        UNUSED_CD = 205,
        UNUSED_CE = 206,
        UNUSED_CF = 207,
        GETLOCAL0 = 208,
        GETLOCAL1 = 209,
        GETLOCAL2 = 210,
        GETLOCAL3 = 211,
        SETLOCAL0 = 212,
        SETLOCAL1 = 213,
        SETLOCAL2 = 214,
        SETLOCAL3 = 215,
        UNUSED_D8 = 216,
        UNUSED_D9 = 217,
        UNUSED_DA = 218,
        UNUSED_DB = 219,
        UNUSED_DC = 220,
        UNUSED_DD = 221,
        UNUSED_DE = 222,
        UNUSED_DF = 223,
        UNUSED_E0 = 224,
        UNUSED_E1 = 225,
        UNUSED_E2 = 226,
        UNUSED_E3 = 227,
        UNUSED_E4 = 228,
        UNUSED_E5 = 229,
        UNUSED_E6 = 230,
        UNUSED_E7 = 231,
        UNUSED_E8 = 232,
        UNUSED_E9 = 233,
        UNUSED_EA = 234,
        UNUSED_EB = 235,
        UNUSED_EC = 236,
        UNUSED_ED = 237,
        UNUSED_EE = 238,
        INVALID = 237,
        DEBUG = 239,
        DEBUGLINE = 240,
        DEBUGFILE = 241,
        BKPTLINE = 242,
        TIMESTAMP = 243,
        RESTARGC = 244,
        RESTARG = 245,
        UNUSED_F6 = 246,
        UNUSED_F7 = 247,
        UNUSED_F8 = 248,
        UNUSED_F9 = 249,
        UNUSED_FA = 250,
        UNUSED_FB = 251,
        UNUSED_FC = 252,
        UNUSED_FD = 253,
        UNUSED_FE = 254,
        END = 255,
    }
    function getBytecodeName(bytecode: Bytecode): string;
    /**
     * A array that maps from a bytecode value to the set of {@link OPFlags} for the corresponding instruction.
     */
    var BytecodeFlags: Uint32Array;
    var BytecodeFormat: any[];
    /**
     * Only call this before the compiler is used.
     */
    function defineBytecodes(): void;
    class Bytes {
        static u8(code: Uint8Array, i: number): number;
        static s32(code: Uint8Array, i: number): number;
        static u32(code: Uint8Array, i: number): number;
        static u30(code: Uint8Array, i: number): number;
        static s32Length(code: Uint8Array, i: number): number;
    }
    const enum Sizes {
        u08 = 0,
        s08 = 1,
        s16 = 2,
        s24 = 3,
        u30 = 4,
        u32 = 5,
    }
    class BytecodeStream {
        private _code;
        private _bytecode;
        private _currentBCI;
        private _nextBCI;
        constructor(code: Uint8Array);
        next(): void;
        endBCI(): number;
        nextBCI: number;
        currentBCI: number;
        currentBytecode(): Bytecode;
        nextBC(): Bytecode;
        setBCI(bci: number): void;
    }
}
declare module Shumway.AVMX {
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
    const enum CONSTANT {
        Undefined = 0,
        Utf8 = 1,
        Float = 2,
        Int = 3,
        UInt = 4,
        PrivateNs = 5,
        Double = 6,
        QName = 7,
        Namespace = 8,
        Multiname = 9,
        False = 10,
        True = 11,
        Null = 12,
        QNameA = 13,
        MultinameA = 14,
        RTQName = 15,
        RTQNameA = 16,
        RTQNameL = 17,
        RTQNameLA = 18,
        NameL = 19,
        NameLA = 20,
        NamespaceSet = 21,
        PackageNamespace = 22,
        PackageInternalNs = 23,
        ProtectedNamespace = 24,
        ExplicitNamespace = 25,
        StaticProtectedNs = 26,
        MultinameL = 27,
        MultinameLA = 28,
        TypeName = 29,
        ClassSealed = 1,
        ClassFinal = 2,
        ClassInterface = 4,
        ClassProtectedNs = 8,
    }
    function getCONSTANTName(constant: CONSTANT): string;
    const enum METHOD {
        NeedArguments = 1,
        Activation = 2,
        NeedRest = 4,
        HasOptional = 8,
        IgnoreRest = 16,
        Native = 32,
        Setsdxns = 64,
        HasParamNames = 128,
        HasBody = 256,
        InstanceInitializer = 512,
        ClassInitializer = 1024,
        ScriptInitializer = 2048,
    }
    const enum TRAIT {
        Slot = 0,
        Method = 1,
        Getter = 2,
        Setter = 3,
        Class = 4,
        Function = 5,
        Const = 6,
        GetterSetter = 7,
    }
    function getTRAITName(trait: TRAIT): string;
    const enum ATTR {
        Final = 1,
        Override = 2,
        Metadata = 4,
    }
    const enum NamespaceType {
        Public = 0,
        Protected = 1,
        PackageInternal = 2,
        Private = 3,
        Explicit = 4,
        StaticProtected = 5,
    }
    function getNamespaceTypeName(namespaceType: NamespaceType): string;
    const enum SORT {
        CASEINSENSITIVE = 1,
        DESCENDING = 2,
        UNIQUESORT = 4,
        RETURNINDEXEDARRAY = 8,
        NUMERIC = 16,
    }
    class MetadataInfo {
        abc: ABCFile;
        name: String | number;
        keys: Uint32Array;
        values: Uint32Array;
        constructor(abc: ABCFile, name: String | number, keys: Uint32Array, values: Uint32Array);
        getName(): string;
        getKeyAt(i: number): string;
        getValueAt(i: number): string;
        getValue(key: string): string;
    }
    /**
     * The Traits class represents the collection of compile-time traits associated with a type.
     * It's not used for runtime name resolution on instances; instead, the combined traits for
     * a type and all its super types is resolved and translated to an instance of RuntimeTraits.
     */
    class Traits {
        traits: TraitInfo[];
        private _resolved;
        constructor(traits: TraitInfo[]);
        resolve(): void;
        attachHolder(holder: Info): void;
        trace(writer?: IndentingWriter): void;
        /**
         * Searches for a trait with the specified name.
         */
        private indexOf(mn);
        getTrait(mn: Multiname): TraitInfo;
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
        resolveRuntimeTraits(superTraits: RuntimeTraits, protectedNs: Namespace, scope: Scope): RuntimeTraits;
    }
    class TraitInfo {
        abc: ABCFile;
        kind: TRAIT;
        name: Multiname | number;
        holder: Info;
        metadata: MetadataInfo[] | Uint32Array;
        constructor(abc: ABCFile, kind: TRAIT, name: Multiname | number);
        getMetadata(): MetadataInfo[];
        getName(): Multiname;
        resolve(): void;
        toString(): string;
        toFlashlogString(): string;
        isConst(): boolean;
        isSlot(): boolean;
        isMethod(): boolean;
        isGetter(): boolean;
        isSetter(): boolean;
        isAccessor(): boolean;
        isMethodOrAccessor(): boolean;
    }
    class RuntimeTraits {
        superTraits: RuntimeTraits;
        protectedNs: Namespace;
        protectedNsMappings: any;
        slots: RuntimeTraitInfo[];
        private _traits;
        private _nextSlotID;
        constructor(superTraits: RuntimeTraits, protectedNs: Namespace, protectedNsMappings: any);
        /**
         * Adds the given trait and returns any trait that might already exist under that name.
         *
         * See the comment for `Trait#resolveRuntimeTraits` for an explanation of the lookup scheme.
         */
        addTrait(trait: RuntimeTraitInfo): RuntimeTraitInfo;
        addSlotTrait(trait: RuntimeTraitInfo): void;
        /**
         * Returns the trait matching the given multiname parts, if any.
         *
         * See the comment for `Trait#resolveRuntimeTraits` for an explanation of the lookup scheme.
         */
        getTrait(namespaces: Namespace[], name: string): RuntimeTraitInfo;
        getTraitsList(): any[];
        getSlotPublicTraitNames(): string[];
        getSlot(i: number): RuntimeTraitInfo;
    }
    class RuntimeTraitInfo {
        name: Multiname;
        kind: TRAIT;
        private abc;
        configurable: boolean;
        enumerable: boolean;
        writable: boolean;
        get: () => any;
        set: (v: any) => void;
        slot: number;
        value: any;
        typeName: Multiname;
        private _type;
        constructor(name: Multiname, kind: TRAIT, abc: ABCFile);
        getType(): AXClass;
    }
    class SlotTraitInfo extends TraitInfo {
        slot: number;
        typeName: Multiname | number;
        defaultValueKind: CONSTANT;
        defaultValueIndex: number;
        constructor(abc: ABCFile, kind: TRAIT, name: Multiname | number, slot: number, typeName: Multiname | number, defaultValueKind: CONSTANT, defaultValueIndex: number);
        resolve(): void;
        getTypeName(): Multiname;
        getDefaultValue(): any;
    }
    class MethodTraitInfo extends TraitInfo {
        methodInfo: MethodInfo | number;
        method: Function;
        constructor(abc: ABCFile, kind: TRAIT, name: Multiname | number, methodInfo: MethodInfo | number);
        getMethodInfo(): MethodInfo;
        resolve(): void;
    }
    class ClassTraitInfo extends SlotTraitInfo {
        classInfo: ClassInfo;
        constructor(abc: ABCFile, kind: TRAIT, name: Multiname | number, slot: number, classInfo: ClassInfo);
    }
    class ParameterInfo {
        abc: ABCFile;
        type: Multiname | number;
        /**
         * Don't rely on the name being correct.
         */
        name: string | number;
        optionalValueKind: CONSTANT;
        optionalValueIndex: number;
        constructor(abc: ABCFile, type: Multiname | number, 
            /**
             * Don't rely on the name being correct.
             */
            name: string | number, optionalValueKind: CONSTANT, optionalValueIndex: number);
        getName(): string;
        getType(): Multiname;
        hasOptionalValue(): boolean;
        getOptionalValue(): any;
        toString(): string;
    }
    class Info {
    }
    class InstanceInfo extends Info {
        abc: ABCFile;
        name: Multiname | number;
        superName: Multiname | number;
        flags: number;
        protectedNs: number;
        interfaceNameIndices: number[];
        initializer: MethodInfo | number;
        traits: Traits;
        classInfo: ClassInfo;
        runtimeTraits: RuntimeTraits;
        private _interfaces;
        constructor(abc: ABCFile, name: Multiname | number, superName: Multiname | number, flags: number, protectedNs: number, interfaceNameIndices: number[], initializer: MethodInfo | number, traits: Traits);
        getInitializer(): MethodInfo;
        getName(): Multiname;
        getClassName(): string;
        getSuperName(): Multiname;
        getInterfaces(ownerClass: AXClass): Set<AXClass>;
        toString(): string;
        toFlashlogString(): string;
        trace(writer: IndentingWriter): void;
        isInterface(): boolean;
        isSealed(): boolean;
        isFinal(): boolean;
    }
    class ScriptInfo extends Info {
        abc: ABCFile;
        initializer: number;
        traits: Traits;
        global: AXGlobal;
        state: ScriptInfoState;
        constructor(abc: ABCFile, initializer: number, traits: Traits);
        getInitializer(): MethodInfo;
        trace(writer: IndentingWriter): void;
    }
    class ClassInfo extends Info {
        abc: ABCFile;
        instanceInfo: InstanceInfo;
        initializer: MethodInfo | number;
        traits: Traits;
        trait: ClassTraitInfo;
        runtimeTraits: RuntimeTraits;
        constructor(abc: ABCFile, instanceInfo: InstanceInfo, initializer: MethodInfo | number, traits: Traits);
        getNativeMetadata(): MetadataInfo;
        getInitializer(): MethodInfo;
        toString(): string;
        trace(writer: IndentingWriter): void;
    }
    class ExceptionInfo {
        abc: ABCFile;
        start: number;
        end: number;
        target: number;
        type: Multiname | number;
        varName: number;
        catchPrototype: Object;
        private _traits;
        constructor(abc: ABCFile, start: number, end: number, target: number, type: Multiname | number, varName: number);
        getType(): Multiname;
        getTraits(): Traits;
    }
    class MethodBodyInfo extends Info {
        maxStack: number;
        localCount: number;
        initScopeDepth: number;
        maxScopeDepth: number;
        code: Uint8Array;
        catchBlocks: ExceptionInfo[];
        traits: Traits;
        activationPrototype: Object;
        constructor(maxStack: number, localCount: number, initScopeDepth: number, maxScopeDepth: number, code: Uint8Array, catchBlocks: ExceptionInfo[], traits: Traits);
        trace(writer: IndentingWriter): void;
    }
    class MethodInfo {
        abc: ABCFile;
        private _index;
        name: number;
        returnTypeNameIndex: number;
        parameters: ParameterInfo[];
        optionalCount: number;
        flags: number;
        trait: MethodTraitInfo;
        minArgs: number;
        private _body;
        private _returnType;
        constructor(abc: ABCFile, _index: number, name: number, returnTypeNameIndex: number, parameters: ParameterInfo[], optionalCount: number, flags: number);
        getNativeMetadata(): MetadataInfo;
        getBody(): MethodBodyInfo;
        getType(): AXClass;
        getName(): string;
        toString(): string;
        toFlashlogString(): string;
        isNative(): boolean;
        needsRest(): boolean;
        needsArguments(): boolean;
    }
    class Multiname {
        abc: ABCFile;
        index: number;
        kind: CONSTANT;
        namespaces: Namespace[];
        name: any;
        parameterType: Multiname;
        private static _nextID;
        id: number;
        private _mangledName;
        constructor(abc: ABCFile, index: number, kind: CONSTANT, namespaces: Namespace[], name: any, parameterType?: Multiname);
        static FromFQNString(fqn: string, nsType: NamespaceType): Multiname;
        private _nameToString();
        isRuntime(): boolean;
        isRuntimeName(): boolean;
        isRuntimeNamespace(): boolean;
        isAnyName(): boolean;
        isAnyNamespace(): boolean;
        isQName(): boolean;
        namespace: Namespace;
        uri: string;
        prefix: string;
        equalsQName(mn: Multiname): boolean;
        matches(mn: Multiname): boolean;
        isAttribute(): boolean;
        getMangledName(): string;
        private _mangleName();
        getPublicMangledName(): any;
        static isPublicQualifiedName(value: any): boolean;
        static getPublicMangledName(name: string): any;
        toFQNString(useColons: boolean): string;
        toString(): string;
        toFlashlogString(): string;
        /**
         * Removes the public prefix, or returns undefined if the prefix doesn't exist.
         */
        static stripPublicMangledName(name: string): any;
        static FromSimpleName(simpleName: string): Multiname;
    }
    class Namespace {
        type: NamespaceType;
        uri: string;
        prefix: string;
        mangledName: string;
        constructor(type: NamespaceType, uri: string, prefix: string);
        toString(): string;
        private static _knownNames;
        private static _hashNamespace(type, uri, prefix);
        private mangleName();
        isPublic(): boolean;
        reflectedURI: string;
        static PUBLIC: Namespace;
    }
    function internNamespace(type: NamespaceType, uri: string): Namespace;
    function internPrefixedNamespace(type: NamespaceType, uri: string, prefix: string): Namespace;
    class ABCFile {
        private _buffer;
        ints: Int32Array;
        uints: Uint32Array;
        doubles: Float64Array;
        /**
         * Environment this ABC is loaded into.
         * In the shell, this is just a wrapper around an applicationDomain, but in the
         * SWF player, it's a flash.display.LoaderInfo object.
         */
        env: {
            app: AXApplicationDomain;
            url: string;
        };
        applicationDomain: AXApplicationDomain;
        private _stream;
        private _strings;
        private _stringOffsets;
        private _namespaces;
        private _namespaceOffsets;
        private _namespaceSets;
        private _namespaceSetOffsets;
        private _multinames;
        private _multinameOffsets;
        private _metadata;
        private _metadataInfoOffsets;
        private _methods;
        private _methodBodies;
        private _methodInfoOffsets;
        classes: ClassInfo[];
        scripts: ScriptInfo[];
        instances: InstanceInfo[];
        constructor(env: {
            app: AXApplicationDomain;
            url: string;
        }, _buffer: Uint8Array);
        private _parseConstantPool();
        private _parseNumericConstants();
        private _parseStringConstants();
        private _parseNamespaces();
        private _parseNamespaceSets();
        private _consumeMultiname();
        private _parseMultinames();
        private _parseMultiname(i);
        private _checkMagic();
        /**
         * String duplicates exist in practice but are extremely rare.
         */
        private _checkForDuplicateStrings();
        /**
         * Returns the string at the specified index in the string table.
         */
        getString(i: number): string;
        /**
         * Returns the multiname at the specified index in the multiname table.
         */
        getMultiname(i: number): Multiname;
        /**
         * Returns the namespace at the specified index in the namespace table.
         */
        getNamespace(i: number): Namespace;
        /**
         * Returns the namespace set at the specified index in the namespace set table.
         */
        getNamespaceSet(i: number): Namespace[];
        private _parseMethodInfos();
        private _consumeMethodInfo();
        private _parseMethodInfo(j);
        /**
         * Returns the method info at the specified index in the method info table.
         */
        getMethodInfo(i: number): MethodInfo;
        getMethodBodyInfo(i: number): MethodBodyInfo;
        private _parseMetaData();
        getMetadataInfo(i: number): MetadataInfo;
        private _parseInstanceAndClassInfos();
        private _parseInstanceInfo();
        private _parseTraits();
        private _parseTrait();
        private _parseClassInfos(n);
        private _parseClassInfo(i);
        private _parseScriptInfos();
        private _parseScriptInfo();
        private _parseMethodBodyInfos();
        private _parseException();
        getConstant(kind: CONSTANT, i: number): any;
        stress(): void;
        trace(writer: IndentingWriter): void;
    }
    class ABCCatalog {
        map: Shumway.MapObject<Shumway.MapObject<string>>;
        abcs: Uint8Array;
        scripts: Shumway.MapObject<any>;
        app: AXApplicationDomain;
        constructor(app: AXApplicationDomain, abcs: Uint8Array, index: any);
        getABCByScriptName(scriptName: string): ABCFile;
        getABCByMultiname(mn: Multiname): ABCFile;
    }
}
declare module Shumway.AVMX {
    /**
     * Helps the interpreter allocate fewer Scope objects.
     */
    class ScopeStack {
        parent: Scope;
        stack: any[];
        isWith: boolean[];
        scopes: Scope[];
        constructor(parent: Scope);
        push(object: any, isWith: boolean): void;
        get(index: any): any;
        clear(): void;
        pop(): void;
        topScope(): Scope;
    }
    function interpret(self: Object, methodInfo: MethodInfo, savedScope: Scope, args: any[], callee: AXFunction): any;
}
/**
 * MetaobjectProtocol interface.
 */
interface IMetaobjectProtocol {
    axResolveMultiname(mn: Shumway.AVMX.Multiname): any;
    axHasProperty(mn: Shumway.AVMX.Multiname): boolean;
    axDeleteProperty(mn: Shumway.AVMX.Multiname): boolean;
    axCallProperty(mn: Shumway.AVMX.Multiname, argArray: any[], isLex: boolean): any;
    axCallSuper(mn: Shumway.AVMX.Multiname, scope: Shumway.AVMX.Scope, argArray: any[]): any;
    axConstructProperty(mn: Shumway.AVMX.Multiname, args: any[]): any;
    axHasPropertyInternal(mn: Shumway.AVMX.Multiname): boolean;
    axHasOwnProperty(mn: Shumway.AVMX.Multiname): boolean;
    axSetProperty(mn: Shumway.AVMX.Multiname, value: any, bc: Shumway.AVMX.Bytecode): any;
    axGetProperty(mn: Shumway.AVMX.Multiname): any;
    axGetSuper(mn: Shumway.AVMX.Multiname, scope: Shumway.AVMX.Scope): any;
    axSetSuper(mn: Shumway.AVMX.Multiname, scope: Shumway.AVMX.Scope, value: any): any;
    axNextNameIndex(index: number): any;
    axNextName(index: number): any;
    axNextValue(index: number): any;
    axEnumerableKeys: any[];
    axGetEnumerableKeys(): any[];
    axHasPublicProperty(nm: any): boolean;
    axSetPublicProperty(nm: any, value: any): any;
    axGetPublicProperty(nm: any): any;
    axCallPublicProperty(nm: any, argArray: any[]): any;
    axDeletePublicProperty(nm: any): boolean;
    axSetNumericProperty(nm: number, value: any): any;
    axGetNumericProperty(nm: number): any;
    axGetSlot(i: number): any;
    axSetSlot(i: number, value: any): any;
    getPrototypeOf(): any;
}
interface Function {
    axApply(thisArg: any, argArray?: any[]): any;
    axCall(thisArg: any): any;
}
declare var $: Shumway.AVMX.AXSecurityDomain;
declare module Shumway.AVMX {
    function validateCall(sec: AXSecurityDomain, fun: AXCallable, argc: number): void;
    function validateConstruct(sec: AXSecurityDomain, axClass: AXClass, argc: number): void;
    function checkNullParameter(argument: any, name: string, sec: AXSecurityDomain): void;
    function checkParameterType(argument: any, name: string, type: AS.ASClass): void;
    function forEachPublicProperty(object: AS.ASObject, callbackfn: (property: any, value: any) => void, thisArg?: any): void;
    enum WriterFlags {
        None = 0,
        Runtime = 1,
        Execution = 2,
        Interpreter = 4,
    }
    var runtimeWriter: any;
    var executionWriter: any;
    var interpreterWriter: any;
    function sliceArguments(args: any, offset: number): any;
    function setWriters(flags: WriterFlags): void;
    const enum ScriptInfoState {
        None = 0,
        Executing = 1,
        Executed = 2,
    }
    import ASClass = Shumway.AVMX.AS.ASClass;
    function ensureBoxedReceiver(sec: AXSecurityDomain, receiver: any, callable: any): any;
    function axCoerceInt(x: any): number;
    function axCoerceUint(x: any): number;
    function axCoerceNumber(x: any): number;
    function axCoerceBoolean(x: any): boolean;
    /**
     * Similar to |toString| but returns |null| for |null| or |undefined| instead
     * of "null" or "undefined".
     */
    function axCoerceString(x: any): string;
    /**
     * Same as |axCoerceString| except for returning "null" instead of |null| for
     * |null| or |undefined|, and calls |toString| instead of (implicitly) |valueOf|.
     */
    function axCoerceName(x: any): string;
    function axConvertString(x: any): string;
    function axIsTypeNumber(x: any): boolean;
    function axIsTypeInt(x: any): boolean;
    function axIsTypeUint(x: any): boolean;
    function axIsTypeBoolean(x: any): boolean;
    function axIsTypeString(x: any): boolean;
    function axGetDescendants(object: any, mn: Multiname, sec: AXSecurityDomain): any;
    function axCheckFilter(sec: AXSecurityDomain, value: any): any;
    function axFalse(): boolean;
    function axDefaultCompareFunction(a: any, b: any): number;
    function axCompare(a: any, b: any, options: SORT, sortOrder: number, compareFunction: (a, b) => number): number;
    function axCompareFields(objA: any, objB: any, names: string[], optionsList: SORT[]): number;
    /**
     * ActionScript 3 has different behaviour when deciding whether to call toString or valueOf
     * when one operand is a string. Unlike JavaScript, it calls toString if one operand is a
     * string and valueOf otherwise. This sucks, but we have to emulate this behaviour because
     * YouTube depends on it.
     *
     * AS3 also overloads the `+` operator to concatenate XMLs/XMLLists instead of stringifying them.
     */
    function axAdd(l: any, r: any, sec: AXSecurityDomain): any;
    function axEquals(left: any, right: any, sec: AXSecurityDomain): boolean;
    function isValidASValue(value: any): any;
    function checkValue(value: any): void;
    function axTypeOf(x: any, sec: AXSecurityDomain): string;
    function axIsCallable(value: any): boolean;
    /**
     * All objects with Traits must implement this interface.
     */
    interface ITraits {
        traits: RuntimeTraits;
        sec: AXSecurityDomain;
    }
    class Scope {
        parent: Scope;
        global: Scope;
        object: AXObject;
        isWith: boolean;
        cache: any;
        defaultNamespace: Namespace;
        constructor(parent: Scope, object: any, isWith?: boolean);
        findDepth(object: any): number;
        getScopeObjects(): Object[];
        getScopeProperty(mn: Multiname, strict: boolean, scopeOnly: boolean): any;
        findScopeProperty(mn: Multiname, strict: boolean, scopeOnly: boolean): any;
    }
    function applyTraits(object: ITraits, traits: RuntimeTraits): void;
    var AXBasePrototype: any;
    interface AXObject extends ITraits, IMetaobjectProtocol {
        $BgtoString: AXCallable;
        $BgvalueOf: AXCallable;
        axInitializer: any;
        axClass: AXClass;
    }
    interface AXGlobal extends AXObject {
        sec: AXSecurityDomain;
        applicationDomain: AXApplicationDomain;
        scriptInfo: ScriptInfo;
        scope: Scope;
    }
    interface AXClass extends AXObject {
        scope: Scope;
        asClass: ASClass;
        superClass: AXClass;
        classInfo: ClassInfo;
        name: Multiname;
        defaultValue: any;
        tPrototype: AXObject;
        dPrototype: AXObject;
        axBox: (x: any) => any;
        axConstruct: (args: any[]) => AXObject;
        axApply: (self: AXObject, args: any[]) => any;
        axCoerce: (x: any) => any;
        axIsType: (x: any) => boolean;
        axAsType: (x: any) => boolean;
        axIsInstanceOf: (x: any) => boolean;
        axImplementsInterface: (x: AXClass) => boolean;
    }
    interface AXFunction extends AXObject {
        axApply(thisArg: any, argArray?: any[]): any;
        axCall(thisArg: any): any;
        value: any;
    }
    interface AXMethodClosureClass extends AXClass {
        Create(receiver: AXObject, method: Function): AXFunction;
    }
    interface AXXMLClass extends AXClass {
        Create(value?: any): AS.ASXML;
        resetSettings: () => void;
        _flags: number;
        _prettyIndent: number;
        prettyPrinting: boolean;
        ignoreComments: boolean;
        ignoreWhitespace: boolean;
        ignoreProcessingInstructions: boolean;
    }
    interface AXXMLListClass extends AXClass {
        Create(value?: any): AS.ASXMLList;
        CreateList(targetObject: AS.ASXML, targetProperty: Multiname): AS.ASXMLList;
    }
    interface AXNamespaceClass extends AXClass {
        Create(uriOrPrefix?: any, uri?: any): AS.ASNamespace;
        FromNamespace(ns: Namespace): AS.ASNamespace;
        defaultNamespace: Namespace;
    }
    interface AXQNameClass extends AXClass {
        Create(nameOrNS?: any, name?: any): AS.ASQName;
        FromMultiname(mn: Multiname): AS.ASQName;
    }
    /**
     * Can be used wherever both AXFunctions and raw JS functions are valid values.
     */
    interface AXCallable {
        axApply(thisArg: any, argArray?: any[]): any;
        axCall(thisArg: any, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any, arg6?: any, arg7?: any, arg8?: any, arg9?: any): any;
        apply(thisArg: any, argArray?: any[]): any;
        call(thisArg: any, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any, arg6?: any, arg7?: any, arg8?: any, arg9?: any): any;
        methodInfo?: MethodInfo;
        length: number;
    }
    interface AXActivation extends ITraits {
    }
    interface AXCatch extends ITraits {
    }
    /**
     * Make sure we bottom out at the securityDomain's objectPrototype.
     */
    function safeGetPrototypeOf(object: AXObject): AXObject;
    class HasNext2Info {
        object: AXObject;
        index: number;
        constructor(object: AXObject, index: number);
        /**
         * Determine if the given object has any more properties after the specified |index| and if so,
         * return the next index or |zero| otherwise. If the |obj| has no more properties then continue
         * the search in
         * |obj.__proto__|. This function returns an updated index and object to be used during
         * iteration.
         *
         * the |for (x in obj) { ... }| statement is compiled into the following pseudo bytecode:
         *
         * index = 0;
         * while (true) {
         *   (obj, index) = hasNext2(obj, index);
         *   if (index) { #1
         *     x = nextName(obj, index); #2
         *   } else {
         *     break;
         *   }
         * }
         *
         * #1 If we return zero, the iteration stops.
         * #2 The spec says we need to get the nextName at index + 1, but it's actually index - 1, this
         * caused me two hours of my life that I will probably never get back.
         *
         * TODO: We can't match the iteration order semantics of Action Script, hopefully programmers
         * don't rely on it.
         */
        next(object: AXObject, index: number): void;
    }
    var scopeStacks: ScopeStack[];
    function getCurrentScope(): Scope;
    function getCurrentABC(): ABCFile;
    /**
     * Provides security isolation between application domains.
     */
    class AXSecurityDomain {
        system: AXApplicationDomain;
        application: AXApplicationDomain;
        classAliases: ClassAliases;
        AXObject: AXClass;
        AXArray: AXClass;
        AXClass: AXClass;
        AXFunction: AXClass;
        AXMethodClosure: AXMethodClosureClass;
        AXError: AXClass;
        AXNumber: AXClass;
        AXString: AXClass;
        AXBoolean: AXClass;
        AXRegExp: AXClass;
        AXMath: AXClass;
        AXDate: AXClass;
        AXXML: AXXMLClass;
        AXXMLList: AXXMLListClass;
        AXNamespace: AXNamespaceClass;
        AXQName: AXQNameClass;
        ObjectVector: typeof AS.GenericVector;
        Int32Vector: typeof AS.Int32Vector;
        Uint32Vector: typeof AS.Uint32Vector;
        Float64Vector: typeof AS.Float64Vector;
        xmlParser: AS.XMLParser;
        private _xmlParser;
        private AXPrimitiveBox;
        private AXGlobalPrototype;
        private AXActivationPrototype;
        private AXCatchPrototype;
        private _AXFunctionUndefinedPrototype;
        AXFunctionUndefinedPrototype: any;
        objectPrototype: AXObject;
        argumentsPrototype: AXObject;
        private rootClassPrototype;
        private nativeClasses;
        private vectorClasses;
        private _catalogs;
        constructor();
        addCatalog(abcCatalog: ABCCatalog): void;
        findDefiningABC(mn: Multiname): ABCFile;
        throwError(className: string, error: any, replacement1?: any, replacement2?: any, replacement3?: any, replacement4?: any): void;
        createError(className: string, error: any, replacement1?: any, replacement2?: any, replacement3?: any, replacement4?: any): AXObject;
        applyType(axClass: AXClass, types: AXClass[]): AXClass;
        getVectorClass(type: AXClass): AXClass;
        createVectorClass(type: AXClass): AXClass;
        /**
         * Constructs a plain vanilla object in this security domain.
         */
        createObject(): any;
        /**
         * Takes a JS Object and transforms it into an AXObject.
         */
        createObjectFromJS(value: Object, deep?: boolean): any;
        /**
         * Constructs an AXArray in this security domain and sets its value to the given array.
         * Warning: This doesn't handle non-indexed keys.
         */
        createArrayUnsafe(value: any[]): any;
        /**
         * Constructs an AXArray in this security domain and copies all enumerable properties of
         * the given array, setting them as public properties on the AXArray.
         * Warning: this does not use the given Array as the `value`.
         */
        createArray(value: any[]): any;
        /**
         * Constructs an AXFunction in this security domain and sets its value to the given function.
         */
        boxFunction(value: Function): any;
        createClass(classInfo: ClassInfo, superClass: AXClass, scope: Scope): AXClass;
        private initializeRuntimeTraits(axClass, superClass, scope);
        createFunction(methodInfo: MethodInfo, scope: Scope, hasDynamicScope: boolean): AXFunction;
        createInitializerFunction(classInfo: ClassInfo, scope: Scope): AXCallable;
        createActivation(methodInfo: MethodInfo, scope: Scope): AXActivation;
        createCatch(exceptionInfo: ExceptionInfo, scope: Scope): AXCatch;
        box(v: any): any;
        isPrimitive(v: any): any;
        createAXGlobal(applicationDomain: AXApplicationDomain, scriptInfo: ScriptInfo): AXGlobal;
        /**
         * Prepares the dynamic Class prototype that all Class instances (including Class) have in
         * their prototype chain.
         *
         * This prototype defines the default hooks for all classes. Classes can override some or
         * all of them.
         */
        prepareRootClassPrototype(): void;
        private initializeCoreNatives();
        prepareNativeClass(exportName: string, name: string, isPrimitiveClass: boolean): AXClass;
        preparePrimitiveClass(exportName: string, name: string, convert: any, defaultValue: any, coerce: any, isType: any, isInstanceOf: any): AXClass;
        /**
         * Configures all the builtin Objects.
         */
        initialize(): void;
    }
    /**
     * All code lives within an application domain.
     */
    class AXApplicationDomain {
        /**
         * All application domains have a reference to the root, or system application domain.
         */
        system: AXApplicationDomain;
        /**
         * Parent application domain.
         */
        parent: AXApplicationDomain;
        sec: ISecurityDomain;
        private _abcs;
        constructor(sec: AXSecurityDomain, parent: AXApplicationDomain);
        loadABC(abc: ABCFile): void;
        loadAndExecuteABC(abc: ABCFile): void;
        executeABC(abc: ABCFile): void;
        findClassInfo(name: string): ClassInfo;
        executeScript(scriptInfo: ScriptInfo): void;
        findProperty(mn: Multiname, strict: boolean, execute: boolean): AXGlobal;
        getClass(mn: Multiname): AXClass;
        getProperty(mn: Multiname, strict: boolean, execute: boolean): AXObject;
        findDefiningScript(mn: Multiname, execute: boolean): ScriptInfo;
        private _findDefiningScriptInABC(abc, mn, execute);
    }
}
declare module Shumway.AVM2.AS {
    class ASObject {
    }
    class ASNative extends ASObject {
    }
    class ASError extends ASObject {
    }
}
interface ISecurityDomain extends Shumway.AVMX.AXSecurityDomain {
    ObjectVector: typeof Shumway.AVMX.AS.GenericVector;
    Int32Vector: typeof Shumway.AVMX.AS.Int32Vector;
    Uint32Vector: typeof Shumway.AVMX.AS.Uint32Vector;
    Float64Vector: typeof Shumway.AVMX.AS.Float64Vector;
}
/**
 * Make Shumway bug-for-bug compatible with Tamarin.
 */
declare var as3Compatibility: boolean;
/**
 * AS3 has a bug when converting a certain character range to lower case.
 */
declare function as3ToLowerCase(value: string): string;
declare module Shumway.AVMX.AS {
    import Scope = Shumway.AVMX.Scope;
    import Multiname = Shumway.AVMX.Multiname;
    /**
     * Other natives can live in this module
     */
    module Natives {
        function print(sec: AXSecurityDomain, expression: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any): void;
        function debugBreak(v: any): void;
        function bugzilla(_: AXSecurityDomain, n: any): boolean;
        function decodeURI(sec: AXSecurityDomain, encodedURI: string): string;
        function decodeURIComponent(sec: AXSecurityDomain, encodedURI: string): string;
        function encodeURI(sec: AXSecurityDomain, uri: string): string;
        function encodeURIComponent(sec: AXSecurityDomain, uri: string): string;
        var isNaN: (number: number) => boolean;
        var isFinite: (number: number) => boolean;
        var parseInt: (s: string, radix?: number) => number;
        var parseFloat: (string: string) => number;
        var escape: (x: any) => any;
        var unescape: (x: any) => any;
        var isXMLName: (x: any) => boolean;
        var notImplemented: (x: any) => void;
        /**
         * Returns the fully qualified class name of an object.
         */
        function getQualifiedClassName(_: AXSecurityDomain, value: any): string;
        /**
         * Returns the fully qualified class name of the base class of the object specified by the
         * |value| parameter.
         */
        function getQualifiedSuperclassName(sec: AXSecurityDomain, value: any): string;
        /**
         * Returns the class with the specified name, or |null| if no such class exists.
         */
        function getDefinitionByName(sec: AXSecurityDomain, name: string): AXClass;
        function describeType(sec: AXSecurityDomain, value: any, flags: number): ASXML;
        function describeTypeJSON(sec: AXSecurityDomain, value: any, flags: number): any;
    }
    /**
     * Searches for natives using a string path "a.b.c...".
     */
    function getNative(path: string): Function;
    function makeMultiname(v: any, namespace?: Namespace): Multiname;
    function addPrototypeFunctionAlias(object: AXObject, name: string, fun: Function): void;
    function checkReceiverType(receiver: AXObject, type: AXClass, methodName: string): void;
    /**
     * MetaobjectProtocol base traps. Inherit some or all of these to
     * implement custom behaviour.
     */
    class ASObject implements IMetaobjectProtocol {
        traits: RuntimeTraits;
        sec: ISecurityDomain;
        static traits: RuntimeTraits;
        static dPrototype: ASObject;
        static tPrototype: ASObject;
        protected static _methodClosureCache: any;
        static classNatives: Object[];
        static instanceNatives: Object[];
        static sec: ISecurityDomain;
        static classSymbols: any;
        static instanceSymbols: any;
        static classInfo: ClassInfo;
        static axResolveMultiname: (mn: Multiname) => any;
        static axHasProperty: (mn: Multiname) => boolean;
        static axDeleteProperty: (mn: Multiname) => boolean;
        static axCallProperty: (mn: Multiname, argArray: any[], isLex: boolean) => any;
        static axCallSuper: (mn: Shumway.AVMX.Multiname, scope: Shumway.AVMX.Scope, argArray: any[]) => any;
        static axConstructProperty: (mn: Multiname, args: any[]) => any;
        static axHasPropertyInternal: (mn: Multiname) => boolean;
        static axHasOwnProperty: (mn: Multiname) => boolean;
        static axSetProperty: (mn: Multiname, value: any, bc: Bytecode) => void;
        static axInitProperty: (mn: Multiname, value: any) => void;
        static axGetProperty: (mn: Multiname) => any;
        static axGetMethod: (name: string) => AXFunction;
        static axGetSuper: (mn: Multiname, scope: Scope) => any;
        static axSetSuper: (mn: Multiname, scope: Scope, value: any) => void;
        static axEnumerableKeys: any[];
        static axGetEnumerableKeys: () => any[];
        static axHasPublicProperty: (nm: any) => boolean;
        static axSetPublicProperty: (nm: any, value: any) => void;
        static axGetPublicProperty: (nm: any) => any;
        static axCallPublicProperty: (nm: any, argArray: any[]) => any;
        static axDeletePublicProperty: (nm: any) => boolean;
        static axSetNumericProperty: (nm: number, value: any) => void;
        static axGetNumericProperty: (nm: number) => any;
        static axCoerce: (v: any) => any;
        static axConstruct: (argArray?: any[]) => any;
        static axNextNameIndex: (index: number) => number;
        static axNextName: (index: number) => any;
        static axNextValue: (index: number) => any;
        static axGetSlot: (i: number) => any;
        static axSetSlot: (i: number, value: any) => void;
        static axIsType: (value: any) => boolean;
        static getPrototypeOf: () => boolean;
        static native_isPrototypeOf: (nm: string) => boolean;
        static native_hasOwnProperty: (nm: string) => boolean;
        static native_propertyIsEnumerable: (nm: string) => boolean;
        static native_setPropertyIsEnumerable: (nm: string, enumerable?: boolean) => boolean;
        static classInitializer(): void;
        constructor();
        static _init(): void;
        static init(): void;
        static axClass: any;
        axClass: any;
        getPrototypeOf: () => any;
        native_isPrototypeOf(v: any): boolean;
        native_hasOwnProperty(nm: string): boolean;
        native_propertyIsEnumerable(nm: string): boolean;
        native_setPropertyIsEnumerable(nm: string, enumerable?: boolean): void;
        axResolveMultiname(mn: Multiname): any;
        axHasProperty(mn: Multiname): boolean;
        axHasPublicProperty(nm: any): boolean;
        axSetProperty(mn: Multiname, value: any, bc: Bytecode): void;
        axGetProperty(mn: Multiname): any;
        protected _methodClosureCache: any;
        axGetMethod(name: string): AXFunction;
        axGetSuper(mn: Multiname, scope: Scope): any;
        axSetSuper(mn: Multiname, scope: Scope, value: any): void;
        axDeleteProperty(mn: Multiname): any;
        axCallProperty(mn: Multiname, args: any[], isLex: boolean): any;
        axCallSuper(mn: Multiname, scope: Scope, args: any[]): any;
        axConstructProperty(mn: Multiname, args: any[]): any;
        axHasPropertyInternal(mn: Multiname): boolean;
        axHasOwnProperty(mn: Multiname): boolean;
        axGetEnumerableKeys(): any[];
        axGetPublicProperty(nm: any): any;
        axSetPublicProperty(nm: any, value: any): void;
        axCallPublicProperty(nm: any, argArray: any[]): any;
        axDeletePublicProperty(nm: any): boolean;
        axGetSlot(i: number): any;
        axSetSlot(i: number, value: any): void;
        /**
         * Gets the next name index of an object. Index |zero| is actually not an
         * index, but rather an indicator to start the iteration.
         */
        axNextNameIndex(index: number): number;
        /**
         * Gets the nextName after the specified |index|, which you would expect to
         * be index + 1, but it's actually index - 1;
         */
        axNextName(index: number): any;
        axNextValue(index: number): any;
        axSetNumericProperty(nm: number, value: any): void;
        axGetNumericProperty(nm: number): any;
        axEnumerableKeys: any[];
    }
    class ASClass extends ASObject {
        dPrototype: ASObject;
        tPrototype: ASObject;
        classNatives: Object[];
        instanceNatives: Object[];
        /**
         * Called on every class when it is initialized. The |axClass| object is passed in as |this|.
         */
        classInitializer: (asClass?: ASClass) => void;
        classSymbols: string[];
        instanceSymbols: string[];
        classInfo: ClassInfo;
        axCoerce(v: any): any;
        axConstruct: (argArray?: any[]) => any;
        axIsType: (value: any) => boolean;
        prototype: ASObject;
        static classInitializer: any;
    }
    class ASArray extends ASObject {
        static classInitializer(): void;
        constructor();
        native_hasOwnProperty(nm: string): boolean;
        native_propertyIsEnumerable(nm: string): boolean;
        $Bglength: number;
        value: any[];
        static axApply(self: ASArray, args: any[]): ASArray;
        static axConstruct(args: any[]): ASArray;
        push(): any;
        generic_push(): any;
        pop(): any;
        generic_pop(): any;
        shift(): any;
        generic_shift(): any;
        unshift(): any;
        generic_unshift(): any;
        reverse(): ASArray;
        generic_reverse(): any;
        concat(): any;
        generic_concat(): any;
        slice(startIndex: number, endIndex: number): any;
        generic_slice(startIndex: number, endIndex: number): any;
        splice(): any[];
        generic_splice(): any[];
        join(sep: string): string;
        generic_join(sep: string): any;
        toString(): string;
        generic_toString(): any;
        indexOf(value: any, fromIndex: number): number;
        generic_indexOf(value: any, fromIndex: number): any;
        lastIndexOf(value: any, fromIndex: number): number;
        generic_lastIndexOf(value: any, fromIndex: number): any;
        every(callbackfn: {
            value: Function;
        }, thisArg?: any): boolean;
        generic_every(callbackfn: {
            value: Function;
        }, thisArg?: any): any;
        some(callbackfn: {
            value;
        }, thisArg?: any): boolean;
        generic_some(callbackfn: {
            value;
        }, thisArg?: any): any;
        forEach(callbackfn: {
            value;
        }, thisArg?: any): void;
        generic_forEach(callbackfn: {
            value;
        }, thisArg?: any): any;
        map(callbackfn: {
            value;
        }, thisArg?: any): any;
        generic_map(callbackfn: {
            value;
        }, thisArg?: any): any;
        filter(callbackfn: {
            value: Function;
        }, thisArg?: any): any;
        generic_filter(callbackfn: {
            value: Function;
        }, thisArg?: any): any;
        toLocaleString(): string;
        sort(): any;
        generic_sort(): any;
        sortOn(names: any, options: any): any;
        generic_sortOn(): any;
        length: number;
        axGetEnumerableKeys(): any[];
        axHasPropertyInternal(mn: Multiname): boolean;
        axHasOwnProperty(mn: Multiname): boolean;
        axGetProperty(mn: Multiname): any;
        axSetProperty(mn: Multiname, value: any, bc: Bytecode): void;
        axDeleteProperty(mn: Multiname): any;
        axGetPublicProperty(nm: any): any;
        axSetPublicProperty(nm: string, value: any): void;
    }
    class ASFunction extends ASObject {
        static classInitializer(): void;
        private _prototype;
        private _prototypeInitialzed;
        protected value: AXCallable;
        protected receiver: {
            scope: Scope;
        };
        protected methodInfo: MethodInfo;
        axConstruct(args: any[]): any;
        axIsInstanceOf(obj: any): boolean;
        native_functionValue(): void;
        prototype: AXObject;
        length: number;
        toString(): string;
        call(thisArg: any): any;
        apply(thisArg: any, argArray?: ASArray): any;
        axCall(thisArg: any): any;
        axApply(thisArg: any, argArray?: any[]): any;
    }
    class ASMethodClosure extends ASFunction {
        static classInitializer(): void;
        static Create(receiver: AXObject, method: AXCallable): ASMethodClosure;
        prototype: AXObject;
        axCall(ignoredThisArg: any): any;
        axApply(ignoredThisArg: any, argArray?: any[]): any;
        call(ignoredThisArg: any): any;
        apply(ignoredThisArg: any, argArray?: ASArray): any;
    }
    class ASBoolean extends ASObject {
        static classInitializer(): void;
        value: boolean;
        toString(): string;
        valueOf(): boolean;
    }
    class ASString extends ASObject {
        static classNatives: any[];
        static classInitializer(): void;
        value: string;
        static fromCharCode(...charcodes: any[]): any;
        indexOf(char: string, i?: number): number;
        lastIndexOf(char: string, i?: number): number;
        charAt(index: number): string;
        charCodeAt(index: number): number;
        concat(): any;
        localeCompare(other: string): number;
        match(pattern: any): ASArray;
        replace(pattern: any, repl: any): string;
        search(pattern: any): number;
        slice(start?: number, end?: number): string;
        split(separator: any, limit?: number): any;
        substring(start: number, end?: number): string;
        substr(from: number, length?: number): string;
        toLocaleLowerCase(): string;
        toLowerCase(): string;
        toLocaleUpperCase(): string;
        toUpperCase(): string;
        generic_indexOf(char: string, i?: number): any;
        generic_lastIndexOf(char: string, i?: number): any;
        generic_charAt(index: number): any;
        generic_charCodeAt(index: number): any;
        generic_concat(): any;
        generic_localeCompare(other: string): any;
        generic_match(pattern: any): any;
        generic_replace(pattern: any, repl: any): any;
        generic_search(pattern: any): any;
        generic_slice(start?: number, end?: number): any;
        generic_split(separator: string, limit?: number): any;
        generic_substring(start: number, end?: number): any;
        generic_substr(from: number, length?: number): any;
        generic_toLowerCase(): string;
        generic_toUpperCase(): any;
        toString(): string;
        public_toString(): string;
        valueOf(): string;
        public_valueOf(): string;
        length: number;
    }
    class ASNumber extends ASObject {
        static classNatives: any[];
        static classInitializer(): void;
        value: number;
        toString(radix: number): string;
        valueOf(): number;
        toExponential(p: any): string;
        toPrecision(p: any): string;
        toFixed(p: any): string;
        static _minValue(): number;
        static convertStringToDouble(s: string): number;
    }
    class ASInt extends ASNumber {
        static staticNatives: any[];
        static instanceNatives: any[];
        static classInitializer(): void;
        toString(radix: number): string;
        valueOf(): number;
    }
    class ASUint extends ASNumber {
        static staticNatives: any[];
        static instanceNatives: any[];
        static classInitializer(): void;
        toString(radix: number): string;
        valueOf(): number;
    }
    class ASMath extends ASObject {
        static classNatives: any[];
        static classInitializer: any;
    }
    class ASRegExp extends ASObject {
        private static UNMATCHABLE_PATTERN;
        static classInitializer: any;
        value: RegExp;
        private _dotall;
        private _extended;
        private _source;
        private _captureNames;
        constructor(pattern: any, flags?: string);
        private _parse(pattern);
        ecmaToString(): string;
        axCall(ignoredThisArg: any): any;
        axApply(ignoredThisArg: any, argArray?: any[]): any;
        source: string;
        global: boolean;
        ignoreCase: boolean;
        multiline: boolean;
        lastIndex: number;
        dotall: boolean;
        extended: boolean;
        exec(str?: string): ASArray;
        test(str?: string): boolean;
    }
    class ASError extends ASObject {
        static getErrorMessage: typeof getErrorMessage;
        static throwError(type: ASClass, id: number): void;
        static classInitializer(asClass?: any): void;
        constructor(message: any, id: any);
        $Bgmessage: string;
        $Bgname: string;
        _errorID: number;
        toString(): string;
        errorID: number;
        getStackTrace(): string;
    }
    class ASDefinitionError extends ASError {
    }
    class ASEvalError extends ASError {
    }
    class ASRangeError extends ASError {
    }
    class ASReferenceError extends ASError {
    }
    class ASSecurityError extends ASError {
    }
    class ASSyntaxError extends ASError {
    }
    class ASTypeError extends ASError {
    }
    class ASURIError extends ASError {
    }
    class ASVerifyError extends ASError {
    }
    class ASUninitializedError extends ASError {
    }
    class ASArgumentError extends ASError {
    }
    class ASIOError extends ASError {
    }
    class ASEOFError extends ASError {
    }
    class ASMemoryError extends ASError {
    }
    class ASIllegalOperationError extends ASError {
    }
    /**
     * Transforms a JS value into an AS value.
     */
    function transformJSValueToAS(sec: AXSecurityDomain, value: any, deep: boolean): any;
    /**
     * Transforms an AS value into a JS value.
     */
    function transformASValueToJS(sec: AXSecurityDomain, value: any, deep: boolean): any;
    class ASJSON extends ASObject {
        static parse(text: string, reviver?: AXFunction): any;
        static stringify(value: any, replacer?: any, space?: any): string;
        private static computePropertyList(r);
        private static stringifySpecializedToString(value, replacerArray, replacerFunction, gap);
    }
    function initializeBuiltins(): void;
    function registerNativeClass(name: string, asClass: ASClass, alias?: string, nsType?: NamespaceType): void;
    function registerNativeFunction(path: string, fun: Function): void;
    function FlashUtilScript_getTimer(sec: AXSecurityDomain): number;
    function FlashNetScript_navigateToURL(sec: AXSecurityDomain, request: any, window_: any): void;
    function getNativesForTrait(trait: TraitInfo): Object[];
    function getNativeInitializer(classInfo: ClassInfo): AXCallable;
    /**
     * Searches for a native property in a list of native holders.
     */
    function getMethodOrAccessorNative(trait: TraitInfo): any;
    function tryLinkNativeClass(axClass: AXClass): void;
    /**
     * Installs class loaders for all the previously registered native classes.
     */
    function installClassLoaders(applicationDomain: AXApplicationDomain, container: Object): void;
    /**
     * Installs all the previously registered native functions on the AXSecurityDomain.
     *
     * Note that this doesn't use memoizers and doesn't run the functions' AS3 script.
     */
    function installNativeFunctions(sec: AXSecurityDomain): void;
}
declare module Shumway.AVMX.AS {
    class BaseVector extends ASObject {
        axGetProperty(mn: Multiname): any;
        axSetProperty(mn: Multiname, value: any, bc: Bytecode): void;
        axGetPublicProperty(nm: any): any;
        axSetPublicProperty(nm: any, value: any): void;
        axNextName(index: number): any;
        /**
         * Throws exceptions for the cases where Flash does, and returns false if the callback
         * is null or undefined. In that case, the calling function returns its default value.
         */
        checkVectorMethodArgs(callback: AXCallable, thisObject: any): boolean;
    }
    class Vector extends ASObject {
        static axIsType(x: AXObject): boolean;
    }
    class GenericVector extends BaseVector {
        static axClass: typeof GenericVector;
        static CASEINSENSITIVE: number;
        static DESCENDING: number;
        static UNIQUESORT: number;
        static RETURNINDEXEDARRAY: number;
        static NUMERIC: number;
        static classInitializer(): void;
        static axApply(_: AXObject, args: any[]): any;
        static defaultCompareFunction(a: any, b: any): number;
        static compare(a: any, b: any, options: any, compareFunction: any): number;
        axClass: AXClass;
        static type: AXClass;
        static defaultValue: any;
        private _fixed;
        private _buffer;
        constructor(length?: number, fixed?: boolean);
        private _fill(index, length, value);
        /**
         * Can't use Array.prototype.toString because it doesn't print |null|s the same way as AS3.
         */
        toString(): string;
        toLocaleString(): string;
        sort(sortBehavior?: any): GenericVector;
        /**
         * Executes a |callback| function with three arguments: element, index, the vector itself as
         * well as passing the |thisObject| as |this| for each of the elements in the vector. If any of
         * the callbacks return |false| the function terminates, otherwise it returns |true|.
         */
        every(callback: AXCallable, thisObject: Object): boolean;
        /**
         * Filters the elements for which the |callback| method returns |true|. The |callback| function
         * is called with three arguments: element, index, the vector itself as well as passing the
         * |thisObject| as |this| for each of the elements in the vector.
         */
        filter(callback: any, thisObject: any): GenericVector;
        map(callback: any, thisObject: any): GenericVector;
        some(callback: any, thisObject: any): boolean;
        forEach(callback: any, thisObject: any): void;
        join(separator?: string): string;
        indexOf(searchElement: any, fromIndex?: number): number;
        lastIndexOf(searchElement: any, fromIndex?: number): number;
        push(arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any, arg6?: any, arg7?: any, arg8?: any): void;
        pop(): any;
        concat(): any;
        reverse(): GenericVector;
        _coerce(v: any): any;
        shift(): any;
        unshift(): void;
        slice(start?: number, end?: number): GenericVector;
        splice(start: number, deleteCount_: number): GenericVector;
        length: number;
        fixed: boolean;
        _checkFixed(): void;
        axGetNumericProperty(nm: number): any;
        axSetNumericProperty(nm: number, v: any): void;
        axHasPropertyInternal(mn: Multiname): boolean;
        axNextValue(index: number): any;
        axNextNameIndex(index: number): number;
    }
}
/**
 * TypedArray Vector Template
 *
 * If you make any changes to this code you'll need to regenerate uint32Vector.ts &
 * float64Vector.ts. We duplicate all the code for vectors because we want to keep things
 * monomorphic as much as possible.
 *
 * NOTE: Not all of the AS3 methods need to be implemented natively, some are self-hosted in AS3
 * code. For better performance we should probably implement them all natively (in JS that is)
 * unless our compiler is good enough.
 */
declare module Shumway.AVMX.AS {
    class Int32Vector extends BaseVector {
        static axClass: typeof Int32Vector;
        static EXTRA_CAPACITY: number;
        static INITIAL_CAPACITY: number;
        static DEFAULT_VALUE: number;
        static DESCENDING: number;
        static UNIQUESORT: number;
        static RETURNINDEXEDARRAY: number;
        static classInitializer(): void;
        private _fixed;
        private _buffer;
        private _length;
        private _offset;
        constructor(length?: number, fixed?: boolean);
        static axApply(_: AXObject, args: any[]): any;
        internalToString(): string;
        toString(): string;
        toLocaleString(): string;
        _view(): Int32Array;
        _ensureCapacity(length: any): void;
        concat(): Int32Vector;
        /**
         * Executes a |callback| function with three arguments: element, index, the vector itself as
         * well as passing the |thisObject| as |this| for each of the elements in the vector. If any of
         * the callbacks return |false| the function terminates, otherwise it returns |true|.
         */
        every(callback: any, thisObject: any): boolean;
        /**
         * Filters the elements for which the |callback| method returns |true|. The |callback| function
         * is called with three arguments: element, index, the vector itself as well as passing the
         * |thisObject| as |this| for each of the elements in the vector.
         */
        filter(callback: any, thisObject: any): Int32Vector;
        map(callback: any, thisObject: any): GenericVector;
        some(callback: any, thisObject: any): boolean;
        forEach(callback: any, thisObject: any): void;
        join(separator?: string): string;
        indexOf(searchElement: any, fromIndex?: number): number;
        lastIndexOf(searchElement: any, fromIndex?: number): number;
        push(arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any, arg6?: any, arg7?: any, arg8?: any): void;
        pop(): number;
        reverse(): Int32Vector;
        sort(sortBehavior?: any): Int32Vector;
        shift(): number;
        unshift(): void;
        slice(start?: number, end?: number): Int32Vector;
        splice(start: number, deleteCount_: number): Int32Vector;
        _slide(distance: any): void;
        length: number;
        fixed: boolean;
        _checkFixed(): void;
        axGetNumericProperty(nm: number): number;
        axSetNumericProperty(nm: number, v: any): void;
        axHasPropertyInternal(mn: Multiname): boolean;
        axNextValue(index: number): any;
        axNextNameIndex(index: number): number;
    }
}
/**
 * TypedArray Vector Template
 *
 * If you make any changes to this code you'll need to regenerate uint32Vector.ts &
 * float64Vector.ts. We duplicate all the code for vectors because we want to keep things
 * monomorphic as much as possible.
 *
 * NOTE: Not all of the AS3 methods need to be implemented natively, some are self-hosted in AS3
 * code. For better performance we should probably implement them all natively (in JS that is)
 * unless our compiler is good enough.
 */
declare module Shumway.AVMX.AS {
    class Uint32Vector extends BaseVector {
        static axClass: typeof Uint32Vector;
        static EXTRA_CAPACITY: number;
        static INITIAL_CAPACITY: number;
        static DEFAULT_VALUE: number;
        static DESCENDING: number;
        static UNIQUESORT: number;
        static RETURNINDEXEDARRAY: number;
        static classInitializer(): void;
        private _fixed;
        private _buffer;
        private _length;
        private _offset;
        constructor(length?: number, fixed?: boolean);
        static axApply(_: AXObject, args: any[]): any;
        internalToString(): string;
        toString(): string;
        toLocaleString(): string;
        _view(): Uint32Array;
        _ensureCapacity(length: any): void;
        concat(): Uint32Vector;
        /**
         * Executes a |callback| function with three arguments: element, index, the vector itself as
         * well as passing the |thisObject| as |this| for each of the elements in the vector. If any of
         * the callbacks return |false| the function terminates, otherwise it returns |true|.
         */
        every(callback: any, thisObject: any): boolean;
        /**
         * Filters the elements for which the |callback| method returns |true|. The |callback| function
         * is called with three arguments: element, index, the vector itself as well as passing the
         * |thisObject| as |this| for each of the elements in the vector.
         */
        filter(callback: any, thisObject: any): Uint32Vector;
        map(callback: any, thisObject: any): GenericVector;
        some(callback: any, thisObject: any): boolean;
        forEach(callback: any, thisObject: any): void;
        join(separator?: string): string;
        indexOf(searchElement: any, fromIndex?: number): number;
        lastIndexOf(searchElement: any, fromIndex?: number): number;
        push(arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any, arg6?: any, arg7?: any, arg8?: any): void;
        pop(): number;
        reverse(): Uint32Vector;
        sort(sortBehavior?: any): Uint32Vector;
        shift(): number;
        unshift(): void;
        slice(start?: number, end?: number): Uint32Vector;
        splice(start: number, deleteCount_: number): Uint32Vector;
        _slide(distance: any): void;
        length: number;
        fixed: boolean;
        _checkFixed(): void;
        axGetNumericProperty(nm: number): number;
        axSetNumericProperty(nm: number, v: any): void;
        axHasPropertyInternal(mn: Multiname): boolean;
        axNextValue(index: number): any;
        axNextNameIndex(index: number): number;
    }
}
/**
 * TypedArray Vector Template
 *
 * If you make any changes to this code you'll need to regenerate uint32Vector.ts &
 * float64Vector.ts. We duplicate all the code for vectors because we want to keep things
 * monomorphic as much as possible.
 *
 * NOTE: Not all of the AS3 methods need to be implemented natively, some are self-hosted in AS3
 * code. For better performance we should probably implement them all natively (in JS that is)
 * unless our compiler is good enough.
 */
declare module Shumway.AVMX.AS {
    class Float64Vector extends BaseVector {
        static axClass: typeof Float64Vector;
        static EXTRA_CAPACITY: number;
        static INITIAL_CAPACITY: number;
        static DEFAULT_VALUE: number;
        static DESCENDING: number;
        static UNIQUESORT: number;
        static RETURNINDEXEDARRAY: number;
        static classInitializer(): void;
        private _fixed;
        private _buffer;
        private _length;
        private _offset;
        constructor(length?: number, fixed?: boolean);
        static axApply(_: AXObject, args: any[]): any;
        internalToString(): string;
        toString(): string;
        toLocaleString(): string;
        _view(): Float64Array;
        _ensureCapacity(length: any): void;
        concat(): Float64Vector;
        /**
         * Executes a |callback| function with three arguments: element, index, the vector itself as
         * well as passing the |thisObject| as |this| for each of the elements in the vector. If any of
         * the callbacks return |false| the function terminates, otherwise it returns |true|.
         */
        every(callback: any, thisObject: any): boolean;
        /**
         * Filters the elements for which the |callback| method returns |true|. The |callback| function
         * is called with three arguments: element, index, the vector itself as well as passing the
         * |thisObject| as |this| for each of the elements in the vector.
         */
        filter(callback: any, thisObject: any): Float64Vector;
        map(callback: any, thisObject: any): GenericVector;
        some(callback: any, thisObject: any): boolean;
        forEach(callback: any, thisObject: any): void;
        join(separator?: string): string;
        indexOf(searchElement: any, fromIndex?: number): number;
        lastIndexOf(searchElement: any, fromIndex?: number): number;
        push(arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any, arg6?: any, arg7?: any, arg8?: any): void;
        pop(): number;
        reverse(): Float64Vector;
        sort(sortBehavior?: any): Float64Vector;
        shift(): number;
        unshift(): void;
        slice(start?: number, end?: number): Float64Vector;
        splice(start: number, deleteCount_: number): Float64Vector;
        _slide(distance: any): void;
        length: number;
        fixed: boolean;
        _checkFixed(): void;
        axGetNumericProperty(nm: number): number;
        axSetNumericProperty(nm: number, v: any): void;
        axHasPropertyInternal(mn: Multiname): boolean;
        axNextValue(index: number): any;
        axNextNameIndex(index: number): number;
    }
}
declare module Shumway.AVMX.AS {
    function isXMLType(val: any, sec: AXSecurityDomain): boolean;
    function isXMLCollection(sec: AXSecurityDomain, val: any): boolean;
    function escapeElementValue(sec: AXSecurityDomain, s: any): string;
    function escapeAttributeValue(s: string): string;
    function isXMLName(v: any, sec: AXSecurityDomain): boolean;
    const enum XMLParserErrorCode {
        NoError = 0,
        EndOfDocument = -1,
        UnterminatedCdat = -2,
        UnterminatedXmlDeclaration = -3,
        UnterminatedDoctypeDeclaration = -4,
        UnterminatedComment = -5,
        MalformedElement = -6,
        OutOfMemory = -7,
        UnterminatedAttributeValue = -8,
        UnterminatedElement = -9,
        ElementNeverBegun = -10,
    }
    class XMLParserBase {
        constructor();
        private resolveEntities(s);
        private parseContent(s, start);
        private parseProcessingInstruction(s, start);
        parseXml(s: string): void;
        onPi(name: string, value: string): void;
        onComment(text: string): void;
        onCdata(text: string): void;
        onDoctype(doctypeContent: string): void;
        onText(text: string): void;
        onBeginElement(name: string, attributes: {
            name: string;
            value: string;
        }[], isEmpty: boolean): void;
        onEndElement(name: string): void;
        onError(code: XMLParserErrorCode): void;
    }
    class XMLParser extends XMLParserBase {
        sec: AXSecurityDomain;
        private currentElement;
        private elementsStack;
        private scopes;
        constructor(sec: AXSecurityDomain);
        private isWhitespacePreserved();
        private lookupDefaultNs();
        private lookupNs(prefix);
        private getName(name, resolveDefaultNs);
        onError(code: XMLParserErrorCode): void;
        onPi(name: string, value: string): void;
        onComment(text: string): void;
        onCdata(text: string): void;
        onDoctype(doctypeContent: string): void;
        onText(text: string): void;
        onBeginElement(name: string, contentAttributes: {
            name: string;
            value: string;
        }[], isEmpty: boolean): void;
        onEndElement(name: string): void;
        beginElement(name: any, attrs: any, namespaces: Namespace[], isEmpty: boolean): void;
        endElement(name: any): void;
        text(text: any, isWhitespacePreserve: any): void;
        cdata(text: any): void;
        comment(text: any): void;
        pi(name: any, value: any): void;
        doctype(text: any): void;
        parseFromString(s: any, mimeType?: any): ASXML;
    }
    class ASNamespace extends ASObject implements XMLType {
        static instanceConstructor: any;
        static classInitializer(): void;
        _ns: Namespace;
        /**
         * 13.2.1 The Namespace Constructor Called as a Function
         *
         * Namespace ()
         * Namespace (uriValue)
         * Namespace (prefixValue, uriValue)
         */
        static axApply(self: ASNamespace, args: any[]): ASNamespace;
        static Create(uriOrPrefix_: any, uri_: any): ASNamespace;
        static FromNamespace(ns: Namespace): ASNamespace;
        static defaultNamespace: Namespace;
        axInitializer: (uriOrPrefix_?: any, uri_?: any) => any;
        /**
         * 13.2.2 The Namespace Constructor
         *
         * Namespace ()
         * Namespace (uriValue)
         * Namespace (prefixValue, uriValue)
         */
        constructor(uriOrPrefix_?: any, uri_?: any);
        equals(other: any): boolean;
        prefix: any;
        uri: string;
        toString(): string;
        valueOf(): string;
    }
    class ASQName extends ASObject implements XMLType {
        static classInitializer(): void;
        static Create(nameOrNS_: any, name_?: any, isAttribute?: boolean): ASQName;
        static FromMultiname(mn: Multiname): ASQName;
        axInitializer: (nameOrNS_?: any, name_?: any) => any;
        /**
         * 13.3.1 The QName Constructor Called as a Function
         *
         * QName ( )
         * QName ( Name )
         * QName ( Namespace , Name )
         */
        static axApply(self: ASNamespace, args: any[]): ASQName;
        name: Multiname;
        /**
         * 13.3.2 The QName Constructor
         *
         * new QName ()
         * new QName (Name)
         * new QName (Namespace, Name)
         */
        constructor(nameOrNS_?: any, name_?: any);
        equals(other: any): boolean;
        localName: string;
        uri: string;
        ecmaToString(): string;
        toString(): any;
        valueOf(): ASQName;
        /**
         * 13.3.5.3 [[Prefix]]
         * The [[Prefix]] property is an optional internal property that is not directly visible to
         * users. It may be used by implementations that preserve prefixes in qualified names. The
         * value of the [[Prefix]] property is a value of type string or undefined. If the [[Prefix]]
         * property is undefined, the prefix associated with this QName is unknown.
         */
        prefix: string;
    }
    const enum ASXMLKind {
        Element = 1,
        Attribute = 2,
        Text = 3,
        Comment = 4,
        ProcessingInstruction = 5,
    }
    interface XMLType {
        equals(other: any): boolean;
        axClass: any;
    }
    class ASXML extends ASObject implements XMLType {
        static instanceConstructor: any;
        static classInitializer(): void;
        static Create(value?: any): ASXML;
        static resetSettings(): void;
        axInitializer: (value?: any) => any;
        static native_settings(): Object;
        static native_setSettings(o: any): void;
        static native_defaultSettings(): Object;
        private static _flags;
        private static _prettyIndent;
        _attributes: ASXML[];
        _inScopeNamespaces: Namespace[];
        _kind: ASXMLKind;
        _name: Multiname;
        _value: any;
        _parent: ASXML;
        _children: ASXML[];
        static axApply(self: ASXML, args: any[]): ASXML;
        constructor(value?: any);
        valueOf(): ASXML;
        equals(other: any): boolean;
        init(kind: number, mn: Multiname): ASXML;
        _deepEquals(V: XMLType): boolean;
        _deepCopy(): ASXML;
        resolveValue(): ASXML;
        _addInScopeNamespace(ns: Namespace): void;
        static ignoreComments: boolean;
        static ignoreProcessingInstructions: boolean;
        static ignoreWhitespace: boolean;
        static prettyPrinting: boolean;
        static prettyIndent: number;
        toString(): string;
        native_hasOwnProperty(P: string): boolean;
        native_propertyIsEnumerable(P?: any): boolean;
        addNamespace(ns: any): ASXML;
        appendChild(child: any): ASXML;
        attribute(arg: any): ASXMLList;
        attributes(): ASXMLList;
        child(propertyName: any): ASXMLList;
        childIndex(): number;
        children(): ASXMLList;
        comments(): ASXMLList;
        contains(value: any): boolean;
        copy(): ASXML;
        descendants(name: any): ASXMLList;
        elements(name: any): ASXMLList;
        hasComplexContent(): boolean;
        hasSimpleContent(): boolean;
        inScopeNamespaces(): ASNamespace[];
        private _inScopeNamespacesImpl();
        insertChildAfter(child1: any, child2: any): any;
        insertChildBefore(child1: any, child2: any): any;
        length(): number;
        localName(): Object;
        name(): Object;
        namespace(prefix?: string): any;
        namespaceDeclarations(): any[];
        nodeKind(): string;
        normalize(): ASXML;
        private removeByIndex(index);
        parent(): any;
        processingInstructions(name: any): ASXMLList;
        processingInstructionsInto(name: Multiname, list: ASXMLList): ASXMLList;
        prependChild(child: any): ASXML;
        removeNamespace(ns: any): ASXML;
        replace(propertyName: any, value: any): ASXML;
        _replaceByIndex(p: number, v: any): ASXML;
        setChildren(value: any): ASXML;
        setLocalName(name_: any): void;
        setName(name_: any): void;
        setNamespace(ns: any): void;
        text(): ASXMLList;
        toXMLString(): string;
        private toXMLStringImpl(ancestorNamespaces?, indentLevel?);
        toJSON(k: string): string;
        axGetEnumerableKeys(): any[];
        setProperty(mn: Multiname, v: any): void;
        axSetProperty(mn: Multiname, value: any, bc: Bytecode): void;
        getProperty(mn: Multiname): any;
        axGetProperty(mn: Multiname): any;
        hasProperty(mn: Multiname): boolean;
        deleteProperty(mn: Multiname): boolean;
        axHasProperty(mn: Multiname): boolean;
        axHasPropertyInternal(mn: Multiname): boolean;
        axDeleteProperty(mn: Multiname): boolean;
        axCallProperty(mn: Multiname, args: any[]): any;
        _delete(key: any, isMethod: any): void;
        deleteByIndex(p: number): void;
        insert(p: number, v: any): void;
        addInScopeNamespace(ns: Namespace): void;
        descendantsInto(name: Multiname, xl: ASXMLList): ASXMLList;
    }
    class ASXMLList extends ASObject implements XMLType {
        static instanceConstructor: any;
        static classInitializer(): void;
        static axApply(self: ASXMLList, args: any[]): ASXMLList;
        static addXML(left: ASXMLList, right: ASXMLList): ASXMLList;
        _children: ASXML[];
        _targetObject: any;
        _targetProperty: Multiname;
        static Create(value?: any): ASXMLList;
        axInitializer: (value?: any) => any;
        constructor(value?: any);
        static CreateList(targetObject: AS.ASXML, targetProperty: Multiname): ASXMLList;
        valueOf(): ASXMLList;
        equals(other: any): boolean;
        toString(): string;
        _deepCopy(): ASXMLList;
        _shallowCopy(): ASXMLList;
        native_hasOwnProperty(P: string): boolean;
        native_propertyIsEnumerable(P: any): boolean;
        attribute(arg: any): ASXMLList;
        attributes(): ASXMLList;
        child(propertyName: any): ASXMLList;
        children(): ASXMLList;
        descendants(name_: any): ASXMLList;
        comments(): ASXMLList;
        contains(value: any): boolean;
        copy(): ASXMLList;
        elements(name: any): ASXMLList;
        hasComplexContent(): boolean;
        hasSimpleContent(): boolean;
        length(): number;
        name(): Object;
        normalize(): ASXMLList;
        parent(): any;
        processingInstructions(name_: any): ASXMLList;
        text(): ASXMLList;
        toXMLString(): string;
        toJSON(k: string): string;
        addNamespace(ns: any): ASXML;
        appendChild(child: any): ASXML;
        append(V: any): void;
        childIndex(): number;
        inScopeNamespaces(): any[];
        insertChildAfter(child1: any, child2: any): any;
        insertChildBefore(child1: any, child2: any): any;
        nodeKind(): string;
        namespace(prefix: string): any;
        localName(): Object;
        namespaceDeclarations(): any[];
        prependChild(value: any): ASXML;
        removeNamespace(ns: any): ASXML;
        replace(propertyName: any, value: any): ASXML;
        setChildren(value: any): ASXML;
        setLocalName(name: any): void;
        setName(name: any): void;
        setNamespace(ns: any): void;
        axGetEnumerableKeys(): any[];
        getProperty(mn: Multiname): any;
        axGetProperty(mn: Multiname): any;
        axGetPublicProperty(nm: any): any;
        hasProperty(mn: Multiname): boolean;
        axHasProperty(mn: Multiname): boolean;
        axHasPropertyInternal(mn: Multiname): boolean;
        resolveValue(): ASXMLList;
        setProperty(mn: Multiname, value: any): void;
        axSetProperty(mn: Multiname, value: any, bc: Bytecode): void;
        axDeleteProperty(mn: Multiname): boolean;
        private removeByIndex(index);
        axCallProperty(mn: Multiname, args: any[]): any;
    }
}
/**
 * Copyright 2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
declare module Shumway.AVMX.AS.flash.xml {
    class XMLNode extends ASObject {
        constructor(type: number, value: string);
        static escapeXML(value: string): string;
        nodeType: number;
        previousSibling: flash.xml.XMLNode;
        nextSibling: flash.xml.XMLNode;
        parentNode: flash.xml.XMLNode;
        firstChild: flash.xml.XMLNode;
        lastChild: flash.xml.XMLNode;
        childNodes: any[];
        _childNodes: any[];
        attributes: ASObject;
        _attributes: ASObject;
        nodeName: string;
        nodeValue: string;
        init: (type: number, value: string) => void;
        hasChildNodes: () => boolean;
        cloneNode: (deep: boolean) => flash.xml.XMLNode;
        removeNode: () => void;
        insertBefore: (node: flash.xml.XMLNode, before: flash.xml.XMLNode) => void;
        appendChild: (node: flash.xml.XMLNode) => void;
        getNamespaceForPrefix: (prefix: string) => string;
        getPrefixForNamespace: (ns: string) => string;
        localName: string;
        prefix: string;
        namespaceURI: string;
    }
    class XMLDocument extends flash.xml.XMLNode {
        constructor(text?: string);
        xmlDecl: ASObject;
        docTypeDecl: ASObject;
        idMap: ASObject;
        ignoreWhite: boolean;
        createElement: (name: string) => flash.xml.XMLNode;
        createTextNode: (text: string) => flash.xml.XMLNode;
        parseXML: (source: string) => void;
    }
    class XMLTag extends ASObject {
        constructor();
        private _type;
        private _value;
        private _empty;
        private _attrs;
        type: number;
        empty: boolean;
        value: string;
        attrs: ASObject;
    }
    class XMLNodeType extends ASObject {
        constructor();
    }
    class XMLParser extends ASObject {
        constructor();
        private queue;
        startParse(source: string, ignoreWhite: boolean): void;
        getNext(tag: flash.xml.XMLTag): number;
    }
}
declare module Shumway.AVMX.AS {
    function describeTypeJSON(sec: AXSecurityDomain, o: any, flags: number): any;
    function describeType(sec: AXSecurityDomain, value: any, flags: number): ASXML;
}
declare module Shumway.AVMX.AS {
    module flash.utils {
        /**
         * TODO: We need a more robust Dictionary implementation that doesn't only give you back
         * string keys when enumerating.
         */
        class Dictionary extends ASObject {
            static classInitializer: any;
            private map;
            private keys;
            private weakKeys;
            private primitiveMap;
            constructor(weakKeys?: boolean);
            static makePrimitiveKey(key: any): string | number;
            toJSON(): string;
            axGetProperty(mn: Multiname): any;
            axSetProperty(mn: Multiname, value: any, bc: Bytecode): void;
            axHasPropertyInternal(mn: Multiname): boolean;
            axDeleteProperty(mn: Multiname): any;
            axGetPublicProperty(nm: any): any;
            axGetEnumerableKeys(): any[];
        }
    }
}
declare module Shumway.AVMX.AS {
    module flash.utils {
        /**
         * The Proxy class lets you override the default behavior of ActionScript operations
         * (such as retrieving and modifying properties) on an object.
         */
        class ASProxy extends ASObject {
            static classInitializer(): void;
            native_getProperty(): void;
            native_setProperty(): void;
            native_callProperty(): void;
            native_hasProperty(): void;
            native_deleteProperty(): void;
            native_getDescendants(): void;
            native_nextNameIndex(): void;
            native_nextName(): void;
            native_nextValue(): void;
            axGetProperty(mn: Multiname): any;
            axGetNumericProperty(name: number): any;
            axSetNumericProperty(name: number, value: any): void;
            axSetProperty(mn: Multiname, value: any, bc: Bytecode): void;
            axCallProperty(mn: Multiname, args: any[], isLex: boolean): any;
            axHasProperty(mn: Multiname): any;
            axHasPublicProperty(nm: string): any;
            axHasOwnProperty(mn: Multiname): any;
            axDeleteProperty(mn: Multiname): any;
            axNextName(index: number): any;
            axNextValue(index: number): any;
            axNextNameIndex(index: number): number;
        }
    }
}
declare module Shumway.AVMX.AS {
    class ASDate extends ASObject {
        value: Date;
        static classInitializer: any;
        static parse(date: string): number;
        static UTC(year: number, month: number, date?: number, hour?: number, minute?: number, second?: number, millisecond?: number): any;
        static axCoerce(value: any): any;
        constructor(yearOrTimevalue: any, month: number, date?: number, hour?: number, minute?: number, second?: number, millisecond?: number);
        toString(): string;
        toDateString(): string;
        toJSON(): string;
        valueOf(): number;
        setTime(value?: number): number;
        toTimeString(): string;
        toLocaleString(): string;
        toLocaleDateString(): string;
        toLocaleTimeString(): string;
        toUTCString(): string;
        getUTCFullYear(): number;
        getUTCMonth(): number;
        getUTCDate(): number;
        getUTCDay(): number;
        getUTCHours(): number;
        getUTCMinutes(): number;
        getUTCSeconds(): number;
        getUTCMilliseconds(): number;
        getFullYear(): number;
        getMonth(): number;
        getDate(): number;
        getDay(): number;
        getHours(): number;
        getMinutes(): number;
        getSeconds(): number;
        getMilliseconds(): number;
        getTimezoneOffset(): number;
        getTime(): number;
        setFullYear(year: number, month: number, date: number): any;
        setMonth(month: number, date: number): any;
        setDate(date: number): any;
        setHours(hour: number, minutes: number, seconds: number, milliseconds: number): any;
        setMinutes(minutes: number, seconds: number, milliseconds: number): any;
        setSeconds(seconds: number, milliseconds: number): any;
        setMilliseconds(milliseconds: number): any;
        setUTCFullYear(year: number, month: number, date: number): any;
        setUTCMonth(month: number, date: number): any;
        setUTCDate(date: number): any;
        setUTCHours(hour: number, minutes: number, seconds: number, milliseconds: number): any;
        setUTCMinutes(minutes: number, seconds: number, milliseconds: number): any;
        setUTCSeconds(seconds: number, milliseconds: number): any;
        setUTCMilliseconds(milliseconds: number): any;
        fullYear: number;
        month: number;
        date: number;
        hours: number;
        minutes: number;
        seconds: number;
        milliseconds: number;
        fullYearUTC: number;
        monthUTC: number;
        dateUTC: number;
        hoursUTC: number;
        minutesUTC: number;
        secondsUTC: number;
        millisecondsUTC: number;
        time: number;
        timezoneOffset: number;
        day: number;
        dayUTC: number;
    }
}
declare module Shumway.AVMX.AS {
    module flash.net {
        enum AMFEncoding {
            AMF0 = 0,
            AMF3 = 3,
            DEFAULT = 3,
        }
        class ObjectEncoding extends ASObject {
            static AMF0: AMFEncoding;
            static AMF3: AMFEncoding;
            static DEFAULT: AMFEncoding;
            static dynamicPropertyWriter: any;
        }
    }
    module flash.utils {
        interface IDataInput {
            readBytes: (bytes: flash.utils.ByteArray, offset?: number, length?: number) => void;
            readBoolean: () => boolean;
            readByte: () => number;
            readUnsignedByte: () => number;
            readShort: () => number;
            readUnsignedShort: () => number;
            readInt: () => number;
            readUnsignedInt: () => number;
            readFloat: () => number;
            readDouble: () => number;
            readMultiByte: (length: number, charSet: string) => string;
            readUTF: () => string;
            readUTFBytes: (length: number) => string;
            bytesAvailable: number;
            readObject: () => any;
            objectEncoding: number;
            endian: string;
        }
        interface IDataOutput {
            writeBytes: (bytes: flash.utils.ByteArray, offset?: number, length?: number) => void;
            writeBoolean: (value: boolean) => void;
            writeByte: (value: number) => void;
            writeShort: (value: number) => void;
            writeInt: (value: number) => void;
            writeUnsignedInt: (value: number) => void;
            writeFloat: (value: number) => void;
            writeDouble: (value: number) => void;
            writeMultiByte: (value: string, charSet: string) => void;
            writeUTF: (value: string) => void;
            writeUTFBytes: (value: string) => void;
            writeObject: (object: any) => void;
            objectEncoding: number;
            endian: string;
        }
        class ByteArray extends ASObject implements IDataInput, IDataOutput {
            static axClass: typeof ByteArray;
            static classNatives: any[];
            static instanceNatives: any[];
            static classInitializer(): void;
            _symbol: {
                buffer: Uint8Array;
                byteLength: number;
            };
            constructor(source?: any);
            private static INITIAL_SIZE;
            private static _defaultObjectEncoding;
            static defaultObjectEncoding: number;
            toJSON(): string;
            private _buffer;
            private _length;
            private _position;
            private _littleEndian;
            private _objectEncoding;
            private _bitBuffer;
            private _bitLength;
            private _resetViews;
            readBytes: (bytes: flash.utils.ByteArray, offset?: number, length?: number) => void;
            readBoolean: () => boolean;
            readByte: () => number;
            readUnsignedByte: () => number;
            readShort: () => number;
            readUnsignedShort: () => number;
            readInt: () => number;
            readUnsignedInt: () => number;
            readFloat: () => number;
            readDouble: () => number;
            readMultiByte: (length: number, charSet: string) => string;
            readUTF: () => string;
            readUTFBytes: (length: number) => string;
            bytesAvailable: number;
            readObject(): any;
            writeBytes: (bytes: flash.utils.ByteArray, offset?: number, length?: number) => void;
            writeBoolean: (value: boolean) => void;
            writeByte: (value: number) => void;
            writeShort: (value: number) => void;
            writeInt: (value: number) => void;
            writeUnsignedInt: (value: number) => void;
            writeFloat: (value: number) => void;
            writeDouble: (value: number) => void;
            writeMultiByte: (value: string, charSet: string) => void;
            writeUTF: (value: string) => void;
            writeUTFBytes: (value: string) => void;
            writeObject(object: any): void;
            getBytes: () => Uint8Array;
            objectEncoding: number;
            endian: string;
            readRawBytes: () => Int8Array;
            writeRawBytes: (bytes: Uint8Array) => void;
            position: number;
            length: number;
            axGetPublicProperty(nm: any): any;
            axGetNumericProperty(nm: number): any;
            axSetPublicProperty(nm: any, value: any): void;
            axSetNumericProperty(nm: number, value: any): void;
            axGetProperty(mn: Multiname): any;
            axSetProperty(mn: Multiname, value: any, bc: Bytecode): void;
        }
    }
}
declare module Shumway.AVMX.AS {
    module flash.system {
        class IME extends ASObject {
            constructor();
            static enabled: boolean;
            static conversionMode: string;
            static setCompositionString(composition: string): void;
            static doConversion(): void;
            static compositionSelectionChanged(start: number, end: number): void;
            static compositionAbandoned(): void;
            static isSupported: boolean;
        }
        class System extends ASObject {
            private static _useCodePage;
            static classInitializer(): void;
            static ime: flash.system.IME;
            static setClipboard(string: string): void;
            static totalMemoryNumber: number;
            static freeMemory: number;
            static privateMemory: number;
            static useCodePage: boolean;
            static vmVersion: string;
            static pause(): void;
            static resume(): void;
            static exit(code: number): void;
            static gc(): void;
            static pauseForGCIfCollectionImminent(imminence?: number): void;
            static disposeXML(node: ASXML): void;
            static swfVersion: number;
            static apiVersion: number;
            static getArgv(): any[];
            static getRunmode(): string;
        }
        var OriginalSystem: typeof System;
    }
}
/**
 * This file implements the AMF0 and AMF3 serialization protocols secified in:
 * http://wwwimages.adobe.com/www.adobe.com/content/dam/Adobe/en/devnet/amf/pdf/amf-file-format-spec.pdf
 */
declare module Shumway.AVMX {
    import ByteArray = Shumway.AVMX.AS.flash.utils.ByteArray;
    class ClassAliases {
        private _classMap;
        private _nameMap;
        getAliasByClass(axClass: AXClass): string;
        getClassByAlias(alias: string): AXClass;
        registerClassAlias(alias: string, axClass: AXClass): void;
    }
    const enum AMF0Marker {
        NUMBER = 0,
        BOOLEAN = 1,
        STRING = 2,
        OBJECT = 3,
        NULL = 5,
        UNDEFINED = 6,
        REFERENCE = 7,
        ECMA_ARRAY = 8,
        OBJECT_END = 9,
        STRICT_ARRAY = 10,
        DATE = 11,
        LONG_STRING = 12,
        XML = 15,
        TYPED_OBJECT = 16,
        AVMPLUS = 17,
    }
    class AMF0 {
        static write(ba: ByteArray, value: any): void;
        static read(ba: ByteArray): any;
    }
    const enum AMF3Marker {
        UNDEFINED = 0,
        NULL = 1,
        FALSE = 2,
        TRUE = 3,
        INTEGER = 4,
        DOUBLE = 5,
        STRING = 6,
        XML_DOC = 7,
        DATE = 8,
        ARRAY = 9,
        OBJECT = 10,
        XML = 11,
        BYTEARRAY = 12,
        VECTOR_INT = 13,
        VECTOR_UINT = 14,
        VECTOR_DOUBLE = 15,
        VECTOR_OBJECT = 16,
        DICTIONARY = 17,
    }
    class AMF3 {
        static write(ba: ByteArray, object: AS.ASObject): void;
        static read(ba: ByteArray): any;
    }
}
