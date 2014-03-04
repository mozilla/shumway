/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   node utils/compileabc.js --swf LoaderTest,100,100,10 -p test/swfs/flash_display_Loader.as
*/

package {

    import flash.display.Sprite;
    import flash.events.Event;

    public class LoaderTest extends Sprite {
        public var loader;
        public function LoaderTest() {
            loader = new CustomLoader();
            addChild(loader);
        }
    }
}

import flash.display.*;
import flash.events.*;
import flash.net.*;

class CustomLoader extends Loader {
    private var bgColor: uint = 0xFFCC00;
    private var pos: uint     = 10;
    private var size: uint    = 80;
    private var url           = "flash_display_Shape.swf";

    public function CustomLoader() {
        configureListeners(contentLoaderInfo);
        var request:URLRequest = new URLRequest(url);
        load(request);
    }

    private function configureListeners(dispatcher:IEventDispatcher):void {
        dispatcher.addEventListener(Event.COMPLETE, completeHandler);
        dispatcher.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
        dispatcher.addEventListener(Event.INIT, initHandler);
        dispatcher.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
        dispatcher.addEventListener(Event.OPEN, openHandler);
        dispatcher.addEventListener(ProgressEvent.PROGRESS, progressHandler);
        dispatcher.addEventListener(Event.UNLOAD, unloadHandler);
    }

    var ticket = 1;
    var completeHandlerTicket = 0;
    var initHandlerTicket = 0;
    var httpStatusHandlerTicket = 0;
    var openHandlerTicket = 0;
    var progressHandlerTicket = 0;
    var unloadHandlerTicket = 0;
    var ioErrorHandlerTicket = 0;

    private function completeHandler(event:Event):void {
        trace("completeHandler: " + ticket);
        completeHandlerTicket = ticket++;
        var result = 
            (initHandlerTicket !== 0 &&
             completeHandlerTicket !== 0 &&
             initHandlerTicket < completeHandlerTicket) ? "PASS" : "FAIL";
        trace(result + ": flash.display::Loader/load ()");
        this.parent.addEventListener("enterFrame", enterFrameHandler);
    }
    
    private function httpStatusHandler(event:HTTPStatusEvent):void {
        trace("httpStatusHandler: " + ticket);
        httpStatusHandlerTicket = ticket;
    }

    private function initHandler(event:Event):void {
        trace("initHandler: " + ticket);
        initHandlerTicket = ticket++;
    }

    private function ioErrorHandler(event:IOErrorEvent):void {
        trace("ioErrorHandler: " + ticket);
        ioErrorHandlerTicket = ticket;
    }

    private function openHandler(event:Event):void {
        trace("openHandler: " + ticket);
        openHandlerTicket = ticket++;
    }

    private function progressHandler(event:ProgressEvent):void {
        trace("progressHandler: " + ticket + " bytesLoaded=" + event.bytesLoaded + " bytesTotal=" + event.bytesTotal);
        progressHandlerTicket = ticket;
    }

    private function unloadHandler(event:Event):void {
        trace("unloadHandler: " + ticket);
        unloadHandlerTicket = ticket;
    }

    private var frameCount = 0;

    function enterFrameHandler(event:Event):void {
        frameCount++;
        var target = event.target;
        var loader = target.loader;
        switch (frameCount) {
        case 1:
            (function () {
                var result = loader.content !== null ? "PASS" : "FAIL";
                trace(result + ": flash.display::Loader/get content");
            })();
            break;
        case 2:
            (function () {
                var loaderInfo = loader.contentLoaderInfo;
                var result = (loaderInfo !== null &&
                              loaderInfo.url != null) ? "PASS" : "FAIL";
                trace(result + ": flash.display::Loader/get contentLoaderInfo");
            })();
            break;
        case 3:
            (function () {
                var result = loader.uncaughtErrorEvents !== null ? "PASS" : "FAIL";
                trace(result + ": flash.display::Loader/get uncaughtErrorEvents");
            })();
            break;
        default:
            break;
        }
    }

}
