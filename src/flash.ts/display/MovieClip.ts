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
 * limitations under the License.
 */
// Class: MovieClip
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import throwError = Shumway.AVM2.Runtime.throwError;

  export class MovieClip extends flash.display.Sprite {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol: MovieClip) {
      var self: MovieClip = this;
      self._currentFrame = 0;
      self._framesLoaded = 1;
      self._totalFrames = 1;
      self._trackAsMenu = false;
      self._scenes = [];
      self._currentLabel = null;
      self._currentFrameLabel = null;
      self._enabled = true;
      self._isPlaying = false;

      self._nextFrame = 1;
    };
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["currentLabels"];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.MovieClip");
    }
    
    // JS -> AS Bindings
    
    currentLabels: any [];
    
    // AS -> JS Bindings
    
    _currentFrame: number /*int*/;
    _framesLoaded: number /*int*/;
    _totalFrames: number /*int*/;
    _trackAsMenu: boolean;
    _scenes: any [];
    // _currentScene: flash.display.Scene;
    _currentLabel: string;
    _currentFrameLabel: string;
    // _currentLabels: any [];
    _enabled: boolean;
    _isPlaying: boolean;

    _nextFrame: number /*int*/;
    _frameScripts: any;

    gotoFrame(frame: any, scene: string = null) {
      frame = frame; scene = "" + scene;
    }

    callFrame(frame: ASObject) {

    }

    advanceFrame() {
      this.gotoFrame(this._currentFrame + 1);
    }

    get currentFrame(): number /*int*/ {
      return this._currentFrame;
    }
    get framesLoaded(): number /*int*/ {
      return this._framesLoaded;
    }
    get totalFrames(): number /*int*/ {
      return this._totalFrames;
    }
    get trackAsMenu(): boolean {
      return this._trackAsMenu;
    }
    set trackAsMenu(value: boolean) {
      this._trackAsMenu = !!value;
    }
    get scenes(): any [] {
      return this._scenes;
    }
    get currentScene(): flash.display.Scene {
      notImplemented("public flash.display.MovieClip::get currentScene"); return;
      // return this._currentScene;
    }
    get currentLabel(): string {
      notImplemented("public flash.display.MovieClip::get currentLabel"); return;
      // return this._currentLabel;
    }
    get currentFrameLabel(): string {
      notImplemented("public flash.display.MovieClip::get currentFrameLabel"); return;
      // return this._currentFrameLabel;
    }
    get enabled(): boolean {
      return this._enabled;
    }
    set enabled(value: boolean) {
      this._enabled = !!value;
    }
    get isPlaying(): boolean {
      return this._isPlaying;
    }
    play(): void {
      this._isPlaying = true;
    }
    stop(): void {
      this._isPlaying = false;
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
      // arguments are pairs of frameIndex and script/function
      // frameIndex is in range 0..totalFrames-1
      var frameScripts = this._frameScripts;
      for (var i = 0; i < arguments.length; i += 2) {
        var frameNum = arguments[i] + 1;
        var fn = arguments[i + 1];
        if (!fn) {
          throwError('ArgumentError', Errors.TooFewArgumentsError, i, i + 1);
        }
        var scripts = frameScripts[frameNum];
        if (scripts) {
          scripts.push(fn);
        } else {
          frameScripts[frameNum] = [fn];
        }
      }
    }

    prevScene(): void {
      notImplemented("public flash.display.MovieClip::prevScene"); return;
    }
    nextScene(): void {
      notImplemented("public flash.display.MovieClip::nextScene"); return;
    }
  }
}
