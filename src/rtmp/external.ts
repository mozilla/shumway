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

module RtmpJs.Browser {
  export class ShumwayComRtmpSocket {
    public static get isAvailable(): boolean {
      return !!(typeof ShumwayCom !== 'undefined' && ShumwayCom.createRtmpSocket);
    }

    private _socket: RtmpSocket;
    private _onopen: () => void;
    private _ondata: (e: {data: ArrayBuffer}) => void;
    private _ondrain: () => void;
    private _onerror: (e: any) => void;
    private _onclose: () => void;

    public constructor(host: string, port: number, params: any) {
      this._socket = ShumwayCom.createRtmpSocket({host: host, port: port, ssl: params.useSecureTransport});
    }

    get onopen(): () => void {
      return this._onopen;
    }
    set onopen(callback: () => void) {
      this._socket.setOpenCallback(this._onopen = callback);
    }

    get ondata(): (e: {data: ArrayBuffer}) => void {
      return this._ondata;
    }
    set ondata(callback: (e: {data: ArrayBuffer}) => void) {
      this._socket.setDataCallback(this._ondata = callback);
    }

    get ondrain(): () => void {
      return this._ondrain;
    }
    set ondrain(callback: () => void) {
      this._socket.setDrainCallback(this._ondrain = callback);
    }

    get onerror(): (e: any) => void {
      return this._onerror;
    }
    set onerror(callback: (e: any) => void) {
      this._socket.setErrorCallback(this._onerror = callback);
    }

    get onclose(): () => void {
      return this._onclose;
    }
    set onclose(callback: () => void) {
      this._socket.setCloseCallback(this._onclose = callback);
    }

    send(buffer: ArrayBuffer, offset: number, count: number): boolean {
      return this._socket.send(buffer, offset, count);
    }

    close(): void {
      this._socket.close();
    }
  }

  export class ShumwayComRtmpXHR {
    public static get isAvailable(): boolean {
      return !!(typeof ShumwayCom !== 'undefined' && ShumwayCom.createRtmpXHR);
    }

    private _xhr: RtmpXHR;
    private _onload: () => void;
    private _onerror: () => void;

    get status(): number {
      return this._xhr.status;
    }

    get response(): any {
      return this._xhr.response;
    }

    get responseType(): string {
      return this._xhr.responseType;
    }
    set responseType(type: string) {
      this._xhr.responseType = type;
    }

    get onload(): () => void {
      return this._onload;
    }
    set onload(callback: () => void) {
      this._xhr.setLoadCallback(this._onload = callback);
    }

    get onerror(): () => void {
      return this._onload;
    }
    set onerror(callback: () => void) {
      this._xhr.setErrorCallback(this._onerror = callback);
    }

    public constructor() {
      this._xhr = ShumwayCom.createRtmpXHR();
    }

    open(method: string, path: string, async: boolean = true): void {
      this._xhr.open(method, path, async);
    }

    setRequestHeader(header: string, value: string): void {
      this._xhr.setRequestHeader(header, value);
    }

    send(data?: any): void {
      this._xhr.send(data);
    }
  }
}
