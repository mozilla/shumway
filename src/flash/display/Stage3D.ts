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
// Class: Stage3D
module Shumway.AVMX.AS.flash.display {
  import asCoerceString = Shumway.AVMX.asCoerceString;
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import asCoerceString = Shumway.AVMX.asCoerceString;
  export class Stage3D extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super(undefined);
      dummyConstructor("public flash.display.Stage3D");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _context3D: flash.display3D.Context3D;
    // _x: number;
    // _y: number;
    // _visible: boolean;
    get context3D(): flash.display3D.Context3D {
      notImplemented("public flash.display.Stage3D::get context3D"); return;
      // return this._context3D;
    }
    get x(): number {
      notImplemented("public flash.display.Stage3D::get x"); return;
      // return this._x;
    }
    set x(value: number) {
      value = +value;
      notImplemented("public flash.display.Stage3D::set x"); return;
      // this._x = value;
    }
    get y(): number {
      notImplemented("public flash.display.Stage3D::get y"); return;
      // return this._y;
    }
    set y(value: number) {
      value = +value;
      notImplemented("public flash.display.Stage3D::set y"); return;
      // this._y = value;
    }
    get visible(): boolean {
      notImplemented("public flash.display.Stage3D::get visible"); return;
      // return this._visible;
    }
    set visible(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.Stage3D::set visible"); return;
      // this._visible = value;
    }
    requestContext3D(context3DRenderMode: string = "auto", profile: string = "baseline"): void {
      context3DRenderMode = asCoerceString(context3DRenderMode); profile = asCoerceString(profile);
      notImplemented("public flash.display.Stage3D::requestContext3D"); return;
    }
  }
}
