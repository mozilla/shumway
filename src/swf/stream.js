/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var Stream = (function StreamClosure() {
  function Stream_align() {
    this.bitBuffer = this.bitLength = 0;
  }
  function Stream_ensure_default() { }
  function Stream_remaining() {
    return this.end - this.pos;
  }
  function Stream_substream(begin, end) {
    var stream = new Stream(this.bytes);
    stream.pos = begin;
    stream.end = end;
    return stream;
  }

  function Stream(buffer, offset, length, compression) {
    if (offset === undefined)
      offset = 0;
    if (buffer.buffer instanceof ArrayBuffer) {
      offset += buffer.byteOffset;
      buffer = buffer.buffer;
    }
    if (length === undefined)
      length = buffer.byteLength - offset;

    if (compression === 'C') {
      var bytes = new Uint8Array(length);
      var stream = new DataView(bytes.buffer);
      stream.realLength = 0;
      var sstream = new Stream(buffer, offset);
      var header = sstream.getUint16(sstream.pos);
      assert((header & 0x0f00) === 0x0800, 'unknown compression method', 'inflate');
      assert(!(header % 31), 'bad FCHECK', 'inflate');
      assert(!(header & 0x20), 'FDICT bit set', 'inflate');
      sstream.pos += 2;

      stream.ensure = function Stream_ensure(length) {
        var index = this.pos + length;
        while (this.realLength < index)
          inflateBlock(sstream.bytes, sstream, this.bytes, this);
      };
    } else {
      var bytes = new Uint8Array(buffer, offset, length);
      var stream = new DataView(buffer, offset, length);
      stream.realLength = length;

      stream.ensure = Stream_ensure_default;
    }

    stream.align = Stream_align;
    stream.remaining = Stream_remaining;
    stream.substream = Stream_substream;

    stream.bytes = bytes;
    stream.pos = 0;
    stream.end = length;
    stream.bitBuffer = 0;
    stream.bitLength = 0;
    return stream;
  }

  return Stream;
})();
