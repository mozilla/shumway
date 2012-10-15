const NetStreamDefinition = (function () {
  var def = {
    play: function (url) {
      this._url = url;
    }
  };

  return def;
}).call(this);
