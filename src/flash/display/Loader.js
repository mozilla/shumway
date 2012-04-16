function Loader() { }
Loader.cloneParams = function(LoaderContext) { notImplemented(); };

var p = Loader.prototype = new DisplayObjectContainer;
p._getJPEGLoaderContextdeblockingfilter = function(context) { notImplemented(); };

p._loadBytes = function(bytes,
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

p._unload = function(halt, gc) { notImplemented(); };
p._close = function() { notImplemented(); };
p._getUncaughtErrorEvents = function() { notImplemented(); };
p._setUncaughtErrorEvents = function(value) { notImplemented(); };

p._load = function(request,
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
