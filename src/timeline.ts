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

module Shumway.SWF.Timeline {
  import flash = Shumway.AVM2.AS.flash;

  export class Symbol {
    id: number = -1;
    symbolClass: Shumway.AVM2.AS.ASClass = null;
    bounds: flash.geom.Rectangle = null;
    scale9Grid: flash.geom.Rectangle = null;

    constructor(id: number, symbolClass: Shumway.AVM2.AS.ASClass) {
      this.id = +id;
      this.symbolClass = symbolClass;
      this.bounds = new flash.geom.Rectangle();
    }
  }

  export class ShapeSymbol extends Symbol {
    graphics: flash.display.Graphics = null;
    strokeBounds: flash.geom.Rectangle = null;

    constructor(id: number) {
      super(id, flash.display.Shape);
    }
  }

  export class BitmapSymbol extends Symbol {
    bitmapData: flash.display.BitmapData;
    width: number = 0;
    height: number = 0;

    constructor(id: number) {
      super(id, flash.display.Bitmap);
    }
  }

  export class TextSymbol extends Symbol {
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
  }

  export class ButtonSymbol extends Symbol {
    upState: AnimationState = null;
    overState: AnimationState = null;
    downState: AnimationState = null;
    hitTestState: AnimationState = null;

    constructor(id: number) {
      super(id, flash.display.SimpleButton);
    }
  }

  export class SpriteSymbol extends Symbol {
    numFrames: number = 1;
    frames: Frame [] = [];
    labels: flash.display.FrameLabel [] = [];
    isRoot: boolean;

    constructor(id: number, isRoot: boolean = false) {
      super(id, flash.display.MovieClip);
      this.isRoot = isRoot;
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

    canBeAnimated(displayObject: flash.display.DisplayObject): boolean {
      return (!this.symbol || displayObject._symbol === this.symbol) &&
        displayObject._ratio === this.ratio;
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

  export enum FramePhase {
    Enter       = 1,
    Construct   = 2,
    Constructed = 3,
    Execute     = 4,
    Exit        = 5,
    Idle        = 6
  }
}
