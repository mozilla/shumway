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
  import abstractMethod = Shumway.Debug.abstractMethod;
  import Bounds = Shumway.Bounds;
  import ColorUtilities = Shumway.ColorUtilities;
  import flash = Shumway.AVM2.AS.flash;

  /**
   * TODO document
   */
  export class Symbol {
    id: number = -1;
    symbolClass: Shumway.AVM2.AS.ASClass;

    constructor(id: number, symbolClass: Shumway.AVM2.AS.ASClass) {
      assert (isInteger(id));
      this.id = id;
      this.symbolClass = symbolClass;
    }
  }

  export class DisplaySymbol extends Symbol {
    fillBounds: Bounds;
    lineBounds: Bounds;
    scale9Grid: Bounds;

    constructor(id: number, symbolClass: Shumway.AVM2.AS.ASClass) {
      super(id, symbolClass);
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

    constructor(id: number, symbolClass: Shumway.AVM2.AS.ASClass = flash.display.Shape) {
      super(id, symbolClass);
    }

    static FromData(data: any, loaderInfo: flash.display.LoaderInfo): ShapeSymbol {
      var symbol = new ShapeSymbol(data.id);
      symbol._setBoundsFromData(data);
      symbol.graphics = flash.display.Graphics.FromData(data);
      symbol.processRequires(data.require, loaderInfo);
      return symbol;
    }

    processRequires(dependencies: any[], loaderInfo: flash.display.LoaderInfo): void {
      if (!dependencies) {
        return;
      }
      var textures = this.graphics.getUsedTextures();
      for (var i = 0; i < dependencies.length; i++) {
        var bitmap = <BitmapSymbol>loaderInfo.getSymbolById(dependencies[i]);
        assert(bitmap, "Bitmap symbol is not defined.");
        var bitmapData = bitmap.symbolClass.initializeFrom(bitmap);
        bitmap.symbolClass.instanceConstructorNoInitialize.call(bitmapData);
        textures.push(bitmapData);
      }
    }
  }

  export class MorphShapeSymbol extends ShapeSymbol {
    morphFillBounds: Bounds;
    morphLineBounds: Bounds;
    constructor(id: number) {
      super(id, flash.display.MorphShape);
    }

    static FromData(data: any, loaderInfo: flash.display.LoaderInfo): MorphShapeSymbol {
      var symbol = new MorphShapeSymbol(data.id);
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
    data: Uint8Array;
    type: ImageType;
    constructor(id: number) {
      super(id, flash.display.BitmapData);
    }

    static FromData(data: any): BitmapSymbol {
      var symbol = new BitmapSymbol(data.id);
      symbol.width = data.width;
      symbol.height = data.height;
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
    coords: number[];

    constructor(id: number) {
      super(id, flash.text.TextField);
    }

    static FromTextData(data: any): TextSymbol {
      var symbol = new TextSymbol(data.id);
      symbol._setBoundsFromData(data);
      if (data.static) {
        symbol.symbolClass = flash.text.StaticText;
        symbol.coords = data.coords;
      }
      var tag = data.tag;
      if (tag.hasColor) {
        symbol.color = ColorUtilities.componentsToRGB(tag.color);
      }
      if (tag.hasFont) {
        symbol.size = tag.fontHeight;
        var font = flash.text.Font.getBySymbolId(tag.fontId);
        assert (font, "Font is not defined.");
        symbol.font = font.fontName;
        if (tag.fontClass) {
          var appDomain = Shumway.AVM2.Runtime.AVM2.instance.applicationDomain;
          symbol.fontClass = <flash.text.Font><any>
            appDomain.getClass(tag.fontClass);
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
      symbol.autoSize = flash.text.TextFieldAutoSize.fromNumber(tag.autoSize);
      symbol.variableName = tag.variableName;
      return symbol;
    }
  }

  export class ButtonSymbol extends DisplaySymbol {
    upState: AnimationState = null;
    overState: AnimationState = null;
    downState: AnimationState = null;
    hitTestState: AnimationState = null;

    constructor(id: number) {
      super(id, flash.display.SimpleButton);
    }

    static FromData(data: any, loaderInfo: flash.display.LoaderInfo): ButtonSymbol {
      var symbol = new ButtonSymbol(data.id);
      var states = data.states;
      var character, matrix, colorTransform;
      for (var stateName in states) {
        var commands = states[stateName];
        var state;
        if (commands.length === 1) {
          var cmd = commands[0];
          character = loaderInfo.getSymbolById(cmd.symbolId);
          matrix = flash.geom.Matrix.FromUntyped(cmd.matrix);
          if (cmd.cxform) {
            colorTransform = flash.geom.ColorTransform.FromCXForm(cmd.cxform);
          }
        } else {
          character = new Timeline.SpriteSymbol(-1);
          character.frames.push(new Frame(loaderInfo, commands));
        }
        symbol[stateName + 'State'] =
          new Timeline.AnimationState(character, 0, matrix, colorTransform);
      }
      return symbol;
    }
  }

  export class SpriteSymbol extends DisplaySymbol {
    numFrames: number = 1;
    frames: Frame [] = [];
    labels: flash.display.FrameLabel [] = [];
    isRoot: boolean;

    constructor(id: number, isRoot: boolean = false) {
      super(id, flash.display.MovieClip);
      this.isRoot = isRoot;
    }

    static FromData(data: any, loaderInfo: flash.display.LoaderInfo): SpriteSymbol {
      var symbol = new SpriteSymbol(data.id);
      symbol.numFrames = data.frameCount;
      var frames = data.frames;
      for (var i = 0; i < frames.length; i++) {
        var frameInfo = frames[i];
        var frame = new Frame(loaderInfo, frameInfo.commands);
        var repeat = frameInfo.repeat;
        while (repeat--) {
          symbol.frames.push(frame);
        }
        if (frameInfo.labelName) {
          var frameNum = i + 1;
          symbol.labels.push(new flash.display.FrameLabel(frameInfo.labelName, frameNum));
        }

        //if (frame.startSounds) {
        //  startSoundRegistrations[frameNum] = frame.startSounds;
        //}

        //var frameScripts = { };
        //if (!this._isAvm2Enabled) {
        //  if (symbol.frameScripts) {
        //    var data = symbol.frameScripts;
        //    for (var i = 0; i < data.length; i += 2) {
        //      var frameNum = data[i] + 1;
        //      var actionsData = new AS2ActionsData(data[i + 1],
        //        's' + symbol.id + 'f' + frameNum + 'i' +
        //          (frameScripts[frameNum] ? frameScripts[frameNum].length : 0));
        //      var script = (function(actionsData, loader) {
        //        return function () {
        //          var avm1Context = loader._avm1Context;
        //          return executeActions(actionsData, avm1Context, this._getAS2Object());
        //        };
        //      })(actionsData, this);
        //      if (!frameScripts[frameNum])
        //        frameScripts[frameNum] = [script];
        //      else
        //        frameScripts[frameNum].push(script);
        //    }
        //  }
        //}
      }
      return symbol;
    }
  }

  // TODO: move this, and the other symbol classes, into better-suited files.
  export class FontSymbol extends Symbol {
    name: string = "";
    bold: boolean = false;
    italic: boolean = false;
    data: Uint8Array;
    metrics: any;

    constructor(id: number) {
      super(id, flash.text.Font);
    }

    static FromData(data: any): FontSymbol {
      var symbol = new FontSymbol(data.id);
      symbol.name = data.name;
      symbol.bold = data.bold;
      symbol.italic = data.italic;
      symbol.data = data.data;
      symbol.metrics = data.metrics;
      return symbol;
    }
  }

  export class SoundSymbol extends Symbol {
    constructor(id: number) {
      super(id, flash.media.Sound);
    }

    static FromData(data: any): SoundSymbol {
      var symbol = new SoundSymbol(data.id);
      return symbol;
    }
  }

  export class BinarySymbol extends Symbol {
    buffer: Uint8Array;
    byteLength: number;

    constructor(id: number) {
      super(id, flash.utils.ByteArray);
    }

    static FromData(data: any): BinarySymbol {
      var symbol = new BinarySymbol(data.id);
      symbol.buffer = data.data;
      symbol.byteLength = data.data.byteLength;
      return symbol;
    }
  }

  /**
   * TODO document
   */
  export class AnimationState {
    constructor(public symbol: Symbol = null,
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
                public events: any [] = null) {
    }

    canBeAnimated(obj: flash.display.DisplayObject): boolean {
      return obj._hasFlags(flash.display.DisplayObjectFlags.AnimatedByTimeline) &&
        (!this.symbol || obj._symbol === this.symbol ||
        (this.symbol instanceof ShapeSymbol && obj._symbol instanceof ShapeSymbol)) &&
        (this.depth === obj._depth) &&
        (this.ratio === obj._ratio);
    }
  }

  /**
   * TODO document
   */
  export class Frame {
    loaderInfo: flash.display.LoaderInfo;
    stateAtDepth: Shumway.Map<AnimationState>;

    constructor(loaderInfo: flash.display.LoaderInfo, commands: any []) {
      this.loaderInfo = loaderInfo;
      this.stateAtDepth = Shumway.ObjectUtilities.createMap<AnimationState>();
      this._applyCommands(commands);
    }

    private _applyCommands(commands: any []): void {
      var loaderInfo = this.loaderInfo;
      for (var i = 0; i < commands.length; i++) {
        var cmd = commands[i];
        var depth = cmd.depth;
        switch (cmd.code) {
          case 5: // SWF_TAG_CODE_REMOVE_OBJECT
          case 28: // SWF_TAG_CODE_REMOVE_OBJECT2
            this.remove(depth);
            break;
          default:
            var symbol = null;
            var matrix = null;
            var colorTransform = null;
            var filters = null;
            var events = null;
            if (cmd.symbolId) {
              symbol = loaderInfo.getSymbolById(cmd.symbolId);
              assert (symbol, "Symbol is not defined.");
            }
            if (cmd.hasMatrix) {
              matrix = flash.geom.Matrix.FromUntyped(cmd.matrix);
            }
            if (cmd.hasCxform) {
              colorTransform = flash.geom.ColorTransform.FromCXForm(cmd.cxform);
            }
            if (cmd.hasFilters) {
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
                assert (filter, "Unknown filter type.");
                filters.push(filter);
              }
            }
            if (cmd.hasEvents) {
              // TODO
            }
            var state = new Timeline.AnimationState (
              symbol,
              depth,
              matrix,
              colorTransform,
              cmd.ratio,
              cmd.name,
              cmd.clipDepth,
              filters,
              flash.display.BlendMode.fromNumber(cmd.blendMode),
              cmd.cache,
              cmd.hasVisibility ? !!cmd.visibility : true,
              events
            );
            this.place(depth, state);
            break;
        }
      }
    }

    place(depth: number, state: AnimationState): void {
      this.stateAtDepth[depth] = state;
    }

    remove(depth: number): void {
      this.stateAtDepth[depth] = null;
    }
  }
}
