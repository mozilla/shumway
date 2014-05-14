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

package flash.display {
public final class JPEGXREncoderOptions {
  public function JPEGXREncoderOptions(quantization:uint = 20, colorSpace:String = "auto",
                                       trimFlexBits:uint = 0)
  {
    this.quantization = quantization;
    this.colorSpace = colorSpace;
    this.trimFlexBits = trimFlexBits;
  }
  public var quantization:uint;
  public var colorSpace:String;
  public var trimFlexBits:uint;
}
}
