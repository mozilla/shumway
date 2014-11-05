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
  import Point = Geometry.Point;
  import Matrix = Geometry.Matrix;
  import Rectangle = Geometry.Rectangle;

  import Canvas2DStageRenderer = Shumway.GFX.Canvas2D.Canvas2DStageRenderer;
  import WebGLStageRenderer = Shumway.GFX.WebGL.WebGLStageRenderer;
  import WebGLStageRendererOptions = Shumway.GFX.WebGL.WebGLStageRendererOptions;
  import WebGLContext = Shumway.GFX.WebGL.WebGLContext;
  import FPS = Shumway.Tools.Mini.FPS;

  import DisplayParameters = Shumway.Remoting.DisplayParameters;

  declare var GUI;

  export interface IState {
    onMouseUp(easel: Easel, event: MouseEvent);
    onMouseDown(easel: Easel, event: MouseEvent);
    onMouseMove(easel: Easel, event: MouseEvent);
    onMouseClick(easel: Easel, event: MouseEvent);

    onKeyUp(easel: Easel, event: KeyboardEvent);
    onKeyDown(easel: Easel, event: KeyboardEvent);
    onKeyPress(easel: Easel, event: KeyboardEvent);
  }

  export class UIState implements IState {

    onMouseUp(easel: Easel, event: MouseEvent) {
      easel.state = this;
    }

    onMouseDown(easel: Easel, event: MouseEvent) {
      easel.state = this;
    }

    onMouseMove(easel: Easel, event: MouseEvent) {
      easel.state = this;
    }

    onMouseWheel(easel: Easel, event: any) {
      easel.state = this;
    }

    onMouseClick(easel: Easel, event: MouseEvent) {
      easel.state = this;
    }

    onKeyUp(easel: Easel, event: KeyboardEvent) {
      easel.state = this;
    }

    onKeyDown(easel: Easel, event: KeyboardEvent) {
      easel.state = this;
    }

    onKeyPress(easel: Easel, event: KeyboardEvent) {
      easel.state = this;
    }
  }

  class StartState extends UIState {
    private _keyCodes: boolean [] = [];
    onMouseDown(easel: Easel, event: MouseEvent) {
      if (event.altKey) {
        easel.state = new DragState(easel.worldView, easel.getMousePosition(event, null), easel.worldView.getTransform().getMatrix(true));
      } else {
//        easel.state = new MouseDownState();
      }
    }

    onMouseClick(easel: Easel, event: MouseEvent) {

    }

    onKeyDown(easel: Easel, event: KeyboardEvent) {
      this._keyCodes[event.keyCode] = true;
    }

    onKeyUp(easel: Easel, event: KeyboardEvent) {
      this._keyCodes[event.keyCode] = false;
    }
  }

  function normalizeWheelSpeed(event: any): number {
    var normalized;
    if (event.wheelDelta) {
      normalized = (event.wheelDelta % 120 - 0) == -0 ? event.wheelDelta / 120 : event.wheelDelta / 12;
    } else {
      var rawAmmount = event.deltaY ? event.deltaY : event.detail;
      normalized = -(rawAmmount % 3 ? rawAmmount * 10 : rawAmmount / 3);
    }
    return normalized;
  }

  class PersistentState extends UIState {
    private _keyCodes: boolean [] = [];
    private _paused: boolean = false;
    private _mousePosition: Point = new Point(0, 0);

    onMouseMove(easel: Easel, event: MouseEvent) {
      this._mousePosition = easel.getMousePosition(event, null);
      this._update(easel);
    }

    onMouseDown(easel: Easel, event: MouseEvent) {

    }

    onMouseClick(easel: Easel, event: MouseEvent) {

    }

    onMouseWheel(easel: Easel, event: any) {
      var ticks = (event.type === 'DOMMouseScroll') ? -event.detail : event.wheelDelta / 40;
      if (event.altKey) {
        event.preventDefault();
        var p = easel.getMousePosition(event, null);
        var m = easel.worldView.getTransform().getMatrix(true);
        var s = 1 + ticks / 1000;
        m.translate(-p.x, -p.y);
        m.scale(s, s);
        m.translate(p.x, p.y);
        easel.worldView.getTransform().setMatrix(m);
      }
    }

    onKeyPress(easel: Easel, event: KeyboardEvent) {
      if (event.keyCode === 112 || event.key === 'p') { // P
        this._paused = !this._paused;
      }
      if (this._keyCodes[83]) {  // S
        easel.toggleOption("paintRenderable");
      }
      if (this._keyCodes[86]) {  // V
        easel.toggleOption("paintViewport");
      }
      if (this._keyCodes[66]) { // B
        easel.toggleOption("paintBounds");
      }
      if (this._keyCodes[68]) { // D
        easel.toggleOption("paintDirtyRegion");
      }
      if (this._keyCodes[70]) { // F
        easel.toggleOption("paintFlashing");
      }
      this._update(easel);
    }

    onKeyDown(easel: Easel, event: KeyboardEvent) {
      this._keyCodes[event.keyCode] = true;
      this._update(easel);
    }

    onKeyUp(easel: Easel, event: KeyboardEvent) {
      this._keyCodes[event.keyCode] = false;
      this._update(easel);
    }

    private _update(easel: Easel) {
      easel.paused = this._paused;
      if (easel.getOption("paintViewport")) {
        var w = viewportLoupeDiameter.value, h = viewportLoupeDiameter.value;
        easel.viewport = new Rectangle(this._mousePosition.x - w / 2, this._mousePosition.y - h / 2, w, h);
      } else {
        easel.viewport = null;
      }
    }
  }

  class MouseDownState extends UIState {
    private _startTime: number = Date.now();

    onMouseMove(easel: Easel, event: MouseEvent) {
      if (Date.now() - this._startTime < 10) {
        return;
      }
      var node = easel.queryNodeUnderMouse(event);
      if (node) {
        easel.state = new DragState(node, easel.getMousePosition(event, null), node.getTransform().getMatrix(true));
      }
    }

    onMouseUp(easel: Easel, event: MouseEvent) {
      easel.state = new StartState();
      easel.selectNodeUnderMouse(event);
    }
  }

  class DragState extends UIState {
    private _startMatrix: Matrix;
    private _startPosition: Point;
    private _target: Node;
    constructor(target: Node, startPosition: Point, startMatrix: Matrix) {
      super();
      this._target = target;
      this._startPosition = startPosition;
      this._startMatrix = startMatrix;
    }
    onMouseMove(easel: Easel, event: MouseEvent) {
      event.preventDefault();
      var p = easel.getMousePosition(event, null);
      p.sub(this._startPosition);
      this._target.getTransform().setMatrix(this._startMatrix.clone().translate(p.x, p.y));
      easel.state = this;
    }
    onMouseUp(easel: Easel, event: MouseEvent) {
      easel.state = new StartState();
    }
  }

  export class Easel {
    private _stage: Stage;
    private _world: Group;
    private _worldView: Group;

    private _options: StageRendererOptions [];
    private _canvases: HTMLCanvasElement [];
    private _renderers: StageRenderer [];
    private _disableHidpi: boolean;

    private _state: UIState = new StartState();
    private _persistentState: UIState = new PersistentState();

    public paused: boolean = false;
    public viewport: Rectangle = null;
    public transparent: boolean;

    private _selectedNodes: Node [] = [];

    private _deferredResizeHandlerTimeout: number;
    private _eventListeners: Shumway.Map<any []> = Shumway.ObjectUtilities.createEmptyObject();
    private _fpsCanvas: HTMLCanvasElement;
    private _fps: FPS;

    constructor(container: HTMLElement, backend: Backend,
                disableHidpi: boolean = false,
                bgcolor: number = undefined) {
      var stage = this._stage = new Stage(128, 128, true);
      this._worldView = new Group();
      this._world = new Group();
      this._stage.addChild(this._worldView);
      this._worldView.addChild(this._world);
      this._disableHidpi = disableHidpi;

      if (hud.value) {
        var fpsCanvasContainer = document.createElement("div");
        // fpsCanvasContainer.style.position = "relative";
        // fpsCanvasContainer.style.bottom = "0";
        // fpsCanvasContainer.style.width = "100%";
        fpsCanvasContainer.style.height = "16px";
        this._fpsCanvas = document.createElement("canvas");
        fpsCanvasContainer.appendChild(this._fpsCanvas);
        container.appendChild(fpsCanvasContainer);
        this._fps = new FPS(this._fpsCanvas);
      } else {
        this._fps = null;
      }

      window.addEventListener('resize', this._deferredResizeHandler.bind(this), false);

      var options = this._options = [];
      var canvases = this._canvases = [];
      var renderers = this._renderers = [];

      var transparent = bgcolor === 0;
      this.transparent = transparent;

      var cssBackgroundColor = bgcolor === undefined ? "#14171a" :
                               bgcolor === 0 ? 'transparent' :
                               Shumway.ColorUtilities.rgbaToCSSStyle(bgcolor);

      function addCanvas2DBackend() {
        var canvas = document.createElement("canvas");
        canvas.style.backgroundColor = cssBackgroundColor;
        container.appendChild(canvas);
        canvases.push(canvas);
        var o = new Canvas2D.Canvas2DStageRendererOptions();
        o.alpha = transparent;
        options.push(o);
        renderers.push(new Canvas2D.Canvas2DStageRenderer(canvas, stage, o));
      }

      function addWebGLBackend() {
        var canvas = document.createElement("canvas");
        canvas.style.backgroundColor = cssBackgroundColor;
        container.appendChild(canvas);
        canvases.push(canvas);
        var o = new WebGLStageRendererOptions();
        options.push(o);
        renderers.push(new WebGLStageRenderer(canvas, stage, o));
      }

      switch (backend) {
        case Backend.Canvas2D:
          addCanvas2DBackend();
          break;
        case Backend.WebGL:
          addWebGLBackend();
          break;
        case Backend.Both:
          addCanvas2DBackend();
          addWebGLBackend();
          break;
      }

      this._resizeHandler();
      this._onMouseUp = this._onMouseUp.bind(this)
      this._onMouseDown = this._onMouseDown.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);

      var self = this;

      window.addEventListener("mouseup", function (event) {
        self._state.onMouseUp(self, event);
        self._render();
      }, false);

      window.addEventListener("mousemove", function (event) {
        self._state.onMouseMove(self, event);
        self._persistentState.onMouseMove(self, event);
      }, false);

      function handleMouseWheel(event: any) {
        self._state.onMouseWheel(self, event);
        self._persistentState.onMouseWheel(self, event);
      }

      window.addEventListener('DOMMouseScroll', handleMouseWheel);
      window.addEventListener("mousewheel", handleMouseWheel);

      canvases.forEach(canvas => canvas.addEventListener("mousedown", function (event) {
        self._state.onMouseDown(self, event);
      }, false));

      window.addEventListener("keydown", function (event) {
        self._state.onKeyDown(self, event);
        self._persistentState.onKeyDown(self, event);
      }, false);

      window.addEventListener("keypress", function (event) {
        self._state.onKeyPress(self, event);
        self._persistentState.onKeyPress(self, event);
      }, false);

      window.addEventListener("keyup", function (event) {
        self._state.onKeyUp(self, event);
        self._persistentState.onKeyUp(self, event);
      }, false);

      this._enterRenderLoop();
    }

    /**
     * Primitive event dispatching features.
     */
    addEventListener(type: string, listener) {
      if (!this._eventListeners[type]) {
        this._eventListeners[type] = [];
      }
      this._eventListeners[type].push(listener);
    }

    private _dispatchEvent(type: string) {
      var listeners = this._eventListeners[type];
      if (!listeners) {
        return;
      }
      for (var i = 0; i < listeners.length; i++) {
        listeners[i]();
      }
    }

    private _enterRenderLoop() {
      var self = this;
      requestAnimationFrame(function tick() {
        self.render();
        requestAnimationFrame(tick);
      });
    }

    set state(state: UIState) {
      this._state = state;
    }

    set cursor(cursor: string) {
      this._canvases.forEach(x => x.style.cursor = cursor);
    }

    private _render() {
      RenderableVideo.checkForVideoUpdates();
      var mustRender = (this._stage.readyToRender() || forcePaint.value) && !this.paused;
      if (mustRender) {
        for (var i = 0; i < this._renderers.length; i++) {
          var renderer = this._renderers[i];
          if (this.viewport) {
            renderer.viewport = this.viewport;
          } else {
            renderer.viewport = new Rectangle(0, 0, this._canvases[i].width, this._canvases[i].height);
          }
          this._dispatchEvent("render");
          enterTimeline("Render");
          renderer.render();
          leaveTimeline("Render");
        }
      }
      if (this._fps) {
        this._fps.tickAndRender(!mustRender);
      }
    }

    public render() {
      this._render();
    }

    get world(): Group {
      return this._world;
    }

    get worldView(): Group {
      return this._worldView;
    }

    get stage(): Stage {
      return this._stage;
    }

    get options() {
      return this._options[0];
    }

    getDisplayParameters(): DisplayParameters {
      var firstCanvas = this._canvases[0];
      var ratio = this.getRatio();
      return {
        canvasWidth: firstCanvas.width / ratio,
        canvasHeight: firstCanvas.height / ratio,
        pixelRatio: ratio,
        screenWidth: window.screen ? window.screen.width : 640,
        screenHeight: window.screen ? window.screen.height : 480
      };
    }

    public toggleOption(name: string) {
      for (var i = 0; i < this._options.length; i++) {
        var option = this._options[i];
        option[name] = !option[name];
      }
    }

    public getOption(name: string) {
      return this._options[0][name];
    }

    private _deferredResizeHandler()  {
      clearTimeout(this._deferredResizeHandlerTimeout);
      this._deferredResizeHandlerTimeout = setTimeout(this._resizeHandler.bind(this), 30);
    }

    public getRatio(): number {
      var devicePixelRatio = window.devicePixelRatio || 1;
      var backingStoreRatio = 1;
      var ratio = 1;
      if (devicePixelRatio !== backingStoreRatio &&
        !this._disableHidpi) {
        ratio = devicePixelRatio / backingStoreRatio;
      }
      return ratio;
    }

    private _resizeHandler() {
      var ratio = this.getRatio();

      for (var i = 0; i < this._canvases.length; i++) {
        var canvas = this._canvases[i];
        var parent = canvas.parentElement;
        var cw = parent.clientWidth;
        var ch = (parent.clientHeight) / this._canvases.length;
        if (ratio !== 1) {
          canvas.width = Math.ceil(cw * ratio);
          canvas.height = Math.ceil(ch * ratio);
          canvas.style.width = cw + 'px';
          canvas.style.height = ch + 'px';
        } else {
          canvas.width = cw;
          canvas.height = ch;
        }
        this._stage.setBounds(new Rectangle(0, 0, canvas.width, canvas.height));
        this._renderers[i].resize();
      }
      this._worldView.getTransform().setMatrix(new Matrix(ratio, 0, 0, ratio, 0, 0));

      this._dispatchEvent('resize');
    }

    resize() {
      this._resizeHandler();
    }

    queryNodeUnderMouse(event: MouseEvent): Node {
      return this._world;
    }

    selectNodeUnderMouse(event: MouseEvent) {
      var frame = this.queryNodeUnderMouse(event);
      if (frame) {
        this._selectedNodes.push(frame);
      }
      this._render();
    }

    getMousePosition(event: MouseEvent, coordinateSpace: Node): Point {
      var canvas = this._canvases[0];
      var bRect = canvas.getBoundingClientRect();
      var x = (event.clientX - bRect.left) * (canvas.width / bRect.width);
      var y = (event.clientY - bRect.top) * (canvas.height / bRect.height);
      var p = new Point(x, y);
      if (!coordinateSpace) {
        return p;
      }
      var m = Matrix.createIdentity();
      coordinateSpace.getTransform().getConcatenatedMatrix().inverse(m);
      m.transformPoint(p);
      return p;
    }

    getMouseWorldPosition(event: MouseEvent): Point {
      return this.getMousePosition(event, this._world);
    }

    private _onMouseDown(event) {
      this._renderers.forEach(renderer => renderer.render());
    }

    private _onMouseUp(event) {

    }

    private _onMouseMove(event) {

    }
  }
}
