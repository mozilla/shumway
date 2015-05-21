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
  export enum RemotingPhase {
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

  export enum MessageBits {
    HasMatrix                   = 0x0001,
    HasBounds                   = 0x0002,
    HasChildren                 = 0x0004,
    HasColorTransform           = 0x0008,
    HasClipRect                 = 0x0010,
    HasMiscellaneousProperties  = 0x0020,
    HasMask                     = 0x0040,
    HasClip                     = 0x0080
  }

  export enum IDMask {
    None                        = 0x00000000,
    Asset                       = 0x08000000
  }

  /**
   * Serialization Format. All commands start with a message tag.
   */
  export enum MessageTag {
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
  export enum ColorTransformEncoding {
    /**
     * Identity, no need to serialize all the fields.
     */
    Identity               = 0,

    /**
     * Identity w/ AlphaMultiplier, only the alpha multiplier is serialized.
     */
    AlphaMultiplierOnly    = 1,

    /**
     * All fields are serialized.
     */
    All                    = 2
  }

  export enum VideoPlaybackEvent {
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

  export enum VideoControlEvent {
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

  export enum StageScaleMode {
    ShowAll = 0,
    ExactFit = 1,
    NoBorder = 2,
    NoScale = 4
  }

  export enum StageAlignFlags {
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

  export enum KeyboardEventFlags {
    CtrlKey  = 0x0001,
    AltKey   = 0x0002,
    ShiftKey = 0x0004
  }

  export enum FocusEventType {
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
}
