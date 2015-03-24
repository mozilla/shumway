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
  createRtmpSocket: (options: {host: string; port: number; ssl: boolean}) => RtmpSocket;
  createRtmpXHR: () => RtmpXHR;
  createSpecialStorage: () => SpecialStorage;
  getWeakMapKeys: (weakMap) => Array<any>;
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
  loadSystemResource: (id: number) => void;
  navigateTo: (args: any) => void;
  setupComBridge: (playerWindow: any) => void;
  postSyncMessage: (data: any) => any;

  setLoadFileCallback: (callback: (data) => void) => void;
  setExternalCallback: (callback: (call) => any) => void;
  setSystemResourceCallback: (callback: (id: number, data: any) => void) => void;
  setSyncMessageCallback: (callback: (data: any) => any) => void;
};

interface SpecialStorage {
  getItem(key: string): string;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface SpecialInflate {
  setDataCallback(callback: (data: Uint8Array) => void): void;
  push(data: Uint8Array);
  close();
}

interface RtmpSocket {
  setOpenCallback(callback: () => void): void;
  setDataCallback(callback: (e: {data: ArrayBuffer}) => void): void;
  setDrainCallback(callback: () => void): void;
  setErrorCallback(callback: (e: any) => void): void;
  setCloseCallback(callback: () => void): void;

  send(buffer: ArrayBuffer, offset: number, count: number): boolean;
  close(): void;
}

interface RtmpXHR {
  status: number;
  response: any;
  responseType: string;

  setLoadCallback(callback: () => void): void;
  setErrorCallback(callback: () => void): void;

  open(method: string, path: string, async?: boolean): void;
  setRequestHeader(header: string, value: string): void;
  send(data?: any): void;
}
