/// <reference path='shapes.ts'/>
/// <reference path='geometry.ts'/>
/// <reference path='stage.ts'/>
/// <reference path='filters.ts'/>
/// <reference path='elements.ts'/>
/// <reference path='util.ts'/>
/// <reference path='gl.ts'/>
/// <reference path='gl/core.ts'/>
/// <reference path='dom.ts'/>
/// <reference path='2d.ts'/>
/// <reference path='bench.ts'/>

declare function randomStyle(): string;
declare function assert(...args : any[]);
declare function unexpected(...args : any[]);
declare function notImplemented(...args : any[]);
declare var release;
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
  atlas: Shumway.GL.WebGLTextureAtlas;
  framebuffer: WebGLFramebuffer;
  regions: Shumway.GL.WebGLTextureRegion [];
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
    getBounds(): Shumway.Geometry.Rectangle;
    /**
     * Property bag used to attach dynamic properties to this object.
     */
    properties: {[name: string]: any};
    /**
     * Render source content.
     */
    render (context: CanvasRenderingContext2D, options? : any);
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