/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   java -jar utils/asc.jar -import playerglobal.abc -swf GraphicsTest,400,400 test/swfs/flash_display_Grahics.as
*/

package {
    import flash.display.Sprite;

    public class GraphicsTest extends Sprite {
        public function GraphicsTest() {
            var child:GraphicsObject = new GraphicsObject();
            addChild(child);
        }
    }
}

import flash.display.*;
import flash.events.*;

dynamic class GraphicsObject extends Sprite {
    private var color:uint = 0xFFCC00;
    private var size:uint    = 80;

    public function GraphicsObject() {
        addEventListener(Event.ENTER_FRAME, enterFrameHandler);
    }

    private function beginFill():void {
        graphics.clear();
        graphics.beginFill(color);
        graphics.drawRect(0, 0, size, size);
        graphics.endFill();
    }

    private function drawCircle():void {
        graphics.clear();
        graphics.beginFill(color);
        graphics.drawCircle(50, 50, size/2);
        graphics.endFill();
    }

    private function drawRect():void {
        graphics.clear();
        graphics.beginFill(color);
        graphics.drawRect(0, 0, size, size);
        graphics.endFill();
    }

    private function drawRoundRect():void {
        graphics.clear();
        graphics.beginFill(color);
        graphics.drawRoundRect(0, 0, size, size, size/5, size/5);
        graphics.endFill();
    }

    private function beginGradientFill():void {
        graphics.clear();
        var fillType:String = GradientType.LINEAR;
        var colors:Array = [0xFF0000, 0x0000FF];
        var alphas:Array = [1, 1];
        var ratios:Array = [0x00, 0xFF];
        graphics.beginGradientFill(fillType, colors, alphas, ratios);        
        graphics.drawRect(0,0,size,size);
        graphics.endFill();
    }

    private function lineTo():void {
        graphics.clear();
        graphics.lineStyle(10, color);
        graphics.moveTo(0, 0);
        graphics.lineTo(size, size);
    }

    private function moveTo():void {
        graphics.clear();
        graphics.lineStyle(10, color);
        graphics.moveTo(size, 10);
        graphics.lineTo(size, size);
    }

    private function lineStyle():void {
        graphics.clear();
        graphics.lineStyle(10, color << 2, 0.5);
        graphics.moveTo(size/2, size);
        graphics.lineTo(10, 10);
        graphics.lineStyle(10, color >> 2, 0.5);
        graphics.lineTo(size, 10);
        graphics.lineStyle(10, color, 0.5);
        graphics.lineTo(10, size);
    }

    private function endFill():void {
        graphics.clear();
        graphics.beginFill(0x00FF00);
        graphics.lineStyle(10, color << 2, 0.5);
        graphics.moveTo(size/2, size);
        graphics.lineTo(10, 10);
        graphics.lineTo(size, 10);
        graphics.endFill();
    }

    private function lineGradientStyle():void {
        graphics.clear();
        var fillType:String = GradientType.LINEAR;
        var colors:Array = [0xFF0000, 0x00FFFF];
        var alphas:Array = [1, 1];
        var ratios:Array = [0x00, 0xFF];
        graphics.lineStyle(20);
        graphics.lineGradientStyle(fillType, colors, alphas, ratios);        
        graphics.moveTo(size/2, size);
        graphics.lineTo(10, 10);
        graphics.lineTo(size, 10);
        graphics.lineTo(10, size);
    }

    private function clear() {
        graphics.clear();
    }

    private var frameCount = 0;

    private function enterFrameHandler(event:Event):void {
        var target = event.target;
        switch (frameCount) {
        case 0:
            beginFill();
            break;
        case 1:
            drawRoundRect();
            break;
        case 2:
            drawRect();
            break;
        case 3:
            drawCircle();
            break;
        case 4:
            beginGradientFill();
            break;
        case 5:
            lineTo();
            break;
        case 6:
            moveTo();
            break;
        case 7:
            lineStyle();
            break;
        case 8:
            lineGradientStyle();
            break;
        case 9:
            endFill();
            break;
        default:
            removeEventListener("enterFrame", enterFrameHandler);
            break;
        }
        frameCount++;
    }
}
