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

module Shumway {
  import flash = Shumway.AVM2.AS.flash;

  export class TextContent implements Shumway.Remoting.IRemotable {
    _id: number;
    _isDirty: boolean;
    plainText: string;
    textRuns: flash.text.TextRun[];

    constructor() {
      this._id = flash.display.DisplayObject.getNextSyncID();
      this._isDirty = false;
      this.plainText = '';
      this.textRuns = [];
    }
  }
}
