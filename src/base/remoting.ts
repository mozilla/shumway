/**
 * Copyright 2014 Mozilla Foundation
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
module Shumway.Remoting {
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;

  export interface IRemotable {
    _id: number;
  }

  /**
   * Remoting phases.
   */
  export const enum RemotingPhase {
    /**
     * Objects are serialized. During this phase all reachable remotable objects (all objects
     * reachable from a root set) that are dirty are remoted. This includes all dirty object
     * properties except for dirty references.
     */
    Objects,

    /**
     * Object references are serialized. All objects that are referred to have already been
     * remoted at this point.
     */
    References
  }

  export const enum MessageBits {
    HasMatrix                   = 0x0001,
    HasBounds                   = 0x0002,
    HasChildren                 = 0x0004,
    HasColorTransform           = 0x0008,
    HasClipRect                 = 0x0010,
    HasMiscellaneousProperties  = 0x0020,
    HasMask                     = 0x0040,
    HasClip                     = 0x0080
  }

  export const enum IDMask {
    None                        = 0x00000000,
    Asset                       = 0x08000000
  }

  /**
   * Serialization Format. All commands start with a message tag.
   */
  export const enum MessageTag {
    EOF                         = 0,

    /**
     * id                   int32,
     * hasBits              int32,
     * matrix               Matrix,
     * colorMatrix          ColorMatrix,
     * mask                 int32,
     * misc
     *   blendMode          int32,
     *   visible            int32
     *
     * @type {number}
     */
    UpdateFrame                 = 100,
    UpdateGraphics              = 101,
    UpdateBitmapData            = 102,
    UpdateTextContent           = 103,
    UpdateStage                 = 104,
    UpdateNetStream             = 105,
    RequestBitmapData           = 106,
    UpdateCurrentMouseTarget    = 107,

    DrawToBitmap                = 200,

    MouseEvent                  = 300,
    KeyboardEvent               = 301,
    FocusEvent                  = 302
  }

  export enum FilterType {
    Blur,
    DropShadow,
    ColorMatrix
  }

  /**
   * Dictates how color transforms are encoded. The majority of color transforms are
   * either identity or only modify the alpha multiplier, so we can encode these more
   * efficiently.
   */
  export const enum ColorTransformEncoding {
    /**
     * Identity, no need to serialize all the fields.
     */
    Identity = 0,

    /**
     * Identity w/ AlphaMultiplier, only the alpha multiplier is serialized.
     */
    AlphaMultiplierOnly = 1,

    /**
     * Offsets w/ AlphaMultiplier.
     */
    AlphaMultiplierWithOffsets = 2,

    /**
     * All fields are serialized.
     */
    All = 3
  }

  /**
   * Dictates how matrices are encoded.
   */
  export const enum MatrixEncoding {
    /**
     * Translation only.
     */
    TranslationOnly = 0,

    /**
     * Scale and translation only.
     */
    ScaleAndTranslationOnly = 1,

    /**
     * Uniform scale in the x and y direction and translation only.
     */
    UniformScaleAndTranslationOnly = 2,

    /**
     * All fields are serialized.
     */
    All = 3
  }

  export const enum VideoPlaybackEvent {
    Initialized = 0,
    Metadata = 1,
    PlayStart = 2,
    PlayStop = 3,
    BufferEmpty = 4,
    BufferFull = 5,
    Pause = 6,
    Unpause = 7,
    Seeking = 8,
    Seeked = 9,
    Progress = 10,
    Error = 11,
  }

  export const enum VideoControlEvent {
    Init = 1,
    Pause = 2,
    Seek = 3,
    GetTime = 4,
    GetBufferLength = 5,
    SetSoundLevels = 6,
    GetBytesLoaded = 7,
    GetBytesTotal = 8,
    EnsurePlaying = 9,
  }

  export const enum StageScaleMode {
    ShowAll = 0,
    ExactFit = 1,
    NoBorder = 2,
    NoScale = 4
  }

  export const enum StageAlignFlags {
    None     = 0,
    Top      = 1,
    Bottom   = 2,
    Left     = 4,
    Right    = 8,

    TopLeft       = Top | Left,
    BottomLeft    = Bottom | Left,
    BottomRight   = Bottom | Right,
    TopRight      = Top | Right
  }

  export var MouseEventNames: string[] = [
    'click',
    'dblclick',
    'mousedown',
    'mousemove',
    'mouseup',
    'mouseover',
    'mouseout'
  ];

  export var KeyboardEventNames: string[] = [
    'keydown',
    'keypress',
    'keyup'
  ];

  export const enum KeyboardEventFlags {
    CtrlKey  = 0x0001,
    AltKey   = 0x0002,
    ShiftKey = 0x0004
  }

  export const enum FocusEventType {
    DocumentHidden,
    DocumentVisible,
    WindowBlur,
    WindowFocus
  }

  export interface DisplayParameters {
    stageWidth: number;
    stageHeight: number;
    pixelRatio: number;
    screenWidth: number;
    screenHeight: number;
  }

  export interface IGFXServiceObserver {
    displayParameters(displayParameters: DisplayParameters);
    focusEvent(data: any);
    keyboardEvent(data: any);
    mouseEvent(data: any);
    videoEvent(id: number, eventType: VideoPlaybackEvent, data: any);
  }

  export interface IGFXService {
    addObserver(observer: IGFXServiceObserver);
    removeObserver(observer: IGFXServiceObserver);

    update(updates: DataBuffer, assets: Array<DataBuffer>): void;
    updateAndGet(updates: DataBuffer, assets: Array<DataBuffer>): any;
    frame(): void;
    videoControl(id: number, eventType: VideoControlEvent, data: any): any;
    registerFont(syncId: number, data: Uint8Array): Promise<any>;
    registerImage(syncId: number, symbolId: number, imageType: ImageType,
                  data: Uint8Array, alphaData: Uint8Array): Promise<any>;
    fscommand(command: string, args: string): void;
  }

  /**
   * Messaging peer for sending data synchronously and asynchronously. Currently
   * used by GFX and Player iframes.
   */
  export interface ITransportPeer {
    onAsyncMessage: (msg: any) => void;
    onSyncMessage: (msg: any) => any;

    postAsyncMessage(msg: any, transfers?: any[]): void;
    sendSyncMessage(msg: any, transfers?: any[]): any;
  }

  /**
   * Implementation of ITransportPeer that uses standard DOM postMessage and
   * events to exchange data between messaging peers.
   */
  export class WindowTransportPeer implements ITransportPeer  {
    set onAsyncMessage(callback: (msg: any) => void) {
      this.window.addEventListener('message', function (e) {
        Promise.resolve(e.data).then(function (msg) { // delay
          callback(msg);
        });
      });
    }

    set onSyncMessage(callback: (msg: any) => any) {
      this.window.addEventListener('syncmessage', function (e) {
        var wrappedMessage = (<any>e).detail;
        wrappedMessage.result = callback(wrappedMessage.msg);
      });
    }

    constructor(public window: Window, public target: Window) {
      //
    }

    postAsyncMessage(msg: any, transfers?: any[]): void {
      this.target.postMessage(msg, '*', transfers);
    }

    sendSyncMessage(msg: any, transfers?: any[]): any {
      var event = this.target.document.createEvent('CustomEvent');
      var wrappedMessage = {
        msg: msg,
        result: undefined
      };
      event.initCustomEvent('syncmessage', false, false, wrappedMessage);
      this.target.dispatchEvent(event);
      return wrappedMessage.result;
    }
  }

  /**
   * Implementation of ITransportPeer that uses ShumwayCom API to exchange data
   * between messaging peers.
   */
  export class ShumwayComTransportPeer implements ITransportPeer  {
    set onAsyncMessage(callback: (msg: any) => void) {
      ShumwayCom.setAsyncMessageCallback(callback);
    }

    set onSyncMessage(callback: (msg: any) => any) {
      ShumwayCom.setSyncMessageCallback(callback);
    }

    postAsyncMessage(msg: any, transfers?: any[]): void {
      ShumwayCom.postAsyncMessage(msg);
    }

    sendSyncMessage(msg: any, transfers?: any[]): any {
      return ShumwayCom.sendSyncMessage(msg);
    }
  }
}
