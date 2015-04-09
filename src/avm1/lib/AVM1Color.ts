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
        AVM1Color.prototype.avm1Constructor);
    }

    private _target: IAVM1SymbolBase;

    public avm1Constructor(target_mc) {
      this._target = AVM1Utils.resolveTarget(this.context, target_mc);
    }

    public getRGB() {
      var transform = this.getTransform();
      return transform.asGetPublicProperty('color');
    }

    public getTransform(): any {
      return this._target.as3Object.transform.colorTransform;
    }

    public setRGB(offset) {
      var transform = new flash.geom.ColorTransform();
      transform.axSetPublicProperty('color', offset);
      this.setTransform(transform);
    }

    public setTransform(transform: any) {
      this._target.as3Object.transform.colorTransform = transform;
    }
  }
}