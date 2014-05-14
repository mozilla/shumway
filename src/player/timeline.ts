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
  import abstractMethod = Shumway.Debug.abstractMethod;
  import flash = Shumway.AVM2.AS.flash;

  export class Symbol {
    id: number = -1;
    symbolClass: Shumway.AVM2.AS.ASClass;

    constructor(id: number, symbolClass: Shumway.AVM2.AS.ASClass) {
      this.id = +id;
      this.symbolClass = symbolClass;
    }

    static createFromData(data: any): Symbol {
      abstractMethod("createFromData");
    }
  }

  export class DisplaySymbol extends Symbol {
    rect: flash.geom.Rectangle;
    bounds: flash.geom.Rectangle;
    scale9Grid: flash.geom.Rectangle;
    constructor(id: number, symbolClass: Shumway.AVM2.AS.ASClass) {
      super(id, symbolClass);
    }
    _setBoundsFromData(data: any) {
      this.rect = data.bbox ? flash.geom.Rectangle.createFromBbox(data.bbox) : null;
      this.bounds = data.strokeBbox ? flash.geom.Rectangle.createFromBbox(data.strokeBbox) : null;
      if (!this.bounds) {
        this.bounds = this.rect;
      }
    }
  }

  export class ShapeSymbol extends DisplaySymbol {
    graphics: flash.display.Graphics = null;

    constructor(id: number) {
      super(id, flash.display.Shape);
    }

    static createFromData(data: any): ShapeSymbol {
      var symbol = new ShapeSymbol(data.id);
      symbol._setBoundsFromData(data);
      // TODO: Fill graphics object with shape data.
      symbol.graphics = new flash.display.Graphics();

      // TODO: Remove this hack once we can get bounds of the graphics object.
      if (data.type === "shape") {
        symbol.graphics._bounds.copyFrom(symbol.bounds);
        symbol.graphics._rect.copyFrom(symbol.rect);
      }

      return symbol;
    }
  }

  export class BitmapSymbol extends DisplaySymbol {
    bitmapData: flash.display.BitmapData;
    width: number;
    height: number;
    constructor(id: number) {
      super(id, flash.display.Bitmap);
    }

    static createFromData(data: any): BitmapSymbol {
      var symbol = new BitmapSymbol(data.id);
      symbol.width = data.width;
      symbol.height = data.height;
      return symbol;
    }
  }

  export class TextSymbol extends DisplaySymbol {
    textColor: number = 0;
    textHeight: number = 0;
    font: flash.text.Font = null;
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
    data: any = null;

    constructor(id: number) {
      super(id, flash.text.TextField);
    }

    static createFromLabelData(data: any): TextSymbol {
      var symbol = new TextSymbol(data.id);
      symbol._setBoundsFromData(data);
      symbol.symbolClass = flash.text.StaticText;
      symbol.data = data.data;
      return symbol;
    }

    static createFromTextData(data: any): TextSymbol {
      var symbol = new TextSymbol(data.id);
      var tag = data.tag;
      if (tag.hasColor) {
        symbol.textColor = tag.color;
      }
      if (tag.hasFont) {
        symbol.textHeight = tag.fontHeight;
        symbol.font = null;
        if (tag.fontClass) {
          var appDomain = AVM2.instance.applicationDomain;
          symbol.fontClass = appDomain.getClass(tag.fontClass);
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

    static createFromData(data: any, loader: flash.display.Loader): ButtonSymbol {
      var symbol = new ButtonSymbol(data.id);
      var states = data.states;
      var character, matrix, colorTransform;
      for (var stateName in states) {
        var commands = states[stateName];
        var state;
        if (commands.length === 1) {
          var cmd = commands[0];
          character = loader._dictionary[cmd.symbolId];
          matrix = flash.geom.Matrix.fromAny(cmd.matrix);
          if (cmd.cxform) {
            colorTransform = ColorTransform.fromCXForm(cmd.cxform);
          }
        } else {
          character = new Timeline.SpriteSymbol(-1);
          character.frames.push(loader._buildFrame(commands));
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

    static createFromData(data: any, loader: flash.display.Loader): SpriteSymbol {
      var symbol = new SpriteSymbol(data.id);
      symbol.numFrames = data.frameCount;
      var frames = data.frames;
      for (var i = 0; i < frames.length; i++) {
        var frameInfo = frames[i];
        var frame = loader._buildFrame(frameInfo.commands);
        var repeat = frameInfo.repeat;
        while (repeat--) {
          symbol.frames.push(frame);
        }
        if (frameInfo.labelName) {
          var frameNum = i + 1;
          symbol.labels.push(new FrameLabel(frameInfo.labelName, frameNum));
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

  export class SoundSymbol extends Symbol {
    constructor(id: number) {
      super(id, flash.media.Sound);
    }

    static createFromData(data: any): SoundSymbol {
      var symbol = new SpriteSymbol(data.id);
      return symbol;
    }
  }

  export class AnimationState {
    constructor(public symbol: Symbol = null,
                public depth: number = 0,
                public matrix: flash.geom.Matrix = null,
                public colorTransform: flash.geom.ColorTransform = null,
                public ratio: number = 0,
                public name: string = null,
                public clipDepth: number = null,
                public filters: any [] = null,
                public blendMode: string = null,
                public cacheAsBitmap: boolean = false,
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

  export class Frame {
    stateAtDepth: Shumway.Map<AnimationState>;

    constructor() {
      this.stateAtDepth = Shumway.ObjectUtilities.createMap<AnimationState>();
    }

    place(depth: number, state: AnimationState): void {
      this.stateAtDepth[depth] = state;
    }

    remove(depth: number): void {
      this.stateAtDepth[depth] = null;
    }
  }
}
