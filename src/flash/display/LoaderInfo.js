function LoaderInfo() {
  EventDispatcher.call(this);

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
}

LoaderInfo.prototype = Object.create(EventDispatcher.prototype, {
  __class__: describeInternalProperty('flash.display.LoaderInfo'),

  actionScriptVersion: describeAccessor(function () {
    return this._actionScriptVersion;
  }),
  applicationDomain: describeAccessor(function () {
    notImplemented();
  }),
  backgroundColor: describeAccessor(function () {
    return this._backgroundColor;
  }),
  bytes: describeAccessor(function () {
    return this._bytes;
  }),
  bytesLoaded: describeAccessor(function () {
    return this._bytesLoaded;
  }),
  bytesTotal: describeAccessor(function () {
    return this._bytesTotal;
  }),
  childAllowsParent: describeAccessor(function () {
    notImplemented();
  }),
  childSandboxBridge: describeAccessor(
    function () {
      notImplemented();
    },
    function(val) {
      notImplemented();
    }
  ),
  content: describeAccessor(function () {
    return this._content;
  }),
  contentType: describeAccessor(function () {
    return this._contentType;
  }),
  frameRate: describeAccessor(function () {
    return this._frameRate;
  }),
  height: describeAccessor(function () {
    return this._height;
  }),
  isURLInaccessible: describeAccessor(function () {
    notImplemented();
  }),
  loader: describeAccessor(function () {
    return this._loader;
  }),
  loaderURL: describeAccessor(function () {
    return this._loaderURL;
  }),
  parameters: describeAccessor(function () {
    return this._parameters;
  }),
  parentAllowsChild: describeAccessor(function () {
    notImplemented();
  }),
  parentSandboxBridge: describeAccessor(
    function () {
      notImplemented();
    },
    function(val) {
      notImplemented();
    }
  ),
  sameDomain: describeAccessor(function () {
    notImplemented();
  }),
  sharedEvents: describeAccessor(function () {
    notImplemented();
  }),
  swfVersion: describeAccessor(function () {
    if (!this._swfVersion)
      throw Error();

    return this._swfVersion;
  }),
  uncaughtErrorEvents: describeAccessor(function () {
    notImplemented();
  }),
  url: describeAccessor(function () {
    return this._url;
  }),
  width: describeAccessor(function () {
    return this._width;
  }),

  getLoaderInfoByDefinition: describeMethod(function () {
    notImplemented();
  })
});
