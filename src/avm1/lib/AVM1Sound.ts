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
  import flash = Shumway.AVMX.AS.flash;
  import ASObject = Shumway.AVMX.AS.ASObject;

  export class AVM1Sound extends AVM1NativeObject {
    static createAVM1Class(securityDomain: ISecurityDomain): typeof AVM1Sound {
      return wrapAVM1Class(securityDomain, AVM1Sound,
        [],
        ['attachSound', 'duration', 'getBytesLoaded', 'getBytesTotal',
         'getPan', 'setPan', 'getTransform', 'setTransform', 'getVolume', 'setVolume',
         'start', 'stop']);
    }

    private _target: IAVM1SymbolBase;
    private _sound: flash.media.Sound;
    private _channel: flash.media.SoundChannel;
    private _linkageID: string;

    public constructor(target_mc) {
      super();
      this._target = AVM1Utils.resolveTarget(target_mc);
      this._sound = null;
      this._channel = null;
      this._linkageID = null;
    }

    public attachSound(id: string): void {
      var symbol = this.context.getAsset(id);
      if (!symbol) {
        return;
      }

      var props: flash.media.SoundSymbol = Object.create(symbol.symbolProps);
      var sound: flash.media.Sound = (<any>flash.media.Sound).initializeFrom(props); // REDUX
      //flash.media.Sound.instanceConstructorNoInitialize.call(sound);
      this._linkageID = id;
      this._sound = sound;
    }

    public loadSound(url: string, isStreaming: boolean): void {}
    public getBytesLoaded(): number { return 0; }
    public getBytesTotal(): number { return 0; }

    public getPan(): number {
      var transform: ASObject = this._channel && this._channel.soundTransform;
      return transform ? transform.axGetPublicProperty('pan') * 100 : 0;
    }
    public setPan(value: number): void {
      var transform: ASObject = this._channel && this._channel.soundTransform;
      if (transform) {
        transform.axSetPublicProperty('pan', value / 100);
        this._channel.soundTransform = transform;
      }
    }

    public getTransform(): any { return null; }
    public setTransform(transformObject: any): void {}

    public getVolume(): number {
      var transform: ASObject = this._channel && this._channel.soundTransform;
      return transform ? transform.axGetPublicProperty('volume') * 100 : 0;
    }
    public setVolume(value: number): void {
      var transform: ASObject = this._channel && this._channel.soundTransform;
      if (transform) {
        transform.axSetPublicProperty('volume', value / 100);
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
