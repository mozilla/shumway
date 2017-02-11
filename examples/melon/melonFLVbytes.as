/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

/*
 Compiled with:
 node utils/compileabc.js --swf VideoFLVBytesExample,640,360,24 -p examples/melon/melonFLVbytes.as
 */

package {

import flash.media.Video;
import flash.net.NetConnection;
import flash.net.NetStream;
import flash.net.NetStreamAppendBytesAction;
import flash.events.AsyncErrorEvent;
import flash.net.URLLoader;
import flash.net.URLLoaderDataFormat;
import flash.net.URLRequest;
import flash.events.Event;
import flash.utils.ByteArray;

import flash.display.MovieClip;

public class VideoFLVBytesExample extends MovieClip {
  public function VideoFLVBytesExample() {
    var v: Video = new Video(640,360);
    addChild(v);

    var n: NetConnection = new NetConnection();
    n.connect(null);

    var s: NetStream = new NetStream(n);
    s.play(null);

    var req: URLRequest = new URLRequest("mozilla_story_part.flv");
    var loader: URLLoader = new URLLoader(req);
    loader.dataFormat = URLLoaderDataFormat.BINARY;
    loader.addEventListener(Event.COMPLETE, function (e:Event) {
      s.appendBytesAction(NetStreamAppendBytesAction.RESET_BEGIN);
      var buf: ByteArray = new ByteArray();
      var response: ByteArray = loader.data;
      response.position = 0;
      for (var i = 0; i < response.length; i++) {
        buf.writeByte(response.readByte());
        if (buf.length == 100) {
          buf.position = 0;
          s.appendBytes(buf);
          buf = new ByteArray();
        }
      }
      buf.position = 0;
      s.appendBytes(buf);
      s.appendBytesAction(NetStreamAppendBytesAction.END_SEQUENCE);
    });

    v.attachNetStream(s);

    s.addEventListener(AsyncErrorEvent.ASYNC_ERROR, function () {
      return;
    });
  }
}
}
