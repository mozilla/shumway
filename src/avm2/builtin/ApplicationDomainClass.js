natives.ApplicationDomainClass = function ApplicationDomainClass(scope, instance, baseClass) {
  function ApplicationDomain(parentDomain) {
    instance.call(this, parentDomain);
  };
  var c = new Class("ApplicationDomain", ApplicationDomain, Class.passthroughCallable(ApplicationDomain));
  c.extend(baseClass);
  var m = ApplicationDomain.prototype;
  var s = {};
  s["get currentDomain"] = function currentDomain() {
    return new ApplicationDomain();
  };
  s["get MIN_DOMAIN_MEMORY_LENGTH"] = function MIN_DOMAIN_MEMORY_LENGTH() {
    notImplemented("ApplicationDomain.MIN_DOMAIN_MEMORY_LENGTH");
  };
  m.ctor = function ctor(parentDomain) {
    this.parentDomain = parentDomain;
  };
  m["get parentDomain"] = function parentDomain() {
    return this.parentDomain;
  };
  m.getDefinition = function getDefinition(name) {
    return toplevel.getTypeByName(Multiname.fromSimpleName(name), true, true);
  };
  m.hasDefinition = function hasDefinition(name) {
    return !!toplevel.getTypeByName(Multiname.fromSimpleName(name), true);
  };
  m["get domainMemory"] = function domainMemory() {
    notImplemented("ApplicationDomain.domainMemory");
  };
  // Signature: mem:ByteArray
  m["set domainMemory"] = function domainMemory(mem) {
    notImplemented("ApplicationDomain.domainMemory");
  };
  c.nativeMethods = m;
  c.nativeStatics = s;

  return c;
};