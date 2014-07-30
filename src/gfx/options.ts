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
  export var imageUpdateOption = rendererOptions.register(new Option("", "imageUpdate", "boolean", true, "Enable image conversion."));
  export var stageOptions = shumwayOptions.register(new OptionSet("Stage Renderer Options"));
  export var forcePaint = stageOptions.register(new Option("", "forcePaint", "boolean", false, "Force repainting."));
  export var ignoreViewport = stageOptions.register(new Option("", "ignoreViewport", "boolean", false, "Cull elements outside of the viewport."));
  export var viewportLoupeDiameter = stageOptions.register(new Option("", "viewportLoupeDiameter", "number", 512, "Size of the viewport loupe.", {range: { min: 1, max: 1024, step: 1 }}));
  export var disableClipping = stageOptions.register(new Option("", "disableClipping", "boolean", false, "Disable clipping."));
  export var debugClipping = stageOptions.register(new Option("", "debugClipping", "boolean", false, "Disable clipping."));

  export var backend = stageOptions.register(new Option("", "backend", "number", 0, "Backends", {
    choices: {
      Canvas2D: 0,
      WebGL: 1,
      Both: 2
    }
  }));

  var webGLOptions = stageOptions.register(new OptionSet("WebGL Options"));
  export var perspectiveCamera = webGLOptions.register(new Option("", "pc", "boolean", false, "Use perspective camera."));
  export var perspectiveCameraFOV = webGLOptions.register(new Option("", "pcFOV", "number", 60, "Perspective Camera FOV."));
  export var perspectiveCameraDistance = webGLOptions.register(new Option("", "pcDistance", "number", 2, "Perspective Camera Distance."));
  export var perspectiveCameraAngle = webGLOptions.register(new Option("", "pcAngle", "number", 0, "Perspective Camera Angle."));
  export var perspectiveCameraAngleRotate = webGLOptions.register(new Option("", "pcRotate", "boolean", false, "Rotate Use perspective camera."));
  export var perspectiveCameraSpacing = webGLOptions.register(new Option("", "pcSpacing", "number", 0.01, "Element Spacing."));
  export var perspectiveCameraSpacingInflate = webGLOptions.register(new Option("", "pcInflate", "boolean", false, "Rotate Use perspective camera."));

  export var drawTiles = webGLOptions.register(new Option("", "drawTiles", "boolean", false, "Draw WebGL Tiles"));

  export var drawSurfaces = webGLOptions.register(new Option("", "drawSurfaces", "boolean", false, "Draw WebGL Surfaces."));
  export var drawSurface = webGLOptions.register(new Option("", "drawSurface", "number", -1, "Draw WebGL Surface #"));
  export var drawElements = webGLOptions.register(new Option("", "drawElements", "boolean", true, "Actually call gl.drawElements. This is useful to test if the GPU is the bottleneck."));
  export var disableSurfaceUploads = webGLOptions.register(new Option("", "disableSurfaceUploads", "boolean", false, "Disable surface uploads."));

  export var premultipliedAlpha = webGLOptions.register(new Option("", "premultipliedAlpha", "boolean", false, "Set the premultipliedAlpha flag on getContext()."));
  export var unpackPremultiplyAlpha = webGLOptions.register(new Option("", "unpackPremultiplyAlpha", "boolean", true, "Use UNPACK_PREMULTIPLY_ALPHA_WEBGL in pixelStorei."));

  var factorChoices = {
    ZERO: 0,
    ONE: 1,
    SRC_COLOR: 768,
    ONE_MINUS_SRC_COLOR: 769,
    DST_COLOR: 774,
    ONE_MINUS_DST_COLOR: 775,
    SRC_ALPHA: 770,
    ONE_MINUS_SRC_ALPHA: 771,
    DST_ALPHA: 772,
    ONE_MINUS_DST_ALPHA: 773,
    SRC_ALPHA_SATURATE: 776,
    CONSTANT_COLOR: 32769,
    ONE_MINUS_CONSTANT_COLOR: 32770,
    CONSTANT_ALPHA: 32771,
    ONE_MINUS_CONSTANT_ALPHA: 32772
  };

  export var sourceBlendFactor = webGLOptions.register(new Option("", "sourceBlendFactor", "number", factorChoices.ONE, "", { choices: factorChoices }));
  export var destinationBlendFactor = webGLOptions.register(new Option("", "destinationBlendFactor", "number", factorChoices.ONE_MINUS_SRC_ALPHA, "", { choices: factorChoices }));

  var canvas2DOptions = stageOptions.register(new OptionSet("Canvas2D Options"));
  export var clipDirtyRegions = canvas2DOptions.register(new Option("", "clipDirtyRegions", "boolean", false, "Clip dirty regions."));
  export var clipCanvas = canvas2DOptions.register(new Option("", "clipCanvas", "boolean", false, "Clip Regions."));
  export var cull = canvas2DOptions.register(new Option("", "cull", "boolean", false, "Enable culling."));
  export var compositeMask = canvas2DOptions.register(new Option("", "compositeMask", "boolean", false, "Composite Mask."));

  export var snapToDevicePixels = canvas2DOptions.register(new Option("", "snapToDevicePixels", "boolean", false, ""));
  export var imageSmoothing = canvas2DOptions.register(new Option("", "imageSmoothing", "boolean", false, ""));
  export var blending = canvas2DOptions.register(new Option("", "blending", "boolean", true, ""));
  export var cacheShapes = canvas2DOptions.register(new Option("", "cacheShapes", "boolean", false, ""));
  export var cacheShapesMaxSize = canvas2DOptions.register(new Option("", "cacheShapesMaxSize", "number", 256, "", {range: { min: 1, max: 1024, step: 1 }}));
  export var cacheShapesThreshold = canvas2DOptions.register(new Option("", "cacheShapesThreshold", "number", 256, "", {range: { min: 1, max: 1024, step: 1 }}));
}