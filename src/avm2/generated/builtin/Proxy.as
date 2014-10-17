/* -*- c-basic-offset: 4; indent-tabs-mode: nil; tab-width: 4 -*- */
/* vi: set ts=4 sw=4 expandtab: (add to ~/.vimrc: set modeline modelines=5) */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package flash.utils
{

import flash.errors.IllegalOperationError;

public namespace flash_proxy = "http://www.adobe.com/2006/actionscript/flash/proxy";

//
// Proxy
//

[native(cls="ProxyClass", gc="exact", instance="ProxyObject", methods="auto")]
public class Proxy
{
  flash_proxy function getProperty(name:*):*
  {
    Error.throwError(IllegalOperationError, 2088  /* kProxyGetPropertyError */);
    return null; // compiler doesn't realize this is unreachable (strict mode)
  }

  flash_proxy function setProperty(name:*, value:*):void
  {
    Error.throwError(IllegalOperationError, 2089  /* kProxySetPropertyError */);
  }

  flash_proxy function callProperty(name:*, ...rest):*
  {
    Error.throwError(IllegalOperationError, 2090 /* kProxyCallPropertyError */);
    return null; // unreachable
  }

  flash_proxy function hasProperty(name:*):Boolean
  {
    Error.throwError(IllegalOperationError, 2091 /* kProxyHasPropertyError */);
    return null; // unreachable
  }

  flash_proxy function deleteProperty(name:*):Boolean
  {
    Error.throwError(IllegalOperationError, 2092 /* kProxyDeletePropertyError */);
    return null; // unreachable
  }

  flash_proxy function getDescendants(name:*):*
  {
    Error.throwError(IllegalOperationError, 2093 /* kProxyGetDescendantsError */);
    return null; // unreachable
  }

  flash_proxy function nextNameIndex(index:int):int
  {
    Error.throwError(IllegalOperationError, 2105 /* kProxyNextNameIndexError */);
    return null; // unreachable
  }

  flash_proxy function nextName(index:int):String
  {
    Error.throwError(IllegalOperationError, 2106 /* kProxyNextNameError */);
    return null; // unreachable
  }

  flash_proxy function nextValue(index:int):*
  {
    Error.throwError(IllegalOperationError, 2107 /* kProxyNextValueError */);
    return null; // unreachable
  }
}

}
