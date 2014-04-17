/**
 * Copyright 2013 Mozilla Foundation
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Class: XMLDocument
module Shumway.AVM2.AS.flash.xml {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class XMLDocument extends flash.xml.XMLNode {
    static initializer: any = null;
    constructor (source: string = null) {
      source = asCoerceString(source);
      false && super(undefined, undefined);
      notImplemented("Dummy Constructor: public flash.xml.XMLDocument");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    xmlDecl: ASObject;
    docTypeDecl: ASObject;
    idMap: ASObject;
    ignoreWhite: boolean;
    createElement: (name: string) => flash.xml.XMLNode;
    createTextNode: (text: string) => flash.xml.XMLNode;
    parseXML: (source: string) => void;
    // Instance AS -> JS Bindings
  }
}
