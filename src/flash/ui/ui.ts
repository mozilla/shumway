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

module Shumway.AVMX.AS.flash.ui {
  import somewhatImplemented = Debug.somewhatImplemented;
  import notImplemented = Debug.notImplemented;
  import assert = Debug.assert;
  import InteractiveObject = display.InteractiveObject;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class ContextMenu extends flash.display.NativeMenu {
    static classInitializer: any = null;
    constructor () {
      super();
      this._builtInItems = new this.sec.flash.ui.ContextMenuBuiltInItems();
      this._customItems = [];
    }
    static get isSupported(): boolean {
      somewhatImplemented('ContextMenu::isSupported');
      return false;
    }
    _builtInItems: flash.ui.ContextMenuBuiltInItems;
    _customItems: any [];
    _link: flash.net.URLRequest;
    _clipboardMenu: boolean;
    _clipboardItems: flash.ui.ContextMenuClipboardItems;
    get builtInItems(): flash.ui.ContextMenuBuiltInItems {
      // TODO: Should clone here probably.
      somewhatImplemented("public flash.ui.ContextMenu::get builtInItems");
      return this._builtInItems;
    }
    set builtInItems(value: flash.ui.ContextMenuBuiltInItems) {
      // TODO: Should clone here probably.
      value = value;
      somewhatImplemented("public flash.ui.ContextMenu::set builtInItems");
      this._builtInItems = value;
    }
    get customItems(): ASArray {
      // TODO: Should clone here probably.
      somewhatImplemented("public flash.ui.ContextMenu::get customItems");
      return this.sec.createArrayUnsafe(this._customItems);
    }
    set customItems(value: ASArray) {
      // TODO: Should clone here probably.
      value = value;
      somewhatImplemented("public flash.ui.ContextMenu::set customItems");
      this._customItems = value.value;
    }
    get link(): flash.net.URLRequest {
      somewhatImplemented("public flash.ui.ContextMenu::get link");
      return this._link;
    }
    set link(value: flash.net.URLRequest) {
      value = value;
      somewhatImplemented("public flash.ui.ContextMenu::set link");
      this._link = value;
    }
    get clipboardMenu(): boolean {
      somewhatImplemented("public flash.ui.ContextMenu::get clipboardMenu");
      return this._clipboardMenu;
    }
    set clipboardMenu(value: boolean) {
      value = !!value;
      somewhatImplemented("public flash.ui.ContextMenu::set clipboardMenu");
      this._clipboardMenu = value;
    }
    get clipboardItems(): flash.ui.ContextMenuClipboardItems {
      somewhatImplemented("public flash.ui.ContextMenu::get clipboardItems");
      return this._clipboardItems;
    }
    set clipboardItems(value: flash.ui.ContextMenuClipboardItems) {
      value = value;
      somewhatImplemented("public flash.ui.ContextMenu::set clipboardItems");
      this._clipboardItems = value;
    }
    hideBuiltInItems(): void {
      var items = this.builtInItems;
      if (!items) {
        return;
      }
      items.save = false;
      items.zoom = false;
      items.quality = false;
      items.play = false;
      items.loop = false;
      items.rewind = false;
      items.forwardAndBack = false;
      items.print = false;
    }
    clone(): ContextMenu {
      var result: ContextMenu = new this.sec.flash.ui.ContextMenu();
      result._builtInItems = this._builtInItems.clone();

      this.cloneLinkAndClipboardProperties(result);
      var customItems = this._customItems;
      for (var i = 0; i < customItems.length; i++) {
        result._customItems.push(customItems[i].clone());
      }
      return result;
    }
    cloneLinkAndClipboardProperties(c: flash.ui.ContextMenu): void {
      c = c;
      somewhatImplemented("public flash.ui.ContextMenu::cloneLinkAndClipboardProperties"); return;
    }
  }

  export class ContextMenuBuiltInItems extends ASObject {
    static classInitializer: any = null;
    constructor () {
      super();
      this._save = true;
      this._zoom = true;
      this._quality = true;
      this._play = true;
      this._loop = true;
      this._rewind = true;
      this._forwardAndBack = true;
      this._print = true;
    }
    private _save: boolean;
    private _zoom: boolean;
    private _quality: boolean;
    private _play: boolean;
    private _loop: boolean;
    private _rewind: boolean;
    private _forwardAndBack: boolean;
    private _print: boolean;
    get save(): boolean {
      return this._save;
    }
    set save(val: boolean) {
      this._save = !!val;
    }
    get zoom(): boolean {
      return this._zoom;
    }
    set zoom(val: boolean) {
      this._zoom = !!val;
    }
    get quality(): boolean {
      return this._quality;
    }
    set quality(val: boolean) {
      this._quality = !!val;
    }
    get play(): boolean {
      return this._play;
    }
    set play(val: boolean) {
      this._play = !!val;
    }
    get loop(): boolean {
      return this._loop;
    }
    set loop(val: boolean) {
      this._loop = !!val;
    }
    get rewind(): boolean {
      return this._rewind;
    }
    set rewind(val: boolean) {
      this._rewind = !!val;
    }
    get forwardAndBack(): boolean {
      return this._forwardAndBack;
    }
    set forwardAndBack(val: boolean) {
      this._forwardAndBack = !!val;
    }
    get print(): boolean {
      return this._print;
    }
    set print(val: boolean) {
      this._print = !!val;
    }

    clone(): ContextMenuBuiltInItems {
      var items = new this.sec.flash.ui.ContextMenuBuiltInItems();
      items._save = this._save;
      items._zoom = this._zoom;
      items._quality = this._quality;
      items._play = this._play;
      items._loop = this._loop;
      items._rewind = this._rewind;
      items._forwardAndBack = this._forwardAndBack;
      items._print = this._print;
      return items;
    }
  }

  export class ContextMenuClipboardItems extends ASObject {
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null;
    constructor () {
      super();

      this._cut = true;
      this._copy = true;
      this._paste = true;
      this._clear = true;
      this._selectAll = true;
    }
    _cut: boolean;
    _copy: boolean;
    _paste: boolean;
    _clear: boolean;
    _selectAll: boolean;
    get cut(): boolean {
      somewhatImplemented("cut");
      return this._cut;
    }
    set cut(val: boolean) {
      somewhatImplemented("cut");
      this._cut = !!val;
    }
    get copy(): boolean {
      somewhatImplemented("copy");
      return this._copy;
    }
    set copy(val: boolean) {
      somewhatImplemented("copy");
      this._copy = !!val;
    }
    get paste(): boolean {
      somewhatImplemented("paste");
      return this._paste;
    }
    set paste(val: boolean) {
      somewhatImplemented("paste");
      this._paste = !!val;
    }
    get clear(): boolean {
      somewhatImplemented("clear");
      return this._clear;
    }
    set clear(val: boolean) {
      somewhatImplemented("clear");
      this._clear = !!val;
    }
    get selectAll(): boolean {
      somewhatImplemented("selectAll");
      return this._selectAll;
    }
    set selectAll(val: boolean) {
      somewhatImplemented("selectAll");
      this._selectAll = !!val;
    }
    clone(): ContextMenuClipboardItems {
      var items = new this.sec.flash.ui.ContextMenuClipboardItems();
      items._cut = this._cut;
      items._copy = this._copy;
      items._paste = this._paste;
      items._clear = this._clear;
      items._selectAll = this._selectAll;
      return items;
    }
  }

  export class ContextMenuItem extends flash.display.NativeMenuItem {
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // ["clone"];
    constructor (caption: string, separatorBefore: boolean = false,
                 enabled: boolean = true, visible: boolean = true) {
      super();
      caption = axCoerceString(caption); separatorBefore = !!separatorBefore; enabled = !!enabled; visible = !!visible;
      this._caption = caption ? caption : "";
      this._separatorBefore = separatorBefore;
      this._enabled = enabled;
      this._visible = visible;
    }
    clone: () => flash.ui.ContextMenuItem;
    _caption: string;
    _separatorBefore: boolean;
    _visible: boolean;
    _enabled: boolean;
    get caption(): string {
      return this._caption;
    }
    set caption(value: string) {
      value = axCoerceString(value);
      this._caption = value;
    }
    get separatorBefore(): boolean {
      return this._separatorBefore;
    }
    set separatorBefore(value: boolean) {
      value = !!value;
      this._separatorBefore = value;
    }
    get visible(): boolean {
      return this._visible;
    }
    set visible(value: boolean) {
      value = !!value;
      this._visible = value;
    }
  }

  export class GameInput extends flash.events.EventDispatcher {
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];
    constructor () {
      super(undefined);
    }
    // static _numDevices: number /*int*/;
    // static _isSupported: boolean;
    get numDevices(): number /*int*/ {
      somewhatImplemented("public flash.ui.GameInput::get numDevices");
      return 0;
      // return this._numDevices;
    }
    get isSupported(): boolean {
      somewhatImplemented("public flash.ui.GameInput::get isSupported");
      return false;
    }
    static getDeviceAt(index: number /*int*/): flash.ui.GameInputDevice {
      index = index | 0;
      somewhatImplemented("public flash.ui.GameInput::static getDeviceAt");
      this.sec.throwError("RangeError", Errors.ParamRangeError, "index");
      return null;
    }
  }

  export class GameInputControl extends flash.events.EventDispatcher {
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];
    constructor () {
      super();
    }
    // _numValues: number /*int*/;
    // _index: number /*int*/;
    // _relative: boolean;
    // _type: string;
    // _hand: string;
    // _finger: string;
    // _device: flash.ui.GameInputDevice;
    get numValues(): number /*int*/ {
      release || notImplemented("public flash.ui.GameInputControl::get numValues"); return;
      // return this._numValues;
    }
    get index(): number /*int*/ {
      release || notImplemented("public flash.ui.GameInputControl::get index"); return;
      // return this._index;
    }
    get relative(): boolean {
      release || notImplemented("public flash.ui.GameInputControl::get relative"); return;
      // return this._relative;
    }
    get type(): string {
      release || notImplemented("public flash.ui.GameInputControl::get type"); return;
      // return this._type;
    }
    get hand(): string {
      release || notImplemented("public flash.ui.GameInputControl::get hand"); return;
      // return this._hand;
    }
    get finger(): string {
      release || notImplemented("public flash.ui.GameInputControl::get finger"); return;
      // return this._finger;
    }
    get device(): flash.ui.GameInputDevice {
      release || notImplemented("public flash.ui.GameInputControl::get device"); return;
      // return this._device;
    }
    getValueAt(index: number /*int*/ = 0): number {
      index = index | 0;
      release || notImplemented("public flash.ui.GameInputControl::getValueAt"); return;
    }
  }

  export class GameInputControlType extends ASObject {
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];
    constructor () {
      super();
    }
    //static MOVEMENT: string = "movement";
    //static ROTATION: string = "rotation";
    //static DIRECTION: string = "direction";
    //static ACCELERATION: string = "acceleration";
    //static BUTTON: string = "button";
    //static TRIGGER: string = "trigger";
  }

  export class GameInputDevice extends flash.events.EventDispatcher {
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];
    constructor () {
      super();
    }
    static MAX_BUFFER_SIZE: number /*int*/ = 4800;
    // _numControls: number /*int*/;
    // _sampleInterval: number /*int*/;
    // _enabled: boolean;
    // _id: string;
    // _name: string;
    get numControls(): number /*int*/ {
      release || notImplemented("public flash.ui.GameInputDevice::get numControls"); return;
      // return this._numControls;
    }
    get sampleInterval(): number /*int*/ {
      release || notImplemented("public flash.ui.GameInputDevice::get sampleInterval"); return;
      // return this._sampleInterval;
    }
    set sampleInterval(val: number /*int*/) {
      val = val | 0;
      release || notImplemented("public flash.ui.GameInputDevice::set sampleInterval"); return;
      // this._sampleInterval = val;
    }
    get enabled(): boolean {
      release || notImplemented("public flash.ui.GameInputDevice::get enabled"); return;
      // return this._enabled;
    }
    set enabled(val: boolean) {
      val = !!val;
      release || notImplemented("public flash.ui.GameInputDevice::set enabled"); return;
      // this._enabled = val;
    }
    get id(): string {
      release || notImplemented("public flash.ui.GameInputDevice::get id"); return;
      // return this._id;
    }
    get name(): string {
      release || notImplemented("public flash.ui.GameInputDevice::get name"); return;
      // return this._name;
    }
    getControlAt(i: number /*int*/): flash.ui.GameInputControl {
      i = i | 0;
      release || notImplemented("public flash.ui.GameInputDevice::getControlAt"); return;
    }
    startCachingSamples(numSamples: number /*int*/, controls: GenericVector): void {
      numSamples = numSamples | 0; controls = controls;
      release || notImplemented("public flash.ui.GameInputDevice::startCachingSamples"); return;
    }
    stopCachingSamples(): void {
      release || notImplemented("public flash.ui.GameInputDevice::stopCachingSamples"); return;
    }
    getCachedSamples(data: flash.utils.ByteArray, append: boolean = false): number /*int*/ {
      data = data; append = !!append;
      release || notImplemented("public flash.ui.GameInputDevice::getCachedSamples"); return;
    }
  }

  export class GameInputFinger extends ASObject {
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];
    constructor () {
      super();
    }
    //static THUMB: string = "thumb";
    //static INDEX: string = "index";
    //static MIDDLE: string = "middle";
    //static UNKNOWN: string = "unknown";
  }

  export class GameInputHand extends ASObject {
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];
    constructor () {
      super();
    }
    //static RIGHT: string = "right";
    //static LEFT: string = "left";
    //static UNKNOWN: string = "unknown";
  }

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
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];
    constructor () {
      super();
    }
    //static KEYNAME_UPARROW: string = "Up";
    //static KEYNAME_DOWNARROW: string = "Down";
    //static KEYNAME_LEFTARROW: string = "Left";
    //static KEYNAME_RIGHTARROW: string = "Right";
    //static KEYNAME_F1: string = "F1";
    //static KEYNAME_F2: string = "F2";
    //static KEYNAME_F3: string = "F3";
    //static KEYNAME_F4: string = "F4";
    //static KEYNAME_F5: string = "F5";
    //static KEYNAME_F6: string = "F6";
    //static KEYNAME_F7: string = "F7";
    //static KEYNAME_F8: string = "F8";
    //static KEYNAME_F9: string = "F9";
    //static KEYNAME_F10: string = "F10";
    //static KEYNAME_F11: string = "F11";
    //static KEYNAME_F12: string = "F12";
    //static KEYNAME_F13: string = "F13";
    //static KEYNAME_F14: string = "F14";
    //static KEYNAME_F15: string = "F15";
    //static KEYNAME_F16: string = "F16";
    //static KEYNAME_F17: string = "F17";
    //static KEYNAME_F18: string = "F18";
    //static KEYNAME_F19: string = "F19";
    //static KEYNAME_F20: string = "F20";
    //static KEYNAME_F21: string = "F21";
    //static KEYNAME_F22: string = "F22";
    //static KEYNAME_F23: string = "F23";
    //static KEYNAME_F24: string = "F24";
    //static KEYNAME_F25: string = "F25";
    //static KEYNAME_F26: string = "F26";
    //static KEYNAME_F27: string = "F27";
    //static KEYNAME_F28: string = "F28";
    //static KEYNAME_F29: string = "F29";
    //static KEYNAME_F30: string = "F30";
    //static KEYNAME_F31: string = "F31";
    //static KEYNAME_F32: string = "F32";
    //static KEYNAME_F33: string = "F33";
    //static KEYNAME_F34: string = "F34";
    //static KEYNAME_F35: string = "F35";
    //static KEYNAME_INSERT: string = "Insert";
    //static KEYNAME_DELETE: string = "Delete";
    //static KEYNAME_HOME: string = "Home";
    //static KEYNAME_BEGIN: string = "Begin";
    //static KEYNAME_END: string = "End";
    //static KEYNAME_PAGEUP: string = "PgUp";
    //static KEYNAME_PAGEDOWN: string = "PgDn";
    //static KEYNAME_PRINTSCREEN: string = "PrntScrn";
    //static KEYNAME_SCROLLLOCK: string = "ScrlLck";
    //static KEYNAME_PAUSE: string = "Pause";
    //static KEYNAME_SYSREQ: string = "SysReq";
    //static KEYNAME_BREAK: string = "Break";
    //static KEYNAME_RESET: string = "Reset";
    //static KEYNAME_STOP: string = "Stop";
    //static KEYNAME_MENU: string = "Menu";
    //static KEYNAME_USER: string = "User";
    //static KEYNAME_SYSTEM: string = "Sys";
    //static KEYNAME_PRINT: string = "Print";
    //static KEYNAME_CLEARLINE: string = "ClrLn";
    //static KEYNAME_CLEARDISPLAY: string = "ClrDsp";
    //static KEYNAME_INSERTLINE: string = "InsLn";
    //static KEYNAME_DELETELINE: string = "DelLn";
    //static KEYNAME_INSERTCHAR: string = "InsChr";
    //static KEYNAME_DELETECHAR: string = "DelChr";
    //static KEYNAME_PREV: string = "Prev";
    //static KEYNAME_NEXT: string = "Next";
    //static KEYNAME_SELECT: string = "Select";
    //static KEYNAME_EXECUTE: string = "Exec";
    //static KEYNAME_UNDO: string = "Undo";
    //static KEYNAME_REDO: string = "Redo";
    //static KEYNAME_FIND: string = "Find";
    //static KEYNAME_HELP: string = "Help";
    //static KEYNAME_MODESWITCH: string = "ModeSw";
    //static STRING_UPARROW: string = "";
    //static STRING_DOWNARROW: string = "";
    //static STRING_LEFTARROW: string = "";
    //static STRING_RIGHTARROW: string = "";
    //static STRING_F1: string = "";
    //static STRING_F2: string = "";
    //static STRING_F3: string = "";
    //static STRING_F4: string = "";
    //static STRING_F5: string = "";
    //static STRING_F6: string = "";
    //static STRING_F7: string = "";
    //static STRING_F8: string = "";
    //static STRING_F9: string = "";
    //static STRING_F10: string = "";
    //static STRING_F11: string = "";
    //static STRING_F12: string = "";
    //static STRING_F13: string = "";
    //static STRING_F14: string = "";
    //static STRING_F15: string = "";
    //static STRING_F16: string = "";
    //static STRING_F17: string = "";
    //static STRING_F18: string = "";
    //static STRING_F19: string = "";
    //static STRING_F20: string = "";
    //static STRING_F21: string = "";
    //static STRING_F22: string = "";
    //static STRING_F23: string = "";
    //static STRING_F24: string = "";
    //static STRING_F25: string = "";
    //static STRING_F26: string = "";
    //static STRING_F27: string = "";
    //static STRING_F28: string = "";
    //static STRING_F29: string = "";
    //static STRING_F30: string = "";
    //static STRING_F31: string = "";
    //static STRING_F32: string = "";
    //static STRING_F33: string = "";
    //static STRING_F34: string = "";
    //static STRING_F35: string = "";
    //static STRING_INSERT: string = "";
    //static STRING_DELETE: string = "";
    //static STRING_HOME: string = "";
    //static STRING_BEGIN: string = "";
    //static STRING_END: string = "";
    //static STRING_PAGEUP: string = "";
    //static STRING_PAGEDOWN: string = "";
    //static STRING_PRINTSCREEN: string = "";
    //static STRING_SCROLLLOCK: string = "";
    //static STRING_PAUSE: string = "";
    //static STRING_SYSREQ: string = "";
    //static STRING_BREAK: string = "";
    //static STRING_RESET: string = "";
    //static STRING_STOP: string = "";
    //static STRING_MENU: string = "";
    //static STRING_USER: string = "";
    //static STRING_SYSTEM: string = "";
    //static STRING_PRINT: string = "";
    //static STRING_CLEARLINE: string = "";
    //static STRING_CLEARDISPLAY: string = "";
    //static STRING_INSERTLINE: string = "";
    //static STRING_DELETELINE: string = "";
    //static STRING_INSERTCHAR: string = "";
    //static STRING_DELETECHAR: string = "";
    //static STRING_PREV: string = "";
    //static STRING_NEXT: string = "";
    //static STRING_SELECT: string = "";
    //static STRING_EXECUTE: string = "";
    //static STRING_UNDO: string = "";
    //static STRING_REDO: string = "";
    //static STRING_FIND: string = "";
    //static STRING_HELP: string = "";
    //static STRING_MODESWITCH: string = "";
    //static CharCodeStrings: any [] = undefined;
    //static NUMBER_0: number /*uint*/ = 48;
    //static NUMBER_1: number /*uint*/ = 49;
    //static NUMBER_2: number /*uint*/ = 50;
    //static NUMBER_3: number /*uint*/ = 51;
    //static NUMBER_4: number /*uint*/ = 52;
    //static NUMBER_5: number /*uint*/ = 53;
    //static NUMBER_6: number /*uint*/ = 54;
    //static NUMBER_7: number /*uint*/ = 55;
    //static NUMBER_8: number /*uint*/ = 56;
    //static NUMBER_9: number /*uint*/ = 57;
    //static A: number /*uint*/ = 65;
    //static B: number /*uint*/ = 66;
    //static C: number /*uint*/ = 67;
    //static D: number /*uint*/ = 68;
    //static E: number /*uint*/ = 69;
    //static F: number /*uint*/ = 70;
    //static G: number /*uint*/ = 71;
    //static H: number /*uint*/ = 72;
    //static I: number /*uint*/ = 73;
    //static J: number /*uint*/ = 74;
    //static K: number /*uint*/ = 75;
    //static L: number /*uint*/ = 76;
    //static M: number /*uint*/ = 77;
    //static N: number /*uint*/ = 78;
    //static O: number /*uint*/ = 79;
    //static P: number /*uint*/ = 80;
    //static Q: number /*uint*/ = 81;
    //static R: number /*uint*/ = 82;
    //static S: number /*uint*/ = 83;
    //static T: number /*uint*/ = 84;
    //static U: number /*uint*/ = 85;
    //static V: number /*uint*/ = 86;
    //static W: number /*uint*/ = 87;
    //static X: number /*uint*/ = 88;
    //static Y: number /*uint*/ = 89;
    //static Z: number /*uint*/ = 90;
    //static SEMICOLON: number /*uint*/ = 186;
    //static EQUAL: number /*uint*/ = 187;
    //static COMMA: number /*uint*/ = 188;
    //static MINUS: number /*uint*/ = 189;
    //static PERIOD: number /*uint*/ = 190;
    //static SLASH: number /*uint*/ = 191;
    //static BACKQUOTE: number /*uint*/ = 192;
    //static LEFTBRACKET: number /*uint*/ = 219;
    //static BACKSLASH: number /*uint*/ = 220;
    //static RIGHTBRACKET: number /*uint*/ = 221;
    //static QUOTE: number /*uint*/ = 222;
    //static ALTERNATE: number /*uint*/ = 18;
    //static BACKSPACE: number /*uint*/ = 8;
    //static CAPS_LOCK: number /*uint*/ = 20;
    //static COMMAND: number /*uint*/ = 15;
    //static CONTROL: number /*uint*/ = 17;
    //static DELETE: number /*uint*/ = 46;
    //static DOWN: number /*uint*/ = 40;
    //static END: number /*uint*/ = 35;
    //static ENTER: number /*uint*/ = 13;
    //static ESCAPE: number /*uint*/ = 27;
    //static F1: number /*uint*/ = 112;
    //static F2: number /*uint*/ = 113;
    //static F3: number /*uint*/ = 114;
    //static F4: number /*uint*/ = 115;
    //static F5: number /*uint*/ = 116;
    //static F6: number /*uint*/ = 117;
    //static F7: number /*uint*/ = 118;
    //static F8: number /*uint*/ = 119;
    //static F9: number /*uint*/ = 120;
    //static F10: number /*uint*/ = 121;
    //static F11: number /*uint*/ = 122;
    //static F12: number /*uint*/ = 123;
    //static F13: number /*uint*/ = 124;
    //static F14: number /*uint*/ = 125;
    //static F15: number /*uint*/ = 126;
    //static HOME: number /*uint*/ = 36;
    //static INSERT: number /*uint*/ = 45;
    //static LEFT: number /*uint*/ = 37;
    //static NUMPAD: number /*uint*/ = 21;
    //static NUMPAD_0: number /*uint*/ = 96;
    //static NUMPAD_1: number /*uint*/ = 97;
    //static NUMPAD_2: number /*uint*/ = 98;
    //static NUMPAD_3: number /*uint*/ = 99;
    //static NUMPAD_4: number /*uint*/ = 100;
    //static NUMPAD_5: number /*uint*/ = 101;
    //static NUMPAD_6: number /*uint*/ = 102;
    //static NUMPAD_7: number /*uint*/ = 103;
    //static NUMPAD_8: number /*uint*/ = 104;
    //static NUMPAD_9: number /*uint*/ = 105;
    //static NUMPAD_ADD: number /*uint*/ = 107;
    //static NUMPAD_DECIMAL: number /*uint*/ = 110;
    //static NUMPAD_DIVIDE: number /*uint*/ = 111;
    //static NUMPAD_ENTER: number /*uint*/ = 108;
    //static NUMPAD_MULTIPLY: number /*uint*/ = 106;
    //static NUMPAD_SUBTRACT: number /*uint*/ = 109;
    //static PAGE_DOWN: number /*uint*/ = 34;
    //static PAGE_UP: number /*uint*/ = 33;
    //static RIGHT: number /*uint*/ = 39;
    //static SHIFT: number /*uint*/ = 16;
    //static SPACE: number /*uint*/ = 32;
    //static TAB: number /*uint*/ = 9;
    //static UP: number /*uint*/ = 38;
    //static RED: number /*uint*/ = 16777216;
    //static GREEN: number /*uint*/ = 16777217;
    //static YELLOW: number /*uint*/ = 16777218;
    //static BLUE: number /*uint*/ = 16777219;
    //static CHANNEL_UP: number /*uint*/ = 16777220;
    //static CHANNEL_DOWN: number /*uint*/ = 16777221;
    //static RECORD: number /*uint*/ = 16777222;
    //static PLAY: number /*uint*/ = 16777223;
    //static PAUSE: number /*uint*/ = 16777224;
    //static STOP: number /*uint*/ = 16777225;
    //static FAST_FORWARD: number /*uint*/ = 16777226;
    //static REWIND: number /*uint*/ = 16777227;
    //static SKIP_FORWARD: number /*uint*/ = 16777228;
    //static SKIP_BACKWARD: number /*uint*/ = 16777229;
    //static NEXT: number /*uint*/ = 16777230;
    //static PREVIOUS: number /*uint*/ = 16777231;
    //static LIVE: number /*uint*/ = 16777232;
    //static LAST: number /*uint*/ = 16777233;
    //static MENU: number /*uint*/ = 16777234;
    //static INFO: number /*uint*/ = 16777235;
    //static GUIDE: number /*uint*/ = 16777236;
    //static EXIT: number /*uint*/ = 16777237;
    //static BACK: number /*uint*/ = 16777238;
    //static AUDIO: number /*uint*/ = 16777239;
    //static SUBTITLE: number /*uint*/ = 16777240;
    //static DVR: number /*uint*/ = 16777241;
    //static VOD: number /*uint*/ = 16777242;
    //static INPUT: number /*uint*/ = 16777243;
    //static SETUP: number /*uint*/ = 16777244;
    //static HELP: number /*uint*/ = 16777245;
    //static MASTER_SHELL: number /*uint*/ = 16777246;
    //static SEARCH: number /*uint*/ = 16777247;
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

  //export class KeyboardType extends ASObject {
  //
  //  // Called whenever the class is initialized.
  //  static classInitializer: any = null;
  //
  //  // List of static symbols to link.
  //  static classSymbols: string [] = null; // [];
  //
  //  // List of instance symbols to link.
  //  static instanceSymbols: string [] = null; // [];
  //
  //  constructor () {
  //    super();
  //  }
  //
  //  static ALPHANUMERIC: string = "alphanumeric";
  //  static KEYPAD: string = "keypad";
  //  static NONE: string = "none";
  //}

  //export class KeyLocation extends ASObject {
  //
  //  // Called whenever the class is initialized.
  //  static classInitializer: any = null;
  //
  //  // List of static symbols to link.
  //  static classSymbols: string [] = null; // [];
  //
  //  // List of instance symbols to link.
  //  static instanceSymbols: string [] = null; // [];
  //
  //  constructor () {
  //    super();
  //  }
  //
  //  static STANDARD: number /*uint*/ = undefined;
  //  static LEFT: number /*uint*/ = 1;
  //  static RIGHT: number /*uint*/ = 2;
  //  static NUM_PAD: number /*uint*/ = 3;
  //  static D_PAD: number /*uint*/ = 4;
  //}

  /**
   * Dispatches AS3 mouse events.
   */
  export class MouseEventDispatcher {
    stage: flash.display.Stage = null;
    currentTarget: flash.display.InteractiveObject = null;

    /**
     * Finds the interactive object on which the event is dispatched.
     */
    private _findTarget(point: flash.geom.Point,
                        testingType: flash.display.HitTestingType): flash.display.DisplayObject {
      var globalX = point.x * 20 | 0;
      var globalY = point.y * 20 | 0;
      var objects = [];
      this.stage._containsGlobalPoint(globalX, globalY, testingType, objects);
      release || assert(objects.length < 2);
      if (objects.length) {
        return objects[0];
      }
      return objects.length ? objects[0] : null;
    }

    /**
     * Converts DOM mouse event data into AS3 mouse events.
     */
    private _dispatchMouseEvent(target: flash.display.InteractiveObject, type: string,
                                data: MouseEventAndPointData,
                                relatedObject: flash.display.InteractiveObject = null) {
      var localPoint = target.globalToLocal(data.point);
      var event = new this.stage.sec.flash.events.MouseEvent (
        type,
        type !== events.MouseEvent.ROLL_OVER &&
        type !== events.MouseEvent.ROLL_OUT &&
        type !== events.MouseEvent.MOUSE_LEAVE,
        false,
        localPoint.x,
        localPoint.y,
        relatedObject,
        data.ctrlKey,
        data.altKey,
        data.shiftKey,
        !!data.buttons
      );
      target.dispatchEvent(event);
    }

    /**
     * Handles the mouse event and returns the target on which the event was dispatched.
     */
    public handleMouseEvent(data: MouseEventAndPointData): InteractiveObject {
      var stage = this.stage;
      if (!stage) {
        return stage;
      }

      var globalPoint = data.point;
      var mouseClass = this.stage.sec.flash.ui.Mouse.axClass;
      mouseClass.updateCurrentPosition(globalPoint);

      var currentTarget = this.currentTarget;
      var target: InteractiveObject = null;

      var type = flash.events.MouseEvent.typeFromDOMType(data.type);

      if (globalPoint.x >= 0 && globalPoint.x < stage.stageWidth &&
          globalPoint.y >= 0 && globalPoint.y < stage.stageHeight) {
        target = <InteractiveObject>this._findTarget(globalPoint, flash.display.HitTestingType.Mouse) || this.stage;
      } else {
        if (!currentTarget) {
          return stage;
        }
        this._dispatchMouseEvent(stage, events.MouseEvent.MOUSE_LEAVE, data);
        if (type !== events.MouseEvent.MOUSE_MOVE) {
          return stage;
        }
      }

      if (mouseClass.draggableObject) {
        var dropTarget = this._findTarget(globalPoint, flash.display.HitTestingType.Drop);
        mouseClass.draggableObject._updateDragState(dropTarget);
      }

      switch (type) {
        case events.MouseEvent.MOUSE_DOWN:
          if (data.buttons & MouseButtonFlags.Left) {
            data.buttons = MouseButtonFlags.Left;
          } else if (data.buttons & MouseButtonFlags.Middle) {
            type = events.MouseEvent.MIDDLE_MOUSE_DOWN;
            data.buttons = MouseButtonFlags.Middle;
          } else if (data.buttons & MouseButtonFlags.Right) {
            type = events.MouseEvent.RIGHT_MOUSE_DOWN;
            data.buttons = MouseButtonFlags.Right;
          }
          target._mouseDown = true;
          break;
        case events.MouseEvent.MOUSE_UP:
          if (data.buttons & MouseButtonFlags.Left) {
            data.buttons = MouseButtonFlags.Left;
          } else if (data.buttons & MouseButtonFlags.Middle) {
            type = events.MouseEvent.MIDDLE_MOUSE_UP;
            data.buttons = MouseButtonFlags.Middle;
          } else if (data.buttons & MouseButtonFlags.Right) {
            type = events.MouseEvent.RIGHT_MOUSE_UP;
            data.buttons = MouseButtonFlags.Right;
          }
          target._mouseDown = false;
          break;
        case events.MouseEvent.CLICK:
          if (!(data.buttons & MouseButtonFlags.Left)) {
            if (data.buttons & MouseButtonFlags.Middle) {
              type = events.MouseEvent.MIDDLE_CLICK;
            } else if (data.buttons & MouseButtonFlags.Right) {
              type = events.MouseEvent.RIGHT_CLICK;
            }
          }
          data.buttons = 0;
          break;
        case events.MouseEvent.DOUBLE_CLICK:
          if (!target.doubleClickEnabled) {
            return;
          }
          data.buttons = 0;
          break;
        case events.MouseEvent.MOUSE_MOVE:
          this.currentTarget = target;
          data.buttons &= MouseButtonFlags.Left;
          if (target === currentTarget) {
            break;
          }
          var commonAncestor = target ? target.findNearestCommonAncestor(currentTarget) : stage;
          if (currentTarget && currentTarget !== stage) {
            currentTarget._mouseOver = false;
            // TODO: Support track as menu.
            currentTarget._mouseDown = false;
            this._dispatchMouseEvent(currentTarget, events.MouseEvent.MOUSE_OUT, data, target);
            var nodeLeft = currentTarget;
            while (nodeLeft && nodeLeft !== commonAncestor) {
              this._dispatchMouseEvent(nodeLeft, events.MouseEvent.ROLL_OUT, data, target);
              nodeLeft = nodeLeft.parent;
            }
          }
          if (!target) {
            return stage;
          }
          if (target === stage) {
            break;
          }
          var nodeEntered = target;
          while (nodeEntered && nodeEntered !== commonAncestor) {
            this._dispatchMouseEvent(nodeEntered, events.MouseEvent.ROLL_OVER, data, currentTarget);
            nodeEntered = nodeEntered.parent;
          }
          target._mouseOver = true;
          this._dispatchMouseEvent(target, events.MouseEvent.MOUSE_OVER, data, currentTarget);
          return target;
      }
      // TODO: handle MOUSE_WHEEL and MOUSE_RELEASE_OUTSIDE
      this._dispatchMouseEvent(target, type, data);
      return target;
    }
  }

  export enum MouseButtonFlags {
    Left    = 0x01,
    Middle  = 0x02,
    Right   = 0x04
  }

  export interface MouseEventAndPointData {
    type: string;
    point: flash.geom.Point;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    buttons: MouseButtonFlags;
  }

  export class Mouse extends ASObject {
    static axClass: typeof Mouse;
    static classInitializer() {
      this._currentPosition = new this.sec.flash.geom.Point();
      this._cursor = MouseCursor.AUTO;
      this.draggableObject = null;
    }
    constructor () {
      super();
    }
    //static _supportsCursor: boolean;
    static _cursor: string;
    //static _supportsNativeCursor: boolean;
    static get supportsCursor(): boolean {
      return true;
    }
    static get cursor(): string {
      return this._cursor;
    }
    static set cursor(value: string) {
      value = axCoerceString(value);
      if (MouseCursor.toNumber(value) < 0) {
        this.sec.throwError("ArgumentError", Errors.InvalidParamError, "cursor");
      }
      this._cursor = value;
    }
    static get supportsNativeCursor(): boolean {
      return true;
    }
    static hide(): void {
      somewhatImplemented("public flash.ui.Mouse::static hide"); return;
    }
    static show(): void {
      somewhatImplemented("public flash.ui.Mouse::static show"); return;
    }
    static registerCursor(name: string, cursor: flash.ui.MouseCursorData): void {
      name = axCoerceString(name); cursor = cursor;
      release || notImplemented("public flash.ui.Mouse::static registerCursor"); return;
    }
    static unregisterCursor(name: string): void {
      name = axCoerceString(name);
      release || notImplemented("public flash.ui.Mouse::static unregisterCursor"); return;
    }
    static _currentPosition: flash.geom.Point;
    /**
     * Remembers the current mouse position.
     */
    public static updateCurrentPosition(value: flash.geom.Point) {
      this._currentPosition.copyFrom(value);
    }
    static draggableObject: flash.display.Sprite;
  }

  export class MouseCursor extends ASObject {
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];
    constructor () {
      super();
    }
    static AUTO: string = "auto";
    static ARROW: string = "arrow";
    static BUTTON: string = "button";
    static HAND: string = "hand";
    static IBEAM: string = "ibeam";
    static fromNumber(n: number): string {
      switch (n) {
        case 0:
          return MouseCursor.AUTO;
        case 1:
          return MouseCursor.ARROW;
        case 2:
          return MouseCursor.BUTTON;
        case 3:
          return MouseCursor.HAND;
        case 4:
          return MouseCursor.IBEAM;
        default:
          return null;
      }
    }
    static toNumber(value: string): number {
      switch (value) {
        case MouseCursor.AUTO:
          return 0;
        case MouseCursor.ARROW:
          return 1;
        case MouseCursor.BUTTON:
          return 2;
        case MouseCursor.HAND:
          return 3;
        case MouseCursor.IBEAM:
          return 4;
        default:
          return -1;
      }
    }
  }

  export class MouseCursorData extends ASObject {
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];
    constructor () {
      super();
    }
    // _data: ASVector<any>;
    // _hotSpot: flash.geom.Point;
    // _frameRate: number;
    get data(): GenericVector {
      release || notImplemented("public flash.ui.MouseCursorData::get data"); return;
      // return this._data;
    }
    set data(data: GenericVector) {
      data = data;
      release || notImplemented("public flash.ui.MouseCursorData::set data"); return;
      // this._data = data;
    }
    get hotSpot(): flash.geom.Point {
      release || notImplemented("public flash.ui.MouseCursorData::get hotSpot"); return;
      // return this._hotSpot;
    }
    set hotSpot(data: flash.geom.Point) {
      data = data;
      release || notImplemented("public flash.ui.MouseCursorData::set hotSpot"); return;
      // this._hotSpot = data;
    }
    get frameRate(): number {
      release || notImplemented("public flash.ui.MouseCursorData::get frameRate"); return;
      // return this._frameRate;
    }
    set frameRate(data: number) {
      data = +data;
      release || notImplemented("public flash.ui.MouseCursorData::set frameRate"); return;
      // this._frameRate = data;
    }
  }

  export class Multitouch extends ASObject {
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];
    constructor () {
      super();
    }
    // static _inputMode: string;
    // static _supportsTouchEvents: boolean;
    // static _supportsGestureEvents: boolean;
    // static _supportedGestures: ASVector<any>;
    // static _maxTouchPoints: number /*int*/;
    // static _mapTouchToMouse: boolean;
    static get inputMode(): string {
      release || notImplemented("public flash.ui.Multitouch::get inputMode"); return;
      // return this._inputMode;
    }
    static set inputMode(value: string) {
      value = axCoerceString(value);
      release || notImplemented("public flash.ui.Multitouch::set inputMode"); return;
      // this._inputMode = value;
    }
    static get supportsTouchEvents(): boolean {
      somewhatImplemented("public flash.ui.Multitouch::get supportsTouchEvents");
      return false;
      // return this._supportsTouchEvents;
    }
    static get supportsGestureEvents(): boolean {
      somewhatImplemented("public flash.ui.Multitouch::get supportsGestureEvents");
      return false;
      // return this._supportsGestureEvents;
    }
    static get supportedGestures(): GenericVector {
      somewhatImplemented("public flash.ui.Multitouch::get supportedGestures");
      return null;
      // return this._supportedGestures;
    }
    static get maxTouchPoints(): number /*int*/ {
      somewhatImplemented("public flash.ui.Multitouch::get maxTouchPoints");
      return 0;
      // return this._maxTouchPoints;
    }
    static get mapTouchToMouse(): boolean {
      somewhatImplemented("public flash.ui.Multitouch::get mapTouchToMouse");
      return true;
      // return this._mapTouchToMouse;
    }
    static set mapTouchToMouse(value: boolean) {
      value = !!value;
      release || notImplemented("public flash.ui.Multitouch::set mapTouchToMouse"); return;
      // this._mapTouchToMouse = value;
    }
  }

  export class MultitouchInputMode extends ASObject {
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];
    constructor () {
      super();
    }
    //static NONE: string = "none";
    //static GESTURE: string = "gesture";
    //static TOUCH_POINT: string = "touchPoint";
  }
}
