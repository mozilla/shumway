package {

import flash.display.Loader;
import flash.display.Sprite;
import flash.events.Event;
import flash.events.IOErrorEvent;
import flash.events.ProgressEvent;
import flash.net.URLRequest;

public class Imageloading extends Sprite {
  private var _loader:Loader;

  public function Imageloading() {
    load('../image-loading/firefox.png');
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
    trace('finished loading');
  }
}
}
