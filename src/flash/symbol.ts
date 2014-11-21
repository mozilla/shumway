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
