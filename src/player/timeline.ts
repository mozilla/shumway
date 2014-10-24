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

module Shumway.Timeline {
  import notImplemented = Shumway.Debug.notImplemented;
  import isInteger = Shumway.isInteger;
  import assert = Shumway.Debug.assert;
  import warning = Shumway.Debug.warning;
  import abstractMethod = Shumway.Debug.abstractMethod;
  import Bounds = Shumway.Bounds;
  import ColorUtilities = Shumway.ColorUtilities;
  import flash = Shumway.AVM2.AS.flash;
  import SwfTag = Shumway.SWF.Parser.SwfTag;
  import PlaceObjectFlags = Shumway.SWF.Parser.PlaceObjectFlags;
  import SoundStream = Shumway.SWF.Parser.SoundStream;

  import ActionScriptVersion = flash.display.ActionScriptVersion;

  export interface SymbolData {id: number; className: string}
  /**
   * TODO document
   */
  export class Symbol {
    data: any;
    isAVM1Object: boolean;
    avm1Context: Shumway.AVM1.AVM1Context;
    symbolClass: Shumway.AVM2.AS.ASClass;

    constructor(data: SymbolData, symbolDefaultClass: Shumway.AVM2.AS.ASClass) {
      release || assert (isInteger(data.id));
      this.data = data;
      if (data.className) {
        var appDomain = Shumway.AVM2.Runtime.AVM2.instance.applicationDomain;
        try {
          var symbolClass = appDomain.getClass(data.className);
          this.symbolClass = symbolClass;
        } catch (e) {
          warning ("Symbol " + data.id + " bound to non-existing class " + data.className);
          this.symbolClass = symbolDefaultClass;
        }
      } else {
        this.symbolClass = symbolDefaultClass;
      }
      this.isAVM1Object = false;
    }

    get id(): number {
      return this.data.id;
    }
  }

  export class DisplaySymbol extends Symbol {
    fillBounds: Bounds;
    lineBounds: Bounds;
    scale9Grid: Bounds;
    dynamic: boolean;

    constructor(data: SymbolData, symbolClass: Shumway.AVM2.AS.ASClass, dynamic: boolean) {
      super(data, symbolClass);
      this.dynamic = dynamic;
    }

    _setBoundsFromData(data: any) {
      this.fillBounds = data.fillBounds ? Bounds.FromUntyped(data.fillBounds) : null;
      this.lineBounds = data.lineBounds ? Bounds.FromUntyped(data.lineBounds) : null;
      if (!this.lineBounds && this.fillBounds) {
        this.lineBounds = this.fillBounds.clone();
      }
    }
  }

  export class ShapeSymbol extends DisplaySymbol {
    graphics: flash.display.Graphics = null;

    constructor(data: SymbolData, symbolClass: Shumway.AVM2.AS.ASClass) {
      super(data, symbolClass, false);
    }

    static FromData(data: SymbolData, loaderInfo: flash.display.LoaderInfo): ShapeSymbol {
      var symbol = new ShapeSymbol(data, flash.display.Shape);
      symbol._setBoundsFromData(data);
      symbol.graphics = flash.display.Graphics.FromData(data);
      symbol.processRequires((<any>data).require, loaderInfo);
      return symbol;
    }

    processRequires(dependencies: any[], loaderInfo: flash.display.LoaderInfo): void {
      if (!dependencies) {
        return;
      }
      var textures = this.graphics.getUsedTextures();
      for (var i = 0; i < dependencies.length; i++) {
        var symbol = <BitmapSymbol>loaderInfo.getSymbolById(dependencies[i]);
        if (!symbol) {
          warning("Bitmap symbol " + dependencies[i] + " required by shape, but not defined.");
          textures.push(null);
          // TODO: handle null-textures from invalid SWFs correctly.
          continue;
        }
        textures.push(symbol.getSharedInstance());
      }
    }
  }

  export class MorphShapeSymbol extends ShapeSymbol {
    morphFillBounds: Bounds;
    morphLineBounds: Bounds;
    constructor(data: SymbolData) {
      super(data, flash.display.MorphShape);
    }

    static FromData(data: any, loaderInfo: flash.display.LoaderInfo): MorphShapeSymbol {
      var symbol = new MorphShapeSymbol(data);
      symbol._setBoundsFromData(data);
      symbol.graphics = flash.display.Graphics.FromData(data);
      symbol.processRequires(data.require, loaderInfo);
      symbol.morphFillBounds = data.morphFillBounds;
      symbol.morphLineBounds = data.morphLineBounds;
      return symbol;
    }
  }

  export class BitmapSymbol extends DisplaySymbol {
    width: number;
    height: number;
    image: any; // Image, but tsc doesn't like that.
    data: Uint8Array;
    type: ImageType;

    private sharedInstance: flash.display.BitmapData;

    constructor(data: SymbolData) {
      super(data, flash.display.BitmapData, false);
    }

    static FromData(data: any): BitmapSymbol {
      var symbol = new BitmapSymbol(data);
      symbol.width = data.width;
      symbol.height = data.height;
      symbol.image = data.image;
      symbol.data = data.data;
      switch (data.mimeType) {
        case "application/octet-stream":
          symbol.type = data.dataType;
          break;
        case "image/jpeg":
          symbol.type = ImageType.JPEG;
          break;
        case "image/png":
          symbol.type = ImageType.PNG;
          break;
        case "image/gif":
          symbol.type = ImageType.GIF;
          break;
        default:
          notImplemented(data.mimeType);
      }
      return symbol;
    }

    getSharedInstance() {
      return this.sharedInstance || this.createSharedInstance();
    }
    createSharedInstance() {
      this.sharedInstance = this.symbolClass.initializeFrom(this);
      this.symbolClass.instanceConstructorNoInitialize.call(this.sharedInstance);
      return this.sharedInstance;
    }
  }

  export class TextSymbol extends DisplaySymbol {
    color: number = 0;
    size: number = 0;
    font: string = "";
    fontClass: flash.text.Font = null;
    align: string = flash.text.TextFormatAlign.LEFT;
    leftMargin: number = 0;
    rightMargin: number = 0;
    indent: number = 0;
    leading: number = 0;
    multiline: boolean = false;
    wordWrap: boolean = false;
    embedFonts: boolean = false;
    selectable: boolean = true;
    border: boolean = false;
    initialText: string = "";
    html: boolean = false;
    displayAsPassword: boolean = false;
    type: string = flash.text.TextFieldType.DYNAMIC;
    maxChars: number = 0;
    autoSize: string = flash.text.TextFieldAutoSize.NONE;
    variableName: string = null;
    textContent: Shumway.TextContent = null;

    constructor(data: SymbolData) {
      super(data, flash.text.TextField, true);
    }

    static FromTextData(data: any, loaderInfo: flash.display.LoaderInfo): TextSymbol {
      var symbol = new TextSymbol(data);
      symbol._setBoundsFromData(data);
      var tag = data.tag;
      if (data.static) {
        symbol.dynamic = false;
        symbol.symbolClass = flash.text.StaticText;
        if (tag.initialText) {
          var textContent = new Shumway.TextContent();
          textContent.bounds = symbol.lineBounds;
          textContent.parseHtml(tag.initialText);
          textContent.matrix = flash.geom.Matrix.FromUntyped(data.matrix);
          textContent.coords = data.coords;
          symbol.textContent = textContent;
        }
      }
      if (tag.hasColor) {
        symbol.color = tag.color >>> 8;
      }
      if (tag.hasFont) {
        symbol.size = tag.fontHeight;
        // Requesting the font symbol guarantees that it's loaded and initialized.
        var fontSymbol = loaderInfo.getSymbolById(tag.fontId);
        var font = flash.text.Font.getBySymbolId(tag.fontId);
        if (fontSymbol && font) {
          symbol.font = font.fontName;
          if (tag.fontClass) {
            var appDomain = Shumway.AVM2.Runtime.AVM2.instance.applicationDomain;
            symbol.fontClass = <flash.text.Font><any>appDomain.getClass(tag.fontClass);
          }
        } else {
          warning("Font " + tag.fontId + " is not defined.");
        }
      }
      if (tag.hasLayout) {
        symbol.align = flash.text.TextFormatAlign.fromNumber(tag.align);
        symbol.leftMargin = tag.leftMargin;
        symbol.rightMargin = tag.rightMargin;
        symbol.indent = tag.indent;
        symbol.leading = tag.leading;
      }
      symbol.multiline = !!tag.multiline;
      symbol.wordWrap = !!tag.wordWrap;
      symbol.embedFonts = !!tag.useOutlines;
      symbol.selectable = !tag.noSelect;
      symbol.border = !!tag.border;
      if (tag.hasText) {
        symbol.initialText = tag.initialText;
      }
      symbol.html = !!tag.html;
      symbol.displayAsPassword = !!tag.password;
      symbol.type = tag.readonly ? flash.text.TextFieldType.DYNAMIC :
        flash.text.TextFieldType.INPUT;
      if (tag.hasMaxLength) {
        symbol.maxChars = tag.maxLength;
      }
      symbol.autoSize = tag.autoSize ? flash.text.TextFieldAutoSize.LEFT : flash.text.TextFieldAutoSize.NONE;
      symbol.variableName = tag.variableName;
      return symbol;
    }

    /**
     * Turns raw DefineLabel tag data into an object that's consumable as a text symbol and then
     * passes that into `FromTextData`, returning the resulting TextSymbol.
     *
     * This has to be done outside the SWF parser because it relies on any used fonts being
     * available as symbols, which isn't the case in the SWF parser.
     */
    static FromLabelData(data: any, loaderInfo: flash.display.LoaderInfo): TextSymbol {
      var bounds = data.fillBounds;
      var records = data.records;
      var coords = data.coords = [];
      var htmlText = '';
      var size = 12;
      var face = 'Times Roman';
      var color = 0;
      var x = 0;
      var y = 0;
      var codes: number[];
      for (var i = 0; i < records.length; i++) {
        var record = records[i];
        if (record.eot) {
          break;
        }
        if (record.hasFont) {
          var font = <FontSymbol>loaderInfo.getSymbolById(record.fontId);
          font || Debug.warning('Label ' + data.id + 'refers to undefined font symbol ' +
                                record.fontId);
          codes = font.codes;
          size = record.fontHeight;
          if (!font.originalSize) {
            size /= 20;
          }
          face = 'swffont' + record.fontId;
        }
        if (record.hasColor) {
          color = record.color >>> 8;
        }
        if (record.hasMoveX) {
          x = record.moveX;
          if (x < bounds.xMin) {
            bounds.xMin = x;
          }
        }
        if (record.hasMoveY) {
          y = record.moveY;
          if (y < bounds.yMin) {
            bounds.yMin = y;
          }
        }
        var text = '';
        var entries = record.entries;
        var j = 0;
        var entry;
        while ((entry = entries[j++])) {
          var code = codes[entry.glyphIndex];
          release || assert(code, 'undefined label glyph');
          var char = String.fromCharCode(code);
          text += charEscapeMap[char] || char;
          coords.push(x, y);
          x += entry.advance;
        }
        htmlText += '<font size="' + size + '" face="' + face + '"' + ' color="#' +
                     ('000000' + color.toString(16)).slice(-6) + '">' + text + '</font>';
      }
      data.tag.initialText = htmlText;
      return TextSymbol.FromTextData(data, loaderInfo);
    }
  }

  var charEscapeMap = {'<': '&lt;', '>': '&gt;', '&' : '&amp;'};

  export class ButtonSymbol extends DisplaySymbol {
    upState: AnimationState = null;
    overState: AnimationState = null;
    downState: AnimationState = null;
    hitTestState: AnimationState = null;
    loaderInfo: flash.display.LoaderInfo;

    constructor(data: SymbolData, loaderInfo: flash.display.LoaderInfo) {
      super(data, flash.display.SimpleButton, false);
      this.loaderInfo = loaderInfo;
    }

    static FromData(data: any, loaderInfo: flash.display.LoaderInfo): ButtonSymbol {
      var symbol = new ButtonSymbol(data, loaderInfo);
      if (loaderInfo.actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
        symbol.isAVM1Object = true;
      }
      var states = data.states;
      var character: SpriteSymbol = null;
      var matrix: flash.geom.Matrix = null;
      var colorTransform: flash.geom.ColorTransform = null;
      var cmd;
      for (var stateName in states) {
        var commands = states[stateName];
        if (commands.length === 1) {
          cmd = commands[0];
          matrix = flash.geom.Matrix.FromUntyped(cmd.matrix);
          if (cmd.cxform) {
            colorTransform = flash.geom.ColorTransform.FromCXForm(cmd.cxform);
          }
        } else {
          cmd = {symbolId: -1};
          character = new Timeline.SpriteSymbol({id: -1, className: null}, loaderInfo);
          character.frames.push(new FrameDelta(loaderInfo, commands));
        }
        symbol[stateName + 'State'] = new Timeline.AnimationState(cmd.symbolId, character, 0,
                                                                  matrix, colorTransform);
      }
      return symbol;
    }
  }

  export class SpriteSymbol extends DisplaySymbol {
    numFrames: number = 1;
    frames: FrameDelta[] = [];
    labels: flash.display.FrameLabel[] = [];
    frameScripts: any[] = [];
    isRoot: boolean;
    avm1Name: string;
    avm1SymbolClass;
    loaderInfo: flash.display.LoaderInfo;

    constructor(data: SymbolData, loaderInfo: flash.display.LoaderInfo) {
      super(data, flash.display.MovieClip, true);
      this.loaderInfo = loaderInfo;
    }

    static FromData(data: any, loaderInfo: flash.display.LoaderInfo): SpriteSymbol {
      var symbol = new SpriteSymbol(data, loaderInfo);
      symbol.numFrames = data.frameCount;
      if (loaderInfo.actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
        symbol.isAVM1Object = true;
        symbol.avm1Context = loaderInfo._avm1Context;
      }
      symbol.frameScripts = [];
      var frames = data.frames;
      for (var i = 0; i < frames.length; i++) {
        var frameInfo;
        frameInfo = loaderInfo.getFrame(data, i);
        if (frameInfo.actionBlocks) {
          symbol.frameScripts.push(i);
          symbol.frameScripts.push.apply(symbol.frameScripts, frameInfo.actionBlocks);
        }
        if (frameInfo.labelName) {
          symbol.labels.push(new flash.display.FrameLabel(frameInfo.labelName, i + 1));
        }
        var frame = frameInfo.frameDelta;
        var repeat = frameInfo.repeat || 1;
        while (repeat--) {
          symbol.frames.push(frame);
        }
      }
      return symbol;
    }
  }

  // TODO: move this, and the other symbol classes, into better-suited files.
  export class FontSymbol extends Symbol {
    name: string;
    id: number;
    bold: boolean;
    italic: boolean;
    codes: number[];
    originalSize: boolean;
    metrics: any;

    constructor(data: SymbolData) {
      super(data, flash.text.Font);
    }

    static FromData(data: any): FontSymbol {
      var symbol = new FontSymbol(data);
      symbol.name = data.name;
      // No need to keep the original data baggage around.
      symbol.data = {id: data.id};
      symbol.bold = data.bold;
      symbol.italic = data.italic;
      symbol.originalSize = data.originalSize;
      symbol.codes = data.codes;
      symbol.metrics = data.metrics;
      return symbol;
    }
  }

  export class SoundSymbol extends Symbol {
    channels: number;
    sampleRate: number;
    pcm: Float32Array;
    packaged;

    constructor(data: SymbolData) {
      super(data, flash.media.Sound);
    }

    static FromData(data: any): SoundSymbol {
      var symbol = new SoundSymbol(data);
      symbol.channels = data.channels;
      symbol.sampleRate = data.sampleRate;
      symbol.pcm = data.pcm;
      symbol.packaged = data.packaged;
      return symbol;
    }
  }

  export class BinarySymbol extends Symbol {
    buffer: Uint8Array;
    byteLength: number;

    constructor(data: SymbolData) {
      super(data, flash.utils.ByteArray);
    }

    static FromData(data: any): BinarySymbol {
      var symbol = new BinarySymbol(data);
      symbol.buffer = data.data;
      symbol.byteLength = data.data.byteLength;
      return symbol;
    }
  }

  /**
   * TODO document
   */
  export class AnimationState {
    constructor(public symbolId: number,
                public symbol: DisplaySymbol = null,
                public depth: number = 0,
                public matrix: flash.geom.Matrix = null,
                public colorTransform: flash.geom.ColorTransform = null,
                public ratio: number = 0,
                public name: string = null,
                public clipDepth: number = -1,
                public filters: any [] = null,
                public blendMode: string = null,
                public cacheAsBitmap: boolean = false,
                public visible: boolean = true,
                public events: any [] = null,
                public variableName: string = null) {

    }

    canBeAnimated(obj: flash.display.DisplayObject): boolean {
      if (!obj._hasFlags(flash.display.DisplayObjectFlags.AnimatedByTimeline)) {
        return false;
      }
      if (obj._depth !== this.depth) {
        return false;
      }
      var symbol = this.symbol;
      if (symbol) {
        if (symbol.dynamic) {
          return false;
        }
        if (obj._clipDepth !== this.clipDepth) {
          return false;
        }
        if (!symbol.symbolClass.isType(obj)) {
          return false;
        }
      }
      return true;
    }

    canBeReused(obj: flash.display.DisplayObject): boolean {
      var symbol = this.symbol;
      if (symbol && symbol === obj._symbol &&
          obj._hasFlags(flash.display.DisplayObjectFlags.OwnedByTimeline)) {
        return true;
      }
      return false;
    }
  }

  export class SoundStart {
    constructor(public soundId: number, public soundInfo) {
    }
  }

  /**
   * TODO document
   */
  export class FrameDelta {
    private _stateAtDepth: Shumway.Map<AnimationState>;
    private _soundStarts: SoundStart[];
    private _soundStreamHead: SoundStream;
    private _soundStreamBlock: {data: Uint8Array};

    get stateAtDepth() {
      return this._stateAtDepth || this._initialize();
    }

    get soundStarts() {
      if (this.commands) {
        this._initialize();
      }
      return this._soundStarts;
    }

    // TODO: refactor streaming sound support to delay sound parsing until needed.
    // These two fields aren't used for now, but will perhaps be helpful in the above.
    get soundStreamHead() {
      if (this.commands) {
        this._initialize();
      }
      return this._soundStreamHead;
    }

    get soundStreamBlock() {
      if (this.commands) {
        this._initialize();
      }
      return this._soundStreamBlock;
    }

    constructor(private loaderInfo: flash.display.LoaderInfo, private commands: any []) {
      this._stateAtDepth = null;
      this._soundStarts = null;
      this._soundStreamHead = null;
      this._soundStreamBlock = null;
    }

    private _initialize(): Shumway.Map<AnimationState> {
      var states: Shumway.Map<AnimationState> = this._stateAtDepth = Object.create(null);
      var commands = this.commands;
      if (!commands) {
        return states;
      }
      var loaderInfo = this.loaderInfo;
      for (var i = 0; i < commands.length; i++) {
        var cmd = 'depth' in commands[i] ?
                  commands[i] :
                  <any>loaderInfo._file.getParsedTag(commands[i]);
        var depth = cmd.depth;
        switch (cmd.code) {
          case SwfTag.CODE_REMOVE_OBJECT:
          case SwfTag.CODE_REMOVE_OBJECT2:
            states[depth] = null;
            break;
          case SwfTag.CODE_START_SOUND:
            var soundStarts = this._soundStarts || (this._soundStarts = []);
            soundStarts.push(new SoundStart(cmd.soundId, cmd.soundInfo));
            break;
          case SwfTag.CODE_SOUND_STREAM_HEAD:
          case SwfTag.CODE_SOUND_STREAM_HEAD2:
            this._soundStreamHead = SoundStream.FromTag(cmd);
            break;
          case SwfTag.CODE_SOUND_STREAM_BLOCK:
            this._soundStreamBlock = cmd;
            break;
          case SwfTag.CODE_PLACE_OBJECT:
          case SwfTag.CODE_PLACE_OBJECT2:
          case SwfTag.CODE_PLACE_OBJECT3:
            var symbol: DisplaySymbol = null;
            var matrix: flash.geom.Matrix = null;
            var colorTransform: flash.geom.ColorTransform = null;
            var filters: flash.filters.BitmapFilter[] = null;
            var events: any[] = loaderInfo._allowCodeExecution ? cmd.events : 0;
            if (cmd.symbolId) {
              symbol = <DisplaySymbol>loaderInfo.getSymbolById(cmd.symbolId);
              if (!symbol) {
                warning("Symbol " + cmd.symbolId + " is not defined.");
                continue;
              }
            }
            if (cmd.flags & PlaceObjectFlags.HasMatrix) {
              matrix = flash.geom.Matrix.FromUntyped(cmd.matrix);
            }
            if (cmd.flags & PlaceObjectFlags.HasColorTransform) {
              colorTransform = flash.geom.ColorTransform.FromCXForm(cmd.cxform);
            }
            if (cmd.flags & PlaceObjectFlags.HasFilterList) {
              filters = [];
              var swfFilters = cmd.filters;
              for (var j = 0; j < swfFilters.length; j++) {
                var obj = swfFilters[j];
                var filter: flash.filters.BitmapFilter;
                switch (obj.type) {
                  case 0: filter = flash.filters.DropShadowFilter.FromUntyped(obj); break;
                  case 1: filter = flash.filters.BlurFilter.FromUntyped(obj); break;
                  case 2: filter = flash.filters.GlowFilter.FromUntyped(obj); break;
                  case 3: filter = flash.filters.BevelFilter.FromUntyped(obj); break;
                  case 4: filter = flash.filters.GradientGlowFilter.FromUntyped(obj); break;
                  case 5: filter = flash.filters.ConvolutionFilter.FromUntyped(obj); break;
                  case 6: filter = flash.filters.ColorMatrixFilter.FromUntyped(obj); break;
                  case 7: filter = flash.filters.GradientBevelFilter.FromUntyped(obj); break;
                }
                release || assert (filter, "Unknown filter type.");
                filters.push(filter);
              }
            }
            var state = new Timeline.AnimationState (
              cmd.symbolId,
              symbol,
              depth,
              matrix,
              colorTransform,
              cmd.ratio,
              cmd.name,
              cmd.clipDepth,
              filters,
              flash.display.BlendMode.fromNumber(cmd.blendMode),
              !!(cmd.flags & PlaceObjectFlags.HasCacheAsBitmap),
              cmd.flags & PlaceObjectFlags.HasVisible ? !!cmd.visibility : true,
              events,
              cmd.variableName
            );
            states[depth] = state;
            break;
          default:
            console.warn("Unhandled timeline control tag: " + cmd.code + ": " + SwfTag[cmd.code]);
        }

      }
      this.commands = null;
      return states;
    }
  }
}
