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
        ['attachSound', 'duration', 'getBytesLoaded', 'getBytesTotal',
         'getPan', 'setPan', 'getTransform', 'setTransform', 'getVolume', 'setVolume',
         'start', 'stop']);
    }

    public initAVM1ObjectInstance(context: AVM1Context) {
    }

    private _target: IAVM1SymbolBase;
    private _sound: flash.media.Sound;
    private _channel: flash.media.SoundChannel;
    private _linkageID: string;

    public constructor(target_mc) {
      this._target = AVM1Utils.resolveTarget(target_mc);
      this._sound = null;
      this._channel = null;
      this._linkageID = null;
    }

    public attachSound(id: string): void {
      var symbol = AVM1Context.instance.getAsset(id);
      if (!symbol) {
        return;
      }

      var props: flash.media.SoundSymbol = Object.create(symbol.symbolProps);
      var sound: flash.media.Sound = flash.media.Sound.initializeFrom(props);
      flash.media.Sound.instanceConstructorNoInitialize.call(sound);
      this._linkageID = id;
      this._sound = sound;
    }

    public loadSound(url: string, isStreaming: boolean): void {}
    public getBytesLoaded(): number { return 0; }
    public getBytesTotal(): number { return 0; }

    public getPan(): number {
      var transform = this._channel && this._channel.soundTransform;
      return transform ? transform.asGetPublicProperty('pan') * 100 : 0;
    }
    public setPan(value: number): void {
      var transform = this._channel && this._channel.soundTransform;
      if (transform) {
        transform.asSetPublicProperty('pan', value / 100);
        this._channel.soundTransform = transform;
      }
    }

    public getTransform(): any { return null; }
    public setTransform(transformObject: any): void {}

    public getVolume(): number {
      var transform = this._channel && this._channel.soundTransform;
      return transform ? transform.asGetPublicProperty('volume') * 100 : 0;
    }
    public setVolume(value: number): void {
      var transform = this._channel && this._channel.soundTransform;
      if (transform) {
        transform.asSetPublicProperty('volume', value / 100);
        this._channel.soundTransform = transform;
      }
    }

    public start(secondOffset?: number, loops?: number): void {
      if (!this._sound) {
        return;
      }
      secondOffset = isNaN(secondOffset) || secondOffset < 0 ? 0 : +secondOffset;
      loops = isNaN(loops) || loops < 1 ? 1 : Math.floor(loops);

      this._stopSoundChannel();
      this._channel = this._sound.play(secondOffset, loops - 1);
    }
    private _stopSoundChannel(): void {
      if (!this._channel) {
        return;
      }
      this._channel.stop();
      this._channel = null;
    }
    public stop(linkageID?: string): void {
      if (!linkageID || linkageID === this._linkageID) {
        this._stopSoundChannel();
      }
    }
  }
}
