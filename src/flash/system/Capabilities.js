var CapabilitiesDefinition = (function () {
  var def = {};

  var os;
  var userAgent = window.navigator.userAgent;
  if (userAgent.indexOf("Macintosh") > 0) {
    os = "Mac OS 10.5.2";
  } else if (userAgent.indexOf("Windows") > 0) {
    os = "Windows XP";
  } else if (userAgent.indexOf("Linux") > 0) {
    os = "Linux";
  } else {
    notImplemented();
  }

  def.__glue__ = {
    native: {
      static: {
        version: {
          get: function version() {
            return 'SHUMWAY 10,0,0,0';
          },
          enumerable: true
        },
        os: {
          get: function () {
            return os;
          },
          enumerable: true
        },
      }
    },
    script: {
      static: scriptProperties("public", [
        "version",
        "os",
      ])
    }
  };

  return def;
}).call(this);
