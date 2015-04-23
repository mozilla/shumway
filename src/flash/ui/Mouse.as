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

package flash.ui {

[native(cls='MouseClass')]
public final class Mouse {
  public static native function get supportsCursor(): Boolean;
  public static native function get cursor(): String;
  public static native function set cursor(value: String): void;
  public static native function get supportsNativeCursor(): Boolean;
  public static native function hide(): void;
  public static native function show(): void;
  public static native function registerCursor(name: String, cursor: MouseCursorData): void;
  public static native function unregisterCursor(name: String): void;
  public native function Mouse();
}
}
