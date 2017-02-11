/// <reference path="base.d.ts" />
/// <reference path="tools.d.ts" />
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
interface CanvasRenderingContext2D {
    filter: string;
    globalColorMatrix: Shumway.GFX.ColorMatrix;
    flashStroke(path: Path2D, lineScaleMode: Shumway.LineScaleMode): any;
}
interface CanvasGradient {
    _template: any;
}
declare module Shumway.GFX {
    const enum TraceLevel {
        None = 0,
        Brief = 1,
        Verbose = 2,
    }
    var frameCounter: Metrics.Counter;
    var traceLevel: TraceLevel;
    var writer: IndentingWriter;
    function frameCount(name: any): void;
    var timelineBuffer: Tools.Profiler.TimelineBuffer;
    function enterTimeline(name: string, data?: any): void;
    function leaveTimeline(name?: string, data?: any): void;
    /**
     * Polyfill for missing |Path2D|. An instance of this class keeps a record of all drawing commands
     * ever called on it.
     */
    class Path {
        private _commands;
        private _commandPosition;
        private _data;
        private _dataPosition;
        private static _arrayBufferPool;
        /**
         * Takes a |Path2D| instance and a 2d context to replay the recorded drawing commands.
         */
        static _apply(path: Path, context: CanvasRenderingContext2D): void;
        constructor(arg: any);
        private _ensureCommandCapacity(length);
        private _ensureDataCapacity(length);
        private _writeCommand(command);
        private _writeData(a, b, c?, d?, e?, f?);
        closePath(): void;
        moveTo(x: number, y: number): void;
        lineTo(x: number, y: number): void;
        quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
        bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
        arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
        rect(x: number, y: number, width: number, height: number): void;
        arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean): void;
        /**
         * Copies and transforms all drawing commands stored in |path|.
         */
        addPath(path: Path, transformation?: SVGMatrix): void;
    }
}
declare module Shumway.GFX {
    interface ISurface {
        w: number;
        h: number;
        allocate(w: number, h: number): ISurfaceRegion;
        free(surfaceRegion: ISurfaceRegion): any;
    }
    interface ISurfaceRegion {
        surface: ISurface;
        region: RegionAllocator.Region;
    }
    class ScreenShot {
        dataURL: string;
        w: number;
        h: number;
        pixelRatio: number;
        constructor(dataURL: string, w: number, h: number, pixelRatio: number);
    }
}
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
declare module Shumway {
    /**
     * Things that can be kept in linked lists.
     */
    interface ILinkedListNode {
        next: ILinkedListNode;
        previous: ILinkedListNode;
    }
    /**
     * Maintains a LRU doubly-linked list.
     */
    class LRUList<T extends ILinkedListNode> {
        private _head;
        private _tail;
        private _count;
        count: number;
        /**
         * Gets the node at the front of the list. Returns |null| if the list is empty.
         */
        head: T;
        constructor();
        private _unshift(node);
        private _remove(node);
        /**
         * Adds or moves a node to the front of the list.
         */
        use(node: T): void;
        /**
         * Removes a node from the front of the list.
         */
        pop(): T;
        /**
         * Visits each node in the list in the forward or reverse direction as long as
         * the callback returns |true|;
         */
        visit(callback: (T) => boolean, forward?: boolean): void;
    }
    function registerFallbackFont(): void;
}
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
declare module Shumway.GFX {
    var imageUpdateOption: any;
    var imageConvertOption: any;
    var stageOptions: any;
    var forcePaint: any;
    var ignoreViewport: any;
    var viewportLoupeDiameter: any;
    var disableClipping: any;
    var debugClipping: any;
    var hud: any;
    var clipDirtyRegions: any;
    var clipCanvas: any;
    var cull: any;
    var snapToDevicePixels: any;
    var imageSmoothing: any;
    var masking: any;
    var blending: any;
    var debugLayers: any;
    var filters: any;
    var cacheShapes: any;
    var cacheShapesMaxSize: any;
    var cacheShapesThreshold: any;
}
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
declare module Shumway.GFX.Geometry {
    function radianToDegrees(r: any): number;
    function degreesToRadian(d: any): number;
    class Point {
        x: number;
        y: number;
        constructor(x: number, y: number);
        setElements(x: number, y: number): Point;
        set(other: Point): Point;
        dot(other: Point): number;
        squaredLength(): number;
        distanceTo(other: Point): number;
        sub(other: Point): Point;
        mul(value: number): Point;
        clone(): Point;
        toString(digits?: number): string;
        inTriangle(a: Point, b: Point, c: Point): boolean;
        static createEmpty(): Point;
        static createEmptyPoints(count: number): Point[];
    }
    class Rectangle {
        static allocationCount: number;
        x: number;
        y: number;
        w: number;
        h: number;
        private static _temporary;
        private static _dirtyStack;
        constructor(x: number, y: number, w: number, h: number);
        setElements(x: number, y: number, w: number, h: number): void;
        set(other: Rectangle): void;
        contains(other: Rectangle): boolean;
        containsPoint(point: Point): boolean;
        isContained(others: Rectangle[]): boolean;
        isSmallerThan(other: Rectangle): boolean;
        isLargerThan(other: Rectangle): boolean;
        union(other: Rectangle): void;
        isEmpty(): boolean;
        setEmpty(): void;
        intersect(other: Rectangle): Rectangle;
        intersects(other: Rectangle): boolean;
        /**
         * Tests if this rectangle intersects the AABB of the given rectangle.
         */
        intersectsTransformedAABB(other: Rectangle, matrix: Matrix): boolean;
        intersectsTranslated(other: Rectangle, tx: number, ty: number): boolean;
        area(): number;
        clone(): Rectangle;
        static allocate(): Rectangle;
        free(): void;
        /**
         * Snaps the rectangle to pixel boundaries. The computed rectangle covers
         * the original rectangle.
         */
        snap(): Rectangle;
        scale(x: number, y: number): Rectangle;
        offset(x: number, y: number): Rectangle;
        resize(w: number, h: number): Rectangle;
        expand(w: number, h: number): Rectangle;
        getCenter(): Point;
        getAbsoluteBounds(): Rectangle;
        toString(digits?: number): string;
        static createEmpty(): Rectangle;
        static createSquare(size: number): Rectangle;
        /**
         * Creates the maximum rectangle representable by signed 16 bit integers.
         */
        static createMaxI16(): Rectangle;
        setMaxI16(): void;
        getCorners(points: Point[]): void;
    }
    class OBB {
        axes: Point[];
        corners: Point[];
        origins: number[];
        constructor(corners: Point[]);
        getBounds(): Rectangle;
        static getBounds(points: any): Rectangle;
        /**
         * http://www.flipcode.com/archives/2D_OBB_Intersection.shtml
         */
        intersects(other: OBB): boolean;
        private intersectsOneWay(other);
    }
    /**
     * Used to write fast paths for common matrix types.
     */
    const enum MatrixType {
        Unknown = 0,
        Identity = 1,
        Translation = 2,
    }
    class Matrix {
        static allocationCount: number;
        private _data;
        private _type;
        private static _dirtyStack;
        a: number;
        b: number;
        c: number;
        d: number;
        tx: number;
        ty: number;
        private static _svg;
        constructor(a: number, b: number, c: number, d: number, tx: number, ty: number);
        private static _createSVGMatrix();
        setElements(a: number, b: number, c: number, d: number, tx: number, ty: number): void;
        set(other: Matrix): void;
        /**
         * Whether the transformed query rectangle is empty after this transform is applied to it.
         */
        emptyArea(query: Rectangle): boolean;
        /**
         * Whether the area of transformed query rectangle is infinite after this transform is applied to it.
         */
        infiniteArea(query: Rectangle): boolean;
        isEqual(other: Matrix): boolean;
        clone(): Matrix;
        static allocate(): Matrix;
        free(): void;
        transform(a: number, b: number, c: number, d: number, tx: number, ty: number): Matrix;
        transformRectangle(rectangle: Rectangle, points: Point[]): void;
        isTranslationOnly(): boolean;
        transformRectangleAABB(rectangle: Rectangle): void;
        scale(x: number, y: number): Matrix;
        scaleClone(x: number, y: number): Matrix;
        rotate(angle: number): Matrix;
        concat(other: Matrix): Matrix;
        concatClone(other: Matrix): Matrix;
        /**
         * this = other * this
         */
        preMultiply(other: Matrix): void;
        translate(x: number, y: number): Matrix;
        setIdentity(): void;
        isIdentity(): boolean;
        transformPoint(point: Point): void;
        transformPoints(points: Point[]): void;
        deltaTransformPoint(point: Point): void;
        inverse(result: Matrix): void;
        getTranslateX(): number;
        getTranslateY(): number;
        getScaleX(): number;
        getScaleY(): number;
        getScale(): number;
        getAbsoluteScaleX(): number;
        getAbsoluteScaleY(): number;
        getRotation(): number;
        isScaleOrRotation(): boolean;
        toString(digits?: number): string;
        toWebGLMatrix(): Float32Array;
        toCSSTransform(): string;
        static createIdentity(): Matrix;
        static multiply: (dst: Matrix, src: Matrix) => void;
        toSVGMatrix(): SVGMatrix;
        snap(): boolean;
        static createIdentitySVGMatrix(): SVGMatrix;
        static createSVGMatrixFromArray(array: number[]): SVGMatrix;
    }
    class DirtyRegion {
        private static tmpRectangle;
        private grid;
        private w;
        private h;
        private c;
        private r;
        private size;
        private sizeInBits;
        constructor(w: any, h: any, sizeInBits?: number);
        clear(): void;
        getBounds(): Rectangle;
        addDirtyRectangle(rectangle: Rectangle): void;
        gatherRegions(regions: Rectangle[]): void;
        gatherOptimizedRegions(regions: Rectangle[]): void;
        getDirtyRatio(): number;
        render(context: CanvasRenderingContext2D, options?: any): void;
    }
    module DirtyRegion {
        class Cell {
            region: Rectangle;
            bounds: Rectangle;
            constructor(region: Rectangle);
            clear(): void;
        }
    }
    class Tile {
        x: number;
        y: number;
        index: number;
        scale: number;
        bounds: Rectangle;
        cachedSurfaceRegion: ISurfaceRegion;
        color: Shumway.Color;
        private _obb;
        private static corners;
        getOBB(): OBB;
        constructor(index: number, x: number, y: number, w: number, h: number, scale: number);
    }
    /**
     * A grid data structure that lets you query tiles that intersect a transformed rectangle.
     */
    class TileCache {
        w: number;
        h: number;
        tileW: number;
        tileH: number;
        rows: number;
        scale: number;
        columns: number;
        tiles: Tile[];
        private static _points;
        constructor(w: number, h: number, tileW: number, tileH: number, scale: number);
        /**
         * Query tiles using a transformed rectangle.
         * TODO: Fine-tune these heuristics.
         */
        getTiles(query: Rectangle, transform: Matrix): Tile[];
        /**
         * Precise indicates that we want to do an exact OBB intersection.
         */
        private getFewTiles(query, transform, precise?);
        private getManyTiles(query, transform);
    }
    /**
     * Manages tile caches at different scales.
     */
    class RenderableTileCache {
        private _source;
        private _cacheLevels;
        private _tileSize;
        private _minUntiledSize;
        constructor(source: Renderable, tileSize: number, minUntiledSize: number);
        /**
         * Gets the tiles covered by the specified |query| rectangle and transformed by the given |transform| matrix.
         */
        private _getTilesAtScale(query, transform, scratchBounds);
        fetchTiles(query: Rectangle, transform: Matrix, scratchContext: CanvasRenderingContext2D, cacheImageCallback: (old: ISurfaceRegion, src: CanvasRenderingContext2D, srcBounds: Rectangle) => ISurfaceRegion): Tile[];
        private _getTileBounds(tiles);
        /**
         * This caches raster versions of the specified |uncachedTiles|. The tiles are generated using a scratch
         * canvas2D context (|scratchContext|) and then cached via |cacheImageCallback|. Ideally, we want to render
         * all tiles in one go, but they may not fit in the |scratchContext| in which case we need to render the
         * source shape several times.
         *
         * TODO: Find a good algorithm to do this since it's quite important that we don't repaint too many times.
         * Spending some time trying to figure out the *optimal* solution may pay-off since painting is soo expensive.
         */
        private _cacheTiles(scratchContext, uncachedTiles, cacheImageCallback, scratchBounds, maxRecursionDepth?);
    }
}
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
declare module Shumway.GFX {
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
    module RegionAllocator {
        class Region extends Geometry.Rectangle {
            /**
             * The allocator who allocated this region. Once this is assigned it will never
             * change, even if the region is freed.
             */
            allocator: IRegionAllocator;
            /**
             * Whether the region contains allocated data.
             */
            allocated: boolean;
        }
        interface IRegionAllocator {
            /**
             * Allocates a 2D region.
             */
            allocate(w: number, h: number): Region;
            /**
             * Frees the specified region.
             */
            free(region: Region): any;
        }
        /**
         * Simple 2D bin-packing algorithm that recursively partitions space along the x and y axis. The binary tree
         * can get quite deep so watch out of deep recursive calls. This algorithm works best when inserting items
         * that are sorted by width and height, from largest to smallest.
         */
        class CompactAllocator implements IRegionAllocator {
            /**
             * Try out randomizing the orientation of each subdivision, sometimes this can lead to better results.
             */
            static RANDOM_ORIENTATION: boolean;
            static MAX_DEPTH: number;
            private _root;
            constructor(w: number, h: number);
            allocate(w: number, h: number): Region;
            free(region: Region): void;
        }
        /**
         * Simple grid allocator. Starts off with an empty free list and allocates empty cells. Once a cell
         * is freed it's pushed into the free list. It gets poped off the next time a region is allocated.
         */
        class GridAllocator implements IRegionAllocator {
            private _sizeW;
            private _sizeH;
            private _rows;
            private _columns;
            private _freeList;
            private _index;
            private _total;
            constructor(w: number, h: number, sizeW: number, sizeH: number);
            allocate(w: number, h: number): Region;
            free(region: Region): void;
        }
        class GridCell extends RegionAllocator.Region {
            index: number;
            constructor(x: number, y: number, w: number, h: number);
        }
        class BucketCell extends RegionAllocator.Region {
            region: RegionAllocator.Region;
            constructor(x: any, y: any, w: any, h: any, region: any);
        }
        class BucketAllocator implements IRegionAllocator {
            private _w;
            private _h;
            private _filled;
            private _buckets;
            constructor(w: number, h: number);
            /**
             * Finds the first bucket that is large enough to hold the requested region. If no
             * such bucket exists, then allocates a new bucket if there is room otherwise
             * returns null;
             */
            allocate(w: number, h: number): Region;
            free(region: BucketCell): void;
        }
    }
    module SurfaceRegionAllocator {
        interface ISurfaceRegionAllocator {
            /**
             * Used surfaces.
             */
            surfaces: ISurface[];
            /**
             * Adds a surface to the pool of allocation surfaces.
             */
            addSurface(surface: ISurface): any;
            /**
             * Allocates a 2D region.
             */
            allocate(w: number, h: number, excludeSurface: ISurface): ISurfaceRegion;
            /**
             * Frees the specified region.
             */
            free(region: ISurfaceRegion): any;
        }
        class SimpleAllocator implements ISurfaceRegionAllocator {
            private _createSurface;
            private _surfaces;
            surfaces: ISurface[];
            constructor(createSurface: (w: number, h: number) => ISurface);
            private _createNewSurface(w, h);
            addSurface(surface: ISurface): void;
            allocate(w: number, h: number, excludeSurface: ISurface): ISurfaceRegion;
            free(region: ISurfaceRegion): void;
        }
    }
}
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
declare module Shumway.GFX {
    import Rectangle = Geometry.Rectangle;
    import Matrix = Geometry.Matrix;
    import DirtyRegion = Geometry.DirtyRegion;
    import Filter = Shumway.GFX.Filter;
    enum BlendMode {
        Normal = 1,
        Layer = 2,
        Multiply = 3,
        Screen = 4,
        Lighten = 5,
        Darken = 6,
        Difference = 7,
        Add = 8,
        Subtract = 9,
        Invert = 10,
        Alpha = 11,
        Erase = 12,
        Overlay = 13,
        HardLight = 14,
    }
    const enum NodeFlags {
        None = 0,
        Visible = 1,
        Transparent = 2,
        /**
         * Whether this node acts as a mask for another node.
         */
        IsMask = 4,
        /**
         * Whether this node is marked to be cached as a bitmap. This isn't just a performance optimization,
         * but also affects the way masking is performed.
         */
        CacheAsBitmap = 16,
        /**
         * Whether this node's contents should be drawn snapped to pixel boundaries.
         * Only relevant for bitmaps.
         */
        PixelSnapping = 32,
        /**
         * Whether this node's contents should use higher quality image smoothing.
         * Only relevant for bitmaps.
         */
        ImageSmoothing = 64,
        /**
         * Whether source has dynamic content.
         */
        Dynamic = 256,
        /**
         * Whether the source's content can be scaled and drawn at a higher resolution.
         */
        Scalable = 512,
        /**
         * Whether the source's content should be tiled.
         */
        Tileable = 1024,
        /**
         * Whether this node's bounding box is automatically computed from its children. If this
         * flag is |false| then this node's bounding box can only be set via |setBounds|.
         */
        BoundsAutoCompute = 2048,
        /**
         * Whether this node needs to be repainted.
         */
        Dirty = 4096,
        /**
         * Whether this node's bounds is invalid and needs to be recomputed. Only nodes that have the
         * |BoundsAutoCompute| flag set can have this flag set.
         */
        InvalidBounds = 8192,
        /**
         * Whether this node's concatenated matrix is invalid. This happens whenever a node's ancestor
         * is moved in the node tree.
         */
        InvalidConcatenatedMatrix = 16384,
        /**
         * Whether this node's inverted concatenated matrix is invalid. This happens whenever a node's ancestor
         * is moved in the node tree.
         */
        InvalidInvertedConcatenatedMatrix = 32768,
        /**
         * Same as above, but for colors.
         */
        InvalidConcatenatedColorMatrix = 65536,
        /**
         * Flags to propagate upwards when a node is added or removed from a group.
         */
        UpOnAddedOrRemoved = 12288,
        /**
         * Flags to propagate downwards when a node is added or removed from a group.
         */
        DownOnAddedOrRemoved = 114688,
        /**
         * Flags to propagate upwards when a node is moved.
         */
        UpOnMoved = 12288,
        /**
         * Flags to propagate downwards when a node is moved.
         */
        DownOnMoved = 49152,
        /**
         * Flags to propagate upwards when a node's color matrix is changed.
         */
        UpOnColorMatrixChanged = 4096,
        /**
         * Flags to propagate downwards when a node's color matrix is changed.
         */
        DownOnColorMatrixChanged = 65536,
        /**
         * Flags to propagate upwards when a node is invalidated.
         */
        UpOnInvalidate = 12288,
        /**
         * Default node flags, however not all node types use these defaults.
         */
        Default = 59393,
    }
    /**
     * Scene graph object hierarchy. This enum makes it possible to write fast type checks.
     */
    const enum NodeType {
        Node = 1,
        Shape = 3,
        Group = 5,
        Stage = 13,
        Renderable = 33,
    }
    /**
     * Basic event types. Not much here.
     */
    const enum NodeEventType {
        None = 0,
        OnStageBoundsChanged = 1,
        RemovedFromStage = 2,
    }
    /**
     * Basic node visitor. Inherit from this if you want a more sophisticated visitor, for instance all
     * renderers extends this class.
     */
    class NodeVisitor {
        visitNode(node: Node, state: State): void;
        visitShape(node: Shape, state: State): void;
        visitGroup(node: Group, state: State): void;
        visitStage(node: Stage, state: State): void;
        visitRenderable(node: Renderable, state: State): void;
    }
    /**
     * Nodes that cache transformation state. These are used to thread state when traversing
     * the scene graph. Since they keep track of rendering state, they might as well become
     * scene graph nodes.
     */
    class State {
        constructor();
    }
    class PreRenderState extends State {
        depth: number;
        constructor();
    }
    /**
     * Helper visitor that checks and resets the dirty bit and calculates stack levels. If the root
     * node is dirty, then we have to repaint the entire node tree.
     */
    class PreRenderVisitor extends NodeVisitor {
        isDirty: boolean;
        private _dirtyRegion;
        private _depth;
        start(node: Group, dirtyRegion: DirtyRegion): void;
        visitGroup(node: Group, state: State): void;
        visitNode(node: Node, state: State): void;
    }
    /**
     * Debugging visitor.
     */
    class TracingNodeVisitor extends NodeVisitor {
        writer: IndentingWriter;
        constructor(writer: IndentingWriter);
        visitNode(node: Node, state: State): void;
        visitShape(node: Shape, state: State): void;
        visitGroup(node: Group, state: State): void;
        visitStage(node: Stage, state: State): void;
    }
    /**
     * Base class of all nodes in the scene graph.
     */
    class Node {
        /**
         * Temporary array of nodes to avoid allocations.
         */
        private static _path;
        /**
         * Used to give nodes unique ids.
         */
        private static _nextId;
        protected _id: number;
        id: number;
        /**
         * Keep track of node type directly on the node so we don't have to use |instanceof| for type checks.
         */
        protected _type: NodeType;
        /**
         * All sorts of flags.
         */
        _flags: NodeFlags;
        /**
         * Index of this node in its parent's children list.
         */
        _index: number;
        /**
         * Parent node. This is |null| for the root node and for |Renderables| which have more than one parent.
         */
        _parent: Group;
        /**
         * Number of sibillings to clip.
         */
        protected _clip: number;
        /**
         * Layer info: blend modes, filters and such.
         */
        protected _layer: Layer;
        /**
         * Transform info: matrix, color matrix. Null transform is the identity.
         */
        protected _transform: Transform;
        /**
         * This nodes stack level.
         */
        depth: number;
        protected _eventListeners: {
            type: NodeEventType;
            listener: (node: Node, type?: NodeEventType) => void;
        }[];
        protected _dispatchEvent(type: NodeEventType): void;
        /**
         * Adds an event listener.
         */
        addEventListener(type: NodeEventType, listener: (node: Node, type?: NodeEventType) => void): void;
        /**
         * Removes an event listener.
         */
        removeEventListener(type: NodeEventType, listener: (node: Node, type?: NodeEventType) => void): void;
        /**
         * Property bag used to attach dynamic properties to this object.
         */
        protected _properties: {
            [name: string]: any;
        };
        properties: {
            [name: string]: any;
        };
        /**
         * Bounds of the scene graph object. Bounds are computed automatically for non-leaf nodes
         * that have the |NodeFlags.BoundsAutoCompute| flag set.
         */
        protected _bounds: Rectangle;
        constructor();
        /**
         * Resets the Node to its initial state but preserves its identity.
         * It safe to call this on a child without disrupting ownership.
         */
        reset(): void;
        clip: number;
        parent: Node;
        getTransformedBounds(target: Node): Rectangle;
        _markCurrentBoundsAsDirtyRegion(): void;
        getStage(withDirtyRegion?: boolean): Stage;
        /**
         * This shouldn't be used on any hot path becuse it allocates.
         */
        getChildren(clone?: boolean): Node[];
        getBounds(clone?: boolean): Rectangle;
        /**
         * Can only be set on nodes without the |NodeFlags.BoundsAutoCompute| flag set.
         */
        setBounds(value: Rectangle): void;
        clone(): Node;
        setFlags(flags: NodeFlags): void;
        hasFlags(flags: NodeFlags): boolean;
        hasAnyFlags(flags: NodeFlags): boolean;
        removeFlags(flags: NodeFlags): void;
        toggleFlags(flags: NodeFlags, on: boolean): void;
        /**
         * Propagates flags up the tree. Propagation stops if all flags are already set.
         */
        _propagateFlagsUp(flags: NodeFlags): void;
        /**
         * Propagates flags down the tree. Non-containers just set the flags on themselves.
         */
        _propagateFlagsDown(flags: NodeFlags): void;
        isAncestor(node: Node): boolean;
        /**
         * Return's a list of ancestors excluding the |last|, the return list is reused.
         */
        static _getAncestors(node: Node, last: Node): Node[];
        /**
         * Finds the closest ancestor with a given set of flags that are either turned on or off.
         */
        _findClosestAncestor(flags: NodeFlags, on: boolean): Node;
        /**
         * Type check.
         */
        isType(type: NodeType): boolean;
        /**
         * Subtype check.
         */
        isTypeOf(type: NodeType): boolean;
        isLeaf(): boolean;
        isLinear(): boolean;
        getTransformMatrix(clone?: boolean): Matrix;
        getTransform(): Transform;
        getLayer(): Layer;
        getLayerBounds(includeFilters: boolean): Rectangle;
        /**
         * Dispatch on node types.
         */
        visit(visitor: NodeVisitor, state: State): void;
        invalidate(): void;
        toString(bounds?: boolean): string;
    }
    /**
     * Nodes that contain other nodes.
     */
    class Group extends Node {
        protected _children: Node[];
        constructor();
        getChildren(clone?: boolean): Node[];
        childAt(index: number): Node;
        child: Node;
        groupChild: Group;
        /**
         * Adds a node and remove's it from its previous location if it has a parent and propagates
         * flags accordingly.
         */
        addChild(node: Node): void;
        /**
         * Removes a child at the given index and propagates flags accordingly.
         */
        removeChildAt(index: number): void;
        clearChildren(): void;
        /**
         * Override and propagate flags to all children.
         */
        _propagateFlagsDown(flags: NodeFlags): void;
        /**
         * Takes the union of all child bounds and caches the bounds locally.
         */
        getBounds(clone?: boolean): Rectangle;
        /**
         * Takes the union of all child bounds, optionaly including filter expansions.
         */
        getLayerBounds(includeFilters: boolean): Rectangle;
    }
    /**
     * Transform associated with a node. This helps to reduce the size of nodes.
     */
    class Transform {
        /**
         * Node that this transform belongs to.
         */
        protected _node: Node;
        /**
         * Transform matrix.
         */
        protected _matrix: Matrix;
        /**
         * Transform color matrix.
         */
        protected _colorMatrix: ColorMatrix;
        /**
         * Concatenated matrix. This is not frequently used.
         */
        protected _concatenatedMatrix: Matrix;
        /**
         * Inverted concatenated matrix. This is not frequently used.
         */
        protected _invertedConcatenatedMatrix: Matrix;
        /**
         * Concatenated color matrix. This is not frequently used.
         */
        protected _concatenatedColorMatrix: ColorMatrix;
        constructor(node: Node);
        /**
         * Set a node's transform matrix. You should never mutate the matrix object directly.
         */
        setMatrix(value: Matrix): void;
        setColorMatrix(value: ColorMatrix): void;
        getMatrix(clone?: boolean): Matrix;
        hasColorMatrix(): boolean;
        getColorMatrix(clone?: boolean): ColorMatrix;
        /**
         * Compute the concatenated transforms for this node and all of its ancestors since we're already doing
         * all the work.
         */
        getConcatenatedMatrix(clone?: boolean): Matrix;
        getInvertedConcatenatedMatrix(clone?: boolean): Matrix;
        toString(): string;
    }
    /**
     * Layer information associated with a node. This helps to reduce the size of nodes.
     */
    class Layer {
        protected _node: Node;
        protected _blendMode: BlendMode;
        protected _mask: Node;
        protected _filters: Filter[];
        constructor(node: Node);
        filters: Filter[];
        blendMode: BlendMode;
        mask: Node;
        toString(): string;
        expandBounds(bounds: Rectangle): void;
    }
    /**
     * Shapes are instantiations of Renderables.
     */
    class Shape extends Node {
        private _source;
        private _ratio;
        constructor(source: Renderable);
        getBounds(clone?: boolean): Rectangle;
        source: Renderable;
        ratio: number;
        _propagateFlagsDown(flags: NodeFlags): void;
        getChildren(clone?: boolean): Node[];
    }
    import StageAlignFlags = Shumway.Remoting.StageAlignFlags;
    import StageScaleMode = Shumway.Remoting.StageScaleMode;
    class RendererOptions {
        debug: boolean;
        paintRenderable: boolean;
        paintBounds: boolean;
        paintDirtyRegion: boolean;
        paintFlashing: boolean;
        paintViewport: boolean;
        clear: boolean;
    }
    const enum Backend {
        Canvas2D = 0,
        WebGL = 1,
        Both = 2,
        DOM = 3,
        SVG = 4,
    }
    /**
     * Base class for all renderers.
     */
    class Renderer extends NodeVisitor {
        /**
         * Everything is clipped by the viewport.
         */
        protected _viewport: Rectangle;
        protected _options: RendererOptions;
        /**
         * We can render either into a canvas element or into a div element.
         */
        protected _container: HTMLDivElement | HTMLCanvasElement;
        protected _stage: Stage;
        protected _devicePixelRatio: number;
        constructor(container: HTMLDivElement | HTMLCanvasElement, stage: Stage, options: RendererOptions);
        viewport: Rectangle;
        render(): void;
        /**
         * Notify renderer that the viewport has changed.
         */
        resize(): void;
        /**
         * Captures a rectangular region of the easel as a dataURL as specified by |bounds|. |stageContent| indicates if the bounds
         * should be computed by looking at the bounds of the content of the easel rather than the easel itself.
         */
        screenShot(bounds: Rectangle, stageContent: boolean, disableHidpi: boolean): ScreenShot;
    }
    /**
     * Node container that handles Flash style alignment and scale modes.
     */
    class Stage extends Group {
        /**
         * This is supposed to keep track of dirty regions.
         */
        private _dirtyRegion;
        dirtyRegion: DirtyRegion;
        private _align;
        private _scaleMode;
        /**
         * All stage content is added to his child node. This is so what we can set the align and scale
         * transform to all stage descendants but not affect the stage itself.
         */
        private _content;
        color: Color;
        private static DEFAULT_SCALE;
        private static DEFAULT_ALIGN;
        private _preVisitor;
        constructor(w: number, h: number, trackDirtyRegion?: boolean);
        setBounds(value: Rectangle): void;
        content: Group;
        /**
         * Checks to see if we should render and if so, clears any relevant dirty flags. Returns
         * true if rendering should commence. Flag clearing is made optional here in case there
         * is any code that needs to check if rendering is about to happen.
         */
        readyToRender(): boolean;
        align: StageAlignFlags;
        scaleMode: StageScaleMode;
        /**
         * Figure out what the content transform shuold be given the current align and scale modes.
         */
        private _updateContentMatrix();
    }
}
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
declare module Shumway.GFX {
    import Rectangle = Geometry.Rectangle;
    import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    import VideoPlaybackEvent = Shumway.Remoting.VideoPlaybackEvent;
    import VideoControlEvent = Shumway.Remoting.VideoControlEvent;
    /**
     * Represents some source renderable content.
     */
    class Renderable extends Node {
        /**
         * Back reference to nodes that use this renderable.
         */
        private _parents;
        /**
         * Back reference to renderables that use this renderable.
         */
        private _renderableParents;
        parents: Shape[];
        addParent(frame: Shape): void;
        /**
         * Checks if this node will be reached by the renderer.
         */
        willRender(): boolean;
        addRenderableParent(renderable: Renderable): void;
        /**
         * Returns the first unrooted parent or creates a new parent if none was found.
         */
        wrap(): Shape;
        invalidate(): void;
        private _invalidateEventListeners;
        addInvalidateEventListener(listener: (renderable: Renderable) => void): void;
        getBounds(clone?: boolean): Shumway.GFX.Geometry.Rectangle;
        getChildren(clone?: boolean): Node[];
        _propagateFlagsUp(flags: NodeFlags): void;
        constructor();
        /**
         * Render source content in the specified |context| or add one or more paths to |clipPath| if specified.
         * If specified, the rectangular |cullBounds| can be used to cull parts of the shape for better performance.
         * If |paintStencil| is |true| then we must not create any alpha values, and also not paint any strokes.
         */
        render(context: CanvasRenderingContext2D, ratio: number, cullBounds?: Shumway.GFX.Geometry.Rectangle, clipPath?: Path2D, paintStencil?: boolean): void;
    }
    class CustomRenderable extends Renderable {
        constructor(bounds: Rectangle, render: (context: CanvasRenderingContext2D, ratio: number, cullBounds: Shumway.GFX.Geometry.Rectangle) => void);
    }
    interface IVideoPlaybackEventSerializer {
        sendVideoPlaybackEvent(assetId: number, eventType: VideoPlaybackEvent, data: any): void;
    }
    const enum RenderableVideoState {
        Idle = 1,
        Playing = 2,
        Paused = 3,
        Ended = 4,
    }
    class RenderableVideo extends Renderable {
        _flags: number;
        private _video;
        private _videoEventHandler;
        private _assetId;
        private _eventSerializer;
        private _lastTimeInvalidated;
        private _lastPausedTime;
        private _seekHappening;
        private _pauseHappening;
        private _isDOMElement;
        private _state;
        static _renderableVideos: RenderableVideo[];
        constructor(assetId: number, eventSerializer: IVideoPlaybackEventSerializer);
        video: HTMLVideoElement;
        state: RenderableVideoState;
        play(): void;
        pause(): void;
        private _handleVideoEvent(evt);
        private _notifyNetStream(eventType, data);
        processControlRequest(type: VideoControlEvent, data: any): any;
        checkForUpdate(): void;
        static checkForVideoUpdates(): void;
        render(context: CanvasRenderingContext2D, ratio: number, cullBounds: Rectangle): void;
    }
    class RenderableBitmap extends Renderable {
        _flags: number;
        properties: {
            [name: string]: any;
        };
        _canvas: HTMLCanvasElement;
        _context: CanvasRenderingContext2D;
        _imageData: ImageData;
        private _sourceImage;
        private fillStyle;
        static FromDataBuffer(type: ImageType, dataBuffer: DataBuffer, bounds: Rectangle): RenderableBitmap;
        static FromNode(source: Node, matrix: Shumway.GFX.Geometry.Matrix, colorMatrix: Shumway.GFX.ColorMatrix, blendMode: number, clipRect: Rectangle): RenderableBitmap;
        /**
         * Returns a RenderableBitmap from an Image element, which it uses as its source.
         *
         * Takes `width` and `height` as arguments so it can deal with non-decoded images,
         * which will only get their data after asynchronous decoding has completed.
         */
        static FromImage(image: HTMLImageElement, width: number, height: number): RenderableBitmap;
        updateFromDataBuffer(type: ImageType, dataBuffer: DataBuffer): void;
        /**
         * Writes the image data into the given |output| data buffer.
         */
        readImageData(output: DataBuffer): void;
        constructor(source: any, bounds: Rectangle);
        render(context: CanvasRenderingContext2D, ratio: number, cullBounds: Rectangle): void;
        drawNode(source: Node, matrix: Shumway.GFX.Geometry.Matrix, colorMatrix: Shumway.GFX.ColorMatrix, blendMode: number, clip: Rectangle): void;
        mask(alphaValues: Uint8Array): void;
        private _initializeSourceCanvas(source);
        private _ensureSourceCanvas();
        private imageData;
        renderSource: any;
        private _renderFallback(context);
    }
    const enum PathType {
        Fill = 0,
        Stroke = 1,
        StrokeFill = 2,
    }
    class StyledPath {
        type: PathType;
        style: any;
        smoothImage: boolean;
        strokeProperties: StrokeProperties;
        path: Path2D;
        constructor(type: PathType, style: any, smoothImage: boolean, strokeProperties: StrokeProperties);
    }
    class StrokeProperties {
        thickness: number;
        scaleMode: LineScaleMode;
        capsStyle: string;
        jointsStyle: string;
        miterLimit: number;
        constructor(thickness: number, scaleMode: LineScaleMode, capsStyle: string, jointsStyle: string, miterLimit: number);
    }
    class RenderableShape extends Renderable {
        _flags: NodeFlags;
        properties: {
            [name: string]: any;
        };
        private fillStyle;
        private _paths;
        protected _id: number;
        protected _pathData: ShapeData;
        protected _textures: RenderableBitmap[];
        protected static LINE_CAPS_STYLES: string[];
        protected static LINE_JOINTS_STYLES: string[];
        constructor(id: number, pathData: ShapeData, textures: RenderableBitmap[], bounds: Rectangle);
        update(pathData: ShapeData, textures: RenderableBitmap[], bounds: Rectangle): void;
        /**
         * If |clipPath| is not |null| then we must add all paths to |clipPath| instead of drawing to |context|.
         * We also cannot call |save| or |restore| because those functions reset the current clipping region.
         * It looks like Flash ignores strokes when clipping so we can also ignore stroke paths when computing
         * the clip region.
         *
         * If |paintStencil| is |true| then we must not create any alpha values, and also not paint
         * any strokes.
         */
        render(context: CanvasRenderingContext2D, ratio: number, cullBounds: Rectangle, clipPath?: Path2D, paintStencil?: boolean): void;
        protected _deserializePaths(data: ShapeData, context: CanvasRenderingContext2D, ratio: number): StyledPath[];
        private _createPath(type, style, smoothImage, strokeProperties, x, y);
        private _readMatrix(data);
        private _readGradient(styles, context);
        private _readBitmap(styles, context);
        protected _renderFallback(context: CanvasRenderingContext2D): void;
    }
    class RenderableMorphShape extends RenderableShape {
        _flags: NodeFlags;
        private _morphPaths;
        protected _deserializePaths(data: ShapeData, context: CanvasRenderingContext2D, ratio: number): StyledPath[];
        private _createMorphPath(type, ratio, style, smoothImage, strokeProperties, x, y);
        private _readMorphMatrix(data, morphData, ratio);
        private _readMorphGradient(styles, morphStyles, ratio, context);
        private _readMorphBitmap(styles, morphStyles, ratio, context);
    }
    class TextLine {
        private static _measureContext;
        x: number;
        y: number;
        width: number;
        ascent: number;
        descent: number;
        leading: number;
        align: number;
        runs: TextRun[];
        private static _getMeasureContext();
        addRun(font: string, fillStyle: string, text: string, letterSpacing: number, underline: boolean): void;
        wrap(maxWidth: number): TextLine[];
        toString(): string;
    }
    class TextRun {
        font: string;
        fillStyle: string;
        text: string;
        width: number;
        letterSpacing: number;
        underline: boolean;
        constructor(font?: string, fillStyle?: string, text?: string, width?: number, letterSpacing?: number, underline?: boolean);
    }
    class RenderableText extends Renderable {
        _flags: number;
        properties: {
            [name: string]: any;
        };
        private _textBounds;
        private _textRunData;
        private _plainText;
        private _backgroundColor;
        private _borderColor;
        private _matrix;
        private _coords;
        private _scrollV;
        private _scrollH;
        textRect: Rectangle;
        lines: TextLine[];
        constructor(bounds: any);
        setBounds(bounds: any): void;
        setContent(plainText: string, textRunData: DataBuffer, matrix: Shumway.GFX.Geometry.Matrix, coords: DataBuffer): void;
        setStyle(backgroundColor: number, borderColor: number, scrollV: number, scrollH: number): void;
        reflow(autoSize: number, wordWrap: boolean): void;
        private static absoluteBoundPoints;
        private static roundBoundPoints(points);
        render(context: CanvasRenderingContext2D): void;
        private _renderChars(context);
        private _renderLines(context);
    }
    class Label extends Renderable {
        _flags: NodeFlags;
        properties: {
            [name: string]: any;
        };
        private _text;
        text: string;
        constructor(w: number, h: number);
        render(context: CanvasRenderingContext2D, ratio: number, cullBounds?: Rectangle): void;
    }
}
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
declare module Shumway.GFX {
    import Rectangle = Geometry.Rectangle;
    class Filter {
        expandBounds(bounds: Rectangle): void;
    }
    class BlurFilter extends Filter {
        blurX: number;
        blurY: number;
        quality: number;
        constructor(blurX: number, blurY: number, quality: number);
        expandBounds(bounds: Rectangle): void;
    }
    class DropshadowFilter extends Filter {
        alpha: number;
        angle: number;
        blurX: number;
        blurY: number;
        color: number;
        distance: number;
        hideObject: boolean;
        inner: boolean;
        knockout: boolean;
        quality: number;
        strength: number;
        constructor(alpha: number, angle: number, blurX: number, blurY: number, color: number, distance: number, hideObject: boolean, inner: boolean, knockout: boolean, quality: number, strength: number);
        expandBounds(bounds: Rectangle): void;
    }
    class GlowFilter extends Filter {
        alpha: number;
        blurX: number;
        blurY: number;
        color: number;
        inner: boolean;
        knockout: boolean;
        quality: number;
        strength: number;
        constructor(alpha: number, blurX: number, blurY: number, color: number, inner: boolean, knockout: boolean, quality: number, strength: number);
        expandBounds(bounds: Rectangle): void;
    }
    const enum ColorMatrixType {
        Unknown = 0,
        Identity = 1,
    }
    class ColorMatrix extends Filter {
        private _data;
        private _type;
        constructor(data: any);
        clone(): ColorMatrix;
        set(other: ColorMatrix): void;
        toWebGLMatrix(): Float32Array;
        asWebGLMatrix(): Float32Array;
        asWebGLVector(): Float32Array;
        isIdentity(): boolean;
        static createIdentity(): ColorMatrix;
        setMultipliersAndOffsets(redMultiplier: number, greenMultiplier: number, blueMultiplier: number, alphaMultiplier: number, redOffset: number, greenOffset: number, blueOffset: number, alphaOffset: number): void;
        transformRGBA(rgba: number): number;
        multiply(other: ColorMatrix): void;
        alphaMultiplier: number;
        hasOnlyAlphaMultiplier(): boolean;
        equals(other: ColorMatrix): boolean;
        toSVGFilterMatrix(): string;
    }
}
interface CanvasPattern {
    setTransform: (matrix: SVGMatrix) => void;
}
interface CanvasGradient {
    setTransform: (matrix: SVGMatrix) => void;
}
interface CanvasRenderingContext2D {
    stackDepth: number;
    fill(path: Path2D, fillRule?: string): void;
    clip(path: Path2D, fillRule?: string): void;
    stroke(path: Path2D): void;
    imageSmoothingEnabled: boolean;
    mozImageSmoothingEnabled: boolean;
    fillRule: string;
    mozFillRule: string;
    enterBuildingClippingRegion(): any;
    leaveBuildingClippingRegion(): any;
}
declare class Path2D {
    constructor();
    constructor(path: Path2D);
    constructor(paths: Path2D[], fillRule?: string);
    constructor(d: any);
    addPath(path: Path2D, transform?: SVGMatrix): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    rect(x: number, y: number, w: number, h: number): void;
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    closePath(): void;
}
