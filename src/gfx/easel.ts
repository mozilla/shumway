/// <eeference path='references.ts'/>
module Shumway.GFX {
  import Point = Geometry.Point;
  import Matrix = Geometry.Matrix;
  import Rectangle = Geometry.Rectangle;

  import Canvas2DStageRenderer = Shumway.GFX.Canvas2DStageRenderer;
  import WebGLStageRenderer = Shumway.GFX.GL.WebGLStageRenderer;
  import WebGLStageRendererOptions = Shumway.GFX.GL.WebGLStageRendererOptions;
  import WebGLContext = Shumway.GFX.GL.WebGLContext;
  import FPS = Shumway.Tools.Mini.FPS;

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

  export class State implements IState {

    onMouseUp(easel: Easel, event: MouseEvent) {
      easel.state = this;
    }

    onMouseDown(easel: Easel, event: MouseEvent) {
      easel.state = this;
    }

    onMouseMove(easel: Easel, event: MouseEvent) {
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

  class StartState extends State {
    private _keyCodes: boolean [] = [];
    onMouseDown(easel: Easel, event: MouseEvent) {
      if (this._keyCodes[32]) {
        easel.state = new DragState(easel.worldView, easel.getMousePosition(event, null), easel.worldView.matrix.clone());
      } else {
        easel.state = new MouseDownState();
      }
    }

    onMouseClick(easel: Easel, event: MouseEvent) {

    }

    onKeyDown(easel: Easel, event: KeyboardEvent) {
      this._keyCodes[event.keyCode] = true;
      this._updateCursor(easel);
    }

    onKeyUp(easel: Easel, event: KeyboardEvent) {
      this._keyCodes[event.keyCode] = false;
      this._updateCursor(easel);
    }

    private _updateCursor(easel: Easel) {
      if (this._keyCodes[32]) {
        easel._canvas.style.cursor = "move";
      } else {
        easel._canvas.style.cursor = "auto";
      }
    }
  }

  class PersistentState extends State {
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

    onKeyPress(easel: Easel, event: KeyboardEvent) {
      if (event.keyCode === 112) { // P
        this._paused = !this._paused;
      }
      if (this._keyCodes[86]) {  // V
        easel.options.paintViewport = !easel.options.paintViewport;
      }
      if (this._keyCodes[66]) { // B
        easel.options.paintBounds = !easel.options.paintBounds;
      }
      if (this._keyCodes[70]) { // F
        easel.options.paintFlashing = !easel.options.paintFlashing;
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
      if (easel.options.paintViewport) {
        var w = viewportLoupeDiameter.value, h = viewportLoupeDiameter.value;
        easel.viewport = new Rectangle(this._mousePosition.x - w / 2, this._mousePosition.y - h / 2, w, h);
      } else {
        easel.viewport = null;
      }
    }
  }

  class MouseDownState extends State {
    private _startTime: number = Date.now();

    onMouseMove(easel: Easel, event: MouseEvent) {
      if (Date.now() - this._startTime < 10) {
        return;
      }
      var frame = easel.queryFrameUnderMouse(event);
      if (frame && frame.hasCapability(FrameCapabilityFlags.AllowMatrixWrite)) {
        easel.state = new DragState(frame, easel.getMousePosition(event, null), frame.matrix.clone());
      }
    }

    onMouseUp(easel: Easel, event: MouseEvent) {
      easel.state = new StartState();
      easel.selectFrameUnderMouse(event);
    }
  }

  class DragState extends State {
    private _startMatrix: Matrix;
    private _startPosition: Point;
    private _target: Frame;
    constructor(target: Frame, startPosition: Point, startMatrix: Matrix) {
      super();
      this._target = target;
      this._startPosition = startPosition;
      this._startMatrix = startMatrix;
    }
    onMouseMove(easel: Easel, event: MouseEvent) {
      event.preventDefault();
      var p = easel.getMousePosition(event, null);
      p.sub(this._startPosition);
      this._target.matrix = this._startMatrix.clone().translate(p.x, p.y);
      easel.state = this;
    }
    onMouseUp(easel: Easel, event: MouseEvent) {
      easel.state = new StartState();
    }
  }

  export class Easel {
    private _stage: Stage;
    private _world: FrameContainer;
    private _worldView: FrameContainer;
    private _worldViewOverlay: FrameContainer;
    _canvas: HTMLCanvasElement;
    private _renderer: StageRenderer;
    private _options: StageRendererOptions = new WebGLStageRendererOptions();
    private _state: State = new StartState();
    private _persistentState: State = new PersistentState();

    public paused: boolean = false;
    public viewport: Rectangle = null;

    private _selection: FrameContainer;
    private _selectedFrames: Frame [] = [];

    private _deferredResizeHandlerTimeout: number;
    private _eventListeners: Shumway.Map<any []> = Shumway.ObjectUtilities.createEmptyObject();
    private _fpsCanvas: HTMLCanvasElement;
    private _fps: FPS;

    constructor(canvas: HTMLCanvasElement, backend: Backend) {
      this._stage = new Stage(canvas.width, canvas.height, true);
      this._worldView = new FrameContainer();
      this._worldViewOverlay = new FrameContainer();
      this._world = new FrameContainer();
      this._stage.addChild(this._worldView);
      this._worldView.addChild(this._world);
      this._worldView.addChild(this._worldViewOverlay);
      var screenOverlay = new FrameContainer();

      this._canvas = canvas;

      var fpsCanvasContainer = document.createElement("div");
      fpsCanvasContainer.style.position = "absolute";
      fpsCanvasContainer.style.top = "0";
      fpsCanvasContainer.style.width = "100%";
      fpsCanvasContainer.style.height = "20px";
      this._fpsCanvas = document.createElement("canvas");
      fpsCanvasContainer.appendChild(this._fpsCanvas);
      this._canvas.parentElement.appendChild(fpsCanvasContainer);
      this._fps = new FPS(this._fpsCanvas);
      this._selection = <FrameContainer>screenOverlay.addChild(new FrameContainer());
      this._selection._setFlags(FrameFlags.IgnoreQuery);

      window.addEventListener('resize', this._deferredResizeHandler.bind(this), false);

      this._resizeHandler();
      switch (backend) {
        case Backend.Canvas2D:
          this._options = new Canvas2DStageRendererOptions();
          this._renderer = new Canvas2DStageRenderer(canvas, this._stage, <any>this._options);
          break;
        case Backend.WebGL:
          this._options = new WebGLStageRendererOptions();
          this._renderer = new WebGLStageRenderer(canvas, this._stage, <any>this._options);
          break;
      }

      this._onMouseUp = this._onMouseUp.bind(this)
      this._onMouseDown = this._onMouseDown.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);

      var self = this;

      window.addEventListener("mouseup", function (event) {
        self._state.onMouseUp(self, event);
        self._render();
      }, false);

      window.addEventListener("mousemove", function (event) {
        var p = self.getMousePosition(event, self._world);
        self._state.onMouseMove(self, event);
        self._persistentState.onMouseMove(self, event);
      }, false);

      canvas.addEventListener("mousedown", function (event) {
        self._state.onMouseDown(self, event);
      }, false);

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
    set state(state: State) {
      this._state = state;
    }

    private _render() {
      if (this.paused) {
        return;
      }
      if (this.viewport) {
        this._renderer.viewport = this.viewport;
      } else {
        this._renderer.viewport = new Rectangle(0, 0, this._canvas.width, this._canvas.height);
      }
      var rendering = this._renderer._readyToRender(false);
      if (rendering) {
        this._dispatchEvent("render");
      }
      enterTimeline("Render");
      this._renderer.render();
      leaveTimeline("Render");
      if (rendering) {
        this._fps.tickAndRender();
      }
    }

    public render() {
      this._render();
    }

    get world(): FrameContainer {
      return this._world;
    }

    get worldView(): FrameContainer {
      return this._worldView;
    }

    get worldOverlay(): FrameContainer {
      return this._worldViewOverlay;
    }

    get stage(): Stage {
      return this._stage;
    }

    get options(): StageRendererOptions {
      return this._options;
    }

    private _deferredResizeHandler() {
      clearTimeout(this._deferredResizeHandlerTimeout);
      this._deferredResizeHandlerTimeout = setTimeout(this._resizeHandler.bind(this), 1000);
    }

    private _resizeHandler() {
      var parent = this._canvas.parentElement;
      var cw = parent.clientWidth;
      var ch = parent.clientHeight - 1;

      var devicePixelRatio = window.devicePixelRatio || 1;
      var backingStoreRatio = 1;
      if (devicePixelRatio !== backingStoreRatio) {
        var ratio = devicePixelRatio / backingStoreRatio;
        this._canvas.width = cw * ratio;
        this._canvas.height = ch * ratio;
        this._canvas.style.width = cw + 'px';
        this._canvas.style.height = ch + 'px';
        this._stage.matrix.set(new Matrix(ratio, 0, 0, ratio, 0, 0));
      } else {
        this._canvas.width = cw;
        this._canvas.height = ch;
      }
      this._stage.w = this._canvas.width;
      this._stage.h = this._canvas.height;
    }

    resize() {
      this._resizeHandler();
    }

    queryFrameUnderMouse(event: MouseEvent) {
      var frames = this.stage.queryFramesByPoint(this.getMousePosition(event, null), true, true);
      return frames.length > 0 ? frames[0] : null;
    }

    selectFrameUnderMouse(event: MouseEvent) {
      this._selection.clearChildren();
      var frame = this.queryFrameUnderMouse(event);
      if (frame && frame.hasCapability(FrameCapabilityFlags.AllowMatrixWrite)) {
        this._selectedFrames.push(frame);
        this._selection.matrix = frame.getConcatenatedMatrix();
      } else {
        this._selectedFrames = [];
      }
      this._render();
    }

    getMousePosition(event: MouseEvent, coordinateSpace: Frame): Point {
      var canvas = this._canvas;
      var bRect = canvas.getBoundingClientRect();
      var x = (event.clientX - bRect.left) * (canvas.width / bRect.width);
      var y = (event.clientY - bRect.top) * (canvas.height / bRect.height);
      var p = new Point(x, y);
      if (!coordinateSpace) {
        return p;
      }
      var m = Matrix.createIdentity();
      coordinateSpace.getConcatenatedMatrix().inverse(m);
      m.transformPoint(p);
      return p;
    }

    getMouseWorldPosition(event: MouseEvent): Point {
      return this.getMousePosition(event, this._world);
    }

    private _onMouseDown(event) {
      this._renderer.render();
    }

    private _onMouseUp(event) {

    }

    private _onMouseMove(event) {

    }
  }
}
