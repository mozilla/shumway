var NetStreamDefinition = (function () {
  var def = {
    ctor: function(connection, peerID) {
      // notImplemented();
    },
    play: function (url) {
      this._url = url;
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        ctor: def.ctor,
        play: def.play
      }
    }
  };

  return def;
}).call(this);
