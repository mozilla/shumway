/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

/*
 Compiled with:
 node utils/compileabc.js --swf VideoRTMPExample,640,360,24 -p examples/melon/melonRTMP.as
 */

package {

import flash.media.Video;
import flash.net.NetConnection;
import flash.net.NetStream;
import flash.events.AsyncErrorEvent;
import flash.events.NetStatusEvent;
import flash.display.MovieClip;

public class VideoRTMPExample extends MovieClip {
  public function VideoRTMPExample() {
    var v: Video = new Video(640, 360);
    addChild(v);

    var n: NetConnection = new NetConnection();
    n.connect("rtmpt://areweflashyet.com:8082/oflaDemo");

    var s: NetStream = null;
    n.addEventListener(NetStatusEvent.NET_STATUS, function (e:NetStatusEvent) {
      if (e.info.code == "NetConnection.Connect.Success") {
        s = new NetStream(n);
        s.play("mp4:mozilla_story.mp4");

        s.addEventListener(AsyncErrorEvent.ASYNC_ERROR, function () {
          return;
        });

        v.attachNetStream(s);
      }
      if (e.info.code == "NetConnection.Connect.Rejected") {
        trace("Error!");
      }
    });
  }
}
}
