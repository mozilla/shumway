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
// Class: StageCapture
module Shumway.AVMX.AS.flash.automation {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class StageCapture extends flash.events.EventDispatcher {
    constructor () {
      super();
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    capture(type: string): void {
      type = axCoerceString(type);
      release || notImplemented("public flash.automation.StageCapture::capture"); return;
    }
    cancel(): void {
      release || notImplemented("public flash.automation.StageCapture::cancel"); return;
    }
    set fileNameBase(value: string) {
      value = axCoerceString(value);
      release || notImplemented("public flash.automation.StageCapture::set fileNameBase"); return;
    }
    get fileNameBase(): string {
      release || notImplemented("public flash.automation.StageCapture::get fileNameBase"); return;
    }
    set clipRect(value: flash.geom.Rectangle) {
      value = value;
      release || notImplemented("public flash.automation.StageCapture::set clipRect"); return;
    }
    get clipRect(): flash.geom.Rectangle {
      release || notImplemented("public flash.automation.StageCapture::get clipRect"); return;
    }
    captureBitmapData(): flash.display.BitmapData {
      release || notImplemented("public flash.automation.StageCapture::captureBitmapData"); return;
    }
    set captureSource(value: string) {
      value = axCoerceString(value);
      release || notImplemented("public flash.automation.StageCapture::set captureSource"); return;
    }
    get captureSource(): string {
      release || notImplemented("public flash.automation.StageCapture::get captureSource"); return;
    }
  }
}
