package flash.net {
import flash.events.EventDispatcher;
import flash.utils.ByteArray;
import flash.utils.IDataInput;

public class URLStream extends EventDispatcher implements IDataInput {
    public function URLStream() {}
    public native function load(request:URLRequest):void;
    public native function readBytes(bytes:ByteArray, offset:uint = 0, length:uint = 0):void;
    public native function readBoolean():Boolean;
    public native function readByte():int;
    public native function readUnsignedByte():uint;
    public native function readShort():int;
    public native function readUnsignedShort():uint;
    public native function readUnsignedInt():uint;
    public native function readInt():int;
    public native function readFloat():Number;
    public native function readDouble():Number;
    public native function readMultiByte(length:uint, charSet:String):String;
    public native function readUTF():String;
    public native function readUTFBytes(length:uint):String;
    public native function get connected():Boolean;
    public native function get bytesAvailable():uint;
    public native function close():void;
    public native function readObject();
    public native function get objectEncoding():uint;
    public native function set objectEncoding(version:uint):void;
    public native function get endian():String;
    public native function set endian(type:String):void;
    public native function get diskCacheEnabled():Boolean;
    public native function get position():Number;
    public native function set position(offset:Number):void;
    public native function get length():Number;
    public native function stop():void;
  }
}
