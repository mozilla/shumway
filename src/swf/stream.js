/* -*- mode: javascript; tab-width: 4; indent-tabs-mode: nil -*- */

var StreamNoDataError = {};

var Stream = (function StreamClosure() {

  function Stream_align() {
    this.bitBuffer = this.bitLength = 0;
  }
  function Stream_ensure(size) {
    if (this.pos + size > this.end) {
      throw StreamNoDataError;
    }
  }
  function Stream_remaining() {
    return this.end - this.pos;
  }
  function Stream_substream(begin, end) {
    var stream = new Stream(this.bytes);
    stream.pos = begin;
    stream.end = end;
    return stream;
  }

  function Stream(buffer, offset, length) {
    if (offset === undefined)
      offset = 0;
    if (buffer.buffer instanceof ArrayBuffer) {
      offset += buffer.byteOffset;
      buffer = buffer.buffer;
    }
    if (length === undefined)
      length = buffer.byteLength - offset;

    var bytes = new Uint8Array(buffer, offset, length);
    var stream = new DataView(buffer, offset, length);

    stream.bytes = bytes;
    stream.pos = 0;
    stream.end = length;
    stream.bitBuffer = 0;
    stream.bitLength = 0;

    stream.align = Stream_align;
    stream.ensure = Stream_ensure;
    stream.remaining = Stream_remaining;
    stream.substream = Stream_substream;
    return stream;
  }

  return Stream;
})();
