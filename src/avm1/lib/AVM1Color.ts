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

  export class AVM1Color extends AVM1Object {
    static createAVM1Class(context: AVM1Context): AVM1Object {
      return wrapAVM1NativeClass(context, true, AVM1Color,
        [],
        ['getRGB', 'getTransform', 'setRGB', 'setTransform'],
        null, AVM1Color.prototype.avm1Constructor);
    }

    private _target: IAVM1SymbolBase;
    private _targetAS3Object: flash.display.InteractiveObject;

    public avm1Constructor(target_mc) {
      this._target = this.context.resolveTarget(target_mc);
      this._targetAS3Object = <flash.display.InteractiveObject>getAS3Object(this._target);
    }

    public getRGB(): number {
      var transform = AVM1Color.prototype.getTransform.call(this);
      return transform.alGet('rgb');
    }

    public getTransform(): AVM1ColorTransform {
      return AVM1ColorTransform.fromAS3ColorTransform(this.context,
        this._targetAS3Object.transform.colorTransform);
    }

    public setRGB(offset): void {
      var transform = AVM1Color.prototype.getTransform.call(this);
      transform.alPut('rgb', offset);
      AVM1Color.prototype.setTransform.call(this, transform);
    }

    public setTransform(transform: AVM1Object): void {
      this._targetAS3Object.transform.colorTransform = toAS3ColorTransform(transform);
    }
  }
}
