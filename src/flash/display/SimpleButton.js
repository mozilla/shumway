const SimpleButtonDefinition = (function () {
  var def = {
    __class__: 'flash.display.SimpleButton',

    initialize: function () {
    },

    _updateButton: function () {
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        _updateButton: def._updateButton
      }
    }
  };

  return def;
}).call(this);
