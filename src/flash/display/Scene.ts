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
// Class: Scene
module Shumway.AVMX.AS.flash.display {
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class Scene extends ASObject {

    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null;

    constructor (name: string, labels: {value: FrameLabel[]}, offset: number, numFrames: number /*int*/) {
      super();
      this._name = axCoerceString(name);
      // Note: creating Scene objects in ActionScript, while possible, is undocumented and entirely
      // useless. Luckily, that also means that they're not very carefully implemented.
      // Specifically, the `labels` array isn't cloned during construction or when returned from
      // the getter. I.e., it can be modified freely.
      this._labels = labels;
      this.offset = offset;
      this._numFrames = numFrames | 0;
    }

    _name: string;
    offset: number;
    _numFrames: number /*int*/;
    _labels: {value: FrameLabel[]};

    get name(): string {
      return this._name;
    }

    get labels(): {value: FrameLabel[]} {
      return this._labels;
    }

    get numFrames(): number {
      return this._numFrames;
    }

    clone(): Scene {
      var labels_ = this._labels.value.map(function (label: FrameLabel) { return label.clone(); });
      return new this.sec.flash.display.Scene(this._name, this.sec.createArrayUnsafe(labels_),
                                              this.offset, this._numFrames);
    }

    getLabelByName(name: string, ignoreCase: boolean): FrameLabel {
      if (ignoreCase) {
        name = name.toLowerCase();
      }
      var labels = this._labels.value;
      for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        if (ignoreCase ? label.name.toLowerCase() === name : label.name === name) {
          return label;
        }
      }
      return null;
    }

    getLabelByFrame(frame: number): FrameLabel {
      var labels = this._labels.value;
      for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        if (label.frame === frame) {
          return label;
        }
      }
      return null;
    }
  }
}
