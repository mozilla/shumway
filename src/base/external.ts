/*
 * Copyright 2015 Mozilla Foundation
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

declare var ShumwayCom: {
  createSpecialInflate: () => SpecialInflate;
  createRtmpSocket: (options) => any;
  createRtmpXHR: ()=> XMLHttpRequest;
  userInput: () => void;
  fallback: () => void;
  endActivation: () => void;
  reportIssue: (details?: string) => void;
  reportTelemetry: (data) => void;
  enableDebug: () => void;
  getPluginParams: () => any;
  getSettings: () => any;
  setClipboard: (data: string) => void;
  setFullscreen: (enabled: boolean) => void;
  externalCom: (args: any) => any;
  loadFile: (args: any) => void;
  navigateTo: (args: any) => void;

  onLoadFileCallback: (data) => void;
  onExternalCallback: (call) => any;
};

interface SpecialInflate {
  onData: (data: Uint8Array) => void;
  push(data: Uint8Array);
  close();
}

