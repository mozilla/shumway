var SceneDefinition = (function () {
  return {
    // (name:String, labels:Array, numFrames:int)
    __class__: "flash.display.Scene",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
        }
      },
      script: {
        static: {
          // ...
        },
        instance: {
          name: {
            get: function name() { // (void) -> String
              notImplemented("Scene.name");
              return this._name;
            }
          },
          labels: {
            get: function labels() { // (void) -> Array
              notImplemented("Scene.labels");
              return this._labels;
            }
          },
          numFrames: {
            get: function numFrames() { // (void) -> int
              notImplemented("Scene.numFrames");
              return this._numFrames;
            }
          }
        }
      }
    }
  };
}).call(this);
