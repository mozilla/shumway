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

  [native(cls="DefinitionErrorClass")]
  public dynamic class DefinitionError extends Error
  {
    public native function DefinitionError(message = "", id = 0);
  }

  [native(cls="EvalErrorClass")]
  public dynamic class EvalError extends Error
  {
    public native function EvalError(message = "", id = 0);
  }

  [native(cls="RangeErrorClass")]
  public dynamic class RangeError extends Error
  {
    public native function RangeError(message = "", id = 0);
  }

  [native(cls="ReferenceErrorClass")]
  public dynamic class ReferenceError extends Error
  {
    public native function ReferenceError(message = "", id = 0);
  }

  [native(cls="SecurityErrorClass")]
  public dynamic class SecurityError extends Error
  {
    public native function SecurityError(message = "", id = 0);
  }

  [native(cls="SyntaxErrorClass")]
  public dynamic class SyntaxError extends Error
  {
    public native function SyntaxError(message = "", id = 0);
  }

  [native(cls="TypeErrorClass")]
  public dynamic class TypeError extends Error
  {
    public native function TypeError(message = "", id = 0);
  }

  [native(cls="URIErrorClass")]
  public dynamic class URIError extends Error
  {
    public native function URIError(message = "", id = 0);
  }

  [native(cls="VerifyErrorClass")]
  public dynamic class VerifyError extends Error
  {
    public native function VerifyError(message = "", id = 0);
  }

  [native(cls="UninitializedErrorClass")]
  public dynamic class UninitializedError extends Error
  {
    public native function UninitializedError(message = "", id = 0);
  }

  [native(cls="ArgumentErrorClass")]
  public dynamic class ArgumentError extends Error
  {
    public native function ArgumentError(message = "", id = 0);
  }
}

package flash.errors
{
  [native(cls="IOErrorClass")]
  public dynamic class IOError extends Error
  {
    public native function IOError(message:String = "", id:int = 0);
  }

  [native(cls="EOFErrorClass")]
  public dynamic class EOFError extends IOError
  {
    public native function EOFError(message:String = "", id:int = 0);
  }

  [native(cls="MemoryErrorClass")]
  public dynamic class MemoryError extends Error
  {
    public native function MemoryError(message:String = "", id:int = 0);
  }

  [native(cls="IllegalOperationErrorClass")]
  public dynamic class IllegalOperationError extends Error
  {
    public native function IllegalOperationError(message:String = "", id:int = 0);
  }
}
