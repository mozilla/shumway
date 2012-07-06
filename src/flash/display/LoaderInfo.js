function LoaderInfo() {
}

LoaderInfo.prototype = Object.create(new EventDispatcher, {
  actionScriptVersion: descAccessor(function() {
    return this._content;
  }),
  applicationDomain: descAccessor(function() {
    notImplemented();
  }),
  bytes: descAccessor(function() {
    return this._bytes;
  }),
  bytesLoaded: descAccessor(function() {
    return this._bytesLoaded;
  }),
  bytesTotal: descAccessor(function() {
    return this._bytesTotal;
  }),
  childAllowsParent: descAccessor(function() {
    notImplemented();
  }),
  childSandboxBridge: descAccessor(
    function() {
      notImplemented();
    },
    function(val) {
      notImplemented();
    }
  ),
  content: descAccessor(function() {
    return this._content;
  }),
  contentType: descAccessor(function() {
    return this._contentType;
  }),
  frameRate: descAccessor(function() {
    return this._frameRate;
  }),
  height: descAccessor(function() {
    return this._height;
  }),
  isURLInaccessible: descAccessor(function() {
    notImplemented();
  }),
  loader: descAccessor(function() {
    return this._loader;
  }),
  loaderURL: descAccessor(function() {
    return this._loaderURL;
  }),
  parameters: descAccessor(function() {
    return this._parameters;
  }),
  parentAllowsChild: descAccessor(function() {
    notImplemented();
  }),
  parentSandboxBridge: descAccessor(
    function() {
      notImplemented();
    },
    function(val) {
      notImplemented();
    }
  ),
  sameDomain: descAccessor(function() {
    notImplemented();
  }),
  sharedEvents: descAccessor(function() {
    notImplemented();
  }),
  swfVersion: descAccessor(function() {
    if (!this._swfVersion)
      throw Error();

    return this._swfVersion;
  }),
  uncaughtErrorEvents: descAccessor(function() {
    notImplemented();
  }),
  url: descAccessor(function() {
    return this._url;
  }),
  width: descAccessor(function() {
    return this._width;
  }),

  getLoaderInfoByDefinition: descMethod(function() {
    notImplemented();
  })
});
