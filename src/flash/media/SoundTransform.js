var SoundTransformDefinition = (function () {
  return {
    // (vol:Number = 1, panning:Number = 0)
    __class__: "flash.media.SoundTransform",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          volume: {
            get: function volume() { // (void) -> Number
              notImplemented("SoundTransform.volume");
              return this._volume;
            },
            set: function volume(volume) { // (volume:Number) -> void
              notImplemented("SoundTransform.volume");
              this._volume = volume;
            }
          },
          leftToLeft: {
            get: function leftToLeft() { // (void) -> Number
              notImplemented("SoundTransform.leftToLeft");
              return this._leftToLeft;
            },
            set: function leftToLeft(leftToLeft) { // (leftToLeft:Number) -> void
              notImplemented("SoundTransform.leftToLeft");
              this._leftToLeft = leftToLeft;
            }
          },
          leftToRight: {
            get: function leftToRight() { // (void) -> Number
              notImplemented("SoundTransform.leftToRight");
              return this._leftToRight;
            },
            set: function leftToRight(leftToRight) { // (leftToRight:Number) -> void
              notImplemented("SoundTransform.leftToRight");
              this._leftToRight = leftToRight;
            }
          },
          rightToRight: {
            get: function rightToRight() { // (void) -> Number
              notImplemented("SoundTransform.rightToRight");
              return this._rightToRight;
            },
            set: function rightToRight(rightToRight) { // (rightToRight:Number) -> void
              notImplemented("SoundTransform.rightToRight");
              this._rightToRight = rightToRight;
            }
          },
          rightToLeft: {
            get: function rightToLeft() { // (void) -> Number
              notImplemented("SoundTransform.rightToLeft");
              return this._rightToLeft;
            },
            set: function rightToLeft(rightToLeft) { // (rightToLeft:Number) -> void
              notImplemented("SoundTransform.rightToLeft");
              this._rightToLeft = rightToLeft;
            }
          }
        }
      },
    }
  };
}).call(this);
