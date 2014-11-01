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
      context.clearRect(0, 0, this._canvas.width, this._canvas.height);
      context.scale(1, 1);
      if (this._options.layout === Layout.Simple) {
        this._renderNodeSimple(this.context, this._stage, Matrix.createIdentity(), this._viewport, []);
      }
      context.restore();
    }

    static clearContext(context: CanvasRenderingContext2D, rectangle: Rectangle) {
      var canvas = context.canvas;
      context.clearRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
    }

    _renderNodeSimple(context: CanvasRenderingContext2D, root: Node, transform: Matrix, clipRectangle: Rectangle, cullRectanglesAABB: Rectangle []) {
      var self = this;
      context.save();
      context.font = "12px Arial";
      context.fillStyle = "white";
      var x = 0, y = 0;
      var w = 20, h = 12, hPadding = 2, wColPadding = 8;
      var colX = 0;
      var maxX = 0;
      function visit(node: Node) {
        var children = node.getChildren();
        if (node.hasFlags(NodeFlags.Dirty)) {
          context.fillStyle = "red";
        } else {
          context.fillStyle = "white";
        }

        var l = String(node.id);

        if (node instanceof RenderableText) {
          l = "T" + l;
        } else if (node instanceof RenderableShape) {
          l = "S" + l;
        } else if (node instanceof RenderableBitmap) {
          l = "B" + l;
        } else if (node instanceof RenderableVideo) {
          l = "V" + l;
        }

        if (node instanceof Renderable) {
          l = l + " [" + (<any>node)._nodeReferrers.length + "]";
        }

        var t = context.measureText(l).width;
        // context.fillRect(x, y, t, h);
        context.fillText(l, x, y);
        if (children) {
          x += t + 4;
          maxX = Math.max(maxX, x + w);
          for (var i = 0; i < children.length; i++) {
            visit(children[i]);
            if (i < children.length - 1) {
              y += h + hPadding;
              if (y > self._canvas.height) {
                context.fillStyle = "gray";
                // context.fillRect(maxX + 4, 0, 2, self._canvas.height);
                x = x - colX + maxX + wColPadding;
                colX = maxX + wColPadding;
                y = 0;
                context.fillStyle = "white";
              }
            }
          }
          x -= t + 4;
        }
      }
      visit(root);
      context.restore();
    }
  }
}