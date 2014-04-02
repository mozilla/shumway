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
// Class: MouseCursorData
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  export class MouseCursorData extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.ui.MouseCursorData");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _data: ASVector<any>;
    // _hotSpot: flash.geom.Point;
    // _frameRate: number;
    get data(): ASVector<any> {
      notImplemented("public flash.ui.MouseCursorData::get data"); return;
      // return this._data;
    }
    set data(data: ASVector<any>) {
      data = data;
      notImplemented("public flash.ui.MouseCursorData::set data"); return;
      // this._data = data;
    }
    get hotSpot(): flash.geom.Point {
      notImplemented("public flash.ui.MouseCursorData::get hotSpot"); return;
      // return this._hotSpot;
    }
    set hotSpot(data: flash.geom.Point) {
      data = data;
      notImplemented("public flash.ui.MouseCursorData::set hotSpot"); return;
      // this._hotSpot = data;
    }
    get frameRate(): number {
      notImplemented("public flash.ui.MouseCursorData::get frameRate"); return;
      // return this._frameRate;
    }
    set frameRate(data: number) {
      data = +data;
      notImplemented("public flash.ui.MouseCursorData::set frameRate"); return;
      // this._frameRate = data;
    }
  }
}
