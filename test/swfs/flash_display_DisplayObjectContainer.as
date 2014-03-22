/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   node utils/compileabc.js --swf DisplayObjectContainerTest,600,600,60 -p test/swfs/flash_display_DisplayObjectContainer.as
*/

package {
    import flash.display.Sprite;
    import flash.events.Event;

    public class DisplayObjectContainerTest extends Sprite {
        public function DisplayObjectContainerTest() {
            var child:DisplayObjectContainerObject = new DisplayObjectContainerObject();
            addChild(child);
            addEventListener(Event.ENTER_FRAME, child.enterFrameHandler);
        }
    }
}

import flash.display.*;
import flash.events.*;

dynamic class DisplayObjectContainerObject extends Sprite {
    private var color:uint = 0xFFCC00;
    private var size:uint  = 80;

    public function DisplayObjectContainerObject() {
    }

    var cachedShape;

    private function _addChild():void {
        var shape = new Shape;
        shape.graphics.lineStyle(10, color);
        shape.graphics.moveTo(5, 5);
        shape.graphics.lineTo(95, 95);
        this.addChild(shape);
        var result = this.contains(shape) ? "PASS" : "FAIL";
        trace(result + ": flash.display::DisplayObjectContainer/addChild ()");
        trace(result + ": flash.display::DisplayObjectContainer/contains ()");
        var result = this.numChildren === 1 ? "PASS" : "FAIL";
        trace(result + ": flash.display::DisplayObjectContainer/get numChildren ()");
        cachedShape = shape;
    }

    private function _removeChild():void {
        var result = this.numChildren === 1 ? "PASS" : "FAIL";
        trace(result + ": flash.display::DisplayObjectContainer/get numChildren ()");
        this.removeChild(cachedShape);
        var result = this.numChildren === 0 ? "PASS" : "FAIL";
        trace(result + ": flash.display::DisplayObjectContainer/removeChild ()");
        trace(result + ": flash.display::DisplayObjectContainer/get numChildren ()");
    }

    private function _addChildAt():void {
        var shape1 = new Shape;
        shape1.graphics.beginFill(color, .3);
        shape1.graphics.drawRect(10, 10, 60, 60);
        this.addChildAt(shape1, 0);
        var shape2 = new Shape;
        shape2.graphics.beginFill(color << 8, .3);
        shape2.graphics.drawRect(30, 30, 60, 60);
        this.addChildAt(shape2, 0);
        var result = (this.getChildIndex(shape1) === 1 &&
                      this.getChildIndex(shape2) === 0) ? "PASS" : "FAIL";
        trace(result + ": flash.display::DisplayObjectContainer/addChildAt ()");
        trace(result + ": flash.display::DisplayObjectContainer/getChildIndex ()");
        var result = this.numChildren === 2 ? "PASS" : "FAIL";
        trace(result + ": flash.display::DisplayObjectContainer/get numChildren ()");
    }

    private function _removeChildAt():void {
        this.removeChildAt(1);
        var result = this.numChildren === 1 ? "PASS" : "FAIL";
        trace(result + ": flash.display::DisplayObjectContainer/removeChildAt ()");
        trace(result + ": flash.display::DisplayObjectContainer/get numChildren ()");
    }

    private function _getChildByName():void {
        var shape1 = new Shape;
        var name = "foo";
        shape1.graphics.beginFill(0x00FF00);
        shape1.graphics.drawRect(0, 0, 20, 100);
        shape1.name = name;
        this.addChildAt(shape1, 0);
        var result = (this.getChildByName(name).name === name) ? "PASS" : "FAIL";
        trace(result + ": flash.display::DisplayObjectContainer/getChildByName ()");
        trace(result + ": flash.display::DisplayObject/set name ()");
        trace(result + ": flash.display::DisplayObject/get name ()");
    }

    private function _set_mouseChildren():void {
        // FIXME needs UI testing
        this.mouseChildren = false;
        var result = this.mouseChildren === false ? "PASS" : "FAIL";
        trace(result + ": flash.display::DisplayObjectContainer/get mouseChildren ()");
        trace(result + ": flash.display::DisplayObjectContainer/set mouseChildren ()");
    }

    private function _set_tabChildren():void {
        // FIXME needs UI testing
        this.tabChildren = false;
        var result = this.tabChildren === false ? "PASS" : "FAIL";
        trace(result + ": flash.display::DisplayObjectContainer/get tabChildren ()");
        trace(result + ": flash.display::DisplayObjectContainer/set tabChildren ()");
    }

    private var frameCount = 0;

    function enterFrameHandler(event:Event):void {
        frameCount++;
        var target = event.target;
        switch (frameCount) {
        case 1:
            _addChild();
            break;
        case 2:
            _removeChild();
            break;
        case 3:
            _addChildAt();
            break;
        case 4:
            _removeChildAt();
            break;
        case 5:
            _getChildByName();
            break;
        case 6:
            _set_mouseChildren();
            break;
        case 7:
            _set_tabChildren();
            break;
        default:
            removeEventListener("enterFrame", enterFrameHandler);
            break;
        }
    }
}
