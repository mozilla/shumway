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


package
{
  include "api-versions.as"

  [native(cls="ObjectClass")]
  public dynamic class Object
  {
    // Object.length = 1 per ES3
    // E262 {ReadOnly, DontDelete, DontEnum }
    public static const length:int = 1;

    [compat]
    private static native function _hasOwnProperty(o, V:String):Boolean;
    [compat]
    private static native function _propertyIsEnumerable(o, V:String):Boolean;
    protected static native function _setPropertyIsEnumerable(o, V:String, enumerable:Boolean):void;
    [compat]
    private static native function _isPrototypeOf(o, V):Boolean;
    [compat]
    private static native function _toString(o):String;

    // We can native these directly to the JS Object counterparts.
    AS3 native function isPrototypeOf(V=void 0):Boolean;
    AS3 native function hasOwnProperty(V=void 0):Boolean;
    AS3 native function propertyIsEnumerable(V=void 0):Boolean;

    protected static function _dontEnumPrototype(proto:Object):void
    {
      for (var name:String in proto)
      {
        _setPropertyIsEnumerable(proto, name, false);
      }
    }

    // https://bugzilla.mozilla.org/show_bug.cgi?id=605660
    // Some existing Flash content happens to rely on an "init" method
    // being present in the global namespace; hiding it via VM_INTERNAL breaks
    // the content as it causes an RTE. Let's provide a name here
    // that is harmless.
    static function init()
    {
      // nothing
    }

    // Directly native prototype functions.
    //[API(CONFIG::VM_INTERNAL)]
    public static function _init()
    {
      prototype.hasOwnProperty = function(V=void 0):Boolean
      {
        return this.AS3::hasOwnProperty(V)
      }

      prototype.propertyIsEnumerable = function(V=void 0)
      {
        return this.AS3::propertyIsEnumerable(V)
      }

      prototype.setPropertyIsEnumerable = function(name:String,enumerable:Boolean):void
      {
        _setPropertyIsEnumerable(this, name, enumerable);
      }

      prototype.isPrototypeOf = unsafeJSNative("Object.prototype.isPrototypeOf");
      prototype.toString = unsafeJSNative("original.Object.toString");
      prototype.valueOf = unsafeJSNative("original.Object.valueOf");
      _dontEnumPrototype(prototype);
    }
  }

  // dont create proto functions until after class Function is initialized
  Object._init()
}
