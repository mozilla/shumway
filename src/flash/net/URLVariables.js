var URLVariablesDefinition = (function () {
  var def = {
    initialize: function() {
    },

    ctor : function ctor(str) {
      str && decode(str);
    },

    decode : function decode(str) {
      trace("URLVars.decode");
      var parts = str.split('&');

      for (var i = 0; i < parts.length; i++) {
        var keyVal = parts[i].split('=');
        this[Multiname.getPublicQualifiedName(keyVal[0])] =
            decodeURIComponent(keyVal[1]);
      }
    },

    toString : function toString() {
      trace("URLVars.toString");
      return Object.keys(this).map(function(key) {
        return Multiname.fromQualifiedName(key).name + '=' + this[key]
      }).join('&');
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        ctor : def.ctor,
        decode: def.decode,
        toString : def.toString
      }
    }
  };

  return def;
}).call(this);
