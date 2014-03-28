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

var rendererOptions = coreOptions.register(new OptionSet("Renderer Options"));
var traceRenderer = rendererOptions.register(new Option("tr", "traceRenderer", "number", 0, "trace renderer execution"));
var disableRendering = rendererOptions.register(new Option("drv", "disableRendering", "boolean", false, "disable rendering"));
var disableMouse = rendererOptions.register(new Option("dmv", "disableMouse", "boolean", false, "disable mouse handling"));
//var showRedrawRegions = rendererOptions.register(new Option("rr", "showRedrawRegions", "boolean", false, "show redraw regions"));
var renderAsWireframe = rendererOptions.register(new Option("raw", "renderAsWireframe", "boolean", false, "render as wireframe"));
var turboMode = rendererOptions.register(new Option("", "turbo", "boolean", false, "turbo mode"));
var forceHidpi = rendererOptions.register(new Option("", "forceHidpi", "boolean", true, "force hidpi"));
var skipFrameDraw = rendererOptions.register(new Option("", "skipFrameDraw", "boolean", true, "skip frame when not on time"));
var hud = rendererOptions.register(new Option("", "hud", "boolean", false, "show hud mode"));
var dummyAnimation = rendererOptions.register(new Option("", "dummy", "boolean", false, "show test balls animation"));

var enableConstructChildren = rendererOptions.register(new Option("", "constructChildren", "boolean", true, "Construct Children"));
var enableEnterFrame = rendererOptions.register(new Option("", "enterFrame", "boolean", true, "Enter Frame"));
var enableAdvanceFrame = rendererOptions.register(new Option("", "advanceFrame", "boolean", true, "Advance Frame"));

var stageOptions = coreOptions.register(new OptionSet("Stage Renderer Options"));
var perspectiveCamera = stageOptions.register(new Option("", "pc", "boolean", false, "Use perspective camera."));

var perspectiveCameraFOV = stageOptions.register(new Option("", "pcFOV", "number", 60, "Perspective Camera FOV."));
var perspectiveCameraDistance = stageOptions.register(new Option("", "pcDistance", "number", 2, "Perspective Camera Distance."));
var perspectiveCameraAngle = stageOptions.register(new Option("", "pcAngle", "number", 0, "Perspective Camera Angle."));
var perspectiveCameraAngleRotate = stageOptions.register(new Option("", "pcRotate", "boolean", false, "Rotate Use perspective camera."));
var perspectiveCameraSpacing = stageOptions.register(new Option("", "pcSpacing", "number", 0.01, "Element Spacing."));
var perspectiveCameraSpacingInflate = stageOptions.register(new Option("", "pcInflate", "boolean", false, "Rotate Use perspective camera."));

var drawTiles = stageOptions.register(new Option("", "drawTiles", "boolean", false, "Draw Tiles."));
var drawTextures = stageOptions.register(new Option("", "drawTextures", "boolean", false, "Draw Textures."));
var drawTexture = stageOptions.register(new Option("", "drawTextures", "number", -1, "Draw Texture."));
var drawElements = stageOptions.register(new Option("", "drawElements", "boolean", true, "Draw Elements."));
var ignoreViewport = stageOptions.register(new Option("", "ignoreViewport", "boolean", false, "Ignore Viewport."));
var ignoreColorTransform = stageOptions.register(new Option("", "ignoreColorTransform", "boolean", false, "Ignore Color Transform."));

var clipDirtyRegions = stageOptions.register(new Option("", "clipDirtyRegions", "boolean", true, "Clip Dirty Regions."));
var clipCanvas = stageOptions.register(new Option("", "clipCanvas", "boolean", true, "Clip Regions."));
var cull = stageOptions.register(new Option("", "cull", "boolean", true, "cull."));
var paintFlashing = stageOptions.register(new Option("", "paintFlashing", "boolean", false, "Paint Flashing."));
var compositeMask = stageOptions.register(new Option("", "compositeMask", "boolean", true, "Composite Mask."));
var disableMasking = stageOptions.register(new Option("", "disableMasking", "boolean", false, "Disable Masking."));
var debugStage = stageOptions.register(new Option("", "debugStage", "boolean", false, "Debug Stage."));
var disableTextureUploads = stageOptions.register(new Option("", "disableTextureUploads", "boolean", false, "Disable texture uploads."));

