package flash.display {

  import flash.utils.ByteArray;
  import flash.geom.Point;
  import flash.geom.Rectangle;
  import flash.geom.Matrix;
  import flash.geom.ColorTransform;
  import flash.filters.BitmapFilter;

  [native(cls="BitmapDataClass")]
  public class BitmapData implements IBitmapDrawable {
    public function BitmapData(width:int, height:int, transparent:Boolean=true, fillColor:uint=4294967295) {}

    private native function ctor(width:int, height:int, transparent:Boolean, fillColor:uint):void;

    public native function clone():BitmapData;
    public native function get width():int;
    public native function get height():int;
    public native function get transparent():Boolean;
    public function get rect():Rectangle { notImplemented("rect"); }
    public native function getPixel(x:int, y:int):uint;
    public native function getPixel32(x:int, y:int):uint;
    public native function setPixel(x:int, y:int, color:uint):void;
    public native function setPixel32(x:int, y:int, color:uint):void;
    public native function applyFilter(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, filter:BitmapFilter):void;
    public native function colorTransform(rect:Rectangle, colorTransform:ColorTransform):void;
    public native function compare(otherBitmapData:BitmapData):Object;
    public native function copyChannel(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, sourceChannel:uint, destChannel:uint):void;
    public native function copyPixels(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, alphaBitmapData:BitmapData=null, alphaPoint:Point=null, mergeAlpha:Boolean=false):void;
    public native function dispose():void;
    public native function draw(source:IBitmapDrawable, matrix:Matrix=null, colorTransform:ColorTransform=null, blendMode:String=null, clipRect:Rectangle=null, smoothing:Boolean=false):void;
    public native function fillRect(rect:Rectangle, color:uint):void;
    public native function floodFill(x:int, y:int, color:uint):void;
    public native function generateFilterRect(sourceRect:Rectangle, filter:BitmapFilter):Rectangle;
    public native function getColorBoundsRect(mask:uint, color:uint, findColor:Boolean=true):Rectangle;
    public native function getPixels(rect:Rectangle):ByteArray;
    // [Version("10")]
    [compat]
    public native function getVector(rect:Rectangle):Vector;
    public native function hitTest(firstPoint:Point, firstAlphaThreshold:uint, secondObject:Object, secondBitmapDataPoint:Point=null, secondAlphaThreshold:uint=1):Boolean;
    public native function merge(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, redMultiplier:uint, greenMultiplier:uint, blueMultiplier:uint, alphaMultiplier:uint):void;
    public native function noise(randomSeed:int, low:uint=0, high:uint=255, channelOptions:uint=7, grayScale:Boolean=false):void;
    public native function paletteMap(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, redArray:Array=null, greenArray:Array=null, blueArray:Array=null, alphaArray:Array=null):void;
    public native function perlinNoise(baseX:Number, baseY:Number, numOctaves:uint, randomSeed:int, stitch:Boolean, fractalNoise:Boolean, channelOptions:uint=7, grayScale:Boolean=false, offsets:Array=null):void;
    public native function pixelDissolve(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, randomSeed:int=0, numPixels:int=0, fillColor:uint=0):int;
    public native function scroll(x:int, y:int):void;
    public native function setPixels(rect:Rectangle, inputByteArray:ByteArray):void;
    // [Version("10")]
    [compat]
    public native function setVector(rect:Rectangle, inputVector:Vector):void;
    public native function threshold(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point, operation:String, threshold:uint, color:uint=0, mask:uint=4294967295, copySource:Boolean=false):uint;
    public native function lock():void;
    public native function unlock(changeRect:Rectangle=null):void;
    // [Version("10")]
    [compat]
    public native function histogram(hRect:Rectangle=null):Vector;
  }

}
