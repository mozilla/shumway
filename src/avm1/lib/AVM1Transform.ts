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

  export class AVM1Transform extends ASObject {
    static createAVM1Class(securityDomain: ISecurityDomain):typeof AVM1Transform {
      return wrapAVM1Class(securityDomain, AVM1Transform,
        [],
        ['matrix', 'concatenatedMatrix', 'colorTransform', 'pixelBounds']);
    }

    private _target:IAVM1SymbolBase;

    public constructor(target_mc) {
      super();
      this._target = AVM1Utils.resolveTarget(target_mc);
    }

    public get matrix():any {
      return this._target.as3Object.transform.matrix;
    }

    public set matrix(value) {
      if (value instanceof flash.geom.Matrix) {
        this._target.as3Object.transform.matrix = value;
        return;
      }
      if (value == null) {
        return;
      }
      // It accepts random objects with a,b,c,d,tx,ty properties
      var m = this.matrix;
      if (value.asHasProperty(undefined, 'a', 0)) {
        m.a = value.asGetPublicProperty('a');
      }
      if (value.asHasProperty(undefined, 'b', 0)) {
        m.b = value.asGetPublicProperty('b');
      }
      if (value.asHasProperty(undefined, 'c', 0)) {
        m.c = value.asGetPublicProperty('c');
      }
      if (value.asHasProperty(undefined, 'd', 0)) {
        m.d = value.asGetPublicProperty('d');
      }
      if (value.asHasProperty(undefined, 'tx', 0)) {
        m.tx = value.asGetPublicProperty('tx');
      }
      if (value.asHasProperty(undefined, 'ty', 0)) {
        m.ty = value.asGetPublicProperty('ty');
      }
      this._target.as3Object.transform.matrix = m;
    }

    public get concatenatedMatrix(): flash.geom.Matrix {
      return this._target.as3Object.transform.concatenatedMatrix;
    }

    public get colorTransform(): flash.geom.ColorTransform {
      return this._target.as3Object.transform.colorTransform;
    }

    public set colorTransform(value: flash.geom.ColorTransform) {
      this._target.as3Object.transform.colorTransform = value;
    }

    public get pixelBounds(): flash.geom.Rectangle {
      return this._target.as3Object.pixelBounds;
    }
  }
}