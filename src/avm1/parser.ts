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

module Shumway.AVM1 {
  import ActionsDataStream = Shumway.AVM1.ActionsDataStream;

  export class ParsedPushRegisterAction {
    constructor(public registerNumber: number) {}
  }

  export class ParsedPushConstantAction {
    constructor(public constantIndex: number) {}
  }

  export interface ParsedAction {
    position: number;
    actionCode: number;
    actionName: string;
    args: any[];
  }

  export class ActionsDataParser {
    constructor(public stream: ActionsDataStream) {}
    get position() {
      return this.stream.position;
    }
    set position(value: number) {
      this.stream.position = value;
    }
    get eof() {
      return this.stream.position >= this.stream.end;
    }
    readNext() : ParsedAction {
      var stream = this.stream;
      var currentPosition = stream.position;
      var actionCode = stream.readUI8();
      var length = actionCode >= 0x80 ? stream.readUI16() : 0;
      var nextPosition = stream.position + length;

      var args: any[] = null;
      switch (actionCode | 0) {
        case 0x81: // ActionGotoFrame
          var frame = stream.readUI16();
          var nextActionCode = stream.readUI8();
          var play = false;
          if (nextActionCode !== 0x06 && nextActionCode !== 0x07) {
            console.error('Unexpected gotoFrame next code: ' + nextActionCode);
          } else {
            nextPosition++;
            play = nextActionCode === 0x06;
          }
          args = [frame, play];
          break;
        case 0x83: // ActionGetURL
          var urlString = stream.readString();
          var targetString = stream.readString();
          args = [urlString, targetString];
          break;
        case 0x8A: // ActionWaitForFrame
          var frame = stream.readUI16();
          var count = stream.readUI8();
          args = [frame, count];
          break;
        case 0x8B: // ActionSetTarget
          var targetName = stream.readString();
          args = [targetName];
          break;
        case 0x8C: // ActionGoToLabel
          var label = stream.readString();
          args = [label];
          break;
        case 0x96: // ActionPush
          var type, value;
          args = [];
          while (stream.position < nextPosition) {
            type = stream.readUI8();
            switch (type | 0) {
              case 0: // STRING
                value = stream.readString();
                break;
              case 1: // FLOAT
                value = stream.readFloat();
                break;
              case 2: // null
                value = null;
                break;
              case 3: // undefined
                value = void(0);
                break;
              case 4: // Register number
                value = new ParsedPushRegisterAction(stream.readUI8());
                break;
              case 5: // Boolean
                value = stream.readBoolean();
                break;
              case 6: // Double
                value = stream.readDouble();
                break;
              case 7: // Integer
                value = stream.readInteger();
                break;
              case 8: // Constant8
                value = new ParsedPushConstantAction(stream.readUI8());
                break;
              case 9: // Constant16
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
        case 0x99: // ActionJump
          var offset = stream.readSI16();
          args = [offset];
          break;
        case 0x9D: // ActionIf
          var offset = stream.readSI16();
          args = [offset];
          break;
        case 0x9A: // ActionGetURL2
          var flags = stream.readUI8();
          args = [flags];
          break;
        case 0x9F: // ActionGotoFrame2
          var flags = stream.readUI8();
          args = [flags];
          if (!!(flags & 2)) {
            args.push(stream.readUI16());
          }
          break;
        case 0x8D: // ActionWaitForFrame2
          var count = stream.readUI8();
          args = [count];
          break;
        case 0x88: // ActionConstantPool
          var count = stream.readUI16();
          var constantPool = [];
          for (var i = 0; i < count; i++) {
            constantPool.push(stream.readString());
          }
          args = [constantPool];
          break;
        case 0x9B: // ActionDefineFunction
          var functionName = stream.readString();
          var count = stream.readUI16();
          var functionParams = [];
          for (var i = 0; i < count; i++) {
            functionParams.push(stream.readString());
          }

          var codeSize = stream.readUI16();
          nextPosition += codeSize;
          var functionBody = stream.readBytes(codeSize);

          args = [functionName, functionParams, functionBody];
          break;
        case 0x94: // ActionWith
          var codeSize = stream.readUI16();
          nextPosition += codeSize;
          var withBody = stream.readBytes(codeSize);
          args = [withBody];
          break;
        case 0x87: // ActionStoreRegister
          var register = stream.readUI8();
          args = [register];
          break;
        case 0x8E: // ActionDefineFunction2
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
                type: 'param',
                name: paramName,
                index: i
              };
            }
          }

          var j = 1;
          // order this, arguments, super, _root, _parent, and _global
          if (flags & 0x0001) { // preloadThis
            registerAllocation[j++] = { type: 'var', name: 'this' };
          }
          if (flags & 0x0004) { // preloadArguments
            registerAllocation[j++] = { type: 'var', name: 'arguments' };
          }
          if (flags & 0x0010) { // preloadSuper
            registerAllocation[j++] = { type: 'var', name: 'super' };
          }
          if (flags & 0x0040) { // preloadRoot
            registerAllocation[j++] = { type: 'var', name: '_root' };
          }
          if (flags & 0x0080) { // preloadParent
            registerAllocation[j++] = { type: 'var', name: '_parent' };
          }
          if (flags & 0x0100) { // preloadGlobal
            registerAllocation[j++] = { type: 'var', name: '_global' };
          }

          var codeSize = stream.readUI16();
          nextPosition += codeSize;
          var functionBody = stream.readBytes(codeSize);

          args = [functionName, functionParams, registerCount,
            registerAllocation, functionBody];
          break;
        case 0x8F: // ActionTry
          var flags = stream.readUI8();
          var catchIsRegisterFlag = !!(flags & 4);
          var finallyBlockFlag = !!(flags & 2);
          var catchBlockFlag = !!(flags & 1);
          var trySize = stream.readUI16();
          var catchSize = stream.readUI16();
          var finallySize = stream.readUI16();
          var catchTarget: any = catchIsRegisterFlag ? stream.readUI8() : stream.readString();

          nextPosition += trySize + catchSize + finallySize;

          var tryBody = stream.readBytes(trySize);
          var catchBody = stream.readBytes(catchSize);
          var finallyBody = stream.readBytes(finallySize);

          args = [catchIsRegisterFlag, catchTarget, tryBody,
            catchBlockFlag, catchBody, finallyBlockFlag, finallyBody];
          break;
        case 0x89: // ActionStrictMode
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
    }
    skip(count) {
      var stream = this.stream;
      while (count > 0 && stream.position < stream.end) {
        var actionCode = stream.readUI8();
        var length = actionCode >= 0x80 ? stream.readUI16() : 0;
        stream.position += length;
        count--;
      }
    }
  }

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
    0x35: 'ActionMBStringExtrac',
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
    0x8E: 'ActionDefineFunction',
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
}
