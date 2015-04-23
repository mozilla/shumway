/*
 * Copyright 2013 Mozilla Foundation
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

/// <reference path='references.ts'/>
module Shumway.SWF {
  export var StreamNoDataError = {};

  function Stream_align() {
    this.bitBuffer = this.bitLength = 0;
  }

  function Stream_ensure(size: number) {
    if (this.pos + size > this.end) {
      throw StreamNoDataError;
    }
  }

  function Stream_remaining(): number {
    return this.end - this.pos;
  }

  function Stream_substream(begin: number, end: number): Stream {
    var stream = new Stream(this.bytes);
    stream.pos = begin;
    stream.end = end;
    return stream;
  }

  function Stream_push(data) {
    var bytes = this.bytes;
    var newBytesLength = this.end + data.length;
    if (newBytesLength > bytes.length) {
      throw 'stream buffer overfow';
    }
    bytes.set(data, this.end);
    this.end = newBytesLength;
  }


  export class Stream {
    bytes: Uint8Array;
    pos: number;
    end: number;

    bitBuffer: number;
    bitLength: number;

    align: () => void;
    ensure: (size: number) => void;
    remaining: () => number;
    substream: (begin: number, end: number) => Stream;
    push: (data) => void;

    // derived from DataView
    getUint16: (offset: number, le: boolean) => number;

    constructor(buffer, offset?: number, length?: number, maxLength?: number) {
      if (offset === undefined)
        offset = 0;
      if (buffer.buffer instanceof ArrayBuffer) {
        offset += buffer.byteOffset;
        buffer = buffer.buffer;
      }
      if (length === undefined)
        length = buffer.byteLength - offset;
      if (maxLength === undefined)
        maxLength = length;

      var bytes = new Uint8Array(buffer, offset, maxLength);
      var stream: Stream = <Stream><any>(new DataView(buffer, offset, maxLength));

      stream.bytes = bytes;
      stream.pos = 0;
      stream.end = length;
      stream.bitBuffer = 0;
      stream.bitLength = 0;

      stream.align = Stream_align;
      stream.ensure = Stream_ensure;
      stream.remaining = Stream_remaining;
      stream.substream = Stream_substream;
      stream.push = Stream_push;
      return stream;
    }
  }

}
