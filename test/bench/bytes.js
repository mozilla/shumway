(function displayTests() {

  var ByteArray = flash.utils.ByteArray;

  function timeIt(f, m) {
    var s = Date.now();
    f();
    console.info("Took: " + m + " " + (Date.now() - s));
  }

  unitTests.push(function () {
    var b = new ByteArray();
    b.writeFloat(123.456);
    b.position = 0;
    var f = b.readFloat();
    eqFloat(123.456, f);

    var b = new ByteArray();
    b.endian = "littleEndian";
    b.writeFloat(123.456);
    b.position = 0;
    var f = b.readFloat();
    eqFloat(123.456, f);
  });

  var count = 1024 * 1024 * 1;

  function testWrite(littleEndian) {
    var b = new ByteArray();
    b.endian = littleEndian ? "littleEndian" : "bigEndian";
    timeIt(function () {
      timeIt(function () {
        for (var i = 0; i < count; i++) {
          b.writeBoolean(true);
        }
      }, "writeBoolean");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.writeByte(42);
        }
      }, "writeByte");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.writeUnsignedByte(42);
        }
      }, "writeUnsignedByte");

      var bytes = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.writeRawBytes(bytes);
        }
      }, "writeRawBytes");

      var bytes = new ByteArray();
      bytes.writeRawBytes(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]));

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.writeBytes(bytes);
        }
      }, "writeBytes");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.writeShort(42322);
        }
      }, "writeShort");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.writeUnsignedShort(4232);
        }
      }, "writeUnsignedShort");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.writeInt(42);
        }
      }, "writeInt");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.writeUnsignedInt(42);
        }
      }, "writeUnsignedInt");
      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.writeFloat(42.45);
        }
      }, "writeFloat");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.writeDouble(42.1234);
        }
      }, "writeDouble");
    }, "== Write " + b.endian);
  }

  function testRead(littleEndian) {
    var b = new ByteArray();
    b.endian = littleEndian ? "littleEndian" : "bigEndian";

    for (var i = 0; i < count * 8; i++) {
      b.writeInt(i);
    }

    timeIt(function () {
      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.readBoolean();
        }
      }, "readBoolean");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.readByte();
        }
      }, "readByte");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.readUnsignedByte();
        }
      }, "readUnsignedByte");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          // b.readRawBytes();
        }
      }, "readRawBytes");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          // b.readBytes();
        }
      }, "readBytes");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.readShort();
        }
      }, "readShort");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.readUnsignedShort();
        }
      }, "readUnsignedShort");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.readInt();
        }
      }, "readInt");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.readUnsignedInt();
        }
      }, "readUnsignedInt");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.readFloat();
        }
      }, "readFloat");

      timeIt(function () {
        b.position = 0;
        for (var i = 0; i < count; i++) {
          b.readDouble();
        }
      }, "readDouble");
    }, "== Read " + b.endian);
  }


  unitTests.push(testWrite.bind(null, false));
  unitTests.push(testWrite.bind(null, true));

  unitTests.push(testRead.bind(null, false));
  unitTests.push(testRead.bind(null, true));


})();
