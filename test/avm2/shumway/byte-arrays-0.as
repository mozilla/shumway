package {

import flash.utils.ByteArray;

function traceArray(array) {
    var str = "[";
    for (var i = 0; i < array.length; i++) {
      str += array[i];
      if (i < array.length - 1) {
        str += ", ";
      }
    }
    trace(str + "], l: " + array.length + ", p: " + array.position);
  }

  (function () {
    trace("--- writeBoolean ---");
    var ba = new ByteArray();
    ba.writeBoolean(true);
    ba.writeBoolean(false);
    ba.writeBoolean("ABC");
    ba.writeBoolean("");
    traceArray(ba);
  })();

  (function () {
    trace("--- writeByte ---");
    var ba = new ByteArray();
    ba.writeByte(234);
    ba.writeByte(123456);
    ba.writeByte("5");
    ba.writeByte("6.7");
    traceArray(ba);
  })();

  (function () {
    trace("--- writeInt ---");
    var ba = new ByteArray();
    ba.writeInt(-1);
    ba.writeInt(2);
    ba.writeInt("3");
    ba.writeInt(0);
    traceArray(ba);
  })();

  (function () {
    trace("--- writeFloat ---");
    var ba = new ByteArray();
    ba.writeFloat(23);
    traceArray(ba);
  })();

  (function () {
    trace("--- writeDouble ---");
    var ba = new ByteArray();
    ba.writeDouble(Math.E);
    traceArray(ba);
  })();

  (function () {
    trace("--- writeDouble ---");
    var ba = new ByteArray();
    ba.writeDouble(Math.E);
    traceArray(ba);
  })();

  (function () {
    trace("--- writeShort ---");
    var ba = new ByteArray();
    ba.writeShort(1);
    ba.writeShort(-2);
    ba.writeShort(1234567);
    ba.writeShort("456");
    traceArray(ba);
  })();

  (function () {
    trace("--- writeUnsignedInt ---");
    var ba = new ByteArray();
    ba.writeUnsignedInt(1);
    ba.writeUnsignedInt(-2);
    ba.writeUnsignedInt(1234567);
    ba.writeUnsignedInt("-456");
    traceArray(ba);
  })();

  (function () {
    trace("--- writeUTF ---");
    var ba = new ByteArray();
    ba.writeUTF("Hello");
    ba.writeUTF("κόσμε");
    traceArray(ba);
  })();

  (function () {
    trace("--- writeUTFBytes ---");
    var ba = new ByteArray();
    ba.writeUTFBytes("Hello");
    ba.writeUTFBytes("κόσμε");
    traceArray(ba);
  })();

  (function () {
    trace("--- writeBytes ---");
    var a = new ByteArray();
    a.writeByte(0);
    a.writeByte(1);
    a.writeByte(2);
    a.writeByte(3);
    traceArray(a);
    var b = new ByteArray();
    b.writeBytes(a);
    traceArray(b);

    b.clear();
    traceArray(b);
    b.writeBytes(a);
    b.writeBytes(a);
    traceArray(b);

    b.clear();
    b.writeBytes(a, 0);
    b.writeBytes(a, 1);
    b.writeBytes(a, 2);
    b.writeBytes(a, 3);
    b.writeBytes(a, 4);
    traceArray(b);

    b.clear();
    b.writeBytes(a, 0, 0);
    b.writeBytes(a, 1, 0);
    b.writeBytes(a, 2, 0);
    b.writeBytes(a, 3, 0);
    b.writeBytes(a, 4, 0);
    traceArray(b);

    b.clear();
    b.writeBytes(a, 0, 1);
    b.writeBytes(a, 1, 1);
    b.writeBytes(a, 2, 1);
    b.writeBytes(a, 3, 1);
    traceArray(b);

    b.writeBytes(b);
    b.writeBytes(b, 0);
    b.writeBytes(b, 0, 1);
    b.writeBytes(b, 0, b.length);
    traceArray(b);
  })();

  (function () {
    trace("--- position ---");
    var a = new ByteArray();
    a.writeByte(1);
    a.writeByte(2);
    for (var i = 0; a.length < 8; i++) {
      a.writeBytes(a, i, 2);
    }
    traceArray(a);
    a.position = 0;
    a.writeByte(3);
    a.position = 4;
    a.writeByte(19);
    a.position = 32;
    a.writeByte(22);
    traceArray(a);
    a.length = 3;
    traceArray(a);
    a.length = 8;
    traceArray(a);
    a.writeByte(42);
    traceArray(a);
  })();

  (function () {
    trace("--- write and read back ---");
    var a = new ByteArray();
    a.writeBoolean(true);
    a.writeBoolean(false);
    a.writeByte(12);
    a.writeShort(1234);
    a.writeInt(-123456);
    a.writeUnsignedInt(-123456);
    a.writeFloat(123.456);
    a.writeDouble(123.456);
    traceArray(a);
    a.writeUTF("κόσμε");
    a.writeUTFBytes("κόσμε");

    a.position = 0;
    trace(a.readBoolean());
    trace(a.readBoolean());
    trace(a.readByte());
    trace(a.readShort());
    trace(a.readInt());
    trace(a.readUnsignedInt());
    trace(a.readFloat());
    trace(a.readDouble());
    trace(a.readUTF());
    trace(a.readUTFBytes(10));
  })();

  (function () {
    trace("--- expand ---");
    var a = new ByteArray();
    for (var i = 0; i < 1000; i++) {
      a.writeByte(i);
    }
    a.position = 0;
    var s = 0;
    for (var i = 0; i < 1000; i++) {
      s += a.readByte();
    }
    trace(s + a.length + a.position);
  })();

  (function () {
    trace("--- index ---");
    var a = new ByteArray();
    a[10] = 10;
    traceArray(a);

    a.clear();
    trace(a[10]);
    a[10] = 10;
    a[11] = 11;
    trace(a[10]);
    trace(a[11]);
    a.length = 11;
    trace(a[10]);
    trace(a[11]);
    a.position = 0;
    trace(a[10]);
    trace(a[11]);
    traceArray(a);
    for (var i = 0; i < 16; i++) {
      a[i] = i;
    }
    traceArray(a);
    a.position = 0;
    a.length = 5;
    traceArray(a);
    trace("a[7] is now gone " + a[7]);
    a.length = 10;
    traceArray(a);
    trace("a[7] is still there " + a[7]);

  })();
}
