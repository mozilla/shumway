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
 * limitations undxr the License.
 */
// Class: AVM1TextField
module Shumway.AVM2.AS.avm1lib {
  import TextField = Shumway.AVM2.AS.flash.text.TextField;
  import TextFormat = Shumway.AVM2.AS.flash.text.TextFormat;

  export class AS2TextFormat extends TextFormat {
    private static _measureTextField: TextField;

    _as2GetTextExtent(text: string, width?: number) {
      var measureTextField = AS2TextFormat._measureTextField;
      if (!measureTextField) {
        measureTextField = new TextField();
        measureTextField.multiline = true;
        AS2TextFormat._measureTextField = measureTextField;
      }
      if (!isNaN(width) && width > 0) {
        measureTextField.width = width + 4;
        measureTextField.wordWrap = true;
      } else {
        measureTextField.wordWrap = false;
      }
      measureTextField.defaultTextFormat = this;
      measureTextField.text = text;
      var result = {};
      var textWidth = measureTextField.textWidth;
      var textHeight = measureTextField.textHeight;
      result.asSetPublicProperty('width', textWidth);
      result.asSetPublicProperty('height', textHeight);
      result.asSetPublicProperty('textFieldWidth', textWidth + 4);
      result.asSetPublicProperty('textFieldHeight', textHeight + 4);
      var metrics = measureTextField.getLineMetrics(0);
      result.asSetPublicProperty('ascent',
        metrics.asGetPublicProperty('ascent'));
      result.asSetPublicProperty('descent',
        metrics.asGetPublicProperty('descent'));
      return result;
    }
  }
}
