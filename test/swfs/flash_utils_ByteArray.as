/* 
   Derived from:
   http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/utils/ByteArray.html#includeExamplesSummary

   Compiled with:
   java -jar asc.jar -import playerglobal.abc -swf ByteArrayTest,100,100 test/swfs/flash_utils_ByteArray.as
 */

package {
    import flash.display.Sprite;
    import flash.utils.ByteArray;
    import flash.errors.EOFError;

    public class ByteArrayTest extends Sprite {        
        public function ByteArrayTest() {
            var byteArr:ByteArray = new ByteArray();

            byteArr.writeByte(0xff);
            byteArr.writeByte(0x00);
            byteArr.writeByte(0xff);
            trace(byteArr.length);            // 1
            trace(byteArr[0]);            // 0
            trace(byteArr[1]);            // 64
            trace(byteArr[2]);            // 9

            byteArr.writeUnsignedInt(0xffffffff);
            trace(byteArr.length);            // 9
            trace(byteArr[0]);            // 0
            trace(byteArr[1]);            // 64
            trace(byteArr[2]);            // 9
            trace(byteArr[3]);            // 33
            trace(byteArr[4]);            // 251
            trace(byteArr[5]);            // 84
            trace(byteArr[6]);            // 68
            
            byteArr.position = 0;

            trace("get length(): " + byteArr.length);
            // trace("toString(): " + byteArr.toString());

            trace(byteArr.readByte());
            trace(byteArr.readByte());
            trace(byteArr.readByte());
            trace(byteArr.readUnsignedInt());

            byteArr.length = 20;
            trace("get length(): " + byteArr.length);
            trace(byteArr.readByte());

            try {
                trace("toString(): " + byteArr.toString());
            } catch (e) {
            trace(e);
            }

            var ba2 = new ByteArray();
            ba2.writeByte(1);
            ba2.writeByte(2);
            ba2.writeByte(3);
            ba2.writeByte(4);
            ba2.writeByte(5);
            ba2.writeByte(6);
            trace("Bytes available:" + ba2.length);
            var ba3 = new ByteArray();
            ba2.readBytes(ba3);
            trace("Bytes read:" + ba3.length);
            if (ba3.length !== 6) {
                trace("FAIL readBytes()");
            }
        }
    }
}
