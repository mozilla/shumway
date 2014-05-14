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
  export enum UpdateFrameTagBits {
    HasMatrix                   = 0x0001,
    HasBounds                   = 0x0002,
    HasChildren                 = 0x0004,
    HasColorTransform           = 0x0008,
    HasMiscellaneousProperties  = 0x0010
  }

  export enum MessageTag {
    EOF = 0,
    UpdateFrame   = 1
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
}
