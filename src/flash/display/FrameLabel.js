var FrameLabelDefinition = (function () {
  return {
    // (name:String, frame:int)
    __class__: "flash.display.FrameLabel",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          ctor: function ctor(name, frame) { // (name:String, frame:int) -> void
            this._name = name;
            this._frame = frame;
          },
          name: {
            get: function name() { // (void) -> String
              return this._name;
            }
          },
          frame: {
            get: function frame() { // (void) -> int
              return this._frame;
            }
          }
        }
      },
    }
  };
}).call(this);
