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

package flash.trace {

[native(cls='TraceClass')]
public class Trace {
  public static const OFF:int;
  public static const METHODS:int = 1;
  public static const METHODS_WITH_ARGS:int = 2;
  public static const METHODS_AND_LINES:int = 3;
  public static const METHODS_AND_LINES_WITH_ARGS:int = 4;
  public static const FILE = 1;
  public static const LISTENER = 2;
  public static native function setLevel(l:int, target:int = 2);
  public static native function getLevel(target:int = 2):int;
  public static native function setListener(f:Function);
  public static native function getListener():Function;
  public function Trace() {}
}
}
