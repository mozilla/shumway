/// <reference path="avm2.d.ts" />
/// <reference path="../../src/avm1/flash.d.ts" />
declare module Shumway.AVM1 {
    var avm1TraceEnabled: any;
    var avm1ErrorsEnabled: any;
    var avm1WarningsEnabled: any;
    var avm1TimeoutDisabled: any;
    var avm1CompilerEnabled: any;
    var avm1DebuggerEnabled: any;
    var avm1WellknownActionsCompilationsEnabled: any;
}
declare module Shumway.AVM1 {
    class ActionsDataStream {
        private array;
        position: number;
        end: number;
        private readANSI;
        constructor(array: any, swfVersion: any);
        readUI8(): number;
        readUI16(): number;
        readSI16(): number;
        readInteger(): number;
        readFloat(): number;
        readDouble(): number;
        readBoolean(): boolean;
        readANSIString(): string;
        readUTF8String(): string;
        readString(): string;
        readBytes(length: any): Uint8Array;
    }
}
declare module Shumway.AVM1 {
    const enum ActionCode {
        None = 0,
        ActionGotoFrame = 129,
        ActionGetURL = 131,
        ActionNextFrame = 4,
        ActionPreviousFrame = 5,
        ActionPlay = 6,
        ActionStop = 7,
        ActionToggleQuality = 8,
        ActionStopSounds = 9,
        ActionWaitForFrame = 138,
        ActionSetTarget = 139,
        ActionGoToLabel = 140,
        ActionPush = 150,
        ActionPop = 23,
        ActionAdd = 10,
        ActionSubtract = 11,
        ActionMultiply = 12,
        ActionDivide = 13,
        ActionEquals = 14,
        ActionLess = 15,
        ActionAnd = 16,
        ActionOr = 17,
        ActionNot = 18,
        ActionStringEquals = 19,
        ActionStringLength = 20,
        ActionMBStringLength = 49,
        ActionStringAdd = 33,
        ActionStringExtract = 21,
        ActionMBStringExtract = 53,
        ActionStringLess = 41,
        ActionToInteger = 24,
        ActionCharToAscii = 50,
        ActionMBCharToAscii = 54,
        ActionAsciiToChar = 51,
        ActionMBAsciiToChar = 55,
        ActionJump = 153,
        ActionIf = 157,
        ActionCall = 158,
        ActionGetVariable = 28,
        ActionSetVariable = 29,
        ActionGetURL2 = 154,
        ActionGotoFrame2 = 159,
        ActionSetTarget2 = 32,
        ActionGetProperty = 34,
        ActionSetProperty = 35,
        ActionCloneSprite = 36,
        ActionRemoveSprite = 37,
        ActionStartDrag = 39,
        ActionEndDrag = 40,
        ActionWaitForFrame2 = 141,
        ActionTrace = 38,
        ActionGetTime = 52,
        ActionRandomNumber = 48,
        ActionCallFunction = 61,
        ActionCallMethod = 82,
        ActionConstantPool = 136,
        ActionDefineFunction = 155,
        ActionDefineLocal = 60,
        ActionDefineLocal2 = 65,
        ActionDelete = 58,
        ActionDelete2 = 59,
        ActionEnumerate = 70,
        ActionEquals2 = 73,
        ActionGetMember = 78,
        ActionInitArray = 66,
        ActionInitObject = 67,
        ActionNewMethod = 83,
        ActionNewObject = 64,
        ActionSetMember = 79,
        ActionTargetPath = 69,
        ActionWith = 148,
        ActionToNumber = 74,
        ActionToString = 75,
        ActionTypeOf = 68,
        ActionAdd2 = 71,
        ActionLess2 = 72,
        ActionModulo = 63,
        ActionBitAnd = 96,
        ActionBitLShift = 99,
        ActionBitOr = 97,
        ActionBitRShift = 100,
        ActionBitURShift = 101,
        ActionBitXor = 98,
        ActionDecrement = 81,
        ActionIncrement = 80,
        ActionPushDuplicate = 76,
        ActionReturn = 62,
        ActionStackSwap = 77,
        ActionStoreRegister = 135,
        ActionInstanceOf = 84,
        ActionEnumerate2 = 85,
        ActionStrictEquals = 102,
        ActionGreater = 103,
        ActionStringGreater = 104,
        ActionDefineFunction2 = 142,
        ActionExtends = 105,
        ActionCastOp = 43,
        ActionImplementsOp = 44,
        ActionTry = 143,
        ActionThrow = 42,
        ActionFSCommand2 = 45,
        ActionStrictMode = 137,
    }
    class ParsedPushRegisterAction {
        registerNumber: number;
        constructor(registerNumber: number);
    }
    class ParsedPushConstantAction {
        constantIndex: number;
        constructor(constantIndex: number);
    }
    interface ParsedAction {
        position: number;
        actionCode: number;
        actionName: string;
        args: any[];
    }
    interface ArgumentAssignment {
        type: ArgumentAssignmentType;
        name?: string;
        index?: number;
    }
    const enum ArgumentAssignmentType {
        None = 0,
        Argument = 1,
        This = 2,
        Arguments = 4,
        Super = 8,
        Global = 16,
        Parent = 32,
        Root = 64,
    }
    class ActionsDataParser {
        dataId: string;
        private _stream;
        private _actionsData;
        constructor(actionsData: AVM1ActionsData, swfVersion: number);
        position: number;
        eof: boolean;
        length: number;
        readNext(): ParsedAction;
        skip(count: any): void;
    }
}
declare module Shumway.AVM1 {
    interface ActionCodeBlock {
        label: number;
        items: ActionCodeBlockItem[];
        jump: number;
    }
    interface ActionCodeBlockItem {
        action: ParsedAction;
        next: number;
        conditionalJumpTo: number;
    }
    interface AnalyzerResults {
        /** Sparsed array with compiled actions, index is an original location
         *  in the binary actions data */
        actions: ActionCodeBlockItem[];
        blocks: ActionCodeBlock[];
        dataId: string;
        singleConstantPool: any[];
        registersLimit: number;
    }
    class ActionsDataAnalyzer {
        parentResults: AnalyzerResults;
        registersLimit: number;
        constructor();
        analyze(parser: ActionsDataParser): AnalyzerResults;
    }
}
declare module Shumway.AVM1 {
    /**
     * Base class for object instances we prefer to not inherit Object.prototype properties.
     */
    class NullPrototypeObject {
    }
    const enum AVM1PropertyFlags {
        DONT_ENUM = 1,
        DONT_DELETE = 2,
        READ_ONLY = 4,
        DATA = 64,
        ACCESSOR = 128,
        ASSETPROP_MASK = 7,
    }
    const enum AVM1DefaultValueHint {
        NUMBER = 0,
        STRING = 1,
    }
    interface IAVM1Callable {
        alCall(thisArg: any, args?: any[]): any;
    }
    interface IAVM1PropertyWatcher {
        name: any;
        callback: IAVM1Callable;
        userData: any;
    }
    class AVM1PropertyDescriptor {
        flags: AVM1PropertyFlags;
        value: any;
        get: IAVM1Callable;
        set: IAVM1Callable;
        watcher: IAVM1PropertyWatcher;
        originalName: string;
        constructor(flags: AVM1PropertyFlags, value?: any, get?: IAVM1Callable, set?: IAVM1Callable, watcher?: IAVM1PropertyWatcher);
    }
    interface IAVM1Builtins {
        Object: AVM1Object;
        Function: AVM1Object;
        Boolean: AVM1Object;
        Number: AVM1Object;
        String: AVM1Object;
        Array: AVM1Object;
        Date: AVM1Object;
        Math: AVM1Object;
        Error: AVM1Object;
    }
    interface IAVM1Context {
        builtins: IAVM1Builtins;
        swfVersion: number;
        isPropertyCaseSensitive: boolean;
        registerClass(name: string, cls: AVM1Object): void;
    }
    /**
     * Base class for the ActionScript AVM1 object.
     */
    class AVM1Object extends NullPrototypeObject {
        private _ownProperties;
        private _prototype;
        private _avm1Context;
        context: AVM1Context;
        constructor(avm1Context: IAVM1Context);
        alPrototype: AVM1Object;
        alGetPrototypeProperty(): AVM1Object;
        alSetOwnPrototypeProperty(v: any): void;
        alGetConstructorProperty(): AVM1Object;
        alSetOwnConstructorProperty(v: any): void;
        _debugEscapeProperty(p: any): string;
        alGetOwnProperty(name: any): AVM1PropertyDescriptor;
        alSetOwnProperty(p: any, desc: AVM1PropertyDescriptor): void;
        alHasOwnProperty(p: any): boolean;
        alDeleteOwnProperty(p: any): void;
        alGetOwnPropertiesKeys(): string[];
        alGetProperty(p: any): AVM1PropertyDescriptor;
        alGet(p: any): any;
        alCanPut(p: any): boolean;
        alPut(p: any, v: any): void;
        alHasProperty(p: any): boolean;
        alDeleteProperty(p: any): boolean;
        alAddPropertyWatcher(p: any, callback: IAVM1Callable, userData: any): boolean;
        alRemotePropertyWatcher(p: any): boolean;
        alDefaultValue(hint?: AVM1DefaultValueHint): any;
        alGetKeys(): string[];
    }
    /**
     * Base class for ActionsScript functions.
     */
    class AVM1Function extends AVM1Object implements IAVM1Callable {
        constructor(context: IAVM1Context);
        alConstruct(args?: any[]): AVM1Object;
        alCall(thisArg: any, args?: any[]): any;
        /**
         * Wraps the function to the callable JavaScript function.
         * @returns {Function} a JavaScript function.
         */
        toJSFunction(thisArg?: AVM1Object): Function;
    }
    /**
     * Base class for ActionScript functions with native JavaScript implementation.
     */
    class AVM1NativeFunction extends AVM1Function {
        private _fn;
        private _ctor;
        /**
         * @param {IAVM1Context} context
         * @param {Function} fn The native function for regular calling.
         * @param {Function} ctor The native function for construction.
         */
        constructor(context: IAVM1Context, fn: Function, ctor?: Function);
        alConstruct(args?: any[]): AVM1Object;
        alCall(thisArg: any, args?: any[]): any;
    }
    /**
     * Base class the is used for the interpreter.
     * See {AVM1InterpretedFunction} implementation
     */
    class AVM1EvalFunction extends AVM1Function {
        constructor(context: IAVM1Context);
        alConstruct(args?: any[]): AVM1Object;
    }
    function alToPrimitive(context: IAVM1Context, v: any, preferredType?: AVM1DefaultValueHint): any;
    function alToBoolean(context: IAVM1Context, v: any): boolean;
    function alToNumber(context: IAVM1Context, v: any): number;
    function alToInteger(context: IAVM1Context, v: any): number;
    function alToInt32(context: IAVM1Context, v: any): number;
    function alToString(context: IAVM1Context, v: any): string;
    function alIsName(context: IAVM1Context, v: any): boolean;
    function alToObject(context: IAVM1Context, v: any): AVM1Object;
    function alNewObject(context: IAVM1Context): AVM1Object;
    function alGetObjectClass(obj: AVM1Object): string;
    /**
     * Non-standard string coercion function roughly matching the behavior of AVM2's axCoerceString.
     *
     * This is useful when dealing with AVM2 objects in the implementation of AVM1 builtins: they
     * frequently expect either a string or `null`, but not `undefined`.
     */
    function alCoerceString(context: IAVM1Context, x: any): string;
    function alCoerceNumber(context: IAVM1Context, x: any): number;
    function alIsIndex(context: IAVM1Context, p: any): boolean;
    function alForEachProperty(obj: AVM1Object, fn: (name: string) => void, thisArg?: any): void;
    function alIsFunction(obj: any): boolean;
    function alCallProperty(obj: AVM1Object, p: any, args?: any[]): any;
    function alInstanceOf(context: IAVM1Context, obj: any, cls: any): boolean;
    function alIsArray(context: IAVM1Context, v: any): boolean;
    function alIsArrayLike(context: IAVM1Context, v: any): boolean;
    function alIterateArray(context: IAVM1Context, arr: AVM1Object, fn: (obj: any, index?: number) => void, thisArg?: any): void;
    function alIsString(context: IAVM1Context, v: any): boolean;
    function alDefineObjectProperties(obj: AVM1Object, descriptors: any): void;
}
declare module Shumway.AVM1.Natives {
    class AVM1ObjectFunction extends AVM1Function {
        constructor(context: IAVM1Context);
        registerClass(name: any, theClass: any): void;
        alConstruct(args?: any[]): AVM1Object;
        alCall(thisArg: any, args?: any[]): any;
    }
    class AVM1FunctionFunction extends AVM1Function {
        constructor(context: IAVM1Context);
        alConstruct(args?: any[]): AVM1Object;
        alCall(thisArg: any, args?: any[]): any;
    }
    class AVM1BooleanNative extends AVM1Object {
        value: boolean;
        constructor(context: IAVM1Context, value: boolean);
        valueOf(): any;
    }
    class AVM1BooleanPrototype extends AVM1Object {
        constructor(context: IAVM1Context);
        _valueOf(): boolean;
        _toString(): string;
    }
    class AVM1BooleanFunction extends AVM1Function {
        constructor(context: IAVM1Context);
        alConstruct(args?: any[]): AVM1Object;
        alCall(thisArg: any, args?: any[]): any;
    }
    class AVM1NumberNative extends AVM1Object {
        value: number;
        constructor(context: IAVM1Context, value: number);
        valueOf(): any;
    }
    class AVM1NumberPrototype extends AVM1Object {
        constructor(context: IAVM1Context);
        _valueOf(): number;
        _toString(radix: any): string;
    }
    class AVM1NumberFunction extends AVM1Function {
        constructor(context: IAVM1Context);
        alConstruct(args?: any[]): AVM1Object;
        alCall(thisArg: any, args?: any[]): any;
    }
    class AVM1StringNative extends AVM1Object {
        value: string;
        constructor(context: IAVM1Context, value: string);
        toString(): string;
    }
    class AVM1StringPrototype extends AVM1Object {
        constructor(context: IAVM1Context);
        _valueOf(): string;
        _toString(): string;
        getLength(): number;
        charAt(index: number): string;
        charCodeAt(index: number): number;
        concat(...items: AVM1Object[]): string;
        indexOf(searchString: string, position?: number): number;
        lastIndexOf(searchString: string, position?: number): number;
        slice(start: number, end?: number): string;
        split(separator: any, limit?: number): AVM1ArrayNative;
        substr(start: number, length?: number): string;
        substring(start: number, end?: number): string;
        toLowerCase(): string;
        toUpperCase(): string;
    }
    class AVM1StringFunction extends AVM1Function {
        constructor(context: IAVM1Context);
        alConstruct(args?: any[]): AVM1Object;
        alCall(thisArg: any, args?: any[]): any;
        fromCharCode(...codes: number[]): string;
    }
    class AVM1ArrayNative extends AVM1Object {
        value: any[];
        constructor(context: IAVM1Context, value: any[]);
        alGetOwnProperty(p: any): AVM1PropertyDescriptor;
        alSetOwnProperty(p: any, v: AVM1PropertyDescriptor): void;
        alDeleteOwnProperty(p: any): void;
        alGetOwnPropertiesKeys(): string[];
        /**
         * Creates a JavaScript array from the AVM1 list object.
         * @param arr     An array-like AVM1 object.
         * @param fn      A function that converts AVM1 list object item to JavaScript object.
         * @param thisArg Optional. Value to use as this when executing fn.
         * @returns {any[]} A JavaScript array.
         */
        static mapToJSArray(arr: AVM1Object, fn: (item: any, index?: number) => any, thisArg?: any): any[];
    }
    class AVM1ArrayPrototype extends AVM1Object {
        constructor(context: IAVM1Context);
        _toString(): any;
        getLength(): number;
        setLength(length: number): void;
        concat(...items: any[]): AVM1Object;
        join(separator?: string): string;
        pop(): any;
        push(...items: any[]): number;
        shift(): any;
        slice(start: number, end?: number): AVM1Object;
        splice(start: number, deleteCount: number, ...items: any[]): AVM1Object;
        sort(comparefn?: AVM1Function): AVM1Object;
        sortOn(fieldNames: AVM1Object, options: any): AVM1Object;
        unshift(...items: any[]): number;
    }
    class AVM1ArrayFunction extends AVM1Function {
        constructor(context: IAVM1Context);
        alConstruct(args?: any[]): AVM1Object;
        alCall(thisArg: any, args?: any[]): any;
    }
    class AVM1ErrorNative extends AVM1Object {
        constructor(context: IAVM1Context, message: string);
    }
    class AVM1ErrorPrototype extends AVM1Object {
        constructor(context: IAVM1Context);
        _toString(): any;
    }
    class AVM1ErrorFunction extends AVM1Function {
        constructor(context: IAVM1Context);
        alConstruct(args?: any[]): AVM1Object;
        alCall(thisArg: any, args?: any[]): any;
    }
    /**
     * Installs built-ins on the AVM1Context. It shall be a first call before
     * any AVM1Object is instantiated.
     * @param {IAVM1Context} context
     */
    function installBuiltins(context: IAVM1Context): void;
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
declare module Shumway.AVM1 {
    import flash = Shumway.AVMX.AS.flash;
    import AVM1MovieClip = Lib.AVM1MovieClip;
    import AVM1Globals = Lib.AVM1Globals;
    class AVM1ActionsData {
        bytes: Uint8Array;
        id: string;
        parent: AVM1ActionsData;
        ir: AnalyzerResults;
        compiled: Function;
        constructor(bytes: Uint8Array, id: string, parent?: AVM1ActionsData);
    }
    interface AVM1ExportedSymbol {
        symbolId: number;
        symbolProps: any;
    }
    interface IAVM1RuntimeUtils {
        hasProperty(obj: any, name: any): boolean;
        getProperty(obj: any, name: any): any;
        setProperty(obj: any, name: any, value: any): void;
        warn(msg: string): void;
    }
    interface IAVM1EventPropertyObserver {
        onEventPropertyModified(name: string): any;
    }
    class ActionsDataFactory {
        private _cache;
        createActionsData(bytes: Uint8Array, id: string, parent?: AVM1ActionsData): AVM1ActionsData;
    }
    class AVM1Context implements IAVM1Context {
        loaderInfo: Shumway.AVMX.AS.flash.display.LoaderInfo;
        sec: ISecurityDomain;
        globals: AVM1Globals;
        builtins: IAVM1Builtins;
        isPropertyCaseSensitive: boolean;
        actionsDataFactory: ActionsDataFactory;
        swfVersion: number;
        levelsContainer: flash.display.AVM1Movie;
        private eventObservers;
        private assets;
        private assetsSymbols;
        private assetsClasses;
        private staticStates;
        constructor(swfVersion: number);
        utils: IAVM1RuntimeUtils;
        static create: (loaderInfo: Shumway.AVMX.AS.flash.display.LoaderInfo) => AVM1Context;
        resolveTarget(target: any): any;
        resolveRoot(): any;
        checkTimeout(): void;
        executeActions(actionsData: AVM1ActionsData, scopeObj: any): void;
        executeFunction(fn: AVM1Function, thisArg: any, args: any): any;
        /**
         * Normalize the name according to the current AVM1Context's settings.
         *
         * This entails coercing it to number or string. For SWF versions < 7, it also means converting
         * it to lower-case.
         * To avoid runtime checks, the implementation is set during context initialization based on
         * the SWF version.
         */
        normalizeName: (name) => string;
        private normalizeNameCaseSensitive(name);
        private _nameCache;
        private normalizeNameCaseInsensitive(name);
        private _getEventPropertyObservers(propertyName, create);
        registerEventPropertyObserver(propertyName: string, observer: IAVM1EventPropertyObserver): void;
        unregisterEventPropertyObserver(propertyName: string, observer: IAVM1EventPropertyObserver): void;
        broadcastEventPropertyChange(propertyName: string): void;
        addAsset(className: string, symbolId: number, symbolProps: any): void;
        registerClass(className: string, theClass: AVM1Object): void;
        getSymbolClass(symbolId: number): AVM1Object;
        getAsset(className: string): AVM1ExportedSymbol;
        setStage(stage: Shumway.AVMX.AS.flash.display.Stage): void;
        getStaticState(cls: any): any;
        resolveLevel(level: number): AVM1MovieClip;
    }
}
declare module Shumway.AVM1 {
    var Debugger: {
        pause: boolean;
        breakpoints: {};
    };
    var MAX_AVM1_HANG_TIMEOUT: number;
    var CHECK_AVM1_HANG_EVERY: number;
    function generateActionCalls(): {
        ActionGotoFrame: any;
        ActionGetURL: any;
        ActionNextFrame: any;
        ActionPreviousFrame: any;
        ActionPlay: any;
        ActionStop: any;
        ActionToggleQuality: any;
        ActionStopSounds: any;
        ActionWaitForFrame: any;
        ActionSetTarget: any;
        ActionGoToLabel: any;
        ActionPush: any;
        ActionPop: any;
        ActionAdd: any;
        ActionSubtract: any;
        ActionMultiply: any;
        ActionDivide: any;
        ActionEquals: any;
        ActionLess: any;
        ActionAnd: any;
        ActionOr: any;
        ActionNot: any;
        ActionStringEquals: any;
        ActionStringLength: any;
        ActionMBStringLength: any;
        ActionStringAdd: any;
        ActionStringExtract: any;
        ActionMBStringExtract: any;
        ActionStringLess: any;
        ActionToInteger: any;
        ActionCharToAscii: any;
        ActionMBCharToAscii: any;
        ActionAsciiToChar: any;
        ActionMBAsciiToChar: any;
        ActionJump: any;
        ActionIf: any;
        ActionCall: any;
        ActionGetVariable: any;
        ActionSetVariable: any;
        ActionGetURL2: any;
        ActionGotoFrame2: any;
        ActionSetTarget2: any;
        ActionGetProperty: any;
        ActionSetProperty: any;
        ActionCloneSprite: any;
        ActionRemoveSprite: any;
        ActionStartDrag: any;
        ActionEndDrag: any;
        ActionWaitForFrame2: any;
        ActionTrace: any;
        ActionGetTime: any;
        ActionRandomNumber: any;
        ActionCallFunction: any;
        ActionCallMethod: any;
        ActionConstantPool: any;
        ActionDefineFunction: any;
        ActionDefineLocal: any;
        ActionDefineLocal2: any;
        ActionDelete: any;
        ActionDelete2: any;
        ActionEnumerate: any;
        ActionEquals2: any;
        ActionGetMember: any;
        ActionInitArray: any;
        ActionInitObject: any;
        ActionNewMethod: any;
        ActionNewObject: any;
        ActionSetMember: any;
        ActionTargetPath: any;
        ActionWith: any;
        ActionToNumber: any;
        ActionToString: any;
        ActionTypeOf: any;
        ActionAdd2: any;
        ActionLess2: any;
        ActionModulo: any;
        ActionBitAnd: any;
        ActionBitLShift: any;
        ActionBitOr: any;
        ActionBitRShift: any;
        ActionBitURShift: any;
        ActionBitXor: any;
        ActionDecrement: any;
        ActionIncrement: any;
        ActionPushDuplicate: any;
        ActionReturn: any;
        ActionStackSwap: any;
        ActionStoreRegister: any;
        ActionInstanceOf: any;
        ActionEnumerate2: any;
        ActionStrictEquals: any;
        ActionGreater: any;
        ActionStringGreater: any;
        ActionDefineFunction2: any;
        ActionExtends: any;
        ActionCastOp: any;
        ActionImplementsOp: any;
        ActionTry: any;
        ActionThrow: any;
        ActionFSCommand2: any;
        ActionStrictMode: any;
    };
    enum MovieClipProperties {
        _x = 0,
        _y = 1,
        _xscale = 2,
        _yscale = 3,
        _currentframe = 4,
        _totalframes = 5,
        _alpha = 6,
        _visible = 7,
        _width = 8,
        _height = 9,
        _rotation = 10,
        _target = 11,
        _framesloaded = 12,
        _name = 13,
        _droptarget = 14,
        _url = 15,
        _highquality = 16,
        _focusrect = 17,
        _soundbuftime = 18,
        _quality = 19,
        _xmouse = 20,
        _ymouse = 21,
    }
}
declare module Shumway.AVM1 {
    /**
     *  Bare-minimum JavaScript code generator to make debugging better.
     */
    class ActionsDataCompiler {
        private convertArgs(args, id, res, ir);
        private convertAction(item, id, res, indexInBlock, ir);
        generate(ir: AnalyzerResults): Function;
    }
    function findWellknowCompilation(actionsData: AVM1ActionsData, context: AVM1Context): Function;
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
declare module Shumway.AVM1.Lib {
    import ASObject = Shumway.AVMX.AS.ASObject;
    import flash = Shumway.AVMX.AS.flash;
    var DEPTH_OFFSET: number;
    interface IHasAS3ObjectReference {
        _as3Object: ASObject;
    }
    interface IAVM1SymbolBase extends IHasAS3ObjectReference {
        context: AVM1Context;
        initAVM1SymbolInstance(context: AVM1Context, as3Object: flash.display.InteractiveObject): any;
        updateAllEvents(): any;
        getDepth(): number;
    }
    class AVM1EventHandler {
        propertyName: string;
        eventName: string;
        argsConverter: Function;
        constructor(propertyName: string, eventName: string, argsConverter?: Function);
        onBind(target: IAVM1SymbolBase): void;
        onUnbind(target: IAVM1SymbolBase): void;
    }
    /**
     * Checks if an object contains a reference to a native AS3 object.
     * Returns false for MovieClip instances or instances of constructors with
     * MovieClip on their prototype chain that were created in script using,
     * e.g. new MovieClip(). Those lack the part of their internal structure
     * that makes them displayable.
     */
    function hasAS3ObjectReference(obj: any): boolean;
    /**
     * Returns obj's reference to a native AS3 object. If the reference
     * does not exist, returns undefined.
     */
    function getAS3Object(obj: IHasAS3ObjectReference): ASObject;
    /**
     * Returns obj's reference to a native AS3 object. If the reference
     * doesn't exist, obj was created in script, e.g. with new MovieClip(),
     * and doesn't reflect a real, displayable display object. In that case,
     * an empty null-proto object is created and returned. This is used for
     * classes that are linked to embedded symbols that extend MovieClip. Their
     * inheritance chain is built by assigning new MovieClip to their prototype.
     * When a proper, displayable, instance of such a class is created via
     * attachMovie, initial values for properties such as tabEnabled
     * can be initialized from values set on the template object.
     */
    function getAS3ObjectOrTemplate<T extends flash.display.InteractiveObject>(obj: AVM1SymbolBase<T>): T;
    class AVM1LoaderHelper {
        private _loader;
        private _context;
        loader: flash.display.Loader;
        loaderInfo: flash.display.LoaderInfo;
        content: flash.display.DisplayObject;
        constructor(context: AVM1Context);
        load(url: string, method: string): Promise<flash.display.DisplayObject>;
    }
    class AVM1SymbolBase<T extends flash.display.InteractiveObject> extends AVM1Object implements IAVM1SymbolBase, IAVM1EventPropertyObserver {
        _as3Object: T;
        _as3ObjectTemplate: any;
        initAVM1SymbolInstance(context: AVM1Context, as3Object: T): void;
        private _eventsMap;
        private _events;
        private _eventsListeners;
        bindEvents(events: AVM1EventHandler[], autoUnbind?: boolean): void;
        unbindEvents(): void;
        updateAllEvents(): void;
        private _updateEvent(event);
        private _addEventListener(event);
        private _removeEventListener(event);
        onEventPropertyModified(propertyName: string): void;
        get_alpha(): number;
        set_alpha(value: number): void;
        getBlendMode(): string;
        setBlendMode(value: string): void;
        getCacheAsBitmap(): boolean;
        setCacheAsBitmap(value: boolean): void;
        getFilters(): AVM1Object;
        setFilters(value: any): void;
        get_focusrect(): boolean;
        set_focusrect(value: boolean): void;
        get_height(): number;
        set_height(value: number): void;
        get_highquality(): number;
        set_highquality(value: number): void;
        getMenu(): void;
        setMenu(value: any): void;
        get_name(): string;
        set_name(value: string): void;
        get_parent(): AVM1MovieClip;
        set_parent(value: AVM1MovieClip): void;
        getOpaqueBackground(): number;
        setOpaqueBackground(value: number): void;
        get_quality(): string;
        set_quality(value: any): void;
        get_root(): AVM1MovieClip;
        get_rotation(): number;
        set_rotation(value: number): void;
        getScale9Grid(): AVM1Rectangle;
        setScale9Grid(value: AVM1Rectangle): void;
        getScrollRect(): AVM1Rectangle;
        setScrollRect(value: AVM1Rectangle): void;
        get_soundbuftime(): number;
        set_soundbuftime(value: number): void;
        getTabEnabled(): boolean;
        setTabEnabled(value: boolean): void;
        getTabIndex(): number;
        setTabIndex(value: number): void;
        get_target(): string;
        getTransform(): AVM1Object;
        setTransform(value: AVM1Transform): void;
        get_visible(): boolean;
        set_visible(value: boolean): void;
        get_url(): string;
        get_width(): number;
        set_width(value: number): void;
        get_x(): number;
        set_x(value: number): void;
        get_xmouse(): number;
        get_xscale(): number;
        set_xscale(value: number): void;
        get_y(): number;
        set_y(value: number): void;
        get_ymouse(): number;
        get_yscale(): number;
        set_yscale(value: number): void;
        getDepth(): number;
    }
    var BlendModesMap: string[];
    function avm1HasEventProperty(context: AVM1Context, target: any, propertyName: string): boolean;
    function avm1BroadcastEvent(context: AVM1Context, target: any, propertyName: string, args?: any[]): void;
    function getAVM1Object(as3Object: any, context: AVM1Context): AVM1Object;
    function wrapAVM1NativeMembers(context: AVM1Context, wrap: AVM1Object, obj: any, members: string[], prefixFunctions?: boolean): void;
    function wrapAVM1NativeClass(context: AVM1Context, wrapAsFunction: boolean, cls: typeof AVM1Object, staticMembers: string[], members: string[], call?: Function, cstr?: Function): AVM1Object;
    function initializeAVM1Object(as3Object: any, context: AVM1Context, placeObjectTag: any): void;
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
declare module Shumway.AVM1.Lib {
    class AVM1Globals extends AVM1Object {
        static createGlobalsObject(context: AVM1Context): AVM1Globals;
        constructor(context: AVM1Context);
        flash: AVM1Object;
        ASSetPropFlags(obj: any, children: any, flags: any, allowFalse: any): any;
        clearInterval(id: number): void;
        clearTimeout(id: number): void;
        /**
         * AVM1 escapes slightly more characters than JS's encodeURIComponent, and even more than
         * the deprecated JS version of escape. That leaves no other option but to do manual post-
         * processing of the encoded result. :/
         *
         * Luckily, unescape isn't thus afflicted - it happily unescapes all the additional things
         * we escape here.
         */
        escape(str: string): string;
        unescape(str: string): string;
        setInterval(): any;
        setTimeout(): number;
        showRedrawRegions(enable: any, color: any): void;
        trace(expression: any): any;
        updateAfterEvent(): void;
        NaN: number;
        Infinity: number;
        isFinite(n: number): boolean;
        isNaN(n: number): boolean;
        parseFloat(s: string): number;
        parseInt(s: string, radix?: number): number;
        undefined: any;
        Object: AVM1Object;
        Function: AVM1Object;
        Array: AVM1Object;
        Number: AVM1Object;
        Math: AVM1Object;
        Boolean: AVM1Object;
        Date: AVM1Object;
        String: AVM1Object;
        Error: AVM1Object;
        MovieClip: AVM1Object;
        AsBroadcaster: AVM1Object;
        System: AVM1Object;
        Stage: AVM1Object;
        Button: AVM1Object;
        TextField: AVM1Object;
        Color: AVM1Object;
        Key: AVM1Object;
        Mouse: AVM1Object;
        MovieClipLoader: AVM1Object;
        LoadVars: AVM1Object;
        Sound: AVM1Object;
        SharedObject: AVM1Object;
        ContextMenu: AVM1Object;
        ContextMenuItem: AVM1Object;
        TextFormat: AVM1Object;
        XMLNode: AVM1Object;
        XML: AVM1Object;
        filters: AVM1Object;
        BitmapData: AVM1Object;
        Matrix: AVM1Object;
        Point: AVM1Object;
        Rectangle: AVM1Object;
        Transform: AVM1Object;
        ColorTransform: AVM1Object;
        private _initBuiltins(context);
        private _initializeFlashObject(context);
    }
    class AVM1NativeActions {
        context: AVM1Context;
        constructor(context: AVM1Context);
        asfunction(link: any): void;
        call(frame: any): void;
        chr(code: any): string;
        duplicateMovieClip(target: any, newname: any, depth: any): void;
        fscommand(command: string, args?: string): any;
        getTimer(): number;
        getURL(url: any, target?: any, method?: any): void;
        gotoAndPlay(scene: any, frame?: any): void;
        gotoAndStop(scene: any, frame?: any): void;
        ifFrameLoaded(scene: any, frame?: any): boolean;
        length_(expression: any): number;
        loadMovie(url: string, target: any, method: string): void;
        loadMovieNum(url: any, level: any, method: any): any;
        loadVariables(url: string, target: any, method?: string): void;
        loadVariablesNum(url: string, level: number, method?: string): void;
        _loadVariables(nativeTarget: IAVM1SymbolBase, url: string, method: string): void;
        mbchr(code: any): string;
        mblength(expression: any): number;
        mbord(character: any): number;
        mbsubstring(value: any, index: any, count: any): string;
        nextFrame(): void;
        nextScene(): void;
        ord(character: any): number;
        play(): void;
        prevFrame(): void;
        prevScene(): void;
        print(target: any, boundingBox: any): void;
        printAsBitmap(target: any, boundingBox: any): void;
        printAsBitmapNum(level: any, boundingBox: any): void;
        printNum(level: any, bondingBox: any): void;
        random(value: any): number;
        removeMovieClip(target: any): void;
        startDrag(target?: any, ...args: any[]): void;
        stop(): void;
        stopAllSounds(): void;
        stopDrag(): void;
        substring(value: any, index: any, count: any): string;
        toggleHighQuality(): void;
        trace(expression: any): void;
        unloadMovie(target: any): void;
        unloadMovieNum(level: number): void;
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
declare module Shumway.AVM1.Lib {
    class AVM1Broadcaster extends AVM1Object {
        static createAVM1Class(context: AVM1Context): AVM1Object;
        static initialize(context: AVM1Context, obj: AVM1Object): void;
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
declare module Shumway.AVM1.Lib {
    import flash = Shumway.AVMX.AS.flash;
    class AVM1Key extends AVM1Object {
        static DOWN: number;
        static LEFT: number;
        static RIGHT: number;
        static UP: number;
        private static _keyStates;
        private static _lastKeyCode;
        static createAVM1Class(context: AVM1Context): AVM1Object;
        static alInitStatic(context: AVM1Context): void;
        static bindStage(context: AVM1Context, cls: AVM1Object, stage: flash.display.Stage): void;
        static isDown(context: AVM1Context, code: any): boolean;
        static getCode(context: AVM1Context): number;
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
declare module Shumway.AVM1.Lib {
    import flash = Shumway.AVMX.AS.flash;
    class AVM1Mouse extends AVM1Object {
        static createAVM1Class(context: AVM1Context): AVM1Object;
        static bindStage(context: AVM1Context, cls: AVM1Object, stage: flash.display.Stage): void;
        static hide(): void;
        static show(): void;
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
declare module Shumway.AVM1.Lib {
    class AVM1Stage extends AVM1Object {
        static createAVM1Class(context: AVM1Context): AVM1Object;
        static bindStage(context: AVM1Context, cls: AVM1Object, stage: Shumway.AVMX.AS.flash.display.Stage): void;
        _as3Stage: Shumway.AVMX.AS.flash.display.Stage;
        getAlign(): string;
        setAlign(value: any): void;
        getDisplayState(): number;
        setDisplayState(value: any): void;
        getFullScreenSourceRect(): flashPackage.geom.Rectangle;
        setFullScreenSourceRect(value: any): void;
        getHeight(): number;
        getScaleMode(): string;
        setScaleMode(value: any): void;
        getShowMenu(): boolean;
        setShowMenu(value: any): void;
        getWidth(): number;
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
declare module Shumway.AVM1.Lib {
    import flash = Shumway.AVMX.AS.flash;
    class AVM1MovieClip extends AVM1SymbolBase<flash.display.MovieClip> {
        static createAVM1Class(context: AVM1Context): AVM1Object;
        private _hitArea;
        private _lockroot;
        private graphics;
        initAVM1SymbolInstance(context: AVM1Context, as3Object: flash.display.MovieClip): void;
        _lookupChildByName(name: string): AVM1Object;
        private _lookupChildInAS3Object(name);
        __targetPath: string;
        attachAudio(id: any): void;
        attachBitmap(bmp: AVM1BitmapData, depth: number, pixelSnapping?: String, smoothing?: Boolean): void;
        _constructMovieClipSymbol(symbolId: string, name: string): flash.display.MovieClip;
        get$version(): string;
        attachMovie(symbolId: any, name: any, depth: any, initObject: any): AVM1MovieClip;
        beginFill(color: number, alpha?: number): void;
        beginBitmapFill(bmp: AVM1BitmapData, matrix?: AVM1Object, repeat?: boolean, smoothing?: boolean): void;
        beginGradientFill(fillType: string, colors: AVM1Object, alphas: AVM1Object, ratios: AVM1Object, matrix: AVM1Object, spreadMethod?: string, interpolationMethod?: string, focalPointRatio?: number): void;
        _callFrame(frame: any): any;
        clear(): void;
        /**
         * This map stores the AVM1MovieClip's children keyed by their names. It's updated by all
         * operations that can cause different results for name-based lookups. these are
         * addition/removal of children and swapDepths.
         *
         * Using this map instead of always relaying lookups to the AVM2 MovieClip substantially
         * reduces the time spent in looking up children. In some cases by two orders of magnitude.
         */
        private _childrenByName;
        private _insertChildAtDepth<T>(mc, depth);
        _updateChildName(child: AVM1MovieClip, oldName: string, newName: string): void;
        _removeChildName(child: IAVM1SymbolBase, name: string): void;
        _addChildName(child: IAVM1SymbolBase, name: string): void;
        createEmptyMovieClip(name: any, depth: any): AVM1MovieClip;
        createTextField(name: any, depth: any, x: any, y: any, width: any, height: any): AVM1TextField;
        get_currentframe(): number;
        curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void;
        get_droptarget(): flash.display.DisplayObject;
        duplicateMovieClip(name: any, depth: any, initObject: any): AVM1MovieClip;
        getEnabled(): boolean;
        setEnabled(value: any): void;
        endFill(): void;
        getForceSmoothing(): boolean;
        setForceSmoothing(value: boolean): void;
        get_framesloaded(): number;
        getBounds(bounds: any): AVM1Object;
        getBytesLoaded(): number;
        getBytesTotal(): number;
        getInstanceAtDepth(depth: number): AVM1MovieClip;
        getNextHighestDepth(): number;
        getRect(bounds: any): AVM1Object;
        getSWFVersion(): number;
        getTextSnapshot(): void;
        getURL(url: any, window: any, method: any): void;
        globalToLocal(pt: any): void;
        gotoAndPlay(frame: any): void;
        gotoAndStop(frame: any): void;
        getHitArea(): any;
        setHitArea(value: any): void;
        hitTest(x: number, y: number, shapeFlag: boolean): boolean;
        lineGradientStyle(fillType: string, colors: AVM1Object, alphas: AVM1Object, ratios: AVM1Object, matrix: AVM1Object, spreadMethod?: string, interpolationMethod?: string, focalPointRatio?: number): void;
        lineStyle(thickness?: number, rgb?: number, alpha?: number, pixelHinting?: boolean, noScale?: string, capsStyle?: string, jointStyle?: string, miterLimit?: number): void;
        lineTo(x: number, y: number): void;
        loadMovie(url: string, method: string): void;
        loadVariables(url: string, method?: string): void;
        localToGlobal(pt: any): void;
        get_lockroot(): boolean;
        set_lockroot(value: boolean): void;
        moveTo(x: number, y: number): void;
        nextFrame(): void;
        nextScene(): void;
        play(): void;
        prevFrame(): void;
        prevScene(): void;
        removeMovieClip(): void;
        setMask(mc: Object): void;
        startDrag(lock?: boolean, left?: number, top?: number, right?: number, bottom?: number): void;
        stop(): any;
        stopDrag(): any;
        swapDepths(target: any): void;
        getTabChildren(): boolean;
        setTabChildren(value: boolean): void;
        get_totalframes(): number;
        getTrackAsMenu(): boolean;
        setTrackAsMenu(value: boolean): void;
        toString(): string;
        unloadMovie(): void;
        getUseHandCursor(): void;
        setUseHandCursor(value: any): void;
        setParameters(parameters: any): any;
        private _resolveLevelNProperty(name);
        private _cachedPropertyResult;
        private _getCachedPropertyResult(value);
        alGetOwnProperty(name: any): AVM1PropertyDescriptor;
        alGetOwnPropertiesKeys(): any[];
        private _init(initObject);
        private _initEventsHandlers();
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
declare module Shumway.AVM1.Lib {
    import flash = Shumway.AVMX.AS.flash;
    class AVM1Button extends AVM1SymbolBase<flash.display.SimpleButton> {
        private _requiredListeners;
        private _actions;
        static createAVM1Class(context: AVM1Context): AVM1Object;
        initAVM1SymbolInstance(context: AVM1Context, as3Object: flash.display.SimpleButton): void;
        getEnabled(): boolean;
        setEnabled(value: boolean): void;
        getTrackAsMenu(): boolean;
        setTrackAsMenu(value: boolean): void;
        getUseHandCursor(): boolean;
        setUseHandCursor(value: boolean): void;
        private _addListeners();
        private _removeListeners();
        private _keyDownHandler(event);
        private _mouseEventHandler(type);
        private _runAction(action);
        private _initEventsHandlers();
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
declare module Shumway.AVM1.Lib {
    import flash = Shumway.AVMX.AS.flash;
    class AVM1TextField extends AVM1SymbolBase<flash.text.TextField> {
        static createAVM1Class(context: AVM1Context): AVM1Object;
        private _variable;
        private _html;
        private _exitFrameHandler;
        initAVM1SymbolInstance(context: AVM1Context, as3Object: flash.text.TextField): void;
        getAntiAliasType(): string;
        setAntiAliasType(value: string): void;
        getAutoSize(): string;
        setAutoSize(value: any): void;
        getBackground(): boolean;
        setBackground(value: boolean): void;
        getBackgroundColor(): number;
        setBackgroundColor(value: any): void;
        getBorder(): boolean;
        setBorder(value: boolean): void;
        getBorderColor(): number;
        setBorderColor(value: number): void;
        getBottomScroll(): number;
        getCondenseWhite(): boolean;
        setCondenseWhite(value: boolean): void;
        getEmbedFonts(): boolean;
        setEmbedFonts(value: any): void;
        getNewTextFormat(): AVM1Object;
        getTextFormat(beginIndex?: number, endIndex?: number): AVM1Object;
        getGridFitType(): string;
        setGridFitType(value: string): void;
        getHscroll(): number;
        setHscroll(value: number): void;
        getHtml(): boolean;
        setHtml(value: any): void;
        getHtmlText(): string;
        setHtmlText(value: string): void;
        getLength(): number;
        getMaxChars(): number;
        setMaxChars(value: any): void;
        getMaxhscroll(): number;
        getMaxscroll(): number;
        getMultiline(): boolean;
        setMultiline(value: boolean): void;
        getPassword(): boolean;
        setPassword(value: boolean): void;
        getScroll(): number;
        setScroll(value: number): void;
        getSelectable(): boolean;
        setSelectable(value: boolean): void;
        setNewTextFormat(value: any): void;
        setTextFormat(): void;
        getText(): string;
        setText(value: string): void;
        getTextColor(): number;
        setTextColor(value: number): void;
        getTextHeight(): number;
        setTextHeight(value: number): void;
        getTextWidth(): number;
        setTextWidth(value: any): void;
        getType(): string;
        setType(value: string): void;
        getVariable(): string;
        setVariable(name: string): void;
        private _onAS3ObjectExitFrame();
        private _syncTextFieldValue(instance, name);
        getWordWrap(): boolean;
        setWordWrap(value: boolean): void;
        private _initEventsHandlers();
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
declare module Shumway.AVM1.Lib {
    class AVM1Color extends AVM1Object {
        static createAVM1Class(context: AVM1Context): AVM1Object;
        private _target;
        private _targetAS3Object;
        avm1Constructor(target_mc: any): void;
        getRGB(): number;
        getTransform(): AVM1ColorTransform;
        setRGB(offset: any): void;
        setTransform(transform: AVM1Object): void;
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
declare module Shumway.AVM1.Lib {
    import flash = Shumway.AVMX.AS.flash;
    function toAS3ColorTransform(v: any): flash.geom.ColorTransform;
    function copyAS3ColorTransform(t: flash.geom.ColorTransform, v: AVM1Object): void;
    class AVM1ColorTransform extends AVM1Object {
        constructor(context: AVM1Context, redMultiplier?: number, greenMultiplier?: number, blueMultiplier?: number, alphaMultiplier?: number, redOffset?: number, greenOffset?: number, blueOffset?: number, alphaOffset?: number);
        static fromAS3ColorTransform(context: AVM1Context, t: flash.geom.ColorTransform): AVM1ColorTransform;
    }
    class AVM1ColorTransformFunction extends AVM1Function {
        constructor(context: AVM1Context);
        alConstruct(args?: any[]): AVM1Object;
    }
    class AVM1ColorTransformPrototype extends AVM1Object {
        constructor(context: AVM1Context, fn: AVM1Function);
        getRgb(): number;
        setRgb(rgb: number): void;
        concat(second: AVM1ColorTransform): void;
        _toString(): string;
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
declare module Shumway.AVM1.Lib {
    import flash = Shumway.AVMX.AS.flash;
    function toAS3Matrix(v: AVM1Object): flash.geom.Matrix;
    function copyAS3MatrixTo(m: flash.geom.Matrix, v: AVM1Object): void;
    class AVM1Matrix extends AVM1Object {
        constructor(context: AVM1Context, a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);
        static fromAS3Matrix(context: AVM1Context, m: flash.geom.Matrix): AVM1Matrix;
    }
    class AVM1MatrixFunction extends AVM1Function {
        constructor(context: AVM1Context);
        alConstruct(args?: any[]): AVM1Object;
    }
    class AVM1MatrixPrototype extends AVM1Object {
        constructor(context: AVM1Context, fn: AVM1Function);
        clone(): AVM1Matrix;
        concat(other: AVM1Matrix): void;
        createBox(scaleX: number, scaleY: number, rotation?: number, tx?: number, ty?: number): void;
        createGradientBox(width: number, height: number, rotation?: number, tx?: number, ty?: number): void;
        deltaTransformPoint(pt: AVM1Point): AVM1Point;
        identity(): void;
        invert(): void;
        rotate(angle: number): void;
        scale(sx: number, sy: number): void;
        _toString(): string;
        transformPoint(pt: AVM1Point): AVM1Point;
        translate(tx: number, ty: number): void;
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
declare module Shumway.AVM1.Lib {
    import flash = Shumway.AVMX.AS.flash;
    function toAS3Point(v: AVM1Object): flash.geom.Point;
    function copyAS3PointTo(p: flash.geom.Point, v: AVM1Object): void;
    class AVM1Point extends AVM1Object {
        constructor(context: AVM1Context, x?: number, y?: number);
        static fromAS3Point(context: AVM1Context, p: flash.geom.Point): AVM1Point;
    }
    class AVM1PointFunction extends AVM1Function {
        constructor(context: AVM1Context);
        alConstruct(args?: any[]): AVM1Object;
        distance(pt1: AVM1Point, pt2: AVM1Point): number;
        interpolate(pt1: AVM1Point, pt2: AVM1Point, f: number): AVM1Point;
        polar(len: number, angle: number): AVM1Point;
    }
    class AVM1PointPrototype extends AVM1Object {
        constructor(context: AVM1Context, fn: AVM1Function);
        getLength(): number;
        add(v: AVM1Point): AVM1Point;
        clone(): AVM1Point;
        equals(toCompare: AVM1Point): boolean;
        normalize(length: number): void;
        offset(dx: number, dy: number): void;
        subtract(v: AVM1Point): AVM1Point;
        _toString(): string;
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
declare module Shumway.AVM1.Lib {
    import flash = Shumway.AVMX.AS.flash;
    function toAS3Rectangle(v: AVM1Object): flash.geom.Rectangle;
    function copyAS3RectangleTo(r: flash.geom.Rectangle, v: AVM1Object): void;
    class AVM1Rectangle extends AVM1Object {
        constructor(context: AVM1Context, x?: number, y?: number, width?: number, height?: number);
        static fromAS3Rectangle(context: AVM1Context, r: flash.geom.Rectangle): AVM1Point;
    }
    class AVM1RectangleFunction extends AVM1Function {
        constructor(context: AVM1Context);
        alConstruct(args?: any[]): AVM1Object;
    }
    class AVM1RectanglePrototype extends AVM1Object {
        constructor(context: AVM1Context, fn: AVM1Function);
        getBottom(): number;
        setBottom(value: number): void;
        getBottomRight(): AVM1Point;
        setBottomRight(pt: AVM1Point): void;
        getLeft(): number;
        setLeft(value: number): void;
        getSize(): AVM1Point;
        setSize(pt: AVM1Point): void;
        getRight(): number;
        setRight(value: number): void;
        getTop(): number;
        setTop(value: number): void;
        getTopLeft(): AVM1Point;
        setTopLeft(pt: AVM1Point): void;
        clone(): AVM1Rectangle;
        contains(x: number, y: number): boolean;
        containsPoint(pt: AVM1Point): boolean;
        containsRectangle(rect: AVM1Rectangle): boolean;
        equals(toCompare: AVM1Rectangle): boolean;
        inflate(dx: number, dy: number): void;
        inflatePoint(pt: AVM1Point): void;
        intersection(toIntersect: AVM1Rectangle): AVM1Rectangle;
        intersects(toIntersect: AVM1Rectangle): boolean;
        isEmpty(): boolean;
        offset(dx: number, dy: number): void;
        offsetPoint(pt: AVM1Point): void;
        setEmpty(): void;
        _toString(): string;
        union(toUnion: AVM1Rectangle): AVM1Rectangle;
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
declare module Shumway.AVM1.Lib {
    import flash = Shumway.AVMX.AS.flash;
    class AVM1Transform extends AVM1Object {
        static createAVM1Class(context: AVM1Context): AVM1Object;
        private _target;
        private _targetAS3Object;
        as3Transform: flash.geom.Transform;
        avm1Constructor(target_mc: any): void;
        getMatrix(): AVM1Object;
        setMatrix(value: AVM1Matrix): void;
        getConcatenatedMatrix(): AVM1Matrix;
        getColorTransform(): AVM1ColorTransform;
        setColorTransform(value: AVM1ColorTransform): void;
        getPixelBounds(): AVM1Rectangle;
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
declare module Shumway.AVM1.Lib {
    import flash = Shumway.AVMX.AS.flash;
    class AVM1TextFormat extends AVM1Object implements IHasAS3ObjectReference {
        static createAVM1Class(context: AVM1Context): AVM1Object;
        static createFromNative(context: AVM1Context, as3Object: flash.text.TextFormat): AVM1Object;
        _as3Object: any;
        avm1Constructor(font?: string, size?: number, color?: number, bold?: boolean, italic?: boolean, underline?: boolean, url?: string, target?: string, align?: string, leftMargin?: number, rightMargin?: number, indent?: number, leading?: number): void;
        private static _measureTextField;
        static alInitStatic(context: AVM1Context): void;
        getAlign(): string;
        setAlign(value: string): void;
        getBlockIndent(): any;
        setBlockIndent(value: any): void;
        getBold(): any;
        setBold(value: any): void;
        getBullet(): any;
        setBullet(value: any): void;
        getColor(): any;
        setColor(value: any): void;
        getFont(): string;
        setFont(value: string): void;
        getIndent(): any;
        setIndent(value: any): void;
        getItalic(): any;
        setItalic(value: any): void;
        getKerning(): any;
        setKerning(value: any): void;
        getLeading(): any;
        setLeading(value: any): void;
        getLeftMargin(): any;
        setLeftMargin(value: any): void;
        getLetterSpacing(): any;
        setLetterSpacing(value: any): void;
        getRightMargin(): any;
        setRightMargin(value: any): void;
        getSize(): any;
        setSize(value: any): void;
        getTabStops(): any;
        setTabStops(value: any): void;
        getTarget(): string;
        setTarget(value: string): void;
        getTextExtent(text: string, width?: number): AVM1Object;
        getUnderline(): any;
        setUnderline(value: any): void;
        getUrl(): string;
        setUrl(value: string): void;
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
declare module Shumway.AVM1.Lib {
    import flash = Shumway.AVMX.AS.flash;
    function toAS3BitmapData(as2Object: AVM1BitmapData): flash.display.BitmapData;
    class AVM1BitmapData extends AVM1Object implements IHasAS3ObjectReference {
        static createAVM1Class(context: AVM1Context): AVM1Object;
        _as3Object: flash.display.BitmapData;
        as3BitmapData: flash.display.BitmapData;
        avm1Constructor(width: number, height: number, transparent?: boolean, fillColor?: number): void;
        static fromAS3BitmapData(context: AVM1Context, as3Object: flash.display.BitmapData): AVM1Object;
        static loadBitmap(context: AVM1Context, symbolId: string): AVM1BitmapData;
        getHeight(): number;
        getRectangle(): AVM1Object;
        getTransparent(): boolean;
        getWidth(): number;
        applyFilter(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, filter: AVM1Object): number;
        clone(): AVM1BitmapData;
        colorTransform(rect: AVM1Object, colorTransform: AVM1Object): void;
        compare(other: AVM1BitmapData): boolean;
        copyChannel(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, sourceChannel: number, destChannel: number): void;
        copyPixels(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, alphaBitmap?: AVM1BitmapData, alphaPoint?: AVM1Object, mergeAlpha?: boolean): void;
        dispose(): void;
        draw(source: AVM1Object, matrix?: AVM1Object, colorTransform?: AVM1Object, blendMode?: any, clipRect?: AVM1Object, smooth?: boolean): void;
        fillRect(rect: AVM1Object, color: number): void;
        floodFill(x: number, y: number, color: number): void;
        generateFilterRect(sourceRect: AVM1Object, filter: AVM1Object): AVM1Object;
        getColorBoundsRect(mask: number, color: number, findColor?: boolean): AVM1Object;
        getPixel(x: number, y: number): number;
        getPixel32(x: number, y: number): number;
        hitTest(firstPoint: AVM1Object, firstAlphaThreshold: number, secondObject: AVM1Object, secondBitmapPoint?: AVM1Object, secondAlphaThreshold?: number): boolean;
        merge(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, redMult: number, greenMult: number, blueMult: number, alphaMult: number): void;
        noise(randomSeed: number, low?: number, high?: number, channelOptions?: number, grayScale?: boolean): void;
        paletteMap(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, redArray?: AVM1Object, greenArray?: AVM1Object, blueArray?: AVM1Object, alphaArray?: AVM1Object): void;
        perlinNoise(baseX: number, baseY: number, numOctaves: number, randomSeed: number, stitch: boolean, fractalNoise: boolean, channelOptions?: number, grayScale?: boolean, offsets?: AVM1Object): void;
        pixelDissolve(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, randomSeed?: number, numberOfPixels?: number, fillColor?: number): number;
        scroll(x: number, y: number): void;
        setPixel(x: number, y: number, color: number): void;
        setPixel32(x: number, y: number, color: number): void;
        threshold(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, operation: string, threshold: number, color?: number, mask?: number, copySource?: boolean): number;
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
declare module Shumway.AVM1.Lib {
    class AVM1ExternalInterface extends AVM1Object {
        static createAVM1Class(context: AVM1Context): AVM1Object;
        static getAvailable(context: AVM1Context): boolean;
        static addCallback(context: AVM1Context, methodName: string, instance: any, method: AVM1Function): boolean;
        static call(context: AVM1Context, methodName: string, ...parameters: any[]): any;
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
declare module Shumway.AVM1.Lib {
    class AVM1Sound extends AVM1Object {
        static createAVM1Class(context: AVM1Context): AVM1Object;
        private _target;
        private _sound;
        private _channel;
        private _linkageID;
        avm1Constructor(target_mc: any): void;
        attachSound(id: string): void;
        loadSound(url: string, isStreaming: boolean): void;
        getBytesLoaded(): number;
        getBytesTotal(): number;
        getDuration(): number;
        getPan(): number;
        setPan(value: number): void;
        getTransform(): any;
        setTransform(transformObject: any): void;
        getVolume(): number;
        setVolume(value: number): void;
        start(secondOffset?: number, loops?: number): void;
        private _stopSoundChannel();
        stop(linkageID?: string): void;
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
declare module Shumway.AVM1.Lib {
    class AVM1System extends AVM1Object {
        static _capabilities: AVM1Object;
        static _security: AVM1Object;
        static alInitStatic(context: AVM1Context): void;
        static createAVM1Class(context: AVM1Context): AVM1Object;
        static getCapabilities(context: AVM1Context): AVM1Object;
        static getSecurity(context: AVM1Context): AVM1Object;
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
declare module Shumway.AVM1.Lib {
    import flash = Shumway.AVMX.AS.flash;
    class AVM1SharedObject extends AVM1Object {
        private _as3SharedObject;
        constructor(context: AVM1Context, as3SharedObject: flash.net.SharedObject);
    }
    class AVM1SharedObjectFunction extends AVM1Function {
        constructor(context: AVM1Context);
        getLocal(name: string, localPath?: string, secure?: boolean): AVM1SharedObject;
    }
    class AVM1SharedObjectPrototype extends AVM1Object {
        constructor(context: AVM1Context, fn: AVM1Function);
        private _as3SharedObject;
        getData(): any;
        clear(): void;
        flush(minDiskSpace?: number): any;
        getSize(): number;
        setFps(updatesPerSecond: number): boolean;
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
declare module Shumway.AVM1.Lib {
    class AVM1MovieClipLoader extends AVM1Object {
        static createAVM1Class(context: AVM1Context): AVM1Object;
        private _loaderHelper;
        private _target;
        avm1Constructor(): void;
        loadClip(url: string, target: any): Boolean;
        unloadClip(target: any): Boolean;
        getProgress(target: any): number;
        private _broadcastMessage(message, args?);
        private openHandler(event);
        private progressHandler(event);
        private ioErrorHandler(event);
        private completeHandler(event);
        private initHandler(event);
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
declare module Shumway.AVM1.Lib {
    import ASObject = Shumway.AVMX.AS.ASObject;
    function createFiltersClasses(context: AVM1Context): AVM1Object;
    function convertToAS3Filter(context: AVM1Context, as2Filter: AVM1Object): ASObject;
    function convertToAS3Filters(context: AVM1Context, as2Filters: AVM1Object): ASObject;
    function convertFromAS3Filters(context: AVM1Context, as3Filters: ASObject): AVM1Object;
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
declare module Shumway.AVM1.Lib {
    import flash = Shumway.AVMX.AS.flash;
    interface IAVM1DataObject {
        isAVM1DataObject: boolean;
        _as3Loader: flash.net.URLLoader;
        getBytesLoaded(): number;
        getBytesTotal(): number;
    }
    function loadAVM1DataObject(context: AVM1Context, url: string, method: string, contentType: string, data: any, target: IAVM1DataObject): void;
    class AVM1LoadVarsFunction extends AVM1Function {
        constructor(context: AVM1Context);
        alConstruct(args?: any[]): AVM1Object;
        alCall(thisArg: any, args?: any[]): any;
    }
    class AVM1LoadVarsPrototype extends AVM1Object implements IAVM1DataObject {
        constructor(context: AVM1Context, fn: AVM1LoadVarsFunction);
        isAVM1DataObject: boolean;
        _as3Loader: flash.net.URLLoader;
        getBytesLoaded(): number;
        getBytesTotal(): number;
        load(url: string): boolean;
        defaultOnData(src: string): void;
        decode(queryString: string): void;
        _toString(): string;
        send(url: string, target: string, method?: string): boolean;
        sendAndLoad(url: string, target: AVM1Object, method?: string): boolean;
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
declare module Shumway.AVM1.Lib {
    class AVM1XMLNodeFunction extends AVM1Function {
        constructor(context: AVM1Context);
        alConstruct(args?: any[]): AVM1Object;
        alCall(thisArg: any, args?: any[]): any;
    }
    class AVM1XMLFunction extends AVM1Function {
        constructor(context: AVM1Context, xmlNodeClass: AVM1XMLNodeFunction);
        alConstruct(args?: any[]): AVM1Object;
        alCall(thisArg: any, args?: any[]): any;
    }
}
