/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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

var rendererOptions = shumwayOptions.register(new OptionSet("Renderer Options"));
var traceRenderer = rendererOptions.register(new Option("tr", "traceRenderer", "number", 0, "trace renderer execution"));
var disableRendering = rendererOptions.register(new Option("drv", "disableRendering", "boolean", false, "disable rendering"));
var disableMouse = rendererOptions.register(new Option("dmv", "disableMouse", "boolean", false, "disable mouse handling"));
// var showRedrawRegions = rendererOptions.register(new Option("rr", "showRedrawRegions", "boolean", false, "show redraw regions"));
var renderAsWireframe = rendererOptions.register(new Option("raw", "renderAsWireframe", "boolean", false, "render as wireframe"));
var turboMode = rendererOptions.register(new Option("", "turbo", "boolean", false, "turbo mode"));
var forceHidpi = rendererOptions.register(new Option("", "forceHidpi", "boolean", true, "force hidpi"));
var skipFrameDraw = rendererOptions.register(new Option("", "skipFrameDraw", "boolean", true, "skip frame when not on time"));
var hud = rendererOptions.register(new Option("", "hud", "boolean", false, "show hud mode"));
var dummyAnimation = rendererOptions.register(new Option("", "dummy", "boolean", false, "show test balls animation"));

var enableConstructChildren = rendererOptions.register(new Option("", "constructChildren", "boolean", true, "Construct Children"));
var enableEnterFrame = rendererOptions.register(new Option("", "enterFrame", "boolean", true, "Enter Frame"));
var enableAdvanceFrame = rendererOptions.register(new Option("", "advanceFrame", "boolean", true, "Advance Frame"));

var stageOptions = shumwayOptions.register(new OptionSet("Stage Renderer Options"));

var ignoreViewport = stageOptions.register(new Option("", "ignoreViewport", "boolean", false, "Cull elements outside of the viewport."));
var ignoreColorTransform = stageOptions.register(new Option("", "ignoreColorTransform", "boolean", false, "Don't apply color transforms."));
var debugStage = stageOptions.register(new Option("", "debugStage", "boolean", false, "Debug Stage."));
var disableStage = stageOptions.register(new Option("", "disableStage", "boolean", false, "Disable Stage."));
var disableMasking = stageOptions.register(new Option("", "disableMasking", "boolean", false, "Disable masking."));
var paintBounds = stageOptions.register(new Option("", "paintBounds", "boolean", false, "Draw frame container bounding boxes."));
var paintFlashing = stageOptions.register(new Option("", "paintFlashing", "boolean", false, "Flash redrawn regions."));

var backend = stageOptions.register(new Option("t", "backend", "number", 0, "Backends", {
  choices: {
    Canvas2D: 0,
    WebGL: 1,
    Both: 2
  }
}));

var webGLOptions = stageOptions.register(new OptionSet("WebGL Options"));
  var perspectiveCamera = webGLOptions.register(new Option("", "pc", "boolean", false, "Use perspective camera."));
  var perspectiveCameraFOV = webGLOptions.register(new Option("", "pcFOV", "number", 60, "Perspective Camera FOV."));
  var perspectiveCameraDistance = webGLOptions.register(new Option("", "pcDistance", "number", 2, "Perspective Camera Distance."));
  var perspectiveCameraAngle = webGLOptions.register(new Option("", "pcAngle", "number", 0, "Perspective Camera Angle."));
  var perspectiveCameraAngleRotate = webGLOptions.register(new Option("", "pcRotate", "boolean", false, "Rotate Use perspective camera."));
  var perspectiveCameraSpacing = webGLOptions.register(new Option("", "pcSpacing", "number", 0.01, "Element Spacing."));
  var perspectiveCameraSpacingInflate = webGLOptions.register(new Option("", "pcInflate", "boolean", false, "Rotate Use perspective camera."));

  var drawTiles = webGLOptions.register(new Option("", "drawTiles", "boolean", false, "Draw WebGL Tiles"));

  var drawTextures = webGLOptions.register(new Option("", "drawTextures", "boolean", false, "Draw WebGL Textures."));
  var drawTexture = webGLOptions.register(new Option("", "drawTexture", "number", -1, "Draw WebGL Texture #"));
  var drawElements = webGLOptions.register(new Option("", "drawElements", "boolean", true, "Actually call gl.drawElements. This is useful to test if the GPU is the bottleneck."));
  var disableTextureUploads = webGLOptions.register(new Option("", "disableTextureUploads", "boolean", false, "Disable texture uploads."));

var canvas2DOptions = stageOptions.register(new OptionSet("Canvas2D Options"));
  var clipDirtyRegions = canvas2DOptions.register(new Option("", "clipDirtyRegions", "boolean", false, "Clip dirty regions."));
  var clipCanvas = canvas2DOptions.register(new Option("", "clipCanvas", "boolean", false, "Clip Regions."));
  var cull = canvas2DOptions.register(new Option("", "cull", "boolean", false, "Enable culling."));
  var compositeMask = canvas2DOptions.register(new Option("", "compositeMask", "boolean", false, "Composite Mask."));