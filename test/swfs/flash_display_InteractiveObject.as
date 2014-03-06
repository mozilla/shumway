/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   node utils/compileabc.js --swf InteractiveObjectTest,400,400,60 -p test/swfs/flash_display_InteractiveObject.as
*/

package {

    import flash.display.Sprite;
    import flash.events.Event;

    public class InteractiveObjectTest extends Sprite {
        public function InteractiveObjectTest() {
            var child:InteractiveObjectObject = new InteractiveObjectObject();
            addChild(child);
            addEventListener(Event.ENTER_FRAME, child.enterFrameHandler);
        }
    }
}

import flash.display.*;
import flash.events.*;
import flash.ui.*;

class InteractiveObjectObject extends Sprite {
    private var bgColor: uint = 0xFFCC00;
    private var pos: uint     = 10;
    private var size: uint    = 80;

    public function InteractiveObjectObject() {
        graphics.beginFill(bgColor);
        graphics.drawRect(10, 10, size, size);
        var contextMenuItem:ContextMenuItem = new ContextMenuItem("red");
        contextMenuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, menuItemSelectHandler);
        var contextMenu:ContextMenu = new ContextMenu();
        contextMenu.customItems.push(contextMenuItem);
        contextMenu.hideBuiltInItems();
        this.contextMenu = contextMenu;
    }

    function menuItemSelectHandler(evt:ContextMenuEvent):void {
        graphics.clear();
        graphics.beginFill(0xFF0000);
        graphics.drawRect(10, 10, 80, 80);
        graphics.endFill();
    }

    private var frameCount = 0;

    function enterFrameHandler(event:Event):void {
        frameCount++;
        var target = event.target;
        switch (frameCount) {
        case 1:
            (function () {
                target.tabEnabled = true;
                var result = target.tabEnabled === true ? "PASS" : "FAIL";
                trace(result + ": flash.display::InteractiveObject/get tabEnabled ()");
                trace(result + ": flash.display::InteractiveObject/set tabEnabled ()");
                // FIXME needs UI test
            })();
            break;
        case 2:
            (function () {
                target.doubleClickEnabled = true;
                var result = target.doubleClickEnabled === true ? "PASS" : "FAIL";
                trace(result + ": flash.display::InteractiveObject/get doubleClickEnabled ()");
                trace(result + ": flash.display::InteractiveObject/set doubleClickEnabled ()");
                // FIXME needs UI test
            })();
            break;
        case 3:
            (function () {
                target.mouseEnabled = true;
                var result = target.mouseEnabled === true ? "PASS" : "FAIL";
                trace(result + ": flash.display::InteractiveObject/get mouseEnabled ()");
                trace(result + ": flash.display::InteractiveObject/set mouseEnabled ()");
                // FIXME needs UI test
            })();
            break;
        case 4:
            (function () {
                target.tabIndex = 1;
                var result = target.tabIndex === 1 ? "PASS" : "FAIL";
                trace(result + ": flash.display::InteractiveObject/get tabIndex ()");
                trace(result + ": flash.display::InteractiveObject/set tabIndex()");
                // FIXME needs UI test
            })();
            break;
        default:
            removeEventListener("enterFrame", enterFrameHandler);
            break;
        }
    }

}
