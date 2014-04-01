/**
 * Copyright 2013 Mozilla Foundation
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
 * limitations undxr the License.
 */
// Class: Stage3D
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Stage3D extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.display.Stage3D");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get context3D(): flash.display3D.Context3D {
      notImplemented("public flash.display.Stage3D::get context3D"); return;
    }
    requestContext3D(context3DRenderMode: string = "auto", profile: string = "baseline"): void {
      context3DRenderMode = "" + context3DRenderMode; profile = "" + profile;
      notImplemented("public flash.display.Stage3D::requestContext3D"); return;
    }
    get x(): number {
      notImplemented("public flash.display.Stage3D::get x"); return;
    }
    set x(value: number) {
      value = +value;
      notImplemented("public flash.display.Stage3D::set x"); return;
    }
    get y(): number {
      notImplemented("public flash.display.Stage3D::get y"); return;
    }
    set y(value: number) {
      value = +value;
      notImplemented("public flash.display.Stage3D::set y"); return;
    }
    get visible(): boolean {
      notImplemented("public flash.display.Stage3D::get visible"); return;
    }
    set visible(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.Stage3D::set visible"); return;
    }
  }
}
