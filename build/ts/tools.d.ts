/// <reference path="base.d.ts" />
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
declare module Shumway.Tools.Theme {
    interface UITheme {
        tabToolbar(a: number): string;
        toolbars(a: number): string;
        selectionBackground(a: number): string;
        selectionText(a: number): string;
        splitters(a: number): string;
        bodyBackground(a: number): string;
        sidebarBackground(a: number): string;
        attentionBackground(a: number): string;
        bodyText(a: number): string;
        foregroundTextGrey(a: number): string;
        contentTextHighContrast(a: number): string;
        contentTextGrey(a: number): string;
        contentTextDarkGrey(a: number): string;
        blueHighlight(a: number): string;
        purpleHighlight(a: number): string;
        pinkHighlight(a: number): string;
        redHighlight(a: number): string;
        orangeHighlight(a: number): string;
        lightOrangeHighlight(a: number): string;
        greenHighlight(a: number): string;
        blueGreyHighlight(a: number): string;
    }
    class UI {
        static toRGBA(r: number, g: number, b: number, a?: number): string;
    }
    class UIThemeDark implements UITheme {
        constructor();
        tabToolbar(a?: number): string;
        toolbars(a?: number): string;
        selectionBackground(a?: number): string;
        selectionText(a?: number): string;
        splitters(a?: number): string;
        bodyBackground(a?: number): string;
        sidebarBackground(a?: number): string;
        attentionBackground(a?: number): string;
        bodyText(a?: number): string;
        foregroundTextGrey(a?: number): string;
        contentTextHighContrast(a?: number): string;
        contentTextGrey(a?: number): string;
        contentTextDarkGrey(a?: number): string;
        blueHighlight(a?: number): string;
        purpleHighlight(a?: number): string;
        pinkHighlight(a?: number): string;
        redHighlight(a?: number): string;
        orangeHighlight(a?: number): string;
        lightOrangeHighlight(a?: number): string;
        greenHighlight(a?: number): string;
        blueGreyHighlight(a?: number): string;
    }
    class UIThemeLight implements UITheme {
        constructor();
        tabToolbar(a?: number): string;
        toolbars(a?: number): string;
        selectionBackground(a?: number): string;
        selectionText(a?: number): string;
        splitters(a?: number): string;
        bodyBackground(a?: number): string;
        sidebarBackground(a?: number): string;
        attentionBackground(a?: number): string;
        bodyText(a?: number): string;
        foregroundTextGrey(a?: number): string;
        contentTextHighContrast(a?: number): string;
        contentTextGrey(a?: number): string;
        contentTextDarkGrey(a?: number): string;
        blueHighlight(a?: number): string;
        purpleHighlight(a?: number): string;
        pinkHighlight(a?: number): string;
        redHighlight(a?: number): string;
        orangeHighlight(a?: number): string;
        lightOrangeHighlight(a?: number): string;
        greenHighlight(a?: number): string;
        blueGreyHighlight(a?: number): string;
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
declare module Shumway.Tools.Profiler {
    class Profile {
        private _snapshots;
        private _buffers;
        private _startTime;
        private _endTime;
        private _windowStart;
        private _windowEnd;
        private _maxDepth;
        constructor(buffers: TimelineBuffer[], startTime: number);
        addBuffer(buffer: TimelineBuffer): void;
        getSnapshotAt(index: number): TimelineBufferSnapshot;
        hasSnapshots: boolean;
        snapshotCount: number;
        startTime: number;
        endTime: number;
        totalTime: number;
        windowStart: number;
        windowEnd: number;
        windowLength: number;
        maxDepth: number;
        forEachSnapshot(visitor: (snapshot: TimelineBufferSnapshot, index: number) => void): void;
        createSnapshots(): void;
        setWindow(start: number, end: number): void;
        moveWindowTo(time: number): void;
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
declare module Shumway.Tools.Profiler {
    interface TimelineFrameRange {
        startIndex: number;
        endIndex: number;
        startTime: number;
        endTime: number;
        totalTime: number;
    }
    class TimelineFrameStatistics {
        kind: TimelineItemKind;
        count: number;
        selfTime: number;
        totalTime: number;
        constructor(kind: TimelineItemKind);
    }
    /**
     * Represents a single timeline frame range and makes it easier to work with the compacted
     * timeline buffer data.
     */
    class TimelineFrame {
        parent: TimelineFrame;
        kind: TimelineItemKind;
        startData: any;
        endData: any;
        startTime: number;
        endTime: number;
        statistics: TimelineFrameStatistics[];
        children: TimelineFrame[];
        total: number;
        maxDepth: number;
        depth: number;
        constructor(parent: TimelineFrame, kind: TimelineItemKind, startData: any, endData: any, startTime: number, endTime: number);
        totalTime: number;
        selfTime: number;
        /**
         * Gets the child index of the first child to overlap the specified time.
         */
        getChildIndex(time: number): number;
        /**
         * Gets the high and low index of the children that intersect the specified time range.
         */
        getChildRange(startTime: number, endTime: number): TimelineFrameRange;
        private _getNearestChild(time);
        private _getNearestChildReverse(time);
        /**
         * Finds the deepest child that intersects with the specified time.
         */
        query(time: number): TimelineFrame;
        /**
         * When querying a series of samples, if the deepest child for the previous time is known,
         * it is faster to go up the tree from there, until a frame is found that contains the next time,
         * and then go back down.
         *
         * More often than not we don't have to start at the very top.
         */
        queryNext(time: number): TimelineFrame;
        /**
       * Gets this frame's distance to the root.
       */
        getDepth(): number;
        calculateStatistics(): void;
        trace(writer: IndentingWriter): void;
    }
    class TimelineBufferSnapshot extends TimelineFrame {
        name: string;
        constructor(name: string);
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
declare module Shumway.Tools.Profiler {
    interface TimelineItemKind {
        id: number;
        name: string;
        bgColor: string;
        textColor: string;
        visible: boolean;
    }
    /**
     * Records enter / leave events in two circular buffers.
     * The goal here is to be able to handle large amounts of data.
     */
    class TimelineBuffer {
        static ENTER: number;
        static LEAVE: number;
        static MAX_KINDID: number;
        static MAX_DATAID: number;
        private _depth;
        private _data;
        private _kinds;
        private _kindNameMap;
        private _marks;
        private _times;
        private _stack;
        private _startTime;
        name: string;
        constructor(name?: string, startTime?: number);
        getKind(kind: number): TimelineItemKind;
        kinds: TimelineItemKind[];
        depth: number;
        private _initialize();
        private _getKindId(name);
        private _getMark(type, kindId, data?);
        enter(name: string, data?: any, time?: number): void;
        leave(name?: string, data?: any, time?: number): void;
        count(name: string, value: number, data?: any): void;
        /**
         * Constructs an easier to work with TimelineFrame data structure.
         */
        createSnapshot(count?: number): TimelineBufferSnapshot;
        reset(startTime?: number): void;
        static FromFirefoxProfile(profile: any, name?: string): TimelineBuffer;
        static FromChromeProfile(profile: any, name?: string): TimelineBuffer;
        private static _resolveIds(parent, idMap);
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
declare module Shumway.Tools.Profiler {
    enum UIThemeType {
        DARK = 0,
        LIGHT = 1,
    }
    class Controller {
        private _container;
        private _profiles;
        private _activeProfile;
        private _overviewHeader;
        private _overview;
        private _headers;
        private _charts;
        private _themeType;
        private _theme;
        private _tooltip;
        constructor(container: HTMLElement, themeType?: UIThemeType);
        createProfile(buffers: TimelineBuffer[], startTime: number): Profile;
        activateProfile(profile: Profile): void;
        activateProfileAt(index: number): void;
        deactivateProfile(): void;
        resize(): void;
        getProfileAt(index: number): Profile;
        activeProfile: Profile;
        profileCount: number;
        container: HTMLElement;
        themeType: UIThemeType;
        theme: Theme.UITheme;
        getSnapshotAt(index: number): TimelineBufferSnapshot;
        private _createViews();
        private _destroyViews();
        private _initializeViews();
        private _onResize();
        private _updateViews();
        private _drawViews();
        private _createTooltip();
        /**
         * View callbacks
         */
        setWindow(start: number, end: number): void;
        moveWindowTo(time: number): void;
        showTooltip(chart: FlameChart, frame: TimelineFrame, x: number, y: number): void;
        hideTooltip(): void;
        createTooltipContent(chart: FlameChart, frame: TimelineFrame): HTMLElement;
        appendDataElements(el: HTMLElement, data: any): void;
        removeTooltipContent(): void;
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
declare module Shumway.Tools.Profiler {
    interface MouseControllerTarget {
        onMouseDown(x: number, y: number): void;
        onMouseMove(x: number, y: number): void;
        onMouseOver(x: number, y: number): void;
        onMouseOut(): void;
        onMouseWheel(x: number, y: number, delta: number): void;
        onDrag(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        onDragEnd(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        onClick(x: number, y: number): void;
        onHoverStart(x: number, y: number): void;
        onHoverEnd(): void;
    }
    class MouseCursor {
        value: string;
        constructor(value: string);
        toString(): string;
        static AUTO: MouseCursor;
        static DEFAULT: MouseCursor;
        static NONE: MouseCursor;
        static HELP: MouseCursor;
        static POINTER: MouseCursor;
        static PROGRESS: MouseCursor;
        static WAIT: MouseCursor;
        static CELL: MouseCursor;
        static CROSSHAIR: MouseCursor;
        static TEXT: MouseCursor;
        static ALIAS: MouseCursor;
        static COPY: MouseCursor;
        static MOVE: MouseCursor;
        static NO_DROP: MouseCursor;
        static NOT_ALLOWED: MouseCursor;
        static ALL_SCROLL: MouseCursor;
        static COL_RESIZE: MouseCursor;
        static ROW_RESIZE: MouseCursor;
        static N_RESIZE: MouseCursor;
        static E_RESIZE: MouseCursor;
        static S_RESIZE: MouseCursor;
        static W_RESIZE: MouseCursor;
        static NE_RESIZE: MouseCursor;
        static NW_RESIZE: MouseCursor;
        static SE_RESIZE: MouseCursor;
        static SW_RESIZE: MouseCursor;
        static EW_RESIZE: MouseCursor;
        static NS_RESIZE: MouseCursor;
        static NESW_RESIZE: MouseCursor;
        static NWSE_RESIZE: MouseCursor;
        static ZOOM_IN: MouseCursor;
        static ZOOM_OUT: MouseCursor;
        static GRAB: MouseCursor;
        static GRABBING: MouseCursor;
    }
    class MouseController {
        private _target;
        private _eventTarget;
        private _boundOnMouseDown;
        private _boundOnMouseUp;
        private _boundOnMouseOver;
        private _boundOnMouseOut;
        private _boundOnMouseMove;
        private _boundOnMouseWheel;
        private _boundOnDrag;
        private _dragInfo;
        private _hoverInfo;
        private _wheelDisabled;
        private static HOVER_TIMEOUT;
        private static _cursor;
        private static _cursorOwner;
        constructor(target: MouseControllerTarget, eventTarget: EventTarget);
        destroy(): void;
        updateCursor(cursor: MouseCursor): void;
        private _onMouseDown(event);
        private _onDrag(event);
        private _onMouseUp(event);
        private _onMouseOver(event);
        private _onMouseOut(event);
        private _onMouseMove(event);
        private _onMouseWheel(event);
        private _startHoverCheck(event);
        private _killHoverCheck();
        private _onMouseMoveIdleHandler();
        private _getTargetMousePos(event, target);
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
declare module Shumway.Tools.Profiler {
    enum FlameChartDragTarget {
        NONE = 0,
        WINDOW = 1,
        HANDLE_LEFT = 2,
        HANDLE_RIGHT = 3,
        HANDLE_BOTH = 4,
    }
    interface FlameChartDragInfo {
        windowStartInitial: number;
        windowEndInitial: number;
        target: FlameChartDragTarget;
    }
    class FlameChartBase implements MouseControllerTarget {
        _controller: Controller;
        _mouseController: MouseController;
        _canvas: HTMLCanvasElement;
        _context: CanvasRenderingContext2D;
        _width: number;
        _height: number;
        _windowStart: number;
        _windowEnd: number;
        _rangeStart: number;
        _rangeEnd: number;
        _initialized: boolean;
        _dragInfo: FlameChartDragInfo;
        static DRAGHANDLE_WIDTH: number;
        static MIN_WINDOW_LEN: number;
        constructor(controller: Controller);
        canvas: HTMLCanvasElement;
        setSize(width: number, height?: number): void;
        initialize(rangeStart: number, rangeEnd: number): void;
        setWindow(start: number, end: number, draw?: boolean): void;
        setRange(start: number, end: number, draw?: boolean): void;
        destroy(): void;
        _resetCanvas(): void;
        draw(): void;
        _almostEq(a: number, b: number, precision?: number): boolean;
        _windowEqRange(): boolean;
        _decimalPlaces(value: number): number;
        _toPixelsRelative(time: number): number;
        _toPixels(time: number): number;
        _toTimeRelative(px: number): number;
        _toTime(px: number): number;
        onMouseWheel(x: number, y: number, delta: number): void;
        onMouseDown(x: number, y: number): void;
        onMouseMove(x: number, y: number): void;
        onMouseOver(x: number, y: number): void;
        onMouseOut(): void;
        onDrag(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        onDragEnd(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        onClick(x: number, y: number): void;
        onHoverStart(x: number, y: number): void;
        onHoverEnd(): void;
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
declare module Shumway.Tools.Profiler {
    class FlameChart extends FlameChartBase implements MouseControllerTarget {
        private _snapshot;
        private _kindStyle;
        private _textWidth;
        private _maxDepth;
        private _hoveredFrame;
        /**
         * Don't paint frames whose width is smaller than this value. This helps a lot when drawing
         * large ranges. This can be < 1 since anti-aliasing can look quite nice.
         */
        private _minFrameWidthInPixels;
        constructor(controller: Controller, snapshot: TimelineBufferSnapshot);
        setSize(width: number, height?: number): void;
        initialize(rangeStart: number, rangeEnd: number): void;
        destroy(): void;
        draw(): void;
        private _drawChildren(parent, depth?);
        private _drawFrame(frame, depth);
        private _prepareText(context, title, maxSize);
        private _measureWidth(context, text);
        _toPixelsRelative(time: number): number;
        _toPixels(time: number): number;
        _toTimeRelative(px: number): number;
        _toTime(px: number): number;
        private _getFrameAtPosition(x, y);
        onMouseDown(x: number, y: number): void;
        onMouseMove(x: number, y: number): void;
        onMouseOver(x: number, y: number): void;
        onMouseOut(): void;
        onDrag(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        onDragEnd(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        onClick(x: number, y: number): void;
        onHoverStart(x: number, y: number): void;
        onHoverEnd(): void;
        getStatistics(kind: TimelineItemKind): TimelineFrameStatistics;
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
declare module Shumway.Tools.Profiler {
    enum FlameChartOverviewMode {
        OVERLAY = 0,
        STACK = 1,
        UNION = 2,
    }
    class FlameChartOverview extends FlameChartBase implements MouseControllerTarget {
        private _overviewCanvasDirty;
        private _overviewCanvas;
        private _overviewContext;
        private _selection;
        private _mode;
        constructor(controller: Controller, mode?: FlameChartOverviewMode);
        setSize(width: number, height?: number): void;
        mode: FlameChartOverviewMode;
        _resetCanvas(): void;
        draw(): void;
        private _drawSelection();
        private _drawChart();
        _toPixelsRelative(time: number): number;
        _toPixels(time: number): number;
        _toTimeRelative(px: number): number;
        _toTime(px: number): number;
        private _getDragTargetUnderCursor(x, y);
        onMouseDown(x: number, y: number): void;
        onMouseMove(x: number, y: number): void;
        onMouseOver(x: number, y: number): void;
        onMouseOut(): void;
        onDrag(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        onDragEnd(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        onClick(x: number, y: number): void;
        onHoverStart(x: number, y: number): void;
        onHoverEnd(): void;
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
declare module Shumway.Tools.Profiler {
    enum FlameChartHeaderType {
        OVERVIEW = 0,
        CHART = 1,
    }
    class FlameChartHeader extends FlameChartBase implements MouseControllerTarget {
        private _type;
        private static TICK_MAX_WIDTH;
        constructor(controller: Controller, type: FlameChartHeaderType);
        draw(): void;
        private _drawLabels(rangeStart, rangeEnd);
        private _calculateTickInterval(rangeStart, rangeEnd);
        private _drawDragHandle(pos);
        private _drawRoundedRect(context, x, y, width, height, radius, stroke?, fill?);
        _toPixelsRelative(time: number): number;
        _toPixels(time: number): number;
        _toTimeRelative(px: number): number;
        _toTime(px: number): number;
        private _getDragTargetUnderCursor(x, y);
        onMouseDown(x: number, y: number): void;
        onMouseMove(x: number, y: number): void;
        onMouseOver(x: number, y: number): void;
        onMouseOut(): void;
        onDrag(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        onDragEnd(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        onClick(x: number, y: number): void;
        onHoverStart(x: number, y: number): void;
        onHoverEnd(): void;
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
declare module Shumway.Tools.Profiler.TraceLogger {
    class TraceLoggerProgressInfo {
        pageLoaded: boolean;
        threadsTotal: number;
        threadsLoaded: number;
        threadFilesTotal: number;
        threadFilesLoaded: number;
        constructor(pageLoaded: boolean, threadsTotal: number, threadsLoaded: number, threadFilesTotal: number, threadFilesLoaded: number);
        toString(): string;
    }
    class TraceLogger {
        private _baseUrl;
        private _threads;
        private _pageLoadCallback;
        private _pageLoadProgressCallback;
        private _progressInfo;
        constructor(baseUrl: string);
        loadPage(url: string, callback: (err: any, result: any[]) => void, progress?: (info: TraceLoggerProgressInfo) => void): void;
        buffers: TimelineBuffer[];
        private _onProgress();
        private _onLoadPage(result);
        private _loadData(urls, callback, progress?);
        private static colors;
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
declare module Shumway.Tools.Profiler.TraceLogger {
    interface TreeItem {
        start: number;
        stop: number;
        textId: number;
        nextId: number;
        hasChildren: boolean;
    }
    class Thread {
        private _data;
        private _text;
        private _buffer;
        private static ITEM_SIZE;
        constructor(data: any[]);
        buffer: TimelineBuffer;
        private _walkTree(id);
    }
}
interface MouseWheelEvent extends MouseEvent {
    deltaX: number;
    deltaY: number;
    deltaZ: number;
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
declare module Shumway.Tools.Terminal {
    class Buffer {
        lines: string[];
        format: any[];
        time: number[];
        repeat: number[];
        length: number;
        constructor();
        append(line: any, color: any): void;
        get(i: any): string;
        getFormat(i: any): any;
        getTime(i: any): number;
        getRepeat(i: any): number;
    }
    /**
     * If you're going to write a lot of data to the browser console you're gonna have a bad time. This may make your
     * life a little more pleasant.
     */
    class Terminal {
        lineColor: string;
        alternateLineColor: string;
        textColor: string;
        selectionColor: string;
        selectionTextColor: string;
        ratio: number;
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
        fontSize: number;
        lineIndex: number;
        pageIndex: number;
        columnIndex: number;
        selection: any;
        lineHeight: number;
        hasFocus: boolean;
        pageLineCount: number;
        refreshFrequency: number;
        textMarginLeft: number;
        textMarginBottom: number;
        buffer: Buffer;
        showLineNumbers: boolean;
        showLineTime: boolean;
        showLineCounter: boolean;
        constructor(canvas: HTMLCanvasElement);
        resize(): void;
        private _resizeHandler();
        gotoLine(index: any): void;
        scrollIntoView(): void;
        scroll(delta: any): void;
        paint(): void;
        refreshEvery(ms: any): void;
        isScrolledToBottom(): boolean;
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
declare module Shumway.Tools.Mini {
    class FPS {
        private _container;
        private _canvas;
        private _context;
        private _ratio;
        private _index;
        private _lastTime;
        private _lastWeightedTime;
        private _gradient;
        constructor(container: HTMLDivElement);
        private _listenForContainerSizeChanges();
        private _onContainerSizeChanged();
        private _containerWidth;
        private _containerHeight;
        tickAndRender(idle?: boolean, renderTime?: number): void;
    }
}
