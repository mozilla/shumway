package {

import flash.display.Sprite;
    import flash.display.StageScaleMode;
    import flash.media.Video;
    import flash.net.NetConnection;
    import flash.net.NetStream;

[SWF(width=640,height=390)]
public class YoutubeShim extends Sprite {

    public function YoutubeShim() {
        stage.scaleMode = StageScaleMode.NO_SCALE;
        const formats : Array = loaderInfo.parameters.fmt_list.split(',');
        const defs : Array = loaderInfo.parameters.
                url_encoded_fmt_stream_map.split(',');
        const streams : Array = [];
        const usableStreams : Array = [];
        var usedStream : Object;
        for (var i : int = 0; i < defs.length; i++) {
            var format : Array =  formats[i].split('/');
            var stream : Object = merge(parseEncodedVars(defs[i]), {});
            streams[i] = stream;
            var urlParts : Array = stream.url.split('?');
            merge(parseEncodedVars(urlParts[1]), stream);
            stream.url = urlParts[0];
            stream.signature = stream.sig;

            // Check for min player version for this format (9 == mp4)
            if (stream.type.indexOf('video/webm') !== -1) {
                var size : Array = format[1].split('x');
                stream.width = size[0];
                stream.height = size[1];
                usableStreams.push(stream);
                // Choose the first stream that's less than fullHD
                if (!usedStream) {
                    usedStream = merge(stream, {});
                }
            }
        }

        if (!usedStream) {
            throw new Error('No usable stream found');
        }

        const video : Video = new Video(stage.stageWidth, stage.stageHeight);
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

        const arg : Function = argGen(usedStream);

        var url : String = usedStream.url + '?'
          + [
             'algorithm=throttle-factor',
             'burst=40',
             arg('cp'),
             arg('expire'),
             'factor=1.25',
             arg('fexp', true),
             'gcr=us',
             arg('id'),
             arg('ip'),
             arg('ipbits'),
             arg('itag'),
             'keepalive=yes',
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

    private function argGen(stream : Object) : Function {
        return function(key : String, encode : Boolean = false) : String {
            var content : String = stream[key];
            if (encode)
                content = escape(content);
            return key + '=' + content;
        }
    }

    private function parseEncodedVars(str:String):Object {
        const entries : Array = str.split('&');
        const result : Object = {};
        for (var i:int = 0; i < entries.length; i++) {
            var keyValue : Array = entries[i].split('=');
            result[keyValue[0]] = unescape(keyValue[1]);
        }
        return result;
    }

    private function merge(obj : Object, into : Object) : Object {
        for (var k : String in obj) {
            into[k] = obj[k];
        }
        return into;
    }

    private function onMetaData(item : Object) : void {

    }

    private function onCuePoint(item : Object) : void {

    }
}
}
