/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

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
    var proto = create(StreamPrototype);

    proto.ensure = function(length) {
      var index = this.pos + length;
      while (this.realLength < index)
        inflateBlock(sstream.bytes, sstream, this.bytes, this);
    };
  } else {
    var bytes = new Uint8Array(buffer, offset, length);
    var stream = new DataView(buffer, offset, length);
    stream.realLength = length;
    var proto = StreamPrototype;
  }

  stream.__proto__ = proto;
  stream.bytes = bytes;
  stream.pos = 0;
  stream.end = length;
  stream.bitBuffer = 0;
  stream.bitLength = 0;
  return stream;
}

var StreamPrototype = create(DataView.prototype);
StreamPrototype.align = function() {
  this.bitBuffer = this.bitLength = 0;
};
StreamPrototype.ensure = function() { };
StreamPrototype.remaining = function() {
  return this.end - this.pos;
};
StreamPrototype.substream = function(begin, end) {
  var stream = new Stream(this.bytes);
  stream.pos = begin;
  stream.end = end;
  return stream;
};
