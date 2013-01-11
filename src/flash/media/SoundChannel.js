var SoundChannelDefinition = (function () {
  return {
    // ()
    initialize: function () {
      this._element = document.createElement('audio');
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          // (void) -> void
          stop: function stop() {
            this._element.pause();
          },
          "position": {
            // (void) -> Number
            get: function position() {
              return this._element.currentTime * 1000;
            }
          }
        }
      }
    }
  };
}).call(this);