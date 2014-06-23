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

package flash.globalization {

[native(cls='NumberParseResultClass')]
public final class NumberParseResult {
  public function NumberParseResult(value: Number = NaN, startIndex: int = 2147483647,
                                    endIndex: int = 2147483647)
  {
    ctor(value, startIndex, endIndex);
  }
  public native function get value(): Number;
  public native function get startIndex(): int;
  public native function get endIndex(): int;
  private native function ctor(value: Number, startIndex: int, endIndex: int): void;
}
}
