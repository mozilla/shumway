/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is [Open Source Virtual Machine.].
 *
 * The Initial Developer of the Original Code is
 * Adobe System Incorporated.
 * Portions created by the Initial Developer are Copyright (C) 2004-2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Adobe AS3 Team
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

package flash.utils
{

  include "api-versions.as"

  public final class CompressionAlgorithm
  {
    public static const ZLIB:String = "zlib";
    public static const DEFLATE:String = "deflate";
    public static const LZMA:String = "lzma";
  };

  // Provide dummy definitions here of IDataInput2 and IDataOutput2, because they will
  // not be provided by IDataInput.as and IDataOutput.as if VMCFG_FLOAT is disabled.

  CONFIG const NO_VMCFG_FLOAT = !CONFIG::VMCFG_FLOAT;

  CONFIG::NO_VMCFG_FLOAT
  internal interface IDataInput2 extends IDataInput {
  }

  CONFIG::NO_VMCFG_FLOAT
  internal interface IDataOutput2 extends IDataOutput {
  }

  //
  // ByteArray
  //

  [native(cls="ByteArrayClass")]
  public class ByteArray implements IDataInput2, IDataOutput2
  {

    public function ByteArray(){}

    public native function readBytes(bytes:ByteArray,
                                     offset:uint=0,
                                     length:uint=0):void;
    public native function writeBytes(bytes:ByteArray,
                                      offset:uint=0,
                                      length:uint=0):void;
    public native function writeBoolean(value:Boolean):void;
    public native function writeByte(value:int):void;
    public native function writeShort(value:int):void;
    public native function writeInt(value:int):void;
    public native function writeUnsignedInt(value:uint):void;
    public native function writeFloat(value:Number):void;
    //[API(CONFIG::SWF_16)]
    CONFIG::VMCFG_FLOAT
    public native function writeFloat4(value:float4):void;
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
    //[API(CONFIG::SWF_16)]
    CONFIG::VMCFG_FLOAT
    public native function readFloat4():float4;
    public native function readDouble():Number;
    public native function readMultiByte(length:uint, charSet:String):String;
    public native function readUTF():String;
    public native function readUTFBytes(length:uint):String;

    public override native function get length():uint;
    public override native function set length(value:uint);

    public native function writeObject(object:*):void;
    public native function readObject():*;

    //[API(CONFIG::FP_10_0)]
    public function deflate():void
    {
      _compress("deflate");
    }

    private native function _compress(algorithm:String):void;
    public function compress(algorithm:String = CompressionAlgorithm.ZLIB):void
    {
      _compress(algorithm);
    }

    [API(CONFIG::FP_10_0)]
    public function uncompress(algorithm:String = CompressionAlgorithm.ZLIB):void
    {
      _uncompress(algorithm);
    }

    public native function toString():String;

    public native function get bytesAvailable():uint;
    public native function get position():uint;
    public native function set position(offset:uint):void;

    static public native function get defaultObjectEncoding():uint;
    static public native function set defaultObjectEncoding(version:uint):void;
    static private var _defaultObjectEncoding:uint;

    public native function get objectEncoding():uint;
    public native function set objectEncoding(version:uint):void;

    public native function get endian():String;
    public native function set endian(type:String):void;

    // [API(CONFIG::FP_10_0)]

    public native function clear():void;

    // Note: clients are free to replace with method returning non-string
    prototype.toJSON = function (k:String):* { return "ByteArray"; }

    // Bug 651641: we do not want toJSON enumerated.
    _dontEnumPrototype(prototype);
  };

}
