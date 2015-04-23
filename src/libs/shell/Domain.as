/* -*- c-basic-offset: 4; indent-tabs-mode: nil; tab-width: 4 -*- */
/* vi: set ts=4 sw=4 expandtab: (add to ~/.vimrc: set modeline modelines=5) */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package avmplus {

  import flash.utils.ByteArray
  import avmplus.File

  [native(cls="DomainClass", gc="exact", instance="DomainObject", methods="auto")]
  public class Domain
  {
    private native function init(base:Domain):void;

    public function Domain(base:Domain)
    {
      init(base);
    }

    // If swfVersion is not zero, then load the given ABC with the specific BugCompatibility
    // (overriding the default passed to -swfversion). Note that swfVersion must be a known
    // value, or an exception will be thrown.
    public native function loadBytes(byteArray:ByteArray, swfVersion:uint = 0);

    public native function getClass(className:String):Class;
    public native static function get currentDomain():Domain;

    public function load(filename:String, swfVersion:uint = 0)
    {
      return loadBytes(File.readByteArray(filename), swfVersion)
    }

    /**
     * Gets the minimum length of a ByteArray required to be used as
     * ApplicationDomain.globalMemory
     *
     * @tiptext
     * @playerversion Flash 10
     * @langversion 3.0
     */
    public native static function get MIN_DOMAIN_MEMORY_LENGTH():uint;

    /**
     * Gets and sets the ByteArray object on which global memory operations
     * will operate within this ApplicationDomain
     *
     * @tiptext
     * @playerversion Flash 10
     * @langversion 3.0
     */
    public native function get domainMemory():ByteArray;
    public native function set domainMemory(mem:ByteArray);
  }

}
