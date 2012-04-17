package flash.display {

  import flash.geom.Matrix;

  [native(cls="GraphicsClass")]
  public final class Graphics {
    public function Graphics() {}

    public native function clear():void;
    public native function beginFill(color:uint, alpha:Number=1):void;
    public native function beginGradientFill(type:String, colors:Array, alphas:Array, ratios:Array, matrix:Matrix=null, spreadMethod:String="pad", interpolationMethod:String="rgb", focalPointRatio:Number=0):void;
    public native function beginBitmapFill(bitmap:BitmapData, matrix:Matrix=null, repeat:Boolean=true, smooth:Boolean=false):void;
    // [Version("10")]
    [compat]
    public native function beginShaderFill(shader:Shader, matrix:Matrix=null):void;
    public native function lineGradientStyle(type:String, colors:Array, alphas:Array, ratios:Array, matrix:Matrix=null, spreadMethod:String="pad", interpolationMethod:String="rgb", focalPointRatio:Number=0):void;
    public native function lineStyle(thickness:Number, color:uint=0, alpha:Number=1, pixelHinting:Boolean=false, scaleMode:String="normal", caps:String=null, joints:String=null, miterLimit:Number=3):void;
    public native function drawRect(x:Number, y:Number, width:Number, height:Number):void;
    public native function drawRoundRect(x:Number, y:Number, width:Number, height:Number, ellipseWidth:Number, ellipseHeight:Number):void;
    [Inspectable(environment="none")]
    public native function drawRoundRectComplex(x:Number, y:Number, width:Number, height:Number, topLeftRadius:Number, topRightRadius:Number, bottomLeftRadius:Number, bottomRightRadius:Number):void;
    public function drawCircle(x:Number, y:Number, radius:Number):void { notImplemented("drawCircle"); }
    public function drawEllipse(x:Number, y:Number, width:Number, height:Number):void { notImplemented("drawEllipse"); }
    public native function moveTo(x:Number, y:Number):void;
    public native function lineTo(x:Number, y:Number):void;
    public native function curveTo(controlX:Number, controlY:Number, anchorX:Number, anchorY:Number):void;

    // [API("674")]
    [compat]
    public native function cubicCurveTo(controlX1:Number, controlY1:Number, controlX2:Number, controlY2:Number, anchorX:Number, anchorY:Number):void;
    public native function endFill():void;
    // [Version("10")]
    [compat]
    public native function copyFrom(sourceGraphics:Graphics):void;
    // [Version("10")]
    [compat]
    public native function lineBitmapStyle(bitmap:BitmapData, matrix:Matrix=null, repeat:Boolean=true, smooth:Boolean=false):void;
    // [Version("10")]
    [compat]
    public native function lineShaderStyle(shader:Shader, matrix:Matrix=null):void;
    // [Version("10")]
    [compat]
    public native function drawPath(commands:Vector, data:Vector, winding:String="evenOdd"):void;
    // [Version("10")]
    [compat]
    public native function drawTriangles(vertices:Vector, indices:Vector=null, uvtData:Vector=null, culling:String="none"):void;

    private function drawPathObject(path:IGraphicsPath):void { notImplemented("drawPathObject"); }
    private function beginFillObject(fill:IGraphicsFill):void { notImplemented("beginFillObject"); }
    private function beginStrokeObject(istroke:IGraphicsStroke):void { notImplemented("beginStrokeObject"); }
    // [Version("10")]
    [compat]
    public function drawGraphicsData(graphicsData:Vector):void { notImplemented("drawGraphicsData"); }
  }

}
