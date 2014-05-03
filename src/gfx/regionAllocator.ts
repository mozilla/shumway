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

/// <reference path='references.ts'/>
module Shumway.GFX.Geometry {

  import nearestPowerOfTwo = Shumway.IntegerUtilities.nearestPowerOfTwo;

  export module RegionAllocator {

    export class Region extends Rectangle {
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
      private _size: number;
      private _rows: number;
      private _columns: number;
      private _freeList: GridCell [];
      private _index: number;
      private _total: number;
      constructor(w: number, h: number, size: number) {
        this._columns = w / size | 0;
        this._rows = h / size | 0;
        this._size = size;
        this._freeList = [];
        this._index = 0;
        this._total = this._columns * this._rows;
      }

      allocate(w: number, h: number): Region {
        var size = this._size;
        if (w > size || h > size) {
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
          var cell = new GridCell(x * size, y * size, w, h);
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
      private _buckets: Bucket [];
      constructor(w: number, h: number) {
        this._buckets = [];
        var bucketCount = 10;
        var averageBucketHeight = (h / bucketCount) | 0;
        var bucketHeightOffset = 0;

        for (var i = 1; i < 10; i++) {
          var size = i * 8;
          if (size > (h - bucketHeightOffset)) {
            break;
          }
          var bucketHeight = ((averageBucketHeight / size) | 0) * size;
          var last = i === 9;
          if (last) {
            bucketHeight = h - bucketHeightOffset;
          }
          var region = new Rectangle(0, bucketHeightOffset, w, bucketHeight);
          this._buckets.push (
            new Bucket(size, region, new GridAllocator(region.w, region.h, size))
          );
          bucketHeightOffset += bucketHeight;
        }
      }

      allocate(w: number, h: number): Region {
        var size = Math.max(w, h);
        var bucket;
        var buckets = this._buckets;
        var region;
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
          return null;
        }
        return new BucketCell(bucket.region.x + region.x, bucket.region.y + region.y, region.w, region.h, region);
      }

      free(region: BucketCell) {
        region.region.allocator.free(region.region);
      }
    }

  }
}