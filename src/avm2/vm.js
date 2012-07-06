var AVM2 = (function () {

  function AVM2(builtinABC, mode) {
    if (!builtinABC) {
      throw new Error("Cannot initialize AVM2 without builtin.abc");
    }

    var sysDomain = new Domain(null, mode, true);
    sysDomain.executeAbc(new AbcFile(builtinABC), "builtin.abc");

    // TODO: this will change when we implement security domains.
    this.systemDomain = sysDomain;
    this.applicationDomain = new Domain(sysDomain, mode, false);
  }

  AVM2.prototype = {
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
    }
  };

  return AVM2;

})();
