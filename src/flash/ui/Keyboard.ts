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
// Class: Keyboard
module Shumway.AVMX.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import axCoerceString = Shumway.AVMX.axCoerceString;

  /**
   * Dispatches AS3 keyboard events to the focus event dispatcher.
   */
  export class KeyboardEventDispatcher {
    private _lastKeyCode = 0;
    private _captureKeyPress = false;
    private _charCodeMap: any [] = [];
    target: flash.events.EventDispatcher;

    /**
     * Converts DOM keyboard event data into AS3 keyboard events.
     */
    public dispatchKeyboardEvent(event: KeyboardEventData) {
      var keyCode = event.keyCode;
      if (event.type === 'keydown') {
        this._lastKeyCode = keyCode;
        // Trying to capture charCode for ASCII keys.
        this._captureKeyPress = keyCode === 8 || keyCode === 9 ||
          keyCode === 13 || keyCode === 32 || (keyCode >= 48 && keyCode <= 90) ||
          keyCode > 145;
        if (this._captureKeyPress) {
          return; // skipping keydown, waiting for keypress
        }
        this._charCodeMap[keyCode] = 0;
      } else if (event.type === 'keypress') {
        if (this._captureKeyPress) {
          keyCode = this._lastKeyCode;
          this._charCodeMap[keyCode] = event.charCode;
        } else {
          return;
        }
      }

      if (this.target) {
        var isKeyUp = event.type === 'keyup';
        this.target.dispatchEvent(new this.target.sec.flash.events.KeyboardEvent (
          isKeyUp ? 'keyUp' : 'keyDown',
          true,
          false,
          isKeyUp ? this._charCodeMap[keyCode] : event.charCode,
          isKeyUp ? event.keyCode : this._lastKeyCode,
          event.location,
          event.ctrlKey,
          event.altKey,
          event.shiftKey
        ));
      }
    }
  }

  export interface KeyboardEventData {
    type: string;
    keyCode: number;
    charCode: number;
    location: number;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
  }

  export class Keyboard extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      super();
    }

    // JS -> AS Bindings
    static KEYNAME_UPARROW: string = "Up";
    static KEYNAME_DOWNARROW: string = "Down";
    static KEYNAME_LEFTARROW: string = "Left";
    static KEYNAME_RIGHTARROW: string = "Right";
    static KEYNAME_F1: string = "F1";
    static KEYNAME_F2: string = "F2";
    static KEYNAME_F3: string = "F3";
    static KEYNAME_F4: string = "F4";
    static KEYNAME_F5: string = "F5";
    static KEYNAME_F6: string = "F6";
    static KEYNAME_F7: string = "F7";
    static KEYNAME_F8: string = "F8";
    static KEYNAME_F9: string = "F9";
    static KEYNAME_F10: string = "F10";
    static KEYNAME_F11: string = "F11";
    static KEYNAME_F12: string = "F12";
    static KEYNAME_F13: string = "F13";
    static KEYNAME_F14: string = "F14";
    static KEYNAME_F15: string = "F15";
    static KEYNAME_F16: string = "F16";
    static KEYNAME_F17: string = "F17";
    static KEYNAME_F18: string = "F18";
    static KEYNAME_F19: string = "F19";
    static KEYNAME_F20: string = "F20";
    static KEYNAME_F21: string = "F21";
    static KEYNAME_F22: string = "F22";
    static KEYNAME_F23: string = "F23";
    static KEYNAME_F24: string = "F24";
    static KEYNAME_F25: string = "F25";
    static KEYNAME_F26: string = "F26";
    static KEYNAME_F27: string = "F27";
    static KEYNAME_F28: string = "F28";
    static KEYNAME_F29: string = "F29";
    static KEYNAME_F30: string = "F30";
    static KEYNAME_F31: string = "F31";
    static KEYNAME_F32: string = "F32";
    static KEYNAME_F33: string = "F33";
    static KEYNAME_F34: string = "F34";
    static KEYNAME_F35: string = "F35";
    static KEYNAME_INSERT: string = "Insert";
    static KEYNAME_DELETE: string = "Delete";
    static KEYNAME_HOME: string = "Home";
    static KEYNAME_BEGIN: string = "Begin";
    static KEYNAME_END: string = "End";
    static KEYNAME_PAGEUP: string = "PgUp";
    static KEYNAME_PAGEDOWN: string = "PgDn";
    static KEYNAME_PRINTSCREEN: string = "PrntScrn";
    static KEYNAME_SCROLLLOCK: string = "ScrlLck";
    static KEYNAME_PAUSE: string = "Pause";
    static KEYNAME_SYSREQ: string = "SysReq";
    static KEYNAME_BREAK: string = "Break";
    static KEYNAME_RESET: string = "Reset";
    static KEYNAME_STOP: string = "Stop";
    static KEYNAME_MENU: string = "Menu";
    static KEYNAME_USER: string = "User";
    static KEYNAME_SYSTEM: string = "Sys";
    static KEYNAME_PRINT: string = "Print";
    static KEYNAME_CLEARLINE: string = "ClrLn";
    static KEYNAME_CLEARDISPLAY: string = "ClrDsp";
    static KEYNAME_INSERTLINE: string = "InsLn";
    static KEYNAME_DELETELINE: string = "DelLn";
    static KEYNAME_INSERTCHAR: string = "InsChr";
    static KEYNAME_DELETECHAR: string = "DelChr";
    static KEYNAME_PREV: string = "Prev";
    static KEYNAME_NEXT: string = "Next";
    static KEYNAME_SELECT: string = "Select";
    static KEYNAME_EXECUTE: string = "Exec";
    static KEYNAME_UNDO: string = "Undo";
    static KEYNAME_REDO: string = "Redo";
    static KEYNAME_FIND: string = "Find";
    static KEYNAME_HELP: string = "Help";
    static KEYNAME_MODESWITCH: string = "ModeSw";
    static STRING_UPARROW: string = "";
    static STRING_DOWNARROW: string = "";
    static STRING_LEFTARROW: string = "";
    static STRING_RIGHTARROW: string = "";
    static STRING_F1: string = "";
    static STRING_F2: string = "";
    static STRING_F3: string = "";
    static STRING_F4: string = "";
    static STRING_F5: string = "";
    static STRING_F6: string = "";
    static STRING_F7: string = "";
    static STRING_F8: string = "";
    static STRING_F9: string = "";
    static STRING_F10: string = "";
    static STRING_F11: string = "";
    static STRING_F12: string = "";
    static STRING_F13: string = "";
    static STRING_F14: string = "";
    static STRING_F15: string = "";
    static STRING_F16: string = "";
    static STRING_F17: string = "";
    static STRING_F18: string = "";
    static STRING_F19: string = "";
    static STRING_F20: string = "";
    static STRING_F21: string = "";
    static STRING_F22: string = "";
    static STRING_F23: string = "";
    static STRING_F24: string = "";
    static STRING_F25: string = "";
    static STRING_F26: string = "";
    static STRING_F27: string = "";
    static STRING_F28: string = "";
    static STRING_F29: string = "";
    static STRING_F30: string = "";
    static STRING_F31: string = "";
    static STRING_F32: string = "";
    static STRING_F33: string = "";
    static STRING_F34: string = "";
    static STRING_F35: string = "";
    static STRING_INSERT: string = "";
    static STRING_DELETE: string = "";
    static STRING_HOME: string = "";
    static STRING_BEGIN: string = "";
    static STRING_END: string = "";
    static STRING_PAGEUP: string = "";
    static STRING_PAGEDOWN: string = "";
    static STRING_PRINTSCREEN: string = "";
    static STRING_SCROLLLOCK: string = "";
    static STRING_PAUSE: string = "";
    static STRING_SYSREQ: string = "";
    static STRING_BREAK: string = "";
    static STRING_RESET: string = "";
    static STRING_STOP: string = "";
    static STRING_MENU: string = "";
    static STRING_USER: string = "";
    static STRING_SYSTEM: string = "";
    static STRING_PRINT: string = "";
    static STRING_CLEARLINE: string = "";
    static STRING_CLEARDISPLAY: string = "";
    static STRING_INSERTLINE: string = "";
    static STRING_DELETELINE: string = "";
    static STRING_INSERTCHAR: string = "";
    static STRING_DELETECHAR: string = "";
    static STRING_PREV: string = "";
    static STRING_NEXT: string = "";
    static STRING_SELECT: string = "";
    static STRING_EXECUTE: string = "";
    static STRING_UNDO: string = "";
    static STRING_REDO: string = "";
    static STRING_FIND: string = "";
    static STRING_HELP: string = "";
    static STRING_MODESWITCH: string = "";
    static CharCodeStrings: any [] = undefined;
    static NUMBER_0: number /*uint*/ = 48;
    static NUMBER_1: number /*uint*/ = 49;
    static NUMBER_2: number /*uint*/ = 50;
    static NUMBER_3: number /*uint*/ = 51;
    static NUMBER_4: number /*uint*/ = 52;
    static NUMBER_5: number /*uint*/ = 53;
    static NUMBER_6: number /*uint*/ = 54;
    static NUMBER_7: number /*uint*/ = 55;
    static NUMBER_8: number /*uint*/ = 56;
    static NUMBER_9: number /*uint*/ = 57;
    static A: number /*uint*/ = 65;
    static B: number /*uint*/ = 66;
    static C: number /*uint*/ = 67;
    static D: number /*uint*/ = 68;
    static E: number /*uint*/ = 69;
    static F: number /*uint*/ = 70;
    static G: number /*uint*/ = 71;
    static H: number /*uint*/ = 72;
    static I: number /*uint*/ = 73;
    static J: number /*uint*/ = 74;
    static K: number /*uint*/ = 75;
    static L: number /*uint*/ = 76;
    static M: number /*uint*/ = 77;
    static N: number /*uint*/ = 78;
    static O: number /*uint*/ = 79;
    static P: number /*uint*/ = 80;
    static Q: number /*uint*/ = 81;
    static R: number /*uint*/ = 82;
    static S: number /*uint*/ = 83;
    static T: number /*uint*/ = 84;
    static U: number /*uint*/ = 85;
    static V: number /*uint*/ = 86;
    static W: number /*uint*/ = 87;
    static X: number /*uint*/ = 88;
    static Y: number /*uint*/ = 89;
    static Z: number /*uint*/ = 90;
    static SEMICOLON: number /*uint*/ = 186;
    static EQUAL: number /*uint*/ = 187;
    static COMMA: number /*uint*/ = 188;
    static MINUS: number /*uint*/ = 189;
    static PERIOD: number /*uint*/ = 190;
    static SLASH: number /*uint*/ = 191;
    static BACKQUOTE: number /*uint*/ = 192;
    static LEFTBRACKET: number /*uint*/ = 219;
    static BACKSLASH: number /*uint*/ = 220;
    static RIGHTBRACKET: number /*uint*/ = 221;
    static QUOTE: number /*uint*/ = 222;
    static ALTERNATE: number /*uint*/ = 18;
    static BACKSPACE: number /*uint*/ = 8;
    static CAPS_LOCK: number /*uint*/ = 20;
    static COMMAND: number /*uint*/ = 15;
    static CONTROL: number /*uint*/ = 17;
    static DELETE: number /*uint*/ = 46;
    static DOWN: number /*uint*/ = 40;
    static END: number /*uint*/ = 35;
    static ENTER: number /*uint*/ = 13;
    static ESCAPE: number /*uint*/ = 27;
    static F1: number /*uint*/ = 112;
    static F2: number /*uint*/ = 113;
    static F3: number /*uint*/ = 114;
    static F4: number /*uint*/ = 115;
    static F5: number /*uint*/ = 116;
    static F6: number /*uint*/ = 117;
    static F7: number /*uint*/ = 118;
    static F8: number /*uint*/ = 119;
    static F9: number /*uint*/ = 120;
    static F10: number /*uint*/ = 121;
    static F11: number /*uint*/ = 122;
    static F12: number /*uint*/ = 123;
    static F13: number /*uint*/ = 124;
    static F14: number /*uint*/ = 125;
    static F15: number /*uint*/ = 126;
    static HOME: number /*uint*/ = 36;
    static INSERT: number /*uint*/ = 45;
    static LEFT: number /*uint*/ = 37;
    static NUMPAD: number /*uint*/ = 21;
    static NUMPAD_0: number /*uint*/ = 96;
    static NUMPAD_1: number /*uint*/ = 97;
    static NUMPAD_2: number /*uint*/ = 98;
    static NUMPAD_3: number /*uint*/ = 99;
    static NUMPAD_4: number /*uint*/ = 100;
    static NUMPAD_5: number /*uint*/ = 101;
    static NUMPAD_6: number /*uint*/ = 102;
    static NUMPAD_7: number /*uint*/ = 103;
    static NUMPAD_8: number /*uint*/ = 104;
    static NUMPAD_9: number /*uint*/ = 105;
    static NUMPAD_ADD: number /*uint*/ = 107;
    static NUMPAD_DECIMAL: number /*uint*/ = 110;
    static NUMPAD_DIVIDE: number /*uint*/ = 111;
    static NUMPAD_ENTER: number /*uint*/ = 108;
    static NUMPAD_MULTIPLY: number /*uint*/ = 106;
    static NUMPAD_SUBTRACT: number /*uint*/ = 109;
    static PAGE_DOWN: number /*uint*/ = 34;
    static PAGE_UP: number /*uint*/ = 33;
    static RIGHT: number /*uint*/ = 39;
    static SHIFT: number /*uint*/ = 16;
    static SPACE: number /*uint*/ = 32;
    static TAB: number /*uint*/ = 9;
    static UP: number /*uint*/ = 38;
    static RED: number /*uint*/ = 16777216;
    static GREEN: number /*uint*/ = 16777217;
    static YELLOW: number /*uint*/ = 16777218;
    static BLUE: number /*uint*/ = 16777219;
    static CHANNEL_UP: number /*uint*/ = 16777220;
    static CHANNEL_DOWN: number /*uint*/ = 16777221;
    static RECORD: number /*uint*/ = 16777222;
    static PLAY: number /*uint*/ = 16777223;
    static PAUSE: number /*uint*/ = 16777224;
    static STOP: number /*uint*/ = 16777225;
    static FAST_FORWARD: number /*uint*/ = 16777226;
    static REWIND: number /*uint*/ = 16777227;
    static SKIP_FORWARD: number /*uint*/ = 16777228;
    static SKIP_BACKWARD: number /*uint*/ = 16777229;
    static NEXT: number /*uint*/ = 16777230;
    static PREVIOUS: number /*uint*/ = 16777231;
    static LIVE: number /*uint*/ = 16777232;
    static LAST: number /*uint*/ = 16777233;
    static MENU: number /*uint*/ = 16777234;
    static INFO: number /*uint*/ = 16777235;
    static GUIDE: number /*uint*/ = 16777236;
    static EXIT: number /*uint*/ = 16777237;
    static BACK: number /*uint*/ = 16777238;
    static AUDIO: number /*uint*/ = 16777239;
    static SUBTITLE: number /*uint*/ = 16777240;
    static DVR: number /*uint*/ = 16777241;
    static VOD: number /*uint*/ = 16777242;
    static INPUT: number /*uint*/ = 16777243;
    static SETUP: number /*uint*/ = 16777244;
    static HELP: number /*uint*/ = 16777245;
    static MASTER_SHELL: number /*uint*/ = 16777246;
    static SEARCH: number /*uint*/ = 16777247;
    
    
    // AS -> JS Bindings
    // static _capsLock: boolean;
    // static _numLock: boolean;
    // static _hasVirtualKeyboard: boolean;
    // static _physicalKeyboardType: string;
    static get capsLock(): boolean {
      release || notImplemented("public flash.ui.Keyboard::get capsLock"); return;
      // return this._capsLock;
    }
    static get numLock(): boolean {
      release || notImplemented("public flash.ui.Keyboard::get numLock"); return;
      // return this._numLock;
    }
    static get hasVirtualKeyboard(): boolean {
      release || notImplemented("public flash.ui.Keyboard::get hasVirtualKeyboard"); return;
      // return this._hasVirtualKeyboard;
    }
    static get physicalKeyboardType(): string {
      release || notImplemented("public flash.ui.Keyboard::get physicalKeyboardType"); return;
      // return this._physicalKeyboardType;
    }
    static isAccessible(): boolean {
      release || notImplemented("public flash.ui.Keyboard::static isAccessible"); return;
    }
    
  }
}
