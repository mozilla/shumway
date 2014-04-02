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
 * limitations undxr the License.
 */
// Class: LastOperationStatus
module Shumway.AVM2.AS.flash.globalization {
  import notImplemented = Shumway.Debug.notImplemented;
  export class LastOperationStatus extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.globalization.LastOperationStatus");
    }
    
    // JS -> AS Bindings
    static NO_ERROR: string = "noError";
    static USING_FALLBACK_WARNING: string = "usingFallbackWarning";
    static USING_DEFAULT_WARNING: string = "usingDefaultWarning";
    static PARSE_ERROR: string = "parseError";
    static UNSUPPORTED_ERROR: string = "unsupportedError";
    static ERROR_CODE_UNKNOWN: string = "errorCodeUnknown";
    static PATTERN_SYNTAX_ERROR: string = "patternSyntaxError";
    static MEMORY_ALLOCATION_ERROR: string = "memoryAllocationError";
    static ILLEGAL_ARGUMENT_ERROR: string = "illegalArgumentError";
    static BUFFER_OVERFLOW_ERROR: string = "bufferOverflowError";
    static INVALID_ATTR_VALUE: string = "invalidAttrValue";
    static NUMBER_OVERFLOW_ERROR: string = "numberOverflowError";
    static INVALID_CHAR_FOUND: string = "invalidCharFound";
    static TRUNCATED_CHAR_FOUND: string = "truncatedCharFound";
    static INDEX_OUT_OF_BOUNDS_ERROR: string = "indexOutOfBoundsError";
    static PLATFORM_API_FAILED: string = "platformAPIFailed";
    static UNEXPECTED_TOKEN: string = "unexpectedToken";
    
    
    // AS -> JS Bindings
    
  }
}
