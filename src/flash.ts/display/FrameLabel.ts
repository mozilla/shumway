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
// Class: FrameLabel
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class FrameLabel extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor (name: string, frame: number /*int*/) {
      name = "" + name; frame = frame | 0;
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.display.FrameLabel");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    ctor(name: string, frame: number /*int*/): void {
      name = "" + name; frame = frame | 0;
      notImplemented("public flash.display.FrameLabel::ctor"); return;
    }
    get name(): string {
      notImplemented("public flash.display.FrameLabel::get name"); return;
    }
    get frame(): number /*int*/ {
      notImplemented("public flash.display.FrameLabel::get frame"); return;
    }
  }
}
