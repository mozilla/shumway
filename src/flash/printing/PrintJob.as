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

package flash.printing {
import flash.display.Sprite;
import flash.events.EventDispatcher;
import flash.geom.Rectangle;

public class PrintJob extends EventDispatcher {
  public static function get isSupported(): Boolean {
    notImplemented("isSupported");
    return false;
  }
  public function PrintJob() {}
  public function get paperHeight(): int {
    notImplemented("paperHeight");
    return -1;
  }
  public function get paperWidth(): int {
    notImplemented("paperWidth");
    return -1;
  }
  public function get pageHeight(): int {
    notImplemented("pageHeight");
    return -1;
  }
  public function get pageWidth(): int {
    notImplemented("pageWidth");
    return -1;
  }
  public function get orientation(): String {
    notImplemented("orientation");
    return "";
  }
  public function start(): Boolean {
    notImplemented("start");
    return false;
  }
  public function send(): void { notImplemented("send"); }
  public function addPage(sprite: Sprite, printArea: Rectangle = null,
                          options: PrintJobOptions = null,
                          frameNum: int = 0): void { notImplemented("addPage"); }
}
}
