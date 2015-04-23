/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

/*
 Compiled with:
 node utils/compileabc.js --swf VideoFLVExample,640,360,24 -p examples/melon/melonFLV.as
 */

package {

import flash.media.Video;
import flash.net.NetConnection;
import flash.net.NetStream;
import flash.events.AsyncErrorEvent;
import flash.display.MovieClip;

public class VideoFLVExample extends MovieClip {
  public function VideoFLVExample() {
    var v: Video = new Video(640, 360);
    addChild(v);

    var n: NetConnection = new NetConnection();
    n.connect(null);

    var s: NetStream = new NetStream(n);
    s.play("mozilla_story_part.flv");

    v.attachNetStream(s);

    s.addEventListener(AsyncErrorEvent.ASYNC_ERROR, function () {
      return;
    });
  }
}
}
