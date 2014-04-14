/// <reference path='references.ts'/>
module Shumway.GFX.Layers {
  import Point = Shumway.Geometry.Point;
  import Matrix = Shumway.Geometry.Matrix;
  import Rectangle = Shumway.Geometry.Rectangle;

  import Canvas2DStageRenderer = Shumway.GFX.Layers.Canvas2DStageRenderer;

  interface IState {
    onMouseUp(easel: Easel, event: MouseEvent);
    onMouseDown(easel: Easel, event: MouseEvent);
    onMouseMove(easel: Easel, event: MouseEvent);
  }

  class State implements IState {
    onMouseUp(easel: Easel, event: MouseEvent) {
      return this;
    }

    onMouseDown(easel: Easel, event: MouseEvent) {
      return this;
    }

    onMouseMove(easel: Easel, event: MouseEvent) {
      return this;
    }
  }

  class MouseUpState extends State {
    onMouseDown(easel: Easel, event: MouseEvent) {
      return new DragState(easel.getMousePosition(event, null), easel.world.transform.clone());
    }
  }

  class DragState extends State {
    private _startMatrix: Matrix;
    private _startPosition: Point;
    constructor(startPosition: Point, startMatrix: Matrix) {
      super();
      this._startPosition = startPosition;
      this._startMatrix = startMatrix;
    }
    onMouseMove(easel: Easel, event: MouseEvent) {
      var p = easel.getMousePosition(event, null);
      p.sub(this._startPosition);
      easel.world.transform = this._startMatrix.clone().translate(p.x, p.y);
      return this;
    }
    onMouseUp(easel: Easel, event: MouseEvent) {
      return new MouseUpState();
    }
  }

  export class Easel {
    private _stage: Stage;
    private _world: FrameContainer;
    private _gui: FrameContainer;
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _renderer: Canvas2DStageRenderer;
    private _state: State = new MouseUpState();

    private _mousePositionLabel: Label;
    constructor(canvas: HTMLCanvasElement, stage: Stage) {
      this._stage = stage;
      this._world = new FrameContainer();
      this._stage.addChild(this._world);
      this._gui = new FrameContainer();

      this._mousePositionLabel = new Label(256, 16);
      var f = new Shape(this._mousePositionLabel);
      f.x = 500;
      f.y = 500;
      this._gui.addChild(f);
      this._stage.addChild(this._gui);

      this._mousePositionLabel.text = "Hello World";

      this._canvas = canvas;
      this._context = canvas.getContext('2d');
      this._resizeHandler();
      window.addEventListener('resize', this._resizeHandler.bind(this), false);
      this._renderer = new Canvas2DStageRenderer(this._context);
      this._renderer.render(this._stage, {});

      this._onMouseUp = this._onMouseUp.bind(this)
      this._onMouseDown = this._onMouseDown.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);

      var self = this;
      window.addEventListener("mouseup", function (event) {
        self._state = self._state.onMouseUp(self, event);
        self._render();
      }, false);
      window.addEventListener("mousemove", function (event) {
        var p = self.getMousePosition(event, self._world);
        self._mousePositionLabel.text = p.x + ", " + p.y;

        self._state = self._state.onMouseMove(self, event);
        self._render();
      }, false);
      canvas.addEventListener("mousedown", function (event) {
        self._state = self._state.onMouseDown(self, event);
        self._render();
      }, false);
    }

    private _render() {
      this._renderer.render(this._stage, {});
    }

    get world(): FrameContainer {
      return this._world;
    }

    private _resizeHandler() {
      var parent = this._canvas.parentElement;
      var cw = parent.offsetWidth;
      var ch = parent.offsetHeight - 1;

      var devicePixelRatio = window.devicePixelRatio || 1;
      var context = <any>this._context
      var backingStoreRatio =
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio    ||
        context.msBackingStorePixelRatio     ||
        context.oBackingStorePixelRatio      ||
        context.backingStorePixelRatio       || 1;

      if (devicePixelRatio !== backingStoreRatio) {
        var ratio = devicePixelRatio / backingStoreRatio;
        this._canvas.width = cw * ratio;
        this._canvas.height = ch * ratio;
        this._canvas.style.width = cw + 'px';
        this._canvas.style.height = ch + 'px';
        // this._context.scale(ratio, ratio);
      } else {
        this._canvas.width = cw;
        this._canvas.height = ch;
        this._context.scale(1 / 2, 1 / 2);
      }
      this._context.font = 14 + 'px Consolas, "Liberation Mono", Courier, monospace';
      // this._viewport = new Rectangle(0, 0, this._canvas.width, this._canvas.height);
    }

    getMousePosition(event: MouseEvent, coordinateSpace: Frame) {
      var canvas = this._canvas;
      var bRect = canvas.getBoundingClientRect();
      var x = (event.clientX - bRect.left) * (canvas.width / bRect.width);
      var y = (event.clientY - bRect.top) * (canvas.height / bRect.height);
      var p = new Point(x, y);
      if (!coordinateSpace) {
        return p;
      }
      var m = Matrix.createIdentity();
      coordinateSpace.transform.inverse(m);
      m.transformPoint(p);
      return p;
    }

    private _onMouseDown(event) {
      this._renderer.render(this._stage, {});
    }

    private _onMouseUp(event) {

    }

    private _onMouseMove(event) {

    }
  }
}