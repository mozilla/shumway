/*
 * Copyright 2014 Mozilla Foundation
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

/// <reference path='../utilities.ts' />
/// <reference path='../options.ts'/>
/// <reference path='../settings.ts'/>
/// <reference path='../tools/profiler/references.ts' />
/// <reference path='../dataBuffer.ts' />
/// <reference path='../ShapeData.ts' />
/// <reference path='../TextContent.ts' />

/// <reference path='module.ts' />
/// <reference path='utilities.ts' />
/// <reference path='options.ts'/>
/// <reference path='geometry.ts'/>
/// <reference path='regionAllocator.ts'/>
/// <reference path='frame.ts'/>
/// <reference path='frameContainer.ts'/>
/// <reference path='stage.ts'/>
/// <reference path='renderables.ts'/>
/// <reference path='filters.ts'/>
/// <reference path='gl/glContext.ts'/>
/// <reference path='gl/core.ts'/>
/// <reference path='gl/gl.ts'/>
/// <reference path='gl/brush.ts'/>
/// <reference path='2d/2d.ts'/>
/// <reference path='dom/dom.ts'/>
/// <reference path='easel.ts'/>

interface WebGLFramebuffer {
  texture: WebGLTexture;
}

interface WebGLTexture {
  w: number;
  h: number;
  atlas: Shumway.GFX.GL.WebGLTextureAtlas;
  framebuffer: WebGLFramebuffer;
  regions: Shumway.GFX.GL.WebGLTextureRegion [];
}

interface WebGLActiveInfo {
  location: any;
}

interface WebGLProgram extends WebGLObject {
  uniforms: any;
  attributes: any;
}

interface CanvasRenderingContext2D {
  fillRule: string;
  mozFillRule: string;
}

interface CanvasPattern {
  setTransform: (matrix: SVGMatrix) => void;
}


