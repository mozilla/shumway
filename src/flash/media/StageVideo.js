var StageVideoDefinition = (function () {
  return {
    // ()
    __class__: "flash.media.StageVideo",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          attachNetStream: function attachNetStream(netStream) { // (netStream:NetStream) -> void
            notImplemented("StageVideo.attachNetStream");
          },
          attachCamera: function attachCamera(theCamera) { // (theCamera:Camera) -> void
            notImplemented("StageVideo.attachCamera");
          },
          viewPort: {
            get: function viewPort() { // (void) -> Rectangle
              notImplemented("StageVideo.viewPort");
              return this._viewPort;
            },
            set: function viewPort(rect) { // (rect:Rectangle) -> void
              notImplemented("StageVideo.viewPort");
              this._viewPort = rect;
            }
          },
          pan: {
            set: function pan(point) { // (point:Point) -> void
              notImplemented("StageVideo.pan");
              this._pan = point;
            },
            get: function pan() { // (void) -> Point
              notImplemented("StageVideo.pan");
              return this._pan;
            }
          },
          zoom: {
            set: function zoom(point) { // (point:Point) -> void
              notImplemented("StageVideo.zoom");
              this._zoom = point;
            },
            get: function zoom() { // (void) -> Point
              notImplemented("StageVideo.zoom");
              return this._zoom;
            }
          },
          depth: {
            set: function depth(depth) { // (depth:int) -> void
              notImplemented("StageVideo.depth");
              this._depth = depth;
            },
            get: function depth() { // (void) -> int
              notImplemented("StageVideo.depth");
              return this._depth;
            }
          },
          videoWidth: {
            get: function videoWidth() { // (void) -> int
              notImplemented("StageVideo.videoWidth");
              return this._videoWidth;
            }
          },
          videoHeight: {
            get: function videoHeight() { // (void) -> int
              notImplemented("StageVideo.videoHeight");
              return this._videoHeight;
            }
          },
          colorSpaces: {
            get: function colorSpaces() { // (void) -> Vector
              notImplemented("StageVideo.colorSpaces");
              return this._colorSpaces;
            }
          }
        }
      },
    }
  };
}).call(this);
