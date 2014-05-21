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
public final class GraphicsStroke implements IGraphicsStroke, IGraphicsData {
  public function GraphicsStroke(thickness:Number = NaN, pixelHinting:Boolean = false,
                                 scaleMode:String = "normal", caps:String = "none",
                                 joints:String = "round", miterLimit:Number = 3,
                                 fill:IGraphicsFill = null)
  {
    this.thickness = thickness;
    this.pixelHinting = pixelHinting;
    _scaleMode = scaleMode;
    _caps = caps;
    _joints = joints;
    this.miterLimit = miterLimit;
    this.fill = fill;

    switch (scaleMode) {
      case LineScaleMode.NONE:
      case LineScaleMode.NORMAL:
      case LineScaleMode.HORIZONTAL:
      case LineScaleMode.VERTICAL:
        break;
      default:
    }
    switch (caps) {
      case CapsStyle.NONE:
      case CapsStyle.ROUND:
      case CapsStyle.SQUARE:
        break;
      default:
        Error.throwError(ArgumentError, 2008, "caps");
    }
    switch (joints) {
      case JointStyle.BEVEL:
      case JointStyle.MITER:
      case JointStyle.ROUND:
        break;
      default:
        Error.throwError(ArgumentError, 2008, "joints");
    }
  }
  public var thickness:Number;
  public var pixelHinting:Boolean;
  public var miterLimit:Number;
  public var fill:IGraphicsFill;
  private var _scaleMode:String;
  private var _caps:String;
  private var _joints:String;
  public function get scaleMode():String {
    return _scaleMode;
  }
  public function set scaleMode(value:String):void {
    switch (value) {
      case LineScaleMode.NONE:
      case LineScaleMode.NORMAL:
      case LineScaleMode.HORIZONTAL:
      case LineScaleMode.VERTICAL:
        _scaleMode = value;
        break;
      default:
        Error.throwError(ArgumentError, 2008, "scaleMode");
    }
  }
  public function get caps():String {
    return _caps;
  }
  public function set caps(value:String):void {
    switch (value) {
      case CapsStyle.NONE:
      case CapsStyle.ROUND:
      case CapsStyle.SQUARE:
        _caps = value;
        break;
      default:
        Error.throwError(ArgumentError, 2008, "caps");
    }
  }
  public function get joints():String {
    return _joints;
  }
  public function set joints(value:String):void {
    switch (value) {
      case JointStyle.BEVEL:
      case JointStyle.MITER:
      case JointStyle.ROUND:
        _joints = value;
        break;
      default:
        Error.throwError(ArgumentError, 2008, "joints");
    }
  }
}
}
