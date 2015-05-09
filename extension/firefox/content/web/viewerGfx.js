/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var SHUMWAY_ROOT = "resource://shumway/";

function notifyUserInput() {
  ShumwayCom.userInput();
}

document.addEventListener('mousedown', notifyUserInput, true);
document.addEventListener('mouseup', notifyUserInput, true);
document.addEventListener('keydown', notifyUserInput, true);
document.addEventListener('keyup', notifyUserInput, true);

var easel;
function createEasel(backgroundColor) {
  var Stage = Shumway.GFX.Stage;
  var Easel = Shumway.GFX.Easel;
  var Canvas2DRenderer = Shumway.GFX.Canvas2DRenderer;

  Shumway.GFX.WebGL.SHADER_ROOT = SHUMWAY_ROOT + "gfx/gl/shaders/";
  easel = new Easel(document.getElementById("easelContainer"), false, backgroundColor);
  easel.startRendering();
  return easel;
}

var easelHost;
function createEaselHost(playerWindow) {
  easelHost = new Shumway.GFX.Window.WindowEaselHost(easel, playerWindow, window);
  return easelHost;
}

function setHudVisible(visible) {
  Shumway.GFX.hud.value = !!visible;
}

Object.defineProperty(window, 'ShumwayCom', {
  get: function() { return parent.ShumwayCom; }
});