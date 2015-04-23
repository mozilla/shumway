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
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var ActionsDataStream = (function () {
            function ActionsDataStream(array, swfVersion) {
                this.array = array;
                this.position = 0;
                this.end = array.length;
                // TODO use system locale to determine if the shift-JIS
                // decoding is necessary
                this.readANSI = swfVersion < 6;
                // endianess sanity check
                var buffer = new ArrayBuffer(4);
                (new Int32Array(buffer))[0] = 1;
                if (!(new Uint8Array(buffer))[0]) {
                    throw new Error("big-endian platform");
                }
            }
            ActionsDataStream.prototype.readUI8 = function () {
                return this.array[this.position++];
            };
            ActionsDataStream.prototype.readUI16 = function () {
                var position = this.position, array = this.array;
                var value = (array[position + 1] << 8) | array[position];
                this.position = position + 2;
                return value;
            };
            ActionsDataStream.prototype.readSI16 = function () {
                var position = this.position, array = this.array;
                var value = (array[position + 1] << 8) | array[position];
                this.position = position + 2;
                return value < 0x8000 ? value : (value - 0x10000);
            };
            ActionsDataStream.prototype.readInteger = function () {
                var position = this.position, array = this.array;
                var value = array[position] | (array[position + 1] << 8) | (array[position + 2] << 16) | (array[position + 3] << 24);
                this.position = position + 4;
                return value;
            };
            ActionsDataStream.prototype.readFloat = function () {
                var position = this.position;
                var array = this.array;
                var buffer = new ArrayBuffer(4);
                var bytes = new Uint8Array(buffer);
                bytes[0] = array[position];
                bytes[1] = array[position + 1];
                bytes[2] = array[position + 2];
                bytes[3] = array[position + 3];
                this.position = position + 4;
                return (new Float32Array(buffer))[0];
            };
            ActionsDataStream.prototype.readDouble = function () {
                var position = this.position;
                var array = this.array;
                var buffer = new ArrayBuffer(8);
                var bytes = new Uint8Array(buffer);
                bytes[4] = array[position];
                bytes[5] = array[position + 1];
                bytes[6] = array[position + 2];
                bytes[7] = array[position + 3];
                bytes[0] = array[position + 4];
                bytes[1] = array[position + 5];
                bytes[2] = array[position + 6];
                bytes[3] = array[position + 7];
                this.position = position + 8;
                return (new Float64Array(buffer))[0];
            };
            ActionsDataStream.prototype.readBoolean = function () {
                return !!this.readUI8();
            };
            ActionsDataStream.prototype.readANSIString = function () {
                var value = '';
                var ch;
                while ((ch = this.readUI8())) {
                    value += String.fromCharCode(ch);
                }
                return value;
            };
            ActionsDataStream.prototype.readUTF8String = function () {
                var value = '';
                var ch;
                while ((ch = this.readUI8())) {
                    if (ch < 0x80) {
                        value += String.fromCharCode(ch);
                        continue;
                    }
                    if ((ch & 0xC0) === 0x80) {
                        // Invalid UTF8 encoding: initial char -- using it as is
                        value += String.fromCharCode(ch);
                        continue;
                    }
                    var lastPosition = this.position - 1; // in case if we need to recover
                    var currentPrefix = 0xC0;
                    var validBits = 5;
                    do {
                        var mask = (currentPrefix >> 1) | 0x80;
                        if ((ch & mask) === currentPrefix) {
                            break;
                        }
                        currentPrefix = mask;
                        --validBits;
                    } while (validBits >= 0);
                    var code = (ch & ((1 << validBits) - 1));
                    for (var i = 5; i >= validBits; --i) {
                        ch = this.readUI8();
                        if ((ch & 0xC0) !== 0x80) {
                            // Invalid UTF8 encoding: bad chars in the tail, using previous chars as is
                            var skipToPosition = this.position - 1;
                            this.position = lastPosition;
                            while (this.position < skipToPosition) {
                                value += String.fromCharCode(this.readUI8());
                            }
                            continue;
                        }
                        code = (code << 6) | (ch & 0x3F);
                    }
                    if (code >= 0x10000) {
                        value += String.fromCharCode((((code - 0x10000) >> 10) & 0x3FF) | 0xD800, (code & 0x3FF) | 0xDC00);
                    }
                    else {
                        value += String.fromCharCode(code);
                    }
                }
                return value;
            };
            ActionsDataStream.prototype.readString = function () {
                return this.readANSI ? this.readANSIString() : this.readUTF8String();
            };
            ActionsDataStream.prototype.readBytes = function (length) {
                var position = this.position;
                var remaining = Math.max(this.end - position, 0);
                if (remaining < length) {
                    length = remaining;
                }
                var subarray = this.array.subarray(position, position + length);
                this.position = position + length;
                return subarray;
            };
            return ActionsDataStream;
        })();
        AVM1.ActionsDataStream = ActionsDataStream;
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var ActionsDataStream = Shumway.AVM1.ActionsDataStream;
        (function (ActionCode) {
            ActionCode[ActionCode["None"] = 0x00] = "None";
            ActionCode[ActionCode["ActionGotoFrame"] = 0x81] = "ActionGotoFrame";
            ActionCode[ActionCode["ActionGetURL"] = 0x83] = "ActionGetURL";
            ActionCode[ActionCode["ActionNextFrame"] = 0x04] = "ActionNextFrame";
            ActionCode[ActionCode["ActionPreviousFrame"] = 0x05] = "ActionPreviousFrame";
            ActionCode[ActionCode["ActionPlay"] = 0x06] = "ActionPlay";
            ActionCode[ActionCode["ActionStop"] = 0x07] = "ActionStop";
            ActionCode[ActionCode["ActionToggleQuality"] = 0x08] = "ActionToggleQuality";
            ActionCode[ActionCode["ActionStopSounds"] = 0x09] = "ActionStopSounds";
            ActionCode[ActionCode["ActionWaitForFrame"] = 0x8A] = "ActionWaitForFrame";
            ActionCode[ActionCode["ActionSetTarget"] = 0x8B] = "ActionSetTarget";
            ActionCode[ActionCode["ActionGoToLabel"] = 0x8C] = "ActionGoToLabel";
            ActionCode[ActionCode["ActionPush"] = 0x96] = "ActionPush";
            ActionCode[ActionCode["ActionPop"] = 0x17] = "ActionPop";
            ActionCode[ActionCode["ActionAdd"] = 0x0A] = "ActionAdd";
            ActionCode[ActionCode["ActionSubtract"] = 0x0B] = "ActionSubtract";
            ActionCode[ActionCode["ActionMultiply"] = 0x0C] = "ActionMultiply";
            ActionCode[ActionCode["ActionDivide"] = 0x0D] = "ActionDivide";
            ActionCode[ActionCode["ActionEquals"] = 0x0E] = "ActionEquals";
            ActionCode[ActionCode["ActionLess"] = 0x0F] = "ActionLess";
            ActionCode[ActionCode["ActionAnd"] = 0x10] = "ActionAnd";
            ActionCode[ActionCode["ActionOr"] = 0x11] = "ActionOr";
            ActionCode[ActionCode["ActionNot"] = 0x12] = "ActionNot";
            ActionCode[ActionCode["ActionStringEquals"] = 0x13] = "ActionStringEquals";
            ActionCode[ActionCode["ActionStringLength"] = 0x14] = "ActionStringLength";
            ActionCode[ActionCode["ActionMBStringLength"] = 0x31] = "ActionMBStringLength";
            ActionCode[ActionCode["ActionStringAdd"] = 0x21] = "ActionStringAdd";
            ActionCode[ActionCode["ActionStringExtract"] = 0x15] = "ActionStringExtract";
            ActionCode[ActionCode["ActionMBStringExtract"] = 0x35] = "ActionMBStringExtract";
            ActionCode[ActionCode["ActionStringLess"] = 0x29] = "ActionStringLess";
            ActionCode[ActionCode["ActionToInteger"] = 0x18] = "ActionToInteger";
            ActionCode[ActionCode["ActionCharToAscii"] = 0x32] = "ActionCharToAscii";
            ActionCode[ActionCode["ActionMBCharToAscii"] = 0x36] = "ActionMBCharToAscii";
            ActionCode[ActionCode["ActionAsciiToChar"] = 0x33] = "ActionAsciiToChar";
            ActionCode[ActionCode["ActionMBAsciiToChar"] = 0x37] = "ActionMBAsciiToChar";
            ActionCode[ActionCode["ActionJump"] = 0x99] = "ActionJump";
            ActionCode[ActionCode["ActionIf"] = 0x9D] = "ActionIf";
            ActionCode[ActionCode["ActionCall"] = 0x9E] = "ActionCall";
            ActionCode[ActionCode["ActionGetVariable"] = 0x1C] = "ActionGetVariable";
            ActionCode[ActionCode["ActionSetVariable"] = 0x1D] = "ActionSetVariable";
            ActionCode[ActionCode["ActionGetURL2"] = 0x9A] = "ActionGetURL2";
            ActionCode[ActionCode["ActionGotoFrame2"] = 0x9F] = "ActionGotoFrame2";
            ActionCode[ActionCode["ActionSetTarget2"] = 0x20] = "ActionSetTarget2";
            ActionCode[ActionCode["ActionGetProperty"] = 0x22] = "ActionGetProperty";
            ActionCode[ActionCode["ActionSetProperty"] = 0x23] = "ActionSetProperty";
            ActionCode[ActionCode["ActionCloneSprite"] = 0x24] = "ActionCloneSprite";
            ActionCode[ActionCode["ActionRemoveSprite"] = 0x25] = "ActionRemoveSprite";
            ActionCode[ActionCode["ActionStartDrag"] = 0x27] = "ActionStartDrag";
            ActionCode[ActionCode["ActionEndDrag"] = 0x28] = "ActionEndDrag";
            ActionCode[ActionCode["ActionWaitForFrame2"] = 0x8D] = "ActionWaitForFrame2";
            ActionCode[ActionCode["ActionTrace"] = 0x26] = "ActionTrace";
            ActionCode[ActionCode["ActionGetTime"] = 0x34] = "ActionGetTime";
            ActionCode[ActionCode["ActionRandomNumber"] = 0x30] = "ActionRandomNumber";
            ActionCode[ActionCode["ActionCallFunction"] = 0x3D] = "ActionCallFunction";
            ActionCode[ActionCode["ActionCallMethod"] = 0x52] = "ActionCallMethod";
            ActionCode[ActionCode["ActionConstantPool"] = 0x88] = "ActionConstantPool";
            ActionCode[ActionCode["ActionDefineFunction"] = 0x9B] = "ActionDefineFunction";
            ActionCode[ActionCode["ActionDefineLocal"] = 0x3C] = "ActionDefineLocal";
            ActionCode[ActionCode["ActionDefineLocal2"] = 0x41] = "ActionDefineLocal2";
            ActionCode[ActionCode["ActionDelete"] = 0x3A] = "ActionDelete";
            ActionCode[ActionCode["ActionDelete2"] = 0x3B] = "ActionDelete2";
            ActionCode[ActionCode["ActionEnumerate"] = 0x46] = "ActionEnumerate";
            ActionCode[ActionCode["ActionEquals2"] = 0x49] = "ActionEquals2";
            ActionCode[ActionCode["ActionGetMember"] = 0x4E] = "ActionGetMember";
            ActionCode[ActionCode["ActionInitArray"] = 0x42] = "ActionInitArray";
            ActionCode[ActionCode["ActionInitObject"] = 0x43] = "ActionInitObject";
            ActionCode[ActionCode["ActionNewMethod"] = 0x53] = "ActionNewMethod";
            ActionCode[ActionCode["ActionNewObject"] = 0x40] = "ActionNewObject";
            ActionCode[ActionCode["ActionSetMember"] = 0x4F] = "ActionSetMember";
            ActionCode[ActionCode["ActionTargetPath"] = 0x45] = "ActionTargetPath";
            ActionCode[ActionCode["ActionWith"] = 0x94] = "ActionWith";
            ActionCode[ActionCode["ActionToNumber"] = 0x4A] = "ActionToNumber";
            ActionCode[ActionCode["ActionToString"] = 0x4B] = "ActionToString";
            ActionCode[ActionCode["ActionTypeOf"] = 0x44] = "ActionTypeOf";
            ActionCode[ActionCode["ActionAdd2"] = 0x47] = "ActionAdd2";
            ActionCode[ActionCode["ActionLess2"] = 0x48] = "ActionLess2";
            ActionCode[ActionCode["ActionModulo"] = 0x3F] = "ActionModulo";
            ActionCode[ActionCode["ActionBitAnd"] = 0x60] = "ActionBitAnd";
            ActionCode[ActionCode["ActionBitLShift"] = 0x63] = "ActionBitLShift";
            ActionCode[ActionCode["ActionBitOr"] = 0x61] = "ActionBitOr";
            ActionCode[ActionCode["ActionBitRShift"] = 0x64] = "ActionBitRShift";
            ActionCode[ActionCode["ActionBitURShift"] = 0x65] = "ActionBitURShift";
            ActionCode[ActionCode["ActionBitXor"] = 0x62] = "ActionBitXor";
            ActionCode[ActionCode["ActionDecrement"] = 0x51] = "ActionDecrement";
            ActionCode[ActionCode["ActionIncrement"] = 0x50] = "ActionIncrement";
            ActionCode[ActionCode["ActionPushDuplicate"] = 0x4C] = "ActionPushDuplicate";
            ActionCode[ActionCode["ActionReturn"] = 0x3E] = "ActionReturn";
            ActionCode[ActionCode["ActionStackSwap"] = 0x4D] = "ActionStackSwap";
            ActionCode[ActionCode["ActionStoreRegister"] = 0x87] = "ActionStoreRegister";
            ActionCode[ActionCode["ActionInstanceOf"] = 0x54] = "ActionInstanceOf";
            ActionCode[ActionCode["ActionEnumerate2"] = 0x55] = "ActionEnumerate2";
            ActionCode[ActionCode["ActionStrictEquals"] = 0x66] = "ActionStrictEquals";
            ActionCode[ActionCode["ActionGreater"] = 0x67] = "ActionGreater";
            ActionCode[ActionCode["ActionStringGreater"] = 0x68] = "ActionStringGreater";
            ActionCode[ActionCode["ActionDefineFunction2"] = 0x8E] = "ActionDefineFunction2";
            ActionCode[ActionCode["ActionExtends"] = 0x69] = "ActionExtends";
            ActionCode[ActionCode["ActionCastOp"] = 0x2B] = "ActionCastOp";
            ActionCode[ActionCode["ActionImplementsOp"] = 0x2C] = "ActionImplementsOp";
            ActionCode[ActionCode["ActionTry"] = 0x8F] = "ActionTry";
            ActionCode[ActionCode["ActionThrow"] = 0x2A] = "ActionThrow";
            ActionCode[ActionCode["ActionFSCommand2"] = 0x2D] = "ActionFSCommand2";
            ActionCode[ActionCode["ActionStrictMode"] = 0x89] = "ActionStrictMode";
        })(AVM1.ActionCode || (AVM1.ActionCode = {}));
        var ActionCode = AVM1.ActionCode;
        var ParsedPushRegisterAction = (function () {
            function ParsedPushRegisterAction(registerNumber) {
                this.registerNumber = registerNumber;
            }
            return ParsedPushRegisterAction;
        })();
        AVM1.ParsedPushRegisterAction = ParsedPushRegisterAction;
        var ParsedPushConstantAction = (function () {
            function ParsedPushConstantAction(constantIndex) {
                this.constantIndex = constantIndex;
            }
            return ParsedPushConstantAction;
        })();
        AVM1.ParsedPushConstantAction = ParsedPushConstantAction;
        (function (ArgumentAssignmentType) {
            ArgumentAssignmentType[ArgumentAssignmentType["None"] = 0] = "None";
            ArgumentAssignmentType[ArgumentAssignmentType["Argument"] = 1] = "Argument";
            ArgumentAssignmentType[ArgumentAssignmentType["This"] = 2] = "This";
            ArgumentAssignmentType[ArgumentAssignmentType["Arguments"] = 4] = "Arguments";
            ArgumentAssignmentType[ArgumentAssignmentType["Super"] = 8] = "Super";
            ArgumentAssignmentType[ArgumentAssignmentType["Global"] = 16] = "Global";
            ArgumentAssignmentType[ArgumentAssignmentType["Parent"] = 32] = "Parent";
            ArgumentAssignmentType[ArgumentAssignmentType["Root"] = 64] = "Root";
        })(AVM1.ArgumentAssignmentType || (AVM1.ArgumentAssignmentType = {}));
        var ArgumentAssignmentType = AVM1.ArgumentAssignmentType;
        var ActionsDataParser = (function () {
            function ActionsDataParser(actionsData, swfVersion) {
                this._actionsData = actionsData;
                this.dataId = actionsData.id;
                this._stream = new ActionsDataStream(actionsData.bytes, swfVersion);
            }
            Object.defineProperty(ActionsDataParser.prototype, "position", {
                get: function () {
                    return this._stream.position;
                },
                set: function (value) {
                    this._stream.position = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ActionsDataParser.prototype, "eof", {
                get: function () {
                    return this._stream.position >= this._stream.end;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ActionsDataParser.prototype, "length", {
                get: function () {
                    return this._stream.end;
                },
                enumerable: true,
                configurable: true
            });
            ActionsDataParser.prototype.readNext = function () {
                var stream = this._stream;
                var currentPosition = stream.position;
                var actionCode = stream.readUI8();
                var length = actionCode >= 0x80 ? stream.readUI16() : 0;
                var nextPosition = stream.position + length;
                var args = null;
                switch (actionCode | 0) {
                    case 129 /* ActionGotoFrame */:
                        var frame = stream.readUI16();
                        var nextActionCode = stream.readUI8();
                        var play = false;
                        if (nextActionCode !== 0x06 && nextActionCode !== 0x07) {
                            stream.position--;
                        }
                        else {
                            nextPosition++;
                            play = nextActionCode === 0x06;
                        }
                        args = [frame, play];
                        break;
                    case 131 /* ActionGetURL */:
                        var urlString = stream.readString();
                        var targetString = stream.readString();
                        args = [urlString, targetString];
                        break;
                    case 138 /* ActionWaitForFrame */:
                        var frame = stream.readUI16();
                        var count = stream.readUI8();
                        args = [frame, count];
                        break;
                    case 139 /* ActionSetTarget */:
                        var targetName = stream.readString();
                        args = [targetName];
                        break;
                    case 140 /* ActionGoToLabel */:
                        var label = stream.readString();
                        var nextActionCode = stream.readUI8();
                        var play = false;
                        if (nextActionCode !== 0x06 && nextActionCode !== 0x07) {
                            stream.position--;
                        }
                        else {
                            nextPosition++;
                            play = nextActionCode === 0x06;
                        }
                        args = [label, play];
                        break;
                    case 150 /* ActionPush */:
                        var type, value;
                        args = [];
                        while (stream.position < nextPosition) {
                            type = stream.readUI8();
                            switch (type | 0) {
                                case 0:
                                    value = stream.readString();
                                    break;
                                case 1:
                                    value = stream.readFloat();
                                    break;
                                case 2:
                                    value = null;
                                    break;
                                case 3:
                                    value = void (0);
                                    break;
                                case 4:
                                    value = new ParsedPushRegisterAction(stream.readUI8());
                                    break;
                                case 5:
                                    value = stream.readBoolean();
                                    break;
                                case 6:
                                    value = stream.readDouble();
                                    break;
                                case 7:
                                    value = stream.readInteger();
                                    break;
                                case 8:
                                    value = new ParsedPushConstantAction(stream.readUI8());
                                    break;
                                case 9:
                                    value = new ParsedPushConstantAction(stream.readUI16());
                                    break;
                                default:
                                    console.error('Unknown value type: ' + type);
                                    stream.position = nextPosition;
                                    continue;
                            }
                            args.push(value);
                        }
                        break;
                    case 153 /* ActionJump */:
                        var offset = stream.readSI16();
                        args = [offset];
                        break;
                    case 157 /* ActionIf */:
                        var offset = stream.readSI16();
                        args = [offset];
                        break;
                    case 154 /* ActionGetURL2 */:
                        var flags = stream.readUI8();
                        args = [flags];
                        break;
                    case 159 /* ActionGotoFrame2 */:
                        var flags = stream.readUI8();
                        args = [flags];
                        if (!!(flags & 2)) {
                            args.push(stream.readUI16());
                        }
                        break;
                    case 141 /* ActionWaitForFrame2 */:
                        var count = stream.readUI8();
                        args = [count];
                        break;
                    case 136 /* ActionConstantPool */:
                        var count = stream.readUI16();
                        var constantPool = [];
                        for (var i = 0; i < count; i++) {
                            constantPool.push(stream.readString());
                        }
                        args = [constantPool];
                        break;
                    case 155 /* ActionDefineFunction */:
                        var functionName = stream.readString();
                        var count = stream.readUI16();
                        var functionParams = [];
                        for (var i = 0; i < count; i++) {
                            functionParams.push(stream.readString());
                        }
                        var codeSize = stream.readUI16();
                        nextPosition += codeSize;
                        var functionBody = new AVM1.AVM1ActionsData(stream.readBytes(codeSize), this.dataId + '_f' + stream.position, this._actionsData);
                        args = [functionBody, functionName, functionParams];
                        break;
                    case 148 /* ActionWith */:
                        var codeSize = stream.readUI16();
                        nextPosition += codeSize;
                        var withBody = new AVM1.AVM1ActionsData(stream.readBytes(codeSize), this.dataId + '_w' + stream.position, this._actionsData);
                        args = [withBody];
                        break;
                    case 135 /* ActionStoreRegister */:
                        var register = stream.readUI8();
                        args = [register];
                        break;
                    case 142 /* ActionDefineFunction2 */:
                        var functionName = stream.readString();
                        var count = stream.readUI16();
                        var registerCount = stream.readUI8();
                        var flags = stream.readUI16();
                        var registerAllocation = [];
                        var functionParams = [];
                        for (var i = 0; i < count; i++) {
                            var register = stream.readUI8();
                            var paramName = stream.readString();
                            functionParams.push(paramName);
                            if (register) {
                                registerAllocation[register] = {
                                    type: 1 /* Argument */,
                                    name: paramName,
                                    index: i
                                };
                            }
                        }
                        var j = 1;
                        // order this, arguments, super, _root, _parent, and _global
                        if (flags & 0x0001) {
                            registerAllocation[j++] = { type: 2 /* This */ };
                        }
                        if (flags & 0x0004) {
                            registerAllocation[j++] = { type: 4 /* Arguments */ };
                        }
                        if (flags & 0x0010) {
                            registerAllocation[j++] = { type: 8 /* Super */ };
                        }
                        if (flags & 0x0040) {
                            registerAllocation[j++] = { type: 64 /* Root */ };
                        }
                        if (flags & 0x0080) {
                            registerAllocation[j++] = { type: 32 /* Parent */ };
                        }
                        if (flags & 0x0100) {
                            registerAllocation[j++] = { type: 16 /* Global */ };
                        }
                        var suppressArguments = 0;
                        if (flags & 0x0002) {
                            suppressArguments |= 2 /* This */;
                        }
                        if (flags & 0x0008) {
                            suppressArguments |= 4 /* Arguments */;
                        }
                        if (flags & 0x0020) {
                            suppressArguments |= 8 /* Super */;
                        }
                        var codeSize = stream.readUI16();
                        nextPosition += codeSize;
                        var functionBody = new AVM1.AVM1ActionsData(stream.readBytes(codeSize), this.dataId + '_f' + stream.position, this._actionsData);
                        args = [functionBody, functionName, functionParams, registerCount, registerAllocation, suppressArguments];
                        break;
                    case 143 /* ActionTry */:
                        var flags = stream.readUI8();
                        var catchIsRegisterFlag = !!(flags & 4);
                        var finallyBlockFlag = !!(flags & 2);
                        var catchBlockFlag = !!(flags & 1);
                        var trySize = stream.readUI16();
                        var catchSize = stream.readUI16();
                        var finallySize = stream.readUI16();
                        var catchTarget = catchIsRegisterFlag ? stream.readUI8() : stream.readString();
                        nextPosition += trySize + catchSize + finallySize;
                        var tryBody = new AVM1.AVM1ActionsData(stream.readBytes(trySize), this.dataId + '_t' + stream.position, this._actionsData);
                        var catchBody = new AVM1.AVM1ActionsData(stream.readBytes(catchSize), this.dataId + '_c' + stream.position, this._actionsData);
                        var finallyBody = new AVM1.AVM1ActionsData(stream.readBytes(finallySize), this.dataId + '_z' + stream.position, this._actionsData);
                        args = [catchIsRegisterFlag, catchTarget, tryBody, catchBlockFlag, catchBody, finallyBlockFlag, finallyBody];
                        break;
                    case 137 /* ActionStrictMode */:
                        var mode = stream.readUI8();
                        args = [mode];
                        break;
                }
                stream.position = nextPosition;
                return {
                    position: currentPosition,
                    actionCode: actionCode,
                    actionName: ActionNamesMap[actionCode],
                    args: args
                };
            };
            ActionsDataParser.prototype.skip = function (count) {
                var stream = this._stream;
                while (count > 0 && stream.position < stream.end) {
                    var actionCode = stream.readUI8();
                    var length = actionCode >= 0x80 ? stream.readUI16() : 0;
                    stream.position += length;
                    count--;
                }
            };
            return ActionsDataParser;
        })();
        AVM1.ActionsDataParser = ActionsDataParser;
        var ActionNamesMap = {
            0x00: 'EOA',
            0x04: 'ActionNextFrame',
            0x05: 'ActionPreviousFrame',
            0x06: 'ActionPlay',
            0x07: 'ActionStop',
            0x08: 'ActionToggleQuality',
            0x09: 'ActionStopSounds',
            0x0A: 'ActionAdd',
            0x0B: 'ActionSubtract',
            0x0C: 'ActionMultiply',
            0x0D: 'ActionDivide',
            0x0E: 'ActionEquals',
            0x0F: 'ActionLess',
            0x10: 'ActionAnd',
            0x11: 'ActionOr',
            0x12: 'ActionNot',
            0x13: 'ActionStringEquals',
            0x14: 'ActionStringLength',
            0x15: 'ActionStringExtract',
            0x17: 'ActionPop',
            0x18: 'ActionToInteger',
            0x1C: 'ActionGetVariable',
            0x1D: 'ActionSetVariable',
            0x20: 'ActionSetTarget2',
            0x21: 'ActionStringAdd',
            0x22: 'ActionGetProperty',
            0x23: 'ActionSetProperty',
            0x24: 'ActionCloneSprite',
            0x25: 'ActionRemoveSprite',
            0x26: 'ActionTrace',
            0x27: 'ActionStartDrag',
            0x28: 'ActionEndDrag',
            0x29: 'ActionStringLess',
            0x2A: 'ActionThrow',
            0x2B: 'ActionCastOp',
            0x2C: 'ActionImplementsOp',
            0x2D: 'ActionFSCommand2',
            0x30: 'ActionRandomNumber',
            0x31: 'ActionMBStringLength',
            0x32: 'ActionCharToAscii',
            0x33: 'ActionAsciiToChar',
            0x34: 'ActionGetTime',
            0x35: 'ActionMBStringExtract',
            0x36: 'ActionMBCharToAscii',
            0x37: 'ActionMBAsciiToChar',
            0x3A: 'ActionDelete',
            0x3B: 'ActionDelete2',
            0x3C: 'ActionDefineLocal',
            0x3D: 'ActionCallFunction',
            0x3E: 'ActionReturn',
            0x3F: 'ActionModulo',
            0x40: 'ActionNewObject',
            0x41: 'ActionDefineLocal2',
            0x42: 'ActionInitArray',
            0x43: 'ActionInitObject',
            0x44: 'ActionTypeOf',
            0x45: 'ActionTargetPath',
            0x46: 'ActionEnumerate',
            0x47: 'ActionAdd2',
            0x48: 'ActionLess2',
            0x49: 'ActionEquals2',
            0x4A: 'ActionToNumber',
            0x4B: 'ActionToString',
            0x4C: 'ActionPushDuplicate',
            0x4D: 'ActionStackSwap',
            0x4E: 'ActionGetMember',
            0x4F: 'ActionSetMember',
            0x50: 'ActionIncrement',
            0x51: 'ActionDecrement',
            0x52: 'ActionCallMethod',
            0x53: 'ActionNewMethod',
            0x54: 'ActionInstanceOf',
            0x55: 'ActionEnumerate2',
            0x60: 'ActionBitAnd',
            0x61: 'ActionBitOr',
            0x62: 'ActionBitXor',
            0x63: 'ActionBitLShift',
            0x64: 'ActionBitRShift',
            0x65: 'ActionBitURShift',
            0x66: 'ActionStrictEquals',
            0x67: 'ActionGreater',
            0x68: 'ActionStringGreater',
            0x69: 'ActionExtends',
            0x81: 'ActionGotoFrame',
            0x83: 'ActionGetURL',
            0x87: 'ActionStoreRegister',
            0x88: 'ActionConstantPool',
            0x89: 'ActionStrictMode',
            0x8A: 'ActionWaitForFrame',
            0x8B: 'ActionSetTarget',
            0x8C: 'ActionGoToLabel',
            0x8D: 'ActionWaitForFrame2',
            0x8E: 'ActionDefineFunction2',
            0x8F: 'ActionTry',
            0x94: 'ActionWith',
            0x96: 'ActionPush',
            0x99: 'ActionJump',
            0x9A: 'ActionGetURL2',
            0x9B: 'ActionDefineFunction',
            0x9D: 'ActionIf',
            0x9E: 'ActionCall',
            0x9F: 'ActionGotoFrame2'
        };
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var ActionsDataAnalyzer = (function () {
            function ActionsDataAnalyzer() {
                this.parentResults = null;
                this.registersLimit = 0;
            }
            ActionsDataAnalyzer.prototype.analyze = function (parser) {
                var actions = [];
                var labels = [0];
                var processedLabels = [true];
                var constantPoolFound = false;
                var singleConstantPoolAt0 = null;
                // Parsing all actions we can reach. Every action will have next position
                // and conditional jump location.
                var queue = [0];
                while (queue.length > 0) {
                    var position = queue.shift();
                    if (actions[position]) {
                        continue;
                    }
                    parser.position = position;
                    while (!parser.eof && !actions[position]) {
                        var action = parser.readNext();
                        if (action.actionCode === 0) {
                            break;
                        }
                        var nextPosition = parser.position;
                        var item = {
                            action: action,
                            next: nextPosition,
                            conditionalJumpTo: -1
                        };
                        var jumpPosition = 0;
                        var branching = false;
                        var nonConditionalBranching = false;
                        switch (action.actionCode) {
                            case 138 /* ActionWaitForFrame */:
                            case 141 /* ActionWaitForFrame2 */:
                                branching = true;
                                // skip is specified in amount of actions (instead of bytes)
                                var skipCount = action.actionCode === 138 /* ActionWaitForFrame */ ? action.args[1] : action.args[0];
                                parser.skip(skipCount);
                                jumpPosition = parser.position;
                                parser.position = nextPosition;
                                break;
                            case 153 /* ActionJump */:
                                nonConditionalBranching = true;
                                branching = true;
                                jumpPosition = nextPosition + action.args[0];
                                break;
                            case 157 /* ActionIf */:
                                branching = true;
                                jumpPosition = nextPosition + action.args[0];
                                break;
                            case 42 /* ActionThrow */:
                            case 62 /* ActionReturn */:
                            case 0 /* None */:
                                nonConditionalBranching = true;
                                branching = true;
                                jumpPosition = parser.length;
                                break;
                            case 136 /* ActionConstantPool */:
                                if (constantPoolFound) {
                                    singleConstantPoolAt0 = null; // reset if more than one found
                                    break;
                                }
                                constantPoolFound = true;
                                if (position === 0) {
                                    // For now only counting at position 0 of the block of actions
                                    singleConstantPoolAt0 = action.args[0];
                                }
                                break;
                        }
                        if (branching) {
                            if (jumpPosition < 0 || jumpPosition > parser.length) {
                                console.error('jump outside the action block;');
                                jumpPosition = parser.length;
                            }
                            if (nonConditionalBranching) {
                                item.next = jumpPosition;
                            }
                            else {
                                item.conditionalJumpTo = jumpPosition;
                            }
                            if (!processedLabels[jumpPosition]) {
                                labels.push(jumpPosition);
                                queue.push(jumpPosition);
                                processedLabels[jumpPosition] = true;
                            }
                        }
                        actions[position] = item;
                        if (nonConditionalBranching) {
                            break;
                        }
                        position = nextPosition;
                    }
                }
                // Creating blocks for every unique label
                var blocks = [];
                labels.forEach(function (position) {
                    if (!actions[position]) {
                        return;
                    }
                    var items = [];
                    var lastPosition = position;
                    do {
                        var item = actions[lastPosition];
                        items.push(item);
                        lastPosition = item.next;
                    } while (!processedLabels[lastPosition] && actions[lastPosition]);
                    blocks.push({
                        label: position,
                        items: items,
                        jump: lastPosition
                    });
                });
                // Determines if action blocks (or defined function) is using the single
                // constants pool defined at the beginning of the action block.
                var singleConstantPool = null;
                if (constantPoolFound) {
                    singleConstantPool = singleConstantPoolAt0;
                }
                else if (this.parentResults) {
                    // Trying to use parent's constant pool if available.
                    singleConstantPool = this.parentResults.singleConstantPool;
                }
                return {
                    actions: actions,
                    blocks: blocks,
                    dataId: parser.dataId,
                    singleConstantPool: singleConstantPool,
                    registersLimit: this.registersLimit
                };
            };
            return ActionsDataAnalyzer;
        })();
        AVM1.ActionsDataAnalyzer = ActionsDataAnalyzer;
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2015 Mozilla Foundation
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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        /**
         * Base class for object instances we prefer to not inherit Object.prototype properties.
         */
        var NullPrototypeObject = (function () {
            function NullPrototypeObject() {
            }
            return NullPrototypeObject;
        })();
        AVM1.NullPrototypeObject = NullPrototypeObject;
        // Just assigning class prototype to null will not work, using next best thing.
        NullPrototypeObject.prototype = Object.create(null);
        // Implementing object structure and metaobject protocol very similar to
        // the one documented in the ECMAScript language 3.0 specification.
        // ActionScript properties flags.
        // DONT_ENUM, DONT_DELETE, and READ_ONLY are mapped to the the ASSetPropFlags.
        (function (AVM1PropertyFlags) {
            AVM1PropertyFlags[AVM1PropertyFlags["DONT_ENUM"] = 1] = "DONT_ENUM";
            AVM1PropertyFlags[AVM1PropertyFlags["DONT_DELETE"] = 2] = "DONT_DELETE";
            AVM1PropertyFlags[AVM1PropertyFlags["READ_ONLY"] = 4] = "READ_ONLY";
            AVM1PropertyFlags[AVM1PropertyFlags["DATA"] = 64] = "DATA";
            AVM1PropertyFlags[AVM1PropertyFlags["ACCESSOR"] = 128] = "ACCESSOR";
            AVM1PropertyFlags[AVM1PropertyFlags["ASSETPROP_MASK"] = AVM1PropertyFlags.DONT_DELETE | AVM1PropertyFlags.DONT_ENUM | AVM1PropertyFlags.READ_ONLY] = "ASSETPROP_MASK";
        })(AVM1.AVM1PropertyFlags || (AVM1.AVM1PropertyFlags = {}));
        var AVM1PropertyFlags = AVM1.AVM1PropertyFlags;
        (function (AVM1DefaultValueHint) {
            AVM1DefaultValueHint[AVM1DefaultValueHint["NUMBER"] = 0] = "NUMBER";
            AVM1DefaultValueHint[AVM1DefaultValueHint["STRING"] = 1] = "STRING";
        })(AVM1.AVM1DefaultValueHint || (AVM1.AVM1DefaultValueHint = {}));
        var AVM1DefaultValueHint = AVM1.AVM1DefaultValueHint;
        var ESCAPED_PROPERTY_PREFIX = '__avm1';
        var DEBUG_PROPERTY_PREFIX = '$Bg';
        /**
         * Base class for the ActionScript AVM1 object.
         */
        var AVM1Object = (function (_super) {
            __extends(AVM1Object, _super);
            function AVM1Object(avm1Context) {
                _super.call(this);
                this._avm1Context = avm1Context;
                this._ownProperties = Object.create(null);
                this._prototype = null;
                var self = this;
                // Using IAVM1Callable here to avoid circular calls between AVM1Object and
                // AVM1Function during constructions.
                // TODO do we need to support __proto__ for all SWF versions?
                this.alSetOwnProperty('__proto__', {
                    flags: 128 /* ACCESSOR */ | 2 /* DONT_DELETE */ | 1 /* DONT_ENUM */,
                    get: { alCall: function (thisArg, args) {
                        return self.alPrototype;
                    } },
                    set: { alCall: function (thisArg, args) {
                        self.alPrototype = args[0];
                    } }
                });
            }
            Object.defineProperty(AVM1Object.prototype, "context", {
                get: function () {
                    return this._avm1Context;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AVM1Object.prototype, "alPrototype", {
                get: function () {
                    return this._prototype;
                },
                set: function (v) {
                    // checking for circular references
                    var p = v;
                    while (p) {
                        if (p === this) {
                            return; // possible loop in __proto__ chain is found
                        }
                        p = p.alPrototype;
                    }
                    // TODO recursive chain check
                    this._prototype = v;
                },
                enumerable: true,
                configurable: true
            });
            AVM1Object.prototype.alGetPrototypeProperty = function () {
                return this.alGet('prototype');
            };
            // TODO shall we add mode for readonly/native flags of the prototype property?
            AVM1Object.prototype.alSetOwnPrototypeProperty = function (v) {
                this.alSetOwnProperty('prototype', {
                    flags: 64 /* DATA */ | 1 /* DONT_ENUM */,
                    value: v
                });
            };
            AVM1Object.prototype.alGetConstructorProperty = function () {
                return this.alGet('__constructor__');
            };
            AVM1Object.prototype.alSetOwnConstructorProperty = function (v) {
                this.alSetOwnProperty('__constructor__', {
                    flags: 64 /* DATA */ | 1 /* DONT_ENUM */,
                    value: v
                });
            };
            AVM1Object.prototype._escapeProperty = function (p) {
                var context = this.context;
                var name = alToString(context, p);
                if (!context.isPropertyCaseSensitive) {
                    name = name.toLowerCase();
                }
                if (name[0] === '_') {
                    name = ESCAPED_PROPERTY_PREFIX + name;
                }
                return name;
            };
            AVM1Object.prototype._unescapeProperty = function (name) {
                if (name[0] === '_' && name.indexOf(ESCAPED_PROPERTY_PREFIX) === 0) {
                    name = name.substring(ESCAPED_PROPERTY_PREFIX.length);
                }
                return name;
            };
            AVM1Object.prototype._debugEscapeProperty = function (p) {
                var context = this.context;
                var name = alToString(context, p);
                if (!context.isPropertyCaseSensitive) {
                    name = name.toLowerCase();
                }
                return DEBUG_PROPERTY_PREFIX + name;
            };
            AVM1Object.prototype.alGetOwnProperty = function (p) {
                var name = this._escapeProperty(p);
                // TODO __resolve
                return this._ownProperties[name];
            };
            AVM1Object.prototype.alSetOwnProperty = function (p, desc) {
                var name = this._escapeProperty(p);
                this._ownProperties[name] = desc;
                if (!release) {
                    if ((desc.flags & 64 /* DATA */) && !(desc.flags & 1 /* DONT_ENUM */)) {
                        Object.defineProperty(this, this._debugEscapeProperty(p), { value: desc.value, enumerable: true, configurable: true });
                    }
                }
            };
            AVM1Object.prototype.alHasOwnProperty = function (p) {
                var name = this._escapeProperty(p);
                return !!this._ownProperties[name];
            };
            AVM1Object.prototype.alDeleteOwnProperty = function (p) {
                var name = this._escapeProperty(p);
                delete this._ownProperties[name];
                if (!release) {
                    delete this[this._debugEscapeProperty(p)];
                }
            };
            AVM1Object.prototype.alGetOwnPropertiesKeys = function () {
                var keys = [];
                for (var i in this._ownProperties) {
                    var desc = this._ownProperties[i];
                    if (!(desc.flags & 1 /* DONT_ENUM */)) {
                        var name = this._unescapeProperty(i);
                        keys.push(name);
                    }
                }
                return keys;
            };
            AVM1Object.prototype.alGetProperty = function (p) {
                var desc = this.alGetOwnProperty(p);
                if (desc) {
                    return desc;
                }
                if (!this._prototype) {
                    return undefined;
                }
                return this._prototype.alGetProperty(p);
            };
            AVM1Object.prototype.alGet = function (p) {
                var desc = this.alGetProperty(p);
                if (!desc) {
                    return undefined;
                }
                if ((desc.flags & 64 /* DATA */)) {
                    return desc.value;
                }
                release || Shumway.Debug.assert((desc.flags & 128 /* ACCESSOR */));
                var getter = desc.get;
                if (!getter) {
                    return undefined;
                }
                return getter.alCall(this);
            };
            AVM1Object.prototype.alCanPut = function (p) {
                var desc = this.alGetOwnProperty(p);
                if (desc) {
                    if ((desc.flags & 128 /* ACCESSOR */)) {
                        return !!desc.set;
                    }
                    else {
                        return !(desc.flags & 4 /* READ_ONLY */);
                    }
                }
                var proto = this._prototype;
                if (!proto) {
                    return true;
                }
                return proto.alCanPut(p);
            };
            AVM1Object.prototype.alPut = function (p, v) {
                if (!this.alCanPut(p)) {
                    return;
                }
                var ownDesc = this.alGetOwnProperty(p);
                if (ownDesc && (ownDesc.flags & 64 /* DATA */)) {
                    var newDesc = {
                        flags: 64 /* DATA */,
                        value: v
                    };
                    this.alSetOwnProperty(p, newDesc);
                    return;
                }
                var desc = this.alGetProperty(p);
                if (desc && (desc.flags & 128 /* ACCESSOR */)) {
                    var setter = desc.set;
                    release || Shumway.Debug.assert(setter);
                    setter.alCall(this, [v]);
                }
                else {
                    var newDesc = {
                        flags: 64 /* DATA */,
                        value: v
                    };
                    this.alSetOwnProperty(p, newDesc);
                }
            };
            AVM1Object.prototype.alHasProperty = function (p) {
                var desc = this.alGetProperty(p);
                return !!desc;
            };
            AVM1Object.prototype.alDeleteProperty = function (p) {
                var desc = this.alGetOwnProperty(p);
                if (!desc) {
                    return true;
                }
                if ((desc.flags & 2 /* DONT_DELETE */)) {
                    return false;
                }
                this.alDeleteOwnProperty(p);
                return true;
            };
            AVM1Object.prototype.alDefaultValue = function (hint) {
                if (hint === void 0) { hint = 0 /* NUMBER */; }
                if (hint === 1 /* STRING */) {
                    var toString = this.alGet('toString');
                    if (alIsFunction(toString)) {
                        var str = toString.alCall(this);
                        return str;
                    }
                    var valueOf = this.alGet('valueOf');
                    if (alIsFunction(valueOf)) {
                        var val = valueOf.alCall(this);
                        return val;
                    }
                }
                else {
                    release || Shumway.Debug.assert(hint === 0 /* NUMBER */);
                    var valueOf = this.alGet('valueOf');
                    if (alIsFunction(valueOf)) {
                        var val = valueOf.alCall(this);
                        return val;
                    }
                    var toString = this.alGet('toString');
                    if (alIsFunction(toString)) {
                        var str = toString.alCall(this);
                        return str;
                    }
                }
                // TODO is this a default?
                return this;
            };
            AVM1Object.prototype.alGetKeys = function () {
                var ownKeys = this.alGetOwnPropertiesKeys();
                var proto = this._prototype;
                if (!proto) {
                    return ownKeys;
                }
                var otherKeys = proto.alGetKeys();
                if (ownKeys.length === 0) {
                    return otherKeys;
                }
                // Merging two keys sets
                // TODO check if we shall worry about __proto__ usage here
                var processed = Object.create(null);
                for (var i = 0; i < ownKeys.length; i++) {
                    processed[ownKeys[i]] = true;
                }
                for (var i = 0; i < otherKeys.length; i++) {
                    processed[otherKeys[i]] = true;
                }
                return Object.getOwnPropertyNames(processed);
            };
            return AVM1Object;
        })(NullPrototypeObject);
        AVM1.AVM1Object = AVM1Object;
        /**
         * Base class for ActionsScript functions.
         */
        var AVM1Function = (function (_super) {
            __extends(AVM1Function, _super);
            function AVM1Function(context) {
                _super.call(this, context);
                this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
            }
            AVM1Function.prototype.alConstruct = function (args) {
                throw new Error('not implemented AVM1Function.alConstruct');
            };
            AVM1Function.prototype.alCall = function (thisArg, args) {
                throw new Error('not implemented AVM1Function.alCall');
            };
            /**
             * Wraps the function to the callable JavaScript function.
             * @returns {Function} a JavaScript function.
             */
            AVM1Function.prototype.toJSFunction = function (thisArg) {
                if (thisArg === void 0) { thisArg = null; }
                var fn = this;
                var context = this.context;
                return function () {
                    var args = Array.prototype.slice.call(arguments, 0);
                    return context.executeFunction(fn, thisArg, args);
                };
            };
            return AVM1Function;
        })(AVM1Object);
        AVM1.AVM1Function = AVM1Function;
        /**
         * Base class for ActionScript functions with native JavaScript implementation.
         */
        var AVM1NativeFunction = (function (_super) {
            __extends(AVM1NativeFunction, _super);
            /**
             * @param {IAVM1Context} context
             * @param {Function} fn The native function for regular calling.
             * @param {Function} ctor The native function for construction.
             */
            function AVM1NativeFunction(context, fn, ctor) {
                _super.call(this, context);
                this._fn = fn;
                if (ctor) {
                    this._ctor = ctor;
                }
            }
            AVM1NativeFunction.prototype.alConstruct = function (args) {
                if (!this._ctor) {
                    throw new Error('not a constructor');
                }
                return this._ctor.apply(this, args);
            };
            AVM1NativeFunction.prototype.alCall = function (thisArg, args) {
                if (!this._fn) {
                    throw new Error('not callable');
                }
                return this._fn.apply(thisArg, args);
            };
            return AVM1NativeFunction;
        })(AVM1Function);
        AVM1.AVM1NativeFunction = AVM1NativeFunction;
        /**
         * Base class the is used for the interpreter.
         * See {AVM1InterpretedFunction} implementation
         */
        var AVM1EvalFunction = (function (_super) {
            __extends(AVM1EvalFunction, _super);
            function AVM1EvalFunction(context) {
                _super.call(this, context);
                var proto = new AVM1Object(context);
                proto.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                proto.alSetOwnProperty('constructor', {
                    flags: 64 /* DATA */ | 1 /* DONT_ENUM */ | 2 /* DONT_DELETE */
                });
                this.alSetOwnPrototypeProperty(proto);
            }
            AVM1EvalFunction.prototype.alConstruct = function (args) {
                var obj = new AVM1Object(this.context);
                var objPrototype = this.alGetPrototypeProperty();
                if (!(objPrototype instanceof AVM1Object)) {
                    objPrototype = this.context.builtins.Object.alGetPrototypeProperty();
                }
                obj.alPrototype = objPrototype;
                obj.alSetOwnConstructorProperty(this);
                var result = this.alCall(obj, args);
                return result instanceof AVM1Object ? result : obj;
            };
            return AVM1EvalFunction;
        })(AVM1Function);
        AVM1.AVM1EvalFunction = AVM1EvalFunction;
        // TODO create classes for the ActionScript errors.
        function AVM1TypeError(msg) {
        }
        AVM1TypeError.prototype = Object.create(Error.prototype);
        function alToPrimitive(context, v, preferredType) {
            if (!(v instanceof AVM1Object)) {
                return v;
            }
            var obj = v;
            return preferredType !== undefined ? obj.alDefaultValue(preferredType) : obj.alDefaultValue();
        }
        AVM1.alToPrimitive = alToPrimitive;
        function alToBoolean(context, v) {
            switch (typeof v) {
                case 'undefined':
                    return false;
                case 'object':
                    return v !== null;
                case 'boolean':
                    return v;
                case 'string':
                case 'number':
                    return !!v;
                default:
                    release || Shumway.Debug.assert(false);
            }
        }
        AVM1.alToBoolean = alToBoolean;
        function alToNumber(context, v) {
            if (typeof v === 'object' && v !== null) {
                v = alToPrimitive(context, v, 0 /* NUMBER */);
            }
            switch (typeof v) {
                case 'undefined':
                    return context.swfVersion >= 7 ? NaN : 0;
                case 'object':
                    if (v === null) {
                        return context.swfVersion >= 7 ? NaN : 0;
                    }
                    return context.swfVersion >= 5 ? NaN : 0;
                case 'boolean':
                    return v ? 1 : 0;
                case 'number':
                    return v;
                case 'string':
                    if (v === '' && context.swfVersion < 5) {
                        return 0;
                    }
                    return +v;
                default:
                    release || Shumway.Debug.assert(false);
            }
        }
        AVM1.alToNumber = alToNumber;
        function alToInteger(context, v) {
            var n = alToNumber(context, v);
            if (isNaN(n)) {
                return 0;
            }
            if (n === 0 || n === Number.POSITIVE_INFINITY || n === Number.NEGATIVE_INFINITY) {
                return n;
            }
            return n < 0 ? Math.ceil(n) : Math.floor(n);
        }
        AVM1.alToInteger = alToInteger;
        function alToInt32(context, v) {
            var n = alToNumber(context, v);
            return n | 0;
        }
        AVM1.alToInt32 = alToInt32;
        function alToString(context, v) {
            if (typeof v === 'object' && v !== null) {
                v = alToPrimitive(context, v, 1 /* STRING */);
            }
            switch (typeof v) {
                case 'undefined':
                    return context.swfVersion >= 7 ? 'undefined' : '';
                case 'object':
                    if (v === null) {
                        return 'null';
                    }
                    return '[type ' + alGetObjectClass(v) + ']';
                case 'boolean':
                    return v ? 'true' : 'false';
                case 'number':
                    return v + '';
                case 'string':
                    return v;
                default:
                    release || Shumway.Debug.assert(false);
            }
        }
        AVM1.alToString = alToString;
        function alToObject(context, v) {
            switch (typeof v) {
                case 'undefined':
                    throw new AVM1TypeError();
                case 'object':
                    if (v === null) {
                        throw new AVM1TypeError();
                    }
                    // TODO verify if all objects here are inherited from AVM1Object
                    if (Array.isArray(v)) {
                        return new AVM1.Natives.AVM1ArrayNative(context, v);
                    }
                    return v;
                case 'boolean':
                    return new AVM1.Natives.AVM1BooleanNative(context, v);
                case 'number':
                    return new AVM1.Natives.AVM1NumberNative(context, v);
                case 'string':
                    return new AVM1.Natives.AVM1StringNative(context, v);
                default:
                    release || Shumway.Debug.assert(false);
            }
        }
        AVM1.alToObject = alToObject;
        function alNewObject(context) {
            var obj = new AVM1Object(context);
            obj.alPrototype = context.builtins.Object.alGetPrototypeProperty();
            obj.alSetOwnConstructorProperty(context.builtins.Object);
            return obj;
        }
        AVM1.alNewObject = alNewObject;
        function alGetObjectClass(obj) {
            if (obj instanceof AVM1Function) {
                return 'Function';
            }
            // TODO more cases
            return 'Object';
        }
        AVM1.alGetObjectClass = alGetObjectClass;
        function alCoerceString(context, x) {
            if (x instanceof AVM1Object) {
                return alToString(context, x);
            }
            return Shumway.AVMX.axCoerceString(x);
        }
        AVM1.alCoerceString = alCoerceString;
        function alCoerceNumber(context, x) {
            if (Shumway.isNullOrUndefined(x)) {
                return undefined;
            }
            return alToNumber(context, x);
        }
        AVM1.alCoerceNumber = alCoerceNumber;
        function alIsIndex(context, p) {
            if (p instanceof AVM1Object) {
                return Shumway.isIndex(alToString(context, p));
            }
            return Shumway.isIndex(p);
        }
        AVM1.alIsIndex = alIsIndex;
        function alForEachProperty(obj, fn, thisArg) {
            obj.alGetKeys().forEach(fn, thisArg);
        }
        AVM1.alForEachProperty = alForEachProperty;
        function alIsFunction(obj) {
            return obj instanceof AVM1Function;
        }
        AVM1.alIsFunction = alIsFunction;
        function alCallProperty(obj, p, args) {
            var callable = obj.alGet(p);
            callable.alCall(obj, args);
        }
        AVM1.alCallProperty = alCallProperty;
        function alInstanceOf(context, obj, cls) {
            if (!(obj instanceof AVM1Object)) {
                return false;
            }
            if (!(cls instanceof AVM1Object)) {
                return false;
            }
            var proto = cls.alGetPrototypeProperty();
            for (var i = obj; i; i = i.alPrototype) {
                if (i === proto) {
                    return true;
                }
            }
            return false;
        }
        AVM1.alInstanceOf = alInstanceOf;
        function alIsArray(context, v) {
            return alInstanceOf(context, v, context.builtins.Array);
        }
        AVM1.alIsArray = alIsArray;
        function alIsString(context, v) {
            return typeof v === 'string';
        }
        AVM1.alIsString = alIsString;
        function alDefineObjectProperties(obj, descriptors) {
            var context = obj.context;
            Object.getOwnPropertyNames(descriptors).forEach(function (name) {
                var desc = descriptors[name];
                var value, getter, setter;
                var flags = 0;
                if (typeof desc === 'object') {
                    if (desc.get || desc.set) {
                        getter = desc.get ? new AVM1NativeFunction(context, desc.get) : undefined;
                        setter = desc.set ? new AVM1NativeFunction(context, desc.set) : undefined;
                        flags |= 128 /* ACCESSOR */;
                    }
                    else {
                        value = desc.value;
                        if (typeof value === 'function') {
                            value = new AVM1NativeFunction(context, value);
                        }
                        flags |= 64 /* DATA */;
                        if (!desc.writable) {
                            flags |= 4 /* READ_ONLY */;
                        }
                    }
                    if (!desc.enumerable) {
                        flags |= 1 /* DONT_ENUM */;
                    }
                    if (!desc.configurable) {
                        flags |= 2 /* DONT_DELETE */;
                    }
                }
                else {
                    value = desc;
                    if (typeof value === 'function') {
                        value = new AVM1NativeFunction(context, value);
                    }
                    flags |= 64 /* DATA */ | 2 /* DONT_DELETE */ | 1 /* DONT_ENUM */ | 4 /* READ_ONLY */;
                }
                obj.alSetOwnProperty(name, getter || setter ? {
                    flags: flags,
                    get: getter,
                    set: setter
                } : {
                    flags: flags,
                    value: value
                });
            });
        }
        AVM1.alDefineObjectProperties = alDefineObjectProperties;
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2015 Mozilla Foundation
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
// Implementation of the built-in ActionScript classes. Here we will implement
// functions and object prototypes that will be exposed to the AVM1 code.
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Natives;
        (function (Natives) {
            // Object natives
            var AVM1ObjectPrototype = (function (_super) {
                __extends(AVM1ObjectPrototype, _super);
                function AVM1ObjectPrototype(context) {
                    _super.call(this, context);
                    // Initialization must be perfromed later after the Function creation.
                    // See the _initializePrototype and createBuiltins below.
                }
                AVM1ObjectPrototype.prototype._initializePrototype = function () {
                    var context = this.context;
                    AVM1.alDefineObjectProperties(this, {
                        constructor: {
                            value: context.builtins.Object,
                            writable: true
                        },
                        valueOf: {
                            value: this._valueOf,
                            writable: true
                        },
                        toString: {
                            value: this._toString,
                            writable: true
                        },
                        addProperty: {
                            value: this.addProperty
                        },
                        hasOwnProperty: {
                            value: this.hasOwnProperty
                        },
                        isPropertyEnumerable: {
                            value: this.isPropertyEnumerable
                        },
                        isPrototypeOf: {
                            value: this.isPrototypeOf
                        },
                        unwatch: {
                            value: this.unwatch
                        },
                        watch: {
                            value: this.watch
                        }
                    });
                };
                AVM1ObjectPrototype.prototype._valueOf = function () {
                    return this;
                };
                AVM1ObjectPrototype.prototype._toString = function () {
                    if (AVM1.alIsFunction(this)) {
                        // Really weird case of functions.
                        return '[type ' + AVM1.alGetObjectClass(this) + ']';
                    }
                    return '[object ' + AVM1.alGetObjectClass(this) + ']';
                };
                AVM1ObjectPrototype.prototype.addProperty = function (name, getter, setter) {
                    if (typeof name !== 'string' || name === '') {
                        return false;
                    }
                    if (!AVM1.alIsFunction(getter)) {
                        return false;
                    }
                    if (!AVM1.alIsFunction(setter) && setter !== null) {
                        return false;
                    }
                    var desc = this.alGetOwnProperty(name);
                    if (desc && !!(desc.flags & 2 /* DONT_DELETE */)) {
                        return false; // protected property
                    }
                    this.alSetOwnProperty(name, {
                        flags: 128 /* ACCESSOR */,
                        get: getter,
                        set: setter || undefined
                    });
                    return true;
                };
                AVM1ObjectPrototype.prototype.hasOwnProperty = function (name) {
                    return this.alHasOwnProperty(name);
                };
                AVM1ObjectPrototype.prototype.isPropertyEnumerable = function (name) {
                    var desc = this.alGetProperty(name);
                    return !(desc.flags & 1 /* DONT_ENUM */);
                };
                AVM1ObjectPrototype.prototype.isPrototypeOf = function (theClass) {
                    return AVM1.alInstanceOf(this.context, this, theClass);
                };
                AVM1ObjectPrototype.prototype.unwatch = function (name) {
                    Shumway.Debug.notImplemented('AVM1Object.prototype.unwatch');
                    return false;
                };
                AVM1ObjectPrototype.prototype.watch = function (name, callback, userData) {
                    Shumway.Debug.notImplemented('AVM1Object.prototype.watch');
                    return false;
                };
                return AVM1ObjectPrototype;
            })(AVM1.AVM1Object);
            var AVM1ObjectFunction = (function (_super) {
                __extends(AVM1ObjectFunction, _super);
                function AVM1ObjectFunction(context) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
                    var proto = context.builtins.Object.alGetPrototypeProperty();
                    AVM1.alDefineObjectProperties(this, {
                        prototype: {
                            value: proto
                        },
                        registerClass: {
                            value: this.registerClass
                        }
                    });
                }
                AVM1ObjectFunction.prototype.registerClass = function (name, theClass) {
                    this.context.registerClass(name, theClass);
                };
                AVM1ObjectFunction.prototype.alConstruct = function (args) {
                    if (args) {
                        var value = args[0];
                        if (value instanceof AVM1.AVM1Object) {
                            return value;
                        }
                        switch (typeof value) {
                            case 'string':
                            case 'boolean':
                            case 'number':
                                return AVM1.alToObject(this.context, value);
                        }
                    }
                    // null or undefined
                    return AVM1.alNewObject(this.context);
                };
                AVM1ObjectFunction.prototype.alCall = function (thisArg, args) {
                    if (!args || args[0] === null || args[0] === undefined) {
                        return AVM1.alNewObject(this.context);
                    }
                    return AVM1.alToObject(this.context, args[0]);
                };
                return AVM1ObjectFunction;
            })(AVM1.AVM1Function);
            Natives.AVM1ObjectFunction = AVM1ObjectFunction;
            // Function natives
            var AVM1FunctionPrototype = (function (_super) {
                __extends(AVM1FunctionPrototype, _super);
                function AVM1FunctionPrototype(context) {
                    _super.call(this, context);
                }
                AVM1FunctionPrototype.prototype._initializePrototype = function () {
                    var context = this.context;
                    this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                    AVM1.alDefineObjectProperties(this, {
                        constructor: {
                            value: context.builtins.Function,
                            writable: true
                        },
                        call: this.call,
                        apply: this.apply
                    });
                };
                AVM1FunctionPrototype.prototype.call = function (thisArg) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    var fn = alEnsureType(this, AVM1.AVM1Function);
                    return fn.alCall(thisArg, args);
                };
                AVM1FunctionPrototype.prototype.apply = function (thisArg, args) {
                    var fn = alEnsureType(this, AVM1.AVM1Function);
                    var nativeArgs = !args ? undefined : alEnsureType(args, AVM1ArrayNative).value;
                    return fn.alCall(thisArg, nativeArgs);
                };
                return AVM1FunctionPrototype;
            })(AVM1.AVM1Object);
            var AVM1FunctionFunction = (function (_super) {
                __extends(AVM1FunctionFunction, _super);
                function AVM1FunctionFunction(context) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
                    var proto = context.builtins.Function.alGetPrototypeProperty();
                    AVM1.alDefineObjectProperties(this, {
                        prototype: {
                            value: proto
                        }
                    });
                }
                AVM1FunctionFunction.prototype.alConstruct = function (args) {
                    // ActionScript just returns the first argument.
                    return args ? args[0] : undefined;
                };
                AVM1FunctionFunction.prototype.alCall = function (thisArg, args) {
                    // ActionScript just returns the first argument.
                    return args ? args[0] : undefined;
                };
                return AVM1FunctionFunction;
            })(AVM1.AVM1Function);
            Natives.AVM1FunctionFunction = AVM1FunctionFunction;
            // Boolean natives
            var AVM1BooleanNative = (function (_super) {
                __extends(AVM1BooleanNative, _super);
                function AVM1BooleanNative(context, value) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Boolean.alGetPrototypeProperty();
                    this.alSetOwnConstructorProperty(context.builtins.Boolean);
                    this.value = value;
                }
                AVM1BooleanNative.prototype.valueOf = function () {
                    return this.value;
                };
                return AVM1BooleanNative;
            })(AVM1.AVM1Object);
            Natives.AVM1BooleanNative = AVM1BooleanNative;
            var AVM1BooleanPrototype = (function (_super) {
                __extends(AVM1BooleanPrototype, _super);
                function AVM1BooleanPrototype(context) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                    AVM1.alDefineObjectProperties(this, {
                        constructor: {
                            value: context.builtins.Boolean,
                            writable: true
                        },
                        valueOf: {
                            value: this._valueOf,
                            writable: true
                        },
                        toString: {
                            value: this._toString,
                            writable: true
                        }
                    });
                }
                AVM1BooleanPrototype.prototype._valueOf = function () {
                    var native = alEnsureType(this, AVM1BooleanNative);
                    return native.value;
                };
                AVM1BooleanPrototype.prototype._toString = function () {
                    var native = alEnsureType(this, AVM1BooleanNative);
                    return native.value ? 'true' : 'false';
                };
                return AVM1BooleanPrototype;
            })(AVM1.AVM1Object);
            Natives.AVM1BooleanPrototype = AVM1BooleanPrototype;
            var AVM1BooleanFunction = (function (_super) {
                __extends(AVM1BooleanFunction, _super);
                function AVM1BooleanFunction(context) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
                    var proto = new AVM1BooleanPrototype(context);
                    AVM1.alDefineObjectProperties(this, {
                        prototype: {
                            value: proto
                        }
                    });
                }
                AVM1BooleanFunction.prototype.alConstruct = function (args) {
                    var value = args ? AVM1.alToBoolean(this.context, args[0]) : false;
                    return new AVM1BooleanNative(this.context, value);
                };
                AVM1BooleanFunction.prototype.alCall = function (thisArg, args) {
                    // TODO returns boolean value?
                    var value = args ? AVM1.alToBoolean(this.context, args[0]) : false;
                    return value;
                };
                return AVM1BooleanFunction;
            })(AVM1.AVM1Function);
            Natives.AVM1BooleanFunction = AVM1BooleanFunction;
            // Number natives
            var AVM1NumberNative = (function (_super) {
                __extends(AVM1NumberNative, _super);
                function AVM1NumberNative(context, value) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Number.alGetPrototypeProperty();
                    this.alSetOwnConstructorProperty(context.builtins.Number);
                    this.value = value;
                }
                AVM1NumberNative.prototype.valueOf = function () {
                    return this.value;
                };
                return AVM1NumberNative;
            })(AVM1.AVM1Object);
            Natives.AVM1NumberNative = AVM1NumberNative;
            var AVM1NumberPrototype = (function (_super) {
                __extends(AVM1NumberPrototype, _super);
                function AVM1NumberPrototype(context) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                    AVM1.alDefineObjectProperties(this, {
                        constructor: {
                            value: context.builtins.Number,
                            writable: true
                        },
                        valueOf: {
                            value: this._valueOf,
                            writable: true
                        },
                        toString: {
                            value: this._toString,
                            writable: true
                        }
                    });
                }
                AVM1NumberPrototype.prototype._valueOf = function () {
                    var native = alEnsureType(this, AVM1NumberNative);
                    return native.value;
                };
                AVM1NumberPrototype.prototype._toString = function (radix) {
                    var native = alEnsureType(this, AVM1NumberNative);
                    return native.value.toString(radix || 10);
                };
                return AVM1NumberPrototype;
            })(AVM1.AVM1Object);
            Natives.AVM1NumberPrototype = AVM1NumberPrototype;
            var AVM1NumberFunction = (function (_super) {
                __extends(AVM1NumberFunction, _super);
                function AVM1NumberFunction(context) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
                    var proto = new AVM1NumberPrototype(context);
                    AVM1.alDefineObjectProperties(this, {
                        prototype: {
                            value: proto
                        },
                        MAX_VALUE: Number.MAX_VALUE,
                        MIN_VALUE: Number.MIN_VALUE,
                        NaN: Number.NaN,
                        NEGATIVE_INFINITY: Number.NEGATIVE_INFINITY,
                        POSITIVE_INFINITY: Number.POSITIVE_INFINITY
                    });
                }
                AVM1NumberFunction.prototype.alConstruct = function (args) {
                    var value = args ? AVM1.alToNumber(this.context, args[0]) : 0;
                    return new AVM1NumberNative(this.context, value);
                };
                AVM1NumberFunction.prototype.alCall = function (thisArg, args) {
                    // TODO returns number value?
                    var value = args ? AVM1.alToNumber(this.context, args[0]) : 0;
                    return value;
                };
                return AVM1NumberFunction;
            })(AVM1.AVM1Function);
            Natives.AVM1NumberFunction = AVM1NumberFunction;
            // String natives
            var AVM1StringNative = (function (_super) {
                __extends(AVM1StringNative, _super);
                function AVM1StringNative(context, value) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.String.alGetPrototypeProperty();
                    this.alSetOwnConstructorProperty(context.builtins.String);
                    this.value = value;
                }
                AVM1StringNative.prototype.toString = function () {
                    return this.value;
                };
                return AVM1StringNative;
            })(AVM1.AVM1Object);
            Natives.AVM1StringNative = AVM1StringNative;
            // Most of the methods of String prototype are generic and accept any object.
            var AVM1StringPrototype = (function (_super) {
                __extends(AVM1StringPrototype, _super);
                function AVM1StringPrototype(context) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                    AVM1.alDefineObjectProperties(this, {
                        constructor: {
                            value: context.builtins.String,
                            writable: true
                        },
                        valueOf: {
                            value: this._valueOf,
                            writable: true
                        },
                        toString: {
                            value: this._toString,
                            writable: true
                        },
                        length: {
                            get: this.getLength
                        },
                        charAt: {
                            value: this.charAt,
                            writable: true
                        },
                        charCodeAt: {
                            value: this.charCodeAt,
                            writable: true
                        },
                        concat: {
                            value: this.concat,
                            writable: true
                        },
                        indexOf: {
                            value: this.indexOf,
                            writable: true
                        },
                        lastIndexOf: {
                            value: this.lastIndexOf,
                            writable: true
                        },
                        slice: {
                            value: this.slice,
                            writable: true
                        },
                        split: {
                            value: this.split,
                            writable: true
                        },
                        substr: {
                            value: this.substr,
                            writable: true
                        },
                        substring: {
                            value: this.substring,
                            writable: true
                        },
                        toLowerCase: {
                            value: this.toLowerCase,
                            writable: true
                        },
                        toUpperCase: {
                            value: this.toUpperCase,
                            writable: true
                        }
                    });
                }
                AVM1StringPrototype.prototype._valueOf = function () {
                    var native = alEnsureType(this, AVM1StringNative);
                    return native.value;
                };
                AVM1StringPrototype.prototype._toString = function () {
                    var native = alEnsureType(this, AVM1StringNative);
                    return native.value;
                };
                AVM1StringPrototype.prototype.getLength = function () {
                    var native = alEnsureType(this, AVM1StringNative);
                    return native.value.length;
                };
                AVM1StringPrototype.prototype.charAt = function (index) {
                    var value = AVM1.alToString(this.context, this);
                    return value.charAt(AVM1.alToInteger(this.context, index));
                };
                AVM1StringPrototype.prototype.charCodeAt = function (index) {
                    var value = AVM1.alToString(this.context, this);
                    return value.charCodeAt(AVM1.alToInteger(this.context, index));
                };
                AVM1StringPrototype.prototype.concat = function () {
                    var items = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        items[_i - 0] = arguments[_i];
                    }
                    var stringItems = [AVM1.alToString(this.context, this)];
                    for (var i = 0; i < items.length; ++i) {
                        stringItems.push(AVM1.alToString(this.context, items[i]));
                    }
                    return stringItems.join('');
                };
                AVM1StringPrototype.prototype.indexOf = function (searchString, position) {
                    var value = AVM1.alToString(this.context, this);
                    searchString = AVM1.alToString(this.context, searchString);
                    position = AVM1.alToInteger(this.context, position);
                    return value.indexOf(searchString, position);
                };
                AVM1StringPrototype.prototype.lastIndexOf = function (searchString, position) {
                    var value = AVM1.alToString(this.context, this);
                    searchString = AVM1.alToString(this.context, searchString);
                    position = arguments.length < 2 ? NaN : AVM1.alToNumber(this.context, position); // SWF6 alToNumber(undefined) === 0
                    if (position < 0) {
                        // Different from JS
                        return -1;
                    }
                    return value.lastIndexOf(searchString, isNaN(position) ? undefined : position);
                };
                AVM1StringPrototype.prototype.slice = function (start, end) {
                    if (arguments.length === 0) {
                        // Different from JS
                        return undefined;
                    }
                    var value = AVM1.alToString(this.context, this);
                    start = AVM1.alToInteger(this.context, start);
                    end = end === undefined ? undefined : AVM1.alToInteger(this.context, end);
                    return value.slice(start, end);
                };
                AVM1StringPrototype.prototype.split = function (separator, limit) {
                    var value = AVM1.alToString(this.context, this);
                    // TODO separator as regular expression?
                    separator = AVM1.alToString(this.context, separator);
                    limit = (limit === undefined ? ~0 : AVM1.alToInt32(this.context, limit)) >>> 0;
                    return new AVM1ArrayNative(this.context, value.split(separator, limit));
                };
                AVM1StringPrototype.prototype.substr = function (start, length) {
                    // Different from JS
                    var value = AVM1.alToString(this.context, this);
                    var valueLength = value.length;
                    start = AVM1.alToInteger(this.context, start);
                    length = length === undefined ? valueLength : AVM1.alToInteger(this.context, length);
                    if (start < 0) {
                        start = Math.max(0, valueLength + start);
                    }
                    if (length < 0) {
                        if (-length <= start) {
                            return '';
                        }
                        length = Math.max(0, valueLength + length);
                    }
                    return value.substr(start, length);
                };
                AVM1StringPrototype.prototype.substring = function (start, end) {
                    var value = AVM1.alToString(this.context, this);
                    start = AVM1.alToInteger(this.context, start);
                    if (start >= value.length) {
                        // Different from JS
                        return '';
                    }
                    end = end === undefined ? undefined : AVM1.alToInteger(this.context, end);
                    return value.substring(start, end);
                };
                AVM1StringPrototype.prototype.toLowerCase = function () {
                    var value = AVM1.alToString(this.context, this);
                    return value.toLowerCase();
                };
                AVM1StringPrototype.prototype.toUpperCase = function () {
                    var value = AVM1.alToString(this.context, this);
                    return value.toUpperCase();
                };
                return AVM1StringPrototype;
            })(AVM1.AVM1Object);
            Natives.AVM1StringPrototype = AVM1StringPrototype;
            var AVM1StringFunction = (function (_super) {
                __extends(AVM1StringFunction, _super);
                function AVM1StringFunction(context) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
                    var proto = new AVM1StringPrototype(context);
                    AVM1.alDefineObjectProperties(this, {
                        prototype: {
                            value: proto
                        },
                        fromCharCode: {
                            value: this.fromCharCode
                        }
                    });
                }
                AVM1StringFunction.prototype.alConstruct = function (args) {
                    var value = args ? AVM1.alToString(this.context, args[0]) : '';
                    return new AVM1StringNative(this.context, value);
                };
                AVM1StringFunction.prototype.alCall = function (thisArg, args) {
                    var value = args ? AVM1.alToString(this.context, args[0]) : '';
                    return value;
                };
                AVM1StringFunction.prototype.fromCharCode = function () {
                    var _this = this;
                    var codes = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        codes[_i - 0] = arguments[_i];
                    }
                    codes = codes.map(function (code) { return AVM1.alToInt32(_this.context, code) & 0xFFFF; });
                    return String.fromCharCode.apply(String, codes);
                };
                return AVM1StringFunction;
            })(AVM1.AVM1Function);
            Natives.AVM1StringFunction = AVM1StringFunction;
            // Array natives
            var cachedArrayPropertyDescriptor = {
                flags: 64 /* DATA */,
                value: undefined
            };
            var AVM1ArrayNative = (function (_super) {
                __extends(AVM1ArrayNative, _super);
                function AVM1ArrayNative(context, value) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Array.alGetPrototypeProperty();
                    this.alSetOwnConstructorProperty(context.builtins.Array);
                    this.value = value;
                }
                AVM1ArrayNative.prototype.alGetOwnProperty = function (p) {
                    if (AVM1.alIsIndex(this.context, p)) {
                        var index = AVM1.alToInt32(this.context, p);
                        if (Object.getOwnPropertyDescriptor(this.value, index)) {
                            cachedArrayPropertyDescriptor.value = this.value[index];
                            return cachedArrayPropertyDescriptor;
                        }
                    }
                    return _super.prototype.alGetOwnProperty.call(this, p);
                };
                AVM1ArrayNative.prototype.alSetOwnProperty = function (p, v) {
                    if (AVM1.alIsIndex(this.context, p)) {
                        var index = AVM1.alToInt32(this.context, p);
                        if (!(v.flags & 64 /* DATA */) || !!(v.flags & 1 /* DONT_ENUM */) || !!(v.flags & 2 /* DONT_DELETE */)) {
                            throw new Error('Special property is non-supported for array');
                        }
                        this.value[index] = v.value;
                        return;
                    }
                    _super.prototype.alSetOwnProperty.call(this, p, v);
                };
                AVM1ArrayNative.prototype.alDeleteOwnProperty = function (p) {
                    if (AVM1.alIsIndex(this.context, p)) {
                        var index = AVM1.alToInt32(this.context, p);
                        delete this.value[index];
                        return;
                    }
                    _super.prototype.alDeleteOwnProperty.call(this, p);
                };
                AVM1ArrayNative.prototype.alGetOwnPropertiesKeys = function () {
                    var keys = _super.prototype.alGetOwnPropertiesKeys.call(this);
                    var itemIndices = [];
                    for (var i in this.value) {
                        itemIndices.push(i);
                    }
                    return itemIndices.concat(keys);
                };
                return AVM1ArrayNative;
            })(AVM1.AVM1Object);
            Natives.AVM1ArrayNative = AVM1ArrayNative;
            var AVM1ArraySortOnOptions;
            (function (AVM1ArraySortOnOptions) {
                AVM1ArraySortOnOptions[AVM1ArraySortOnOptions["CASEINSENSITIVE"] = 1] = "CASEINSENSITIVE";
                AVM1ArraySortOnOptions[AVM1ArraySortOnOptions["DESCENDING"] = 2] = "DESCENDING";
                AVM1ArraySortOnOptions[AVM1ArraySortOnOptions["UNIQUESORT"] = 4] = "UNIQUESORT";
                AVM1ArraySortOnOptions[AVM1ArraySortOnOptions["RETURNINDEXEDARRAY"] = 8] = "RETURNINDEXEDARRAY";
                AVM1ArraySortOnOptions[AVM1ArraySortOnOptions["NUMERIC"] = 16] = "NUMERIC";
            })(AVM1ArraySortOnOptions || (AVM1ArraySortOnOptions = {}));
            // TODO implement all the Array class and its prototype natives
            var AVM1ArrayPrototype = (function (_super) {
                __extends(AVM1ArrayPrototype, _super);
                function AVM1ArrayPrototype(context) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                    AVM1.alDefineObjectProperties(this, {
                        constructor: {
                            value: context.builtins.Array,
                            writable: true
                        },
                        join: {
                            value: this.join,
                            writable: true
                        },
                        length: {
                            get: this.getLength,
                            set: this.setLength
                        },
                        concat: {
                            value: this.concat,
                            writable: true
                        },
                        pop: {
                            value: this.pop,
                            writable: true
                        },
                        push: {
                            value: this.push,
                            writable: true
                        },
                        shift: {
                            value: this.shift,
                            writable: true
                        },
                        slice: {
                            value: this.slice,
                            writable: true
                        },
                        splice: {
                            value: this.splice,
                            writable: true
                        },
                        sort: {
                            value: this.sort,
                            writable: true
                        },
                        sortOn: {
                            value: this.sortOn,
                            writable: true
                        },
                        toString: {
                            value: this._toString,
                            writable: true
                        },
                        unshift: {
                            value: this.unshift,
                            writable: true
                        },
                    });
                }
                AVM1ArrayPrototype.prototype._toString = function () {
                    var join = this.context.builtins.Array.alGetPrototypeProperty().alGet('join');
                    return join.alCall(this);
                };
                AVM1ArrayPrototype.prototype.getLength = function () {
                    var arr = alEnsureType(this, AVM1ArrayNative).value;
                    return arr.length;
                };
                AVM1ArrayPrototype.prototype.setLength = function (length) {
                    if (!Shumway.isIndex(length)) {
                        return; // no action on invalid length
                    }
                    length = AVM1.alToInt32(this.context, length) >>> 0;
                    var arr = alEnsureType(this, AVM1ArrayNative).value;
                    arr.length = length;
                };
                AVM1ArrayPrototype.prototype.concat = function () {
                    var items = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        items[_i - 0] = arguments[_i];
                    }
                    if (this instanceof AVM1ArrayNative) {
                        // Faster case for native array implementation
                        var arr = alEnsureType(this, AVM1ArrayNative).value;
                        for (var i = 0; i < arr.length; i++) {
                            if (items[i] instanceof AVM1ArrayNative) {
                                items[i] = alEnsureType(items[i], AVM1ArrayNative).value;
                            }
                        }
                        return new AVM1ArrayNative(this.context, Array.prototype.concat.apply(arr, items));
                    }
                    // TODO implement generic method
                    Shumway.Debug.notImplemented('AVM1ArrayNative.concat');
                };
                AVM1ArrayPrototype.prototype.join = function (separator) {
                    separator = separator === undefined ? ',' : AVM1.alCoerceString(this.context, separator);
                    if (this instanceof AVM1ArrayNative) {
                        // Faster case for native array implementation
                        var arr = alEnsureType(this, AVM1ArrayNative).value;
                        if (arr.length === 0) {
                            return '';
                        }
                        if (arr.every(function (i) {
                            return !(i instanceof AVM1.AVM1Object);
                        })) {
                            return arr.join(separator);
                        }
                    }
                    var context = this.context;
                    var length = AVM1.alToInt32(context, this.alGet('length')) >>> 0;
                    if (length === 0) {
                        return '';
                    }
                    var result = [];
                    for (var i = 0; i < length; i++) {
                        var item = this.alGet(i);
                        result[i] = item === null || item === undefined ? '' : AVM1.alCoerceString(context, item);
                    }
                    return result.join(separator);
                };
                AVM1ArrayPrototype.prototype.pop = function () {
                    if (this instanceof AVM1ArrayNative) {
                        // Faster case for native array implementation
                        var arr = alEnsureType(this, AVM1ArrayNative).value;
                        return arr.pop();
                    }
                    // TODO implement generic method
                    Shumway.Debug.notImplemented('AVM1ArrayNative.pop');
                };
                AVM1ArrayPrototype.prototype.push = function () {
                    var items = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        items[_i - 0] = arguments[_i];
                    }
                    if (this instanceof AVM1ArrayNative) {
                        // Faster case for native array implementation
                        var arr = alEnsureType(this, AVM1ArrayNative).value;
                        return Array.prototype.push.apply(arr, items);
                    }
                    // TODO implement generic method
                    Shumway.Debug.notImplemented('AVM1ArrayNative.push');
                };
                AVM1ArrayPrototype.prototype.shift = function () {
                    if (this instanceof AVM1ArrayNative) {
                        // Faster case for native array implementation
                        var arr = alEnsureType(this, AVM1ArrayNative).value;
                        return arr.shift();
                    }
                    // TODO implement generic method
                    Shumway.Debug.notImplemented('AVM1ArrayNative.shift');
                };
                AVM1ArrayPrototype.prototype.slice = function (start, end) {
                    start = AVM1.alToInteger(this.context, start);
                    end = end !== undefined ? AVM1.alToInteger(this.context, end) : undefined;
                    if (this instanceof AVM1ArrayNative) {
                        // Faster case for native array implementation
                        var arr = alEnsureType(this, AVM1ArrayNative).value;
                        return new AVM1ArrayNative(this.context, arr.slice(start, end));
                    }
                    // TODO implement generic method
                    Shumway.Debug.notImplemented('AVM1ArrayNative.slice');
                };
                AVM1ArrayPrototype.prototype.splice = function (start, deleteCount) {
                    var items = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        items[_i - 2] = arguments[_i];
                    }
                    start = AVM1.alToInteger(this.context, start);
                    deleteCount = AVM1.alToInteger(this.context, deleteCount);
                    if (this instanceof AVM1ArrayNative) {
                        // Faster case for native array implementation
                        var arr = alEnsureType(this, AVM1ArrayNative).value;
                        return new AVM1ArrayNative(this.context, Array.prototype.splice.apply(arr, [start, deleteCount].concat(items)));
                    }
                    // TODO implement generic method
                    Shumway.Debug.notImplemented('AVM1ArrayNative.splice');
                };
                AVM1ArrayPrototype.prototype.sort = function (comparefn) {
                    var arr = alEnsureType(this, AVM1ArrayNative).value;
                    if (!AVM1.alIsFunction(comparefn)) {
                        arr.sort();
                    }
                    else {
                        var args = [undefined, undefined];
                        arr.sort(function (a, b) {
                            args[0] = a;
                            args[1] = b;
                            return comparefn.alCall(null, args);
                        });
                    }
                    return this;
                };
                AVM1ArrayPrototype.prototype.sortOn = function (fieldNames, options) {
                    var context = this.context;
                    // The field names and options we'll end up using.
                    var fieldNamesList = [];
                    var optionsList = [];
                    if (AVM1.alIsString(context, fieldNames)) {
                        fieldNamesList = [AVM1.alToString(context, fieldNames)];
                        optionsList = [AVM1.alToInt32(context, options)];
                    }
                    else if (AVM1.alIsArray(context, fieldNames)) {
                        fieldNamesList = [];
                        optionsList = [];
                        var optionsArray = AVM1.alIsArray(context, options) ? options : null;
                        var length = AVM1.alToInteger(context, fieldNames.alGet('length'));
                        if (optionsArray) {
                            // checking in length of fieldNames == options
                            var optionsLength = AVM1.alToInteger(context, optionsArray.alGet('length'));
                            if (length !== optionsLength) {
                                optionsArray = null;
                            }
                        }
                        for (var i = 0; i < length; i++) {
                            fieldNamesList.push(AVM1.alToString(context, fieldNames.alGet(i)));
                            optionsList.push(optionsArray ? AVM1.alToInt32(context, optionsArray.alGet(i)) : 0);
                        }
                    }
                    else {
                        // Field parameters are incorrect.
                        return undefined;
                    }
                    // TODO revisit this code
                    var optionsVal = optionsList[0];
                    release || Shumway.Debug.assertNotImplemented(!(optionsVal & 4 /* UNIQUESORT */), "UNIQUESORT");
                    release || Shumway.Debug.assertNotImplemented(!(optionsVal & 8 /* RETURNINDEXEDARRAY */), "RETURNINDEXEDARRAY");
                    var comparer = function (a, b) {
                        var aObj = AVM1.alToObject(context, a);
                        var bObj = AVM1.alToObject(context, b);
                        if (!a || !b) {
                            return !a ? !b ? 0 : -1 : +1;
                        }
                        for (var i = 0; i < fieldNamesList.length; i++) {
                            var aField = aObj.alGet(fieldNamesList[i]);
                            var bField = bObj.alGet(fieldNamesList[i]);
                            var result;
                            if (optionsList[i] & 16 /* NUMERIC */) {
                                var aNum = AVM1.alToNumber(context, aField);
                                var bNum = AVM1.alToNumber(context, bField);
                                result = aNum < bNum ? -1 : aNum > bNum ? +1 : 0;
                            }
                            else {
                                var aStr = AVM1.alToString(context, aField);
                                var bStr = AVM1.alToString(context, bField);
                                if (optionsList[i] & 1 /* CASEINSENSITIVE */) {
                                    aStr = aStr.toLowerCase();
                                    bStr = bStr.toLowerCase();
                                }
                                result = aStr < bStr ? -1 : aStr > bStr ? +1 : 0;
                            }
                            if (result !== 0) {
                                return !(optionsList[i] & 2 /* DESCENDING */) ? result : -result;
                            }
                        }
                        return 0;
                    };
                    var arr = alEnsureType(this, AVM1ArrayNative).value;
                    arr.sort(comparer);
                    // Strange, the documentation said to do not return anything.
                    return this;
                };
                AVM1ArrayPrototype.prototype.unshift = function () {
                    var items = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        items[_i - 0] = arguments[_i];
                    }
                    if (this instanceof AVM1ArrayNative) {
                        // Faster case for native array implementation
                        var arr = alEnsureType(this, AVM1ArrayNative).value;
                        return Array.prototype.unshift.apply(arr, items);
                    }
                    // TODO implement generic method
                    Shumway.Debug.notImplemented('AVM1ArrayNative.unshift');
                };
                return AVM1ArrayPrototype;
            })(AVM1.AVM1Object);
            Natives.AVM1ArrayPrototype = AVM1ArrayPrototype;
            var AVM1ArrayFunction = (function (_super) {
                __extends(AVM1ArrayFunction, _super);
                function AVM1ArrayFunction(context) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
                    var proto = new AVM1ArrayPrototype(context);
                    AVM1.alDefineObjectProperties(this, {
                        prototype: {
                            value: proto
                        }
                    });
                }
                AVM1ArrayFunction.prototype.alConstruct = function (args) {
                    if (args && typeof args[0] === 'number') {
                        var len = args[0];
                        if (len >>> 0 !== len) {
                            throw new Error('Range error');
                        }
                        return new AVM1ArrayNative(this.context, new Array(len));
                    }
                    return new AVM1ArrayNative(this.context, args);
                };
                AVM1ArrayFunction.prototype.alCall = function (thisArg, args) {
                    return this.alConstruct.apply(this, args);
                };
                return AVM1ArrayFunction;
            })(AVM1.AVM1Function);
            Natives.AVM1ArrayFunction = AVM1ArrayFunction;
            // Math natives
            var AVM1MathObject = (function (_super) {
                __extends(AVM1MathObject, _super);
                function AVM1MathObject(context) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                    AVM1.alDefineObjectProperties(this, {
                        E: Math.E,
                        LN10: Math.LN10,
                        LN2: Math.LN2,
                        LOG10E: Math.LOG10E,
                        LOG2E: Math.LOG2E,
                        PI: Math.PI,
                        SQRT1_2: Math.SQRT1_2,
                        SQRT2: Math.SQRT2,
                        abs: this.abs,
                        acos: this.acos,
                        asin: this.asin,
                        atan: this.atan,
                        atan2: this.atan2,
                        ceil: this.ceil,
                        cos: this.cos,
                        exp: this.exp,
                        floor: this.floor,
                        log: this.log,
                        max: this.max,
                        min: this.min,
                        pow: this.pow,
                        random: this.random,
                        round: this.round,
                        sin: this.sin,
                        sqrt: this.sqrt,
                        tan: this.tan
                    });
                }
                AVM1MathObject.prototype.abs = function (x) {
                    return Math.abs(AVM1.alToNumber(this.context, x));
                };
                AVM1MathObject.prototype.acos = function (x) {
                    return Math.acos(AVM1.alToNumber(this.context, x));
                };
                AVM1MathObject.prototype.asin = function (x) {
                    return Math.asin(AVM1.alToNumber(this.context, x));
                };
                AVM1MathObject.prototype.atan = function (x) {
                    return Math.atan(AVM1.alToNumber(this.context, x));
                };
                AVM1MathObject.prototype.atan2 = function (y, x) {
                    return Math.atan2(AVM1.alToNumber(this.context, y), AVM1.alToNumber(this.context, x));
                };
                AVM1MathObject.prototype.ceil = function (x) {
                    return Math.ceil(AVM1.alToNumber(this.context, x));
                };
                AVM1MathObject.prototype.cos = function (x) {
                    return Math.cos(AVM1.alToNumber(this.context, x));
                };
                AVM1MathObject.prototype.exp = function (x) {
                    return Math.exp(AVM1.alToNumber(this.context, x));
                };
                AVM1MathObject.prototype.floor = function (x) {
                    return Math.abs(AVM1.alToNumber(this.context, x));
                };
                AVM1MathObject.prototype.log = function (x) {
                    return Math.log(AVM1.alToNumber(this.context, x));
                };
                AVM1MathObject.prototype.max = function () {
                    var _this = this;
                    var values = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        values[_i - 0] = arguments[_i];
                    }
                    values = values.map(function (x) { return AVM1.alToNumber(_this.context, x); });
                    return Math.max.apply(null, values);
                };
                AVM1MathObject.prototype.min = function () {
                    var _this = this;
                    var values = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        values[_i - 0] = arguments[_i];
                    }
                    values = values.map(function (x) { return AVM1.alToNumber(_this.context, x); });
                    return Math.min.apply(null, values);
                };
                AVM1MathObject.prototype.pow = function (x, y) {
                    return Math.pow(AVM1.alToNumber(this.context, x), AVM1.alToNumber(this.context, y));
                };
                AVM1MathObject.prototype.random = function () {
                    return Math.random();
                };
                AVM1MathObject.prototype.round = function (x) {
                    return Math.round(AVM1.alToNumber(this.context, x));
                };
                AVM1MathObject.prototype.sin = function (x) {
                    return Math.sin(AVM1.alToNumber(this.context, x));
                };
                AVM1MathObject.prototype.sqrt = function (x) {
                    return Math.sqrt(AVM1.alToNumber(this.context, x));
                };
                AVM1MathObject.prototype.tan = function (x) {
                    return Math.tan(AVM1.alToNumber(this.context, x));
                };
                return AVM1MathObject;
            })(AVM1.AVM1Object);
            // Date natives
            var AVM1DateNative = (function (_super) {
                __extends(AVM1DateNative, _super);
                function AVM1DateNative(context, value) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Date.alGetPrototypeProperty();
                    this.alSetOwnConstructorProperty(context.builtins.Date);
                    this.value = value;
                }
                AVM1DateNative.prototype.alDefaultValue = function (hint) {
                    if (hint !== undefined) {
                        return _super.prototype.alDefaultValue.call(this, hint);
                    }
                    if (this.context.swfVersion >= 6) {
                        return _super.prototype.alDefaultValue.call(this, 1 /* STRING */);
                    }
                    else {
                        return _super.prototype.alDefaultValue.call(this, 0 /* NUMBER */);
                    }
                };
                return AVM1DateNative;
            })(AVM1.AVM1Object);
            // TODO implement all the Date class and its prototype natives
            var AVM1DatePrototype = (function (_super) {
                __extends(AVM1DatePrototype, _super);
                function AVM1DatePrototype(context) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                    AVM1.alDefineObjectProperties(this, {
                        constructor: {
                            value: context.builtins.Date,
                            writable: true
                        },
                        valueOf: {
                            value: this._valueOf,
                            writable: true
                        },
                        toString: {
                            value: this._toString,
                            writable: true
                        },
                        getTime: {
                            value: this.getTime,
                            writable: true
                        }
                    });
                }
                AVM1DatePrototype.prototype._valueOf = function () {
                    var native = alEnsureType(this, AVM1DateNative);
                    return native.value.valueOf();
                };
                AVM1DatePrototype.prototype._toString = function () {
                    var native = alEnsureType(this, AVM1DateNative);
                    return native.value.toString();
                };
                AVM1DatePrototype.prototype.getTime = function () {
                    return alEnsureType(this, AVM1DateNative).value.valueOf();
                };
                return AVM1DatePrototype;
            })(AVM1.AVM1Object);
            var AVM1DateFunction = (function (_super) {
                __extends(AVM1DateFunction, _super);
                function AVM1DateFunction(context) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
                    var proto = new AVM1DatePrototype(context);
                    AVM1.alDefineObjectProperties(this, {
                        prototype: {
                            value: proto
                        },
                        UTC: {
                            value: this._UTC,
                            writable: true
                        }
                    });
                }
                AVM1DateFunction.prototype.alConstruct = function (args) {
                    var context = this.context;
                    var value;
                    switch (args.length) {
                        case 0:
                            value = new Date();
                            break;
                        case 1:
                            value = new Date(AVM1.alToPrimitive(context, args[0]));
                            break;
                        case 2:
                            var numbers = [];
                            for (var i = 0; i < args.length; i++) {
                                numbers.push(AVM1.alToNumber(context, args[i]));
                            }
                            value = new Date(AVM1.alToNumber(context, args[0]), AVM1.alToNumber(context, args[1]), args.length > 2 ? AVM1.alToNumber(context, args[2]) : 1, args.length > 3 ? AVM1.alToNumber(context, args[3]) : 0, args.length > 4 ? AVM1.alToNumber(context, args[4]) : 0, args.length > 5 ? AVM1.alToNumber(context, args[5]) : 0, args.length > 6 ? AVM1.alToNumber(context, args[6]) : 0);
                            break;
                    }
                    return new AVM1DateNative(context, value);
                };
                AVM1DateFunction.prototype.alCall = function (thisArg, args) {
                    return AVM1.alCallProperty(this.alConstruct.apply(this, args), 'toString');
                };
                AVM1DateFunction.prototype._UTC = function (year, month, date, hours, seconds, ms) {
                    var context = this.context;
                    return Date.UTC(AVM1.alToNumber(context, arguments[0]), AVM1.alToNumber(context, arguments[1]), arguments.length > 2 ? AVM1.alToNumber(context, arguments[2]) : 1, arguments.length > 3 ? AVM1.alToNumber(context, arguments[3]) : 0, arguments.length > 4 ? AVM1.alToNumber(context, arguments[4]) : 0, arguments.length > 5 ? AVM1.alToNumber(context, arguments[5]) : 0, arguments.length > 6 ? AVM1.alToNumber(context, arguments[6]) : 0);
                };
                return AVM1DateFunction;
            })(AVM1.AVM1Function);
            function alEnsureType(obj, cls /* typeof AVM1Object */) {
                if (obj instanceof cls) {
                    return obj;
                }
                throw new Error('Invalid type');
            }
            /**
             * Installs built-ins on the AVM1Context. It shall be a first call before
             * any AVM1Object is instantiated.
             * @param {IAVM1Context} context
             */
            function installBuiltins(context) {
                var builtins = context.builtins;
                // Resolving cyclic dependency between Object/Function functions and their prototypes.
                var objectProto = new AVM1ObjectPrototype(context);
                var dummyObject = new AVM1.AVM1Object(context);
                dummyObject.alSetOwnPrototypeProperty(objectProto);
                builtins.Object = dummyObject;
                var functionProto = new AVM1FunctionPrototype(context);
                var dummyFunction = new AVM1.AVM1Object(context);
                dummyFunction.alSetOwnPrototypeProperty(functionProto);
                builtins.Function = dummyFunction;
                objectProto._initializePrototype();
                functionProto._initializePrototype();
                builtins.Object = new AVM1ObjectFunction(context);
                builtins.Function = new AVM1FunctionFunction(context);
                builtins.Boolean = new AVM1BooleanFunction(context);
                builtins.Number = new AVM1NumberFunction(context);
                builtins.String = new AVM1StringFunction(context);
                builtins.Array = new AVM1ArrayFunction(context);
                builtins.Date = new AVM1DateFunction(context);
                builtins.Math = new AVM1MathObject(context);
            }
            Natives.installBuiltins = installBuiltins;
        })(Natives = AVM1.Natives || (AVM1.Natives = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var assert = Shumway.Debug.assert;
        var AVM1ActionsData = (function () {
            function AVM1ActionsData(bytes, id, parent) {
                if (parent === void 0) { parent = null; }
                this.bytes = bytes;
                this.id = id;
                this.parent = parent;
                release || assert(bytes instanceof Uint8Array);
            }
            return AVM1ActionsData;
        })();
        AVM1.AVM1ActionsData = AVM1ActionsData;
        var ActionsDataFactory = (function () {
            function ActionsDataFactory() {
                this._cache = new WeakMap();
            }
            ActionsDataFactory.prototype.createActionsData = function (bytes, id, parent) {
                if (parent === void 0) { parent = null; }
                var actionsData = this._cache.get(bytes);
                if (!actionsData) {
                    actionsData = new AVM1ActionsData(bytes, id, parent);
                    this._cache.set(bytes, actionsData);
                }
                release || assert(actionsData.bytes === bytes && actionsData.id === id && actionsData.parent === parent);
                return actionsData;
            };
            return ActionsDataFactory;
        })();
        AVM1.ActionsDataFactory = ActionsDataFactory;
        var AVM1Context = (function () {
            function AVM1Context(swfVersion) {
                this.swfVersion = swfVersion;
                this.root = null;
                this.globals = null;
                this.actionsDataFactory = new ActionsDataFactory();
                this.isPropertyCaseSensitive = swfVersion > 6;
                this.builtins = {};
                Shumway.AVM1.Natives.installBuiltins(this);
                this.eventObservers = Object.create(null);
                this.assets = {};
                this.assetsSymbols = [];
                this.assetsClasses = [];
                this.staticStates = new WeakMap();
            }
            AVM1Context.prototype.flushPendingScripts = function () {
            };
            AVM1Context.prototype.resolveTarget = function (target) {
            };
            AVM1Context.prototype.resolveLevel = function (level) {
            };
            AVM1Context.prototype.addToPendingScripts = function (fn, defaultTarget) {
            };
            AVM1Context.prototype.checkTimeout = function () {
            };
            AVM1Context.prototype.executeActions = function (actionsData, scopeObj) {
            };
            AVM1Context.prototype.executeFunction = function (fn, thisArg, args) {
            };
            AVM1Context.prototype._getEventPropertyObservers = function (propertyName, create) {
                if (!this.isPropertyCaseSensitive) {
                    propertyName = propertyName.toLowerCase();
                }
                var observers = this.eventObservers[propertyName];
                if (observers) {
                    return observers;
                }
                if (create) {
                    observers = [];
                    this.eventObservers[propertyName] = observers;
                    return observers;
                }
                return null;
            };
            AVM1Context.prototype.registerEventPropertyObserver = function (propertyName, observer) {
                var observers = this._getEventPropertyObservers(propertyName, true);
                observers.push(observer);
            };
            AVM1Context.prototype.unregisterEventPropertyObserver = function (propertyName, observer) {
                var observers = this._getEventPropertyObservers(propertyName, false);
                if (!observers) {
                    return;
                }
                var j = observers.indexOf(observer);
                if (j < 0) {
                    return;
                }
                observers.splice(j, 1);
            };
            AVM1Context.prototype.broadcastEventPropertyChange = function (propertyName) {
                var observers = this._getEventPropertyObservers(propertyName, false);
                if (!observers) {
                    return;
                }
                observers.forEach(function (observer) { return observer.onEventPropertyModified(propertyName); });
            };
            AVM1Context.prototype.addAsset = function (className, symbolId, symbolProps) {
                release || Shumway.Debug.assert(typeof className === 'string' && !isNaN(symbolId));
                this.assets[className.toLowerCase()] = symbolId;
                this.assetsSymbols[symbolId] = symbolProps;
            };
            AVM1Context.prototype.registerClass = function (className, theClass) {
                className = AVM1.alCoerceString(this, className);
                if (className === null) {
                    this.utils.warn('Cannot register class for symbol: className is missing');
                    return null;
                }
                var symbolId = this.assets[className.toLowerCase()];
                if (symbolId === undefined) {
                    this.utils.warn('Cannot register ' + className + ' class for symbol');
                    return;
                }
                this.assetsClasses[symbolId] = theClass;
            };
            AVM1Context.prototype.getAsset = function (className) {
                className = AVM1.alCoerceString(this, className);
                if (className === null) {
                    return undefined;
                }
                var symbolId = this.assets[className.toLowerCase()];
                if (symbolId === undefined) {
                    return undefined;
                }
                var symbol = this.assetsSymbols[symbolId];
                if (!symbol) {
                    symbol = this.loaderInfo.getSymbolById(symbolId);
                    if (!symbol) {
                        Shumway.Debug.warning("Symbol " + symbolId + " is not defined.");
                        return undefined;
                    }
                    this.assetsSymbols[symbolId] = symbol;
                }
                return {
                    symbolId: symbolId,
                    symbolProps: symbol,
                    theClass: this.assetsClasses[symbolId]
                };
            };
            AVM1Context.prototype.setStage = function (stage) {
                AVM1.Lib.AVM1Key.bindStage(this, this.globals.Key, stage);
                AVM1.Lib.AVM1Mouse.bindStage(this, this.globals.Mouse, stage);
                AVM1.Lib.AVM1Stage.bindStage(this, this.globals.Stage, stage);
            };
            AVM1Context.prototype.setRoot = function (root, parameters) {
                var as2Object = AVM1.Lib.getAVM1Object(root, this);
                this.root = as2Object;
                for (var paramName in parameters) {
                    if (!as2Object.alHasProperty(paramName)) {
                        as2Object.alPut(paramName, parameters[paramName]);
                    }
                }
            };
            AVM1Context.prototype.getStaticState = function (cls) {
                var state = this.staticStates.get(cls);
                if (!state) {
                    state = Object.create(null);
                    var initStatic = cls.alInitStatic;
                    if (initStatic) {
                        initStatic.call(state, this);
                    }
                    this.staticStates.set(cls, state);
                }
                return state;
            };
            return AVM1Context;
        })();
        AVM1.AVM1Context = AVM1Context;
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2015 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Option = Shumway.Options.Option;
        var OptionSet = Shumway.Options.OptionSet;
        var Telemetry = Shumway.Telemetry;
        var assert = Shumway.Debug.assert;
        var shumwayOptions = Shumway.Settings.shumwayOptions;
        var avm1Options = shumwayOptions.register(new OptionSet("AVM1"));
        AVM1.avm1TraceEnabled = avm1Options.register(new Option("t1", "traceAvm1", "boolean", false, "trace AVM1 execution"));
        AVM1.avm1ErrorsEnabled = avm1Options.register(new Option("e1", "errorsAvm1", "boolean", false, "fail on AVM1 warnings and errors"));
        AVM1.avm1TimeoutDisabled = avm1Options.register(new Option("ha1", "nohangAvm1", "boolean", false, "disable fail on AVM1 hang"));
        AVM1.avm1CompilerEnabled = avm1Options.register(new Option("ca1", "compileAvm1", "boolean", true, "compiles AVM1 code"));
        AVM1.avm1DebuggerEnabled = avm1Options.register(new Option("da1", "debugAvm1", "boolean", false, "allows AVM1 code debugging"));
        AVM1.Debugger = {
            pause: false,
            breakpoints: {}
        };
        function avm1Warn(message, arg1, arg2, arg3, arg4) {
            if (AVM1.avm1ErrorsEnabled.value) {
                try {
                    throw new Error(message);
                }
                catch (e) {
                }
            }
            console.warn.apply(console, arguments);
        }
        AVM1.MAX_AVM1_HANG_TIMEOUT = 1000;
        AVM1.CHECK_AVM1_HANG_EVERY = 1000;
        var MAX_AVM1_ERRORS_LIMIT = 1000;
        var MAX_AVM1_STACK_LIMIT = 256;
        var AVM1ScopeListItemFlags;
        (function (AVM1ScopeListItemFlags) {
            AVM1ScopeListItemFlags[AVM1ScopeListItemFlags["DEFAULT"] = 0] = "DEFAULT";
            AVM1ScopeListItemFlags[AVM1ScopeListItemFlags["TARGET"] = 1] = "TARGET";
            AVM1ScopeListItemFlags[AVM1ScopeListItemFlags["REPLACE_TARGET"] = 2] = "REPLACE_TARGET";
        })(AVM1ScopeListItemFlags || (AVM1ScopeListItemFlags = {}));
        var AVM1ScopeListItem = (function () {
            function AVM1ScopeListItem(scope, previousScopeItem) {
                this.scope = scope;
                this.previousScopeItem = previousScopeItem;
                this.flags = 0 /* DEFAULT */;
            }
            return AVM1ScopeListItem;
        })();
        // Similar to function scope, mostly for 'this'.
        var GlobalPropertiesScope = (function (_super) {
            __extends(GlobalPropertiesScope, _super);
            function GlobalPropertiesScope(context, thisArg) {
                _super.call(this, context);
                this.alSetOwnProperty('this', {
                    flags: 64 /* DATA */ | 1 /* DONT_ENUM */ | 2 /* DONT_DELETE */ | 4 /* READ_ONLY */,
                    value: thisArg
                });
                this.alSetOwnProperty('_global', {
                    flags: 64 /* DATA */ | 1 /* DONT_ENUM */ | 2 /* DONT_DELETE */ | 4 /* READ_ONLY */,
                    value: context.globals
                });
            }
            return GlobalPropertiesScope;
        })(AVM1.AVM1Object);
        var AVM1CallFrame = (function () {
            function AVM1CallFrame(previousFrame, currentThis, fn, args, scopeList) {
                this.previousFrame = previousFrame;
                this.currentThis = currentThis;
                this.fn = fn;
                this.args = args;
                this.scopeList = scopeList;
                this.inSequence = !previousFrame ? false : (previousFrame.calleeThis === currentThis && previousFrame.calleeFn === fn);
                this.resetCallee();
            }
            AVM1CallFrame.prototype.setCallee = function (thisArg, superArg, fn, args) {
                this.calleeThis = thisArg;
                this.calleeSuper = superArg;
                this.calleeFn = fn;
                if (!release) {
                    this.calleeArgs = args;
                }
            };
            AVM1CallFrame.prototype.resetCallee = function () {
                this.calleeThis = null;
                this.calleeSuper = null;
                this.calleeFn = null;
            };
            return AVM1CallFrame;
        })();
        var AVM1RuntimeUtilsImpl = (function () {
            function AVM1RuntimeUtilsImpl(context) {
                this._context = context;
            }
            AVM1RuntimeUtilsImpl.prototype.hasProperty = function (obj, name) {
                return as2HasProperty(this._context, obj, name);
            };
            AVM1RuntimeUtilsImpl.prototype.getProperty = function (obj, name) {
                return as2GetProperty(this._context, obj, name);
            };
            AVM1RuntimeUtilsImpl.prototype.setProperty = function (obj, name, value) {
                return as2SetProperty(this._context, obj, name, value);
            };
            AVM1RuntimeUtilsImpl.prototype.warn = function (msg) {
                avm1Warn.apply(null, arguments);
            };
            return AVM1RuntimeUtilsImpl;
        })();
        var AVM1ContextImpl = (function (_super) {
            __extends(AVM1ContextImpl, _super);
            function AVM1ContextImpl(loaderInfo) {
                var swfVersion = loaderInfo.swfVersion;
                _super.call(this, swfVersion);
                this.loaderInfo = loaderInfo;
                this.sec = loaderInfo.sec; // REDUX:
                this.globals = AVM1.Lib.AVM1Globals.createGlobalsObject(this);
                this.actions = new AVM1.Lib.AVM1NativeActions(this);
                this.initialScope = new AVM1ScopeListItem(this.globals, null);
                this.utils = new AVM1RuntimeUtilsImpl(this);
                this.isActive = false;
                this.executionProhibited = false;
                this.abortExecutionAt = 0;
                this.stackDepth = 0;
                this.frame = null;
                this.isTryCatchListening = false;
                this.errorsIgnored = 0;
                this.deferScriptExecution = true;
                this.pendingScripts = [];
            }
            AVM1ContextImpl.prototype._createExecutionContext = function () {
                // We probably entering this function from some native function,
                // so faking execution context.
                // FIXME
                return {
                    context: this,
                    actions: this.actions,
                    scopeList: this.frame.scopeList,
                    actionTracer: null,
                    constantPool: null,
                    registers: null,
                    stack: null,
                    frame: null,
                    isSwfVersion5: this.swfVersion >= 5,
                    recoveringFromError: false,
                    isEndOfActions: false
                };
            };
            AVM1ContextImpl.prototype.resolveTarget = function (target) {
                var ectx = this._createExecutionContext();
                return avm1ResolveTarget(ectx, target, true) || avm1GetTarget(ectx, true);
            };
            AVM1ContextImpl.prototype.resolveLevel = function (level) {
                var ectx = this._createExecutionContext();
                return avm1ResolveLevel(ectx, level);
            };
            AVM1ContextImpl.prototype.checkTimeout = function () {
                if (Date.now() >= this.abortExecutionAt) {
                    throw new AVM1CriticalError('long running script -- AVM1 instruction hang timeout');
                }
            };
            AVM1ContextImpl.prototype.addToPendingScripts = function (fn) {
                var runner = function () {
                    var savedIsActive = this.isActive;
                    if (!savedIsActive) {
                        this.isActive = true;
                        this.abortExecutionAt = AVM1.avm1TimeoutDisabled.value ? Number.MAX_VALUE : Date.now() + AVM1.MAX_AVM1_HANG_TIMEOUT;
                        this.errorsIgnored = 0;
                    }
                    var caughtError;
                    try {
                        fn();
                    }
                    catch (e) {
                        caughtError = e;
                    }
                    if (caughtError) {
                        throw caughtError;
                    }
                }.bind(this);
                if (!this.deferScriptExecution) {
                    runner();
                    return;
                }
                this.pendingScripts.push(runner);
            };
            AVM1ContextImpl.prototype.flushPendingScripts = function () {
                var scripts = this.pendingScripts;
                while (scripts.length) {
                    scripts.shift()();
                }
                this.deferScriptExecution = false;
            };
            AVM1ContextImpl.prototype.pushCallFrame = function (thisArg, fn, args, scopeList) {
                var nextFrame = new AVM1CallFrame(this.frame, thisArg, fn, args, scopeList);
                this.frame = nextFrame;
                return nextFrame;
            };
            AVM1ContextImpl.prototype.popCallFrame = function () {
                var previousFrame = this.frame.previousFrame;
                this.frame = previousFrame;
                return previousFrame;
            };
            AVM1ContextImpl.prototype.executeActions = function (actionsData, scopeObj) {
                if (this.executionProhibited) {
                    return; // no more avm1 for this context
                }
                var savedIsActive = this.isActive;
                if (!savedIsActive) {
                    this.isActive = true;
                    this.abortExecutionAt = AVM1.avm1TimeoutDisabled.value ? Number.MAX_VALUE : Date.now() + AVM1.MAX_AVM1_HANG_TIMEOUT;
                    this.errorsIgnored = 0;
                }
                var caughtError;
                try {
                    executeActionsData(this, actionsData, scopeObj);
                }
                catch (e) {
                    caughtError = e;
                }
                this.isActive = savedIsActive;
                if (caughtError) {
                    throw caughtError;
                }
            };
            AVM1ContextImpl.prototype.executeFunction = function (fn, thisArg, args) {
                if (this.executionProhibited) {
                    return; // no more avm1 for this context
                }
                var savedIsActive = this.isActive;
                if (!savedIsActive) {
                    this.isActive = true;
                    this.abortExecutionAt = AVM1.avm1TimeoutDisabled.value ? Number.MAX_VALUE : Date.now() + AVM1.MAX_AVM1_HANG_TIMEOUT;
                    this.errorsIgnored = 0;
                }
                var caughtError;
                var result;
                try {
                    result = fn.alCall(thisArg, args);
                }
                catch (e) {
                    caughtError = e;
                }
                this.isActive = savedIsActive;
                if (caughtError) {
                    throw caughtError;
                }
                return result;
            };
            return AVM1ContextImpl;
        })(AVM1.AVM1Context);
        AVM1.AVM1Context.create = function (loaderInfo) {
            return new AVM1ContextImpl(loaderInfo);
        };
        var AVM1Error = (function () {
            function AVM1Error(error) {
                this.error = error;
            }
            return AVM1Error;
        })();
        var AVM1CriticalError = (function (_super) {
            __extends(AVM1CriticalError, _super);
            function AVM1CriticalError(message, error) {
                _super.call(this, message);
                this.error = error;
            }
            return AVM1CriticalError;
        })(Error);
        function isAVM1MovieClip(obj) {
            return typeof obj === 'object' && obj && obj instanceof AVM1.Lib.AVM1MovieClip;
        }
        function as2GetType(v) {
            if (v === null) {
                return 'null';
            }
            var type = typeof v;
            if (type === 'function') {
                return 'object';
            }
            if (type === 'object' && isAVM1MovieClip(v)) {
                return 'movieclip';
            }
            return type;
        }
        function as2ToAddPrimitive(context, value) {
            return AVM1.alToPrimitive(context, value);
        }
        function as2Compare(context, x, y) {
            var x2 = AVM1.alToPrimitive(context, x);
            var y2 = AVM1.alToPrimitive(context, y);
            if (typeof x2 === 'string' && typeof y2 === 'string') {
                var xs = AVM1.alToString(context, x2), ys = AVM1.alToString(context, y2);
                return xs < ys;
            }
            else {
                var xn = AVM1.alToNumber(context, x2), yn = AVM1.alToNumber(context, y2);
                return isNaN(xn) || isNaN(yn) ? undefined : xn < yn;
            }
        }
        function as2InstanceOf(obj, constructor) {
            // TODO refactor this -- quick and dirty hack for now
            if (Shumway.isNullOrUndefined(obj) || Shumway.isNullOrUndefined(constructor)) {
                return false;
            }
            if (constructor === Shumway.AVMX.AS.ASString) {
                return typeof obj === 'string';
            }
            else if (constructor === Shumway.AVMX.AS.ASNumber) {
                return typeof obj === 'number';
            }
            else if (constructor === Shumway.AVMX.AS.ASBoolean) {
                return typeof obj === 'boolean';
            }
            else if (constructor === Shumway.AVMX.AS.ASArray) {
                return Array.isArray(obj);
            }
            else if (constructor === Shumway.AVMX.AS.ASFunction) {
                return typeof obj === 'function';
            }
            else if (constructor === Shumway.AVMX.AS.ASObject) {
                return typeof obj === 'object';
            }
            var baseProto = constructor.alGetPrototypeProperty();
            if (!baseProto) {
                return false;
            }
            var proto = obj;
            while (proto) {
                if (proto === baseProto) {
                    return true; // found the type if the chain
                }
                proto = proto.alPrototype;
            }
            // TODO interface check
            return false;
        }
        function as2HasProperty(context, obj, name) {
            var avm1Obj = AVM1.alToObject(context, obj);
            return avm1Obj.alHasProperty(name);
        }
        function as2GetProperty(context, obj, name) {
            var avm1Obj = AVM1.alToObject(context, obj);
            return avm1Obj.alGet(name);
        }
        function as2SetProperty(context, obj, name, value) {
            var avm1Obj = AVM1.alToObject(context, obj);
            avm1Obj.alPut(name, value);
            as2SyncEvents(context, name);
        }
        function as2DeleteProperty(context, obj, name) {
            var avm1Obj = AVM1.alToObject(context, obj);
            var result = avm1Obj.alDeleteProperty(name);
            as2SyncEvents(context, name);
            return result;
        }
        function as2SyncEvents(context, name) {
            name = AVM1.alCoerceString(context, name);
            if (name[0] !== 'o' || name[1] !== 'n') {
                return;
            }
            // Maybe an event property, trying to broadcast change.
            context.broadcastEventPropertyChange(name);
        }
        function as2CastError(ex) {
            if (typeof InternalError !== 'undefined' && ex instanceof InternalError && ex.message === 'too much recursion') {
                // HACK converting too much recursion into AVM1CriticalError
                return new AVM1CriticalError('long running script -- AVM1 recursion limit is reached');
            }
            return ex;
        }
        function as2Construct(ctor, args) {
            var result;
            if (AVM1.alIsFunction(ctor)) {
                result = ctor.alConstruct(args);
            }
            else {
                // AVM1 simply ignores attempts to invoke non-methods.
                return undefined;
            }
            return result;
        }
        function as2Enumerate(obj, fn, thisArg) {
            var processed = Object.create(null); // TODO remove/refactor
            AVM1.alForEachProperty(obj, function (name) {
                if (processed[name]) {
                    return; // skipping already reported properties
                }
                fn.call(thisArg, name);
                processed[name] = true;
            }, thisArg);
        }
        function avm1FindSuperPropertyOwner(context, frame, propertyName) {
            if (context.swfVersion < 6) {
                return null;
            }
            var proto = (frame.inSequence && frame.previousFrame.calleeSuper);
            if (!proto) {
                // Finding first object in prototype chain link that has the property.
                proto = frame.currentThis;
                while (proto && !proto.alHasOwnProperty(propertyName)) {
                    proto = proto.alPrototype;
                }
                if (!proto) {
                    return null;
                }
            }
            // Skipping one chain link
            proto = proto.alPrototype;
            return proto;
        }
        function executeActionsData(context, actionsData, scope) {
            var actionTracer = ActionTracerFactory.get();
            var registers = [];
            registers.length = 4; // by default only 4 registers allowed
            var globalPropertiesScopeList = new AVM1ScopeListItem(new GlobalPropertiesScope(context, scope), context.initialScope);
            var scopeList = new AVM1ScopeListItem(scope, globalPropertiesScopeList);
            scopeList.flags |= 1 /* TARGET */;
            var caughtError;
            context.pushCallFrame(scope, null, null, scopeList);
            actionTracer.message('ActionScript Execution Starts');
            actionTracer.indent();
            try {
                interpretActionsData(context, actionsData, scopeList, [], registers);
            }
            catch (e) {
                caughtError = as2CastError(e);
            }
            if (caughtError instanceof AVM1CriticalError) {
                context.executionProhibited = true;
                console.error('Disabling AVM1 execution');
            }
            context.popCallFrame();
            actionTracer.unindent();
            actionTracer.message('ActionScript Execution Stops');
            if (caughtError) {
                throw caughtError;
            }
        }
        function createBuiltinType(context, cls, args) {
            var builtins = context.builtins;
            var obj = undefined;
            if (cls === builtins.Array || cls === builtins.Object || cls === builtins.Date || cls === builtins.String || cls === builtins.Function) {
                obj = cls.alConstruct(args);
            }
            if (cls === builtins.Boolean || cls === builtins.Number) {
                obj = cls.alConstruct(args).value;
            }
            if (obj instanceof AVM1.AVM1Object) {
                obj.alSetOwnProperty('__constructor__', {
                    flags: 64 /* DATA */ | 1 /* DONT_ENUM */,
                    value: cls
                });
            }
            return obj;
        }
        var AVM1SuperWrapper = (function (_super) {
            __extends(AVM1SuperWrapper, _super);
            function AVM1SuperWrapper(context, callFrame) {
                _super.call(this, context);
                this.callFrame = callFrame;
                this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
            }
            return AVM1SuperWrapper;
        })(AVM1.AVM1Object);
        /**
         * Interpreted function closure.
         */
        var AVM1InterpreterScope = (function (_super) {
            __extends(AVM1InterpreterScope, _super);
            function AVM1InterpreterScope(context) {
                _super.call(this, context);
                this.alPut('toString', new AVM1.AVM1NativeFunction(context, this._toString));
            }
            AVM1InterpreterScope.prototype._toString = function () {
                // It shall return 'this'
                return this;
            };
            return AVM1InterpreterScope;
        })(AVM1.AVM1Object);
        // TODO Registers are shared across all AVM1Contents -- improve that.
        var cachedRegisters = [];
        var MAX_CACHED_REGISTERS = 10;
        function createRegisters(registersLength) {
            var registers = cachedRegisters.length > 0 ? cachedRegisters.pop() : [];
            registers.length = registersLength;
            return registers;
        }
        function disposeRegisters(registers) {
            if (cachedRegisters.length > MAX_CACHED_REGISTERS) {
                return;
            }
            cachedRegisters.push(registers);
        }
        var AVM1InterpretedFunction = (function (_super) {
            __extends(AVM1InterpretedFunction, _super);
            function AVM1InterpretedFunction(context, ectx, actionsData, functionName, parametersNames, registersCount, registersAllocation, suppressArguments) {
                _super.call(this, context);
                this.functionName = functionName;
                this.actionsData = actionsData;
                this.parametersNames = parametersNames;
                this.registersAllocation = registersAllocation;
                this.suppressArguments = suppressArguments;
                this.scopeList = ectx.scopeList;
                this.constantPool = ectx.constantPool;
                this.actionTracer = ectx.actionTracer;
                var skipArguments = null;
                var registersAllocationCount = !registersAllocation ? 0 : registersAllocation.length;
                for (var i = 0; i < registersAllocationCount; i++) {
                    var registerAllocation = registersAllocation[i];
                    if (registerAllocation && registerAllocation.type === 1 /* Argument */) {
                        if (!skipArguments) {
                            skipArguments = [];
                        }
                        skipArguments[registersAllocation[i].index] = true;
                    }
                }
                this.skipArguments = skipArguments;
                var registersLength = Math.min(registersCount, 255); // max allowed for DefineFunction2
                registersLength = Math.max(registersLength, registersAllocationCount + 1);
                this.registersLength = registersLength;
            }
            AVM1InterpretedFunction.prototype.alCall = function (thisArg, args) {
                var currentContext = this.context;
                if (currentContext.executionProhibited) {
                    return; // no more avm1 execution, ever
                }
                var newScope = new AVM1InterpreterScope(currentContext);
                var newScopeList = new AVM1ScopeListItem(newScope, this.scopeList);
                var oldScope = this.scopeList.scope;
                thisArg = thisArg || oldScope; // REDUX no isGlobalObject check?
                args = args || [];
                var supperWrapper;
                var frame = currentContext.pushCallFrame(thisArg, this, args, newScopeList);
                var suppressArguments = this.suppressArguments;
                if (!(suppressArguments & 4 /* Arguments */)) {
                    newScope.alPut('arguments', new AVM1.Natives.AVM1ArrayNative(currentContext, args));
                }
                if (!(suppressArguments & 2 /* This */)) {
                    newScope.alPut('this', thisArg);
                }
                if (!(suppressArguments & 8 /* Super */)) {
                    supperWrapper = new AVM1SuperWrapper(currentContext, frame);
                    newScope.alPut('super', supperWrapper);
                }
                var i;
                var registers = createRegisters(this.registersLength);
                var registersAllocation = this.registersAllocation;
                var registersAllocationCount = !registersAllocation ? 0 : registersAllocation.length;
                for (i = 0; i < registersAllocationCount; i++) {
                    var registerAllocation = registersAllocation[i];
                    if (registerAllocation) {
                        switch (registerAllocation.type) {
                            case 1 /* Argument */:
                                registers[i] = args[registerAllocation.index];
                                break;
                            case 2 /* This */:
                                registers[i] = thisArg;
                                break;
                            case 4 /* Arguments */:
                                registers[i] = new AVM1.Natives.AVM1ArrayNative(currentContext, args);
                                break;
                            case 8 /* Super */:
                                supperWrapper = supperWrapper || new AVM1SuperWrapper(currentContext, frame);
                                registers[i] = supperWrapper;
                                break;
                            case 16 /* Global */:
                                registers[i] = currentContext.globals;
                                break;
                            case 32 /* Parent */:
                                registers[i] = oldScope.alGet('_parent');
                                break;
                            case 64 /* Root */:
                                registers[i] = currentContext.resolveLevel(0);
                                break;
                        }
                    }
                }
                var parametersNames = this.parametersNames;
                var skipArguments = this.skipArguments;
                for (i = 0; i < args.length || i < parametersNames.length; i++) {
                    if (skipArguments && skipArguments[i]) {
                        continue;
                    }
                    newScope.alPut(parametersNames[i], args[i]);
                }
                var result;
                var caughtError;
                var actionTracer = this.actionTracer;
                var actionsData = this.actionsData;
                var constantPool = this.constantPool;
                actionTracer.indent();
                if (++currentContext.stackDepth >= MAX_AVM1_STACK_LIMIT) {
                    throw new AVM1CriticalError('long running script -- AVM1 recursion limit is reached');
                }
                try {
                    result = interpretActionsData(currentContext, actionsData, newScopeList, constantPool, registers);
                }
                catch (e) {
                    caughtError = e;
                }
                currentContext.stackDepth--;
                currentContext.popCallFrame();
                actionTracer.unindent();
                disposeRegisters(registers);
                if (caughtError) {
                    throw caughtError;
                }
                return result;
            };
            return AVM1InterpretedFunction;
        })(AVM1.AVM1EvalFunction);
        function fixArgsCount(numArgs /* int */, maxAmount) {
            if (isNaN(numArgs) || numArgs < 0) {
                avm1Warn('Invalid amount of arguments: ' + numArgs);
                return 0;
            }
            numArgs |= 0;
            if (numArgs > maxAmount) {
                avm1Warn('Truncating amount of arguments: from ' + numArgs + ' to ' + maxAmount);
                return maxAmount;
            }
            return numArgs;
        }
        function avm1ReadFunctionArgs(stack) {
            var numArgs = +stack.pop();
            numArgs = fixArgsCount(numArgs, stack.length);
            var args = [];
            for (var i = 0; i < numArgs; i++) {
                args.push(stack.pop());
            }
            return args;
        }
        function avm1SetTarget(ectx, targetPath) {
            var newTarget = null;
            if (targetPath) {
                try {
                    newTarget = avm1ResolveTarget(ectx, targetPath, false);
                    if (!avm1IsTarget(newTarget)) {
                        avm1Warn('Invalid AVM1 target object: ' + targetPath);
                        newTarget = undefined;
                    }
                }
                catch (e) {
                    avm1Warn('Unable to set target: ' + e);
                }
            }
            if (newTarget) {
                ectx.scopeList.flags |= 2 /* REPLACE_TARGET */;
                ectx.scopeList.replaceTargetBy = newTarget;
            }
            else {
                ectx.scopeList.flags &= ~2 /* REPLACE_TARGET */;
                ectx.scopeList.replaceTargetBy = null;
            }
        }
        function isGlobalObject(obj) {
            return obj === this;
        }
        function avm1DefineFunction(ectx, actionsData, functionName, parametersNames, registersCount, registersAllocation, suppressArguments) {
            return new AVM1InterpretedFunction(ectx.context, ectx, actionsData, functionName, parametersNames, registersCount, registersAllocation, suppressArguments);
        }
        function avm1VariableNameHasPath(variableName) {
            return variableName && (variableName.indexOf('.') >= 0 || variableName.indexOf(':') >= 0 || variableName.indexOf('/') >= 0);
        }
        var AVM1ResolveVariableFlags;
        (function (AVM1ResolveVariableFlags) {
            AVM1ResolveVariableFlags[AVM1ResolveVariableFlags["READ"] = 1] = "READ";
            AVM1ResolveVariableFlags[AVM1ResolveVariableFlags["WRITE"] = 2] = "WRITE";
            AVM1ResolveVariableFlags[AVM1ResolveVariableFlags["DELETE"] = AVM1ResolveVariableFlags.READ] = "DELETE";
            AVM1ResolveVariableFlags[AVM1ResolveVariableFlags["GET_VALUE"] = 32] = "GET_VALUE";
            AVM1ResolveVariableFlags[AVM1ResolveVariableFlags["DISALLOW_TARGET_OVERRIDE"] = 64] = "DISALLOW_TARGET_OVERRIDE";
            AVM1ResolveVariableFlags[AVM1ResolveVariableFlags["ONLY_TARGETS"] = 128] = "ONLY_TARGETS";
        })(AVM1ResolveVariableFlags || (AVM1ResolveVariableFlags = {}));
        var cachedResolvedVariableResult = {
            scope: null,
            propertyName: null,
            value: undefined
        };
        function avm1IsTarget(target) {
            // TODO refactor
            return target instanceof AVM1.AVM1Object && target.isAVM1Instance;
        }
        function avm1ResolveSimpleVariable(scopeList, variableName, flags) {
            var currentTarget;
            var resolved = cachedResolvedVariableResult;
            for (var p = scopeList; p; p = p.previousScopeItem) {
                if ((p.flags & 2 /* REPLACE_TARGET */) && !(flags & 64 /* DISALLOW_TARGET_OVERRIDE */) && !currentTarget) {
                    currentTarget = p.replaceTargetBy;
                }
                if ((p.flags & 1 /* TARGET */)) {
                    if ((flags & 2 /* WRITE */)) {
                        // last scope/target we can modify (exclude globals)
                        resolved.scope = currentTarget || p.scope;
                        resolved.propertyName = variableName;
                        resolved.value = (flags & 32 /* GET_VALUE */) ? resolved.scope.alGet(variableName) : undefined;
                        return resolved;
                    }
                    if ((flags & 1 /* READ */) && currentTarget) {
                        if (currentTarget.alHasProperty(variableName)) {
                            resolved.scope = currentTarget;
                            resolved.propertyName = variableName;
                            resolved.value = (flags & 32 /* GET_VALUE */) ? currentTarget.alGet(variableName) : undefined;
                            return resolved;
                        }
                        continue;
                    }
                }
                if (p.scope.alHasProperty(variableName)) {
                    resolved.scope = p.scope;
                    resolved.propertyName = variableName;
                    resolved.value = (flags & 32 /* GET_VALUE */) ? p.scope.alGet(variableName) : undefined;
                    return resolved;
                }
            }
            release || Shumway.Debug.assert(!(flags & 2 /* WRITE */));
            return undefined;
        }
        function avm1ResolveVariable(ectx, variableName, flags) {
            // For now it is just very much magical -- designed to pass some of the swfdec tests
            // FIXME refactor
            release || Shumway.Debug.assert(variableName);
            if (!avm1VariableNameHasPath(variableName)) {
                return avm1ResolveSimpleVariable(ectx.scopeList, variableName, flags);
            }
            var i = 0, j = variableName.length;
            var markedAsTarget = true;
            var resolved, ch;
            var propertyName, scope, obj;
            if (variableName[0] === '/') {
                resolved = avm1ResolveSimpleVariable(ectx.scopeList, '_level0', 1 /* READ */ | 32 /* GET_VALUE */);
                propertyName = resolved ? resolved.propertyName : null;
                scope = resolved ? resolved.scope : null;
                obj = resolved ? resolved.value : undefined;
                i++;
            }
            else {
                obj = avm1GetTarget(ectx, !(flags & 64 /* DISALLOW_TARGET_OVERRIDE */));
                propertyName = obj.name;
                scope = obj._parent;
            }
            if (i >= j) {
                resolved = cachedResolvedVariableResult;
                resolved.propertyName = propertyName;
                resolved.scope = scope;
                resolved.value = obj;
                return resolved;
            }
            var q = i;
            while (i < j) {
                if (!(obj instanceof AVM1.AVM1Object)) {
                    avm1Warn('Unable to resolve variable on invalid object ' + variableName.substring(q, i - 1) + ' (expr ' + variableName + ')');
                    return null;
                }
                var propertyName;
                var q = i;
                if (variableName[i] === '.' && variableName[i + 1] === '.') {
                    i += 2;
                    propertyName = '_parent';
                }
                else {
                    while (i < j && ((ch = variableName[i]) !== '/' && ch !== '.' && ch !== ':')) {
                        i++;
                    }
                    propertyName = variableName.substring(q, i);
                }
                if (propertyName === '' && i < j) {
                    // Ignoring double delimiters in the middle of the path
                    i++;
                    continue;
                }
                scope = obj;
                var valueFound = false;
                if (markedAsTarget) {
                    // Trying movie clip children first
                    var child = obj instanceof AVM1.Lib.AVM1MovieClip ? obj._lookupChildByName(propertyName) : undefined;
                    if (child) {
                        valueFound = true;
                        obj = child;
                    }
                }
                if (!valueFound && obj.alHasProperty(propertyName)) {
                    obj = obj.alGet(propertyName);
                    valueFound = true;
                }
                if (!valueFound && propertyName[0] === '_') {
                    // FIXME hacking to pass some swfdec test cases
                    if (propertyName === '_level0' || propertyName === '_root') {
                        obj = avm1ResolveLevel(ectx, 0);
                        valueFound = true;
                    }
                }
                if (!valueFound) {
                    avm1Warn('Unable to resolve ' + propertyName + ' on ' + variableName.substring(q, i - 1) + ' (expr ' + variableName + ')');
                    return null;
                }
                if (i >= j) {
                    break;
                }
                var delimiter = variableName[i++];
                if (delimiter === '/' && ((ch = variableName[i]) === ':' || ch === '.')) {
                    delimiter = variableName[i++];
                }
                markedAsTarget = delimiter === '/';
            }
            resolved = cachedResolvedVariableResult;
            resolved.scope = scope;
            resolved.propertyName = propertyName;
            resolved.value = (flags & 32 /* GET_VALUE */) ? obj : undefined;
            return resolved;
        }
        function avm1GetTarget(ectx, allowOverride) {
            var scopeList = ectx.scopeList;
            for (var p = scopeList; p.previousScopeItem; p = p.previousScopeItem) {
                if ((p.flags & 2 /* REPLACE_TARGET */) && allowOverride) {
                    return p.replaceTargetBy;
                }
                if ((p.flags & 1 /* TARGET */)) {
                    return p.scope;
                }
            }
            release || Shumway.Debug.assert(false, 'Shall not reach this statement');
            return undefined;
        }
        function avm1ResolveTarget(ectx, target, fromCurrentTarget) {
            var result;
            if (avm1IsTarget(target)) {
                result = target;
            }
            else {
                target = Shumway.isNullOrUndefined(target) ? '' : AVM1.alToString(this, target);
                if (target) {
                    var targetPath = AVM1.alToString(ectx.context, target);
                    var resolved = avm1ResolveVariable(ectx, targetPath, 1 /* READ */ | 128 /* ONLY_TARGETS */ | 32 /* GET_VALUE */ | (fromCurrentTarget ? 0 : 64 /* DISALLOW_TARGET_OVERRIDE */));
                    if (!resolved || !avm1IsTarget(resolved.value)) {
                        avm1Warn('Invalid AVM1 target object: ' + targetPath);
                        result = undefined;
                    }
                    else {
                        result = resolved.value;
                    }
                }
                else {
                    result = avm1GetTarget(ectx, true);
                }
            }
            return result;
        }
        function avm1ResolveLevel(ectx, level) {
            // TODO levels 1, 2, etc.
            // TODO _lockroot
            if (level === 0) {
                return ectx.context.root;
            }
            return undefined;
        }
        function avm1ProcessWith(ectx, obj, withBlock) {
            if (Shumway.isNullOrUndefined(obj)) {
                // Not executing anything in the block.
                avm1Warn('The with statement object cannot be undefined.');
                return;
            }
            var context = ectx.context;
            var scopeList = ectx.scopeList;
            var constantPool = ectx.constantPool;
            var registers = ectx.registers;
            var newScopeList = new AVM1ScopeListItem(AVM1.alToObject(ectx.context, obj), scopeList);
            interpretActionsData(ectx.context, withBlock, newScopeList, constantPool, registers);
        }
        function avm1ProcessTry(ectx, catchIsRegisterFlag, finallyBlockFlag, catchBlockFlag, catchTarget, tryBlock, catchBlock, finallyBlock) {
            var currentContext = ectx.context;
            var scopeList = ectx.scopeList;
            var constantPool = ectx.constantPool;
            var registers = ectx.registers;
            var savedTryCatchState = currentContext.isTryCatchListening;
            var caughtError;
            try {
                currentContext.isTryCatchListening = true;
                interpretActionsData(currentContext, tryBlock, scopeList, constantPool, registers);
            }
            catch (e) {
                currentContext.isTryCatchListening = savedTryCatchState;
                if (!catchBlockFlag || !(e instanceof AVM1Error)) {
                    caughtError = e;
                }
                else {
                    if (typeof catchTarget === 'string') {
                        var scope = scopeList.scope;
                        scope.alPut(catchTarget, e.error);
                    }
                    else {
                        registers[catchTarget] = e.error;
                    }
                    interpretActionsData(currentContext, catchBlock, scopeList, constantPool, registers);
                }
            }
            currentContext.isTryCatchListening = savedTryCatchState;
            if (finallyBlockFlag) {
                interpretActionsData(currentContext, finallyBlock, scopeList, constantPool, registers);
            }
            if (caughtError) {
                throw caughtError;
            }
        }
        // SWF 3 actions
        function avm1_0x81_ActionGotoFrame(ectx, args) {
            var frame = args[0];
            var play = args[1];
            if (play) {
                ectx.actions.gotoAndPlay(frame + 1);
            }
            else {
                ectx.actions.gotoAndStop(frame + 1);
            }
        }
        function avm1_0x83_ActionGetURL(ectx, args) {
            var actions = ectx.actions;
            var urlString = args[0];
            var targetString = args[1];
            ectx.actions.getURL(urlString, targetString);
        }
        function avm1_0x04_ActionNextFrame(ectx) {
            ectx.actions.nextFrame();
        }
        function avm1_0x05_ActionPreviousFrame(ectx) {
            ectx.actions.prevFrame();
        }
        function avm1_0x06_ActionPlay(ectx) {
            ectx.actions.play();
        }
        function avm1_0x07_ActionStop(ectx) {
            ectx.actions.stop();
        }
        function avm1_0x08_ActionToggleQuality(ectx) {
            ectx.actions.toggleHighQuality();
        }
        function avm1_0x09_ActionStopSounds(ectx) {
            ectx.actions.stopAllSounds();
        }
        function avm1_0x8A_ActionWaitForFrame(ectx, args) {
            var frame = args[0];
            var count = args[1];
            return !ectx.actions.ifFrameLoaded(frame);
        }
        function avm1_0x8B_ActionSetTarget(ectx, args) {
            var targetName = args[0];
            avm1SetTarget(ectx, targetName);
        }
        function avm1_0x8C_ActionGoToLabel(ectx, args) {
            var label = args[0];
            var play = args[1];
            if (play) {
                ectx.actions.gotoAndPlay(label);
            }
            else {
                ectx.actions.gotoAndStop(label);
            }
        }
        // SWF 4 actions
        function avm1_0x96_ActionPush(ectx, args) {
            var registers = ectx.registers;
            var constantPool = ectx.constantPool;
            var stack = ectx.stack;
            args.forEach(function (value) {
                if (value instanceof AVM1.ParsedPushConstantAction) {
                    stack.push(constantPool[value.constantIndex]);
                }
                else if (value instanceof AVM1.ParsedPushRegisterAction) {
                    var registerNumber = value.registerNumber;
                    if (registerNumber < 0 || registerNumber >= registers.length) {
                        stack.push(undefined);
                    }
                    else {
                        stack.push(registers[registerNumber]);
                    }
                }
                else {
                    stack.push(value);
                }
            });
        }
        function avm1_0x17_ActionPop(ectx) {
            var stack = ectx.stack;
            stack.pop();
        }
        function avm1_0x0A_ActionAdd(ectx) {
            var stack = ectx.stack;
            var a = AVM1.alToNumber(ectx.context, stack.pop());
            var b = AVM1.alToNumber(ectx.context, stack.pop());
            stack.push(a + b);
        }
        function avm1_0x0B_ActionSubtract(ectx) {
            var stack = ectx.stack;
            var a = AVM1.alToNumber(ectx.context, stack.pop());
            var b = AVM1.alToNumber(ectx.context, stack.pop());
            stack.push(b - a);
        }
        function avm1_0x0C_ActionMultiply(ectx) {
            var stack = ectx.stack;
            var a = AVM1.alToNumber(ectx.context, stack.pop());
            var b = AVM1.alToNumber(ectx.context, stack.pop());
            stack.push(a * b);
        }
        function avm1_0x0D_ActionDivide(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;
            var a = AVM1.alToNumber(ectx.context, stack.pop());
            var b = AVM1.alToNumber(ectx.context, stack.pop());
            var c = b / a;
            stack.push(isSwfVersion5 ? c : isFinite(c) ? c : '#ERROR#');
        }
        function avm1_0x0E_ActionEquals(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;
            var a = AVM1.alToNumber(ectx.context, stack.pop());
            var b = AVM1.alToNumber(ectx.context, stack.pop());
            var f = a == b;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x0F_ActionLess(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;
            var a = AVM1.alToNumber(ectx.context, stack.pop());
            var b = AVM1.alToNumber(ectx.context, stack.pop());
            var f = b < a;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x10_ActionAnd(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;
            var a = AVM1.alToBoolean(ectx.context, stack.pop());
            var b = AVM1.alToBoolean(ectx.context, stack.pop());
            var f = a && b;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x11_ActionOr(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;
            var a = AVM1.alToBoolean(ectx.context, stack.pop());
            var b = AVM1.alToBoolean(ectx.context, stack.pop());
            var f = a || b;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x12_ActionNot(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;
            var f = !AVM1.alToBoolean(ectx.context, stack.pop());
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x13_ActionStringEquals(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;
            var sa = AVM1.alToString(ectx.context, stack.pop());
            var sb = AVM1.alToString(ectx.context, stack.pop());
            var f = sa == sb;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x14_ActionStringLength(ectx) {
            var stack = ectx.stack;
            var sa = AVM1.alToString(ectx.context, stack.pop());
            stack.push(ectx.actions.length_(sa));
        }
        function avm1_0x31_ActionMBStringLength(ectx) {
            var stack = ectx.stack;
            var sa = AVM1.alToString(ectx.context, stack.pop());
            stack.push(ectx.actions.length_(sa));
        }
        function avm1_0x21_ActionStringAdd(ectx) {
            var stack = ectx.stack;
            var sa = AVM1.alToString(ectx.context, stack.pop());
            var sb = AVM1.alToString(ectx.context, stack.pop());
            stack.push(sb + sa);
        }
        function avm1_0x15_ActionStringExtract(ectx) {
            var stack = ectx.stack;
            var count = stack.pop();
            var index = stack.pop();
            var value = AVM1.alToString(ectx.context, stack.pop());
            stack.push(ectx.actions.substring(value, index, count));
        }
        function avm1_0x35_ActionMBStringExtract(ectx) {
            var stack = ectx.stack;
            var count = stack.pop();
            var index = stack.pop();
            var value = AVM1.alToString(ectx.context, stack.pop());
            stack.push(ectx.actions.mbsubstring(value, index, count));
        }
        function avm1_0x29_ActionStringLess(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;
            var sa = AVM1.alToString(ectx.context, stack.pop());
            var sb = AVM1.alToString(ectx.context, stack.pop());
            var f = sb < sa;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x18_ActionToInteger(ectx) {
            var stack = ectx.stack;
            stack.push(ectx.actions.int(stack.pop()));
        }
        function avm1_0x32_ActionCharToAscii(ectx) {
            var stack = ectx.stack;
            var ch = stack.pop();
            var charCode = ectx.actions.ord(ch);
            stack.push(charCode);
        }
        function avm1_0x36_ActionMBCharToAscii(ectx) {
            var stack = ectx.stack;
            var ch = stack.pop();
            var charCode = ectx.actions.mbord(ch);
            stack.push(charCode);
        }
        function avm1_0x33_ActionAsciiToChar(ectx) {
            var stack = ectx.stack;
            var charCode = +stack.pop();
            var ch = ectx.actions.chr(charCode);
            stack.push(ch);
        }
        function avm1_0x37_ActionMBAsciiToChar(ectx) {
            var stack = ectx.stack;
            var charCode = +stack.pop();
            var ch = ectx.actions.mbchr(charCode);
            stack.push(ch);
        }
        function avm1_0x99_ActionJump(ectx, args) {
            // implemented in the analyzer
        }
        function avm1_0x9D_ActionIf(ectx, args) {
            var stack = ectx.stack;
            var offset = args[0];
            return !!stack.pop();
        }
        function avm1_0x9E_ActionCall(ectx) {
            var stack = ectx.stack;
            var label = stack.pop();
            ectx.actions.call(label);
        }
        function avm1_0x1C_ActionGetVariable(ectx) {
            var stack = ectx.stack;
            var variableName = '' + stack.pop();
            var sp = stack.length;
            stack.push(undefined);
            var resolved = avm1ResolveVariable(ectx, variableName, 1 /* READ */ | 32 /* GET_VALUE */);
            if (Shumway.isNullOrUndefined(resolved)) {
                avm1Warn("AVM1 warning: cannot look up variable '" + variableName + "'");
                return;
            }
            stack[sp] = resolved.value;
        }
        function avm1_0x1D_ActionSetVariable(ectx) {
            var stack = ectx.stack;
            var value = stack.pop();
            var variableName = '' + stack.pop();
            var resolved = avm1ResolveVariable(ectx, variableName, 2 /* WRITE */);
            if (Shumway.isNullOrUndefined(resolved)) {
                avm1Warn("AVM1 warning: cannot look up variable '" + variableName + "'");
                return;
            }
            resolved.scope.alPut(variableName, value);
            as2SyncEvents(ectx.context, variableName);
        }
        function avm1_0x9A_ActionGetURL2(ectx, args) {
            var stack = ectx.stack;
            var flags = args[0];
            var target = stack.pop();
            var url = stack.pop();
            var sendVarsMethod;
            if (flags & 1) {
                sendVarsMethod = 'GET';
            }
            else if (flags & 2) {
                sendVarsMethod = 'POST';
            }
            var loadTargetFlag = flags & 1 << 6;
            var loadVariablesFlag = flags & 1 << 7;
            if (loadVariablesFlag) {
                ectx.actions.loadVariables(url, target, sendVarsMethod);
            }
            else if (!loadTargetFlag) {
                ectx.actions.getURL(url, target, sendVarsMethod);
            }
            else {
                ectx.actions.loadMovie(url, target, sendVarsMethod);
            }
        }
        function avm1_0x9F_ActionGotoFrame2(ectx, args) {
            var stack = ectx.stack;
            var flags = args[0];
            var gotoParams = [stack.pop()];
            if (!!(flags & 2)) {
                gotoParams.push(args[1]);
            }
            var gotoMethod = !!(flags & 1) ? ectx.actions.gotoAndPlay : ectx.actions.gotoAndStop;
            gotoMethod.apply(ectx.actions, gotoParams);
        }
        function avm1_0x20_ActionSetTarget2(ectx) {
            var stack = ectx.stack;
            var target = AVM1.alToString(ectx.context, stack.pop());
            avm1SetTarget(ectx, target);
        }
        function avm1_0x22_ActionGetProperty(ectx) {
            var stack = ectx.stack;
            var index = stack.pop();
            var target = stack.pop();
            var sp = stack.length;
            stack.push(undefined);
            var resolved = avm1ResolveTarget(ectx, target, true);
            var propertyName = AVM1.PropertiesIndexMap[index];
            if (resolved && propertyName) {
                stack[sp] = resolved.alGet(propertyName);
            }
        }
        function avm1_0x23_ActionSetProperty(ectx) {
            var stack = ectx.stack;
            var value = stack.pop();
            var index = stack.pop();
            var target = stack.pop();
            var resolved = avm1ResolveTarget(ectx, target, true);
            var propertyName = AVM1.PropertiesIndexMap[index];
            if (resolved && propertyName) {
                resolved.alPut(propertyName, value);
            }
        }
        function avm1_0x24_ActionCloneSprite(ectx) {
            var stack = ectx.stack;
            var depth = stack.pop();
            var target = stack.pop();
            var source = stack.pop();
            ectx.actions.duplicateMovieClip(source, target, depth);
        }
        function avm1_0x25_ActionRemoveSprite(ectx) {
            var stack = ectx.stack;
            var target = stack.pop();
            ectx.actions.removeMovieClip(target);
        }
        function avm1_0x27_ActionStartDrag(ectx) {
            var stack = ectx.stack;
            var target = stack.pop();
            var lockcenter = stack.pop();
            var constrain = !stack.pop() ? null : {
                y2: stack.pop(),
                x2: stack.pop(),
                y1: stack.pop(),
                x1: stack.pop()
            };
            var dragParams = [target, lockcenter];
            if (constrain) {
                dragParams = dragParams.concat(constrain.x1, constrain.y1, constrain.x2, constrain.y2);
            }
            ectx.actions.startDrag.apply(ectx.actions, dragParams);
        }
        function avm1_0x28_ActionEndDrag(ectx) {
            ectx.actions.stopDrag();
        }
        function avm1_0x8D_ActionWaitForFrame2(ectx, args) {
            var stack = ectx.stack;
            var count = args[0];
            var frame = stack.pop();
            return !ectx.actions.ifFrameLoaded(frame);
        }
        function avm1_0x26_ActionTrace(ectx) {
            var stack = ectx.stack;
            var value = stack.pop();
            ectx.actions.trace(value);
        }
        function avm1_0x34_ActionGetTime(ectx) {
            var stack = ectx.stack;
            stack.push(ectx.actions.getTimer());
        }
        function avm1_0x30_ActionRandomNumber(ectx) {
            var stack = ectx.stack;
            stack.push(ectx.actions.random(stack.pop()));
        }
        // SWF 5
        function avm1_0x3D_ActionCallFunction(ectx) {
            var stack = ectx.stack;
            var functionName = stack.pop();
            var args = avm1ReadFunctionArgs(stack);
            var sp = stack.length;
            stack.push(undefined);
            var resolved = avm1ResolveVariable(ectx, functionName, 1 /* READ */ | 32 /* GET_VALUE */);
            if (Shumway.isNullOrUndefined(resolved)) {
                avm1Warn("AVM1 warning: cannot look up function '" + functionName + "'");
                return;
            }
            var fn = resolved.value;
            // AVM1 simply ignores attempts to invoke non-functions.
            if (!AVM1.alIsFunction(fn)) {
                avm1Warn("AVM1 warning: function '" + functionName + (fn ? "' is not callable" : "' is undefined"));
                return;
            }
            release || assert(stack.length === sp + 1);
            // REDUX
            stack[sp] = fn.alCall(resolved.scope || null, args);
        }
        function avm1_0x52_ActionCallMethod(ectx) {
            var stack = ectx.stack;
            var methodName = stack.pop();
            var obj = stack.pop();
            var args = avm1ReadFunctionArgs(stack);
            var target;
            var sp = stack.length;
            stack.push(undefined);
            // AVM1 simply ignores attempts to invoke methods on non-existing objects.
            if (Shumway.isNullOrUndefined(obj)) {
                avm1Warn("AVM1 warning: method '" + methodName + "' can't be called on undefined object");
                return;
            }
            var frame = ectx.context.frame;
            var superArg;
            var fn;
            // Per spec, a missing or blank method name causes the container to be treated as
            // a function to call.
            if (Shumway.isNullOrUndefined(methodName) || methodName === '') {
                if (obj instanceof AVM1SuperWrapper) {
                    var superFrame = obj.callFrame;
                    superArg = avm1FindSuperPropertyOwner(ectx.context, superFrame, '__constructor__');
                    if (superArg) {
                        fn = superArg.alGet('__constructor__');
                        target = superFrame.currentThis;
                    }
                }
                else {
                    // For non-super calls, we call obj with itself as the target.
                    // TODO: ensure this is correct.
                    fn = obj;
                    target = obj;
                }
                // AVM1 simply ignores attempts to invoke non-functions.
                if (AVM1.alIsFunction(fn)) {
                    frame.setCallee(target, superArg, fn, args);
                    stack[sp] = fn.alCall(target, args);
                    frame.resetCallee();
                }
                else {
                    avm1Warn("AVM1 warning: obj '" + obj + (obj ? "' is not callable" : "' is undefined"));
                }
                release || assert(stack.length === sp + 1);
                return;
            }
            if (obj instanceof AVM1SuperWrapper) {
                var superFrame = obj.callFrame;
                var superArg = avm1FindSuperPropertyOwner(ectx.context, superFrame, methodName);
                if (superArg) {
                    fn = superArg.alGet(methodName);
                    target = superFrame.currentThis;
                }
            }
            else {
                fn = as2GetProperty(ectx.context, obj, methodName);
                target = AVM1.alToObject(ectx.context, obj);
            }
            // AVM1 simply ignores attempts to invoke non-methods.
            if (!AVM1.alIsFunction(fn)) {
                avm1Warn("AVM1 warning: method '" + methodName + "' on object", obj, (Shumway.isNullOrUndefined(fn) ? "is undefined" : "is not callable"));
                return;
            }
            release || assert(stack.length === sp + 1);
            frame.setCallee(target, superArg, fn, args);
            stack[sp] = fn.alCall(target, args);
            frame.resetCallee();
        }
        function avm1_0x88_ActionConstantPool(ectx, args) {
            var constantPool = args[0];
            ectx.constantPool = constantPool;
        }
        function avm1_0x9B_ActionDefineFunction(ectx, args) {
            var stack = ectx.stack;
            var functionBody = args[0];
            var functionName = args[1];
            var functionParams = args[2];
            var fn = avm1DefineFunction(ectx, functionBody, functionName, functionParams, 4, null, 0);
            if (functionName) {
                var scope = ectx.scopeList.scope;
                scope.alPut(functionName, fn);
            }
            else {
                stack.push(fn);
            }
        }
        function avm1_0x3C_ActionDefineLocal(ectx) {
            var stack = ectx.stack;
            var scope = ectx.scopeList.scope;
            var value = stack.pop();
            var name = stack.pop();
            scope.alPut(name, value);
        }
        function avm1_0x41_ActionDefineLocal2(ectx) {
            var stack = ectx.stack;
            var scope = ectx.scopeList.scope;
            var name = stack.pop();
            scope.alPut(name, undefined);
        }
        function avm1_0x3A_ActionDelete(ectx) {
            var stack = ectx.stack;
            var name = stack.pop();
            var obj = stack.pop();
            stack.push(as2DeleteProperty(ectx.context, obj, name));
            as2SyncEvents(ectx.context, name);
        }
        function avm1_0x3B_ActionDelete2(ectx) {
            var stack = ectx.stack;
            var name = stack.pop();
            var resolved = avm1ResolveVariable(ectx, name, AVM1ResolveVariableFlags.DELETE);
            if (Shumway.isNullOrUndefined(resolved)) {
                avm1Warn("AVM1 warning: cannot look up variable '" + name + "'");
                return;
            }
            stack.push(as2DeleteProperty(ectx.context, resolved.scope, name));
            as2SyncEvents(ectx.context, name);
        }
        function avm1_0x46_ActionEnumerate(ectx) {
            var stack = ectx.stack;
            var objectName = stack.pop();
            stack.push(null);
            var resolved = avm1ResolveVariable(ectx, objectName, 1 /* READ */ | 32 /* GET_VALUE */);
            if (Shumway.isNullOrUndefined(resolved)) {
                avm1Warn("AVM1 warning: cannot look up variable '" + objectName + "'");
                return;
            }
            var obj = resolved.value;
            as2Enumerate(obj, function (name) {
                stack.push(name);
            }, null);
        }
        function avm1_0x49_ActionEquals2(ectx) {
            var stack = ectx.stack;
            var a = stack.pop();
            var b = stack.pop();
            stack.push(a == b);
        }
        function avm1_0x4E_ActionGetMember(ectx) {
            var stack = ectx.stack;
            var name = stack.pop();
            var obj = stack.pop();
            stack.push(undefined);
            if (Shumway.isNullOrUndefined(obj)) {
                // AVM1 just ignores gets on non-existant containers
                avm1Warn("AVM1 warning: cannot get member '" + name + "' on undefined object");
                return;
            }
            if (obj instanceof AVM1SuperWrapper) {
                var superFrame = obj.callFrame;
                var superArg = avm1FindSuperPropertyOwner(ectx.context, superFrame, name);
                if (superArg) {
                    stack[stack.length - 1] = superArg.alGet(name);
                }
                return;
            }
            stack[stack.length - 1] = as2GetProperty(ectx.context, obj, name);
        }
        function avm1_0x42_ActionInitArray(ectx) {
            var stack = ectx.stack;
            var obj = new AVM1.Natives.AVM1ArrayNative(ectx.context, avm1ReadFunctionArgs(stack));
            stack.push(obj);
        }
        function avm1_0x43_ActionInitObject(ectx) {
            var stack = ectx.stack;
            var count = +stack.pop();
            count = fixArgsCount(count, stack.length >> 1);
            var obj = AVM1.alNewObject(ectx.context);
            for (var i = 0; i < count; i++) {
                var value = stack.pop();
                var name = stack.pop();
                obj.alPut(name, value);
            }
            stack.push(obj);
        }
        function avm1_0x53_ActionNewMethod(ectx) {
            var stack = ectx.stack;
            var methodName = stack.pop();
            var obj = stack.pop();
            var args = avm1ReadFunctionArgs(stack);
            var sp = stack.length;
            stack.push(undefined);
            // AVM1 simply ignores attempts to construct methods on non-existing objects.
            if (Shumway.isNullOrUndefined(obj)) {
                avm1Warn("AVM1 warning: method '" + methodName + "' can't be constructed on undefined object");
                return;
            }
            var ctor;
            // Per spec, a missing or blank method name causes the container to be treated as
            // a function to construct.
            if (Shumway.isNullOrUndefined(methodName) || methodName === '') {
                ctor = obj;
            }
            else {
                ctor = as2GetProperty(ectx.context, obj, methodName);
            }
            var result = as2Construct(ctor, args);
            if (result === undefined) {
                avm1Warn("AVM1 warning: method '" + methodName + "' on object", obj, "is not constructible");
            }
            stack[sp] = result;
            release || assert(stack.length === sp + 1);
        }
        function avm1_0x40_ActionNewObject(ectx) {
            var stack = ectx.stack;
            var objectName = stack.pop();
            var args = avm1ReadFunctionArgs(stack);
            var sp = stack.length;
            stack.push(undefined);
            var resolved = avm1ResolveVariable(ectx, objectName, 1 /* READ */ | 32 /* GET_VALUE */);
            if (Shumway.isNullOrUndefined(resolved)) {
                avm1Warn("AVM1 warning: cannot look up object '" + objectName + "'");
                return;
            }
            var obj = resolved.value;
            var result = createBuiltinType(ectx.context, obj, args);
            if (result === undefined) {
                // obj in not a built-in type
                result = as2Construct(obj, args);
                if (result === undefined) {
                    avm1Warn("AVM1 warning: object '" + objectName + (obj ? "' is not constructible" : "' is undefined"));
                }
            }
            release || assert(stack.length === sp + 1);
            stack[sp] = result;
        }
        function avm1_0x4F_ActionSetMember(ectx) {
            var stack = ectx.stack;
            var value = stack.pop();
            var name = stack.pop();
            var obj = stack.pop();
            if (Shumway.isNullOrUndefined(obj)) {
                // AVM1 just ignores sets on non-existant containers
                avm1Warn("AVM1 warning: cannot set member '" + name + "' on undefined object");
                return;
            }
            if (obj instanceof AVM1SuperWrapper) {
                avm1Warn("AVM1 warning: cannot set member '" + name + "' on super");
                return;
            }
            as2SetProperty(ectx.context, obj, name, value);
        }
        function avm1_0x45_ActionTargetPath(ectx) {
            var stack = ectx.stack;
            var obj = stack.pop();
            stack.push(isAVM1MovieClip(obj) ? obj._target : void (0));
        }
        function avm1_0x94_ActionWith(ectx, args) {
            var stack = ectx.stack;
            var withBody = args[0];
            var obj = stack.pop();
            avm1ProcessWith(ectx, obj, withBody);
        }
        function avm1_0x4A_ActionToNumber(ectx) {
            var stack = ectx.stack;
            stack.push(AVM1.alToNumber(ectx.context, stack.pop()));
        }
        function avm1_0x4B_ActionToString(ectx) {
            var stack = ectx.stack;
            stack.push(AVM1.alToString(ectx.context, stack.pop()));
        }
        function avm1_0x44_ActionTypeOf(ectx) {
            var stack = ectx.stack;
            var obj = stack.pop();
            var result = as2GetType(obj);
            stack.push(result);
        }
        function avm1_0x47_ActionAdd2(ectx) {
            var stack = ectx.stack;
            var a = as2ToAddPrimitive(ectx.context, stack.pop());
            var b = as2ToAddPrimitive(ectx.context, stack.pop());
            if (typeof a === 'string' || typeof b === 'string') {
                stack.push(AVM1.alToString(ectx.context, b) + AVM1.alToString(ectx.context, a));
            }
            else {
                stack.push(AVM1.alToNumber(ectx.context, b) + AVM1.alToNumber(ectx.context, a));
            }
        }
        function avm1_0x48_ActionLess2(ectx) {
            var stack = ectx.stack;
            var a = stack.pop();
            var b = stack.pop();
            stack.push(as2Compare(ectx.context, b, a));
        }
        function avm1_0x3F_ActionModulo(ectx) {
            var stack = ectx.stack;
            var a = AVM1.alToNumber(ectx.context, stack.pop());
            var b = AVM1.alToNumber(ectx.context, stack.pop());
            stack.push(b % a);
        }
        function avm1_0x60_ActionBitAnd(ectx) {
            var stack = ectx.stack;
            var a = AVM1.alToInt32(ectx.context, stack.pop());
            var b = AVM1.alToInt32(ectx.context, stack.pop());
            stack.push(b & a);
        }
        function avm1_0x63_ActionBitLShift(ectx) {
            var stack = ectx.stack;
            var a = AVM1.alToInt32(ectx.context, stack.pop());
            var b = AVM1.alToInt32(ectx.context, stack.pop());
            stack.push(b << a);
        }
        function avm1_0x61_ActionBitOr(ectx) {
            var stack = ectx.stack;
            var a = AVM1.alToInt32(ectx.context, stack.pop());
            var b = AVM1.alToInt32(ectx.context, stack.pop());
            stack.push(b | a);
        }
        function avm1_0x64_ActionBitRShift(ectx) {
            var stack = ectx.stack;
            var a = AVM1.alToInt32(ectx.context, stack.pop());
            var b = AVM1.alToInt32(ectx.context, stack.pop());
            stack.push(b >> a);
        }
        function avm1_0x65_ActionBitURShift(ectx) {
            var stack = ectx.stack;
            var a = AVM1.alToInt32(ectx.context, stack.pop());
            var b = AVM1.alToInt32(ectx.context, stack.pop());
            stack.push(b >>> a);
        }
        function avm1_0x62_ActionBitXor(ectx) {
            var stack = ectx.stack;
            var a = AVM1.alToInt32(ectx.context, stack.pop());
            var b = AVM1.alToInt32(ectx.context, stack.pop());
            stack.push(b ^ a);
        }
        function avm1_0x51_ActionDecrement(ectx) {
            var stack = ectx.stack;
            var a = AVM1.alToNumber(ectx.context, stack.pop());
            a--;
            stack.push(a);
        }
        function avm1_0x50_ActionIncrement(ectx) {
            var stack = ectx.stack;
            var a = AVM1.alToNumber(ectx.context, stack.pop());
            a++;
            stack.push(a);
        }
        function avm1_0x4C_ActionPushDuplicate(ectx) {
            var stack = ectx.stack;
            stack.push(stack[stack.length - 1]);
        }
        function avm1_0x3E_ActionReturn(ectx) {
            ectx.isEndOfActions = true;
        }
        function avm1_0x4D_ActionStackSwap(ectx) {
            var stack = ectx.stack;
            stack.push(stack.pop(), stack.pop());
        }
        function avm1_0x87_ActionStoreRegister(ectx, args) {
            var stack = ectx.stack;
            var registers = ectx.registers;
            var register = args[0];
            if (register < 0 || register >= registers.length) {
                return; // ignoring bad registers references
            }
            registers[register] = stack[stack.length - 1];
        }
        // SWF 6
        function avm1_0x54_ActionInstanceOf(ectx) {
            var stack = ectx.stack;
            var constr = stack.pop();
            var obj = stack.pop();
            stack.push(as2InstanceOf(obj, constr));
        }
        function avm1_0x55_ActionEnumerate2(ectx) {
            var stack = ectx.stack;
            var obj = stack.pop();
            stack.push(null);
            // AVM1 just ignores lookups on non-existant containers
            if (Shumway.isNullOrUndefined(obj)) {
                avm1Warn("AVM1 warning: cannot iterate over undefined object");
                return;
            }
            as2Enumerate(obj, function (name) {
                stack.push(name);
            }, null);
        }
        function avm1_0x66_ActionStrictEquals(ectx) {
            var stack = ectx.stack;
            var a = stack.pop();
            var b = stack.pop();
            stack.push(b === a);
        }
        function avm1_0x67_ActionGreater(ectx) {
            var stack = ectx.stack;
            var a = stack.pop();
            var b = stack.pop();
            stack.push(as2Compare(ectx.context, a, b));
        }
        function avm1_0x68_ActionStringGreater(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;
            var sa = AVM1.alToString(ectx.context, stack.pop());
            var sb = AVM1.alToString(ectx.context, stack.pop());
            var f = sb > sa;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        // SWF 7
        function avm1_0x8E_ActionDefineFunction2(ectx, args) {
            var stack = ectx.stack;
            var scope = ectx.scopeList.scope;
            var functionBody = args[0];
            var functionName = args[1];
            var functionParams = args[2];
            var registerCount = args[3];
            var registerAllocation = args[4];
            var suppressArguments = args[5];
            var fn = avm1DefineFunction(ectx, functionBody, functionName, functionParams, registerCount, registerAllocation, suppressArguments);
            if (functionName) {
                scope.alPut(functionName, fn);
            }
            else {
                stack.push(fn);
            }
        }
        function avm1_0x69_ActionExtends(ectx) {
            var stack = ectx.stack;
            var constrSuper = stack.pop();
            var constr = stack.pop();
            var prototype = constr.alGetPrototypeProperty();
            var prototypeSuper = constrSuper.alGetPrototypeProperty();
            prototype.alPrototype = prototypeSuper;
            prototype.alSetOwnProperty('__constructor__', {
                flags: 64 /* DATA */ | 1 /* DONT_ENUM */,
                value: constrSuper
            });
        }
        function avm1_0x2B_ActionCastOp(ectx) {
            var stack = ectx.stack;
            var obj = stack.pop();
            var constr = stack.pop();
            stack.push(as2InstanceOf(obj, constr) ? obj : null);
        }
        function avm1_0x2C_ActionImplementsOp(ectx) {
            var stack = ectx.stack;
            var constr = stack.pop();
            var count = +stack.pop();
            fixArgsCount(count, stack.length);
            var interfaces = [];
            for (var i = 0; i < count; i++) {
                interfaces.push(stack.pop());
            }
            constr._as2Interfaces = interfaces;
        }
        function avm1_0x8F_ActionTry(ectx, args) {
            var catchIsRegisterFlag = args[0];
            var catchTarget = args[1];
            var tryBody = args[2];
            var catchBlockFlag = args[3];
            var catchBody = args[4];
            var finallyBlockFlag = args[5];
            var finallyBody = args[6];
            avm1ProcessTry(ectx, catchIsRegisterFlag, finallyBlockFlag, catchBlockFlag, catchTarget, tryBody, catchBody, finallyBody);
        }
        function avm1_0x2A_ActionThrow(ectx) {
            var stack = ectx.stack;
            var obj = stack.pop();
            throw new AVM1Error(obj);
        }
        function avm1_0x2D_ActionFSCommand2(ectx) {
            var stack = ectx.stack;
            var args = avm1ReadFunctionArgs(stack);
            var sp = stack.length;
            stack.push(undefined);
            var result = ectx.actions.fscommand.apply(ectx.actions, args);
            stack[sp] = result;
        }
        function avm1_0x89_ActionStrictMode(ectx, args) {
            var mode = args[0];
        }
        function wrapAvm1Error(fn) {
            return function avm1ErrorWrapper(executionContext, args) {
                var currentContext;
                try {
                    fn(executionContext, args);
                    executionContext.recoveringFromError = false;
                }
                catch (e) {
                    // handling AVM1 errors
                    currentContext = executionContext.context;
                    e = as2CastError(e);
                    if (e instanceof AVM1CriticalError) {
                        throw e;
                    }
                    if (e instanceof AVM1Error) {
                        throw e;
                    }
                    Telemetry.instance.reportTelemetry({ topic: 'error', error: 1 /* AVM1_ERROR */ });
                    if (!executionContext.recoveringFromError) {
                        if (currentContext.errorsIgnored++ >= MAX_AVM1_ERRORS_LIMIT) {
                            throw new AVM1CriticalError('long running script -- AVM1 errors limit is reached');
                        }
                        console.log(typeof e);
                        console.log(Object.getPrototypeOf(e));
                        console.log(Object.getPrototypeOf(Object.getPrototypeOf(e)));
                        console.error('AVM1 error: ' + e);
                    }
                }
            };
        }
        function generateActionCalls() {
            var wrap;
            if (!AVM1.avm1ErrorsEnabled.value) {
                wrap = wrapAvm1Error;
            }
            else {
                wrap = function (fn) {
                    return fn;
                };
            }
            return {
                ActionGotoFrame: wrap(avm1_0x81_ActionGotoFrame),
                ActionGetURL: wrap(avm1_0x83_ActionGetURL),
                ActionNextFrame: wrap(avm1_0x04_ActionNextFrame),
                ActionPreviousFrame: wrap(avm1_0x05_ActionPreviousFrame),
                ActionPlay: wrap(avm1_0x06_ActionPlay),
                ActionStop: wrap(avm1_0x07_ActionStop),
                ActionToggleQuality: wrap(avm1_0x08_ActionToggleQuality),
                ActionStopSounds: wrap(avm1_0x09_ActionStopSounds),
                ActionWaitForFrame: wrap(avm1_0x8A_ActionWaitForFrame),
                ActionSetTarget: wrap(avm1_0x8B_ActionSetTarget),
                ActionGoToLabel: wrap(avm1_0x8C_ActionGoToLabel),
                ActionPush: wrap(avm1_0x96_ActionPush),
                ActionPop: wrap(avm1_0x17_ActionPop),
                ActionAdd: wrap(avm1_0x0A_ActionAdd),
                ActionSubtract: wrap(avm1_0x0B_ActionSubtract),
                ActionMultiply: wrap(avm1_0x0C_ActionMultiply),
                ActionDivide: wrap(avm1_0x0D_ActionDivide),
                ActionEquals: wrap(avm1_0x0E_ActionEquals),
                ActionLess: wrap(avm1_0x0F_ActionLess),
                ActionAnd: wrap(avm1_0x10_ActionAnd),
                ActionOr: wrap(avm1_0x11_ActionOr),
                ActionNot: wrap(avm1_0x12_ActionNot),
                ActionStringEquals: wrap(avm1_0x13_ActionStringEquals),
                ActionStringLength: wrap(avm1_0x14_ActionStringLength),
                ActionMBStringLength: wrap(avm1_0x31_ActionMBStringLength),
                ActionStringAdd: wrap(avm1_0x21_ActionStringAdd),
                ActionStringExtract: wrap(avm1_0x15_ActionStringExtract),
                ActionMBStringExtract: wrap(avm1_0x35_ActionMBStringExtract),
                ActionStringLess: wrap(avm1_0x29_ActionStringLess),
                ActionToInteger: wrap(avm1_0x18_ActionToInteger),
                ActionCharToAscii: wrap(avm1_0x32_ActionCharToAscii),
                ActionMBCharToAscii: wrap(avm1_0x36_ActionMBCharToAscii),
                ActionAsciiToChar: wrap(avm1_0x33_ActionAsciiToChar),
                ActionMBAsciiToChar: wrap(avm1_0x37_ActionMBAsciiToChar),
                ActionJump: wrap(avm1_0x99_ActionJump),
                ActionIf: wrap(avm1_0x9D_ActionIf),
                ActionCall: wrap(avm1_0x9E_ActionCall),
                ActionGetVariable: wrap(avm1_0x1C_ActionGetVariable),
                ActionSetVariable: wrap(avm1_0x1D_ActionSetVariable),
                ActionGetURL2: wrap(avm1_0x9A_ActionGetURL2),
                ActionGotoFrame2: wrap(avm1_0x9F_ActionGotoFrame2),
                ActionSetTarget2: wrap(avm1_0x20_ActionSetTarget2),
                ActionGetProperty: wrap(avm1_0x22_ActionGetProperty),
                ActionSetProperty: wrap(avm1_0x23_ActionSetProperty),
                ActionCloneSprite: wrap(avm1_0x24_ActionCloneSprite),
                ActionRemoveSprite: wrap(avm1_0x25_ActionRemoveSprite),
                ActionStartDrag: wrap(avm1_0x27_ActionStartDrag),
                ActionEndDrag: wrap(avm1_0x28_ActionEndDrag),
                ActionWaitForFrame2: wrap(avm1_0x8D_ActionWaitForFrame2),
                ActionTrace: wrap(avm1_0x26_ActionTrace),
                ActionGetTime: wrap(avm1_0x34_ActionGetTime),
                ActionRandomNumber: wrap(avm1_0x30_ActionRandomNumber),
                ActionCallFunction: wrap(avm1_0x3D_ActionCallFunction),
                ActionCallMethod: wrap(avm1_0x52_ActionCallMethod),
                ActionConstantPool: wrap(avm1_0x88_ActionConstantPool),
                ActionDefineFunction: wrap(avm1_0x9B_ActionDefineFunction),
                ActionDefineLocal: wrap(avm1_0x3C_ActionDefineLocal),
                ActionDefineLocal2: wrap(avm1_0x41_ActionDefineLocal2),
                ActionDelete: wrap(avm1_0x3A_ActionDelete),
                ActionDelete2: wrap(avm1_0x3B_ActionDelete2),
                ActionEnumerate: wrap(avm1_0x46_ActionEnumerate),
                ActionEquals2: wrap(avm1_0x49_ActionEquals2),
                ActionGetMember: wrap(avm1_0x4E_ActionGetMember),
                ActionInitArray: wrap(avm1_0x42_ActionInitArray),
                ActionInitObject: wrap(avm1_0x43_ActionInitObject),
                ActionNewMethod: wrap(avm1_0x53_ActionNewMethod),
                ActionNewObject: wrap(avm1_0x40_ActionNewObject),
                ActionSetMember: wrap(avm1_0x4F_ActionSetMember),
                ActionTargetPath: wrap(avm1_0x45_ActionTargetPath),
                ActionWith: wrap(avm1_0x94_ActionWith),
                ActionToNumber: wrap(avm1_0x4A_ActionToNumber),
                ActionToString: wrap(avm1_0x4B_ActionToString),
                ActionTypeOf: wrap(avm1_0x44_ActionTypeOf),
                ActionAdd2: wrap(avm1_0x47_ActionAdd2),
                ActionLess2: wrap(avm1_0x48_ActionLess2),
                ActionModulo: wrap(avm1_0x3F_ActionModulo),
                ActionBitAnd: wrap(avm1_0x60_ActionBitAnd),
                ActionBitLShift: wrap(avm1_0x63_ActionBitLShift),
                ActionBitOr: wrap(avm1_0x61_ActionBitOr),
                ActionBitRShift: wrap(avm1_0x64_ActionBitRShift),
                ActionBitURShift: wrap(avm1_0x65_ActionBitURShift),
                ActionBitXor: wrap(avm1_0x62_ActionBitXor),
                ActionDecrement: wrap(avm1_0x51_ActionDecrement),
                ActionIncrement: wrap(avm1_0x50_ActionIncrement),
                ActionPushDuplicate: wrap(avm1_0x4C_ActionPushDuplicate),
                ActionReturn: wrap(avm1_0x3E_ActionReturn),
                ActionStackSwap: wrap(avm1_0x4D_ActionStackSwap),
                ActionStoreRegister: wrap(avm1_0x87_ActionStoreRegister),
                ActionInstanceOf: wrap(avm1_0x54_ActionInstanceOf),
                ActionEnumerate2: wrap(avm1_0x55_ActionEnumerate2),
                ActionStrictEquals: wrap(avm1_0x66_ActionStrictEquals),
                ActionGreater: wrap(avm1_0x67_ActionGreater),
                ActionStringGreater: wrap(avm1_0x68_ActionStringGreater),
                ActionDefineFunction2: wrap(avm1_0x8E_ActionDefineFunction2),
                ActionExtends: wrap(avm1_0x69_ActionExtends),
                ActionCastOp: wrap(avm1_0x2B_ActionCastOp),
                ActionImplementsOp: wrap(avm1_0x2C_ActionImplementsOp),
                ActionTry: wrap(avm1_0x8F_ActionTry),
                ActionThrow: wrap(avm1_0x2A_ActionThrow),
                ActionFSCommand2: wrap(avm1_0x2D_ActionFSCommand2),
                ActionStrictMode: wrap(avm1_0x89_ActionStrictMode)
            };
        }
        AVM1.generateActionCalls = generateActionCalls;
        function interpretAction(executionContext, parsedAction) {
            var stack = executionContext.stack;
            var actionCode = parsedAction.actionCode;
            var args = parsedAction.args;
            var actionTracer = executionContext.actionTracer;
            actionTracer.print(parsedAction, stack);
            var shallBranch = false;
            switch (actionCode | 0) {
                case 129 /* ActionGotoFrame */:
                    avm1_0x81_ActionGotoFrame(executionContext, args);
                    break;
                case 131 /* ActionGetURL */:
                    avm1_0x83_ActionGetURL(executionContext, args);
                    break;
                case 4 /* ActionNextFrame */:
                    avm1_0x04_ActionNextFrame(executionContext);
                    break;
                case 5 /* ActionPreviousFrame */:
                    avm1_0x05_ActionPreviousFrame(executionContext);
                    break;
                case 6 /* ActionPlay */:
                    avm1_0x06_ActionPlay(executionContext);
                    break;
                case 7 /* ActionStop */:
                    avm1_0x07_ActionStop(executionContext);
                    break;
                case 8 /* ActionToggleQuality */:
                    avm1_0x08_ActionToggleQuality(executionContext);
                    break;
                case 9 /* ActionStopSounds */:
                    avm1_0x09_ActionStopSounds(executionContext);
                    break;
                case 138 /* ActionWaitForFrame */:
                    shallBranch = avm1_0x8A_ActionWaitForFrame(executionContext, args);
                    break;
                case 139 /* ActionSetTarget */:
                    avm1_0x8B_ActionSetTarget(executionContext, args);
                    break;
                case 140 /* ActionGoToLabel */:
                    avm1_0x8C_ActionGoToLabel(executionContext, args);
                    break;
                case 150 /* ActionPush */:
                    avm1_0x96_ActionPush(executionContext, args);
                    break;
                case 23 /* ActionPop */:
                    avm1_0x17_ActionPop(executionContext);
                    break;
                case 10 /* ActionAdd */:
                    avm1_0x0A_ActionAdd(executionContext);
                    break;
                case 11 /* ActionSubtract */:
                    avm1_0x0B_ActionSubtract(executionContext);
                    break;
                case 12 /* ActionMultiply */:
                    avm1_0x0C_ActionMultiply(executionContext);
                    break;
                case 13 /* ActionDivide */:
                    avm1_0x0D_ActionDivide(executionContext);
                    break;
                case 14 /* ActionEquals */:
                    avm1_0x0E_ActionEquals(executionContext);
                    break;
                case 15 /* ActionLess */:
                    avm1_0x0F_ActionLess(executionContext);
                    break;
                case 16 /* ActionAnd */:
                    avm1_0x10_ActionAnd(executionContext);
                    break;
                case 17 /* ActionOr */:
                    avm1_0x11_ActionOr(executionContext);
                    break;
                case 18 /* ActionNot */:
                    avm1_0x12_ActionNot(executionContext);
                    break;
                case 19 /* ActionStringEquals */:
                    avm1_0x13_ActionStringEquals(executionContext);
                    break;
                case 20 /* ActionStringLength */:
                    avm1_0x14_ActionStringLength(executionContext);
                    break;
                case 49 /* ActionMBStringLength */:
                    avm1_0x31_ActionMBStringLength(executionContext);
                    break;
                case 33 /* ActionStringAdd */:
                    avm1_0x21_ActionStringAdd(executionContext);
                    break;
                case 21 /* ActionStringExtract */:
                    avm1_0x15_ActionStringExtract(executionContext);
                    break;
                case 53 /* ActionMBStringExtract */:
                    avm1_0x35_ActionMBStringExtract(executionContext);
                    break;
                case 41 /* ActionStringLess */:
                    avm1_0x29_ActionStringLess(executionContext);
                    break;
                case 24 /* ActionToInteger */:
                    avm1_0x18_ActionToInteger(executionContext);
                    break;
                case 50 /* ActionCharToAscii */:
                    avm1_0x32_ActionCharToAscii(executionContext);
                    break;
                case 54 /* ActionMBCharToAscii */:
                    avm1_0x36_ActionMBCharToAscii(executionContext);
                    break;
                case 51 /* ActionAsciiToChar */:
                    avm1_0x33_ActionAsciiToChar(executionContext);
                    break;
                case 55 /* ActionMBAsciiToChar */:
                    avm1_0x37_ActionMBAsciiToChar(executionContext);
                    break;
                case 153 /* ActionJump */:
                    avm1_0x99_ActionJump(executionContext, args);
                    break;
                case 157 /* ActionIf */:
                    shallBranch = avm1_0x9D_ActionIf(executionContext, args);
                    break;
                case 158 /* ActionCall */:
                    avm1_0x9E_ActionCall(executionContext);
                    break;
                case 28 /* ActionGetVariable */:
                    avm1_0x1C_ActionGetVariable(executionContext);
                    break;
                case 29 /* ActionSetVariable */:
                    avm1_0x1D_ActionSetVariable(executionContext);
                    break;
                case 154 /* ActionGetURL2 */:
                    avm1_0x9A_ActionGetURL2(executionContext, args);
                    break;
                case 159 /* ActionGotoFrame2 */:
                    avm1_0x9F_ActionGotoFrame2(executionContext, args);
                    break;
                case 32 /* ActionSetTarget2 */:
                    avm1_0x20_ActionSetTarget2(executionContext);
                    break;
                case 34 /* ActionGetProperty */:
                    avm1_0x22_ActionGetProperty(executionContext);
                    break;
                case 35 /* ActionSetProperty */:
                    avm1_0x23_ActionSetProperty(executionContext);
                    break;
                case 36 /* ActionCloneSprite */:
                    avm1_0x24_ActionCloneSprite(executionContext);
                    break;
                case 37 /* ActionRemoveSprite */:
                    avm1_0x25_ActionRemoveSprite(executionContext);
                    break;
                case 39 /* ActionStartDrag */:
                    avm1_0x27_ActionStartDrag(executionContext);
                    break;
                case 40 /* ActionEndDrag */:
                    avm1_0x28_ActionEndDrag(executionContext);
                    break;
                case 141 /* ActionWaitForFrame2 */:
                    shallBranch = avm1_0x8D_ActionWaitForFrame2(executionContext, args);
                    break;
                case 38 /* ActionTrace */:
                    avm1_0x26_ActionTrace(executionContext);
                    break;
                case 52 /* ActionGetTime */:
                    avm1_0x34_ActionGetTime(executionContext);
                    break;
                case 48 /* ActionRandomNumber */:
                    avm1_0x30_ActionRandomNumber(executionContext);
                    break;
                case 61 /* ActionCallFunction */:
                    avm1_0x3D_ActionCallFunction(executionContext);
                    break;
                case 82 /* ActionCallMethod */:
                    avm1_0x52_ActionCallMethod(executionContext);
                    break;
                case 136 /* ActionConstantPool */:
                    avm1_0x88_ActionConstantPool(executionContext, args);
                    break;
                case 155 /* ActionDefineFunction */:
                    avm1_0x9B_ActionDefineFunction(executionContext, args);
                    break;
                case 60 /* ActionDefineLocal */:
                    avm1_0x3C_ActionDefineLocal(executionContext);
                    break;
                case 65 /* ActionDefineLocal2 */:
                    avm1_0x41_ActionDefineLocal2(executionContext);
                    break;
                case 58 /* ActionDelete */:
                    avm1_0x3A_ActionDelete(executionContext);
                    break;
                case 59 /* ActionDelete2 */:
                    avm1_0x3B_ActionDelete2(executionContext);
                    break;
                case 70 /* ActionEnumerate */:
                    avm1_0x46_ActionEnumerate(executionContext);
                    break;
                case 73 /* ActionEquals2 */:
                    avm1_0x49_ActionEquals2(executionContext);
                    break;
                case 78 /* ActionGetMember */:
                    avm1_0x4E_ActionGetMember(executionContext);
                    break;
                case 66 /* ActionInitArray */:
                    avm1_0x42_ActionInitArray(executionContext);
                    break;
                case 67 /* ActionInitObject */:
                    avm1_0x43_ActionInitObject(executionContext);
                    break;
                case 83 /* ActionNewMethod */:
                    avm1_0x53_ActionNewMethod(executionContext);
                    break;
                case 64 /* ActionNewObject */:
                    avm1_0x40_ActionNewObject(executionContext);
                    break;
                case 79 /* ActionSetMember */:
                    avm1_0x4F_ActionSetMember(executionContext);
                    break;
                case 69 /* ActionTargetPath */:
                    avm1_0x45_ActionTargetPath(executionContext);
                    break;
                case 148 /* ActionWith */:
                    avm1_0x94_ActionWith(executionContext, args);
                    break;
                case 74 /* ActionToNumber */:
                    avm1_0x4A_ActionToNumber(executionContext);
                    break;
                case 75 /* ActionToString */:
                    avm1_0x4B_ActionToString(executionContext);
                    break;
                case 68 /* ActionTypeOf */:
                    avm1_0x44_ActionTypeOf(executionContext);
                    break;
                case 71 /* ActionAdd2 */:
                    avm1_0x47_ActionAdd2(executionContext);
                    break;
                case 72 /* ActionLess2 */:
                    avm1_0x48_ActionLess2(executionContext);
                    break;
                case 63 /* ActionModulo */:
                    avm1_0x3F_ActionModulo(executionContext);
                    break;
                case 96 /* ActionBitAnd */:
                    avm1_0x60_ActionBitAnd(executionContext);
                    break;
                case 99 /* ActionBitLShift */:
                    avm1_0x63_ActionBitLShift(executionContext);
                    break;
                case 97 /* ActionBitOr */:
                    avm1_0x61_ActionBitOr(executionContext);
                    break;
                case 100 /* ActionBitRShift */:
                    avm1_0x64_ActionBitRShift(executionContext);
                    break;
                case 101 /* ActionBitURShift */:
                    avm1_0x65_ActionBitURShift(executionContext);
                    break;
                case 98 /* ActionBitXor */:
                    avm1_0x62_ActionBitXor(executionContext);
                    break;
                case 81 /* ActionDecrement */:
                    avm1_0x51_ActionDecrement(executionContext);
                    break;
                case 80 /* ActionIncrement */:
                    avm1_0x50_ActionIncrement(executionContext);
                    break;
                case 76 /* ActionPushDuplicate */:
                    avm1_0x4C_ActionPushDuplicate(executionContext);
                    break;
                case 62 /* ActionReturn */:
                    avm1_0x3E_ActionReturn(executionContext);
                    break;
                case 77 /* ActionStackSwap */:
                    avm1_0x4D_ActionStackSwap(executionContext);
                    break;
                case 135 /* ActionStoreRegister */:
                    avm1_0x87_ActionStoreRegister(executionContext, args);
                    break;
                case 84 /* ActionInstanceOf */:
                    avm1_0x54_ActionInstanceOf(executionContext);
                    break;
                case 85 /* ActionEnumerate2 */:
                    avm1_0x55_ActionEnumerate2(executionContext);
                    break;
                case 102 /* ActionStrictEquals */:
                    avm1_0x66_ActionStrictEquals(executionContext);
                    break;
                case 103 /* ActionGreater */:
                    avm1_0x67_ActionGreater(executionContext);
                    break;
                case 104 /* ActionStringGreater */:
                    avm1_0x68_ActionStringGreater(executionContext);
                    break;
                case 142 /* ActionDefineFunction2 */:
                    avm1_0x8E_ActionDefineFunction2(executionContext, args);
                    break;
                case 105 /* ActionExtends */:
                    avm1_0x69_ActionExtends(executionContext);
                    break;
                case 43 /* ActionCastOp */:
                    avm1_0x2B_ActionCastOp(executionContext);
                    break;
                case 44 /* ActionImplementsOp */:
                    avm1_0x2C_ActionImplementsOp(executionContext);
                    break;
                case 143 /* ActionTry */:
                    avm1_0x8F_ActionTry(executionContext, args);
                    break;
                case 42 /* ActionThrow */:
                    avm1_0x2A_ActionThrow(executionContext);
                    break;
                case 45 /* ActionFSCommand2 */:
                    avm1_0x2D_ActionFSCommand2(executionContext);
                    break;
                case 137 /* ActionStrictMode */:
                    avm1_0x89_ActionStrictMode(executionContext, args);
                    break;
                case 0 /* None */:
                    executionContext.isEndOfActions = true;
                    break;
                default:
                    throw new Error('Unknown action code: ' + actionCode);
            }
            return shallBranch;
        }
        function interpretActionWithRecovery(executionContext, parsedAction) {
            var currentContext;
            var result;
            try {
                result = interpretAction(executionContext, parsedAction);
                executionContext.recoveringFromError = false;
            }
            catch (e) {
                // handling AVM1 errors
                currentContext = executionContext.context;
                e = as2CastError(e);
                if ((AVM1.avm1ErrorsEnabled.value && !currentContext.isTryCatchListening) || e instanceof AVM1CriticalError) {
                    throw e;
                }
                if (e instanceof AVM1Error) {
                    throw e;
                }
                Telemetry.instance.reportTelemetry({ topic: 'error', error: 1 /* AVM1_ERROR */ });
                if (!executionContext.recoveringFromError) {
                    if (currentContext.errorsIgnored++ >= MAX_AVM1_ERRORS_LIMIT) {
                        throw new AVM1CriticalError('long running script -- AVM1 errors limit is reached');
                    }
                    console.error('AVM1 error: ' + e);
                    // REDUX
                    //var avm2 = Shumway.AVM2.Runtime.AVM2;
                    //avm2.instance.exceptions.push({source: 'avm1', message: e.message,
                    //  stack: e.stack});
                    executionContext.recoveringFromError = true;
                }
            }
            return result;
        }
        function interpretActionsData(currentContext, actionsData, scopeList, constantPool, registers) {
            if (!actionsData.ir) {
                var parser = new AVM1.ActionsDataParser(actionsData, currentContext.swfVersion);
                var analyzer = new AVM1.ActionsDataAnalyzer();
                analyzer.registersLimit = registers.length;
                analyzer.parentResults = actionsData.parent && actionsData.parent.ir;
                actionsData.ir = analyzer.analyze(parser);
                if (AVM1.avm1CompilerEnabled.value) {
                    try {
                        var c = new AVM1.ActionsDataCompiler();
                        actionsData.ir.compiled = c.generate(actionsData.ir);
                    }
                    catch (e) {
                        console.error('Unable to compile AVM1 function: ' + e);
                    }
                }
            }
            var ir = actionsData.ir;
            var compiled = ir.compiled;
            var stack = [];
            var isSwfVersion5 = currentContext.swfVersion >= 5;
            var actionTracer = ActionTracerFactory.get();
            var executionContext = {
                context: currentContext,
                actions: currentContext.actions,
                scopeList: scopeList,
                actionTracer: actionTracer,
                constantPool: constantPool,
                registers: registers,
                stack: stack,
                frame: null,
                isSwfVersion5: isSwfVersion5,
                recoveringFromError: false,
                isEndOfActions: false
            };
            var scope = scopeList.scope;
            var as3Object = scope._as3Object; // FIXME refactor
            if (as3Object && as3Object._deferScriptExecution) {
                currentContext.deferScriptExecution = true;
            }
            if (compiled) {
                return compiled(executionContext);
            }
            var instructionsExecuted = 0;
            var abortExecutionAt = currentContext.abortExecutionAt;
            if (AVM1.avm1DebuggerEnabled.value && (AVM1.Debugger.pause || AVM1.Debugger.breakpoints[ir.dataId])) {
                debugger;
            }
            var position = 0;
            var nextAction = ir.actions[position];
            while (nextAction && !executionContext.isEndOfActions) {
                // let's check timeout/Date.now every some number of instructions
                if (instructionsExecuted++ % AVM1.CHECK_AVM1_HANG_EVERY === 0 && Date.now() >= abortExecutionAt) {
                    throw new AVM1CriticalError('long running script -- AVM1 instruction hang timeout');
                }
                var shallBranch = interpretActionWithRecovery(executionContext, nextAction.action);
                if (shallBranch) {
                    position = nextAction.conditionalJumpTo;
                }
                else {
                    position = nextAction.next;
                }
                nextAction = ir.actions[position];
            }
            return stack.pop();
        }
        var ActionTracerFactory = (function () {
            function ActionTracerFactory() {
            }
            ActionTracerFactory.get = function () {
                return AVM1.avm1TraceEnabled.value ? ActionTracerFactory.tracer : ActionTracerFactory.nullTracer;
            };
            ActionTracerFactory.tracer = (function () {
                var indentation = 0;
                return {
                    print: function (parsedAction, stack) {
                        var position = parsedAction.position;
                        var actionCode = parsedAction.actionCode;
                        var actionName = parsedAction.actionName;
                        var stackDump = [];
                        for (var q = 0; q < stack.length; q++) {
                            var item = stack[q];
                            if (item && typeof item === 'object') {
                                var constr = item.alGetConstructorProperty();
                                stackDump.push('[' + (constr ? constr.name : 'Object') + ']');
                            }
                            else {
                                stackDump.push(item);
                            }
                        }
                        var indent = new Array(indentation + 1).join('..');
                        console.log('AVM1 trace: ' + indent + position + ': ' + actionName + '(' + actionCode.toString(16) + '), ' + 'stack=' + stackDump);
                    },
                    indent: function () {
                        indentation++;
                    },
                    unindent: function () {
                        indentation--;
                    },
                    message: function (msg) {
                        console.log('AVM1 trace: ------- ' + msg);
                    }
                };
            })();
            ActionTracerFactory.nullTracer = {
                print: function (parsedAction, stack) {
                },
                indent: function () {
                },
                unindent: function () {
                },
                message: function (msg) {
                }
            };
            return ActionTracerFactory;
        })();
        AVM1.PropertiesIndexMap = [
            '_x',
            '_y',
            '_xscale',
            '_yscale',
            '_currentframe',
            '_totalframes',
            '_alpha',
            '_visible',
            '_width',
            '_height',
            '_rotation',
            '_target',
            '_framesloaded',
            '_name',
            '_droptarget',
            '_url',
            '_highquality',
            '_focusrect',
            '_soundbuftime',
            '_quality',
            '_xmouse',
            '_ymouse'
        ];
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2015 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var notImplemented = Shumway.Debug.notImplemented;
        /**
         *  Bare-minimum JavaScript code generator to make debugging better.
         */
        var ActionsDataCompiler = (function () {
            function ActionsDataCompiler() {
                if (!ActionsDataCompiler.cachedCalls) {
                    ActionsDataCompiler.cachedCalls = AVM1.generateActionCalls();
                }
            }
            ActionsDataCompiler.prototype.convertArgs = function (args, id, res, ir) {
                var parts = [];
                for (var i = 0; i < args.length; i++) {
                    var arg = args[i];
                    if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
                        if (arg instanceof AVM1.ParsedPushConstantAction) {
                            if (ir.singleConstantPool) {
                                var constant = ir.singleConstantPool[arg.constantIndex];
                                parts.push(constant === undefined ? 'undefined' : JSON.stringify(constant));
                            }
                            else {
                                var hint = '';
                                var currentConstantPool = res.constantPool;
                                if (currentConstantPool) {
                                    var constant = currentConstantPool[arg.constantIndex];
                                    hint = constant === undefined ? 'undefined' : JSON.stringify(constant);
                                    // preventing code breakage due to bad constant
                                    hint = hint.indexOf('*/') >= 0 ? '' : ' /* ' + hint + ' */';
                                }
                                parts.push('constantPool[' + arg.constantIndex + ']' + hint);
                            }
                        }
                        else if (arg instanceof AVM1.ParsedPushRegisterAction) {
                            var registerNumber = arg.registerNumber;
                            if (registerNumber < 0 || registerNumber >= ir.registersLimit) {
                                parts.push('undefined'); // register is out of bounds -- undefined
                            }
                            else {
                                parts.push('registers[' + registerNumber + ']');
                            }
                        }
                        else if (arg instanceof AVM1.AVM1ActionsData) {
                            var resName = 'code_' + id + '_' + i;
                            res[resName] = arg;
                            parts.push('res.' + resName);
                        }
                        else {
                            notImplemented('Unknown AVM1 action argument type');
                        }
                    }
                    else if (arg === undefined) {
                        parts.push('undefined'); // special case
                    }
                    else {
                        parts.push(JSON.stringify(arg));
                    }
                }
                return parts.join(',');
            };
            ActionsDataCompiler.prototype.convertAction = function (item, id, res, indexInBlock, ir) {
                switch (item.action.actionCode) {
                    case 153 /* ActionJump */:
                    case 62 /* ActionReturn */:
                        return '';
                    case 136 /* ActionConstantPool */:
                        res.constantPool = item.action.args[0];
                        return '  constantPool = [' + this.convertArgs(item.action.args[0], id, res, ir) + '];\n' + '  ectx.constantPool = constantPool;\n';
                    case 150 /* ActionPush */:
                        return '  stack.push(' + this.convertArgs(item.action.args, id, res, ir) + ');\n';
                    case 135 /* ActionStoreRegister */:
                        var registerNumber = item.action.args[0];
                        if (registerNumber < 0 || registerNumber >= ir.registersLimit) {
                            return ''; // register is out of bounds -- noop
                        }
                        return '  registers[' + registerNumber + '] = stack[stack.length - 1];\n';
                    case 138 /* ActionWaitForFrame */:
                    case 141 /* ActionWaitForFrame2 */:
                        return '  if (calls.' + item.action.actionName + '(ectx,[' + this.convertArgs(item.action.args, id, res, ir) + '])) { position = ' + item.conditionalJumpTo + '; ' + 'checkTimeAfter -= ' + (indexInBlock + 1) + '; break; }\n';
                    case 157 /* ActionIf */:
                        return '  if (!!stack.pop()) { position = ' + item.conditionalJumpTo + '; ' + 'checkTimeAfter -= ' + (indexInBlock + 1) + '; break; }\n';
                    default:
                        var result = '  calls.' + item.action.actionName + '(ectx' + (item.action.args ? ',[' + this.convertArgs(item.action.args, id, res, ir) + ']' : '') + ');\n';
                        return result;
                }
            };
            ActionsDataCompiler.prototype.generate = function (ir) {
                var _this = this;
                var blocks = ir.blocks;
                var res = {};
                var uniqueId = 0;
                var debugName = ir.dataId;
                var fn = 'return function avm1gen_' + debugName + '(ectx) {\n' + 'var position = 0;\n' + 'var checkTimeAfter = 0;\n' + 'var constantPool = ectx.constantPool, registers = ectx.registers, stack = ectx.stack;\n';
                if (AVM1.avm1DebuggerEnabled.value) {
                    fn += '/* Running ' + debugName + ' */ ' + 'if (Shumway.AVM1.Debugger.pause || Shumway.AVM1.Debugger.breakpoints.' + debugName + ') { debugger; }\n';
                }
                fn += 'while (!ectx.isEndOfActions) {\n' + 'if (checkTimeAfter <= 0) { checkTimeAfter = ' + AVM1.CHECK_AVM1_HANG_EVERY + '; ectx.context.checkTimeout(); }\n' + 'switch(position) {\n';
                blocks.forEach(function (b) {
                    fn += ' case ' + b.label + ':\n';
                    b.items.forEach(function (item, index) {
                        fn += _this.convertAction(item, uniqueId++, res, index, ir);
                    });
                    fn += '  position = ' + b.jump + ';\n' + '  checkTimeAfter -= ' + b.items.length + ';\n' + '  break;\n';
                });
                fn += ' default: ectx.isEndOfActions = true; break;\n}\n}\n' + 'return stack.pop();};';
                fn += '//# sourceURL=avm1gen-' + debugName;
                return (new Function('calls', 'res', fn))(ActionsDataCompiler.cachedCalls, res);
            };
            return ActionsDataCompiler;
        })();
        AVM1.ActionsDataCompiler = ActionsDataCompiler;
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var AVM1EventHandler = (function () {
                function AVM1EventHandler(propertyName, eventName, argsConverter) {
                    if (argsConverter === void 0) { argsConverter = null; }
                    this.propertyName = propertyName;
                    this.eventName = eventName;
                    this.argsConverter = argsConverter;
                }
                AVM1EventHandler.prototype.onBind = function (target) {
                };
                AVM1EventHandler.prototype.onUnbind = function (target) {
                };
                return AVM1EventHandler;
            })();
            Lib.AVM1EventHandler = AVM1EventHandler;
            function normalizeEventName(context, eventName) {
                return context.isPropertyCaseSensitive ? eventName : eventName.toLowerCase();
            }
            // TODO replace to AVM1NativeSymbolObject
            var AVM1SymbolBase = (function (_super) {
                __extends(AVM1SymbolBase, _super);
                function AVM1SymbolBase() {
                    _super.apply(this, arguments);
                }
                Object.defineProperty(AVM1SymbolBase.prototype, "isAVM1Instance", {
                    get: function () {
                        return !!this._as3Object;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(AVM1SymbolBase.prototype, "as3Object", {
                    get: function () {
                        return this._as3Object;
                    },
                    enumerable: true,
                    configurable: true
                });
                AVM1SymbolBase.prototype.initAVM1SymbolInstance = function (context, as3Object) {
                    AVM1.AVM1Object.call(this, context);
                    release || Shumway.Debug.assert(as3Object);
                    this._as3Object = as3Object;
                };
                AVM1SymbolBase.prototype.bindEvents = function (events, autoUnbind) {
                    if (autoUnbind === void 0) { autoUnbind = true; }
                    this._events = events;
                    var eventsMap = Object.create(null);
                    this._eventsMap = eventsMap;
                    this._eventsListeners = Object.create(null);
                    var observer = this;
                    var context = this.context;
                    events.forEach(function (event) {
                        var propertyName = normalizeEventName(context, event.propertyName);
                        eventsMap[propertyName] = event;
                        context.registerEventPropertyObserver(propertyName, observer);
                        observer._updateEvent(event);
                    });
                    if (autoUnbind) {
                        observer.as3Object.addEventListener('removedFromStage', function removedHandler() {
                            observer.as3Object.removeEventListener('removedFromStage', removedHandler);
                            observer.unbindEvents();
                        });
                    }
                };
                AVM1SymbolBase.prototype.unbindEvents = function () {
                    var events = this._events;
                    var observer = this;
                    var context = this.context;
                    events.forEach(function (event) {
                        context.unregisterEventPropertyObserver(event.propertyName, observer);
                        observer._removeEventListener(event);
                    });
                    this._events = null;
                    this._eventsMap = null;
                    this._eventsListeners = null;
                };
                AVM1SymbolBase.prototype.updateAllEvents = function () {
                    this._events.forEach(function (event) {
                        this._updateEvent(event);
                    }, this);
                };
                AVM1SymbolBase.prototype._updateEvent = function (event) {
                    if (avm1HasEventProperty(this.context, this, event.propertyName)) {
                        this._addEventListener(event);
                    }
                    else {
                        this._removeEventListener(event);
                    }
                };
                AVM1SymbolBase.prototype._addEventListener = function (event) {
                    var propertyName = normalizeEventName(this.context, event.propertyName);
                    var listener = this._eventsListeners[propertyName];
                    if (!listener) {
                        listener = function avm1EventHandler() {
                            var args = event.argsConverter ? event.argsConverter.apply(null, arguments) : null;
                            avm1BroadcastNativeEvent(this.context, this, propertyName, args);
                        }.bind(this);
                        this.as3Object.addEventListener(event.eventName, listener);
                        event.onBind(this);
                        this._eventsListeners[propertyName] = listener;
                    }
                };
                AVM1SymbolBase.prototype._removeEventListener = function (event) {
                    var propertyName = normalizeEventName(this.context, event.propertyName);
                    var listener = this._eventsListeners[propertyName];
                    if (listener) {
                        event.onUnbind(this);
                        this.as3Object.removeEventListener(event.eventName, listener);
                        this._eventsListeners[propertyName] = null;
                    }
                };
                AVM1SymbolBase.prototype.onEventPropertyModified = function (propertyName) {
                    var propertyName = normalizeEventName(this.context, propertyName);
                    var event = this._eventsMap[propertyName];
                    this._updateEvent(event);
                };
                return AVM1SymbolBase;
            })(AVM1.AVM1Object);
            Lib.AVM1SymbolBase = AVM1SymbolBase;
            function avm1HasEventProperty(context, target, propertyName) {
                if (target.alHasProperty(propertyName) && (target.alGet(propertyName) instanceof AVM1.AVM1Function)) {
                    return true;
                }
                var listenersField = target.alGet('_listeners');
                if (!(listenersField instanceof AVM1.Natives.AVM1ArrayNative)) {
                    return false;
                }
                var listeners = listenersField.value;
                return listeners.some(function (listener) {
                    return (listener instanceof AVM1.AVM1Object) && listener.alHasProperty(propertyName);
                });
            }
            Lib.avm1HasEventProperty = avm1HasEventProperty;
            function avm1BroadcastNativeEvent(context, target, propertyName, args) {
                if (args === void 0) { args = null; }
                var handler = target.alGet(propertyName);
                if (handler instanceof AVM1.AVM1Function) {
                    context.executeFunction(handler, target, args);
                }
                var _listeners = target.alGet('_listeners');
                if (_listeners instanceof AVM1.Natives.AVM1ArrayNative) {
                    _listeners.value.forEach(function (listener) {
                        if (!(listener instanceof AVM1.AVM1Object)) {
                            return;
                        }
                        var handlerOnListener = listener.alGet(propertyName);
                        if (handlerOnListener instanceof AVM1.AVM1Function) {
                            context.executeFunction(handlerOnListener, target, args);
                        }
                    });
                }
            }
            function avm1BroadcastEvent(context, target, propertyName, args) {
                if (args === void 0) { args = null; }
                var handler = target.alGet(propertyName);
                if (handler instanceof AVM1.AVM1Function) {
                    handler.alCall(target, args);
                }
                var _listeners = target.alGet('_listeners');
                if (_listeners instanceof AVM1.Natives.AVM1ArrayNative) {
                    _listeners.value.forEach(function (listener) {
                        if (!(listener instanceof AVM1.AVM1Object)) {
                            return;
                        }
                        var handlerOnListener = listener.alGet(propertyName);
                        if (handlerOnListener instanceof AVM1.AVM1Function) {
                            handlerOnListener.alCall(target, args);
                        }
                    });
                }
            }
            Lib.avm1BroadcastEvent = avm1BroadcastEvent;
            var AVM1Utils = (function () {
                function AVM1Utils() {
                }
                AVM1Utils.resolveTarget = function (context, target_mc) {
                    if (target_mc === void 0) { target_mc = undefined; }
                    return context.resolveTarget(target_mc);
                };
                // Temporary solution as suggested by Yury. Will be refactored soon.
                AVM1Utils.resolveMovieClip = function (context, target) {
                    if (target === void 0) { target = undefined; }
                    return target ? context.resolveTarget(target) : undefined;
                };
                AVM1Utils.resolveLevel = function (context, level) {
                    level = +level;
                    return context.resolveLevel(level);
                };
                AVM1Utils.getTarget = function (mc) {
                    var nativeObject = mc.as3Object;
                    if (nativeObject === nativeObject.root) {
                        return '/';
                    }
                    var path = '';
                    do {
                        path = '/' + nativeObject.name + path;
                        nativeObject = nativeObject.parent;
                    } while (nativeObject !== nativeObject.root);
                    return path;
                };
                return AVM1Utils;
            })();
            Lib.AVM1Utils = AVM1Utils;
            function createAVM1NativeObject(ctor, nativeObject, context) {
                // We need to walk on __proto__ to find right ctor.prototype.
                var proto = ctor.alGetPrototypeProperty();
                while (proto && !proto.initAVM1SymbolInstance) {
                    proto = proto.alPrototype;
                }
                release || Shumway.Debug.assert(proto);
                var avm1Object = Object.create(proto);
                proto.initAVM1SymbolInstance.call(avm1Object, context, nativeObject);
                avm1Object.alPrototype = ctor.alGetPrototypeProperty();
                avm1Object.alSetOwnConstructorProperty(ctor);
                nativeObject._as2Object = avm1Object;
                ctor.alCall(avm1Object);
                return avm1Object;
            }
            function getAVM1Object(as3Object, context) {
                if (!as3Object) {
                    return null;
                }
                if (as3Object._as2Object) {
                    return as3Object._as2Object;
                }
                var sec = context.sec;
                if (sec.flash.display.MovieClip.axClass.axIsType(as3Object)) {
                    if (as3Object._avm1SymbolClass) {
                        return createAVM1NativeObject(as3Object._avm1SymbolClass, as3Object, context);
                    }
                    return createAVM1NativeObject(context.globals.MovieClip, as3Object, context);
                }
                if (sec.flash.display.SimpleButton.axClass.axIsType(as3Object)) {
                    return createAVM1NativeObject(context.globals.Button, as3Object, context);
                }
                if (sec.flash.text.TextField.axClass.axIsType(as3Object)) {
                    return createAVM1NativeObject(context.globals.TextField, as3Object, context);
                }
                if (sec.flash.display.BitmapData.axClass.axIsType(as3Object)) {
                    return new as3Object;
                }
                return null;
            }
            Lib.getAVM1Object = getAVM1Object;
            function wrapAVM1NativeMembers(context, wrap, obj, members, prefixFunctions) {
                if (prefixFunctions === void 0) { prefixFunctions = false; }
                function wrapFunction(fn) {
                    if (Shumway.isNullOrUndefined(fn)) {
                        return undefined;
                    }
                    release || Shumway.Debug.assert(typeof fn === 'function');
                    if (!prefixFunctions) {
                        return new AVM1.AVM1NativeFunction(context, fn);
                    }
                    return new AVM1.AVM1NativeFunction(context, function () {
                        var args = Array.prototype.slice.call(arguments, 0);
                        args.unshift(context);
                        return fn.apply(this, args);
                    });
                }
                function getMemberDescriptor(memberName) {
                    var desc;
                    for (var p = obj; p; p = Object.getPrototypeOf(p)) {
                        desc = Object.getOwnPropertyDescriptor(p, memberName);
                        if (desc) {
                            return desc;
                        }
                    }
                    return null;
                }
                if (!members) {
                    return;
                }
                members.forEach(function (memberName) {
                    if (memberName[memberName.length - 1] === '#') {
                        // Property mapping
                        var getterName = 'get' + memberName[0].toUpperCase() + memberName.slice(1, -1);
                        var getter = obj[getterName];
                        var setterName = 'set' + memberName[0].toUpperCase() + memberName.slice(1, -1);
                        var setter = obj[setterName];
                        release || Shumway.Debug.assert(getter || setter, 'define getter or setter');
                        wrap.alSetOwnProperty(memberName.slice(0, -1), {
                            flags: 128 /* ACCESSOR */ | 2 /* DONT_DELETE */ | 1 /* DONT_ENUM */,
                            get: wrapFunction(getter),
                            set: wrapFunction(setter)
                        });
                        return;
                    }
                    var desc = getMemberDescriptor(memberName);
                    if (!desc) {
                        return;
                    }
                    if (desc.get || desc.set) {
                        release || Shumway.Debug.assert(false, 'Redefine ' + memberName + ' property getter/setter as functions');
                        return;
                    }
                    var value = desc.value;
                    if (typeof value === 'function') {
                        value = wrapFunction(value);
                    }
                    wrap.alSetOwnProperty(memberName, {
                        flags: 64 /* DATA */ | 2 /* DONT_DELETE */ | 1 /* DONT_ENUM */,
                        value: value
                    });
                });
            }
            Lib.wrapAVM1NativeMembers = wrapAVM1NativeMembers;
            function wrapAVM1NativeClass(context, wrapAsFunction, cls, staticMembers, members, call, cstr) {
                var wrappedFn = wrapAsFunction ? new AVM1.AVM1NativeFunction(context, call || function () {
                }, function () {
                    // Creating simple AVM1 object
                    var obj = new cls(context);
                    obj.alPrototype = wrappedPrototype;
                    obj.alSetOwnConstructorProperty(wrappedFn);
                    if (cstr) {
                        cstr.apply(obj, arguments);
                    }
                    return obj;
                }) : new AVM1.AVM1Object(context);
                wrapAVM1NativeMembers(context, wrappedFn, cls, staticMembers, true);
                var wrappedPrototype = new cls(context);
                wrappedPrototype.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                wrapAVM1NativeMembers(context, wrappedPrototype, cls.prototype, members, false);
                AVM1.alDefineObjectProperties(wrappedFn, {
                    prototype: {
                        value: wrappedPrototype
                    }
                });
                AVM1.alDefineObjectProperties(wrappedPrototype, {
                    constructor: {
                        value: wrappedFn,
                        writable: true
                    }
                });
                return wrappedFn;
            }
            Lib.wrapAVM1NativeClass = wrapAVM1NativeClass;
            // TODO: type arguments strongly
            function initializeAVM1Object(as3Object, context, placeObjectTag) {
                var instanceAVM1 = getAVM1Object(as3Object, context);
                release || Shumway.Debug.assert(instanceAVM1);
                if (placeObjectTag.variableName) {
                    instanceAVM1.alPut('variable', placeObjectTag.variableName);
                }
                var events = placeObjectTag.events;
                if (!events) {
                    return;
                }
                var stageListeners = [];
                var as3Stage = context.globals.Stage._as3Stage;
                for (var j = 0; j < events.length; j++) {
                    var swfEvent = events[j];
                    var actionsData;
                    if (swfEvent.actionsData) {
                        actionsData = context.actionsDataFactory.createActionsData(swfEvent.actionsData, 's' + placeObjectTag.symbolId + 'e' + j);
                        swfEvent.actionsData = null;
                        swfEvent.compiled = actionsData;
                    }
                    else {
                        actionsData = swfEvent.compiled;
                    }
                    release || Shumway.Debug.assert(actionsData);
                    var handler = clipEventHandler.bind(null, actionsData, instanceAVM1);
                    var flags = swfEvent.flags;
                    for (var eventFlag in ClipEventMappings) {
                        eventFlag |= 0;
                        if (!(flags & (eventFlag | 0))) {
                            continue;
                        }
                        var eventName = ClipEventMappings[eventFlag];
                        if (eventName === 'mouseDown' || eventName === 'mouseUp' || eventName === 'mouseMove') {
                            stageListeners.push({ eventName: eventName, handler: handler });
                            as3Stage.addEventListener(eventName, handler);
                        }
                        else {
                            switch (eventFlag) {
                                case 2048 /* Release */:
                                case 4096 /* ReleaseOutside */:
                                case 8192 /* RollOver */:
                                case 16384 /* RollOut */:
                                    as3Object.buttonMode = true;
                            }
                            as3Object.addEventListener(eventName, handler);
                        }
                    }
                }
                if (stageListeners.length > 0) {
                    as3Object.addEventListener('removedFromStage', function () {
                        for (var i = 0; i < stageListeners.length; i++) {
                            as3Stage.removeEventListener(stageListeners[i].eventName, stageListeners[i].fn, false);
                        }
                    }, false);
                }
            }
            Lib.initializeAVM1Object = initializeAVM1Object;
            function clipEventHandler(actionsData, receiver) {
                return receiver.context.executeActions(actionsData, receiver);
            }
            var AVM1ClipEvents = Shumway.SWF.Parser.AVM1ClipEvents;
            var ClipEventMappings = Object.create(null);
            ClipEventMappings[1 /* Load */] = 'load';
            // AVM1's enterFrame happens at the same point in the cycle as AVM2's frameConstructed.
            ClipEventMappings[2 /* EnterFrame */] = 'frameConstructed';
            ClipEventMappings[4 /* Unload */] = 'unload';
            ClipEventMappings[8 /* MouseMove */] = 'mouseMove';
            ClipEventMappings[16 /* MouseDown */] = 'mouseDown';
            ClipEventMappings[32 /* MouseUp */] = 'mouseUp';
            ClipEventMappings[64 /* KeyDown */] = 'keyDown';
            ClipEventMappings[128 /* KeyUp */] = 'keyUp';
            ClipEventMappings[256 /* Data */] = { toString: function () {
                Shumway.Debug.warning('Data ClipEvent not implemented');
            } };
            ClipEventMappings[512 /* Initialize */] = 'initialize';
            ClipEventMappings[1024 /* Press */] = 'mouseDown';
            ClipEventMappings[2048 /* Release */] = 'click';
            ClipEventMappings[4096 /* ReleaseOutside */] = 'releaseOutside';
            ClipEventMappings[8192 /* RollOver */] = 'mouseOver';
            ClipEventMappings[16384 /* RollOut */] = 'mouseOut';
            ClipEventMappings[32768 /* DragOver */] = { toString: function () {
                Shumway.Debug.warning('DragOver ClipEvent not implemented');
            } };
            ClipEventMappings[65536 /* DragOut */] = { toString: function () {
                Shumway.Debug.warning('DragOut ClipEvent not implemented');
            } };
            ClipEventMappings[131072 /* KeyPress */] = { toString: function () {
                Shumway.Debug.warning('KeyPress ClipEvent not implemented');
            } };
            ClipEventMappings[262144 /* Construct */] = 'construct';
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var notImplemented = Shumway.Debug.notImplemented;
            var somewhatImplemented = Shumway.Debug.somewhatImplemented;
            var assert = Shumway.Debug.assert;
            var flash = Shumway.AVMX.AS.flash; // REDUX remove
            var _escape = jsGlobal.escape;
            var _internalTimeouts = [];
            var AVM1Globals = (function (_super) {
                __extends(AVM1Globals, _super);
                function AVM1Globals(context) {
                    _super.call(this, context);
                    // built-ins
                    this.NaN = Number.NaN;
                    this.Infinity = Number.POSITIVE_INFINITY;
                    this.undefined = undefined;
                    this._initBuiltins(context);
                    var swfVersion = context.loaderInfo.swfVersion;
                    if (swfVersion >= 8) {
                        this._initializeFlashObject(context);
                    }
                }
                AVM1Globals.createGlobalsObject = function (context) {
                    var globals = new AVM1Globals(context);
                    Lib.wrapAVM1NativeMembers(context, globals, globals, ['flash', 'ASSetPropFlags', 'clearInterval', 'clearTimeout', 'escape', 'unescape', 'setInterval', 'setTimeout', 'showRedrawRegions', 'trace', 'updateAfterEvent', 'NaN', 'Infinity', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'Object', 'Function', 'Array', 'Number', 'Math', 'Boolean', 'Date', 'String', 'MovieClip', 'AsBroadcaster', 'System', 'Stage', 'Button', 'TextField', 'Color', 'Key', 'Mouse', 'MovieClipLoader', 'Sound', 'SharedObject', 'ContextMenu', 'ContextMenuItem', 'TextFormat'], false);
                    return globals;
                };
                AVM1Globals.prototype.ASSetPropFlags = function (obj, children, flags, allowFalse) {
                    // flags (from bit 0): dontenum, dontdelete, readonly, ....
                    // TODO
                };
                AVM1Globals.prototype.clearInterval = function (id /* uint */) {
                    var internalId = _internalTimeouts[id - 1];
                    if (internalId) {
                        clearInterval(internalId);
                        delete _internalTimeouts[id - 1];
                    }
                };
                AVM1Globals.prototype.clearTimeout = function (id /* uint */) {
                    var internalId = _internalTimeouts[id - 1];
                    if (internalId) {
                        clearTimeout(internalId);
                        delete _internalTimeouts[id - 1];
                    }
                };
                /**
                 * AVM1 escapes slightly more characters than JS's encodeURIComponent, and even more than
                 * the deprecated JS version of escape. That leaves no other option but to do manual post-
                 * processing of the encoded result. :/
                 *
                 * Luckily, unescape isn't thus afflicted - it happily unescapes all the additional things
                 * we escape here.
                 */
                AVM1Globals.prototype.escape = function (str) {
                    var result = encodeURIComponent(str);
                    return result.replace(/!|'|\(|\)|\*|-|\.|_|~/g, function (char) {
                        switch (char) {
                            case '*':
                                return '%2A';
                            case '-':
                                return '%2D';
                            case '.':
                                return '%2E';
                            case '_':
                                return '%5F';
                            default:
                                return _escape(char);
                        }
                    });
                };
                AVM1Globals.prototype.unescape = function (str) {
                    return decodeURIComponent(str);
                };
                AVM1Globals.prototype.setInterval = function () {
                    // AVM1 setInterval silently swallows everything that vaguely looks like an error.
                    if (arguments.length < 2) {
                        return undefined;
                    }
                    var context = this.context;
                    var args = [];
                    if (AVM1.alIsFunction(arguments[0])) {
                        var fn = arguments[0];
                        args.push(fn.toJSFunction(), arguments[1]);
                    }
                    else {
                        if (arguments.length < 3) {
                            return undefined;
                        }
                        var obj = arguments[0];
                        var funName = arguments[1];
                        if (!(obj instanceof AVM1.AVM1Object) || typeof funName !== 'string') {
                            return undefined;
                        }
                        args.push(function () {
                            var fn = obj.alGet(funName);
                            if (!AVM1.alIsFunction(fn)) {
                                return;
                            }
                            var args = Array.prototype.slice.call(arguments, 0);
                            context.executeFunction(fn, obj, args);
                        });
                    }
                    for (var i = 2; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                    // Unconditionally coerce interval to int, as one would do.
                    args[1] = AVM1.alToInteger(context, args[1]);
                    var internalId = setInterval.apply(null, args);
                    return _internalTimeouts.push(internalId);
                };
                AVM1Globals.prototype.setTimeout = function () {
                    // AVM1 setTimeout silently swallows most things that vaguely look like errors.
                    if (arguments.length < 2 || !AVM1.alIsFunction(arguments[0])) {
                        return undefined;
                    }
                    var args = [];
                    var fn = arguments[0];
                    args.push(fn.toJSFunction());
                    // Unconditionally coerce interval to int, as one would do.
                    args.push(AVM1.alToInteger(this.context, arguments[1]));
                    for (var i = 2; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                    var internalId = setTimeout.apply(null, args);
                    return _internalTimeouts.push(internalId);
                };
                AVM1Globals.prototype.showRedrawRegions = function (enable, color) {
                    // flash.profiler.showRedrawRegions.apply(null, arguments);
                    notImplemented('AVM1Globals.showRedrawRegions');
                };
                AVM1Globals.prototype.trace = function (expression) {
                    this.context.actions.trace(expression);
                };
                AVM1Globals.prototype.updateAfterEvent = function () {
                    // flash.events.TimerEvent.updateAfterEvent
                    somewhatImplemented('AVM1Globals.updateAfterEvent');
                };
                AVM1Globals.prototype.isFinite = function (n) {
                    return isFinite(AVM1.alToNumber(this.context, n));
                };
                AVM1Globals.prototype.isNaN = function (n) {
                    return isNaN(AVM1.alToNumber(this.context, n));
                };
                AVM1Globals.prototype.parseFloat = function (s) {
                    return parseFloat(AVM1.alToString(this.context, s));
                };
                AVM1Globals.prototype.parseInt = function (s, radix) {
                    return parseInt(AVM1.alToString(this.context, s), AVM1.alToInt32(this.context, radix));
                };
                AVM1Globals.prototype._initBuiltins = function (context) {
                    var builtins = context.builtins;
                    this.Object = builtins.Object;
                    this.Function = builtins.Function;
                    this.Array = builtins.Array;
                    this.Number = builtins.Number;
                    this.Math = builtins.Math;
                    this.Boolean = builtins.Boolean;
                    this.Date = builtins.Date;
                    this.String = builtins.String;
                    this.MovieClip = Lib.AVM1MovieClip.createAVM1Class(context);
                    this.AsBroadcaster = Lib.AVM1Broadcaster.createAVM1Class(context);
                    this.System = Lib.AVM1System.createAVM1Class(context);
                    this.Stage = Lib.AVM1Stage.createAVM1Class(context);
                    this.Button = Lib.AVM1Button.createAVM1Class(context);
                    this.TextField = Lib.AVM1TextField.createAVM1Class(context);
                    this.Color = Lib.AVM1Color.createAVM1Class(context);
                    this.Key = Lib.AVM1Key.createAVM1Class(context);
                    this.Mouse = Lib.AVM1Mouse.createAVM1Class(context);
                    this.MovieClipLoader = Lib.AVM1MovieClipLoader.createAVM1Class(context);
                    this.Sound = Lib.AVM1Sound.createAVM1Class(context);
                    this.SharedObject = new Lib.AVM1SharedObjectFunction(context);
                    this.ContextMenu = undefined; // wrapAVM1Builtin(sec.flash.ui.ContextMenu.axClass);
                    this.ContextMenuItem = undefined; // wrapAVM1Builtin(sec.flash.ui.ContextMenuItem.axClass);
                    this.TextFormat = Lib.AVM1TextFormat.createAVM1Class(context);
                    Lib.AVM1Broadcaster.initialize(context, this.Stage);
                    Lib.AVM1Broadcaster.initialize(context, this.Key);
                    Lib.AVM1Broadcaster.initialize(context, this.Mouse);
                };
                AVM1Globals.prototype._initializeFlashObject = function (context) {
                    this.flash = AVM1.alNewObject(context);
                    var display = AVM1.alNewObject(context);
                    display.alPut('BitmapData', Lib.AVM1BitmapData.createAVM1Class(context));
                    this.flash.alPut('display', display);
                    var external = AVM1.alNewObject(context);
                    external.alPut('ExternalInterface', Lib.AVM1ExternalInterface.createAVM1Class(context));
                    this.flash.alPut('external', external);
                    var filters = AVM1.alNewObject(context);
                    this.flash.alPut('filters', filters);
                    var geom = AVM1.alNewObject(context);
                    geom.alPut('ColorTransform', new Lib.AVM1ColorTransformFunction(context));
                    geom.alPut('Matrix', new Lib.AVM1MatrixFunction(context));
                    geom.alPut('Point', new Lib.AVM1PointFunction(context));
                    geom.alPut('Rectangle', new Lib.AVM1RectangleFunction(context));
                    geom.alPut('Transform', Lib.AVM1Transform.createAVM1Class(context));
                    this.flash.alPut('geom', geom);
                    var text = AVM1.alNewObject(context);
                    this.flash.alPut('text', text);
                };
                return AVM1Globals;
            })(AVM1.AVM1Object);
            Lib.AVM1Globals = AVM1Globals;
            var AVM1NativeActions = (function () {
                function AVM1NativeActions(context) {
                    this.context = context;
                    // TODO ?
                }
                AVM1NativeActions.prototype.asfunction = function (link) {
                    notImplemented('AVM1Globals.$asfunction');
                };
                AVM1NativeActions.prototype.call = function (frame) {
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context);
                    var as3Object = nativeTarget.as3Object;
                    var frameNum = as3Object._getAbsFrameNumber(frame, null);
                    if (frameNum === undefined) {
                        return;
                    }
                    as3Object.callFrame(frameNum);
                };
                AVM1NativeActions.prototype.chr = function (code) {
                    code = AVM1.alToInteger(this.context, code);
                    if (this.context.swfVersion <= 5) {
                        code &= 0xFF;
                    }
                    return code ? String.fromCharCode(code) : '';
                };
                AVM1NativeActions.prototype.duplicateMovieClip = function (target, newname, depth) {
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context, target);
                    nativeTarget.duplicateMovieClip(newname, depth, null);
                };
                AVM1NativeActions.prototype.fscommand = function (command, args) {
                    return this.context.sec.flash.system.fscommand.axCall(null, this.context.sec, command, args);
                };
                AVM1NativeActions.prototype.getTimer = function () {
                    return Shumway.AVMX.AS.FlashUtilScript_getTimer(this.context.sec);
                };
                AVM1NativeActions.prototype.getURL = function (url, target, method) {
                    var sec = this.context.sec;
                    var request = new sec.flash.net.URLRequest(String(url));
                    if (method) {
                        request.method = method;
                    }
                    if (typeof target === 'string' && target.indexOf('_level') === 0) {
                        this.loadMovieNum(url, +target.substr(6), method);
                        return;
                    }
                    Shumway.AVMX.AS.FlashNetScript_navigateToURL(sec, request, target);
                };
                AVM1NativeActions.prototype._addToPendingScripts = function (subject, fn, args) {
                    if (args === void 0) { args = null; }
                    release || assert(fn, 'invalid function in _addToPendingScripts');
                    var currentContext = this.context;
                    var defaultTarget = currentContext.resolveTarget(undefined);
                    currentContext.addToPendingScripts(function () {
                        try {
                            fn.apply(subject, args);
                        }
                        catch (ex) {
                            console.error('AVM1 pending script error: ' + ex.message);
                        }
                    }, defaultTarget);
                };
                AVM1NativeActions.prototype.gotoAndPlay = function (scene, frame) {
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context);
                    if (arguments.length < 2) {
                        this._addToPendingScripts(nativeTarget, nativeTarget.gotoAndPlay, [arguments[0]]);
                    }
                    else {
                        this._addToPendingScripts(nativeTarget, nativeTarget.gotoAndPlay, [arguments[1], arguments[0]]); // scene and frame are swapped for AS3
                    }
                };
                AVM1NativeActions.prototype.gotoAndStop = function (scene, frame) {
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context);
                    if (arguments.length < 2) {
                        this._addToPendingScripts(nativeTarget, nativeTarget.gotoAndStop, [arguments[0]]);
                    }
                    else {
                        this._addToPendingScripts(nativeTarget, nativeTarget.gotoAndStop, [arguments[1], arguments[0]]); // scene and frame are swapped for AS3
                    }
                };
                AVM1NativeActions.prototype.ifFrameLoaded = function (scene, frame) {
                    // ignoring scene parameter ?
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context);
                    var frameNum = arguments.length < 2 ? arguments[0] : arguments[1];
                    var framesLoaded = nativeTarget.alGet('_framesloaded');
                    var totalFrames = nativeTarget.alGet('_totalframes');
                    // The (0-based) requested frame index is clamped to (the 1-based) totalFrames value.
                    // I.e., asking if frame 20 is loaded in a timline with only 10 frames returns true if all
                    // frames have been loaded.
                    return Math.min(frameNum + 1, totalFrames) <= framesLoaded;
                };
                AVM1NativeActions.prototype.int = function (value) {
                    return value | 0;
                };
                AVM1NativeActions.prototype.length_ = function (expression) {
                    return ('' + expression).length; // ASCII Only?
                };
                AVM1NativeActions.prototype.loadMovie = function (url, target, method) {
                    // some swfs are using loadMovie to call fscommmand
                    if (url && url.toLowerCase().indexOf('fscommand:') === 0) {
                        this.fscommand(url.substring('fscommand:'.length), target);
                        return;
                    }
                    var loadLevel = typeof target === 'string' && target.indexOf('_level') === 0;
                    var levelNumber;
                    if (loadLevel) {
                        var levelStr = target.charAt(6);
                        levelNumber = parseInt(levelStr, 10);
                        loadLevel = levelNumber.toString() === levelStr;
                    }
                    var loader = new this.context.sec.flash.display.Loader();
                    if (loadLevel) {
                        this._setLevel(levelNumber, loader);
                        var request = new this.context.sec.flash.net.URLRequest(url);
                        if (method) {
                            request.method = method;
                        }
                        loader.load(request);
                    }
                    else {
                        var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context, target);
                        nativeTarget.loadMovie(url, method);
                    }
                };
                AVM1NativeActions.prototype._setLevel = function (level /*uint*/, loader) {
                    level = level >>> 0;
                    // TODO: re-enable support for loading AVM1 content into levels. See bug 1035166.
                    //AVM1Context.instance.stage._as2SetLevel(level, loader);
                };
                AVM1NativeActions.prototype.loadMovieNum = function (url, level, method) {
                    // some swfs are using loadMovieNum to call fscommmand
                    if (url && url.toLowerCase().indexOf('fscommand:') === 0) {
                        return this.fscommand(url.substring('fscommand:'.length));
                    }
                    var loader = new this.context.sec.flash.display.Loader();
                    this._setLevel(level, loader);
                    var request = new this.context.sec.flash.net.URLRequest(url);
                    if (method) {
                        request.method = method;
                    }
                    loader.load(request);
                };
                AVM1NativeActions.prototype.loadVariables = function (url, target, method) {
                    if (method === void 0) { method = ''; }
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context, target);
                    this._loadVariables(nativeTarget, url, method);
                };
                AVM1NativeActions.prototype.loadVariablesNum = function (url, level, method) {
                    if (method === void 0) { method = ''; }
                    var nativeTarget = Lib.AVM1Utils.resolveLevel(this.context, level);
                    this._loadVariables(nativeTarget, url, method);
                };
                AVM1NativeActions.prototype._loadVariables = function (nativeTarget, url, method) {
                    var context = this.context;
                    var request = new context.sec.flash.net.URLRequest(url);
                    if (method) {
                        request.method = method;
                    }
                    var loader = new context.sec.flash.net.URLLoader(request);
                    loader._ignoreDecodeErrors = true;
                    loader.dataFormat = 'variables'; // flash.net.URLLoaderDataFormat.VARIABLES;
                    function completeHandler(event) {
                        loader.removeEventListener(flash.events.Event.COMPLETE, completeHandler);
                        release || Shumway.Debug.assert(typeof loader.data === 'object');
                        Shumway.AVMX.forEachPublicProperty(loader.data, function (key, value) {
                            context.utils.setProperty(nativeTarget, key, value);
                        });
                        if (nativeTarget instanceof Lib.AVM1MovieClip) {
                            Lib.avm1BroadcastEvent(context, nativeTarget, 'onData');
                        }
                    }
                    loader.addEventListener(flash.events.Event.COMPLETE, completeHandler);
                };
                AVM1NativeActions.prototype.mbchr = function (code) {
                    code = AVM1.alToInteger(this.context, code);
                    return code ? String.fromCharCode(code) : '';
                };
                AVM1NativeActions.prototype.mblength = function (expression) {
                    return ('' + expression).length;
                };
                AVM1NativeActions.prototype.mbord = function (character) {
                    return ('' + character).charCodeAt(0);
                };
                AVM1NativeActions.prototype.mbsubstring = function (value, index, count) {
                    if (index !== (0 | index) || count !== (0 | count)) {
                        // index or count are not integers, the result is the empty string.
                        return '';
                    }
                    return ('' + value).substr(index, count);
                };
                AVM1NativeActions.prototype.nextFrame = function () {
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context);
                    this._addToPendingScripts(nativeTarget, nativeTarget.nextFrame);
                };
                AVM1NativeActions.prototype.nextScene = function () {
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context);
                    this._addToPendingScripts(nativeTarget, nativeTarget.nextScene);
                };
                AVM1NativeActions.prototype.ord = function (character) {
                    return ('' + character).charCodeAt(0); // ASCII only?
                };
                AVM1NativeActions.prototype.play = function () {
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context);
                    nativeTarget.play();
                };
                AVM1NativeActions.prototype.prevFrame = function () {
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context);
                    this._addToPendingScripts(nativeTarget, nativeTarget.prevFrame);
                };
                AVM1NativeActions.prototype.prevScene = function () {
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context);
                    this._addToPendingScripts(nativeTarget, nativeTarget.prevScene);
                };
                AVM1NativeActions.prototype.print = function (target, boundingBox) {
                    // flash.printing.PrintJob
                    notImplemented('AVM1Globals.print');
                };
                AVM1NativeActions.prototype.printAsBitmap = function (target, boundingBox) {
                    notImplemented('AVM1Globals.printAsBitmap');
                };
                AVM1NativeActions.prototype.printAsBitmapNum = function (level, boundingBox) {
                    notImplemented('AVM1Globals.printAsBitmapNum');
                };
                AVM1NativeActions.prototype.printNum = function (level, bondingBox) {
                    notImplemented('AVM1Globals.printNum');
                };
                AVM1NativeActions.prototype.random = function (value) {
                    return 0 | (Math.random() * (0 | value));
                };
                AVM1NativeActions.prototype.removeMovieClip = function (target) {
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context, target);
                    nativeTarget.removeMovieClip();
                };
                AVM1NativeActions.prototype.startDrag = function (target) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    var mc = Lib.AVM1Utils.resolveTarget(this.context, target);
                    mc.startDrag.apply(mc, args);
                };
                AVM1NativeActions.prototype.stop = function () {
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context);
                    nativeTarget.stop();
                };
                AVM1NativeActions.prototype.stopAllSounds = function () {
                    flash.media.SoundMixer.stopAll();
                };
                AVM1NativeActions.prototype.stopDrag = function (target) {
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context, target);
                    nativeTarget.stopDrag();
                };
                AVM1NativeActions.prototype.substring = function (value, index, count) {
                    return this.mbsubstring(value, index, count); // ASCII Only?
                };
                AVM1NativeActions.prototype.targetPath = function (target) {
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context, target);
                    return nativeTarget._target;
                };
                AVM1NativeActions.prototype.toggleHighQuality = function () {
                    // flash.display.Stage.quality
                    notImplemented('AVM1Globals.toggleHighQuality');
                };
                AVM1NativeActions.prototype.trace = function (expression) {
                    var value;
                    switch (typeof expression) {
                        case 'undefined':
                            // undefined is always 'undefined' for trace (even for SWF6).
                            value = 'undefined';
                            break;
                        case 'string':
                            value = expression;
                            break;
                        default:
                            value = AVM1.alToString(this.context, expression);
                            break;
                    }
                    Shumway.AVMX.AS.Natives.print(this.context.sec, value);
                };
                AVM1NativeActions.prototype.unloadMovie = function (target) {
                    var nativeTarget = Lib.AVM1Utils.resolveTarget(this.context, target);
                    nativeTarget.unloadMovie();
                };
                AVM1NativeActions.prototype.unloadMovieNum = function (level) {
                    var nativeTarget = Lib.AVM1Utils.resolveLevel(this.context, level);
                    nativeTarget.unloadMovie();
                };
                return AVM1NativeActions;
            })();
            Lib.AVM1NativeActions = AVM1NativeActions;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            function _updateAllSymbolEvents(symbolInstance) {
                // REDUX
                if (!symbolInstance.isAVM1Instance) {
                    return;
                }
                symbolInstance.updateAllEvents();
            }
            var AVM1Broadcaster = (function (_super) {
                __extends(AVM1Broadcaster, _super);
                function AVM1Broadcaster() {
                    _super.apply(this, arguments);
                }
                AVM1Broadcaster.createAVM1Class = function (context) {
                    return Lib.wrapAVM1NativeClass(context, true, AVM1Broadcaster, ['initialize'], []);
                };
                AVM1Broadcaster.initialize = function (context, obj) {
                    obj.alSetOwnProperty('_listeners', {
                        flags: 64 /* DATA */ | 1 /* DONT_ENUM */,
                        value: new AVM1.Natives.AVM1ArrayNative(context, [])
                    });
                    obj.alSetOwnProperty('broadcastMessage', {
                        flags: 64 /* DATA */ | 1 /* DONT_ENUM */,
                        value: new AVM1.AVM1NativeFunction(context, function broadcastMessage(eventName) {
                            var args = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                args[_i - 1] = arguments[_i];
                            }
                            var listenersField = this.alGet('_listeners');
                            if (!(listenersField instanceof AVM1.Natives.AVM1ArrayNative)) {
                                return;
                            }
                            Lib.avm1BroadcastEvent(context, this, eventName, args);
                        })
                    });
                    obj.alSetOwnProperty('addListener', {
                        flags: 64 /* DATA */ | 1 /* DONT_ENUM */,
                        value: new AVM1.AVM1NativeFunction(context, function addListener(listener) {
                            var listenersField = this.alGet('_listeners');
                            if (!(listenersField instanceof AVM1.Natives.AVM1ArrayNative)) {
                                return false;
                            }
                            var listeners = listenersField.value;
                            listeners.push(listener);
                            _updateAllSymbolEvents(this);
                            return true;
                        })
                    });
                    obj.alSetOwnProperty('removeListener', {
                        flags: 64 /* DATA */ | 1 /* DONT_ENUM */,
                        value: new AVM1.AVM1NativeFunction(context, function removeListener(listener) {
                            var listenersField = this.alGet('_listeners');
                            if (!(listenersField instanceof AVM1.Natives.AVM1ArrayNative)) {
                                return false;
                            }
                            var listeners = listenersField.value;
                            var i = listeners.indexOf(listener);
                            if (i < 0) {
                                return false;
                            }
                            listeners.splice(i, 1);
                            _updateAllSymbolEvents(this);
                            return true;
                        })
                    });
                };
                return AVM1Broadcaster;
            })(AVM1.AVM1Object);
            Lib.AVM1Broadcaster = AVM1Broadcaster;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var AVM1Key = (function (_super) {
                __extends(AVM1Key, _super);
                function AVM1Key() {
                    _super.apply(this, arguments);
                }
                AVM1Key.createAVM1Class = function (context) {
                    var wrapped = Lib.wrapAVM1NativeClass(context, false, AVM1Key, ['DOWN', 'LEFT', 'RIGHT', 'UP', 'isDown'], []);
                    return wrapped;
                };
                AVM1Key.alInitStatic = function (context) {
                    this._keyStates = [];
                    this._lastKeyCode = 0;
                };
                AVM1Key.bindStage = function (context, cls, stage) {
                    stage.addEventListener('keyDown', function (e) {
                        var keyCode = e.axGetPublicProperty('keyCode');
                        var staticState = context.getStaticState(AVM1Key);
                        staticState._lastKeyCode = keyCode;
                        staticState._keyStates[keyCode] = 1;
                        AVM1.alCallProperty(cls, 'broadcastMessage', ['onKeyDown']);
                    }, false);
                    stage.addEventListener('keyUp', function (e) {
                        var keyCode = e.axGetPublicProperty('keyCode');
                        var staticState = context.getStaticState(AVM1Key);
                        staticState._lastKeyCode = keyCode;
                        delete staticState._keyStates[keyCode];
                        AVM1.alCallProperty(cls, 'broadcastMessage', ['onKeyUp']);
                    }, false);
                };
                AVM1Key.isDown = function (context, code) {
                    var staticState = context.getStaticState(AVM1Key);
                    return !!staticState._keyStates[code];
                };
                AVM1Key.DOWN = 40;
                AVM1Key.LEFT = 37;
                AVM1Key.RIGHT = 39;
                AVM1Key.UP = 38;
                return AVM1Key;
            })(AVM1.AVM1Object);
            Lib.AVM1Key = AVM1Key;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var AVM1Mouse = (function (_super) {
                __extends(AVM1Mouse, _super);
                function AVM1Mouse() {
                    _super.apply(this, arguments);
                }
                AVM1Mouse.createAVM1Class = function (context) {
                    var wrapped = Lib.wrapAVM1NativeClass(context, false, AVM1Mouse, ['show', 'hide'], []);
                    return wrapped;
                };
                AVM1Mouse.bindStage = function (context, cls, stage) {
                    stage.addEventListener('mouseDown', function (e) {
                        AVM1.alCallProperty(cls, 'broadcastMessage', ['onMouseDown']);
                    }, false);
                    stage.addEventListener('mouseMove', function (e) {
                        AVM1.alCallProperty(cls, 'broadcastMessage', ['onMouseMove']);
                    }, false);
                    stage.addEventListener('mouseOut', function (e) {
                        AVM1.alCallProperty(cls, 'broadcastMessage', ['onMouseMove']);
                    }, false);
                    stage.addEventListener('mouseUp', function (e) {
                        AVM1.alCallProperty(cls, 'broadcastMessage', ['onMouseUp']);
                    }, false);
                };
                AVM1Mouse.hide = function () {
                    // TODO hide();
                };
                AVM1Mouse.show = function () {
                    // TODO show();
                };
                return AVM1Mouse;
            })(AVM1.AVM1Object);
            Lib.AVM1Mouse = AVM1Mouse;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var AVM1Stage = (function (_super) {
                __extends(AVM1Stage, _super);
                function AVM1Stage() {
                    _super.apply(this, arguments);
                }
                AVM1Stage.createAVM1Class = function (context) {
                    var wrapped = new AVM1Stage(context);
                    Lib.wrapAVM1NativeMembers(context, wrapped, AVM1Stage.prototype, ['align#', 'displayState#', 'fullScreenSourceRect#', 'height#', 'scaleMode#', 'showMenu#', 'width#'], false);
                    return wrapped;
                };
                AVM1Stage.bindStage = function (context, cls, stage) {
                    cls._as3Stage = stage;
                };
                AVM1Stage.prototype.getAlign = function () {
                    return this._as3Stage.align;
                };
                AVM1Stage.prototype.setAlign = function (value) {
                    this._as3Stage.align = value;
                };
                AVM1Stage.prototype.getDisplayState = function () {
                    return this._as3Stage.displayState;
                };
                AVM1Stage.prototype.setDisplayState = function (value) {
                    this._as3Stage.displayState = value;
                };
                AVM1Stage.prototype.getFullScreenSourceRect = function () {
                    return this._as3Stage.fullScreenSourceRect;
                };
                AVM1Stage.prototype.setFullScreenSourceRect = function (value) {
                    this._as3Stage.fullScreenSourceRect = value;
                };
                AVM1Stage.prototype.getHeight = function () {
                    return this._as3Stage.stageHeight;
                };
                AVM1Stage.prototype.getScaleMode = function () {
                    return this._as3Stage.scaleMode;
                };
                AVM1Stage.prototype.setScaleMode = function (value) {
                    this._as3Stage.scaleMode = value;
                };
                AVM1Stage.prototype.getShowMenu = function () {
                    return this._as3Stage.showDefaultContextMenu;
                };
                AVM1Stage.prototype.setShowMenu = function (value) {
                    this._as3Stage.showDefaultContextMenu = value;
                };
                AVM1Stage.prototype.getWidth = function () {
                    return this._as3Stage.stageWidth;
                };
                return AVM1Stage;
            })(AVM1.AVM1Object);
            Lib.AVM1Stage = AVM1Stage;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var flash = Shumway.AVMX.AS.flash;
            var assert = Shumway.Debug.assert;
            var AVM1MovieClipButtonModeEvent = (function (_super) {
                __extends(AVM1MovieClipButtonModeEvent, _super);
                function AVM1MovieClipButtonModeEvent(propertyName, eventName, argsConverter) {
                    if (argsConverter === void 0) { argsConverter = null; }
                    _super.call(this, propertyName, eventName, argsConverter);
                    this.propertyName = propertyName;
                    this.eventName = eventName;
                    this.argsConverter = argsConverter;
                }
                AVM1MovieClipButtonModeEvent.prototype.onBind = function (target) {
                    var mc = target;
                    mc.as3Object.buttonMode = true;
                };
                return AVM1MovieClipButtonModeEvent;
            })(Lib.AVM1EventHandler);
            var AVM1MovieClip = (function (_super) {
                __extends(AVM1MovieClip, _super);
                function AVM1MovieClip() {
                    _super.apply(this, arguments);
                }
                AVM1MovieClip.createAVM1Class = function (context) {
                    return Lib.wrapAVM1NativeClass(context, true, AVM1MovieClip, [], ['_alpha#', 'attachAudio', 'attachBitmap', 'attachMovie', 'beginFill', 'beginBitmapFill', 'beginGradientFill', 'blendMode#', 'cacheAsBitmap#', '_callFrame', 'clear', 'createEmptyMovieClip', 'createTextField', '_currentframe#', 'curveTo', '_droptarget#', 'duplicateMovieClip', 'enabled#', 'endFill', 'filters#', '_framesloaded#', 'focusEnabled#', '_focusrect#', 'forceSmoothing#', 'getBounds', 'getBytesLoaded', 'getBytesTotal', 'getDepth', 'getInstanceAtDepth', 'getNextHighestDepth', 'getRect', 'getSWFVersion', 'getTextSnapshot', 'getURL', 'globalToLocal', 'gotoAndPlay', 'gotoAndStop', '_height#', '_highquality#', 'hitArea#', 'hitTest', 'lineGradientStyle', 'lineStyle', 'lineTo', 'loadMovie', 'loadVariables', 'localToGlobal', '_lockroot#', 'menu#', 'moveTo', '_name#', 'nextFrame', 'opaqueBackground#', '_parent#', 'play', 'prevFrame', '_quality#', 'removeMovieClip', '_rotation#', 'scale9Grid#', 'scrollRect#', 'setMask', '_soundbuftime#', 'startDrag', 'stop', 'stopDrag', 'swapDepths', 'tabChildren#', 'tabEnabled#', 'tabIndex#', '_target#', '_totalframes#', 'trackAsMenu#', 'transform#', 'toString', 'unloadMovie', '_url#', 'useHandCursor#', '_visible#', '_width#', '_x#', '_xmouse#', '_xscale#', '_y#', '_ymouse#', '_yscale#']);
                };
                Object.defineProperty(AVM1MovieClip.prototype, "graphics", {
                    get: function () {
                        return this.as3Object.graphics;
                    },
                    enumerable: true,
                    configurable: true
                });
                AVM1MovieClip.prototype.initAVM1SymbolInstance = function (context, as3Object) {
                    _super.prototype.initAVM1SymbolInstance.call(this, context, as3Object);
                    this._frameScripts = null;
                    this._boundExecuteFrameScripts = null;
                    this._initEventsHandlers();
                };
                AVM1MovieClip.prototype._lookupChildByName = function (name) {
                    name = AVM1.alCoerceString(this.context, name);
                    var lookupOptions = 2 /* INCLUDE_NOT_INITIALIZED */;
                    if (!this.context.isPropertyCaseSensitive) {
                        lookupOptions |= 1 /* IGNORE_CASE */;
                    }
                    var as3Child = this.as3Object._lookupChildByName(name, lookupOptions);
                    return Lib.getAVM1Object(as3Child, this.context);
                };
                Object.defineProperty(AVM1MovieClip.prototype, "__targetPath", {
                    get: function () {
                        var target = this.get_target();
                        var prefix = '_level0'; // TODO use needed level number here
                        return target != '/' ? prefix + target.replace(/\//g, '.') : prefix;
                    },
                    enumerable: true,
                    configurable: true
                });
                AVM1MovieClip.prototype.get_alpha = function () {
                    return this.as3Object.alpha;
                };
                AVM1MovieClip.prototype.set_alpha = function (value) {
                    this.as3Object.alpha = value;
                };
                AVM1MovieClip.prototype.attachAudio = function (id) {
                    throw 'Not implemented: attachAudio';
                };
                //    public attachBitmap(bmp:AVM1BitmapData, depth:number, pixelSnapping:String = 'auto', smoothing:Boolean = false):void {
                //      var bitmap:flash.display.Bitmap = construct(flash.display.Bitmap, [bmp, pixelSnapping, smoothing]);
                //      this._insertChildAtDepth(bitmap, depth);
                //    }
                AVM1MovieClip.prototype._constructMovieClipSymbol = function (symbolId, name) {
                    var symbol = this.context.getAsset(symbolId);
                    if (!symbol) {
                        return undefined;
                    }
                    var props = Object.create(symbol.symbolProps);
                    props.avm1Name = name;
                    props.avm1SymbolClass = symbol.theClass;
                    var mc;
                    mc = Shumway.AVMX.AS.constructClassFromSymbol(props, this.context.sec.flash.display.MovieClip.axClass);
                    return mc;
                };
                AVM1MovieClip.prototype.attachMovie = function (symbolId, name, depth, initObject) {
                    var mc = this._constructMovieClipSymbol(symbolId, name);
                    if (!mc) {
                        return undefined;
                    }
                    var as2mc = this._insertChildAtDepth(mc, depth);
                    if (initObject) {
                        as2mc._init(initObject);
                    }
                    return as2mc;
                };
                AVM1MovieClip.prototype.beginFill = function (color, alpha) {
                    this.graphics.beginFill(color, alpha);
                };
                AVM1MovieClip.prototype.beginBitmapFill = function (bmp, matrix, repeat, smoothing) {
                    if (!(bmp instanceof flash.display.BitmapData)) {
                        return;
                    }
                    this.graphics.beginBitmapFill(bmp, matrix, repeat, smoothing);
                };
                AVM1MovieClip.prototype.beginGradientFill = function (fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio) {
                    this.graphics.beginGradientFill(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio);
                };
                AVM1MovieClip.prototype.getBlendMode = function () {
                    return this.as3Object.blendMode;
                };
                AVM1MovieClip.prototype.setBlendMode = function (value) {
                    this.as3Object.blendMode = value;
                };
                AVM1MovieClip.prototype.getCacheAsBitmap = function () {
                    return this.as3Object.cacheAsBitmap;
                };
                AVM1MovieClip.prototype.setCacheAsBitmap = function (value) {
                    this.as3Object.cacheAsBitmap = value;
                };
                AVM1MovieClip.prototype._callFrame = function (frame) {
                    var nativeAS3Object = this.as3Object;
                    nativeAS3Object._callFrame(frame);
                };
                AVM1MovieClip.prototype.clear = function () {
                    this.graphics.clear();
                };
                AVM1MovieClip.prototype._insertChildAtDepth = function (mc, depth) {
                    var nativeAS3Object = this.as3Object;
                    nativeAS3Object.addTimelineObjectAtDepth(mc, Math.min(nativeAS3Object.numChildren, depth));
                    // Bitmaps aren't reflected in AVM1, so the rest here doesn't apply.
                    if (this.context.sec.flash.display.Bitmap.axIsType(mc)) {
                        return null;
                    }
                    var as2mc = Lib.getAVM1Object(mc, this.context);
                    return as2mc;
                };
                AVM1MovieClip.prototype.createEmptyMovieClip = function (name, depth) {
                    var mc = new this.context.sec.flash.display.MovieClip();
                    mc.name = name;
                    return this._insertChildAtDepth(mc, depth);
                };
                AVM1MovieClip.prototype.createTextField = function (name, depth, x, y, width, height) {
                    var text = new this.context.sec.flash.text.TextField();
                    text.name = name;
                    text.x = x;
                    text.y = y;
                    text.width = width;
                    text.height = height;
                    return this._insertChildAtDepth(text, depth);
                };
                AVM1MovieClip.prototype.get_currentframe = function () {
                    return this.as3Object.currentFrame;
                };
                AVM1MovieClip.prototype.curveTo = function (controlX, controlY, anchorX, anchorY) {
                    this.graphics.curveTo(controlX, controlY, anchorX, anchorY);
                };
                AVM1MovieClip.prototype.get_droptarget = function () {
                    return this.as3Object.dropTarget;
                };
                AVM1MovieClip.prototype.duplicateMovieClip = function (name, depth, initObject) {
                    var nativeAS3Object = this.as3Object;
                    var mc;
                    if (nativeAS3Object._symbol) {
                        mc = Shumway.AVMX.AS.constructClassFromSymbol(nativeAS3Object._symbol, nativeAS3Object.axClass);
                    }
                    else {
                        mc = new this.context.sec.flash.display.MovieClip();
                        mc.name = name;
                    }
                    // These are all properties that get copied over when duplicating a movie clip.
                    // Examined by testing.
                    mc.x = nativeAS3Object.x;
                    mc.scaleX = nativeAS3Object.scaleX;
                    mc.y = nativeAS3Object.y;
                    mc.scaleY = nativeAS3Object.scaleY;
                    mc.rotation = nativeAS3Object.rotation;
                    mc.alpha = nativeAS3Object.alpha;
                    mc.blendMode = nativeAS3Object.blendMode;
                    mc.cacheAsBitmap = nativeAS3Object.cacheAsBitmap;
                    mc.opaqueBackground = nativeAS3Object.opaqueBackground;
                    mc.tabChildren = nativeAS3Object.tabChildren;
                    // Not supported yet: _quality, _highquality, _soundbuftime.
                    mc.graphics.copyFrom(nativeAS3Object.graphics);
                    // TODO: Do event listeners get copied?
                    var as2mc = this._insertChildAtDepth(mc, depth);
                    if (initObject) {
                        as2mc._init(initObject);
                    }
                    return as2mc;
                };
                AVM1MovieClip.prototype.getEnabled = function () {
                    return this.as3Object.enabled;
                };
                AVM1MovieClip.prototype.setEnabled = function (value) {
                    this.as3Object.enabled = value;
                };
                AVM1MovieClip.prototype.endFill = function () {
                    this.graphics.endFill();
                };
                AVM1MovieClip.prototype.getFilters = function () {
                    throw 'Not implemented: get$filters';
                };
                AVM1MovieClip.prototype.setFilters = function (value) {
                    throw 'Not implemented: set$filters';
                };
                AVM1MovieClip.prototype.getFocusEnabled = function () {
                    throw 'Not implemented: get$focusEnabled';
                };
                AVM1MovieClip.prototype.setFocusEnabled = function (value) {
                    throw 'Not implemented: set$focusEnabled';
                };
                AVM1MovieClip.prototype.get_focusrect = function () {
                    throw 'Not implemented: get$_focusrect';
                };
                AVM1MovieClip.prototype.set_focusrect = function (value) {
                    throw 'Not implemented: set$_focusrect';
                };
                AVM1MovieClip.prototype.getForceSmoothing = function () {
                    throw 'Not implemented: get$forceSmoothing';
                };
                AVM1MovieClip.prototype.setForceSmoothing = function (value) {
                    throw 'Not implemented: set$forceSmoothing';
                };
                AVM1MovieClip.prototype.get_framesloaded = function () {
                    return this.as3Object.framesLoaded;
                };
                AVM1MovieClip.prototype.getBounds = function (bounds) {
                    var obj = bounds.as3Object;
                    if (!obj) {
                        throw 'Unsupported bounds type';
                    }
                    return this.as3Object.getBounds(obj);
                };
                AVM1MovieClip.prototype.getBytesLoaded = function () {
                    var loaderInfo = this.as3Object.loaderInfo;
                    return loaderInfo.bytesLoaded;
                };
                AVM1MovieClip.prototype.getBytesTotal = function () {
                    var loaderInfo = this.as3Object.loaderInfo;
                    return loaderInfo.bytesTotal;
                };
                AVM1MovieClip.prototype.getDepth = function () {
                    return this.as3Object._depth;
                };
                AVM1MovieClip.prototype.getInstanceAtDepth = function (depth) {
                    var nativeObject = this.as3Object;
                    for (var i = 0, numChildren = nativeObject.numChildren; i < numChildren; i++) {
                        var child = nativeObject._lookupChildByIndex(i);
                        // child is null if it hasn't been constructed yet. This can happen in InitActionBlocks.
                        if (child && child._depth === depth) {
                            // Somewhat absurdly, this method returns the mc if a bitmap is at the given depth.
                            if (this.context.sec.flash.display.Bitmap.axIsType(child)) {
                                return this;
                            }
                            return Lib.getAVM1Object(child, this.context);
                        }
                    }
                    return null;
                };
                AVM1MovieClip.prototype.getNextHighestDepth = function () {
                    var nativeObject = this.as3Object;
                    var maxDepth = 0;
                    for (var i = 0, numChildren = nativeObject.numChildren; i < numChildren; i++) {
                        var child = nativeObject._lookupChildByIndex(i);
                        if (child._depth > maxDepth) {
                            maxDepth = child._depth;
                        }
                    }
                    return maxDepth + 1;
                };
                AVM1MovieClip.prototype.getRect = function (bounds) {
                    throw 'Not implemented: getRect';
                };
                AVM1MovieClip.prototype.getSWFVersion = function () {
                    var loaderInfo = this.as3Object.loaderInfo;
                    return loaderInfo.swfVersion;
                };
                AVM1MovieClip.prototype.getTextSnapshot = function () {
                    throw 'Not implemented: getTextSnapshot';
                };
                AVM1MovieClip.prototype.getURL = function (url, window, method) {
                    var request = new this.context.sec.flash.net.URLRequest(url);
                    if (method) {
                        request.method = method;
                    }
                    Shumway.AVMX.AS.FlashNetScript_navigateToURL(request, window);
                };
                AVM1MovieClip.prototype.globalToLocal = function (pt) {
                    var tmp = this.as3Object.globalToLocal(Lib.toAS3Point(pt));
                    Lib.copyAS3PointTo(tmp, pt);
                };
                AVM1MovieClip.prototype.gotoAndPlay = function (frame) {
                    return this.as3Object.gotoAndPlay(frame);
                };
                AVM1MovieClip.prototype.gotoAndStop = function (frame) {
                    return this.as3Object.gotoAndStop(frame);
                };
                AVM1MovieClip.prototype.get_height = function () {
                    return this.as3Object.height;
                };
                AVM1MovieClip.prototype.set_height = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this.as3Object.height = value;
                };
                AVM1MovieClip.prototype.get_highquality = function () {
                    return 1;
                };
                AVM1MovieClip.prototype.set_highquality = function (value) {
                };
                AVM1MovieClip.prototype.getHitArea = function () {
                    throw 'Not implemented: get$hitArea';
                };
                AVM1MovieClip.prototype.setHitArea = function (value) {
                    throw 'Not implemented: set$hitArea';
                };
                AVM1MovieClip.prototype.hitTest = function (x, y, shapeFlag) {
                    if (x instanceof AVM1MovieClip) {
                        return this.as3Object.hitTestObject(x.as3Object);
                    }
                    else {
                        return this.as3Object.hitTestPoint(x, y, shapeFlag);
                    }
                };
                AVM1MovieClip.prototype.lineGradientStyle = function (fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio) {
                    this.graphics.lineGradientStyle(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio);
                };
                AVM1MovieClip.prototype.lineStyle = function (thickness, rgb, alpha, pixelHinting, noScale, capsStyle, jointStyle, miterLimit) {
                    this.graphics.lineStyle(thickness, rgb, alpha, pixelHinting, noScale, capsStyle, jointStyle, miterLimit);
                };
                AVM1MovieClip.prototype.lineTo = function (x, y) {
                    this.graphics.lineTo(x, y);
                };
                AVM1MovieClip.prototype.loadMovie = function (url, method) {
                    var loader = new this.context.sec.flash.display.Loader();
                    var request = new this.context.sec.flash.net.URLRequest(url);
                    if (method) {
                        request.method = method;
                    }
                    loader.load(request);
                    function completeHandler(event) {
                        loader.removeEventListener(flash.events.Event.COMPLETE, completeHandler);
                        var parent = this.as3Object.parent;
                        var depth = parent.getChildIndex(this.as3Object);
                        parent.removeChild(this.as3Object);
                        parent.addChildAt(loader.content, depth);
                    }
                    loader.addEventListener(flash.events.Event.COMPLETE, completeHandler);
                };
                AVM1MovieClip.prototype.loadVariables = function (url, method) {
                    // REDUX move _loadVariables here?
                    this.context.actions._loadVariables(this, url, method);
                };
                AVM1MovieClip.prototype.localToGlobal = function (pt) {
                    var tmp = this.as3Object.localToGlobal(Lib.toAS3Point(pt));
                    Lib.copyAS3PointTo(tmp, pt);
                };
                AVM1MovieClip.prototype.get_lockroot = function () {
                    throw 'Not implemented: get$_lockroot';
                };
                AVM1MovieClip.prototype.set_lockroot = function (value) {
                    throw 'Not implemented: set$_lockroot';
                };
                AVM1MovieClip.prototype.getMenu = function () {
                    return this.as3Object.contextMenu;
                };
                AVM1MovieClip.prototype.setMenu = function (value) {
                    this.as3Object.contextMenu = value;
                };
                AVM1MovieClip.prototype.moveTo = function (x, y) {
                    this.graphics.moveTo(x, y);
                };
                AVM1MovieClip.prototype.get_name = function () {
                    return this.as3Object.name;
                };
                AVM1MovieClip.prototype.set_name = function (value) {
                    this.as3Object.name = value;
                };
                AVM1MovieClip.prototype.nextFrame = function () {
                    this.as3Object.nextFrame();
                };
                AVM1MovieClip.prototype.nextScene = function () {
                    this.as3Object.nextScene();
                };
                AVM1MovieClip.prototype.getOpaqueBackground = function () {
                    return this.as3Object.opaqueBackground;
                };
                AVM1MovieClip.prototype.setOpaqueBackground = function (value) {
                    this.as3Object.opaqueBackground = value;
                };
                AVM1MovieClip.prototype.get_parent = function () {
                    var parent = Lib.getAVM1Object(this.as3Object.parent, this.context);
                    // In AVM1, the _parent property is `undefined`, not `null` if the element has no parent.
                    return parent || undefined;
                };
                AVM1MovieClip.prototype.set_parent = function (value) {
                    throw 'Not implemented: set$_parent';
                };
                AVM1MovieClip.prototype.play = function () {
                    this.as3Object.play();
                };
                AVM1MovieClip.prototype.prevFrame = function () {
                    this.as3Object.prevFrame();
                };
                AVM1MovieClip.prototype.prevScene = function () {
                    this.as3Object.prevScene();
                };
                AVM1MovieClip.prototype.get_quality = function () {
                    return 'HIGH';
                };
                AVM1MovieClip.prototype.set_quality = function (value) {
                };
                AVM1MovieClip.prototype.removeMovieClip = function () {
                    var parent = this.get_parent().as3Object;
                    parent.removeChild(this.as3Object);
                };
                AVM1MovieClip.prototype.get_rotation = function () {
                    return this.as3Object.rotation;
                };
                AVM1MovieClip.prototype.set_rotation = function (value) {
                    this.as3Object.rotation = value;
                };
                AVM1MovieClip.prototype.getScale9Grid = function () {
                    throw 'Not implemented: get$scale9Grid';
                };
                AVM1MovieClip.prototype.setScale9Grid = function (value) {
                    throw 'Not implemented: set$scale9Grid';
                };
                AVM1MovieClip.prototype.getScrollRect = function () {
                    throw 'Not implemented: get$scrollRect';
                };
                AVM1MovieClip.prototype.setScrollRect = function (value) {
                    throw 'Not implemented: set$scrollRect';
                };
                AVM1MovieClip.prototype.setMask = function (mc) {
                    var nativeObject = this.as3Object;
                    var mask = Lib.AVM1Utils.resolveMovieClip(this.context, mc);
                    if (mask) {
                        nativeObject.mask = mask.as3Object;
                    }
                };
                AVM1MovieClip.prototype.get_soundbuftime = function () {
                    throw 'Not implemented: get$_soundbuftime';
                };
                AVM1MovieClip.prototype.set_soundbuftime = function (value) {
                    throw 'Not implemented: set$_soundbuftime';
                };
                AVM1MovieClip.prototype.startDrag = function (lock, left, top, right, bottom) {
                    lock = AVM1.alToBoolean(this.context, lock);
                    var bounds = null;
                    if (arguments.length < 3) {
                        left = AVM1.alToNumber(this.context, left);
                        top = AVM1.alToNumber(this.context, top);
                        right = AVM1.alToNumber(this.context, right);
                        bottom = AVM1.alToNumber(this.context, bottom);
                        bounds = new this.context.sec.flash.geom.Rectangle(left, top, right - left, bottom - top);
                    }
                    this.as3Object.startDrag(lock, bounds);
                };
                AVM1MovieClip.prototype.stop = function () {
                    return this.as3Object.stop();
                };
                AVM1MovieClip.prototype.stopDrag = function () {
                    return this.as3Object.stopDrag();
                };
                AVM1MovieClip.prototype.swapDepths = function (target) {
                    var child1 = this.as3Object;
                    var child2 = typeof target === 'number' ? Lib.AVM1Utils.resolveLevel(this.context, Number(target)).as3Object : Lib.AVM1Utils.resolveTarget(this.context, target).as3Object;
                    if (child1.parent !== child2.parent) {
                        return; // must be the same parent
                    }
                    child1.parent.swapChildren(child1, child2);
                };
                AVM1MovieClip.prototype.getTabChildren = function () {
                    return this.as3Object.tabChildren;
                };
                AVM1MovieClip.prototype.setTabChildren = function (value) {
                    this.as3Object.tabChildren = value;
                };
                AVM1MovieClip.prototype.getTabEnabled = function () {
                    return this.as3Object.tabEnabled;
                };
                AVM1MovieClip.prototype.setTabEnabled = function (value) {
                    this.as3Object.tabEnabled = value;
                };
                AVM1MovieClip.prototype.getTabIndex = function () {
                    return this.as3Object.tabIndex;
                };
                AVM1MovieClip.prototype.setTabIndex = function (value) {
                    this.as3Object.tabIndex = value;
                };
                AVM1MovieClip.prototype.get_target = function () {
                    var nativeObject = this.as3Object;
                    if (nativeObject === nativeObject.root) {
                        return '/';
                    }
                    var path = '';
                    do {
                        if (Shumway.isNullOrUndefined(nativeObject)) {
                            release || Shumway.Debug.assert(false);
                            return undefined; // something went wrong
                        }
                        path = '/' + nativeObject.name + path;
                        nativeObject = nativeObject.parent;
                    } while (nativeObject !== nativeObject.root);
                    return path;
                };
                AVM1MovieClip.prototype.get_totalframes = function () {
                    return this.as3Object.totalFrames;
                };
                AVM1MovieClip.prototype.getTrackAsMenu = function () {
                    throw 'Not implemented: get$trackAsMenu';
                };
                AVM1MovieClip.prototype.setTrackAsMenu = function (value) {
                    throw 'Not implemented: set$trackAsMenu';
                };
                AVM1MovieClip.prototype.getTransform = function () {
                    throw 'Not implemented: get$transform';
                };
                AVM1MovieClip.prototype.setTransform = function (value) {
                    throw 'Not implemented: set$transform';
                };
                AVM1MovieClip.prototype.toString = function () {
                    return this.__targetPath;
                };
                AVM1MovieClip.prototype.unloadMovie = function () {
                    var nativeObject = this.as3Object;
                    // TODO remove movie clip content
                    var loader = nativeObject.loaderInfo.loader;
                    if (loader.parent) {
                        loader.parent.removeChild(loader);
                    }
                    nativeObject.stop();
                };
                AVM1MovieClip.prototype.get_url = function () {
                    return this.as3Object.loaderInfo.url;
                };
                AVM1MovieClip.prototype.getUseHandCursor = function () {
                    return this.as3Object.useHandCursor;
                };
                AVM1MovieClip.prototype.setUseHandCursor = function (value) {
                    this.as3Object.useHandCursor = value;
                };
                AVM1MovieClip.prototype.get_visible = function () {
                    return this.as3Object.visible;
                };
                AVM1MovieClip.prototype.set_visible = function (value) {
                    this.as3Object.visible = +value !== 0;
                };
                AVM1MovieClip.prototype.get_width = function () {
                    return this.as3Object.width;
                };
                AVM1MovieClip.prototype.set_width = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this.as3Object.width = value;
                };
                AVM1MovieClip.prototype.get_x = function () {
                    return this.as3Object.x;
                };
                AVM1MovieClip.prototype.set_x = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this.as3Object.x = value;
                };
                AVM1MovieClip.prototype.get_xmouse = function () {
                    return this.as3Object.mouseX;
                };
                AVM1MovieClip.prototype.get_xscale = function () {
                    return this.as3Object.scaleX * 100;
                };
                AVM1MovieClip.prototype.set_xscale = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this.as3Object.scaleX = value / 100;
                };
                AVM1MovieClip.prototype.get_y = function () {
                    return this.as3Object.y;
                };
                AVM1MovieClip.prototype.set_y = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this.as3Object.y = value;
                };
                AVM1MovieClip.prototype.get_ymouse = function () {
                    return this.as3Object.mouseY;
                };
                AVM1MovieClip.prototype.get_yscale = function () {
                    return this.as3Object.scaleY * 100;
                };
                AVM1MovieClip.prototype.set_yscale = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this.as3Object.scaleY = value / 100;
                };
                // Special and children names properties resolutions
                AVM1MovieClip.prototype._resolveLevelNProperty = function (name) {
                    if (!this.context.isPropertyCaseSensitive) {
                        name = name.toLowerCase();
                    }
                    if (name === '_root' || name === '_level0') {
                        return this.context.resolveLevel(0);
                    }
                    else if (name.indexOf('_level') === 0) {
                        var level = name.substring(6);
                        var levelNum = level | 0;
                        if (levelNum > 0 && level == levelNum) {
                            return this.context.resolveLevel(levelNum);
                        }
                    }
                    return null;
                };
                AVM1MovieClip.prototype._getCachedPropertyResult = function (value) {
                    if (!this._cachedPropertyResult) {
                        this._cachedPropertyResult = {
                            flags: 64 /* DATA */ | 2 /* DONT_DELETE */ | 1 /* DONT_ENUM */,
                            value: value
                        };
                    }
                    else {
                        this._cachedPropertyResult.value = value;
                    }
                    return this._cachedPropertyResult;
                };
                AVM1MovieClip.prototype.alGetOwnProperty = function (p) {
                    var desc = _super.prototype.alGetOwnProperty.call(this, p);
                    if (desc) {
                        return desc;
                    }
                    var name = AVM1.alToString(this.context, p);
                    if (name[0] === '_') {
                        var level = this._resolveLevelNProperty(name);
                        if (level) {
                            return this._getCachedPropertyResult(level);
                        }
                    }
                    if (this.isAVM1Instance) {
                        var child = this._lookupChildByName(name);
                        if (child) {
                            return this._getCachedPropertyResult(child);
                        }
                    }
                    return undefined;
                };
                AVM1MovieClip.prototype.alGetOwnPropertiesKeys = function () {
                    var keys = _super.prototype.alGetOwnPropertiesKeys.call(this);
                    // if it's a movie listing the children as well
                    if (!this.isAVM1Instance) {
                        return keys; // not initialized yet
                    }
                    var as3MovieClip = this.as3Object;
                    if (as3MovieClip._children.length === 0) {
                        return keys; // no children
                    }
                    var processed = Object.create(null);
                    for (var i = 0; i < keys.length; i++) {
                        processed[keys[i]] = true;
                    }
                    for (var i = 0, length = as3MovieClip._children.length; i < length; i++) {
                        var child = as3MovieClip._children[i];
                        var name = child.name;
                        var normalizedName = name; // TODO something like this._unescapeProperty(this._escapeProperty(name));
                        processed[normalizedName] = true;
                    }
                    return Object.getOwnPropertyNames(processed);
                };
                AVM1MovieClip.prototype.addFrameActionBlocks = function (frameIndex, frameData) {
                    var initActionBlocks = frameData.initActionBlocks;
                    var actionBlocks = frameData.actionBlocks;
                    if (initActionBlocks) {
                        this._addInitActionBlocks(frameIndex, initActionBlocks);
                    }
                    if (actionBlocks) {
                        for (var i = 0; i < actionBlocks.length; i++) {
                            this.addFrameScript(frameIndex, actionBlocks[i]);
                        }
                    }
                };
                AVM1MovieClip.prototype.addFrameScript = function (frameIndex, actionsBlock) {
                    var frameScripts = this._frameScripts;
                    if (!frameScripts) {
                        release || assert(!this._boundExecuteFrameScripts);
                        this._boundExecuteFrameScripts = this._executeFrameScripts.bind(this);
                        frameScripts = this._frameScripts = [];
                    }
                    var scripts = frameScripts[frameIndex + 1];
                    if (!scripts) {
                        scripts = frameScripts[frameIndex + 1] = [];
                        this.as3Object.addFrameScript(frameIndex, this._boundExecuteFrameScripts);
                    }
                    var actionsData = this.context.actionsDataFactory.createActionsData(actionsBlock, 's' + this.as3Object._symbol.id + 'f' + frameIndex + 'i' + scripts.length);
                    scripts.push(actionsData);
                };
                /**
                 * AVM1 InitActionBlocks are executed once, before the children are initialized for a frame.
                 * That matches AS3's enterFrame event, so we can add an event listener that just bails
                 * as long as the target frame isn't reached, and executes the InitActionBlock once it is.
                 *
                 * After that, the listener removes itself.
                 */
                AVM1MovieClip.prototype._addInitActionBlocks = function (frameIndex, actionsBlocks) {
                    var avm2MovieClip = this.as3Object;
                    var self = this;
                    function listener(e) {
                        if (avm2MovieClip.currentFrame !== frameIndex + 1) {
                            return;
                        }
                        avm2MovieClip.removeEventListener('enterFrame', listener);
                        var avm1Context = self.context;
                        for (var i = 0; i < actionsBlocks.length; i++) {
                            var actionsData = avm1Context.actionsDataFactory.createActionsData(actionsBlocks[i].actionsData, 's' + avm2MovieClip._symbol.id + 'f' + frameIndex + 'i' + i);
                            avm1Context.executeActions(actionsData, self);
                        }
                    }
                    avm2MovieClip.addEventListener('enterFrame', listener);
                };
                AVM1MovieClip.prototype._executeFrameScripts = function () {
                    var context = this.context;
                    var scripts = this._frameScripts[this.as3Object.currentFrame];
                    release || assert(scripts && scripts.length);
                    for (var i = 0; i < scripts.length; i++) {
                        var actionsData = scripts[i];
                        context.executeActions(actionsData, this);
                    }
                };
                AVM1MovieClip.prototype._init = function (initObject) {
                    var _this = this;
                    if (initObject instanceof AVM1.AVM1Object) {
                        AVM1.alForEachProperty(initObject, function (name) {
                            _this.alPut(name, initObject.alGet(name));
                        }, null);
                    }
                };
                AVM1MovieClip.prototype._initEventsHandlers = function () {
                    this.bindEvents([
                        new Lib.AVM1EventHandler('onData', 'data'),
                        new Lib.AVM1EventHandler('onDragOut', 'dragOut'),
                        new Lib.AVM1EventHandler('onDragOver', 'dragOver'),
                        new Lib.AVM1EventHandler('onEnterFrame', 'enterFrame'),
                        new Lib.AVM1EventHandler('onKeyDown', 'keyDown'),
                        new Lib.AVM1EventHandler('onKeyUp', 'keyUp'),
                        new Lib.AVM1EventHandler('onKillFocus', 'focusOut', function (e) {
                            return [e.relatedObject];
                        }),
                        new Lib.AVM1EventHandler('onLoad', 'load'),
                        new Lib.AVM1EventHandler('onMouseDown', 'mouseDown'),
                        new Lib.AVM1EventHandler('onMouseUp', 'mouseUp'),
                        new AVM1MovieClipButtonModeEvent('onPress', 'mouseDown'),
                        new AVM1MovieClipButtonModeEvent('onRelease', 'mouseUp'),
                        new AVM1MovieClipButtonModeEvent('onReleaseOutside', 'releaseOutside'),
                        new AVM1MovieClipButtonModeEvent('onRollOut', 'mouseOut'),
                        new AVM1MovieClipButtonModeEvent('onRollOver', 'mouseOver'),
                        new Lib.AVM1EventHandler('onSetFocus', 'focusIn', function (e) {
                            return [e.relatedObject];
                        }),
                        new Lib.AVM1EventHandler('onUnload', 'unload')
                    ]);
                };
                return AVM1MovieClip;
            })(Lib.AVM1SymbolBase);
            Lib.AVM1MovieClip = AVM1MovieClip;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var somewhatImplemented = Shumway.Debug.somewhatImplemented;
            var StateTransitions;
            (function (StateTransitions) {
                StateTransitions[StateTransitions["IdleToOverUp"] = 0x001] = "IdleToOverUp";
                StateTransitions[StateTransitions["OverUpToIdle"] = 0x002] = "OverUpToIdle";
                StateTransitions[StateTransitions["OverUpToOverDown"] = 0x004] = "OverUpToOverDown";
                StateTransitions[StateTransitions["OverDownToOverUp"] = 0x008] = "OverDownToOverUp";
                StateTransitions[StateTransitions["OverDownToOutDown"] = 0x010] = "OverDownToOutDown";
                StateTransitions[StateTransitions["OutDownToOverDown"] = 0x020] = "OutDownToOverDown";
                StateTransitions[StateTransitions["OutDownToIdle"] = 0x040] = "OutDownToIdle";
                StateTransitions[StateTransitions["IdleToOverDown"] = 0x080] = "IdleToOverDown";
                StateTransitions[StateTransitions["OverDownToIdle"] = 0x100] = "OverDownToIdle"; // ???
            })(StateTransitions || (StateTransitions = {}));
            /**
             * Key codes below 32 aren't interpreted as char codes, but are mapped to specific buttons instead.
             * This array uses the key code as the index and KeyboardEvent.keyCode values matching the
             * specific keys as the value.
             * @type {number[]}
             */
            var AVM1KeyCodeMap = [-1, 37, 39, 36, 35, 45, 46, -1, 8, -1, -1, -1, -1, 13, 38, 40, 33, 34, 9, 27];
            var AVM1Button = (function (_super) {
                __extends(AVM1Button, _super);
                function AVM1Button() {
                    _super.apply(this, arguments);
                }
                AVM1Button.createAVM1Class = function (context) {
                    return Lib.wrapAVM1NativeClass(context, true, AVM1Button, [], ['_alpha#', 'blendMode#', 'cacheAsBitmap#', 'enabled#', 'filters#', '_focusrect#', 'getDepth', '_height#', '_highquality#', 'menu#', '_name#', '_parent#', '_quality#', '_rotation#', 'scale9Grid#', '_soundbuftime#', 'tabEnabled#', 'tabIndex#', '_target#', 'trackAsMenu#', '_url#', 'useHandCursor#', '_visible#', '_width#', '_x#', '_xmouse#', '_xscale#', '_y#', '_ymouse#', '_yscale#']);
                };
                AVM1Button.prototype.initAVM1SymbolInstance = function (context, as3Object) {
                    _super.prototype.initAVM1SymbolInstance.call(this, context, as3Object);
                    var nativeButton = this._as3Object;
                    if (!nativeButton._symbol || !nativeButton._symbol.data.buttonActions) {
                        this._initEventsHandlers();
                        return;
                    }
                    nativeButton.buttonMode = true;
                    nativeButton.addEventListener('addedToStage', this._addListeners.bind(this));
                    nativeButton.addEventListener('removedFromStage', this._removeListeners.bind(this));
                    var requiredListeners = this._requiredListeners = Object.create(null);
                    var actions = this._actions = nativeButton._symbol.data.buttonActions;
                    for (var i = 0; i < actions.length; i++) {
                        var action = actions[i];
                        if (!action.actionsBlock) {
                            action.actionsBlock = context.actionsDataFactory.createActionsData(action.actionsData, 's' + nativeButton._symbol.id + 'e' + i);
                        }
                        if (action.keyCode) {
                            requiredListeners['keyDown'] = this._keyDownHandler.bind(this);
                            continue;
                        }
                        var type;
                        switch (action.stateTransitionFlags) {
                            case 64 /* OutDownToIdle */:
                                type = 'releaseOutside';
                                break;
                            case 1 /* IdleToOverUp */:
                                type = 'rollOver';
                                break;
                            case 2 /* OverUpToIdle */:
                                type = 'rollOut';
                                break;
                            case 4 /* OverUpToOverDown */:
                                type = 'mouseDown';
                                break;
                            case 8 /* OverDownToOverUp */:
                                type = 'mouseUp';
                                break;
                            case 16 /* OverDownToOutDown */:
                            case 32 /* OutDownToOverDown */:
                                somewhatImplemented('AVM1 drag over/out button actions');
                                break;
                            case 128 /* IdleToOverDown */:
                            case 256 /* OverDownToIdle */:
                                somewhatImplemented('AVM1 drag trackAsMenu over/out button actions');
                                break;
                            default:
                                console.warn('Unknown AVM1 button action type: ' + action.stateTransitionFlags);
                                continue;
                        }
                        requiredListeners[type] = this._mouseEventHandler.bind(this, action.stateTransitionFlags);
                    }
                    this._initEventsHandlers();
                };
                AVM1Button.prototype.get_alpha = function () {
                    return this._as3Object.alpha;
                };
                AVM1Button.prototype.set_alpha = function (value) {
                    this._as3Object.alpha = value;
                };
                AVM1Button.prototype.getBlendMode = function () {
                    return this._as3Object.blendMode;
                };
                AVM1Button.prototype.setBlendMode = function (value) {
                    this._as3Object.blendMode = value;
                };
                AVM1Button.prototype.getCacheAsBitmap = function () {
                    return this._as3Object.cacheAsBitmap;
                };
                AVM1Button.prototype.setCacheAsBitmap = function (value) {
                    this._as3Object.cacheAsBitmap = value;
                };
                AVM1Button.prototype.getEnabled = function () {
                    return this._as3Object.enabled;
                };
                AVM1Button.prototype.setEnabled = function (value) {
                    this._as3Object.enabled = value;
                };
                AVM1Button.prototype.getFilters = function () {
                    throw 'Not implemented: get$filters';
                };
                AVM1Button.prototype.setFilters = function (value) {
                    throw 'Not implemented: set$filters';
                };
                AVM1Button.prototype.get_focusrect = function () {
                    throw 'Not implemented: get$_focusrect';
                };
                AVM1Button.prototype.set_focusrect = function (value) {
                    throw 'Not implemented: set$_focusrect';
                };
                AVM1Button.prototype.getDepth = function () {
                    return this._as3Object._clipDepth;
                };
                AVM1Button.prototype.get_height = function () {
                    return this._as3Object.height;
                };
                AVM1Button.prototype.set_height = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this._as3Object.height = value;
                };
                AVM1Button.prototype.get_highquality = function () {
                    return 1;
                };
                AVM1Button.prototype.set_highquality = function (value) {
                    // TODO
                };
                AVM1Button.prototype.getMenu = function () {
                    return this._as3Object.contextMenu;
                };
                AVM1Button.prototype.setMenu = function (value) {
                    this._as3Object.contextMenu = value;
                };
                AVM1Button.prototype.get_name = function () {
                    return this._as3Object.contextMenu;
                };
                AVM1Button.prototype.set_name = function (value) {
                    this._as3Object.contextMenu = value;
                };
                AVM1Button.prototype.get_parent = function () {
                    return Lib.getAVM1Object(this._as3Object.parent, this.context);
                };
                AVM1Button.prototype.set_parent = function (value) {
                    throw 'Not implemented: set$_parent';
                };
                AVM1Button.prototype.get_quality = function () {
                    return 'HIGH';
                };
                AVM1Button.prototype.set_quality = function (value) {
                };
                AVM1Button.prototype.get_rotation = function () {
                    return this._as3Object.rotation;
                };
                AVM1Button.prototype.set_rotation = function (value) {
                    this._as3Object.rotation = value;
                };
                AVM1Button.prototype.getScale9Grid = function () {
                    throw 'Not implemented: get$scale9Grid';
                };
                AVM1Button.prototype.setScale9Grid = function (value) {
                    throw 'Not implemented: set$scale9Grid';
                };
                AVM1Button.prototype.get_soundbuftime = function () {
                    throw 'Not implemented: get$_soundbuftime';
                };
                AVM1Button.prototype.set_soundbuftime = function (value) {
                    throw 'Not implemented: set$_soundbuftime';
                };
                AVM1Button.prototype.getTabEnabled = function () {
                    return this._as3Object.tabEnabled;
                };
                AVM1Button.prototype.setTabEnabled = function (value) {
                    this._as3Object.tabEnabled = value;
                };
                AVM1Button.prototype.getTabIndex = function () {
                    return this._as3Object.tabIndex;
                };
                AVM1Button.prototype.setTabIndex = function (value) {
                    this._as3Object.tabIndex = value;
                };
                AVM1Button.prototype.get_target = function () {
                    return Lib.AVM1Utils.getTarget(this);
                };
                AVM1Button.prototype.getTrackAsMenu = function () {
                    throw 'Not implemented: get$trackAsMenu';
                };
                AVM1Button.prototype.setTrackAsMenu = function (value) {
                    throw 'Not implemented: set$trackAsMenu';
                };
                AVM1Button.prototype.get_url = function () {
                    return this._as3Object.loaderInfo.url;
                };
                AVM1Button.prototype.getUseHandCursor = function () {
                    return this._as3Object.useHandCursor;
                };
                AVM1Button.prototype.setUseHandCursor = function (value) {
                    this._as3Object.useHandCursor = value;
                };
                AVM1Button.prototype.get_visible = function () {
                    return this._as3Object.visible;
                };
                AVM1Button.prototype.set_visible = function (value) {
                    this._as3Object.visible = +value !== 0;
                };
                AVM1Button.prototype.get_width = function () {
                    return this._as3Object.width;
                };
                AVM1Button.prototype.set_width = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this._as3Object.width = value;
                };
                AVM1Button.prototype.get_x = function () {
                    return this._as3Object.x;
                };
                AVM1Button.prototype.set_x = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this._as3Object.x = value;
                };
                AVM1Button.prototype.get_xmouse = function () {
                    return this._as3Object.mouseX;
                };
                AVM1Button.prototype.get_xscale = function () {
                    return this._as3Object.scaleX;
                };
                AVM1Button.prototype.set_xscale = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this._as3Object.scaleX = value;
                };
                AVM1Button.prototype.get_y = function () {
                    return this._as3Object.y;
                };
                AVM1Button.prototype.set_y = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this._as3Object.y = value;
                };
                AVM1Button.prototype.get_ymouse = function () {
                    return this._as3Object.mouseY;
                };
                AVM1Button.prototype.get_yscale = function () {
                    return this._as3Object.scaleY;
                };
                AVM1Button.prototype.set_yscale = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this._as3Object.scaleY = value;
                };
                AVM1Button.prototype._addListeners = function () {
                    for (var type in this._requiredListeners) {
                        // on(key) works even if the button doesn't have focus, so we listen on the stage.
                        // TODO: we probably need to filter these events somehow if an AVM1 swf is loaded into
                        // an AVM2 one.
                        var target = type === 'keyDown' ? this._as3Object.stage : this._as3Object;
                        target.addEventListener(type, this._requiredListeners[type]);
                    }
                };
                AVM1Button.prototype._removeListeners = function () {
                    for (var type in this._requiredListeners) {
                        var target = type === 'keyDown' ? this._as3Object.stage : this._as3Object;
                        target.removeEventListener(type, this._requiredListeners[type]);
                    }
                };
                AVM1Button.prototype._keyDownHandler = function (event) {
                    var actions = this._actions;
                    for (var i = 0; i < actions.length; i++) {
                        var action = actions[i];
                        if (!action.keyCode) {
                            continue;
                        }
                        if ((action.keyCode < 32 && AVM1KeyCodeMap[action.keyCode] === event.axGetPublicProperty('keyCode')) || action.keyCode === event.axGetPublicProperty('charCode')) {
                            this._runAction(action);
                        }
                    }
                };
                AVM1Button.prototype._mouseEventHandler = function (type) {
                    var actions = this._actions;
                    for (var i = 0; i < actions.length; i++) {
                        var action = actions[i];
                        if (action.stateTransitionFlags === type) {
                            this._runAction(action);
                        }
                    }
                };
                AVM1Button.prototype._runAction = function (action) {
                    var avm1Context = this._as3Object.loaderInfo._avm1Context;
                    avm1Context.executeActions(action.actionsBlock, Lib.getAVM1Object(this._as3Object._parent, this.context));
                };
                AVM1Button.prototype._initEventsHandlers = function () {
                    this.bindEvents([
                        new Lib.AVM1EventHandler('onDragOut', 'dragOut'),
                        new Lib.AVM1EventHandler('onDragOver', 'dragOver'),
                        new Lib.AVM1EventHandler('onKeyDown', 'keyDown'),
                        new Lib.AVM1EventHandler('onKeyUp', 'keyUp'),
                        new Lib.AVM1EventHandler('onKillFocus', 'focusOut', function (e) {
                            return [e.relatedObject];
                        }),
                        new Lib.AVM1EventHandler('onLoad', 'load'),
                        new Lib.AVM1EventHandler('onMouseDown', 'mouseDown'),
                        new Lib.AVM1EventHandler('onMouseUp', 'mouseUp'),
                        new Lib.AVM1EventHandler('onPress', 'mouseDown'),
                        new Lib.AVM1EventHandler('onRelease', 'mouseUp'),
                        new Lib.AVM1EventHandler('onReleaseOutside', 'releaseOutside'),
                        new Lib.AVM1EventHandler('onRollOut', 'mouseOut'),
                        new Lib.AVM1EventHandler('onRollOver', 'mouseOver'),
                        new Lib.AVM1EventHandler('onSetFocus', 'focusIn', function (e) {
                            return [e.relatedObject];
                        })
                    ]);
                };
                return AVM1Button;
            })(Lib.AVM1SymbolBase);
            Lib.AVM1Button = AVM1Button;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var AVM1TextField = (function (_super) {
                __extends(AVM1TextField, _super);
                function AVM1TextField() {
                    _super.apply(this, arguments);
                }
                AVM1TextField.createAVM1Class = function (context) {
                    return Lib.wrapAVM1NativeClass(context, true, AVM1TextField, [], ['_alpha#', 'antiAliasType#', 'autoSize#', 'background#', 'backgroundColor#', 'border#', 'borderColor#', 'bottomScroll#', 'condenseWhite#', 'embedFonts#', 'filters#', 'getNewTextFormat', 'getTextFormat', 'gridFitType#', '_height#', '_highquality#', 'hscroll#', 'html#', 'htmlText#', 'length#', 'maxChars#', 'maxhscroll#', 'maxscroll#', 'multiline#', '_name#', '_parent#', 'password#', '_quality#', '_rotation#', 'scroll#', 'selectable#', 'setNewTextFormat', 'setTextFormat', '_soundbuftime#', 'tabEnabled#', 'tabIndex#', '_target#', 'text#', 'textColor#', 'textHeight#', 'textWidth#', 'type#', '_url#', '_visible#', '_width#', 'wordWrap#', '_x#', '_xmouse#', '_xscale#', '_y#', '_ymouse#', '_yscale#']);
                };
                AVM1TextField.prototype.initAVM1SymbolInstance = function (context, as3Object) {
                    _super.prototype.initAVM1SymbolInstance.call(this, context, as3Object);
                    this._variable = '';
                    this._exitFrameHandler = null;
                    if (as3Object._symbol) {
                        this.variable = as3Object._symbol.variableName || '';
                    }
                    this._initEventsHandlers();
                };
                AVM1TextField.prototype.get_alpha = function () {
                    return this._as3Object.alpha;
                };
                AVM1TextField.prototype.set_alpha = function (value) {
                    this._as3Object.alpha = value;
                };
                AVM1TextField.prototype.getAntiAliasType = function () {
                    return this._as3Object.antiAliasType;
                };
                AVM1TextField.prototype.setAntiAliasType = function (value) {
                    this._as3Object.antiAliasType = value;
                };
                AVM1TextField.prototype.getAutoSize = function () {
                    return this._as3Object.autoSize;
                };
                AVM1TextField.prototype.setAutoSize = function (value) {
                    // AVM1 treats |true| as "LEFT" and |false| as "NONE".
                    if (value === true) {
                        value = "left";
                    }
                    else if (value === false) {
                        value = "none";
                    }
                    this._as3Object.autoSize = value;
                };
                AVM1TextField.prototype.getBackground = function () {
                    return this._as3Object.background;
                };
                AVM1TextField.prototype.setBackground = function (value) {
                    this._as3Object.background = value;
                };
                AVM1TextField.prototype.getBackgroundColor = function () {
                    return this._as3Object.backgroundColor;
                };
                AVM1TextField.prototype.setBackgroundColor = function (value) {
                    this._as3Object.backgroundColor = value;
                };
                AVM1TextField.prototype.getBorder = function () {
                    return this._as3Object.border;
                };
                AVM1TextField.prototype.setBorder = function (value) {
                    this._as3Object.border = value;
                };
                AVM1TextField.prototype.getBorderColor = function () {
                    return this._as3Object.borderColor;
                };
                AVM1TextField.prototype.setBorderColor = function (value) {
                    this._as3Object.borderColor = value;
                };
                AVM1TextField.prototype.getBottomScroll = function () {
                    return this._as3Object.bottomScrollV;
                };
                AVM1TextField.prototype.getCondenseWhite = function () {
                    return this._as3Object.condenseWhite;
                };
                AVM1TextField.prototype.setCondenseWhite = function (value) {
                    this._as3Object.condenseWhite = value;
                };
                AVM1TextField.prototype.getEmbedFonts = function () {
                    return this._as3Object.embedFonts;
                };
                AVM1TextField.prototype.setEmbedFonts = function (value) {
                    this._as3Object.embedFonts = value;
                };
                AVM1TextField.prototype.getFilters = function () {
                    throw 'Not implemented: get$filters';
                };
                AVM1TextField.prototype.setFilters = function (value) {
                    throw 'Not implemented: get$filters';
                };
                AVM1TextField.prototype.getNewTextFormat = function () {
                    return Lib.AVM1TextFormat.createFromNative(this.context, this._as3Object.defaultTextFormat);
                };
                AVM1TextField.prototype.getTextFormat = function (beginIndex, endIndex) {
                    if (beginIndex === void 0) { beginIndex = -1; }
                    if (endIndex === void 0) { endIndex = -1; }
                    beginIndex = AVM1.alToInteger(this.context, beginIndex);
                    endIndex = AVM1.alToInteger(this.context, endIndex);
                    var as3TextFormat = this._as3Object.getTextFormat(beginIndex, endIndex);
                    return Lib.AVM1TextFormat.createFromNative(this.context, as3TextFormat);
                };
                AVM1TextField.prototype.getGridFitType = function () {
                    throw 'Not implemented: get$gridFitType';
                };
                AVM1TextField.prototype.setGridFitType = function (value) {
                    throw 'Not implemented: get$gridFitType';
                };
                AVM1TextField.prototype.get_height = function () {
                    return this._as3Object.height;
                };
                AVM1TextField.prototype.set_height = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this._as3Object.height = value;
                };
                AVM1TextField.prototype.get_highquality = function () {
                    return 1;
                };
                AVM1TextField.prototype.set_highquality = function (value) {
                };
                AVM1TextField.prototype.getHscroll = function () {
                    return this._as3Object.scrollH;
                };
                AVM1TextField.prototype.setHscroll = function (value) {
                    this._as3Object.scrollH = value;
                };
                AVM1TextField.prototype.getHtml = function () {
                    throw 'Not implemented: get$_html';
                };
                AVM1TextField.prototype.setHtml = function (value) {
                    throw 'Not implemented: set$_html';
                };
                AVM1TextField.prototype.getHtmlText = function () {
                    return this._as3Object.htmlText;
                };
                AVM1TextField.prototype.setHtmlText = function (value) {
                    this._as3Object.htmlText = value;
                };
                AVM1TextField.prototype.getLength = function () {
                    return this._as3Object.length;
                };
                AVM1TextField.prototype.getMaxChars = function () {
                    return this._as3Object.maxChars;
                };
                AVM1TextField.prototype.setMaxChars = function (value) {
                    this._as3Object.maxChars = value;
                };
                AVM1TextField.prototype.getMaxhscroll = function () {
                    return this._as3Object.maxScrollH;
                };
                AVM1TextField.prototype.getMaxscroll = function () {
                    return this._as3Object.maxScrollV;
                };
                AVM1TextField.prototype.getMultiline = function () {
                    return this._as3Object.multiline;
                };
                AVM1TextField.prototype.setMultiline = function (value) {
                    this._as3Object.multiline = value;
                };
                AVM1TextField.prototype.get_name = function () {
                    return this.as3Object._name;
                };
                AVM1TextField.prototype.set_name = function (value) {
                    this.as3Object._name = value;
                };
                AVM1TextField.prototype.get_parent = function () {
                    return this._as3Object.parent;
                };
                AVM1TextField.prototype.set_parent = function (value) {
                    throw 'Not implemented: set$_parent';
                };
                AVM1TextField.prototype.getPassword = function () {
                    return this._as3Object.displayAsPassword;
                };
                AVM1TextField.prototype.setPassword = function (value) {
                    this._as3Object.displayAsPassword = value;
                };
                AVM1TextField.prototype.get_quality = function () {
                    return 'HIGH';
                };
                AVM1TextField.prototype.set_quality = function (value) {
                };
                AVM1TextField.prototype.get_rotation = function () {
                    return this._as3Object.rotation;
                };
                AVM1TextField.prototype.set_rotation = function (value) {
                    this._as3Object.rotation = value;
                };
                AVM1TextField.prototype.getScroll = function () {
                    return this._as3Object.scrollV;
                };
                AVM1TextField.prototype.setScroll = function (value) {
                    this._as3Object.scrollV = value;
                };
                AVM1TextField.prototype.getSelectable = function () {
                    return this._as3Object.selectable;
                };
                AVM1TextField.prototype.setSelectable = function (value) {
                    this._as3Object.selectable = value;
                };
                AVM1TextField.prototype.setNewTextFormat = function (value) {
                    var as3TextFormat;
                    if (value instanceof Lib.AVM1TextFormat) {
                        as3TextFormat = value._as3Object;
                    }
                    this._as3Object.defaultTextFormat = as3TextFormat;
                };
                AVM1TextField.prototype.setTextFormat = function () {
                    var beginIndex = -1, endIndex = -1, tf;
                    switch (arguments.length) {
                        case 0:
                            return;
                        case 1:
                            tf = arguments[0];
                            break;
                        case 2:
                            beginIndex = AVM1.alToNumber(this.context, arguments[0]);
                            tf = arguments[1];
                            break;
                        default:
                            beginIndex = AVM1.alToNumber(this.context, arguments[0]);
                            endIndex = AVM1.alToNumber(this.context, arguments[1]);
                            tf = arguments[2];
                            break;
                    }
                    var as3TextFormat;
                    if (tf instanceof Lib.AVM1TextFormat) {
                        as3TextFormat = tf._as3Object;
                    }
                    this._as3Object.setTextFormat(as3TextFormat, beginIndex, endIndex);
                };
                AVM1TextField.prototype.get_soundbuftime = function () {
                    throw 'Not implemented: get$_soundbuftime';
                };
                AVM1TextField.prototype.set_soundbuftime = function (value) {
                    throw 'Not implemented: set$_soundbuftime';
                };
                AVM1TextField.prototype.getTabEnabled = function () {
                    return this._as3Object.tabEnabled;
                };
                AVM1TextField.prototype.setTabEnabled = function (value) {
                    this._as3Object.tabEnabled = value;
                };
                AVM1TextField.prototype.getTabIndex = function () {
                    return this._as3Object.tabIndex;
                };
                AVM1TextField.prototype.setTabIndex = function (value) {
                    this._as3Object.tabIndex = value;
                };
                AVM1TextField.prototype.get_target = function () {
                    return Lib.AVM1Utils.getTarget(this);
                };
                AVM1TextField.prototype.getText = function () {
                    return this._as3Object.text;
                };
                AVM1TextField.prototype.setText = function (value) {
                    this._as3Object.text = value;
                };
                AVM1TextField.prototype.getTextColor = function () {
                    return this._as3Object.textColor;
                };
                AVM1TextField.prototype.setTextColor = function (value) {
                    this._as3Object.textColor = value;
                };
                AVM1TextField.prototype.getTextHeight = function () {
                    return this._as3Object.textHeight;
                };
                AVM1TextField.prototype.setTextHeight = function (value) {
                    throw 'Not supported: set$textHeight';
                };
                AVM1TextField.prototype.getTextWidth = function () {
                    return this._as3Object.textWidth;
                };
                AVM1TextField.prototype.setTextWidth = function (value) {
                    throw 'Not supported: set$textWidth';
                };
                AVM1TextField.prototype.getType = function () {
                    return this._as3Object.type;
                };
                AVM1TextField.prototype.setType = function (value) {
                    this._as3Object.type = value;
                };
                AVM1TextField.prototype.get_url = function () {
                    return this._as3Object.loaderInfo.url;
                };
                Object.defineProperty(AVM1TextField.prototype, "variable", {
                    get: function () {
                        return this._variable;
                    },
                    set: function (name) {
                        if (name === this._variable) {
                            return;
                        }
                        var instance = this.as3Object;
                        if (this._exitFrameHandler && !name) {
                            instance.removeEventListener('exitFrame', this._exitFrameHandler);
                            this._exitFrameHandler = null;
                        }
                        this._variable = name;
                        if (!this._exitFrameHandler && name) {
                            this._exitFrameHandler = this._onAS3ObjectExitFrame.bind(this);
                            instance.addEventListener('exitFrame', this._exitFrameHandler);
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                AVM1TextField.prototype._onAS3ObjectExitFrame = function () {
                    this._syncTextFieldValue(this.as3Object, this._variable);
                };
                AVM1TextField.prototype._syncTextFieldValue = function (instance, name) {
                    var clip;
                    var hasPath = name.indexOf('.') >= 0 || name.indexOf(':') >= 0;
                    var avm1ContextUtils = this.context.utils;
                    if (hasPath) {
                        var targetPath = name.split(/[.:\/]/g);
                        name = targetPath.pop();
                        if (targetPath[0] == '_root' || targetPath[0] === '') {
                            if (instance.root === null) {
                                return; // text field is not part of the stage yet
                            }
                            clip = Lib.getAVM1Object(instance.root, this.context);
                            targetPath.shift();
                            if (targetPath[0] === '') {
                                targetPath.shift();
                            }
                        }
                        else {
                            clip = Lib.getAVM1Object(instance._parent, this.context);
                        }
                        while (targetPath.length > 0) {
                            var childName = targetPath.shift();
                            clip = avm1ContextUtils.getProperty(clip, childName);
                            if (!clip) {
                                return; // cannot find child clip
                            }
                        }
                    }
                    else {
                        clip = Lib.getAVM1Object(instance._parent, this.context);
                    }
                    if (!clip) {
                        console.warn('Clip ' + name + ' was not found');
                        return;
                    }
                    // Sets default values as defined in SWF if this property was not found.
                    if (!avm1ContextUtils.hasProperty(clip, name)) {
                        avm1ContextUtils.setProperty(clip, name, instance.text);
                    }
                    instance.text = '' + avm1ContextUtils.getProperty(clip, name);
                };
                AVM1TextField.prototype.get_visible = function () {
                    return this._as3Object.visible;
                };
                AVM1TextField.prototype.set_visible = function (value) {
                    this._as3Object.visible = +value !== 0;
                };
                AVM1TextField.prototype.get_width = function () {
                    return this._as3Object.width;
                };
                AVM1TextField.prototype.set_width = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this._as3Object.width = value;
                };
                AVM1TextField.prototype.getWordWrap = function () {
                    return this._as3Object.wordWrap;
                };
                AVM1TextField.prototype.setWordWrap = function (value) {
                    this._as3Object.wordWrap = value;
                };
                AVM1TextField.prototype.get_x = function () {
                    return this._as3Object.x;
                };
                AVM1TextField.prototype.set_x = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this._as3Object.x = value;
                };
                AVM1TextField.prototype.get_xmouse = function () {
                    return this._as3Object.mouseX;
                };
                AVM1TextField.prototype.get_xscale = function () {
                    return this._as3Object.scaleX;
                };
                AVM1TextField.prototype.set_xscale = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this._as3Object.scaleX = value;
                };
                AVM1TextField.prototype.get_y = function () {
                    return this._as3Object.y;
                };
                AVM1TextField.prototype.set_y = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this._as3Object.y = value;
                };
                AVM1TextField.prototype.get_ymouse = function () {
                    return this._as3Object.mouseY;
                };
                AVM1TextField.prototype.get_yscale = function () {
                    return this._as3Object.scaleY;
                };
                AVM1TextField.prototype.set_yscale = function (value) {
                    if (isNaN(value)) {
                        return;
                    }
                    this._as3Object.scaleY = value;
                };
                AVM1TextField.prototype._initEventsHandlers = function () {
                    this.bindEvents([
                        new Lib.AVM1EventHandler('onDragOut', 'dragOut'),
                        new Lib.AVM1EventHandler('onDragOver', 'dragOver'),
                        new Lib.AVM1EventHandler('onKeyDown', 'keyDown'),
                        new Lib.AVM1EventHandler('onKeyUp', 'keyUp'),
                        new Lib.AVM1EventHandler('onKillFocus', 'focusOut', function (e) {
                            return [e.relatedObject];
                        }),
                        new Lib.AVM1EventHandler('onLoad', 'load'),
                        new Lib.AVM1EventHandler('onMouseDown', 'mouseDown'),
                        new Lib.AVM1EventHandler('onMouseUp', 'mouseUp'),
                        new Lib.AVM1EventHandler('onPress', 'mouseDown'),
                        new Lib.AVM1EventHandler('onRelease', 'mouseUp'),
                        new Lib.AVM1EventHandler('onReleaseOutside', 'releaseOutside'),
                        new Lib.AVM1EventHandler('onRollOut', 'mouseOut'),
                        new Lib.AVM1EventHandler('onRollOver', 'mouseOver'),
                        new Lib.AVM1EventHandler('onSetFocus', 'focusIn', function (e) {
                            return [e.relatedObject];
                        })
                    ]);
                };
                return AVM1TextField;
            })(Lib.AVM1SymbolBase);
            Lib.AVM1TextField = AVM1TextField;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var AVM1Color = (function (_super) {
                __extends(AVM1Color, _super);
                function AVM1Color() {
                    _super.apply(this, arguments);
                }
                AVM1Color.createAVM1Class = function (context) {
                    return Lib.wrapAVM1NativeClass(context, true, AVM1Color, [], ['getRGB', 'getTransform', 'setRGB', 'setTransform'], null, AVM1Color.prototype.avm1Constructor);
                };
                AVM1Color.prototype.avm1Constructor = function (target_mc) {
                    this._target = Lib.AVM1Utils.resolveTarget(this.context, target_mc);
                };
                AVM1Color.prototype.getRGB = function () {
                    var transform = AVM1Color.prototype.getTransform.call(this);
                    return transform.alGet('rgb');
                };
                AVM1Color.prototype.getTransform = function () {
                    return Lib.AVM1ColorTransform.fromAS3ColorTransform(this.context, this._target.as3Object.transform.colorTransform);
                };
                AVM1Color.prototype.setRGB = function (offset) {
                    var transform = AVM1Color.prototype.getTransform.call(this);
                    transform.alPut('rgb', offset);
                    AVM1Color.prototype.setTransform.call(this, transform);
                };
                AVM1Color.prototype.setTransform = function (transform) {
                    this._target.as3Object.transform.colorTransform = Lib.toAS3ColorTransform(transform);
                };
                return AVM1Color;
            })(AVM1.AVM1Object);
            Lib.AVM1Color = AVM1Color;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            function defaultTo(v, defaultValue) {
                return v === undefined ? defaultValue : v;
            }
            function toAS3ColorTransform(v) {
                var context = v.context;
                if (!(v instanceof AVM1.AVM1Object)) {
                    return new context.sec.flash.geom.ColorTransform(1, 1, 1, 1, 0, 0, 0, 0);
                }
                return new context.sec.flash.geom.ColorTransform(AVM1.alCoerceNumber(context, defaultTo(v.alGet('redMultiplier'), 1)), AVM1.alCoerceNumber(context, defaultTo(v.alGet('greenMultiplier'), 1)), AVM1.alCoerceNumber(context, defaultTo(v.alGet('blueMultiplier'), 1)), AVM1.alCoerceNumber(context, defaultTo(v.alGet('alphaMultiplier'), 1)), AVM1.alCoerceNumber(context, defaultTo(v.alGet('redOffset'), 0)), AVM1.alCoerceNumber(context, defaultTo(v.alGet('greenOffset'), 0)), AVM1.alCoerceNumber(context, defaultTo(v.alGet('blueOffset'), 0)), AVM1.alCoerceNumber(context, defaultTo(v.alGet('alphaOffset'), 0)));
            }
            Lib.toAS3ColorTransform = toAS3ColorTransform;
            function copyAS3ColorTransform(t, v) {
                v.alPut('redMultiplier', t.redMultiplier);
                v.alPut('greenMultiplier', t.greenMultiplier);
                v.alPut('blueMultiplier', t.blueMultiplier);
                v.alPut('alphaMultiplier', t.alphaMultiplier);
                v.alPut('redOffset', t.redOffset);
                v.alPut('greenOffset', t.greenOffset);
                v.alPut('blueOffset', t.blueOffset);
                v.alPut('alphaOffset', t.alphaOffset);
            }
            Lib.copyAS3ColorTransform = copyAS3ColorTransform;
            var AVM1ColorTransform = (function (_super) {
                __extends(AVM1ColorTransform, _super);
                function AVM1ColorTransform(context, redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier, redOffset, greenOffset, blueOffset, alphaOffset) {
                    if (redMultiplier === void 0) { redMultiplier = 1; }
                    if (greenMultiplier === void 0) { greenMultiplier = 1; }
                    if (blueMultiplier === void 0) { blueMultiplier = 1; }
                    if (alphaMultiplier === void 0) { alphaMultiplier = 1; }
                    if (redOffset === void 0) { redOffset = 0; }
                    if (greenOffset === void 0) { greenOffset = 0; }
                    if (blueOffset === void 0) { blueOffset = 0; }
                    if (alphaOffset === void 0) { alphaOffset = 0; }
                    _super.call(this, context);
                    this.alPrototype = context.globals.alGet('flash').alGet('geom').alGet('ColorTransform').alGetPrototypeProperty();
                    this.alPut('redMultiplier', redMultiplier);
                    this.alPut('greenMultiplier', greenMultiplier);
                    this.alPut('blueMultiplier', blueMultiplier);
                    this.alPut('alphaMultiplier', alphaMultiplier);
                    this.alPut('redOffset', redOffset);
                    this.alPut('greenOffset', greenOffset);
                    this.alPut('blueOffset', blueOffset);
                    this.alPut('alphaOffset', alphaOffset);
                }
                AVM1ColorTransform.fromAS3ColorTransform = function (context, t) {
                    return new AVM1ColorTransform(context, t.redMultiplier, t.greenMultiplier, t.blueMultiplier, t.alphaMultiplier, t.redOffset, t.greenOffset, t.blueOffset, t.alphaOffset);
                };
                return AVM1ColorTransform;
            })(AVM1.AVM1Object);
            Lib.AVM1ColorTransform = AVM1ColorTransform;
            var AVM1ColorTransformFunction = (function (_super) {
                __extends(AVM1ColorTransformFunction, _super);
                function AVM1ColorTransformFunction(context) {
                    _super.call(this, context);
                    AVM1.alDefineObjectProperties(this, {
                        prototype: {
                            value: new AVM1ColorTransformPrototype(context, this)
                        }
                    });
                }
                AVM1ColorTransformFunction.prototype.alConstruct = function (args) {
                    var obj = Object.create(AVM1ColorTransform.prototype);
                    args = args || [];
                    AVM1ColorTransform.apply(obj, [this.context].concat(args));
                    return obj;
                };
                return AVM1ColorTransformFunction;
            })(AVM1.AVM1Function);
            Lib.AVM1ColorTransformFunction = AVM1ColorTransformFunction;
            var AVM1ColorTransformPrototype = (function (_super) {
                __extends(AVM1ColorTransformPrototype, _super);
                function AVM1ColorTransformPrototype(context, fn) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                    AVM1.alDefineObjectProperties(this, {
                        constructor: {
                            value: fn,
                            writable: true
                        },
                        rgb: {
                            get: this.getRgb,
                            set: this.setRgb
                        },
                        concat: {
                            value: this.concat,
                            writable: true
                        },
                        toString: {
                            value: this._toString,
                            writable: true
                        }
                    });
                }
                AVM1ColorTransformPrototype.prototype.getRgb = function () {
                    return toAS3ColorTransform(this).color;
                };
                AVM1ColorTransformPrototype.prototype.setRgb = function (rgb) {
                    var t = toAS3ColorTransform(this);
                    t.color = AVM1.alToInt32(this.context, rgb);
                    copyAS3ColorTransform(t, this);
                };
                AVM1ColorTransformPrototype.prototype.concat = function (second) {
                    var t = toAS3ColorTransform(this);
                    t.concat(toAS3ColorTransform(second));
                    copyAS3ColorTransform(t, this);
                };
                AVM1ColorTransformPrototype.prototype._toString = function () {
                    return toAS3ColorTransform(this).toString();
                };
                return AVM1ColorTransformPrototype;
            })(AVM1.AVM1Object);
            Lib.AVM1ColorTransformPrototype = AVM1ColorTransformPrototype;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            function toAS3Matrix(v) {
                var context = v.context;
                var a, b, c, d, tx, ty;
                if (v instanceof AVM1.AVM1Object) {
                    a = AVM1.alCoerceNumber(context, v.alGet('a'));
                    b = AVM1.alCoerceNumber(context, v.alGet('b'));
                    c = AVM1.alCoerceNumber(context, v.alGet('c'));
                    d = AVM1.alCoerceNumber(context, v.alGet('d'));
                    tx = AVM1.alCoerceNumber(context, v.alGet('tx'));
                    ty = AVM1.alCoerceNumber(context, v.alGet('ty'));
                }
                return new context.sec.flash.geom.Matrix(a, b, c, d, tx, ty);
            }
            Lib.toAS3Matrix = toAS3Matrix;
            function copyAS3MatrixTo(m, v) {
                v.alPut('a', m.a);
                v.alPut('b', m.b);
                v.alPut('c', m.c);
                v.alPut('d', m.d);
                v.alPut('tx', m.tx);
                v.alPut('ty', m.ty);
            }
            Lib.copyAS3MatrixTo = copyAS3MatrixTo;
            var AVM1Matrix = (function (_super) {
                __extends(AVM1Matrix, _super);
                function AVM1Matrix(context, a, b, c, d, tx, ty) {
                    if (a === void 0) { a = 1; }
                    if (b === void 0) { b = 0; }
                    if (c === void 0) { c = 0; }
                    if (d === void 0) { d = 1; }
                    if (tx === void 0) { tx = 0; }
                    if (ty === void 0) { ty = 0; }
                    _super.call(this, context);
                    this.alPrototype = context.globals.alGet('flash').alGet('geom').alGet('Matrix').alGetPrototypeProperty();
                    this.alPut('a', a);
                    this.alPut('b', b);
                    this.alPut('c', c);
                    this.alPut('d', d);
                    this.alPut('tx', tx);
                    this.alPut('ty', ty);
                }
                AVM1Matrix.fromAS3Matrix = function (context, m) {
                    return new AVM1Matrix(context, m.a, m.b, m.c, m.d, m.tx, m.ty);
                };
                return AVM1Matrix;
            })(AVM1.AVM1Object);
            Lib.AVM1Matrix = AVM1Matrix;
            var AVM1MatrixFunction = (function (_super) {
                __extends(AVM1MatrixFunction, _super);
                function AVM1MatrixFunction(context) {
                    _super.call(this, context);
                    AVM1.alDefineObjectProperties(this, {
                        prototype: {
                            value: new AVM1MatrixPrototype(context, this)
                        }
                    });
                }
                AVM1MatrixFunction.prototype.alConstruct = function (args) {
                    if (args && args.length > 0) {
                        return new AVM1Matrix(this.context, args[0], args[1], args[2], args[3], args[4], args[5]);
                    }
                    else {
                        return new AVM1Matrix(this.context);
                    }
                };
                return AVM1MatrixFunction;
            })(AVM1.AVM1Function);
            Lib.AVM1MatrixFunction = AVM1MatrixFunction;
            var AVM1MatrixPrototype = (function (_super) {
                __extends(AVM1MatrixPrototype, _super);
                function AVM1MatrixPrototype(context, fn) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                    AVM1.alDefineObjectProperties(this, {
                        constructor: {
                            value: fn,
                            writable: true
                        },
                        clone: {
                            value: this.clone,
                            writable: true
                        },
                        concat: {
                            value: this.concat,
                            writable: true
                        },
                        createBox: {
                            value: this.createBox,
                            writable: true
                        },
                        createGradientBox: {
                            value: this.createGradientBox,
                            writable: true
                        },
                        deltaTransformPoint: {
                            value: this.deltaTransformPoint,
                            writable: true
                        },
                        identity: {
                            value: this.identity,
                            writable: true
                        },
                        invert: {
                            value: this.invert,
                            writable: true
                        },
                        rotate: {
                            value: this.rotate,
                            writable: true
                        },
                        scale: {
                            value: this.scale,
                            writable: true
                        },
                        toString: {
                            value: this._toString,
                            writable: true
                        },
                        transformPoint: {
                            value: this.transformPoint,
                            writable: true
                        },
                        translate: {
                            value: this.translate,
                            writable: true
                        }
                    });
                }
                AVM1MatrixPrototype.prototype.clone = function () {
                    var result = new AVM1Matrix(this.context);
                    if (this instanceof AVM1.AVM1Object) {
                        result.alPut('a', this.alGet('a'));
                        result.alPut('b', this.alGet('b'));
                        result.alPut('c', this.alGet('c'));
                        result.alPut('d', this.alGet('d'));
                        result.alPut('tx', this.alGet('tx'));
                        result.alPut('ty', this.alGet('ty'));
                    }
                    return result;
                };
                AVM1MatrixPrototype.prototype.concat = function (other) {
                    var m = toAS3Matrix(this), m2 = toAS3Matrix(other);
                    m.concat(m2);
                    copyAS3MatrixTo(m, this);
                };
                AVM1MatrixPrototype.prototype.createBox = function (scaleX, scaleY, rotation, tx, ty) {
                    if (rotation === void 0) { rotation = 0; }
                    if (tx === void 0) { tx = 0; }
                    if (ty === void 0) { ty = 0; }
                    scaleX = AVM1.alCoerceNumber(this.context, scaleX);
                    scaleY = AVM1.alCoerceNumber(this.context, scaleY);
                    rotation = AVM1.alCoerceNumber(this.context, rotation);
                    tx = AVM1.alCoerceNumber(this.context, tx);
                    ty = AVM1.alCoerceNumber(this.context, ty);
                    var m = toAS3Matrix(this);
                    m.createBox(scaleX, scaleY, rotation, tx, ty);
                    copyAS3MatrixTo(m, this);
                };
                AVM1MatrixPrototype.prototype.createGradientBox = function (width, height, rotation, tx, ty) {
                    if (rotation === void 0) { rotation = 0; }
                    if (tx === void 0) { tx = 0; }
                    if (ty === void 0) { ty = 0; }
                    width = AVM1.alCoerceNumber(this.context, width);
                    height = AVM1.alCoerceNumber(this.context, height);
                    rotation = AVM1.alCoerceNumber(this.context, rotation);
                    tx = AVM1.alCoerceNumber(this.context, tx);
                    ty = AVM1.alCoerceNumber(this.context, ty);
                    var m = toAS3Matrix(this);
                    m.createGradientBox(width, height, rotation, tx, ty);
                    copyAS3MatrixTo(m, this);
                };
                AVM1MatrixPrototype.prototype.deltaTransformPoint = function (pt) {
                    var p = Lib.toAS3Point(pt);
                    var m = toAS3Matrix(this);
                    return Lib.AVM1Point.fromAS3Point(this.context, m.deltaTransformPoint(p));
                };
                AVM1MatrixPrototype.prototype.identity = function () {
                    this.alPut('a', 1);
                    this.alPut('b', 0);
                    this.alPut('c', 0);
                    this.alPut('d', 1);
                    this.alPut('tx', 0);
                    this.alPut('ty', 0);
                };
                AVM1MatrixPrototype.prototype.invert = function () {
                    var m = toAS3Matrix(this);
                    m.invert();
                    copyAS3MatrixTo(m, this);
                };
                AVM1MatrixPrototype.prototype.rotate = function (angle) {
                    angle = AVM1.alCoerceNumber(this.context, angle);
                    var m = toAS3Matrix(this);
                    m.rotate(angle);
                    copyAS3MatrixTo(m, this);
                };
                AVM1MatrixPrototype.prototype.scale = function (sx, sy) {
                    sx = AVM1.alCoerceNumber(this.context, sx);
                    sy = AVM1.alCoerceNumber(this.context, sy);
                    var m = toAS3Matrix(this);
                    m.scale(sx, sy);
                    copyAS3MatrixTo(m, this);
                };
                AVM1MatrixPrototype.prototype._toString = function () {
                    return toAS3Matrix(this).toString();
                };
                AVM1MatrixPrototype.prototype.transformPoint = function (pt) {
                    var p = Lib.toAS3Point(pt);
                    var m = toAS3Matrix(this);
                    return Lib.AVM1Point.fromAS3Point(this.context, m.transformPoint(p));
                };
                AVM1MatrixPrototype.prototype.translate = function (tx, ty) {
                    tx = AVM1.alCoerceNumber(this.context, tx);
                    ty = AVM1.alCoerceNumber(this.context, ty);
                    var m = toAS3Matrix(this);
                    m.translate(tx, ty);
                    copyAS3MatrixTo(m, this);
                };
                return AVM1MatrixPrototype;
            })(AVM1.AVM1Object);
            Lib.AVM1MatrixPrototype = AVM1MatrixPrototype;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            function toAS3Point(v) {
                var context = v.context;
                var x, y;
                if (v instanceof AVM1.AVM1Object) {
                    x = AVM1.alCoerceNumber(context, v.alGet('x'));
                    y = AVM1.alCoerceNumber(context, v.alGet('y'));
                }
                return new context.sec.flash.geom.Point(x, y);
            }
            Lib.toAS3Point = toAS3Point;
            function copyAS3PointTo(p, v) {
                v.alPut('x', p.x);
                v.alPut('y', p.y);
            }
            Lib.copyAS3PointTo = copyAS3PointTo;
            var AVM1Point = (function (_super) {
                __extends(AVM1Point, _super);
                function AVM1Point(context, x, y) {
                    _super.call(this, context);
                    this.alPrototype = context.globals.alGet('flash').alGet('geom').alGet('Point').alGetPrototypeProperty();
                    this.alPut('x', x);
                    this.alPut('y', y);
                }
                AVM1Point.fromAS3Point = function (context, p) {
                    return new AVM1Point(context, p.x, p.y);
                };
                return AVM1Point;
            })(AVM1.AVM1Object);
            Lib.AVM1Point = AVM1Point;
            var AVM1PointFunction = (function (_super) {
                __extends(AVM1PointFunction, _super);
                function AVM1PointFunction(context) {
                    _super.call(this, context);
                    AVM1.alDefineObjectProperties(this, {
                        prototype: {
                            value: new AVM1PointPrototype(context, this)
                        },
                        distance: {
                            value: this.distance,
                            writable: true
                        },
                        interpolate: {
                            value: this.interpolate,
                            writable: true
                        },
                        polar: {
                            value: this.polar,
                            writable: true
                        }
                    });
                }
                AVM1PointFunction.prototype.alConstruct = function (args) {
                    if (args && args.length > 0) {
                        return new AVM1Point(this.context, args[0], args[1]);
                    }
                    else {
                        return new AVM1Point(this.context, 0, 0);
                    }
                };
                AVM1PointFunction.prototype.distance = function (pt1, pt2) {
                    return this.context.sec.flash.geom.Point.axClass.distance(toAS3Point(pt1), toAS3Point(pt2));
                };
                AVM1PointFunction.prototype.interpolate = function (pt1, pt2, f) {
                    f = AVM1.alToNumber(this.context, f);
                    var p = this.context.sec.flash.geom.Point.axClass.interpolate(toAS3Point(pt1), toAS3Point(pt2), f);
                    return AVM1Point.fromAS3Point(this.context, p);
                };
                AVM1PointFunction.prototype.polar = function (len, angle) {
                    len = AVM1.alToNumber(this.context, len);
                    angle = AVM1.alToNumber(this.context, angle);
                    return AVM1Point.fromAS3Point(this.context, this.context.sec.flash.geom.Point.axClass.polar(len, angle));
                };
                return AVM1PointFunction;
            })(AVM1.AVM1Function);
            Lib.AVM1PointFunction = AVM1PointFunction;
            var AVM1PointPrototype = (function (_super) {
                __extends(AVM1PointPrototype, _super);
                function AVM1PointPrototype(context, fn) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                    AVM1.alDefineObjectProperties(this, {
                        constructor: {
                            value: fn,
                            writable: true
                        },
                        length: {
                            get: this.getLength
                        },
                        add: {
                            value: this.add,
                            writable: true
                        },
                        clone: {
                            value: this.clone,
                            writable: true
                        },
                        equals: {
                            value: this.equals,
                            writable: true
                        },
                        normalize: {
                            value: this.normalize,
                            writable: true
                        },
                        offset: {
                            value: this.offset,
                            writable: true
                        },
                        subtract: {
                            value: this.subtract,
                            writable: true
                        },
                        toString: {
                            value: this._toString,
                            writable: true
                        }
                    });
                }
                AVM1PointPrototype.prototype.getLength = function () {
                    return toAS3Point(this).length;
                };
                AVM1PointPrototype.prototype.add = function (v) {
                    return AVM1Point.fromAS3Point(this.context, toAS3Point(this).add(toAS3Point(v)));
                };
                AVM1PointPrototype.prototype.clone = function () {
                    var result = new AVM1Point(this.context);
                    if (this instanceof AVM1.AVM1Object) {
                        result.alPut('x', this.alGet('x'));
                        result.alPut('y', this.alGet('y'));
                    }
                    return result;
                };
                AVM1PointPrototype.prototype.equals = function (toCompare) {
                    return toAS3Point(this).equals(toAS3Point(toCompare));
                };
                AVM1PointPrototype.prototype.normalize = function (length) {
                    length = AVM1.alToNumber(this.context, length);
                    var p = toAS3Point(this);
                    p.normalize(length);
                    copyAS3PointTo(p, this);
                };
                AVM1PointPrototype.prototype.offset = function (dx, dy) {
                    dx = AVM1.alToNumber(this.context, dx);
                    dy = AVM1.alToNumber(this.context, dy);
                    var p = toAS3Point(this);
                    p.offset(dx, dy);
                    copyAS3PointTo(p, this);
                };
                AVM1PointPrototype.prototype.subtract = function (v) {
                    return AVM1Point.fromAS3Point(this.context, toAS3Point(this).subtract(toAS3Point(v)));
                };
                AVM1PointPrototype.prototype._toString = function () {
                    return '(x=' + this.alGet('x') + ', y=' + this.alGet('y') + ')';
                };
                return AVM1PointPrototype;
            })(AVM1.AVM1Object);
            Lib.AVM1PointPrototype = AVM1PointPrototype;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            function toAS3Rectangle(v) {
                var context = v.context;
                var x, y, width, height;
                if (v instanceof AVM1.AVM1Object) {
                    x = AVM1.alCoerceNumber(context, v.alGet('x'));
                    y = AVM1.alCoerceNumber(context, v.alGet('y'));
                    width = AVM1.alCoerceNumber(context, v.alGet('width'));
                    height = AVM1.alCoerceNumber(context, v.alGet('height'));
                }
                return new context.sec.flash.geom.Rectangle(x, y, width, height);
            }
            Lib.toAS3Rectangle = toAS3Rectangle;
            function copyAS3RectangleTo(r, v) {
                v.alPut('x', r.x);
                v.alPut('y', r.y);
                v.alPut('width', r.width);
                v.alPut('height', r.height);
            }
            Lib.copyAS3RectangleTo = copyAS3RectangleTo;
            var AVM1Rectangle = (function (_super) {
                __extends(AVM1Rectangle, _super);
                function AVM1Rectangle(context, x, y, width, height) {
                    _super.call(this, context);
                    this.alPrototype = context.globals.alGet('flash').alGet('geom').alGet('Rectangle').alGetPrototypeProperty();
                    this.alPut('x', x);
                    this.alPut('y', y);
                    this.alPut('width', x);
                    this.alPut('height', y);
                }
                AVM1Rectangle.fromAS3Rectangle = function (context, r) {
                    return new AVM1Rectangle(context, r.x, r.y, r.width, r.height);
                };
                return AVM1Rectangle;
            })(AVM1.AVM1Object);
            Lib.AVM1Rectangle = AVM1Rectangle;
            var AVM1RectangleFunction = (function (_super) {
                __extends(AVM1RectangleFunction, _super);
                function AVM1RectangleFunction(context) {
                    _super.call(this, context);
                    AVM1.alDefineObjectProperties(this, {
                        prototype: {
                            value: new AVM1RectanglePrototype(context, this)
                        }
                    });
                }
                AVM1RectangleFunction.prototype.alConstruct = function (args) {
                    if (args && args.length > 0) {
                        return new AVM1Rectangle(this.context, args[0], args[1], args[2], args[3]);
                    }
                    else {
                        return new AVM1Rectangle(this.context, 0, 0, 0, 0);
                    }
                };
                return AVM1RectangleFunction;
            })(AVM1.AVM1Function);
            Lib.AVM1RectangleFunction = AVM1RectangleFunction;
            var AVM1RectanglePrototype = (function (_super) {
                __extends(AVM1RectanglePrototype, _super);
                function AVM1RectanglePrototype(context, fn) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                    AVM1.alDefineObjectProperties(this, {
                        constructor: {
                            value: fn,
                            writable: true
                        },
                        bottom: {
                            get: this.getBottom,
                            set: this.setBottom
                        },
                        bottomRight: {
                            get: this.getBottomRight,
                            set: this.setBottomRight
                        },
                        left: {
                            get: this.getLeft,
                            set: this.setLeft
                        },
                        right: {
                            get: this.getRight,
                            set: this.setRight
                        },
                        size: {
                            get: this.getSize,
                            set: this.setSize
                        },
                        top: {
                            get: this.getTop,
                            set: this.setTop
                        },
                        topLeft: {
                            get: this.getTopLeft,
                            set: this.setTopLeft
                        },
                        clone: {
                            value: this.clone,
                            writable: true
                        },
                        contains: {
                            value: this.contains,
                            writable: true
                        },
                        containsPoint: {
                            value: this.containsPoint,
                            writable: true
                        },
                        containsRectangle: {
                            value: this.containsRectangle,
                            writable: true
                        },
                        equals: {
                            value: this.equals,
                            writable: true
                        },
                        inflate: {
                            value: this.inflate,
                            writable: true
                        },
                        inflatePoint: {
                            value: this.inflatePoint,
                            writable: true
                        },
                        intersection: {
                            value: this.intersection,
                            writable: true
                        },
                        intersects: {
                            value: this.intersects,
                            writable: true
                        },
                        isEmpty: {
                            value: this.isEmpty,
                            writable: true
                        },
                        offset: {
                            value: this.offset,
                            writable: true
                        },
                        offsetPoint: {
                            value: this.offsetPoint,
                            writable: true
                        },
                        setEmpty: {
                            value: this.setEmpty,
                            writable: true
                        },
                        toString: {
                            value: this._toString,
                            writable: true
                        },
                        union: {
                            value: this.union,
                            writable: true
                        }
                    });
                }
                AVM1RectanglePrototype.prototype.getBottom = function () {
                    return AVM1.alToNumber(this.context, this.alGet('y')) + AVM1.alToNumber(this.context, this.alGet('height'));
                };
                AVM1RectanglePrototype.prototype.setBottom = function (value) {
                    this.alPut('height', AVM1.alToNumber(this.context, value) - AVM1.alToNumber(this.context, this.alGet('y')));
                };
                AVM1RectanglePrototype.prototype.getBottomRight = function () {
                    return new Lib.AVM1Point(this.context, AVM1RectanglePrototype.prototype.getRight.call(this), AVM1RectanglePrototype.prototype.getBottom.call(this));
                };
                AVM1RectanglePrototype.prototype.setBottomRight = function (pt) {
                    AVM1RectanglePrototype.prototype.setRight.call(this, pt.alGet('x'));
                    AVM1RectanglePrototype.prototype.setBottom.call(this, pt.alGet('y'));
                };
                AVM1RectanglePrototype.prototype.getLeft = function () {
                    return AVM1.alToNumber(this.context, this.alGet('x'));
                };
                AVM1RectanglePrototype.prototype.setLeft = function (value) {
                    this.alPut('x', AVM1.alToNumber(this.context, value));
                };
                AVM1RectanglePrototype.prototype.getSize = function () {
                    return new Lib.AVM1Point(this.context, this.alGet('width'), this.alGet('height'));
                };
                AVM1RectanglePrototype.prototype.setSize = function (pt) {
                    this.alPut('width', pt.alGet('x'));
                    this.alPut('height', pt.alGet('y'));
                };
                AVM1RectanglePrototype.prototype.getRight = function () {
                    return AVM1.alToNumber(this.context, this.alGet('x')) + AVM1.alToNumber(this.context, this.alGet('width'));
                };
                AVM1RectanglePrototype.prototype.setRight = function (value) {
                    this.alPut('width', AVM1.alToNumber(this.context, value) - AVM1.alToNumber(this.context, this.alGet('x')));
                };
                AVM1RectanglePrototype.prototype.getTop = function () {
                    return AVM1.alToNumber(this.context, this.alGet('y'));
                };
                AVM1RectanglePrototype.prototype.setTop = function (value) {
                    this.alPut('y', AVM1.alToNumber(this.context, value));
                };
                AVM1RectanglePrototype.prototype.getTopLeft = function () {
                    return new Lib.AVM1Point(this.context, AVM1RectanglePrototype.prototype.getLeft.call(this), AVM1RectanglePrototype.prototype.getTop.call(this));
                };
                AVM1RectanglePrototype.prototype.setTopLeft = function (pt) {
                    AVM1RectanglePrototype.prototype.setLeft.call(this, pt.alGet('x'));
                    AVM1RectanglePrototype.prototype.setTop.call(this, pt.alGet('y'));
                };
                AVM1RectanglePrototype.prototype.clone = function () {
                    var result = new AVM1Rectangle(this.context);
                    if (this instanceof AVM1.AVM1Object) {
                        result.alPut('x', this.alGet('x'));
                        result.alPut('y', this.alGet('y'));
                        result.alPut('width', this.alGet('width'));
                        result.alPut('height', this.alGet('height'));
                    }
                    return result;
                };
                AVM1RectanglePrototype.prototype.contains = function (x, y) {
                    x = AVM1.alToNumber(this.context, x);
                    y = AVM1.alToNumber(this.context, y);
                    var r = toAS3Rectangle(this);
                    return r.contains(x, y);
                };
                AVM1RectanglePrototype.prototype.containsPoint = function (pt) {
                    var r = toAS3Rectangle(this), p = Lib.toAS3Point(pt);
                    return r.containsPoint(p);
                };
                AVM1RectanglePrototype.prototype.containsRectangle = function (rect) {
                    var r = toAS3Rectangle(this), other = toAS3Rectangle(rect);
                    return r.containsRect(other);
                };
                AVM1RectanglePrototype.prototype.equals = function (toCompare) {
                    var r = toAS3Rectangle(this), other = toAS3Rectangle(toCompare);
                    return r.equals(other);
                };
                AVM1RectanglePrototype.prototype.inflate = function (dx, dy) {
                    dx = AVM1.alToNumber(this.context, dx);
                    dy = AVM1.alToNumber(this.context, dy);
                    var r = toAS3Rectangle(this);
                    r.inflate(dx, dy);
                    copyAS3RectangleTo(r, this);
                };
                AVM1RectanglePrototype.prototype.inflatePoint = function (pt) {
                    var r = toAS3Rectangle(this), p = Lib.toAS3Point(pt);
                    r.inflatePoint(p);
                    copyAS3RectangleTo(r, this);
                };
                AVM1RectanglePrototype.prototype.intersection = function (toIntersect) {
                    var r = toAS3Rectangle(this), other = toAS3Rectangle(toIntersect);
                    return AVM1Rectangle.fromAS3Rectangle(this.context, r.intersection(other));
                };
                AVM1RectanglePrototype.prototype.intersects = function (toIntersect) {
                    var r = toAS3Rectangle(this), other = toAS3Rectangle(toIntersect);
                    return r.intersects(other);
                };
                AVM1RectanglePrototype.prototype.isEmpty = function () {
                    return toAS3Rectangle(this).isEmpty();
                };
                AVM1RectanglePrototype.prototype.offset = function (dx, dy) {
                    dx = AVM1.alToNumber(this.context, dx);
                    dy = AVM1.alToNumber(this.context, dy);
                    var r = toAS3Rectangle(this);
                    r.offset(dx, dy);
                    copyAS3RectangleTo(r, this);
                };
                AVM1RectanglePrototype.prototype.offsetPoint = function (pt) {
                    var r = toAS3Rectangle(this), p = Lib.toAS3Point(pt);
                    r.offsetPoint(p);
                    copyAS3RectangleTo(r, this);
                };
                AVM1RectanglePrototype.prototype.setEmpty = function () {
                    this.alPut('x', 0);
                    this.alPut('y', 0);
                    this.alPut('width', 0);
                    this.alPut('height', 0);
                };
                AVM1RectanglePrototype.prototype._toString = function () {
                    return '(x=' + this.alGet('x') + ', y=' + this.alGet('y') + ', width=' + this.alGet('width') + ', height=' + this.alGet('height') + ')';
                };
                AVM1RectanglePrototype.prototype.union = function (toUnion) {
                    var r = toAS3Rectangle(this), other = toAS3Rectangle(toUnion);
                    return AVM1Rectangle.fromAS3Rectangle(this.context, r.union(other));
                };
                return AVM1RectanglePrototype;
            })(AVM1.AVM1Object);
            Lib.AVM1RectanglePrototype = AVM1RectanglePrototype;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var AVM1Transform = (function (_super) {
                __extends(AVM1Transform, _super);
                function AVM1Transform() {
                    _super.apply(this, arguments);
                }
                AVM1Transform.createAVM1Class = function (context) {
                    return Lib.wrapAVM1NativeClass(context, true, AVM1Transform, [], ['matrix#', 'concatenatedMatrix#', 'colorTransform#', 'pixelBounds#'], null, AVM1Transform.prototype.avm1Constructor);
                };
                AVM1Transform.prototype.avm1Constructor = function (target_mc) {
                    this._target = Lib.AVM1Utils.resolveTarget(this.context, target_mc);
                };
                AVM1Transform.prototype.getMatrix = function () {
                    var transform = this._target.as3Object.transform;
                    return Lib.AVM1Matrix.fromAS3Matrix(this.context, transform.matrix);
                };
                AVM1Transform.prototype.setMatrix = function (value) {
                    var transform = this._target.as3Object.transform;
                    transform.matrix = Lib.toAS3Matrix(value);
                };
                AVM1Transform.prototype.getConcatenatedMatrix = function () {
                    var transform = this._target.as3Object.transform;
                    return Lib.AVM1Matrix.fromAS3Matrix(this.context, transform.concatenatedMatrix);
                };
                AVM1Transform.prototype.getColorTransform = function () {
                    var transform = this._target.as3Object.transform;
                    return Lib.AVM1ColorTransform.fromAS3ColorTransform(this.context, transform.colorTransform);
                };
                AVM1Transform.prototype.setColorTransform = function (value) {
                    var transform = this._target.as3Object.transform;
                    transform.colorTransform = Lib.toAS3ColorTransform(value);
                };
                AVM1Transform.prototype.getPixelBounds = function () {
                    var transform = this._target.as3Object.transform;
                    return Lib.AVM1Rectangle.fromAS3Rectangle(this.context, transform.pixelBounds);
                };
                return AVM1Transform;
            })(AVM1.AVM1Object);
            Lib.AVM1Transform = AVM1Transform;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var AVM1TextFormat = (function (_super) {
                __extends(AVM1TextFormat, _super);
                function AVM1TextFormat() {
                    _super.apply(this, arguments);
                }
                AVM1TextFormat.createAVM1Class = function (context) {
                    return Lib.wrapAVM1NativeClass(context, true, AVM1TextFormat, [], ['align#', 'blockIndent#', 'bold#', 'bullet#', 'color#', 'font#', 'getTextExtent', 'indent#', 'italic#', 'kerning#', 'leading#', 'leftMargin#', 'letterSpacing#', 'rightMargin#', 'size#', 'tabStops#', 'target#', 'underline#', 'url#'], null, AVM1TextFormat.prototype.avm1Constructor);
                };
                AVM1TextFormat.createFromNative = function (context, as3Object) {
                    var TextFormat = context.globals.TextFormat;
                    var obj = new AVM1TextFormat(context);
                    obj.alPrototype = TextFormat.alGetPrototypeProperty();
                    obj._as3Object = as3Object;
                    return obj;
                };
                AVM1TextFormat.prototype.avm1Constructor = function (font, size, color, bold, italic, underline, url, target, align, leftMargin, rightMargin, indent, leading) {
                    var context = this.context;
                    font = Shumway.isNullOrUndefined(font) ? null : AVM1.alToString(context, font);
                    size = Shumway.isNullOrUndefined(size) ? null : AVM1.alToNumber(context, size);
                    color = Shumway.isNullOrUndefined(color) ? null : AVM1.alToNumber(context, color);
                    bold = Shumway.isNullOrUndefined(bold) ? null : AVM1.alToBoolean(context, bold);
                    italic = Shumway.isNullOrUndefined(italic) ? null : AVM1.alToBoolean(context, italic);
                    underline = Shumway.isNullOrUndefined(underline) ? null : AVM1.alToBoolean(context, underline);
                    url = Shumway.isNullOrUndefined(url) ? null : AVM1.alToString(context, url);
                    target = Shumway.isNullOrUndefined(target) ? null : AVM1.alToString(context, target);
                    align = Shumway.isNullOrUndefined(align) ? null : AVM1.alToString(context, align);
                    leftMargin = Shumway.isNullOrUndefined(leftMargin) ? null : AVM1.alToNumber(context, leftMargin);
                    rightMargin = Shumway.isNullOrUndefined(rightMargin) ? null : AVM1.alToNumber(context, rightMargin);
                    indent = Shumway.isNullOrUndefined(indent) ? null : AVM1.alToNumber(context, indent);
                    leading = Shumway.isNullOrUndefined(leading) ? null : AVM1.alToNumber(context, leading);
                    var as3Object = new this.context.sec.flash.text.TextFormat(font, size, color, bold, italic, underline, url, target, align, leftMargin, rightMargin, indent, leading);
                    this._as3Object = as3Object;
                };
                AVM1TextFormat.alInitStatic = function (context) {
                    // See _measureTextField usage in the getTextExtent() below.
                    var measureTextField = new context.sec.flash.text.TextField();
                    measureTextField.multiline = true;
                    this._measureTextField = measureTextField;
                };
                AVM1TextFormat.prototype.getAlign = function () {
                    return this._as3Object.align;
                };
                AVM1TextFormat.prototype.setAlign = function (value) {
                    this._as3Object.align = AVM1.alToString(this.context, value);
                };
                AVM1TextFormat.prototype.getBlockIndent = function () {
                    return this._as3Object.blockIndent;
                };
                AVM1TextFormat.prototype.setBlockIndent = function (value) {
                    this._as3Object.blockIndent = AVM1.alToNumber(this.context, value);
                };
                AVM1TextFormat.prototype.getBold = function () {
                    return this._as3Object.bold;
                };
                AVM1TextFormat.prototype.setBold = function (value) {
                    this._as3Object.bold = AVM1.alToBoolean(this.context, value);
                };
                AVM1TextFormat.prototype.getBullet = function () {
                    return this._as3Object.bullet;
                };
                AVM1TextFormat.prototype.setBullet = function (value) {
                    this._as3Object.bullet = AVM1.alToBoolean(this.context, value);
                };
                AVM1TextFormat.prototype.getColor = function () {
                    return this._as3Object.color;
                };
                AVM1TextFormat.prototype.setColor = function (value) {
                    this._as3Object.color = AVM1.alToNumber(this.context, value);
                };
                AVM1TextFormat.prototype.getFont = function () {
                    return this._as3Object.font;
                };
                AVM1TextFormat.prototype.setFont = function (value) {
                    this._as3Object.font = AVM1.alToString(this.context, value);
                };
                AVM1TextFormat.prototype.getIndent = function () {
                    return this._as3Object.indent;
                };
                AVM1TextFormat.prototype.setIndent = function (value) {
                    this._as3Object.indent = AVM1.alToNumber(this.context, value);
                };
                AVM1TextFormat.prototype.getItalic = function () {
                    return this._as3Object.italic;
                };
                AVM1TextFormat.prototype.setItalic = function (value) {
                    this._as3Object.italic = AVM1.alToBoolean(this.context, value);
                };
                AVM1TextFormat.prototype.getKerning = function () {
                    return this._as3Object.kerning;
                };
                AVM1TextFormat.prototype.setKerning = function (value) {
                    this._as3Object.kerning = AVM1.alToBoolean(this.context, value);
                };
                AVM1TextFormat.prototype.getLeading = function () {
                    return this._as3Object.leading;
                };
                AVM1TextFormat.prototype.setLeading = function (value) {
                    this._as3Object.leading = AVM1.alToNumber(this.context, value);
                };
                AVM1TextFormat.prototype.getLeftMargin = function () {
                    return this._as3Object.leftMargin;
                };
                AVM1TextFormat.prototype.setLeftMargin = function (value) {
                    this._as3Object.leftMargin = AVM1.alToNumber(this.context, value);
                };
                AVM1TextFormat.prototype.getLetterSpacing = function () {
                    return this._as3Object.letterSpacing;
                };
                AVM1TextFormat.prototype.setLetterSpacing = function (value) {
                    this._as3Object.letterSpacing = AVM1.alToNumber(this.context, value);
                };
                AVM1TextFormat.prototype.getRightMargin = function () {
                    return this._as3Object.rightMargin;
                };
                AVM1TextFormat.prototype.setRightMargin = function (value) {
                    this._as3Object.rightMargin = AVM1.alToNumber(this.context, value);
                };
                AVM1TextFormat.prototype.getSize = function () {
                    return this._as3Object.size;
                };
                AVM1TextFormat.prototype.setSize = function (value) {
                    this._as3Object.size = AVM1.alToNumber(this.context, value);
                };
                AVM1TextFormat.prototype.getTabStops = function () {
                    var tabStops = this._as3Object.tabStops;
                    return tabStops ? tabStops.value : null;
                };
                AVM1TextFormat.prototype.setTabStops = function (value) {
                    if (!(value instanceof AVM1.Natives.AVM1ArrayNative) && !Shumway.isNullOrUndefined(value)) {
                        return; // TODO
                    }
                    var tabStops = value && this.context.sec.createArray(value);
                    this._as3Object.tabStops = tabStops;
                };
                AVM1TextFormat.prototype.getTarget = function () {
                    return this._as3Object.target;
                };
                AVM1TextFormat.prototype.setTarget = function (value) {
                    this._as3Object.target = AVM1.alToString(this.context, value);
                };
                AVM1TextFormat.prototype.getTextExtent = function (text, width) {
                    text = AVM1.alCoerceString(this.context, text);
                    width = +width;
                    var staticState = this.context.getStaticState(AVM1TextFormat);
                    var measureTextField = staticState._measureTextField;
                    if (!isNaN(width) && width > 0) {
                        measureTextField.width = width + 4;
                        measureTextField.wordWrap = true;
                    }
                    else {
                        measureTextField.wordWrap = false;
                    }
                    measureTextField.defaultTextFormat = this._as3Object;
                    measureTextField.text = text;
                    var result = AVM1.alNewObject(this.context);
                    var textWidth = measureTextField.textWidth;
                    var textHeight = measureTextField.textHeight;
                    result.alPut('width', textWidth);
                    result.alPut('height', textHeight);
                    result.alPut('textFieldWidth', textWidth + 4);
                    result.alPut('textFieldHeight', textHeight + 4);
                    var metrics = measureTextField.getLineMetrics(0);
                    result.alPut('ascent', metrics.axGetPublicProperty('ascent'));
                    result.alPut('descent', metrics.axGetPublicProperty('descent'));
                    return result;
                };
                AVM1TextFormat.prototype.getUnderline = function () {
                    return this._as3Object.underline;
                };
                AVM1TextFormat.prototype.setUnderline = function (value) {
                    this._as3Object.underline = AVM1.alToBoolean(this.context, value);
                };
                AVM1TextFormat.prototype.getUrl = function () {
                    return this._as3Object.url;
                };
                AVM1TextFormat.prototype.setUrl = function (value) {
                    this._as3Object.url = AVM1.alToString(this.context, value);
                };
                return AVM1TextFormat;
            })(AVM1.AVM1Object);
            Lib.AVM1TextFormat = AVM1TextFormat;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var AVM1BitmapData = (function (_super) {
                __extends(AVM1BitmapData, _super);
                function AVM1BitmapData() {
                    _super.apply(this, arguments);
                }
                AVM1BitmapData.createAVM1Class = function (context) {
                    return Lib.wrapAVM1NativeClass(context, true, AVM1BitmapData, ['loadBitmap'], ['height#', 'rectangle#', 'transparent#', 'width#', 'applyFilter', 'clone', 'colorTransform', 'compare', 'copyChannel', 'copyPixels', 'dispose', 'draw', 'fillRect', 'floodFill', 'generateFilterRect', 'getColorBoundsRect', 'getPixel', 'getPixel32', 'hitTest', 'merge', 'noise', 'paletteMap', 'perlinNoise', 'pixelDissolve', 'scroll', 'setPixel', 'setPixel32', 'threshold'], null, AVM1BitmapData.prototype.avm1Constructor);
                };
                AVM1BitmapData.prototype.avm1Constructor = function (width, height, transparent, fillColor) {
                    width = AVM1.alToNumber(this.context, width);
                    height = AVM1.alToNumber(this.context, height);
                    transparent = arguments.length < 3 ? true : AVM1.alToBoolean(this.context, transparent);
                    fillColor = arguments.length < 4 ? 0xFFFFFFFF : AVM1.alToInt32(this.context, fillColor);
                    var as3Object = new this.context.sec.flash.display.BitmapData(width, height, transparent, fillColor);
                    this._as3Object = as3Object;
                };
                AVM1BitmapData.loadBitmap = function (context, symbolId) {
                    symbolId = AVM1.alToString(context, symbolId);
                    var symbol = context.getAsset(symbolId);
                    // REDUX verify
                    var symbolClass = symbol.symbolProps.symbolClass;
                    var bitmapClass = context.sec.flash.display.BitmapData.axClass;
                    if (symbol && bitmapClass.dPrototype.isPrototypeOf(symbolClass.dPrototype)) {
                        var as3Object = Shumway.AVMX.AS.constructClassFromSymbol(symbol, bitmapClass);
                        var BitmapData = context.globals.alGet('BitmapData');
                        var bitmap = new AVM1BitmapData(context);
                        bitmap.alPrototype = BitmapData.alGetPrototypeProperty();
                        bitmap._as3Object = as3Object;
                        return bitmap;
                    }
                    return null;
                };
                AVM1BitmapData.prototype.getHeight = function () {
                    return this._as3Object.height;
                };
                AVM1BitmapData.prototype.getRectangle = function () {
                    Shumway.Debug.notImplemented('AVM1BitmapData.getRectangle');
                    return undefined;
                };
                AVM1BitmapData.prototype.getTransparent = function () {
                    return this._as3Object.transparent;
                };
                AVM1BitmapData.prototype.getWidth = function () {
                    return this._as3Object.width;
                };
                AVM1BitmapData.prototype.applyFilter = function (sourceBitmap, sourceRect, destPoint, filter) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.applyFilter');
                    return NaN;
                };
                AVM1BitmapData.prototype.clone = function () {
                    var bitmap = new AVM1BitmapData(this.context);
                    var BitmapData = this.context.globals.alGet('BitmapData');
                    bitmap.alPrototype = BitmapData.alGetPrototypeProperty();
                    bitmap._as3Object = this._as3Object.clone();
                    return bitmap;
                };
                AVM1BitmapData.prototype.colorTransform = function (rect, colorTransform) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.colorTransform');
                };
                AVM1BitmapData.prototype.compare = function (other) {
                    if (!(other instanceof AVM1BitmapData)) {
                        return false;
                    }
                    return this._as3Object.compare(other._as3Object);
                };
                AVM1BitmapData.prototype.copyChannel = function (sourceBitmap, sourceRect, destPoint, sourceChannel, destChannel) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.copyChannel');
                };
                AVM1BitmapData.prototype.copyPixels = function (sourceBitmap, sourceRect, destPoint, alphaBitmap, alphaPoint, mergeAlpha) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.copyPixels');
                };
                AVM1BitmapData.prototype.dispose = function () {
                    Shumway.Debug.notImplemented('AVM1BitmapData.dispose');
                };
                AVM1BitmapData.prototype.draw = function (source, matrix, colorTransform, blendMode, clipRect, smooth) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.draw');
                };
                AVM1BitmapData.prototype.fillRect = function (rect, color) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.fillRect');
                };
                AVM1BitmapData.prototype.floodFill = function (x, y, color) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.floodFill');
                };
                AVM1BitmapData.prototype.generateFilterRect = function (sourceRect, filter) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.generateFilterRect');
                    return undefined;
                };
                AVM1BitmapData.prototype.getColorBoundsRect = function (mask, color, findColor) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.getColorBoundsRect');
                    return undefined;
                };
                AVM1BitmapData.prototype.getPixel = function (x, y) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.getPixel');
                    return NaN;
                };
                AVM1BitmapData.prototype.getPixel32 = function (x, y) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.getPixel32');
                    return NaN;
                };
                AVM1BitmapData.prototype.hitTest = function (firstPoint, firstAlphaThreshold, secondObject, secondBitmapPoint, secondAlphaThreshold) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.hitTest');
                    return false;
                };
                AVM1BitmapData.prototype.merge = function (sourceBitmap, sourceRect, destPoint, redMult, greenMult, blueMult, alphaMult) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.merge');
                    return undefined;
                };
                AVM1BitmapData.prototype.noise = function (randomSeed, low, high, channelOptions, grayScale) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.noise');
                };
                AVM1BitmapData.prototype.paletteMap = function (sourceBitmap, sourceRect, destPoint, redArray, greenArray, blueArray, alphaArray) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.paletteMap');
                };
                AVM1BitmapData.prototype.perlinNoise = function (baseX, baseY, numOctaves, randomSeed, stitch, fractalNoise, channelOptions, grayScale, offsets) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.perlinNoise');
                };
                AVM1BitmapData.prototype.pixelDissolve = function (sourceBitmap, sourceRect, destPoint, randomSeed, numberOfPixels, fillColor) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.pixelDissolve');
                    return NaN;
                };
                AVM1BitmapData.prototype.scroll = function (x, y) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.scroll');
                };
                AVM1BitmapData.prototype.setPixel = function (x, y, color) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.setPixel');
                };
                AVM1BitmapData.prototype.setPixel32 = function (x, y, color) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.setPixel32');
                };
                AVM1BitmapData.prototype.threshold = function (sourceBitmap, sourceRect, destPoint, operation, threshold, color, mask, copySource) {
                    Shumway.Debug.notImplemented('AVM1BitmapData.threshold');
                    return NaN;
                };
                return AVM1BitmapData;
            })(AVM1.AVM1Object);
            Lib.AVM1BitmapData = AVM1BitmapData;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var AVM1ExternalInterface = (function (_super) {
                __extends(AVM1ExternalInterface, _super);
                function AVM1ExternalInterface() {
                    _super.apply(this, arguments);
                }
                AVM1ExternalInterface.createAVM1Class = function (context) {
                    return Lib.wrapAVM1NativeClass(context, true, AVM1ExternalInterface, ['available#', 'addCallback', 'call'], []);
                };
                AVM1ExternalInterface.getAvailable = function (context) {
                    return context.sec.flash.external.ExternalInterface.axClass.available;
                };
                AVM1ExternalInterface.addCallback = function (context, methodName, instance, method) {
                    methodName = AVM1.alCoerceString(context, methodName);
                    if (!AVM1.alIsFunction(method)) {
                        return false;
                    }
                    try {
                        context.sec.flash.external.ExternalInterface.axClass.addCallback(methodName, function () {
                            var args = Array.prototype.slice.call(arguments, 0);
                            var result = context.executeFunction(method, instance, args);
                            return result;
                        });
                        return true;
                    }
                    catch (e) {
                    }
                    return false;
                };
                AVM1ExternalInterface.call = function (context, methodName) {
                    var parameters = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        parameters[_i - 2] = arguments[_i];
                    }
                    var args = [AVM1.alCoerceString(context, methodName)];
                    for (var i = 0; i < parameters.length; i++) {
                        // TODO convert AVM1 objects to AVM2
                        args.push(parameters[i]);
                    }
                    var result = context.sec.flash.external.ExternalInterface.axClass.call.apply(context.sec.flash.external.ExternalInterface.axClass, args);
                    // TODO convert AVM2 result to AVM1
                    return result;
                };
                return AVM1ExternalInterface;
            })(AVM1.AVM1Object);
            Lib.AVM1ExternalInterface = AVM1ExternalInterface;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var AVM1Sound = (function (_super) {
                __extends(AVM1Sound, _super);
                function AVM1Sound() {
                    _super.apply(this, arguments);
                }
                AVM1Sound.createAVM1Class = function (context) {
                    return Lib.wrapAVM1NativeClass(context, true, AVM1Sound, [], ['attachSound', 'duration#', 'getBytesLoaded', 'getBytesTotal', 'getPan', 'setPan', 'getTransform', 'setTransform', 'getVolume', 'setVolume', 'start', 'stop'], null, AVM1Sound.prototype.avm1Constructor);
                };
                AVM1Sound.prototype.avm1Constructor = function (target_mc) {
                    this._target = Lib.AVM1Utils.resolveTarget(this.context, target_mc);
                    this._sound = null;
                    this._channel = null;
                    this._linkageID = null;
                };
                AVM1Sound.prototype.attachSound = function (id) {
                    var symbol = this.context.getAsset(id);
                    if (!symbol) {
                        return;
                    }
                    var props = Object.create(symbol.symbolProps);
                    var sound = Shumway.AVMX.AS.constructClassFromSymbol(props, this.context.sec.flash.media.Sound.axClass);
                    this._linkageID = id;
                    this._sound = sound;
                };
                AVM1Sound.prototype.loadSound = function (url, isStreaming) {
                };
                AVM1Sound.prototype.getBytesLoaded = function () {
                    return 0;
                };
                AVM1Sound.prototype.getBytesTotal = function () {
                    return 0;
                };
                AVM1Sound.prototype.getDuration = function () {
                    return 0;
                };
                AVM1Sound.prototype.getPan = function () {
                    var transform = this._channel && this._channel.soundTransform;
                    return transform ? transform.axGetPublicProperty('pan') * 100 : 0;
                };
                AVM1Sound.prototype.setPan = function (value) {
                    var transform = this._channel && this._channel.soundTransform;
                    if (transform) {
                        transform.axSetPublicProperty('pan', value / 100);
                        this._channel.soundTransform = transform;
                    }
                };
                AVM1Sound.prototype.getTransform = function () {
                    return null;
                };
                AVM1Sound.prototype.setTransform = function (transformObject) {
                };
                AVM1Sound.prototype.getVolume = function () {
                    var transform = this._channel && this._channel.soundTransform;
                    return transform ? transform.axGetPublicProperty('volume') * 100 : 0;
                };
                AVM1Sound.prototype.setVolume = function (value) {
                    var transform = this._channel && this._channel.soundTransform;
                    if (transform) {
                        transform.axSetPublicProperty('volume', value / 100);
                        this._channel.soundTransform = transform;
                    }
                };
                AVM1Sound.prototype.start = function (secondOffset, loops) {
                    if (!this._sound) {
                        return;
                    }
                    secondOffset = isNaN(secondOffset) || secondOffset < 0 ? 0 : +secondOffset;
                    loops = isNaN(loops) || loops < 1 ? 1 : Math.floor(loops);
                    this._stopSoundChannel();
                    this._channel = this._sound.play(secondOffset, loops - 1);
                };
                AVM1Sound.prototype._stopSoundChannel = function () {
                    if (!this._channel) {
                        return;
                    }
                    this._channel.stop();
                    this._channel = null;
                };
                AVM1Sound.prototype.stop = function (linkageID) {
                    if (!linkageID || linkageID === this._linkageID) {
                        this._stopSoundChannel();
                    }
                };
                return AVM1Sound;
            })(AVM1.AVM1Object);
            Lib.AVM1Sound = AVM1Sound;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var capabilitiesProperties = [
                'avHardwareDisable',
                'hasAccessibility',
                'hasAudio',
                'hasAudioEncoder',
                'hasEmbeddedVideo',
                'hasIME',
                'hasMP3',
                'hasPrinting',
                'hasScreenBroadcast',
                'hasScreenPlayback',
                'hasStreamingAudio',
                'hasStreamingVideo',
                'hasVideoEncoder',
                'isDebugger',
                'language',
                'localFileReadDisable',
                'manufacturer',
                'os',
                'pixelAspectRatio',
                'playerType',
                'screenColor',
                'screenDPI',
                'screenResolutionX',
                'screenResolutionY',
                'serverString',
                'version'
            ];
            var AVM1Capabilities = (function (_super) {
                __extends(AVM1Capabilities, _super);
                function AVM1Capabilities(context) {
                    var _this = this;
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                    var as3Capabilities = context.sec.flash.system.Capabilities.axClass;
                    capabilitiesProperties.forEach(function (name) {
                        _this.alSetOwnProperty(name, {
                            flags: 128 /* ACCESSOR */ | 2 /* DONT_DELETE */ | 1 /* DONT_ENUM */,
                            get: { alCall: function () {
                                return as3Capabilities.axGetPublicProperty(name);
                            } }
                        });
                    }, this);
                }
                return AVM1Capabilities;
            })(AVM1.AVM1Object);
            var AVM1Security = (function (_super) {
                __extends(AVM1Security, _super);
                function AVM1Security(context) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                    AVM1.alDefineObjectProperties(this, {
                        sandboxType: {
                            get: this.getSandboxType
                        },
                        allowDomain: {
                            value: this.allowDomain
                        },
                        allowInsecureDomain: {
                            value: this.allowInsecureDomain
                        },
                        loadPolicyFile: {
                            value: this.loadPolicyFile
                        }
                    });
                }
                AVM1Security.prototype.getSandboxType = function () {
                    return this.context.sec.flash.system.Security.axClass.sandboxType;
                };
                AVM1Security.prototype.allowDomain = function (domain) {
                    domain = AVM1.alCoerceString(this.context, domain);
                    this.context.sec.flash.system.Security.axClass.allowDomain(domain);
                };
                AVM1Security.prototype.allowInsecureDomain = function (domain) {
                    domain = AVM1.alCoerceString(this.context, domain);
                    this.context.sec.flash.system.Security.axClass.allowInsecureDomain(domain);
                };
                AVM1Security.prototype.loadPolicyFile = function (url) {
                    url = AVM1.alCoerceString(this.context, url);
                    this.context.sec.flash.system.Security.axClass.loadPolicyFile(url);
                };
                return AVM1Security;
            })(AVM1.AVM1Object);
            var AVM1System = (function (_super) {
                __extends(AVM1System, _super);
                function AVM1System() {
                    _super.apply(this, arguments);
                }
                AVM1System.alInitStatic = function (context) {
                    this._capabilities = new AVM1Capabilities(context);
                    this._security = new AVM1Security(context);
                };
                AVM1System.createAVM1Class = function (context) {
                    return Lib.wrapAVM1NativeClass(context, false, AVM1System, ['capabilities#', 'security#'], []);
                };
                AVM1System.getCapabilities = function (context) {
                    var staticState = context.getStaticState(AVM1System);
                    return staticState._capabilities;
                };
                AVM1System.getSecurity = function (context) {
                    var staticState = context.getStaticState(AVM1System);
                    return staticState._security;
                };
                return AVM1System;
            })(AVM1.AVM1Object);
            Lib.AVM1System = AVM1System;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var AVM1SharedObject = (function (_super) {
                __extends(AVM1SharedObject, _super);
                function AVM1SharedObject(context, as3SharedObject) {
                    _super.call(this, context);
                    this.alPrototype = context.globals.SharedObject.alGetPrototypeProperty();
                    this._as3SharedObject = as3SharedObject;
                }
                return AVM1SharedObject;
            })(AVM1.AVM1Object);
            Lib.AVM1SharedObject = AVM1SharedObject;
            var AVM1SharedObjectFunction = (function (_super) {
                __extends(AVM1SharedObjectFunction, _super);
                function AVM1SharedObjectFunction(context) {
                    _super.call(this, context);
                    AVM1.alDefineObjectProperties(this, {
                        prototype: {
                            value: new AVM1SharedObjectPrototype(context, this)
                        },
                        getLocal: {
                            value: this.getLocal,
                            writable: true
                        }
                    });
                }
                AVM1SharedObjectFunction.prototype.getLocal = function (name, localPath, secure) {
                    name = AVM1.alCoerceString(this.context, name);
                    localPath = AVM1.alCoerceString(this.context, localPath);
                    secure = AVM1.alToBoolean(this.context, secure);
                    var as3SharedObject = this.context.sec.flash.net.SharedObject.axClass.getLocal(name, localPath, secure);
                    return new AVM1SharedObject(this.context, as3SharedObject);
                };
                return AVM1SharedObjectFunction;
            })(AVM1.AVM1Function);
            Lib.AVM1SharedObjectFunction = AVM1SharedObjectFunction;
            var AVM1SharedObjectPrototype = (function (_super) {
                __extends(AVM1SharedObjectPrototype, _super);
                function AVM1SharedObjectPrototype(context, fn) {
                    _super.call(this, context);
                    this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
                    AVM1.alDefineObjectProperties(this, {
                        constructor: {
                            value: fn,
                            writable: true
                        },
                        rgb: {
                            get: this.getData,
                            set: this.setData
                        },
                        clear: {
                            value: this.clear,
                            writable: true
                        },
                        flush: {
                            value: this.flush,
                            writable: true
                        }
                    });
                }
                AVM1SharedObjectPrototype.prototype.getData = function () {
                    // TODO implement transform from AVM2 -> AVM1 objects
                    Shumway.Debug.somewhatImplemented('AVM1SharedObject.getData');
                    var data = this.__data || (this.__data = AVM1.alNewObject(this.context));
                    return data;
                };
                AVM1SharedObjectPrototype.prototype.setData = function (data) {
                    // TODO implement transform from AVM1 -> AVM2 objects
                    Shumway.Debug.somewhatImplemented('AVM1SharedObject.setData');
                    this.__data = data;
                };
                AVM1SharedObjectPrototype.prototype.clear = function () {
                    this._as3SharedObject.clear();
                };
                AVM1SharedObjectPrototype.prototype.flush = function (minDiskSpace) {
                    minDiskSpace = AVM1.alCoerceNumber(this.context, minDiskSpace);
                    this._as3SharedObject.flush(AVM1.alCoerceNumber(this.context, minDiskSpace));
                    Shumway.Debug.somewhatImplemented('AVM1SharedObject.flush');
                    return false; // can be a string 'pending' or boolean
                };
                AVM1SharedObjectPrototype.prototype.getSize = function () {
                    Shumway.Debug.somewhatImplemented('AVM1SharedObject.getSize');
                    return this.__data ? 10 : 0;
                };
                AVM1SharedObjectPrototype.prototype.setFps = function (updatesPerSecond) {
                    updatesPerSecond = AVM1.alCoerceNumber(this.context, updatesPerSecond) || 0;
                    this._as3SharedObject.fps = updatesPerSecond;
                    return this._as3SharedObject.fps === updatesPerSecond;
                };
                return AVM1SharedObjectPrototype;
            })(AVM1.AVM1Object);
            Lib.AVM1SharedObjectPrototype = AVM1SharedObjectPrototype;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='../references.ts' />
var Shumway;
(function (Shumway) {
    var AVM1;
    (function (AVM1) {
        var Lib;
        (function (Lib) {
            var flash = Shumway.AVMX.AS.flash;
            var AVM1MovieClipLoader = (function (_super) {
                __extends(AVM1MovieClipLoader, _super);
                function AVM1MovieClipLoader() {
                    _super.apply(this, arguments);
                }
                AVM1MovieClipLoader.createAVM1Class = function (context) {
                    return Lib.wrapAVM1NativeClass(context, true, AVM1MovieClipLoader, [], ['loadClip', 'unloadClip', 'getProgress'], null, AVM1MovieClipLoader.prototype.avm1Constructor);
                };
                AVM1MovieClipLoader.prototype.avm1Constructor = function () {
                    this._loader = new this.context.sec.flash.display.Loader();
                };
                AVM1MovieClipLoader.prototype.loadClip = function (url, target) {
                    this._target = typeof target === 'number' ? Lib.AVM1Utils.resolveLevel(this.context, target) : Lib.AVM1Utils.resolveTarget(this.context, target);
                    this._target.as3Object.addChild(this._loader);
                    this._loader.contentLoaderInfo.addEventListener(flash.events.Event.OPEN, this.openHandler.bind(this));
                    this._loader.contentLoaderInfo.addEventListener(flash.events.ProgressEvent.PROGRESS, this.progressHandler.bind(this));
                    this._loader.contentLoaderInfo.addEventListener(flash.events.IOErrorEvent.IO_ERROR, this.ioErrorHandler.bind(this));
                    this._loader.contentLoaderInfo.addEventListener(flash.events.Event.COMPLETE, this.completeHandler.bind(this));
                    this._loader.contentLoaderInfo.addEventListener(flash.events.Event.INIT, this.initHandler.bind(this));
                    this._loader.load(new this.context.sec.flash.net.URLRequest(url));
                    // TODO: find out under which conditions we should return false here
                    return true;
                };
                AVM1MovieClipLoader.prototype.unloadClip = function (target) {
                    var nativeTarget = typeof target === 'number' ? Lib.AVM1Utils.resolveLevel(this.context, target) : Lib.AVM1Utils.resolveTarget(this.context, target);
                    nativeTarget.as3Object.removeChild(this._loader);
                    // TODO: find out under which conditions unloading a clip can fail
                    return true;
                };
                AVM1MovieClipLoader.prototype.getProgress = function (target) {
                    return this._loader.contentLoaderInfo.bytesLoaded;
                };
                AVM1MovieClipLoader.prototype._broadcastMessage = function (message, args) {
                    if (args === void 0) { args = null; }
                    Lib.avm1BroadcastEvent(this._target.context, this, message, args);
                };
                AVM1MovieClipLoader.prototype.openHandler = function (event) {
                    this._broadcastMessage('onLoadStart', [this._target]);
                };
                AVM1MovieClipLoader.prototype.progressHandler = function (event) {
                    this._broadcastMessage('onLoadProgress', [this._target, event.bytesLoaded, event.bytesTotal]);
                };
                AVM1MovieClipLoader.prototype.ioErrorHandler = function (event) {
                    this._broadcastMessage('onLoadError', [this._target, event.errorID, 501]);
                };
                AVM1MovieClipLoader.prototype.completeHandler = function (event) {
                    this._broadcastMessage('onLoadComplete', [this._target]);
                };
                AVM1MovieClipLoader.prototype.initHandler = function (event) {
                    var exitFrameCallback = function () {
                        this._target.as3Object.removeEventListener(flash.events.Event.EXIT_FRAME, exitFrameCallback);
                        this._broadcastMessage('onLoadInit', [this._target]);
                    }.bind(this);
                    // MovieClipLoader's init event is dispatched after all frame scripts of the AVM1 instance
                    // have run for one additional iteration.
                    this._target.as3Object.addEventListener(flash.events.Event.EXIT_FRAME, exitFrameCallback);
                };
                return AVM1MovieClipLoader;
            })(AVM1.AVM1Object);
            Lib.AVM1MovieClipLoader = AVM1MovieClipLoader;
        })(Lib = AVM1.Lib || (AVM1.Lib = {}));
    })(AVM1 = Shumway.AVM1 || (Shumway.AVM1 = {}));
})(Shumway || (Shumway = {}));
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
/// <reference path='../../build/ts/avm2.d.ts' />
/// <reference path='flash.d.ts' />
///<reference path='stream.ts' />
///<reference path='parser.ts' />
///<reference path='analyze.ts' />
///<reference path='runtime.ts' />
///<reference path='natives.ts' />
///<reference path='context.ts' />
///<reference path='interpreter.ts' />
///<reference path='baseline.ts' />
///<reference path='lib/AVM1Utils.ts' />
///<reference path='lib/AVM1Globals.ts' />
///<reference path='lib/AVM1Broadcaster.ts' />
///<reference path='lib/AVM1Key.ts' />
///<reference path='lib/AVM1Mouse.ts' />
///<reference path='lib/AVM1Stage.ts' />
///<reference path='lib/AVM1MovieClip.ts' />
///<reference path='lib/AVM1Button.ts' />
///<reference path='lib/AVM1TextField.ts' />
///<reference path='lib/AVM1Color.ts' />
///<reference path='lib/AVM1ColorTransform.ts' />
///<reference path='lib/AVM1Matrix.ts' />
///<reference path='lib/AVM1Point.ts' />
///<reference path='lib/AVM1Rectangle.ts' />
///<reference path='lib/AVM1Transform.ts' />
///<reference path='lib/AVM1TextFormat.ts' />
///<reference path='lib/AVM1BitmapData.ts' />
///<reference path='lib/AVM1ExternalInterface.ts' />
///<reference path='lib/AVM1Sound.ts' />
///<reference path='lib/AVM1System.ts' />
///<reference path='lib/AVM1SharedObject.ts' />
///<reference path='lib/AVM1MovieClipLoader.ts' />
//# sourceMappingURL=avm1.js.map