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

///<reference path='../references.ts' />

module Shumway.AVM1.Lib {
  import flash = Shumway.AVM2.AS.flash;

  export class AVM1Sound {
    static createAVM1Class(): typeof AVM1Sound {
      return wrapAVM1Class(AVM1Sound,
        [],
        ['attachSound', 'loadSound', 'getBytesLoaded', 'getBytesTotal',
         'getPan', 'setPan', 'getTransform', 'setTransform', 'getVolume', 'setVolume',
         'start', 'stop']);
    }

    private _target: IAVM1SymbolBase;
    private _sound: flash.media.Sound;

    public constructor(target_mc) {
      this._target = AVM1Utils.resolveTarget(target_mc);
      this._sound = new flash.media.Sound();
    }

    public attachSound(id: string): void {}
    public loadSound(url: string, isStreaming: boolean): void {}
    public getBytesLoaded(): number { return 0; }
    public getBytesTotal(): number { return 0; }

    public getPan(): number { return 0; }
    public setPan(value: number): void {}
    public getTransform(): any { return null; }
    public setTransform(transformObject: any): void {}
    public getVolume(): number { return 0; }
    public setVolume(value: number): void {}

    public start(secondOffset?: number, loops?: number): void {}
    public stop(linkageID?: string): void {}
  }
}