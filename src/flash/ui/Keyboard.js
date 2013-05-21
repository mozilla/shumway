/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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

var ShumwayKeyboardListener = {
  _lastKeyCode: 0,
  _captureKeyPress: false,
  focus: null,
  handleEvent: function (domEvt) {
    var keyCode = domEvt.keyCode;
    if (domEvt.type === 'keydown') {
      this._lastKeyCode = keyCode;
      // trying to capture charCode for ASCII keys
      this._captureKeyPress = keyCode === 8 || keyCode === 9 ||
        keyCode === 13 || keyCode === 32 || (keyCode >= 48 && keyCode <= 90) ||
        keyCode > 145;
      if (this._captureKeyPress) {
        return; // skipping keydown, waiting for keypress
      }
    } else if (domEvt.type === 'keypress') {
      if (this._captureKeyPress) {
        keyCode = this._lastKeyCode;
      } else {
        return;
      }
    }

    if (this.focus) {
      this.focus._dispatchEvent(new flash.events.KeyboardEvent(
        domEvt.type === 'keyup' ? 'keyUp' : 'keyDown',
        true,
        false,
        domEvt.charCode,
        domEvt.type === 'keyup' ? domEvt.keyCode : this._lastKeyCode,
        domEvt.keyLocation,
        domEvt.ctrlKey,
        domEvt.altKey,
        domEvt.shiftKey
      ));
    }
  }
};

window.addEventListener('keydown', ShumwayKeyboardListener);
window.addEventListener('keypress', ShumwayKeyboardListener);
window.addEventListener('keyup', ShumwayKeyboardListener);

var KeyboardDefinition = (function () {
  var def = {
    get capsLock() {
      return false; // TODO Stage.instance.$keyboard.capsLock;
    },
    get hasVirtualKeyboard() {
      return false; // TODO Stage.instance.$keyboard.hasVirtualKeyboard;
    },
    get numLock() {
      return false; // TODO Stage.instance.$keyboard.numLock;
    },
    get physicalKeyboardType() {
      return 'alphanumeric'; // TODO Stage.instance.$keyboard.physicalKeyboardType;
    },
    get isAccessible() {
      return true; // TODO
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    script: {
      static: scriptProperties("public", ["A",
                                          "ALTERNATE",
                                          "AUDIO",
                                          "B",
                                          "BACK",
                                          "BACKQUOTE",
                                          "BACKSLASH",
                                          "BACKSPACE",
                                          "BLUE",
                                          "C",
                                          "CAPS_LOCK",
                                          "CHANNEL_DOWN",
                                          "CHANNEL_UP",
                                          "COMMA",
                                          "COMMAND",
                                          "CONTROL",
                                          "D",
                                          "DELETE",
                                          "DOWN",
                                          "DVR",
                                          "E",
                                          "END",
                                          "ENTER",
                                          "EQUAL",
                                          "ESCAPE",
                                          "EXIT",
                                          "F",
                                          "F1",
                                          "F10",
                                          "F11",
                                          "F12",
                                          "F13",
                                          "F14",
                                          "F15",
                                          "F2",
                                          "F3",
                                          "F4",
                                          "F5",
                                          "F6",
                                          "F7",
                                          "F8",
                                          "F9",
                                          "FAST_FORWARD",
                                          "G",
                                          "GREEN",
                                          "GUIDE",
                                          "H",
                                          "HELP",
                                          "HOME",
                                          "I",
                                          "INFO",
                                          "INPUT",
                                          "INSERT",
                                          "J",
                                          "K",
                                          "KEYNAME_BEGIN",
                                          "KEYNAME_BREAK",
                                          "KEYNAME_CLEARDISPLAY",
                                          "KEYNAME_CLEARLINE",
                                          "KEYNAME_DELETE",
                                          "KEYNAME_DELETECHAR",
                                          "KEYNAME_DELETELINE",
                                          "KEYNAME_DOWNARROW",
                                          "KEYNAME_END",
                                          "KEYNAME_EXECUTE",
                                          "KEYNAME_F1",
                                          "KEYNAME_F10",
                                          "KEYNAME_F11",
                                          "KEYNAME_F12",
                                          "KEYNAME_F13",
                                          "KEYNAME_F14",
                                          "KEYNAME_F15",
                                          "KEYNAME_F16",
                                          "KEYNAME_F17",
                                          "KEYNAME_F18",
                                          "KEYNAME_F19",
                                          "KEYNAME_F2",
                                          "KEYNAME_F20",
                                          "KEYNAME_F21",
                                          "KEYNAME_F22",
                                          "KEYNAME_F23",
                                          "KEYNAME_F24",
                                          "KEYNAME_F25",
                                          "KEYNAME_F26",
                                          "KEYNAME_F27",
                                          "KEYNAME_F28",
                                          "KEYNAME_F29",
                                          "KEYNAME_F3",
                                          "KEYNAME_F30",
                                          "KEYNAME_F31",
                                          "KEYNAME_F32",
                                          "KEYNAME_F33",
                                          "KEYNAME_F34",
                                          "KEYNAME_F35",
                                          "KEYNAME_F4",
                                          "KEYNAME_F5",
                                          "KEYNAME_F6",
                                          "KEYNAME_F7",
                                          "KEYNAME_F8",
                                          "KEYNAME_F9",
                                          "KEYNAME_FIND",
                                          "KEYNAME_HELP",
                                          "KEYNAME_HOME",
                                          "KEYNAME_INSERT",
                                          "KEYNAME_INSERTCHAR",
                                          "KEYNAME_INSERTLINE",
                                          "KEYNAME_LEFTARROW",
                                          "KEYNAME_MENU",
                                          "KEYNAME_MODESWITCH",
                                          "KEYNAME_NEXT",
                                          "KEYNAME_PAGEDOWN",
                                          "KEYNAME_PAGEUP",
                                          "KEYNAME_PAUSE",
                                          "KEYNAME_PREV",
                                          "KEYNAME_PRINT",
                                          "KEYNAME_PRINTSCREEN",
                                          "KEYNAME_REDO",
                                          "KEYNAME_RESET",
                                          "KEYNAME_RIGHTARROW",
                                          "KEYNAME_SCROLLLOCK",
                                          "KEYNAME_SELECT",
                                          "KEYNAME_STOP",
                                          "KEYNAME_SYSREQ",
                                          "KEYNAME_SYSTEM",
                                          "KEYNAME_UNDO",
                                          "KEYNAME_UPARROW",
                                          "KEYNAME_USER",
                                          "L",
                                          "LAST",
                                          "LEFT",
                                          "LEFTBRACKET",
                                          "LIVE",
                                          "M",
                                          "MASTER_SHELL",
                                          "MENU",
                                          "MINUS",
                                          "N",
                                          "NEXT",
                                          "NUMBER_0",
                                          "NUMBER_1",
                                          "NUMBER_2",
                                          "NUMBER_3",
                                          "NUMBER_4",
                                          "NUMBER_5",
                                          "NUMBER_6",
                                          "NUMBER_7",
                                          "NUMBER_8",
                                          "NUMBER_9",
                                          "NUMPAD",
                                          "NUMPAD_0",
                                          "NUMPAD_1",
                                          "NUMPAD_2",
                                          "NUMPAD_3",
                                          "NUMPAD_4",
                                          "NUMPAD_5",
                                          "NUMPAD_6",
                                          "NUMPAD_7",
                                          "NUMPAD_8",
                                          "NUMPAD_9",
                                          "NUMPAD_ADD",
                                          "NUMPAD_DECIMAL",
                                          "NUMPAD_DIVIDE",
                                          "NUMPAD_ENTER",
                                          "NUMPAD_MULTIPLY",
                                          "NUMPAD_SUBTRACT",
                                          "O",
                                          "P",
                                          "PAGE_DOWN",
                                          "PAGE_UP",
                                          "PAUSE",
                                          "PERIOD",
                                          "PLAY",
                                          "PREVIOUS",
                                          "Q",
                                          "QUOTE",
                                          "R",
                                          "RECORD",
                                          "RED",
                                          "REWIND",
                                          "RIGHT",
                                          "RIGHTBRACKET",
                                          "S",
                                          "SEARCH",
                                          "SEMICOLON",
                                          "SETUP",
                                          "SHIFT",
                                          "SKIP_BACKWARD",
                                          "SKIP_FORWARD",
                                          "SLASH",
                                          "SPACE",
                                          "STOP",
                                          "STRING_BEGIN",
                                          "STRING_BREAK",
                                          "STRING_CLEARDISPLAY",
                                          "STRING_CLEARLINE",
                                          "STRING_DELETE",
                                          "STRING_DELETECHAR",
                                          "STRING_DELETELINE",
                                          "STRING_DOWNARROW",
                                          "STRING_END",
                                          "STRING_EXECUTE",
                                          "STRING_F1",
                                          "STRING_F10",
                                          "STRING_F11",
                                          "STRING_F12",
                                          "STRING_F13",
                                          "STRING_F14",
                                          "STRING_F15",
                                          "STRING_F16",
                                          "STRING_F17",
                                          "STRING_F18",
                                          "STRING_F19",
                                          "STRING_F2",
                                          "STRING_F20",
                                          "STRING_F21",
                                          "STRING_F22",
                                          "STRING_F23",
                                          "STRING_F24",
                                          "STRING_F25",
                                          "STRING_F26",
                                          "STRING_F27",
                                          "STRING_F28",
                                          "STRING_F29",
                                          "STRING_F3",
                                          "STRING_F30",
                                          "STRING_F31",
                                          "STRING_F32",
                                          "STRING_F33",
                                          "STRING_F34",
                                          "STRING_F35",
                                          "STRING_F4",
                                          "STRING_F5",
                                          "STRING_F6",
                                          "STRING_F7",
                                          "STRING_F8",
                                          "STRING_F9",
                                          "STRING_FIND",
                                          "STRING_HELP",
                                          "STRING_HOME",
                                          "STRING_INSERT",
                                          "STRING_INSERTCHAR",
                                          "STRING_INSERTLINE",
                                          "STRING_LEFTARROW",
                                          "STRING_MENU",
                                          "STRING_MODESWITCH",
                                          "STRING_NEXT",
                                          "STRING_PAGEDOWN",
                                          "STRING_PAGEUP",
                                          "STRING_PAUSE",
                                          "STRING_PREV",
                                          "STRING_PRINT",
                                          "STRING_PRINTSCREEN",
                                          "STRING_REDO",
                                          "STRING_RESET",
                                          "STRING_RIGHTARROW",
                                          "STRING_SCROLLLOCK",
                                          "STRING_SELECT",
                                          "STRING_STOP",
                                          "STRING_SYSREQ",
                                          "STRING_SYSTEM",
                                          "STRING_UNDO",
                                          "STRING_UPARROW",
                                          "STRING_USER",
                                          "SUBTITLE",
                                          "T",
                                          "TAB",
                                          "U",
                                          "UP",
                                          "V",
                                          "VOD",
                                          "W",
                                          "X",
                                          "Y",
                                          "YELLOW",
                                          "Z",

                                          "CharCodeStrings"])
    },

    native: {
      instance: {
        capsLock: desc(def, "capsLock"),
        hasVirtualKeyboard: desc(def, "hasVirtualKeyboard"),
        numLock: desc(def, "numLock"),
        physicalKeyboardType: desc(def, "physicalKeyboardType"),
        isAccessible: desc(def, "isAccessible")
      }
    }
  };

  return def;
}).call(this);
