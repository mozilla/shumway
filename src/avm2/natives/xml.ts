/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
///<reference path='../references.ts' />

module Shumway.AVM2.AS {
  import assertNotImplemented = Shumway.Debug.assertNotImplemented;
  import notImplemented = Shumway.Debug.notImplemented;

  export class ASXML extends ASNative {
    public static instanceConstructor: any = ASXML;
  }

  export class ASXMLList extends ASNative {
    public static instanceConstructor: any = ASXMLList;
  }

}