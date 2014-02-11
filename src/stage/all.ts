/// <reference path='shapes.ts'/>
/// <reference path='geometry.ts'/>
/// <reference path='stage.ts'/>
/// <reference path='filters.ts'/>
/// <reference path='elements.ts'/>
/// <reference path='util.ts'/>
/// <reference path='gl.ts'/>
/// <reference path='gl/core.ts'/>
/// <reference path='dom.ts'/>
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

module Shumway {
  export interface IRenderable {
    getBounds(): Shumway.Geometry.Rectangle;
    properties: {[name: string]: any};
    render (context: CanvasRenderingContext2D, options? : any);
    dynamic: boolean;
  }
}