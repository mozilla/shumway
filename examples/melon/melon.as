/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

/*
 Compiled with:
 node utils/compileabc.js --swf VideoExample,640,360,24 -p examples/melon/melon.as
 */

package {

import flash.media.Video;
import flash.net.NetConnection;
import flash.net.NetStream;
import flash.events.AsyncErrorEvent;
import flash.display.MovieClip;

public class VideoExample extends MovieClip {
  public function VideoExample() {
    var v: Video = new Video(640, 360);
    addChild(v);

    var n: NetConnection = new NetConnection();
    n.connect(null);

    var s: NetStream = new NetStream(n);
    //s.play("http://async5.org/moz/swfs/mozilla_story.mp4");
    s.play("http://videos-cdn.mozilla.net/brand/Mozilla_2011_Story.webm");

    v.attachNetStream(s);

    s.addEventListener(AsyncErrorEvent.ASYNC_ERROR, function () {
      return;
    });
  }
}
}
