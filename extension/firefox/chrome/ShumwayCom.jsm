/*
 * Copyright 2014 Mozilla Foundation
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

var EXPORTED_SYMBOLS = ['ShumwayCom'];

Components.utils.import('chrome://shumway/content/SpecialInflate.jsm');
Components.utils.import('chrome://shumway/content/RtmpUtils.jsm');

var ShumwayCom = {
  createAdapter: function (content, callbacks) {
    function setFullscreen(value) {
      callbacks.sendMessage('setFullscreen', value, false);
    }

    function endActivation() {
      callbacks.sendMessage('endActivation', null, false);
    }

    function fallback() {
      callbacks.sendMessage('fallback', null, false);
    }

    function getSettings() {
      var compilerSettings = JSON.parse(callbacks.sendMessage('getCompilerSettings', null, true));
      var turboMode = JSON.parse(callbacks.sendMessage('getBoolPref', {pref: 'shumway.turboMode', def: false}, true));
      var hud = JSON.parse(callbacks.sendMessage('getBoolPref', {pref: 'shumway.hud', def: false}, true));
      var forceHidpi = JSON.parse(callbacks.sendMessage('getBoolPref', {pref: 'shumway.force_hidpi', def: false}, true));
      return Components.utils.cloneInto({
        compilerSettings: compilerSettings,
        misc: {
          turboMode: turboMode,
          hud: hud,
          forceHidpi: forceHidpi
        }
      }, content);
    }

    function getPluginParams() {
      return Components.utils.cloneInto(
        JSON.parse(callbacks.sendMessage('getPluginParams', null, true)), content);
    }

    function reportIssue() {
      callbacks.sendMessage('reportIssue', null, false);
    }

    function externalCom(args) {
      var result = String(callbacks.sendMessage('externalCom', args, true));
      return result === 'undefined' ? undefined :
        Components.utils.cloneInto(JSON.parse(result), content);
    }

    function loadFile(args) {
      callbacks.sendMessage('loadFile', args, false);
    }

    function reportTelemetry(args) {
      callbacks.sendMessage('reportTelemetry', args, false);
    }

    function setClipboard(args) {
      callbacks.sendMessage('setClipboard', args, false);
    }

    function navigateTo(args) {
      callbacks.sendMessage('navigateTo', args, false);
    }

    function userInput() {
      callbacks.sendMessage('userInput', null, true);
    }

    // Exposing ShumwayCom object/adapter to the unprivileged content -- setting
    // up Xray wrappers.
    var shumwayComAdapter = Components.utils.createObjectIn(content, {defineAs: 'ShumwayCom'});
    Components.utils.exportFunction(callbacks.enableDebug, shumwayComAdapter, {defineAs: 'enableDebug'});
    Components.utils.exportFunction(setFullscreen, shumwayComAdapter, {defineAs: 'setFullscreen'});
    Components.utils.exportFunction(endActivation, shumwayComAdapter, {defineAs: 'endActivation'});
    Components.utils.exportFunction(fallback, shumwayComAdapter, {defineAs: 'fallback'});
    Components.utils.exportFunction(getSettings, shumwayComAdapter, {defineAs: 'getSettings'});
    Components.utils.exportFunction(getPluginParams, shumwayComAdapter, {defineAs: 'getPluginParams'});
    Components.utils.exportFunction(reportIssue, shumwayComAdapter, {defineAs: 'reportIssue'});
    Components.utils.exportFunction(externalCom, shumwayComAdapter, {defineAs: 'externalCom'});
    Components.utils.exportFunction(loadFile, shumwayComAdapter, {defineAs: 'loadFile'});
    Components.utils.exportFunction(reportTelemetry, shumwayComAdapter, {defineAs: 'reportTelemetry'});
    Components.utils.exportFunction(setClipboard, shumwayComAdapter, {defineAs: 'setClipboard'});
    Components.utils.exportFunction(navigateTo, shumwayComAdapter, {defineAs: 'navigateTo'});
    Components.utils.exportFunction(userInput, shumwayComAdapter, {defineAs: 'userInput'});

    Object.defineProperties(shumwayComAdapter, {
      onLoadFileCallback: { value: null, writable: true },
      onExternalCallback: { value: null, writable: true },
    });

    // Exposing createSpecialInflate function for DEFLATE stream decoding using
    // Gecko API.
    if (SpecialInflateUtils.isSpecialInflateEnabled) {
      Components.utils.exportFunction(function () {
        return SpecialInflateUtils.createWrappedSpecialInflate(content);
      }, shumwayComAdapter, {defineAs: 'createSpecialInflate'});
    }

    if (RtmpUtils.isRtmpEnabled) {
      Components.utils.exportFunction(function (params) {
        return RtmpUtils.createSocket(content, params);
      }, shumwayComAdapter, {defineAs: 'createRtmpSocket'});
      Components.utils.exportFunction(function () {
        return RtmpUtils.createXHR(content);
      }, shumwayComAdapter, {defineAs: 'createRtmpXHR'});
    }

    Components.utils.makeObjectPropsNormal(shumwayComAdapter);

    return shumwayComAdapter;
  }
};