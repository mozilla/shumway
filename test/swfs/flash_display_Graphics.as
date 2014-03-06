/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   node utils/compileabc.js --swf GraphicsTest,600,600,60 -p test/swfs/flash_display_Graphics.as
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

    private function clear() {
        graphics.beginFill(0xFFFFFF);
        graphics.lineStyle(0, 0x000000, 0);
        graphics.drawRect(0, 0, 600, 600);
    }

    private var frameCount = 0;

    private function enterFrameHandler(event:Event):void {
        var target = event.target;
        switch (frameCount) {
        case 0:
            (function () {
                clear();
                graphics.beginFill(color);
                graphics.drawRect(0, 0, size, size);
                graphics.endFill();
            })();
            break;
        case 1:
            (function () {
                clear();
                graphics.beginFill(color);
                graphics.drawRoundRect(0, 0, size, size, size/5, size/5);
                graphics.endFill();
            })();
            break;
        case 2:
            (function () {
                clear();
                graphics.beginFill(color);
                graphics.drawRect(0, 0, size, size);
                graphics.endFill();
            })();
            break;
        case 3:
            (function () {
                clear();
                graphics.beginFill(color);
                graphics.drawCircle(50, 50, size/2);
                graphics.endFill();
            })();
            break;
        case 4:
            (function () {
                clear();
                var fillType:String = GradientType.LINEAR;
                var colors:Array = [0xFF0000, 0x0000FF];
                var alphas:Array = [1, 1];
                var ratios:Array = [0x00, 0xFF];
                graphics.beginGradientFill(fillType, colors, alphas, ratios);
                graphics.drawRect(0,0,size,size);
                graphics.endFill();
            })();
            break;
        case 5:
            (function () {
                clear();
                graphics.lineStyle(10, color);
                graphics.moveTo(0, 0);
                graphics.lineTo(size, size);
                graphics.lineTo(0, size);
                graphics.lineTo(size, 0);
            })();
            break;
        case 6:
            (function () {
                clear();
                graphics.lineStyle(10, color);
                graphics.moveTo(size, 10);
                graphics.lineTo(size, size);
            })();
            break;
        case 7:
            (function () {
                clear();
                graphics.lineStyle(10, color << 2, 0.5);
                graphics.moveTo(size/2, size);
                graphics.lineTo(10, 10);
                graphics.lineStyle(10, color >> 2, 0.5);
                graphics.lineTo(size, 10);
                graphics.lineStyle(10, color, 0.5);
                graphics.lineTo(10, size);
            })();
            return;
            break;
        case 8:
            (function ():void {
                clear();
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
            })();
            break;
        case 9:
            (function () {
                clear();
                graphics.beginFill(0x00FF00);
                graphics.lineStyle(10, color << 2, 0.5);
                graphics.moveTo(size/2, size);
                graphics.lineTo(10, 10);
                graphics.lineTo(size, 10);
                graphics.endFill();
            })();
            break;
        case 10:
            graphics.clear();
            break;
        case 11:
            // check for blank stage
            break;
        default:
            removeEventListener("enterFrame", enterFrameHandler);
            break;
        }
        frameCount++;
    }
}
