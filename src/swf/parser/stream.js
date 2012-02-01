/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function Stream(buffer, byteOffset, byteLength) {
  if (!byteOffset)
    byteOffset = 0;
  if (!byteLength)
    byteLength = buffer.byteLength - byteOffset;
  var stream = new DataView(buffer, byteOffset, byteLength);
  stream.__proto__ = Stream.prototype;
  stream.bytes = new Uint8Array(buffer, byteOffset, byteLength);
  stream.pos = 0;
  stream.bitBuffer = 0;
  stream.bitLength = 0;
  return stream;
}
var proto = Stream.prototype = Object.create(DataView.prototype);

proto.align = function() {
  this.bitBuffer = this.bitLength = 0;
}
proto.substream = function(begin, end) {
  var stream = Object.create(this);
  stream.pos = begin;
  stream.align();
  return stream;
}
