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
module Shumway.Tools.Profiler {

  import clamp = NumberUtilities.clamp;

  interface Point {
    x: number;
    y: number;
  }

  interface DragInfo {
    start: Point;
    current: Point;
    delta: Point;
    hasMoved: boolean;
    originalTarget: HTMLElement;
  }

  interface HoverInfo {
    pos: Point;
    isHovering: boolean;
    timeoutHandle: number;
  }

  export interface MouseControllerTarget {
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

  export class MouseCursor {
    constructor(public value:string) {
    }
    toString() {
      return this.value;
    }
    static AUTO        = new MouseCursor("auto");
    static DEFAULT     = new MouseCursor("default");
    static NONE        = new MouseCursor("none");
    static HELP        = new MouseCursor("help");
    static POINTER     = new MouseCursor("pointer");
    static PROGRESS    = new MouseCursor("progress");
    static WAIT        = new MouseCursor("wait");
    static CELL        = new MouseCursor("cell");
    static CROSSHAIR   = new MouseCursor("crosshair");
    static TEXT        = new MouseCursor("text");
    static ALIAS       = new MouseCursor("alias");
    static COPY        = new MouseCursor("copy");
    static MOVE        = new MouseCursor("move");
    static NO_DROP     = new MouseCursor("no-drop");
    static NOT_ALLOWED = new MouseCursor("not-allowed");
    static ALL_SCROLL  = new MouseCursor("all-scroll");
    static COL_RESIZE  = new MouseCursor("col-resize");
    static ROW_RESIZE  = new MouseCursor("row-resize");
    static N_RESIZE    = new MouseCursor("n-resize");
    static E_RESIZE    = new MouseCursor("e-resize");
    static S_RESIZE    = new MouseCursor("s-resize");
    static W_RESIZE    = new MouseCursor("w-resize");
    static NE_RESIZE   = new MouseCursor("ne-resize");
    static NW_RESIZE   = new MouseCursor("nw-resize");
    static SE_RESIZE   = new MouseCursor("se-resize");
    static SW_RESIZE   = new MouseCursor("sw-resize");
    static EW_RESIZE   = new MouseCursor("ew-resize");
    static NS_RESIZE   = new MouseCursor("ns-resize");
    static NESW_RESIZE = new MouseCursor("nesw-resize");
    static NWSE_RESIZE = new MouseCursor("nwse-resize");
    static ZOOM_IN     = new MouseCursor("zoom-in");
    static ZOOM_OUT    = new MouseCursor("zoom-out");
    static GRAB        = new MouseCursor("grab");
    static GRABBING    = new MouseCursor("grabbing");
  }

  export class MouseController {

    private _target: MouseControllerTarget;
    private _eventTarget: EventTarget;

    private _boundOnMouseDown:EventListener;
    private _boundOnMouseUp:EventListener;
    private _boundOnMouseOver:EventListener;
    private _boundOnMouseOut:EventListener;
    private _boundOnMouseMove:EventListener;
    private _boundOnMouseWheel:EventListener;
    private _boundOnDrag:EventListener;
    private _dragInfo: DragInfo;
    private _hoverInfo: HoverInfo;
    private _wheelDisabled: boolean;

    private static HOVER_TIMEOUT = 500;

    private static _cursor = MouseCursor.DEFAULT;
    private static _cursorOwner: MouseControllerTarget;

    constructor(target: MouseControllerTarget, eventTarget: EventTarget) {
      this._target = target;
      this._eventTarget = eventTarget;
      this._wheelDisabled = false;
      this._boundOnMouseDown = this._onMouseDown.bind(this);
      this._boundOnMouseUp = this._onMouseUp.bind(this);
      this._boundOnMouseOver = this._onMouseOver.bind(this);
      this._boundOnMouseOut = this._onMouseOut.bind(this);
      this._boundOnMouseMove = this._onMouseMove.bind(this);
      this._boundOnMouseWheel = this._onMouseWheel.bind(this);
      this._boundOnDrag = this._onDrag.bind(this);
      eventTarget.addEventListener("mousedown", this._boundOnMouseDown, false);
      eventTarget.addEventListener("mouseover", this._boundOnMouseOver, false);
      eventTarget.addEventListener("mouseout", this._boundOnMouseOut, false);
      eventTarget.addEventListener(("onwheel" in document ? "wheel" : "mousewheel"), this._boundOnMouseWheel, false);
    }

    destroy() {
      var eventTarget = this._eventTarget;
      eventTarget.removeEventListener("mousedown", this._boundOnMouseDown);
      eventTarget.removeEventListener("mouseover", this._boundOnMouseOver);
      eventTarget.removeEventListener("mouseout", this._boundOnMouseOut);
      eventTarget.removeEventListener(("onwheel" in document ? "wheel" : "mousewheel"), this._boundOnMouseWheel);
      window.removeEventListener("mousemove", this._boundOnDrag);
      window.removeEventListener("mouseup", this._boundOnMouseUp);
      this._killHoverCheck();
      this._eventTarget = null;
      this._target = null;
    }

    updateCursor(cursor: MouseCursor) {
      if (!MouseController._cursorOwner || MouseController._cursorOwner === this._target) {
        var el: HTMLElement = <HTMLElement>(<any>this._eventTarget).parentElement;
        if (MouseController._cursor !== cursor) {
          MouseController._cursor = cursor;
          var self = this;
          ["", "-moz-", "-webkit-"].forEach(function (prefix) {
            el.style.cursor = prefix + cursor;
          });
        }
        if (MouseController._cursor === MouseCursor.DEFAULT) {
          MouseController._cursorOwner = null;
        } else {
          MouseController._cursorOwner = this._target;
        }
      }
    }

    private _onMouseDown(event: MouseEvent) {
      this._killHoverCheck();
      if (event.button === 0) {
        var pos = this._getTargetMousePos(event, <HTMLElement>(event.target));
        this._dragInfo = <DragInfo>{
          start: pos,
          current: pos,
          delta: { x: 0, y: 0 },
          hasMoved: false,
          originalTarget: event.target
        };
        window.addEventListener("mousemove", this._boundOnDrag, false);
        window.addEventListener("mouseup", this._boundOnMouseUp, false);
        this._target.onMouseDown(pos.x, pos.y);
      }
    }

    private _onDrag(event: MouseEvent) {
      var dragInfo = this._dragInfo;
      var current = this._getTargetMousePos(event, dragInfo.originalTarget);
      var delta:Point = {
        x: current.x - dragInfo.start.x,
        y: current.y - dragInfo.start.y
      };
      dragInfo.current = current;
      dragInfo.delta = delta;
      dragInfo.hasMoved = true;
      this._target.onDrag(dragInfo.start.x, dragInfo.start.y, current.x, current.y, delta.x, delta.y);
    }

    private _onMouseUp(event: MouseEvent) {
      window.removeEventListener("mousemove", this._boundOnDrag);
      window.removeEventListener("mouseup", this._boundOnMouseUp);
      var self = this;
      var dragInfo = this._dragInfo;
      if (dragInfo.hasMoved) {
        this._target.onDragEnd(dragInfo.start.x, dragInfo.start.y, dragInfo.current.x, dragInfo.current.y, dragInfo.delta.x, dragInfo.delta.y);
      } else {
        this._target.onClick(dragInfo.current.x, dragInfo.current.y);
      }
      this._dragInfo = null;
      this._wheelDisabled = true;
      setTimeout(function() { self._wheelDisabled = false; }, 500);
    }

    private _onMouseOver(event: MouseEvent) {
      event.target.addEventListener("mousemove", this._boundOnMouseMove, false);
      if (!this._dragInfo) {
        var pos = this._getTargetMousePos(event, <HTMLElement>(event.target));
        this._target.onMouseOver(pos.x, pos.y);
        this._startHoverCheck(event);
      }
    }

    private _onMouseOut(event: MouseEvent) {
      event.target.removeEventListener("mousemove", this._boundOnMouseMove, false);
      if (!this._dragInfo) {
        this._target.onMouseOut();
      }
      this._killHoverCheck();
    }

    private _onMouseMove(event: MouseEvent) {
      if (!this._dragInfo) {
        var pos = this._getTargetMousePos(event, <HTMLElement>(event.target));
        this._target.onMouseMove(pos.x, pos.y);
        this._killHoverCheck();
        this._startHoverCheck(event);
      }
    }

    private _onMouseWheel(event: MouseWheelEvent) {
      if (!event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        if (!this._dragInfo && !this._wheelDisabled) {
          var pos = this._getTargetMousePos(event, <HTMLElement>(event.target));
          var delta = clamp((typeof event.deltaY !== "undefined") ? event.deltaY / 16 : -event.wheelDelta / 40, -1, 1);
          var zoom = Math.pow(1.2, delta) - 1;
          this._target.onMouseWheel(pos.x, pos.y, zoom);
        }
      }
    }

    private _startHoverCheck(event: MouseEvent) {
      this._hoverInfo = {
        isHovering: false,
        timeoutHandle: setTimeout(this._onMouseMoveIdleHandler.bind(this), MouseController.HOVER_TIMEOUT),
        pos: this._getTargetMousePos(event, <HTMLElement>(event.target))
      };
    }

    private _killHoverCheck() {
      if (this._hoverInfo) {
        clearTimeout(this._hoverInfo.timeoutHandle);
        if (this._hoverInfo.isHovering) {
          this._target.onHoverEnd();
        }
        this._hoverInfo = null;
      }
    }

    private _onMouseMoveIdleHandler() {
      var hoverInfo = this._hoverInfo;
      hoverInfo.isHovering = true;
      this._target.onHoverStart(hoverInfo.pos.x, hoverInfo.pos.y);
    }

    private _getTargetMousePos(event: MouseEvent, target: HTMLElement): Point {
      var rect = target.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }

  }
}
