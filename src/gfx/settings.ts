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


module Shumway.GFX {
  import Option = Shumway.Options.Option;
  import OptionSet = Shumway.Options.OptionSet;

  import shumwayOptions = Shumway.Settings.shumwayOptions;

  var rendererOptions = shumwayOptions.register(new OptionSet("Renderer Options"));
  export var imageUpdateOption = rendererOptions.register(new Option("", "imageUpdate", "boolean", true, "Enable image updating."));
  export var imageConvertOption = rendererOptions.register(new Option("", "imageConvert", "boolean", true, "Enable image conversion."));
  export var stageOptions = shumwayOptions.register(new OptionSet("Stage Renderer Options"));
  export var forcePaint = stageOptions.register(new Option("", "forcePaint", "boolean", false, "Force repainting."));
  export var ignoreViewport = stageOptions.register(new Option("", "ignoreViewport", "boolean", false, "Cull elements outside of the viewport."));
  export var viewportLoupeDiameter = stageOptions.register(new Option("", "viewportLoupeDiameter", "number", 256, "Size of the viewport loupe.", {range: { min: 1, max: 1024, step: 1 }}));
  export var disableClipping = stageOptions.register(new Option("", "disableClipping", "boolean", false, "Disable clipping."));
  export var debugClipping = stageOptions.register(new Option("", "debugClipping", "boolean", false, "Disable clipping."));
  export var hud = stageOptions.register(new Option("", "hud", "boolean", false, "Enable HUD."));

  var canvas2DOptions = stageOptions.register(new OptionSet("Canvas2D Options"));
  export var clipDirtyRegions = canvas2DOptions.register(new Option("", "clipDirtyRegions", "boolean", false, "Clip dirty regions."));
  export var clipCanvas = canvas2DOptions.register(new Option("", "clipCanvas", "boolean", false, "Clip Regions."));
  export var cull = canvas2DOptions.register(new Option("", "cull", "boolean", false, "Enable culling."));


  export var snapToDevicePixels = canvas2DOptions.register(new Option("", "snapToDevicePixels", "boolean", false, ""));
  export var imageSmoothing = canvas2DOptions.register(new Option("", "imageSmoothing", "boolean", false, ""));
  export var masking = canvas2DOptions.register(new Option("", "masking", "boolean", true, "Composite Mask."));
  export var blending = canvas2DOptions.register(new Option("", "blending", "boolean", true, ""));
  export var debugLayers = canvas2DOptions.register(new Option("", "debugLayers", "boolean", false, ""));
  export var filters = canvas2DOptions.register(new Option("", "filters", "boolean", true, ""));
  export var cacheShapes = canvas2DOptions.register(new Option("", "cacheShapes", "boolean", true, ""));
  export var cacheShapesMaxSize = canvas2DOptions.register(new Option("", "cacheShapesMaxSize", "number", 256, "", {range: { min: 1, max: 1024, step: 1 }}));
  export var cacheShapesThreshold = canvas2DOptions.register(new Option("", "cacheShapesThreshold", "number", 256, "", {range: { min: 1, max: 1024, step: 1 }}));
}