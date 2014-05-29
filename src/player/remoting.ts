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

  export enum UpdateFrameTagBits {
    HasMatrix                   = 0x0001,
    HasBounds                   = 0x0002,
    HasChildren                 = 0x0004,
    HasColorTransform           = 0x0008,
    HasMiscellaneousProperties  = 0x0010
  }

  export enum IDMask {
    None                        = 0x00000000,
    Asset                       = 0x80000000
  }

  export enum MessageTag {
    EOF                         = 0,

    UpdateFrame                 = 100,
    UpdateGraphics              = 101,
    UpdateBitmapData            = 102,

    BitmapDataDraw              = 200,

    MouseEvent                  = 300,
    KeyboardEvent               = 301
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


  export var MouseEventNames: string[] = [
    'click',
    'dblclick',
    'mousedown',
    'mousemove',
    'mouseup'
    //'mouseover',
    //'mouseout'
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

  export interface IPlayerChannel {
    sendUpdates(updates: DataBuffer, assets: Array<DataBuffer>);
    registerForEventUpdates(listener: (updates: DataBuffer) => void);
  }

  export interface IGFXChannel {
    sendEventUpdates(update: DataBuffer);
    registerForUpdates(listener: (updates: DataBuffer, assets: Array<DataBuffer>) => void);
  }
}
