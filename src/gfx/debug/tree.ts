module Shumway.GFX {

  import Rectangle = Shumway.GFX.Geometry.Rectangle;
  import Point = Shumway.GFX.Geometry.Point;
  import Matrix = Shumway.GFX.Geometry.Matrix;
  import DirtyRegion = Shumway.GFX.Geometry.DirtyRegion;
  import Filter = Shumway.GFX.Filter;
  import TileCache = Shumway.GFX.Geometry.TileCache;
  import Tile = Shumway.GFX.Geometry.Tile;
  import OBB = Shumway.GFX.Geometry.OBB;

  export const enum Layout {
    Simple
  }

  export class TreeRendererOptions extends RendererOptions {
    layout: Layout = Layout.Simple;
  }

  export class TreeRenderer extends Renderer {
    _options: TreeRendererOptions;
    _canvas: HTMLCanvasElement;
    _context: CanvasRenderingContext2D;
    layout: any;

    constructor(container: HTMLDivElement,
                stage: Stage,
                options: TreeRendererOptions = new TreeRendererOptions()) {
      super(container, stage, options);
      this._canvas = document.createElement("canvas");
      this._container.appendChild(this._canvas);
      this._context = this._canvas.getContext("2d");
      this._listenForContainerSizeChanges();
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

    private _getRatio(): number {
      var devicePixelRatio = window.devicePixelRatio || 1;
      var backingStoreRatio = 1;
      var ratio = 1;
      if (devicePixelRatio !== backingStoreRatio) {
        ratio = devicePixelRatio / backingStoreRatio;
      }
      return ratio;
    }

    private _onContainerSizeChanged() {
      var ratio = this._getRatio();
      var w = Math.ceil(this._containerWidth * ratio);
      var h = Math.ceil(this._containerHeight * ratio);
      var canvas = this._canvas;
      if (ratio > 0) {
        canvas.width = w * ratio;
        canvas.height = h * ratio;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
      } else {
        canvas.width = w;
        canvas.height = h;
      }
    }

    private get _containerWidth(): number {
      return this._container.clientWidth;
    }

    private get _containerHeight(): number {
      return this._container.clientHeight;
    }

    public render() {
      var context = this._context;
      context.save();

      context.clearRect(0, 0, this._canvas.width, this._canvas.height);
      context.scale(1, 1);
      if (this._options.layout === Layout.Simple) {
        this._renderNodeSimple(this._context, this._stage, Matrix.createIdentity());
      }
      context.restore();
    }

    _renderNodeSimple(context: CanvasRenderingContext2D, root: Node, transform: Matrix) {
      var self = this;
      context.save();
      var fontHeight = 16;
      context.font = fontHeight + "px Arial";
      context.fillStyle = "white";
      var x = 0, y = 0;
      var w = 20, h = fontHeight, hPadding = 2, wColPadding = 8;
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
          l = l + " [" + (<any>node)._parents.length + "]";
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