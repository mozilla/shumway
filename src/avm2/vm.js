var AVM2 = (function () {

  function AVM2(sysMode, appMode) {
    // TODO: this will change when we implement security domains.
    this.systemDomain = new Domain(this, null, sysMode, true);
    this.applicationDomain = new Domain(this, this.systemDomain, appMode, true);

    // Triggered whenever an AS3 class instance is constructed.
    this.onConstruct = undefined;
  }

  /**
   * Returns the current VM context. This can be used to find out the VM execution context
   * when running in native code.
   */
  AVM2.currentVM = function () {
    return Runtime.stack.top().domain.system.vm;
  };

  AVM2.prototype = {
    notifyConstruct: function notifyConstruct (instance, args) {
      return this.onConstruct ? this.onConstruct(instance, args) : undefined;
    }
  };

  return AVM2;

})();
