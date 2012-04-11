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
  [native(cls="RegExpClass")]
  public dynamic class RegExp
  {
    // RegExp.length = 1 per ES3

    // E262 {ReadOnly, DontDelete, DontEnum }
    public static const length:int = 1;

    // {RO,DD,DE} properties of RegExp instances
    public native function get source():String;
    public native function get global():Boolean;
    public native function get ignoreCase():Boolean;
    public native function get multiline():Boolean;

    // {DD,DE} properties of RegExp instances
    public native function get lastIndex():int;
    public native function set lastIndex(i:int);

    // AS3 specific properties {RO,DD,DE}
    public native function get dotall():Boolean;
    public native function get extended():Boolean;

    prototype.toString = function():String
    {
      var r:RegExp = this // TypeError if not
      var out:String = "/" + r.source + "/"
      if (r.global)       out += "g"
      if (r.ignoreCase)   out += "i"
      if (r.multiline)    out += "m"
      if (r.dotall)       out += "s"
      if (r.extended)     out += "x"
      return out
    };

    AS3 native function exec(s:String="");
    prototype.exec = unsafeJSNative("RegExp.prototype.exec");

    AS3 native function test(s:String="");
    prototype.test = unsafeJSNative("RegExp.prototype.test");

    // Dummy constructor
    public function RegExp(pattern = void 0, options = void 0) {}

    _dontEnumPrototype(prototype);
  }
}
