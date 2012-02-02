/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function Stream(buffer, offset, length) {
  if (offset === undefined)
    offset = 0;
  if (length === undefined)
    length = buffer.byteLength - offset;
  if (offset + length > buffer.byteLength) {
    var bytes = new Uint8Array(length);
    var stream = new DataView(bytes.buffer);
    stream.realLength = 0;
    var sstream = stream.sstream = new Stream(buffer, offset);
    var header = sstream.getUint16(sstream.pos);
    assert((header & 0x0f00) === 0x0800, 'unknown compression method', 'inflate');
    assert(!(header % 31), 'bad FCHECK', 'inflate');
    assert(!(header & 0x20), 'FDICT bit set', 'inflate');
    sstream.pos += 2;
  } else {
    var bytes = new Uint8Array(buffer, offset, length);
    var stream = new DataView(buffer, offset, length);
    stream.realLength = length;
  }
  stream.__proto__ = Stream.prototype;
  stream.bytes = bytes;
  stream.pos = 0;
  stream.bitBuffer = 0;
  stream.bitLength = 0;
  return stream;
}
var proto = Stream.prototype = Object.create(DataView.prototype);

proto.align = function() {
  this.bitBuffer = this.bitLength = 0;
};
proto.ensure = function(length) {
  var sstream = this.sstream;
  if (sstream) {
    var index = this.pos + length;
    while (this.realLength < index)
      inflateBlock(sstream.bytes, sstream, this.bytes, this);
  }
};
proto.substream = function(begin, end) {
  var stream = Object.create(this);
  stream.pos = begin;
  stream.align();
  return stream;
};
