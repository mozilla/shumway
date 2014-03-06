/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   node utils/compileabc.js --swf DisplayObjectTest,600,600,60 -p test/swfs/flash_display_DisplayObject.as
*/

package {

    import flash.display.Sprite;

    public class DisplayObjectTest extends Sprite {
        public function DisplayObjectTest() {
            var child:CustomDisplayObject = new CustomDisplayObject();
            addChild(child);
        }
    }
}

import flash.display.*;
import flash.display.Sprite;
import flash.display.Stage;
import flash.display.StageAlign;
import flash.display.StageScaleMode;
import flash.system.Capabilities;
import flash.accessibility.Accessibility;
import flash.accessibility.AccessibilityProperties;
import flash.events.*;
import flash.filters.*;
import flash.geom.*;

class CustomDisplayObject extends Sprite {
    private var bgColor:uint = 0xFFCC00;
    private var size:uint    = 80;

    public function CustomDisplayObject() {
        draw();
        addEventListener(Event.ADDED, addedHandler);
        addEventListener(Event.ENTER_FRAME, enterFrameHandler);
        addEventListener(Event.REMOVED, removedHandler);
        addEventListener(MouseEvent.CLICK, clickHandler);
        addEventListener(Event.RENDER, renderHandler);
    }

    private function draw():void {
        graphics.beginFill(bgColor);
        graphics.drawRect(0, 0, size, size);
        graphics.endFill();
    }

    private function clickHandler(event:MouseEvent):void {
        trace("clickHandler: " + event);
        parent.removeChild(this);
    }

    private function addedHandler(event:Event):void {
        stage.scaleMode = StageScaleMode.NO_SCALE;
        stage.align = StageAlign.TOP_LEFT;
        stage.addEventListener("resize", resizeHandler);
    }

    private var frameCount = 0;

    private function enterFrameHandler(event:Event):void {
        var target = event.target;
        switch (frameCount) {
        case 0:
            target.x = 100;
            target.y = 100;
            break;
        case 1:
            trace("get x=" + target.x);
            trace("get y=" + target.y);
            target.width = 200;
            target.height = 200;
            break;
        case 2:
            trace("get height=" + target.width);
            trace("get width=" + target.height);
            target.alpha = 0.3;
            break;
        case 3:
            trace("get alpha=" + target.alpha);
            target.alpha = 1;
            var accessProps:AccessibilityProperties = new AccessibilityProperties();
            accessProps.name = "Greeting";
            target.accessibilityProperties = accessProps;
            trace("Capabilities.hasAccessibility=" + Capabilities.hasAccessibility);
            if (Capabilities.hasAccessibility) {
                Accessibility.updateProperties();
            }
            target.accessibilityProperties = accessProps;
            break;
        case 4:
            trace("get accessibilityProperties=" + target.accessibilityProperties.name);
            trace("set filters");
            var filter1:DropShadowFilter = new DropShadowFilter();
            var angleInDegrees:Number = 45;
            var colors:Array     = [0xFFFFFF, 0xFF0000, 0xFFFF00, 0x00CCFF];
            var alphas:Array     = [0, 1, 1, 1];
            var ratios:Array     = [0, 63, 126, 255];
            var blurX:Number     = 50;
            var blurY:Number     = 50;
            var strength:Number  = 2.5;
            var quality:Number   = BitmapFilterQuality.HIGH;
            var type:String      = BitmapFilterType.OUTER;
            var knockout:Boolean = false;
            var filter2:GradientGlowFilter = new GradientGlowFilter(distance,
                                          angleInDegrees,
                                          colors,
                                          alphas,
                                          ratios,
                                          blurX,
                                          blurY,
                                          strength,
                                          quality,
                                          type,
                                          knockout);
            target.filters = [filter1, filter2];
            break;
        case 5:
            trace("get filters: filters.length=" + target.filters.length);
            trace("set visible = false");
            target.visible = false;
            break;
        case 6:
            trace("get visible: " + target.visible);
            target.graphics.clear();
            target.visible = true;
            (function () {
                var red:uint = 0xFF0000;
                var green:uint = 0x00FF00;
                var blue:uint = 0x0000FF;
                var size:Number = 100;
                target.graphics.beginGradientFill(GradientType.LINEAR, [red, blue, green], [1, 0.5, 1], [0, 200, 255]);
                target.graphics.drawRect(0, 0, 100, 100);
            })();
            break;
        case 7:
            (function () {
                var skewMatrix:Matrix = new Matrix();
                skewMatrix.c = 0.25;
                var tempMatrix:Matrix = target.transform.matrix;
                tempMatrix.concat(skewMatrix);
                target.transform.matrix = tempMatrix;
                var rOffset:Number = target.transform.colorTransform.redOffset + 25;
                var bOffset:Number = target.transform.colorTransform.blueOffset - 25;
                target.transform.colorTransform = new ColorTransform(1, 1, 1, 1, rOffset, 0, bOffset, 0);            
            })();
            break;
        case 8:
            (function () {
                var container = new Sprite;
                container.x = 100;
                container.y = 100;
                container.rotation = -42;
                addChild(container);
                var child = new Shape;
                child.graphics.drawCircle(0, 0, 100);
                child.x = 50;
                child.y = 50;
                child.scaleX = -1;
                container.addChild(child);
                var bounds = child.getBounds(container);
                var result = 
                    ~~bounds.x === -50 &&
                    ~~bounds.y === -50 &&
                    ~~bounds.width === 200 &&
                    ~~bounds.height === 200 ? "PASS" : "FAIL";
                traceRoundedRect(bounds);
                trace(result + ": flash.display::DisplayObject/getBounds () [container]");

                var bounds = child.getBounds(child);
                var result =
                    ~~bounds.x === -100 &&
                    ~~bounds.y === -100 &&
                    ~~bounds.width === 200 &&
                    ~~bounds.height === 200 ? "PASS" : "FAIL";
                traceRoundedRect(bounds);
                trace(result + ": flash.display::DisplayObject/getBounds () [child]");

                var bounds = child.getBounds(target);
                var result =
                    ~~bounds.x === 29 &&
                    ~~bounds.y === -37 &&
                    ~~bounds.width === 282 &&
                    ~~bounds.height === 282 ? "PASS" : "FAIL";
                traceRoundedRect(bounds);
                trace(result + ": flash.display::DisplayObject/getBounds () [target, rotation]");

                function traceRoundedRect(rect) {
                    trace('(' +
                        'x=' + ~~rect.x + ', ' +
                        'y=' + ~~rect.y + ', ' +
                        'width=' + ~~rect.width + ', ' +
                        'height=' + ~~rect.height +
                    ')');
                }
            })();
            break;
        default:
            removeEventListener("enterFrame", enterFrameHandler);
        }
        frameCount++;
    }

    private var distance:Number  = 0;

    public function GradientGlowFilterExample() {
        draw();
        var filter:BitmapFilter = getBitmapFilter();
        var myFilters:Array = new Array();
        myFilters.push(filter);
        filters = myFilters;
    }

    private function getBitmapFilter():BitmapFilter {
       return new GradientGlowFilter();
    }

    private function removedHandler(event:Event):void {
        trace("removedHandler: " + event);
        stage.removeEventListener("resize", resizeHandler);
    }

    private function renderHandler(event:Event):void {
        trace("renderHandler: " + event);
    }

    private function resizeHandler(event:Event):void {
        trace("resizeHandler: " + event);
    }
}
