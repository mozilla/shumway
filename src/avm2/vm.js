var AVM2 = (function () {

  function AVM2(builtinABC, sysMode, appMode) {
    if (!builtinABC) {
      throw new Error("Cannot initialize AVM2 without builtin.abc");
    }

    assert(builtinABC.name === "builtin.abc", "builtinABC's name must be 'builtin.abc'");

    var sysDomain = new Domain(this, null, sysMode, true);
    sysDomain.executeAbc(builtinABC);

    // TODO: this will change when we implement security domains.
    this.systemDomain = sysDomain;
    this.applicationDomain = new Domain(this, sysDomain, appMode, false);

    // Triggered whenever an AS3 class instance is constructed.
    this.onConstruct = undefined;
  }

  AVM2.currentVM = function () {
    return Runtime.stack.top().domain.vm;
  };

  AVM2.prototype = {
    /*
    loadPlayerGlobal: function (playerGlobalSWF) {
      var sysDomain = this.systemDomain;
      // Load, but don't execute, the default player globals.
      Timer.start("Load Player Globals");
      SWF.parse(playerGlobalSWF, {
        oncomplete: function(result) {
          var tags = result.tags;
          for (var i = 0, n = tags.length; i < n; i++) {
            var tag = tags[i];
            if (tag.type === "abc") {
              sysDomain.loadAbc(new AbcFile(tag.data, "playerGlobal/library" + i + ".abc"));
            }
          }
        }
      });
      Timer.stop();
    },
    */
    notifyConstruct: function notifyConstruct (instance, args) {
      return this.onConstruct ? this.onConstruct(instance, args) : undefined;
    }
  };

  return AVM2;

})();
