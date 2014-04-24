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

module Shumway.SWF.timeline {
  import flash = Shumway.AVM2.AS.flash;

  export class Symbol {
    id: number = 0;
    symbolClass: Shumway.AVM2.AS.ASClass = null;
    bounds: flash.geom.Rectangle = null;
    scale9Grid: flash.geom.Rectangle = null;

    constructor(id: number) {
      this.id = +id;
      this.bounds = new flash.geom.Rectangle();
    }
  }

  export class ShapeSymbol extends Symbol {
    graphics: flash.display.Graphics = null;
    strokeBounds: flash.geom.Rectangle;

    constructor(id: number) {
      super(id);
      this.strokeBounds = new flash.geom.Rectangle();
      this.symbolClass = flash.display.Shape;
    }
  }

  export class BitmapSymbol extends Symbol {
    bitmapData: flash.display.BitmapData;

    constructor(id: number) {
      super(id);
      this.symbolClass = flash.display.Bitmap;
    }
  }

  export class TextSymbol extends Symbol {
    constructor(id: number) {
      super(id);
      this.symbolClass = flash.text.TextField;
    }
  }

  export class ButtonSymbol extends Symbol {
    upState: flash.display.DisplayObject = null;
    overState: flash.display.DisplayObject = null;
    downState: flash.display.DisplayObject = null;
    hitTestState: flash.display.DisplayObject = null;

    constructor(id: number) {
      super(id);
      this.symbolClass = flash.display.SimpleButton;
    }
  }

  export class SpriteSymbol extends Symbol {
    numFrames: number = 0;
    blueprint: BluePrint;
    labels: flash.display.FrameLabel [] = [];

    constructor(id: number) {
      super(id);
      this.symbolClass = flash.display.MovieClip;
    }
  }

  export class AnimationState {
    symbol: Symbol = null;
    depth: number = 0;
    matrix: flash.geom.Matrix = null;
    colorTransform: flash.geom.ColorTransform = null;
    ratio: number = 0;
    name: string = null;
    clipDepth: number = null;
    filters: any [] = null;
    blendMode: string = null;
    cacheAsBitmap: boolean = false;
    actions: any [] = null;

    constructor(symbol: Symbol,
                depth: number,
                matrix: flash.geom.Matrix,
                colorTransform: flash.geom.ColorTransform,
                ratio: number,
                name: string,
                clipDepth: number,
                filters: any [],
                blendMode: string,
                cacheAsBitmap: boolean,
                actions: any [])
    {
      this.symbol = symbol;
      this.depth = depth;
      this.matrix = matrix;
      this.colorTransform = colorTransform;
      this.ratio = ratio;
      this.name = name;
      this.clipDepth = clipDepth;
      this.filters = filters;
      this.blendMode = blendMode;
      this.cacheAsBitmap = cacheAsBitmap;
      this.actions = actions;
    }

    clone(): AnimationState {
      return new AnimationState(
        this.symbol,
        this.depth,
        this.matrix,
        this.colorTransform,
        this.ratio,
        this.name,
        this.clipDepth,
        this.filters,
        this.blendMode,
        this.cacheAsBitmap,
        this.actions
      );
    }
  }

  export class BluePrint {
    commands: any [] = [];
  }
}
