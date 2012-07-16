function LoaderInfo() {
  this._symbols = new ObjDictionary;
}

function ObjDictionary() {
  this.promises = this;
}
ObjDictionary.prototype = {
  getPromise: function(objId) {
    if (!(objId in this.promises)) {
      var promise = new Promise();
      this.promises[objId] = promise;
    }
    return this.promises[objId];
  },
  isPromiseExists: function(objId) {
    return objId in this.promises;
  }
};

LoaderInfo.prototype = Object.create(new EventDispatcher, {
  actionScriptVersion: describeAccessor(function () {
    return this._content;
  }),
  applicationDomain: describeAccessor(function () {
    notImplemented();
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
  }),

  _getSymbolById: describeMethod(function (id) {
    return this._symbols[id];
  })
});
