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
module Shumway.Tools.Profiler.TraceLogger {

  export interface TreeItem {
    start: number;
    stop: number;
    textId: number;
    nextId: number;
    hasChildren: boolean;
  }

  enum Offsets {
    START_HI =  0,
    START_LO =  4,
    STOP_HI  =  8,
    STOP_LO  = 12,
    TEXTID   = 16,
    NEXTID   = 20
  }

  export class Thread {

    private _data: DataView;
    private _text: Shumway.MapObject<string>;
    private _buffer: TimelineBuffer;

    private static ITEM_SIZE = 8 + 8 + 4 + 4;

    constructor(data: any []) {
      if (data.length >= 2) {
        this._text = data[0];
        this._data = new DataView(data[1]);
        this._buffer = new TimelineBuffer();
        this._walkTree(0);
      }
    }

    get buffer(): TimelineBuffer {
      return this._buffer;
    }

    private _walkTree(id: number) {
      var data = this._data;
      var buffer = this._buffer;
      do {
        var index = id * Thread.ITEM_SIZE;
        var start = data.getUint32(index + Offsets.START_HI, false) * 4294967295 + data.getUint32(index + Offsets.START_LO, false);
        var stop = data.getUint32(index + Offsets.STOP_HI, false) * 4294967295 + data.getUint32(index + Offsets.STOP_LO, false);
        var textId = data.getUint32(index + Offsets.TEXTID, false);
        var nextId = data.getUint32(index + Offsets.NEXTID, false);
        var hasChildren = ((textId & 1) === 1);
        textId >>>= 1;
        var text = this._text[textId];
        buffer.enter(text, null, start / 1000000);
        if (hasChildren) {
          this._walkTree(id + 1);
        }
        buffer.leave(text, null, stop / 1000000);
        id = nextId;
      } while(id !== 0);
    }

  }
}
