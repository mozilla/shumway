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
// Class: MovieClip
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class MovieClip extends flash.display.Sprite {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.MovieClip");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    currentLabels: any [];
    // Instance AS -> JS Bindings
    get currentFrame(): number /*int*/ {
      notImplemented("public flash.display.MovieClip::get currentFrame"); return;
    }
    get framesLoaded(): number /*int*/ {
      notImplemented("public flash.display.MovieClip::get framesLoaded"); return;
    }
    get totalFrames(): number /*int*/ {
      notImplemented("public flash.display.MovieClip::get totalFrames"); return;
    }
    get trackAsMenu(): boolean {
      notImplemented("public flash.display.MovieClip::get trackAsMenu"); return;
    }
    set trackAsMenu(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.MovieClip::set trackAsMenu"); return;
    }
    play(): void {
      notImplemented("public flash.display.MovieClip::play"); return;
    }
    stop(): void {
      notImplemented("public flash.display.MovieClip::stop"); return;
    }
    nextFrame(): void {
      notImplemented("public flash.display.MovieClip::nextFrame"); return;
    }
    prevFrame(): void {
      notImplemented("public flash.display.MovieClip::prevFrame"); return;
    }
    gotoAndPlay(frame: ASObject, scene: string = null): void {
      frame = frame; scene = "" + scene;
      notImplemented("public flash.display.MovieClip::gotoAndPlay"); return;
    }
    gotoAndStop(frame: ASObject, scene: string = null): void {
      frame = frame; scene = "" + scene;
      notImplemented("public flash.display.MovieClip::gotoAndStop"); return;
    }
    addFrameScript(): void {
      notImplemented("public flash.display.MovieClip::addFrameScript"); return;
    }
    get scenes(): any [] {
      notImplemented("public flash.display.MovieClip::get scenes"); return;
    }
    get currentScene(): flash.display.Scene {
      notImplemented("public flash.display.MovieClip::get currentScene"); return;
    }
    get currentLabel(): string {
      notImplemented("public flash.display.MovieClip::get currentLabel"); return;
    }
    get currentFrameLabel(): string {
      notImplemented("public flash.display.MovieClip::get currentFrameLabel"); return;
    }
    prevScene(): void {
      notImplemented("public flash.display.MovieClip::prevScene"); return;
    }
    nextScene(): void {
      notImplemented("public flash.display.MovieClip::nextScene"); return;
    }
    get enabled(): boolean {
      notImplemented("public flash.display.MovieClip::get enabled"); return;
    }
    set enabled(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.MovieClip::set enabled"); return;
    }
    get isPlaying(): boolean {
      notImplemented("public flash.display.MovieClip::get isPlaying"); return;
    }
  }
}
