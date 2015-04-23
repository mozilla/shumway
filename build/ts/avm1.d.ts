/// <reference path="avm2.d.ts" />
/// <reference path="../../src/avm1/flash.d.ts" />
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
    enum ActionCode {
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
    enum ArgumentAssignmentType {
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
    enum AVM1PropertyFlags {
        DONT_ENUM = 1,
        DONT_DELETE = 2,
        READ_ONLY = 4,
        DATA = 64,
        ACCESSOR = 128,
        ASSETPROP_MASK,
    }
    enum AVM1DefaultValueHint {
        NUMBER = 0,
        STRING = 1,
    }
    interface IAVM1Callable {
        alCall(thisArg: any, args?: any[]): any;
    }
    interface AVM1PropertyDescriptor {
        flags: AVM1PropertyFlags;
        value?: any;
        get?: IAVM1Callable;
        set?: IAVM1Callable;
        id?: string;
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
        alGetPrototypeProperty(): any;
        alSetOwnPrototypeProperty(v: any): void;
        alGetConstructorProperty(): any;
        alSetOwnConstructorProperty(v: any): void;
        _escapeProperty(p: any): string;
        _unescapeProperty(name: string): string;
        _debugEscapeProperty(p: any): string;
        alGetOwnProperty(p: any): AVM1PropertyDescriptor;
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
    function alToObject(context: IAVM1Context, v: any): AVM1Object;
    function alNewObject(context: IAVM1Context): AVM1Object;
    function alGetObjectClass(obj: AVM1Object): string;
    function alCoerceString(context: IAVM1Context, x: any): string;
    function alCoerceNumber(context: IAVM1Context, x: any): number;
    function alIsIndex(context: IAVM1Context, p: any): boolean;
    function alForEachProperty(obj: AVM1Object, fn: (name: string) => void, thisArg?: any): void;
    function alIsFunction(obj: any): boolean;
    function alCallProperty(obj: AVM1Object, p: any, args?: any[]): any;
    function alInstanceOf(context: IAVM1Context, obj: any, cls: any): boolean;
    function alIsArray(context: IAVM1Context, v: any): boolean;
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
    import AVM1MovieClip = Lib.AVM1MovieClip;
    import AVM1Globals = Lib.AVM1Globals;
    class AVM1ActionsData {
        bytes: Uint8Array;
        id: string;
        parent: AVM1ActionsData;
        ir: any;
        constructor(bytes: Uint8Array, id: string, parent?: AVM1ActionsData);
    }
    interface AVM1ExportedSymbol {
        symbolId: number;
        symbolProps: any;
        theClass: any;
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
        root: AVM1MovieClip;
        loaderInfo: Shumway.AVMX.AS.flash.display.LoaderInfo;
        sec: ISecurityDomain;
        globals: AVM1Globals;
        builtins: IAVM1Builtins;
        isPropertyCaseSensitive: boolean;
        actionsDataFactory: ActionsDataFactory;
        swfVersion: number;
        private eventObservers;
        private assets;
        private assetsSymbols;
        private assetsClasses;
        private staticStates;
        constructor(swfVersion: number);
        utils: IAVM1RuntimeUtils;
        static create: (loaderInfo: Shumway.AVMX.AS.flash.display.LoaderInfo) => AVM1Context;
        flushPendingScripts(): void;
        resolveTarget(target: any): any;
        resolveLevel(level: number): any;
        addToPendingScripts(fn: any, defaultTarget: any): void;
        checkTimeout(): void;
        executeActions(actionsData: AVM1ActionsData, scopeObj: any): void;
        executeFunction(fn: AVM1Function, thisArg: any, args: any): any;
        private _getEventPropertyObservers(propertyName, create);
        registerEventPropertyObserver(propertyName: string, observer: IAVM1EventPropertyObserver): void;
        unregisterEventPropertyObserver(propertyName: string, observer: IAVM1EventPropertyObserver): void;
        broadcastEventPropertyChange(propertyName: string): void;
        addAsset(className: string, symbolId: number, symbolProps: any): void;
        registerClass(className: string, theClass: AVM1Object): void;
        getAsset(className: string): AVM1ExportedSymbol;
        setStage(stage: Shumway.AVMX.AS.flash.display.Stage): void;
        setRoot(root: Shumway.AVMX.AS.flash.display.DisplayObject, parameters: any): any;
        getStaticState(cls: typeof AVM1Object): any;
    }
}
declare module Shumway.AVM1 {
    var avm1TraceEnabled: any;
    var avm1ErrorsEnabled: any;
    var avm1TimeoutDisabled: any;
    var avm1CompilerEnabled: any;
    var avm1DebuggerEnabled: any;
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
    var PropertiesIndexMap: string[];
}
declare module Shumway.AVM1 {
    /**
     *  Bare-minimum JavaScript code generator to make debugging better.
     */
    class ActionsDataCompiler {
        static cachedCalls: any;
        constructor();
        private convertArgs(args, id, res, ir);
        private convertAction(item, id, res, indexInBlock, ir);
        generate(ir: AnalyzerResults): Function;
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
    interface IAVM1SymbolBase {
        isAVM1Instance: boolean;
        as3Object: flash.display.DisplayObject;
        context: AVM1Context;
        initAVM1SymbolInstance(context: AVM1Context, as3Object: flash.display.DisplayObject): any;
        updateAllEvents(): any;
    }
    class AVM1EventHandler {
        propertyName: string;
        eventName: string;
        argsConverter: Function;
        constructor(propertyName: string, eventName: string, argsConverter?: Function);
        onBind(target: IAVM1SymbolBase): void;
        onUnbind(target: IAVM1SymbolBase): void;
    }
    class AVM1SymbolBase<T extends flash.display.DisplayObject> extends AVM1Object implements IAVM1SymbolBase, IAVM1EventPropertyObserver {
        isAVM1Instance: boolean;
        _as3Object: T;
        as3Object: T;
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
    }
    function avm1HasEventProperty(context: AVM1Context, target: any, propertyName: string): boolean;
    function avm1BroadcastEvent(context: AVM1Context, target: any, propertyName: string, args?: any[]): void;
    class AVM1Utils {
        static resolveTarget<T extends IAVM1SymbolBase>(context: AVM1Context, target_mc?: any): any;
        static resolveMovieClip<T extends IAVM1SymbolBase>(context: AVM1Context, target?: any): any;
        static resolveLevel(context: AVM1Context, level: number): AVM1MovieClip;
        static getTarget(mc: IAVM1SymbolBase): string;
    }
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
    import flash = Shumway.AVMX.AS.flash;
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
        Sound: AVM1Object;
        SharedObject: AVM1Object;
        ContextMenu: AVM1Object;
        ContextMenuItem: AVM1Object;
        TextFormat: AVM1Object;
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
        _addToPendingScripts(subject: any, fn: Function, args?: any[]): any;
        gotoAndPlay(scene: any, frame?: any): void;
        gotoAndStop(scene: any, frame?: any): void;
        ifFrameLoaded(scene: any, frame?: any): boolean;
        int(value: any): number;
        length_(expression: any): number;
        loadMovie(url: string, target: any, method: string): void;
        _setLevel(level: number, loader: flash.display.Loader): any;
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
        stopDrag(target?: any): void;
        substring(value: any, index: any, count: any): string;
        targetPath(target: any): any;
        toggleHighQuality(): void;
        trace(expression: any): void;
        unloadMovie(target: any): void;
        unloadMovieNum(level: any): void;
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
        private _boundExecuteFrameScripts;
        private _frameScripts;
        private graphics;
        initAVM1SymbolInstance(context: AVM1Context, as3Object: flash.display.MovieClip): void;
        _lookupChildByName(name: string): AVM1Object;
        __targetPath: string;
        get_alpha(): number;
        set_alpha(value: any): void;
        attachAudio(id: any): void;
        _constructMovieClipSymbol(symbolId: string, name: string): flash.display.MovieClip;
        attachMovie(symbolId: any, name: any, depth: any, initObject: any): AVM1MovieClip;
        beginFill(color: any, alpha: any): void;
        beginBitmapFill(bmp: any, matrix: any, repeat: any, smoothing: any): void;
        beginGradientFill(fillType: any, colors: any, alphas: any, ratios: any, matrix: any, spreadMethod: any, interpolationMethod: any, focalPointRatio: any): void;
        getBlendMode(): any;
        setBlendMode(value: any): void;
        getCacheAsBitmap(): boolean;
        setCacheAsBitmap(value: any): void;
        _callFrame(frame: any): any;
        clear(): void;
        private _insertChildAtDepth<T>(mc, depth);
        createEmptyMovieClip(name: any, depth: any): AVM1MovieClip;
        createTextField(name: any, depth: any, x: any, y: any, width: any, height: any): AVM1TextField;
        get_currentframe(): number;
        curveTo(controlX: any, controlY: any, anchorX: any, anchorY: any): void;
        get_droptarget(): flash.display.DisplayObject;
        duplicateMovieClip(name: any, depth: any, initObject: any): AVM1MovieClip;
        getEnabled(): boolean;
        setEnabled(value: any): void;
        endFill(): void;
        getFilters(): void;
        setFilters(value: any): void;
        getFocusEnabled(): void;
        setFocusEnabled(value: any): void;
        get_focusrect(): void;
        set_focusrect(value: any): void;
        getForceSmoothing(): void;
        setForceSmoothing(value: any): void;
        get_framesloaded(): number;
        getBounds(bounds: any): flash.geom.Rectangle;
        getBytesLoaded(): number;
        getBytesTotal(): number;
        getDepth(): number;
        getInstanceAtDepth(depth: number): AVM1MovieClip;
        getNextHighestDepth(): number;
        getRect(bounds: any): void;
        getSWFVersion(): number;
        getTextSnapshot(): void;
        getURL(url: any, window: any, method: any): void;
        globalToLocal(pt: any): void;
        gotoAndPlay(frame: any): any;
        gotoAndStop(frame: any): any;
        get_height(): number;
        set_height(value: any): void;
        get_highquality(): number;
        set_highquality(value: any): void;
        getHitArea(): void;
        setHitArea(value: any): void;
        hitTest(x: any, y: any, shapeFlag: any): any;
        lineGradientStyle(fillType: any, colors: any, alphas: any, ratios: any, matrix: any, spreadMethod: any, interpolationMethod: any, focalPointRatio: any): void;
        lineStyle(thickness: any, rgb: any, alpha: any, pixelHinting: any, noScale: any, capsStyle: any, jointStyle: any, miterLimit: any): void;
        lineTo(x: any, y: any): void;
        loadMovie(url: string, method: string): void;
        loadVariables(url: string, method?: string): void;
        localToGlobal(pt: any): void;
        get_lockroot(): void;
        set_lockroot(value: any): void;
        getMenu(): any;
        setMenu(value: any): void;
        moveTo(x: any, y: any): void;
        get_name(): string;
        set_name(value: any): void;
        nextFrame(): void;
        nextScene(): void;
        getOpaqueBackground(): any;
        setOpaqueBackground(value: any): void;
        get_parent(): AVM1MovieClip;
        set_parent(value: any): void;
        play(): void;
        prevFrame(): void;
        prevScene(): void;
        get_quality(): string;
        set_quality(value: any): void;
        removeMovieClip(): void;
        get_rotation(): number;
        set_rotation(value: any): void;
        getScale9Grid(): void;
        setScale9Grid(value: any): void;
        getScrollRect(): void;
        setScrollRect(value: any): void;
        setMask(mc: Object): void;
        get_soundbuftime(): void;
        set_soundbuftime(value: any): void;
        startDrag(lock?: boolean, left?: number, top?: number, right?: number, bottom?: number): void;
        stop(): any;
        stopDrag(): any;
        swapDepths(target: Object): void;
        getTabChildren(): boolean;
        setTabChildren(value: any): void;
        getTabEnabled(): boolean;
        setTabEnabled(value: any): void;
        getTabIndex(): number;
        setTabIndex(value: any): void;
        get_target(): string;
        get_totalframes(): number;
        getTrackAsMenu(): void;
        setTrackAsMenu(value: any): void;
        getTransform(): void;
        setTransform(value: any): void;
        toString(): string;
        unloadMovie(): void;
        get_url(): string;
        getUseHandCursor(): boolean;
        setUseHandCursor(value: any): void;
        get_visible(): boolean;
        set_visible(value: any): void;
        get_width(): number;
        set_width(value: any): void;
        get_x(): number;
        set_x(value: any): void;
        get_xmouse(): number;
        get_xscale(): number;
        set_xscale(value: any): void;
        get_y(): number;
        set_y(value: any): void;
        get_ymouse(): number;
        get_yscale(): number;
        set_yscale(value: any): void;
        private _resolveLevelNProperty(name);
        private _cachedPropertyResult;
        private _getCachedPropertyResult(value);
        alGetOwnProperty(p: any): AVM1PropertyDescriptor;
        alGetOwnPropertiesKeys(): any[];
        addFrameActionBlocks(frameIndex: number, frameData: any): void;
        addFrameScript(frameIndex: number, actionsBlock: Uint8Array): void;
        /**
         * AVM1 InitActionBlocks are executed once, before the children are initialized for a frame.
         * That matches AS3's enterFrame event, so we can add an event listener that just bails
         * as long as the target frame isn't reached, and executes the InitActionBlock once it is.
         *
         * After that, the listener removes itself.
         */
        private _addInitActionBlocks(frameIndex, actionsBlocks);
        private _executeFrameScripts();
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
        get_alpha(): number;
        set_alpha(value: any): void;
        getBlendMode(): any;
        setBlendMode(value: any): void;
        getCacheAsBitmap(): boolean;
        setCacheAsBitmap(value: any): void;
        getEnabled(): boolean;
        setEnabled(value: any): void;
        getFilters(): void;
        setFilters(value: any): void;
        get_focusrect(): void;
        set_focusrect(value: any): void;
        getDepth(): any;
        get_height(): number;
        set_height(value: any): void;
        get_highquality(): number;
        set_highquality(value: any): void;
        getMenu(): any;
        setMenu(value: any): void;
        get_name(): any;
        set_name(value: any): void;
        get_parent(): AVM1Object;
        set_parent(value: any): void;
        get_quality(): string;
        set_quality(value: any): void;
        get_rotation(): number;
        set_rotation(value: any): void;
        getScale9Grid(): void;
        setScale9Grid(value: any): void;
        get_soundbuftime(): void;
        set_soundbuftime(value: any): void;
        getTabEnabled(): boolean;
        setTabEnabled(value: any): void;
        getTabIndex(): number;
        setTabIndex(value: any): void;
        get_target(): string;
        getTrackAsMenu(): void;
        setTrackAsMenu(value: any): void;
        get_url(): string;
        getUseHandCursor(): boolean;
        setUseHandCursor(value: any): void;
        get_visible(): boolean;
        set_visible(value: any): void;
        get_width(): number;
        set_width(value: any): void;
        get_x(): number;
        set_x(value: any): void;
        get_xmouse(): number;
        get_xscale(): number;
        set_xscale(value: any): void;
        get_y(): number;
        set_y(value: any): void;
        get_ymouse(): number;
        get_yscale(): number;
        set_yscale(value: any): void;
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
        private _exitFrameHandler;
        initAVM1SymbolInstance(context: AVM1Context, as3Object: flash.text.TextField): void;
        get_alpha(): number;
        set_alpha(value: any): void;
        getAntiAliasType(): any;
        setAntiAliasType(value: any): void;
        getAutoSize(): string;
        setAutoSize(value: any): void;
        getBackground(): any;
        setBackground(value: any): void;
        getBackgroundColor(): any;
        setBackgroundColor(value: any): void;
        getBorder(): any;
        setBorder(value: any): void;
        getBorderColor(): any;
        setBorderColor(value: any): void;
        getBottomScroll(): any;
        getCondenseWhite(): boolean;
        setCondenseWhite(value: any): void;
        getEmbedFonts(): boolean;
        setEmbedFonts(value: any): void;
        getFilters(): void;
        setFilters(value: any): void;
        getNewTextFormat(): AVM1Object;
        getTextFormat(beginIndex?: number, endIndex?: number): AVM1Object;
        getGridFitType(): string;
        setGridFitType(value: string): void;
        get_height(): number;
        set_height(value: any): void;
        get_highquality(): number;
        set_highquality(value: any): void;
        getHscroll(): number;
        setHscroll(value: any): void;
        getHtml(): void;
        setHtml(value: any): void;
        getHtmlText(): string;
        setHtmlText(value: any): void;
        getLength(): number;
        getMaxChars(): number;
        setMaxChars(value: any): void;
        getMaxhscroll(): number;
        getMaxscroll(): number;
        getMultiline(): boolean;
        setMultiline(value: any): void;
        get_name(): string;
        set_name(value: any): void;
        get_parent(): flash.display.DisplayObjectContainer;
        set_parent(value: any): void;
        getPassword(): boolean;
        setPassword(value: any): void;
        get_quality(): string;
        set_quality(value: any): void;
        get_rotation(): number;
        set_rotation(value: any): void;
        getScroll(): number;
        setScroll(value: any): void;
        getSelectable(): boolean;
        setSelectable(value: any): void;
        setNewTextFormat(value: any): void;
        setTextFormat(): void;
        get_soundbuftime(): void;
        set_soundbuftime(value: any): void;
        getTabEnabled(): boolean;
        setTabEnabled(value: any): void;
        getTabIndex(): number;
        setTabIndex(value: any): void;
        get_target(): string;
        getText(): string;
        setText(value: any): void;
        getTextColor(): any;
        setTextColor(value: any): void;
        getTextHeight(): number;
        setTextHeight(value: any): void;
        getTextWidth(): number;
        setTextWidth(value: any): void;
        getType(): any;
        setType(value: any): void;
        get_url(): string;
        variable: any;
        private _onAS3ObjectExitFrame();
        private _syncTextFieldValue(instance, name);
        get_visible(): boolean;
        set_visible(value: any): void;
        get_width(): number;
        set_width(value: any): void;
        getWordWrap(): boolean;
        setWordWrap(value: any): void;
        get_x(): number;
        set_x(value: any): void;
        get_xmouse(): number;
        get_xscale(): number;
        set_xscale(value: any): void;
        get_y(): number;
        set_y(value: any): void;
        get_ymouse(): number;
        get_yscale(): number;
        set_yscale(value: any): void;
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
    class AVM1Transform extends AVM1Object {
        static createAVM1Class(context: AVM1Context): AVM1Object;
        private _target;
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
    class AVM1TextFormat extends AVM1Object {
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
    class AVM1BitmapData extends AVM1Object {
        static createAVM1Class(context: AVM1Context): AVM1Object;
        _as3Object: flash.display.BitmapData;
        avm1Constructor(width: number, height: number, transparent?: boolean, fillColor?: number): void;
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
        draw(source: AVM1Object, matrix?: AVM1Object, colorTransform?: AVM1Object, blendMode?: AVM1Object, clipRect?: AVM1Object, smooth?: boolean): void;
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
        threshold(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, operation: String, threshold: number, color?: number, mask?: number, copySource?: boolean): number;
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
        setData(data: any): void;
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
        private _loader;
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
