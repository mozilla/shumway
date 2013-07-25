/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var AVM2 = (function () {

  function avm2(sysMode, appMode, findDefiningAbc) {
    // TODO: this will change when we implement security domains.
    this.systemDomain = new Domain(this, null, sysMode, true);
    this.applicationDomain = new Domain(this, this.systemDomain, appMode, false);
    this.findDefiningAbc = findDefiningAbc;


    /**
     * All runtime exceptions are boxed in this object to tag them as having
     * originated from within the VM.
     */
    this.exception = { value: undefined };
  }

  // We sometimes need to know where we came from, such as in
  // |ApplicationDomain.currentDomain|.

  avm2.currentDomain = function () {
    var caller = arguments.callee;
    var maxDepth = 20;
    var domain;
    for (var i = 0; i < maxDepth && caller; i++) {
      var mi = caller[VM_METHOD_INFO];
      if (mi) {
        domain = mi.abc.domain;
        break;
      }
      caller = caller.caller;
    }
    assert (domain, "No domain environment was found on the stack, increase STACK_DEPTH or " +
                    "make sure that a compiled / interpreted function is on the call stack.");
    return domain;
  };

  avm2.callStack = [];

  /**
   * This only works for interpreter frames.
   */
  avm2.getStackTrace = function getStackTrace () {
    return avm2.callStack.slice().reverse().map(function (frame) {
      var str = "";
      if (frame.method) {
        if (frame.method.holder) {
          str += frame.method.holder + " ";
        }
        str += frame.method + ":";
      }
      return str + frame.bc.originalPosition;
    }).join("\n");
  };

  /**
   * Returns the current VM context. This can be used to find out the VM execution context
   * when running in native code.
   */
  avm2.currentVM = function () {
    return avm2.stack.top().domain.system.vm;
  };

  /**
   * Returns true if AVM2 code is running, otherwise false.
   */
  avm2.isRunning = function () {
    return avm2.stack.length !== 0;
  };

  avm2.prototype = {
    notifyConstruct: function notifyConstruct (instanceConstructor, args) {
      // REMOVEME
    }
  };

  return avm2;

})();
