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
// Class: LoaderInfo
module Shumway.AVM2.AS.flash.display {
  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  import ActionScriptVersion = flash.display.ActionScriptVersion;
  import SWFFile = Shumway.SWF.SWFFile;
  import SWFFrame = Shumway.SWF.SWFFrame;

  export class LoaderInfo extends flash.events.EventDispatcher {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["parameters", "uncaughtErrorEvents", "dispatchEvent"];

    constructor () {
      false && super();
      flash.events.EventDispatcher.instanceConstructorNoInitialize.call(this);
      this._loaderURL = '';
      this._url = '';
      this._file = null;
      this._isURLInaccessible = false;
      this._bytesLoaded = 0;
      this._newBytesLoaded = 0;
      this._bytesTotal = 0;
      this._applicationDomain = null;
      this._swfVersion = 9;
      this._actionScriptVersion = ActionScriptVersion.ACTIONSCRIPT3;
      this._frameRate = 24;
      this._parameters = null;
      this._width = 0;
      this._height = 0;
      this._contentType = '';
      this._sharedEvents = null;
      this._parentSandboxBridge = null;
      this._childSandboxBridge = null;
      this._sameDomain = false;
      this._childAllowsParent = false;
      this._parentAllowsChild = false;
      this._loader = null;
      this._content = null;
      this._bytes = null;
      this._uncaughtErrorEvents = null;
      this._allowCodeExecution = true;
      this._dictionary = [];
      this._abcBlocksLoaded = 0;
      this._mappedSymbolsLoaded = 0;
      this._fontsLoaded = 0;
      this._avm1Context = null;

      this._colorRGBA = 0xFFFFFFFF;
    }

    setFile(file: SWFFile) {
      release || assert(!this._file);
      this._file = file;
      // TODO: remove these duplicated fields from LoaderInfo.
      this._bytesTotal = file.bytesTotal;
      this._swfVersion = file.swfVersion;
      this._frameRate = file.frameRate;
      var bbox = file.bounds;
      this._width = bbox.xMax - bbox.xMin;
      this._height = bbox.yMax - bbox.yMin;
      this._colorRGBA = file.backgroundColor;

      if (!file.attributes || !file.attributes.doAbc) {
        this._actionScriptVersion = ActionScriptVersion.ACTIONSCRIPT2;
      }
    }

    uncaughtErrorEvents: flash.events.UncaughtErrorEvents;

    static getLoaderInfoByDefinition(object: Object): flash.display.LoaderInfo {
      object = object;
      notImplemented("public flash.display.LoaderInfo::static getLoaderInfoByDefinition"); return;
    }

    _loaderURL: string;
    _url: string;
    _file: SWFFile;
    _isURLInaccessible: boolean;
    _bytesLoaded: number /*uint*/;
    _newBytesLoaded: number;
    _bytesTotal: number /*uint*/;
    _applicationDomain: flash.system.ApplicationDomain;
    _swfVersion: number /*uint*/;
    _actionScriptVersion: number /*uint*/;
    _frameRate: number;
    _parameters: Object;
    _width: number /*int*/;
    _height: number /*int*/;
    _contentType: string;
    _sharedEvents: flash.events.EventDispatcher;
    _parentSandboxBridge: Object;
    _childSandboxBridge: Object;
    _sameDomain: boolean;
    _childAllowsParent: boolean;
    _parentAllowsChild: boolean;
    _loader: flash.display.Loader;
    _content: flash.display.DisplayObject;
    _bytes: flash.utils.ByteArray;
    _abcBlocksLoaded: number;
    _mappedSymbolsLoaded: number;
    _fontsLoaded: number;
    _uncaughtErrorEvents: flash.events.UncaughtErrorEvents;

    /**
     * Use this to ignore any user code.
     */
    _allowCodeExecution: boolean;

    /**
     * HACK: This is a hack because I don't know how to get access to the stage once I see a tag
     * that sets the background color. Here we set it on the LoaderInfo, and then set it on the
     * stage.
     */
    _colorRGBA: number;

    _dictionary: Shumway.Timeline.Symbol [];
    _avm1Context: Shumway.AVM1.AVM1Context;

    get loaderURL(): string {
      return this._loaderURL;
    }

    get url(): string {
      return this._url;
    }

    get isURLInaccessible(): boolean {
      return this._isURLInaccessible;
    }

    get bytesLoaded(): number /*uint*/ {
      return this._bytesLoaded;
    }
    set bytesLoaded(value: number /*uint*/) {
      if (value === this._newBytesLoaded) {
        return;
      }
      this._newBytesLoaded = value;
    }

    get bytesTotal(): number /*uint*/ {
      return this._bytesTotal;
    }

    get applicationDomain(): flash.system.ApplicationDomain {
      somewhatImplemented("public flash.display.LoaderInfo::get applicationDomain");
      return flash.system.ApplicationDomain.currentDomain;
      // return this._applicationDomain;
    }

    get swfVersion(): number /*uint*/ {
      return this._swfVersion;
    }

    get actionScriptVersion(): number /*uint*/ {
      return this._actionScriptVersion;
    }

    get frameRate(): number {
      return this._frameRate;
    }

    get width(): number /*int*/ {
      return (this._width / 20) | 0;
    }

    get height(): number /*int*/ {
      return (this._height / 20) | 0;
    }

    get contentType(): string {
      return this._contentType;
    }

    get sharedEvents(): flash.events.EventDispatcher {
      notImplemented("public flash.display.LoaderInfo::get sharedEvents"); return;
      // return this._sharedEvents;
    }
    get parentSandboxBridge(): Object {
      notImplemented("public flash.display.LoaderInfo::get parentSandboxBridge"); return;
      // return this._parentSandboxBridge;
    }
    set parentSandboxBridge(door: Object) {
      door = door;
      notImplemented("public flash.display.LoaderInfo::set parentSandboxBridge"); return;
      // this._parentSandboxBridge = door;
    }
    get childSandboxBridge(): Object {
      notImplemented("public flash.display.LoaderInfo::get childSandboxBridge"); return;
      // return this._childSandboxBridge;
    }
    set childSandboxBridge(door: Object) {
      door = door;
      notImplemented("public flash.display.LoaderInfo::set childSandboxBridge"); return;
      // this._childSandboxBridge = door;
    }
    get sameDomain(): boolean {
      notImplemented("public flash.display.LoaderInfo::get sameDomain"); return;
      // return this._sameDomain;
    }
    get childAllowsParent(): boolean {
      notImplemented("public flash.display.LoaderInfo::get childAllowsParent"); return;
      // return this._childAllowsParent;
    }
    get parentAllowsChild(): boolean {
      notImplemented("public flash.display.LoaderInfo::get parentAllowsChild"); return;
      // return this._parentAllowsChild;
    }

    get loader(): flash.display.Loader {
      return this._loader;
    }

    get content(): flash.display.DisplayObject {
      return this._loader && this._loader.content;
    }

    get bytes(): flash.utils.ByteArray {
      notImplemented("public flash.display.LoaderInfo::get bytes"); return;
      // return this._bytes;
    }

    get parameters(): Object {
      somewhatImplemented("public flash.display.LoaderInfo::get parameters");
      if (this._parameters) {
        return Shumway.ObjectUtilities.cloneObject(this._parameters);
      }
      return {};
    }
    _getUncaughtErrorEvents(): flash.events.UncaughtErrorEvents {
      notImplemented("public flash.display.LoaderInfo::_getUncaughtErrorEvents"); return;
    }
    _setUncaughtErrorEvents(value: flash.events.UncaughtErrorEvents): void {
      value = value;
      notImplemented("public flash.display.LoaderInfo::_setUncaughtErrorEvents"); return;
    }

    getSymbolResolver(classDefinition: ASClass, symbolId: number): () => any {
      return this.resolveClassSymbol.bind(this, classDefinition, symbolId);
    }

    getSymbolById(id: number): Shumway.Timeline.Symbol {
      var symbol = this._dictionary[id];
      if (symbol) {
        return symbol;
      }
      var data = this._file.getSymbol(id);
      if (!data) {
        // It's entirely valid not to have symbols defined.
        Debug.warning("Unknown symbol requested: " + id);
        return null;
      }
      // TODO: replace this switch with a table lookup.
      switch (data.type) {
        case 'shape':
          symbol = Timeline.ShapeSymbol.FromData(data, this);
          break;
        case 'morphshape':
          symbol = Timeline.MorphShapeSymbol.FromData(data, this);
          break;
        case 'image':
          symbol = Timeline.BitmapSymbol.FromData(data.definition);
          break;
        case 'label':
          symbol = Timeline.TextSymbol.FromLabelData(data, this);
          break;
        case 'text':
          symbol = Timeline.TextSymbol.FromTextData(data, this);
          break;
        case 'button':
          symbol = Timeline.ButtonSymbol.FromData(data, this);
          break;
        case 'sprite':
          symbol = Timeline.SpriteSymbol.FromData(data, this);
          break;
        case 'font':
          // Fonts are eagerly parsed and have their data in `definition`.
          if (data.definition) {
            data = data.definition;
          }
          symbol = Timeline.FontSymbol.FromData(data);
          var font = flash.text.Font.initializeFrom(symbol);
          flash.text.Font.instanceConstructorNoInitialize.call(font);
          break;
        case 'sound':
          symbol = Timeline.SoundSymbol.FromData(data);
          break;
        case 'binary':
          symbol = Timeline.BinarySymbol.FromData(data);
          break;
      }
      release || assert(symbol, "Unknown symbol type " + data.type);
      this._dictionary[id] = symbol;
      return symbol;
    }

    getRootSymbol(): Timeline.SpriteSymbol {
      var symbol = <Timeline.SpriteSymbol>this._dictionary[0];
      if (!symbol) {
        symbol = new Timeline.SpriteSymbol({id: 0, className: this._file.symbolClassesMap[0]}, this);
        symbol.isRoot = true;
        if (this._actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
          symbol.isAVM1Object = true;
          symbol.avm1Context = this._avm1Context;
        }
        symbol.numFrames = this._file.frameCount;
        this._dictionary[0] = symbol;
      }
      return symbol;
    }

    // TODO: deltas should be computed lazily when they're first needed, and this removed.
    getFrame(sprite: {frames: SWFFrame[]}, index: number) {
      var file = this._file;
      if (!sprite) {
        sprite = file;
      }
      var frame = sprite.frames[index];
      return {
        labelName: frame.labelName,
        soundStreamHead: frame.soundStreamHead,
        soundStreamBlock: frame.soundStreamBlock,
        actionBlocks: frame.actionBlocks,
        initActionBlocks: frame.initActionBlocks,
        exports: frame.exports,
        frameDelta: new Timeline.FrameDelta(this, frame.displayListCommands)
      };
    }

    // TODO: To prevent leaking LoaderInfo instances, those instances should be stored weakly,
    // with support for retrieving the instances based on a numeric id, which would be passed here.
    private resolveClassSymbol(classDefinition: ASClass, symbolId: number) {
      var symbol = this.getSymbolById(symbolId);
      if (!symbol) {
        Debug.warning("Attempt to resolve symbol for AVM2 class failed: Symbol " +
                      symbolId + " not found.");
      } else {
        Object.defineProperty(classDefinition, "defaultInitializerArgument", {value: symbol});
        return symbol;
      }
    }
  }
}
