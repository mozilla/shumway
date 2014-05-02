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
    export class Compact implements IRegionAllocator {
      /**
       * Try out randomizing the orientation of each subdivision, sometimes this can lead to better results.
       */
      static RANDOM_ORIENTATION: boolean = true;
      static MAX_DEPTH: number = 256;
      private _root: CompactCell;
      private _allocations: CompactCell [] = [];
      constructor(w: number, h: number) {
        this._root = new CompactCell(0, 0, w, h, false);
      }

      allocate(w: number, h: number): Region {
        var result = this._root.insert(w, h);
        if (result) {
          result.allocator = this;
          result.allocated = true;
        }
        return result;
      }

      free(region: Region) {
        var cell = <CompactCell>region;
        assert (cell.allocator === this);
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
        if (depth > Compact.MAX_DEPTH) {
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
          if (Compact.RANDOM_ORIENTATION) {
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

    export class Grid implements IRegionAllocator {
      private _size: number;
      private _rows: number;
      private _columns: number;
      private _cells: GridCell [];
      constructor(w: number, h: number, size: number) {
        this._columns = w / size | 0;
        this._rows = h / size | 0;
        this._size = size;
        this._cells = [];
        for (var y = 0; y < this._rows; y++) {
          for (var x = 0; x < this._columns; x++) {
            this._cells.push(null);
          }
        }
      }

      allocate(w: number, h: number): Region {
        var size = this._size;
        if (w > size || h > size) {
          return null;
        }
        for (var y = 0; y < this._rows; y++) {
          for (var x = 0; x < this._columns; x++) {
            var index = y * this._columns + x;
            var cell = this._cells[index];
            if (!cell) {
              var cell = new GridCell(x * size, y * size, w, h);
              cell.index = index;
              cell.allocator = this;
              cell.allocated = true;
              this._cells[index] = cell;
              return cell;
            } else if (!cell.allocated) {
              cell.allocated = true;
              return cell;
            }
          }
        }
        return null;
      }

      free(region: Region) {
        var cell = <GridCell>region;
        assert (cell.allocator === this);
        assert (this._cells[cell.index] === region);
        cell.allocated = false;
      }
    }

    export class GridCell extends RegionAllocator.Region {
      index: number = -1;
      constructor(x: number, y: number, w: number, h: number) {
        super(x, y, w, h);
      }
    }
  }
}