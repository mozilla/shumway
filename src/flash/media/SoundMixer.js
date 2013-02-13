var SoundMixerDefinition = (function () {
  var def = {};

  var registeredChannels = [];

  function stopAll() {
    registeredChannels.forEach(function (channel) {
      channel.stop();
    });
    registeredChannels = [];
  }

  function _registerChannel(channel) {
    registeredChannels.push(channel);
  }

  function _unregisterChannel(channel) {
    var index = registeredChannels.indexOf(channel);
    if (index >= 0)
      registeredChannels.splice(index, 1);
  }

  def.__glue__ = {
    native: {
      static: {
        stopAll: stopAll,
        _registerChannel: _registerChannel,
        _unregisterChannel: _unregisterChannel
      }
    }
  };

  return def;
}).call(this);
