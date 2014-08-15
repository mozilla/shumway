module Shumway.GFX.WebGL {
  var release = false;

  import assert = Shumway.Debug.assert;
  import Rectangle = Geometry.Rectangle;

  export class WebGLSurface implements ISurface {
    w: number;
    h: number;
    texture: WebGLTexture;
    framebuffer: WebGLFramebuffer;
    private _regionAllocator: RegionAllocator.IRegionAllocator;
    constructor(w: number, h: number, texture: WebGLTexture) {
      this.texture = texture;
      this.w = w;
      this.h = h;
      this._regionAllocator = new RegionAllocator.CompactAllocator(this.w, this.h);
    }
    allocate(w: number, h: number): WebGLSurfaceRegion {
      var region = this._regionAllocator.allocate(w, h);
      if (region) {
        return new WebGLSurfaceRegion(this, region);
      }
      return null;
    }
    free(surfaceRegion: WebGLSurfaceRegion) {
      this._regionAllocator.free(surfaceRegion.region);
    }
  }

  /**
   * A (region, texture) pair. These objects can appear in linked lists hence the next and previous pointers. Regions
   * don't necessarily need to have a texture reference. Setting the texture reference to null is a way to indicate
   * that the region no longer points to valid texture data.
   */
  export class WebGLSurfaceRegion implements ILinkedListNode {
    region: RegionAllocator.Region;
    surface: WebGLSurface;
    next: WebGLSurfaceRegion;
    previous: WebGLSurfaceRegion;
      constructor(surface: WebGLSurface, region: RegionAllocator.Region) {
      this.surface = surface;
      this.region = region;
      this.next = this.previous = null;
    }
  }

  /**
   * Wraps around a texture and a region allocator to implement texture atlasing.
   */
  /*
  export class WebGLSurfaceAtlas {
    texture: WebGLSurface;

    private _context: WebGLContext;
    private _regionAllocator: RegionAllocator.IRegionAllocator;
    private _w: number;
    private _h: number;
    private _compact: boolean;

    get compact(): boolean {
      return this._compact;
    }

    get w(): number {
      return this._w;
    }

    get h(): number {
      return this._h;
    }

    constructor(context: WebGLContext, texture: WebGLSurface, w: number, h: number, compact: boolean) {
      this._context = context;
      this.texture = texture;
      this._w = w;
      this._h = h;
      this._compact = compact;
      this.reset();
    }

    add(image: any, w: number, h: number): RegionAllocator.Region {
      var gl = this._context.gl;
      var region = this._regionAllocator.allocate(w, h);
      if (!region) {
        return;
      }
      if (image) {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        timelineBuffer && timelineBuffer.enter("texSubImage2D");
        gl.texSubImage2D(gl.TEXTURE_2D, 0, region.x, region.y, gl.RGBA, gl.UNSIGNED_BYTE, image);
        traceLevel >= TraceLevel.Verbose && writer && writer.writeLn("texSubImage2D: " + region);
        timelineBuffer && timelineBuffer.leave("texSubImage2D");
        frameCount("texSubImage2D");
      }
      return region;
    }

    remove(region: RegionAllocator.Region) {
      this._regionAllocator.free(region);
    }

    reset() {
      if (this._compact) {
        this._regionAllocator = new RegionAllocator.CompactAllocator(this._w, this._h);
      } else {
        this._regionAllocator = new RegionAllocator.GridAllocator(this._w, this._h, TILE_SIZE);
      }
    }
  }
  */
}
