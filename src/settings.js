
(function(_) {

  var ROOT = "Shumway Options";

  var shumwayOptions = new Shumway.Options.OptionSet(ROOT, loadShumwaySettings());

  function isStorageSupported() {
    try {
      return window &&
             "localStorage" in window &&
             window["localStorage"] !== null;
    } catch (e) {
      return false;
    }
  }

  function loadShumwaySettings() {
    var settings = {};
    if (isStorageSupported()) {
      var lsValue = window.localStorage[ROOT];
      if (lsValue) {
        try {
          settings = JSON.parse(lsValue);
        } catch (e) {
        }
      }
    }
    return settings;
  }

  function saveShumwaySettings(settings) {
    if (isStorageSupported()) {
      try {
        window.localStorage[ROOT] = JSON.stringify(shumwayOptions.getSettings());
      } catch (e) {
      }
    }
  }

  _.shumwayOptions = shumwayOptions;
  _.loadShumwaySettings = loadShumwaySettings;
  _.saveShumwaySettings = saveShumwaySettings;

})(this);
