/// <reference path='all.ts'/>
module Shumway.Layers {
  import Rectangle = Shumway.Geometry.Rectangle;
  import Point = Shumway.Geometry.Point;
  import Matrix = Shumway.Geometry.Matrix;
  import DirtyRegion = Shumway.Geometry.DirtyRegion;
  import Filter = Shumway.Layers.Filter;
  import TileCache = Shumway.Geometry.TileCache;
  import Tile = Shumway.Geometry.Tile;
  import OBB = Shumway.Geometry.OBB;

  export class Frame {
    private _x: number;
    private _y: number;
    private _alpha: number = 1;
    private _scaleX: number;
    private _scaleY: number;
    private _rotation: number;
    private _transform: Matrix;
    private _isTransformInvalid: boolean = true;
    private _origin: Point = new Point(0, 0);

    get x(): number {
      return this._x;
    }

    set x(value: number) {
      this._x = value;
      this.invalidateTransform();
    }

    get y(): number {
      return this._y;
    }

    set y(value: number) {
      this._y = value;
      this.invalidateTransform();
    }

    get scaleX(): number {
      return this._scaleX;
    }

    set scaleX(value: number) {
      this._scaleX = value;
      this.invalidateTransform();
    }

    get scaleY(): number {
      return this._scaleY;
    }

    set scaleY(value: number) {
      this._scaleY = value;
      this.invalidateTransform();
    }

    get rotation(): number {
      return this._rotation;
    }

    set rotation(value: number) {
      this._rotation = value;
      this.invalidateTransform();
    }

    get alpha(): number {
      return this._alpha;
    }

    set alpha(value: number) {
      this._alpha = value;
      this.invalidate();
    }

    get transform(): Matrix {
      if (this._isTransformInvalid) {
        this._transform.setIdentity();
        this._transform.scale(this._scaleX, this._scaleY);
        this._transform.rotate(this._rotation * Math.PI / 180);
        this._transform.translate(this._x, this._y);

        var t = Matrix.createIdentity();
        t.translate(-this._origin.x, -this._origin.y);
        t.concat(this._transform);
        this._transform = t;
        this._isTransformInvalid = false;
      }
      return this._transform;
    }

    set transform(value: Matrix) {
      var t = Matrix.createIdentity();
      t.translate(this._origin.x, this._origin.y);
      t.concat(value);

      this._transform = t;
      this._x = t.getTranslateX();
      this._y = t.getTranslateY();
      this._scaleX = t.getScaleX();
      this._scaleY = t.getScaleY();
      this._rotation = t.getRotation();
      this._isTransformInvalid = false;
      this.invalidate();
    }

    public w: number;
    public h: number;
    public parent: Frame;
    public isInvalid: boolean;

    public filters: Filter [];
    public mask: Frame;

    get origin(): Point {
      return this._origin;
    }

    set origin(value: Point) {
      this._origin.set(value);
      this.invalidateTransform();
    }

    constructor () {
      this.parent = null;
      this.transform = Matrix.createIdentity();
      this.filters = null;
    }

    get stage(): Stage {
      var frame = this;
      while (frame.parent) {
        frame = frame.parent;
      }
      if (frame instanceof Stage) {
        return <Stage>frame;
      }
      return null;
    }

    public getConcatenatedTransform(): Matrix {
      var frame = this;
      var m = this.transform.clone();
      while (frame.parent) {
        frame = frame.parent;
        Matrix.multiply(m, frame.transform);
      }
      return m;
    }

    private invalidate() {
      this.isInvalid = true;
    }

    private invalidateTransform() {
      this._isTransformInvalid = true;
      this.invalidate();
    }

    public visit(visitor: (Frame, Matrix?) => void, transform: Matrix) {
      var stack: Frame [];
      var frame: Frame;
      var frameContainer: FrameContainer;
      if (transform) {
        stack = [this];
        var transforms: Matrix [];
        transforms = [transform];
        while (stack.length > 0) {
          frame = stack.pop();
          transform = transforms.pop();
          if (frame instanceof FrameContainer) {
            frameContainer = <FrameContainer>frame;
            for (var i = frameContainer.children.length - 1; i >= 0; i--) {
              stack.push(frameContainer.children[i]);
              var t = transform.clone();
              Matrix.multiply(t, frameContainer.children[i].transform);
              transforms.push(t);
            }
          }
          visitor(frame, transform);
        }
      } else {
        notImplemented();
      }
    }
  }

  export class FrameContainer extends Frame {
    public children: Frame [];
    constructor() {
      super();
      this.children = [];
    }

    public addChild(child: Frame) {
      child.parent = this;
      this.children.push(child);
    }

    public removeChild(child: Frame) {
      if (child.parent === this) {
        var index = this.children.indexOf(child);
        this.children.splice(index, 1);
        child.parent = undefined;
      }
    }

    public clearChildren() {
      this.children.length = 0;
    }

    public shuffleChildren() {
      var length = this.children.length;
      for (var i = 0; i < length * 2; i++) {
        var a = Math.random() * length | 0;
        var b = Math.random() * length | 0;
        var t = this.children[a];
        this.children[a] = this.children[b];
        this.children[b] = t;
      }
    }
  }

  export interface ITextureRegion {
    texture: any;
    region: Rectangle;
  }

  export class Canvas2DStageRenderer {
    context: CanvasRenderingContext2D;
    debugContexts: CanvasRenderingContext2D [];
    count = 0;
    constructor(context: CanvasRenderingContext2D, debugContexts: CanvasRenderingContext2D []) {
      this.context = context;
      this.debugContexts = debugContexts;
    }

    public render(stage: Stage, options: any) {
      var context = this.context;
      var debugContext = this.debugContexts[0];
      var cacheContext = this.debugContexts[1];
      context.globalAlpha = 1;
      context.fillStyle = "black";
      context.fillRect(0, 0, stage.w, stage.h);


      var that = this;
      stage.visit(function visitFrame(frame: Frame, transform?: Matrix) {
        context.save();
        context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
        // context.globalAlpha = 1 - frame.alpha;
        if (frame instanceof Shape) {
          var shape = <Shape>frame;
          shape.source.render(context);
        }
        context.globalAlpha = 1;
        context.restore();
      }, stage.transform);

      if (options && options.drawLayers) {
        function drawRectangle(rectangle: Rectangle) {
          context.rect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
        }
        context.strokeStyle = "#FF4981";
//        for (var i = 0; i < layers.length; i++) {
//          context.beginPath();
//          drawRectangle(layers[i]);
//          context.closePath();
//          context.stroke();
//        }
      }
    }
  }

  export class Stage extends FrameContainer {
    public dirtyRegion: DirtyRegion;
    constructor(w: number, h: number) {
      super()
      this.w = w;
      this.h = h;
      this.dirtyRegion = new DirtyRegion(w, h);
    }

    gatherDirtyRegions(rectangles?: Rectangle[]) {
      var that = this;
      // Find all invalid frames.
      this.visit(function (frame: Frame, transform?: Matrix) {
        if (frame.isInvalid) {
          var rectangle = new Rectangle(0, 0, frame.w, frame.h);
          transform.transformRectangleAABB(rectangle);
          that.dirtyRegion.addDirtyRectangle(rectangle);
          frame.isInvalid = false;
        }
      }, this.transform);
      if (rectangles) {
        this.dirtyRegion.gatherRegions(rectangles);
      }
    }

    gatherFrames() {
      var frames = [];
      this.visit(function (frame: Frame, transform?: Matrix) {
        if (!(frame instanceof FrameContainer)) {
          frames.push(frame);
        }
      }, this.transform);
      return frames;
    }

    gatherLayers() {
      var layers = [];
      var currentLayer;
      this.visit(function (frame: Frame, transform?: Matrix) {
        if (frame instanceof FrameContainer) {
          return;
        }
        var rectangle = new Rectangle(0, 0, frame.w, frame.h);
        transform.transformRectangleAABB(rectangle);
        if (frame.isInvalid) {
          if (currentLayer) {
            layers.push(currentLayer);
          }
          layers.push(rectangle.clone());
          currentLayer = null;
        } else {
          if (!currentLayer) {
            currentLayer = rectangle.clone();
          } else {
            currentLayer.union(rectangle);
          }
        }
      }, this.transform);

      if (currentLayer) {
        layers.push(currentLayer);
      }

      return layers;
    }
  }

  export interface IAnimator {
    onEnterFrame ();
  }

  export class SolidRectangle extends Frame {
    fillStyle: string = randomStyle();
    constructor() {
      super();
    }
  }

  export class Shape extends Frame {
    source: IRenderable;
    constructor(source: IRenderable) {
      super();
      this.source = source;
      var bounds = source.getBounds();
      this.w = bounds.w;
      this.h = bounds.h;
    }
  }

  export class Video extends Frame {
    source: ITextureRegion;
    constructor(source: ITextureRegion) {
      super();
      this.source = source;
      this.w = source.region.w;
      this.h = source.region.h;
    }
  }
}