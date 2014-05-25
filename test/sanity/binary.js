unitTests.push(function runInspectorSanityTests() {
  var createArrayBufferFrom = function(source) {
    var ba = flash.utils.ByteArray.initializeFrom(source);
    eq(ba.length, source.length);
    for (var i = 0; i < source.length; i++) {
      eq(ba.readByte(), source[i]);
    }
    return ba;
  };

  var values = [1, 2, 3, 4, 5];
  var ui8 = new Uint8Array(values);
  var ui32 = new Uint32Array(values);

  createArrayBufferFrom(values);
  createArrayBufferFrom(ui8);
  createArrayBufferFrom(ui32);

  var ba = createArrayBufferFrom(ui8);
  ba.writeByte(0x80);
  neq(ui8[0], 0x80);
  ba = createArrayBufferFrom(ui8.buffer);
  ba.writeByte(0x80);
  neq(ui8[0], 0x80);

  ui8 = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  ba = createArrayBufferFrom(ui8.buffer);
  ba.writeByte(0x80);
  eq(ui8[0], 0x80);
});
