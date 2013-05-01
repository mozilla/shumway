package {

import flash.display.DisplayObject;
import flash.display.Loader;
import flash.display.Sprite;
import flash.events.Event;
import flash.events.IOErrorEvent;
import flash.events.ProgressEvent;
import flash.net.URLRequest;

public class Imageloading extends Sprite {
  private var _loader:Loader;
  private const IMAGES : Array = ['firefox.png', 'alf.jpg'];

  public function Imageloading() {
    loadNext(0);
  }

  private function loadNext(left : int):void {
    trace("load next");
    if (IMAGES.length) {
      trace(IMAGES);
      load('../image-loading/' + IMAGES.shift());
      _loader.x = left;
    } else {
      trace('finished loading');
    }
  }

  private function load(src:String):void {
    _loader = new Loader();
    _loader.contentLoaderInfo.addEventListener(Event.OPEN, loader_open);
    _loader.contentLoaderInfo.addEventListener(ProgressEvent.PROGRESS, loader_progress);
    _loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, loader_ioError);
    _loader.contentLoaderInfo.addEventListener(Event.INIT, loader_init);
    addChild(_loader);
    trace('start loading', src);
    _loader.load(new URLRequest(src));
  }

  private function loader_open(event:Event):void {
    trace('loading started');
  }

  private function loader_progress(event:ProgressEvent):void {
    trace('loading progress: ' +  _loader.contentLoaderInfo.bytesLoaded + '/' +
          _loader.contentLoaderInfo.bytesTotal);
  }

  private function loader_ioError(event:IOErrorEvent):void {
    trace('loading error');
  }

  private function loader_init(event:Event):void {
    var image : DisplayObject = _loader.content;
    image.addEventListener(Event.REMOVED, image_removed);
    image.x = _loader.x;
    trace("init");
    addChild(image);
    loadNext(image.x + image.width + 10);
  }

  private function image_removed(event:Event):void {
    trace("removed");
  }
}
}
