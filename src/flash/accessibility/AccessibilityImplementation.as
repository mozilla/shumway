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

package flash.accessibility {
import flash.geom.Rectangle;

public class AccessibilityImplementation {
  public function AccessibilityImplementation() {}
  public var stub: Boolean;
  public var errno: uint;
  public function get_accRole(childID: uint): uint {
    notImplemented("get_accRole");
    return 0;
  }
  public function get_accName(childID: uint): String {
    notImplemented("get_accName");
    return "";
  }
  public function get_accValue(childID: uint): String {
    notImplemented("get_accValue");
    return "";
  }
  public function get_accState(childID: uint): uint {
    notImplemented("get_accState");
    return 0;
  }
  public function get_accDefaultAction(childID: uint): String {
    notImplemented("get_accDefaultAction");
    return "";
  }
  public function accDoDefaultAction(childID: uint): void { notImplemented("accSelect"); }
  public function isLabeledBy(labelBounds: Rectangle): Boolean {
    notImplemented("isLabeledBy");
    return false;
  }
  public function getChildIDArray(): Array {
    notImplemented("getChildIDArray");
    return null;
  }
  public function accLocation(childID: uint) { notImplemented("accLocation"); }
  public function get_accSelection(): Array {
    notImplemented("get_accSelection");
    return null;
  }
  public function get_accFocus(): uint {
    notImplemented("get_accFocus");
    return 0;
  }
  public function accSelect(operation: uint, childID: uint): void { notImplemented("accSelect"); }
  public function get_selectionAnchorIndex() { notImplemented("get_selectionAnchorIndex"); }
  public function get_selectionActiveIndex() { notImplemented("get_selectionActiveIndex"); }
}
}
