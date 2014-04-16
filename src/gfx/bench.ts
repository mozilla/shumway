/// <reference path='references.ts'/>
/// <reference path="WebGL.d.ts" />

module Shumway.Bench {
  import WebGLContext = Shumway.GFX.GL.WebGLContext;
  export class TextureUpload {
    private _writer: IndentingWriter;
    constructor (writer: IndentingWriter) {
      this._writer = writer;
    }
    run() {
      this._writer.writeLn("HERE");

      var scratchCanvas = document.createElement("canvas");
      var scratchContext = scratchCanvas.getContext("2d");

      var glCanvas = document.createElement("canvas");
      glCanvas.width = 1024;
      glCanvas.height = 1024;
      var context = new WebGLContext(glCanvas, {});
      var texture = context.createTexture(0, 0, false);

      var gl = context.gl;
      var last = 1;
      for (var i = 0; i < 13; i++) {
        var w, h;
        w = h = 1 << i;
        scratchCanvas.width = w;
        scratchCanvas.height = h;
        var start = Date.now();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        for (var j = 0; j < 100; j++) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scratchCanvas);
        }
        var elapsed = (Date.now() - start);
        this._writer.writeLn("texImage2D " + " @ " + w + ", Took: " + elapsed + " : " + (elapsed / last));
        last = elapsed;
      }

      // gl.texSubImage2D(gl.TEXTURE_2D, 0, region.x, region.y, gl.RGBA, gl.UNSIGNED_BYTE, image);

      // // document.body.appendChild(canvas);
      // var gl = canvas.getContext("2d");
      // var texture = gl.createTexture();
    }
  }
}