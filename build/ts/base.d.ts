/// <reference path="../../src/base/es6-promises.d.ts" />
declare var jsGlobal: any;
declare var inBrowser: boolean;
declare var inFirefox: boolean;
declare var putstr: any;
/** @define {boolean} */ declare var release: boolean;
/** @define {boolean} */ declare var profile: boolean;
declare var dump: (message: string) => void;
declare function dumpLine(line: string): void;
declare var START_TIME: number;
interface String {
    padRight(c: string, n: number): string;
    padLeft(c: string, n: number): string;
    endsWith(s: string): boolean;
}
interface Function {
    boundTo: boolean;
}
interface Array<T> {
    runtimeId: number;
}
interface Math {
    imul(a: number, b: number): number;
    /**
     * Returns the number of leading zeros of a number.
     * @param x A numeric expression.
     */
    clz32(x: number): number;
}
interface Error {
    stack: string;
}
interface Map<K, V> {
    clear(): void;
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V;
    has(key: K): boolean;
    set(key: K, value: V): Map<K, V>;
    size: number;
}
declare var Map: {
    new <K, V>(): Map<K, V>;
    prototype: Map<any, any>;
};
interface WeakMap<K, V> {
    clear(): void;
    delete(key: K): boolean;
    get(key: K): V;
    has(key: K): boolean;
    set(key: K, value: V): WeakMap<K, V>;
}
declare var WeakMap: {
    new <K, V>(): WeakMap<K, V>;
    prototype: WeakMap<any, any>;
};
interface Set<T> {
    add(value: T): Set<T>;
    clear(): void;
    delete(value: T): boolean;
    forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    size: number;
}
declare var Set: {
    new <T>(): Set<T>;
    prototype: Set<any>;
};
interface Uint8ClampedArray extends ArrayBufferView {
    BYTES_PER_ELEMENT: number;
    length: number;
    [index: number]: number;
    get(index: number): number;
    set(index: number, value: number): void;
    set(array: Uint8Array, offset?: number): void;
    set(array: number[], offset?: number): void;
    subarray(begin: number, end?: number): Uint8ClampedArray;
}
declare var Uint8ClampedArray: {
    prototype: Uint8ClampedArray;
    new (length: number): Uint8ClampedArray;
    new (array: Uint8Array): Uint8ClampedArray;
    new (array: number[]): Uint8ClampedArray;
    new (buffer: ArrayBuffer, byteOffset?: number, length?: number): Uint8ClampedArray;
    BYTES_PER_ELEMENT: number;
};
declare module Shumway {
    var version: string;
    var build: string;
}
declare module Shumway {
    const enum CharacterCodes {
        _0 = 48,
        _1 = 49,
        _2 = 50,
        _3 = 51,
        _4 = 52,
        _5 = 53,
        _6 = 54,
        _7 = 55,
        _8 = 56,
        _9 = 57,
    }
    /**
     * The buffer length required to contain any unsigned 32-bit integer.
     */
    /** @const */ var UINT32_CHAR_BUFFER_LENGTH: number;
    /** @const */ var UINT32_MAX: number;
    /** @const */ var UINT32_MAX_DIV_10: number;
    /** @const */ var UINT32_MAX_MOD_10: number;
    function isString(value: any): boolean;
    function isFunction(value: any): boolean;
    function isNumber(value: any): boolean;
    function isInteger(value: any): boolean;
    function isArray(value: any): boolean;
    function isNumberOrString(value: any): boolean;
    function isObject(value: any): boolean;
    function toNumber(x: any): number;
    function isNumericString(value: string): boolean;
    /**
     * Whether the specified |value| is a number or the string representation of a number.
     */
    function isNumeric(value: any): boolean;
    /**
     * Whether the specified |value| is an unsigned 32 bit number expressed as a number
     * or string.
     */
    function isIndex(value: any): boolean;
    function isNullOrUndefined(value: any): boolean;
    function argumentsToString(args: IArguments): string;
    module Debug {
        function error(message: string): void;
        function assert(condition: any, message?: any): void;
        function assertUnreachable(msg: string): void;
        function assertNotImplemented(condition: boolean, message: string): void;
        function warning(message: any, arg1?: any, arg2?: any): void;
        function warnCounts(): any;
        function notImplemented(message: string): void;
        function dummyConstructor(message: string): void;
        function abstractMethod(message: string): void;
        function somewhatImplemented(message: string): void;
        function unexpected(message?: any): void;
        function unexpectedCase(message?: any): void;
    }
    function getTicks(): number;
    interface MapObject<T> {
        [name: string]: T;
    }
    module ArrayUtilities {
        /**
         * Pops elements from a source array into a destination array. This avoids
         * allocations and should be faster. The elements in the destination array
         * are pushed in the same order as they appear in the source array:
         *
         * popManyInto([1, 2, 3], 2, dst) => dst = [2, 3]
         */
        function popManyInto(src: any[], count: number, dst: any[]): void;
        function popMany<T>(array: T[], count: number): T[];
        /**
         * Just deletes several array elements from the end of the list.
         */
        function popManyIntoVoid(array: any[], count: number): void;
        function pushMany(dst: any[], src: any[]): void;
        function top(array: any[]): any;
        function last(array: any[]): any;
        function peek(array: any[]): any;
        function indexOf<T>(array: T[], value: T): number;
        function equals<T>(a: T[], b: T[]): boolean;
        function pushUnique<T>(array: T[], value: T): number;
        function unique<T>(array: T[]): T[];
        function copyFrom(dst: any[], src: any[]): void;
        interface TypedArray {
            buffer: ArrayBuffer;
            length: number;
            set: (array: TypedArray, offset?: number) => void;
            subarray: (begin: number, end?: number) => TypedArray;
        }
        /**
         * Makes sure that a typed array has the requested capacity. If required, it creates a new
         * instance of the array's class with a power-of-two capacity at least as large as required.
         */
        function ensureTypedArrayCapacity<T extends TypedArray>(array: T, capacity: number): T;
        function memCopy<T extends TypedArray>(destination: T, source: T, doffset?: number, soffset?: number, length?: number): void;
        interface IDataDecoder {
            onData: (data: Uint8Array) => void;
            onError: (e) => void;
            push(data: Uint8Array): any;
            close(): any;
        }
    }
    module ObjectUtilities {
        function boxValue(value: any): any;
        function toKeyValueArray(object: Object): any[];
        function isPrototypeWriteable(object: Object): boolean;
        function hasOwnProperty(object: Object, name: string): boolean;
        function propertyIsEnumerable(object: Object, name: string): boolean;
        /**
         * Returns a property descriptor for the own or inherited property with the given name, or
         * null if one doesn't exist.
         */
        function getPropertyDescriptor(object: Object, name: string): PropertyDescriptor;
        function hasOwnGetter(object: Object, name: string): boolean;
        function getOwnGetter(object: Object, name: string): () => any;
        function hasOwnSetter(object: Object, name: string): boolean;
        function createMap<T>(): MapObject<T>;
        function createArrayMap<T>(): MapObject<T>;
        function defineReadOnlyProperty(object: Object, name: string, value: any): void;
        function copyProperties(object: Object, template: Object): void;
        function copyOwnProperties(object: Object, template: Object): void;
        function copyOwnPropertyDescriptors(object: Object, template: Object, filter?: (name: string) => boolean, overwrite?: boolean, makeWritable?: boolean): void;
        function copyPropertiesByList(object: Object, template: Object, propertyList: string[]): void;
        function defineNonEnumerableGetter(obj: any, name: any, getter: any): void;
        function defineNonEnumerableProperty(obj: any, name: any, value: any): void;
    }
    module FunctionUtilities {
        function makeForwardingGetter(target: string): () => any;
        function makeForwardingSetter(target: string): (any) => void;
    }
    module StringUtilities {
        function repeatString(c: string, n: number): string;
        function memorySizeToString(value: number): string;
        /**
         * Returns a reasonably sized description of the |value|, to be used for debugging purposes.
         */
        function toSafeString(value: any): string;
        function toSafeArrayString(array: any): string;
        function utf8decode(str: string): Uint8Array;
        function utf8encode(bytes: Uint8Array): string;
        function base64EncodeBytes(bytes: Uint8Array): string;
        /**
         * Decodes the result of encoding with base64EncodeBytes, but not necessarily any other
         * base64-encoded data. Note that this also doesn't do any error checking.
         */
        function decodeRestrictedBase64ToBytes(encoded: string): Uint8Array;
        function escapeString(str: string): string;
        /**
         * Workaround for max stack size limit.
         */
        function fromCharCodeArray(buffer: Uint8Array): string;
        function variableLengthEncodeInt32(n: any): string;
        function toEncoding(n: any): string;
        function fromEncoding(c: any): any;
        function variableLengthDecodeInt32(s: any): number;
        function trimMiddle(s: string, maxLength: number): string;
        function multiple(s: string, count: number): string;
        function indexOfAny(s: string, chars: string[], position: number): number;
        /**
         * The concatN() functions concatenate multiple strings in a way that
         * avoids creating intermediate strings, unlike String.prototype.concat().
         *
         * Note that these functions don't have identical behaviour to using '+',
         * because they will ignore any arguments that are |undefined| or |null|.
         * This usually doesn't matter.
         */
        function concat3(s0: any, s1: any, s2: any): string;
        function concat4(s0: any, s1: any, s2: any, s3: any): string;
        function concat9(s0: any, s1: any, s2: any, s3: any, s4: any, s5: any, s6: any, s7: any, s8: any): string;
    }
    module HashUtilities {
        function hashBytesTo32BitsMD5(data: Uint8Array, offset: number, length: number): number;
        function mixHash(a: number, b: number): number;
    }
    /**
     * An extremely naive cache with a maximum size.
     * TODO: LRU
     */
    class Cache {
        private _data;
        private _size;
        private _maxSize;
        constructor(maxSize: number);
        get(key: any): any;
        set(key: any, value: any): boolean;
    }
    /**
     * Marsaglia's algorithm, adapted from V8. Use this if you want a deterministic random number.
     */
    class Random {
        private static _state;
        static seed(seed: number): void;
        static reset(): void;
        static next(): number;
    }
    /**
     * This should only be called if you need fake time.
     */
    function installTimeWarper(): void;
    interface IReferenceCountable {
        _referenceCount: number;
        _addReference(): any;
        _removeReference(): any;
    }
    class WeakList<T extends IReferenceCountable> {
        private _map;
        private _newAdditions;
        private _list;
        private _id;
        constructor();
        clear(): void;
        push(value: T): void;
        remove(value: T): void;
        forEach(callback: (value: T) => void): void;
        length: number;
    }
    module NumberUtilities {
        function pow2(exponent: number): number;
        function clamp(value: number, min: number, max: number): number;
        /**
         * Rounds *.5 to the nearest even number.
         * See https://en.wikipedia.org/wiki/Rounding#Round_half_to_even for details.
         */
        function roundHalfEven(value: number): number;
        /**
         * Rounds *.5 up on even occurrences, down on odd occurrences.
         * See https://en.wikipedia.org/wiki/Rounding#Alternating_tie-breaking for details.
         */
        function altTieBreakRound(value: number, even: boolean): number;
        function epsilonEquals(value: number, other: number): boolean;
    }
    const enum Numbers {
        MaxU16 = 65535,
        MaxI16 = 32767,
        MinI16 = -32768,
    }
    module IntegerUtilities {
        var i8: Int8Array;
        var u8: Uint8Array;
        var i32: Int32Array;
        var f32: Float32Array;
        var f64: Float64Array;
        var nativeLittleEndian: boolean;
        /**
         * Convert a float into 32 bits.
         */
        function floatToInt32(v: number): number;
        /**
         * Convert 32 bits into a float.
         */
        function int32ToFloat(i: number): number;
        /**
         * Swap the bytes of a 16 bit number.
         */
        function swap16(i: number): number;
        /**
         * Swap the bytes of a 32 bit number.
         */
        function swap32(i: number): number;
        /**
         * Converts a number to s8.u8 fixed point representation.
         */
        function toS8U8(v: number): number;
        /**
         * Converts a number from s8.u8 fixed point representation.
         */
        function fromS8U8(i: number): number;
        /**
         * Round trips a number through s8.u8 conversion.
         */
        function clampS8U8(v: number): number;
        /**
         * Converts a number to signed 16 bits.
         */
        function toS16(v: number): number;
        function bitCount(i: number): number;
        function ones(i: number): number;
        function trailingZeros(i: number): number;
        function getFlags(i: number, flags: string[]): string;
        function isPowerOfTwo(x: number): boolean;
        function roundToMultipleOfFour(x: number): number;
        function nearestPowerOfTwo(x: number): number;
        function roundToMultipleOfPowerOfTwo(i: number, powerOfTwo: number): number;
        function toHEX(i: number): string;
    }
    const enum LogLevel {
        Error = 1,
        Warn = 2,
        Debug = 4,
        Log = 8,
        Info = 16,
        All = 31,
    }
    class IndentingWriter {
        static PURPLE: string;
        static YELLOW: string;
        static GREEN: string;
        static RED: string;
        static BOLD_RED: string;
        static ENDC: string;
        static logLevel: LogLevel;
        private static _consoleOut;
        private static _consoleOutNoNewline;
        private _tab;
        private _padding;
        private _suppressOutput;
        private _out;
        private _outNoNewline;
        suppressOutput: boolean;
        constructor(suppressOutput?: boolean, out?: any);
        write(str?: string, writePadding?: boolean): void;
        writeLn(str?: string): void;
        writeObject(str?: string, object?: Object): void;
        writeTimeLn(str?: string): void;
        writeComment(str: string): void;
        writeLns(str: string): void;
        errorLn(str: string): void;
        warnLn(str: string): void;
        debugLn(str: string): void;
        logLn(str: string): void;
        infoLn(str: string): void;
        yellowLn(str: string): void;
        greenLn(str: string): void;
        boldRedLn(str: string): void;
        redLn(str: string): void;
        purpleLn(str: string): void;
        colorLn(color: string, str: string): void;
        redLns(str: string): void;
        colorLns(color: string, str: string): void;
        enter(str: string): void;
        leaveAndEnter(str: string): void;
        leave(str?: string): void;
        indent(): void;
        outdent(): void;
        writeArray(arr: any[], detailed?: boolean, noNumbers?: boolean): void;
    }
    class CircularBuffer {
        index: number;
        start: number;
        array: ArrayBufferView;
        _size: number;
        _mask: number;
        constructor(Type: any, sizeInBits?: number);
        get(i: any): any;
        forEachInReverse(visitor: any): void;
        write(value: any): void;
        isFull(): boolean;
        isEmpty(): boolean;
        reset(): void;
    }
    class ColorStyle {
        static TabToolbar: string;
        static Toolbars: string;
        static HighlightBlue: string;
        static LightText: string;
        static ForegroundText: string;
        static Black: string;
        static VeryDark: string;
        static Dark: string;
        static Light: string;
        static Grey: string;
        static DarkGrey: string;
        static Blue: string;
        static Purple: string;
        static Pink: string;
        static Red: string;
        static Orange: string;
        static LightOrange: string;
        static Green: string;
        static BlueGrey: string;
        private static _randomStyleCache;
        private static _nextStyle;
        static randomStyle(): any;
        private static _gradient;
        static gradientColor(value: any): string;
        static contrastStyle(rgb: string): string;
        static reset(): void;
    }
    interface UntypedBounds {
        xMin: number;
        yMin: number;
        xMax: number;
        yMax: number;
    }
    interface ASRectangle {
        x: number;
        y: number;
        width: number;
        height: number;
    }
    /**
     * Faster release version of bounds.
     */
    class Bounds {
        xMin: number;
        yMin: number;
        xMax: number;
        yMax: number;
        constructor(xMin: number, yMin: number, xMax: number, yMax: number);
        static FromUntyped(source: UntypedBounds): Bounds;
        static FromRectangle(source: ASRectangle): Bounds;
        setElements(xMin: number, yMin: number, xMax: number, yMax: number): void;
        copyFrom(source: Bounds): void;
        contains(x: number, y: number): boolean;
        unionInPlace(other: Bounds): void;
        extendByPoint(x: number, y: number): void;
        extendByX(x: number): void;
        extendByY(y: number): void;
        intersects(toIntersect: Bounds): boolean;
        isEmpty(): boolean;
        width: number;
        height: number;
        getBaseWidth(angle: number): number;
        getBaseHeight(angle: number): number;
        setEmpty(): void;
        /**
         * Set all fields to the sentinel value 0x8000000.
         *
         * This is what Flash uses to indicate uninitialized bounds. Important for bounds calculation
         * in `Graphics` instances, which start out with empty bounds but must not just extend them
         * from an 0,0 origin.
         */
        setToSentinels(): void;
        clone(): Bounds;
        toString(): string;
    }
    /**
     * Slower debug version of bounds, makes sure that all points have integer coordinates.
     */
    class DebugBounds {
        private _xMin;
        private _yMin;
        private _xMax;
        private _yMax;
        constructor(xMin: number, yMin: number, xMax: number, yMax: number);
        static FromUntyped(source: UntypedBounds): DebugBounds;
        static FromRectangle(source: ASRectangle): DebugBounds;
        setElements(xMin: number, yMin: number, xMax: number, yMax: number): void;
        copyFrom(source: DebugBounds): void;
        contains(x: number, y: number): boolean;
        unionInPlace(other: DebugBounds): void;
        extendByPoint(x: number, y: number): void;
        extendByX(x: number): void;
        extendByY(y: number): void;
        intersects(toIntersect: DebugBounds): boolean;
        isEmpty(): boolean;
        xMin: number;
        yMin: number;
        xMax: number;
        width: number;
        yMax: number;
        height: number;
        getBaseWidth(angle: number): number;
        getBaseHeight(angle: number): number;
        setEmpty(): void;
        clone(): DebugBounds;
        toString(): string;
        private assertValid();
    }
    /**
     * Override Bounds with a slower by safer version, don't do this in release mode.
     */
    class Color {
        r: number;
        g: number;
        b: number;
        a: number;
        constructor(r: number, g: number, b: number, a: number);
        static FromARGB(argb: number): Color;
        static FromRGBA(rgba: number): Color;
        toRGBA(): number;
        toCSSStyle(): string;
        set(other: Color): void;
        static Red: Color;
        static Green: Color;
        static Blue: Color;
        static None: Color;
        static White: Color;
        static Black: Color;
        private static colorCache;
        static randomColor(alpha?: number): Color;
        static parseColor(color: string): Color;
    }
    module ColorUtilities {
        function RGBAToARGB(rgba: number): number;
        function ARGBToRGBA(argb: number): number;
        function rgbaToCSSStyle(rgba: number): string;
        function cssStyleToRGBA(style: string): any;
        function hexToRGB(color: string): number;
        function rgbToHex(color: number): string;
        function isValidHexColor(value: any): boolean;
        function clampByte(value: number): number;
        /**
         * Unpremultiplies the given |pARGB| color value.
         */
        function unpremultiplyARGB(pARGB: number): number;
        /**
         * Premultiplies the given |pARGB| color value.
         */
        function premultiplyARGB(uARGB: number): number;
        /**
         * Make sure to call this before using the |unpremultiplyARGBUsingTableLookup| or
         * |premultiplyARGBUsingTableLookup| functions. We want to execute this lazily so
         * we don't incur any startup overhead.
         */
        function ensureUnpremultiplyTable(): void;
        function getUnpremultiplyTable(): Uint8Array;
        function tableLookupUnpremultiplyARGB(pARGB: any): number;
        /**
         * The blending equation for unpremultiplied alpha is:
         *
         *   (src.rgb * src.a) + (dst.rgb * (1 - src.a))
         *
         * For premultiplied alpha src.rgb and dst.rgb are already
         * premultiplied by alpha, so the equation becomes:
         *
         *   src.rgb + (dst.rgb * (1 - src.a))
         *
         * TODO: Not sure what to do about the dst.rgb which is
         * premultiplied by its alpah, but this appears to work.
         *
         * We use the "double blend trick" (http://stereopsis.com/doubleblend.html) to
         * compute GA and BR without unpacking them.
         */
        function blendPremultipliedBGRA(tpBGRA: number, spBGRA: number): number;
        function convertImage(sourceFormat: ImageType, targetFormat: ImageType, source: Int32Array, target: Int32Array): void;
    }
    /**
     * Simple pool allocator for ArrayBuffers. This reduces memory usage in data structures
     * that resize buffers.
     */
    class ArrayBufferPool {
        private _list;
        private _maxSize;
        private static _enabled;
        /**
         * Creates a pool that manages a pool of a |maxSize| number of array buffers.
         */
        constructor(maxSize?: number);
        /**
         * Creates or reuses an existing array buffer that is at least the
         * specified |length|.
         */
        acquire(length: number): ArrayBuffer;
        /**
         * Releases an array buffer that is no longer needed back to the pool.
         */
        release(buffer: ArrayBuffer): void;
        /**
         * Resizes a Uint8Array to have the given length.
         */
        ensureUint8ArrayLength(array: Uint8Array, length: number): Uint8Array;
        /**
         * Resizes a Float64Array to have the given length.
         */
        ensureFloat64ArrayLength(array: Float64Array, length: number): Float64Array;
    }
    module Telemetry {
        const enum Feature {
            EXTERNAL_INTERFACE_FEATURE = 1,
            CLIPBOARD_FEATURE = 2,
            SHAREDOBJECT_FEATURE = 3,
            VIDEO_FEATURE = 4,
            SOUND_FEATURE = 5,
            NETCONNECTION_FEATURE = 6,
        }
        const enum ErrorTypes {
            AVM1_ERROR = 1,
            AVM2_ERROR = 2,
        }
        const enum LoadResource {
            LoadSource = 0,
            LoadWhitelistAllowed = 1,
            LoadWhitelistDenied = 2,
            StreamAllowed = 3,
            StreamDenied = 4,
            StreamCrossdomain = 5,
        }
        var instance: ITelemetryService;
    }
    interface ITelemetryService {
        reportTelemetry(data: any): any;
    }
    interface FileLoadingRequest {
        url: string;
        data: any;
    }
    interface FileLoadingProgress {
        bytesLoaded: number;
        bytesTotal: number;
    }
    interface FileLoadingSession {
        onopen?: () => void;
        onclose?: () => void;
        onprogress?: (data: any, progressStatus: FileLoadingProgress) => void;
        onhttpstatus?: (location: string, httpStatus: number, httpHeaders: any) => void;
        onerror?: (e) => void;
        open(request: FileLoadingRequest): any;
        close: () => void;
    }
    interface IFileLoadingService {
        createSession(): FileLoadingSession;
        resolveUrl(url: string): string;
        navigateTo(url: string, target: string): any;
    }
    module FileLoadingService {
        var instance: IFileLoadingService;
    }
    const enum SystemResourceId {
        BuiltinAbc = 0,
        PlayerglobalAbcs = 1,
        PlayerglobalManifest = 2,
        ShellAbc = 3,
    }
    interface ISystemResourcesLoadingService {
        load(id: SystemResourceId): Promise<any>;
    }
    module SystemResourcesLoadingService {
        var instance: ISystemResourcesLoadingService;
    }
    function registerCSSFont(id: number, data: Uint8Array, forceFontInit: boolean): void;
    interface IExternalInterfaceService {
        enabled: boolean;
        initJS(callback: (functionName: string, args: any[]) => any): any;
        registerCallback(functionName: string): any;
        unregisterCallback(functionName: string): any;
        eval(expression: any): any;
        call(request: any): any;
        getId(): string;
    }
    module ExternalInterfaceService {
        var instance: IExternalInterfaceService;
    }
    const enum LocalConnectionConnectResult {
        InvalidCallback = -3,
        AlreadyTaken = -2,
        InvalidName = -1,
        Success = 0,
    }
    const enum LocalConnectionCloseResult {
        NotConnected = -1,
        Success = 0,
    }
    interface ILocalConnectionReceiver {
        handleMessage(methodName: string, argsBuffer: ArrayBuffer): void;
    }
    interface ILocalConnectionSender {
        dispatchEvent(event: any): void;
        hasEventListener(type: string): boolean;
        sec: any;
    }
    interface ILocalConnectionService {
        createConnection(connectionName: string, receiver: ILocalConnectionReceiver): LocalConnectionConnectResult;
        closeConnection(connectionName: string, receiver: ILocalConnectionReceiver): LocalConnectionCloseResult;
        send(connectionName: string, methodName: string, args: ArrayBuffer, sender: ILocalConnectionSender, senderDomain: string, senderIsSecure: boolean): void;
        allowDomains(connectionName: string, receiver: ILocalConnectionReceiver, domains: string[], secure: boolean): any;
    }
    module LocalConnectionService {
        var instance: ILocalConnectionService;
    }
    interface IClipboardService {
        setClipboard(data: string): void;
    }
    module ClipboardService {
        var instance: IClipboardService;
    }
    class Callback {
        private _queues;
        constructor();
        register(type: any, callback: any): void;
        unregister(type: string, callback: any): void;
        notify(type: string, args: any): void;
        notify1(type: string, value: any): void;
    }
    enum ImageType {
        None = 0,
        /**
         * Premultiplied ARGB (byte-order).
         */
        PremultipliedAlphaARGB = 1,
        /**
         * Unpremultiplied ARGB (byte-order).
         */
        StraightAlphaARGB = 2,
        /**
         * Unpremultiplied RGBA (byte-order), this is what putImageData expects.
         */
        StraightAlphaRGBA = 3,
        JPEG = 4,
        PNG = 5,
        GIF = 6,
    }
    function getMIMETypeForImageType(type: ImageType): string;
    module UI {
        function toCSSCursor(mouseCursor: number): string;
    }
    class PromiseWrapper<T> {
        promise: Promise<T>;
        resolve: (result: T) => void;
        reject: (reason) => void;
        then(onFulfilled: any, onRejected: any): Promise<{}>;
        constructor();
    }
}
declare var exports: any;
/**
 * Option and Argument Management
 *
 * Options are configuration settings sprinkled throughout the code. They can be grouped into sets of
 * options called |OptionSets| which can form a hierarchy of options. For instance:
 *
 * var set = new OptionSet();
 * var opt = set.register(new Option("v", "verbose", "boolean", false, "Enables verbose logging."));
 *
 * creates an option set with one option in it. The option can be changed directly using |opt.value = true| or
 * automatically using the |ArgumentParser|:
 *
 * var parser = new ArgumentParser();
 * parser.addBoundOptionSet(set);
 * parser.parse(["-v"]);
 *
 * The |ArgumentParser| can also be used directly:
 *
 * var parser = new ArgumentParser();
 * argumentParser.addArgument("h", "help", "boolean", {parse: function (x) {
 *   printUsage();
 * }});
 */
declare module Shumway.Options {
    class Argument {
        shortName: string;
        longName: string;
        type: any;
        options: any;
        positional: boolean;
        parseFn: any;
        value: any;
        constructor(shortName: any, longName: any, type: any, options: any);
        parse(value: any): void;
    }
    class ArgumentParser {
        args: any[];
        constructor();
        addArgument(shortName: any, longName: any, type: any, options: any): Argument;
        addBoundOption(option: any): void;
        addBoundOptionSet(optionSet: any): void;
        getUsage(): string;
        parse(args: any): any[];
    }
    class OptionSet {
        name: string;
        settings: any;
        options: any;
        open: boolean;
        static isOptionSet(obj: any): boolean;
        constructor(name: string, settings?: any);
        register(option: any): any;
        trace(writer: any): void;
        getSettings(): {};
        setSettings(settings: any): void;
    }
    class Option {
        longName: string;
        shortName: string;
        type: string;
        defaultValue: any;
        value: any;
        description: string;
        config: any;
        /**
         * Dat GUI control.
         */
        ctrl: any;
        constructor(shortName: any, longName: any, type: any, defaultValue: any, description: any, config?: any);
        parse(value: any): void;
        trace(writer: any): void;
    }
}
declare module Shumway {
    module Settings {
        var ROOT: string;
        var shumwayOptions: OptionSet;
        function setSettings(settings: any): void;
        function getSettings(): {};
    }
    import OptionSet = Shumway.Options.OptionSet;
    var loggingOptions: any;
    var omitRepeatedWarnings: any;
}
declare module Shumway.Metrics {
    class Timer {
        private static _base;
        private static _top;
        private static _flat;
        private static _flatStack;
        private _parent;
        private _name;
        private _begin;
        private _last;
        private _total;
        private _count;
        private _timers;
        constructor(parent: Timer, name: string);
        static time(name: any, fn: Function): void;
        static start(name: any): void;
        static stop(): void;
        static stopStart(name: any): void;
        start(): void;
        stop(): void;
        toJSON(): {
            name: string;
            total: number;
            timers: MapObject<Timer>;
        };
        trace(writer: IndentingWriter): void;
        static trace(writer: IndentingWriter): void;
    }
    /**
     * Quick way to count named events.
     */
    class Counter {
        static instance: Counter;
        private _enabled;
        private _counts;
        private _times;
        counts: MapObject<number>;
        constructor(enabled: boolean);
        setEnabled(enabled: boolean): void;
        clear(): void;
        toJSON(): {
            counts: MapObject<number>;
            times: MapObject<number>;
        };
        count(name: string, increment?: number, time?: number): number;
        trace(writer: IndentingWriter): void;
        private _pairToString(times, pair);
        toStringSorted(): string;
        traceSorted(writer: IndentingWriter, inline?: boolean): void;
    }
    class Average {
        private _samples;
        private _count;
        private _index;
        constructor(max: any);
        push(sample: number): void;
        average(): number;
    }
}
declare module Shumway.ArrayUtilities {
    class Inflate implements IDataDecoder {
        onData: (buffer: Uint8Array) => void;
        onError: (e) => void;
        constructor(verifyHeader: boolean);
        push(data: Uint8Array): void;
        close(): void;
        static create(verifyHeader: boolean): Inflate;
        _processZLibHeader(buffer: Uint8Array, start: number, end: number): number;
        static inflate(data: Uint8Array, expectedLength: number, zlibHeader: boolean): Uint8Array;
    }
    class Adler32 {
        private a;
        private b;
        constructor();
        update(data: Uint8Array, start: number, end: number): void;
        getChecksum(): number;
    }
    class Deflate implements IDataDecoder {
        onData: (data: Uint8Array) => void;
        onError: (e) => void;
        private _writeZlibHeader;
        private _state;
        private _adler32;
        constructor(writeZlibHeader: boolean);
        push(data: Uint8Array): void;
        close(): void;
    }
}
declare module Shumway.ArrayUtilities {
    class LzmaDecoder implements IDataDecoder {
        onData: (data: Uint8Array) => void;
        onError: (e) => void;
        private _state;
        buffer: Uint8Array;
        private _inStream;
        private _outStream;
        private _decoder;
        constructor(swfHeader?: boolean);
        push(data: Uint8Array): void;
        close(): void;
        private _error(error);
        private _checkError(res);
    }
}
/**
 * Copyright 2014 Mozilla Foundation
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
declare module Shumway.ArrayUtilities {
    interface IDataInput {
        readBytes: (bytes: DataBuffer, offset?: number, length?: number) => void;
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
        objectEncoding: number;
        endian: string;
    }
    interface IDataOutput {
        writeBytes: (bytes: DataBuffer, offset?: number, length?: number) => void;
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
        objectEncoding: number;
        endian: string;
    }
    class PlainObjectDataBuffer {
        buffer: ArrayBuffer;
        length: number;
        littleEndian: boolean;
        constructor(buffer: ArrayBuffer, length: number, littleEndian: boolean);
    }
    class DataBuffer implements IDataInput, IDataOutput {
        private static _nativeLittleEndian;
        private static INITIAL_SIZE;
        private _buffer;
        private _length;
        private _position;
        private _littleEndian;
        private _objectEncoding;
        private _u8;
        private _i32;
        private _f32;
        private _bitBuffer;
        private _bitLength;
        private static _arrayBufferPool;
        constructor(initialSize?: number);
        static FromArrayBuffer(buffer: ArrayBuffer, length?: number): DataBuffer;
        static FromPlainObject(source: PlainObjectDataBuffer): DataBuffer;
        toPlainObject(): PlainObjectDataBuffer;
        /**
         * Clone the DataBuffer in a way that guarantees the underlying ArrayBuffer to be copied
         * into an instance of the current global's ArrayBuffer.
         *
         * Important if the underlying buffer comes from a different global, in which case accessing
         * its elements is excruiciatingly slow.
         */
        clone(): DataBuffer;
        /**
         * By default, we only have a byte view. All other views are |null|.
         */
        private _resetViews();
        /**
         * We don't want to eagerly allocate views if we won't ever need them. You must call this method
         * before using a view of a certain type to make sure it's available. Once a view is allocated,
         * it is not re-allocated unless the view becomes |null| as a result of a call to |resetViews|.
         */
        private _requestViews(flags);
        getBytes(): Uint8Array;
        private _ensureCapacity(length);
        clear(): void;
        readBoolean(): boolean;
        readByte(): number;
        readUnsignedByte(): number;
        readBytes(bytes: DataBuffer, offset?: number, length?: number): void;
        readShort(): number;
        readUnsignedShort(): number;
        readInt(): number;
        readUnsignedInt(): number;
        readFloat(): number;
        readDouble(): number;
        writeBoolean(value: boolean): void;
        writeByte(value: number): void;
        writeUnsignedByte(value: number): void;
        writeRawBytes(bytes: Uint8Array): void;
        writeBytes(bytes: DataBuffer, offset?: number, length?: number): void;
        writeShort(value: number): void;
        writeUnsignedShort(value: number): void;
        writeInt(value: number): void;
        write2Ints(a: number, b: number): void;
        write4Ints(a: number, b: number, c: number, d: number): void;
        writeUnsignedInt(value: number): void;
        write2UnsignedInts(a: number, b: number): void;
        write4UnsignedInts(a: number, b: number, c: number, d: number): void;
        writeFloat(value: number): void;
        write2Floats(a: number, b: number): void;
        write6Floats(a: number, b: number, c: number, d: number, e: number, f: number): void;
        writeDouble(value: number): void;
        readRawBytes(): Int8Array;
        writeUTF(value: string): void;
        writeUTFBytes(value: string): void;
        readUTF(): string;
        readUTFBytes(length: number): string;
        length: number;
        bytesAvailable: number;
        position: number;
        buffer: ArrayBuffer;
        bytes: Uint8Array;
        ints: Int32Array;
        objectEncoding: number;
        endian: string;
        toString(): string;
        toBlob(type: string): Blob;
        writeMultiByte(value: string, charSet: string): void;
        readMultiByte(length: number, charSet: string): string;
        getValue(name: number): any;
        setValue(name: number, value: any): void;
        readFixed(): number;
        readFixed8(): number;
        readFloat16(): number;
        readEncodedU32(): number;
        readBits(size: number): number;
        readUnsignedBits(size: number): number;
        readFixedBits(size: number): number;
        readString(length?: number): string;
        align(): void;
        deflate(): void;
        inflate(): void;
        compress(algorithm: string): void;
        uncompress(algorithm: string): void;
    }
}
/**
 * Copyright 2014 Mozilla Foundation
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
/**
 * Serialization format for shape data:
 * (canonical, update this instead of anything else!)
 *
 * Shape data is serialized into a set of three buffers:
 * - `commands`: a Uint8Array for commands
 *  - valid values: [1-11] (i.e. one of the PathCommand enum values)
 * - `coordinates`: an Int32Array for path coordinates*
 *                  OR uint8 thickness iff the current command is PathCommand.LineStyleSolid
 *  - valid values: the full range of 32bit numbers, representing x,y coordinates in twips
 * - `styles`: a DataBuffer for style definitions
 *  - valid values: structs for the various style definitions as described below
 *
 * (*: with one exception: to make various things faster, stroke widths are stored in the
 * coordinates buffer, too.)
 *
 * All entries always contain all fields, default values aren't omitted.
 *
 * the various commands write the following sets of values into the various buffers:
 *
 * moveTo:
 * commands:      PathCommand.MoveTo
 * coordinates:   target x coordinate, in twips
 *                target y coordinate, in twips
 * styles:        n/a
 *
 * lineTo:
 * commands:      PathCommand.LineTo
 * coordinates:   target x coordinate, in twips
 *                target y coordinate, in twips
 * styles:        n/a
 *
 * curveTo:
 * commands:      PathCommand.CurveTo
 * coordinates:   control point x coordinate, in twips
 *                control point y coordinate, in twips
 *                target x coordinate, in twips
 *                target y coordinate, in twips
 * styles:        n/a
 *
 * cubicCurveTo:
 * commands:      PathCommand.CubicCurveTo
 * coordinates:   control point 1 x coordinate, in twips
 *                control point 1 y coordinate, in twips
 *                control point 2 x coordinate, in twips
 *                control point 2 y coordinate, in twips
 *                target x coordinate, in twips
 *                target y coordinate, in twips
 * styles:        n/a
 *
 * beginFill:
 * commands:      PathCommand.BeginSolidFill
 * coordinates:   n/a
 * styles:        uint32 - RGBA color
 *
 * beginGradientFill:
 * commands:      PathCommand.BeginGradientFill
 * coordinates:   n/a
 * Note: the style fields are ordered this way to optimize performance in the rendering backend
 * Note: the style record has a variable length depending on the number of color stops
 * styles:        uint8  - GradientType.{LINEAR,RADIAL}
 *                fix8   - focalPoint [-128.0xff,127.0xff]
 *                matrix - transform (see Matrix#writeExternal for details)
 *                uint8  - colorStops (Number of color stop records that follow)
 *                list of uint8,uint32 pairs:
 *                    uint8  - ratio [0-0xff]
 *                    uint32 - RGBA color
 *                uint8  - SpreadMethod.{PAD,REFLECT,REPEAT}
 *                uint8  - InterpolationMethod.{RGB,LINEAR_RGB}
 *
 * beginBitmapFill:
 * commands:      PathCommand.BeginBitmapFill
 * coordinates:   n/a
 * styles:        uint32 - Index of the bitmapData object in the Graphics object's `textures`
 *                         array
 *                matrix - transform (see Matrix#writeExternal for details)
 *                bool   - repeat
 *                bool   - smooth
 *
 * lineStyle:
 * commands:      PathCommand.LineStyleSolid
 * coordinates:   uint32 - thickness (!)
 * style:         uint32 - RGBA color
 *                bool   - pixelHinting
 *                uint8  - LineScaleMode, [0-3] see LineScaleMode.fromNumber for meaning
 *                uint8  - CapsStyle, [0-2] see CapsStyle.fromNumber for meaning
 *                uint8  - JointStyle, [0-2] see JointStyle.fromNumber for meaning
 *                uint8  - miterLimit
 *
 * lineGradientStyle:
 * commands:      PathCommand.LineStyleGradient
 * coordinates:   n/a
 * Note: the style fields are ordered this way to optimize performance in the rendering backend
 * Note: the style record has a variable length depending on the number of color stops
 * styles:        uint8  - GradientType.{LINEAR,RADIAL}
 *                int8   - focalPoint [-128,127]
 *                matrix - transform (see Matrix#writeExternal for details)
 *                uint8  - colorStops (Number of color stop records that follow)
 *                list of uint8,uint32 pairs:
 *                    uint8  - ratio [0-0xff]
 *                    uint32 - RGBA color
 *                uint8  - SpreadMethod.{PAD,REFLECT,REPEAT}
 *                uint8  - InterpolationMethod.{RGB,LINEAR_RGB}
 *
 * lineBitmapStyle:
 * commands:      PathCommand.LineBitmapStyle
 * coordinates:   n/a
 * styles:        uint32 - Index of the bitmapData object in the Graphics object's `textures`
 *                         array
 *                matrix - transform (see Matrix#writeExternal for details)
 *                bool   - repeat
 *                bool   - smooth
 *
 * lineEnd:
 * Note: emitted for invalid `lineStyle` calls
 * commands:      PathCommand.LineEnd
 * coordinates:   n/a
 * styles:        n/a
 *
 */
declare module Shumway {
    import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    /**
     * Used for (de-)serializing Graphics path data in defineShape, flash.display.Graphics
     * and the renderer.
     */
    const enum PathCommand {
        BeginSolidFill = 1,
        BeginGradientFill = 2,
        BeginBitmapFill = 3,
        EndFill = 4,
        LineStyleSolid = 5,
        LineStyleGradient = 6,
        LineStyleBitmap = 7,
        LineEnd = 8,
        MoveTo = 9,
        LineTo = 10,
        CurveTo = 11,
        CubicCurveTo = 12,
    }
    const enum GradientType {
        Linear = 16,
        Radial = 18,
    }
    const enum GradientSpreadMethod {
        Pad = 0,
        Reflect = 1,
        Repeat = 2,
    }
    const enum GradientInterpolationMethod {
        RGB = 0,
        LinearRGB = 1,
    }
    const enum LineScaleMode {
        None = 0,
        Normal = 1,
        Vertical = 2,
        Horizontal = 3,
    }
    interface ShapeMatrix {
        a: number;
        b: number;
        c: number;
        d: number;
        tx: number;
        ty: number;
    }
    class PlainObjectShapeData {
        commands: Uint8Array;
        commandsPosition: number;
        coordinates: Int32Array;
        morphCoordinates: Int32Array;
        coordinatesPosition: number;
        styles: ArrayBuffer;
        stylesLength: number;
        morphStyles: ArrayBuffer;
        morphStylesLength: number;
        hasFills: boolean;
        hasLines: boolean;
        constructor(commands: Uint8Array, commandsPosition: number, coordinates: Int32Array, morphCoordinates: Int32Array, coordinatesPosition: number, styles: ArrayBuffer, stylesLength: number, morphStyles: ArrayBuffer, morphStylesLength: number, hasFills: boolean, hasLines: boolean);
    }
    class ShapeData {
        commands: Uint8Array;
        commandsPosition: number;
        coordinates: Int32Array;
        morphCoordinates: Int32Array;
        coordinatesPosition: number;
        styles: DataBuffer;
        morphStyles: DataBuffer;
        hasFills: boolean;
        hasLines: boolean;
        constructor(initialize?: boolean);
        static FromPlainObject(source: PlainObjectShapeData): ShapeData;
        moveTo(x: number, y: number): void;
        lineTo(x: number, y: number): void;
        curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void;
        cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number): void;
        beginFill(color: number): void;
        writeMorphFill(color: number): void;
        endFill(): void;
        endLine(): void;
        lineStyle(thickness: number, color: number, pixelHinting: boolean, scaleMode: LineScaleMode, caps: number, joints: number, miterLimit: number): void;
        writeMorphLineStyle(thickness: number, color: number): void;
        /**
         * Bitmaps are specified the same for fills and strokes, so we only need to serialize them
         * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
         * be one of BeginBitmapFill and LineStyleBitmap.
         */
        beginBitmap(pathCommand: PathCommand, bitmapId: number, matrix: ShapeMatrix, repeat: boolean, smooth: boolean): void;
        writeMorphBitmap(matrix: ShapeMatrix): void;
        /**
         * Gradients are specified the same for fills and strokes, so we only need to serialize them
         * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
         * be one of BeginGradientFill and LineStyleGradient.
         */
        beginGradient(pathCommand: PathCommand, colors: number[], ratios: number[], gradientType: number, matrix: ShapeMatrix, spread: number, interpolation: number, focalPointRatio: number): void;
        writeMorphGradient(colors: number[], ratios: number[], matrix: ShapeMatrix): void;
        writeCommandAndCoordinates(command: PathCommand, x: number, y: number): void;
        writeCoordinates(x: number, y: number): void;
        writeMorphCoordinates(x: number, y: number): void;
        clear(): void;
        isEmpty(): boolean;
        clone(): ShapeData;
        toPlainObject(): PlainObjectShapeData;
        buffers: ArrayBuffer[];
        private _writeStyleMatrix(matrix, isMorph);
        private ensurePathCapacities(numCommands, numCoordinates);
    }
}
declare module Shumway.SWF.Parser {
    const enum SwfTagCode {
        CODE_END = 0,
        CODE_SHOW_FRAME = 1,
        CODE_DEFINE_SHAPE = 2,
        CODE_FREE_CHARACTER = 3,
        CODE_PLACE_OBJECT = 4,
        CODE_REMOVE_OBJECT = 5,
        CODE_DEFINE_BITS = 6,
        CODE_DEFINE_BUTTON = 7,
        CODE_JPEG_TABLES = 8,
        CODE_SET_BACKGROUND_COLOR = 9,
        CODE_DEFINE_FONT = 10,
        CODE_DEFINE_TEXT = 11,
        CODE_DO_ACTION = 12,
        CODE_DEFINE_FONT_INFO = 13,
        CODE_DEFINE_SOUND = 14,
        CODE_START_SOUND = 15,
        CODE_STOP_SOUND = 16,
        CODE_DEFINE_BUTTON_SOUND = 17,
        CODE_SOUND_STREAM_HEAD = 18,
        CODE_SOUND_STREAM_BLOCK = 19,
        CODE_DEFINE_BITS_LOSSLESS = 20,
        CODE_DEFINE_BITS_JPEG2 = 21,
        CODE_DEFINE_SHAPE2 = 22,
        CODE_DEFINE_BUTTON_CXFORM = 23,
        CODE_PROTECT = 24,
        CODE_PATHS_ARE_POSTSCRIPT = 25,
        CODE_PLACE_OBJECT2 = 26,
        CODE_REMOVE_OBJECT2 = 28,
        CODE_SYNC_FRAME = 29,
        CODE_FREE_ALL = 31,
        CODE_DEFINE_SHAPE3 = 32,
        CODE_DEFINE_TEXT2 = 33,
        CODE_DEFINE_BUTTON2 = 34,
        CODE_DEFINE_BITS_JPEG3 = 35,
        CODE_DEFINE_BITS_LOSSLESS2 = 36,
        CODE_DEFINE_EDIT_TEXT = 37,
        CODE_DEFINE_VIDEO = 38,
        CODE_DEFINE_SPRITE = 39,
        CODE_NAME_CHARACTER = 40,
        CODE_PRODUCT_INFO = 41,
        CODE_DEFINE_TEXT_FORMAT = 42,
        CODE_FRAME_LABEL = 43,
        CODE_DEFINE_BEHAVIOUR = 44,
        CODE_SOUND_STREAM_HEAD2 = 45,
        CODE_DEFINE_MORPH_SHAPE = 46,
        CODE_GENERATE_FRAME = 47,
        CODE_DEFINE_FONT2 = 48,
        CODE_GEN_COMMAND = 49,
        CODE_DEFINE_COMMAND_OBJECT = 50,
        CODE_CHARACTER_SET = 51,
        CODE_EXTERNAL_FONT = 52,
        CODE_DEFINE_FUNCTION = 53,
        CODE_PLACE_FUNCTION = 54,
        CODE_GEN_TAG_OBJECTS = 55,
        CODE_EXPORT_ASSETS = 56,
        CODE_IMPORT_ASSETS = 57,
        CODE_ENABLE_DEBUGGER = 58,
        CODE_DO_INIT_ACTION = 59,
        CODE_DEFINE_VIDEO_STREAM = 60,
        CODE_VIDEO_FRAME = 61,
        CODE_DEFINE_FONT_INFO2 = 62,
        CODE_DEBUG_ID = 63,
        CODE_ENABLE_DEBUGGER2 = 64,
        CODE_SCRIPT_LIMITS = 65,
        CODE_SET_TAB_INDEX = 66,
        CODE_FILE_ATTRIBUTES = 69,
        CODE_PLACE_OBJECT3 = 70,
        CODE_IMPORT_ASSETS2 = 71,
        CODE_DO_ABC_DEFINE = 72,
        CODE_DEFINE_FONT_ALIGN_ZONES = 73,
        CODE_CSM_TEXT_SETTINGS = 74,
        CODE_DEFINE_FONT3 = 75,
        CODE_SYMBOL_CLASS = 76,
        CODE_METADATA = 77,
        CODE_DEFINE_SCALING_GRID = 78,
        CODE_DO_ABC = 82,
        CODE_DEFINE_SHAPE4 = 83,
        CODE_DEFINE_MORPH_SHAPE2 = 84,
        CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA = 86,
        CODE_DEFINE_BINARY_DATA = 87,
        CODE_DEFINE_FONT_NAME = 88,
        CODE_START_SOUND2 = 89,
        CODE_DEFINE_BITS_JPEG4 = 90,
        CODE_DEFINE_FONT4 = 91,
        CODE_TELEMETRY = 93,
    }
    function getSwfTagCodeName(tagCode: SwfTagCode): string;
    enum DefinitionTags {
        CODE_DEFINE_SHAPE = 2,
        CODE_DEFINE_BITS = 6,
        CODE_DEFINE_BUTTON = 7,
        CODE_DEFINE_FONT = 10,
        CODE_DEFINE_TEXT = 11,
        CODE_DEFINE_SOUND = 14,
        CODE_DEFINE_BITS_LOSSLESS = 20,
        CODE_DEFINE_BITS_JPEG2 = 21,
        CODE_DEFINE_SHAPE2 = 22,
        CODE_DEFINE_SHAPE3 = 32,
        CODE_DEFINE_TEXT2 = 33,
        CODE_DEFINE_BUTTON2 = 34,
        CODE_DEFINE_BITS_JPEG3 = 35,
        CODE_DEFINE_BITS_LOSSLESS2 = 36,
        CODE_DEFINE_EDIT_TEXT = 37,
        CODE_DEFINE_SPRITE = 39,
        CODE_DEFINE_MORPH_SHAPE = 46,
        CODE_DEFINE_FONT2 = 48,
        CODE_DEFINE_VIDEO_STREAM = 60,
        CODE_DEFINE_FONT3 = 75,
        CODE_DEFINE_SHAPE4 = 83,
        CODE_DEFINE_MORPH_SHAPE2 = 84,
        CODE_DEFINE_BINARY_DATA = 87,
        CODE_DEFINE_BITS_JPEG4 = 90,
        CODE_DEFINE_FONT4 = 91,
    }
    enum ImageDefinitionTags {
        CODE_DEFINE_BITS = 6,
        CODE_DEFINE_BITS_JPEG2 = 21,
        CODE_DEFINE_BITS_JPEG3 = 35,
        CODE_DEFINE_BITS_JPEG4 = 90,
    }
    enum FontDefinitionTags {
        CODE_DEFINE_FONT = 10,
        CODE_DEFINE_FONT2 = 48,
        CODE_DEFINE_FONT3 = 75,
        CODE_DEFINE_FONT4 = 91,
    }
    enum ControlTags {
        CODE_PLACE_OBJECT = 4,
        CODE_PLACE_OBJECT2 = 26,
        CODE_PLACE_OBJECT3 = 70,
        CODE_REMOVE_OBJECT = 5,
        CODE_REMOVE_OBJECT2 = 28,
        CODE_START_SOUND = 15,
        CODE_START_SOUND2 = 89,
        CODE_VIDEO_FRAME = 61,
    }
    interface Bbox {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    }
    interface Matrix {
        a: number;
        b: number;
        c: number;
        d: number;
        tx: number;
        ty: number;
    }
    interface ColorTransform {
        redMultiplier: number;
        greenMultiplier: number;
        blueMultiplier: number;
        alphaMultiplier: number;
        redOffset: number;
        greenOffset: number;
        blueOffset: number;
        alphaOffset: number;
    }
    interface SwfTag {
        code: number;
    }
    interface DefinitionTag extends SwfTag {
        id: number;
    }
    interface DisplayListTag extends SwfTag {
        depth: number;
    }
    interface PlaceObjectTag extends DisplayListTag {
        actionBlocksPrecedence?: number;
        symbolId?: number;
        flags: number;
        matrix?: Matrix;
        cxform?: ColorTransform;
        className?: string;
        ratio?: number;
        name?: string;
        clipDepth?: number;
        filters?: any[];
        blendMode?: number;
        bmpCache?: number;
        visibility?: boolean;
        backgroundColor?: number;
        events?: ClipEvents[];
    }
    const enum PlaceObjectFlags {
        Move = 1,
        HasCharacter = 2,
        HasMatrix = 4,
        HasColorTransform = 8,
        HasRatio = 16,
        HasName = 32,
        HasClipDepth = 64,
        HasClipActions = 128,
        HasFilterList = 256,
        HasBlendMode = 512,
        HasCacheAsBitmap = 1024,
        HasClassName = 2048,
        HasImage = 4096,
        HasVisible = 8192,
        OpaqueBackground = 16384,
        Reserved = 32768,
    }
    const enum AVM1ClipEvents {
        Load = 1,
        EnterFrame = 2,
        Unload = 4,
        MouseMove = 8,
        MouseDown = 16,
        MouseUp = 32,
        KeyDown = 64,
        KeyUp = 128,
        Data = 256,
        Initialize = 512,
        Press = 1024,
        Release = 2048,
        ReleaseOutside = 4096,
        RollOver = 8192,
        RollOut = 16384,
        DragOver = 32768,
        DragOut = 65536,
        KeyPress = 131072,
        Construct = 262144,
    }
    interface ClipEvents {
        flags: number;
        keyCode?: number;
        actionsBlock: Uint8Array;
    }
    interface Filter {
        type: number;
    }
    interface GlowFilter extends Filter {
        colors: number[];
        ratios?: number[];
        blurX: number;
        blurY: number;
        angle?: number;
        distance?: number;
        strength: number;
        inner: boolean;
        knockout: boolean;
        compositeSource: boolean;
        onTop?: boolean;
        quality: number;
    }
    interface BlurFilter extends Filter {
        blurX: number;
        blurY: number;
        quality: number;
    }
    interface ConvolutionFilter extends Filter {
        matrixX: number;
        matrixY: number;
        divisor: number;
        bias: number;
        matrix: number[];
        color: number;
        clamp: boolean;
        preserveAlpha: boolean;
    }
    interface ColorMatrixFilter extends Filter {
        matrix: number[];
    }
    interface RemoveObjectTag extends DisplayListTag {
        depth: number;
        symbolId?: number;
    }
    interface ImageTag extends DefinitionTag {
        deblock?: number;
        imgData: Uint8Array;
        alphaData?: Uint8Array;
        mimeType: string;
        jpegTables?: {
            data: Uint8Array;
        };
    }
    interface ButtonTag extends DefinitionTag {
        characters?: ButtonCharacter[];
        actionsData?: Uint8Array;
        trackAsMenu?: boolean;
        buttonActions?: ButtonCondAction[];
    }
    interface ButtonCharacter {
        flags: number;
        symbolId?: number;
        depth?: number;
        matrix?: Matrix;
        cxform?: ColorTransform;
        filters?: Filter[];
        blendMode?: number;
        buttonActions?: ButtonCondAction[];
    }
    const enum ButtonCharacterFlags {
        StateUp = 1,
        StateOver = 2,
        StateDown = 4,
        StateHitTest = 8,
        HasFilterList = 16,
        HasBlendMode = 32,
    }
    interface ButtonCondAction {
        keyCode: number;
        stateTransitionFlags: number;
        actionsData: Uint8Array;
    }
    interface BinaryDataTag extends DefinitionTag {
        data: Uint8Array;
    }
    interface FontTag extends DefinitionTag {
        flags: number;
        language?: number;
        name?: string;
        copyright?: string;
        resolution?: number;
        offsets?: number[];
        mapOffset?: number;
        glyphs?: Glyph[];
        codes?: number[];
        ascent?: number;
        descent?: number;
        leading?: number;
        advance?: number[];
        bbox?: Bbox[];
        kerning?: Kerning[];
        data?: Uint8Array;
    }
    const enum FontFlags {
        Bold = 1,
        Italic = 2,
        WideOrHasFontData = 4,
        WideOffset = 8,
        Ansi = 16,
        SmallText = 32,
        ShiftJis = 64,
        HasLayout = 128,
    }
    type Glyph = ShapeRecord[];
    interface StaticTextTag extends DefinitionTag {
        bbox: Bbox;
        matrix: Matrix;
        records: TextRecord[];
    }
    interface TextRecord {
        flags: number;
        fontId?: number;
        color?: number;
        moveX?: number;
        moveY?: number;
        fontHeight?: number;
        glyphCount?: number;
        entries?: TextEntry[];
    }
    const enum TextRecordFlags {
        HasMoveX = 1,
        HasMoveY = 2,
        HasColor = 4,
        HasFont = 8,
    }
    interface TextEntry {
        glyphIndex: number;
        advance: number;
    }
    interface SoundTag extends DefinitionTag {
        soundFormat: number;
        soundRate: number;
        soundSize: number;
        soundType: number;
        samplesCount: number;
        soundData: Uint8Array;
    }
    interface StartSoundTag extends SwfTag {
        soundId?: number;
        soundClassName?: string;
        soundInfo: SoundInfo;
    }
    interface SoundInfo {
        flags: number;
        inPoint?: number;
        outPoint?: number;
        loopCount?: number;
        envelopes?: SoundEnvelope[];
    }
    const enum SoundInfoFlags {
        HasInPoint = 1,
        HasOutPoint = 2,
        HasLoops = 4,
        HasEnvelope = 8,
        NoMultiple = 16,
        Stop = 32,
    }
    interface SoundEnvelope {
        pos44: number;
        volumeLeft: number;
        volumeRight: number;
    }
    interface SoundStreamHeadTag {
        playbackRate: number;
        playbackSize: number;
        playbackType: number;
        streamCompression: number;
        streamRate: number;
        streamSize: number;
        streamType: number;
        samplesCount: number;
        latencySeek?: number;
    }
    interface BitmapTag extends DefinitionTag {
        format: number;
        width: number;
        height: number;
        hasAlpha: boolean;
        colorTableSize?: number;
        bmpData: Uint8Array;
    }
    interface TextTag extends DefinitionTag {
        bbox: Bbox;
        flags: number;
        fontId?: number;
        fontClass?: string;
        fontHeight?: number;
        color?: number;
        maxLength?: number;
        align?: number;
        leftMargin?: number;
        rightMargin?: number;
        indent?: number;
        leading?: number;
        variableName: string;
        initialText?: string;
    }
    const enum TextFlags {
        HasFont = 1,
        HasMaxLength = 2,
        HasColor = 4,
        ReadOnly = 8,
        Password = 16,
        Multiline = 32,
        WordWrap = 64,
        HasText = 128,
        UseOutlines = 256,
        Html = 512,
        WasStatic = 1024,
        Border = 2048,
        NoSelect = 4096,
        HasLayout = 8192,
        AutoSize = 16384,
        HasFontClass = 32768,
    }
    interface Kerning {
        code1: number;
        code2: number;
        adjustment: number;
    }
    interface ScalingGridTag extends SwfTag {
        symbolId: number;
        splitter: Bbox;
    }
    interface SceneTag extends SwfTag {
        scenes: Scene[];
        labels: Label[];
    }
    interface Scene {
        offset: number;
        name: string;
    }
    interface Label {
        frame: number;
        name: string;
    }
    interface ShapeTag extends DefinitionTag {
        lineBounds: Bbox;
        lineBoundsMorph?: Bbox;
        fillBounds?: Bbox;
        fillBoundsMorph?: Bbox;
        flags: number;
        fillStyles: FillStyle[];
        lineStyles: LineStyle[];
        records: ShapeRecord[];
        recordsMorph?: ShapeRecord[];
    }
    const enum ShapeFlags {
        UsesScalingStrokes = 1,
        UsesNonScalingStrokes = 2,
        UsesFillWindingRule = 4,
        IsMorph = 8,
    }
    interface FillStyle {
        type: number;
    }
    interface SolidFill extends FillStyle {
        color: number;
        colorMorph?: number;
    }
    interface GradientFill extends FillStyle {
        matrix: Matrix;
        matrixMorph?: Matrix;
        spreadMode?: number;
        interpolationMode?: number;
        records: GradientRecord[];
        focalPoint?: number;
        focalPointMorph?: number;
    }
    interface GradientRecord {
        ratio: number;
        color: number;
        ratioMorph?: number;
        colorMorph?: number;
    }
    interface BitmapFill extends FillStyle {
        bitmapId: number;
        condition: boolean;
        matrix: Matrix;
        matrixMorph?: Matrix;
    }
    interface LineStyle {
        width: number;
        widthMorph?: number;
        startCapsStyle?: number;
        jointStyle?: number;
        hasFill?: number;
        noHscale?: boolean;
        noVscale?: boolean;
        pixelHinting?: boolean;
        noClose?: boolean;
        endCapsStyle?: number;
        miterLimitFactor?: number;
        fillStyle?: FillStyle;
        color?: number;
        colorMorph?: number;
    }
    interface ShapeRecord {
        type: number;
        flags: number;
        deltaX?: number;
        deltaY?: number;
        controlDeltaX?: number;
        controlDeltaY?: number;
        anchorDeltaX?: number;
        anchorDeltaY?: number;
        moveX?: number;
        moveY?: number;
        fillStyle0?: number;
        fillStyle1?: number;
        lineStyle?: number;
        fillStyles?: FillStyle[];
        lineStyles?: LineStyle[];
        lineBits?: number;
        fillBits?: number;
    }
    const enum ShapeRecordFlags {
        Move = 1,
        HasFillStyle0 = 2,
        HasFillStyle1 = 4,
        HasLineStyle = 8,
        HasNewStyles = 16,
        IsStraight = 32,
        IsGeneral = 64,
        IsVertical = 128,
    }
    interface VideoStreamTag extends DefinitionTag {
        numFrames: number;
        width: number;
        height: number;
        deblocking: number;
        smoothing: boolean;
        codecId: number;
    }
    interface VideoFrameTag extends SwfTag {
        streamId: number;
        frameNum: number;
        videoData: Uint8Array;
    }
}
declare module Shumway {
    interface BinaryFileReaderProgressInfo {
        loaded: number;
        total: number;
    }
    class BinaryFileReader {
        url: string;
        method: string;
        mimeType: string;
        data: any;
        xhr: XMLHttpRequest;
        constructor(url: string, method?: string, mimeType?: string, data?: any);
        readAll(progress: (response: any, loaded: number, total: number) => void, complete: (response: any, error?: any) => void): void;
        readChunked(chunkSize: number, ondata: (data: Uint8Array, progress: BinaryFileReaderProgressInfo) => void, onerror: (err: any) => void, onopen?: () => void, oncomplete?: () => void, onhttpstatus?: (location: string, status: string, responseHeaders: any) => void): void;
        readAsync(ondata: (data: Uint8Array, progress: BinaryFileReaderProgressInfo) => void, onerror: (err: any) => void, onopen?: () => void, oncomplete?: () => void, onhttpstatus?: (location: string, status: string, responseHeaders: any) => void): void;
        abort(): void;
    }
}
declare module Shumway {
    class FlashLog {
        isAS3TraceOn: boolean;
        private _startTime;
        constructor();
        currentTimestamp: number;
        _writeLine(line: string): void;
        writeAS3Trace(msg: string): void;
    }
    var flashlog: FlashLog;
}
/**
 * Copyright 2014 Mozilla Foundation
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
declare module Shumway.Remoting {
    import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    interface IRemotable {
        _id: number;
    }
    /**
     * Remoting phases.
     */
    const enum RemotingPhase {
        /**
         * Objects are serialized. During this phase all reachable remotable objects (all objects
         * reachable from a root set) that are dirty are remoted. This includes all dirty object
         * properties except for dirty references.
         */
        Objects = 0,
        /**
         * Object references are serialized. All objects that are referred to have already been
         * remoted at this point.
         */
        References = 1,
    }
    const enum MessageBits {
        HasMatrix = 1,
        HasBounds = 2,
        HasChildren = 4,
        HasColorTransform = 8,
        HasClipRect = 16,
        HasMiscellaneousProperties = 32,
        HasMask = 64,
        HasClip = 128,
    }
    const enum IDMask {
        None = 0,
        Asset = 134217728,
    }
    /**
     * Serialization Format. All commands start with a message tag.
     */
    const enum MessageTag {
        EOF = 0,
        /**
         * id                   int32,
         * hasBits              int32,
         * matrix               Matrix,
         * colorMatrix          ColorMatrix,
         * mask                 int32,
         * misc
         *   blendMode          int32,
         *   visible            int32
         *
         * @type {number}
         */
        UpdateFrame = 100,
        UpdateGraphics = 101,
        UpdateBitmapData = 102,
        UpdateTextContent = 103,
        UpdateStage = 104,
        UpdateNetStream = 105,
        RequestBitmapData = 106,
        UpdateCurrentMouseTarget = 107,
        DrawToBitmap = 200,
        MouseEvent = 300,
        KeyboardEvent = 301,
        FocusEvent = 302,
    }
    enum FilterType {
        Blur = 0,
        DropShadow = 1,
        ColorMatrix = 2,
    }
    /**
     * Dictates how color transforms are encoded. The majority of color transforms are
     * either identity or only modify the alpha multiplier, so we can encode these more
     * efficiently.
     */
    const enum ColorTransformEncoding {
        /**
         * Identity, no need to serialize all the fields.
         */
        Identity = 0,
        /**
         * Identity w/ AlphaMultiplier, only the alpha multiplier is serialized.
         */
        AlphaMultiplierOnly = 1,
        /**
         * Offsets w/ AlphaMultiplier.
         */
        AlphaMultiplierWithOffsets = 2,
        /**
         * All fields are serialized.
         */
        All = 3,
    }
    /**
     * Dictates how matrices are encoded.
     */
    const enum MatrixEncoding {
        /**
         * Translation only.
         */
        TranslationOnly = 0,
        /**
         * Scale and translation only.
         */
        ScaleAndTranslationOnly = 1,
        /**
         * Uniform scale in the x and y direction and translation only.
         */
        UniformScaleAndTranslationOnly = 2,
        /**
         * All fields are serialized.
         */
        All = 3,
    }
    const enum VideoPlaybackEvent {
        Initialized = 0,
        Metadata = 1,
        PlayStart = 2,
        PlayStop = 3,
        BufferEmpty = 4,
        BufferFull = 5,
        Pause = 6,
        Unpause = 7,
        Seeking = 8,
        Seeked = 9,
        Progress = 10,
        Error = 11,
    }
    const enum VideoControlEvent {
        Init = 1,
        Pause = 2,
        Seek = 3,
        GetTime = 4,
        GetBufferLength = 5,
        SetSoundLevels = 6,
        GetBytesLoaded = 7,
        GetBytesTotal = 8,
        EnsurePlaying = 9,
    }
    const enum StageScaleMode {
        ShowAll = 0,
        ExactFit = 1,
        NoBorder = 2,
        NoScale = 4,
    }
    const enum StageAlignFlags {
        None = 0,
        Top = 1,
        Bottom = 2,
        Left = 4,
        Right = 8,
        TopLeft = 5,
        BottomLeft = 6,
        BottomRight = 10,
        TopRight = 9,
    }
    var MouseEventNames: string[];
    var KeyboardEventNames: string[];
    const enum KeyboardEventFlags {
        CtrlKey = 1,
        AltKey = 2,
        ShiftKey = 4,
    }
    const enum FocusEventType {
        DocumentHidden = 0,
        DocumentVisible = 1,
        WindowBlur = 2,
        WindowFocus = 3,
    }
    interface DisplayParameters {
        stageWidth: number;
        stageHeight: number;
        pixelRatio: number;
        screenWidth: number;
        screenHeight: number;
    }
    interface IGFXServiceObserver {
        displayParameters(displayParameters: DisplayParameters): any;
        focusEvent(data: any): any;
        keyboardEvent(data: any): any;
        mouseEvent(data: any): any;
        videoEvent(id: number, eventType: VideoPlaybackEvent, data: any): any;
    }
    interface IGFXService {
        addObserver(observer: IGFXServiceObserver): any;
        removeObserver(observer: IGFXServiceObserver): any;
        update(updates: DataBuffer, assets: Array<DataBuffer>): void;
        updateAndGet(updates: DataBuffer, assets: Array<DataBuffer>): any;
        frame(): void;
        videoControl(id: number, eventType: VideoControlEvent, data: any): any;
        registerFont(syncId: number, data: Uint8Array): Promise<any>;
        registerImage(syncId: number, symbolId: number, imageType: ImageType, data: Uint8Array, alphaData: Uint8Array): Promise<any>;
        fscommand(command: string, args: string): void;
    }
    /**
     * Messaging peer for sending data synchronously and asynchronously. Currently
     * used by GFX and Player iframes.
     */
    interface ITransportPeer {
        onAsyncMessage: (msg: any) => void;
        onSyncMessage: (msg: any) => any;
        postAsyncMessage(msg: any, transfers?: any[]): void;
        sendSyncMessage(msg: any, transfers?: any[]): any;
    }
    /**
     * Implementation of ITransportPeer that uses standard DOM postMessage and
     * events to exchange data between messaging peers.
     */
    class WindowTransportPeer implements ITransportPeer {
        window: Window;
        target: Window;
        onAsyncMessage: (msg: any) => void;
        onSyncMessage: (msg: any) => any;
        constructor(window: Window, target: Window);
        postAsyncMessage(msg: any, transfers?: any[]): void;
        sendSyncMessage(msg: any, transfers?: any[]): any;
    }
    /**
     * Implementation of ITransportPeer that uses ShumwayCom API to exchange data
     * between messaging peers.
     */
    class ShumwayComTransportPeer implements ITransportPeer {
        onAsyncMessage: (msg: any) => void;
        onSyncMessage: (msg: any) => any;
        postAsyncMessage(msg: any, transfers?: any[]): void;
        sendSyncMessage(msg: any, transfers?: any[]): any;
    }
}
declare var ShumwayEnvironment: {
    DEBUG: string;
    DEVELOPMENT: string;
    RELEASE: string;
    TEST: string;
};
declare var ShumwayCom: {
    environment: string;
    createSpecialInflate?: () => SpecialInflate;
    createRtmpSocket?: (options: {
        host: string;
        port: number;
        ssl: boolean;
    }) => RtmpSocket;
    createRtmpXHR?: () => RtmpXHR;
    createSpecialStorage: () => SpecialStorage;
    getWeakMapKeys: (weakMap) => Array<any>;
    fallback: () => void;
    reportIssue: (details?: string) => void;
    reportTelemetry: (data) => void;
    enableDebug: () => void;
    getPluginParams: () => any;
    getSettings: () => any;
    setClipboard: (data: string) => void;
    setFullscreen: (enabled: boolean) => void;
    externalCom: (args: any) => any;
    loadFile: (args: any) => void;
    abortLoad: (sessionId: number) => void;
    loadSystemResource: (id: number) => void;
    navigateTo: (args: any) => void;
    setupComBridge: (playerWindow: any) => void;
    sendSyncMessage: (data: any) => any;
    postAsyncMessage: (data: any) => void;
    setLoadFileCallback: (callback: (data) => void) => void;
    setExternalCallback: (callback: (call) => any) => void;
    setSystemResourceCallback: (callback: (id: number, data: any) => void) => void;
    setSyncMessageCallback: (callback: (data: any) => any) => void;
    setAsyncMessageCallback: (callback: (data: any) => void) => void;
    getLocalConnectionService: () => LocalConnectionService;
    processFrame?: () => void;
    processFSCommand?: (command: string, args: any) => void;
    print?: (msg: string) => void;
};
interface SpecialStorage {
    getItem(key: string): string;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
interface SpecialInflate {
    setDataCallback(callback: (data: Uint8Array) => void): void;
    push(data: Uint8Array): any;
    close(): any;
}
interface LocalConnectionService {
    createLocalConnection: (connectionName: string, callback: (methodName: string, argsBuffer: ArrayBuffer) => any) => Shumway.LocalConnectionConnectResult;
    hasLocalConnection: (connectionName: string) => boolean;
    closeLocalConnection: (connectionName: string) => Shumway.LocalConnectionCloseResult;
    sendLocalConnectionMessage: (connectionName: string, methodName: string, argsBuffer: ArrayBuffer, sender: Shumway.ILocalConnectionSender, senderDomain: string, senderIsSecure: boolean) => void;
    allowDomainsForLocalConnection: (connectionName: string, domains: string[], secure: boolean) => void;
}
interface RtmpSocket {
    setOpenCallback(callback: () => void): void;
    setDataCallback(callback: (e: {
        data: ArrayBuffer;
    }) => void): void;
    setDrainCallback(callback: () => void): void;
    setErrorCallback(callback: (e: any) => void): void;
    setCloseCallback(callback: () => void): void;
    send(buffer: ArrayBuffer, offset: number, count: number): boolean;
    close(): void;
}
interface RtmpXHR {
    status: number;
    response: any;
    responseType: string;
    setLoadCallback(callback: () => void): void;
    setErrorCallback(callback: () => void): void;
    open(method: string, path: string, async?: boolean): void;
    setRequestHeader(header: string, value: string): void;
    send(data?: any): void;
}
declare var throwError: (className: string, error: any, replacement1?: any, replacement2?: any, replacement3?: any, replacement4?: any) => void;
declare var Errors: any;
