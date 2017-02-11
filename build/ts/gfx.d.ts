/// <reference path="base.d.ts" />
/// <reference path="tools.d.ts" />
/// <reference path="gfx-base.d.ts" />
declare module Shumway.GFX.Canvas2D {
    function notifyReleaseChanged(): void;
}
declare module Shumway.GFX.Canvas2D {
    import Rectangle = Shumway.GFX.Geometry.Rectangle;
    class Filters {
        /**
         * Reusable blur filter SVG element.
         */
        static _svgBlurFilter: Element;
        /**
         * Reusable dropshadow filter SVG element.
         */
        static _svgDropshadowFilterBlur: Element;
        static _svgDropshadowFilterFlood: Element;
        static _svgDropshadowFilterOffset: Element;
        static _svgDropshadowMergeNode: Element;
        /**
         * Reusable colormatrix filter SVG element.
         */
        static _svgColorMatrixFilter: Element;
        static _svgFiltersAreSupported: boolean;
        /**
         * Creates an SVG element and defines filters that are referenced in |canvas.filter| properties. We cannot
         * inline CSS filters because they don't expose independent blurX and blurY properties.
         * This only works in Firefox, and you have to set the 'canvas.filters.enabled' equal to |true|.
         */
        private static _prepareSVGFilters();
        static _applyFilter(ratio: number, context: CanvasRenderingContext2D, filter: Filter): void;
        static _removeFilter(context: CanvasRenderingContext2D): void;
        static _applyColorMatrix(context: CanvasRenderingContext2D, colorMatrix: ColorMatrix): void;
    }
    class Canvas2DSurfaceRegion implements ISurfaceRegion {
        surface: Canvas2DSurface;
        region: RegionAllocator.Region;
        w: number;
        h: number;
        /**
         * Draw image is really slow if the soruce and destination are the same. We use
         * a temporary canvas for all such copy operations.
         */
        private static _copyCanvasContext;
        constructor(surface: Canvas2DSurface, region: RegionAllocator.Region, w: number, h: number);
        free(): void;
        private static _ensureCopyCanvasSize(w, h);
        draw(source: Canvas2DSurfaceRegion, x: number, y: number, w: number, h: number, colorMatrix: ColorMatrix, blendMode: BlendMode, filters: Filter[], devicePixelRatio: number): void;
        context: CanvasRenderingContext2D;
        resetTransform(): void;
        reset(): void;
        fill(fillStyle: any): void;
        clear(rectangle?: Rectangle): void;
    }
    class Canvas2DSurface implements ISurface {
        w: number;
        h: number;
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
        private _regionAllocator;
        constructor(canvas: HTMLCanvasElement, regionAllocator?: RegionAllocator.IRegionAllocator);
        allocate(w: number, h: number): Canvas2DSurfaceRegion;
        free(surfaceRegion: Canvas2DSurfaceRegion): void;
    }
}
declare module Shumway.GFX.Canvas2D {
    import Rectangle = Shumway.GFX.Geometry.Rectangle;
    import Matrix = Shumway.GFX.Geometry.Matrix;
    import BlendMode = Shumway.GFX.BlendMode;
    class MipMapLevel {
        surfaceRegion: ISurfaceRegion;
        scale: number;
        constructor(surfaceRegion: ISurfaceRegion, scale: number);
    }
    class MipMap {
        private _node;
        private _size;
        private _levels;
        private _renderer;
        private _surfaceRegionAllocator;
        constructor(renderer: Canvas2DRenderer, node: Node, surfaceRegionAllocator: SurfaceRegionAllocator.ISurfaceRegionAllocator, size: number);
        getLevel(matrix: Matrix): MipMapLevel;
    }
    const enum FillRule {
        NonZero = 0,
        EvenOdd = 1,
    }
    class Canvas2DRendererOptions extends RendererOptions {
        /**
         * Whether to force snapping matrices to device pixels.
         */
        snapToDevicePixels: boolean;
        /**
         * Whether to force image smoothing when drawing images.
         */
        imageSmoothing: boolean;
        /**
         * Whether to enable blending.
         */
        blending: boolean;
        /**
         * Whether to enable debugging of layers.
         */
        debugLayers: boolean;
        /**
         * Whether to enable masking.
         */
        masking: boolean;
        /**
         * Whether to enable filters.
         */
        filters: boolean;
        /**
         * Whether to cache shapes as images.
         */
        cacheShapes: boolean;
        /**
         * Shapes above this size are not cached.
         */
        cacheShapesMaxSize: number;
        /**
         * Number of times a shape is rendered before it's elligible for caching.
         */
        cacheShapesThreshold: number;
        /**
         * Enables alpha layer for the canvas context.
         */
        alpha: boolean;
    }
    const enum RenderFlags {
        None = 0,
        IgnoreNextLayer = 1,
        RenderMask = 2,
        IgnoreMask = 4,
        PaintStencil = 8,
        PaintClip = 16,
        IgnoreRenderable = 32,
        IgnoreNextRenderWithCache = 64,
        CacheShapes = 256,
        PaintFlashing = 512,
        PaintBounds = 1024,
        PaintDirtyRegion = 2048,
        ImageSmoothing = 4096,
        PixelSnapping = 8192,
    }
    /**
     * Render state.
     */
    class RenderState extends State {
        static allocationCount: number;
        private static _dirtyStack;
        clip: Rectangle;
        clipList: Rectangle[];
        clipPath: Path2D;
        flags: RenderFlags;
        target: Canvas2DSurfaceRegion;
        matrix: Matrix;
        colorMatrix: ColorMatrix;
        options: Canvas2DRendererOptions;
        constructor(target: Canvas2DSurfaceRegion);
        set(state: RenderState): void;
        clone(): RenderState;
        static allocate(): RenderState;
        free(): void;
        transform(transform: Transform): RenderState;
        hasFlags(flags: RenderFlags): boolean;
        removeFlags(flags: RenderFlags): void;
        toggleFlags(flags: RenderFlags, on: boolean): void;
        beginClipPath(transform: Matrix): void;
        applyClipPath(): void;
        closeClipPath(): void;
    }
    /**
     * Stats for each rendered frame.
     */
    class FrameInfo {
        private _count;
        private _enterTime;
        shapes: number;
        groups: number;
        culledNodes: number;
        enter(state: RenderState): void;
        leave(): void;
    }
    class Canvas2DRenderer extends Renderer {
        protected _options: Canvas2DRendererOptions;
        context: CanvasRenderingContext2D;
        private _target;
        private static _initializedCaches;
        /**
         * Allocates temporary regions for performing image operations.
         */
        private static _surfaceCache;
        /**
         * Allocates shape cache regions.
         */
        private static _shapeCache;
        private _visited;
        private _frameInfo;
        private _fontSize;
        /**
         * Stack of rendering layers. Stage video lives at the bottom of this stack.
         */
        private _layers;
        constructor(container: HTMLDivElement | HTMLCanvasElement, stage: Stage, options?: Canvas2DRendererOptions);
        private _addLayer(name);
        private _backgroundVideoLayer;
        private _createTarget(canvas);
        /**
         * If the stage bounds have changed, we have to resize all of our layers, canvases and more ...
         */
        private _onStageBoundsChanged(canvas);
        private static _prepareSurfaceAllocators();
        /**
         * Main render function.
         */
        render(): void;
        renderNode(node: Node, clip: Rectangle, matrix: Matrix): void;
        renderNodeWithState(node: Node, state: RenderState): void;
        private _renderWithCache(node, state);
        private _intersectsClipList(node, state);
        visitGroup(node: Group, state: RenderState): void;
        private static _debugPoints;
        _renderDebugInfo(node: Node, state: RenderState): void;
        visitStage(node: Stage, state: RenderState): void;
        visitShape(node: Shape, state: RenderState): void;
        /**
         * We don't actually draw the video like normal renderables, although we could.
         * Instead, we add the video element underneeth the canvas at layer zero and set
         * the appropriate css transform to move it into place.
         */
        visitRenderableVideo(node: RenderableVideo, state: RenderState): void;
        visitRenderable(node: Renderable, state: RenderState, ratio?: number): void;
        _renderLayer(node: Node, state: RenderState): void;
        _renderWithMask(node: Node, mask: Node, blendMode: BlendMode, stencil: boolean, state: RenderState): void;
        private _renderStageToTarget(target, node, clip);
        private _renderToTemporarySurface(node, bounds, state, clip, excludeSurface);
        private _allocateSurface(w, h, excludeSurface);
        screenShot(bounds: Rectangle, stageContent: boolean, disableHidpi: boolean): ScreenShot;
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
    import Point = Geometry.Point;
    import Rectangle = Geometry.Rectangle;
    import DisplayParameters = Shumway.Remoting.DisplayParameters;
    interface IState {
        onMouseUp(easel: Easel, event: MouseEvent): any;
        onMouseDown(easel: Easel, event: MouseEvent): any;
        onMouseMove(easel: Easel, event: MouseEvent): any;
        onMouseClick(easel: Easel, event: MouseEvent): any;
        onKeyUp(easel: Easel, event: KeyboardEvent): any;
        onKeyDown(easel: Easel, event: KeyboardEvent): any;
        onKeyPress(easel: Easel, event: KeyboardEvent): any;
    }
    class UIState implements IState {
        onMouseUp(easel: Easel, event: MouseEvent): void;
        onMouseDown(easel: Easel, event: MouseEvent): void;
        onMouseMove(easel: Easel, event: MouseEvent): void;
        onMouseWheel(easel: Easel, event: any): void;
        onMouseClick(easel: Easel, event: MouseEvent): void;
        onKeyUp(easel: Easel, event: KeyboardEvent): void;
        onKeyDown(easel: Easel, event: KeyboardEvent): void;
        onKeyPress(easel: Easel, event: KeyboardEvent): void;
    }
    class Easel {
        /**
         * Root stage node.
         */
        private _stage;
        /**
         * Node that holds the view transformation. This us used for zooming and panning in the easel.
         */
        private _worldView;
        /**
         * Node that holds the rest of the content in the display tree.
         */
        private _world;
        private _options;
        /**
         * Container div element that is managed by this easel. If the dimensions of this element change, then the dimensions of the root
         * stage also change.
         */
        private _container;
        private _renderer;
        private _disableHiDPI;
        private _state;
        private _persistentState;
        paused: boolean;
        viewport: Rectangle;
        transparent: boolean;
        private _selectedNodes;
        private _isRendering;
        private _rAF;
        private _eventListeners;
        private _fps;
        private _fullScreen;
        constructor(container: HTMLDivElement, disableHiDPI?: boolean, backgroundColor?: number);
        private _listenForContainerSizeChanges();
        private _onContainerSizeChanged();
        /**
         * Primitive event dispatching features.
         */
        addEventListener(type: string, listener: any): void;
        private _dispatchEvent(type);
        startRendering(): void;
        stopRendering(): void;
        state: UIState;
        cursor: string;
        private _render();
        render(): void;
        world: Group;
        worldView: Group;
        stage: Stage;
        options: Canvas2D.Canvas2DRendererOptions;
        getDisplayParameters(): DisplayParameters;
        toggleOption(name: string): void;
        getOption(name: string): any;
        getRatio(): number;
        private _containerWidth;
        private _containerHeight;
        queryNodeUnderMouse(event: MouseEvent): Node;
        selectNodeUnderMouse(event: MouseEvent): void;
        getMousePosition(event: MouseEvent, coordinateSpace: Node): Point;
        getMouseWorldPosition(event: MouseEvent): Point;
        private _onMouseDown(event);
        private _onMouseUp(event);
        private _onMouseMove(event);
        screenShot(bounds: Rectangle, stageContent: boolean, disableHidpi: boolean): ScreenShot;
    }
}
declare module Shumway.GFX {
    import Matrix = Shumway.GFX.Geometry.Matrix;
    const enum Layout {
        Simple = 0,
    }
    class TreeRendererOptions extends RendererOptions {
        layout: Layout;
    }
    class TreeRenderer extends Renderer {
        _options: TreeRendererOptions;
        _canvas: HTMLCanvasElement;
        _context: CanvasRenderingContext2D;
        layout: any;
        constructor(container: HTMLDivElement, stage: Stage, options?: TreeRendererOptions);
        private _listenForContainerSizeChanges();
        private _getRatio();
        private _onContainerSizeChanged();
        private _containerWidth;
        private _containerHeight;
        render(): void;
        _renderNodeSimple(context: CanvasRenderingContext2D, root: Node, transform: Matrix): void;
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
declare module Shumway.Remoting.GFX {
    import Group = Shumway.GFX.Group;
    import Renderable = Shumway.GFX.Renderable;
    import RenderableBitmap = Shumway.GFX.RenderableBitmap;
    import RenderableVideo = Shumway.GFX.RenderableVideo;
    import IVideoPlaybackEventSerializer = Shumway.GFX.IVideoPlaybackEventSerializer;
    import RenderableText = Shumway.GFX.RenderableText;
    import Node = Shumway.GFX.Node;
    import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    import Stage = Shumway.GFX.Stage;
    import Point = Shumway.GFX.Geometry.Point;
    import IDataInput = Shumway.ArrayUtilities.IDataInput;
    import IDataOutput = Shumway.ArrayUtilities.IDataOutput;
    class GFXChannelSerializer {
        output: IDataOutput;
        outputAssets: any[];
        writeMouseEvent(event: MouseEvent, point: Point): void;
        writeKeyboardEvent(event: KeyboardEvent): void;
        writeFocusEvent(type: FocusEventType): void;
    }
    class GFXChannelDeserializerContext implements IVideoPlaybackEventSerializer {
        stage: Stage;
        _nodes: Node[];
        private _assets;
        _easelHost: Shumway.GFX.EaselHost;
        private _canvas;
        private _context;
        constructor(easelHost: Shumway.GFX.EaselHost, root: Group, transparent: boolean);
        _registerAsset(id: number, symbolId: number, asset: Renderable): void;
        _makeNode(id: number): Node;
        _getAsset(id: number): Renderable;
        _getBitmapAsset(id: number): RenderableBitmap;
        _getVideoAsset(id: number): RenderableVideo;
        _getTextAsset(id: number): RenderableText;
        registerFont(syncId: number, data: Uint8Array, resolve: (data: any) => void): void;
        registerImage(syncId: number, symbolId: number, imageType: ImageType, data: Uint8Array, alphaData: Uint8Array, resolve: (data: any) => void): void;
        registerVideo(syncId: number): void;
        /**
         * Creates an Image element to decode JPG|PNG|GIF data passed in as a buffer.
         *
         * The resulting image is stored as the drawing source of a new RenderableBitmap, which is
         * returned.
         * Once the image is loaded, the RenderableBitmap's bounds are updated and the provided
         * oncomplete callback is invoked with the image dimensions.
         */
        _decodeImage(type: ImageType, data: Uint8Array, alphaData: Uint8Array, oncomplete: (data: any) => void): RenderableBitmap;
        sendVideoPlaybackEvent(assetId: number, eventType: VideoPlaybackEvent, data: any): void;
    }
    class GFXChannelDeserializer {
        input: IDataInput;
        inputAssets: any[];
        output: DataBuffer;
        context: GFXChannelDeserializerContext;
        /**
         * Used to avoid extra allocation, don't ever leak a reference to this object.
         */
        private static _temporaryReadMatrix;
        /**
         * Used to avoid extra allocation, don't ever leak a reference to this object.
         */
        private static _temporaryReadRectangle;
        /**
         * Used to avoid extra allocation, don't ever leak a reference to this object.
         */
        private static _temporaryReadColorMatrix;
        private static _temporaryReadColorMatrixIdentity;
        read(): void;
        private _readMatrix();
        private _readRectangle();
        private _readColorMatrix();
        private _readAsset();
        private _readUpdateGraphics();
        private _readUpdateBitmapData();
        private _readUpdateTextContent();
        private _writeLineMetrics(line);
        private _readUpdateStage();
        private _readUpdateCurrentMouseTarget();
        private _readUpdateNetStream();
        private _readFilters(node);
        private _readUpdateFrame();
        private _readDrawToBitmap();
        private _readRequestBitmapData();
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
    import Easel = Shumway.GFX.Easel;
    import Stage = Shumway.GFX.Stage;
    import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    import VideoControlEvent = Shumway.Remoting.VideoControlEvent;
    import VideoPlaybackEvent = Shumway.Remoting.VideoPlaybackEvent;
    import DisplayParameters = Shumway.Remoting.DisplayParameters;
    var ContextMenuButton: number;
    class EaselHost {
        private static _mouseEvents;
        private static _keyboardEvents;
        private _easel;
        private _group;
        private _context;
        private _content;
        private _fullscreen;
        constructor(easel: Easel);
        onSendUpdates(update: DataBuffer, asssets: Array<DataBuffer>): void;
        easel: Easel;
        stage: Stage;
        content: Group;
        cursor: string;
        fullscreen: boolean;
        private _mouseEventListener(event);
        private _keyboardEventListener(event);
        _addEventListeners(): void;
        private _sendFocusEvent(type);
        private _addFocusEventListeners();
        private _resizeEventListener();
        onDisplayParameters(params: DisplayParameters): void;
        processUpdates(updates: DataBuffer, assets: Array<DataBuffer>, output?: DataBuffer): void;
        processVideoControl(id: number, eventType: VideoControlEvent, data: any): any;
        processRegisterFont(syncId: number, data: Uint8Array, resolve: (data: any) => void): void;
        processRegisterImage(syncId: number, symbolId: number, imageType: ImageType, data: Uint8Array, alphaData: Uint8Array, resolve: (data: any) => void): void;
        processFSCommand(command: string, args: string): void;
        processFrame(): void;
        onVideoPlaybackEvent(id: number, eventType: VideoPlaybackEvent, data: any): void;
        sendVideoPlaybackEvent(id: number, eventType: VideoPlaybackEvent, data: any): void;
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
declare module Shumway.GFX.Window {
    import Easel = Shumway.GFX.Easel;
    import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    import VideoPlaybackEvent = Shumway.Remoting.VideoPlaybackEvent;
    import DisplayParameters = Shumway.Remoting.DisplayParameters;
    class WindowEaselHost extends EaselHost {
        private _peer;
        constructor(easel: Easel, peer: Shumway.Remoting.ITransportPeer);
        onSendUpdates(updates: DataBuffer, assets: Array<DataBuffer>): void;
        onDisplayParameters(params: DisplayParameters): void;
        onVideoPlaybackEvent(id: number, eventType: VideoPlaybackEvent, data: any): void;
        private _sendRegisterFontResponse(requestId, result);
        private _sendRegisterImageResponse(requestId, result);
        _onWindowMessage(data: any, async: boolean): any;
    }
}
/**
 * Copyright 2015 Mozilla Foundation
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
declare module Shumway.GFX.Test {
    import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    const enum MovieRecordType {
        None = 0,
        PlayerCommand = 1,
        PlayerCommandAsync = 2,
        Frame = 3,
        Font = 4,
        Image = 5,
        FSCommand = 6,
    }
    class MovieRecorder {
        private _recording;
        private _recordingStarted;
        private _stopped;
        private _maxRecordingSize;
        constructor(maxRecordingSize: number);
        stop(): void;
        getRecording(): Blob;
        dump(): void;
        private _createRecord(type, buffer);
        recordPlayerCommand(async: boolean, updates: Uint8Array, assets: any[]): void;
        recordFrame(): void;
        recordFont(syncId: number, data: Uint8Array): void;
        recordImage(syncId: number, symbolId: number, imageType: ImageType, data: Uint8Array, alphaData: Uint8Array): void;
        recordFSCommand(command: string, args: string): void;
    }
    class MovieRecordParser {
        private _buffer;
        currentTimestamp: number;
        currentType: MovieRecordType;
        currentData: DataBuffer;
        constructor(data: Uint8Array);
        readNextRecord(): MovieRecordType;
        parsePlayerCommand(): any;
        parseFSCommand(): any;
        parseFont(): any;
        parseImage(): any;
        dump(): void;
    }
}
/**
 * Copyright 2015 Mozilla Foundation
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
declare module Shumway.GFX.Test {
    import Easel = Shumway.GFX.Easel;
    import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    import VideoPlaybackEvent = Shumway.Remoting.VideoPlaybackEvent;
    import DisplayParameters = Shumway.Remoting.DisplayParameters;
    class PlaybackEaselHost extends EaselHost {
        private _parser;
        private _lastTimestamp;
        ignoreTimestamps: boolean;
        alwaysRenderFrame: boolean;
        cpuTimeUpdates: number;
        cpuTimeRendering: number;
        onComplete: () => void;
        constructor(easel: Easel);
        cpuTime: number;
        private playUrl(url);
        private playBytes(data);
        onSendUpdates(updates: DataBuffer, assets: Array<DataBuffer>): void;
        onDisplayParameters(params: DisplayParameters): void;
        onVideoPlaybackEvent(id: number, eventType: VideoPlaybackEvent, data: any): void;
        private _parseNext();
        private _runRecord();
        private _renderFrameJustAfterRAF();
    }
}
/**
 * Copyright 2015 Mozilla Foundation
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
declare module Shumway.GFX.Test {
    import WindowEaselHost = Shumway.GFX.Window.WindowEaselHost;
    class RecordingEaselHost extends WindowEaselHost {
        private _recorder;
        recorder: MovieRecorder;
        constructor(easel: Easel, peer: Shumway.Remoting.ITransportPeer, recordingLimit?: number);
        _onWindowMessage(data: any, async: boolean): any;
    }
}
interface WebGLActiveInfo {
    location: any;
}
interface WebGLProgram extends WebGLObject {
    uniforms: any;
    attributes: any;
}
