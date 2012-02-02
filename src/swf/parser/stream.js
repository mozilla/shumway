/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function Stream(buffer, zlibStream, progressive) {
  var bytes = new Uint8Array(buffer);
  var stream = new DataView(bytes.buffer);
  stream.__proto__ = Stream.prototype;
  stream.bytes = bytes;
  stream.pos = 0;
  stream.bitBuffer = 0;
  stream.bitLength = 0;
  if (zlibStream) {
    var header = zlibStream.getUint16(zlibStream.pos);
    assert((header & 0x0f00) === 0x0800, 'unknown compression method', 'inflate');
    assert(!(header % 31), 'bad FCHECK', 'inflate');
    assert(!(header & 0x20), 'FDICT bit set', 'inflate');
    zlibStream.pos += 2;
    stream.zlibStream = zlibStream;
    stream.lastIndex = 0;
    if (!progressive)
      stream.ensure(bytes.length);
  }
  return stream;
}
var proto = Stream.prototype = Object.create(DataView.prototype);

proto.align = function() {
  this.bitBuffer = this.bitLength = 0;
};
proto.ensure = function(length) {
  var zlibStream = this.zlibStream;
  if (zlibStream) {
    var index = this.pos + length;
    while (this.lastIndex < index)
      inflateBlock(zlibStream.bytes, zlibStream, this.bytes, this);
  }
};
proto.substream = function(begin, end) {
  var stream = Object.create(this);
  stream.pos = begin;
  stream.align();
  return stream;
};
