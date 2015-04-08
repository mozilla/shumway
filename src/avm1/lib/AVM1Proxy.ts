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
  import notImplemented = Shumway.Debug.notImplemented;

  export class AVM1Proxy<T> extends AVM1Function {
    private _target:T;

    constructor(context: AVM1Context) {
      super(context);
    }

    public setTarget(value: T) {
      this._target = value;
    }

    public alGetOwnProperty(p): AVM1PropertyDescriptor {
      var desc = super.alGetOwnProperty(p);
      if (desc) {
        return desc;
      }
      var target = <any>this._target;
      if (target && target.axHasPublicProperty(p)) {
        var value = target.axGetPublicProperty(p);
        return {
          flags: AVM1PropertyFlags.DATA,
          value: typeof value !== 'function' ? value :
            new AVM1NativeFunction(this.context, value.bind(target))
        };
      }
      return undefined;
    }

    public alSetOwnProperty(p, v: AVM1PropertyDescriptor) {
      var desc = super.alGetOwnProperty(p);
      if (desc) {
        super.alSetOwnProperty(p, v);
        return;
      }
      var target = <any>this._target;
      if (target && target.axHasPublicProperty(p)) {
        // TODO shall we check for native function?
        target.axSetPublicProperty(p, v.value);
        return;
      }
    }

    public static wrap<T>(context: AVM1Context, cls: any /* typeof AVM1Proxy<T> */,
                          staticMethods: string[], methods: string[]): AVM1Object {
      var wrapped = new AVM1NativeFunction(context, null, cls.prototype.avm1Constructor);
      wrapAVM1NativeMembers(context, wrapped, cls, staticMethods, true);
      var wrappedProto = new AVM1Proxy<T>(context);
      wrappedProto.alPrototype = context.builtins.Object.alGetPrototypeProperty();
      wrapAVM1NativeMembers(context, wrappedProto, cls.prototype, methods, false);
      wrapped.alPutPrototypeProperty(wrappedProto);
      return wrapped;
    }
  }
}