package org.mozilla.vp6player {
  import flash.display.MovieClip;
  import flash.display.LoaderInfo;
  import flash.external.ExternalInterface;
  import flash.media.Video;
  import flash.net.NetConnection;
  import flash.net.NetStream;
  import flash.net.NetStreamAppendBytesAction;
  import flash.events.NetStatusEvent;
  import flash.events.SecurityErrorEvent;
  import flash.events.AsyncErrorEvent;
  import flash.system.Security;
  import flash.utils.ByteArray;

  public class VP6Player extends MovieClip {
    private var _video:Video;

    private var _connection:NetConnection;
    private var _stream:NetStream;
    private var _mediaUrl:String;
    private var _duration:Number;
    private var _volume:Number;
    private var _id:String;
    private var _buffer:ByteArray;

    public function VP6Player() {
      _video = new Video();
      addChild(_video);

      var params:Object = loaderInfo.parameters;
      _id = params['id'];
      initExternalMethods();

      ExternalInterface.call('Shumway.GFX.VP6Player.__init', _id);
      _volume = 1.0;
      syncProperties({paused: true, volume: _volume});
    }

    private function initExternalMethods():void {
      Security.allowDomain('*'); // Flash has file:/// origin -- allowing resource:// access us.
      ExternalInterface.addCallback('setProperty', this._setProperty);
      ExternalInterface.addCallback('play', this._play);
      ExternalInterface.addCallback('pause', this._pause);
      ExternalInterface.addCallback('getTime', this._getTime);
      ExternalInterface.addCallback('setTime', this._setTime);
      ExternalInterface.addCallback('getBufferedTime', this._getBufferedTime);
      ExternalInterface.addCallback('getBufferedTime', this._getBufferedTime);
      ExternalInterface.addCallback('addVP6Data', this._addVP6Data);
    }

    private function _setProperty(propertyName:String, value:*):void {
      switch (propertyName) {
        case 'src':
          if (this._mediaUrl != value) {
            this._mediaUrl = value;
            this._connection = null;
          }
          break;
        case 'volume':
          _volume = value;
          if (!_stream) {
            break;
          }
          var soundTransform = _stream.soundTransform;
          soundTransform.volume = value;
          _stream.soundTransform = soundTransform;
          break;
      }
    }

    private function _getTime():Number {
      return _stream.time;
    }

    private function _setTime(offset:Number):void {
      _stream.seek(offset);
    }

    private function _getBufferedTime():Number {
      return _stream.bytesLoaded / _stream.bytesTotal * _duration;
    }

    private static const base64DecodeMap:Array = [ // starts at 0x2B
      62, 0, 0, 0, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
      0, 0, 0, 0, 0, 0, 0, // 0x3A-0x40
      0,  1,  2,  3,  4,  5,  6, 7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
      19, 20, 21, 22, 23, 24, 25, 0, 0, 0, 0, 0, 0, // 0x5B-0x0x60
      26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
      44, 45, 46, 47, 48, 49, 50, 51];
    private static const base64DecodeMapOffset:int = 0x2B;
    private static const base64EOF:int = 0x3D;

    private static function _decodeBase64(encoded:String, decoded:ByteArray):void {
      var ch:int, code:int, code2:int;
      var i:int = 0;
      while (i < encoded.length) {
        ch = encoded.charCodeAt(i++);
        code = base64DecodeMap[ch - base64DecodeMapOffset];
        ch = encoded.charCodeAt(i++);
        code2 = base64DecodeMap[ch - base64DecodeMapOffset];
        decoded.writeByte((code << 2) | ((code2 & 0x30) >> 4));

        ch = encoded.charCodeAt(i++);
        if (ch == base64EOF) {
          break;
        }
        code = base64DecodeMap[ch - base64DecodeMapOffset];
        decoded.writeByte(((code2 & 0x0f) << 4) | ((code & 0x3c) >> 2));

        ch = encoded.charCodeAt(i++);
        if (ch == base64EOF) {
          break;
        }
        code2 = base64DecodeMap[ch - base64DecodeMapOffset];
        decoded.writeByte(((code & 0x03) << 6) | code2);
      }
    }

    private function _addVP6Data(data:String):void {
      if (data === null) {
        if (_stream) {
          _stream.appendBytesAction(NetStreamAppendBytesAction.END_SEQUENCE);
        }
        // TODO cache for !_stream
        return;
      }
      var decoded:ByteArray = _buffer || new ByteArray();
      _decodeBase64(data, decoded);
      if (_stream) {
        decoded.position = 0;
        _stream.appendBytes(decoded);
        _buffer = null;
      } else {
        _buffer = decoded;
      }
    }

    private function netStatusHandler(event:NetStatusEvent):void {
      switch (event.info.code) {
        case "NetConnection.Connect.Success":
          connectStream();
          break;
        case "NetStream.Play.Start":
          syncProperties({paused: false});
          dispatchPlayerEvent('loadeddata');
          break;
        case "NetStream.Play.Stop":
          dispatchPlayerEvent('ended');
          break;
        case "NetStream.Buffer.Full":
          dispatchPlayerEvent('canplay');
          break;
        case "NetStream.Buffer.Empty":
          //TODO
          break;
        case "NetStream.Pause.Notify":
          syncProperties({paused: true});
          dispatchPlayerEvent('pause');
          break;
        case "NetStream.Unpause.Notify":
          syncProperties({paused: false});
          dispatchPlayerEvent('play');
          break;
        case "NetStream.Seek.Notify":
          dispatchPlayerEvent('seeking');
          break;
        case "NetStream.Seek.Complete":
          dispatchPlayerEvent('seeked');
          break;
        case "NetStream.Play.NoSupportedTrackFound":
          syncProperties({errorCode: 4});
          dispatchPlayerEvent('error');
          break;
        case "NetStream.Play.FileStructureInvalid":
          syncProperties({errorCode: 3});
          dispatchPlayerEvent('error');
          break;
        case "NetStream.Play.StreamNotFound":
          syncProperties({errorCode: 2});
          dispatchPlayerEvent('error');
          break;
      }
    }

    private function securityErrorHandler(event:SecurityErrorEvent):void {
      trace("securityErrorHandler: " + event);
    }

    private function asyncErrorHandler(event:AsyncErrorEvent):void {
      // ignore AsyncErrorEvent events.
    }

    private function connectStream() {
      _stream = new NetStream(_connection);
      _stream.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
      _stream.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
      _stream.client = {
        onMetaData: this.onMetaData
      };
      _duration = NaN;
      var soundTransform = _stream.soundTransform;
      soundTransform.volume = _volume;
      _stream.soundTransform = soundTransform;

      _video.attachNetStream(_stream);

      var isStream = _mediaUrl.indexOf('flvstream:') == 0;
      if (isStream) {
        _stream.play(null);
        _stream.appendBytesAction(NetStreamAppendBytesAction.RESET_BEGIN);
        if (_buffer) {
          _buffer.position = 0;
          _stream.appendBytes(_buffer);
          _buffer = null;
        }
      } else {
        _stream.play(_mediaUrl);

      }
    }

    private function onMetaData(metadata:*) {
      syncProperties({
        videoWidth: metadata.width,
        videoHeight: metadata.height,
        duration: metadata.duration
      });
      _duration = metadata.duration;
      ExternalInterface.call('Shumway.GFX.VP6Player.__setSize', _id,  metadata.width,  metadata.height);
      dispatchPlayerEvent('loadedmetadata');
    }

    private function _play():void {
      if (!_connection) {
        _connection = new NetConnection();
        _connection.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
        _connection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
        _connection.connect(null);
        return;
      }

      _stream.resume();
    }

    private function _pause():void {
      _stream.pause();
    }

    private function syncProperties(props:*):void {
      ExternalInterface.call('Shumway.GFX.VP6Player.__syncProperties', _id, props);
    }

    private function dispatchPlayerEvent(eventName:String):void {
      ExternalInterface.call('Shumway.GFX.VP6Player.__dispatchEvent', _id, eventName);
    }
  }
}
