module Shumway.GFX {

  import Rectangle = Shumway.GFX.Geometry.Rectangle;
  import Point = Shumway.GFX.Geometry.Point;
  import Matrix = Shumway.GFX.Geometry.Matrix;
  import DirtyRegion = Shumway.GFX.Geometry.DirtyRegion;
  import Filter = Shumway.GFX.Filter;
  import TileCache = Shumway.GFX.Geometry.TileCache;
  import Tile = Shumway.GFX.Geometry.Tile;
  import OBB = Shumway.GFX.Geometry.OBB;

  export enum Layout {
    Simple
  }

  export class TreeStageRendererOptions extends StageRendererOptions {
    layout: Layout = Layout.Simple;
  }

  export class TreeStageRenderer extends StageRenderer {
    _options: TreeStageRendererOptions;
    context: CanvasRenderingContext2D;
    _viewport: Rectangle;
    layout: any;

    constructor(canvas: HTMLCanvasElement,
                stage: Stage,
                options: TreeStageRendererOptions = new TreeStageRendererOptions()) {
      super(canvas, stage, options);
      this.context = canvas.getContext("2d");
      this._viewport = new Rectangle(0, 0, canvas.width, canvas.height);
    }

    public render() {
      var context = this.context;
      context.save();
      context.clearRect(0, 0, this._stage.w, this._stage.h);
      context.scale(1, 1);
      if (this._options.layout === Layout.Simple) {
        this._renderFrameSimple(this.context, this._stage, Matrix.createIdentity(), this._viewport, []);
      }
      context.restore();
    }

    static clearContext(context: CanvasRenderingContext2D, rectangle: Rectangle) {
      var canvas = context.canvas;
      context.clearRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
    }

    _renderFrameSimple(context: CanvasRenderingContext2D, root: Frame, transform: Matrix, clipRectangle: Rectangle, cullRectanglesAABB: Rectangle []) {
      var self = this;
      context.save();
      context.fillStyle = "white";
      var x = 0, y = 0;
      var w = 6, h = 2, hPadding = 1, wColPadding = 8;
      var colX = 0;
      var maxX = 0;
      function visit(frame: Frame) {
        var isFrameContainer = frame instanceof FrameContainer;
        if (frame._hasFlags(FrameFlags.InvalidPaint)) {
          context.fillStyle = "red";
        } else if (frame._hasFlags(FrameFlags.InvalidConcatenatedMatrix)) {
          context.fillStyle = "blue";
        } else {
          context.fillStyle = "white";
        }
        var t = isFrameContainer ? 2 : w;
        context.fillRect(x, y, t, h);
        if (isFrameContainer) {
          x += t + 2;
          maxX = Math.max(maxX, x + w);
          var frameContainer = <FrameContainer>frame;
          var children = frameContainer._children;
          for (var i = 0; i < children.length; i++) {
            visit(children[i]);
            if (i < children.length - 1) {
              y += h + hPadding;
              if (y > self._canvas.height) {
                context.fillStyle = "gray";
                context.fillRect(maxX + 4, 0, 2, self._canvas.height);
                x = x - colX + maxX + wColPadding;
                colX = maxX + wColPadding;
                y = 0;
                context.fillStyle = "white";
              }
            }
          }
          x -= t + 2;
        }
      }
      visit(root);
      context.restore();
    }
  }
}
