/// <reference path='references.ts'/>
module Shumway.GFX.Layers {
  import Point = Shumway.Geometry.Point;
  import Matrix = Shumway.Geometry.Matrix;
  import Rectangle = Shumway.Geometry.Rectangle;

  import Canvas2DStageRenderer = Shumway.GFX.Layers.Canvas2DStageRenderer;

  declare var GUI;
  declare var timeline;

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
        easel.state = new DragState(easel.world, easel.getMousePosition(event, null), easel.world.matrix.clone());
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
      var p = easel.getMousePosition(event, null);
      p.sub(this._startPosition);
      this._target.matrix = this._startMatrix.clone().translate(p.x, p.y);
      easel.state = this;
    }
    onMouseUp(easel: Easel, event: MouseEvent) {
      easel.state = new StartState();
    }
  }

  class FrameInspectorProxy {
    target: Frame;
    controllers: any [] = [];
    updateControllers() {
      this.controllers.forEach(function (c) {
        c.updateDisplay();
      });
    }
    constructor(target) {
      this.target = target;
      var self = this;
      var properties = ["matrix.a", "matrix.b", "matrix.c", "matrix.d", "matrix.tx", "matrix.ty", "alpha", "blendMode"];
      properties.forEach(function (p) {
        Object.defineProperty(self, p, {
          get: function (): any {
            if (self.target) {
              var chain = p.split(".");
              var v = self.target;
              for (var i = 0, j = chain.length; i < j; i++) {
                v = v && v[chain[i]];
              }
              return v;
            }
          },
          set: function (value) {
            if (self.target) {
              var chain = p.split(".");
              var v: any = self.target;
              for (var i = 0, j = chain.length - 1; i < j; i++) {
                v = v && v[chain[i]];
              }
              return v[chain[chain.length - 1]] = value;
            }
            return value;
          }
        });
      });

      var folder = GUI.addFolder("Frame Inspector");
      folder.open();
      ["alpha"].forEach(function (p) {
        self.controllers.push(folder.add(self, p).min(0).max(1).step(0.01).name(p));
      });
      ["blendMode"].forEach(function (p) {
        self.controllers.push(folder.add(self, p, {
          Default    : 0,
          Normal     : 1,
          Layer      : 2,
          Multiply   : 3,
          Screen     : 4,
          Lighten    : 5,
          Darken     : 6,
          Difference : 7,
          Add        : 8,
          Subtract   : 9,
          Invert     : 10,
          Alpha      : 11,
          Erase      : 12,
          Overlay    : 13,
          HardLight  : 14
        }).name(p));
      });

      ["blendMode"].forEach(function (p) {
        self.controllers.push(folder.add(self, p).name(p));
      });

      ["matrix.a", "matrix.b", "matrix.c", "matrix.d"].forEach(function (p) {
        self.controllers.push(folder.add(self, p).min(-8).max(32).step(0.01).name(p));
      });

      ["matrix.tx", "matrix.ty"].forEach(function (p) {
        self.controllers.push(folder.add(self, p).step(1).name(p));
      });
    }
  }

  export class Easel {
    private _stage: Stage;
    private _world: FrameContainer;
    _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _renderer: Canvas2DStageRenderer;
    private _state: State = new StartState();

    private _selection: FrameContainer;
    private _selectedFrames: Frame [] = [];

    private _mousePositionLabel: Label;
    private _frameInspectorProxy: FrameInspectorProxy;
    private _createToolbar(): Frame {
      var toolbar = new FrameContainer();
      this._mousePositionLabel = new Label(256, 16);
      this._mousePositionLabel.text = "Hello World";
      var self = this;
      toolbar.addChild(new Shape(new Renderable(new Rectangle(0, 0, 1024, 32), function (context: CanvasRenderingContext2D) {
        context.fillStyle = ColorStyle.Toolbars;
        context.fillRect(0, 0, self._stage.w, 32);
      })));
      var mousePositionLabelShape = toolbar.addChild(new Shape(this._mousePositionLabel));
      mousePositionLabelShape.x = 4;
      mousePositionLabelShape.y = 8;
      toolbar.setCapability(FrameCapabilityFlags.AllowMatrixWrite, false, Direction.Downward);
      return toolbar;
    }

    constructor(canvas: HTMLCanvasElement) {
      this._stage = new Stage(canvas.width, canvas.height, true);
      this._world = new FrameContainer();
      this._stage.addChild(this._world);
      this._world.addChild(new Shape(new Grid())).removeCapability(FrameCapabilityFlags.AllowMatrixWrite);
      var overlay = new FrameContainer();
      overlay.addChild(this._createToolbar());
      this._stage.addChild(overlay);

      this._selection = <FrameContainer>overlay.addChild(new FrameContainer());
      this._selection._setFlags(FrameFlags.IgnoreQuery);

      this._canvas = canvas;
      this._context = canvas.getContext('2d');
      window.addEventListener('resize', this._resizeHandler.bind(this), false);
      this._resizeHandler();
      this._renderer = new Canvas2DStageRenderer(this._context);
      this._renderer.render(this._stage, { });

      this._onMouseUp = this._onMouseUp.bind(this)
      this._onMouseDown = this._onMouseDown.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);

      var self = this;

      window.addEventListener("mouseup", function (event) {
        self._state.onMouseUp(self, event);
        self._render();
        self._frameInspectorProxy && self._frameInspectorProxy.updateControllers();
      }, false);

      window.addEventListener("mousemove", function (event) {
        var p = self.getMousePosition(event, self._world);
        self._mousePositionLabel.text = "x: " + p.x + ", y: " + p.y;
        self._state.onMouseMove(self, event);
        self._render();
      }, false);

      canvas.addEventListener("mousedown", function (event) {
        self._state.onMouseDown(self, event);
        self._render();
      }, false);

      window.addEventListener("keydown", function (event) {
        self._state.onKeyDown(self, event);
        self._render();
      }, false);

      window.addEventListener("keypress", function (event) {
        self._state.onKeyPress(self, event);
        self._render();
      }, false);

      window.addEventListener("keyup", function (event) {
        self._state.onKeyUp(self, event);
        self._render();
      }, false);


    }

    set state(state: State) {
      this._state = state;
    }

    private _render() {
      timeline && timeline.enter("Render");
      this._renderer.render(this._stage, {
        // paintFlashing: true,
        // clipCanvas: true,
        // clipDirtyRegions: true
      });
      timeline && timeline.leave("Render");
    }

    get world(): FrameContainer {
      return this._world;
    }

    get stage(): FrameContainer {
      return this._stage;
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
      this._stage.w = this._canvas.width;
      this._stage.h = this._canvas.height;
      this._context.font = 14 + 'px Consolas, "Liberation Mono", Courier, monospace';
      // this._viewport = new Rectangle(0, 0, this._canvas.width, this._canvas.height);
    }

    queryFrameUnderMouse(event: MouseEvent) {
      var frames = this.stage.queryFramesByPoint(this.getMousePosition(event, null));
      return frames.length > 0 ? frames[0] : null;
    }

    selectFrameUnderMouse(event: MouseEvent) {
      this._selection.clearChildren();
      var frame = this.queryFrameUnderMouse(event);
      if (frame && frame.hasCapability(FrameCapabilityFlags.AllowMatrixWrite)) {
        this._selectedFrames.push(frame);
        this._selection.matrix = frame.getConcatenatedMatrix();
        var bounds = frame.getBounds();
        bounds.snap();
        bounds.expand(4, 4);
        var selection = this._selection.addChild(new Shape(new Renderable(bounds, function (context: CanvasRenderingContext2D) {
          context.save();
          context.beginPath();
          context.lineWidth = 2;
          context.strokeStyle = ColorStyle.LightOrange;
          context.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
          context.restore();
        })));
        if (!this._frameInspectorProxy) {
          this._frameInspectorProxy = new FrameInspectorProxy(frame);
        } else {
          this._frameInspectorProxy.target = frame;
        }
      } else {
        this._selectedFrames = [];
        if (this._frameInspectorProxy) {
          this._frameInspectorProxy.target = null;
        }
      }
      this._frameInspectorProxy && this._frameInspectorProxy.updateControllers();
      this._render();
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
      coordinateSpace.getConcatenatedMatrix().inverse(m);
      m.transformPoint(p);
      return p;
    }

    private _onMouseDown(event) {
      this._renderer.render(this._stage, { });
    }

    private _onMouseUp(event) {

    }

    private _onMouseMove(event) {

    }
  }
}