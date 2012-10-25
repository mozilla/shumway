var AVM2 = (function () {

  function AVM2(sysMode, appMode) {
    // TODO: this will change when we implement security domains.
    this.systemDomain = new Domain(this, null, sysMode, true);
    this.applicationDomain = new Domain(this, this.systemDomain, appMode, false);
  }

  /**
   * Returns the current VM context. This can be used to find out the VM execution context
   * when running in native code.
   */
  AVM2.currentVM = function () {
    return Runtime.stack.top().domain.system.vm;
  };

  /**
   * Returns true if AVM2 code is running, otherwise false.
   */
  AVM2.isRunning = function () {
    return Runtime.stack.length !== 0;
  };

  AVM2.prototype = {
    notifyConstruct: function notifyConstruct (instance, args) {
      // REMOVEME
    }
  };

  return AVM2;

})();
