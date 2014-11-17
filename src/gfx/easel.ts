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
  import assert = Shumway.Debug.assert;
  import Point = Geometry.Point;
  import Matrix = Geometry.Matrix;
  import Rectangle = Geometry.Rectangle;

  import Canvas2DRenderer = Shumway.GFX.Canvas2D.Canvas2DRenderer;
  import WebGLRenderer = Shumway.GFX.WebGL.WebGLRenderer;
  import WebGLRendererOptions = Shumway.GFX.WebGL.WebGLRendererOptions;
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

    /**
     * Root stage node.
     */
    private _stage: Stage;

    /**
     * Node that holds the view transformation. This us used for zooming and panning in the easel.
     */
    private _worldView: Group;

    /**
     * Node that holds the rest of the content in the display tree.
     */
    private _world: Group;

    private _options: Canvas2D.Canvas2DRendererOptions;

    /**
     * Container div element that is managed by this easel. If the dimensions of this element change, then the dimensions of the root
     * stage also change.
     */
    private _container: HTMLDivElement;

    private _renderer: Renderer;

    private _disableHiDPI: boolean;
    private _state: UIState = new StartState();
    private _persistentState: UIState = new PersistentState();

    public paused: boolean = false;
    public viewport: Rectangle = null;
    public transparent: boolean;

    private _selectedNodes: Node [] = [];

    private _eventListeners: Shumway.Map<any []> = Shumway.ObjectUtilities.createEmptyObject();
    private _fps: FPS;
    private _fullScreen: boolean = false;

    constructor(
      container: HTMLDivElement,
      disableHiDPI: boolean = false,
      backgroundColor: number = undefined
    ) {
      release || assert(container && container.children.length === 0,
                        "Easel container must be empty.");
      this._container = container;
      this._stage = new Stage(512, 512, true);
      this._worldView = this._stage.content;
      this._world = new Group();
      this._worldView.addChild(this._world);
      this._disableHiDPI = disableHiDPI;

      // Create stage container.
      var stageContainer = document.createElement("div");
      stageContainer.style.position = "absolute";
      stageContainer.style.width = "100%";
      stageContainer.style.height = "100%";
      container.appendChild(stageContainer);

      // Create hud container, that lives on top of the stage.
      if (hud.value) {
        var hudContainer = document.createElement("div");
        hudContainer.style.position = "absolute";
        hudContainer.style.width = "100%";
        hudContainer.style.height = "100%";
        hudContainer.style.pointerEvents = "none";
        hudContainer.style.opacity = "0.7";
        var fpsContainer = document.createElement("div");
        fpsContainer.style.position = "absolute";
        fpsContainer.style.width = "100%";
        fpsContainer.style.height = "20px";
        fpsContainer.style.pointerEvents = "none";
        hudContainer.appendChild(fpsContainer);
        container.appendChild(hudContainer);
        this._fps = new FPS(fpsContainer);
      } else {
        this._fps = null;
      }

      var transparent = backgroundColor === 0;
      this.transparent = transparent;

      var cssBackgroundColor = backgroundColor === undefined ? "#14171a" :
                               backgroundColor === 0 ? 'transparent' :
                               Shumway.ColorUtilities.rgbaToCSSStyle(backgroundColor);

      this._options = new Canvas2D.Canvas2DRendererOptions();
      this._options.alpha = transparent;

      this._renderer = new Canvas2D.Canvas2DRenderer(stageContainer, this._stage, this._options);
      this._listenForContainerSizeChanges();
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

      container.addEventListener("mousedown", function (event) {
        self._state.onMouseDown(self, event);
      });

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

    private _listenForContainerSizeChanges() {
      var pollInterval = 10;
      var w = this._containerWidth;
      var h = this._containerHeight;
      this._onContainerSizeChanged();
      var self = this;
      setInterval(function () {
        if (w !== self._containerWidth || h !== self._containerHeight) {
          self._onContainerSizeChanged();
          w = self._containerWidth;
          h = self._containerHeight;
        }
      }, pollInterval);
    }

    private _onContainerSizeChanged() {
      var ratio = this.getRatio();
      var sw = Math.ceil(this._containerWidth * ratio);
      var sh = Math.ceil(this._containerHeight * ratio);

      this._stage.setBounds(new Rectangle(0, 0, sw, sh));
      this._stage.content.setBounds(new Rectangle(0, 0, sw, sh));
      this._worldView.getTransform().setMatrix(new Matrix(ratio, 0, 0, ratio, 0, 0));
      this._dispatchEvent('resize');
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
      this._container.style.cursor = cursor;
    }

    private _render() {
      RenderableVideo.checkForVideoUpdates();
      var mustRender = (this._stage.readyToRender() || forcePaint.value) && !this.paused;
      var renderTime = 0;
      if (mustRender) {
        var renderer = this._renderer;
        if (this.viewport) {
          renderer.viewport = this.viewport;
        } else {
          renderer.viewport = this._stage.getBounds();
        }
        this._dispatchEvent("render");
        enterTimeline("Render");
        renderTime = performance.now();
        renderer.render();
        renderTime = performance.now() - renderTime;
        leaveTimeline("Render");

      }
      if (this._fps) {
        this._fps.tickAndRender(!mustRender, renderTime);
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
      return this._options;
    }

    getDisplayParameters(): DisplayParameters {
      var ratio = this.getRatio();
      return {
        stageWidth: this._containerWidth,
        stageHeight: this._containerHeight,
        pixelRatio: ratio,
        screenWidth: window.screen ? window.screen.width : 640,
        screenHeight: window.screen ? window.screen.height : 480
      };
    }

    public toggleOption(name: string) {
      var option = this._options;
      option[name] = !option[name];
    }

    public getOption(name: string) {
      return this._options[name];
    }

    public getRatio(): number {
      var devicePixelRatio = window.devicePixelRatio || 1;
      var backingStoreRatio = 1;
      var ratio = 1;
      if (devicePixelRatio !== backingStoreRatio &&
        !this._disableHiDPI) {
        ratio = devicePixelRatio / backingStoreRatio;
      }
      return ratio;
    }

    private get _containerWidth(): number {
      return this._container.clientWidth;
    }

    private get _containerHeight(): number {
      return this._container.clientHeight;
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
      var container = this._container;
      var bRect = container.getBoundingClientRect();
      var ratio = this.getRatio();
      var x = ratio * (event.clientX - bRect.left) * (container.scrollWidth / bRect.width);
      var y = ratio * (event.clientY - bRect.top) * (container.scrollHeight / bRect.height);
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
      // this._renderers.forEach(renderer => renderer.render());
    }

    private _onMouseUp(event) {

    }

    private _onMouseMove(event) {

    }

    public screenShot(bounds: Rectangle, stageContent: boolean): ScreenShot {
      return this._renderer.screenShot(bounds, stageContent);
    }
  }
}
