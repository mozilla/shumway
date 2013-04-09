package {

import flash.display.Sprite;
    import flash.media.Video;
    import flash.net.NetConnection;
    import flash.net.NetStream;
    import flash.net.URLVariables;

public class YoutubeShim extends Sprite {
    public function YoutubeShim() {
        const formats : Array = loaderInfo.parameters.fmt_list.split(',');
        const defs : Array = loaderInfo.parameters.
                url_encoded_fmt_stream_map.split(',');
        const streams : Array = [];
        const mp4s : Array = [];
        var usedStream : Object;
        for (var i : int = 0; i < defs.length; i++) {
            var format : Array = formats[i].split('/');
            var stream : Object = merge(new URLVariables(defs[i]), {});
            streams[i] = stream;
            var urlParts : Array = stream.url.split('?');
            merge(new URLVariables(urlParts[1]), stream);
            stream.url = urlParts[0];
            stream.signature = stream.sig;

            // Check for min player version for this format (9 == mp4)
            if (format[2] == '9' && stream.type.indexOf('video/mp4') !== -1) {
                var size : Array = format[1].split('x');
                stream.width = size[0];
                stream.height = size[1];
                mp4s.push(stream);
                // Choose the first stream that's less than fullHD
                if (!usedStream) {
                    usedStream = stream;
                }
            }
        }

        if (!usedStream) {
            throw new Error('No usable stream found');
        }

        const video : Video = new Video(usedStream.width, usedStream.height);
        video.width = stage.stageWidth;
        video.height = stage.stageHeight;
        addChild(video);
        const nc : NetConnection = new NetConnection();
        nc.connect(null);
        const ns : NetStream = new NetStream(nc);
        ns.client = {};
        ns.client.onMetaData = onMetaData;
        ns.client.onCuePoint = onCuePoint;
        video.attachNetStream(ns);

        function arg(key : String, encode : Boolean = false) : String {
            var content = usedStream[key];
            if (encode)
                content = escape(content);
            return key + '=' + content;
        }

        var url : String = usedStream.url + '?'
          + 'algorithm=throttle-factor&burst=40&factor=1.25&gcr=us&keepalive=yes&'
          + [arg('cp'),
             arg('expire'),
             arg('fexp', true),
             arg('id'),
             arg('ip'),
             arg('ipbits'),
             arg('itag'),
             arg('key'),
             arg('ms'),
             arg('mt'),
             arg('mv'),
             arg('newshard'),
             arg('ratebypass'),
             arg('signature'),
             arg('source'),
             arg('sparams', true),
             arg('sver'),
             arg('upn')].join('&');
        ns.play(url);
    }

    private function merge(obj : Object, into : Object) : Object {
        for (var k : String in obj)
            into[k] = obj[k];
        return into;
    }

    private function onMetaData(item : Object) : void {

    }

    private function onCuePoint(item : Object) : void {

    }
}
}
