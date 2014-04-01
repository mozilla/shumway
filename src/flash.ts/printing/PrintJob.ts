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
// Class: PrintJob
module Shumway.AVM2.AS.flash.printing {
  import notImplemented = Shumway.Debug.notImplemented;
  export class PrintJob extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.printing.PrintJob");
    }
    // Static   JS -> AS Bindings
    static isSupported: boolean;
    // Static   AS -> JS Bindings
    static _checkSupported(): boolean {
      notImplemented("public flash.printing.PrintJob::static _checkSupported"); return;
    }
    // Instance JS -> AS Bindings
    paperHeight: number /*int*/;
    paperWidth: number /*int*/;
    pageHeight: number /*int*/;
    pageWidth: number /*int*/;
    orientation: string;
    start: () => boolean;
    send: () => void;
    toClassicRectangle: (printArea: flash.geom.Rectangle) => any;
    addPage: (sprite: flash.display.Sprite, printArea: flash.geom.Rectangle = null, options: flash.printing.PrintJobOptions = null, frameNum: number /*int*/ = 0) => void;
    // Instance AS -> JS Bindings
    invoke(index: number /*uint*/): any {
      index = index >>> 0;
      notImplemented("public flash.printing.PrintJob::invoke"); return;
    }
    _invoke(index: any): any {
      
      notImplemented("public flash.printing.PrintJob::_invoke"); return;
    }
  }
}
