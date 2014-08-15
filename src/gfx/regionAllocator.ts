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
  import roundToMultipleOfPowerOfTwo = IntegerUtilities.roundToMultipleOfPowerOfTwo;
  import assert = Shumway.Debug.assert;
  import Rectangle = Geometry.Rectangle;


  /**
   * Various 2D rectangular region allocators. These are used to manage
   * areas of surfaces, 2D Canvases or WebGL surfaces. Each allocator
   * implements the |IRegionAllocator| interface and must provied two
   * methods to allocate and free regions.
   *
   * CompactAllocator: Good for tightly packed surface atlases but becomes
   * fragmented easily. Allocation / freeing cost is high and should only
   * be used for long lived regions.
   *
   * GridAllocator: Very fast at allocation and freeing but is not very
   * tightly packed. Space is initially partitioned in equally sized grid
   * cells which may be much larger than the allocated regions. This should
   * be used for fixed size allocation regions.
   *
   * BucketAllocator: Manages a list of GridAllocators with different grid
   * sizes.
   */

  export module RegionAllocator {

    export class Region extends Geometry.Rectangle {
      /**
       * The allocator who allocated this region. Once this is assigned it will never
       * change, even if the region is freed.
       */
      public allocator: IRegionAllocator;

      /**
       * Whether the region contains allocated data.
       */
      public allocated: boolean;
    }

    export interface IRegionAllocator {
      /**
       * Allocates a 2D region.
       */
      allocate(w: number, h: number): Region;

      /**
       * Frees the specified region.
       */
      free(region: Region);
    }

    /**
     * Simple 2D bin-packing algorithm that recursively partitions space along the x and y axis. The binary tree
     * can get quite deep so watch out of deep recursive calls. This algorithm works best when inserting items
     * that are sorted by width and height, from largest to smallest.
     */
    export class CompactAllocator implements IRegionAllocator {
      /**
       * Try out randomizing the orientation of each subdivision, sometimes this can lead to better results.
       */
      static RANDOM_ORIENTATION: boolean = true;
      static MAX_DEPTH: number = 256;
      private _root: CompactCell;
      constructor(w: number, h: number) {
        this._root = new CompactCell(0, 0, w | 0, h | 0, false);
      }

      allocate(w: number, h: number): Region {
        w = Math.ceil(w); h = Math.ceil(h);
        release || assert (w > 0 && h > 0);
        var result = this._root.insert(w, h);
        if (result) {
          result.allocator = this;
          result.allocated = true;
        }
        return result;
      }

      free(region: Region) {
        var cell = <CompactCell>region;
        release || assert (cell.allocator === this);
        cell.clear();
        region.allocated = false;
      }
    }

    class CompactCell extends RegionAllocator.Region {
      private _children: CompactCell [];
      private _horizontal: boolean;
      constructor(x: number, y: number, w: number, h: number, horizontal: boolean) {
        super(x, y, w, h);
        this._children = null;
        this._horizontal = horizontal;
        this.allocated = false;
      }
      clear() {
        this._children = null;
        this.allocated = false;
      }
      insert(w: number, h: number): CompactCell {
        return this._insert(w, h, 0);
      }
      private _insert(w: number, h: number, depth: number): CompactCell {
        if (depth > CompactAllocator.MAX_DEPTH) {
          return;
        }
        if (this.allocated) {
          return;
        }
        if (this.w < w || this.h < h) {
          return;
        }
        if (!this._children) {
          var orientation = !this._horizontal;
          if (CompactAllocator.RANDOM_ORIENTATION) {
            orientation = Math.random() >= 0.5;
          }
          if (this._horizontal) {
            this._children = [
              new CompactCell(this.x, this.y, this.w, h, false),
              new CompactCell(this.x, this.y + h, this.w, this.h - h, orientation),
            ];
          } else {
            this._children = [
              new CompactCell(this.x, this.y, w, this.h, true),
              new CompactCell(this.x + w, this.y, this.w - w, this.h, orientation),
            ];
          }
          var first = this._children[0];
          if (first.w === w && first.h === h) {
            first.allocated = true;
            return first;
          }
          return this._insert(w, h, depth + 1);
        } else {
          var result;
          result = this._children[0]._insert(w, h, depth + 1);
          if (result) {
            return result;
          }
          result = this._children[1]._insert(w, h, depth + 1);
          if (result) {
            return result;
          }
        }
      }
    }

    /**
     * Simple grid allocator. Starts off with an empty free list and allocates empty cells. Once a cell
     * is freed it's pushed into the free list. It gets poped off the next time a region is allocated.
     */
    export class GridAllocator implements IRegionAllocator {
      private _sizeW: number;
      private _sizeH: number;
      private _rows: number;
      private _columns: number;
      private _freeList: GridCell [];
      private _index: number;
      private _total: number;
      constructor(w: number, h: number, sizeW: number, sizeH: number) {
        this._columns = w / sizeW | 0;
        this._rows = h / sizeH | 0;
        this._sizeW = sizeW;
        this._sizeH = sizeH;
        this._freeList = [];
        this._index = 0;
        this._total = this._columns * this._rows;
      }

      allocate(w: number, h: number): Region {
        w = Math.ceil(w); h = Math.ceil(h);
        release || assert (w > 0 && h > 0);
        var sizeW = this._sizeW;
        var sizeH = this._sizeH;
        if (w > sizeW || h > sizeH) {
          return null;
        }
        var freeList = this._freeList;
        var index = this._index;
        if (freeList.length > 0) {
          var cell = freeList.pop();
          release || assert (cell.allocated === false);
          cell.allocated = true;
          return cell;
        } else if (index < this._total) {
          var y = (index / this._columns) | 0;
          var x = index - (y * this._columns);
          var cell = new GridCell(x * sizeW, y * sizeH, w, h);
          cell.index = index;
          cell.allocator = this;
          cell.allocated = true;
          this._index ++;
          return cell;
        }
        return null;
      }

      free(region: Region) {
        var cell = <GridCell>region;
        release || assert (cell.allocator === this);
        cell.allocated = false;
        this._freeList.push(cell);
      }
    }

    export class GridCell extends RegionAllocator.Region {
      index: number = -1;
      constructor(x: number, y: number, w: number, h: number) {
        super(x, y, w, h);
      }
    }

    class Bucket {
      constructor (
        public size: number,
        public region: Rectangle,
        public allocator: IRegionAllocator
      ) { }
    }

    export class BucketCell extends RegionAllocator.Region {
      region: RegionAllocator.Region;
      constructor(x, y, w, h, region) {
        super(x, y, w, h);
        this.region = region;
      }
    }

    export class BucketAllocator implements IRegionAllocator {
      private _w: number;
      private _h: number;
      private _filled: number;
      private _buckets: Bucket [];
      constructor(w: number, h: number) {
        release || assert (w > 0 && h > 0);
        this._buckets = [];
        this._w = w | 0;
        this._h = h | 0;
        this._filled = 0;
      }

      /**
       * Finds the first bucket that is large enough to hold the requested region. If no
       * such bucket exists, then allocates a new bucket if there is room otherwise
       * returns null;
       */
      allocate(w: number, h: number): Region {
        w = Math.ceil(w); h = Math.ceil(h);
        release || assert (w > 0 && h > 0);
        var size = Math.max(w, h);
        if (w > this._w || h > this._h) {
          // Too big, cannot allocate this.
          return null;
        }
        var region = null;
        var bucket;
        var buckets = this._buckets;
        do {
          for (var i = 0; i < buckets.length; i++) {
            if (buckets[i].size >= size) {
              bucket = buckets[i];
              region = bucket.allocator.allocate(w, h);
              if (region) {
                break;
              }
            }
          }
          if (!region) {
            var remainingSpace = this._h - this._filled;
            if (remainingSpace < h) {
              // Couldn't allocate region and there is no more vertical space to allocate
              // a new bucket that can fit the requested size. So give up.
              return null;
            }
            var gridSize = roundToMultipleOfPowerOfTwo(size, 2);
            var bucketHeight = gridSize * 2;
            if (bucketHeight > remainingSpace) {
              bucketHeight = remainingSpace;
            }
            if (bucketHeight < gridSize) {
              return null;
            }
            var bucketRegion = new Rectangle(0, this._filled, this._w, bucketHeight);
            this._buckets.push (
              new Bucket(gridSize, bucketRegion, new GridAllocator(bucketRegion.w, bucketRegion.h, gridSize, gridSize))
            );
            this._filled += bucketHeight;
          }
        } while (!region);

        return new BucketCell(bucket.region.x + region.x, bucket.region.y + region.y, region.w, region.h, region);
      }

      free(region: BucketCell) {
        region.region.allocator.free(region.region);
      }
    }
  }

  export module SurfaceRegionAllocator {
    export interface ISurfaceRegionAllocator {
      /**
       * Used surfaces.
       */
      surfaces: ISurface [];

      /**
       * Adds a surface to the pool of allocation surfaces.
       */
      addSurface(surface: ISurface);

      /**
       * Allocates a 2D region.
       */
      allocate(w: number, h: number): ISurfaceRegion;

      /**
       * Frees the specified region.
       */
      free(region: ISurfaceRegion);
    }

    export class SimpleAllocator implements ISurfaceRegionAllocator {
      private _createSurface: (w: number, h: number) => ISurface;
      private _surfaces: ISurface [];

      public get surfaces(): ISurface [] {
        return this._surfaces;
      }

      constructor(createSurface: (w: number, h: number) => ISurface) {
        this._createSurface = createSurface;
        this._surfaces = [];
      }

      private _createNewSurface(w: number, h: number): ISurface {
        var surface = this._createSurface(w, h);
        this._surfaces.push(surface);
        return surface;
      }

      addSurface(surface: ISurface) {
        this._surfaces.push(surface);
      }

      allocate(w: number, h: number): ISurfaceRegion {
        for (var i = 0; i < this._surfaces.length; i++) {
          var region = this._surfaces[i].allocate(w, h);
          if (region) {
            return region;
          }
        }
        return this._createNewSurface(w, h).allocate(w, h);
      }

      free(region: ISurfaceRegion) {
        //...
      }
    }
  }
}
