package flash.net {
  import flash.utils.IDataOutput;
  import flash.events.EventDispatcher;
  import flash.utils.IDataInput;
  import String;
  import flash.events.SecurityErrorEvent;
  import flash.events.TimerEvent;
  import Boolean;
  import uint;
  import Number;
  import flash.utils.Timer;
  import int;
  import flash.utils.ByteArray;
  import flash.events.SecurityErrorEvent;
  import flash.events.TimerEvent;
  import flash.events.ProgressEvent;
  import flash.events.OutputProgressEvent;
  import flash.utils.Timer;
  import flash.events.Event;
  import flash.events.IOErrorEvent;
  public class Socket extends EventDispatcher implements IDataInput, IDataOutput {
    public function Socket(host:String = null, port:int = 0) {}
    public function connect(host:String, port:int):void { notImplemented("connect"); }
    public function get timeout():uint { notImplemented("timeout"); }
    public function set timeout(value:uint):void { notImplemented("timeout"); }
    public native function readBytes(bytes:ByteArray, offset:uint = 0, length:uint = 0):void;
    public native function writeBytes(bytes:ByteArray, offset:uint = 0, length:uint = 0):void;
    public native function writeBoolean(value:Boolean):void;
    public native function writeByte(value:int):void;
    public native function writeShort(value:int):void;
    public native function writeInt(value:int):void;
    public native function writeUnsignedInt(value:uint):void;
    public native function writeFloat(value:Number):void;
    public native function writeDouble(value:Number):void;
    public native function writeMultiByte(value:String, charSet:String):void;
    public native function writeUTF(value:String):void;
    public native function writeUTFBytes(value:String):void;
    public native function readBoolean():Boolean;
    public native function readByte():int;
    public native function readUnsignedByte():uint;
    public native function readShort():int;
    public native function readUnsignedShort():uint;
    public native function readInt():int;
    public native function readUnsignedInt():uint;
    public native function readFloat():Number;
    public native function readDouble():Number;
    public native function readMultiByte(length:uint, charSet:String):String;
    public native function readUTF():String;
    public native function readUTFBytes(length:uint):String;
    public native function get bytesAvailable():uint;
    public native function get connected():Boolean;
    public function close():void { notImplemented("close"); }
    public native function flush():void;
    public native function writeObject(object):void;
    public native function readObject();
    public native function get objectEncoding():uint;
    public native function set objectEncoding(version:uint):void;
    public native function get endian():String;
    public native function set endian(type:String):void;
    public native function get bytesPending():uint;
  }
}
