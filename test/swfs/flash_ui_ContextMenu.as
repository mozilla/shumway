/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   java -jar utils/asc.jar -import playerglobal.abc -swf ContextMenuTest,600,600 test/swfs/flash_ui_ContextMenu.as
*/

package {
    import flash.display.Sprite;
    import flash.events.Event;

    public class ContextMenuTest extends Sprite {
        public var child;
        public function ContextMenuTest() {
            stage.frameRate = 10;
            child = new ContextMenuObject();
            addChild(child);
            addEventListener(Event.ENTER_FRAME, child.enterFrameHandler);
        }
    }
}

import flash.display.*;
import flash.events.*;
import flash.ui.*;

class ContextMenuObject extends Sprite {
    private var color:uint = 0xFFCC00;
    private var size:uint  = 80;

    public function ContextMenuObject() {
        var child = contextMenu = new ContextMenu;
        child.addEventListener(ContextMenuEvent.MENU_SELECT, menuSelectHandler);
    }

    function menuSelectHandler(e) {
        var result = true ? "PASS" : "FAIL";
        trace(result + ": flash.ui::ContextMenu/event menuSelect ()");
    }

    private var frameCount = 0;

    function enterFrameHandler(event:Event):void {
        frameCount++;
        var target = event.target;
        switch (frameCount) {
        case 1:
            (function () {
                var result = contextMenu.builtInItems.play ? "PASS" : "FAIL";
                trace(result + ": flash.ui::ContextMenu/get builtInItems ()");
            })();
            break;
        case 2:
            (function () {
                var result = false && contextMenu.clipboardItems.cut ? "PASS" : "FAIL";
                trace(result + ": flash.ui::ContextMenu/get clipboardItems ()");
            })();
            break;
        case 3:
            (function () {
                //contextMenu.clipboardMenu = true;
                var result = false && contextMenu.clipboardMenu ? "PASS" : "FAIL";
                trace(result + ": flash.ui::ContextMenu/get clipboardMenu ()");
            })();
            break;
        case 4:
            (function () {
                //contextMenu.clipboardMenu = true;
                var result = contextMenu.customItems instanceof Array ? "PASS" : "FAIL";
                trace(result + ": flash.ui::ContextMenu/get customItems ()");
            })();
            break;
        case 5:
            (function () {
                var result = false && ContextMenu.isSupported ? "PASS" : "FAIL";
                trace(result + ": flash.ui::ContextMenu$/get isSupported ()");
            })();
            break;
        case 6:
            (function () {
                contextMenu.hideBuiltInItems();
                var result = true ? "PASS" : "FAIL";                
                trace(result + ": flash.ui::ContextMenu/hideBuiltInItems ()");
            })();
            break;
        default:
            parent.removeEventListener("enterFrame", enterFrameHandler);
            break;
        }
    }
}
