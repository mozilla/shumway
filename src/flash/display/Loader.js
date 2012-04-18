function Loader() { }
Loader.cloneParams = function (LoaderContext) { notImplemented(); };

Loader.prototype = new DisplayObjectContainer;
Loader.prototype._getJPEGLoaderContextdeblockingfilter = function (context) { notImplemented(); };

Loader.prototype._loadBytes = function (bytes,
                        checkPolicyFile,
                        applicationDomain,
                        securityDomain,
                        requestedContentParent,
                        parameters,
                        deblockingFilter,
                        allowLoadBytesCodeExecution,
                        imageDecodingPolicy) {
  notImplemented();
};

Loader.prototype._unload = function (halt, gc) { notImplemented(); };
Loader.prototype._close = function () { notImplemented(); };
Loader.prototype._getUncaughtErrorEvents = function () { notImplemented(); };
Loader.prototype._setUncaughtErrorEvents = function (value) { notImplemented(); };

Loader.prototype._load = function (request,
                   checkPolicyFile,
                   applicationDomain,
                   securityDomain,
                   requestedContentParent,
                   parameters,
                   deblockingFilter,
                   allowCodeExecution,
                   imageDecodingPolicy) {
  notImplemented();
};

natives.LoaderClass = function (scope, instance, baseClass) {
  var c = new Class("Loader", Loader, Class.passthroughCallable(Loader));
  c.baseClass = baseClass;
  c.nativeMethods = Loader.prototype;
  c.makeSimpleNativeAccessors("get", ["content","contentLoaderInfo"]);
  c.nativeStatics = Loader;
  return c;
};
