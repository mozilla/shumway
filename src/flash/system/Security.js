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

var SecurityDefinition = (function () {
  var _exactSettings;

  return {
    // ()
    __class__: "flash.system.Security",
    initialize: function () {
    },

    __glue__: {
      native: {
        static: {
          allowDomain: function allowDomain() {
            // (...) -> void
            // notImplemented("Security.allowDomain");
            somewhatImplemented("Security.allowDomain [\"" + Array.prototype.join.call(arguments, "\", \"") + "\"]");
          },
          allowInsecureDomain: function allowInsecureDomain() {
            // (void) -> void
            somewhatImplemented("Security.allowInsecureDomain");
          },
          loadPolicyFile: function loadPolicyFile(url) {
            // (url:String) -> void
            notImplemented("Security.loadPolicyFile");
          },
          duplicateSandboxBridgeInputArguments: function duplicateSandboxBridgeInputArguments(toplevel, args) {
            // (toplevel:Object, args:Array) -> Array
            notImplemented("Security.duplicateSandboxBridgeInputArguments");
          },
          duplicateSandboxBridgeOutputArgument: function duplicateSandboxBridgeOutputArgument(toplevel, arg) {
            // (toplevel:Object, arg) -> any
            notImplemented("Security.duplicateSandboxBridgeOutputArgument");
          },
          showSettings: function showSettings(panel) {
            // (panel:String = "default") -> void
            notImplemented("Security.showSettings");
          },
          exactSettings: {
            get: function () { return _exactSettings; },
            set: function (value) { _exactSettings = value; }
          },
          disableAVM1Loading: {
            get: function disableAVM1Loading() {
              // (void) -> Boolean
              notImplemented("Security.disableAVM1Loading");
            },
            set: function disableAVM1Loading(value) {
              // (value:Boolean) -> void
              notImplemented("Security.disableAVM1Loading");
            }
          },
          sandboxType: {
            get: function () {
              somewhatImplemented("Security.sandboxType");
              return "remote";
            }
          },
          pageDomain: {
            get: function pageDomain() {
              // (void) -> String
              notImplemented("Security.pageDomain");
            }
          }
        }
      }
    }
  };
}).call(this);
