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
/// <reference path='../lib.d.ts' />
/// <reference path='../utilities.ts' />
/// <reference path='utilities.ts' />
/// <reference path='shapes.ts'/>
/// <reference path='geometry.ts'/>
/// <reference path='stage.ts'/>
/// <reference path='frame.ts'/>
/// <reference path='frameContainer.ts'/>
/// <reference path='filters.ts'/>
/// <reference path='gl/glContext.ts'/>
/// <reference path='gl/brush.ts'/>
/// <reference path='gl/gl.ts'/>
/// <reference path='gl/core.ts'/>
/// <reference path='dom/dom.ts'/>
/// <reference path='2d/2d.ts'/>
/// <reference path='bench.ts'/>
/// <reference path='easel.ts'/>

import Rectangle = Shumway.GFX.Geometry.Rectangle;
declare function randomStyle(): string;
declare function assert(...args : any[]);
declare function unexpected(...args : any[]);
declare function notImplemented(...args : any[]);
declare var release: boolean;
declare var Counter: any;
declare var FrameCounter: any;

declare class IndentingWriter {
  writeLn(str: string);
  enter(str: string);
  leaveAndEnter(str: string);
  leave(str: string);
  indent(str: string);
  outdent(str: string);
}

declare class Timeline {
  enter(str: string);
  leave(str: string);
}

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

module Shumway {
  export interface IRenderable {
    /**
     * Bounds of the source content. This should never change.
     */
    getBounds(): Rectangle;
    /**
     * Property bag used to attach dynamic properties to this object.
     */
    properties: {[name: string]: any};
    /**
     * Render source content.
     */
    render (context: CanvasRenderingContext2D, clipBounds?: Rectangle, options? : any);
    /**
     * Whether source has dynamic content.
     */
    isDynamic: boolean;
    /**
     * Whether the source's dynamic content has changed. This is only defined if |isDynamic| is true.
     */
    isInvalid: boolean;
    /**
     * Whether the source's content can be scaled and drawn at a higher resolution.
     */
    isScalable: boolean;
    /**
     * Whether the source's content should be tiled.
     */
    isTileable: boolean;
  }
}

module Shumway.GFX {
  export enum TraceLevel {
    None,
    Brief,
    Verbose,
  }

  export var traceLevel = TraceLevel.Verbose;
  export var release = true;
  export var writer: IndentingWriter = null;
  export var timeline: Timeline = null;

  export function count(name) {
    Counter.count(name);
    FrameCounter.count(name);
  }
}