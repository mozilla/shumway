/**
 * Copyright 2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module Shumway.GFX {

  var objectID = 0;
  function generateUniqueID(): string {
    return '_vp6player' + (objectID++);
  }

  var hiddenVP6PlayersLayer: HTMLElement;
  function getHiddenVP6PlayersLayer() {
    if (!hiddenVP6PlayersLayer) {
      hiddenVP6PlayersLayer = document.createElement('div');
      hiddenVP6PlayersLayer.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
      document.body.appendChild(hiddenVP6PlayersLayer);
    }
    return hiddenVP6PlayersLayer;
  }

  function packageAndSendVP6Data(obj: HTMLObjectElement, data: Uint8Array): void  {
    if (data == null) {
      (<any>obj).addVP6Data(null);
      return;
    }
    var maxSize = 1023; // divisible by 3
    var pos = 0;
    while (pos + maxSize < data.length) {
      var chunk = btoa(String.fromCharCode.apply(null, data.subarray(pos, pos + maxSize)));
      (<any>obj).addVP6Data(chunk);
      pos += maxSize;
    }
    var chunk = btoa(String.fromCharCode.apply(null, data.subarray(pos)));
    (<any>obj).addVP6Data(chunk);
  }

  export class VP6Player {
    public static SWFPath: string = 'resource://shumway/vp6player.swf';

    private _obj: HTMLObjectElement | any;
    private _shadowObj: any;
    private _initialized: boolean;
    private _playing: boolean;
    private _errorObj: {code: number};
    private _seekableObj: {length: number};
    private _bufferedObj: {length: number; end: (index: number) => number};
    private _vp6Data: Uint8Array[];

    public constructor() {
      var id = generateUniqueID();
      var proxy = this;
      var obj = document.createElement('object'), param;
      obj.id = id;
      obj.setAttribute('type', 'application/x-shockwave-flash');
      obj.setAttribute('data', VP6Player.SWFPath);
      // FIXME we still need to add file:/// path to vp6player.swf in the profile to the trusted Flash locations
      param = document.createElement('param');
      param.setAttribute('name', 'allowScriptAccess');
      param.setAttribute('value', 'always');
      obj.appendChild(param);
      param = document.createElement('param');
      param.setAttribute('name', 'scale');
      param.setAttribute('value', 'exactfit');
      obj.appendChild(param);
      param = document.createElement('param');
      param.setAttribute('name', 'flashvars');
      param.setAttribute('value', 'id=' + id);
      obj.appendChild(param);
      param = document.createElement('param');
      param.setAttribute('name', 'shumwaymode');
      param.setAttribute('value', 'off');
      obj.appendChild(param);

      this._obj = obj;
      this._shadowObj = Object.create(null);
      this._initialized = false;
      this._playing = false;

      this._errorObj = {
        get code() {
          return proxy._shadowObj.errorCode;
        }
      };
      this._seekableObj = {
        get length() {
          return proxy._initialized ? 1 : 0;
        }
      };
      this._bufferedObj = {
        get length() {
          return proxy._initialized ? 1 : 0;
        },
        end: function (index) {
          return this._obj._getBufferedTime();
        }
      };

      this._obj._proxy = this;
    }

    public static createDOMElement(): HTMLElement {
      var div = document.createElement('div');
      div.style.display = 'inline-block';
      VP6Player.call(div);
      var propertiesToTransfer = ['width', 'height', 'src', 'currentTime',
        'volume', 'error', 'videoWidth', 'videoHeight', 'paused', 'seekable',
        'buffered', 'play', 'pause', '_dispatchEvent', '_pushProperty',
        '_syncProperties', '_init', '_setSize', '_addVP6StreamData'];
      propertiesToTransfer.forEach((x) => {
        var desc = Object.getOwnPropertyDescriptor(VP6Player.prototype, x);
        Debug.assert(desc);
        Object.defineProperty(div, x, desc);
      });
      div.appendChild((<any>div)._obj);
      getHiddenVP6PlayersLayer().appendChild(div);
      return div;
    }

    public get width() {
      return this._obj.width;
    }

    public set width(value) {
      this._obj.width = value;
    }

    public  get height() {
      return this._obj.height;
    }

    public set height(value) {
      this._obj.height = value;
    }

    public get src(): string {
      return this._shadowObj.src;
    }

    public set src(value: string) {
      this._obj.setAttribute('data-src', 'vp6:' + value);
      this._shadowObj.src = value;
      this._pushProperty('src');
    }

    public get currentTime(): number {
      if (!this._initialized) {
        return NaN;
      }
      return this._obj.getTime();
    }

    public set currentTime(value: number) {
      this._obj.setTime(value);
    }

    public get volume(): number {
      return this._shadowObj.volume;
    }

    public set volume(value: number) {
      this._shadowObj.volume = value;
      this._pushProperty('volume');
    }

    public get error() {
      return this._errorObj;
    }

    public get videoWidth(): number {
      return this._shadowObj.videoWidth;
    }

    public get videoHeight(): number {
      return this._shadowObj.videoHeight;
    }

    public get duration(): number {
      return this._shadowObj.duration;
    }

    public get paused(): boolean {
      return this._shadowObj.paused;
    }

    public get seekable() {
      return this._seekableObj;
    }

    public get buffered() {
      return this._bufferedObj;
    }

    public play(): void {
      if (!this._initialized) {
        this._playing = true;
        return;
      }
      this._obj.play();
    }

    public pause(): void {
      if (!this._initialized) {
        this._playing = false;
        return;
      }
      this._obj.pause();
    }

    _dispatchEvent(eventName) {
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent(eventName, false, false, null);
      this._obj.parentElement.dispatchEvent(event);
    }

    _pushProperty(propName) {
      if (this._initialized) {
        this._obj.setProperty(propName, this._shadowObj[propName]);
      }
    }

    _syncProperties(props) {
      for (var i in props) {
        this._shadowObj[i] = props[i];
      }
    }

    _init() {
      this._initialized = true;
      if (this._shadowObj.src !== undefined) {
        this._pushProperty('src');
      }
      if (this._shadowObj.volume !== undefined) {
        this._pushProperty('volume');
      }
      if (this._vp6Data) {
        this._vp6Data.forEach((data) => {
          packageAndSendVP6Data(this._obj, data);
        });
        this._vp6Data = null;
      }
      if (this._playing) {
        this._obj.play();
      }
    }

    _setSize(width: number, height: number) {
      if (!this._obj.width) {
        this._obj.width = width;
      }
      if (!this._obj.height) {
        this._obj.height = height;
      }
    }

    _addVP6StreamData(data: Uint8Array) {
      if (this._initialized) {
        packageAndSendVP6Data(this._obj, data);
      } else {
        if (!this._vp6Data) {
          this._vp6Data = [];
        }
        this._vp6Data.push(data);
      }
    }

    static __dispatchEvent(id: string, eventName: string) {
      var target = <any>document.getElementById(id);
      target._proxy._dispatchEvent(eventName);
    }

    static __syncProperties(id: string, props: any) {
      var target = <any>document.getElementById(id);
      target._proxy._syncProperties(props);
    }

    static __init(id: string) {
      var target = <any>document.getElementById(id);
      target._proxy._init();
    }

    static __setSize(id: string, width: number, height: number) {
      var target = <any>document.getElementById(id);
      target._proxy._setSize(width, height);
    }

    public static get hiddenLayer() {
      return getHiddenVP6PlayersLayer();
    }

    public static addVP6StreamData(url: string, data: Uint8Array) {
      var target = <any>document.querySelector('object[data-src="' + url + '"]');
      target._proxy._addVP6StreamData(data);
    }
  }
}

