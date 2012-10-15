const LoaderInfoDefinition = (function () {
  var def = {
    __class__: 'flash.display.LoaderInfo',

    initialize: function () {
      this._actionScriptVersion = null;
      this._backgroundColor = null;
      this._bytes = null;
      this._bytesLoaded = null;
      this._bytesTotal = null;
      this._content = null;
      this._contentType = null;
      this._frameRate = null;
      this._height = null;
      this._loader = null;
      this._loaderURL = null;
      this._parameters = null;
      this._swfVersion = null;
      this._url = null;
      this._width = null;
    },

    get actionScriptVersion() {
      return this._actionScriptVersion;
    },
    get applicationDomain() {
      notImplemented();
    },
    get backgroundColor() {
      return this._backgroundColor;
    },
    get bytes() {
      return this._bytes;
    },
    get bytesLoaded() {
      return this._bytesLoaded;
    },
    get bytesTotal() {
      return this._bytesTotal;
    },
    get childAllowsParent() {
      notImplemented();
    },
    get childSandboxBridge() {
      notImplemented();
    },
    set childSandboxBridge(val) {
      notImplemented();
    },
    get content() {
      return this._content;
    },
    get contentType() {
      return this._contentType;
    },
    get frameRate() {
      return this._frameRate;
    },
    get height() {
      return this._height;
    },
    get isURLInaccessible() {
      notImplemented();
    },
    get loader() {
      return this._loader;
    },
    get loaderURL() {
      return this._loaderURL;
    },
    get parameters() {
      return this._parameters;
    },
    get parentAllowsChild() {
      notImplemented();
    },
    get parentSandboxBridge() {
      notImplemented();
    },
    set parentSandboxBridge(val) {
      notImplemented();
    },
    get sameDomain() {
      notImplemented();
    },
    get sharedEvents() {
      notImplemented();
    },
    get swfVersion() {
      if (!this._swfVersion)
        throw Error();

      return this._swfVersion;
    },
    get uncaughtErrorEvents() {
      notImplemented();
    },
    get url() {
      return this._url;
    },
    get width() {
      return this._width;
    },

    getLoaderInfoByDefinition: function () {
      notImplemented();
    }
  };

  return def;
}).call(this);
