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
"use strict";
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        AVMX.timelineBuffer = Shumway.Tools ? new Shumway.Tools.Profiler.TimelineBuffer("AVX") : null;
        AVMX.counter = new Shumway.Metrics.Counter(!release);
        function countTimeline(name, value) {
            if (value === void 0) { value = 1; }
            AVMX.timelineBuffer && AVMX.timelineBuffer.count(name, value);
        }
        AVMX.countTimeline = countTimeline;
        function enterTimeline(name, data) {
            profile && AVMX.timelineBuffer && AVMX.timelineBuffer.enter(name, data);
        }
        AVMX.enterTimeline = enterTimeline;
        function leaveTimeline(data) {
            profile && AVMX.timelineBuffer && AVMX.timelineBuffer.leave(null, data);
        }
        AVMX.leaveTimeline = leaveTimeline;
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        AVMX.Errors = {
            /**
             * AVM2 Error Codes
             */
            //  OutOfMemoryError                     : {code: 1000, message: "The system is out of memory."},
            NotImplementedError: { code: 1001, message: "The method %1 is not implemented." },
            InvalidPrecisionError: { code: 1002, message: "Number.toPrecision has a range of 1 to 21. Number.toFixed and Number.toExponential have a range of 0 to 20. Specified value is not within expected range." },
            InvalidRadixError: { code: 1003, message: "The radix argument must be between 2 and 36; got %1." },
            InvokeOnIncompatibleObjectError: { code: 1004, message: "Method %1 was invoked on an incompatible object." },
            ArrayIndexNotIntegerError: { code: 1005, message: "Array index is not a positive integer (%1)." },
            CallOfNonFunctionError: { code: 1006, message: "%1 is not a function." },
            ConstructOfNonFunctionError: { code: 1007, message: "Instantiation attempted on a non-constructor." },
            //  AmbiguousBindingError                : {code: 1008, message: "%1 is ambiguous; Found more than one matching binding."},
            ConvertNullToObjectError: { code: 1009, message: "Cannot access a property or method of a null object reference." },
            ConvertUndefinedToObjectError: { code: 1010, message: "A term is undefined and has no properties." },
            //  IllegalOpcodeError                   : {code: 1011, message: "Method %1 contained illegal opcode %2 at offset %3."},
            //  LastInstExceedsCodeSizeError         : {code: 1012, message: "The last instruction exceeded code size."},
            //  FindVarWithNoScopeError              : {code: 1013, message: "Cannot call OP_findproperty when scopeDepth is 0."},
            ClassNotFoundError: { code: 1014, message: "Class %1 could not be found." },
            //  IllegalSetDxns                       : {code: 1015, message: "Method %1 cannot set default xml namespace"},
            DescendentsError: { code: 1016, message: "Descendants operator (..) not supported on type %1." },
            //  ScopeStackOverflowError              : {code: 1017, message: "Scope stack overflow occurred."},
            //  ScopeStackUnderflowError             : {code: 1018, message: "Scope stack underflow occurred."},
            //  GetScopeObjectBoundsError            : {code: 1019, message: "Getscopeobject %1 is out of bounds."},
            //  CannotFallOffMethodError             : {code: 1020, message: "Code cannot fall off the end of a method."},
            //  InvalidBranchTargetError             : {code: 1021, message: "At least one branch target was not on a valid instruction in the method."},
            //  IllegalVoidError                     : {code: 1022, message: "Type void may only be used as a function return type."},
            StackOverflowError: { code: 1023, message: "Stack overflow occurred." },
            //  StackUnderflowError                  : {code: 1024, message: "Stack underflow occurred."},
            //  InvalidRegisterError                 : {code: 1025, message: "An invalid register %1 was accessed."},
            //  SlotExceedsCountError                : {code: 1026, message: "Slot %1 exceeds slotCount=%2 of %3."},
            //  MethodInfoExceedsCountError          : {code: 1027, message: "Method_info %1 exceeds method_count=%2."},
            //  DispIdExceedsCountError              : {code: 1028, message: "Disp_id %1 exceeds max_disp_id=%2 of %3."},
            //  DispIdUndefinedError                 : {code: 1029, message: "Disp_id %1 is undefined on %2."},
            //  StackDepthUnbalancedError            : {code: 1030, message: "Stack depth is unbalanced. %1 != %2."},
            //  ScopeDepthUnbalancedError            : {code: 1031, message: "Scope depth is unbalanced. %1 != %2."},
            CpoolIndexRangeError: { code: 1032, message: "Cpool index %1 is out of range %2." },
            CpoolEntryWrongTypeError: { code: 1033, message: "Cpool entry %1 is wrong type." },
            CheckTypeFailedError: { code: 1034, message: "Type Coercion failed: cannot convert %1 to %2." },
            //  IllegalSuperCallError                : {code: 1035, message: "Illegal super expression found in method %1."},
            CannotAssignToMethodError: { code: 1037, message: "Cannot assign to a method %1 on %2." },
            //  RedefinedError                       : {code: 1038, message: "%1 is already defined."},
            //  CannotVerifyUntilReferencedError     : {code: 1039, message: "Cannot verify method until it is referenced."},
            CantUseInstanceofOnNonObjectError: { code: 1040, message: "The right-hand side of instanceof must be a class or function." },
            IsTypeMustBeClassError: { code: 1041, message: "The right-hand side of operator must be a class." },
            InvalidMagicError: { code: 1042, message: "Not an ABC file.  major_version=%1 minor_version=%2." },
            //  InvalidCodeLengthError               : {code: 1043, message: "Invalid code_length=%1."},
            //  InvalidMethodInfoFlagsError          : {code: 1044, message: "MethodInfo-%1 unsupported flags=%2."},
            UnsupportedTraitsKindError: { code: 1045, message: "Unsupported traits kind=%1." },
            //  MethodInfoOrderError                 : {code: 1046, message: "MethodInfo-%1 referenced before definition."},
            //  MissingEntryPointError               : {code: 1047, message: "No entry point was found."},
            PrototypeTypeError: { code: 1049, message: "Prototype objects must be vanilla Objects." },
            ConvertToPrimitiveError: { code: 1050, message: "Cannot convert %1 to primitive." },
            //  IllegalEarlyBindingError             : {code: 1051, message: "Illegal early binding access to %1."},
            InvalidURIError: { code: 1052, message: "Invalid URI passed to %1 function." },
            //  IllegalOverrideError                 : {code: 1053, message: "Illegal override of %1 in %2."},
            //  IllegalExceptionHandlerError         : {code: 1054, message: "Illegal range or target offsets in exception handler."},
            WriteSealedError: { code: 1056, message: "Cannot create property %1 on %2." },
            //  IllegalSlotError                     : {code: 1057, message: "%1 can only contain methods."},
            //  IllegalOperandTypeError              : {code: 1058, message: "Illegal operand type: %1 must be %2."},
            //  ClassInfoOrderError                  : {code: 1059, message: "ClassInfo-%1 is referenced before definition."},
            //  ClassInfoExceedsCountError           : {code: 1060, message: "ClassInfo %1 exceeds class_count=%2."},
            //  NumberOutOfRangeError                : {code: 1061, message: "The value %1 cannot be converted to %2 without losing precision."},
            WrongArgumentCountError: { code: 1063, message: "Argument count mismatch on %1. Expected %2, got %3." },
            //  CannotCallMethodAsConstructor        : {code: 1064, message: "Cannot call method %1 as constructor."},
            UndefinedVarError: { code: 1065, message: "Variable %1 is not defined." },
            //  FunctionConstructorError             : {code: 1066, message: "The form function('function body') is not supported."},
            //  IllegalNativeMethodBodyError         : {code: 1067, message: "Native method %1 has illegal method body."},
            //  CannotMergeTypesError                : {code: 1068, message: "%1 and %2 cannot be reconciled."},
            ReadSealedError: { code: 1069, message: "Property %1 not found on %2 and there is no default value." },
            //  CallNotFoundError                    : {code: 1070, message: "Method %1 not found on %2"},
            //  AlreadyBoundError                    : {code: 1071, message: "Function %1 has already been bound to %2."},
            //  ZeroDispIdError                      : {code: 1072, message: "Disp_id 0 is illegal."},
            //  DuplicateDispIdError                 : {code: 1073, message: "Non-override method %1 replaced because of duplicate disp_id %2."},
            ConstWriteError: { code: 1074, message: "Illegal write to read-only property %1 on %2." },
            //  MathNotFunctionError                 : {code: 1075, message: "Math is not a function."},
            //  MathNotConstructorError              : {code: 1076, message: "Math is not a constructor."},
            //  WriteOnlyError                       : {code: 1077, message: "Illegal read of write-only property %1 on %2."},
            //  IllegalOpMultinameError              : {code: 1078, message: "Illegal opcode/multiname combination: %1<%2>."},
            //  IllegalNativeMethodError             : {code: 1079, message: "Native methods are not allowed in loaded code."},
            //  IllegalNamespaceError                : {code: 1080, message: "Illegal value for namespace."},
            //  ReadSealedErrorNs                    : {code: 1081, message: "Property %1 not found on %2 and there is no default value."},
            //  NoDefaultNamespaceError              : {code: 1082, message: "No default namespace has been set."},
            XMLPrefixNotBound: { code: 1083, message: "The prefix \"%1\" for element \"%2\" is not bound." },
            //  XMLBadQName                          : {code: 1084, message: "Element or attribute (\"%1\") does not match QName production: QName::=(NCName':')?NCName."},
            XMLUnterminatedElementTag: { code: 1085, message: "The element type \"%1\" must be terminated by the matching end-tag \"</%2>\"." },
            XMLOnlyWorksWithOneItemLists: { code: 1086, message: "The %1 method only works on lists containing one item." },
            XMLAssignmentToIndexedXMLNotAllowed: { code: 1087, message: "Assignment to indexed XML is not allowed." },
            XMLMarkupMustBeWellFormed: { code: 1088, message: "The markup in the document following the root element must be well-formed." },
            XMLAssigmentOneItemLists: { code: 1089, message: "Assignment to lists with more than one item is not supported." },
            XMLMalformedElement: { code: 1090, message: "XML parser failure: element is malformed." },
            XMLUnterminatedCData: { code: 1091, message: "XML parser failure: Unterminated CDATA section." },
            XMLUnterminatedXMLDecl: { code: 1092, message: "XML parser failure: Unterminated XML declaration." },
            XMLUnterminatedDocTypeDecl: { code: 1093, message: "XML parser failure: Unterminated DOCTYPE declaration." },
            XMLUnterminatedComment: { code: 1094, message: "XML parser failure: Unterminated comment." },
            //  XMLUnterminatedAttribute             : {code: 1095, message: "XML parser failure: Unterminated attribute."},
            XMLUnterminatedElement: { code: 1096, message: "XML parser failure: Unterminated element." },
            //  XMLUnterminatedProcessingInstruction : {code: 1097, message: "XML parser failure: Unterminated processing instruction."},
            XMLNamespaceWithPrefixAndNoURI: { code: 1098, message: "Illegal prefix %1 for no namespace." },
            RegExpFlagsArgumentError: { code: 1100, message: "Cannot supply flags when constructing one RegExp from another." },
            //  NoScopeError                         : {code: 1101, message: "Cannot verify method %1 with unknown scope."},
            //  IllegalDefaultValue                  : {code: 1102, message: "Illegal default value for type %1."},
            //  CannotExtendFinalClass               : {code: 1103, message: "Class %1 cannot extend final base class."},
            //  XMLDuplicateAttribute                : {code: 1104, message: "Attribute \"%1\" was already specified for element \"%2\"."},
            //  CorruptABCError                      : {code: 1107, message: "The ABC data is corrupt, attempt to read out of bounds."},
            InvalidBaseClassError: { code: 1108, message: "The OP_newclass opcode was used with the incorrect base class." },
            //  DanglingFunctionError                : {code: 1109, message: "Attempt to directly call unbound function %1 from method %2."},
            //  CannotExtendError                    : {code: 1110, message: "%1 cannot extend %2."},
            //  CannotImplementError                 : {code: 1111, message: "%1 cannot implement %2."},
            //  CoerceArgumentCountError             : {code: 1112, message: "Argument count mismatch on class coercion.  Expected 1, got %1."},
            //  InvalidNewActivationError            : {code: 1113, message: "OP_newactivation used in method without NEED_ACTIVATION flag."},
            //  NoGlobalScopeError                   : {code: 1114, message: "OP_getglobalslot or OP_setglobalslot used with no global scope."},
            //  NotConstructorError                  : {code: 1115, message: "%1 is not a constructor."},
            //  ApplyError                           : {code: 1116, message: "second argument to Function.prototype.apply must be an array."},
            XMLInvalidName: { code: 1117, message: "Invalid XML name: %1." },
            XMLIllegalCyclicalLoop: { code: 1118, message: "Illegal cyclical loop between nodes." },
            //  DeleteTypeError                      : {code: 1119, message: "Delete operator is not supported with operand of type %1."},
            //  DeleteSealedError                    : {code: 1120, message: "Cannot delete property %1 on %2."},
            //  DuplicateMethodBodyError             : {code: 1121, message: "Method %1 has a duplicate method body."},
            //  IllegalInterfaceMethodBodyError      : {code: 1122, message: "Interface method %1 has illegal method body."},
            FilterError: { code: 1123, message: "Filter operator not supported on type %1." },
            //  InvalidHasNextError                  : {code: 1124, message: "OP_hasnext2 requires object and index to be distinct registers."},
            OutOfRangeError: { code: 1125, message: "The index %1 is out of range %2." },
            VectorFixedError: { code: 1126, message: "Cannot change the length of a fixed Vector." },
            TypeAppOfNonParamType: { code: 1127, message: "Type application attempted on a non-parameterized type." },
            WrongTypeArgCountError: { code: 1128, message: "Incorrect number of type parameters for %1. Expected %2, got %3." },
            JSONCyclicStructure: { code: 1129, message: "Cyclic structure cannot be converted to JSON string." },
            JSONInvalidReplacer: { code: 1131, message: "Replacer argument to JSON stringifier must be an array or a two parameter function." },
            JSONInvalidParseInput: { code: 1132, message: "Invalid JSON parse input." },
            //  FileOpenError                        : {code: 1500, message: "Error occurred opening file %1."},
            //  FileWriteError                       : {code: 1501, message: "Error occurred writing to file %1."},
            //  ScriptTimeoutError                   : {code: 1502, message: "A script has executed for longer than the default timeout period of 15 seconds."},
            //  ScriptTerminatedError                : {code: 1503, message: "A script failed to exit after 30 seconds and was terminated."},
            //  EndOfFileError                       : {code: 1504, message: "End of file."},
            //  StringIndexOutOfBoundsError          : {code: 1505, message: "The string index %1 is out of bounds; must be in range %2 to %3."},
            InvalidRangeError: { code: 1506, message: "The specified range is invalid." },
            NullArgumentError: { code: 1507, message: "Argument %1 cannot be null." },
            InvalidArgumentError: { code: 1508, message: "The value specified for argument %1 is invalid." },
            ArrayFilterNonNullObjectError: { code: 1510, message: "When the callback argument is a method of a class, the optional this argument must be null." },
            InvalidParamError: { code: 2004, message: "One of the parameters is invalid." },
            ParamRangeError: { code: 2006, message: "The supplied index is out of bounds." },
            NullPointerError: { code: 2007, message: "Parameter %1 must be non-null." },
            InvalidEnumError: { code: 2008, message: "Parameter %1 must be one of the accepted values." },
            CantInstantiateError: { code: 2012, message: "%1 class cannot be instantiated." },
            InvalidBitmapData: { code: 2015, message: "Invalid BitmapData." },
            EOFError: { code: 2030, message: "End of file was encountered.", fqn: 'flash.errors.EOFError' },
            CompressedDataError: { code: 2058, message: "There was an error decompressing the data.", fqn: 'flash.errors.IOError' },
            EmptyStringError: { code: 2085, message: "Parameter %1 must be non-empty string." },
            ProxyGetPropertyError: { code: 2088, message: "The Proxy class does not implement getProperty. It must be overridden by a subclass." },
            ProxySetPropertyError: { code: 2089, message: "The Proxy class does not implement setProperty. It must be overridden by a subclass." },
            ProxyCallPropertyError: { code: 2090, message: "The Proxy class does not implement callProperty. It must be overridden by a subclass." },
            ProxyHasPropertyError: { code: 2091, message: "The Proxy class does not implement hasProperty. It must be overridden by a subclass." },
            ProxyDeletePropertyError: { code: 2092, message: "The Proxy class does not implement deleteProperty. It must be overridden by a subclass." },
            ProxyGetDescendantsError: { code: 2093, message: "The Proxy class does not implement getDescendants. It must be overridden by a subclass." },
            ProxyNextNameIndexError: { code: 2105, message: "The Proxy class does not implement nextNameIndex. It must be overridden by a subclass." },
            ProxyNextNameError: { code: 2106, message: "The Proxy class does not implement nextName. It must be overridden by a subclass." },
            ProxyNextValueError: { code: 2107, message: "The Proxy class does not implement nextValue. It must be overridden by a subclass." },
            //  InvalidArrayLengthError              : {code: 2108, message: "The value %1 is not a valid Array length."},
            //  ReadExternalNotImplementedError      : {code: 2173, message: "Unable to read object in stream.  The class %1 does not implement flash.utils.IExternalizable but is aliased to an externalizable class."},
            /**
             * Player Error Codes
             */
            //  NoSecurityContextError                                    : { code: 2000, message: "No active security context."},
            TooFewArgumentsError: { code: 2001, message: "Too few arguments were specified; got %1, %2 expected." },
            //  InvalidSocketError                                        : { code: 2002, message: "Operation attempted on invalid socket."},
            //  InvalidSocketPortError                                    : { code: 2003, message: "Invalid socket port number specified."},
            ParamTypeError: { code: 2005, message: "Parameter %1 is of the incorrect type. Should be type %2." },
            //  HasStyleSheetError                                        : { code: 2009, message: "This method cannot be used on a text field with a style sheet."},
            //  SocketLocalFileSecurityError                              : { code: 2010, message: "Local-with-filesystem SWF files are not permitted to use sockets."},
            SocketConnectError: { code: 2011, message: "Socket connection failed to %1:%2." },
            //  AuthoringOnlyFeatureError                                 : { code: 2013, message: "Feature can only be used in Flash Authoring."},
            //  FeatureNotAvailableError                                  : { code: 2014, message: "Feature is not available at this time."},
            //  InvalidBitmapDataError                                    : { code: 2015, message: "Invalid BitmapData."},
            //  SystemExitSecurityError                                   : { code: 2017, message: "Only trusted local files may cause the Flash Player to exit."},
            //  SystemExitUnsupportedError                                : { code: 2018, message: "System.exit is only available in the standalone Flash Player."},
            //  InvalidDepthError                                         : { code: 2019, message: "Depth specified is invalid."},
            //  MovieClipSwapError                                        : { code: 2020, message: "MovieClips objects with different parents cannot be swapped."},
            //  ObjectCreationError                                       : { code: 2021, message: "Object creation failed."},
            //  NotDisplayObjectError                                     : { code: 2022, message: "Class %1 must inherit from DisplayObject to link to a symbol."},
            //  NotSpriteError                                            : { code: 2023, message: "Class %1 must inherit from Sprite to link to the root."},
            CantAddSelfError: { code: 2024, message: "An object cannot be added as a child of itself." },
            NotAChildError: { code: 2025, message: "The supplied DisplayObject must be a child of the caller." },
            //  NavigateURLError                                          : { code: 2026, message: "An error occurred navigating to the URL %1."},
            //  MustBeNonNegativeError                                    : { code: 2027, message: "Parameter %1 must be a non-negative number; got %2."},
            //  LocalSecurityError                                        : { code: 2028, message: "Local-with-filesystem SWF file %1 cannot access Internet URL %2."},
            //  InvalidStreamError                                        : { code: 2029, message: "This URLStream object does not have a stream opened."},
            //  SocketError                                               : { code: 2031, message: "Socket Error."},
            //  StreamError                                               : { code: 2032, message: "Stream Error."},
            //  KeyGenerationError                                        : { code: 2033, message: "Key Generation Failed."},
            //  InvalidKeyError                                           : { code: 2034, message: "An invalid digest was supplied."},
            //  URLNotFoundError                                          : { code: 2035, message: "URL Not Found."},
            //  LoadNeverCompletedError                                   : { code: 2036, message: "Load Never Completed."},
            //  InvalidCallError                                          : { code: 2037, message: "Functions called in incorrect sequence, or earlier call was unsuccessful."},
            //  FileIOError                                               : { code: 2038, message: "File I/O Error."},
            //  RemoteURLError                                            : { code: 2039, message: "Invalid remote URL protocol. The remote URL protocol must be HTTP or HTTPS."},
            //  BrowseInProgressError                                     : { code: 2041, message: "Only one file browsing session may be performed at a time."},
            //  DigestNotSupportedError                                   : { code: 2042, message: "The digest property is not supported by this load operation."},
            UnhandledError: { code: 2044, message: "Unhandled %1:." },
            //  FileVerificationError                                     : { code: 2046, message: "The loaded file did not have a valid signature."},
            //  DisplayListSecurityError                                  : { code: 2047, message: "Security sandbox violation: %1: %2 cannot access %3."},
            //  DownloadSecurityError                                     : { code: 2048, message: "Security sandbox violation: %1 cannot load data from %2."},
            //  UploadSecurityError                                       : { code: 2049, message: "Security sandbox violation: %1 cannot upload data to %2."},
            //  OutboundScriptingSecurityError                            : { code: 2051, message: "Security sandbox violation: %1 cannot evaluate scripting URLs within %2 (allowScriptAccess is %3). Attempted URL was %4."},
            AllowDomainArgumentError: { code: 2052, message: "Only String arguments are permitted for allowDomain and allowInsecureDomain." },
            //  IntervalSecurityError                                     : { code: 2053, message: "Security sandbox violation: %1 cannot clear an interval timer set by %2."},
            //  ExactSettingsError                                        : { code: 2054, message: "The value of Security.exactSettings cannot be changed after it has been used."},
            //  PrintJobStartError                                        : { code: 2055, message: "The print job could not be started."},
            //  PrintJobSendError                                         : { code: 2056, message: "The print job could not be sent to the printer."},
            //  PrintJobAddPageError                                      : { code: 2057, message: "The page could not be added to the print job."},
            //  ExternalCallbackSecurityError                             : { code: 2059, message: "Security sandbox violation: %1 cannot overwrite an ExternalInterface callback added by %2."},
            //  ExternalInterfaceSecurityError                            : { code: 2060, message: "Security sandbox violation: ExternalInterface caller %1 cannot access %2."},
            //  ExternalInterfaceNoCallbackError                          : { code: 2061, message: "No ExternalInterface callback %1 registered."},
            //  NoCloneMethodError                                        : { code: 2062, message: "Children of Event must override clone() {return new MyEventClass (...);}."},
            //  IMEError                                                  : { code: 2063, message: "Error attempting to execute IME command."},
            //  FocusNotSetError                                          : { code: 2065, message: "The focus cannot be set for this target."},
            DelayRangeError: { code: 2066, message: "The Timer delay specified is out of range." },
            ExternalInterfaceNotAvailableError: { code: 2067, message: "The ExternalInterface is not available in this container. ExternalInterface requires Internet Explorer ActiveX, Firefox, Mozilla 1.7.5 and greater, or other browsers that support NPRuntime." },
            //  InvalidSoundError                                         : { code: 2068, message: "Invalid sound."},
            InvalidLoaderMethodError: { code: 2069, message: "The Loader class does not implement this method." },
            //  StageOwnerSecurityError                                   : { code: 2070, message: "Security sandbox violation: caller %1 cannot access Stage owned by %2."},
            InvalidStageMethodError: { code: 2071, message: "The Stage class does not implement this property or method." },
            //  ProductManagerDiskError                                   : { code: 2073, message: "There was a problem saving the application to disk."},
            //  ProductManagerStageError                                  : { code: 2074, message: "The stage is too small to fit the download ui."},
            //  ProductManagerVerifyError                                 : { code: 2075, message: "The downloaded file is invalid."},
            //  FilterFailedError                                         : { code: 2077, message: "This filter operation cannot be performed with the specified input parameters."},
            TimelineObjectNameSealedError: { code: 2078, message: "The name property of a Timeline-placed object cannot be modified." },
            //  BitmapNotAssociatedWithBitsCharError                      : { code: 2079, message: "Classes derived from Bitmap can only be associated with defineBits characters (bitmaps)."},
            AlreadyConnectedError: { code: 2082, message: "Connect failed because the object is already connected." },
            CloseNotConnectedError: { code: 2083, message: "Close failed because the object is not connected." },
            ArgumentSizeError: { code: 2084, message: "The AMF encoding of the arguments cannot exceed 40K." },
            //  FileReferenceProhibitedError                              : { code: 2086, message: "A setting in the mms.cfg file prohibits this FileReference request."},
            //  DownloadFileNameProhibitedError                           : { code: 2087, message: "The FileReference.download() file name contains prohibited characters."},
            //  EventDispatchRecursionError                               : { code: 2094, message: "Event dispatch recursion overflow."},
            AsyncError: { code: 2095, message: "%1 was unable to invoke callback %2." },
            //  DisallowedHTTPHeaderError                                 : { code: 2096, message: "The HTTP request header %1 cannot be set via ActionScript."},
            //  FileFilterError                                           : { code: 2097, message: "The FileFilter Array is not in the correct format."},
            LoadingObjectNotSWFError: { code: 2098, message: "The loading object is not a .swf file, you cannot request SWF properties from it." },
            LoadingObjectNotInitializedError: { code: 2099, message: "The loading object is not sufficiently loaded to provide this information." },
            //  EmptyByteArrayError                                       : { code: 2100, message: "The ByteArray parameter in Loader.loadBytes() must have length greater than 0."},
            DecodeParamError: { code: 2101, message: "The String passed to URLVariables.decode() must be a URL-encoded query string containing name/value pairs." },
            //  NotAnXMLChildError                                        : { code: 2102, message: "The before XMLNode parameter must be a child of the caller."},
            //  XMLRecursionError                                         : { code: 2103, message: "XML recursion failure: new child would create infinite loop."},
            SceneNotFoundError: { code: 2108, message: "Scene %1 was not found." },
            FrameLabelNotFoundError: { code: 2109, message: "Frame label %1 not found in scene %2." },
            //  DisableAVM1LoadingError                                   : { code: 2110, message: "The value of Security.disableAVM1Loading cannot be set unless the caller can access the stage and is in an ActionScript 3.0 SWF file."},
            //  AVM1LoadingError                                          : { code: 2111, message: "Security.disableAVM1Loading is true so the current load of the ActionScript 1.0/2.0 SWF file has been blocked."},
            //  ApplicationDomainSecurityError                            : { code: 2112, message: "Provided parameter LoaderContext.ApplicationDomain is from a disallowed domain."},
            //  SecurityDomainSecurityError                               : { code: 2113, message: "Provided parameter LoaderContext.SecurityDomain is from a disallowed domain."},
            //  NonNullPointerError                                       : { code: 2114, message: "Parameter %1 must be null."},
            //  TrueParamError                                            : { code: 2115, message: "Parameter %1 must be false."},
            //  FalseParamError                                           : { code: 2116, message: "Parameter %1 must be true."},
            InvalidLoaderInfoMethodError: { code: 2118, message: "The LoaderInfo class does not implement this method." },
            //  LoaderInfoAppDomainSecurityError                          : { code: 2119, message: "Security sandbox violation: caller %1 cannot access LoaderInfo.applicationDomain owned by %2."},
            SecuritySwfNotAllowedError: { code: 2121, message: "Security sandbox violation: %1: %2 cannot access %3. This may be worked around by calling Security.allowDomain." },
            //  SecurityNonSwfIncompletePolicyFilesError                  : { code: 2122, message: "Security sandbox violation: %1: %2 cannot access %3. A policy file is required, but the checkPolicyFile flag was not set when this media was loaded."},
            //  SecurityNonSwfNotAllowedError                             : { code: 2123, message: "Security sandbox violation: %1: %2 cannot access %3. No policy files granted access."},
            UnknownFileTypeError: { code: 2124, message: "Loaded file is an unknown type." },
            //  SecurityCrossVMNotAllowedError                            : { code: 2125, message: "Security sandbox violation: %1 cannot use Runtime Shared Library %2 because crossing the boundary between ActionScript 3.0 and ActionScript 1.0/2.0 objects is not allowed."},
            //  NotConnectedError                                         : { code: 2126, message: "NetConnection object must be connected."},
            //  FileRefBadPostDataTypeError                               : { code: 2127, message: "FileReference POST data cannot be type ByteArray."},
            //  NetConnectionConnectError                                 : { code: 2129, message: "Connection to %1 failed."},
            //  SharedObjectFlushFailedError                              : { code: 2130, message: "Unable to flush SharedObject."},
            //  DefinitionNotFoundError                                   : { code: 2131, message: "Definition %1 cannot be found."},
            //  NetConnectionInvalidConnectFromNetStatusEventError        : { code: 2132, message: "NetConnection.connect cannot be called from a netStatus event handler."},
            //  CallbackNotRegisteredError                                : { code: 2133, message: "Callback %1 is not registered."},
            //  SharedObjectCreateError                                   : { code: 2134, message: "Cannot create SharedObject."},
            //  InvalidSWFError                                           : { code: 2136, message: "The SWF file %1 contains invalid data."},
            //  NavigationSecurityError                                   : { code: 2137, message: "Security sandbox violation: %1 cannot navigate window %2 within %3 (allowScriptAccess is %4). Attempted URL was %5."},
            //  NonParsableRichTextXMLError                               : { code: 2138, message: "Rich text XML could not be parsed."},
            //  SharedObjectConnectError                                  : { code: 2139, message: "SharedObject could not connect."},
            //  LocalSecurityLoadingError                                 : { code: 2140, message: "Security sandbox violation: %1 cannot load %2. Local-with-filesystem and local-with-networking SWF files cannot load each other."},
            //  MultiplePrintJobsError                                    : { code: 2141, message: "Only one PrintJob may be in use at a time."},
            //  LocalImportSecurityError                                  : { code: 2142, message: "Security sandbox violation: local SWF files cannot use the LoaderContext.sec property. %1 was attempting to load %2."},
            //  AccOverrideRole                                           : { code: 2143, message: "AccessibilityImplementation.get_accRole() must be overridden from its default."},
            //  AccOverrideState                                          : { code: 2144, message: "AccessibilityImplementation.get_accState() must be overridden from its default."},
            //  URLRequestHeaderInvalidLengthError                        : { code: 2145, message: "Cumulative length of requestHeaders must be less than 8192 characters."},
            //  AllowNetworkingSecurityError                              : { code: 2146, message: "Security sandbox violation: %1 cannot call %2 because the HTML/container parameter allowNetworking has the value %3."},
            //  ForbiddenProtocolError                                    : { code: 2147, message: "Forbidden protocol in URL %1."},
            //  RemoteToLocalSecurityError                                : { code: 2148, message: "SWF file %1 cannot access local resource %2. Only local-with-filesystem and trusted local SWF files may access local resources."},
            //  FsCommandSecurityError                                    : { code: 2149, message: "Security sandbox violation: %1 cannot make fscommand calls to %2 (allowScriptAccess is %3)."},
            CantAddParentError: { code: 2150, message: "An object cannot be added as a child to one of it's children (or children's children, etc.)." },
            //  FullScreenSecurityError                                   : { code: 2151, message: "You cannot enter full screen mode when the settings dialog is visible."},
            //  FullScreenNotAllowedError                                 : { code: 2152, message: "Full screen mode is not allowed."},
            //  URLRequestInvalidHeader                                   : { code: 2153, message: "The URLRequest.requestHeaders array must contain only non-NULL URLRequestHeader objects."},
            //  InvalidNetStreamObject                                    : { code: 2154, message: "The NetStream Object is invalid.  This may be due to a failed NetConnection."},
            //  InvalidFunctionName                                       : { code: 2155, message: "The ExternalInterface.call functionName parameter is invalid.  Only alphanumeric characters are supported."},
            //  ForbiddenPortForProtocolError                             : { code: 2156, message: "Port %1 may not be accessed using protocol %2. Calling SWF was %3."},
            //  NoAsfunctionErrror                                        : { code: 2157, message: "Rejecting URL %1 because the 'asfunction:' protocol may only be used for link targets, not for networking APIs."},
            //  InvalidNetConnectionObject                                : { code: 2158, message: "The NetConnection Object is invalid.  This may be due to a dropped NetConnection."},
            //  InvalidSharedObject                                       : { code: 2159, message: "The SharedObject Object is invalid."},
            //  InvalidTextLineError                                      : { code: 2160, message: "The TextLine is INVALID and cannot be used to access the current state of the TextBlock."},
            //  TextLayoutError                                           : { code: 2161, message: "An internal error occured while laying out the text."},
            //  FragmentOutputType                                        : { code: 2162, message: "The Shader output type is not compatible for this operation."},
            //  FragmentInputType                                         : { code: 2163, message: "The Shader input type %1 is not compatible for this operation."},
            //  FragmentInputMissing                                      : { code: 2164, message: "The Shader input %1 is missing or an unsupported type."},
            //  FragmentInputTooSmall                                     : { code: 2165, message: "The Shader input %1 does not have enough data."},
            //  FragmentInputNoDimension                                  : { code: 2166, message: "The Shader input %1 lacks valid dimensions."},
            //  FragmentNotEnoughInput                                    : { code: 2167, message: "The Shader does not have the required number of inputs for this operation."},
            //  StaticTextLineError                                       : { code: 2168, message: "Static text lines have no atoms and no reference to a text block."},
            //  SecurityQuestionableBrowserScriptingError                 : { code: 2169, message: "The method %1 may not be used for browser scripting.  The URL %2 requested by %3 is being ignored.  If you intend to call browser script, use navigateToURL instead."},
            //  HeaderSecurityError                                       : { code: 2170, message: "Security sandbox violation: %1 cannot send HTTP headers to %2."},
            //  FragmentMissing                                           : { code: 2171, message: "The Shader object contains no byte code to execute."},
            //  FragmentAlreadyRunning                                    : { code: 2172, message: "The ShaderJob is already running or finished."},
            //  FileReferenceBusyError                                    : { code: 2174, message: "Only one download, upload, load or save operation can be active at a time on each FileReference."},
            //  UnformattedElementError                                   : { code: 2175, message: "One or more elements of the content of the TextBlock has a null ElementFormat."},
            //  UserActionRequiredError                                   : { code: 2176, message: "Certain actions, such as those that display a pop-up window, may only be invoked upon user interaction, for example by a mouse click or button press."},
            //  FragmentInputTooLarge                                     : { code: 2177, message: "The Shader input %1 is too large."},
            //  ClipboardConstNotAllowed                                  : { code: 2178, message: "The Clipboard.generalClipboard object must be used instead of creating a new Clipboard."},
            //  ClipboardDisallowedRead                                   : { code: 2179, message: "The Clipboard.generalClipboard object may only be read while processing a flash.events.Event.PASTE event."},
            //  CantMoveAVM1ContentLoadedIntoAVM2                         : { code: 2180, message: "It is illegal to move AVM1 content (AS1 or AS2) to a different part of the displayList when it has been loaded into AVM2 (AS3) content."},
            //  InvalidTextLineMethodError                                : { code: 2181, message: "The TextLine class does not implement this property or method."},
            //  PerspectiveFieldOfViewValueInvalid                        : { code: 2182, message: "Invalid fieldOfView value.  The value must be greater than 0 and less than 180."},
            //  Invalid3DScale                                            : { code: 2183, message: "Scale values must not be zero."},
            //  LockedElementFormatError                                  : { code: 2184, message: "The ElementFormat object is locked and cannot be modified."},
            //  LockedFontDescriptionError                                : { code: 2185, message: "The FontDescription object is locked and cannot be modified."},
            //  PerspectiveFocalLengthInvalid                             : { code: 2186, message: "Invalid focalLength %1."},
            //  Matrix3DDecomposeTypeInvalid                              : { code: 2187, message: "Invalid orientation style %1.  Value must be one of 'Orientation3D.EULER_ANGLES', 'Orientation3D.AXIS_ANGLE', or 'Orientation3D.QUATERNION'."},
            //  MatrixNonInvertibleError                                  : { code: 2188, message: "Invalid raw matrix. Matrix must be invertible."},
            Matrix3DRefCannontBeShared: { code: 2189, message: "A Matrix3D can not be assigned to more than one DisplayObject." },
            //  ForceDownloadSecurityError                                : { code: 2190, message: "The attempted load of %1 failed as it had a Content-Disposition of attachment set."},
            //  ClipboardDisallowedWrite                                  : { code: 2191, message: "The Clipboard.generalClipboard object may only be written to as the result of user interaction, for example by a mouse click or button press."},
            //  MalformedUnicodeError                                     : { code: 2192, message: "An unpaired Unicode surrogate was encountered in the input."},
            //  SecurityContentAccessDeniedError                          : { code: 2193, message: "Security sandbox violation: %1: %2 cannot access %3."},
            //  LoaderParamError                                          : { code: 2194, message: "Parameter %1 cannot be a Loader."},
            //  LoaderAsyncError                                          : { code: 2195, message: "Error thrown as Loader called %1."},
            ObjectWithStringsParamError: { code: 2196, message: "Parameter %1 must be an Object with only String values." },
            //  SystemUpdaterPlayerNotSupportedError                      : { code: 2200, message: "The SystemUpdater class is not supported by this player."},
            //  SystemUpdaterOSNotSupportedError                          : { code: 2201, message: "The requested update type is not supported on this operating system."},
            //  SystemUpdaterBusy                                         : { code: 2202, message: "Only one SystemUpdater action is allowed at a time."},
            //  SystemUpdaterFailed                                       : { code: 2203, message: "The requested SystemUpdater action cannot be completed."},
            //  SystemUpdaterCannotCancel                                 : { code: 2204, message: "This operation cannot be canceled because it is waiting for user interaction."},
            //  SystemUpdaterUnknownTarget                                : { code: 2205, message: "Invalid update type %1."},
            //  SignedSWfLoadingError                                     : { code: 2500, message: "An error occurred decrypting the signed swf file. The swf will not be loaded."},
            //  NotScreenSharingError                                     : { code: 2501, message: "This property can only be accessed during screen sharing."},
            //  NotSharingMonitorError                                    : { code: 2502, message: "This property can only be accessed if sharing the entire screen."},
            //  FileBadPathName                                           : { code: 3000, message: "Illegal path name."},
            //  FileAccessDenied                                          : { code: 3001, message: "File or directory access denied."},
            //  FileExists                                                : { code: 3002, message: "File or directory exists."},
            //  FileDoesNotExist                                          : { code: 3003, message: "File or directory does not exist."},
            //  FileInsufficientSpace                                     : { code: 3004, message: "Insufficient file space."},
            //  FileSystemResources                                       : { code: 3005, message: "Insufficient system resources."},
            //  FileNotAFile                                              : { code: 3006, message: "Not a file."},
            //  FileNotADir                                               : { code: 3007, message: "Not a directory."},
            //  FileReadOnlyFileSys                                       : { code: 3008, message: "Read-only or write-protected media."},
            //  FileNotSameDevice                                         : { code: 3009, message: "Cannot move file or directory to a different device."},
            //  DirNotEmpty                                               : { code: 3010, message: "Directory is not empty."},
            //  FileDestinationExists                                     : { code: 3011, message: "Move or copy destination already exists."},
            //  FileCantDelete                                            : { code: 3012, message: "Cannot delete file or directory."},
            //  FileInUse                                                 : { code: 3013, message: "File or directory is in use."},
            //  FileCopyMoveAncestor                                      : { code: 3014, message: "Cannot copy or move a file or directory to overwrite a containing directory."},
            //  LoadBytesCodeExecutionSecurityError                       : { code: 3015, message: "Loader.loadBytes() is not permitted to load content with executable code."},
            //  FileApplicationNotFound                                   : { code: 3016, message: "No application was found that can open this file."},
            //  SQLConnectionCannotClose                                  : { code: 3100, message: "A SQLConnection cannot be closed while statements are still executing."},
            //  SQLConnectionAlreadyOpen                                  : { code: 3101, message: "Database connection is already open."},
            //  SQLConnectionInvalidName                                  : { code: 3102, message: "Name argument specified was invalid. It must not be null or empty."},
            //  SQLConnectionInTransaction                                : { code: 3103, message: "Operation cannot be performed while there is an open transaction on this connection."},
            //  SQLConnectionNotOpen                                      : { code: 3104, message: "A SQLConnection must be open to perform this operation."},
            //  SQLConnectionNoOpenTransaction                            : { code: 3105, message: "Operation is only allowed if a connection has an open transaction."},
            //  SQLStatementIsExecutingProperty                           : { code: 3106, message: "Property cannot be changed while SQLStatement.executing is true."},
            //  SQLStatementIvalidCall                                    : { code: 3107, message: "%1 may not be called unless SQLResult.complete is false."},
            //  SQLStatementInvalidText                                   : { code: 3108, message: "Operation is not permitted when the SQLStatement.text property is not set."},
            //  SQLStatementInvalidConnection                             : { code: 3109, message: "Operation is not permitted when the SQLStatement.sqlConnection property is not set."},
            //  SQLStatementIsExecutingCall                               : { code: 3110, message: "Operation cannot be performed while SQLStatement.executing is true."},
            //  SQLStatementInvalidSchemaType                             : { code: 3111, message: "An invalid schema type was specified."},
            //  SQLConnectionInvalidLockType                              : { code: 3112, message: "An invalid transaction lock type was specified."},
            //  SQLConnectionNotFileReference                             : { code: 3113, message: "Reference specified is not of type File."},
            //  SQLConnectionInvalidModeSpecified                         : { code: 3114, message: "An invalid open mode was specified."},
            //  SQLGeneralEngineError                                     : { code: 3115, message: "SQL Error."},
            //  SQLInternalEngineError                                    : { code: 3116, message: "An internal logic error occurred."},
            //  SQLPermissionError                                        : { code: 3117, message: "Access permission denied."},
            //  SQLOperationAbortedError                                  : { code: 3118, message: "Operation aborted."},
            //  SQLDatabaseLockedError                                    : { code: 3119, message: "Database file is currently locked."},
            //  SQLTableLockedError                                       : { code: 3120, message: "Table is locked."},
            //  SQLOutOfMemoryError                                       : { code: 3121, message: "Out of memory."},
            //  SQLDatabaseIsReadonlyError                                : { code: 3122, message: "Attempt to write a readonly database."},
            //  SQLDatabaseCorruptError                                   : { code: 3123, message: "Database disk image is malformed."},
            //  SQLDatabaseFullError                                      : { code: 3124, message: "Insertion failed because database is full."},
            //  SQLCannotOpenDatabaseError                                : { code: 3125, message: "Unable to open the database file."},
            //  SQLLockingProtocolError                                   : { code: 3126, message: "Database lock protocol error."},
            //  SQLDatabaseEmptyError                                     : { code: 3127, message: "Database is empty."},
            //  SQLDiskIOError                                            : { code: 3128, message: "Disk I/O error occurred."},
            //  SQLSchemaChangedError                                     : { code: 3129, message: "The database schema changed."},
            //  SQLTooMuchDataError                                       : { code: 3130, message: "Too much data for one row of a table."},
            //  SQLConstraintError                                        : { code: 3131, message: "Abort due to constraint violation."},
            //  SQLDataTypeMismatchError                                  : { code: 3132, message: "Data type mismatch."},
            //  SQLConcurrencyError                                       : { code: 3133, message: "An internal error occurred."},
            //  SQLNotSupportedOnOSError                                  : { code: 3134, message: "Feature not supported on this operating system."},
            //  SQLAuthorizationDeniedError                               : { code: 3135, message: "Authorization denied."},
            //  SQLAuxDatabaseFormatError                                 : { code: 3136, message: "Auxiliary database format error."},
            //  SQLBindingRangeError                                      : { code: 3137, message: "An index specified for a parameter was out of range."},
            //  SQLInvalidDatabaseFileError                               : { code: 3138, message: "File opened is not a database file."},
            //  SQLInvalidPageSizeError                                   : { code: 3139, message: "The page size specified was not valid for this operation."},
            //  SQLInvalidKeySizeError                                    : { code: 3140, message: "The encryption key size specified was not valid for this operation. Keys must be exactly 16 bytes in length"},
            //  SQLInvalidConfigurationError                              : { code: 3141, message: "The requested database configuration is not supported."},
            //  SQLCannotRekeyNonKeyedDatabase                            : { code: 3143, message: "Unencrypted databases may not be reencrypted."},
            //  NativeWindowClosedError                                   : { code: 3200, message: "Cannot perform operation on closed window."},
            //  PDFNoReaderInstalled                                      : { code: 3201, message: "Adobe Reader cannot be found."},
            //  PDFOldReaderInstalled                                     : { code: 3202, message: "Adobe Reader 8.1 or later cannot be found."},
            //  PDFOldDefaultText                                         : { code: 3203, message: "Default Adobe Reader must be version 8.1 or later."},
            //  PDFCannotLoadReader                                       : { code: 3204, message: "An error ocurred trying to load Adobe Reader."},
            //  ApplicationFeatureSecurityError                           : { code: 3205, message: "Only application-sandbox content can access this feature."},
            //  LoaderInfoDoorSecurityError                               : { code: 3206, message: "Caller %1 cannot set LoaderInfo property %2."},
            //  ApplicationNonFeatureSecurityError                        : { code: 3207, message: "Application-sandbox content cannot access this feature."},
            //  InvalidClipboardAccess                                    : { code: 3208, message: "Attempt to access invalid clipboard."},
            //  DeadClipboardAccess                                       : { code: 3209, message: "Attempt to access dead clipboard."},
            //  DeadJavaScriptObjectAccess                                : { code: 3210, message: "The application attempted to reference a JavaScript object in a HTML page that is no longer loaded."},
            //  FilePromiseIOError                                        : { code: 3211, message: "Drag and Drop File Promise error: %1"},
            //  NativeProcessNotRunning                                   : { code: 3212, message: "Cannot perform operation on a NativeProcess that is not running."},
            //  NativeProcessAlreadyRunning                               : { code: 3213, message: "Cannot perform operation on a NativeProcess that is already running."},
            //  NativeProcessBadExecutable                                : { code: 3214, message: "NativeProcessStartupInfo.executable does not specify a valid executable file."},
            //  NativeProcessBadWorkingDirectory                          : { code: 3215, message: "NativeProcessStartupInfo.workingDirectory does not specify a valid directory."},
            //  NativeProcessStdOutReadError                              : { code: 3216, message: "Error while reading data from NativeProcess.standardOutput."},
            //  NativeProcessStdErrReadError                              : { code: 3217, message: "Error while reading data from NativeProcess.standardError."},
            //  NativeProcessStdInWriteError                              : { code: 3218, message: "Error while writing data to NativeProcess.standardInput."},
            //  NativeProcessNotStarted                                   : { code: 3219, message: "The NativeProcess could not be started. '%1'"},
            //  ActionNotAllowedSecurityError                             : { code: 3220, message: "Action '%1' not allowed in current security context '%2'."},
            //  SWFNoPlayerInstalled                                      : { code: 3221, message: "Adobe Flash Player cannot be found."},
            //  SWFOldPlayerInstalled                                     : { code: 3222, message: "The installed version of Adobe Flash Player is too old."},
            //  DNSResolverLookupError                                    : { code: 3223, message: "DNS lookup error: platform error %1"},
            //  SocketMessageTooLongError                                 : { code: 3224, message: "Socket message too long"},
            //  SocketCannotSendDataToAddressAfterConnect                 : { code: 3225, message: "Cannot send data to a location when connected."},
            AllowCodeImportError: { code: 3226, message: "Cannot import a SWF file when LoaderContext.allowCodeImport is false." },
            //  BackgroundLaunchError                                     : { code: 3227, message: "Cannot launch another application from background."},
            //  StageWebViewLoadError                                     : { code: 3228, message: "StageWebView encountered an error during the load operation."},
            //  StageWebViewProtocolNotSupported                          : { code: 3229, message: "The protocol is not supported.:"},
            //  BrowseOperationUnsupported                                : { code: 3230, message: "The browse operation is unsupported."},
            //  InvalidVoucher                                            : { code: 3300, message: "Voucher is invalid."},
            //  AuthenticationFailed                                      : { code: 3301, message: "User authentication failed."},
            //  RequireSSLError                                           : { code: 3302, message: "Flash Access server does not support SSL."},
            //  ContentExpiredError                                       : { code: 3303, message: "Content expired."},
            //  AuthorizationFailed                                       : { code: 3304, message: "User authorization failed (for example, the user has not purchased the content)."},
            //  ServerConnectionFailed                                    : { code: 3305, message: "Can't connect to the server."},
            //  ClientUpdateRequired                                      : { code: 3306, message: "Client update required (Flash Access server requires new client)."},
            //  InternalError                                             : { code: 3307, message: "Generic internal Flash Access failure."},
            //  WrongVoucherKey                                           : { code: 3308, message: "Wrong voucher key."},
            //  CorruptedFLV                                              : { code: 3309, message: "Video content is corrupted."},
            //  AppIDMismatch                                             : { code: 3310, message: "The AIR application or Flash Player SWF does not match the one specified in the DRM policy."},
            //  AppVersionMismatch                                        : { code: 3311, message: "The version of the application does not match the one specified in the DRM policy."},
            //  VoucherIntegrityError                                     : { code: 3312, message: "Verification of voucher failed."},
            //  WriteFileSystemFailed                                     : { code: 3313, message: "Write to the file system failed."},
            //  FLVHeaderIntegrityFailed                                  : { code: 3314, message: "Verification of FLV/F4V header file failed."},
            PermissionDenied: { code: 3315, message: "The current security context does not allow this operation." },
            //  LocalConnectionUserScopedLocked                           : { code: 3316, message: "The value of LocalConnection.isPerUser cannot be changed because it has already been locked by a call to LocalConnection.connect, .send, or .close."},
            //  LoadAdobeCPFailed                                         : { code: 3317, message: "Failed to load Flash Access module."},
            //  IncompatibleAdobeCPVersion                                : { code: 3318, message: "Incompatible version of Flash Access module found."},
            //  MissingAdobeCPEntryPoint                                  : { code: 3319, message: "Missing Flash Access module API entry point."},
            //  InternalErrorHA                                           : { code: 3320, message: "Generic internal Flash Access failure."},
            //  IndividualizationFailed                                   : { code: 3321, message: "Individualization failed."},
            //  DeviceBindingFailed                                       : { code: 3322, message: "Device binding failed."},
            //  CorruptStore                                              : { code: 3323, message: "The internal stores are corrupted."},
            //  MachineTokenInvalid                                       : { code: 3324, message: "Reset license files and the client will fetch a new machine token."},
            //  CorruptServerStateStore                                   : { code: 3325, message: "Internal stores are corrupt."},
            //  TamperingDetected                                         : { code: 3326, message: "Call customer support."},
            //  ClockTamperingDetected                                    : { code: 3327, message: "Clock tampering detected."},
            //  ServerErrorTryAgain                                       : { code: 3328, message: "Server error; retry the request."},
            //  ApplicationSpecificError                                  : { code: 3329, message: "Error in application-specific namespace."},
            //  NeedAuthentication                                        : { code: 3330, message: "Need to authenticate the user and reacquire the voucher."},
            //  ContentNotYetValid                                        : { code: 3331, message: "Content is not yet valid."},
            //  CachedVoucherExpired                                      : { code: 3332, message: "Cached voucher has expired. Reacquire the voucher from the server."},
            //  PlaybackWindowExpired                                     : { code: 3333, message: "The playback window for this policy has expired."},
            //  InvalidDRMPlatform                                        : { code: 3334, message: "This platform is not allowed to play this content."},
            //  InvalidDRMVersion                                         : { code: 3335, message: "Invalid version of Flash Access module. Upgrade AIR or Flash Access module for the Flash Player."},
            //  InvalidRuntimePlatform                                    : { code: 3336, message: "This platform is not allowed to play this content."},
            //  InvalidRuntimeVersion                                     : { code: 3337, message: "Upgrade Flash Player or AIR  and retry playback."},
            //  UnknownConnectionType                                     : { code: 3338, message: "Unknown connection type."},
            //  NoAnalogPlaybackAllowed                                   : { code: 3339, message: "Can't play back on analog device. Connect to a digital device."},
            //  NoAnalogProtectionAvail                                   : { code: 3340, message: "Can't play back because connected analog device doesn't have the correct capabilities."},
            //  NoDigitalPlaybackAllowed                                  : { code: 3341, message: "Can't play back on digital device."},
            //  NoDigitalProtectionAvail                                  : { code: 3342, message: "The connected digital device doesn't have the correct capabilities."},
            InternalErrorIV: { code: 3343, message: "Internal Error." }
        };
        for (var k in AVMX.Errors) {
            var error = AVMX.Errors[k];
            error.typeName = k;
            AVMX.Errors[error.code] = error;
        }
        function getErrorMessage(index) {
            var message = "Error #" + index;
            if (!Shumway.AVM2.Runtime.debuggerMode.value) {
                return message;
            }
            var error = AVMX.Errors[index];
            return message + ": " + (error && error.message || "(unknown)");
        }
        AVMX.getErrorMessage = getErrorMessage;
        function getErrorInfo(index) {
            return AVMX.Errors[index];
        }
        AVMX.getErrorInfo = getErrorInfo;
        function formatErrorMessage(error) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var message = error.message;
            args.forEach(function (x, i) {
                message = message.replace("%" + (i + 1), x);
            });
            return "Error #" + error.code + ": " + message;
        }
        AVMX.formatErrorMessage = formatErrorMessage;
        function translateErrorMessage(error) {
            if (error.type) {
                switch (error.type) {
                    case "undefined_method":
                        return formatErrorMessage(AVMX.Errors.CallOfNonFunctionError, "value");
                    default:
                        throw Shumway.Debug.notImplemented(error.type);
                }
            }
            else {
                if (error.message.indexOf("is not a function") >= 0) {
                    return formatErrorMessage(AVMX.Errors.CallOfNonFunctionError, "value");
                }
                return error.message;
            }
        }
        AVMX.translateErrorMessage = translateErrorMessage;
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
// Errors is used in dataBuffer.ts, which is compiled way before this. Gotta break the cycle.
Errors = Shumway.AVMX.Errors;
var Shumway;
(function (Shumway) {
    var AVM2;
    (function (AVM2) {
        var Option = Shumway.Options.Option;
        var OptionSet = Shumway.Options.OptionSet;
        var shumwayOptions = Shumway.Settings.shumwayOptions;
        var avm2Options = shumwayOptions.register(new OptionSet("AVM2"));
        var Runtime;
        (function (Runtime) {
            var options = avm2Options.register(new OptionSet("Runtime"));
            Runtime.traceRuntime = options.register(new Option("tr", "traceRuntime", "boolean", false, "trace runtime"));
            Runtime.traceExecution = options.register(new Option("tx", "traceExecution", "boolean", false, "trace execution"));
            Runtime.traceInterpreter = options.register(new Option("ti", "traceInterpreter", "boolean", false, "trace interpreter"));
            Runtime.debuggerMode = options.register(new Option("db", "debuggerMode", "boolean", true, "enable debugger mode"));
        })(Runtime = AVM2.Runtime || (AVM2.Runtime = {}));
    })(AVM2 = Shumway.AVM2 || (Shumway.AVM2 = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var AVM2;
    (function (AVM2) {
        var ABC;
        (function (ABC) {
            var textDecoder = null;
            if (typeof TextDecoder !== "undefined") {
                textDecoder = new TextDecoder();
            }
            var AbcStream = (function () {
                function AbcStream(bytes) {
                    this._bytes = bytes;
                    this._view = new DataView(bytes.buffer, bytes.byteOffset);
                    this._position = 0;
                }
                AbcStream._getResultBuffer = function (length) {
                    if (!AbcStream._resultBuffer || AbcStream._resultBuffer.length < length) {
                        AbcStream._resultBuffer = new Int32Array(length * 2);
                    }
                    return AbcStream._resultBuffer;
                };
                Object.defineProperty(AbcStream.prototype, "position", {
                    get: function () {
                        return this._position;
                    },
                    enumerable: true,
                    configurable: true
                });
                AbcStream.prototype.remaining = function () {
                    return this._bytes.length - this._position;
                };
                AbcStream.prototype.seek = function (position) {
                    this._position = position;
                };
                AbcStream.prototype.advance = function (length) {
                    this._position += length;
                };
                AbcStream.prototype.readU8 = function () {
                    return this._bytes[this._position++];
                };
                AbcStream.prototype.readU8s = function (count) {
                    var b = new Uint8Array(count);
                    b.set(this._bytes.subarray(this._position, this._position + count), 0);
                    this._position += count;
                    return b;
                };
                AbcStream.prototype.viewU8s = function (count) {
                    var view = this._bytes.subarray(this._position, this._position + count);
                    this._position += count;
                    return view;
                };
                AbcStream.prototype.readS8 = function () {
                    return this._bytes[this._position++] << 24 >> 24;
                };
                AbcStream.prototype.readU32 = function () {
                    return this.readS32() >>> 0;
                };
                AbcStream.prototype.readU30 = function () {
                    var result = this.readU32();
                    if (result & 0xc0000000) {
                        // TODO: Spec says this is a corrupt ABC file, but it seems that some content
                        // has this, e.g. 1000-0.abc
                        // error("Corrupt ABC File");
                        return result;
                    }
                    return result;
                };
                AbcStream.prototype.readU30Unsafe = function () {
                    return this.readU32();
                };
                AbcStream.prototype.readS16 = function () {
                    return (this.readU30Unsafe() << 16) >> 16;
                };
                /**
                 * Read a variable-length encoded 32-bit signed integer. The value may use one to five bytes (little endian),
                 * each contributing 7 bits. The most significant bit of each byte indicates that the next byte is part of
                 * the value. The spec indicates that the most significant bit of the last byte to be read is sign extended
                 * but this turns out not to be the case in the real implementation, for instance 0x7f should technically be
                 * -1, but instead it's 127. Moreover, what happens to the remaining 4 high bits of the fifth byte that is
                 * read? Who knows, here we'll just stay true to the Tamarin implementation.
                 */
                AbcStream.prototype.readS32 = function () {
                    var result = this.readU8();
                    if (result & 0x80) {
                        result = result & 0x7f | this.readU8() << 7;
                        if (result & 0x4000) {
                            result = result & 0x3fff | this.readU8() << 14;
                            if (result & 0x200000) {
                                result = result & 0x1fffff | this.readU8() << 21;
                                if (result & 0x10000000) {
                                    result = result & 0x0fffffff | this.readU8() << 28;
                                    result = result & 0xffffffff;
                                }
                            }
                        }
                    }
                    return result;
                };
                AbcStream.prototype.readWord = function () {
                    var result = this._view.getUint32(this._position, true);
                    this._position += 4;
                    return result;
                };
                AbcStream.prototype.readS24 = function () {
                    var u = this.readU8() | (this.readU8() << 8) | (this.readU8() << 16);
                    return (u << 8) >> 8;
                };
                AbcStream.prototype.readDouble = function () {
                    var result = this._view.getFloat64(this._position, true);
                    this._position += 8;
                    return result;
                };
                AbcStream.prototype.readUTFString = function (length) {
                    /**
                     * Use the TextDecoder API whenever available.
                     * http://encoding.spec.whatwg.org/#concept-encoding-get
                     */
                    if (textDecoder) {
                        var position = this._position;
                        this._position += length;
                        return textDecoder.decode(this._bytes.subarray(position, position + length));
                    }
                    var pos = this._position;
                    var end = pos + length;
                    var bytes = this._bytes;
                    var i = 0;
                    var result = AbcStream._getResultBuffer(length * 2);
                    while (pos < end) {
                        var c = bytes[pos++];
                        if (c <= 0x7f) {
                            result[i++] = c;
                        }
                        else if (c >= 0xc0) {
                            var code = 0;
                            if (c < 0xe0) {
                                code = ((c & 0x1f) << 6) | (bytes[pos++] & 0x3f);
                            }
                            else if (c < 0xf0) {
                                code = ((c & 0x0f) << 12) | ((bytes[pos++] & 0x3f) << 6) | (bytes[pos++] & 0x3f);
                            }
                            else {
                                // turned into two characters in JS as surrogate pair
                                code = (((c & 0x07) << 18) | ((bytes[pos++] & 0x3f) << 12) | ((bytes[pos++] & 0x3f) << 6) | (bytes[pos++] & 0x3f)) - 0x10000;
                                // High surrogate
                                result[i++] = ((code & 0xffc00) >>> 10) + 0xd800;
                                // Low surrogate
                                code = (code & 0x3ff) + 0xdc00;
                            }
                            result[i++] = code;
                        } // Otherwise it's an invalid UTF8, skipped.
                    }
                    this._position = pos;
                    return Shumway.StringUtilities.fromCharCodeArray(result.subarray(0, i));
                };
                AbcStream._resultBuffer = new Int32Array(256);
                return AbcStream;
            })();
            ABC.AbcStream = AbcStream;
        })(ABC = AVM2.ABC || (AVM2.ABC = {}));
    })(AVM2 = Shumway.AVM2 || (Shumway.AVM2 = {}));
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var assert = Shumway.Debug.assert;
        var writer = new Shumway.IndentingWriter();
        var bytecodeNames = ["", "BKPT", "NOP", "THROW", "GETSUPER", "SETSUPER", "DXNS", "DXNSLATE", "KILL", "LABEL", "LF32X4", "SF32X4", "IFNLT", "IFNLE", "IFNGT", "IFNGE", "JUMP", "IFTRUE", "IFFALSE", "IFEQ", "IFNE", "IFLT", "IFLE", "IFGT", "IFGE", "IFSTRICTEQ", "IFSTRICTNE", "LOOKUPSWITCH", "PUSHWITH", "POPSCOPE", "NEXTNAME", "HASNEXT", "PUSHNULL", "PUSHUNDEFINED", "PUSHFLOAT", "NEXTVALUE", "PUSHBYTE", "PUSHSHORT", "PUSHTRUE", "PUSHFALSE", "PUSHNAN", "POP", "DUP", "SWAP", "PUSHSTRING", "PUSHINT", "PUSHUINT", "PUSHDOUBLE", "PUSHSCOPE", "PUSHNAMESPACE", "HASNEXT2", , , "LI8", "LI16", "LI32", "LF32", "LF64", "SI8", "SI16", "SI32", "SF32", "SF64", , "NEWFUNCTION", "CALL", "CONSTRUCT", "CALLMETHOD", "CALLSTATIC", "CALLSUPER", "CALLPROPERTY", "RETURNVOID", "RETURNVALUE", "CONSTRUCTSUPER", "CONSTRUCTPROP", "CALLSUPERID", "CALLPROPLEX", "CALLINTERFACE", "CALLSUPERVOID", "CALLPROPVOID", "SXI1", "SXI8", "SXI16", "APPLYTYPE", "PUSHFLOAT4", "NEWOBJECT", "NEWARRAY", "NEWACTIVATION", "NEWCLASS", "GETDESCENDANTS", "NEWCATCH", , , "FINDPROPSTRICT", "FINDPROPERTY", "FINDDEF", "GETLEX", "SETPROPERTY", "GETLOCAL", "SETLOCAL", "GETGLOBALSCOPE", "GETSCOPEOBJECT", "GETPROPERTY", "GETOUTERSCOPE", "INITPROPERTY", "UNUSED_69", "DELETEPROPERTY", "UNUSED_6B", "GETSLOT", "SETSLOT", "GETGLOBALSLOT", "SETGLOBALSLOT", "CONVERT_S", "ESC_XELEM", "ESC_XATTR", "CONVERT_I", "CONVERT_U", "CONVERT_D", "CONVERT_B", "CONVERT_O", "CHECKFILTER", "CONVERT_F", "UNPLUS", "CONVERT_F4", "BC_7C", "BC_7D", "BC_7E", "BC_7F", "COERCE", "COERCE_B", "COERCE_A", "COERCE_I", "COERCE_D", "COERCE_S", "ASTYPE", "ASTYPELATE", "COERCE_U", "COERCE_O", , , , , , , "NEGATE", "INCREMENT", "INCLOCAL", "DECREMENT", "DECLOCAL", "TYPEOF", "NOT", "BITNOT", "UNUSED_98", "UNUSED_99", "UNUSED_9A", "UNUSED_9B", "UNUSED_9C", "UNUSED_9D", "UNUSED_9E", "UNUSED_9F", "ADD", "SUBTRACT", "MULTIPLY", "DIVIDE", "MODULO", "LSHIFT", "RSHIFT", "URSHIFT", "BITAND", "BITOR", "BITXOR", "EQUALS", "STRICTEQUALS", "LESSTHAN", "LESSEQUALS", "GREATERTHAN", "GREATEREQUALS", "INSTANCEOF", "ISTYPE", "ISTYPELATE", "IN", "UNUSED_B5", "UNUSED_B6", "UNUSED_B7", "UNUSED_B8", "UNUSED_B9", "UNUSED_BA", "UNUSED_BB", "UNUSED_BC", "UNUSED_BD", "UNUSED_BE", "UNUSED_BF", "INCREMENT_I", "DECREMENT_I", "INCLOCAL_I", "DECLOCAL_I", "NEGATE_I", "ADD_I", "SUBTRACT_I", "MULTIPLY_I", "UNUSED_C8", "UNUSED_C9", "UNUSED_CA", "UNUSED_CB", "UNUSED_CC", "UNUSED_CD", "UNUSED_CE", "UNUSED_CF", "GETLOCAL0", "GETLOCAL1", "GETLOCAL2", "GETLOCAL3", "SETLOCAL0", "SETLOCAL1", "SETLOCAL2", "SETLOCAL3", "UNUSED_D8", "UNUSED_D9", "UNUSED_DA", "UNUSED_DB", "UNUSED_DC", "UNUSED_DD", "UNUSED_DE", "UNUSED_DF", "UNUSED_E0", "UNUSED_E1", "UNUSED_E2", "UNUSED_E3", "UNUSED_E4", "UNUSED_E5", "UNUSED_E6", "UNUSED_E7", "UNUSED_E8", "UNUSED_E9", "UNUSED_EA", "UNUSED_EB", "UNUSED_EC", "INVALID", "UNUSED_EE", "DEBUG", "DEBUGLINE", "DEBUGFILE", "BKPTLINE", "TIMESTAMP", "RESTARGC", "RESTARG", "UNUSED_F6", "UNUSED_F7", "UNUSED_F8", "UNUSED_F9", "UNUSED_FA", "UNUSED_FB", "UNUSED_FC", "UNUSED_FD", "UNUSED_FE", "END"];
        function getBytecodeName(bytecode) {
            return release ? "Bytecode: " + bytecode : bytecodeNames[bytecode];
        }
        AVMX.getBytecodeName = getBytecodeName;
        /**
         * A array that maps from a bytecode value to the set of {@link OPFlags} for the corresponding instruction.
         */
        AVMX.BytecodeFlags = new Uint32Array(256);
        AVMX.BytecodeFormat = new Array(256);
        function define(bytecode, format, flags) {
            if (flags === void 0) { flags = 0; }
            var instructionLength = format.length;
            AVMX.BytecodeFlags[bytecode] = flags;
            AVMX.BytecodeFormat[bytecode] = format;
            // release || assert (!isConditionalBranch(opcode) || isBranch(opcode), "a conditional branch must also be a branch");
        }
        /**
         * Only call this before the compiler is used.
         */
        function defineBytecodes() {
            define(1 /* BKPT */, "");
            define(2 /* NOP */, "");
            define(3 /* THROW */, "");
            define(4 /* GETSUPER */, "e");
            define(5 /* SETSUPER */, "e");
            define(6 /* DXNS */, "e");
            define(7 /* DXNSLATE */, "");
            define(8 /* KILL */, "e");
            define(9 /* LABEL */, "");
            define(10 /* LF32X4 */, "");
            define(11 /* SF32X4 */, "");
            define(12 /* IFNLT */, "d");
            define(13 /* IFNLE */, "d");
            define(14 /* IFNGT */, "d");
            define(15 /* IFNGE */, "d");
            define(16 /* JUMP */, "d");
            define(17 /* IFTRUE */, "d");
            define(18 /* IFFALSE */, "d");
            define(19 /* IFEQ */, "d");
            define(20 /* IFNE */, "d");
            define(21 /* IFLT */, "d");
            define(22 /* IFLE */, "d");
            define(23 /* IFGT */, "d");
            define(24 /* IFGE */, "d");
            define(25 /* IFSTRICTEQ */, "d");
            define(26 /* IFSTRICTNE */, "d");
            define(27 /* LOOKUPSWITCH */, "");
            define(28 /* PUSHWITH */, "");
            define(29 /* POPSCOPE */, "");
            define(30 /* NEXTNAME */, "");
            define(31 /* HASNEXT */, "");
            define(32 /* PUSHNULL */, "");
            define(33 /* PUSHUNDEFINED */, "");
            define(35 /* NEXTVALUE */, "");
            define(36 /* PUSHBYTE */, "b");
            define(37 /* PUSHSHORT */, "c");
            define(38 /* PUSHTRUE */, "");
            define(39 /* PUSHFALSE */, "");
            define(40 /* PUSHNAN */, "");
            define(41 /* POP */, "");
            define(42 /* DUP */, "");
            define(43 /* SWAP */, "");
            define(44 /* PUSHSTRING */, "e");
            define(45 /* PUSHINT */, "e");
            define(46 /* PUSHUINT */, "e");
            define(47 /* PUSHDOUBLE */, "e");
            define(48 /* PUSHSCOPE */, "");
            define(49 /* PUSHNAMESPACE */, "e");
            define(50 /* HASNEXT2 */, "ee");
            // define(Bytecode.UNDEFINED, "");
            // define(Bytecode.UNDEFINED, "");
            define(53 /* LI8 */, "");
            define(54 /* LI16 */, "");
            define(55 /* LI32 */, "");
            define(56 /* LF32 */, "");
            define(57 /* LF64 */, "");
            define(58 /* SI8 */, "");
            define(59 /* SI16 */, "");
            define(60 /* SI32 */, "");
            define(61 /* SF32 */, "");
            define(62 /* SF64 */, "");
            define(64 /* NEWFUNCTION */, "e");
            define(65 /* CALL */, "e");
            define(66 /* CONSTRUCT */, "e");
            define(67 /* CALLMETHOD */, "ee");
            define(68 /* CALLSTATIC */, "ee");
            define(69 /* CALLSUPER */, "ee");
            define(70 /* CALLPROPERTY */, "ee");
            define(71 /* RETURNVOID */, "");
            define(72 /* RETURNVALUE */, "");
            define(73 /* CONSTRUCTSUPER */, "e");
            define(74 /* CONSTRUCTPROP */, "ee");
            define(75 /* CALLSUPERID */, "");
            define(76 /* CALLPROPLEX */, "ee");
            define(77 /* CALLINTERFACE */, "");
            define(78 /* CALLSUPERVOID */, "ee");
            define(79 /* CALLPROPVOID */, "ee");
            define(80 /* SXI1 */, "");
            define(81 /* SXI8 */, "");
            define(82 /* SXI16 */, "");
            define(83 /* APPLYTYPE */, "e");
            define(84 /* PUSHFLOAT4 */, "");
            define(85 /* NEWOBJECT */, "e");
            define(86 /* NEWARRAY */, "e");
            define(87 /* NEWACTIVATION */, "");
            define(88 /* NEWCLASS */, "e");
            define(89 /* GETDESCENDANTS */, "e");
            define(90 /* NEWCATCH */, "e");
            // define(Bytecode.UNDEFINED, "");
            // define(Bytecode.UNDEFINED, "");
            define(93 /* FINDPROPSTRICT */, "e");
            define(94 /* FINDPROPERTY */, "e");
            define(95 /* FINDDEF */, "");
            define(96 /* GETLEX */, "e");
            define(97 /* SETPROPERTY */, "e");
            define(98 /* GETLOCAL */, "e");
            define(99 /* SETLOCAL */, "e");
            define(100 /* GETGLOBALSCOPE */, "");
            define(101 /* GETSCOPEOBJECT */, "e");
            define(102 /* GETPROPERTY */, "e");
            define(103 /* GETOUTERSCOPE */, "");
            define(104 /* INITPROPERTY */, "e");
            define(106 /* DELETEPROPERTY */, "e");
            define(108 /* GETSLOT */, "e");
            define(109 /* SETSLOT */, "e");
            define(110 /* GETGLOBALSLOT */, "e");
            define(111 /* SETGLOBALSLOT */, "e");
            define(112 /* CONVERT_S */, "");
            define(113 /* ESC_XELEM */, "");
            define(114 /* ESC_XATTR */, "");
            define(115 /* CONVERT_I */, "");
            define(116 /* CONVERT_U */, "");
            define(117 /* CONVERT_D */, "");
            define(118 /* CONVERT_B */, "");
            define(119 /* CONVERT_O */, "");
            define(120 /* CHECKFILTER */, "");
            define(121 /* CONVERT_F */, "");
            define(122 /* UNPLUS */, "");
            define(123 /* CONVERT_F4 */, "");
            define(128 /* COERCE */, "e");
            define(129 /* COERCE_B */, "");
            define(130 /* COERCE_A */, "");
            define(131 /* COERCE_I */, "");
            define(132 /* COERCE_D */, "");
            define(133 /* COERCE_S */, "");
            define(134 /* ASTYPE */, "e");
            define(135 /* ASTYPELATE */, "");
            define(136 /* COERCE_U */, "");
            define(137 /* COERCE_O */, "");
            define(144 /* NEGATE */, "");
            define(145 /* INCREMENT */, "");
            define(146 /* INCLOCAL */, "e");
            define(147 /* DECREMENT */, "");
            define(148 /* DECLOCAL */, "e");
            define(149 /* TYPEOF */, "");
            define(150 /* NOT */, "");
            define(151 /* BITNOT */, "");
            define(160 /* ADD */, "");
            define(161 /* SUBTRACT */, "");
            define(162 /* MULTIPLY */, "");
            define(163 /* DIVIDE */, "");
            define(164 /* MODULO */, "");
            define(165 /* LSHIFT */, "");
            define(166 /* RSHIFT */, "");
            define(167 /* URSHIFT */, "");
            define(168 /* BITAND */, "");
            define(169 /* BITOR */, "");
            define(170 /* BITXOR */, "");
            define(171 /* EQUALS */, "");
            define(172 /* STRICTEQUALS */, "");
            define(173 /* LESSTHAN */, "");
            define(174 /* LESSEQUALS */, "");
            define(175 /* GREATERTHAN */, "");
            define(176 /* GREATEREQUALS */, "");
            define(177 /* INSTANCEOF */, "");
            define(178 /* ISTYPE */, "e");
            define(179 /* ISTYPELATE */, "");
            define(180 /* IN */, "");
            define(192 /* INCREMENT_I */, "");
            define(193 /* DECREMENT_I */, "");
            define(194 /* INCLOCAL_I */, "e");
            define(195 /* DECLOCAL_I */, "e");
            define(196 /* NEGATE_I */, "");
            define(197 /* ADD_I */, "");
            define(198 /* SUBTRACT_I */, "");
            define(199 /* MULTIPLY_I */, "");
            define(208 /* GETLOCAL0 */, "");
            define(209 /* GETLOCAL1 */, "");
            define(210 /* GETLOCAL2 */, "");
            define(211 /* GETLOCAL3 */, "");
            define(212 /* SETLOCAL0 */, "");
            define(213 /* SETLOCAL1 */, "");
            define(214 /* SETLOCAL2 */, "");
            define(215 /* SETLOCAL3 */, "");
            define(237 /* INVALID */, "");
            define(239 /* DEBUG */, "aeae");
            define(240 /* DEBUGLINE */, "e");
            define(241 /* DEBUGFILE */, "e");
            define(242 /* BKPTLINE */, "e");
            define(243 /* TIMESTAMP */, "");
            // define(Bytecode.UNUSED_6B, "", Flags.NONE);
            // define(Bytecode.UNUSED_DE, "", Flags.NONE);
            // define(Bytecode.UNUSED_BB, "", Flags.NONE);
        }
        AVMX.defineBytecodes = defineBytecodes;
        defineBytecodes();
        var Bytes = (function () {
            function Bytes() {
            }
            Bytes.u8 = function (code, i) {
                return code[i];
            };
            Bytes.s32 = function (code, i) {
                var result = code[i];
                if (result & 0x80) {
                    result = result & 0x7f | code[i + 1] << 7;
                    if (result & 0x4000) {
                        result = result & 0x3fff | code[i + 2] << 14;
                        if (result & 0x200000) {
                            result = result & 0x1fffff | code[i + 3] << 21;
                            if (result & 0x10000000) {
                                result = result & 0x0fffffff | code[i + 4] << 28;
                                result = result & 0xffffffff;
                            }
                        }
                    }
                }
                return result;
            };
            Bytes.u32 = function (code, i) {
                return Bytes.s32(code, i) >>> 0;
            };
            Bytes.u30 = function (code, i) {
                return Bytes.u32(code, i);
            };
            Bytes.s32Length = function (code, i) {
                var result = code[i];
                if (result & 0x80) {
                    result = result & 0x7f | code[i + 1] << 7;
                    if (result & 0x4000) {
                        result = result & 0x3fff | code[i + 2] << 14;
                        if (result & 0x200000) {
                            result = result & 0x1fffff | code[i + 3] << 21;
                            if (result & 0x10000000) {
                                return 5;
                            }
                            return 4;
                        }
                        return 3;
                    }
                    return 2;
                }
                return 1;
            };
            return Bytes;
        })();
        AVMX.Bytes = Bytes;
        function lengthAt(code, i) {
            var l = 1;
            var bytecode = code[i];
            if (bytecode === 27 /* LOOKUPSWITCH */) {
                l += 3; // Default offset.
                var n = Bytes.u30(code, i + l) + 1; // Offsets
                l += Bytes.s32Length(code, i + l);
                l += n * 3;
                return l;
            }
            var format = AVMX.BytecodeFormat[bytecode];
            if (format === "") {
                return l;
            }
            assert(format, "OP: " + getBytecodeName(bytecode));
            for (var j = 0; j < format.length; j++) {
                var f = format[j].charCodeAt(0) - 97;
                switch (f) {
                    case 0 /* u08 */:
                    case 1 /* s08 */:
                        l += 1;
                        continue;
                    case 3 /* s24 */:
                        l += 3;
                        continue;
                    case 2 /* s16 */:
                    case 4 /* u30 */:
                    case 5 /* u32 */:
                        l += Bytes.s32Length(code, i + l);
                        continue;
                }
            }
            return l;
        }
        var BytecodeStream = (function () {
            function BytecodeStream(code) {
                this._code = code;
                this.setBCI(0);
            }
            BytecodeStream.prototype.next = function () {
                this.setBCI(this._nextBCI);
            };
            BytecodeStream.prototype.endBCI = function () {
                return this._code.length;
            };
            Object.defineProperty(BytecodeStream.prototype, "nextBCI", {
                get: function () {
                    return this._nextBCI;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BytecodeStream.prototype, "currentBCI", {
                get: function () {
                    return this._currentBCI;
                },
                enumerable: true,
                configurable: true
            });
            BytecodeStream.prototype.currentBytecode = function () {
                return this._bytecode;
            };
            BytecodeStream.prototype.nextBC = function () {
                return Bytes.u8(this._code, this._nextBCI);
            };
            BytecodeStream.prototype.setBCI = function (bci) {
                this._currentBCI = bci;
                if (this._currentBCI < this._code.length) {
                    this._bytecode = Bytes.u8(this._code, bci);
                    var l = lengthAt(this._code, bci);
                    this._nextBCI = bci + l;
                }
                else {
                    this._bytecode = 255 /* END */;
                    this._nextBCI = this._currentBCI;
                }
            };
            return BytecodeStream;
        })();
        AVMX.BytecodeStream = BytecodeStream;
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var assert = Shumway.Debug.assert;
        var AbcStream = Shumway.AVM2.ABC.AbcStream;
        var writer = new Shumway.IndentingWriter();
        var CONSTANTNames = ["Undefined", "Utf8|ClassSealed", "Float|ClassFinal", "Int", "UInt|ClassInterface", "PrivateNs", "Double", "QName", "Namespace|ClassProtectedNs", "Multiname", "False", "True", "Null", "QNameA", "MultinameA", "RTQName", "RTQNameA", "RTQNameL", "RTQNameLA", "NameL", "NameLA", "NamespaceSet", "PackageNamespace", "PackageInternalNs", "ProtectedNamespace", "ExplicitNamespace", "StaticProtectedNs", "MultinameL", "MultinameLA", "TypeName"];
        function getCONSTANTName(constant) {
            return release ? String(constant) : CONSTANTNames[constant];
        }
        AVMX.getCONSTANTName = getCONSTANTName;
        var TRAITNames = ["Slot", "Method", "Getter", "Setter", "Class", "Function", "Const", "GetterSetter"];
        function getTRAITName(trait) {
            return release ? String(trait) : TRAITNames[trait];
        }
        AVMX.getTRAITName = getTRAITName;
        var namespaceTypeNames = ["Public", "Protected", "PackageInternal", "Private", "Explicit", "StaticProtected"];
        function getNamespaceTypeName(namespaceType) {
            return release ? String(namespaceType) : namespaceTypeNames[namespaceType];
        }
        AVMX.getNamespaceTypeName = getNamespaceTypeName;
        var MetadataInfo = (function () {
            function MetadataInfo(abc, name, keys, values) {
                this.abc = abc;
                this.name = name;
                this.keys = keys;
                this.values = values;
                // ...
            }
            MetadataInfo.prototype.getName = function () {
                if (typeof this.name === "number") {
                    this.name = this.abc.getString(this.name);
                }
                return this.name;
            };
            MetadataInfo.prototype.getKeyAt = function (i) {
                return this.abc.getString(this.keys[i]);
            };
            MetadataInfo.prototype.getValueAt = function (i) {
                return this.abc.getString(this.values[i]);
            };
            MetadataInfo.prototype.getValue = function (key) {
                for (var i = 0; i < this.keys.length; i++) {
                    if (this.abc.getString(this.keys[i]) === key) {
                        return this.abc.getString(this.values[i]);
                    }
                }
                return null;
            };
            return MetadataInfo;
        })();
        AVMX.MetadataInfo = MetadataInfo;
        /**
         * The Traits class represents the collection of compile-time traits associated with a type.
         * It's not used for runtime name resolution on instances; instead, the combined traits for
         * a type and all its super types is resolved and translated to an instance of RuntimeTraits.
         */
        var Traits = (function () {
            function Traits(traits) {
                this.traits = traits;
                this._resolved = false;
                // ...
            }
            Traits.prototype.resolve = function () {
                if (this._resolved) {
                    return;
                }
                for (var i = 0; i < this.traits.length; i++) {
                    this.traits[i].resolve();
                }
                this._resolved = true;
            };
            Traits.prototype.attachHolder = function (holder) {
                for (var i = 0; i < this.traits.length; i++) {
                    release || assert(!this.traits[i].holder);
                    this.traits[i].holder = holder;
                }
            };
            Traits.prototype.trace = function (writer) {
                if (writer === void 0) { writer = new Shumway.IndentingWriter(); }
                this.resolve();
                this.traits.forEach(function (x) { return writer.writeLn(x.toString()); });
            };
            /**
             * Searches for a trait with the specified name.
             */
            Traits.prototype.indexOf = function (mn) {
                release || assert(this._resolved);
                var mnName = mn.name;
                var nss = mn.namespaces;
                var traits = this.traits;
                for (var i = 0; i < traits.length; i++) {
                    var trait = traits[i];
                    var traitMn = trait.name;
                    if (traitMn.name === mnName) {
                        var ns = traitMn.namespaces[0];
                        for (var j = 0; j < nss.length; j++) {
                            if (ns === nss[j]) {
                                return i;
                            }
                        }
                    }
                }
                return -1;
            };
            Traits.prototype.getTrait = function (mn) {
                var i = this.indexOf(mn);
                return i >= 0 ? this.traits[i] : null;
            };
            /**
             * Turns a list of compile-time traits into runtime traits with resolved bindings.
             *
             * Runtime traits are stored in 2-dimensional maps. The outer dimension is keyed on the
             * trait's local name. The inner dimension is a map of mangled namespace names to traits.
             *
             * Lookups are thus O(n) in the number of namespaces present in the query, instead of O(n+m)
             * in the number of traits (n) on the type times the number of namespaces present in the
             * query (m).
             *
             * Negative result note: an implementation with ECMAScript Maps with Namespace objects as
             * keys was tried and found to be much slower than the Object-based one implemented here.
             * Mostly, the difference was in how well accesses are optimized in JS engines, with Maps
             * being new-ish and less well-optimized.
             *
             * Additionally, all protected traits get added to a map with their unqualified name as key.
             * That map is created with the super type's map on its prototype chain. If a type overrides
             * a protected trait, it gets set as that type's value for the unqualified name. Additionally,
             * its name is canonicalized to use the namespace used in the initially introducing type.
             * During name lookup, we first check for a hit in that map and (after verifying that the mn
             * has a correct protected name in its namespaces set) return the most recent trait. That way,
             * all lookups always get the most recent trait, even if they originate from a super class.
             */
            Traits.prototype.resolveRuntimeTraits = function (superTraits, protectedNs, scope) {
                // Resolve traits so that indexOf works out.
                this.resolve();
                var protectedNsMappings = Object.create(superTraits ? superTraits.protectedNsMappings : null);
                var result = new RuntimeTraits(superTraits, protectedNs, protectedNsMappings);
                // Add all of the child traits, replacing or extending parent traits where necessary.
                for (var i = 0; i < this.traits.length; i++) {
                    var trait = this.traits[i];
                    var name = trait.name;
                    var runtimeTrait = new RuntimeTraitInfo(name, trait.kind, trait.abc);
                    if (name.namespaces[0].type === 1 /* Protected */) {
                        // Names for protected traits get canonicalized to the name of the type that initially
                        // introduces the trait.
                        if (result.protectedNsMappings[name.name]) {
                            runtimeTrait.name = result.protectedNsMappings[name.name].name;
                        }
                        result.protectedNsMappings[name.name] = runtimeTrait;
                    }
                    var currentTrait = result.addTrait(runtimeTrait);
                    switch (trait.kind) {
                        case 1 /* Method */:
                            var method = createMethodForTrait(trait, scope);
                            runtimeTrait.value = method;
                            break;
                        case 2 /* Getter */:
                            runtimeTrait.get = createMethodForTrait(trait, scope);
                            if (currentTrait && currentTrait.set) {
                                runtimeTrait.set = currentTrait.set;
                                runtimeTrait.kind = 7 /* GetterSetter */;
                            }
                            break;
                        case 3 /* Setter */:
                            runtimeTrait.set = createMethodForTrait(trait, scope);
                            if (currentTrait && currentTrait.get) {
                                runtimeTrait.get = currentTrait.get;
                                runtimeTrait.kind = 7 /* GetterSetter */;
                            }
                            break;
                        case 0 /* Slot */:
                        case 6 /* Const */:
                        case 4 /* Class */:
                            // Only non-const slots need to be writable. Everything else is fixed.
                            runtimeTrait.writable = true;
                            var slotTrait = trait;
                            runtimeTrait.slot = slotTrait.slot;
                            runtimeTrait.value = slotTrait.getDefaultValue();
                            runtimeTrait.typeName = slotTrait.typeName;
                            // TODO: Throw error for const without default.
                            result.addSlotTrait(runtimeTrait);
                    }
                }
                return result;
            };
            return Traits;
        })();
        AVMX.Traits = Traits;
        function createMethodForTrait(methodTraitInfo, scope) {
            if (methodTraitInfo.method) {
                return methodTraitInfo.method;
            }
            var methodInfo = methodTraitInfo.getMethodInfo();
            var method;
            if (methodInfo.flags & 32 /* Native */) {
                var metadata = methodInfo.getNativeMetadata();
                if (metadata || methodTraitInfo.holder instanceof ScriptInfo) {
                    if (metadata) {
                        method = AVMX.AS.getNative(metadata.getValueAt(0));
                    }
                    else {
                        var mn = methodTraitInfo.getName();
                        method = AVMX.AS.getNative(mn.uri + '.' + mn.name);
                    }
                    method = createGlobalNative(method, scope.object.sec);
                }
                else {
                    method = AVMX.AS.getMethodOrAccessorNative(methodTraitInfo);
                }
                if (!release) {
                    method.toString = function () {
                        return "Native " + methodTraitInfo.toString();
                    };
                    method.isInterpreted = false;
                }
            }
            else {
                method = function () {
                    var self = this === jsGlobal ? scope.global.object : this;
                    return AVMX.interpret(self, methodInfo, scope, arguments, null);
                };
                if (!release) {
                    method.toString = function () {
                        return "Interpreted " + methodTraitInfo.toString();
                    };
                    method.isInterpreted = true;
                }
            }
            if (!release && Shumway.flashlog && methodInfo.trait) {
                method = (function (wrapped, methodInfo) {
                    var traceMsg = methodInfo.toFlashlogString();
                    var result = function () {
                        Shumway.flashlog.writeAS3Trace(traceMsg);
                        return wrapped.apply(this, arguments);
                    };
                    result.toString = wrapped.toString;
                    result.isInterpreted = wrapped.isInterpreted;
                    return result;
                })(method, methodInfo);
            }
            methodTraitInfo.method = method;
            method.methodInfo = methodInfo;
            if (!release) {
                try {
                    Object.defineProperty(method, 'name', { value: methodInfo.getName() });
                }
                catch (e) {
                }
            }
            method.methodInfo = methodInfo;
            return method;
        }
        function createGlobalNative(native, sec) {
            return function () {
                switch (arguments.length) {
                    case 0: return native(sec);
                    case 1: return native(sec, arguments[0]);
                    case 2: return native(sec, arguments[0], arguments[1]);
                    case 3: return native(sec, arguments[0], arguments[1], arguments[2]);
                    default:
                        var args = [sec];
                        for (var i = 0; i < arguments.length; i++) {
                            args.push(arguments[i]);
                        }
                        return native.apply(this, args);
                }
            };
        }
        var TraitInfo = (function () {
            function TraitInfo(abc, kind, name) {
                this.abc = abc;
                this.kind = kind;
                this.name = name;
                this.metadata = null;
                this.holder = null;
            }
            TraitInfo.prototype.getMetadata = function () {
                if (!this.metadata) {
                    return null;
                }
                if (this.metadata instanceof Uint32Array) {
                    var metadata = new Array(this.metadata.length);
                    for (var i = 0; i < this.metadata.length; i++) {
                        metadata[i] = this.abc.getMetadataInfo(this.metadata[i]);
                    }
                    this.metadata = metadata;
                }
                return this.metadata;
            };
            TraitInfo.prototype.getName = function () {
                return this.name;
            };
            TraitInfo.prototype.resolve = function () {
                if (typeof this.name === "number") {
                    this.name = this.abc.getMultiname(this.name);
                }
            };
            TraitInfo.prototype.toString = function () {
                return getTRAITName(this.kind) + " " + this.name;
            };
            TraitInfo.prototype.toFlashlogString = function () {
                this.resolve();
                return this.getName().toFlashlogString();
            };
            TraitInfo.prototype.isConst = function () {
                return this.kind === 6 /* Const */;
            };
            TraitInfo.prototype.isSlot = function () {
                return this.kind === 0 /* Slot */;
            };
            TraitInfo.prototype.isMethod = function () {
                return this.kind === 1 /* Method */;
            };
            TraitInfo.prototype.isGetter = function () {
                return this.kind === 2 /* Getter */;
            };
            TraitInfo.prototype.isSetter = function () {
                return this.kind === 3 /* Setter */;
            };
            TraitInfo.prototype.isAccessor = function () {
                return this.kind === 2 /* Getter */ ||
                    this.kind === 3 /* Setter */;
            };
            TraitInfo.prototype.isMethodOrAccessor = function () {
                return this.isAccessor() || this.kind === 1 /* Method */;
            };
            return TraitInfo;
        })();
        AVMX.TraitInfo = TraitInfo;
        var RuntimeTraits = (function () {
            function RuntimeTraits(superTraits, protectedNs, protectedNsMappings) {
                this.superTraits = superTraits;
                this.protectedNs = protectedNs;
                this.protectedNsMappings = protectedNsMappings;
                this.slots = [];
                this._nextSlotID = 1;
                var traits = this._traits = Object.create(null);
                if (!superTraits) {
                    return;
                }
                var superMappings = superTraits._traits;
                for (var key in superMappings) {
                    traits[key] = Object.create(superMappings[key]);
                }
            }
            /**
             * Adds the given trait and returns any trait that might already exist under that name.
             *
             * See the comment for `Trait#resolveRuntimeTraits` for an explanation of the lookup scheme.
             */
            RuntimeTraits.prototype.addTrait = function (trait) {
                var mn = trait.name;
                var mappings = this._traits[mn.name];
                if (!mappings) {
                    mappings = this._traits[mn.name] = Object.create(null);
                }
                var nsName = mn.namespaces[0].mangledName;
                var current = mappings[nsName];
                mappings[nsName] = trait;
                return current;
            };
            RuntimeTraits.prototype.addSlotTrait = function (trait) {
                var slot = trait.slot;
                if (!slot) {
                    slot = trait.slot = this._nextSlotID++;
                }
                else {
                    this._nextSlotID = slot + 1;
                }
                release || assert(!this.slots[slot]);
                this.slots[slot] = trait;
            };
            /**
             * Returns the trait matching the given multiname parts, if any.
             *
             * See the comment for `Trait#resolveRuntimeTraits` for an explanation of the lookup scheme.
             */
            RuntimeTraits.prototype.getTrait = function (namespaces, name) {
                release || assert(typeof name === 'string');
                var mappings = this._traits[name];
                if (!mappings) {
                    return null;
                }
                var trait;
                for (var i = 0; i < namespaces.length; i++) {
                    var ns = namespaces[i];
                    trait = mappings[ns.mangledName];
                    if (trait) {
                        return trait;
                    }
                    if (ns.type === 1 /* Protected */) {
                        var protectedScope = this;
                        while (protectedScope) {
                            if (protectedScope.protectedNs === ns) {
                                trait = protectedScope.protectedNsMappings[name];
                                if (trait) {
                                    return trait;
                                }
                            }
                            protectedScope = protectedScope.superTraits;
                        }
                    }
                }
                return null;
            };
            RuntimeTraits.prototype.getTraitsList = function () {
                var list = [];
                var names = this._traits;
                for (var name in names) {
                    var mappings = names[name];
                    for (var nsName in mappings) {
                        list.push(mappings[nsName]);
                    }
                }
                return list;
            };
            RuntimeTraits.prototype.getSlotPublicTraitNames = function () {
                var slots = this.slots;
                var names = [];
                for (var i = 1; i < slots.length; i++) {
                    var slot = slots[i];
                    if (!slot.name.namespace.isPublic()) {
                        continue;
                    }
                    names.push(slot.name.name);
                }
                return names;
            };
            RuntimeTraits.prototype.getSlot = function (i) {
                return this.slots[i];
            };
            return RuntimeTraits;
        })();
        AVMX.RuntimeTraits = RuntimeTraits;
        var RuntimeTraitInfo = (function () {
            function RuntimeTraitInfo(name, kind, abc) {
                this.name = name;
                this.kind = kind;
                this.abc = abc;
                this.configurable = true; // Always true.
                this._type = undefined;
                this.typeName = null;
            }
            RuntimeTraitInfo.prototype.getType = function () {
                if (this._type !== undefined) {
                    return this._type;
                }
                if (this.typeName === null) {
                    return this._type = null;
                }
                var type = this.abc.applicationDomain.getClass(this.typeName);
                return this._type = (type && type.axCoerce) ? type : null;
            };
            return RuntimeTraitInfo;
        })();
        AVMX.RuntimeTraitInfo = RuntimeTraitInfo;
        var typeDefaultValues = {
            __proto__: null,
            $BgNumber: NaN,
            $Bgint: 0,
            $Bguint: 0,
            $BgBoolean: false
        };
        var SlotTraitInfo = (function (_super) {
            __extends(SlotTraitInfo, _super);
            function SlotTraitInfo(abc, kind, name, slot, typeName, defaultValueKind, defaultValueIndex) {
                _super.call(this, abc, kind, name);
                this.slot = slot;
                this.typeName = typeName;
                this.defaultValueKind = defaultValueKind;
                this.defaultValueIndex = defaultValueIndex;
            }
            SlotTraitInfo.prototype.resolve = function () {
                _super.prototype.resolve.call(this);
                if (typeof this.typeName === "number") {
                    this.typeName = this.abc.getMultiname(this.typeName);
                }
            };
            SlotTraitInfo.prototype.getTypeName = function () {
                this.resolve();
                return this.typeName;
            };
            SlotTraitInfo.prototype.getDefaultValue = function () {
                if (this.defaultValueKind === -1) {
                    if (this.typeName === null) {
                        return undefined;
                    }
                    var value = typeDefaultValues[this.typeName.getMangledName()];
                    return value === undefined ? null : value;
                }
                return this.abc.getConstant(this.defaultValueKind, this.defaultValueIndex);
            };
            return SlotTraitInfo;
        })(TraitInfo);
        AVMX.SlotTraitInfo = SlotTraitInfo;
        var MethodTraitInfo = (function (_super) {
            __extends(MethodTraitInfo, _super);
            function MethodTraitInfo(abc, kind, name, methodInfo) {
                _super.call(this, abc, kind, name);
                this.methodInfo = methodInfo;
                this.method = null;
            }
            MethodTraitInfo.prototype.getMethodInfo = function () {
                return this.methodInfo;
            };
            MethodTraitInfo.prototype.resolve = function () {
                _super.prototype.resolve.call(this);
                if (typeof this.methodInfo === "number") {
                    this.methodInfo = this.abc.getMethodInfo(this.methodInfo);
                }
            };
            return MethodTraitInfo;
        })(TraitInfo);
        AVMX.MethodTraitInfo = MethodTraitInfo;
        var ClassTraitInfo = (function (_super) {
            __extends(ClassTraitInfo, _super);
            function ClassTraitInfo(abc, kind, name, slot, classInfo) {
                _super.call(this, abc, kind, name, slot, 0, 0, -1);
                this.classInfo = classInfo;
            }
            return ClassTraitInfo;
        })(SlotTraitInfo);
        AVMX.ClassTraitInfo = ClassTraitInfo;
        var ParameterInfo = (function () {
            function ParameterInfo(abc, type, 
                /**
                 * Don't rely on the name being correct.
                 */
                name, optionalValueKind, optionalValueIndex) {
                this.abc = abc;
                this.type = type;
                this.name = name;
                this.optionalValueKind = optionalValueKind;
                this.optionalValueIndex = optionalValueIndex;
                // ...
            }
            ParameterInfo.prototype.getName = function () {
                if (typeof this.name === "number") {
                    this.name = this.abc.getString(this.name);
                }
                return this.name;
            };
            ParameterInfo.prototype.getType = function () {
                if (typeof this.type === "number") {
                    this.type = this.abc.getMultiname(this.type);
                }
                return this.type;
            };
            ParameterInfo.prototype.hasOptionalValue = function () {
                return this.optionalValueKind >= 0;
            };
            ParameterInfo.prototype.getOptionalValue = function () {
                return this.abc.getConstant(this.optionalValueKind, this.optionalValueIndex);
            };
            ParameterInfo.prototype.toString = function () {
                var str = "";
                if (this.name) {
                    str += this.getName();
                }
                else {
                    str += "?";
                }
                if (this.type) {
                    str += ": " + this.getType().name;
                }
                if (this.optionalValueKind >= 0) {
                    str += " = " + this.abc.getConstant(this.optionalValueKind, this.optionalValueIndex);
                }
                return str;
            };
            return ParameterInfo;
        })();
        AVMX.ParameterInfo = ParameterInfo;
        var Info = (function () {
            function Info() {
            }
            return Info;
        })();
        AVMX.Info = Info;
        var InstanceInfo = (function (_super) {
            __extends(InstanceInfo, _super);
            function InstanceInfo(abc, name, superName, flags, protectedNs, interfaceNameIndices, initializer, traits) {
                _super.call(this);
                this.abc = abc;
                this.name = name;
                this.superName = superName;
                this.flags = flags;
                this.protectedNs = protectedNs;
                this.interfaceNameIndices = interfaceNameIndices;
                this.initializer = initializer;
                this.traits = traits;
                this.classInfo = null;
                this.runtimeTraits = null;
                this._interfaces = null;
            }
            InstanceInfo.prototype.getInitializer = function () {
                if (typeof this.initializer === "number") {
                    this.initializer = this.abc.getMethodInfo(this.initializer);
                }
                return this.initializer;
            };
            InstanceInfo.prototype.getName = function () {
                if (typeof this.name === "number") {
                    this.name = this.abc.getMultiname(this.name);
                }
                return this.name;
            };
            InstanceInfo.prototype.getClassName = function () {
                var name = this.getName();
                if (name.namespaces[0].uri) {
                    return name.namespaces[0].uri + "." + name.name;
                }
                return name.name;
            };
            InstanceInfo.prototype.getSuperName = function () {
                if (typeof this.superName === "number") {
                    this.superName = this.abc.getMultiname(this.superName);
                }
                return this.superName;
            };
            InstanceInfo.prototype.getInterfaces = function (ownerClass) {
                if (this._interfaces) {
                    return this._interfaces;
                }
                var superClassInterfaces;
                var superClass = ownerClass.superClass;
                if (superClass) {
                    superClassInterfaces = superClass.classInfo.instanceInfo.getInterfaces(superClass);
                }
                var SetCtor = Set;
                var interfaces = this._interfaces = new SetCtor(superClassInterfaces);
                for (var i = 0; i < this.interfaceNameIndices.length; i++) {
                    var mn = this.abc.getMultiname(this.interfaceNameIndices[i]);
                    var type = this.abc.applicationDomain.getClass(mn);
                    interfaces.add(type);
                    var implementedInterfaces = type.classInfo.instanceInfo.getInterfaces(type);
                    implementedInterfaces.forEach(function (iface) { return interfaces.add(iface); });
                }
                return interfaces;
            };
            InstanceInfo.prototype.toString = function () {
                return "InstanceInfo " + this.getName().name;
            };
            InstanceInfo.prototype.toFlashlogString = function () {
                return this.getName().toFlashlogString();
            };
            InstanceInfo.prototype.trace = function (writer) {
                writer.enter("InstanceInfo: " + this.getName());
                this.superName && writer.writeLn("Super: " + this.getSuperName());
                this.traits.trace(writer);
                writer.outdent();
            };
            InstanceInfo.prototype.isInterface = function () {
                return !!(this.flags & 4 /* ClassInterface */);
            };
            InstanceInfo.prototype.isSealed = function () {
                return !!(this.flags & 1 /* ClassSealed */);
            };
            InstanceInfo.prototype.isFinal = function () {
                return !!(this.flags & 2 /* ClassFinal */);
            };
            return InstanceInfo;
        })(Info);
        AVMX.InstanceInfo = InstanceInfo;
        var ScriptInfo = (function (_super) {
            __extends(ScriptInfo, _super);
            function ScriptInfo(abc, initializer, traits) {
                _super.call(this);
                this.abc = abc;
                this.initializer = initializer;
                this.traits = traits;
                this.global = null;
                this.state = 0 /* None */;
            }
            ScriptInfo.prototype.getInitializer = function () {
                return this.abc.getMethodInfo(this.initializer);
            };
            ScriptInfo.prototype.trace = function (writer) {
                writer.enter("ScriptInfo");
                this.traits.trace(writer);
                writer.outdent();
            };
            return ScriptInfo;
        })(Info);
        AVMX.ScriptInfo = ScriptInfo;
        var ClassInfo = (function (_super) {
            __extends(ClassInfo, _super);
            function ClassInfo(abc, instanceInfo, initializer, traits) {
                _super.call(this);
                this.abc = abc;
                this.instanceInfo = instanceInfo;
                this.initializer = initializer;
                this.traits = traits;
                this.trait = null;
                this.runtimeTraits = null;
            }
            ClassInfo.prototype.getNativeMetadata = function () {
                if (!this.trait) {
                    return null;
                }
                var metadata = this.trait.getMetadata();
                if (!metadata) {
                    return null;
                }
                for (var i = 0; i < metadata.length; i++) {
                    if (metadata[i].getName() === "native") {
                        return metadata[i];
                    }
                }
                return null;
            };
            ClassInfo.prototype.getInitializer = function () {
                if (typeof this.initializer === "number") {
                    return this.initializer = this.abc.getMethodInfo(this.initializer);
                }
                return this.initializer;
            };
            ClassInfo.prototype.toString = function () {
                return "ClassInfo " + this.instanceInfo.getName();
            };
            ClassInfo.prototype.trace = function (writer) {
                writer.enter("ClassInfo");
                this.traits.trace(writer);
                writer.outdent();
            };
            return ClassInfo;
        })(Info);
        AVMX.ClassInfo = ClassInfo;
        var ExceptionInfo = (function () {
            function ExceptionInfo(abc, start, end, target, type, varName) {
                this.abc = abc;
                this.start = start;
                this.end = end;
                this.target = target;
                this.type = type;
                this.varName = varName;
                this.catchPrototype = null;
                this._traits = null;
                // ...
            }
            ExceptionInfo.prototype.getType = function () {
                if (typeof this.type === "number") {
                    this.type = this.abc.getMultiname(this.type);
                }
                return this.type;
            };
            ExceptionInfo.prototype.getTraits = function () {
                if (!this._traits) {
                    var traits = [];
                    if (this.varName) {
                        traits.push(new SlotTraitInfo(this.abc, 0 /* Slot */, this.varName, 1, this.type, 0, 0));
                    }
                    this._traits = new Traits(traits);
                    this._traits.resolve();
                }
                return this._traits;
            };
            return ExceptionInfo;
        })();
        AVMX.ExceptionInfo = ExceptionInfo;
        var MethodBodyInfo = (function (_super) {
            __extends(MethodBodyInfo, _super);
            function MethodBodyInfo(maxStack, localCount, initScopeDepth, maxScopeDepth, code, catchBlocks, traits) {
                _super.call(this);
                this.maxStack = maxStack;
                this.localCount = localCount;
                this.initScopeDepth = initScopeDepth;
                this.maxScopeDepth = maxScopeDepth;
                this.code = code;
                this.catchBlocks = catchBlocks;
                this.traits = traits;
                this.activationPrototype = null;
            }
            MethodBodyInfo.prototype.trace = function (writer) {
                writer.writeLn("Code: " + this.code.length);
                var stream = new AVMX.BytecodeStream(this.code);
                while (stream.currentBytecode() !== 255 /* END */) {
                    writer.writeLn(stream.currentBCI + ": " + AVMX.getBytecodeName(stream.currentBytecode()));
                    stream.next();
                }
            };
            return MethodBodyInfo;
        })(Info);
        AVMX.MethodBodyInfo = MethodBodyInfo;
        var MethodInfo = (function () {
            function MethodInfo(abc, _index, name, returnTypeNameIndex, parameters, optionalCount, flags) {
                this.abc = abc;
                this._index = _index;
                this.name = name;
                this.returnTypeNameIndex = returnTypeNameIndex;
                this.parameters = parameters;
                this.optionalCount = optionalCount;
                this.flags = flags;
                this.trait = null;
                this._body = null;
                this.minArgs = parameters.length - optionalCount;
            }
            MethodInfo.prototype.getNativeMetadata = function () {
                if (!this.trait) {
                    return null;
                }
                var metadata = this.trait.getMetadata();
                if (!metadata) {
                    return null;
                }
                for (var i = 0; i < metadata.length; i++) {
                    if (metadata[i].getName() === "native") {
                        return metadata[i];
                    }
                }
                return null;
            };
            MethodInfo.prototype.getBody = function () {
                return this._body || (this._body = this.abc.getMethodBodyInfo(this._index));
            };
            MethodInfo.prototype.getType = function () {
                if (this._returnType !== undefined) {
                    return this._returnType;
                }
                if (this.returnTypeNameIndex === 0) {
                    this._returnType = null;
                }
                else {
                    var mn = this.abc.getMultiname(this.returnTypeNameIndex);
                    this._returnType = this.abc.applicationDomain.getClass(mn);
                }
                return this._returnType;
            };
            MethodInfo.prototype.getName = function () {
                if (this.name) {
                    return this.abc.getString(this.name);
                }
                if (this.trait) {
                    return this.trait.getName().name;
                }
                return 'anonymous';
            };
            MethodInfo.prototype.toString = function () {
                var str = "anonymous";
                if (this.name) {
                    str = this.abc.getString(this.name);
                }
                str += " (" + this.parameters.join(", ") + ")";
                if (this.returnTypeNameIndex) {
                    str += ": " + this.abc.getMultiname(this.returnTypeNameIndex).name;
                }
                return str;
            };
            MethodInfo.prototype.toFlashlogString = function () {
                var trait = this.trait;
                var prefix = trait.kind === 2 /* Getter */ ? 'get ' :
                    trait.kind === 3 /* Setter */ ? 'set ' : '';
                var name = trait.toFlashlogString();
                var holder = trait.holder;
                var holderName;
                if (holder && holder instanceof InstanceInfo) {
                    holderName = holder.toFlashlogString();
                    prefix = holderName + '/' + prefix;
                }
                if (holder && holder instanceof ClassInfo && holder.trait) {
                    holderName = holder.trait.toFlashlogString();
                    prefix = holderName + '$/' + prefix;
                }
                var prefixPos;
                if (holderName && (prefixPos = name.indexOf('::')) > 0 &&
                    holderName.indexOf(name.substring(0, prefixPos + 2)) === 0) {
                    name = name.substring(prefixPos + 2);
                }
                return 'MTHD ' + prefix + name + ' ()';
            };
            MethodInfo.prototype.isNative = function () {
                return !!(this.flags & 32 /* Native */);
            };
            MethodInfo.prototype.needsRest = function () {
                return !!(this.flags & 4 /* NeedRest */);
            };
            MethodInfo.prototype.needsArguments = function () {
                return !!(this.flags & 1 /* NeedArguments */);
            };
            return MethodInfo;
        })();
        AVMX.MethodInfo = MethodInfo;
        var Multiname = (function () {
            function Multiname(abc, index, kind, namespaces, name, parameterType) {
                if (parameterType === void 0) { parameterType = null; }
                this.abc = abc;
                this.index = index;
                this.kind = kind;
                this.namespaces = namespaces;
                this.name = name;
                this.parameterType = parameterType;
                this.id = Multiname._nextID++;
                this._mangledName = null;
                // ...
            }
            Multiname.FromFQNString = function (fqn, nsType) {
                var lastDot = fqn.lastIndexOf('.');
                var uri = lastDot === -1 ? '' : fqn.substr(0, lastDot);
                var name = lastDot === -1 ? fqn : fqn.substr(lastDot + 1);
                var ns = internNamespace(nsType, uri);
                return new Multiname(null, 0, 15 /* RTQName */, [ns], name);
            };
            Multiname.prototype._nameToString = function () {
                if (this.isAnyName()) {
                    return "*";
                }
                return this.isRuntimeName() ? "[" + this.name + "]" : this.name;
            };
            Multiname.prototype.isRuntime = function () {
                switch (this.kind) {
                    case 7 /* QName */:
                    case 13 /* QNameA */:
                    case 9 /* Multiname */:
                    case 14 /* MultinameA */:
                        return false;
                }
                return true;
            };
            Multiname.prototype.isRuntimeName = function () {
                switch (this.kind) {
                    case 17 /* RTQNameL */:
                    case 18 /* RTQNameLA */:
                    case 27 /* MultinameL */:
                    case 28 /* MultinameLA */:
                        return true;
                }
                return false;
            };
            Multiname.prototype.isRuntimeNamespace = function () {
                switch (this.kind) {
                    case 15 /* RTQName */:
                    case 16 /* RTQNameA */:
                    case 17 /* RTQNameL */:
                    case 18 /* RTQNameLA */:
                        return true;
                }
                return false;
            };
            Multiname.prototype.isAnyName = function () {
                return this.name === null;
            };
            Multiname.prototype.isAnyNamespace = function () {
                if (this.isRuntimeNamespace() || this.namespaces.length > 1) {
                    return false;
                }
                return this.namespaces.length === 0 || this.namespaces[0].uri === "";
                // x.* has the same meaning as x.*::*, so look for the former case and give
                // it the same meaning of the latter.
                // return !this.isRuntimeNamespace() &&
                //  (this.namespaces.length === 0 || (this.isAnyName() && this.namespaces.length !== 1));
            };
            Multiname.prototype.isQName = function () {
                var kind = this.kind;
                var result = kind === 29 /* TypeName */ ||
                    kind === 7 /* QName */ || kind === 13 /* QNameA */ ||
                    kind >= 15 /* RTQName */ && kind <= 18 /* RTQNameLA */;
                release || assert(!(result && this.namespaces.length !== 1));
                return result;
            };
            Object.defineProperty(Multiname.prototype, "namespace", {
                get: function () {
                    release || assert(this.isQName());
                    return this.namespaces[0];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Multiname.prototype, "uri", {
                get: function () {
                    release || assert(this.isQName());
                    return this.namespaces[0].uri;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Multiname.prototype, "prefix", {
                get: function () {
                    release || assert(this.isQName());
                    return this.namespaces[0].prefix;
                },
                set: function (prefix) {
                    release || assert(this.isQName());
                    var ns = this.namespaces[0];
                    if (ns.prefix === prefix) {
                        return;
                    }
                    this.namespaces[0] = internPrefixedNamespace(ns.type, ns.uri, prefix);
                },
                enumerable: true,
                configurable: true
            });
            Multiname.prototype.equalsQName = function (mn) {
                release || assert(this.isQName());
                return this.name === mn.name && this.namespaces[0].uri === mn.namespaces[0].uri;
            };
            Multiname.prototype.matches = function (mn) {
                release || assert(this.isQName());
                var anyName = mn.isAnyName();
                if (anyName && !mn.isQName()) {
                    return true;
                }
                if (!anyName && this.name !== mn.name) {
                    return false;
                }
                var uri = this.namespaces[0].uri;
                for (var i = mn.namespaces.length; i--;) {
                    if (mn.namespaces[i].uri === uri) {
                        return true;
                    }
                }
                return false;
            };
            Multiname.prototype.isAttribute = function () {
                switch (this.kind) {
                    case 13 /* QNameA */:
                    case 16 /* RTQNameA */:
                    case 18 /* RTQNameLA */:
                    case 14 /* MultinameA */:
                    case 28 /* MultinameLA */:
                        return true;
                }
                return false;
            };
            Multiname.prototype.getMangledName = function () {
                release || assert(this.isQName());
                return this._mangledName || this._mangleName();
            };
            Multiname.prototype._mangleName = function () {
                release || assert(!this._mangledName);
                var mangledName = "$" + this.namespaces[0].mangledName + AVMX.axCoerceString(this.name);
                if (!this.isRuntime()) {
                    this._mangledName = mangledName;
                }
                return mangledName;
            };
            Multiname.prototype.getPublicMangledName = function () {
                if (Shumway.isNumeric(this.name)) {
                    return this.name;
                }
                return "$Bg" + AVMX.axCoerceString(this.name);
            };
            Multiname.isPublicQualifiedName = function (value) {
                return value.indexOf('$Bg') === 0;
            };
            Multiname.getPublicMangledName = function (name) {
                if (Shumway.isNumeric(name)) {
                    return name;
                }
                return "$Bg" + name;
            };
            Multiname.prototype.toFQNString = function (useColons) {
                release || assert(this.isQName());
                var prefix = this.namespaces[0].uri;
                if (prefix.length) {
                    prefix += (useColons ? '::' : '.');
                }
                return prefix + this.name;
            };
            Multiname.prototype.toString = function () {
                var str = getCONSTANTName(this.kind) + " ";
                str += this.isAttribute() ? "@" : "";
                if (this.isRuntimeNamespace()) {
                    var namespaces = this.namespaces ? this.namespaces.map(function (x) { return String(x); }).join(", ") : null;
                    str += "[" + namespaces + "]::" + this._nameToString();
                }
                else if (this.isQName()) {
                    str += this.namespaces[0] + "::";
                    str += this._nameToString();
                }
                else {
                    str += "{" + this.namespaces.map(function (x) { return String(x); }).join(", ") + "}";
                    str += "::" + this._nameToString();
                }
                if (this.parameterType) {
                    str += "<" + this.parameterType + ">";
                }
                return str;
            };
            Multiname.prototype.toFlashlogString = function () {
                var namespaceUri = this.uri;
                return namespaceUri ? namespaceUri + "::" + this.name : this.name;
            };
            /**
             * Removes the public prefix, or returns undefined if the prefix doesn't exist.
             */
            Multiname.stripPublicMangledName = function (name) {
                if (name.indexOf("$Bg") === 0) {
                    return name.substring(3);
                }
                return undefined;
            };
            Multiname.FromSimpleName = function (simpleName) {
                var nameIndex = simpleName.lastIndexOf(".");
                if (nameIndex <= 0) {
                    nameIndex = simpleName.lastIndexOf(" ");
                }
                var uri = '';
                var name;
                if (nameIndex > 0 && nameIndex < simpleName.length - 1) {
                    name = simpleName.substring(nameIndex + 1).trim();
                    uri = simpleName.substring(0, nameIndex).trim();
                }
                else {
                    name = simpleName;
                }
                var ns = internNamespace(0 /* Public */, uri);
                return new Multiname(null, 0, 15 /* RTQName */, [ns], name);
            };
            Multiname._nextID = 1;
            return Multiname;
        })();
        AVMX.Multiname = Multiname;
        // Used in _hashNamespace so we don't need to allocate a new buffer each time.
        var namespaceHashingBuffer = new Int32Array(100);
        var Namespace = (function () {
            function Namespace(type, uri, prefix) {
                this.type = type;
                this.uri = uri;
                this.prefix = prefix;
                this.mangledName = null;
                assert(type !== undefined);
                this.mangleName();
                if (!release) {
                    Object.freeze(this);
                }
            }
            Namespace.prototype.toString = function () {
                return getNamespaceTypeName(this.type) + (this.uri !== "" ? ":" + this.uri : "");
            };
            Namespace._hashNamespace = function (type, uri, prefix) {
                uri = uri + '';
                prefix = prefix + '';
                var index = Namespace._knownNames.indexOf(uri);
                if (index >= 0) {
                    return type << 2 | index;
                }
                var length = 1 + uri.length + prefix.length;
                var data = length < 101 ? namespaceHashingBuffer : new Int32Array(length);
                var j = 0;
                data[j++] = type;
                for (var i = 0; i < uri.length; i++) {
                    data[j++] = uri.charCodeAt(i);
                }
                for (var i = 0; i < prefix.length; i++) {
                    data[j++] = prefix.charCodeAt(i);
                }
                return Shumway.HashUtilities.hashBytesTo32BitsMD5(data, 0, j);
            };
            Namespace.prototype.mangleName = function () {
                if (this.type === 0 /* Public */ && this.uri === '') {
                    this.mangledName = 'Bg';
                    return;
                }
                var nsHash = Namespace._hashNamespace(this.type, this.uri, this.prefix);
                this.mangledName = Shumway.StringUtilities.variableLengthEncodeInt32(nsHash);
            };
            Namespace.prototype.isPublic = function () {
                return this.type === 0 /* Public */;
            };
            Object.defineProperty(Namespace.prototype, "reflectedURI", {
                get: function () {
                    // For public names without a URI, Tamarin uses `null`, we use `""`.
                    // Hence: special-casing for reflection.
                    return this.uri || (this.type === 0 /* Public */ ? null : this.uri);
                },
                enumerable: true,
                configurable: true
            });
            Namespace._knownNames = [
                ""
            ];
            return Namespace;
        })();
        AVMX.Namespace = Namespace;
        var _namespaces = {};
        function internNamespace(type, uri) {
            var key = type + uri;
            return _namespaces[key] || (_namespaces[key] = new Namespace(type, uri, ''));
        }
        AVMX.internNamespace = internNamespace;
        function internPrefixedNamespace(type, uri, prefix) {
            var key = type + uri + prefix;
            var ns = _namespaces[key];
            if (!ns) {
                ns = _namespaces[key] = new Namespace(type, uri, prefix);
            }
            return ns;
        }
        AVMX.internPrefixedNamespace = internPrefixedNamespace;
        Namespace.PUBLIC = internNamespace(0 /* Public */, "");
        var ABCFile = (function () {
            function ABCFile(env, _buffer) {
                this._buffer = _buffer;
                this.env = env;
                this._stream = new AbcStream(_buffer);
                this._checkMagic();
                this._parseConstantPool();
                this._parseNamespaces();
                this._parseNamespaceSets();
                this._parseMultinames();
                this._parseMethodInfos();
                this._parseMetaData();
                this._parseInstanceAndClassInfos();
                this._parseScriptInfos();
                this._parseMethodBodyInfos();
            }
            Object.defineProperty(ABCFile.prototype, "applicationDomain", {
                get: function () {
                    release || assert(this.env.app);
                    return this.env.app;
                },
                enumerable: true,
                configurable: true
            });
            ABCFile.prototype._parseConstantPool = function () {
                this._parseNumericConstants();
                this._parseStringConstants();
            };
            ABCFile.prototype._parseNumericConstants = function () {
                var n = 0, s = this._stream;
                // Parse Signed Integers
                n = s.readU30();
                var ints = new Int32Array(n);
                ints[0] = 0;
                for (var i = 1; i < n; i++) {
                    ints[i] = s.readS32();
                }
                this.ints = ints;
                // Parse Unsigned Integers
                n = s.readU30();
                var uints = new Uint32Array(n);
                uints[0] = 0;
                for (var i = 1; i < n; i++) {
                    uints[i] = s.readS32();
                }
                this.uints = uints;
                // Parse Doubles
                n = s.readU30();
                var doubles = new Float64Array(n);
                doubles[0] = NaN;
                for (var i = 1; i < n; i++) {
                    doubles[i] = s.readDouble();
                }
                this.doubles = doubles;
            };
            ABCFile.prototype._parseStringConstants = function () {
                var n = 0, s = this._stream;
                n = s.readU30();
                this._strings = new Array(n);
                this._strings[0] = null;
                // Record the offset of each string in |stringOffsets|. This array has one extra
                // element so that we can compute the length of the last string.
                var stringOffsets = this._stringOffsets = new Uint32Array(n);
                stringOffsets[0] = -1;
                for (var i = 1; i < n; i++) {
                    stringOffsets[i] = s.position;
                    s.advance(s.readU30());
                }
            };
            ABCFile.prototype._parseNamespaces = function () {
                var s = this._stream;
                var n = s.readU30();
                this._namespaces = new Array(n);
                var namespaceOffsets = this._namespaceOffsets = new Uint32Array(n);
                namespaceOffsets[0] = -1;
                for (var i = 1; i < n; i++) {
                    namespaceOffsets[i] = s.position;
                    s.readU8(); // Kind
                    s.readU30(); // String
                }
            };
            ABCFile.prototype._parseNamespaceSets = function () {
                var s = this._stream;
                var n = s.readU30();
                this._namespaceSets = new Array(n);
                var namespaceSetOffsets = this._namespaceSetOffsets = new Uint32Array(n);
                namespaceSetOffsets[0] = -1;
                for (var i = 1; i < n; i++) {
                    namespaceSetOffsets[i] = s.position;
                    var c = s.readU30(); // Count
                    for (var j = 0; j < c; j++) {
                        s.readU30(); // Namespace
                    }
                }
            };
            ABCFile.prototype._consumeMultiname = function () {
                var s = this._stream;
                var kind = s.readU8();
                switch (kind) {
                    case 7 /* QName */:
                    case 13 /* QNameA */:
                        s.readU30();
                        s.readU30();
                        break;
                    case 15 /* RTQName */:
                    case 16 /* RTQNameA */:
                        s.readU30();
                        break;
                    case 17 /* RTQNameL */:
                    case 18 /* RTQNameLA */:
                        break;
                    case 9 /* Multiname */:
                    case 14 /* MultinameA */:
                        s.readU30();
                        s.readU30();
                        break;
                    case 27 /* MultinameL */:
                    case 28 /* MultinameLA */:
                        s.readU30();
                        break;
                    case 29 /* TypeName */:
                        s.readU32();
                        var typeParameterCount = s.readU32();
                        release || assert(typeParameterCount === 1); // This is probably the number of type
                        // parameters.
                        s.readU32();
                        break;
                    default:
                        Shumway.Debug.unexpected(kind);
                        break;
                }
            };
            ABCFile.prototype._parseMultinames = function () {
                var s = this._stream;
                var n = s.readU30();
                this._multinames = new Array(n);
                var multinameOffsets = this._multinameOffsets = new Uint32Array(n);
                multinameOffsets[0] = -1;
                for (var i = 1; i < n; i++) {
                    multinameOffsets[i] = s.position;
                    this._consumeMultiname();
                }
            };
            ABCFile.prototype._parseMultiname = function (i) {
                var stream = this._stream;
                var namespaceIsRuntime = false;
                var namespaceIndex;
                var useNamespaceSet = true;
                var nameIndex = 0;
                var kind = stream.readU8();
                switch (kind) {
                    case 7 /* QName */:
                    case 13 /* QNameA */:
                        namespaceIndex = stream.readU30();
                        useNamespaceSet = false;
                        nameIndex = stream.readU30();
                        break;
                    case 15 /* RTQName */:
                    case 16 /* RTQNameA */:
                        namespaceIsRuntime = true;
                        nameIndex = stream.readU30();
                        break;
                    case 17 /* RTQNameL */:
                    case 18 /* RTQNameLA */:
                        namespaceIsRuntime = true;
                        break;
                    case 9 /* Multiname */:
                    case 14 /* MultinameA */:
                        nameIndex = stream.readU30();
                        namespaceIndex = stream.readU30();
                        break;
                    case 27 /* MultinameL */:
                    case 28 /* MultinameLA */:
                        namespaceIndex = stream.readU30();
                        if (!release && namespaceIndex === 0) {
                            // TODO: figure out what to do in this case. What would Tamarin do?
                            Shumway.Debug.warning("Invalid multiname: namespace-set index is 0");
                        }
                        break;
                    /**
                     * This is undocumented, looking at Tamarin source for this one.
                     */
                    case 29 /* TypeName */:
                        var mn = stream.readU32();
                        var typeParameterCount = stream.readU32();
                        if (!release && typeParameterCount !== 1) {
                            // TODO: figure out what to do in this case. What would Tamarin do?
                            Shumway.Debug.warning("Invalid multiname: bad type parameter count " + typeParameterCount);
                        }
                        var typeParameter = this.getMultiname(stream.readU32());
                        var factory = this.getMultiname(mn);
                        return new Multiname(this, i, kind, factory.namespaces, factory.name, typeParameter);
                    default:
                        Shumway.Debug.unexpected();
                        break;
                }
                // A name index of 0 means that it's a runtime name.
                var name = nameIndex === 0 ? null : this.getString(nameIndex);
                var namespaces;
                if (namespaceIsRuntime) {
                    namespaces = null;
                }
                else {
                    namespaces = useNamespaceSet ?
                        this.getNamespaceSet(namespaceIndex) :
                        [this.getNamespace(namespaceIndex)];
                }
                return new Multiname(this, i, kind, namespaces, name);
            };
            ABCFile.prototype._checkMagic = function () {
                var magic = this._stream.readWord();
                var flashPlayerBrannan = 46 << 16 | 15;
                if (magic < flashPlayerBrannan) {
                    this.env.app.sec.throwError('VerifierError', AVMX.Errors.InvalidMagicError, magic >> 16, magic & 0xffff);
                }
            };
            /**
             * String duplicates exist in practice but are extremely rare.
             */
            ABCFile.prototype._checkForDuplicateStrings = function () {
                var a = [];
                for (var i = 0; i < this._strings.length; i++) {
                    a.push(this.getString(i));
                }
                a.sort();
                for (var i = 0; i < a.length - 1; i++) {
                    if (a[i] === a[i + 1]) {
                        return true;
                    }
                }
                return false;
            };
            /**
             * Returns the string at the specified index in the string table.
             */
            ABCFile.prototype.getString = function (i) {
                release || assert(i >= 0 && i < this._stringOffsets.length);
                var str = this._strings[i];
                if (str === undefined) {
                    var s = this._stream;
                    s.seek(this._stringOffsets[i]);
                    var l = s.readU30();
                    str = this._strings[i] = s.readUTFString(l);
                }
                return str;
            };
            /**
             * Returns the multiname at the specified index in the multiname table.
             */
            ABCFile.prototype.getMultiname = function (i) {
                if (i < 0 || i >= this._multinameOffsets.length) {
                    this.applicationDomain.sec.throwError("VerifierError", AVMX.Errors.CpoolIndexRangeError, i, this._multinameOffsets.length);
                }
                if (i === 0) {
                    return null;
                }
                var mn = this._multinames[i];
                if (mn === undefined) {
                    var s = this._stream;
                    s.seek(this._multinameOffsets[i]);
                    mn = this._multinames[i] = this._parseMultiname(i);
                }
                return mn;
            };
            /**
             * Returns the namespace at the specified index in the namespace table.
             */
            ABCFile.prototype.getNamespace = function (i) {
                if (i < 0 || i >= this._namespaceOffsets.length) {
                    this.applicationDomain.sec.throwError("VerifierError", AVMX.Errors.CpoolIndexRangeError, i, this._namespaceOffsets.length);
                }
                if (i === 0) {
                    return Namespace.PUBLIC;
                }
                var ns = this._namespaces[i];
                if (ns !== undefined) {
                    return ns;
                }
                var s = this._stream;
                s.seek(this._namespaceOffsets[i]);
                var kind = s.readU8();
                var uriIndex = s.readU30();
                var uri = uriIndex ? this.getString(uriIndex) : undefined;
                var type;
                switch (kind) {
                    case 8 /* Namespace */:
                    case 22 /* PackageNamespace */:
                        type = 0 /* Public */;
                        break;
                    case 23 /* PackageInternalNs */:
                        type = 2 /* PackageInternal */;
                        break;
                    case 24 /* ProtectedNamespace */:
                        type = 1 /* Protected */;
                        break;
                    case 25 /* ExplicitNamespace */:
                        type = 4 /* Explicit */;
                        break;
                    case 26 /* StaticProtectedNs */:
                        type = 5 /* StaticProtected */;
                        break;
                    case 5 /* PrivateNs */:
                        type = 3 /* Private */;
                        break;
                    default:
                        this.applicationDomain.sec.throwError("VerifierError", AVMX.Errors.CpoolEntryWrongTypeError, i);
                }
                if (uri && type !== 3 /* Private */) {
                }
                else if (uri === undefined) {
                    // Only private namespaces gets the empty string instead of undefined. A comment
                    // in Tamarin source code indicates this might not be intentional, but oh well.
                    uri = '';
                }
                ns = this._namespaces[i] = internNamespace(type, uri);
                return ns;
            };
            /**
             * Returns the namespace set at the specified index in the namespace set table.
             */
            ABCFile.prototype.getNamespaceSet = function (i) {
                if (i < 0 || i >= this._namespaceSets.length) {
                    this.applicationDomain.sec.throwError("VerifierError", AVMX.Errors.CpoolIndexRangeError, i, this._namespaceSets.length);
                }
                if (i === 0) {
                    return null;
                }
                var nss = this._namespaceSets[i];
                if (nss === undefined) {
                    var s = this._stream;
                    var o = this._namespaceSetOffsets[i];
                    s.seek(o);
                    var c = s.readU30(); // Count
                    nss = this._namespaceSets[i] = new Array(c);
                    o = s.position;
                    for (var j = 0; j < c; j++) {
                        s.seek(o);
                        var x = s.readU30();
                        o = s.position; // The call to |getNamespace| can change our current position.
                        nss[j] = this.getNamespace(x);
                    }
                }
                return nss;
            };
            ABCFile.prototype._parseMethodInfos = function () {
                var s = this._stream;
                var n = s.readU30();
                this._methods = new Array(n);
                this._methodInfoOffsets = new Uint32Array(n);
                for (var i = 0; i < n; ++i) {
                    this._methodInfoOffsets[i] = s.position;
                    this._consumeMethodInfo();
                }
            };
            ABCFile.prototype._consumeMethodInfo = function () {
                var s = this._stream;
                var parameterCount = s.readU30();
                s.readU30(); // Return Type
                var parameterOffset = s.position;
                for (var i = 0; i < parameterCount; i++) {
                    s.readU30();
                }
                var nm = s.readU30();
                var flags = s.readU8();
                if (flags & 8 /* HasOptional */) {
                    var optionalCount = s.readU30();
                    release || assert(parameterCount >= optionalCount);
                    for (var i = parameterCount - optionalCount; i < parameterCount; i++) {
                        s.readU30(); // Value Index
                        s.readU8(); // Value Kind
                    }
                }
                if (flags & 128 /* HasParamNames */) {
                    for (var i = 0; i < parameterCount; i++) {
                        s.readU30();
                    }
                }
            };
            ABCFile.prototype._parseMethodInfo = function (j) {
                var s = this._stream;
                var parameterCount = s.readU30();
                var returnType = s.readU30();
                var parameterOffset = s.position;
                var parameters = new Array(parameterCount);
                for (var i = 0; i < parameterCount; i++) {
                    parameters[i] = new ParameterInfo(this, s.readU30(), 0, -1, -1);
                }
                var name = s.readU30();
                var flags = s.readU8();
                var optionalCount = 0;
                if (flags & 8 /* HasOptional */) {
                    optionalCount = s.readU30();
                    release || assert(parameterCount >= optionalCount);
                    for (var i = parameterCount - optionalCount; i < parameterCount; i++) {
                        parameters[i].optionalValueIndex = s.readU30();
                        parameters[i].optionalValueKind = s.readU8();
                    }
                }
                if (flags & 128 /* HasParamNames */) {
                    for (var i = 0; i < parameterCount; i++) {
                        // NOTE: We can't get the parameter name as described in the spec because some SWFs have
                        // invalid parameter names. Tamarin ignores parameter names and so do we.
                        parameters[i].name = s.readU30();
                    }
                }
                return new MethodInfo(this, j, name, returnType, parameters, optionalCount, flags);
            };
            /**
             * Returns the method info at the specified index in the method info table.
             */
            ABCFile.prototype.getMethodInfo = function (i) {
                release || assert(i >= 0 && i < this._methodInfoOffsets.length);
                var mi = this._methods[i];
                if (mi === undefined) {
                    var s = this._stream;
                    s.seek(this._methodInfoOffsets[i]);
                    mi = this._methods[i] = this._parseMethodInfo(i);
                }
                return mi;
            };
            ABCFile.prototype.getMethodBodyInfo = function (i) {
                return this._methodBodies[i];
            };
            ABCFile.prototype._parseMetaData = function () {
                var s = this._stream;
                var n = s.readU30();
                this._metadata = new Array(n);
                var metadataInfoOffsets = this._metadataInfoOffsets = new Uint32Array(n);
                for (var i = 0; i < n; i++) {
                    metadataInfoOffsets[i] = s.position;
                    s.readU30(); // Name
                    var itemCount = s.readU30(); // Item Count
                    for (var j = 0; j < itemCount; j++) {
                        s.readU30();
                        s.readU30();
                    }
                }
            };
            ABCFile.prototype.getMetadataInfo = function (i) {
                release || assert(i >= 0 && i < this._metadata.length);
                var mi = this._metadata[i];
                if (mi === undefined) {
                    var s = this._stream;
                    s.seek(this._metadataInfoOffsets[i]);
                    var name = s.readU30(); // Name
                    var itemCount = s.readU30(); // Item Count
                    var keys = new Uint32Array(itemCount);
                    for (var j = 0; j < itemCount; j++) {
                        keys[j] = s.readU30();
                    }
                    var values = new Uint32Array(itemCount);
                    for (var j = 0; j < itemCount; j++) {
                        values[j] = s.readU30();
                    }
                    mi = this._metadata[i] = new MetadataInfo(this, name, keys, values);
                }
                return mi;
            };
            ABCFile.prototype._parseInstanceAndClassInfos = function () {
                var s = this._stream;
                var n = s.readU30();
                var instances = this.instances = new Array(n);
                for (var i = 0; i < n; i++) {
                    instances[i] = this._parseInstanceInfo();
                }
                this._parseClassInfos(n);
                var o = s.position;
                for (var i = 0; i < n; i++) {
                    instances[i].classInfo = this.classes[i];
                }
                s.seek(o);
            };
            ABCFile.prototype._parseInstanceInfo = function () {
                var s = this._stream;
                var name = s.readU30();
                var superName = s.readU30();
                var flags = s.readU8();
                var protectedNsIndex = 0;
                if (flags & 8 /* ClassProtectedNs */) {
                    protectedNsIndex = s.readU30();
                }
                var interfaceCount = s.readU30();
                var interfaces = [];
                for (var i = 0; i < interfaceCount; i++) {
                    interfaces[i] = s.readU30();
                }
                var initializer = s.readU30();
                var traits = this._parseTraits();
                var instanceInfo = new InstanceInfo(this, name, superName, flags, protectedNsIndex, interfaces, initializer, traits);
                traits.attachHolder(instanceInfo);
                return instanceInfo;
            };
            ABCFile.prototype._parseTraits = function () {
                var s = this._stream;
                var n = s.readU30();
                var traits = [];
                for (var i = 0; i < n; i++) {
                    traits.push(this._parseTrait());
                }
                return new Traits(traits);
            };
            ABCFile.prototype._parseTrait = function () {
                var s = this._stream;
                var name = s.readU30();
                var tag = s.readU8();
                var kind = tag & 0x0F;
                var attributes = (tag >> 4) & 0x0F;
                var trait;
                switch (kind) {
                    case 0 /* Slot */:
                    case 6 /* Const */:
                        var slot = s.readU30();
                        var type = s.readU30();
                        var valueIndex = s.readU30();
                        var valueKind = -1;
                        if (valueIndex !== 0) {
                            valueKind = s.readU8();
                        }
                        trait = new SlotTraitInfo(this, kind, name, slot, type, valueKind, valueIndex);
                        break;
                    case 1 /* Method */:
                    case 2 /* Getter */:
                    case 3 /* Setter */:
                        var dispID = s.readU30(); // Tamarin optimization.
                        var methodInfoIndex = s.readU30();
                        var o = s.position;
                        var methodInfo = this.getMethodInfo(methodInfoIndex);
                        trait = methodInfo.trait = new MethodTraitInfo(this, kind, name, methodInfo);
                        s.seek(o);
                        break;
                    case 4 /* Class */:
                        var slot = s.readU30();
                        var classInfo = this.classes[s.readU30()];
                        trait = classInfo.trait = new ClassTraitInfo(this, kind, name, slot, classInfo);
                        break;
                    default:
                        this.applicationDomain.sec.throwError("VerifierError", AVMX.Errors.UnsupportedTraitsKindError, kind);
                }
                if (attributes & 4 /* Metadata */) {
                    var n = s.readU30();
                    var metadata = new Uint32Array(n);
                    for (var i = 0; i < n; i++) {
                        metadata[i] = s.readU30();
                    }
                    trait.metadata = metadata;
                }
                return trait;
            };
            ABCFile.prototype._parseClassInfos = function (n) {
                var s = this._stream;
                var classes = this.classes = new Array(n);
                for (var i = 0; i < n; i++) {
                    classes[i] = this._parseClassInfo(i);
                }
            };
            ABCFile.prototype._parseClassInfo = function (i) {
                var s = this._stream;
                var initializer = s.readU30();
                var traits = this._parseTraits();
                var classInfo = new ClassInfo(this, this.instances[i], initializer, traits);
                traits.attachHolder(classInfo);
                return classInfo;
            };
            ABCFile.prototype._parseScriptInfos = function () {
                var s = this._stream;
                var n = s.readU30();
                var scripts = this.scripts = new Array(n);
                for (var i = 0; i < n; i++) {
                    scripts[i] = this._parseScriptInfo();
                }
            };
            ABCFile.prototype._parseScriptInfo = function () {
                var s = this._stream;
                var initializer = s.readU30();
                var traits = this._parseTraits();
                var scriptInfo = new ScriptInfo(this, initializer, traits);
                traits.attachHolder(scriptInfo);
                return scriptInfo;
            };
            ABCFile.prototype._parseMethodBodyInfos = function () {
                var s = this._stream;
                var methodBodies = this._methodBodies = new Array(this._methods.length);
                var n = s.readU30();
                var o = s.position;
                for (var i = 0; i < n; i++) {
                    var methodInfo = s.readU30();
                    var maxStack = s.readU30();
                    var localCount = s.readU30();
                    var initScopeDepth = s.readU30();
                    var maxScopeDepth = s.readU30();
                    var code = s.viewU8s(s.readU30());
                    var e = s.readU30();
                    var exceptions = new Array(e);
                    for (var j = 0; j < e; ++j) {
                        exceptions[j] = this._parseException();
                    }
                    var traits = this._parseTraits();
                    methodBodies[methodInfo] = new MethodBodyInfo(maxStack, localCount, initScopeDepth, maxScopeDepth, code, exceptions, traits);
                    traits.attachHolder(methodBodies[methodInfo]);
                }
            };
            ABCFile.prototype._parseException = function () {
                var s = this._stream;
                var start = s.readU30();
                var end = s.readU30();
                var target = s.readU30();
                var type = s.readU30();
                var varName = s.readU30();
                return new ExceptionInfo(this, start, end, target, type, varName);
            };
            ABCFile.prototype.getConstant = function (kind, i) {
                switch (kind) {
                    case 3 /* Int */:
                        return this.ints[i];
                    case 4 /* UInt */:
                        return this.uints[i];
                    case 6 /* Double */:
                        return this.doubles[i];
                    case 1 /* Utf8 */:
                        return this.getString(i);
                    case 11 /* True */:
                        return true;
                    case 10 /* False */:
                        return false;
                    case 12 /* Null */:
                        return null;
                    case 0 /* Undefined */:
                        return undefined;
                    case 8 /* Namespace */:
                    case 23 /* PackageInternalNs */:
                        return this.getNamespace(i);
                    case 7 /* QName */:
                    case 14 /* MultinameA */:
                    case 15 /* RTQName */:
                    case 16 /* RTQNameA */:
                    case 17 /* RTQNameL */:
                    case 18 /* RTQNameLA */:
                    case 19 /* NameL */:
                    case 20 /* NameLA */:
                        return this.getMultiname(i);
                    case 2 /* Float */:
                        Shumway.Debug.warning("TODO: CONSTANT.Float may be deprecated?");
                        break;
                    default:
                        release || assert(false, "Not Implemented Kind " + kind);
                }
            };
            ABCFile.prototype.stress = function () {
                for (var i = 0; i < this._multinames.length; i++) {
                    this.getMultiname(i);
                }
                for (var i = 0; i < this._namespaceSets.length; i++) {
                    this.getNamespaceSet(i);
                }
                for (var i = 0; i < this._namespaces.length; i++) {
                    this.getNamespace(i);
                }
                for (var i = 0; i < this._strings.length; i++) {
                    this.getString(i);
                }
            };
            ABCFile.prototype.trace = function (writer) {
                writer.writeLn("Multinames: " + this._multinames.length);
                if (true) {
                    writer.indent();
                    for (var i = 0; i < this._multinames.length; i++) {
                        writer.writeLn(i + " " + this.getMultiname(i));
                    }
                    writer.outdent();
                }
                writer.writeLn("Namespace Sets: " + this._namespaceSets.length);
                if (true) {
                    writer.indent();
                    for (var i = 0; i < this._namespaceSets.length; i++) {
                        writer.writeLn(i + " " + this.getNamespaceSet(i));
                    }
                    writer.outdent();
                }
                writer.writeLn("Namespaces: " + this._namespaces.length);
                if (true) {
                    writer.indent();
                    for (var i = 0; i < this._namespaces.length; i++) {
                        writer.writeLn(i + " " + this.getNamespace(i));
                    }
                    writer.outdent();
                }
                writer.writeLn("Strings: " + this._strings.length);
                if (true) {
                    writer.indent();
                    for (var i = 0; i < this._strings.length; i++) {
                        writer.writeLn(i + " " + this.getString(i));
                    }
                    writer.outdent();
                }
                writer.writeLn("MethodInfos: " + this._methods.length);
                if (true) {
                    writer.indent();
                    for (var i = 0; i < this._methods.length; i++) {
                        writer.writeLn(i + " " + this.getMethodInfo(i));
                        if (this._methodBodies[i]) {
                            this._methodBodies[i].trace(writer);
                        }
                    }
                    writer.outdent();
                }
                writer.writeLn("InstanceInfos: " + this.instances.length);
                if (true) {
                    writer.indent();
                    for (var i = 0; i < this.instances.length; i++) {
                        writer.writeLn(i + " " + this.instances[i]);
                        this.instances[i].trace(writer);
                    }
                    writer.outdent();
                }
                writer.writeLn("ClassInfos: " + this.classes.length);
                if (true) {
                    writer.indent();
                    for (var i = 0; i < this.classes.length; i++) {
                        this.classes[i].trace(writer);
                    }
                    writer.outdent();
                }
                writer.writeLn("ScriptInfos: " + this.scripts.length);
                if (true) {
                    writer.indent();
                    for (var i = 0; i < this.scripts.length; i++) {
                        this.scripts[i].trace(writer);
                    }
                    writer.outdent();
                }
            };
            return ABCFile;
        })();
        AVMX.ABCFile = ABCFile;
        var ABCCatalog = (function () {
            function ABCCatalog(app, abcs, index) {
                this.app = app;
                this.map = Shumway.ObjectUtilities.createMap();
                this.abcs = abcs;
                this.scripts = Shumway.ObjectUtilities.createMap();
                for (var i = 0; i < index.length; i++) {
                    var abc = index[i];
                    this.scripts[abc.name] = abc;
                    release || assert(Array.isArray(abc.defs));
                    for (var j = 0; j < abc.defs.length; j++) {
                        var def = abc.defs[j].split(':');
                        var nameMappings = this.map[def[1]];
                        if (!nameMappings) {
                            nameMappings = this.map[def[1]] = Object.create(null);
                        }
                        nameMappings[def[0]] = abc.name;
                    }
                }
            }
            ABCCatalog.prototype.getABCByScriptName = function (scriptName) {
                var entry = this.scripts[scriptName];
                if (!entry) {
                    return null;
                }
                var env = { url: scriptName, app: this.app };
                return new ABCFile(env, this.abcs.subarray(entry.offset, entry.offset + entry.length));
            };
            ABCCatalog.prototype.getABCByMultiname = function (mn) {
                var mappings = this.map[mn.name];
                if (!mappings) {
                    return null;
                }
                var namespaces = mn.namespaces;
                for (var i = 0; i < namespaces.length; i++) {
                    var ns = namespaces[i];
                    var scriptName = mappings[ns.uri];
                    if (scriptName) {
                        return this.getABCByScriptName(scriptName);
                    }
                }
                return null;
            };
            return ABCCatalog;
        })();
        AVMX.ABCCatalog = ABCCatalog;
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var assert = Shumway.Debug.assert;
        var popManyInto = Shumway.ArrayUtilities.popManyInto;
        var getPropertyDescriptor = Shumway.ObjectUtilities.getPropertyDescriptor;
        /**
         * Helps the interpreter allocate fewer Scope objects.
         */
        var ScopeStack = (function () {
            function ScopeStack(parent) {
                this.parent = parent;
                this.stack = [];
                this.isWith = [];
            }
            ScopeStack.prototype.push = function (object, isWith) {
                this.stack.push(object);
                this.isWith.push(!!isWith);
            };
            ScopeStack.prototype.get = function (index) {
                return this.stack[index];
            };
            ScopeStack.prototype.clear = function () {
                this.stack.length = 0;
                this.isWith.length = 0;
            };
            ScopeStack.prototype.pop = function () {
                this.isWith.pop();
                this.stack.pop();
                if (this.scopes && this.scopes.length > this.stack.length) {
                    this.scopes.length--;
                    release || assert(this.scopes.length === this.stack.length);
                }
            };
            ScopeStack.prototype.topScope = function () {
                if (!this.scopes) {
                    if (this.stack.length === 0) {
                        return this.parent;
                    }
                    this.scopes = [];
                }
                var parent = this.parent;
                for (var i = 0; i < this.stack.length; i++) {
                    var object = this.stack[i], isWith = this.isWith[i], scope = this.scopes[i];
                    if (!scope || scope.parent !== parent || scope.object !== object || scope.isWith !== isWith) {
                        scope = this.scopes[i] = new AVMX.Scope(parent, object, isWith);
                    }
                    parent = scope;
                }
                return parent;
            };
            return ScopeStack;
        })();
        AVMX.ScopeStack = ScopeStack;
        function popNameInto(stack, mn, rn) {
            rn.id = mn.id;
            rn.kind = mn.kind;
            if (mn.isRuntimeName()) {
                var name = stack.pop();
                // Unwrap content script-created AXQName instances.
                if (name && name.axClass && name.axClass === name.sec.AXQName) {
                    name = name.name;
                    release || assert(name instanceof AVMX.Multiname);
                    rn.kind = mn.isAttribute() ? 18 /* RTQNameLA */ : 17 /* RTQNameL */;
                    rn.id = name.id;
                    rn.name = name.name;
                    rn.namespaces = name.namespaces;
                    return;
                }
                rn.name = name;
                rn.id = -1;
            }
            else {
                rn.name = mn.name;
            }
            if (mn.isRuntimeNamespace()) {
                var ns = stack.pop();
                // Unwrap content script-created AXNamespace instances.
                if (ns._ns) {
                    release || assert(ns.sec && ns.axClass === ns.sec.AXNamespace);
                    ns = ns._ns;
                }
                rn.namespaces = [ns];
                rn.id = -1;
            }
            else {
                rn.namespaces = mn.namespaces;
            }
            AVMX.interpreterWriter && AVMX.interpreterWriter.greenLn("Name: " + rn.name);
        }
        function interpret(self, methodInfo, savedScope, args, callee) {
            AVMX.executionWriter && AVMX.executionWriter.enter("> " + methodInfo);
            try {
                var result = _interpret(self, methodInfo, savedScope, args, callee);
                AVMX.executionWriter && AVMX.executionWriter.leave("< " + methodInfo.trait);
                return result;
            }
            catch (e) {
                AVMX.executionWriter && AVMX.executionWriter.leave("< " + methodInfo.trait + ", Exception: " + e);
                throw e;
            }
        }
        AVMX.interpret = interpret;
        var InterpreterFrame = (function () {
            function InterpreterFrame(receiver, methodInfo, parentScope, callArgs, callee) {
                this.pc = 0;
                this.stack = [];
                this.hasNext2Infos = null;
                var body = this.body = methodInfo.getBody();
                this.code = body.code;
                this.scopes = new ScopeStack(parentScope);
                var locals = this.locals = [receiver];
                var app = this.app = methodInfo.abc.applicationDomain;
                var sec = this.sec = app.sec;
                var argCount = callArgs.length;
                var arg;
                for (var i = 0, j = methodInfo.parameters.length; i < j; i++) {
                    var p = methodInfo.parameters[i];
                    if (i < argCount) {
                        arg = callArgs[i];
                    }
                    else if (p.hasOptionalValue()) {
                        arg = p.getOptionalValue();
                    }
                    else {
                        arg = undefined;
                    }
                    var rn = p.getType();
                    if (rn && !rn.isAnyName()) {
                        var type = parentScope.getScopeProperty(rn, true, false);
                        if (!type) {
                            // During class initialization the class' constructor isn't in scope and can't be
                            // resolved as a scope property: trying to do so yields `null`.
                            // However, using it as a constructor parameter type *does* work, and correctly
                            // applies coercion to the constructor. It's unclear why and how this works in
                            // Tamarin, but since it does work, we check for this scenario here and work around it.
                            if ('axClass' in receiver && receiver.axClass.name.matches(rn)) {
                                type = receiver.axClass;
                            }
                            else {
                                continue;
                            }
                        }
                        if (!release && AVMX.interpreterWriter) {
                            AVMX.interpreterWriter.writeLn("Coercing argument to type " +
                                (type.axClass ? type.axClass.name.toFQNString(false) : type));
                        }
                        arg = type.axCoerce(arg);
                    }
                    locals.push(arg);
                }
                if (methodInfo.needsRest()) {
                    locals.push(sec.createArrayUnsafe(AVMX.sliceArguments(callArgs, methodInfo.parameters.length)));
                }
                else if (methodInfo.needsArguments()) {
                    var argsArray = AVMX.sliceArguments(callArgs, 0);
                    var argumentsArray = Object.create(sec.argumentsPrototype);
                    argumentsArray.value = argsArray;
                    argumentsArray.callee = callee;
                    argumentsArray.receiver = receiver;
                    argumentsArray.methodInfo = methodInfo;
                    locals.push(argumentsArray);
                }
            }
            InterpreterFrame.prototype.bc = function () {
                return this.code[this.pc++];
            };
            InterpreterFrame.prototype.peekStack = function () {
                return this.stack[this.stack.length - 1];
            };
            InterpreterFrame.prototype.u30 = function () {
                var code = this.code;
                var pc = this.pc;
                var result = code[pc++];
                if (result & 0x80) {
                    result = result & 0x7f | code[pc++] << 7;
                    if (result & 0x4000) {
                        result = result & 0x3fff | code[pc++] << 14;
                        if (result & 0x200000) {
                            result = result & 0x1fffff | code[pc++] << 21;
                            if (result & 0x10000000) {
                                result = result & 0x0fffffff | code[pc++] << 28;
                                result = result & 0xffffffff;
                            }
                        }
                    }
                }
                this.pc = pc;
                return result >>> 0;
            };
            InterpreterFrame.prototype.s24 = function () {
                var code = this.code;
                var pc = this.pc;
                var u = code[pc] | (code[pc + 1] << 8) | (code[pc + 2] << 16);
                this.pc = pc + 3;
                return (u << 8) >> 8;
            };
            InterpreterFrame.prototype.getHasNext2Info = function () {
                var pc = this.pc;
                var hasNext2Infos = this.hasNext2Infos;
                if (!hasNext2Infos) {
                    hasNext2Infos = this.hasNext2Infos = [];
                }
                if (!hasNext2Infos[pc]) {
                    hasNext2Infos[pc] = new AVMX.HasNext2Info(null, 0);
                }
                return hasNext2Infos[pc];
            };
            return InterpreterFrame;
        })();
        function _interpret(self, methodInfo, savedScope, callArgs, callee) {
            var frame = new InterpreterFrame(self, methodInfo, savedScope, callArgs, callee);
            var stack = frame.stack;
            var locals = frame.locals;
            var scopes = frame.scopes;
            var sec = frame.sec;
            var abc = methodInfo.abc;
            var rn = new AVMX.Multiname(abc, 0, null, null, null);
            var value, object, receiver, type, a, b, offset, index, result;
            var args = [];
            var argCount = 0;
            var scopeStacksHeight = AVMX.scopeStacks.length;
            AVMX.scopeStacks.push(frame.scopes);
            interpretLabel: while (true) {
                if (!release && AVMX.interpreterWriter) {
                    AVMX.interpreterWriter.greenLn("" + frame.pc + ": " + AVMX.getBytecodeName(frame.code[frame.pc]) + " [" +
                        frame.stack.map(function (x) { return stringifyStackEntry(x); }).join(", ") + "]");
                }
                try {
                    var bc = frame.bc();
                    switch (bc) {
                        case 9 /* LABEL */:
                            continue;
                        case 3 /* THROW */:
                            throw stack.pop();
                        case 8 /* KILL */:
                            locals[frame.u30()] = undefined;
                            break;
                        case 12 /* IFNLT */:
                            b = stack.pop();
                            a = stack.pop();
                            offset = frame.s24();
                            if (!(a < b)) {
                                frame.pc += offset;
                            }
                            continue;
                        case 24 /* IFGE */:
                            b = stack.pop();
                            a = stack.pop();
                            offset = frame.s24();
                            if (a >= b) {
                                frame.pc += offset;
                            }
                            continue;
                        case 13 /* IFNLE */:
                            b = stack.pop();
                            a = stack.pop();
                            offset = frame.s24();
                            if (!(a <= b)) {
                                frame.pc += offset;
                            }
                            continue;
                        case 23 /* IFGT */:
                            b = stack.pop();
                            a = stack.pop();
                            offset = frame.s24();
                            if (a > b) {
                                frame.pc += offset;
                            }
                            continue;
                        case 14 /* IFNGT */:
                            b = stack.pop();
                            a = stack.pop();
                            offset = frame.s24();
                            if (!(a > b)) {
                                frame.pc += offset;
                            }
                            continue;
                        case 22 /* IFLE */:
                            b = stack.pop();
                            a = stack.pop();
                            offset = frame.s24();
                            if (a <= b) {
                                frame.pc += offset;
                            }
                            continue;
                        case 15 /* IFNGE */:
                            b = stack.pop();
                            a = stack.pop();
                            offset = frame.s24();
                            if (!(a >= b)) {
                                frame.pc += offset;
                            }
                            continue;
                        case 21 /* IFLT */:
                            b = stack.pop();
                            a = stack.pop();
                            offset = frame.s24();
                            if (a < b) {
                                frame.pc += offset;
                            }
                            continue;
                        case 16 /* JUMP */:
                            frame.pc = frame.s24() + frame.pc;
                            continue;
                        case 17 /* IFTRUE */:
                            offset = frame.s24();
                            if (!!stack.pop()) {
                                frame.pc += offset;
                            }
                            continue;
                        case 18 /* IFFALSE */:
                            offset = frame.s24();
                            if (!stack.pop()) {
                                frame.pc += offset;
                            }
                            continue;
                        case 19 /* IFEQ */:
                            b = stack.pop();
                            a = stack.pop();
                            offset = frame.s24();
                            if (AVMX.axEquals(a, b, sec)) {
                                frame.pc += offset;
                            }
                            continue;
                        case 20 /* IFNE */:
                            b = stack.pop();
                            a = stack.pop();
                            offset = frame.s24();
                            if (!AVMX.axEquals(a, b, sec)) {
                                frame.pc += offset;
                            }
                            continue;
                        case 25 /* IFSTRICTEQ */:
                            b = stack.pop();
                            a = stack.pop();
                            offset = frame.s24();
                            if (a === b) {
                                frame.pc += offset;
                            }
                            continue;
                        case 26 /* IFSTRICTNE */:
                            b = stack.pop();
                            a = stack.pop();
                            offset = frame.s24();
                            if (a !== b) {
                                frame.pc += offset;
                            }
                            continue;
                        case 27 /* LOOKUPSWITCH */:
                            var basePC = frame.pc - 1;
                            offset = frame.s24();
                            var caseCount = frame.u30();
                            index = stack.pop();
                            if (index <= caseCount) {
                                frame.pc += 3 * index; // Jump to case offset.
                                offset = frame.s24();
                            }
                            frame.pc = basePC + offset;
                            continue;
                        case 29 /* POPSCOPE */:
                            scopes.pop();
                            break;
                        case 30 /* NEXTNAME */:
                            index = stack.pop();
                            receiver = sec.box(frame.peekStack());
                            stack[stack.length - 1] = receiver.axNextName(index);
                            break;
                        case 35 /* NEXTVALUE */:
                            index = stack.pop();
                            receiver = sec.box(frame.peekStack());
                            stack[stack.length - 1] = receiver.axNextValue(index);
                            break;
                        case 50 /* HASNEXT2 */:
                            var hasNext2Info = frame.getHasNext2Info();
                            var objectIndex = frame.u30();
                            var indexIndex = frame.u30();
                            hasNext2Info.next(sec.box(locals[objectIndex]), locals[indexIndex]);
                            locals[objectIndex] = hasNext2Info.object;
                            locals[indexIndex] = hasNext2Info.index;
                            stack.push(!!hasNext2Info.index);
                            break;
                        case 32 /* PUSHNULL */:
                            stack.push(null);
                            break;
                        case 33 /* PUSHUNDEFINED */:
                            stack.push(undefined);
                            break;
                        case 36 /* PUSHBYTE */:
                            stack.push(frame.code[frame.pc++] << 24 >> 24);
                            break;
                        case 37 /* PUSHSHORT */:
                            stack.push(frame.u30() << 16 >> 16);
                            break;
                        case 44 /* PUSHSTRING */:
                            stack.push(abc.getString(frame.u30()));
                            break;
                        case 45 /* PUSHINT */:
                            stack.push(abc.ints[frame.u30()]);
                            break;
                        case 46 /* PUSHUINT */:
                            stack.push(abc.uints[frame.u30()]);
                            break;
                        case 47 /* PUSHDOUBLE */:
                            stack.push(abc.doubles[frame.u30()]);
                            break;
                        case 38 /* PUSHTRUE */:
                            stack.push(true);
                            break;
                        case 39 /* PUSHFALSE */:
                            stack.push(false);
                            break;
                        case 40 /* PUSHNAN */:
                            stack.push(NaN);
                            break;
                        case 41 /* POP */:
                            stack.pop();
                            break;
                        case 42 /* DUP */:
                            stack.push(stack[stack.length - 1]);
                            break;
                        case 43 /* SWAP */:
                            value = stack[stack.length - 1];
                            stack[stack.length - 1] = stack[stack.length - 2];
                            stack[stack.length - 2] = value;
                            break;
                        case 48 /* PUSHSCOPE */:
                            scopes.push(sec.box(stack.pop()), false);
                            break;
                        case 28 /* PUSHWITH */:
                            scopes.push(sec.box(stack.pop()), true);
                            break;
                        case 49 /* PUSHNAMESPACE */:
                            stack.push(sec.AXNamespace.FromNamespace(abc.getNamespace(frame.u30())));
                            break;
                        case 64 /* NEWFUNCTION */:
                            stack.push(sec.createFunction(abc.getMethodInfo(frame.u30()), scopes.topScope(), true));
                            break;
                        case 65 /* CALL */:
                            popManyInto(stack, frame.u30(), args);
                            object = stack.pop();
                            value = stack[stack.length - 1];
                            AVMX.validateCall(sec, value, args.length);
                            stack[stack.length - 1] = value.axApply(object, args);
                            break;
                        case 66 /* CONSTRUCT */:
                            popManyInto(stack, frame.u30(), args);
                            receiver = sec.box(frame.peekStack());
                            AVMX.validateConstruct(sec, receiver, args.length);
                            stack[stack.length - 1] = receiver.axConstruct(args);
                            break;
                        case 71 /* RETURNVOID */:
                            release || assert(AVMX.scopeStacks.length === scopeStacksHeight + 1);
                            AVMX.scopeStacks.length--;
                            return;
                        case 72 /* RETURNVALUE */:
                            value = stack.pop();
                            // TODO: ensure proper unwinding of the scope stack.
                            if (methodInfo.returnTypeNameIndex) {
                                receiver = methodInfo.getType();
                                if (receiver) {
                                    value = receiver.axCoerce(value);
                                }
                            }
                            release || assert(AVMX.scopeStacks.length === scopeStacksHeight + 1);
                            AVMX.scopeStacks.length--;
                            return value;
                        case 73 /* CONSTRUCTSUPER */:
                            popManyInto(stack, frame.u30(), args);
                            savedScope.object.superClass.tPrototype.axInitializer.apply(stack.pop(), args);
                            break;
                        case 74 /* CONSTRUCTPROP */:
                            index = frame.u30();
                            popManyInto(stack, frame.u30(), args);
                            popNameInto(stack, abc.getMultiname(index), rn);
                            receiver = sec.box(frame.peekStack());
                            stack[stack.length - 1] = receiver.axConstructProperty(rn, args);
                            break;
                        case 76 /* CALLPROPLEX */:
                        case 70 /* CALLPROPERTY */:
                        case 79 /* CALLPROPVOID */:
                            index = frame.u30();
                            argCount = frame.u30();
                            popManyInto(stack, argCount, args);
                            popNameInto(stack, abc.getMultiname(index), rn);
                            receiver = sec.box(stack[stack.length - 1]);
                            result = receiver.axCallProperty(rn, args, bc === 76 /* CALLPROPLEX */);
                            if (bc === 79 /* CALLPROPVOID */) {
                                stack.length--;
                            }
                            else {
                                stack[stack.length - 1] = result;
                            }
                            break;
                        case 69 /* CALLSUPER */:
                        case 78 /* CALLSUPERVOID */:
                            index = frame.u30();
                            argCount = frame.u30();
                            popManyInto(stack, argCount, args);
                            popNameInto(stack, abc.getMultiname(index), rn);
                            receiver = sec.box(stack[stack.length - 1]);
                            result = receiver.axCallSuper(rn, savedScope, args);
                            if (bc === 78 /* CALLSUPERVOID */) {
                                stack.length--;
                            }
                            else {
                                stack[stack.length - 1] = result;
                            }
                            break;
                        //case Bytecode.CALLSTATIC:
                        //  index = frame.u30();
                        //  argCount = frame.u30();
                        //  popManyInto(stack, argCount, args);
                        //  value = abc.getMetadataInfo(index);
                        //  var receiver = box(stack[stack.length - 1]);
                        //  stack.push(value.axApply(receiver, args));
                        //  break;
                        case 83 /* APPLYTYPE */:
                            popManyInto(stack, frame.u30(), args);
                            stack[stack.length - 1] = sec.applyType(stack[stack.length - 1], args);
                            break;
                        case 85 /* NEWOBJECT */:
                            object = Object.create(sec.AXObject.tPrototype);
                            argCount = frame.u30();
                            // For LIFO-order iteration to be correct, we have to add items highest on the stack
                            // first.
                            for (var i = stack.length - argCount * 2; i < stack.length; i += 2) {
                                value = stack[i + 1];
                                object.axSetPublicProperty(stack[i], value);
                            }
                            stack.length -= argCount * 2;
                            stack.push(object);
                            break;
                        case 86 /* NEWARRAY */:
                            object = [];
                            argCount = frame.u30();
                            for (var i = stack.length - argCount; i < stack.length; i++) {
                                object.push(stack[i]);
                            }
                            stack.length -= argCount;
                            stack.push(sec.AXArray.axBox(object));
                            break;
                        case 87 /* NEWACTIVATION */:
                            stack.push(sec.createActivation(methodInfo, scopes.topScope()));
                            break;
                        case 88 /* NEWCLASS */:
                            // Storing super class in `value` to make exception handling easier.
                            value = stack[stack.length - 1];
                            stack[stack.length - 1] = sec.createClass(abc.classes[frame.u30()], value, scopes.topScope());
                            break;
                        case 89 /* GETDESCENDANTS */:
                            popNameInto(stack, abc.getMultiname(frame.u30()), rn);
                            if (rn.name === undefined) {
                                rn.name = '*';
                            }
                            result = AVMX.axGetDescendants(stack[stack.length - 1], rn, sec);
                            release || AVMX.checkValue(result);
                            stack[stack.length - 1] = result;
                            break;
                        case 90 /* NEWCATCH */:
                            stack.push(sec.createCatch(frame.body.catchBlocks[frame.u30()], scopes.topScope()));
                            break;
                        case 94 /* FINDPROPERTY */:
                        case 93 /* FINDPROPSTRICT */:
                            popNameInto(stack, abc.getMultiname(frame.u30()), rn);
                            stack.push(scopes.topScope().findScopeProperty(rn, bc === 93 /* FINDPROPSTRICT */, false));
                            break;
                        case 96 /* GETLEX */:
                            popNameInto(stack, abc.getMultiname(frame.u30()), rn);
                            object = scopes.topScope().findScopeProperty(rn, true, false);
                            result = object.axGetProperty(rn);
                            release || AVMX.checkValue(result);
                            stack.push(result);
                            break;
                        case 104 /* INITPROPERTY */:
                        case 97 /* SETPROPERTY */:
                            value = stack.pop();
                            popNameInto(stack, abc.getMultiname(frame.u30()), rn);
                            receiver = sec.box(stack.pop());
                            receiver.axSetProperty(rn, value, 104 /* INITPROPERTY */, methodInfo);
                            break;
                        case 102 /* GETPROPERTY */:
                            popNameInto(stack, abc.getMultiname(frame.u30()), rn);
                            receiver = sec.box(frame.peekStack());
                            result = receiver.axGetProperty(rn);
                            release || AVMX.checkValue(result);
                            stack[stack.length - 1] = result;
                            break;
                        case 106 /* DELETEPROPERTY */:
                            popNameInto(stack, abc.getMultiname(frame.u30()), rn);
                            receiver = sec.box(frame.peekStack());
                            stack[stack.length - 1] = receiver.axDeleteProperty(rn);
                            break;
                        case 4 /* GETSUPER */:
                            popNameInto(stack, abc.getMultiname(frame.u30()), rn);
                            receiver = sec.box(frame.peekStack());
                            result = receiver.axGetSuper(rn, savedScope);
                            release || AVMX.checkValue(result);
                            stack[stack.length - 1] = result;
                            break;
                        case 5 /* SETSUPER */:
                            value = stack.pop();
                            popNameInto(stack, abc.getMultiname(frame.u30()), rn);
                            receiver = sec.box(stack.pop());
                            receiver.axSetSuper(rn, savedScope, value);
                            break;
                        case 98 /* GETLOCAL */:
                            stack.push(locals[frame.u30()]);
                            break;
                        case 99 /* SETLOCAL */:
                            locals[frame.u30()] = stack.pop();
                            break;
                        case 100 /* GETGLOBALSCOPE */:
                            stack.push(savedScope.global.object);
                            break;
                        case 101 /* GETSCOPEOBJECT */:
                            stack.push(scopes.get(frame.code[frame.pc++]));
                            break;
                        case 108 /* GETSLOT */:
                            receiver = sec.box(frame.peekStack());
                            result = receiver.axGetSlot(frame.u30());
                            release || AVMX.checkValue(result);
                            stack[stack.length - 1] = result;
                            break;
                        case 109 /* SETSLOT */:
                            value = stack.pop();
                            receiver = sec.box(stack.pop());
                            receiver.axSetSlot(frame.u30(), value);
                            break;
                        case 110 /* GETGLOBALSLOT */:
                            result = savedScope.global.object.axGetSlot(frame.u30());
                            release || AVMX.checkValue(result);
                            stack[stack.length - 1] = result;
                            break;
                        case 111 /* SETGLOBALSLOT */:
                            value = stack.pop();
                            savedScope.global.object.axSetSlot(frame.u30(), value);
                            break;
                        case 114 /* ESC_XATTR */:
                            stack[stack.length - 1] = AVMX.AS.escapeAttributeValue(stack[stack.length - 1]);
                            break;
                        case 113 /* ESC_XELEM */:
                            stack[stack.length - 1] = AVMX.AS.escapeElementValue(sec, stack[stack.length - 1]);
                            break;
                        case 131 /* COERCE_I */:
                        case 115 /* CONVERT_I */:
                            stack[stack.length - 1] |= 0;
                            break;
                        case 136 /* COERCE_U */:
                        case 116 /* CONVERT_U */:
                            stack[stack.length - 1] >>>= 0;
                            break;
                        case 132 /* COERCE_D */:
                        case 117 /* CONVERT_D */:
                            stack[stack.length - 1] = +stack[stack.length - 1];
                            break;
                        case 129 /* COERCE_B */:
                        case 118 /* CONVERT_B */:
                            stack[stack.length - 1] = !!stack[stack.length - 1];
                            break;
                        case 133 /* COERCE_S */:
                            stack[stack.length - 1] = AVMX.axCoerceString(stack[stack.length - 1]);
                            break;
                        case 112 /* CONVERT_S */:
                            stack[stack.length - 1] = AVMX.axConvertString(stack[stack.length - 1]);
                            break;
                        case 120 /* CHECKFILTER */:
                            stack[stack.length - 1] = AVMX.axCheckFilter(sec, stack[stack.length - 1]);
                            break;
                        case 128 /* COERCE */:
                            popNameInto(stack, abc.getMultiname(frame.u30()), rn);
                            receiver = scopes.topScope().getScopeProperty(rn, true, false);
                            stack[stack.length - 1] = receiver.axCoerce(stack[stack.length - 1]);
                            break;
                        case 130 /* COERCE_A */:
                            break;
                        case 134 /* ASTYPE */:
                            popNameInto(stack, abc.getMultiname(frame.u30()), rn);
                            receiver = scopes.topScope().getScopeProperty(rn, true, false);
                            stack[stack.length - 2] = receiver.axAsType(stack[stack.length - 1]);
                            break;
                        case 135 /* ASTYPELATE */:
                            receiver = stack.pop();
                            stack[stack.length - 1] = receiver.axAsType(stack[stack.length - 1]);
                            break;
                        case 137 /* COERCE_O */:
                            object = stack[stack.length - 1];
                            stack[stack.length - 1] = object == undefined ? null : object;
                            break;
                        case 144 /* NEGATE */:
                            stack[stack.length - 1] = -stack[stack.length - 1];
                            break;
                        case 145 /* INCREMENT */:
                            ++stack[stack.length - 1];
                            break;
                        case 146 /* INCLOCAL */:
                            ++locals[frame.u30()];
                            break;
                        case 147 /* DECREMENT */:
                            --stack[stack.length - 1];
                            break;
                        case 148 /* DECLOCAL */:
                            --locals[frame.u30()];
                            break;
                        case 149 /* TYPEOF */:
                            stack[stack.length - 1] = AVMX.axTypeOf(stack[stack.length - 1], sec);
                            break;
                        case 150 /* NOT */:
                            stack[stack.length - 1] = !stack[stack.length - 1];
                            break;
                        case 151 /* BITNOT */:
                            stack[stack.length - 1] = ~stack[stack.length - 1];
                            break;
                        case 160 /* ADD */:
                            b = stack.pop();
                            a = stack[stack.length - 1];
                            if (typeof a === "number" && typeof b === "number") {
                                stack[stack.length - 1] = a + b;
                            }
                            else {
                                stack[stack.length - 1] = AVMX.axAdd(a, b, sec);
                            }
                            break;
                        case 161 /* SUBTRACT */:
                            stack[stack.length - 2] -= stack.pop();
                            break;
                        case 162 /* MULTIPLY */:
                            stack[stack.length - 2] *= stack.pop();
                            break;
                        case 163 /* DIVIDE */:
                            stack[stack.length - 2] /= stack.pop();
                            break;
                        case 164 /* MODULO */:
                            stack[stack.length - 2] %= stack.pop();
                            break;
                        case 165 /* LSHIFT */:
                            stack[stack.length - 2] <<= stack.pop();
                            break;
                        case 166 /* RSHIFT */:
                            stack[stack.length - 2] >>= stack.pop();
                            break;
                        case 167 /* URSHIFT */:
                            stack[stack.length - 2] >>>= stack.pop();
                            break;
                        case 168 /* BITAND */:
                            stack[stack.length - 2] &= stack.pop();
                            break;
                        case 169 /* BITOR */:
                            stack[stack.length - 2] |= stack.pop();
                            break;
                        case 170 /* BITXOR */:
                            stack[stack.length - 2] ^= stack.pop();
                            break;
                        case 171 /* EQUALS */:
                            a = stack[stack.length - 2];
                            b = stack.pop();
                            stack[stack.length - 1] = AVMX.axEquals(a, b, sec);
                            break;
                        case 172 /* STRICTEQUALS */:
                            stack[stack.length - 2] = stack[stack.length - 2] === stack.pop();
                            break;
                        case 173 /* LESSTHAN */:
                            stack[stack.length - 2] = stack[stack.length - 2] < stack.pop();
                            break;
                        case 174 /* LESSEQUALS */:
                            stack[stack.length - 2] = stack[stack.length - 2] <= stack.pop();
                            break;
                        case 175 /* GREATERTHAN */:
                            stack[stack.length - 2] = stack[stack.length - 2] > stack.pop();
                            break;
                        case 176 /* GREATEREQUALS */:
                            stack[stack.length - 2] = stack[stack.length - 2] >= stack.pop();
                            break;
                        case 177 /* INSTANCEOF */:
                            receiver = stack.pop();
                            stack[stack.length - 1] = receiver.axIsInstanceOf(stack[stack.length - 1]);
                            break;
                        case 178 /* ISTYPE */:
                            popNameInto(stack, abc.getMultiname(frame.u30()), rn);
                            receiver = scopes.topScope().findScopeProperty(rn, true, false);
                            stack[stack.length - 1] = receiver.axIsType(stack[stack.length - 1]);
                            break;
                        case 179 /* ISTYPELATE */:
                            receiver = stack.pop();
                            stack[stack.length - 1] = receiver.axIsType(stack[stack.length - 1]);
                            break;
                        case 180 /* IN */:
                            receiver = sec.box(stack.pop());
                            var name = stack[stack.length - 1];
                            if (name && name.axClass === sec.AXQName) {
                                stack[stack.length - 1] = receiver.axHasProperty(name.name);
                            }
                            else {
                                stack[stack.length - 1] = receiver.axHasPublicProperty(name);
                            }
                            break;
                        case 192 /* INCREMENT_I */:
                            stack[stack.length - 1] = (stack[stack.length - 1] | 0) + 1;
                            break;
                        case 193 /* DECREMENT_I */:
                            stack[stack.length - 1] = (stack[stack.length - 1] | 0) - 1;
                            break;
                        case 194 /* INCLOCAL_I */:
                            index = frame.u30();
                            locals[index] = (locals[index] | 0) + 1;
                            break;
                        case 195 /* DECLOCAL_I */:
                            index = frame.u30();
                            locals[index] = (locals[index] | 0) - 1;
                            break;
                        case 196 /* NEGATE_I */:
                            stack[stack.length - 1] = -(stack[stack.length - 1] | 0);
                            break;
                        case 197 /* ADD_I */:
                            stack[stack.length - 2] = (stack[stack.length - 2] | 0) + (stack.pop() | 0) | 0;
                            break;
                        case 198 /* SUBTRACT_I */:
                            stack[stack.length - 2] = (stack[stack.length - 2] | 0) - (stack.pop() | 0) | 0;
                            break;
                        case 199 /* MULTIPLY_I */:
                            stack[stack.length - 2] = (stack[stack.length - 2] | 0) * (stack.pop() | 0) | 0;
                            break;
                        case 208 /* GETLOCAL0 */:
                        case 209 /* GETLOCAL1 */:
                        case 210 /* GETLOCAL2 */:
                        case 211 /* GETLOCAL3 */:
                            stack.push(locals[bc - 208 /* GETLOCAL0 */]);
                            break;
                        case 212 /* SETLOCAL0 */:
                        case 213 /* SETLOCAL1 */:
                        case 214 /* SETLOCAL2 */:
                        case 215 /* SETLOCAL3 */:
                            locals[bc - 212 /* SETLOCAL0 */] = stack.pop();
                            break;
                        case 6 /* DXNS */:
                            scopes.topScope().defaultNamespace = AVMX.internNamespace(0 /* Public */, abc.getString(frame.u30()));
                            break;
                        case 7 /* DXNSLATE */:
                            scopes.topScope().defaultNamespace = AVMX.internNamespace(0 /* Public */, stack.pop());
                            break;
                        case 239 /* DEBUG */:
                            frame.pc++;
                            frame.u30();
                            frame.pc++;
                            frame.u30();
                            break;
                        case 240 /* DEBUGLINE */:
                        case 241 /* DEBUGFILE */:
                            frame.u30();
                            break;
                        case 2 /* NOP */:
                        case 1 /* BKPT */:
                            break;
                        default:
                            Shumway.Debug.notImplemented(AVMX.getBytecodeName(bc));
                    }
                }
                catch (e) {
                    // TODO: e = translateError(e);
                    // All script exceptions must be primitive or have a security domain, if they don't then
                    // this must be a VM exception.
                    if (!AVMX.isValidASValue(e)) {
                        // We omit many checks in the interpreter loop above to keep the code small. These
                        // checks can be done after the fact here by turning the VM-internal exception into a
                        // proper error according to the current operation.
                        e = createValidException(sec, e, bc, value, receiver, a, b, rn, scopeStacksHeight + 1);
                    }
                    var catchBlocks = frame.body.catchBlocks;
                    for (var i = 0; i < catchBlocks.length; i++) {
                        var handler = catchBlocks[i];
                        if (frame.pc >= handler.start && frame.pc <= handler.end) {
                            var typeName = handler.getType();
                            if (!typeName || frame.app.getClass(typeName).axIsType(e)) {
                                stack.length = 0;
                                stack.push(e);
                                scopes.clear();
                                frame.pc = handler.target;
                                continue interpretLabel;
                            }
                        }
                    }
                    release || assert(AVMX.scopeStacks.length === scopeStacksHeight + 1);
                    AVMX.scopeStacks.length--;
                    throw e;
                }
            }
        }
        function createValidException(sec, internalError, bc, value, receiver, a, b, mn, expectedScopeStacksHeight) {
            var isProperErrorObject = internalError instanceof Error &&
                typeof internalError.name === 'string' &&
                typeof internalError.message === 'string';
            if (isProperErrorObject) {
                if (internalError instanceof RangeError || internalError.name === 'InternalError') {
                    var obj = Object.create(sec.AXError.tPrototype);
                    obj._errorID = 1023;
                    // Stack exhaustion errors are annoying to catch: Identifying them requires
                    // pattern-matching of error messages, and throwing them must be done very
                    // carefully to not cause the next one.
                    if (internalError.message === 'allocation size overflow') {
                        obj.$Bgmessage = "allocation size overflow";
                        return obj;
                    }
                    if (internalError.message.indexOf('recursion') > -1 ||
                        internalError.message.indexOf('call stack size exceeded') > -1) {
                        obj.$Bgmessage = "Stack overflow occurred";
                        AVMX.scopeStacks.length = expectedScopeStacksHeight;
                        return obj;
                    }
                }
                else if (internalError instanceof TypeError) {
                    if (internalError.message.indexOf("convert") > -1 &&
                        (internalError.message.indexOf("to primitive") > -1 ||
                            internalError.message.indexOf("to string") > -1)) {
                        return sec.createError('TypeError', AVMX.Errors.ConvertToPrimitiveError, 'value');
                    }
                    // Internal error thrown by generic Array methods.
                    if (internalError.message === 'Conversion to Array failed') {
                        return sec.createError('TypeError', AVMX.Errors.CheckTypeFailedError, 'value', 'Array');
                    }
                }
            }
            var message;
            var isSuper = false;
            switch (bc) {
                case 65 /* CALL */:
                    if (!value || !value.axApply) {
                        return sec.createError('TypeError', AVMX.Errors.CallOfNonFunctionError, 'value');
                    }
                    break;
                case 66 /* CONSTRUCT */:
                    if (!receiver || !receiver.axConstruct) {
                        return sec.createError('TypeError', AVMX.Errors.ConstructOfNonFunctionError);
                    }
                    break;
                case 88 /* NEWCLASS */:
                    if (!value || !sec.AXClass.axIsType(value)) {
                        return sec.createError('VerifyError', AVMX.Errors.InvalidBaseClassError);
                    }
                    break;
                case 78 /* CALLSUPERVOID */:
                case 73 /* CONSTRUCTSUPER */:
                    isSuper = true;
                // Fallthrough.
                case 70 /* CALLPROPERTY */:
                case 79 /* CALLPROPVOID */:
                case 76 /* CALLPROPLEX */:
                case 74 /* CONSTRUCTPROP */:
                case 69 /* CALLSUPER */:
                    if (receiver === null) {
                        return sec.createError('TypeError', AVMX.Errors.ConvertNullToObjectError);
                    }
                    if (receiver === undefined) {
                        return sec.createError('TypeError', AVMX.Errors.ConvertUndefinedToObjectError);
                    }
                    if (!(receiver.axResolveMultiname(mn) in receiver)) {
                        var axClass = isSuper ? receiver.axClass.superClass : receiver.axClass;
                        if (axClass.classInfo.instanceInfo.isSealed()) {
                            return sec.createError('ReferenceError', AVMX.Errors.ReadSealedError, mn.name, axClass.name.toFQNString(false));
                        }
                        return sec.createError('TypeError', isSuper ?
                            AVMX.Errors.ConstructOfNonFunctionError :
                            AVMX.Errors.CallOfNonFunctionError, mn.name);
                    }
                    if (isProperErrorObject && internalError.name === 'RangeError' &&
                        (internalError.message.indexOf('arguments array passed') > -1 ||
                            internalError.message.indexOf('call stack size') > -1)) {
                        return sec.createError('RangeError', AVMX.Errors.StackOverflowError);
                    }
                    break;
                case 4 /* GETSUPER */:
                    isSuper = true;
                // Fallthrough.
                case 102 /* GETPROPERTY */:
                    if (receiver === null) {
                        return sec.createError('TypeError', AVMX.Errors.ConvertNullToObjectError);
                    }
                    if (receiver === undefined) {
                        return sec.createError('TypeError', AVMX.Errors.ConvertUndefinedToObjectError);
                    }
                    break;
                case 104 /* INITPROPERTY */:
                case 97 /* SETPROPERTY */:
                    if (receiver === null) {
                        return sec.createError('TypeError', AVMX.Errors.ConvertNullToObjectError);
                    }
                    if (receiver === undefined) {
                        return sec.createError('TypeError', AVMX.Errors.ConvertUndefinedToObjectError);
                    }
                    var nm = receiver.axResolveMultiname(mn);
                    if (nm in receiver && getPropertyDescriptor(receiver, nm).writable === false) {
                        return sec.createError('ReferenceError', AVMX.Errors.ConstWriteError, nm, receiver.axClass.name.name);
                    }
                    break;
                case 177 /* INSTANCEOF */:
                    if (!receiver || !receiver.axIsInstanceOf) {
                        return sec.createError('TypeError', AVMX.Errors.CantUseInstanceofOnNonObjectError);
                    }
                    break;
                case 134 /* ASTYPE */:
                case 135 /* ASTYPELATE */:
                    // ASTYPE(LATE) have almost the same error messages as ISTYPE(LATE), but not *quite*.
                    if (receiver && !receiver.axAsType) {
                        return sec.createError('TypeError', AVMX.Errors.ConvertNullToObjectError);
                    }
                // Fallthrough.
                case 178 /* ISTYPE */:
                case 179 /* ISTYPELATE */:
                    if (receiver === null) {
                        return sec.createError('TypeError', AVMX.Errors.ConvertNullToObjectError);
                    }
                    if (receiver === undefined) {
                        return sec.createError('TypeError', AVMX.Errors.ConvertUndefinedToObjectError);
                    }
                    if (!receiver.axIsType) {
                        return sec.createError('TypeError', AVMX.Errors.IsTypeMustBeClassError);
                    }
                    break;
                case 128 /* COERCE */:
                    if (!receiver) {
                        return sec.createError('ReferenceError', AVMX.Errors.ClassNotFoundError, mn.toFQNString(false));
                    }
                    break;
                case 180 /* IN */:
                    if (receiver === null) {
                        return sec.createError('TypeError', AVMX.Errors.ConvertNullToObjectError);
                    }
                    if (receiver === undefined) {
                        return sec.createError('TypeError', AVMX.Errors.ConvertUndefinedToObjectError);
                    }
                    break;
                case 19 /* IFEQ */:
                case 20 /* IFNE */:
                case 171 /* EQUALS */:
                    if (typeof a !== typeof b) {
                        if (typeof a === 'object' && a && typeof b !== 'object' ||
                            typeof b === 'object' && b && typeof a !== 'object') {
                            return sec.createError('TypeError', AVMX.Errors.ConvertToPrimitiveError, 'Object');
                        }
                    }
                    break;
                default:
                    // Pattern-match some otherwise-annoying-to-convert exceptions. This is all best-effort,
                    // so we fail if we're not sure about something.
                    if (!internalError || typeof internalError.message !== 'string' ||
                        typeof internalError.stack !== 'string' ||
                        typeof internalError.name !== 'string') {
                        break;
                    }
                    message = internalError.message;
                    var stack = internalError.stack.split('\n');
                    var lastFunctionEntry = stack[0].indexOf('at ') === 0 ? stack[0].substr(3) : stack[0];
                    switch (internalError.name) {
                        case 'TypeError':
                            if (lastFunctionEntry.indexOf('AXBasePrototype_valueOf') === 0 ||
                                lastFunctionEntry.indexOf('AXBasePrototype_toString') === 0) {
                                return sec.createError('TypeError', AVMX.Errors.CallOfNonFunctionError, 'value');
                            }
                    }
            }
            // To be sure we don't let VM exceptions flow into the player, box them manually here,
            // even in release builds.
            message = 'Uncaught VM-internal exception during op ' + AVMX.getBytecodeName(bc) + ': ';
            var stack;
            try {
                message += internalError.toString();
                stack = internalError.stack;
            }
            catch (e) {
                message += '[Failed to stringify exception]';
            }
            // In the extension, we can just kill all the things.
            var player = sec['player'];
            console.error(message, '\n', stack);
            if (player) {
            }
            // In other packagings, at least throw a valid value.
            return sec.createError('Error', AVMX.Errors.InternalErrorIV);
        }
        function stringifyStackEntry(x) {
            if (!x || !x.toString) {
                return String(x);
            }
            if (x.$BgtoString && x.$BgtoString.isInterpreted) {
                return '<unprintable ' + (x.axClass ? x.axClass.name.toFQNString(false) : 'object') + '>';
            }
            try {
                return x.toString();
            }
            catch (e) {
                return '<unprintable ' + (x.axClass ? x.axClass.name.toFQNString(false) : 'object') + '>';
            }
        }
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
var $ = null;
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        /*
         *     +--------------------------+
         *     |      Base Prototype      |
         *     +--------------------------+
         *     |- axHasPropertyInternal   |
         *     |- axHasProperty           |            +-------------------+
         *     |- axSetProperty           |     +-----#|  objectPrototype  |
         *     |- axGetProperty           |     |      +-------------------+
         *     |- axSetPublicProperty     |     |      | - sec             |
         *     |- axGetSlot               |<----+      +-------------------+
         *     |- axSetSlot               |     |
         *     |  …                       |     |
         *     |                          |     |      +-------------------+
         *     |                          |     +-----#|  objectPrototype  |
         *     |                          |            +-------------------+
         *     +--------------------------+            | - sec             |
         *                                             +-------------------+
         *                                                       ^
         *                                                       |
         *                                                       |
         *                                                       #
         *     +-----------------+                        +------------+
         *  +-#|  Class Object   |----------------------->| tPrototype |<-----------------<--------------------+
         *  |  +-----------------+                        +------------+                  |                    |
         *  |                                                    ^                        |                    |
         *  |                                                    |                        |                    |
         *  |                                                    |--------+               |                    |
         *  |                                                    |        |               #                    #
         *  |                         +------------+             |        |      +-----------------+  +-----------------+
         *  |                         | - traits   |             #        |      |     Number      |  |      Uint       |
         *  |  +-----------------+    +------------+      +------------+  |      +-----------------+  +-----------------+
         *  +-#|   Class Class   |--->| tPrototype |#---->| dPrototype |  |      | - value         |  | - value         |
         *  |  +-----------------+    +------------+      +------------+  |      +-----------------+  +-----------------+
         *  |                                ^                            |
         *  |                                |                            |      +-----------------+  +-----------------+
         *  +--------------------------------+----------------------------+-----#|     Boolean     |  |      Array      |
         *  |                                                             |      +-----------------+  +-----------------+
         *  |                                                             |      | - value         |  | - value         |
         *  |  +-----------------+    +------------+      +------------+  |      +-----------------+  +-----------------+
         *  +-#|     Class A     |--->| tPrototype |#---->| dPrototype |#-+
         *  |  +-----------------+    +------------+      +------------+         +-----------------+  +-----------------+
         *  |                         | - traits   |--+          ^               |       Int       |  |    Function     |
         *  |                         +------------+  |          |               +-----------------+  +-----------------+
         *  |                                ^        |          |               | - value         |  | - value         |
         *  |                                |        |          +--------+      +-----------------+  +-----------------+
         *  |                                #        |                   |
         *  |                         +------------+  |   +------------+  |      +-----------------+
         *  |                         |  Object A  |  +-->|   Traits   |  |      |     String      |
         *  |                         +------------+      +------------+  |      +-----------------+
         *  |                                                             |      | - value         |
         *  |                                                             |      +-----------------+
         *  |                                                             |
         *  |                                                             |
         *  |                                                             |
         *  |                                                             |
         *  |                                                             |
         *  | +-----------------+     +------------+      +------------+  |
         *  +#|Class B extends A|---->| tPrototype |#---->| dPrototype |#-+
         *    +-----------------+     +------------+      +------------+
         *                            | - traits   |
         *                            +------------+
         *
         */
        function validateCall(sec, fun, argc) {
            if (!fun || !fun.axApply) {
                sec.throwError('TypeError', AVMX.Errors.CallOfNonFunctionError, fun && fun.methodInfo ? fun.methodInfo.getName() : 'value');
            }
            if (fun.methodInfo && argc < fun.methodInfo.minArgs) {
                sec.throwError('ArgumentError', AVMX.Errors.WrongArgumentCountError, fun.methodInfo.getName(), fun.methodInfo.minArgs, argc);
            }
        }
        AVMX.validateCall = validateCall;
        function validateConstruct(sec, axClass, argc) {
            if (!axClass || !axClass.axConstruct) {
                var name = axClass && axClass.classInfo ?
                    axClass.classInfo.instanceInfo.getName().name :
                    'value';
                sec.throwError('TypeError', AVMX.Errors.ConstructOfNonFunctionError, name);
            }
            var methodInfo = axClass.classInfo.getInitializer();
            if (argc < methodInfo.minArgs) {
                sec.throwError('ArgumentError', AVMX.Errors.WrongArgumentCountError, axClass.classInfo.instanceInfo.getName().name, methodInfo.minArgs, argc);
            }
        }
        AVMX.validateConstruct = validateConstruct;
        function checkNullParameter(argument, name, sec) {
            if (argument == undefined) {
                sec.throwError('TypeError', AVMX.Errors.NullPointerError, name);
            }
        }
        AVMX.checkNullParameter = checkNullParameter;
        // REDUX: check if we need this now that we do arg checking at callsites.
        function checkParameterType(argument, name, type) {
            if (argument == null) {
                type.sec.throwError('TypeError', AVMX.Errors.NullPointerError, name);
            }
            if (!type.axIsType(argument)) {
                type.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, argument, type.classInfo.instanceInfo.getClassName());
            }
        }
        AVMX.checkParameterType = checkParameterType;
        function forEachPublicProperty(object, callbackfn, thisArg) {
            // REDUX: Do we need to walk the proto chain here?
            var properties = object.axGetEnumerableKeys();
            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                var value = object.axGetPublicProperty(property);
                callbackfn.call(thisArg, property, value);
            }
        }
        AVMX.forEachPublicProperty = forEachPublicProperty;
        (function (WriterFlags) {
            WriterFlags[WriterFlags["None"] = 0] = "None";
            WriterFlags[WriterFlags["Runtime"] = 1] = "Runtime";
            WriterFlags[WriterFlags["Execution"] = 2] = "Execution";
            WriterFlags[WriterFlags["Interpreter"] = 4] = "Interpreter";
        })(AVMX.WriterFlags || (AVMX.WriterFlags = {}));
        var WriterFlags = AVMX.WriterFlags;
        var writer = new Shumway.IndentingWriter(false, function (x) { dumpLine(x); });
        AVMX.runtimeWriter = null;
        AVMX.executionWriter = null;
        AVMX.interpreterWriter = null;
        function sliceArguments(args, offset) {
            return Array.prototype.slice.call(args, offset);
        }
        AVMX.sliceArguments = sliceArguments;
        function setWriters(flags) {
            AVMX.runtimeWriter = (flags & WriterFlags.Runtime) ? writer : null;
            AVMX.executionWriter = (flags & (WriterFlags.Execution | WriterFlags.Interpreter)) ? writer : null;
            AVMX.interpreterWriter = (flags & WriterFlags.Interpreter) ? writer : null;
        }
        AVMX.setWriters = setWriters;
        var assert = Shumway.Debug.assert;
        var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
        var defineReadOnlyProperty = Shumway.ObjectUtilities.defineReadOnlyProperty;
        function axBoxIdentity(args) {
            return args[0];
        }
        function axBoxPrimitive(value) {
            var boxed = Object.create(this.tPrototype);
            boxed.value = value;
            return boxed;
        }
        function ensureBoxedReceiver(sec, receiver, callable) {
            if (receiver && typeof receiver === 'object') {
                release || checkValue(receiver);
                return receiver;
            }
            var boxedReceiver = sec.box(receiver);
            // Boxing still leaves `null` and `undefined` unboxed, so return the current global instead.
            if (!boxedReceiver) {
                if (AVMX.scopeStacks.length) {
                    boxedReceiver = AVMX.scopeStacks[AVMX.scopeStacks.length - 1].topScope().global.object;
                }
                else if (callable.receiver) {
                    // If no scripts are on the stack (e.g., for ExternalInterface calls), use the function's
                    // own global.
                    boxedReceiver = callable.receiver.scope.global.object;
                }
            }
            return boxedReceiver;
        }
        AVMX.ensureBoxedReceiver = ensureBoxedReceiver;
        function axCoerceObject(x) {
            if (x == null) {
                return null;
            }
            return x;
        }
        function axApplyObject(_, args) {
            var x = args[0];
            if (x == null) {
                return Object.create(this.tPrototype);
            }
            return x;
        }
        function axConstructObject(args) {
            var x = args[0];
            if (x == null) {
                return Object.create(this.tPrototype);
            }
            return x;
        }
        function axCoerceInt(x) {
            return x | 0;
        }
        AVMX.axCoerceInt = axCoerceInt;
        function axCoerceUint(x) {
            return x >>> 0;
        }
        AVMX.axCoerceUint = axCoerceUint;
        function axCoerceNumber(x) {
            if (as3Compatibility) {
                if (typeof x === "string") {
                    return AVMX.AS.ASNumber.convertStringToDouble(x);
                }
                if (x && typeof x === "object") {
                    x = x.valueOf(); // Make sure to only call valueOf() once.
                    if (typeof x === "string") {
                        return AVMX.AS.ASNumber.convertStringToDouble(x);
                    }
                }
            }
            return +x;
        }
        AVMX.axCoerceNumber = axCoerceNumber;
        function axCoerceBoolean(x) {
            return !!x;
        }
        AVMX.axCoerceBoolean = axCoerceBoolean;
        /**
         * Similar to |toString| but returns |null| for |null| or |undefined| instead
         * of "null" or "undefined".
         */
        function axCoerceString(x) {
            if (typeof x === "string") {
                return x;
            }
            else if (x == undefined) {
                return null;
            }
            return x + '';
        }
        AVMX.axCoerceString = axCoerceString;
        /**
         * Same as |axCoerceString| except for returning "null" instead of |null| for
         * |null| or |undefined|, and calls |toString| instead of (implicitly) |valueOf|.
         */
        function axCoerceName(x) {
            if (typeof x === "string") {
                return x;
            }
            else if (x == undefined) {
                return 'null';
            }
            return x.toString();
        }
        AVMX.axCoerceName = axCoerceName;
        function axConvertString(x) {
            if (typeof x === "string") {
                return x;
            }
            return x + '';
        }
        AVMX.axConvertString = axConvertString;
        function axIsTypeNumber(x) {
            return typeof x === "number";
        }
        AVMX.axIsTypeNumber = axIsTypeNumber;
        function axIsTypeInt(x) {
            return typeof x === "number" && ((x | 0) === x);
        }
        AVMX.axIsTypeInt = axIsTypeInt;
        function axIsTypeUint(x) {
            return typeof x === "number" && ((x >>> 0) === x);
        }
        AVMX.axIsTypeUint = axIsTypeUint;
        function axIsTypeBoolean(x) {
            return typeof x === "boolean";
        }
        AVMX.axIsTypeBoolean = axIsTypeBoolean;
        function axIsTypeString(x) {
            return typeof x === "string";
        }
        AVMX.axIsTypeString = axIsTypeString;
        function axIsXMLCollection(x, sec) {
            return sec.AXXML.dPrototype.isPrototypeOf(x) ||
                sec.AXXMLList.dPrototype.isPrototypeOf(x);
        }
        function axGetDescendants(object, mn, sec) {
            if (!axIsXMLCollection(object, sec)) {
                sec.throwError('TypeError', AVMX.Errors.DescendentsError, object);
            }
            return object.descendants(mn);
        }
        AVMX.axGetDescendants = axGetDescendants;
        function axCheckFilter(sec, value) {
            if (!value || !AVMX.AS.isXMLCollection(sec, value)) {
                var className = value && value.axClass ? value.axClass.name.toFQNString(false) : '[unknown]';
                sec.throwError('TypeError', AVMX.Errors.FilterError, className);
            }
            return value;
        }
        AVMX.axCheckFilter = axCheckFilter;
        function axFalse() {
            return false;
        }
        AVMX.axFalse = axFalse;
        /**
         * Returns the current interpreter frame's callee.
         */
        function axGetArgumentsCallee() {
            var callee = this.callee;
            if (callee) {
                return callee;
            }
            release || assert(this.receiver);
            release || assert(this.methodInfo);
            if (this.methodInfo.trait === null) {
                console.error('arguments.callee used on trait-less methodInfo function. Probably a constructor');
                return null;
            }
            release || assert(this.methodInfo.trait);
            var mn = this.methodInfo.trait.name;
            var methodClosure = this.receiver.axGetProperty(mn);
            release || assert(this.sec.AXMethodClosure.tPrototype === Object.getPrototypeOf(methodClosure));
            return methodClosure;
        }
        function axDefaultCompareFunction(a, b) {
            return String(a).localeCompare(String(b));
        }
        AVMX.axDefaultCompareFunction = axDefaultCompareFunction;
        function axCompare(a, b, options, sortOrder, compareFunction) {
            release || Shumway.Debug.assertNotImplemented(!(options & 4 /* UNIQUESORT */), "UNIQUESORT");
            release || Shumway.Debug.assertNotImplemented(!(options & 8 /* RETURNINDEXEDARRAY */), "RETURNINDEXEDARRAY");
            var result = 0;
            if (options & 1 /* CASEINSENSITIVE */) {
                a = String(a).toLowerCase();
                b = String(b).toLowerCase();
            }
            if (options & 16 /* NUMERIC */) {
                a = +a;
                b = +b;
                result = a < b ? -1 : (a > b ? 1 : 0);
            }
            else {
                result = compareFunction(a, b);
            }
            return result * sortOrder;
        }
        AVMX.axCompare = axCompare;
        function axCompareFields(objA, objB, names, optionsList) {
            release || assert(names.length === optionsList.length);
            release || assert(names.length > 0);
            var result = 0;
            var i;
            for (i = 0; i < names.length && result === 0; i++) {
                var name = names[i];
                var a = objA[name];
                var b = objB[name];
                var options = optionsList[i];
                if (options & 1 /* CASEINSENSITIVE */) {
                    a = String(a).toLowerCase();
                    b = String(b).toLowerCase();
                }
                if (options & 16 /* NUMERIC */) {
                    a = +a;
                    b = +b;
                    result = a < b ? -1 : (a > b ? 1 : 0);
                }
                else {
                    result = String(a).localeCompare(String(b));
                }
            }
            if (optionsList[i - 1] & 2 /* DESCENDING */) {
                result *= -1;
            }
            return result;
        }
        AVMX.axCompareFields = axCompareFields;
        /**
         * ActionScript 3 has different behaviour when deciding whether to call toString or valueOf
         * when one operand is a string. Unlike JavaScript, it calls toString if one operand is a
         * string and valueOf otherwise. This sucks, but we have to emulate this behaviour because
         * YouTube depends on it.
         *
         * AS3 also overloads the `+` operator to concatenate XMLs/XMLLists instead of stringifying them.
         */
        function axAdd(l, r, sec) {
            release || assert(!(typeof l === "number" && typeof r === "number"), 'Inline number addition.');
            if (typeof l === "string" || typeof r === "string") {
                return String(l) + String(r);
            }
            if (AVMX.AS.isXMLCollection(sec, l) && AVMX.AS.isXMLCollection(sec, r)) {
                return AVMX.AS.ASXMLList.addXML(l, r);
            }
            return l + r;
        }
        AVMX.axAdd = axAdd;
        function axEquals(left, right, sec) {
            // See E4X spec, 11.5 Equality Operators for why this is required.
            if (AVMX.AS.isXMLType(left, sec)) {
                return left.equals(right);
            }
            if (AVMX.AS.isXMLType(right, sec)) {
                return right.equals(left);
            }
            return left == right;
        }
        AVMX.axEquals = axEquals;
        /**
         * These values are allowed to exist without being boxed.
         */
        function isPrimitiveJSValue(value) {
            return value === null || value === undefined || typeof value === "number" ||
                typeof value === "string" || typeof value === "boolean";
        }
        function isValidASValue(value) {
            return AVMX.AXBasePrototype.isPrototypeOf(value) || isPrimitiveJSValue(value);
        }
        AVMX.isValidASValue = isValidASValue;
        function checkValue(value) {
            if (!release) {
                if (!isValidASValue(value)) {
                    // Stringifying the value is potentially costly, so only do it if necessary,
                    // even in debug mode.
                    assert(false, "Value: " + value + " is not allowed to flow into AS3.");
                }
            }
        }
        AVMX.checkValue = checkValue;
        function axTypeOf(x, sec) {
            // ABC doesn't box primitives, so typeof returns the primitive type even when
            // the value is new'd
            if (x) {
                if (x.value) {
                    return typeof x.value;
                }
                if (axIsXMLCollection(x, sec)) {
                    return "xml";
                }
            }
            return typeof x;
        }
        AVMX.axTypeOf = axTypeOf;
        function axIsCallable(value) {
            return (value && typeof value.axApply === 'function');
        }
        AVMX.axIsCallable = axIsCallable;
        function axCoerce(x) {
            if (Shumway.isNullOrUndefined(x)) {
                return null;
            }
            if (!this.axIsType(x)) {
                this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, x, this.classInfo.instanceInfo.getClassName());
            }
            return x;
        }
        function axImplementsInterface(type) {
            var interfaces = this.classInfo.instanceInfo.getInterfaces(this.axClass);
            return interfaces.has(type);
        }
        function axIsTypeObject(x) {
            return this.dPrototype.isPrototypeOf(this.sec.box(x)) || x === this.dPrototype;
        }
        function axIsTypeInterface(x) {
            if (!x || typeof x !== 'object') {
                return false;
            }
            release || checkValue(x);
            return x.axImplementsInterface(this);
        }
        function axAsType(x) {
            return this.axIsType(x) ? x : null;
        }
        function axIsInstanceOfObject(x) {
            return this.dPrototype.isPrototypeOf(this.sec.box(x));
        }
        function axIsInstanceOfInterface(x) {
            return false;
        }
        var Scope = (function () {
            function Scope(parent, object, isWith) {
                if (isWith === void 0) { isWith = false; }
                this.parent = parent;
                this.object = object;
                this.global = parent ? parent.global : this;
                this.isWith = isWith;
                this.cache = [];
                this.defaultNamespace = null;
            }
            Scope.prototype.findDepth = function (object) {
                var current = this;
                var depth = 0;
                while (current) {
                    if (current.object === object) {
                        return depth;
                    }
                    depth++;
                    current = current.parent;
                }
                return -1;
            };
            Scope.prototype.getScopeObjects = function () {
                var objects = [];
                var current = this;
                while (current) {
                    objects.unshift(current.object);
                    current = current.parent;
                }
                return objects;
            };
            Scope.prototype.getScopeProperty = function (mn, strict, scopeOnly) {
                return this.findScopeProperty(mn, strict, scopeOnly).axGetProperty(mn);
            };
            Scope.prototype.findScopeProperty = function (mn, strict, scopeOnly) {
                // Multinames with a `null` name are the any name, '*'. Need to catch those here, because
                // otherwise we'll get a failing assert in `RuntimeTraits#getTrait` below.
                if (mn.name === null) {
                    this.global.object.sec.throwError('ReferenceError', AVMX.Errors.UndefinedVarError, '*');
                }
                var object;
                if (!scopeOnly && !mn.isRuntime()) {
                    if ((object = this.cache[mn.id])) {
                        return object;
                    }
                }
                // Scope lookups should not be trapped by proxies. Except for with scopes, check only trait
                // properties.
                if (this.object && (this.isWith ?
                    this.object.axHasPropertyInternal(mn) :
                    this.object.traits.getTrait(mn.namespaces, mn.name))) {
                    return (this.isWith || mn.isRuntime()) ? this.object : (this.cache[mn.id] = this.object);
                }
                if (this.parent) {
                    var object = this.parent.findScopeProperty(mn, strict, scopeOnly);
                    if (mn.kind === 7 /* QName */) {
                        this.cache[mn.id] = object;
                    }
                    return object;
                }
                if (scopeOnly) {
                    return null;
                }
                // Attributes can't be stored on globals or be directly defined in scripts.
                if (mn.isAttribute()) {
                    this.object.sec.throwError("ReferenceError", AVMX.Errors.UndefinedVarError, mn.name);
                }
                // If we can't find the property look in the domain.
                var globalObject = this.global.object;
                if ((object = globalObject.applicationDomain.findProperty(mn, strict, true))) {
                    return object;
                }
                // If we still haven't found it, look for dynamic properties on the global.
                // No need to do this for non-strict lookups as we'll end up returning the
                // global anyways.
                if (strict) {
                    if (!(mn.getPublicMangledName() in globalObject)) {
                        this.global.object.sec.throwError("ReferenceError", AVMX.Errors.UndefinedVarError, mn.name);
                    }
                }
                // Can't find it still, return the global object.
                return globalObject;
            };
            return Scope;
        })();
        AVMX.Scope = Scope;
        function applyTraits(object, traits) {
            release || assert(!object.hasOwnProperty("traits"));
            defineReadOnlyProperty(object, "traits", traits);
            var T = traits.getTraitsList();
            for (var i = 0; i < T.length; i++) {
                var t = T[i];
                var p = t;
                if (p.value instanceof AVMX.Namespace) {
                    // We can't call |object.sec.AXNamespace.FromNamespace(...)| because the
                    // AXNamespace class may not have been loaded yet. However, at this point we do have a
                    // valid reference to |object.sec.AXNamespace| because |prepareNativeClass| has
                    // been called.
                    p = { value: AVMX.AS.ASNamespace.FromNamespace.call(object.sec.AXNamespace, p.value) };
                }
                if (!release && (t.kind === 0 /* Slot */ || t.kind === 6 /* Const */)) {
                    checkValue(p.value);
                }
                Object.defineProperty(object, t.name.getMangledName(), p);
            }
        }
        AVMX.applyTraits = applyTraits;
        var D = defineNonEnumerableProperty;
        // The Object that's at the root of all AXObjects' prototype chain, regardless of their
        // SecurityDomain.
        AVMX.AXBasePrototype = null;
        function AXBasePrototype_$BgtoString() {
            // Dynamic prototypes just return [object Object], so we have to special-case them.
            // Since the dynamic object is the one holding the direct reference to `classInfo`,
            // we can check for that.
            var name = this.hasOwnProperty('classInfo') ?
                'Object' :
                this.classInfo.instanceInfo.name.name;
            return Shumway.StringUtilities.concat3("[object ", name, "]");
        }
        ;
        function AXBasePrototype_toString() {
            return this.$BgtoString.axCall(this);
        }
        ;
        function AXBasePrototype_$BgvalueOf() {
            return this;
        }
        ;
        function AXBasePrototype_valueOf() {
            return this.$BgvalueOf.axCall(this);
        }
        ;
        /**
         * Execute this lazily because we want to make sure the AS package is available.
         */
        function initializeAXBasePrototype() {
            if (AVMX.AXBasePrototype) {
                return;
            }
            var Op = AVMX.AS.ASObject.prototype;
            AVMX.AXBasePrototype = Object.create(null);
            D(AVMX.AXBasePrototype, "axHasPropertyInternal", Op.axHasPropertyInternal);
            D(AVMX.AXBasePrototype, "axHasProperty", Op.axHasProperty);
            D(AVMX.AXBasePrototype, "axSetProperty", Op.axSetProperty);
            D(AVMX.AXBasePrototype, "axHasProperty", Op.axHasProperty);
            D(AVMX.AXBasePrototype, "axHasPublicProperty", Op.axHasPublicProperty);
            D(AVMX.AXBasePrototype, "axSetPublicProperty", Op.axSetPublicProperty);
            D(AVMX.AXBasePrototype, "axGetPublicProperty", Op.axGetPublicProperty);
            D(AVMX.AXBasePrototype, "axCallPublicProperty", Op.axCallPublicProperty);
            D(AVMX.AXBasePrototype, "axDeletePublicProperty", Op.axDeletePublicProperty);
            D(AVMX.AXBasePrototype, "axGetProperty", Op.axGetProperty);
            D(AVMX.AXBasePrototype, "axDeleteProperty", Op.axDeleteProperty);
            D(AVMX.AXBasePrototype, "axGetSuper", Op.axGetSuper);
            D(AVMX.AXBasePrototype, "axSetSuper", Op.axSetSuper);
            D(AVMX.AXBasePrototype, "axSetSlot", Op.axSetSlot);
            D(AVMX.AXBasePrototype, "axGetSlot", Op.axGetSlot);
            D(AVMX.AXBasePrototype, "axCallProperty", Op.axCallProperty);
            D(AVMX.AXBasePrototype, "axCallSuper", Op.axCallSuper);
            D(AVMX.AXBasePrototype, "axConstructProperty", Op.axConstructProperty);
            D(AVMX.AXBasePrototype, "axResolveMultiname", Op.axResolveMultiname);
            D(AVMX.AXBasePrototype, "axNextNameIndex", Op.axNextNameIndex);
            D(AVMX.AXBasePrototype, "axNextName", Op.axNextName);
            D(AVMX.AXBasePrototype, "axNextValue", Op.axNextValue);
            D(AVMX.AXBasePrototype, "axGetEnumerableKeys", Op.axGetEnumerableKeys);
            D(AVMX.AXBasePrototype, "axImplementsInterface", axImplementsInterface);
            // Dummy traits object so Object.prototype lookups succeed.
            D(AVMX.AXBasePrototype, "traits", new AVMX.RuntimeTraits(null, null, Object.create(null)));
            // Helper methods borrowed from Object.prototype.
            D(AVMX.AXBasePrototype, "isPrototypeOf", Object.prototype.isPrototypeOf);
            D(AVMX.AXBasePrototype, "hasOwnProperty", Object.prototype.hasOwnProperty);
            AVMX.AXBasePrototype.$BgtoString = AXBasePrototype_$BgtoString;
            AVMX.AXBasePrototype.toString = AXBasePrototype_toString;
            AVMX.AXBasePrototype.$BgvalueOf = AXBasePrototype_$BgvalueOf;
            AVMX.AXBasePrototype.valueOf = AXBasePrototype_valueOf;
        }
        // Add the |axApply| and |axCall| methods on the function prototype so that we can treat
        // Functions as AXCallables.
        Function.prototype.axApply = Function.prototype.apply;
        Function.prototype.axCall = Function.prototype.call;
        /**
         * Make sure we bottom out at the securityDomain's objectPrototype.
         */
        function safeGetPrototypeOf(object) {
            var axClass = object.axClass;
            if (!axClass || axClass === axClass.sec.AXObject) {
                return null;
            }
            var prototype = axClass.dPrototype;
            if (prototype === object) {
                prototype = axClass.superClass.dPrototype;
            }
            release || assert(prototype.sec);
            return prototype;
        }
        AVMX.safeGetPrototypeOf = safeGetPrototypeOf;
        var HasNext2Info = (function () {
            function HasNext2Info(object, index) {
                this.object = object;
                this.index = index;
                // ...
            }
            /**
             * Determine if the given object has any more properties after the specified |index| and if so,
             * return the next index or |zero| otherwise. If the |obj| has no more properties then continue
             * the search in
             * |obj.__proto__|. This function returns an updated index and object to be used during
             * iteration.
             *
             * the |for (x in obj) { ... }| statement is compiled into the following pseudo bytecode:
             *
             * index = 0;
             * while (true) {
             *   (obj, index) = hasNext2(obj, index);
             *   if (index) { #1
             *     x = nextName(obj, index); #2
             *   } else {
             *     break;
             *   }
             * }
             *
             * #1 If we return zero, the iteration stops.
             * #2 The spec says we need to get the nextName at index + 1, but it's actually index - 1, this
             * caused me two hours of my life that I will probably never get back.
             *
             * TODO: We can't match the iteration order semantics of Action Script, hopefully programmers
             * don't rely on it.
             */
            HasNext2Info.prototype.next = function (object, index) {
                if (Shumway.isNullOrUndefined(object)) {
                    this.index = 0;
                    this.object = null;
                    return;
                }
                else {
                    this.object = object;
                    this.index = index;
                }
                var nextIndex = object.axNextNameIndex(this.index);
                if (nextIndex > 0) {
                    this.index = nextIndex;
                    return;
                }
                // If there are no more properties in the object then follow the prototype chain.
                while (true) {
                    var object = safeGetPrototypeOf(object);
                    if (!object) {
                        this.index = 0;
                        this.object = null;
                        return;
                    }
                    nextIndex = object.axNextNameIndex(0);
                    if (nextIndex > 0) {
                        this.index = nextIndex;
                        this.object = object;
                        return;
                    }
                }
            };
            return HasNext2Info;
        })();
        AVMX.HasNext2Info = HasNext2Info;
        /**
         * Generic axConstruct method that lives on the AXClass prototype. This just
         * creates an empty object with the right prototype and then calls the
         * instance initializer.
         *
         * TODO: Flatten out the argArray, or create an alternate ax helper to
         * make object construction faster.
         */
        function axConstruct(argArray) {
            var object = Object.create(this.tPrototype);
            object.axInitializer.apply(object, argArray);
            return object;
        }
        /**
         * Default initializer.
         */
        function axDefaultInitializer() {
            // Nop.
        }
        /**
         * Throwing initializer for interfaces.
         */
        function axInterfaceInitializer() {
            this.sec.throwError("VerifierError", AVMX.Errors.NotImplementedError, this.name.name);
        }
        /**
         * Default axApply.
         */
        function axDefaultApply(self, args) {
            return this.axCoerce(args ? args[0] : undefined);
        }
        AVMX.scopeStacks = [];
        function getCurrentScope() {
            if (AVMX.scopeStacks.length === 0) {
                return null;
            }
            return AVMX.scopeStacks[AVMX.scopeStacks.length - 1].topScope();
        }
        AVMX.getCurrentScope = getCurrentScope;
        function getCurrentABC() {
            if (AVMX.scopeStacks.length === 0) {
                return null;
            }
            var globalObject = AVMX.scopeStacks[AVMX.scopeStacks.length - 1].topScope().global.object;
            return globalObject.scriptInfo.abc;
        }
        AVMX.getCurrentABC = getCurrentABC;
        /**
         * Provides security isolation between application domains.
         */
        var AXSecurityDomain = (function () {
            function AXSecurityDomain() {
                initializeAXBasePrototype();
                this.system = new AXApplicationDomain(this, null);
                this.application = new AXApplicationDomain(this, this.system);
                this.classAliases = new AVMX.ClassAliases();
                this.nativeClasses = Object.create(null);
                this.vectorClasses = new Map();
                this._catalogs = [];
            }
            Object.defineProperty(AXSecurityDomain.prototype, "xmlParser", {
                get: function () {
                    return this._xmlParser || (this._xmlParser = new AVMX.AS.XMLParser(this));
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AXSecurityDomain.prototype, "AXFunctionUndefinedPrototype", {
                get: function () {
                    return this._AXFunctionUndefinedPrototype ||
                        (this._AXFunctionUndefinedPrototype = this.createObject());
                },
                enumerable: true,
                configurable: true
            });
            AXSecurityDomain.prototype.addCatalog = function (abcCatalog) {
                this._catalogs.push(abcCatalog);
            };
            AXSecurityDomain.prototype.findDefiningABC = function (mn) {
                AVMX.runtimeWriter && AVMX.runtimeWriter.writeLn("findDefiningABC: " + mn);
                var abcFile = null;
                for (var i = 0; i < this._catalogs.length; i++) {
                    var abcCatalog = this._catalogs[i];
                    abcFile = abcCatalog.getABCByMultiname(mn);
                    if (abcFile) {
                        return abcFile;
                    }
                }
                return null;
            };
            AXSecurityDomain.prototype.throwError = function (className, error, replacement1, replacement2, replacement3, replacement4) {
                throw this.createError.apply(this, arguments);
            };
            AXSecurityDomain.prototype.createError = function (className, error, replacement1, replacement2, replacement3, replacement4) {
                var message = AVMX.formatErrorMessage.apply(null, sliceArguments(arguments, 1));
                var mn = AVMX.Multiname.FromFQNString(className, 0 /* Public */);
                var axClass = this.system.getProperty(mn, true, true);
                return axClass.axConstruct([message, error.code]);
            };
            AXSecurityDomain.prototype.applyType = function (axClass, types) {
                var vectorProto = this.ObjectVector.axClass.superClass.dPrototype;
                if (!vectorProto.isPrototypeOf(axClass.dPrototype)) {
                    this.throwError('TypeError', AVMX.Errors.TypeAppOfNonParamType);
                }
                if (types.length !== 1) {
                    this.throwError('TypeError', AVMX.Errors.WrongTypeArgCountError, '__AS3__.vec::Vector', 1, types.length);
                }
                var type = types[0] || this.AXObject;
                return this.getVectorClass(type);
            };
            AXSecurityDomain.prototype.getVectorClass = function (type) {
                var vectorClass = this.vectorClasses.get(type);
                if (vectorClass) {
                    return vectorClass;
                }
                var typeClassName = type ?
                    type.classInfo.instanceInfo.getName().getMangledName() :
                    '$BgObject';
                switch (typeClassName) {
                    case "$BgNumber":
                    case "$Bgdouble":
                        vectorClass = this.Float64Vector.axClass;
                        break;
                    case "$Bgint":
                        vectorClass = this.Int32Vector.axClass;
                        break;
                    case "$Bguint":
                        vectorClass = this.Uint32Vector.axClass;
                        break;
                    default:
                        vectorClass = this.createVectorClass(type);
                }
                this.vectorClasses.set(type, vectorClass);
                return vectorClass;
            };
            AXSecurityDomain.prototype.createVectorClass = function (type) {
                var genericVectorClass = this.ObjectVector.axClass;
                var axClass = Object.create(genericVectorClass);
                // Put the superClass tPrototype on the prototype chain so we have access
                // to all factory protocol handlers by default.
                axClass.tPrototype = Object.create(genericVectorClass.tPrototype);
                axClass.tPrototype.axClass = axClass;
                // We don't need a new dPrototype object.
                axClass.dPrototype = genericVectorClass.dPrototype;
                axClass.superClass = genericVectorClass;
                axClass.type = type;
                return axClass;
            };
            /**
             * Constructs a plain vanilla object in this security domain.
             */
            AXSecurityDomain.prototype.createObject = function () {
                return Object.create(this.AXObject.tPrototype);
            };
            /**
             * Takes a JS Object and transforms it into an AXObject.
             */
            AXSecurityDomain.prototype.createObjectFromJS = function (value, deep) {
                if (deep === void 0) { deep = false; }
                var keys = Object.keys(value);
                var result = this.createObject();
                for (var i = 0; i < keys.length; i++) {
                    var v = value[keys[i]];
                    if (deep) {
                        v = AVMX.AS.transformJSValueToAS(this, v, true);
                    }
                    result.axSetPublicProperty(keys[i], v);
                }
                return result;
            };
            /**
             * Constructs an AXArray in this security domain and sets its value to the given array.
             * Warning: This doesn't handle non-indexed keys.
             */
            AXSecurityDomain.prototype.createArrayUnsafe = function (value) {
                var array = Object.create(this.AXArray.tPrototype);
                array.value = value;
                if (!release) {
                    for (var k in value) {
                        assert(Shumway.isIndex(k));
                        checkValue(value[k]);
                    }
                }
                return array;
            };
            /**
             * Constructs an AXArray in this security domain and copies all enumerable properties of
             * the given array, setting them as public properties on the AXArray.
             * Warning: this does not use the given Array as the `value`.
             */
            AXSecurityDomain.prototype.createArray = function (value) {
                var array = this.createArrayUnsafe([]);
                for (var k in value) {
                    array.axSetPublicProperty(k, value[k]);
                    release || checkValue(value[k]);
                }
                array.length = value.length;
                return array;
            };
            /**
             * Constructs an AXFunction in this security domain and sets its value to the given function.
             */
            AXSecurityDomain.prototype.boxFunction = function (value) {
                var fn = Object.create(this.AXFunction.tPrototype);
                fn.value = value;
                return fn;
            };
            AXSecurityDomain.prototype.createClass = function (classInfo, superClass, scope) {
                var instanceInfo = classInfo.instanceInfo;
                var className = instanceInfo.getName().toFQNString(false);
                var axClass = this.nativeClasses[className] ||
                    Object.create(this.AXClass.tPrototype);
                var classScope = new Scope(scope, axClass);
                if (!this.nativeClasses[className]) {
                    if (instanceInfo.isInterface()) {
                        axClass.dPrototype = Object.create(this.objectPrototype);
                        axClass.tPrototype = Object.create(axClass.dPrototype);
                        axClass.tPrototype.axInitializer = axInterfaceInitializer;
                        axClass.axIsInstanceOf = axIsInstanceOfInterface;
                        axClass.axIsType = axIsTypeInterface;
                    }
                    else {
                        // For direct descendants of Object, we want the dynamic prototype to inherit from
                        // Object's tPrototype because Foo.prototype is always a proper instance of Object.
                        // For all other cases, the dynamic prototype should extend the parent class's
                        // dynamic prototype not the tPrototype.
                        if (superClass === this.AXObject) {
                            axClass.dPrototype = Object.create(this.objectPrototype);
                        }
                        else {
                            axClass.dPrototype = Object.create(superClass.dPrototype);
                        }
                        axClass.tPrototype = Object.create(axClass.dPrototype);
                        axClass.tPrototype.axInitializer = this.createInitializerFunction(classInfo, classScope);
                    }
                }
                else {
                    axClass.tPrototype.axInitializer = this.createInitializerFunction(classInfo, classScope);
                    // Native classes have their inheritance structure set up during initial SecurityDomain
                    // creation.
                    release || assert(axClass.dPrototype);
                    release || assert(axClass.tPrototype);
                }
                axClass.classInfo = axClass.dPrototype.classInfo = classInfo;
                axClass.dPrototype.axClass = axClass;
                axClass.superClass = superClass;
                axClass.scope = scope;
                // Object and Class have their traits initialized earlier to avoid circular dependencies.
                if (className !== 'Object' && className !== 'Class') {
                    this.initializeRuntimeTraits(axClass, superClass, classScope);
                }
                // Add the |constructor| property on the class dynamic prototype so that all instances can
                // get to their class constructor, and FooClass.prototype.constructor returns FooClass.
                defineNonEnumerableProperty(axClass.dPrototype, "$Bgconstructor", axClass);
                // Copy over all TS symbols.
                AVMX.AS.tryLinkNativeClass(axClass);
                // Run the static initializer.
                var initializer = classInfo.getInitializer();
                var initializerCode = initializer.getBody().code;
                // ... except if it's the standard class initializer that doesn't really do anything.
                if (initializerCode[0] !== 208 || initializerCode[1] !== 48 || initializerCode[2] !== 71) {
                    AVMX.interpret(axClass, initializer, classScope, [axClass], null);
                }
                return axClass;
            };
            AXSecurityDomain.prototype.initializeRuntimeTraits = function (axClass, superClass, scope) {
                var classInfo = axClass.classInfo;
                var instanceInfo = classInfo.instanceInfo;
                // Prepare class traits.
                var classTraits;
                if (axClass === this.AXClass) {
                    classTraits = instanceInfo.traits.resolveRuntimeTraits(null, null, scope);
                }
                else {
                    var rootClassTraits = this.AXClass.classInfo.instanceInfo.runtimeTraits;
                    release || assert(rootClassTraits);
                    // Class traits don't capture the class' scope. This is relevant because it allows
                    // referring to global names that would be shadowed if the class scope were active.
                    // Haxe's stdlib uses just such constructs, e.g. Std.parseFloat calls the global
                    // parseFloat.
                    classTraits = classInfo.traits.resolveRuntimeTraits(rootClassTraits, null, scope.parent);
                }
                classInfo.runtimeTraits = classTraits;
                applyTraits(axClass, classTraits);
                // Prepare instance traits.
                var superInstanceTraits = superClass ? superClass.classInfo.instanceInfo.runtimeTraits : null;
                var protectedNs = classInfo.abc.getNamespace(instanceInfo.protectedNs);
                var instanceTraits = instanceInfo.traits.resolveRuntimeTraits(superInstanceTraits, protectedNs, scope);
                instanceInfo.runtimeTraits = instanceTraits;
                applyTraits(axClass.tPrototype, instanceTraits);
            };
            AXSecurityDomain.prototype.createFunction = function (methodInfo, scope, hasDynamicScope) {
                var traceMsg = !release && Shumway.flashlog && methodInfo.trait ? methodInfo.toFlashlogString() : null;
                var fun = this.boxFunction(function () {
                    release || (traceMsg && Shumway.flashlog.writeAS3Trace(methodInfo.toFlashlogString()));
                    var self = this === jsGlobal ? scope.global.object : this;
                    return AVMX.interpret(self, methodInfo, scope, arguments, fun);
                });
                //fun.methodInfo = methodInfo;
                fun.receiver = { scope: scope };
                if (!release) {
                    try {
                        Object.defineProperty(fun.value, 'name', { value: methodInfo.getName() });
                    }
                    catch (e) {
                    }
                }
                return fun;
            };
            AXSecurityDomain.prototype.createInitializerFunction = function (classInfo, scope) {
                var methodInfo = classInfo.instanceInfo.getInitializer();
                var traceMsg = !release && Shumway.flashlog && methodInfo.trait ? methodInfo.toFlashlogString() : null;
                var fun = AVMX.AS.getNativeInitializer(classInfo);
                if (!fun) {
                    release || assert(!methodInfo.isNative(), "Must provide a native initializer for " +
                        classInfo.instanceInfo.getClassName());
                    fun = function () {
                        release || (traceMsg && Shumway.flashlog.writeAS3Trace(methodInfo.toFlashlogString()));
                        return AVMX.interpret(this, methodInfo, scope, arguments, null);
                    };
                    if (!release) {
                        try {
                            var className = classInfo.instanceInfo.getName().toFQNString(false);
                            Object.defineProperty(fun, 'name', { value: className });
                        }
                        catch (e) {
                        }
                    }
                    // REDUX: enable arg count checking on native ctors. Currently impossible because natives
                    // are frozen.
                    fun.methodInfo = methodInfo;
                }
                return fun;
            };
            AXSecurityDomain.prototype.createActivation = function (methodInfo, scope) {
                var body = methodInfo.getBody();
                if (!body.activationPrototype) {
                    body.traits.resolve();
                    body.activationPrototype = Object.create(this.AXActivationPrototype);
                    defineReadOnlyProperty(body.activationPrototype, "traits", body.traits.resolveRuntimeTraits(null, null, scope));
                }
                return Object.create(body.activationPrototype);
            };
            AXSecurityDomain.prototype.createCatch = function (exceptionInfo, scope) {
                if (!exceptionInfo.catchPrototype) {
                    var traits = exceptionInfo.getTraits();
                    exceptionInfo.catchPrototype = Object.create(this.AXCatchPrototype);
                    defineReadOnlyProperty(exceptionInfo.catchPrototype, "traits", traits.resolveRuntimeTraits(null, null, scope));
                }
                return Object.create(exceptionInfo.catchPrototype);
            };
            AXSecurityDomain.prototype.box = function (v) {
                if (v == undefined) {
                    return v;
                }
                if (AVMX.AXBasePrototype.isPrototypeOf(v)) {
                    return v;
                }
                if (v instanceof Array) {
                    return this.AXArray.axBox(v);
                }
                if (typeof v === "number") {
                    return this.AXNumber.axBox(v);
                }
                if (typeof v === "boolean") {
                    return this.AXBoolean.axBox(v);
                }
                if (typeof v === "string") {
                    return this.AXString.axBox(v);
                }
                assert(false, "Cannot box: " + v);
            };
            AXSecurityDomain.prototype.isPrimitive = function (v) {
                return isPrimitiveJSValue(v) || this.AXPrimitiveBox.dPrototype.isPrototypeOf(v);
            };
            AXSecurityDomain.prototype.createAXGlobal = function (applicationDomain, scriptInfo) {
                var global = Object.create(this.AXGlobalPrototype);
                global.applicationDomain = applicationDomain;
                global.scriptInfo = scriptInfo;
                var scope = global.scope = new Scope(null, global, false);
                var objectTraits = this.AXObject.classInfo.instanceInfo.runtimeTraits;
                var traits = scriptInfo.traits.resolveRuntimeTraits(objectTraits, null, scope);
                applyTraits(global, traits);
                return global;
            };
            /**
             * Prepares the dynamic Class prototype that all Class instances (including Class) have in
             * their prototype chain.
             *
             * This prototype defines the default hooks for all classes. Classes can override some or
             * all of them.
             */
            AXSecurityDomain.prototype.prepareRootClassPrototype = function () {
                var dynamicClassPrototype = Object.create(this.objectPrototype);
                var rootClassPrototype = Object.create(dynamicClassPrototype);
                rootClassPrototype.$BgtoString = function axClassToString() {
                    return "[class " + this.classInfo.instanceInfo.getName().name + "]";
                };
                var D = defineNonEnumerableProperty;
                D(rootClassPrototype, "axBox", axBoxIdentity);
                D(rootClassPrototype, "axCoerce", axCoerce);
                D(rootClassPrototype, "axIsType", axIsTypeObject);
                D(rootClassPrototype, "axAsType", axAsType);
                D(rootClassPrototype, "axIsInstanceOf", axIsInstanceOfObject);
                D(rootClassPrototype, "axConstruct", axConstruct);
                D(rootClassPrototype, "axApply", axDefaultApply);
                Object.defineProperty(rootClassPrototype, 'name', {
                    get: function () {
                        return this.classInfo.instanceInfo.name;
                    }
                });
                this.rootClassPrototype = rootClassPrototype;
            };
            AXSecurityDomain.prototype.initializeCoreNatives = function () {
                // Some facts:
                // - The Class constructor is itself an instance of Class.
                // - The Class constructor is an instance of Object.
                // - The Object constructor is an instance of Class.
                // - The Object constructor is an instance of Object.
                this.prepareRootClassPrototype();
                var AXClass = this.prepareNativeClass("AXClass", "Class", false);
                AXClass.classInfo = this.system.findClassInfo("Class");
                AXClass.defaultValue = null;
                var AXObject = this.prepareNativeClass("AXObject", "Object", false);
                AXObject.classInfo = this.system.findClassInfo("Object");
                var AXObject = this.AXObject;
                // AXFunction needs to exist for runtime trait resolution.
                var AXFunction = this.prepareNativeClass("AXFunction", "Function", false);
                defineNonEnumerableProperty(AXFunction, "axBox", axBoxPrimitive);
                // Initialization of the core classes' traits is a messy multi-step process:
                // First, create a scope for looking up all the things.
                var scope = new Scope(null, AXClass, false);
                // Then, create the runtime traits all Object instances share.
                var objectCI = this.AXObject.classInfo;
                var objectII = objectCI.instanceInfo;
                var objectRTT = objectII.runtimeTraits = objectII.traits.resolveRuntimeTraits(null, null, scope);
                applyTraits(this.AXObject.tPrototype, objectRTT);
                // Building on that, create the runtime traits all Class instances share.
                var classCI = this.AXClass.classInfo;
                var classII = classCI.instanceInfo;
                classII.runtimeTraits = classII.traits.resolveRuntimeTraits(objectRTT, null, scope);
                applyTraits(this.AXClass.tPrototype, classII.runtimeTraits);
                // As sort of a loose end, also create the one class trait Class itself has.
                classCI.runtimeTraits = classCI.traits.resolveRuntimeTraits(objectRTT, null, scope);
                applyTraits(this.AXClass, classCI.runtimeTraits);
                // Now we can create Object's runtime class traits.
                objectCI.runtimeTraits = objectCI.traits.resolveRuntimeTraits(classII.runtimeTraits, null, scope);
                applyTraits(this.AXObject, objectCI.runtimeTraits);
                return AXObject;
            };
            AXSecurityDomain.prototype.prepareNativeClass = function (exportName, name, isPrimitiveClass) {
                var axClass = Object.create(this.rootClassPrototype);
                // For Object and Class, we've already created the instance prototype to break
                // circular dependencies.
                if (name === 'Object') {
                    axClass.dPrototype = Object.getPrototypeOf(this.objectPrototype);
                    axClass.tPrototype = this.objectPrototype;
                }
                else if (name === 'Class') {
                    axClass.dPrototype = Object.getPrototypeOf(this.rootClassPrototype);
                    axClass.tPrototype = this.rootClassPrototype;
                }
                else {
                    var instancePrototype = isPrimitiveClass ?
                        this.AXPrimitiveBox.dPrototype :
                        exportName === 'AXMethodClosure' ?
                            this.AXFunction.dPrototype :
                            this.objectPrototype;
                    axClass.dPrototype = Object.create(instancePrototype);
                    axClass.tPrototype = Object.create(axClass.dPrototype);
                }
                this[exportName] = this.nativeClasses[name] = axClass;
                return axClass;
            };
            AXSecurityDomain.prototype.preparePrimitiveClass = function (exportName, name, convert, defaultValue, coerce, isType, isInstanceOf) {
                var axClass = this.prepareNativeClass(exportName, name, true);
                var D = defineNonEnumerableProperty;
                D(axClass, 'axBox', axBoxPrimitive);
                D(axClass, "axApply", function axApply(_, args) {
                    return convert(args && args.length ? args[0] : defaultValue);
                });
                D(axClass, "axConstruct", function axConstruct(args) {
                    return convert(args && args.length ? args[0] : defaultValue);
                });
                D(axClass, "axCoerce", coerce);
                D(axClass, "axIsType", isType);
                D(axClass, "axIsInstanceOf", isInstanceOf);
                D(axClass.dPrototype, "value", defaultValue);
                return axClass;
            };
            /**
             * Configures all the builtin Objects.
             */
            AXSecurityDomain.prototype.initialize = function () {
                var D = defineNonEnumerableProperty;
                // The basic dynamic prototype that all objects in this security domain have in common.
                var dynamicObjectPrototype = Object.create(AVMX.AXBasePrototype);
                dynamicObjectPrototype.sec = this;
                // The basic traits prototype that all objects in this security domain have in common.
                Object.defineProperty(this, 'objectPrototype', { value: Object.create(dynamicObjectPrototype) });
                this.initializeCoreNatives();
                // Debugging Helper
                release || (this.objectPrototype['trace'] = function trace() {
                    var self = this;
                    var writer = new Shumway.IndentingWriter();
                    this.traits.traits.forEach(function (t) {
                        writer.writeLn(t + ": " + self[t.getName().getMangledName()]);
                    });
                });
                this.AXGlobalPrototype = Object.create(this.objectPrototype);
                this.AXGlobalPrototype.$BgtoString = function () {
                    return '[object global]';
                };
                this.AXActivationPrototype = Object.create(this.objectPrototype);
                this.AXActivationPrototype.$BgtoString = function () {
                    return '[Activation]';
                };
                this.AXCatchPrototype = Object.create(this.objectPrototype);
                this.AXCatchPrototype.$BgtoString = function () {
                    return '[Catch]';
                };
                // The core classes' MOP hooks and dynamic prototype methods are defined
                // here to keep all the hooks initialization in one place.
                var AXObject = this.AXObject;
                var AXFunction = this.AXFunction;
                // Object(null) creates an object, and this behaves differently than:
                // (function (x: Object) { trace (x); })(null) which prints null.
                D(AXObject, "axApply", axApplyObject);
                D(AXObject, "axConstruct", axConstructObject);
                D(AXObject.tPrototype, "axInitializer", axDefaultInitializer);
                D(AXObject, "axCoerce", axCoerceObject);
                this.prepareNativeClass("AXMethodClosure", "builtin.as$0.MethodClosure", false);
                this.prepareNativeClass("AXError", "Error", false);
                this.prepareNativeClass("AXMath", "Math", false);
                this.prepareNativeClass("AXDate", "Date", false);
                this.prepareNativeClass("AXXML", "XML", false);
                this.prepareNativeClass("AXXMLList", "XMLList", false);
                this.prepareNativeClass("AXQName", "QName", false);
                this.prepareNativeClass("AXNamespace", "Namespace", false);
                var AXArray = this.prepareNativeClass("AXArray", "Array", false);
                D(AXArray, 'axBox', axBoxPrimitive);
                AXArray.tPrototype.$BgtoString = AXFunction.axBox(function () {
                    return this.value.toString();
                });
                // Array.prototype is an Array, and behaves like one.
                AXArray.dPrototype['value'] = [];
                this.argumentsPrototype = Object.create(this.AXArray.tPrototype);
                Object.defineProperty(this.argumentsPrototype, '$Bgcallee', { get: axGetArgumentsCallee });
                var AXRegExp = this.prepareNativeClass("AXRegExp", "RegExp", false);
                // RegExp.prototype is an (empty string matching) RegExp, and behaves like one.
                AXRegExp.dPrototype['value'] = /(?:)/;
                // Boolean, int, Number, String, and uint are primitives in AS3. We create a placeholder
                // base class to help us with instanceof tests.
                var AXPrimitiveBox = this.prepareNativeClass("AXPrimitiveBox", "PrimitiveBox", false);
                D(AXPrimitiveBox.dPrototype, '$BgtoString', AXFunction.axBox(function () { return this.value.toString(); }));
                var AXBoolean = this.preparePrimitiveClass("AXBoolean", "Boolean", axCoerceBoolean, false, axCoerceBoolean, axIsTypeBoolean, axIsTypeBoolean);
                var AXString = this.preparePrimitiveClass("AXString", "String", axConvertString, '', axCoerceString, axIsTypeString, axIsTypeString);
                var AXNumber = this.preparePrimitiveClass("AXNumber", "Number", axCoerceNumber, 0, axCoerceNumber, axIsTypeNumber, axIsTypeNumber);
                var AXInt = this.preparePrimitiveClass("AXInt", "int", axCoerceInt, 0, axCoerceInt, axIsTypeInt, axFalse);
                var AXUint = this.preparePrimitiveClass("AXUint", "uint", axCoerceUint, 0, axCoerceUint, axIsTypeUint, axFalse);
                // Install class loaders on the security domain.
                AVMX.AS.installClassLoaders(this.application, this);
                AVMX.AS.installNativeFunctions(this);
            };
            return AXSecurityDomain;
        })();
        AVMX.AXSecurityDomain = AXSecurityDomain;
        /**
         * All code lives within an application domain.
         */
        var AXApplicationDomain = (function () {
            function AXApplicationDomain(sec, parent) {
                this.sec = sec;
                this.parent = parent;
                this.system = parent ? parent.system : this;
                this._abcs = [];
            }
            AXApplicationDomain.prototype.loadABC = function (abc) {
                assert(this._abcs.indexOf(abc) < 0);
                this._abcs.push(abc);
            };
            AXApplicationDomain.prototype.loadAndExecuteABC = function (abc) {
                this.loadABC(abc);
                this.executeABC(abc);
            };
            AXApplicationDomain.prototype.executeABC = function (abc) {
                var lastScript = abc.scripts[abc.scripts.length - 1];
                this.executeScript(lastScript);
            };
            AXApplicationDomain.prototype.findClassInfo = function (name) {
                for (var i = 0; i < this._abcs.length; i++) {
                    var abc = this._abcs[i];
                    for (var j = 0; j < abc.instances.length; j++) {
                        var c = abc.classes[j];
                        if (c.instanceInfo.getName().name === name) {
                            return c;
                        }
                    }
                }
                return null;
            };
            AXApplicationDomain.prototype.executeScript = function (scriptInfo) {
                assert(scriptInfo.state === 0 /* None */);
                AVMX.runtimeWriter && AVMX.runtimeWriter.writeLn("Running Script: " + scriptInfo);
                var global = this.sec.createAXGlobal(this, scriptInfo);
                scriptInfo.global = global;
                scriptInfo.state = 1 /* Executing */;
                AVMX.interpret(global, scriptInfo.getInitializer(), global.scope, [], null);
                scriptInfo.state = 2 /* Executed */;
            };
            AXApplicationDomain.prototype.findProperty = function (mn, strict, execute) {
                release || assert(mn instanceof AVMX.Multiname);
                var script = this.findDefiningScript(mn, execute);
                if (script) {
                    return script.global;
                }
                return null;
            };
            AXApplicationDomain.prototype.getClass = function (mn) {
                release || assert(mn instanceof AVMX.Multiname);
                return this.getProperty(mn, true, true);
            };
            AXApplicationDomain.prototype.getProperty = function (mn, strict, execute) {
                release || assert(mn instanceof AVMX.Multiname);
                var global = this.findProperty(mn, strict, execute);
                if (global) {
                    return global.axGetProperty(mn);
                }
                return null;
            };
            AXApplicationDomain.prototype.findDefiningScript = function (mn, execute) {
                release || assert(mn instanceof AVMX.Multiname);
                // Look in parent domain first.
                var script;
                if (this.parent) {
                    script = this.parent.findDefiningScript(mn, execute);
                    if (script) {
                        return script;
                    }
                }
                // Search through the loaded abcs.
                for (var i = 0; i < this._abcs.length; i++) {
                    var abc = this._abcs[i];
                    script = this._findDefiningScriptInABC(abc, mn, execute);
                    if (script) {
                        return script;
                    }
                }
                // Still no luck, so let's ask the security domain to load additional ABCs and try again.
                var abc = this.system.sec.findDefiningABC(mn);
                if (abc) {
                    this.loadABC(abc);
                    script = this._findDefiningScriptInABC(abc, mn, execute);
                    release || assert(script, 'Shall find class in loaded ABC');
                    return script;
                }
                return null;
            };
            AXApplicationDomain.prototype._findDefiningScriptInABC = function (abc, mn, execute) {
                var scripts = abc.scripts;
                for (var j = 0; j < scripts.length; j++) {
                    var script = scripts[j];
                    var traits = script.traits;
                    traits.resolve();
                    if (traits.getTrait(mn)) {
                        // Ensure script is executed.
                        if (execute && script.state === 0 /* None */) {
                            this.executeScript(script);
                        }
                        return script;
                    }
                }
                return null;
            };
            return AXApplicationDomain;
        })();
        AVMX.AXApplicationDomain = AXApplicationDomain;
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2015 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var AVM2;
    (function (AVM2) {
        var AS;
        (function (AS) {
            // Keep this module around for now so the flash.js package doesn't fail.
            var ASObject = (function () {
                function ASObject() {
                }
                return ASObject;
            })();
            AS.ASObject = ASObject;
            var ASNative = (function (_super) {
                __extends(ASNative, _super);
                function ASNative() {
                    _super.apply(this, arguments);
                }
                return ASNative;
            })(ASObject);
            AS.ASNative = ASNative;
            var ASError = (function (_super) {
                __extends(ASError, _super);
                function ASError() {
                    _super.apply(this, arguments);
                }
                return ASError;
            })(ASObject);
            AS.ASError = ASError;
        })(AS = AVM2.AS || (AVM2.AS = {}));
    })(AVM2 = Shumway.AVM2 || (Shumway.AVM2 = {}));
})(Shumway || (Shumway = {}));
/**
 * Make Shumway bug-for-bug compatible with Tamarin.
 */
var as3Compatibility = true;
/**
 * AS3 has a bug when converting a certain character range to lower case.
 */
function as3ToLowerCase(value) {
    var chars = null;
    for (var i = 0; i < value.length; i++) {
        var charCode = value.charCodeAt(i);
        if (charCode >= 0x10A0 && charCode <= 0x10C5) {
            if (!chars) {
                chars = new Array(value.length);
            }
            chars[i] = String.fromCharCode(charCode + 48);
        }
    }
    if (chars) {
        // Fill in remaining chars if the bug needs to be emulated.
        for (var i = 0; i < chars.length; i++) {
            var char = chars[i];
            if (!char) {
                chars[i] = value.charAt(i).toLocaleString();
            }
        }
        return chars.join("");
    }
    return value.toLowerCase();
}
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var AS;
        (function (AS) {
            var assert = Shumway.Debug.assert;
            var hasOwnProperty = Shumway.ObjectUtilities.hasOwnProperty;
            var hasOwnGetter = Shumway.ObjectUtilities.hasOwnGetter;
            var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
            var isNullOrUndefined = Shumway.isNullOrUndefined;
            var notImplemented = Shumway.Debug.notImplemented;
            var assertUnreachable = Shumway.Debug.assertUnreachable;
            var pushMany = Shumway.ArrayUtilities.pushMany;
            var copyOwnPropertyDescriptors = Shumway.ObjectUtilities.copyOwnPropertyDescriptors;
            var copyPropertiesByList = Shumway.ObjectUtilities.copyPropertiesByList;
            var Multiname = Shumway.AVMX.Multiname;
            var writer = new Shumway.IndentingWriter();
            function wrapJSGlobalFunction(fun) {
                return function (sec) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    return fun.apply(jsGlobal, args);
                };
            }
            /**
             * Other natives can live in this module
             */
            var Natives;
            (function (Natives) {
                function print(sec, expression, arg1, arg2, arg3, arg4) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    jsGlobal.print.apply(null, args);
                }
                Natives.print = print;
                function debugBreak(v) {
                    /* tslint:disable */
                    debugger;
                    /* tslint:enable */
                }
                Natives.debugBreak = debugBreak;
                function bugzilla(_, n) {
                    switch (n) {
                        case 574600:
                            return true;
                    }
                    return false;
                }
                Natives.bugzilla = bugzilla;
                function decodeURI(sec, encodedURI) {
                    try {
                        return jsGlobal.decodeURI(encodedURI);
                    }
                    catch (e) {
                        sec.throwError('URIError', AVMX.Errors.InvalidURIError, 'decodeURI');
                    }
                }
                Natives.decodeURI = decodeURI;
                function decodeURIComponent(sec, encodedURI) {
                    try {
                        return jsGlobal.decodeURIComponent(encodedURI);
                    }
                    catch (e) {
                        sec.throwError('URIError', AVMX.Errors.InvalidURIError, 'decodeURIComponent');
                    }
                }
                Natives.decodeURIComponent = decodeURIComponent;
                function encodeURI(sec, uri) {
                    try {
                        return jsGlobal.encodeURI(uri);
                    }
                    catch (e) {
                        sec.throwError('URIError', AVMX.Errors.InvalidURIError, 'encodeURI');
                    }
                }
                Natives.encodeURI = encodeURI;
                function encodeURIComponent(sec, uri) {
                    try {
                        return jsGlobal.encodeURIComponent(uri);
                    }
                    catch (e) {
                        sec.throwError('URIError', AVMX.Errors.InvalidURIError, 'encodeURIComponent');
                    }
                }
                Natives.encodeURIComponent = encodeURIComponent;
                Natives.isNaN = wrapJSGlobalFunction(jsGlobal.isNaN);
                Natives.isFinite = wrapJSGlobalFunction(jsGlobal.isFinite);
                Natives.parseInt = wrapJSGlobalFunction(jsGlobal.parseInt);
                Natives.parseFloat = wrapJSGlobalFunction(jsGlobal.parseFloat);
                Natives.escape = wrapJSGlobalFunction(jsGlobal.escape);
                Natives.unescape = wrapJSGlobalFunction(jsGlobal.unescape);
                Natives.isXMLName = function () {
                    return false; // "FIX ME";
                };
                Natives.notImplemented = wrapJSGlobalFunction(jsGlobal.Shumway.Debug.notImplemented);
                /**
                 * Returns the fully qualified class name of an object.
                 */
                function getQualifiedClassName(_, value) {
                    release || AVMX.checkValue(value);
                    var valueType = typeof value;
                    switch (valueType) {
                        case 'undefined':
                            return 'void';
                        case 'object':
                            if (value === null) {
                                return 'null';
                            }
                            return value.classInfo.instanceInfo.name.toFQNString(true);
                        case 'number':
                            return (value | 0) === value ? 'int' : 'Number';
                        case 'string':
                            return 'String';
                        case 'boolean':
                            return 'Boolean';
                    }
                    release || assertUnreachable('invalid value type ' + valueType);
                }
                Natives.getQualifiedClassName = getQualifiedClassName;
                /**
                 * Returns the fully qualified class name of the base class of the object specified by the
                 * |value| parameter.
                 */
                function getQualifiedSuperclassName(sec, value) {
                    if (isNullOrUndefined(value)) {
                        return "null";
                    }
                    value = sec.box(value);
                    // The value might be from another domain, so don't use passed-in the current
                    // AXSecurityDomain.
                    var axClass = value.sec.AXClass.axIsType(value) ?
                        value.superClass :
                        value.axClass.superClass;
                    return getQualifiedClassName(sec, axClass);
                }
                Natives.getQualifiedSuperclassName = getQualifiedSuperclassName;
                /**
                 * Returns the class with the specified name, or |null| if no such class exists.
                 */
                function getDefinitionByName(sec, name) {
                    name = AVMX.axCoerceString(name).replace("::", ".");
                    var mn = Multiname.FromFQNString(name, 0 /* Public */);
                    return AVMX.getCurrentABC().env.app.getClass(mn);
                }
                Natives.getDefinitionByName = getDefinitionByName;
                function describeType(sec, value, flags) {
                    return AS.describeType(sec, value, flags);
                }
                Natives.describeType = describeType;
                function describeTypeJSON(sec, value, flags) {
                    return AS.describeTypeJSON(sec, value, flags);
                }
                Natives.describeTypeJSON = describeTypeJSON;
            })(Natives = AS.Natives || (AS.Natives = {}));
            var nativeClasses = Shumway.ObjectUtilities.createMap();
            var nativeFunctions = Shumway.ObjectUtilities.createMap();
            /**
             * Searches for natives using a string path "a.b.c...".
             */
            function getNative(path) {
                var chain = path.split(".");
                var v = Natives;
                for (var i = 0, j = chain.length; i < j; i++) {
                    v = v && v[chain[i]];
                }
                if (!v) {
                    v = nativeFunctions[path];
                }
                release || assert(v, "getNative(" + path + ") not found.");
                return v;
            }
            AS.getNative = getNative;
            var rn = new Multiname(null, 0, 17 /* RTQNameL */, [], null);
            function makeMultiname(v, namespace) {
                var rn = new Multiname(null, 0, 17 /* RTQNameL */, [], null);
                rn.namespaces = namespace ? [namespace] : [AVMX.Namespace.PUBLIC];
                rn.name = v;
                return rn;
            }
            AS.makeMultiname = makeMultiname;
            function qualifyPublicName(v) {
                return Shumway.isIndex(v) ? v : '$Bg' + v;
            }
            function addPrototypeFunctionAlias(object, name, fun) {
                release || assert(name.indexOf('$Bg') === 0);
                release || assert(typeof fun === 'function');
                // REDUX: remove the need to box the function.
                defineNonEnumerableProperty(object, name, object.sec.AXFunction.axBox(fun));
            }
            AS.addPrototypeFunctionAlias = addPrototypeFunctionAlias;
            function checkReceiverType(receiver, type, methodName) {
                if (!type.dPrototype.isPrototypeOf(receiver)) {
                    receiver.sec.throwError('TypeError', AVMX.Errors.InvokeOnIncompatibleObjectError, methodName);
                }
            }
            AS.checkReceiverType = checkReceiverType;
            /**
             * MetaobjectProtocol base traps. Inherit some or all of these to
             * implement custom behaviour.
             */
            var ASObject = (function () {
                function ASObject() {
                    // To prevent accidental instantiation of template classes, make sure that we throw
                    // right during construction.
                    release || AVMX.checkValue(this);
                }
                ASObject.classInitializer = function () {
                    var proto = this.dPrototype;
                    var asProto = ASObject.prototype;
                    addPrototypeFunctionAlias(proto, "$BghasOwnProperty", asProto.native_hasOwnProperty);
                    addPrototypeFunctionAlias(proto, "$BgpropertyIsEnumerable", asProto.native_propertyIsEnumerable);
                    addPrototypeFunctionAlias(proto, "$BgsetPropertyIsEnumerable", asProto.native_setPropertyIsEnumerable);
                    addPrototypeFunctionAlias(proto, "$BgisPrototypeOf", asProto.native_isPrototypeOf);
                    addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.toString);
                };
                ASObject._init = function () {
                    // Nop.
                };
                ASObject.init = function () {
                    // Nop.
                };
                ASObject.prototype.native_isPrototypeOf = function (v) {
                    return this.isPrototypeOf(this.sec.box(v));
                };
                ASObject.prototype.native_hasOwnProperty = function (nm) {
                    return this.axHasOwnProperty(makeMultiname(nm));
                };
                ASObject.prototype.native_propertyIsEnumerable = function (nm) {
                    var descriptor = Object.getOwnPropertyDescriptor(this, qualifyPublicName(AVMX.axCoerceString(nm)));
                    return !!descriptor && descriptor.enumerable;
                };
                ASObject.prototype.native_setPropertyIsEnumerable = function (nm, enumerable) {
                    if (enumerable === void 0) { enumerable = true; }
                    var qualifiedName = qualifyPublicName(AVMX.axCoerceString(nm));
                    enumerable = !!enumerable;
                    var instanceInfo = this.axClass.classInfo.instanceInfo;
                    if (instanceInfo.isSealed() && this !== this.axClass.dPrototype) {
                        this.sec.throwError('ReferenceError', AVMX.Errors.WriteSealedError, nm, instanceInfo.name.name);
                    }
                    // Silently ignore trait properties.
                    var descriptor = Object.getOwnPropertyDescriptor(this.axClass.tPrototype, qualifiedName);
                    if (descriptor && this !== this.axClass.dPrototype) {
                        return;
                    }
                    var descriptor = Object.getOwnPropertyDescriptor(this, qualifiedName);
                    // ... and non-existent properties.
                    if (!descriptor) {
                        return;
                    }
                    if (descriptor.enumerable !== enumerable) {
                        descriptor.enumerable = enumerable;
                        Object.defineProperty(this, qualifiedName, descriptor);
                    }
                };
                ASObject.prototype.axResolveMultiname = function (mn) {
                    var name = mn.name;
                    if (typeof name === 'number' || Shumway.isNumeric(name = AVMX.axCoerceName(name))) {
                        release || assert(mn.isRuntimeName());
                        return +name;
                    }
                    var t = this.traits.getTrait(mn.namespaces, name);
                    return t ? t.name.getMangledName() : '$Bg' + name;
                };
                ASObject.prototype.axHasProperty = function (mn) {
                    return this.axHasPropertyInternal(mn);
                };
                ASObject.prototype.axHasPublicProperty = function (nm) {
                    rn.name = nm;
                    var result = this.axHasProperty(rn);
                    release || assert(rn.name === nm || isNaN(rn.name) && isNaN(nm));
                    return result;
                };
                ASObject.prototype.axSetProperty = function (mn, value, bc) {
                    release || AVMX.checkValue(value);
                    var name = mn.name;
                    if (typeof name === 'number' || Shumway.isNumeric(name = AVMX.axCoerceName(name))) {
                        release || assert(mn.isRuntimeName());
                        this[+name] = value;
                        return;
                    }
                    var freeze = false;
                    var t = this.traits.getTrait(mn.namespaces, name);
                    if (t) {
                        var mangledName = t.name.getMangledName();
                        switch (t.kind) {
                            case 1 /* Method */:
                                this.sec.throwError('ReferenceError', AVMX.Errors.CannotAssignToMethodError, name, this.axClass.name.name);
                            // Unreachable because of throwError.
                            case 2 /* Getter */:
                                this.sec.throwError('ReferenceError', AVMX.Errors.ConstWriteError, name, this.axClass.name.name);
                            // Unreachable because of throwError.
                            case 4 /* Class */:
                            case 6 /* Const */:
                                // Technically, we need to check if the currently running function is the
                                // initializer of whatever class/package the property is initialized on.
                                // In practice, we freeze the property after first assignment, causing
                                // an internal error to be thrown if it's being initialized a second time.
                                // Invalid bytecode could leave out the assignent during first initialization,
                                // but it's hard to see how that could convert into real-world problems.
                                if (bc !== 104 /* INITPROPERTY */) {
                                    this.sec.throwError('ReferenceError', AVMX.Errors.ConstWriteError, name, this.axClass.name.name);
                                }
                                freeze = true;
                                break;
                        }
                        var type = t.getType();
                        if (type) {
                            value = type.axCoerce(value);
                        }
                    }
                    else {
                        mangledName = '$Bg' + name;
                    }
                    this[mangledName] = value;
                    if (freeze) {
                        Object.defineProperty(this, mangledName, { __proto__: null, writable: false });
                    }
                };
                ASObject.prototype.axGetProperty = function (mn) {
                    var name = this.axResolveMultiname(mn);
                    var value = this[name];
                    if (typeof value === 'function') {
                        return this.axGetMethod(name);
                    }
                    release || AVMX.checkValue(value);
                    return value;
                };
                ASObject.prototype.axGetMethod = function (name) {
                    release || assert(typeof this[name] === 'function');
                    var cache = this._methodClosureCache;
                    if (!cache) {
                        Object.defineProperty(this, '_methodClosureCache', { value: Object.create(null) });
                        cache = this._methodClosureCache;
                    }
                    var method = cache[name];
                    if (!method) {
                        method = cache[name] = this.sec.AXMethodClosure.Create(this, this[name]);
                    }
                    return method;
                };
                ASObject.prototype.axGetSuper = function (mn, scope) {
                    var name = AVMX.axCoerceName(mn.name);
                    var namespaces = mn.namespaces;
                    var trait = scope.parent.object.tPrototype.traits.getTrait(namespaces, name);
                    var value;
                    if (trait.kind === 2 /* Getter */ || trait.kind === 7 /* GetterSetter */) {
                        value = trait.get.call(this);
                    }
                    else {
                        var mangledName = trait.name.getMangledName();
                        value = this[mangledName];
                        if (typeof value === 'function') {
                            return this.axGetMethod(mangledName);
                        }
                    }
                    release || AVMX.checkValue(value);
                    return value;
                };
                ASObject.prototype.axSetSuper = function (mn, scope, value) {
                    release || AVMX.checkValue(value);
                    var name = AVMX.axCoerceName(mn.name);
                    var namespaces = mn.namespaces;
                    var trait = scope.parent.object.tPrototype.traits.getTrait(namespaces, name);
                    var type = trait.getType();
                    if (type) {
                        value = type.axCoerce(value);
                    }
                    if (trait.kind === 3 /* Setter */ || trait.kind === 7 /* GetterSetter */) {
                        trait.set.call(this, value);
                    }
                    else {
                        this[trait.name.getMangledName()] = value;
                    }
                };
                ASObject.prototype.axDeleteProperty = function (mn) {
                    // Cannot delete traits.
                    var name = AVMX.axCoerceName(mn.name);
                    var namespaces = mn.namespaces;
                    if (this.traits.getTrait(namespaces, name)) {
                        return false;
                    }
                    return delete this[mn.getPublicMangledName()];
                };
                ASObject.prototype.axCallProperty = function (mn, args, isLex) {
                    var name = this.axResolveMultiname(mn);
                    var fun = this[name];
                    AVMX.validateCall(this.sec, fun, args.length);
                    return fun.axApply(isLex ? null : this, args);
                };
                ASObject.prototype.axCallSuper = function (mn, scope, args) {
                    var name = this.axResolveMultiname(mn);
                    var fun = scope.parent.object.tPrototype[name];
                    AVMX.validateCall(this.sec, fun, args.length);
                    return fun.axApply(this, args);
                };
                ASObject.prototype.axConstructProperty = function (mn, args) {
                    var name = this.axResolveMultiname(mn);
                    var ctor = this[name];
                    AVMX.validateConstruct(this.sec, ctor, args.length);
                    return ctor.axConstruct(args);
                };
                ASObject.prototype.axHasPropertyInternal = function (mn) {
                    return this.axResolveMultiname(mn) in this;
                };
                ASObject.prototype.axHasOwnProperty = function (mn) {
                    var name = this.axResolveMultiname(mn);
                    // We have to check for trait properties too if a simple hasOwnProperty fails.
                    // This is different to JavaScript's hasOwnProperty behaviour where hasOwnProperty returns
                    // false for properties defined on the property chain and not on the instance itself.
                    return this.hasOwnProperty(name) || this.axClass.tPrototype.hasOwnProperty(name);
                };
                ASObject.prototype.axGetEnumerableKeys = function () {
                    if (this.sec.isPrimitive(this)) {
                        return [];
                    }
                    var tPrototype = Object.getPrototypeOf(this);
                    var keys = Object.keys(this);
                    var result = [];
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        if (Shumway.isNumeric(key)) {
                            result.push(key);
                        }
                        else {
                            if (tPrototype.hasOwnProperty(key)) {
                                continue;
                            }
                            var name = Multiname.stripPublicMangledName(key);
                            if (name !== undefined) {
                                result.push(name);
                            }
                        }
                    }
                    return result;
                };
                ASObject.prototype.axGetPublicProperty = function (nm) {
                    return this[Multiname.getPublicMangledName(nm)];
                };
                ASObject.prototype.axSetPublicProperty = function (nm, value) {
                    release || AVMX.checkValue(value);
                    this[Multiname.getPublicMangledName(nm)] = value;
                };
                ASObject.prototype.axCallPublicProperty = function (nm, argArray) {
                    return this[Multiname.getPublicMangledName(nm)].axApply(this, argArray);
                };
                ASObject.prototype.axDeletePublicProperty = function (nm) {
                    return delete this[Multiname.getPublicMangledName(nm)];
                };
                ASObject.prototype.axGetSlot = function (i) {
                    var t = this.traits.getSlot(i);
                    var value = this[t.name.getMangledName()];
                    release || AVMX.checkValue(value);
                    return value;
                };
                ASObject.prototype.axSetSlot = function (i, value) {
                    release || AVMX.checkValue(value);
                    var t = this.traits.getSlot(i);
                    var name = t.name.getMangledName();
                    var type = t.getType();
                    this[name] = type ? type.axCoerce(value) : value;
                };
                /**
                 * Gets the next name index of an object. Index |zero| is actually not an
                 * index, but rather an indicator to start the iteration.
                 */
                ASObject.prototype.axNextNameIndex = function (index) {
                    var self = this;
                    if (index === 0) {
                        // Gather all enumerable keys since we're starting a new iteration.
                        defineNonEnumerableProperty(self, "axEnumerableKeys", self.axGetEnumerableKeys());
                    }
                    var axEnumerableKeys = self.axEnumerableKeys;
                    while (index < axEnumerableKeys.length) {
                        rn.name = axEnumerableKeys[index];
                        if (self.axHasPropertyInternal(rn)) {
                            release || assert(rn.name === axEnumerableKeys[index]);
                            return index + 1;
                        }
                        index++;
                    }
                    return 0;
                };
                /**
                 * Gets the nextName after the specified |index|, which you would expect to
                 * be index + 1, but it's actually index - 1;
                 */
                ASObject.prototype.axNextName = function (index) {
                    var self = this;
                    var axEnumerableKeys = self.axEnumerableKeys;
                    release || assert(axEnumerableKeys && index > 0 && index < axEnumerableKeys.length + 1);
                    return axEnumerableKeys[index - 1];
                };
                ASObject.prototype.axNextValue = function (index) {
                    return this.axGetPublicProperty(this.axNextName(index));
                };
                ASObject.prototype.axSetNumericProperty = function (nm, value) {
                    this.axSetPublicProperty(nm, value);
                };
                ASObject.prototype.axGetNumericProperty = function (nm) {
                    return this.axGetPublicProperty(nm);
                };
                ASObject.classSymbols = null;
                ASObject.instanceSymbols = null;
                return ASObject;
            })();
            AS.ASObject = ASObject;
            var ASClass = (function (_super) {
                __extends(ASClass, _super);
                function ASClass() {
                    _super.apply(this, arguments);
                }
                ASClass.prototype.axCoerce = function (v) {
                    return v;
                };
                Object.defineProperty(ASClass.prototype, "prototype", {
                    get: function () {
                        release || assert(this.dPrototype);
                        return this.dPrototype;
                    },
                    enumerable: true,
                    configurable: true
                });
                ASClass.classInitializer = null;
                return ASClass;
            })(ASObject);
            AS.ASClass = ASClass;
            function createArrayValueFromArgs(sec, args) {
                if (args.length === 1 && typeof args[0] === 'number') {
                    var len = args[0];
                    try {
                        return new Array(len);
                    }
                    catch (e) {
                        sec.throwError('RangeError', AVMX.Errors.ArrayIndexNotIntegerError, len);
                    }
                }
                return Array.apply(Array, args);
            }
            function coerceArray(obj) {
                if (!obj || !obj.sec) {
                    throw new TypeError('Conversion to Array failed');
                }
                return obj.sec.AXArray.axCoerce(obj);
            }
            var ASArray = (function (_super) {
                __extends(ASArray, _super);
                function ASArray() {
                    _super.call(this);
                    this.value = createArrayValueFromArgs(this.sec, arguments);
                }
                ASArray.classInitializer = function () {
                    var proto = this.dPrototype;
                    var asProto = ASArray.prototype;
                    // option flags for sort and sortOn
                    defineNonEnumerableProperty(this, '$BgCASEINSENSITIVE', 1);
                    defineNonEnumerableProperty(this, '$BgDESCENDING', 2);
                    defineNonEnumerableProperty(this, '$BgUNIQUESORT', 4);
                    defineNonEnumerableProperty(this, '$BgRETURNINDEXEDARRAY', 8);
                    defineNonEnumerableProperty(this, '$BgNUMERIC', 16);
                    addPrototypeFunctionAlias(proto, "$Bgpush", asProto.generic_push);
                    addPrototypeFunctionAlias(proto, "$Bgpop", asProto.generic_pop);
                    addPrototypeFunctionAlias(proto, "$Bgshift", asProto.generic_shift);
                    addPrototypeFunctionAlias(proto, "$Bgunshift", asProto.generic_unshift);
                    addPrototypeFunctionAlias(proto, "$Bgreverse", asProto.generic_reverse);
                    addPrototypeFunctionAlias(proto, "$Bgconcat", asProto.generic_concat);
                    addPrototypeFunctionAlias(proto, "$Bgslice", asProto.generic_slice);
                    addPrototypeFunctionAlias(proto, "$Bgsplice", asProto.generic_splice);
                    addPrototypeFunctionAlias(proto, "$Bgjoin", asProto.generic_join);
                    addPrototypeFunctionAlias(proto, "$BgtoString", asProto.generic_toString);
                    addPrototypeFunctionAlias(proto, "$BgindexOf", asProto.generic_indexOf);
                    addPrototypeFunctionAlias(proto, "$BglastIndexOf", asProto.generic_lastIndexOf);
                    addPrototypeFunctionAlias(proto, "$Bgevery", asProto.generic_every);
                    addPrototypeFunctionAlias(proto, "$Bgsome", asProto.generic_some);
                    addPrototypeFunctionAlias(proto, "$BgforEach", asProto.generic_forEach);
                    addPrototypeFunctionAlias(proto, "$Bgmap", asProto.generic_map);
                    addPrototypeFunctionAlias(proto, "$Bgfilter", asProto.generic_filter);
                    addPrototypeFunctionAlias(proto, "$Bgsort", asProto.generic_sort);
                    addPrototypeFunctionAlias(proto, "$BgsortOn", asProto.generic_sortOn);
                    addPrototypeFunctionAlias(proto, "$BghasOwnProperty", asProto.native_hasOwnProperty);
                    addPrototypeFunctionAlias(proto, "$BgpropertyIsEnumerable", asProto.native_propertyIsEnumerable);
                    addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.generic_toString);
                };
                ASArray.prototype.native_hasOwnProperty = function (nm) {
                    return this.axHasOwnProperty(makeMultiname(nm));
                };
                ASArray.prototype.native_propertyIsEnumerable = function (nm) {
                    if (typeof nm === 'number' || Shumway.isNumeric(nm = AVMX.axCoerceName(nm))) {
                        var descriptor = Object.getOwnPropertyDescriptor(this.value, nm);
                        return !!descriptor && descriptor.enumerable;
                    }
                    _super.prototype.native_propertyIsEnumerable.call(this, nm);
                };
                ASArray.axApply = function (self, args) {
                    return this.sec.createArrayUnsafe(createArrayValueFromArgs(this.sec, args));
                };
                ASArray.axConstruct = function (args) {
                    return this.sec.createArrayUnsafe(createArrayValueFromArgs(this.sec, args));
                };
                ASArray.prototype.push = function () {
                    // Amazingly, AS3 doesn't throw an error if `push` would make the argument too large.
                    // Instead, it just replaces the last element.
                    if (this.value.length + arguments.length > 0xffffffff) {
                        var limit = 0xffffffff - this.value.length;
                        for (var i = 0; i < limit; i++) {
                            this.value.push(arguments[i]);
                        }
                        return 0xffffffff;
                    }
                    return this.value.push.apply(this.value, arguments);
                };
                ASArray.prototype.generic_push = function () {
                    if (this && this.value instanceof Array) {
                        return this.push.apply(this, arguments);
                    }
                    var n = this.axGetPublicProperty('length') >>> 0;
                    for (var i = 0; i < arguments.length; i++) {
                        this.axSetNumericProperty(n++, arguments[i]);
                    }
                    this.axSetPublicProperty('length', n);
                    return n;
                };
                ASArray.prototype.pop = function () {
                    return this.value.pop();
                };
                ASArray.prototype.generic_pop = function () {
                    if (this && this.value instanceof Array) {
                        return this.value.pop();
                    }
                    var len = this.axGetPublicProperty('length') >>> 0;
                    if (!len) {
                        this.axSetPublicProperty('length', 0);
                        return;
                    }
                    var retVal = this.axGetNumericProperty(len - 1);
                    rn.name = len - 1;
                    rn.namespaces = [AVMX.Namespace.PUBLIC];
                    this.axDeleteProperty(rn);
                    this.axSetPublicProperty('length', len - 1);
                    return retVal;
                };
                ASArray.prototype.shift = function () {
                    return this.value.shift();
                };
                ASArray.prototype.generic_shift = function () {
                    return coerceArray(this).shift();
                };
                ASArray.prototype.unshift = function () {
                    return this.value.unshift.apply(this.value, arguments);
                };
                ASArray.prototype.generic_unshift = function () {
                    var self = coerceArray(this);
                    return self.value.unshift.apply(self.value, arguments);
                };
                ASArray.prototype.reverse = function () {
                    this.value.reverse();
                    return this;
                };
                ASArray.prototype.generic_reverse = function () {
                    return coerceArray(this).reverse();
                };
                ASArray.prototype.concat = function () {
                    var value = this.value.slice();
                    for (var i = 0; i < arguments.length; i++) {
                        var a = arguments[i];
                        // Treat all objects with a `sec` property and a value that's an Array as
                        // concat-spreadable.
                        // TODO: verify that this is correct.
                        if (typeof a === 'object' && a && a.sec && Array.isArray(a.value)) {
                            value.push.apply(value, a.value);
                        }
                        else {
                            value.push(a);
                        }
                    }
                    return this.sec.createArrayUnsafe(value);
                };
                ASArray.prototype.generic_concat = function () {
                    return coerceArray(this).concat.apply(this, arguments);
                };
                ASArray.prototype.slice = function (startIndex, endIndex) {
                    return this.sec.createArray(this.value.slice(startIndex, endIndex));
                };
                ASArray.prototype.generic_slice = function (startIndex, endIndex) {
                    return coerceArray(this).slice(startIndex, endIndex);
                };
                ASArray.prototype.splice = function () {
                    var o = this.value;
                    if (arguments.length === 0) {
                        return undefined;
                    }
                    return this.sec.createArray(o.splice.apply(o, arguments));
                };
                ASArray.prototype.generic_splice = function () {
                    return coerceArray(this).splice.apply(this, arguments);
                };
                ASArray.prototype.join = function (sep) {
                    return this.value.join(sep);
                };
                ASArray.prototype.generic_join = function (sep) {
                    return coerceArray(this).join(sep);
                };
                ASArray.prototype.toString = function () {
                    return this.value.join(',');
                };
                ASArray.prototype.generic_toString = function () {
                    return coerceArray(this).join(',');
                };
                ASArray.prototype.indexOf = function (value, fromIndex) {
                    return this.value.indexOf(value, fromIndex | 0);
                };
                ASArray.prototype.generic_indexOf = function (value, fromIndex) {
                    return coerceArray(this).indexOf(value, fromIndex | 0);
                };
                ASArray.prototype.lastIndexOf = function (value, fromIndex) {
                    return this.value.lastIndexOf(value, arguments.length > 1 ? fromIndex : 0x7fffffff);
                };
                ASArray.prototype.generic_lastIndexOf = function (value, fromIndex) {
                    return coerceArray(this).lastIndexOf(value, arguments.length > 1 ? fromIndex : 0x7fffffff);
                };
                ASArray.prototype.every = function (callbackfn, thisArg) {
                    if (!callbackfn || !callbackfn.value || typeof callbackfn.value !== 'function') {
                        return true;
                    }
                    thisArg = AVMX.ensureBoxedReceiver(this.sec, thisArg, callbackfn);
                    var o = this.value;
                    for (var i = 0; i < o.length; i++) {
                        if (callbackfn.value.call(thisArg, o[i], i, this) !== true) {
                            return false;
                        }
                    }
                    return true;
                };
                ASArray.prototype.generic_every = function (callbackfn, thisArg) {
                    return coerceArray(this).every(callbackfn, thisArg);
                };
                ASArray.prototype.some = function (callbackfn, thisArg) {
                    if (!callbackfn || !callbackfn.value || typeof callbackfn.value !== 'function') {
                        return false;
                    }
                    thisArg = AVMX.ensureBoxedReceiver(this.sec, thisArg, callbackfn);
                    var self = this;
                    return this.value.some(function (currentValue, index, array) {
                        return callbackfn.value.call(thisArg, currentValue, index, self);
                    });
                };
                ASArray.prototype.generic_some = function (callbackfn, thisArg) {
                    return coerceArray(this).some(callbackfn, thisArg);
                };
                ASArray.prototype.forEach = function (callbackfn, thisArg) {
                    if (!callbackfn || !callbackfn.value || typeof callbackfn.value !== 'function') {
                        return;
                    }
                    thisArg = AVMX.ensureBoxedReceiver(this.sec, thisArg, callbackfn);
                    var self = this;
                    this.value.forEach(function (currentValue, index) {
                        callbackfn.value.call(thisArg, currentValue, index, self);
                    });
                };
                ASArray.prototype.generic_forEach = function (callbackfn, thisArg) {
                    return coerceArray(this).forEach(callbackfn, thisArg);
                };
                ASArray.prototype.map = function (callbackfn, thisArg) {
                    if (!callbackfn || !callbackfn.value || typeof callbackfn.value !== 'function') {
                        return this.sec.createArrayUnsafe([]);
                    }
                    thisArg = AVMX.ensureBoxedReceiver(this.sec, thisArg, callbackfn);
                    var self = this;
                    return this.sec.createArrayUnsafe(this.value.map(function (currentValue, index) {
                        return callbackfn.value.call(thisArg, currentValue, index, self);
                    }));
                };
                ASArray.prototype.generic_map = function (callbackfn, thisArg) {
                    return coerceArray(this).map(callbackfn, thisArg);
                };
                ASArray.prototype.filter = function (callbackfn, thisArg) {
                    if (!callbackfn || !callbackfn.value || typeof callbackfn.value !== 'function') {
                        return this.sec.createArrayUnsafe([]);
                    }
                    thisArg = AVMX.ensureBoxedReceiver(this.sec, thisArg, callbackfn);
                    var result = [];
                    var o = this.value;
                    for (var i = 0; i < o.length; i++) {
                        if (callbackfn.value.call(thisArg, o[i], i, this) === true) {
                            result.push(o[i]);
                        }
                    }
                    return this.sec.createArrayUnsafe(result);
                };
                ASArray.prototype.generic_filter = function (callbackfn, thisArg) {
                    return coerceArray(this).filter(callbackfn, thisArg);
                };
                ASArray.prototype.toLocaleString = function () {
                    var value = this.sec.AXArray.axCoerce(this).value;
                    var out = "";
                    for (var i = 0, n = value.length; i < n; i++) {
                        var val = value[i];
                        if (val !== null && val !== undefined) {
                            out += val.toLocaleString();
                        }
                        if (i + 1 < n) {
                            out += ",";
                        }
                    }
                    return out;
                };
                ASArray.prototype.sort = function () {
                    var o = this.value;
                    if (arguments.length === 0) {
                        o.sort();
                        return this;
                    }
                    var compareFunction;
                    var options = 0;
                    if (this.sec.AXFunction.axIsInstanceOf(arguments[0])) {
                        compareFunction = arguments[0].value;
                    }
                    else if (Shumway.isNumber(arguments[0])) {
                        options = arguments[0];
                    }
                    if (Shumway.isNumber(arguments[1])) {
                        options = arguments[1];
                    }
                    if (!options) {
                        // Just passing compareFunction is ok because `undefined` is treated as not passed in JS.
                        o.sort(compareFunction);
                        return this;
                    }
                    if (!compareFunction) {
                        compareFunction = AVMX.axDefaultCompareFunction;
                    }
                    var sortOrder = options & 2 /* DESCENDING */ ? -1 : 1;
                    o.sort(function (a, b) {
                        return AVMX.axCompare(a, b, options, sortOrder, compareFunction);
                    });
                    return this;
                };
                ASArray.prototype.generic_sort = function () {
                    return coerceArray(this).sort.apply(this, arguments);
                };
                ASArray.prototype.sortOn = function (names, options) {
                    if (arguments.length === 0) {
                        this.sec.throwError("ArgumentError", AVMX.Errors.WrongArgumentCountError, "Array/http://adobe.com/AS3/2006/builtin::sortOn()", "1", "0");
                    }
                    // The following oddities in how the arguments are used are gleaned from Tamarin, so hush.
                    var o = this.value;
                    // The options we'll end up using.
                    var optionsList = [];
                    if (Shumway.isString(names)) {
                        names = [Multiname.getPublicMangledName(names)];
                        // If the name is a string, coerce `options` to int.
                        optionsList = [options | 0];
                    }
                    else if (names && Array.isArray(names.value)) {
                        names = names.value;
                        for (var i = 0; i < names.length; i++) {
                            names[i] = Multiname.getPublicMangledName(names[i]);
                        }
                        if (options && Array.isArray(options.value)) {
                            options = options.value;
                            // Use the options Array only if it's the same length as names.
                            if (options.length === names.length) {
                                for (var i = 0; i < options.length; i++) {
                                    optionsList[i] = options[i] | 0;
                                }
                            }
                            else {
                                for (var i = 0; i < names.length; i++) {
                                    optionsList[i] = 0;
                                }
                            }
                        }
                        else {
                            var optionsVal = options | 0;
                            for (var i = 0; i < names.length; i++) {
                                optionsList[i] = optionsVal;
                            }
                        }
                    }
                    else {
                        // Not supplying either a String or an Array means nothing is sorted on.
                        return this;
                    }
                    release || assert(optionsList.length === names.length);
                    // For use with uniqueSort and returnIndexedArray once we support them.
                    var optionsVal = optionsList[0];
                    release || Shumway.Debug.assertNotImplemented(!(optionsVal & 4 /* UNIQUESORT */), "UNIQUESORT");
                    release || Shumway.Debug.assertNotImplemented(!(optionsVal & 8 /* RETURNINDEXEDARRAY */), "RETURNINDEXEDARRAY");
                    o.sort(function (a, b) { return AVMX.axCompareFields(a, b, names, optionsList); });
                    return this;
                };
                ASArray.prototype.generic_sortOn = function () {
                    return coerceArray(this).sortOn.apply(this, arguments);
                };
                Object.defineProperty(ASArray.prototype, "length", {
                    get: function () {
                        return this.value.length;
                    },
                    set: function (newLength) {
                        this.value.length = newLength >>> 0;
                    },
                    enumerable: true,
                    configurable: true
                });
                ASArray.prototype.axGetEnumerableKeys = function () {
                    // Get the numeric Array keys first ...
                    var keys = Object.keys(this.value);
                    // ... then the keys that live on the array object.
                    return keys.concat(_super.prototype.axGetEnumerableKeys.call(this));
                };
                ASArray.prototype.axHasPropertyInternal = function (mn) {
                    var name = mn.name;
                    if (typeof name === 'number' || Shumway.isNumeric(name = AVMX.axCoerceName(name))) {
                        release || assert(mn.isRuntimeName());
                        return name in this.value;
                    }
                    if (this.traits.getTrait(mn.namespaces, name)) {
                        return true;
                    }
                    return '$Bg' + name in this;
                };
                ASArray.prototype.axHasOwnProperty = function (mn) {
                    var name = mn.name;
                    if (typeof name === 'number' || Shumway.isNumeric(name = AVMX.axCoerceName(name))) {
                        release || assert(mn.isRuntimeName());
                        return this.value.hasOwnProperty(name);
                    }
                    return !!this.traits.getTrait(mn.namespaces, name) || this.hasOwnProperty('$Bg' + name);
                };
                ASArray.prototype.axGetProperty = function (mn) {
                    var name = mn.name;
                    if (typeof name === 'number' || Shumway.isNumeric(name = AVMX.axCoerceName(name))) {
                        return this.value[name];
                    }
                    return _super.prototype.axGetProperty.call(this, mn);
                };
                ASArray.prototype.axSetProperty = function (mn, value, bc) {
                    release || AVMX.checkValue(value);
                    var name = mn.name;
                    if (typeof name === 'number' || Shumway.isNumeric(name = AVMX.axCoerceName(name))) {
                        this.value[name] = value;
                        return;
                    }
                    _super.prototype.axSetProperty.call(this, mn, value, bc);
                };
                ASArray.prototype.axDeleteProperty = function (mn) {
                    var name = mn.name;
                    if (typeof name === 'number' || Shumway.isNumeric(name = AVMX.axCoerceName(name))) {
                        return delete this.value[name];
                    }
                    // Cannot delete array traits.
                    if (this.traits.getTrait(mn.namespaces, name)) {
                        return false;
                    }
                    return delete this['$Bg' + name];
                };
                ASArray.prototype.axGetPublicProperty = function (nm) {
                    if (typeof nm === 'number' || Shumway.isNumeric(nm = AVMX.axCoerceName(nm))) {
                        return this.value[nm];
                    }
                    return this['$Bg' + nm];
                };
                ASArray.prototype.axSetPublicProperty = function (nm, value) {
                    release || AVMX.checkValue(value);
                    if (typeof nm === 'number' || Shumway.isNumeric(nm = AVMX.axCoerceName(nm))) {
                        this.value[nm] = value;
                        return;
                    }
                    this['$Bg' + nm] = value;
                };
                return ASArray;
            })(ASObject);
            AS.ASArray = ASArray;
            var ASFunction = (function (_super) {
                __extends(ASFunction, _super);
                function ASFunction() {
                    _super.apply(this, arguments);
                    this._prototypeInitialzed = false;
                }
                ASFunction.classInitializer = function () {
                    var proto = this.dPrototype;
                    var asProto = ASFunction.prototype;
                    addPrototypeFunctionAlias(proto, "$BgtoString", asProto.toString);
                    addPrototypeFunctionAlias(proto, "$Bgcall", asProto.call);
                    addPrototypeFunctionAlias(proto, "$Bgapply", asProto.apply);
                    defineNonEnumerableProperty(proto, "value", asProto.native_functionValue);
                };
                ASFunction.prototype.axConstruct = function (args) {
                    var prototype = this.prototype;
                    // AS3 allows setting null/undefined prototypes. In order to make our value checking work,
                    // we need to set a null-prototype that has the right inheritance chain. Since AS3 doesn't
                    // have `__proto__` or `getPrototypeOf`, this is completely hidden from content.
                    if (isNullOrUndefined(prototype)) {
                        prototype = this.sec.AXFunctionUndefinedPrototype;
                    }
                    release || assert(typeof prototype === 'object');
                    release || AVMX.checkValue(prototype);
                    var object = Object.create(prototype);
                    object.__ctorFunction = this;
                    this.value.apply(object, args);
                    return object;
                };
                ASFunction.prototype.axIsInstanceOf = function (obj) {
                    return obj && obj.__ctorFunction === this;
                };
                ASFunction.prototype.native_functionValue = function () {
                    // Empty base function.
                };
                Object.defineProperty(ASFunction.prototype, "prototype", {
                    get: function () {
                        if (!this._prototypeInitialzed) {
                            this._prototype = Object.create(this.sec.AXObject.tPrototype);
                            this._prototypeInitialzed = true;
                        }
                        return this._prototype;
                    },
                    set: function (prototype) {
                        if (isNullOrUndefined(prototype)) {
                            prototype = undefined;
                        }
                        else if (typeof prototype !== 'object' || this.sec.isPrimitive(prototype)) {
                            this.sec.throwError('TypeError', AVMX.Errors.PrototypeTypeError);
                        }
                        this._prototypeInitialzed = true;
                        this._prototype = prototype;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASFunction.prototype, "length", {
                    get: function () {
                        if (this.value.methodInfo) {
                            return this.value.methodInfo.parameters.length;
                        }
                        return this.value.length;
                    },
                    enumerable: true,
                    configurable: true
                });
                ASFunction.prototype.toString = function () {
                    return "function Function() {}";
                };
                ASFunction.prototype.call = function (thisArg) {
                    thisArg = AVMX.ensureBoxedReceiver(this.sec, thisArg, this);
                    return this.value.apply(thisArg, AVMX.sliceArguments(arguments, 1));
                };
                ASFunction.prototype.apply = function (thisArg, argArray) {
                    thisArg = AVMX.ensureBoxedReceiver(this.sec, thisArg, this);
                    return this.value.apply(thisArg, argArray ? argArray.value : undefined);
                };
                ASFunction.prototype.axCall = function (thisArg) {
                    return this.value.apply(thisArg, AVMX.sliceArguments(arguments, 1));
                };
                ASFunction.prototype.axApply = function (thisArg, argArray) {
                    return this.value.apply(thisArg, argArray);
                };
                return ASFunction;
            })(ASObject);
            AS.ASFunction = ASFunction;
            var ASMethodClosure = (function (_super) {
                __extends(ASMethodClosure, _super);
                function ASMethodClosure() {
                    _super.apply(this, arguments);
                }
                ASMethodClosure.classInitializer = function () {
                    var proto = this.dPrototype;
                    var asProto = ASMethodClosure.prototype;
                    defineNonEnumerableProperty(proto, '$Bgcall', asProto.call);
                    defineNonEnumerableProperty(proto, '$Bgapply', asProto.apply);
                };
                ASMethodClosure.Create = function (receiver, method) {
                    var closure = Object.create(this.sec.AXMethodClosure.tPrototype);
                    closure.receiver = receiver;
                    closure.value = method;
                    closure.methodInfo = method.methodInfo;
                    return closure;
                };
                Object.defineProperty(ASMethodClosure.prototype, "prototype", {
                    get: function () {
                        return null;
                    },
                    set: function (prototype) {
                        this.sec.throwError("ReferenceError", AVMX.Errors.ConstWriteError, "prototype", "MethodClosure");
                    },
                    enumerable: true,
                    configurable: true
                });
                ASMethodClosure.prototype.axCall = function (ignoredThisArg) {
                    return this.value.apply(this.receiver, AVMX.sliceArguments(arguments, 1));
                };
                ASMethodClosure.prototype.axApply = function (ignoredThisArg, argArray) {
                    return this.value.apply(this.receiver, argArray);
                };
                ASMethodClosure.prototype.call = function (ignoredThisArg) {
                    return this.value.apply(this.receiver, AVMX.sliceArguments(arguments, 1));
                };
                ASMethodClosure.prototype.apply = function (ignoredThisArg, argArray) {
                    return this.value.apply(this.receiver, argArray ? argArray.value : undefined);
                };
                return ASMethodClosure;
            })(ASFunction);
            AS.ASMethodClosure = ASMethodClosure;
            var ASBoolean = (function (_super) {
                __extends(ASBoolean, _super);
                function ASBoolean() {
                    _super.apply(this, arguments);
                }
                ASBoolean.classInitializer = function () {
                    var proto = this.dPrototype;
                    var asProto = ASBoolean.prototype;
                    addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
                    addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);
                };
                ASBoolean.prototype.toString = function () {
                    return this.value.toString();
                };
                ASBoolean.prototype.valueOf = function () {
                    return this.value.valueOf();
                };
                return ASBoolean;
            })(ASObject);
            AS.ASBoolean = ASBoolean;
            var ASString = (function (_super) {
                __extends(ASString, _super);
                function ASString() {
                    _super.apply(this, arguments);
                }
                ASString.classInitializer = function () {
                    var proto = this.dPrototype;
                    var asProto = ASString.prototype;
                    addPrototypeFunctionAlias(proto, '$BgindexOf', asProto.generic_indexOf);
                    addPrototypeFunctionAlias(proto, '$BglastIndexOf', asProto.generic_lastIndexOf);
                    addPrototypeFunctionAlias(proto, '$BgcharAt', asProto.generic_charAt);
                    addPrototypeFunctionAlias(proto, '$BgcharCodeAt', asProto.generic_charCodeAt);
                    addPrototypeFunctionAlias(proto, '$Bgconcat', asProto.generic_concat);
                    addPrototypeFunctionAlias(proto, '$BglocaleCompare', asProto.generic_localeCompare);
                    addPrototypeFunctionAlias(proto, '$Bgmatch', asProto.generic_match);
                    addPrototypeFunctionAlias(proto, '$Bgreplace', asProto.generic_replace);
                    addPrototypeFunctionAlias(proto, '$Bgsearch', asProto.generic_search);
                    addPrototypeFunctionAlias(proto, '$Bgslice', asProto.generic_slice);
                    addPrototypeFunctionAlias(proto, '$Bgsplit', asProto.generic_split);
                    addPrototypeFunctionAlias(proto, '$Bgsubstring', asProto.generic_substring);
                    addPrototypeFunctionAlias(proto, '$Bgsubstr', asProto.generic_substr);
                    addPrototypeFunctionAlias(proto, '$BgtoLowerCase', asProto.generic_toLowerCase);
                    addPrototypeFunctionAlias(proto, '$BgtoLocaleLowerCase', asProto.generic_toLowerCase);
                    addPrototypeFunctionAlias(proto, '$BgtoUpperCase', asProto.generic_toUpperCase);
                    addPrototypeFunctionAlias(proto, '$BgtoLocaleUpperCase', asProto.generic_toUpperCase);
                    addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
                    addPrototypeFunctionAlias(proto, '$BgtoString', asProto.public_toString);
                    addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.public_valueOf);
                    addPrototypeFunctionAlias(this, '$BgfromCharCode', ASString.fromCharCode);
                };
                ASString.fromCharCode = function () {
                    var charcodes = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        charcodes[_i - 0] = arguments[_i];
                    }
                    return String.fromCharCode.apply(null, charcodes);
                };
                ASString.prototype.indexOf = function (char, i) {
                    return this.value.indexOf(char, i);
                };
                ASString.prototype.lastIndexOf = function (char, i) {
                    return this.value.lastIndexOf(char, i);
                };
                ASString.prototype.charAt = function (index) {
                    return this.value.charAt(index);
                };
                ASString.prototype.charCodeAt = function (index) {
                    return this.value.charCodeAt(index);
                };
                ASString.prototype.concat = function () {
                    return this.value.concat.apply(this.value, arguments);
                };
                ASString.prototype.localeCompare = function (other) {
                    if (arguments.length > 1) {
                        this.sec.throwError('ArgumentError', AVMX.Errors.WrongArgumentCountError, 'Function/<anonymous>()', 0, 2);
                    }
                    var value = this.value;
                    release || assert(typeof this.value === 'string');
                    other = String(other);
                    if (other === value) {
                        return 0;
                    }
                    var len = Math.min(value.length, other.length);
                    for (var j = 0; j < len; j++) {
                        if (value[j] !== other[j]) {
                            return value.charCodeAt(j) - other.charCodeAt(j);
                        }
                    }
                    return value.length > other.length ? 1 : -1;
                };
                ASString.prototype.match = function (pattern /* : string | ASRegExp */) {
                    if (this.sec.AXRegExp.axIsType(pattern)) {
                        pattern = pattern.value;
                    }
                    else {
                        pattern = AVMX.axCoerceString(pattern);
                    }
                    var result = this.value.match(pattern);
                    if (!result) {
                        return null;
                    }
                    try {
                        return transformJStoASRegExpMatchArray(this.sec, result);
                    }
                    catch (e) {
                        return null;
                    }
                };
                ASString.prototype.replace = function (pattern /* : string | ASRegExp */, repl /* : string | ASFunction */) {
                    if (this.sec.AXRegExp.axIsType(pattern)) {
                        pattern = pattern.value;
                    }
                    else {
                        pattern = AVMX.axCoerceString(pattern);
                    }
                    if (this.sec.AXFunction.axIsType(repl)) {
                        repl = repl.value;
                    }
                    try {
                        return this.value.replace(pattern, repl);
                    }
                    catch (e) {
                        return this.value;
                    }
                };
                ASString.prototype.search = function (pattern /* : string | ASRegExp */) {
                    if (this.sec.AXRegExp.axIsType(pattern)) {
                        pattern = pattern.value;
                    }
                    else {
                        pattern = AVMX.axCoerceString(pattern);
                    }
                    try {
                        return this.value.search(pattern);
                    }
                    catch (e) {
                        return -1;
                    }
                };
                ASString.prototype.slice = function (start, end) {
                    start = arguments.length < 1 ? 0 : start | 0;
                    end = arguments.length < 2 ? 0xffffffff : end | 0;
                    return this.value.slice(start, end);
                };
                ASString.prototype.split = function (separator /* : string | ASRegExp */, limit) {
                    if (this.sec.AXRegExp.axIsType(separator)) {
                        separator = separator.value;
                    }
                    else {
                        separator = AVMX.axCoerceString(separator);
                    }
                    limit = limit === undefined ? -1 : limit | 0;
                    try {
                        return this.sec.createArray(this.value.split(separator, limit));
                    }
                    catch (e) {
                        return this.sec.createArrayUnsafe([this.value]);
                    }
                };
                ASString.prototype.substring = function (start, end) {
                    return this.value.substring(start, end);
                };
                ASString.prototype.substr = function (from, length) {
                    return this.value.substr(from, length);
                };
                ASString.prototype.toLocaleLowerCase = function () {
                    return this.value.toLowerCase();
                };
                ASString.prototype.toLowerCase = function () {
                    if (as3Compatibility) {
                        return as3ToLowerCase(this.value);
                    }
                    return this.value.toLowerCase();
                };
                ASString.prototype.toLocaleUpperCase = function () {
                    return this.value.toUpperCase();
                };
                ASString.prototype.toUpperCase = function () {
                    return this.value.toUpperCase();
                };
                // The String.prototype versions of these methods are generic, so the implementation is
                // different.
                ASString.prototype.generic_indexOf = function (char, i) {
                    var receiver = this == undefined ? '' : this;
                    return String.prototype.indexOf.call(receiver, char, i);
                };
                ASString.prototype.generic_lastIndexOf = function (char, i) {
                    var receiver = this == undefined ? '' : this;
                    return String.prototype.lastIndexOf.call(receiver, char, i);
                };
                ASString.prototype.generic_charAt = function (index) {
                    var receiver = this == undefined ? '' : this;
                    return String.prototype.charAt.call(receiver, index);
                };
                ASString.prototype.generic_charCodeAt = function (index) {
                    var receiver = this == undefined ? '' : this;
                    return String.prototype.charCodeAt.call(receiver, index);
                };
                ASString.prototype.generic_concat = function () {
                    var receiver = this == undefined ? '' : this;
                    return String.prototype.concat.apply(receiver, arguments);
                };
                ASString.prototype.generic_localeCompare = function (other) {
                    var receiver = this.sec.AXString.axBox(String(this));
                    return receiver.localeCompare.apply(receiver, arguments);
                };
                ASString.prototype.generic_match = function (pattern) {
                    return this.sec.AXString.axBox(String(this)).match(pattern);
                };
                ASString.prototype.generic_replace = function (pattern, repl) {
                    return this.sec.AXString.axBox(String(this)).replace(pattern, repl);
                };
                ASString.prototype.generic_search = function (pattern) {
                    return this.sec.AXString.axBox(String(this)).search(pattern);
                };
                ASString.prototype.generic_slice = function (start, end) {
                    var receiver = this == undefined ? '' : this;
                    return String.prototype.slice.call(receiver, start, end);
                };
                ASString.prototype.generic_split = function (separator, limit) {
                    limit = arguments.length < 2 ? 0xffffffff : limit | 0;
                    return this.sec.AXString.axBox(String(this)).split(separator, limit);
                };
                ASString.prototype.generic_substring = function (start, end) {
                    var receiver = this == undefined ? '' : this;
                    return String.prototype.substring.call(receiver, start, end);
                };
                ASString.prototype.generic_substr = function (from, length) {
                    var receiver = this == undefined ? '' : this;
                    return String.prototype.substr.call(receiver, from, length);
                };
                ASString.prototype.generic_toLowerCase = function () {
                    var receiver = this == undefined ? '' : this;
                    if (as3Compatibility) {
                        return as3ToLowerCase(String(receiver));
                    }
                    String.prototype.toLowerCase.call(receiver);
                };
                ASString.prototype.generic_toUpperCase = function () {
                    var receiver = this == undefined ? '' : this;
                    return String.prototype.toUpperCase.call(receiver);
                };
                ASString.prototype.toString = function () {
                    return this.value.toString();
                };
                ASString.prototype.public_toString = function () {
                    if (this === this.sec.AXString.dPrototype) {
                        return '';
                    }
                    if (this.axClass !== this.sec.AXString) {
                        this.sec.throwError('TypeError', AVMX.Errors.InvokeOnIncompatibleObjectError, 'String.prototype.toString');
                    }
                    return this.value.toString();
                };
                ASString.prototype.valueOf = function () {
                    return this.value.valueOf();
                };
                ASString.prototype.public_valueOf = function () {
                    if (this === this.sec.AXString.dPrototype) {
                        return '';
                    }
                    if (this.axClass !== this.sec.AXString) {
                        this.sec.throwError('TypeError', AVMX.Errors.InvokeOnIncompatibleObjectError, 'String.prototype.valueOf');
                    }
                    return this.value.valueOf();
                };
                Object.defineProperty(ASString.prototype, "length", {
                    get: function () {
                        return this.value.length;
                    },
                    enumerable: true,
                    configurable: true
                });
                ASString.classNatives = [String];
                return ASString;
            })(ASObject);
            AS.ASString = ASString;
            var ASNumber = (function (_super) {
                __extends(ASNumber, _super);
                function ASNumber() {
                    _super.apply(this, arguments);
                }
                ASNumber.classInitializer = function () {
                    var proto = this.dPrototype;
                    var asProto = ASNumber.prototype;
                    addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
                    addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.toString);
                    addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);
                    addPrototypeFunctionAlias(proto, '$BgtoFixed', asProto.toFixed);
                    addPrototypeFunctionAlias(proto, '$BgtoExponential', asProto.toExponential);
                    addPrototypeFunctionAlias(proto, '$BgtoPrecision', asProto.toPrecision);
                    defineNonEnumerableProperty(this, '$BgNaN', Number.NaN);
                    defineNonEnumerableProperty(this, '$BgNEGATIVE_INFINITY', -1 / 0);
                    defineNonEnumerableProperty(this, '$BgPOSITIVE_INFINITY', 1 / 0);
                    defineNonEnumerableProperty(this, '$BgMAX_VALUE', Number.MAX_VALUE);
                    defineNonEnumerableProperty(this, '$BgMIN_VALUE', Number.MIN_VALUE);
                    defineNonEnumerableProperty(this, '$BgE', Math.E);
                    defineNonEnumerableProperty(this, '$BgLN10', Math.LN10);
                    defineNonEnumerableProperty(this, '$BgLN2', Math.LN2);
                    defineNonEnumerableProperty(this, '$BgLOG10E', Math.LOG10E);
                    defineNonEnumerableProperty(this, '$BgLOG2E', Math.LOG2E);
                    defineNonEnumerableProperty(this, '$BgPI', Math.PI);
                    defineNonEnumerableProperty(this, '$BgSQRT1_2', Math.SQRT2);
                    defineNonEnumerableProperty(this, '$BgSQRT2', Math.SQRT2);
                };
                ASNumber.prototype.toString = function (radix) {
                    if (arguments.length === 0) {
                        radix = 10;
                    }
                    else {
                        radix = radix | 0;
                        if (radix < 2 || radix > 36) {
                            this.sec.throwError('RangeError', AVMX.Errors.InvalidRadixError, radix);
                        }
                    }
                    if (this.axClass !== this.sec.AXNumber) {
                        this.sec.throwError('TypeError', AVMX.Errors.InvokeOnIncompatibleObjectError, 'Number.prototype.toString');
                    }
                    return this.value.toString(radix);
                };
                ASNumber.prototype.valueOf = function () {
                    if (this.axClass !== this.sec.AXNumber) {
                        this.sec.throwError('TypeError', AVMX.Errors.InvokeOnIncompatibleObjectError, 'Number.prototype.valueOf');
                    }
                    return this.value;
                };
                ASNumber.prototype.toExponential = function (p) {
                    p = p | 0;
                    if (p < 0 || p > 20) {
                        this.sec.throwError('RangeError', AVMX.Errors.InvalidPrecisionError);
                    }
                    if (this.axClass !== this.sec.AXNumber) {
                        return 'NaN';
                    }
                    return this.value.toExponential(p);
                };
                ASNumber.prototype.toPrecision = function (p) {
                    if (!p) {
                        p = 1;
                    }
                    else {
                        p = p | 0;
                    }
                    if (p < 1 || p > 21) {
                        this.sec.throwError('RangeError', AVMX.Errors.InvalidPrecisionError);
                    }
                    if (this.axClass !== this.sec.AXNumber) {
                        return 'NaN';
                    }
                    return this.value.toPrecision(p);
                };
                ASNumber.prototype.toFixed = function (p) {
                    p = p | 0;
                    if (p < 0 || p > 20) {
                        this.sec.throwError('RangeError', AVMX.Errors.InvalidPrecisionError);
                    }
                    if (this.axClass !== this.sec.AXNumber) {
                        return 'NaN';
                    }
                    return this.value.toFixed(p);
                };
                ASNumber._minValue = function () {
                    return Number.MIN_VALUE;
                };
                // https://bugzilla.mozilla.org/show_bug.cgi?id=564839
                ASNumber.convertStringToDouble = function (s) {
                    var i = s.indexOf(String.fromCharCode(0));
                    if (i >= 0) {
                        return +s.substring(0, i);
                    }
                    return +s;
                };
                ASNumber.classNatives = [Math];
                return ASNumber;
            })(ASObject);
            AS.ASNumber = ASNumber;
            var ASInt = (function (_super) {
                __extends(ASInt, _super);
                function ASInt() {
                    _super.apply(this, arguments);
                }
                ASInt.classInitializer = function () {
                    var proto = this.dPrototype;
                    var asProto = ASInt.prototype;
                    addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
                    addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.toString);
                    addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);
                    defineNonEnumerableProperty(this, '$BgMAX_VALUE', 0x7fffffff);
                    defineNonEnumerableProperty(this, '$BgMIN_VALUE', -0x80000000);
                };
                ASInt.prototype.toString = function (radix) {
                    if (arguments.length === 0) {
                        radix = 10;
                    }
                    else {
                        radix = radix | 0;
                        if (radix < 2 || radix > 36) {
                            this.sec.throwError('RangeError', AVMX.Errors.InvalidRadixError, radix);
                        }
                    }
                    if (this.axClass !== this.sec.AXNumber) {
                        this.sec.throwError('TypeError', AVMX.Errors.InvokeOnIncompatibleObjectError, 'Number.prototype.toString');
                    }
                    return this.value.toString(radix);
                };
                ASInt.prototype.valueOf = function () {
                    if (this.axClass !== this.sec.AXNumber) {
                        this.sec.throwError('TypeError', AVMX.Errors.InvokeOnIncompatibleObjectError, 'Number.prototype.valueOf');
                    }
                    return this.value;
                };
                ASInt.staticNatives = [Math];
                ASInt.instanceNatives = [ASNumber.prototype];
                return ASInt;
            })(ASNumber);
            AS.ASInt = ASInt;
            var ASUint = (function (_super) {
                __extends(ASUint, _super);
                function ASUint() {
                    _super.apply(this, arguments);
                }
                ASUint.classInitializer = function () {
                    var proto = this.dPrototype;
                    var asProto = ASUint.prototype;
                    addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
                    addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.toString);
                    addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);
                    defineNonEnumerableProperty(this, '$BgMAX_VALUE', 0xffffffff);
                    defineNonEnumerableProperty(this, '$BgMIN_VALUE', 0);
                };
                ASUint.prototype.toString = function (radix) {
                    if (arguments.length === 0) {
                        radix = 10;
                    }
                    else {
                        radix = radix | 0;
                        if (radix < 2 || radix > 36) {
                            this.sec.throwError('RangeError', AVMX.Errors.InvalidRadixError, radix);
                        }
                    }
                    if (this.axClass !== this.sec.AXNumber) {
                        this.sec.throwError('TypeError', AVMX.Errors.InvokeOnIncompatibleObjectError, 'Number.prototype.toString');
                    }
                    return this.value.toString(radix);
                };
                ASUint.prototype.valueOf = function () {
                    if (this.axClass !== this.sec.AXNumber) {
                        this.sec.throwError('TypeError', AVMX.Errors.InvokeOnIncompatibleObjectError, 'Number.prototype.valueOf');
                    }
                    return this.value;
                };
                ASUint.staticNatives = [Math];
                ASUint.instanceNatives = [ASNumber.prototype];
                return ASUint;
            })(ASNumber);
            AS.ASUint = ASUint;
            var ASMath = (function (_super) {
                __extends(ASMath, _super);
                function ASMath() {
                    _super.apply(this, arguments);
                }
                ASMath.classNatives = [Math];
                ASMath.classInitializer = function () {
                    defineNonEnumerableProperty(this, '$BgE', Math.E);
                    defineNonEnumerableProperty(this, '$BgLN10', Math.LN10);
                    defineNonEnumerableProperty(this, '$BgLN2', Math.LN2);
                    defineNonEnumerableProperty(this, '$BgLOG10E', Math.LOG10E);
                    defineNonEnumerableProperty(this, '$BgLOG2E', Math.LOG2E);
                    defineNonEnumerableProperty(this, '$BgPI', Math.PI);
                    defineNonEnumerableProperty(this, '$BgSQRT1_2', Math.SQRT2);
                    defineNonEnumerableProperty(this, '$BgSQRT2', Math.SQRT2);
                };
                return ASMath;
            })(ASObject);
            AS.ASMath = ASMath;
            var ASRegExp = (function (_super) {
                __extends(ASRegExp, _super);
                function ASRegExp(pattern, flags) {
                    _super.call(this);
                    this._dotall = false;
                    this._extended = false;
                    this._captureNames = [];
                    var source;
                    if (pattern === undefined) {
                        pattern = source = '';
                    }
                    else if (this.sec.AXRegExp.axIsType(pattern)) {
                        if (flags) {
                            this.sec.throwError("TypeError", AVMX.Errors.RegExpFlagsArgumentError);
                        }
                        source = pattern.source;
                        pattern = pattern.value;
                    }
                    else {
                        pattern = String(pattern);
                        // Escape all forward slashes.
                        source = pattern.replace(/(^|^[\/]|(?:\\\\)+)\//g, '$1\\/');
                        if (flags) {
                            var f = flags;
                            flags = '';
                            for (var i = 0; i < f.length; i++) {
                                var flag = f[i];
                                switch (flag) {
                                    case 's':
                                        // With the s flag set, . will match the newline character.
                                        this._dotall = true;
                                        break;
                                    case 'x':
                                        // With the x flag set, spaces in the regular expression, will be ignored as part of
                                        // the pattern.
                                        this._extended = true;
                                        break;
                                    case 'g':
                                    case 'i':
                                    case 'm':
                                        // Only keep valid flags since an ECMAScript compatible RegExp implementation will
                                        // throw on invalid ones. We have to avoid that in ActionScript.
                                        flags += flag;
                                }
                            }
                        }
                        pattern = this._parse(source);
                    }
                    try {
                        this.value = new RegExp(pattern, flags);
                    }
                    catch (e) {
                        // Our pattern pre-parser should have eliminated most errors, but in some cases we can't
                        // meaningfully detect them. If that happens, just catch the error and substitute an
                        // unmatchable pattern here.
                        this.value = new RegExp(ASRegExp.UNMATCHABLE_PATTERN, flags);
                    }
                    this._source = source;
                }
                // Parses and sanitizes a AS3 RegExp pattern to be used in JavaScript. Silently fails and
                // returns an unmatchable pattern of the source turns out to be invalid.
                ASRegExp.prototype._parse = function (pattern) {
                    var result = '';
                    var captureNames = this._captureNames;
                    var parens = [];
                    var atoms = 0;
                    for (var i = 0; i < pattern.length; i++) {
                        var char = pattern[i];
                        switch (char) {
                            case '(':
                                result += char;
                                parens.push(atoms > 1 ? atoms - 1 : atoms);
                                atoms = 0;
                                if (pattern[i + 1] === '?') {
                                    switch (pattern[i + 2]) {
                                        case ':':
                                        case '=':
                                        case '!':
                                            result += '?' + pattern[i + 2];
                                            i += 2;
                                            break;
                                        default:
                                            if (/\(\?P<([\w$]+)>/.exec(pattern.substr(i))) {
                                                var name = RegExp.$1;
                                                if (name !== 'length') {
                                                    captureNames.push(name);
                                                }
                                                if (captureNames.indexOf(name) > -1) {
                                                }
                                                i += RegExp.lastMatch.length - 1;
                                            }
                                            else {
                                                return ASRegExp.UNMATCHABLE_PATTERN;
                                            }
                                    }
                                }
                                else {
                                    captureNames.push(null);
                                }
                                // 406 seems to be the maximum number of capturing groups allowed in a pattern.
                                // Examined by testing.
                                if (captureNames.length > 406) {
                                    return ASRegExp.UNMATCHABLE_PATTERN;
                                }
                                break;
                            case ')':
                                if (!parens.length) {
                                    return ASRegExp.UNMATCHABLE_PATTERN;
                                }
                                result += char;
                                atoms = parens.pop() + 1;
                                break;
                            case '|':
                                result += char;
                                break;
                            case '\\':
                                result += char;
                                if (/\\|c[A-Z]|x[0-9,a-z,A-Z]{2}|u[0-9,a-z,A-Z]{4}|./.exec(pattern.substr(i + 1))) {
                                    result += RegExp.lastMatch;
                                    i += RegExp.lastMatch.length;
                                }
                                if (atoms <= 1) {
                                    atoms++;
                                }
                                break;
                            case '[':
                                if (/\[[^\]]*\]/.exec(pattern.substr(i))) {
                                    result += RegExp.lastMatch;
                                    i += RegExp.lastMatch.length - 1;
                                    if (atoms <= 1) {
                                        atoms++;
                                    }
                                }
                                else {
                                    return ASRegExp.UNMATCHABLE_PATTERN;
                                }
                                break;
                            case '{':
                                if (/\{[^\{]*?(?:,[^\{]*?)?\}/.exec(pattern.substr(i))) {
                                    result += RegExp.lastMatch;
                                    i += RegExp.lastMatch.length - 1;
                                }
                                else {
                                    return ASRegExp.UNMATCHABLE_PATTERN;
                                }
                                break;
                            case '.':
                                if (this._dotall) {
                                    result += '[\\s\\S]';
                                }
                                else {
                                    result += char;
                                }
                                if (atoms <= 1) {
                                    atoms++;
                                }
                                break;
                            case '?':
                            case '*':
                            case '+':
                                if (!atoms) {
                                    return ASRegExp.UNMATCHABLE_PATTERN;
                                }
                                result += char;
                                if (pattern[i + 1] === '?') {
                                    i++;
                                    result += '?';
                                }
                                break;
                            case ' ':
                                if (this._extended) {
                                    break;
                                }
                            default:
                                result += char;
                                if (atoms <= 1) {
                                    atoms++;
                                }
                        }
                        // 32767 seams to be the maximum allowed length for RegExps in SpiderMonkey.
                        // Examined by testing.
                        if (result.length > 0x7fff) {
                            return ASRegExp.UNMATCHABLE_PATTERN;
                        }
                    }
                    if (parens.length) {
                        return ASRegExp.UNMATCHABLE_PATTERN;
                    }
                    return result;
                };
                ASRegExp.prototype.ecmaToString = function () {
                    var out = "/" + this._source + "/";
                    if (this.value.global)
                        out += "g";
                    if (this.value.ignoreCase)
                        out += "i";
                    if (this.value.multiline)
                        out += "m";
                    if (this._dotall)
                        out += "s";
                    if (this._extended)
                        out += "x";
                    return out;
                };
                ASRegExp.prototype.axCall = function (ignoredThisArg) {
                    return this.exec.apply(this, arguments);
                };
                ASRegExp.prototype.axApply = function (ignoredThisArg, argArray) {
                    return this.exec.apply(this, argArray);
                };
                Object.defineProperty(ASRegExp.prototype, "source", {
                    get: function () {
                        return this._source;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASRegExp.prototype, "global", {
                    get: function () {
                        return this.value.global;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASRegExp.prototype, "ignoreCase", {
                    get: function () {
                        return this.value.ignoreCase;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASRegExp.prototype, "multiline", {
                    get: function () {
                        return this.value.multiline;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASRegExp.prototype, "lastIndex", {
                    get: function () {
                        return this.value.lastIndex;
                    },
                    set: function (value) {
                        this.value.lastIndex = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASRegExp.prototype, "dotall", {
                    get: function () {
                        return this._dotall;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASRegExp.prototype, "extended", {
                    get: function () {
                        return this._extended;
                    },
                    enumerable: true,
                    configurable: true
                });
                ASRegExp.prototype.exec = function (str) {
                    if (str === void 0) { str = ''; }
                    var result = this.value.exec(str);
                    if (!result) {
                        return null;
                    }
                    var axResult = transformJStoASRegExpMatchArray(this.sec, result);
                    var captureNames = this._captureNames;
                    if (captureNames) {
                        for (var i = 0; i < captureNames.length; i++) {
                            var name = captureNames[i];
                            if (name !== null) {
                                // In AS3, non-matched named capturing groups return an empty string.
                                var value = result[i + 1] || '';
                                result[name] = value;
                                axResult.axSetPublicProperty(name, value);
                            }
                        }
                        return axResult;
                    }
                };
                ASRegExp.prototype.test = function (str) {
                    if (str === void 0) { str = ''; }
                    return this.exec(str) !== null;
                };
                ASRegExp.UNMATCHABLE_PATTERN = '^(?!)$';
                ASRegExp.classInitializer = function () {
                    var proto = this.dPrototype;
                    var asProto = ASRegExp.prototype;
                    addPrototypeFunctionAlias(proto, '$BgtoString', asProto.ecmaToString);
                    addPrototypeFunctionAlias(proto, '$Bgexec', asProto.exec);
                    addPrototypeFunctionAlias(proto, '$Bgtest', asProto.test);
                };
                return ASRegExp;
            })(ASObject);
            AS.ASRegExp = ASRegExp;
            var ASError = (function (_super) {
                __extends(ASError, _super);
                function ASError(message, id) {
                    _super.call(this);
                    if (arguments.length < 1) {
                        message = '';
                    }
                    this.$Bgmessage = String(message);
                    this._errorID = id | 0;
                }
                ASError.throwError = function (type, id /*, ...rest */) {
                    var info = AVMX.getErrorInfo(id);
                    var args = [info];
                    for (var i = 2; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                    var message = AVMX.formatErrorMessage.apply(null, args);
                    throw type.axConstruct([message, id]);
                };
                ASError.classInitializer = function (asClass) {
                    defineNonEnumerableProperty(this, '$Bglength', 1);
                    defineNonEnumerableProperty(this.dPrototype, '$Bgname', this.classInfo.instanceInfo.getName().name);
                    if (asClass === ASError) {
                        defineNonEnumerableProperty(this.dPrototype, '$Bgmessage', 'Error');
                        defineNonEnumerableProperty(this.dPrototype, '$BgtoString', ASError.prototype.toString);
                    }
                };
                ASError.prototype.toString = function () {
                    return this.$Bgmessage !== "" ? this.$Bgname + ": " + this.$Bgmessage : this.$Bgname;
                };
                Object.defineProperty(ASError.prototype, "errorID", {
                    get: function () {
                        return this._errorID;
                    },
                    enumerable: true,
                    configurable: true
                });
                ASError.prototype.getStackTrace = function () {
                    // Stack traces are only available in debug builds. We only do opt.
                    return null;
                };
                ASError.getErrorMessage = Shumway.AVMX.getErrorMessage;
                return ASError;
            })(ASObject);
            AS.ASError = ASError;
            var ASDefinitionError = (function (_super) {
                __extends(ASDefinitionError, _super);
                function ASDefinitionError() {
                    _super.apply(this, arguments);
                }
                return ASDefinitionError;
            })(ASError);
            AS.ASDefinitionError = ASDefinitionError;
            var ASEvalError = (function (_super) {
                __extends(ASEvalError, _super);
                function ASEvalError() {
                    _super.apply(this, arguments);
                }
                return ASEvalError;
            })(ASError);
            AS.ASEvalError = ASEvalError;
            var ASRangeError = (function (_super) {
                __extends(ASRangeError, _super);
                function ASRangeError() {
                    _super.apply(this, arguments);
                }
                return ASRangeError;
            })(ASError);
            AS.ASRangeError = ASRangeError;
            var ASReferenceError = (function (_super) {
                __extends(ASReferenceError, _super);
                function ASReferenceError() {
                    _super.apply(this, arguments);
                }
                return ASReferenceError;
            })(ASError);
            AS.ASReferenceError = ASReferenceError;
            var ASSecurityError = (function (_super) {
                __extends(ASSecurityError, _super);
                function ASSecurityError() {
                    _super.apply(this, arguments);
                }
                return ASSecurityError;
            })(ASError);
            AS.ASSecurityError = ASSecurityError;
            var ASSyntaxError = (function (_super) {
                __extends(ASSyntaxError, _super);
                function ASSyntaxError() {
                    _super.apply(this, arguments);
                }
                return ASSyntaxError;
            })(ASError);
            AS.ASSyntaxError = ASSyntaxError;
            var ASTypeError = (function (_super) {
                __extends(ASTypeError, _super);
                function ASTypeError() {
                    _super.apply(this, arguments);
                }
                return ASTypeError;
            })(ASError);
            AS.ASTypeError = ASTypeError;
            var ASURIError = (function (_super) {
                __extends(ASURIError, _super);
                function ASURIError() {
                    _super.apply(this, arguments);
                }
                return ASURIError;
            })(ASError);
            AS.ASURIError = ASURIError;
            var ASVerifyError = (function (_super) {
                __extends(ASVerifyError, _super);
                function ASVerifyError() {
                    _super.apply(this, arguments);
                }
                return ASVerifyError;
            })(ASError);
            AS.ASVerifyError = ASVerifyError;
            var ASUninitializedError = (function (_super) {
                __extends(ASUninitializedError, _super);
                function ASUninitializedError() {
                    _super.apply(this, arguments);
                }
                return ASUninitializedError;
            })(ASError);
            AS.ASUninitializedError = ASUninitializedError;
            var ASArgumentError = (function (_super) {
                __extends(ASArgumentError, _super);
                function ASArgumentError() {
                    _super.apply(this, arguments);
                }
                return ASArgumentError;
            })(ASError);
            AS.ASArgumentError = ASArgumentError;
            var ASIOError = (function (_super) {
                __extends(ASIOError, _super);
                function ASIOError() {
                    _super.apply(this, arguments);
                }
                return ASIOError;
            })(ASError);
            AS.ASIOError = ASIOError;
            var ASEOFError = (function (_super) {
                __extends(ASEOFError, _super);
                function ASEOFError() {
                    _super.apply(this, arguments);
                }
                return ASEOFError;
            })(ASError);
            AS.ASEOFError = ASEOFError;
            var ASMemoryError = (function (_super) {
                __extends(ASMemoryError, _super);
                function ASMemoryError() {
                    _super.apply(this, arguments);
                }
                return ASMemoryError;
            })(ASError);
            AS.ASMemoryError = ASMemoryError;
            var ASIllegalOperationError = (function (_super) {
                __extends(ASIllegalOperationError, _super);
                function ASIllegalOperationError() {
                    _super.apply(this, arguments);
                }
                return ASIllegalOperationError;
            })(ASError);
            AS.ASIllegalOperationError = ASIllegalOperationError;
            /**
             * Transforms a JS value into an AS value.
             */
            function transformJSValueToAS(sec, value, deep) {
                release || assert(typeof value !== 'function');
                if (typeof value !== "object") {
                    return value;
                }
                if (isNullOrUndefined(value)) {
                    return value;
                }
                if (Array.isArray(value)) {
                    var list = [];
                    for (var i = 0; i < value.length; i++) {
                        var entry = value[i];
                        var axValue = deep ? transformJSValueToAS(sec, entry, true) : entry;
                        list.push(axValue);
                    }
                    return sec.createArray(list);
                }
                return sec.createObjectFromJS(value, deep);
            }
            AS.transformJSValueToAS = transformJSValueToAS;
            /**
             * Transforms an AS value into a JS value.
             */
            function transformASValueToJS(sec, value, deep) {
                if (typeof value !== "object") {
                    return value;
                }
                if (isNullOrUndefined(value)) {
                    return value;
                }
                if (sec.AXArray.axIsType(value)) {
                    var resultList = [];
                    var list = value.value;
                    for (var i = 0; i < list.length; i++) {
                        var entry = list[i];
                        var jsValue = deep ? transformASValueToJS(sec, entry, true) : entry;
                        resultList.push(jsValue);
                    }
                    return resultList;
                }
                var keys = Object.keys(value);
                var resultObject = {};
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var jsKey = key;
                    if (!Shumway.isNumeric(key)) {
                        release || assert(key.indexOf('$Bg') === 0);
                        jsKey = key.substr(3);
                    }
                    var v = value[key];
                    if (deep) {
                        v = transformASValueToJS(sec, v, true);
                    }
                    resultObject[jsKey] = v;
                }
                return resultObject;
            }
            AS.transformASValueToJS = transformASValueToJS;
            function transformJStoASRegExpMatchArray(sec, value) {
                var result = sec.createArray(value);
                result.axSetPublicProperty('index', value.index);
                result.axSetPublicProperty('input', value.input);
                return result;
            }
            function walk(sec, holder, name, reviver) {
                var val = holder[name];
                if (Array.isArray(val)) {
                    var v = val;
                    for (var i = 0, limit = v.length; i < limit; i++) {
                        var newElement = walk(sec, v, AVMX.axCoerceString(i), reviver);
                        if (newElement === undefined) {
                            delete v[i];
                        }
                        else {
                            v[i] = newElement;
                        }
                    }
                }
                else if (val !== null && typeof val !== 'boolean' && typeof val !== 'number' &&
                    typeof val !== 'string') {
                    for (var p in val) {
                        if (!val.hasOwnProperty(p) || !Multiname.isPublicQualifiedName(p)) {
                            break;
                        }
                        var newElement = walk(sec, val, p, reviver);
                        if (newElement === undefined) {
                            delete val[p];
                        }
                        else {
                            val[p] = newElement;
                        }
                    }
                }
                return reviver.call(holder, name, val);
            }
            var ASJSON = (function (_super) {
                __extends(ASJSON, _super);
                function ASJSON() {
                    _super.apply(this, arguments);
                }
                ASJSON.parse = function (text, reviver) {
                    if (reviver === void 0) { reviver = null; }
                    text = AVMX.axCoerceString(text);
                    if (reviver !== null && !AVMX.axIsCallable(reviver)) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, reviver, 'Function');
                    }
                    if (text === null) {
                        this.sec.throwError('SyntaxError', AVMX.Errors.JSONInvalidParseInput);
                    }
                    try {
                        var unfiltered = transformJSValueToAS(this.sec, JSON.parse(text), true);
                    }
                    catch (e) {
                        this.sec.throwError('SyntaxError', AVMX.Errors.JSONInvalidParseInput);
                    }
                    if (reviver === null) {
                        return unfiltered;
                    }
                    return walk(this.sec, { "": unfiltered }, "", reviver.value);
                };
                ASJSON.stringify = function (value, replacer, space) {
                    if (replacer === void 0) { replacer = null; }
                    if (space === void 0) { space = null; }
                    // We deliberately deviate from ECMA-262 and throw on
                    // invalid replacer parameter.
                    if (replacer !== null) {
                        var sec = typeof replacer === 'object' ? replacer.sec : null;
                        if (!sec || !(sec.AXFunction.axIsType(replacer) || sec.AXArray.axIsType(replacer))) {
                            this.sec.throwError('TypeError', AVMX.Errors.JSONInvalidReplacer);
                        }
                    }
                    var gap;
                    if (typeof space === 'string') {
                        gap = space.length > 10 ? space.substring(0, 10) : space;
                    }
                    else if (typeof space === 'number') {
                        gap = "          ".substring(0, Math.min(10, space | 0));
                    }
                    else {
                        // We follow ECMA-262 and silently ignore invalid space parameter.
                        gap = "";
                    }
                    if (replacer === null) {
                        return this.stringifySpecializedToString(value, null, null, gap);
                    }
                    else if (sec.AXArray.axIsType(replacer)) {
                        return this.stringifySpecializedToString(value, this.computePropertyList(replacer.value), null, gap);
                    }
                    else {
                        return this.stringifySpecializedToString(value, null, replacer.value, gap);
                    }
                };
                // ECMA-262 5th ed, section 15.12.3 stringify, step 4.b
                ASJSON.computePropertyList = function (r) {
                    var propertyList = [];
                    var alreadyAdded = Object.create(null);
                    for (var i = 0, length = r.length; i < length; i++) {
                        if (!r.hasOwnProperty(i)) {
                            continue;
                        }
                        var v = r[i];
                        var item = null;
                        if (typeof v === 'string') {
                            item = v;
                        }
                        else if (typeof v === 'number') {
                            item = AVMX.axCoerceString(v);
                        }
                        if (item !== null && !alreadyAdded[item]) {
                            alreadyAdded[item] = true;
                            propertyList.push(item);
                        }
                    }
                    return propertyList;
                };
                ASJSON.stringifySpecializedToString = function (value, replacerArray, replacerFunction, gap) {
                    try {
                        // In AS3 |JSON.stringify(undefined)| returns "null", while JS returns |undefined|.
                        // TODO: Is there anything to be done in case of a |replacerFunction| function?
                        if (value === undefined) {
                            return "null";
                        }
                        return JSON.stringify(transformASValueToJS(this.sec, value, true), replacerFunction, gap);
                    }
                    catch (e) {
                        this.sec.throwError('TypeError', AVMX.Errors.JSONCyclicStructure);
                    }
                };
                return ASJSON;
            })(ASObject);
            AS.ASJSON = ASJSON;
            var builtinNativeClasses = Shumway.ObjectUtilities.createMap();
            var nativeClasses = Shumway.ObjectUtilities.createMap();
            var nativeClassLoaderNames = [];
            function initializeBuiltins() {
                builtinNativeClasses["Object"] = ASObject;
                builtinNativeClasses["Class"] = ASClass;
                builtinNativeClasses["Function"] = ASFunction;
                builtinNativeClasses["Boolean"] = ASBoolean;
                builtinNativeClasses["builtin.as$0.MethodClosure"] = ASMethodClosure;
                builtinNativeClasses["Namespace"] = AS.ASNamespace;
                builtinNativeClasses["Number"] = ASNumber;
                builtinNativeClasses["int"] = ASInt;
                builtinNativeClasses["uint"] = ASUint;
                builtinNativeClasses["String"] = ASString;
                builtinNativeClasses["Array"] = ASArray;
                builtinNativeClasses["__AS3__.vec.Vector"] = AS.Vector;
                builtinNativeClasses["__AS3__.vec.Vector$object"] = AS.GenericVector;
                builtinNativeClasses["__AS3__.vec.Vector$int"] = AS.Int32Vector;
                builtinNativeClasses["__AS3__.vec.Vector$uint"] = AS.Uint32Vector;
                builtinNativeClasses["__AS3__.vec.Vector$double"] = AS.Float64Vector;
                builtinNativeClasses["Namespace"] = AS.ASNamespace;
                builtinNativeClasses["QName"] = AS.ASQName;
                builtinNativeClasses["XML"] = AS.ASXML;
                builtinNativeClasses["XMLList"] = AS.ASXMLList;
                builtinNativeClasses["flash.xml.XMLNode"] = AS.flash.xml.XMLNode;
                builtinNativeClasses["flash.xml.XMLDocument"] = AS.flash.xml.XMLDocument;
                builtinNativeClasses["flash.xml.XMLParser"] = AS.flash.xml.XMLParser;
                builtinNativeClasses["flash.xml.XMLTag"] = AS.flash.xml.XMLTag;
                builtinNativeClasses["flash.xml.XMLNodeType"] = AS.flash.xml.XMLNodeType;
                builtinNativeClasses["Math"] = ASMath;
                builtinNativeClasses["Date"] = AS.ASDate;
                builtinNativeClasses["RegExp"] = ASRegExp;
                builtinNativeClasses["JSON"] = ASJSON;
                builtinNativeClasses["flash.utils.Proxy"] = AS.flash.utils.ASProxy;
                builtinNativeClasses["flash.utils.Dictionary"] = AS.flash.utils.Dictionary;
                builtinNativeClasses["flash.utils.ByteArray"] = AS.flash.utils.ByteArray;
                builtinNativeClasses["avmplus.System"] = AS.flash.system.OriginalSystem;
                // Errors
                builtinNativeClasses["Error"] = ASError;
                builtinNativeClasses["DefinitionError"] = ASDefinitionError;
                builtinNativeClasses["EvalError"] = ASEvalError;
                builtinNativeClasses["RangeError"] = ASRangeError;
                builtinNativeClasses["ReferenceError"] = ASReferenceError;
                builtinNativeClasses["SecurityError"] = ASSecurityError;
                builtinNativeClasses["SyntaxError"] = ASSyntaxError;
                builtinNativeClasses["TypeError"] = ASTypeError;
                builtinNativeClasses["URIError"] = ASURIError;
                builtinNativeClasses["VerifyError"] = ASVerifyError;
                builtinNativeClasses["UninitializedError"] = ASUninitializedError;
                builtinNativeClasses["ArgumentError"] = ASArgumentError;
                builtinNativeClasses["flash.errors.IOError"] = ASIOError;
                builtinNativeClasses["flash.errors.EOFError"] = ASEOFError;
                builtinNativeClasses["flash.errors.MemoryError"] = ASMemoryError;
                builtinNativeClasses["flash.errors.IllegalOperationError"] = ASIllegalOperationError;
            }
            AS.initializeBuiltins = initializeBuiltins;
            function registerNativeClass(name, asClass, alias, nsType) {
                if (alias === void 0) { alias = name; }
                if (nsType === void 0) { nsType = 0 /* Public */; }
                release || assert(!nativeClasses[name], "Native class: " + name + " is already registered.");
                nativeClasses[name] = asClass;
                nativeClassLoaderNames.push({ name: name, alias: alias, nsType: nsType });
            }
            AS.registerNativeClass = registerNativeClass;
            function registerNativeFunction(path, fun) {
                release || assert(!nativeFunctions[path], "Native function: " + path + " is already registered.");
                nativeFunctions[path] = fun;
            }
            AS.registerNativeFunction = registerNativeFunction;
            registerNativeClass("__AS3__.vec.Vector$object", AS.GenericVector, 'ObjectVector', 2 /* PackageInternal */);
            registerNativeClass("__AS3__.vec.Vector$int", AS.Int32Vector, 'Int32Vector', 2 /* PackageInternal */);
            registerNativeClass("__AS3__.vec.Vector$uint", AS.Uint32Vector, 'Uint32Vector', 2 /* PackageInternal */);
            registerNativeClass("__AS3__.vec.Vector$double", AS.Float64Vector, 'Float64Vector', 2 /* PackageInternal */);
            function FlashUtilScript_getDefinitionByName(sec, name) {
                var simpleName = String(name).replace("::", ".");
                return AVMX.getCurrentABC().env.app.getClass(Multiname.FromSimpleName(simpleName));
            }
            function FlashUtilScript_getTimer(sec) {
                return Date.now() - sec.flash.display.Loader.axClass.runtimeStartTime;
            }
            AS.FlashUtilScript_getTimer = FlashUtilScript_getTimer;
            function FlashNetScript_navigateToURL(sec, request, window_) {
                if (request === null || request === undefined) {
                    sec.throwError('TypeError', AVMX.Errors.NullPointerError, 'request');
                }
                var RequestClass = sec.flash.net.URLRequest.axClass;
                if (!RequestClass.axIsType(request)) {
                    sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, request, 'flash.net.URLRequest');
                }
                var url = request.url;
                if (isNullOrUndefined(url)) {
                    sec.throwError('TypeError', AVMX.Errors.NullPointerError, 'url');
                }
                if (url.toLowerCase().indexOf('fscommand:') === 0) {
                    var fscommand = sec.flash.system.fscommand.value;
                    fscommand(sec, url.substring('fscommand:'.length), window_);
                    return;
                }
                // TODO handle other methods than GET
                Shumway.FileLoadingService.instance.navigateTo(url, window_);
            }
            AS.FlashNetScript_navigateToURL = FlashNetScript_navigateToURL;
            function FlashNetScript_sendToURL(sec, request) {
                if (isNullOrUndefined(request)) {
                    sec.throwError('TypeError', AVMX.Errors.NullPointerError, 'request');
                }
                var RequestClass = sec.flash.net.URLRequest.axClass;
                if (!RequestClass.axIsType(request)) {
                    sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, request, 'flash.net.URLRequest');
                }
                var session = Shumway.FileLoadingService.instance.createSession();
                session.onprogress = function () {
                    // ...
                };
                session.open(request);
            }
            function Toplevel_registerClassAlias(sec, aliasName, classObject) {
                aliasName = AVMX.axCoerceString(aliasName);
                if (!aliasName) {
                    sec.throwError('TypeError', AVMX.Errors.NullPointerError, 'aliasName');
                }
                if (!classObject) {
                    sec.throwError('TypeError', AVMX.Errors.NullPointerError, 'classObject');
                }
                sec.classAliases.registerClassAlias(aliasName, classObject);
            }
            function Toplevel_getClassByAlias(sec, aliasName) {
                aliasName = AVMX.axCoerceString(aliasName);
                if (!aliasName) {
                    sec.throwError('TypeError', AVMX.Errors.NullPointerError, 'aliasName');
                }
                var axClass = sec.classAliases.getClassByAlias(aliasName);
                if (!axClass) {
                    sec.throwError('ReferenceError', AVMX.Errors.ClassNotFoundError, aliasName);
                }
                return axClass;
            }
            registerNativeFunction('FlashUtilScript::getDefinitionByName', FlashUtilScript_getDefinitionByName);
            registerNativeFunction('FlashUtilScript::getTimer', FlashUtilScript_getTimer);
            registerNativeFunction('FlashUtilScript::navigateToURL', FlashNetScript_navigateToURL);
            registerNativeFunction('FlashNetScript::navigateToURL', FlashNetScript_navigateToURL);
            registerNativeFunction('FlashNetScript::sendToURL', FlashNetScript_sendToURL);
            registerNativeFunction('FlashUtilScript::escapeMultiByte', wrapJSGlobalFunction(jsGlobal.escape));
            registerNativeFunction('FlashUtilScript::unescapeMultiByte', wrapJSGlobalFunction(jsGlobal.unescape));
            registerNativeFunction('Toplevel::registerClassAlias', Toplevel_registerClassAlias);
            registerNativeFunction('Toplevel::getClassByAlias', Toplevel_getClassByAlias);
            function getNativesForTrait(trait) {
                var className = null;
                var natives;
                if (trait.holder instanceof AVMX.InstanceInfo) {
                    var instanceInfo = trait.holder;
                    className = instanceInfo.getClassName();
                    var native = builtinNativeClasses[className] || nativeClasses[className];
                    release || assert(native, "Class native is not defined: " + className);
                    natives = [native.prototype];
                    if (native.instanceNatives) {
                        pushMany(natives, native.instanceNatives);
                    }
                }
                else if (trait.holder instanceof AVMX.ClassInfo) {
                    var classInfo = trait.holder;
                    className = classInfo.instanceInfo.getClassName();
                    var native = builtinNativeClasses[className] || nativeClasses[className];
                    release || assert(native, "Class native is not defined: " + className);
                    natives = [native];
                    if (native.classNatives) {
                        pushMany(natives, native.classNatives);
                    }
                }
                else {
                    release || assertUnreachable('Invalid trait type');
                }
                return natives;
            }
            AS.getNativesForTrait = getNativesForTrait;
            function getNativeInitializer(classInfo) {
                var methodInfo = classInfo.instanceInfo.getInitializer();
                var className = classInfo.instanceInfo.getClassName();
                var asClass = builtinNativeClasses[className] || nativeClasses[className];
                if (methodInfo.isNative()) {
                    // Use TS constructor as the initializer function.
                    return asClass;
                }
                //// TODO: Assert eagerly.
                //return function () {
                //  release || assert (!methodInfo.isNative(), "Must supply a constructor for " + classInfo +
                // "."); }
                return null;
            }
            AS.getNativeInitializer = getNativeInitializer;
            /**
             * Searches for a native property in a list of native holders.
             */
            function getMethodOrAccessorNative(trait) {
                var natives = getNativesForTrait(trait);
                var name = trait.getName().name;
                for (var i = 0; i < natives.length; i++) {
                    var native = natives[i];
                    var fullName = name;
                    // We prefix methods that should not be exported with "native_", check to see
                    // if a method exists with that prefix first when looking for native methods.
                    if (!hasOwnProperty(native, name) && hasOwnProperty(native, "native_" + name)) {
                        fullName = "native_" + name;
                    }
                    if (hasOwnProperty(native, fullName)) {
                        var value;
                        if (trait.isAccessor()) {
                            var pd = Object.getOwnPropertyDescriptor(native, fullName);
                            if (trait.isGetter()) {
                                value = pd.get;
                            }
                            else {
                                value = pd.set;
                            }
                        }
                        else {
                            release || assert(trait.isMethod());
                            value = native[fullName];
                        }
                        release || assert(value, "Method or Accessor property exists but it's undefined: " + trait.holder + " " + trait);
                        return value;
                    }
                }
                Shumway.Debug.warning("No native method for: " + trait.holder + " " + trait + ", make sure you've got the static keyword for static methods.");
                release || assertUnreachable("Cannot find " + trait + " in natives.");
                return null;
            }
            AS.getMethodOrAccessorNative = getMethodOrAccessorNative;
            function tryLinkNativeClass(axClass) {
                var className = axClass.classInfo.instanceInfo.getClassName();
                var asClass = builtinNativeClasses[className] || nativeClasses[className];
                if (asClass) {
                    linkClass(axClass, asClass);
                }
            }
            AS.tryLinkNativeClass = tryLinkNativeClass;
            /**
             * Returns |true| if the symbol is available in debug or release modes. Only symbols
             * followed by the  "!" suffix are available in release builds.
             */
            function containsSymbol(symbols, name) {
                for (var i = 0; i < symbols.length; i++) {
                    var symbol = symbols[i];
                    if (symbol.indexOf(name) >= 0) {
                        var releaseSymbol = symbol[symbol.length - 1] === "!";
                        if (releaseSymbol) {
                            symbol = symbol.slice(0, symbol.length - 1);
                        }
                        if (name !== symbol) {
                            continue;
                        }
                        if (release) {
                            return releaseSymbol;
                        }
                        return true;
                    }
                }
                return false;
            }
            function linkSymbols(symbols, traits, object) {
                for (var i = 0; i < traits.traits.length; i++) {
                    var trait = traits.traits[i];
                    if (!containsSymbol(symbols, trait.getName().name)) {
                        continue;
                    }
                    release || assert(trait.getName().namespace.type !== 3 /* Private */, "Why are you linking against private members?");
                    if (trait.isConst()) {
                        release || release || notImplemented("Don't link against const traits.");
                        return;
                    }
                    var name = trait.getName().name;
                    var qn = trait.getName().getMangledName();
                    if (trait.isSlot()) {
                        Object.defineProperty(object, name, {
                            get: new Function("", "return this." + qn +
                                "//# sourceURL=get-" + qn + ".as"),
                            set: new Function("v", "this." + qn + " = v;" +
                                "//# sourceURL=set-" + qn + ".as")
                        });
                    }
                    else if (trait.isGetter()) {
                        release || assert(hasOwnGetter(object, qn), "There should be an getter method for this symbol.");
                        Object.defineProperty(object, name, {
                            get: new Function("", "return this." + qn +
                                "//# sourceURL=get-" + qn + ".as")
                        });
                    }
                    else {
                        notImplemented(trait.toString());
                    }
                }
            }
            function filter(propertyName) {
                return propertyName.indexOf("native_") !== 0;
            }
            var axTrapNames = [
                "axResolveMultiname",
                "axHasProperty",
                "axDeleteProperty",
                "axCallProperty",
                "axCallSuper",
                "axConstructProperty",
                "axHasPropertyInternal",
                "axHasOwnProperty",
                "axSetProperty",
                "axGetProperty",
                "axGetSuper",
                "axSetSuper",
                "axNextNameIndex",
                "axNextName",
                "axNextValue",
                "axGetEnumerableKeys",
                "axHasPublicProperty",
                "axSetPublicProperty",
                "axGetPublicProperty",
                "axCallPublicProperty",
                "axDeletePublicProperty",
                "axSetNumericProperty",
                "axGetNumericProperty",
                "axGetSlot",
                "axSetSlot"
            ];
            function linkClass(axClass, asClass) {
                // Save asClass on the axClass.
                axClass.asClass = asClass;
                // TypeScript's static inheritance can lead to subtle linking bugs. Make sure we don't fall
                // victim to this by checking that we don't inherit non-null static properties.
                if (false && !release && axClass.superClass) {
                    if (asClass.classSymbols) {
                        release || assert(asClass.classSymbols !== axClass.superClass.asClass.classSymbols, "Make sure class " + axClass + " doesn't inherit super class's classSymbols.");
                    }
                    if (asClass.instanceSymbols) {
                        release || assert(asClass.instanceSymbols !== axClass.superClass.asClass.instanceSymbols, "Make sure class " + axClass + " doesn't inherit super class's instanceSymbols.");
                    }
                    if (asClass.classInitializer) {
                        release || assert(asClass.classInitializer !== axClass.superClass.asClass.classInitializer, "Make sure class " + axClass + " doesn't inherit super class's class initializer.");
                    }
                }
                if (asClass.classSymbols) {
                    linkSymbols(asClass.classSymbols, axClass.classInfo.traits, axClass);
                }
                if (asClass.instanceSymbols) {
                    linkSymbols(asClass.instanceSymbols, axClass.classInfo.instanceInfo.traits, axClass.tPrototype);
                }
                // Copy class methods and properties.
                if (asClass.classNatives) {
                    for (var i = 0; i < asClass.classNatives.length; i++) {
                        copyOwnPropertyDescriptors(axClass, asClass.classNatives[i], filter);
                    }
                }
                copyOwnPropertyDescriptors(axClass, asClass, filter, true, true);
                if (axClass.superClass) {
                }
                // Copy instance methods and properties.
                if (asClass.instanceNatives) {
                    for (var i = 0; i < asClass.instanceNatives.length; i++) {
                        copyOwnPropertyDescriptors(axClass.dPrototype, asClass.instanceNatives[i], filter);
                    }
                }
                // Inherit or override prototype descriptors from the template class.
                copyOwnPropertyDescriptors(axClass.dPrototype, asClass.prototype, filter);
                // Copy inherited traps. We want to make sure we copy all the in inherited traps, not just the
                // traps defined in asClass.Prototype.
                copyPropertiesByList(axClass.dPrototype, asClass.prototype, axTrapNames);
                if (asClass.classInitializer) {
                    asClass.classInitializer.call(axClass, asClass);
                    if (!release) {
                        Object.freeze(asClass);
                    }
                }
                AVMX.runtimeWriter && traceASClass(axClass, asClass);
            }
            function traceASClass(axClass, asClass) {
                AVMX.runtimeWriter.enter("Class: " + axClass.classInfo);
                AVMX.runtimeWriter.enter("Traps:");
                for (var k in asClass.prototype) {
                    if (k.indexOf("ax") !== 0) {
                        continue;
                    }
                    var hasOwn = asClass.hasOwnProperty(k);
                    AVMX.runtimeWriter.writeLn((hasOwn ? "Own" : "Inherited") + " trap: " + k);
                }
                AVMX.runtimeWriter.leave();
                AVMX.runtimeWriter.leave();
            }
            /**
             * Creates a self patching getter that lazily constructs the class and memoizes
             * to the class's instance constructor.
             */
            function defineClassLoader(applicationDomain, container, mn, classAlias) {
                Object.defineProperty(container, classAlias, {
                    get: function () {
                        AVMX.runtimeWriter && AVMX.runtimeWriter.writeLn("Running Memoizer: " + mn.name);
                        var axClass = applicationDomain.getClass(mn);
                        release || assert(axClass, "Class " + mn + " is not found.");
                        release || assert(axClass.axConstruct);
                        var loader = function () {
                            return axClass.axConstruct(arguments);
                        };
                        loader.axIsType = function (value) {
                            return axClass.axIsType(value);
                        };
                        loader.axClass = axClass;
                        Object.defineProperty(container, classAlias, {
                            value: loader,
                            writable: false
                        });
                        return loader;
                    },
                    configurable: true
                });
            }
            var createContainersFromPath = function (pathTokens, container) {
                for (var i = 0, j = pathTokens.length; i < j; i++) {
                    if (!container[pathTokens[i]]) {
                        container[pathTokens[i]] = Object.create(null);
                    }
                    container = container[pathTokens[i]];
                }
                return container;
            };
            function makeClassLoader(applicationDomain, container, classPath, aliasPath, nsType) {
                AVMX.runtimeWriter && AVMX.runtimeWriter.writeLn("Defining Memoizer: " + classPath);
                var aliasPathTokens = aliasPath.split(".");
                var aliasClassName = aliasPathTokens.pop();
                container = createContainersFromPath(aliasPathTokens, container);
                var mn = Multiname.FromFQNString(classPath, nsType);
                defineClassLoader(applicationDomain, container, mn, aliasClassName);
            }
            /**
             * Installs class loaders for all the previously registered native classes.
             */
            function installClassLoaders(applicationDomain, container) {
                for (var i = 0; i < nativeClassLoaderNames.length; i++) {
                    var loaderName = nativeClassLoaderNames[i].name;
                    var loaderAlias = nativeClassLoaderNames[i].alias;
                    var nsType = nativeClassLoaderNames[i].nsType;
                    makeClassLoader(applicationDomain, container, loaderName, loaderAlias, nsType);
                }
            }
            AS.installClassLoaders = installClassLoaders;
            /**
             * Installs all the previously registered native functions on the AXSecurityDomain.
             *
             * Note that this doesn't use memoizers and doesn't run the functions' AS3 script.
             */
            function installNativeFunctions(sec) {
                for (var i in nativeFunctions) {
                    var pathTokens = i.split('.');
                    var funName = pathTokens.pop();
                    var container = createContainersFromPath(pathTokens, sec);
                    container[funName] = sec.boxFunction(nativeFunctions[i]);
                }
            }
            AS.installNativeFunctions = installNativeFunctions;
        })(AS = AVMX.AS || (AVMX.AS = {}));
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var AS;
        (function (AS) {
            var assert = Shumway.Debug.assert;
            var assertNotImplemented = Shumway.Debug.assertNotImplemented;
            var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
            var BaseVector = (function (_super) {
                __extends(BaseVector, _super);
                function BaseVector() {
                    _super.apply(this, arguments);
                }
                BaseVector.prototype.axGetProperty = function (mn) {
                    var nm = mn.name;
                    nm = typeof nm === 'number' ? nm : AVMX.axCoerceName(nm);
                    if ((nm | 0) === nm || Shumway.isNumeric(nm)) {
                        release || assert(mn.isRuntimeName());
                        return this.axGetNumericProperty(typeof nm === 'number' ? nm : nm | 0);
                    }
                    return _super.prototype.axGetProperty.call(this, mn);
                };
                BaseVector.prototype.axSetProperty = function (mn, value, bc) {
                    release || AVMX.checkValue(value);
                    var nm = mn.name;
                    nm = typeof nm === 'number' ? nm : AVMX.axCoerceName(nm);
                    if ((nm | 0) === nm || Shumway.isNumeric(nm)) {
                        release || assert(mn.isRuntimeName());
                        this.axSetNumericProperty(typeof nm === 'number' ? nm : nm | 0, value);
                        return;
                    }
                    _super.prototype.axSetProperty.call(this, mn, value, bc);
                };
                BaseVector.prototype.axGetPublicProperty = function (nm) {
                    nm = typeof nm === 'number' ? nm : AVMX.axCoerceName(nm);
                    if ((nm | 0) === nm || Shumway.isNumeric(nm)) {
                        return this.axGetNumericProperty(typeof nm === 'number' ? nm : nm | 0);
                    }
                    return this['$Bg' + nm];
                };
                BaseVector.prototype.axSetPublicProperty = function (nm, value) {
                    release || AVMX.checkValue(value);
                    nm = typeof nm === 'number' ? nm : AVMX.axCoerceName(nm);
                    if ((nm | 0) === nm || Shumway.isNumeric(nm)) {
                        this.axSetNumericProperty(typeof nm === 'number' ? nm : nm | 0, value);
                        return;
                    }
                    this['$Bg' + nm] = value;
                };
                BaseVector.prototype.axNextName = function (index) {
                    return index - 1;
                };
                /**
                 * Throws exceptions for the cases where Flash does, and returns false if the callback
                 * is null or undefined. In that case, the calling function returns its default value.
                 */
                BaseVector.prototype.checkVectorMethodArgs = function (callback, thisObject) {
                    if (Shumway.isNullOrUndefined(callback)) {
                        return false;
                    }
                    var sec = this.sec;
                    if (!AVMX.axIsCallable(callback)) {
                        sec.throwError("TypeError", AVMX.Errors.CheckTypeFailedError, callback, 'Function');
                    }
                    if (callback.axClass === sec.AXMethodClosure &&
                        !Shumway.isNullOrUndefined(thisObject)) {
                        sec.throwError("TypeError", AVMX.Errors.ArrayFilterNonNullObjectError);
                    }
                    return true;
                };
                return BaseVector;
            })(AS.ASObject);
            AS.BaseVector = BaseVector;
            var Vector = (function (_super) {
                __extends(Vector, _super);
                function Vector() {
                    _super.apply(this, arguments);
                }
                Vector.axIsType = function (x) {
                    return this.dPrototype.isPrototypeOf(x) ||
                        this.sec.Int32Vector.axClass.dPrototype.isPrototypeOf(x) ||
                        this.sec.Uint32Vector.axClass.dPrototype.isPrototypeOf(x) ||
                        this.sec.Float64Vector.axClass.dPrototype.isPrototypeOf(x) ||
                        this.sec.ObjectVector.axClass.dPrototype.isPrototypeOf(x);
                };
                return Vector;
            })(AS.ASObject);
            AS.Vector = Vector;
            var GenericVector = (function (_super) {
                __extends(GenericVector, _super);
                function GenericVector(length, fixed) {
                    if (length === void 0) { length = 0; }
                    if (fixed === void 0) { fixed = false; }
                    _super.call(this);
                    length = length >>> 0;
                    fixed = !!fixed;
                    this._fixed = !!fixed;
                    this._buffer = new Array(length);
                    this._fill(0, length, this.axClass.defaultValue);
                }
                GenericVector.classInitializer = function () {
                    var proto = this.dPrototype;
                    var tProto = this.tPrototype;
                    // Fix up MOP handlers to not apply to the dynamic prototype, which is a plain object.
                    tProto.axGetProperty = proto.axGetProperty;
                    tProto.axGetNumericProperty = proto.axGetNumericProperty;
                    tProto.axSetProperty = proto.axSetProperty;
                    tProto.axSetNumericProperty = proto.axSetNumericProperty;
                    tProto.axHasPropertyInternal = proto.axHasPropertyInternal;
                    tProto.axNextName = proto.axNextName;
                    tProto.axNextNameIndex = proto.axNextNameIndex;
                    tProto.axNextValue = proto.axNextValue;
                    proto.axGetProperty = AS.ASObject.prototype.axGetProperty;
                    proto.axGetNumericProperty = AS.ASObject.prototype.axGetNumericProperty;
                    proto.axSetProperty = AS.ASObject.prototype.axSetProperty;
                    proto.axSetNumericProperty = AS.ASObject.prototype.axSetNumericProperty;
                    proto.axHasPropertyInternal = AS.ASObject.prototype.axHasPropertyInternal;
                    proto.axNextName = AS.ASObject.prototype.axNextName;
                    proto.axNextNameIndex = AS.ASObject.prototype.axNextNameIndex;
                    proto.axNextValue = AS.ASObject.prototype.axNextValue;
                    var asProto = GenericVector.prototype;
                    defineNonEnumerableProperty(proto, '$Bgjoin', asProto.join);
                    // Same as join, see VectorImpl.as in Tamarin repository.
                    defineNonEnumerableProperty(proto, '$BgtoString', asProto.join);
                    defineNonEnumerableProperty(proto, '$BgtoLocaleString', asProto.toLocaleString);
                    defineNonEnumerableProperty(proto, '$Bgpop', asProto.pop);
                    defineNonEnumerableProperty(proto, '$Bgpush', asProto.push);
                    defineNonEnumerableProperty(proto, '$Bgreverse', asProto.reverse);
                    defineNonEnumerableProperty(proto, '$Bgconcat', asProto.concat);
                    defineNonEnumerableProperty(proto, '$Bgsplice', asProto.splice);
                    defineNonEnumerableProperty(proto, '$Bgslice', asProto.slice);
                    defineNonEnumerableProperty(proto, '$Bgshift', asProto.shift);
                    defineNonEnumerableProperty(proto, '$Bgunshift', asProto.unshift);
                    defineNonEnumerableProperty(proto, '$BgindexOf', asProto.indexOf);
                    defineNonEnumerableProperty(proto, '$BglastIndexOf', asProto.lastIndexOf);
                    defineNonEnumerableProperty(proto, '$BgforEach', asProto.forEach);
                    defineNonEnumerableProperty(proto, '$Bgmap', asProto.map);
                    defineNonEnumerableProperty(proto, '$Bgfilter', asProto.filter);
                    defineNonEnumerableProperty(proto, '$Bgsome', asProto.some);
                    defineNonEnumerableProperty(proto, '$Bgevery', asProto.every);
                    defineNonEnumerableProperty(proto, '$Bgsort', asProto.sort);
                    defineNonEnumerableProperty(proto, 'checkVectorMethodArgs', asProto.checkVectorMethodArgs);
                };
                GenericVector.axApply = function (_, args) {
                    var object = args[0];
                    if (this.axIsType(object)) {
                        return object;
                    }
                    var length = object.axGetPublicProperty("length");
                    if (length !== undefined) {
                        var v = this.axConstruct([length, false]);
                        for (var i = 0; i < length; i++) {
                            v.axSetNumericProperty(i, object.axGetPublicProperty(i));
                        }
                        return v;
                    }
                    Shumway.Debug.unexpected();
                };
                GenericVector.defaultCompareFunction = function (a, b) {
                    return String(a).localeCompare(String(b));
                };
                GenericVector.compare = function (a, b, options, compareFunction) {
                    release || assertNotImplemented(!(options & GenericVector.CASEINSENSITIVE), "CASEINSENSITIVE");
                    release || assertNotImplemented(!(options & GenericVector.UNIQUESORT), "UNIQUESORT");
                    release || assertNotImplemented(!(options & GenericVector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
                    var result = 0;
                    if (!compareFunction) {
                        compareFunction = GenericVector.defaultCompareFunction;
                    }
                    if (options & GenericVector.NUMERIC) {
                        a = Shumway.toNumber(a);
                        b = Shumway.toNumber(b);
                        result = a < b ? -1 : (a > b ? 1 : 0);
                    }
                    else {
                        result = compareFunction(a, b);
                    }
                    if (options & GenericVector.DESCENDING) {
                        result *= -1;
                    }
                    return result;
                };
                GenericVector.prototype._fill = function (index, length, value) {
                    for (var i = 0; i < length; i++) {
                        this._buffer[index + i] = value;
                    }
                };
                /**
                 * Can't use Array.prototype.toString because it doesn't print |null|s the same way as AS3.
                 */
                GenericVector.prototype.toString = function () {
                    var result = [];
                    for (var i = 0; i < this._buffer.length; i++) {
                        var entry = this._buffer[i];
                        result.push(entry === null ? 'null' : (entry + ''));
                    }
                    return result.join(',');
                };
                GenericVector.prototype.toLocaleString = function () {
                    var result = [];
                    for (var i = 0; i < this._buffer.length; i++) {
                        var entry = this._buffer[i];
                        if (entry && typeof entry === 'object') {
                            result.push(entry.$BgtoLocaleString());
                        }
                        else {
                            result.push(entry + '');
                        }
                    }
                    return result.join(',');
                };
                GenericVector.prototype.sort = function (sortBehavior) {
                    if (arguments.length === 0) {
                        this._buffer.sort();
                        return this;
                    }
                    if (this.sec.AXFunction.axIsType(sortBehavior)) {
                        this._buffer.sort(sortBehavior.value);
                        return this;
                    }
                    var options = sortBehavior | 0;
                    release || assertNotImplemented(!(options & AS.Int32Vector.UNIQUESORT), "UNIQUESORT");
                    release || assertNotImplemented(!(options & AS.Int32Vector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
                    if (options & GenericVector.NUMERIC) {
                        if (options & GenericVector.DESCENDING) {
                            this._buffer.sort(function (a, b) { return AVMX.axCoerceNumber(b) - AVMX.axCoerceNumber(a); });
                            return this;
                        }
                        this._buffer.sort(function (a, b) { return AVMX.axCoerceNumber(a) - AVMX.axCoerceNumber(b); });
                        return this;
                    }
                    if (options & GenericVector.CASEINSENSITIVE) {
                        if (options & GenericVector.DESCENDING) {
                            this._buffer.sort(function (a, b) { return AVMX.axCoerceString(b).toLowerCase() -
                                AVMX.axCoerceString(a).toLowerCase(); });
                            return this;
                        }
                        this._buffer.sort(function (a, b) { return AVMX.axCoerceString(a).toLowerCase() -
                            AVMX.axCoerceString(b).toLowerCase(); });
                        return this;
                    }
                    if (options & GenericVector.DESCENDING) {
                        this._buffer.sort(function (a, b) { return b - a; });
                        return this;
                    }
                    this._buffer.sort();
                    return this;
                };
                /**
                 * Executes a |callback| function with three arguments: element, index, the vector itself as
                 * well as passing the |thisObject| as |this| for each of the elements in the vector. If any of
                 * the callbacks return |false| the function terminates, otherwise it returns |true|.
                 */
                GenericVector.prototype.every = function (callback, thisObject) {
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return true;
                    }
                    for (var i = 0; i < this._buffer.length; i++) {
                        if (!callback.axCall(thisObject, this.axGetNumericProperty(i), i, this)) {
                            return false;
                        }
                    }
                    return true;
                };
                /**
                 * Filters the elements for which the |callback| method returns |true|. The |callback| function
                 * is called with three arguments: element, index, the vector itself as well as passing the
                 * |thisObject| as |this| for each of the elements in the vector.
                 */
                GenericVector.prototype.filter = function (callback, thisObject) {
                    var v = this.axClass.axConstruct([0, false]);
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return v;
                    }
                    for (var i = 0; i < this._buffer.length; i++) {
                        if (callback.call(thisObject, this.axGetNumericProperty(i), i, this)) {
                            v.push(this.axGetNumericProperty(i));
                        }
                    }
                    return v;
                };
                GenericVector.prototype.map = function (callback, thisObject) {
                    var v = this.axClass.axConstruct([this.length, false]);
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return v;
                    }
                    for (var i = 0; i < this._buffer.length; i++) {
                        v.push(this._coerce(callback.call(thisObject, this.axGetNumericProperty(i), i, this)));
                    }
                    return v;
                };
                GenericVector.prototype.some = function (callback, thisObject) {
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return false;
                    }
                    for (var i = 0; i < this._buffer.length; i++) {
                        if (callback.call(thisObject, this.axGetNumericProperty(i), i, this)) {
                            return true;
                        }
                    }
                    return false;
                };
                GenericVector.prototype.forEach = function (callback, thisObject) {
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return;
                    }
                    for (var i = 0; i < this._buffer.length; i++) {
                        callback.call(thisObject, this.axGetNumericProperty(i), i, this);
                    }
                };
                GenericVector.prototype.join = function (separator) {
                    if (separator === void 0) { separator = ','; }
                    var buffer = this._buffer;
                    var limit = this._buffer.length;
                    var result = "";
                    for (var i = 0; i < limit - 1; i++) {
                        result += buffer[i] + separator;
                    }
                    if (limit > 0) {
                        result += buffer[limit - 1];
                    }
                    return result;
                };
                GenericVector.prototype.indexOf = function (searchElement, fromIndex) {
                    if (fromIndex === void 0) { fromIndex = 0; }
                    return this._buffer.indexOf(searchElement, fromIndex);
                };
                GenericVector.prototype.lastIndexOf = function (searchElement, fromIndex) {
                    if (fromIndex === void 0) { fromIndex = 0x7fffffff; }
                    return this._buffer.lastIndexOf(searchElement, fromIndex);
                };
                GenericVector.prototype.push = function (arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8 /*...rest*/) {
                    this._checkFixed();
                    for (var i = 0; i < arguments.length; i++) {
                        this._buffer.push(this._coerce(arguments[i]));
                    }
                };
                GenericVector.prototype.pop = function () {
                    this._checkFixed();
                    if (this._buffer.length === 0) {
                        return undefined;
                    }
                    return this._buffer.pop();
                };
                GenericVector.prototype.concat = function () {
                    // TODO: need to type check the arguments, but isType doesn't exist.
                    var buffers = [];
                    for (var i = 0; i < arguments.length; i++) {
                        buffers.push(this._coerce(arguments[i])._buffer);
                    }
                    var buffer = this._buffer.concat.apply(this._buffer, buffers);
                    var result = this.axClass.axConstruct([]);
                    result._buffer = buffer;
                    return result;
                };
                GenericVector.prototype.reverse = function () {
                    this._buffer.reverse();
                    return this;
                };
                GenericVector.prototype._coerce = function (v) {
                    return this.axClass.type.axCoerce(v);
                };
                GenericVector.prototype.shift = function () {
                    this._checkFixed();
                    if (this._buffer.length === 0) {
                        return undefined;
                    }
                    return this._buffer.shift();
                };
                GenericVector.prototype.unshift = function () {
                    if (!arguments.length) {
                        return;
                    }
                    this._checkFixed();
                    for (var i = 0; i < arguments.length; i++) {
                        this._buffer.unshift(this._coerce(arguments[i]));
                    }
                };
                GenericVector.prototype.slice = function (start, end) {
                    if (start === void 0) { start = 0; }
                    if (end === void 0) { end = 0x7fffffff; }
                    var buffer = this._buffer;
                    var length = buffer.length;
                    var first = Math.min(Math.max(start, 0), length);
                    var last = Math.min(Math.max(end, first), length);
                    var result = this.axClass.axConstruct([last - first, this.fixed]);
                    result._buffer = buffer.slice(first, last);
                    return result;
                };
                GenericVector.prototype.splice = function (start, deleteCount_ /*, ...items */) {
                    var buffer = this._buffer;
                    var length = buffer.length;
                    var first = Math.min(Math.max(start, 0), length);
                    var deleteCount = Math.min(Math.max(deleteCount_, 0), length - first);
                    var insertCount = arguments.length - 2;
                    if (deleteCount !== insertCount) {
                        this._checkFixed();
                    }
                    var items = [first, deleteCount];
                    for (var i = 2; i < insertCount + 2; i++) {
                        items[i] = this._coerce(arguments[i]);
                    }
                    var result = this.axClass.axConstruct([deleteCount, this.fixed]);
                    result._buffer = buffer.splice.apply(buffer, items);
                    return result;
                };
                Object.defineProperty(GenericVector.prototype, "length", {
                    get: function () {
                        return this._buffer.length;
                    },
                    set: function (value) {
                        value = value >>> 0;
                        if (value > this._buffer.length) {
                            for (var i = this._buffer.length; i < value; i++) {
                                this._buffer[i] = this.axClass.defaultValue;
                            }
                        }
                        else {
                            this._buffer.length = value;
                        }
                        release || assert(this._buffer.length === value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(GenericVector.prototype, "fixed", {
                    get: function () {
                        return this._fixed;
                    },
                    set: function (f) {
                        this._fixed = !!f;
                    },
                    enumerable: true,
                    configurable: true
                });
                GenericVector.prototype._checkFixed = function () {
                    if (this._fixed) {
                        this.sec.throwError("RangeError", AVMX.Errors.VectorFixedError);
                    }
                };
                GenericVector.prototype.axGetNumericProperty = function (nm) {
                    release || assert(Shumway.isNumeric(nm));
                    var idx = nm | 0;
                    if (idx < 0 || idx >= this._buffer.length || idx != nm) {
                        this.sec.throwError("RangeError", AVMX.Errors.OutOfRangeError, nm, this._buffer.length);
                    }
                    return this._buffer[idx];
                };
                GenericVector.prototype.axSetNumericProperty = function (nm, v) {
                    release || assert(Shumway.isNumeric(nm));
                    var length = this._buffer.length;
                    var idx = nm | 0;
                    if (idx < 0 || idx > length || idx != nm || (idx === length && this._fixed)) {
                        this.sec.throwError("RangeError", AVMX.Errors.OutOfRangeError, nm, length);
                    }
                    this._buffer[idx] = this._coerce(v);
                };
                GenericVector.prototype.axHasPropertyInternal = function (mn) {
                    // Optimization for the common case of indexed element accesses.
                    if ((mn.name | 0) === mn.name) {
                        release || assert(mn.isRuntimeName());
                        return mn.name >= 0 && mn.name < this._buffer.length;
                    }
                    var name = AVMX.axCoerceName(mn.name);
                    if (mn.isRuntimeName() && Shumway.isIndex(name)) {
                        var index = name >>> 0;
                        return index >= 0 && index < this._buffer.length;
                    }
                    return this.axResolveMultiname(mn) in this;
                };
                GenericVector.prototype.axNextValue = function (index) {
                    return this._buffer[index - 1];
                };
                GenericVector.prototype.axNextNameIndex = function (index) {
                    var nextNameIndex = index + 1;
                    if (nextNameIndex <= this._buffer.length) {
                        return nextNameIndex;
                    }
                    return 0;
                };
                GenericVector.CASEINSENSITIVE = 1;
                GenericVector.DESCENDING = 2;
                GenericVector.UNIQUESORT = 4;
                GenericVector.RETURNINDEXEDARRAY = 8;
                GenericVector.NUMERIC = 16;
                GenericVector.defaultValue = null;
                return GenericVector;
            })(BaseVector);
            AS.GenericVector = GenericVector;
        })(AS = AVMX.AS || (AVMX.AS = {}));
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
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
/**
 * TypedArray Vector Template
 *
 * If you make any changes to this code you'll need to regenerate uint32Vector.ts &
 * float64Vector.ts. We duplicate all the code for vectors because we want to keep things
 * monomorphic as much as possible.
 *
 * NOTE: Not all of the AS3 methods need to be implemented natively, some are self-hosted in AS3
 * code. For better performance we should probably implement them all natively (in JS that is)
 * unless our compiler is good enough.
 */
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var AS;
        (function (AS) {
            var assert = Shumway.Debug.assert;
            var assertNotImplemented = Shumway.Debug.assertNotImplemented;
            var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
            var Int32Vector = (function (_super) {
                __extends(Int32Vector, _super);
                function Int32Vector(length, fixed) {
                    if (length === void 0) { length = 0; }
                    if (fixed === void 0) { fixed = false; }
                    _super.call(this);
                    length = length >>> 0;
                    this._fixed = !!fixed;
                    this._buffer = new Int32Array(Math.max(Int32Vector.INITIAL_CAPACITY, length + Int32Vector.EXTRA_CAPACITY));
                    this._offset = 0;
                    this._length = length;
                }
                Int32Vector.classInitializer = function () {
                    var proto = this.dPrototype;
                    var tProto = this.tPrototype;
                    // Fix up MOP handlers to not apply to the dynamic prototype, which is a plain object.
                    tProto.axGetProperty = proto.axGetProperty;
                    tProto.axGetNumericProperty = proto.axGetNumericProperty;
                    tProto.axSetProperty = proto.axSetProperty;
                    tProto.axSetNumericProperty = proto.axSetNumericProperty;
                    tProto.axHasPropertyInternal = proto.axHasPropertyInternal;
                    tProto.axNextName = proto.axNextName;
                    tProto.axNextNameIndex = proto.axNextNameIndex;
                    tProto.axNextValue = proto.axNextValue;
                    proto.axGetProperty = AS.ASObject.prototype.axGetProperty;
                    proto.axGetNumericProperty = AS.ASObject.prototype.axGetNumericProperty;
                    proto.axSetProperty = AS.ASObject.prototype.axSetProperty;
                    proto.axSetNumericProperty = AS.ASObject.prototype.axSetNumericProperty;
                    proto.axHasPropertyInternal = AS.ASObject.prototype.axHasPropertyInternal;
                    proto.axNextName = AS.ASObject.prototype.axNextName;
                    proto.axNextNameIndex = AS.ASObject.prototype.axNextNameIndex;
                    proto.axNextValue = AS.ASObject.prototype.axNextValue;
                    var asProto = Int32Vector.prototype;
                    defineNonEnumerableProperty(proto, '$Bgjoin', asProto.join);
                    // Same as join, see VectorImpl.as in Tamarin repository.
                    defineNonEnumerableProperty(proto, '$BgtoString', asProto.join);
                    defineNonEnumerableProperty(proto, '$BgtoLocaleString', asProto.toLocaleString);
                    defineNonEnumerableProperty(proto, '$Bgpop', asProto.pop);
                    defineNonEnumerableProperty(proto, '$Bgpush', asProto.push);
                    defineNonEnumerableProperty(proto, '$Bgreverse', asProto.reverse);
                    defineNonEnumerableProperty(proto, '$Bgconcat', asProto.concat);
                    defineNonEnumerableProperty(proto, '$Bgsplice', asProto.splice);
                    defineNonEnumerableProperty(proto, '$Bgslice', asProto.slice);
                    defineNonEnumerableProperty(proto, '$Bgshift', asProto.shift);
                    defineNonEnumerableProperty(proto, '$Bgunshift', asProto.unshift);
                    defineNonEnumerableProperty(proto, '$BgindexOf', asProto.indexOf);
                    defineNonEnumerableProperty(proto, '$BglastIndexOf', asProto.lastIndexOf);
                    defineNonEnumerableProperty(proto, '$BgforEach', asProto.forEach);
                    defineNonEnumerableProperty(proto, '$Bgmap', asProto.map);
                    defineNonEnumerableProperty(proto, '$Bgfilter', asProto.filter);
                    defineNonEnumerableProperty(proto, '$Bgsome', asProto.some);
                    defineNonEnumerableProperty(proto, '$Bgevery', asProto.every);
                    defineNonEnumerableProperty(proto, '$Bgsort', asProto.sort);
                    defineNonEnumerableProperty(proto, 'checkVectorMethodArgs', asProto.checkVectorMethodArgs);
                };
                Int32Vector.axApply = function (_, args) {
                    var object = args[0];
                    if (this.axIsType(object)) {
                        return object;
                    }
                    var length = object.axGetPublicProperty("length");
                    if (length !== undefined) {
                        var v = this.axConstruct([length, false]);
                        for (var i = 0; i < length; i++) {
                            v.axSetNumericProperty(i, object.axGetPublicProperty(i));
                        }
                        return v;
                    }
                    Shumway.Debug.unexpected();
                };
                Int32Vector.prototype.internalToString = function () {
                    var str = "";
                    var start = this._offset;
                    var end = start + this._length;
                    for (var i = 0; i < this._buffer.length; i++) {
                        if (i === start) {
                            str += "[";
                        }
                        if (i === end) {
                            str += "]";
                        }
                        str += this._buffer[i];
                        if (i < this._buffer.length - 1) {
                            str += ",";
                        }
                    }
                    if (this._offset + this._length === this._buffer.length) {
                        str += "]";
                    }
                    return str + ": offset: " + this._offset + ", length: " + this._length + ", capacity: " + this._buffer.length;
                };
                Int32Vector.prototype.toString = function () {
                    var str = "";
                    for (var i = 0; i < this._length; i++) {
                        str += this._buffer[this._offset + i];
                        if (i < this._length - 1) {
                            str += ",";
                        }
                    }
                    return str;
                };
                Int32Vector.prototype.toLocaleString = function () {
                    var str = "";
                    for (var i = 0; i < this._length; i++) {
                        str += this._buffer[this._offset + i];
                        if (i < this._length - 1) {
                            str += ",";
                        }
                    }
                    return str;
                };
                // vector.prototype.toString = vector.prototype.internalToString;
                Int32Vector.prototype._view = function () {
                    return this._buffer.subarray(this._offset, this._offset + this._length);
                };
                Int32Vector.prototype._ensureCapacity = function (length) {
                    var minCapacity = this._offset + length;
                    if (minCapacity < this._buffer.length) {
                        return;
                    }
                    if (length <= this._buffer.length) {
                        // New length exceeds bounds at current offset but fits in the buffer, so we center it.
                        var offset = (this._buffer.length - length) >> 2;
                        this._buffer.set(this._view(), offset);
                        this._offset = offset;
                        return;
                    }
                    // New length doesn't fit at all, resize buffer.
                    var oldCapacity = this._buffer.length;
                    var newCapacity = ((oldCapacity * 3) >> 1) + 1;
                    if (newCapacity < minCapacity) {
                        newCapacity = minCapacity;
                    }
                    var buffer = new Int32Array(newCapacity);
                    buffer.set(this._buffer, 0);
                    this._buffer = buffer;
                };
                Int32Vector.prototype.concat = function () {
                    var length = this._length;
                    for (var i = 0; i < arguments.length; i++) {
                        var vector = arguments[i];
                        if (!(vector._buffer instanceof Int32Array)) {
                            assert(false); // TODO
                        }
                        length += vector._length;
                    }
                    var result = new this.sec.Int32Vector(length);
                    var buffer = result._buffer;
                    buffer.set(this._buffer);
                    var offset = this._length;
                    for (var i = 0; i < arguments.length; i++) {
                        var vector = arguments[i];
                        if (offset + vector._buffer.length < vector._buffer.length) {
                            buffer.set(vector._buffer, offset);
                        }
                        else {
                            buffer.set(vector._buffer.subarray(0, vector._length), offset);
                        }
                        offset += vector._length;
                    }
                    return result;
                };
                /**
                 * Executes a |callback| function with three arguments: element, index, the vector itself as
                 * well as passing the |thisObject| as |this| for each of the elements in the vector. If any of
                 * the callbacks return |false| the function terminates, otherwise it returns |true|.
                 */
                Int32Vector.prototype.every = function (callback, thisObject) {
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return true;
                    }
                    for (var i = 0; i < this._length; i++) {
                        if (!callback.call(thisObject, this._buffer[this._offset + i], i, this)) {
                            return false;
                        }
                    }
                    return true;
                };
                /**
                 * Filters the elements for which the |callback| method returns |true|. The |callback| function
                 * is called with three arguments: element, index, the vector itself as well as passing the
                 * |thisObject| as |this| for each of the elements in the vector.
                 */
                Int32Vector.prototype.filter = function (callback, thisObject) {
                    var v = new this.sec.Int32Vector();
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return v;
                    }
                    for (var i = 0; i < this._length; i++) {
                        if (callback.call(thisObject, this._buffer[this._offset + i], i, this)) {
                            v.push(this._buffer[this._offset + i]);
                        }
                    }
                    return v;
                };
                Int32Vector.prototype.map = function (callback, thisObject) {
                    var v = this.axClass.axConstruct([this.length, false]);
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return v;
                    }
                    for (var i = 0; i < this._length; i++) {
                        v[i] = callback.call(thisObject, this._buffer[this._offset + i], i, this);
                    }
                    return v;
                };
                Int32Vector.prototype.some = function (callback, thisObject) {
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return false;
                    }
                    for (var i = 0; i < this._length; i++) {
                        if (callback.call(thisObject, this._buffer[this._offset + i], i, this)) {
                            return true;
                        }
                    }
                    return false;
                };
                Int32Vector.prototype.forEach = function (callback, thisObject) {
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return;
                    }
                    for (var i = 0; i < this._length; i++) {
                        callback.call(thisObject, this._buffer[this._offset + i], i, this);
                    }
                };
                Int32Vector.prototype.join = function (separator) {
                    if (separator === void 0) { separator = ','; }
                    var limit = this.length;
                    var buffer = this._buffer;
                    var offset = this._offset;
                    var result = "";
                    for (var i = 0; i < limit - 1; i++) {
                        result += buffer[offset + i] + separator;
                    }
                    if (limit > 0) {
                        result += buffer[offset + limit - 1];
                    }
                    return result;
                };
                Int32Vector.prototype.indexOf = function (searchElement, fromIndex) {
                    if (fromIndex === void 0) { fromIndex = 0; }
                    var length = this._length;
                    var start = fromIndex | 0;
                    if (start < 0) {
                        start = start + length;
                        if (start < 0) {
                            start = 0;
                        }
                    }
                    else if (start >= length) {
                        return -1;
                    }
                    var buffer = this._buffer;
                    var length = this._length;
                    var offset = this._offset;
                    start += offset;
                    var end = offset + length;
                    for (var i = start; i < end; i++) {
                        if (buffer[i] === searchElement) {
                            return i - offset;
                        }
                    }
                    return -1;
                };
                Int32Vector.prototype.lastIndexOf = function (searchElement, fromIndex) {
                    if (fromIndex === void 0) { fromIndex = 0x7fffffff; }
                    var length = this._length;
                    var start = fromIndex | 0;
                    if (start < 0) {
                        start = start + length;
                        if (start < 0) {
                            return -1;
                        }
                    }
                    else if (start >= length) {
                        start = length;
                    }
                    var buffer = this._buffer;
                    var offset = this._offset;
                    start += offset;
                    var end = offset;
                    for (var i = start; i-- > end;) {
                        if (buffer[i] === searchElement) {
                            return i - offset;
                        }
                    }
                    return -1;
                };
                Int32Vector.prototype.push = function (arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8 /*...rest*/) {
                    this._checkFixed();
                    this._ensureCapacity(this._length + arguments.length);
                    for (var i = 0; i < arguments.length; i++) {
                        this._buffer[this._offset + this._length++] = arguments[i];
                    }
                };
                Int32Vector.prototype.pop = function () {
                    this._checkFixed();
                    if (this._length === 0) {
                        return Int32Vector.DEFAULT_VALUE;
                    }
                    this._length--;
                    return this._buffer[this._offset + this._length];
                    // TODO: should we potentially reallocate to a smaller buffer here?
                };
                Int32Vector.prototype.reverse = function () {
                    var l = this._offset;
                    var r = this._offset + this._length - 1;
                    var b = this._buffer;
                    while (l < r) {
                        var t = b[l];
                        b[l] = b[r];
                        b[r] = t;
                        l++;
                        r--;
                    }
                    return this;
                };
                Int32Vector.prototype.sort = function (sortBehavior) {
                    if (arguments.length === 0) {
                        Array.prototype.sort.call(this._view());
                        return this;
                    }
                    if (this.sec.AXFunction.axIsType(sortBehavior)) {
                        Array.prototype.sort.call(this._view(), sortBehavior.value);
                        return this;
                    }
                    var options = sortBehavior | 0;
                    release || assertNotImplemented(!(options & Int32Vector.UNIQUESORT), "UNIQUESORT");
                    release || assertNotImplemented(!(options & Int32Vector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
                    if (options & Int32Vector.DESCENDING) {
                        Array.prototype.sort.call(this._view(), function (a, b) { return b - a; });
                    }
                    else {
                        Array.prototype.sort.call(this._view(), function (a, b) { return a - b; });
                    }
                    return this;
                };
                Int32Vector.prototype.shift = function () {
                    this._checkFixed();
                    if (this._length === 0) {
                        return 0;
                    }
                    this._length--;
                    return this._buffer[this._offset++];
                };
                Int32Vector.prototype.unshift = function () {
                    this._checkFixed();
                    if (!arguments.length) {
                        return;
                    }
                    this._ensureCapacity(this._length + arguments.length);
                    this._slide(arguments.length);
                    this._offset -= arguments.length;
                    this._length += arguments.length;
                    for (var i = 0; i < arguments.length; i++) {
                        this._buffer[this._offset + i] = arguments[i];
                    }
                };
                Int32Vector.prototype.slice = function (start, end) {
                    if (start === void 0) { start = 0; }
                    if (end === void 0) { end = 0x7fffffff; }
                    var buffer = this._buffer;
                    var length = this._length;
                    var first = Math.min(Math.max(start, 0), length);
                    var last = Math.min(Math.max(end, first), length);
                    var result = new this.sec.Int32Vector(last - first, this.fixed);
                    result._buffer.set(buffer.subarray(this._offset + first, this._offset + last), result._offset);
                    return result;
                };
                Int32Vector.prototype.splice = function (start, deleteCount_ /*, ...items: number[] */) {
                    var buffer = this._buffer;
                    var length = this._length;
                    var first = Math.min(Math.max(start, 0), length);
                    var startOffset = this._offset + first;
                    var deleteCount = Math.min(Math.max(deleteCount_, 0), length - first);
                    var insertCount = arguments.length - 2;
                    var deletedItems;
                    var result = new this.sec.Int32Vector(deleteCount, this.fixed);
                    if (deleteCount > 0) {
                        deletedItems = buffer.subarray(startOffset, startOffset + deleteCount);
                        result._buffer.set(deletedItems, result._offset);
                    }
                    this._ensureCapacity(length - deleteCount + insertCount);
                    var right = startOffset + deleteCount;
                    var slice = buffer.subarray(right, length);
                    buffer.set(slice, startOffset + insertCount);
                    this._length += insertCount - deleteCount;
                    for (var i = 0; i < insertCount; i++) {
                        buffer[startOffset + i] = arguments[i + 2];
                    }
                    return result;
                };
                Int32Vector.prototype._slide = function (distance) {
                    this._buffer.set(this._view(), this._offset + distance);
                    this._offset += distance;
                };
                Object.defineProperty(Int32Vector.prototype, "length", {
                    get: function () {
                        return this._length;
                    },
                    set: function (value) {
                        value = value >>> 0;
                        if (value > this._length) {
                            this._ensureCapacity(value);
                            for (var i = this._offset + this._length, j = this._offset + value; i < j; i++) {
                                this._buffer[i] = Int32Vector.DEFAULT_VALUE;
                            }
                        }
                        this._length = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Int32Vector.prototype, "fixed", {
                    get: function () {
                        return this._fixed;
                    },
                    set: function (f) {
                        this._fixed = !!f;
                    },
                    enumerable: true,
                    configurable: true
                });
                Int32Vector.prototype._checkFixed = function () {
                    if (this._fixed) {
                        this.sec.throwError("RangeError", AVMX.Errors.VectorFixedError);
                    }
                };
                Int32Vector.prototype.axGetNumericProperty = function (nm) {
                    release || assert(Shumway.isNumeric(nm));
                    var length = this._length;
                    var idx = nm | 0;
                    if (idx < 0 || idx >= length || idx != nm) {
                        this.sec.throwError("RangeError", AVMX.Errors.OutOfRangeError, nm, length);
                    }
                    return this._buffer[this._offset + idx];
                };
                Int32Vector.prototype.axSetNumericProperty = function (nm, v) {
                    release || assert(Shumway.isNumeric(nm));
                    var length = this._length;
                    var idx = nm | 0;
                    if (idx < 0 || idx > length || idx != nm || (idx === length && this._fixed)) {
                        this.sec.throwError("RangeError", AVMX.Errors.OutOfRangeError, nm, length);
                    }
                    if (idx === this._length) {
                        this._ensureCapacity(this._length + 1);
                        this._length++;
                    }
                    this._buffer[this._offset + idx] = v;
                };
                Int32Vector.prototype.axHasPropertyInternal = function (mn) {
                    // Optimization for the common case of indexed element accesses.
                    if ((mn.name | 0) === mn.name) {
                        release || assert(mn.isRuntimeName());
                        return mn.name >= 0 && mn.name < this._length;
                    }
                    var name = AVMX.axCoerceName(mn.name);
                    if (mn.isRuntimeName() && Shumway.isIndex(name)) {
                        var index = name >>> 0;
                        return index >= 0 && index < this._length;
                    }
                    return this.axResolveMultiname(mn) in this;
                };
                Int32Vector.prototype.axNextValue = function (index) {
                    return this._buffer[this._offset + index - 1];
                };
                Int32Vector.prototype.axNextNameIndex = function (index) {
                    var nextNameIndex = index + 1;
                    if (nextNameIndex <= this._length) {
                        return nextNameIndex;
                    }
                    return 0;
                };
                Int32Vector.EXTRA_CAPACITY = 4;
                Int32Vector.INITIAL_CAPACITY = 10;
                Int32Vector.DEFAULT_VALUE = 0;
                Int32Vector.DESCENDING = 2;
                Int32Vector.UNIQUESORT = 4;
                Int32Vector.RETURNINDEXEDARRAY = 8;
                return Int32Vector;
            })(AS.BaseVector);
            AS.Int32Vector = Int32Vector;
        })(AS = AVMX.AS || (AVMX.AS = {}));
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
/* THIS FILE WAS AUTOMATICALLY GENERATED FROM int32Vector.ts */
/*
 * Copyright 2014 Mozilla Foundation
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
/**
 * TypedArray Vector Template
 *
 * If you make any changes to this code you'll need to regenerate uint32Vector.ts &
 * float64Vector.ts. We duplicate all the code for vectors because we want to keep things
 * monomorphic as much as possible.
 *
 * NOTE: Not all of the AS3 methods need to be implemented natively, some are self-hosted in AS3
 * code. For better performance we should probably implement them all natively (in JS that is)
 * unless our compiler is good enough.
 */
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var AS;
        (function (AS) {
            var assert = Shumway.Debug.assert;
            var assertNotImplemented = Shumway.Debug.assertNotImplemented;
            var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
            var Uint32Vector = (function (_super) {
                __extends(Uint32Vector, _super);
                function Uint32Vector(length, fixed) {
                    if (length === void 0) { length = 0; }
                    if (fixed === void 0) { fixed = false; }
                    _super.call(this);
                    length = length >>> 0;
                    this._fixed = !!fixed;
                    this._buffer = new Uint32Array(Math.max(Uint32Vector.INITIAL_CAPACITY, length + Uint32Vector.EXTRA_CAPACITY));
                    this._offset = 0;
                    this._length = length;
                }
                Uint32Vector.classInitializer = function () {
                    var proto = this.dPrototype;
                    var tProto = this.tPrototype;
                    // Fix up MOP handlers to not apply to the dynamic prototype, which is a plain object.
                    tProto.axGetProperty = proto.axGetProperty;
                    tProto.axGetNumericProperty = proto.axGetNumericProperty;
                    tProto.axSetProperty = proto.axSetProperty;
                    tProto.axSetNumericProperty = proto.axSetNumericProperty;
                    tProto.axHasPropertyInternal = proto.axHasPropertyInternal;
                    tProto.axNextName = proto.axNextName;
                    tProto.axNextNameIndex = proto.axNextNameIndex;
                    tProto.axNextValue = proto.axNextValue;
                    proto.axGetProperty = AS.ASObject.prototype.axGetProperty;
                    proto.axGetNumericProperty = AS.ASObject.prototype.axGetNumericProperty;
                    proto.axSetProperty = AS.ASObject.prototype.axSetProperty;
                    proto.axSetNumericProperty = AS.ASObject.prototype.axSetNumericProperty;
                    proto.axHasPropertyInternal = AS.ASObject.prototype.axHasPropertyInternal;
                    proto.axNextName = AS.ASObject.prototype.axNextName;
                    proto.axNextNameIndex = AS.ASObject.prototype.axNextNameIndex;
                    proto.axNextValue = AS.ASObject.prototype.axNextValue;
                    var asProto = Uint32Vector.prototype;
                    defineNonEnumerableProperty(proto, '$Bgjoin', asProto.join);
                    // Same as join, see VectorImpl.as in Tamarin repository.
                    defineNonEnumerableProperty(proto, '$BgtoString', asProto.join);
                    defineNonEnumerableProperty(proto, '$BgtoLocaleString', asProto.toLocaleString);
                    defineNonEnumerableProperty(proto, '$Bgpop', asProto.pop);
                    defineNonEnumerableProperty(proto, '$Bgpush', asProto.push);
                    defineNonEnumerableProperty(proto, '$Bgreverse', asProto.reverse);
                    defineNonEnumerableProperty(proto, '$Bgconcat', asProto.concat);
                    defineNonEnumerableProperty(proto, '$Bgsplice', asProto.splice);
                    defineNonEnumerableProperty(proto, '$Bgslice', asProto.slice);
                    defineNonEnumerableProperty(proto, '$Bgshift', asProto.shift);
                    defineNonEnumerableProperty(proto, '$Bgunshift', asProto.unshift);
                    defineNonEnumerableProperty(proto, '$BgindexOf', asProto.indexOf);
                    defineNonEnumerableProperty(proto, '$BglastIndexOf', asProto.lastIndexOf);
                    defineNonEnumerableProperty(proto, '$BgforEach', asProto.forEach);
                    defineNonEnumerableProperty(proto, '$Bgmap', asProto.map);
                    defineNonEnumerableProperty(proto, '$Bgfilter', asProto.filter);
                    defineNonEnumerableProperty(proto, '$Bgsome', asProto.some);
                    defineNonEnumerableProperty(proto, '$Bgevery', asProto.every);
                    defineNonEnumerableProperty(proto, '$Bgsort', asProto.sort);
                    defineNonEnumerableProperty(proto, 'checkVectorMethodArgs', asProto.checkVectorMethodArgs);
                };
                Uint32Vector.axApply = function (_, args) {
                    var object = args[0];
                    if (this.axIsType(object)) {
                        return object;
                    }
                    var length = object.axGetPublicProperty("length");
                    if (length !== undefined) {
                        var v = this.axConstruct([length, false]);
                        for (var i = 0; i < length; i++) {
                            v.axSetNumericProperty(i, object.axGetPublicProperty(i));
                        }
                        return v;
                    }
                    Shumway.Debug.unexpected();
                };
                Uint32Vector.prototype.internalToString = function () {
                    var str = "";
                    var start = this._offset;
                    var end = start + this._length;
                    for (var i = 0; i < this._buffer.length; i++) {
                        if (i === start) {
                            str += "[";
                        }
                        if (i === end) {
                            str += "]";
                        }
                        str += this._buffer[i];
                        if (i < this._buffer.length - 1) {
                            str += ",";
                        }
                    }
                    if (this._offset + this._length === this._buffer.length) {
                        str += "]";
                    }
                    return str + ": offset: " + this._offset + ", length: " + this._length + ", capacity: " + this._buffer.length;
                };
                Uint32Vector.prototype.toString = function () {
                    var str = "";
                    for (var i = 0; i < this._length; i++) {
                        str += this._buffer[this._offset + i];
                        if (i < this._length - 1) {
                            str += ",";
                        }
                    }
                    return str;
                };
                Uint32Vector.prototype.toLocaleString = function () {
                    var str = "";
                    for (var i = 0; i < this._length; i++) {
                        str += this._buffer[this._offset + i];
                        if (i < this._length - 1) {
                            str += ",";
                        }
                    }
                    return str;
                };
                // vector.prototype.toString = vector.prototype.internalToString;
                Uint32Vector.prototype._view = function () {
                    return this._buffer.subarray(this._offset, this._offset + this._length);
                };
                Uint32Vector.prototype._ensureCapacity = function (length) {
                    var minCapacity = this._offset + length;
                    if (minCapacity < this._buffer.length) {
                        return;
                    }
                    if (length <= this._buffer.length) {
                        // New length exceeds bounds at current offset but fits in the buffer, so we center it.
                        var offset = (this._buffer.length - length) >> 2;
                        this._buffer.set(this._view(), offset);
                        this._offset = offset;
                        return;
                    }
                    // New length doesn't fit at all, resize buffer.
                    var oldCapacity = this._buffer.length;
                    var newCapacity = ((oldCapacity * 3) >> 1) + 1;
                    if (newCapacity < minCapacity) {
                        newCapacity = minCapacity;
                    }
                    var buffer = new Uint32Array(newCapacity);
                    buffer.set(this._buffer, 0);
                    this._buffer = buffer;
                };
                Uint32Vector.prototype.concat = function () {
                    var length = this._length;
                    for (var i = 0; i < arguments.length; i++) {
                        var vector = arguments[i];
                        if (!(vector._buffer instanceof Uint32Array)) {
                            assert(false); // TODO
                        }
                        length += vector._length;
                    }
                    var result = new this.sec.Uint32Vector(length);
                    var buffer = result._buffer;
                    buffer.set(this._buffer);
                    var offset = this._length;
                    for (var i = 0; i < arguments.length; i++) {
                        var vector = arguments[i];
                        if (offset + vector._buffer.length < vector._buffer.length) {
                            buffer.set(vector._buffer, offset);
                        }
                        else {
                            buffer.set(vector._buffer.subarray(0, vector._length), offset);
                        }
                        offset += vector._length;
                    }
                    return result;
                };
                /**
                 * Executes a |callback| function with three arguments: element, index, the vector itself as
                 * well as passing the |thisObject| as |this| for each of the elements in the vector. If any of
                 * the callbacks return |false| the function terminates, otherwise it returns |true|.
                 */
                Uint32Vector.prototype.every = function (callback, thisObject) {
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return true;
                    }
                    for (var i = 0; i < this._length; i++) {
                        if (!callback.call(thisObject, this._buffer[this._offset + i], i, this)) {
                            return false;
                        }
                    }
                    return true;
                };
                /**
                 * Filters the elements for which the |callback| method returns |true|. The |callback| function
                 * is called with three arguments: element, index, the vector itself as well as passing the
                 * |thisObject| as |this| for each of the elements in the vector.
                 */
                Uint32Vector.prototype.filter = function (callback, thisObject) {
                    var v = new this.sec.Uint32Vector();
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return v;
                    }
                    for (var i = 0; i < this._length; i++) {
                        if (callback.call(thisObject, this._buffer[this._offset + i], i, this)) {
                            v.push(this._buffer[this._offset + i]);
                        }
                    }
                    return v;
                };
                Uint32Vector.prototype.map = function (callback, thisObject) {
                    var v = this.axClass.axConstruct([this.length, false]);
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return v;
                    }
                    for (var i = 0; i < this._length; i++) {
                        v[i] = callback.call(thisObject, this._buffer[this._offset + i], i, this);
                    }
                    return v;
                };
                Uint32Vector.prototype.some = function (callback, thisObject) {
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return false;
                    }
                    for (var i = 0; i < this._length; i++) {
                        if (callback.call(thisObject, this._buffer[this._offset + i], i, this)) {
                            return true;
                        }
                    }
                    return false;
                };
                Uint32Vector.prototype.forEach = function (callback, thisObject) {
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return;
                    }
                    for (var i = 0; i < this._length; i++) {
                        callback.call(thisObject, this._buffer[this._offset + i], i, this);
                    }
                };
                Uint32Vector.prototype.join = function (separator) {
                    if (separator === void 0) { separator = ','; }
                    var limit = this.length;
                    var buffer = this._buffer;
                    var offset = this._offset;
                    var result = "";
                    for (var i = 0; i < limit - 1; i++) {
                        result += buffer[offset + i] + separator;
                    }
                    if (limit > 0) {
                        result += buffer[offset + limit - 1];
                    }
                    return result;
                };
                Uint32Vector.prototype.indexOf = function (searchElement, fromIndex) {
                    if (fromIndex === void 0) { fromIndex = 0; }
                    var length = this._length;
                    var start = fromIndex | 0;
                    if (start < 0) {
                        start = start + length;
                        if (start < 0) {
                            start = 0;
                        }
                    }
                    else if (start >= length) {
                        return -1;
                    }
                    var buffer = this._buffer;
                    var length = this._length;
                    var offset = this._offset;
                    start += offset;
                    var end = offset + length;
                    for (var i = start; i < end; i++) {
                        if (buffer[i] === searchElement) {
                            return i - offset;
                        }
                    }
                    return -1;
                };
                Uint32Vector.prototype.lastIndexOf = function (searchElement, fromIndex) {
                    if (fromIndex === void 0) { fromIndex = 0x7fffffff; }
                    var length = this._length;
                    var start = fromIndex | 0;
                    if (start < 0) {
                        start = start + length;
                        if (start < 0) {
                            return -1;
                        }
                    }
                    else if (start >= length) {
                        start = length;
                    }
                    var buffer = this._buffer;
                    var offset = this._offset;
                    start += offset;
                    var end = offset;
                    for (var i = start; i-- > end;) {
                        if (buffer[i] === searchElement) {
                            return i - offset;
                        }
                    }
                    return -1;
                };
                Uint32Vector.prototype.push = function (arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8 /*...rest*/) {
                    this._checkFixed();
                    this._ensureCapacity(this._length + arguments.length);
                    for (var i = 0; i < arguments.length; i++) {
                        this._buffer[this._offset + this._length++] = arguments[i];
                    }
                };
                Uint32Vector.prototype.pop = function () {
                    this._checkFixed();
                    if (this._length === 0) {
                        return Uint32Vector.DEFAULT_VALUE;
                    }
                    this._length--;
                    return this._buffer[this._offset + this._length];
                    // TODO: should we potentially reallocate to a smaller buffer here?
                };
                Uint32Vector.prototype.reverse = function () {
                    var l = this._offset;
                    var r = this._offset + this._length - 1;
                    var b = this._buffer;
                    while (l < r) {
                        var t = b[l];
                        b[l] = b[r];
                        b[r] = t;
                        l++;
                        r--;
                    }
                    return this;
                };
                Uint32Vector.prototype.sort = function (sortBehavior) {
                    if (arguments.length === 0) {
                        Array.prototype.sort.call(this._view());
                        return this;
                    }
                    if (this.sec.AXFunction.axIsType(sortBehavior)) {
                        Array.prototype.sort.call(this._view(), sortBehavior.value);
                        return this;
                    }
                    var options = sortBehavior | 0;
                    release || assertNotImplemented(!(options & Uint32Vector.UNIQUESORT), "UNIQUESORT");
                    release || assertNotImplemented(!(options & Uint32Vector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
                    if (options & Uint32Vector.DESCENDING) {
                        Array.prototype.sort.call(this._view(), function (a, b) { return b - a; });
                    }
                    else {
                        Array.prototype.sort.call(this._view(), function (a, b) { return a - b; });
                    }
                    return this;
                };
                Uint32Vector.prototype.shift = function () {
                    this._checkFixed();
                    if (this._length === 0) {
                        return 0;
                    }
                    this._length--;
                    return this._buffer[this._offset++];
                };
                Uint32Vector.prototype.unshift = function () {
                    this._checkFixed();
                    if (!arguments.length) {
                        return;
                    }
                    this._ensureCapacity(this._length + arguments.length);
                    this._slide(arguments.length);
                    this._offset -= arguments.length;
                    this._length += arguments.length;
                    for (var i = 0; i < arguments.length; i++) {
                        this._buffer[this._offset + i] = arguments[i];
                    }
                };
                Uint32Vector.prototype.slice = function (start, end) {
                    if (start === void 0) { start = 0; }
                    if (end === void 0) { end = 0x7fffffff; }
                    var buffer = this._buffer;
                    var length = this._length;
                    var first = Math.min(Math.max(start, 0), length);
                    var last = Math.min(Math.max(end, first), length);
                    var result = new this.sec.Uint32Vector(last - first, this.fixed);
                    result._buffer.set(buffer.subarray(this._offset + first, this._offset + last), result._offset);
                    return result;
                };
                Uint32Vector.prototype.splice = function (start, deleteCount_ /*, ...items: number[] */) {
                    var buffer = this._buffer;
                    var length = this._length;
                    var first = Math.min(Math.max(start, 0), length);
                    var startOffset = this._offset + first;
                    var deleteCount = Math.min(Math.max(deleteCount_, 0), length - first);
                    var insertCount = arguments.length - 2;
                    var deletedItems;
                    var result = new this.sec.Uint32Vector(deleteCount, this.fixed);
                    if (deleteCount > 0) {
                        deletedItems = buffer.subarray(startOffset, startOffset + deleteCount);
                        result._buffer.set(deletedItems, result._offset);
                    }
                    this._ensureCapacity(length - deleteCount + insertCount);
                    var right = startOffset + deleteCount;
                    var slice = buffer.subarray(right, length);
                    buffer.set(slice, startOffset + insertCount);
                    this._length += insertCount - deleteCount;
                    for (var i = 0; i < insertCount; i++) {
                        buffer[startOffset + i] = arguments[i + 2];
                    }
                    return result;
                };
                Uint32Vector.prototype._slide = function (distance) {
                    this._buffer.set(this._view(), this._offset + distance);
                    this._offset += distance;
                };
                Object.defineProperty(Uint32Vector.prototype, "length", {
                    get: function () {
                        return this._length;
                    },
                    set: function (value) {
                        value = value >>> 0;
                        if (value > this._length) {
                            this._ensureCapacity(value);
                            for (var i = this._offset + this._length, j = this._offset + value; i < j; i++) {
                                this._buffer[i] = Uint32Vector.DEFAULT_VALUE;
                            }
                        }
                        this._length = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Uint32Vector.prototype, "fixed", {
                    get: function () {
                        return this._fixed;
                    },
                    set: function (f) {
                        this._fixed = !!f;
                    },
                    enumerable: true,
                    configurable: true
                });
                Uint32Vector.prototype._checkFixed = function () {
                    if (this._fixed) {
                        this.sec.throwError("RangeError", AVMX.Errors.VectorFixedError);
                    }
                };
                Uint32Vector.prototype.axGetNumericProperty = function (nm) {
                    release || assert(Shumway.isNumeric(nm));
                    var length = this._length;
                    var idx = nm | 0;
                    if (idx < 0 || idx >= length || idx != nm) {
                        this.sec.throwError("RangeError", AVMX.Errors.OutOfRangeError, nm, length);
                    }
                    return this._buffer[this._offset + idx];
                };
                Uint32Vector.prototype.axSetNumericProperty = function (nm, v) {
                    release || assert(Shumway.isNumeric(nm));
                    var length = this._length;
                    var idx = nm | 0;
                    if (idx < 0 || idx > length || idx != nm || (idx === length && this._fixed)) {
                        this.sec.throwError("RangeError", AVMX.Errors.OutOfRangeError, nm, length);
                    }
                    if (idx === this._length) {
                        this._ensureCapacity(this._length + 1);
                        this._length++;
                    }
                    this._buffer[this._offset + idx] = v;
                };
                Uint32Vector.prototype.axHasPropertyInternal = function (mn) {
                    // Optimization for the common case of indexed element accesses.
                    if ((mn.name | 0) === mn.name) {
                        release || assert(mn.isRuntimeName());
                        return mn.name >= 0 && mn.name < this._length;
                    }
                    var name = AVMX.axCoerceName(mn.name);
                    if (mn.isRuntimeName() && Shumway.isIndex(name)) {
                        var index = name >>> 0;
                        return index >= 0 && index < this._length;
                    }
                    return this.axResolveMultiname(mn) in this;
                };
                Uint32Vector.prototype.axNextValue = function (index) {
                    return this._buffer[this._offset + index - 1];
                };
                Uint32Vector.prototype.axNextNameIndex = function (index) {
                    var nextNameIndex = index + 1;
                    if (nextNameIndex <= this._length) {
                        return nextNameIndex;
                    }
                    return 0;
                };
                Uint32Vector.EXTRA_CAPACITY = 4;
                Uint32Vector.INITIAL_CAPACITY = 10;
                Uint32Vector.DEFAULT_VALUE = 0;
                Uint32Vector.DESCENDING = 2;
                Uint32Vector.UNIQUESORT = 4;
                Uint32Vector.RETURNINDEXEDARRAY = 8;
                return Uint32Vector;
            })(AS.BaseVector);
            AS.Uint32Vector = Uint32Vector;
        })(AS = AVMX.AS || (AVMX.AS = {}));
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
/* THIS FILE WAS AUTOMATICALLY GENERATED FROM int32Vector.ts */
/*
 * Copyright 2014 Mozilla Foundation
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
/**
 * TypedArray Vector Template
 *
 * If you make any changes to this code you'll need to regenerate uint32Vector.ts &
 * float64Vector.ts. We duplicate all the code for vectors because we want to keep things
 * monomorphic as much as possible.
 *
 * NOTE: Not all of the AS3 methods need to be implemented natively, some are self-hosted in AS3
 * code. For better performance we should probably implement them all natively (in JS that is)
 * unless our compiler is good enough.
 */
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var AS;
        (function (AS) {
            var assert = Shumway.Debug.assert;
            var assertNotImplemented = Shumway.Debug.assertNotImplemented;
            var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
            var Float64Vector = (function (_super) {
                __extends(Float64Vector, _super);
                function Float64Vector(length, fixed) {
                    if (length === void 0) { length = 0; }
                    if (fixed === void 0) { fixed = false; }
                    _super.call(this);
                    length = length >>> 0;
                    this._fixed = !!fixed;
                    this._buffer = new Float64Array(Math.max(Float64Vector.INITIAL_CAPACITY, length + Float64Vector.EXTRA_CAPACITY));
                    this._offset = 0;
                    this._length = length;
                }
                Float64Vector.classInitializer = function () {
                    var proto = this.dPrototype;
                    var tProto = this.tPrototype;
                    // Fix up MOP handlers to not apply to the dynamic prototype, which is a plain object.
                    tProto.axGetProperty = proto.axGetProperty;
                    tProto.axGetNumericProperty = proto.axGetNumericProperty;
                    tProto.axSetProperty = proto.axSetProperty;
                    tProto.axSetNumericProperty = proto.axSetNumericProperty;
                    tProto.axHasPropertyInternal = proto.axHasPropertyInternal;
                    tProto.axNextName = proto.axNextName;
                    tProto.axNextNameIndex = proto.axNextNameIndex;
                    tProto.axNextValue = proto.axNextValue;
                    proto.axGetProperty = AS.ASObject.prototype.axGetProperty;
                    proto.axGetNumericProperty = AS.ASObject.prototype.axGetNumericProperty;
                    proto.axSetProperty = AS.ASObject.prototype.axSetProperty;
                    proto.axSetNumericProperty = AS.ASObject.prototype.axSetNumericProperty;
                    proto.axHasPropertyInternal = AS.ASObject.prototype.axHasPropertyInternal;
                    proto.axNextName = AS.ASObject.prototype.axNextName;
                    proto.axNextNameIndex = AS.ASObject.prototype.axNextNameIndex;
                    proto.axNextValue = AS.ASObject.prototype.axNextValue;
                    var asProto = Float64Vector.prototype;
                    defineNonEnumerableProperty(proto, '$Bgjoin', asProto.join);
                    // Same as join, see VectorImpl.as in Tamarin repository.
                    defineNonEnumerableProperty(proto, '$BgtoString', asProto.join);
                    defineNonEnumerableProperty(proto, '$BgtoLocaleString', asProto.toLocaleString);
                    defineNonEnumerableProperty(proto, '$Bgpop', asProto.pop);
                    defineNonEnumerableProperty(proto, '$Bgpush', asProto.push);
                    defineNonEnumerableProperty(proto, '$Bgreverse', asProto.reverse);
                    defineNonEnumerableProperty(proto, '$Bgconcat', asProto.concat);
                    defineNonEnumerableProperty(proto, '$Bgsplice', asProto.splice);
                    defineNonEnumerableProperty(proto, '$Bgslice', asProto.slice);
                    defineNonEnumerableProperty(proto, '$Bgshift', asProto.shift);
                    defineNonEnumerableProperty(proto, '$Bgunshift', asProto.unshift);
                    defineNonEnumerableProperty(proto, '$BgindexOf', asProto.indexOf);
                    defineNonEnumerableProperty(proto, '$BglastIndexOf', asProto.lastIndexOf);
                    defineNonEnumerableProperty(proto, '$BgforEach', asProto.forEach);
                    defineNonEnumerableProperty(proto, '$Bgmap', asProto.map);
                    defineNonEnumerableProperty(proto, '$Bgfilter', asProto.filter);
                    defineNonEnumerableProperty(proto, '$Bgsome', asProto.some);
                    defineNonEnumerableProperty(proto, '$Bgevery', asProto.every);
                    defineNonEnumerableProperty(proto, '$Bgsort', asProto.sort);
                    defineNonEnumerableProperty(proto, 'checkVectorMethodArgs', asProto.checkVectorMethodArgs);
                };
                Float64Vector.axApply = function (_, args) {
                    var object = args[0];
                    if (this.axIsType(object)) {
                        return object;
                    }
                    var length = object.axGetPublicProperty("length");
                    if (length !== undefined) {
                        var v = this.axConstruct([length, false]);
                        for (var i = 0; i < length; i++) {
                            v.axSetNumericProperty(i, object.axGetPublicProperty(i));
                        }
                        return v;
                    }
                    Shumway.Debug.unexpected();
                };
                Float64Vector.prototype.internalToString = function () {
                    var str = "";
                    var start = this._offset;
                    var end = start + this._length;
                    for (var i = 0; i < this._buffer.length; i++) {
                        if (i === start) {
                            str += "[";
                        }
                        if (i === end) {
                            str += "]";
                        }
                        str += this._buffer[i];
                        if (i < this._buffer.length - 1) {
                            str += ",";
                        }
                    }
                    if (this._offset + this._length === this._buffer.length) {
                        str += "]";
                    }
                    return str + ": offset: " + this._offset + ", length: " + this._length + ", capacity: " + this._buffer.length;
                };
                Float64Vector.prototype.toString = function () {
                    var str = "";
                    for (var i = 0; i < this._length; i++) {
                        str += this._buffer[this._offset + i];
                        if (i < this._length - 1) {
                            str += ",";
                        }
                    }
                    return str;
                };
                Float64Vector.prototype.toLocaleString = function () {
                    var str = "";
                    for (var i = 0; i < this._length; i++) {
                        str += this._buffer[this._offset + i];
                        if (i < this._length - 1) {
                            str += ",";
                        }
                    }
                    return str;
                };
                // vector.prototype.toString = vector.prototype.internalToString;
                Float64Vector.prototype._view = function () {
                    return this._buffer.subarray(this._offset, this._offset + this._length);
                };
                Float64Vector.prototype._ensureCapacity = function (length) {
                    var minCapacity = this._offset + length;
                    if (minCapacity < this._buffer.length) {
                        return;
                    }
                    if (length <= this._buffer.length) {
                        // New length exceeds bounds at current offset but fits in the buffer, so we center it.
                        var offset = (this._buffer.length - length) >> 2;
                        this._buffer.set(this._view(), offset);
                        this._offset = offset;
                        return;
                    }
                    // New length doesn't fit at all, resize buffer.
                    var oldCapacity = this._buffer.length;
                    var newCapacity = ((oldCapacity * 3) >> 1) + 1;
                    if (newCapacity < minCapacity) {
                        newCapacity = minCapacity;
                    }
                    var buffer = new Float64Array(newCapacity);
                    buffer.set(this._buffer, 0);
                    this._buffer = buffer;
                };
                Float64Vector.prototype.concat = function () {
                    var length = this._length;
                    for (var i = 0; i < arguments.length; i++) {
                        var vector = arguments[i];
                        if (!(vector._buffer instanceof Float64Array)) {
                            assert(false); // TODO
                        }
                        length += vector._length;
                    }
                    var result = new this.sec.Float64Vector(length);
                    var buffer = result._buffer;
                    buffer.set(this._buffer);
                    var offset = this._length;
                    for (var i = 0; i < arguments.length; i++) {
                        var vector = arguments[i];
                        if (offset + vector._buffer.length < vector._buffer.length) {
                            buffer.set(vector._buffer, offset);
                        }
                        else {
                            buffer.set(vector._buffer.subarray(0, vector._length), offset);
                        }
                        offset += vector._length;
                    }
                    return result;
                };
                /**
                 * Executes a |callback| function with three arguments: element, index, the vector itself as
                 * well as passing the |thisObject| as |this| for each of the elements in the vector. If any of
                 * the callbacks return |false| the function terminates, otherwise it returns |true|.
                 */
                Float64Vector.prototype.every = function (callback, thisObject) {
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return true;
                    }
                    for (var i = 0; i < this._length; i++) {
                        if (!callback.call(thisObject, this._buffer[this._offset + i], i, this)) {
                            return false;
                        }
                    }
                    return true;
                };
                /**
                 * Filters the elements for which the |callback| method returns |true|. The |callback| function
                 * is called with three arguments: element, index, the vector itself as well as passing the
                 * |thisObject| as |this| for each of the elements in the vector.
                 */
                Float64Vector.prototype.filter = function (callback, thisObject) {
                    var v = new this.sec.Float64Vector();
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return v;
                    }
                    for (var i = 0; i < this._length; i++) {
                        if (callback.call(thisObject, this._buffer[this._offset + i], i, this)) {
                            v.push(this._buffer[this._offset + i]);
                        }
                    }
                    return v;
                };
                Float64Vector.prototype.map = function (callback, thisObject) {
                    var v = this.axClass.axConstruct([this.length, false]);
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return v;
                    }
                    for (var i = 0; i < this._length; i++) {
                        v[i] = callback.call(thisObject, this._buffer[this._offset + i], i, this);
                    }
                    return v;
                };
                Float64Vector.prototype.some = function (callback, thisObject) {
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return false;
                    }
                    for (var i = 0; i < this._length; i++) {
                        if (callback.call(thisObject, this._buffer[this._offset + i], i, this)) {
                            return true;
                        }
                    }
                    return false;
                };
                Float64Vector.prototype.forEach = function (callback, thisObject) {
                    if (!this.checkVectorMethodArgs(callback, thisObject)) {
                        return;
                    }
                    for (var i = 0; i < this._length; i++) {
                        callback.call(thisObject, this._buffer[this._offset + i], i, this);
                    }
                };
                Float64Vector.prototype.join = function (separator) {
                    if (separator === void 0) { separator = ','; }
                    var limit = this.length;
                    var buffer = this._buffer;
                    var offset = this._offset;
                    var result = "";
                    for (var i = 0; i < limit - 1; i++) {
                        result += buffer[offset + i] + separator;
                    }
                    if (limit > 0) {
                        result += buffer[offset + limit - 1];
                    }
                    return result;
                };
                Float64Vector.prototype.indexOf = function (searchElement, fromIndex) {
                    if (fromIndex === void 0) { fromIndex = 0; }
                    var length = this._length;
                    var start = fromIndex | 0;
                    if (start < 0) {
                        start = start + length;
                        if (start < 0) {
                            start = 0;
                        }
                    }
                    else if (start >= length) {
                        return -1;
                    }
                    var buffer = this._buffer;
                    var length = this._length;
                    var offset = this._offset;
                    start += offset;
                    var end = offset + length;
                    for (var i = start; i < end; i++) {
                        if (buffer[i] === searchElement) {
                            return i - offset;
                        }
                    }
                    return -1;
                };
                Float64Vector.prototype.lastIndexOf = function (searchElement, fromIndex) {
                    if (fromIndex === void 0) { fromIndex = 0x7fffffff; }
                    var length = this._length;
                    var start = fromIndex | 0;
                    if (start < 0) {
                        start = start + length;
                        if (start < 0) {
                            return -1;
                        }
                    }
                    else if (start >= length) {
                        start = length;
                    }
                    var buffer = this._buffer;
                    var offset = this._offset;
                    start += offset;
                    var end = offset;
                    for (var i = start; i-- > end;) {
                        if (buffer[i] === searchElement) {
                            return i - offset;
                        }
                    }
                    return -1;
                };
                Float64Vector.prototype.push = function (arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8 /*...rest*/) {
                    this._checkFixed();
                    this._ensureCapacity(this._length + arguments.length);
                    for (var i = 0; i < arguments.length; i++) {
                        this._buffer[this._offset + this._length++] = arguments[i];
                    }
                };
                Float64Vector.prototype.pop = function () {
                    this._checkFixed();
                    if (this._length === 0) {
                        return Float64Vector.DEFAULT_VALUE;
                    }
                    this._length--;
                    return this._buffer[this._offset + this._length];
                    // TODO: should we potentially reallocate to a smaller buffer here?
                };
                Float64Vector.prototype.reverse = function () {
                    var l = this._offset;
                    var r = this._offset + this._length - 1;
                    var b = this._buffer;
                    while (l < r) {
                        var t = b[l];
                        b[l] = b[r];
                        b[r] = t;
                        l++;
                        r--;
                    }
                    return this;
                };
                Float64Vector.prototype.sort = function (sortBehavior) {
                    if (arguments.length === 0) {
                        Array.prototype.sort.call(this._view());
                        return this;
                    }
                    if (this.sec.AXFunction.axIsType(sortBehavior)) {
                        Array.prototype.sort.call(this._view(), sortBehavior.value);
                        return this;
                    }
                    var options = sortBehavior | 0;
                    release || assertNotImplemented(!(options & Float64Vector.UNIQUESORT), "UNIQUESORT");
                    release || assertNotImplemented(!(options & Float64Vector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
                    if (options & Float64Vector.DESCENDING) {
                        Array.prototype.sort.call(this._view(), function (a, b) { return b - a; });
                    }
                    else {
                        Array.prototype.sort.call(this._view(), function (a, b) { return a - b; });
                    }
                    return this;
                };
                Float64Vector.prototype.shift = function () {
                    this._checkFixed();
                    if (this._length === 0) {
                        return 0;
                    }
                    this._length--;
                    return this._buffer[this._offset++];
                };
                Float64Vector.prototype.unshift = function () {
                    this._checkFixed();
                    if (!arguments.length) {
                        return;
                    }
                    this._ensureCapacity(this._length + arguments.length);
                    this._slide(arguments.length);
                    this._offset -= arguments.length;
                    this._length += arguments.length;
                    for (var i = 0; i < arguments.length; i++) {
                        this._buffer[this._offset + i] = arguments[i];
                    }
                };
                Float64Vector.prototype.slice = function (start, end) {
                    if (start === void 0) { start = 0; }
                    if (end === void 0) { end = 0x7fffffff; }
                    var buffer = this._buffer;
                    var length = this._length;
                    var first = Math.min(Math.max(start, 0), length);
                    var last = Math.min(Math.max(end, first), length);
                    var result = new this.sec.Float64Vector(last - first, this.fixed);
                    result._buffer.set(buffer.subarray(this._offset + first, this._offset + last), result._offset);
                    return result;
                };
                Float64Vector.prototype.splice = function (start, deleteCount_ /*, ...items: number[] */) {
                    var buffer = this._buffer;
                    var length = this._length;
                    var first = Math.min(Math.max(start, 0), length);
                    var startOffset = this._offset + first;
                    var deleteCount = Math.min(Math.max(deleteCount_, 0), length - first);
                    var insertCount = arguments.length - 2;
                    var deletedItems;
                    var result = new this.sec.Float64Vector(deleteCount, this.fixed);
                    if (deleteCount > 0) {
                        deletedItems = buffer.subarray(startOffset, startOffset + deleteCount);
                        result._buffer.set(deletedItems, result._offset);
                    }
                    this._ensureCapacity(length - deleteCount + insertCount);
                    var right = startOffset + deleteCount;
                    var slice = buffer.subarray(right, length);
                    buffer.set(slice, startOffset + insertCount);
                    this._length += insertCount - deleteCount;
                    for (var i = 0; i < insertCount; i++) {
                        buffer[startOffset + i] = arguments[i + 2];
                    }
                    return result;
                };
                Float64Vector.prototype._slide = function (distance) {
                    this._buffer.set(this._view(), this._offset + distance);
                    this._offset += distance;
                };
                Object.defineProperty(Float64Vector.prototype, "length", {
                    get: function () {
                        return this._length;
                    },
                    set: function (value) {
                        value = value >>> 0;
                        if (value > this._length) {
                            this._ensureCapacity(value);
                            for (var i = this._offset + this._length, j = this._offset + value; i < j; i++) {
                                this._buffer[i] = Float64Vector.DEFAULT_VALUE;
                            }
                        }
                        this._length = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Float64Vector.prototype, "fixed", {
                    get: function () {
                        return this._fixed;
                    },
                    set: function (f) {
                        this._fixed = !!f;
                    },
                    enumerable: true,
                    configurable: true
                });
                Float64Vector.prototype._checkFixed = function () {
                    if (this._fixed) {
                        this.sec.throwError("RangeError", AVMX.Errors.VectorFixedError);
                    }
                };
                Float64Vector.prototype.axGetNumericProperty = function (nm) {
                    release || assert(Shumway.isNumeric(nm));
                    var length = this._length;
                    var idx = nm | 0;
                    if (idx < 0 || idx >= length || idx != nm) {
                        this.sec.throwError("RangeError", AVMX.Errors.OutOfRangeError, nm, length);
                    }
                    return this._buffer[this._offset + idx];
                };
                Float64Vector.prototype.axSetNumericProperty = function (nm, v) {
                    release || assert(Shumway.isNumeric(nm));
                    var length = this._length;
                    var idx = nm | 0;
                    if (idx < 0 || idx > length || idx != nm || (idx === length && this._fixed)) {
                        this.sec.throwError("RangeError", AVMX.Errors.OutOfRangeError, nm, length);
                    }
                    if (idx === this._length) {
                        this._ensureCapacity(this._length + 1);
                        this._length++;
                    }
                    this._buffer[this._offset + idx] = v;
                };
                Float64Vector.prototype.axHasPropertyInternal = function (mn) {
                    // Optimization for the common case of indexed element accesses.
                    if ((mn.name | 0) === mn.name) {
                        release || assert(mn.isRuntimeName());
                        return mn.name >= 0 && mn.name < this._length;
                    }
                    var name = AVMX.axCoerceName(mn.name);
                    if (mn.isRuntimeName() && Shumway.isIndex(name)) {
                        var index = name >>> 0;
                        return index >= 0 && index < this._length;
                    }
                    return this.axResolveMultiname(mn) in this;
                };
                Float64Vector.prototype.axNextValue = function (index) {
                    return this._buffer[this._offset + index - 1];
                };
                Float64Vector.prototype.axNextNameIndex = function (index) {
                    var nextNameIndex = index + 1;
                    if (nextNameIndex <= this._length) {
                        return nextNameIndex;
                    }
                    return 0;
                };
                Float64Vector.EXTRA_CAPACITY = 4;
                Float64Vector.INITIAL_CAPACITY = 10;
                Float64Vector.DEFAULT_VALUE = 0;
                Float64Vector.DESCENDING = 2;
                Float64Vector.UNIQUESORT = 4;
                Float64Vector.RETURNINDEXEDARRAY = 8;
                return Float64Vector;
            })(AS.BaseVector);
            AS.Float64Vector = Float64Vector;
        })(AS = AVMX.AS || (AVMX.AS = {}));
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
/* tslint:disable */
/*
 * Copyright 2014 Mozilla Foundation
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
/*
 NOTE ON E4X METHOD CALLS

 E4X specifies some magic when making calls on XML and XMLList values. If a
 callee is not found on an XMLList value and the list has only one XML
 child, then the call is delegated to that XML child. If a callee is not
 found on an XML value and that value has simple content, then the simple
 content is converted to a string value and the call is made on that string
 value.

 Here are the relevant texts from the spec section 11.2.2.1:

 "If no such property exists and base is an XMLList of size 1, CallMethod
 delegates the method invocation to the single property it contains. This
 treatment intentionally blurs the distinction between XML objects and XMLLists
 of size 1."

 "If no such property exists and base is an XML object containing no XML valued
 children (i.e., an attribute, leaf node or element with simple content),
 CallMethod attempts to delegate the method lookup to the string value
 contained in the leaf node. This treatment allows users to perform operations
 directly on the value of a leaf node without having to explicitly select it."

 NOTE ON E4X ANY NAME AND NAMESPACE

 E4X allows the names of the form x.*, x.ns::*, x.*::id and x.*::* and their
 attribute name counterparts x.@*, x.@ns::*, etc. These forms result in
 Multiname values with the name part equal to undefined in the case of an ANY
 name, and the namespace set being empty in the case of an ANY namespace.

 Note also,
 x.*
 is shorthand for
 x.*::*
 .

 */
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var AS;
        (function (AS) {
            var assert = Shumway.Debug.assert;
            var notImplemented = Shumway.Debug.notImplemented;
            var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
            function isXMLType(val, sec) {
                return typeof val === 'object' && val &&
                    (val.axClass === sec.AXXML || val.axClass === sec.AXXMLList ||
                        val.axClass === sec.AXQName || val.axClass === sec.AXNamespace);
            }
            AS.isXMLType = isXMLType;
            function isXMLCollection(sec, val) {
                return typeof val === 'object' && val &&
                    (val.axClass === sec.AXXML || val.axClass === sec.AXXMLList);
            }
            AS.isXMLCollection = isXMLCollection;
            // 10.1 ToString
            function toString(node, sec) {
                if (!node || node.axClass !== sec.AXXML) {
                    return AVMX.axCoerceString(node);
                }
                switch (node._kind) {
                    case 3 /* Text */:
                    case 2 /* Attribute */:
                        return node._value;
                    default:
                        if (node.hasSimpleContent()) {
                            var s = '';
                            for (var i = 0; i < node._children.length; i++) {
                                var child = node._children[i];
                                if (child._kind === 4 /* Comment */ ||
                                    child._kind === 5 /* ProcessingInstruction */) {
                                    continue;
                                }
                                s += toString(child, sec);
                            }
                            return s;
                        }
                        return toXMLString(sec, node);
                }
            }
            // 10.2.1.1 EscapeElementValue ( s )
            function escapeElementValue(sec, s) {
                if (isXMLCollection(sec, s)) {
                    return s.toXMLString();
                }
                s = AVMX.axCoerceString(s);
                var i = 0, ch;
                while (i < s.length && (ch = s[i]) !== '&' && ch !== '<' && ch !== '>') {
                    i++;
                }
                if (i >= s.length) {
                    return s;
                }
                var buf = s.substring(0, i);
                while (i < s.length) {
                    ch = s[i++];
                    switch (ch) {
                        case '&':
                            buf += '&amp;';
                            break;
                        case '<':
                            buf += '&lt;';
                            break;
                        case '>':
                            buf += '&gt;';
                            break;
                        default:
                            buf += ch;
                            break;
                    }
                }
                return buf;
            }
            AS.escapeElementValue = escapeElementValue;
            // 10.2.1.2 EscapeAttributeValue ( s )
            function escapeAttributeValue(s) {
                s = String(s);
                var i = 0, ch;
                while (i < s.length && (ch = s[i]) !== '&' && ch !== '<' &&
                    ch !== '\"' && ch !== '\n' && ch !== '\r' && ch !== '\t') {
                    i++;
                }
                if (i >= s.length) {
                    return s;
                }
                var buf = s.substring(0, i);
                while (i < s.length) {
                    ch = s[i++];
                    switch (ch) {
                        case '&':
                            buf += '&amp;';
                            break;
                        case '<':
                            buf += '&lt;';
                            break;
                        case '\"':
                            buf += '&quot;';
                            break;
                        case '\n':
                            buf += '&#xA;';
                            break;
                        case '\r':
                            buf += '&#xD;';
                            break;
                        case '\t':
                            buf += '&#x9;';
                            break;
                        default:
                            buf += ch;
                            break;
                    }
                }
                return buf;
            }
            AS.escapeAttributeValue = escapeAttributeValue;
            function isWhitespace(s, index) {
                var ch = s[index];
                return ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t';
            }
            function isWhitespaceString(s) {
                release || assert(typeof s === 'string');
                for (var i = 0; i < s.length; i++) {
                    var ch = s[i];
                    if (!(ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t')) {
                        return false;
                    }
                }
                return true;
            }
            function trimWhitespaces(s) {
                var i = 0;
                while (i < s.length && isWhitespace(s, i)) {
                    i++;
                }
                if (i >= s.length) {
                    return '';
                }
                var j = s.length - 1;
                while (isWhitespace(s, j)) {
                    j--;
                }
                return i === 0 && j === s.length - 1 ? s : s.substring(i, j + 1);
            }
            var indentStringCache = [];
            function getIndentString(indent) {
                if (indent > 0) {
                    if (indentStringCache[indent] !== undefined) {
                        return indentStringCache[indent];
                    }
                    var s = '';
                    for (var i = 0; i < indent; i++) {
                        s += ' ';
                    }
                    indentStringCache[indent] = s;
                    return s;
                }
                return '';
            }
            function generateUniquePrefix(namespaces) {
                var i = 1, newPrefix;
                while (true) {
                    newPrefix = '_ns' + i;
                    if (!namespaces.some(function (ns) { return ns.prefix === newPrefix; })) {
                        return newPrefix;
                    }
                    i++;
                }
            }
            // 10.2 ToXMLString
            function toXMLString(sec, node) {
                if (node === null || node === undefined) {
                    throw new TypeError();
                }
                return escapeElementValue(sec, node);
            }
            // 10.3 ToXML
            function toXML(v, sec) {
                if (v === null) {
                    sec.throwError('TypeError', AVMX.Errors.ConvertNullToObjectError);
                }
                if (v === undefined) {
                    sec.throwError('TypeError', AVMX.Errors.ConvertUndefinedToObjectError);
                }
                if (v.axClass === sec.AXXML) {
                    return v;
                }
                if (v.axClass === sec.AXXMLList) {
                    if (v._children.length !== 1) {
                        sec.throwError('TypeError', AVMX.Errors.XMLMarkupMustBeWellFormed);
                    }
                    return v._children[0];
                }
                // The E4X spec says we must throw a TypeError for non-Boolean, Number, or String objects.
                // Flash thinks otherwise.
                var x = sec.xmlParser.parseFromString(AVMX.axCoerceString(v));
                var length = x._children.length;
                if (length === 0) {
                    return createXML(sec, 3 /* Text */);
                }
                if (length === 1) {
                    x._children[0]._parent = null;
                    return x._children[0];
                }
                sec.throwError('TypeError', AVMX.Errors.XMLMarkupMustBeWellFormed);
            }
            // 10.4 ToXMLList
            function toXMLList(value, targetList) {
                // toXMLList is supposed to just return value if it's an XMLList already. For optimization
                // purposes, we handle that case at the callsites.
                release || assert(typeof value !== 'object' || value && value.axClass !== targetList.axClass);
                if (value === null) {
                    targetList.sec.throwError('TypeError', AVMX.Errors.ConvertNullToObjectError);
                }
                if (value === undefined) {
                    targetList.sec.throwError('TypeError', AVMX.Errors.ConvertUndefinedToObjectError);
                }
                if (value.axClass === targetList.sec.AXXML) {
                    targetList.append(value);
                    return;
                }
                // The E4X spec says we must throw a TypeError for non-Boolean, Number, or String objects.
                // Flash thinks otherwise.
                var defaultNamespace = getDefaultNamespace(targetList.sec);
                var parentString = '<parent xmlns="' + escapeAttributeValue(defaultNamespace.uri) + '">' +
                    value + '</parent>';
                var x = toXML(parentString, targetList.sec);
                var children = x._children;
                if (!children) {
                    return;
                }
                for (var i = 0; i < children.length; i++) {
                    var v = children[i];
                    v._parent = null;
                    targetList.append(v);
                }
            }
            // 10.6 ToXMLName
            function toXMLName(mn, sec) {
                if (mn === undefined) {
                    return anyMultiname;
                }
                var name;
                // convert argument to a value of type AttributeName or a QName object
                // according to the following:
                if (typeof mn === 'object' && mn !== null) {
                    if (mn instanceof AVMX.Multiname) {
                        return mn;
                    }
                    if (mn.axClass === sec.AXQName) {
                        // Object - If the input argument is a QName object,
                        // return its Multiname.
                        return mn.name;
                    }
                    // Object - Otherwise, convert the input argument to a string using ToString.
                    name = String(mn);
                }
                else if (typeof mn === 'number') {
                    name = mn + '';
                }
                else if (typeof mn === 'string') {
                    // String - Create a QName object or AttributeName from the String
                    // as specified below in section 10.6.1. See below.
                    if (mn === '*') {
                        name = null;
                    }
                    else {
                        name = mn;
                    }
                }
                else {
                    sec.throwError('TypeError', AVMX.Errors.XMLInvalidName, mn);
                }
                // ... then convert the result to a QName object or AttributeName
                // as specified in section 10.6.1.
                if (name && name[0] === '@') {
                    // If the first character of s is "@", ToXMLName creates an
                    // AttributeName using the ToAttributeName operator.
                    name = name.substr(1);
                    if (name === '*') {
                        name = null;
                    }
                    return new AVMX.Multiname(null, 0, 13 /* QNameA */, [AVMX.Namespace.PUBLIC], name);
                }
                return new AVMX.Multiname(null, 0, 7 /* QName */, [AVMX.Namespace.PUBLIC], name);
            }
            function coerceE4XMultiname(mn, sec) {
                var out = tmpMultiname;
                out.kind = mn.kind;
                // Queries of the foo[new QName('bar')] sort create this situation.
                if (mn.name && mn.name.axClass === sec.AXQName) {
                    mn = mn.name.name;
                }
                if (mn.isQName()) {
                    out.name = mn.name;
                    out.namespaces = mn.namespaces;
                }
                else {
                    if (mn.isAnyNamespace()) {
                        out.namespaces = mn.namespaces;
                    }
                    else {
                        var defaultNS = getDefaultNamespace(sec);
                        var namespaces = mn.namespaces;
                        var containsDefaultNS = false;
                        for (var i = 0; i < namespaces.length; i++) {
                            var ns = namespaces[i];
                            if (ns.uri === defaultNS.uri && ns.prefix === defaultNS.prefix &&
                                ns.type === defaultNS.type) {
                                containsDefaultNS = true;
                                break;
                            }
                        }
                        if (!containsDefaultNS) {
                            out.namespaces = mn.namespaces.concat(defaultNS);
                        }
                        else {
                            out.namespaces = mn.namespaces;
                        }
                    }
                }
                var name = mn.name;
                if (mn.isAnyName() || name === '*' || name === null) {
                    out.name = null;
                }
                else if (name.length > 1 && name[0] === '@') {
                    if (!out.isAttribute()) {
                        if (name === '@*') {
                            out.name = null;
                        }
                        else {
                            out.name = name.substr(1);
                        }
                        out.kind = out.namespaces.length === 1 ? 13 /* QNameA */ : 14 /* MultinameA */;
                    }
                    else {
                        out.name = name;
                    }
                }
                else {
                    out.name = name;
                }
                return out;
            }
            // 12.1 GetDefaultNamespace
            function getDefaultNamespace(sec) {
                var scope = AVMX.getCurrentScope();
                while (scope) {
                    if (scope.defaultNamespace) {
                        return scope.defaultNamespace;
                    }
                    scope = scope.parent;
                }
                // The outermost default xml namespace is stored in sec.AXNamespace.defaultNamespace.
                return sec.AXNamespace.defaultNamespace;
            }
            /**
             * 13.3.5.4 [[GetNamespace]] ( [ InScopeNamespaces ] )
             *
             * The [[GetNamespace]] method is an internal method that returns a Namespace object with a URI
             * matching the URI of this QName. InScopeNamespaces is an optional parameter. If
             * InScopeNamespaces is unspecified, it is set to the empty set. If one or more Namespaces
             * exists in InScopeNamespaces with a URI matching the URI of this QName, one of the matching
             * Namespaces will be returned. If no such namespace exists in InScopeNamespaces,
             * [[GetNamespace]] creates and returns a new Namespace with a URI matching that of this QName.
             * For implementations that preserve prefixes in QNames, [[GetNamespace]] may return a
             * Namespace that also has a matching prefix. The input argument InScopeNamespaces is a set of
             * Namespace objects.
             */
            function GetNamespace(mn, inScopeNamespaces) {
                release || assert(mn.isQName());
                var uri = mn.uri;
                for (var i = 0; inScopeNamespaces && i < inScopeNamespaces.length; i++) {
                    if (uri === inScopeNamespaces[i].uri) {
                        return inScopeNamespaces[i];
                    }
                }
                return mn.namespaces[0];
            }
            // 13.1.2.1 isXMLName ( value )
            function isXMLName(v, sec) {
                try {
                    var qn = sec.AXQName.Create(v);
                }
                catch (e) {
                    return false;
                }
                // FIXME scan v to see if it is a valid lexeme and return false if not
                return true;
            }
            AS.isXMLName = isXMLName;
            var tmpMultiname = new AVMX.Multiname(null, 0, 7 /* QName */, [], null);
            var anyMultiname = new AVMX.Multiname(null, 0, 7 /* QName */, [], null);
            release || Object.seal(anyMultiname);
            var XMLParserBase = (function () {
                function XMLParserBase() {
                }
                XMLParserBase.prototype.resolveEntities = function (s) {
                    return s.replace(/&([^;]+);/g, function (all, entity) {
                        if (entity.substring(0, 2) === '#x') {
                            return String.fromCharCode(parseInt(entity.substring(2), 16));
                        }
                        else if (entity.substring(0, 1) === '#') {
                            return String.fromCharCode(parseInt(entity.substring(1), 10));
                        }
                        switch (entity) {
                            case 'lt':
                                return '<';
                            case 'gt':
                                return '>';
                            case 'amp':
                                return '&';
                            case 'quot':
                                return '\"';
                        }
                        // throw "Unknown entity: " + entity;
                        return all;
                    });
                };
                XMLParserBase.prototype.parseContent = function (s, start) {
                    var pos = start, name, attributes = [];
                    function skipWs() {
                        while (pos < s.length && isWhitespace(s, pos)) {
                            ++pos;
                        }
                    }
                    while (pos < s.length && !isWhitespace(s, pos) && s[pos] !== ">" && s[pos] !== "/") {
                        ++pos;
                    }
                    name = s.substring(start, pos);
                    skipWs();
                    while (pos < s.length && s[pos] !== ">" &&
                        s[pos] !== "/" && s[pos] !== "?") {
                        skipWs();
                        var attrName = "", attrValue = "";
                        while (pos < s.length && !isWhitespace(s, pos) && s[pos] !== "=") {
                            attrName += s[pos];
                            ++pos;
                        }
                        skipWs();
                        if (s[pos] !== "=") {
                            return null;
                        }
                        ++pos;
                        skipWs();
                        var attrEndChar = s[pos];
                        if (attrEndChar !== "\"" && attrEndChar !== "\'") {
                            return null;
                        }
                        var attrEndIndex = s.indexOf(attrEndChar, ++pos);
                        if (attrEndIndex < 0) {
                            return null;
                        }
                        attrValue = s.substring(pos, attrEndIndex);
                        attributes.push({ name: attrName, value: this.resolveEntities(attrValue) });
                        pos = attrEndIndex + 1;
                        skipWs();
                    }
                    return { name: name, attributes: attributes, parsed: pos - start };
                };
                XMLParserBase.prototype.parseProcessingInstruction = function (s, start) {
                    var pos = start, name, value;
                    function skipWs() {
                        while (pos < s.length && isWhitespace(s, pos)) {
                            ++pos;
                        }
                    }
                    while (pos < s.length && !isWhitespace(s, pos) && s[pos] !== ">" && s[pos] !== "/") {
                        ++pos;
                    }
                    name = s.substring(start, pos);
                    skipWs();
                    var attrStart = pos;
                    while (pos < s.length && (s[pos] !== "?" || s[pos + 1] != '>')) {
                        ++pos;
                    }
                    value = s.substring(attrStart, pos);
                    return { name: name, value: value, parsed: pos - start };
                };
                XMLParserBase.prototype.parseXml = function (s) {
                    var i = 0;
                    while (i < s.length) {
                        var ch = s[i];
                        var j = i;
                        if (ch === "<") {
                            ++j;
                            var ch2 = s[j], q;
                            switch (ch2) {
                                case "/":
                                    ++j;
                                    q = s.indexOf(">", j);
                                    if (q < 0) {
                                        this.onError(-9 /* UnterminatedElement */);
                                        return;
                                    }
                                    this.onEndElement(s.substring(j, q));
                                    j = q + 1;
                                    break;
                                case "?":
                                    ++j;
                                    var pi = this.parseProcessingInstruction(s, j);
                                    if (s.substring(j + pi.parsed, j + pi.parsed + 2) != "?>") {
                                        this.onError(-3 /* UnterminatedXmlDeclaration */);
                                        return;
                                    }
                                    this.onPi(pi.name, pi.value);
                                    j += pi.parsed + 2;
                                    break;
                                case "!":
                                    if (s.substring(j + 1, j + 3) === "--") {
                                        q = s.indexOf("-->", j + 3);
                                        if (q < 0) {
                                            this.onError(-5 /* UnterminatedComment */);
                                            return;
                                        }
                                        this.onComment(s.substring(j + 3, q));
                                        j = q + 3;
                                    }
                                    else if (s.substring(j + 1, j + 8) === "[CDATA[") {
                                        q = s.indexOf("]]>", j + 8);
                                        if (q < 0) {
                                            this.onError(-2 /* UnterminatedCdat */);
                                            return;
                                        }
                                        this.onCdata(s.substring(j + 8, q));
                                        j = q + 3;
                                    }
                                    else if (s.substring(j + 1, j + 8) === "DOCTYPE") {
                                        var q2 = s.indexOf("[", j + 8), complexDoctype = false;
                                        q = s.indexOf(">", j + 8);
                                        if (q < 0) {
                                            this.onError(-4 /* UnterminatedDoctypeDeclaration */);
                                            return;
                                        }
                                        if (q2 > 0 && q > q2) {
                                            q = s.indexOf("]>", j + 8);
                                            if (q < 0) {
                                                this.onError(-4 /* UnterminatedDoctypeDeclaration */);
                                                return;
                                            }
                                            complexDoctype = true;
                                        }
                                        var doctypeContent = s.substring(j + 8, q + (complexDoctype ? 1 : 0));
                                        this.onDoctype(doctypeContent);
                                        // XXX pull entities ?
                                        j = q + (complexDoctype ? 2 : 1);
                                    }
                                    else {
                                        this.onError(-6 /* MalformedElement */);
                                        return;
                                    }
                                    break;
                                default:
                                    var content = this.parseContent(s, j);
                                    if (content === null) {
                                        this.onError(-6 /* MalformedElement */);
                                        return;
                                    }
                                    var isClosed = false;
                                    if (s.substring(j + content.parsed, j + content.parsed + 2) === "/>") {
                                        isClosed = true;
                                    }
                                    else if (s.substring(j + content.parsed, j + content.parsed + 1) !== ">") {
                                        this.onError(-9 /* UnterminatedElement */);
                                        return;
                                    }
                                    this.onBeginElement(content.name, content.attributes, isClosed);
                                    j += content.parsed + (isClosed ? 2 : 1);
                                    break;
                            }
                        }
                        else {
                            do {
                            } while (j++ < s.length && s[j] !== "<");
                            var text = s.substring(i, j);
                            this.onText(this.resolveEntities(text));
                        }
                        i = j;
                    }
                };
                XMLParserBase.prototype.onPi = function (name, value) {
                };
                XMLParserBase.prototype.onComment = function (text) {
                };
                XMLParserBase.prototype.onCdata = function (text) {
                };
                XMLParserBase.prototype.onDoctype = function (doctypeContent) {
                };
                XMLParserBase.prototype.onText = function (text) {
                };
                XMLParserBase.prototype.onBeginElement = function (name, attributes, isEmpty) {
                };
                XMLParserBase.prototype.onEndElement = function (name) {
                };
                XMLParserBase.prototype.onError = function (code) {
                };
                return XMLParserBase;
            })();
            AS.XMLParserBase = XMLParserBase;
            var XMLParser = (function (_super) {
                __extends(XMLParser, _super);
                function XMLParser(sec) {
                    _super.call(this);
                    this.sec = sec;
                    this.scopes = [];
                }
                XMLParser.prototype.isWhitespacePreserved = function () {
                    var scopes = this.scopes;
                    for (var j = scopes.length - 1; j >= 0; --j) {
                        if (scopes[j].space === "preserve") {
                            return true;
                        }
                    }
                    return false;
                };
                XMLParser.prototype.lookupDefaultNs = function () {
                    var scopes = this.scopes;
                    for (var j = scopes.length - 1; j >= 0; --j) {
                        if ('xmlns' in scopes[j]) {
                            return scopes[j].xmlns;
                        }
                    }
                    return '';
                };
                XMLParser.prototype.lookupNs = function (prefix) {
                    var scopes = this.scopes;
                    for (var j = scopes.length - 1; j >= 0; --j) {
                        if (prefix in scopes[j].lookup) {
                            return scopes[j].lookup[prefix];
                        }
                    }
                    return undefined;
                };
                XMLParser.prototype.getName = function (name, resolveDefaultNs) {
                    var j = name.indexOf(':');
                    if (j >= 0) {
                        var prefix = name.substring(0, j);
                        var localName = name.substring(j + 1);
                        var namespace = this.lookupNs(prefix);
                        if (namespace === undefined) {
                            this.sec.throwError('TypeError', AVMX.Errors.XMLPrefixNotBound, prefix, localName);
                        }
                        return {
                            name: namespace + '::' + localName,
                            localName: localName,
                            prefix: prefix,
                            namespace: namespace,
                        };
                    }
                    else if (resolveDefaultNs) {
                        return {
                            name: name,
                            localName: name,
                            prefix: '',
                            namespace: this.lookupDefaultNs()
                        };
                    }
                    else {
                        return {
                            name: name,
                            localName: name,
                            prefix: '',
                            namespace: ''
                        };
                    }
                };
                XMLParser.prototype.onError = function (code) {
                    switch (code) {
                        case -6 /* MalformedElement */:
                            this.sec.throwError('TypeError', AVMX.Errors.XMLMalformedElement);
                            return;
                        case -9 /* UnterminatedElement */:
                            this.sec.throwError('TypeError', AVMX.Errors.XMLUnterminatedElement);
                            return;
                        case -4 /* UnterminatedDoctypeDeclaration */:
                            this.sec.throwError('TypeError', AVMX.Errors.XMLUnterminatedDocTypeDecl);
                            return;
                        case -2 /* UnterminatedCdat */:
                            this.sec.throwError('TypeError', AVMX.Errors.XMLUnterminatedCData);
                            return;
                        case -5 /* UnterminatedComment */:
                            this.sec.throwError('TypeError', AVMX.Errors.XMLUnterminatedComment);
                            return;
                        case -3 /* UnterminatedXmlDeclaration */:
                            this.sec.throwError('TypeError', AVMX.Errors.XMLUnterminatedXMLDecl);
                            return;
                    }
                };
                XMLParser.prototype.onPi = function (name, value) {
                    this.pi(name, value);
                };
                XMLParser.prototype.onComment = function (text) {
                    this.comment(text);
                };
                XMLParser.prototype.onCdata = function (text) {
                    this.cdata(text);
                };
                XMLParser.prototype.onDoctype = function (doctypeContent) {
                    this.doctype(doctypeContent);
                };
                XMLParser.prototype.onText = function (text) {
                    this.text(text, this.isWhitespacePreserved());
                };
                XMLParser.prototype.onBeginElement = function (name, contentAttributes, isEmpty) {
                    var scopes = this.scopes;
                    var scope = {
                        namespaces: [],
                        lookup: Object.create(null),
                        inScopes: null
                    };
                    for (var q = 0; q < contentAttributes.length; ++q) {
                        var attribute = contentAttributes[q];
                        var attributeName = attribute.name;
                        if (attributeName.substring(0, 6) === "xmlns:") {
                            var prefix = attributeName.substring(6);
                            var uri = attribute.value;
                            if (this.lookupNs(prefix) !== uri) {
                                scope.lookup[prefix] = trimWhitespaces(uri);
                                var ns = AVMX.internPrefixedNamespace(0 /* Public */, uri, prefix);
                                scope.namespaces.push(ns);
                            }
                            contentAttributes[q] = null;
                        }
                        else if (attributeName === "xmlns") {
                            var uri = attribute.value;
                            if (this.lookupDefaultNs() !== uri) {
                                scope["xmlns"] = trimWhitespaces(uri);
                                var ns = AVMX.internNamespace(0 /* Public */, uri);
                                scope.namespaces.push(ns);
                            }
                            contentAttributes[q] = null;
                        }
                        else if (attributeName.substring(0, 4) === "xml:") {
                            var xmlAttrName = attributeName.substring(4);
                            scope[xmlAttrName] = trimWhitespaces(attribute.value);
                        }
                        else {
                        }
                    }
                    // build list of all namespaces including ancestors'
                    var inScopeNamespaces = [];
                    scope.namespaces.forEach(function (ns) {
                        if (!ns.prefix || scope.lookup[ns.prefix] === ns.uri) {
                            inScopeNamespaces.push(ns);
                        }
                    });
                    scopes[scopes.length - 1].inScopes.forEach(function (ns) {
                        if ((ns.prefix && !(ns.prefix in scope.lookup)) ||
                            (!ns.prefix && !('xmlns' in scope))) {
                            inScopeNamespaces.push(ns);
                        }
                    });
                    scope.inScopes = inScopeNamespaces;
                    scopes.push(scope);
                    var attributes = [];
                    for (q = 0; q < contentAttributes.length; ++q) {
                        attribute = contentAttributes[q];
                        if (attribute) {
                            attributes.push({
                                name: this.getName(attribute.name, false),
                                value: attribute.value
                            });
                        }
                    }
                    this.beginElement(this.getName(name, true), attributes, inScopeNamespaces, isEmpty);
                    if (isEmpty) {
                        scopes.pop();
                    }
                };
                XMLParser.prototype.onEndElement = function (name) {
                    this.endElement(this.getName(name, true));
                    this.scopes.pop();
                };
                XMLParser.prototype.beginElement = function (name, attrs, namespaces, isEmpty) {
                    var parent = this.currentElement;
                    this.elementsStack.push(parent);
                    this.currentElement = createXML(this.sec, 1 /* Element */, name.namespace, name.localName, name.prefix);
                    for (var i = 0; i < attrs.length; ++i) {
                        var rawAttr = attrs[i];
                        var attr = createXML(this.sec, 2 /* Attribute */, rawAttr.name.namespace, rawAttr.name.localName, rawAttr.name.prefix);
                        attr._value = rawAttr.value;
                        attr._parent = this.currentElement;
                        this.currentElement._attributes.push(attr);
                    }
                    for (var i = 0; i < namespaces.length; ++i) {
                        this.currentElement._inScopeNamespaces.push(namespaces[i]);
                    }
                    parent.insert(parent._children.length, this.currentElement);
                    if (isEmpty) {
                        this.currentElement = this.elementsStack.pop();
                    }
                };
                XMLParser.prototype.endElement = function (name) {
                    this.currentElement = this.elementsStack.pop();
                };
                XMLParser.prototype.text = function (text, isWhitespacePreserve) {
                    if (this.sec.AXXML.ignoreWhitespace) {
                        text = trimWhitespaces(text);
                    }
                    // TODO: do an in-depth analysis of what isWhitespacePreserve is about.
                    if (text.length === 0 || isWhitespacePreserve && this.sec.AXXML.ignoreWhitespace) {
                        return;
                    }
                    var node = createXML(this.sec);
                    node._value = text;
                    this.currentElement.insert(this.currentElement._children.length, node);
                };
                XMLParser.prototype.cdata = function (text) {
                    var node = createXML(this.sec);
                    node._value = text;
                    this.currentElement.insert(this.currentElement._children.length, node);
                };
                XMLParser.prototype.comment = function (text) {
                    if (this.sec.AXXML.ignoreComments) {
                        return;
                    }
                    var node = createXML(this.sec, 4 /* Comment */, "", "");
                    node._value = text;
                    this.currentElement.insert(this.currentElement._children.length, node);
                };
                XMLParser.prototype.pi = function (name, value) {
                    if (this.sec.AXXML.ignoreProcessingInstructions) {
                        return;
                    }
                    var node = createXML(this.sec, 5 /* ProcessingInstruction */, "", name);
                    node._value = value;
                    this.currentElement.insert(this.currentElement._children.length, node);
                };
                XMLParser.prototype.doctype = function (text) { };
                XMLParser.prototype.parseFromString = function (s, mimeType) {
                    // placeholder
                    var currentElement = this.currentElement = createXML(this.sec, 1 /* Element */, '', '', '');
                    this.elementsStack = [];
                    var defaultNs = getDefaultNamespace(this.sec);
                    var scopes = [{
                            namespaces: [],
                            lookup: {
                                "xmlns": 'http://www.w3.org/2000/xmlns/',
                                "xml": 'http://www.w3.org/XML/1998/namespace'
                            },
                            inScopes: [defaultNs],
                            space: 'default',
                            xmlns: defaultNs.uri
                        }];
                    this.scopes = scopes;
                    this.parseXml(s);
                    this.currentElement = null;
                    if (this.elementsStack.length > 0) {
                        var nm = this.elementsStack.pop()._name.name;
                        this.sec.throwError('TypeError', AVMX.Errors.XMLUnterminatedElementTag, nm, nm);
                    }
                    this.elementsStack = null;
                    return currentElement;
                };
                return XMLParser;
            })(XMLParserBase);
            AS.XMLParser = XMLParser;
            var ASNamespace = (function (_super) {
                __extends(ASNamespace, _super);
                /**
                 * 13.2.2 The Namespace Constructor
                 *
                 * Namespace ()
                 * Namespace (uriValue)
                 * Namespace (prefixValue, uriValue)
                 */
                function ASNamespace(uriOrPrefix_, uri_) {
                    _super.call(this);
                    // 1. Create a new Namespace object n
                    var uri = "";
                    var prefix = "";
                    // 2. If prefixValue is not specified and uriValue is not specified
                    if (arguments.length === 0) {
                    }
                    else if (arguments.length === 1) {
                        var uriValue = uriOrPrefix_;
                        if (uriValue instanceof AVMX.Namespace) {
                            this._ns = uriValue;
                            return;
                        }
                        release || AVMX.checkValue(uriValue);
                        if (uriValue && typeof uriValue === 'object') {
                            // Non-spec'ed, but very useful:
                            // a. If Type(uriValue) is Object and uriValue.[[Class]] == "Namespace"
                            if (uriValue.axClass === this.sec.AXNamespace) {
                                var uriValueAsNamespace = uriValue;
                                // i. Let n.prefix = uriValue.prefix
                                prefix = uriValueAsNamespace.prefix;
                                // ii. Let n.uri = uriValue.uri
                                uri = uriValueAsNamespace.uri;
                            }
                            else if (uriValue.axClass === this.sec.AXQName &&
                                uriValue.uri !== null) {
                                // i. Let n.uri = uriValue.uri
                                uri = uriValue.uri;
                            }
                        }
                        else {
                            // i. Let n.uri = ToString(uriValue)
                            uri = toString(uriValue, this.sec);
                            // ii. If (n.uri is the empty string), let n.prefix be the empty string
                            if (uri === "") {
                                prefix = "";
                            }
                            else {
                                prefix = undefined;
                            }
                        }
                    }
                    else {
                        var prefixValue = uriOrPrefix_;
                        var uriValue = uri_;
                        // a. If Type(uriValue) is Object and uriValue.[[Class]] == "QName" and uriValue.uri is not
                        // null
                        if (Shumway.isObject(uriValue) && uriValue.axClass === this.sec.AXQName &&
                            uriValue.uri !== null) {
                            // i. Let n.uri = uriValue.uri
                            uri = uriValue.uri;
                        }
                        else {
                            // i. Let n.uri = ToString(uriValue)
                            uri = toString(uriValue, this.sec);
                        }
                        // c. If n.uri is the empty string
                        if (uri === "") {
                            // i. If prefixValue is undefined or ToString(prefixValue) is the empty string
                            if (prefixValue === undefined || toString(prefixValue, this.sec) === "") {
                                // 1. Let n.prefix be the empty string
                                prefix = "";
                            }
                            else {
                                // ii. Else throw a TypeError exception
                                this.sec.throwError('TypeError', AVMX.Errors.XMLNamespaceWithPrefixAndNoURI, prefixValue);
                            }
                        }
                        else if (prefixValue === undefined) {
                            prefix = undefined;
                        }
                        else if (isXMLName(prefixValue, this.sec) === false) {
                            // i. Let n.prefix = undefined
                            prefix = undefined;
                        }
                        else {
                            prefix = toString(prefixValue, this.sec);
                        }
                    }
                    // 5. Return n
                    this._ns = AVMX.internPrefixedNamespace(0 /* Public */, uri, prefix);
                }
                ASNamespace.classInitializer = function () {
                    defineNonEnumerableProperty(this, '$Bglength', 2);
                    var proto = this.dPrototype;
                    var asProto = ASNamespace.prototype;
                    defineNonEnumerableProperty(proto, '$BgtoString', asProto.toString);
                };
                /**
                 * 13.2.1 The Namespace Constructor Called as a Function
                 *
                 * Namespace ()
                 * Namespace (uriValue)
                 * Namespace (prefixValue, uriValue)
                 */
                ASNamespace.axApply = function (self, args) {
                    var a = args[0];
                    var b = args[1];
                    // 1. If (prefixValue is not specified and Type(uriValue) is Object and
                    // uriValue.[[Class]] == "Namespace")
                    if (args.length === 1 && Shumway.isObject(a) && a.axClass === this.sec.AXNamespace) {
                        // a. Return uriValue
                        return a;
                    }
                    // 2. Create and return a new Namespace object exactly as if the Namespace constructor had
                    // been called with the same arguments (section 13.2.2).
                    switch (args.length) {
                        case 0:
                            return this.sec.AXNamespace.Create();
                        case 1:
                            return this.sec.AXNamespace.Create(a);
                        default:
                            return this.sec.AXNamespace.Create(a, b);
                    }
                };
                ASNamespace.Create = function (uriOrPrefix_, uri_) {
                    var ns = Object.create(this.sec.AXNamespace.tPrototype);
                    // The initializer relies on arguments.length being correct.
                    ns.axInitializer.apply(ns, arguments);
                    return ns;
                };
                ASNamespace.FromNamespace = function (ns) {
                    var result = Object.create(this.sec.AXNamespace.tPrototype);
                    result._ns = ns;
                    return result;
                };
                // E4X 11.5.1 The Abstract Equality Comparison Algorithm, step 3.c.
                ASNamespace.prototype.equals = function (other) {
                    return other && other.axClass === this.axClass &&
                        other._ns.uri === this._ns.uri ||
                        typeof other === 'string' && this._ns.uri === other;
                };
                Object.defineProperty(ASNamespace.prototype, "prefix", {
                    get: function () {
                        return this._ns.prefix;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASNamespace.prototype, "uri", {
                    get: function () {
                        return this._ns.uri;
                    },
                    enumerable: true,
                    configurable: true
                });
                ASNamespace.prototype.toString = function () {
                    if (this === this.axClass.dPrototype) {
                        return '';
                    }
                    return this._ns.uri;
                };
                ASNamespace.prototype.valueOf = function () {
                    if (this === this.axClass.dPrototype) {
                        return '';
                    }
                    return this._ns.uri;
                };
                ASNamespace.instanceConstructor = ASNamespace;
                ASNamespace.defaultNamespace = AVMX.Namespace.PUBLIC;
                return ASNamespace;
            })(AS.ASObject);
            AS.ASNamespace = ASNamespace;
            var ASQName = (function (_super) {
                __extends(ASQName, _super);
                /**
                 * 13.3.2 The QName Constructor
                 *
                 * new QName ()
                 * new QName (Name)
                 * new QName (Namespace, Name)
                 */
                function ASQName(nameOrNS_, name_) {
                    _super.call(this);
                    var name;
                    var namespace;
                    if (arguments.length === 0) {
                        name = "";
                    }
                    else if (arguments.length === 1) {
                        name = nameOrNS_;
                    }
                    else {
                        namespace = nameOrNS_;
                        name = name_;
                    }
                    // 1. If (Type(Name) is Object and Name.[[Class]] == "QName")
                    if (name && name.axClass === this.sec.AXQName) {
                        // a. If (Namespace is not specified), return a copy of Name
                        if (arguments.length < 2) {
                            release || assert(name !== tmpMultiname);
                            this.name = name.name;
                            return;
                        }
                        else {
                            name = name.localName;
                        }
                    }
                    // 2. If (Name is undefined or not specified)
                    if (name === undefined) {
                        // a. Let Name = ""
                        name = "";
                    }
                    else {
                        name = toString(name, this.sec);
                    }
                    // 4. If (Namespace is undefined or not specified)
                    if (namespace === undefined) {
                        // a. If Name = "*"
                        if (name === "*") {
                            // i. Let Namespace = null
                            namespace = null;
                        }
                        else {
                            // i. Let Namespace = GetDefaultNamespace()
                            namespace = getDefaultNamespace(this.sec);
                        }
                    }
                    // 5. Let q be a new QName with q.localName = Name
                    var localName = name;
                    var ns = null;
                    // 6. If Namespace == null
                    if (namespace !== null) {
                        // a. Let Namespace be a new Namespace created as if by calling the constructor new
                        // Namespace(Namespace)
                        if (namespace.axClass !== this.sec.AXNamespace) {
                            namespace = this.sec.AXNamespace.Create(namespace);
                        }
                        ns = namespace._ns;
                    }
                    // 8. Return q
                    this.name = new AVMX.Multiname(null, 0, 7 /* QName */, [ns], localName);
                }
                ASQName.classInitializer = function () {
                    defineNonEnumerableProperty(this, '$Bglength', 2);
                    var proto = this.dPrototype;
                    var asProto = ASQName.prototype;
                    defineNonEnumerableProperty(proto, '$BgtoString', asProto.ecmaToString);
                };
                ASQName.Create = function (nameOrNS_, name_, isAttribute) {
                    var name = Object.create(this.sec.AXQName.tPrototype);
                    // The initializer relies on arguments.length being correct.
                    name.axInitializer.apply(name, arguments);
                    return name;
                };
                ASQName.FromMultiname = function (mn) {
                    var name = Object.create(this.sec.AXQName.tPrototype);
                    name.name = mn;
                    return name;
                };
                /**
                 * 13.3.1 The QName Constructor Called as a Function
                 *
                 * QName ( )
                 * QName ( Name )
                 * QName ( Namespace , Name )
                 */
                ASQName.axApply = function (self, args) {
                    var nameOrNS_ = args[0];
                    var name_ = args[1];
                    // 1. If Namespace is not specified and Type(Name) is Object and Name.[[Class]] == “QName”
                    if (args.length === 1 && nameOrNS_ && nameOrNS_.axClass === this.sec.AXQName) {
                        // a. Return Name
                        return nameOrNS_;
                    }
                    // 2. Create and return a new QName object exactly as if the QName constructor had been
                    // called with the same arguments (section 13.3.2).
                    switch (args.length) {
                        case 0:
                            return this.sec.AXQName.Create();
                        case 1:
                            return this.sec.AXQName.Create(nameOrNS_);
                        default:
                            return this.sec.AXQName.Create(nameOrNS_, name_);
                    }
                };
                // E4X 11.5.1 The Abstract Equality Comparison Algorithm, step 3.b.
                ASQName.prototype.equals = function (other) {
                    return other && other.axClass === this.sec.AXQName &&
                        other.uri === this.uri && other.name.name === this.name.name ||
                        typeof other === 'string' && this.toString() === other;
                };
                Object.defineProperty(ASQName.prototype, "localName", {
                    get: function () {
                        return this.name.name;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASQName.prototype, "uri", {
                    get: function () {
                        var namespaces = this.name.namespaces;
                        return namespaces.length > 1 ? '' : namespaces[0] ? namespaces[0].uri : null;
                    },
                    enumerable: true,
                    configurable: true
                });
                ASQName.prototype.ecmaToString = function () {
                    if (this && this === this.sec.AXQName.dPrototype) {
                        return "";
                    }
                    if (!(this && this.axClass === this.sec.AXQName)) {
                        this.sec.throwError('TypeError', AVMX.Errors.InvokeOnIncompatibleObjectError, "QName.prototype.toString");
                    }
                    return this.toString();
                };
                ASQName.prototype.toString = function () {
                    var uri = this.uri;
                    if (uri === "") {
                        return this.name.name;
                    }
                    if (uri === null) {
                        return "*::" + this.name.name;
                    }
                    uri = uri + '';
                    var cc = uri.charCodeAt(uri.length - 1);
                    // strip the version mark, if there is one
                    var base_uri = uri;
                    if (cc >= 0xE000 && cc <= 0xF8FF) {
                        base_uri = uri.substr(0, uri.length - 1);
                    }
                    if (base_uri === "") {
                        return this.name.name;
                    }
                    return base_uri + "::" + this.name.name;
                };
                ASQName.prototype.valueOf = function () {
                    return this;
                };
                Object.defineProperty(ASQName.prototype, "prefix", {
                    /**
                     * 13.3.5.3 [[Prefix]]
                     * The [[Prefix]] property is an optional internal property that is not directly visible to
                     * users. It may be used by implementations that preserve prefixes in qualified names. The
                     * value of the [[Prefix]] property is a value of type string or undefined. If the [[Prefix]]
                     * property is undefined, the prefix associated with this QName is unknown.
                     */
                    get: function () {
                        return this.name.namespaces[0] ? this.name.namespaces[0].prefix : null;
                    },
                    enumerable: true,
                    configurable: true
                });
                return ASQName;
            })(AS.ASObject);
            AS.ASQName = ASQName;
            var ASXML_FLAGS;
            (function (ASXML_FLAGS) {
                ASXML_FLAGS[ASXML_FLAGS["FLAG_IGNORE_COMMENTS"] = 1] = "FLAG_IGNORE_COMMENTS";
                ASXML_FLAGS[ASXML_FLAGS["FLAG_IGNORE_PROCESSING_INSTRUCTIONS"] = 2] = "FLAG_IGNORE_PROCESSING_INSTRUCTIONS";
                ASXML_FLAGS[ASXML_FLAGS["FLAG_IGNORE_WHITESPACE"] = 4] = "FLAG_IGNORE_WHITESPACE";
                ASXML_FLAGS[ASXML_FLAGS["FLAG_PRETTY_PRINTING"] = 8] = "FLAG_PRETTY_PRINTING";
                ASXML_FLAGS[ASXML_FLAGS["ALL"] = 15] = "ALL";
            })(ASXML_FLAGS || (ASXML_FLAGS = {}));
            var ASXMLKindNames = [null, 'element', 'attribute', 'text', 'comment', 'processing-instruction'];
            var ASXML = (function (_super) {
                __extends(ASXML, _super);
                function ASXML(value) {
                    _super.call(this);
                    this._parent = null;
                    if (Shumway.isNullOrUndefined(value)) {
                        value = "";
                    }
                    if (typeof value === 'string' && value.length === 0) {
                        this._kind = 3 /* Text */;
                        this._value = '';
                        return;
                    }
                    var x = toXML(value, this.sec);
                    if (isXMLType(value, this.sec)) {
                        x = x._deepCopy();
                    }
                    this._kind = x._kind;
                    this._name = x._name;
                    this._value = x._value;
                    this._attributes = x._attributes;
                    this._inScopeNamespaces = x._inScopeNamespaces;
                    var children = x._children;
                    this._children = children;
                    if (children) {
                        for (var i = 0; i < children.length; i++) {
                            var child = children[i];
                            child._parent = this;
                        }
                    }
                }
                ASXML.classInitializer = function () {
                    defineNonEnumerableProperty(this, '$Bglength', 1);
                    var proto = this.dPrototype;
                    var asProto = ASXML.prototype;
                    AS.addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);
                    defineNonEnumerableProperty(proto, '$BghasOwnProperty', asProto.native_hasOwnProperty);
                    defineNonEnumerableProperty(proto, '$BgpropertyIsEnumerable', asProto.native_propertyIsEnumerable);
                    AS.addPrototypeFunctionAlias(this, '$Bgsettings', ASXML.native_settings);
                    AS.addPrototypeFunctionAlias(this, '$BgsetSettings', ASXML.native_setSettings);
                    AS.addPrototypeFunctionAlias(this, '$BgdefaultSettings', ASXML.native_defaultSettings);
                    AS.addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
                    AS.addPrototypeFunctionAlias(proto, '$BgaddNamespace', asProto.addNamespace);
                    AS.addPrototypeFunctionAlias(proto, '$BgappendChild', asProto.appendChild);
                    AS.addPrototypeFunctionAlias(proto, '$Bgattribute', asProto.attribute);
                    AS.addPrototypeFunctionAlias(proto, '$Bgattributes', asProto.attributes);
                    AS.addPrototypeFunctionAlias(proto, '$Bgchild', asProto.child);
                    AS.addPrototypeFunctionAlias(proto, '$BgchildIndex', asProto.childIndex);
                    AS.addPrototypeFunctionAlias(proto, '$Bgchildren', asProto.children);
                    AS.addPrototypeFunctionAlias(proto, '$Bgcomments', asProto.comments);
                    AS.addPrototypeFunctionAlias(proto, '$Bgcontains', asProto.contains);
                    AS.addPrototypeFunctionAlias(proto, '$Bgcopy', asProto.copy);
                    AS.addPrototypeFunctionAlias(proto, '$Bgdescendants', asProto.descendants);
                    AS.addPrototypeFunctionAlias(proto, '$Bgelements', asProto.elements);
                    AS.addPrototypeFunctionAlias(proto, '$BghasComplexContent', asProto.hasComplexContent);
                    AS.addPrototypeFunctionAlias(proto, '$BghasSimpleContent', asProto.hasSimpleContent);
                    AS.addPrototypeFunctionAlias(proto, '$BginScopeNamespaces', asProto.inScopeNamespaces);
                    AS.addPrototypeFunctionAlias(proto, '$BginsertChildAfter', asProto.insertChildAfter);
                    AS.addPrototypeFunctionAlias(proto, '$BginsertChildBefore', asProto.insertChildBefore);
                    AS.addPrototypeFunctionAlias(proto, '$Bglength', asProto.length);
                    AS.addPrototypeFunctionAlias(proto, '$BglocalName', asProto.localName);
                    AS.addPrototypeFunctionAlias(proto, '$Bgname', asProto.name);
                    AS.addPrototypeFunctionAlias(proto, '$Bgnamespace', asProto.namespace);
                    AS.addPrototypeFunctionAlias(proto, '$BgnamespaceDeclarations', asProto.namespaceDeclarations);
                    AS.addPrototypeFunctionAlias(proto, '$BgnodeKind', asProto.nodeKind);
                    AS.addPrototypeFunctionAlias(proto, '$Bgnormalize', asProto.normalize);
                    AS.addPrototypeFunctionAlias(proto, '$Bgparent', asProto.parent);
                    AS.addPrototypeFunctionAlias(proto, '$BgprocessingInstructions', asProto.processingInstructions);
                    AS.addPrototypeFunctionAlias(proto, '$BgprependChild', asProto.prependChild);
                    AS.addPrototypeFunctionAlias(proto, '$BgremoveNamespace', asProto.removeNamespace);
                    AS.addPrototypeFunctionAlias(proto, '$Bgreplace', asProto.replace);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetChildren', asProto.setChildren);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetLocalName', asProto.setLocalName);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetName', asProto.setName);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetNamespace', asProto.setNamespace);
                    AS.addPrototypeFunctionAlias(proto, '$Bgtext', asProto.text);
                    AS.addPrototypeFunctionAlias(proto, '$BgtoXMLString', asProto.toXMLString);
                    AS.addPrototypeFunctionAlias(proto, '$BgtoJSON', asProto.toJSON);
                };
                ASXML.Create = function (value) {
                    var xml = Object.create(this.sec.AXXML.tPrototype);
                    xml.axInitializer(value);
                    return xml;
                };
                ASXML.resetSettings = function () {
                    this._flags = ASXML_FLAGS.ALL;
                };
                ASXML.native_settings = function () {
                    var settings = Object.create(this.sec.AXObject.tPrototype);
                    settings.$BgignoreComments = this.ignoreComments;
                    settings.$BgignoreProcessingInstructions = this.ignoreProcessingInstructions;
                    settings.$BgignoreWhitespace = this.ignoreWhitespace;
                    settings.$BgprettyPrinting = this.prettyPrinting;
                    settings.$BgprettyIndent = this.prettyIndent;
                    return settings;
                };
                ASXML.native_setSettings = function (o) {
                    if (Shumway.isNullOrUndefined(o)) {
                        this.ignoreComments = true;
                        this.ignoreProcessingInstructions = true;
                        this.ignoreWhitespace = true;
                        this.prettyPrinting = true;
                        this.prettyIndent = 2;
                        return;
                    }
                    if (typeof o.$BgignoreComments === 'boolean') {
                        this.ignoreComments = o.$BgignoreComments;
                    }
                    if (typeof o.$BgignoreProcessingInstructions === 'boolean') {
                        this.ignoreProcessingInstructions = o.$BgignoreProcessingInstructions;
                    }
                    if (typeof o.$BgignoreWhitespace === 'boolean') {
                        this.ignoreWhitespace = o.$BgignoreWhitespace;
                    }
                    if (o.$BgprettyPrinting === 'boolean') {
                        this.prettyPrinting = o.$BgprettyPrinting;
                    }
                    if (o.$BgprettyIndent === 'number') {
                        this.prettyIndent = o.$BgprettyIndent;
                    }
                };
                ASXML.native_defaultSettings = function () {
                    return {
                        __proto__: this.sec.AXObject.tPrototype,
                        $BgignoreComments: true,
                        $BgignoreProcessingInstructions: true,
                        $BgignoreWhitespace: true,
                        $BgprettyPrinting: true,
                        $BgprettyIndent: 2
                    };
                };
                ASXML.axApply = function (self, args) {
                    var value = args[0];
                    // 13.5.1 The XMLList Constructor Called as a Function
                    if (Shumway.isNullOrUndefined(value)) {
                        value = '';
                    }
                    return toXML(value, this.sec);
                };
                ASXML.prototype.valueOf = function () {
                    return this;
                };
                // E4X 11.5.1 The Abstract Equality Comparison Algorithm, steps 1-4.
                ASXML.prototype.equals = function (other) {
                    // Steps 1,2.
                    if (other && other.axClass === this.sec.AXXMLList) {
                        return other.equals(this);
                    }
                    // Step 3.
                    if (other && other.axClass === this.sec.AXXML) {
                        // Step 3.a.i.
                        var otherXML = other;
                        if ((this._kind === 3 /* Text */ || this._kind === 2 /* Attribute */) &&
                            otherXML.hasSimpleContent() ||
                            (otherXML._kind === 3 /* Text */ || otherXML._kind === 2 /* Attribute */) &&
                                this.hasSimpleContent()) {
                            return this.toString() === other.toString();
                        }
                        // Step 3.a.ii.
                        return this._deepEquals(other);
                    }
                    // Step 4.
                    return this.hasSimpleContent() && this.toString() === AVMX.axCoerceString(other);
                    // The remaining steps are implemented by other means in the interpreter/compiler.
                };
                ASXML.prototype.init = function (kind, mn) {
                    this._name = mn;
                    this._kind = kind; // E4X [[Class]]
                    this._parent = null;
                    switch (kind) {
                        case 1 /* Element */:
                            this._inScopeNamespaces = [];
                            this._attributes = [];
                            this._children = []; // child nodes go here
                            break;
                        case 4 /* Comment */:
                        case 5 /* ProcessingInstruction */:
                        case 2 /* Attribute */:
                        case 3 /* Text */:
                            this._value = '';
                            break;
                        default:
                            break;
                    }
                    return this;
                };
                // 9.1.1.9 [[Equals]] (V)
                ASXML.prototype._deepEquals = function (V) {
                    // Step 1.
                    if (!V || V.axClass !== this.sec.AXXML) {
                        return false;
                    }
                    var other = V;
                    // Step 2.
                    if (this._kind !== other._kind) {
                        return false;
                    }
                    // Steps 3-4.
                    if (!!this._name !== !!other._name || (this._name && !this._name.equalsQName(other._name))) {
                        return false;
                    }
                    // Not in the spec, but a substantial optimization.
                    if (this._kind !== 1 /* Element */) {
                        // Step 7.
                        // This only affects non-Element nodes, so moved up here.
                        if (this._value !== other._value) {
                            return false;
                        }
                        return true;
                    }
                    // Step 5.
                    var attributes = this._attributes;
                    var otherAttributes = other._attributes;
                    if (attributes.length !== otherAttributes.length) {
                        return false;
                    }
                    // Step 6.
                    var children = this._children;
                    var otherChildren = other._children;
                    if (children.length !== otherChildren.length) {
                        return false;
                    }
                    // Step 8.
                    attribOuter: for (var i = 0; i < attributes.length; i++) {
                        var attribute = attributes[i];
                        for (var j = 0; j < otherAttributes.length; j++) {
                            var otherAttribute = otherAttributes[j];
                            if (otherAttribute._name.equalsQName(attribute._name) &&
                                otherAttribute._value === attribute._value) {
                                continue attribOuter;
                            }
                        }
                        return false;
                    }
                    // Step 9.
                    for (var i = 0; i < children.length; i++) {
                        if (!children[i].equals(otherChildren[i])) {
                            return false;
                        }
                    }
                    // Step 10.
                    return true;
                };
                // 9.1.1.7 [[DeepCopy]] ( )
                ASXML.prototype._deepCopy = function () {
                    var kind = this._kind;
                    var clone = this.sec.AXXML.Create();
                    clone._kind = kind;
                    clone._name = this._name;
                    switch (kind) {
                        case 1 /* Element */:
                            clone._inScopeNamespaces = this._inScopeNamespaces.slice();
                            clone._attributes = this._attributes.map(function (attr) {
                                attr = attr._deepCopy();
                                attr._parent = clone;
                                return attr;
                            });
                            clone._children = this._children.map(function (child) {
                                child = child._deepCopy();
                                child._parent = clone;
                                return child;
                            });
                            break;
                        case 4 /* Comment */:
                        case 5 /* ProcessingInstruction */:
                        case 2 /* Attribute */:
                        case 3 /* Text */:
                            clone._value = this._value;
                            break;
                        default:
                            break;
                    }
                    return clone;
                };
                // 9.1.1.10 [[ResolveValue]] ( )
                ASXML.prototype.resolveValue = function () {
                    return this;
                };
                ASXML.prototype._addInScopeNamespace = function (ns) {
                    if (this._inScopeNamespaces.some(function (ins) { return ins.uri === ns.uri && ins.prefix === ns.prefix; })) {
                        return;
                    }
                    this._inScopeNamespaces.push(ns);
                };
                Object.defineProperty(ASXML, "ignoreComments", {
                    get: function () {
                        return !!(this._flags & ASXML_FLAGS.FLAG_IGNORE_COMMENTS);
                    },
                    set: function (newIgnore) {
                        newIgnore = !!newIgnore;
                        if (newIgnore) {
                            this._flags |= ASXML_FLAGS.FLAG_IGNORE_COMMENTS;
                        }
                        else {
                            this._flags &= ~ASXML_FLAGS.FLAG_IGNORE_COMMENTS;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASXML, "ignoreProcessingInstructions", {
                    get: function () {
                        return !!(this._flags & ASXML_FLAGS.FLAG_IGNORE_PROCESSING_INSTRUCTIONS);
                    },
                    set: function (newIgnore) {
                        newIgnore = !!newIgnore;
                        if (newIgnore) {
                            this._flags |= ASXML_FLAGS.FLAG_IGNORE_PROCESSING_INSTRUCTIONS;
                        }
                        else {
                            this._flags &= ~ASXML_FLAGS.FLAG_IGNORE_PROCESSING_INSTRUCTIONS;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASXML, "ignoreWhitespace", {
                    get: function () {
                        return !!(this._flags & ASXML_FLAGS.FLAG_IGNORE_WHITESPACE);
                    },
                    set: function (newIgnore) {
                        newIgnore = !!newIgnore;
                        if (newIgnore) {
                            this._flags |= ASXML_FLAGS.FLAG_IGNORE_WHITESPACE;
                        }
                        else {
                            this._flags &= ~ASXML_FLAGS.FLAG_IGNORE_WHITESPACE;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASXML, "prettyPrinting", {
                    get: function () {
                        return !!(this._flags & ASXML_FLAGS.FLAG_PRETTY_PRINTING);
                    },
                    set: function (newPretty) {
                        newPretty = !!newPretty;
                        if (newPretty) {
                            this._flags |= ASXML_FLAGS.FLAG_PRETTY_PRINTING;
                        }
                        else {
                            this._flags &= ~ASXML_FLAGS.FLAG_PRETTY_PRINTING;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASXML, "prettyIndent", {
                    get: function () {
                        return this._prettyIndent;
                    },
                    set: function (newIndent /*int*/) {
                        newIndent = newIndent | 0;
                        this._prettyIndent = newIndent;
                    },
                    enumerable: true,
                    configurable: true
                });
                ASXML.prototype.toString = function () {
                    if (this === this.axClass.dPrototype) {
                        return '';
                    }
                    if (this.hasComplexContent()) {
                        return this.toXMLString();
                    }
                    return toString(this, this.sec);
                };
                // 13.4.4.14 XML.prototype.hasOwnProperty ( P )
                ASXML.prototype.native_hasOwnProperty = function (P) {
                    if (this === this.axClass.dPrototype) {
                        return AS.ASObject.prototype.native_hasOwnProperty.call(this, P);
                    }
                    var mn = toXMLName(P, this.sec);
                    if (this.hasProperty(mn)) {
                        return true;
                    }
                    return this.axHasOwnProperty(mn);
                };
                // 13.4.4.30 XML.prototype.propertyIsEnumerable ( P )
                ASXML.prototype.native_propertyIsEnumerable = function (P) {
                    if (P === void 0) { P = undefined; }
                    return String(P) === "0";
                };
                ASXML.prototype.addNamespace = function (ns) {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    // 13.4.4.2 XML.prototype.addNamespace ( namespace )
                    this._addInScopeNamespace(ns);
                    return this;
                };
                ASXML.prototype.appendChild = function (child) {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    this.insert(this._children.length, child);
                    return this;
                };
                ASXML.prototype.attribute = function (arg) {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    if (Shumway.isNullOrUndefined(arg) && arguments.length > 0) {
                        this.sec.throwError('TypeError', AVMX.Errors.ConvertUndefinedToObjectError);
                    }
                    if (arg && arg.axClass === this.sec.AXQName) {
                        return this.getProperty(arg.name);
                    }
                    arg = AVMX.axCoerceString(arg);
                    if (arg === '*' || arguments.length === 0) {
                        arg = null;
                    }
                    tmpMultiname.name = arg;
                    tmpMultiname.namespaces = [AVMX.Namespace.PUBLIC];
                    tmpMultiname.kind = 13 /* QNameA */;
                    return this.getProperty(tmpMultiname);
                };
                ASXML.prototype.attributes = function () {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    var list = this.sec.AXXMLList.CreateList(this, this._name);
                    Array.prototype.push.apply(list._children, this._attributes);
                    return list;
                };
                // 13.4.4.6
                ASXML.prototype.child = function (propertyName /* string|number|QName */) {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    // Step 1.
                    if (Shumway.isIndex(propertyName)) {
                        var list = this.sec.AXXMLList.CreateList(null, null);
                        if (this._children && propertyName < this._children.length) {
                            list.append(this._children[propertyName | 0]);
                        }
                        return list;
                    }
                    // Steps 2-3.
                    var mn;
                    if (propertyName && propertyName.axClass === this.sec.AXQName) {
                        mn = propertyName.name;
                    }
                    else {
                        mn = tmpMultiname;
                        mn.kind = 7 /* QName */;
                        mn.name = toString(propertyName, this.sec);
                    }
                    return this.getProperty(mn);
                };
                ASXML.prototype.childIndex = function () {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    // 13.4.4.7 XML.prototype.childIndex ( )
                    if (!this._parent || this._kind === 2 /* Attribute */) {
                        return -1;
                    }
                    return this._parent._children.indexOf(this);
                };
                ASXML.prototype.children = function () {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    var xl = this.sec.AXXMLList.CreateList(this, this._name);
                    xl._children = this._children.concat();
                    return xl;
                };
                ASXML.prototype.comments = function () {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    // 13.4.4.9 XML.prototype.comments ( )
                    var xl = this.sec.AXXMLList.CreateList(this, this._name);
                    this._children && this._children.forEach(function (v, i) {
                        if (v._kind === 4 /* Comment */) {
                            xl.append(v);
                        }
                    });
                    return xl;
                };
                ASXML.prototype.contains = function (value) {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    // 13.4.4.10 XML.prototype.contains ( value )
                    return this === value;
                };
                ASXML.prototype.copy = function () {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    return this._deepCopy();
                };
                // 9.1.1.8 [[Descendants]] (P)
                ASXML.prototype.descendants = function (name) {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    var xl = this.sec.AXXMLList.CreateList(this, this._name);
                    return this.descendantsInto(toXMLName(name, this.sec), xl);
                };
                ASXML.prototype.elements = function (name) {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    // 13.4.4.13 XML.prototype.elements ( [ name ] )
                    return this.getProperty(toXMLName(name, this.sec));
                };
                ASXML.prototype.hasComplexContent = function () {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    // 13.4.4.15 XML.prototype.hasComplexContent( )
                    if (this._kind === 2 /* Attribute */ ||
                        this._kind === 4 /* Comment */ ||
                        this._kind === 5 /* ProcessingInstruction */ ||
                        this._kind === 3 /* Text */) {
                        return false;
                    }
                    return this._children.some(function (child) {
                        return child._kind === 1 /* Element */;
                    });
                };
                ASXML.prototype.hasSimpleContent = function () {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    // 13.4.4.16 XML.prototype.hasSimpleContent()
                    if (this._kind === 4 /* Comment */ ||
                        this._kind === 5 /* ProcessingInstruction */) {
                        return false;
                    }
                    if (this._kind !== 1 /* Element */) {
                        return true;
                    }
                    if (!this._children && this._children.length === 0) {
                        return true;
                    }
                    return this._children.every(function (child) {
                        return child._kind !== 1 /* Element */;
                    });
                };
                // 13.4.4.17
                ASXML.prototype.inScopeNamespaces = function () {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    var namespaces = this._inScopeNamespacesImpl();
                    var result = [];
                    for (var i = 0; i < namespaces.length; i++) {
                        var AXNamespace = this.sec.AXNamespace;
                        result[i] = AXNamespace.FromNamespace(namespaces[i]);
                    }
                    return this.sec.AXArray.axBox(result);
                };
                ASXML.prototype._inScopeNamespacesImpl = function () {
                    // Step 1.
                    var y = this;
                    // Step 2.
                    var inScopeNS = [];
                    var inScopeNSMap = inScopeNS;
                    // Step 3.
                    while (y !== null) {
                        // Step 3.a.
                        var namespaces = y._inScopeNamespaces;
                        for (var i = 0; namespaces && i < namespaces.length; i++) {
                            var ns = namespaces[i];
                            if (!inScopeNSMap[ns.prefix]) {
                                inScopeNSMap[ns.prefix] = ns;
                                inScopeNS.push(ns);
                            }
                        }
                        // Step 3.b.
                        y = y._parent;
                    }
                    return inScopeNS;
                };
                // 13.4.4.18
                ASXML.prototype.insertChildAfter = function (child1, child2) {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    // Step 1.
                    if (this._kind > 1 /* Element */) {
                        return;
                    }
                    // Step 2.
                    if (child1 == null) {
                        this.insert(0, child2);
                        return this;
                    }
                    // Step 3.
                    // The spec doesn't mention it, but Tamarin seems to unpack single-entry XMLLists here.
                    if (child1.axClass === this.sec.AXXMLList && child1._children.length === 1) {
                        child1 = child1._children[0];
                    }
                    if (child1.axClass === this.sec.AXXML) {
                        for (var i = 0; i < this._children.length; i++) {
                            var child = this._children[i];
                            if (child === child1) {
                                this.insert(i + 1, child2);
                                return this;
                            }
                        }
                    }
                    // Step 4 (implicit).
                };
                // 13.4.4.19
                ASXML.prototype.insertChildBefore = function (child1, child2) {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    // Step 1.
                    if (this._kind > 1 /* Element */) {
                        return;
                    }
                    // Step 2.
                    if (child1 == null) {
                        this.insert(this._children.length, child2);
                        return this;
                    }
                    // Step 3.
                    // The spec doesn't mention it, but Tamarin seems to unpack single-entry XMLLists here.
                    if (child1.axClass === this.sec.AXXMLList && child1._children.length === 1) {
                        child1 = child1._children[0];
                    }
                    if (child1.axClass === this.sec.AXXML) {
                        for (var i = 0; i < this._children.length; i++) {
                            var child = this._children[i];
                            if (child === child1) {
                                this.insert(i, child2);
                                return this;
                            }
                        }
                    }
                    // Step 4 (implicit).
                };
                // XML.[[Length]]
                ASXML.prototype.length = function () {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    if (!this._children) {
                        return 0;
                    }
                    return this._children.length;
                };
                ASXML.prototype.localName = function () {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    return this._name.name;
                };
                ASXML.prototype.name = function () {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    return this.sec.AXQName.FromMultiname(this._name);
                };
                // 13.4.4.23
                ASXML.prototype.namespace = function (prefix) {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    // Step 4.a.
                    if (arguments.length === 0 && this._kind >= 3 /* Text */) {
                        return null;
                    }
                    // Steps 1-3.
                    var inScopeNS = this._inScopeNamespacesImpl();
                    // Step 4.
                    if (arguments.length === 0) {
                        // Step 4.b.
                        return this.sec.AXNamespace.FromNamespace(GetNamespace(this._name, inScopeNS));
                    }
                    // Step 5.a.
                    prefix = AVMX.axCoerceString(prefix);
                    // Step 5.b-c.
                    for (var i = 0; i < inScopeNS.length; i++) {
                        var ns = inScopeNS[i];
                        if (ns.prefix === prefix) {
                            return this.sec.AXNamespace.FromNamespace(ns);
                        }
                    }
                    // Step 5.b alternate clause implicit.
                };
                ASXML.prototype.namespaceDeclarations = function () {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    release || release || notImplemented("public.XML::namespaceDeclarations");
                    return;
                };
                ASXML.prototype.nodeKind = function () {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    return ASXMLKindNames[this._kind];
                };
                ASXML.prototype.normalize = function () {
                    if (!this || this.axClass !== this.sec.AXXML) {
                        this.sec.throwError('TypeError', AVMX.Errors.CheckTypeFailedError, this, 'XML');
                    }
                    // Steps 1-2.
                    for (var i = 0; i < this._children.length;) {
                        var child = this._children[i];
                        // Step 2.a.
                        if (child._kind === 1 /* Element */) {
                            child.normalize();
                            i++;
                        }
                        else if (child._kind === 3 /* Text */) {
                            // Step 2.b.i.
                            while (i + 1 < this._children.length) {
                                var nextChild = this._children[i + 1];
                                if (nextChild._kind !== 3 /* Text */) {
                                    break;
                                }
                                child._value += nextChild._value;
                                this.removeByIndex(i + 1);
                            }
                            // Step 2.b.ii.
                            // The spec says to only remove 0-length nodes, but Tamarin removes whitespace-only
                            // nodes, too.
                            if (child._value.length === 0 || isWhitespaceString(child._value)) {
                                this.removeByIndex(i);
                            }
                            else {
                                i++;
                            }
                        }
                        else {
                            i++;
                        }
                    }
                    return this;
                };
                ASXML.prototype.removeByIndex = function (index) {
                    var child = this._children[index];
                    child._parent = null;
                    this._children.splice(index, 1);
                };
                ASXML.prototype.parent = function () {
                    // Absurdly, and in difference to what the spec says, parent() returns `undefined` for null.
                    return this._parent || undefined;
                };
                // 13.4.4.28 XML.prototype.processingInstructions ( [ name ] )
                ASXML.prototype.processingInstructions = function (name) {
                    // Step 1 (implicit).
                    // Step 3.
                    var list = this.sec.AXXMLList.CreateList(this, this._name);
                    list._targetObject = this;
                    list._targetProperty = null;
                    // Steps 2,4-5.
                    return this.processingInstructionsInto(toXMLName(name, this.sec), list);
                };
                ASXML.prototype.processingInstructionsInto = function (name, list) {
                    var localName = name || '*';
                    // Step 4.
                    var children = this._children;
                    if (!children) {
                        return list;
                    }
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        if (child._kind === 5 /* ProcessingInstruction */ &&
                            (localName === '*' || child._name.name === localName)) {
                            list._children.push(child);
                        }
                    }
                    // Step 5.
                    return list;
                };
                // 13.4.4.29
                ASXML.prototype.prependChild = function (child) {
                    this.insert(0, child);
                    return this;
                };
                ASXML.prototype.removeNamespace = function (ns) {
                    release || release || notImplemented("public.XML::removeNamespace");
                    return;
                };
                // 13.4.4.32 XML.prototype.replace
                ASXML.prototype.replace = function (propertyName, value) {
                    // Step 1.
                    if (this._kind !== 1 /* Element */) {
                        return;
                    }
                    var c;
                    // Step 2.
                    if (!value || value.axClass !== this.axClass && value.axClass !== this.sec.AXXMLList) {
                        c = AVMX.axCoerceString(value);
                    }
                    else {
                        c = value._deepCopy();
                    }
                    // Step 4.
                    var mn = toXMLName(propertyName, this.sec);
                    if (Shumway.isIndex(mn.name)) {
                        this._replaceByIndex(mn.name | 0, c);
                        // Step 10.
                        return this;
                    }
                    var isAnyName = mn.isAnyName();
                    // Step 5 (Implicit).
                    // Step 6.
                    var i = -1;
                    // Step 7.
                    var children = this._children;
                    for (var k = children.length; k--;) {
                        // Step 7.a.
                        var child = children[k];
                        if (isAnyName || child._kind === 1 /* Element */ && child._name.matches(mn)) {
                            // Step 7.a.i.
                            if (i !== -1) {
                                this.deleteByIndex(i);
                            }
                            // Step 7.a.i.
                            i = k;
                        }
                    }
                    // Step 8.
                    if (i === -1) {
                        // Step 10.
                        return this;
                    }
                    // Step 9.
                    this._replaceByIndex(i, c);
                    // Step 10.
                    return this;
                };
                // 9.1.1.12 [[Replace]] (P, V)
                ASXML.prototype._replaceByIndex = function (p, v) {
                    // Step 1.
                    if (this._kind > 1 /* Element */) {
                        return this;
                    }
                    // Steps 2-3. (Implicit, guaranteed by assert).
                    release || assert(typeof p === 'number' && p >>> 0 === p);
                    // Step 4.
                    var children = this._children;
                    if (p > children.length) {
                        p = children.length;
                    }
                    // Step 5.
                    if (v && v.axClass === this.axClass && v._kind !== 2 /* Attribute */) {
                        // Step 5.a.
                        if (v._kind === 1 /* Element */) {
                            var a = this;
                            while (a) {
                                if (a === v) {
                                    this.sec.throwError("Error", AVMX.Errors.XMLIllegalCyclicalLoop);
                                }
                                a = a._parent;
                            }
                        }
                        // Step 5.b.
                        v._parent = this;
                        // Step 5.c.
                        if (children[p]) {
                            children[p]._parent = null;
                        }
                        // Step 5.d.
                        children[p] = v;
                    }
                    else if (v && v.axClass === this.sec.AXXMLList) {
                        // Inlined steps.
                        if (v._children.length === 0) {
                            this.deleteByIndex(p);
                        }
                        else {
                            var n = v._children.length;
                            if (p < children.length) {
                                children[p]._parent = null;
                                for (var i = children.length - 1; i > p; i--) {
                                    children[i + n] = children[i];
                                }
                            }
                            for (var i = 0; i < n; i++) {
                                var child = v._children[i];
                                child._parent = this;
                                children[i + p] = child;
                            }
                        }
                    }
                    else {
                        // Step 7.a.
                        var s = AVMX.axCoerceString(v);
                        // Step 7.b.
                        var t = this.axClass.Create();
                        t._kind = 3 /* Text */;
                        t._value = s;
                        t._parent = this;
                        // Step 7.c.
                        if (children[p]) {
                            children[p]._parent = null;
                        }
                        // Step 7.d.
                        children[p] = t;
                    }
                };
                ASXML.prototype.setChildren = function (value) {
                    this.setProperty(anyMultiname, value);
                    return this;
                };
                // 13.4.4.34 XML.prototype.setLocalName( name )
                ASXML.prototype.setLocalName = function (name_) {
                    // Step 1.
                    if (this._kind === 3 /* Text */ || this._kind === 4 /* Comment */) {
                        return;
                    }
                    var name;
                    // Step 2.
                    if (name_ && name_.axClass === this.sec.AXQName) {
                        name = name_.localName;
                    }
                    else {
                        // Step 3.
                        name = AVMX.axCoerceString(name_);
                    }
                    // Step 4.
                    this._name.name = name;
                };
                // 13.4.4.35 XML.prototype.setName( name )
                ASXML.prototype.setName = function (name_) {
                    // Step 1.
                    if (this._kind === 3 /* Text */ || this._kind === 4 /* Comment */) {
                        return;
                    }
                    // Step 2.
                    if (name_ && name_.axClass === this.sec.AXQName && name_.uri === null) {
                        name_ = name_.localName;
                    }
                    // Step 3.
                    var name = this.sec.AXQName.Create(name_).name;
                    // Step 4.
                    if (this._kind === 5 /* ProcessingInstruction */) {
                        release || assert(name.namespaces[0].type === 0 /* Public */);
                        name.namespaces[0] = AVMX.Namespace.PUBLIC;
                    }
                    // Step 5.
                    this._name = name;
                    // Steps 6-8.
                    var node = this;
                    if (this._kind === 2 /* Attribute */) {
                        if (this._parent === null) {
                            return;
                        }
                        node = this._parent;
                    }
                    node.addInScopeNamespace(name.namespaces[0]);
                };
                ASXML.prototype.setNamespace = function (ns) {
                    // Step 1.
                    if (this._kind === 3 /* Text */ || this._kind === 4 /* Comment */ ||
                        this._kind === 5 /* ProcessingInstruction */) {
                        return;
                    }
                    // Step 2.
                    var ns2 = this.sec.AXNamespace.Create(ns)._ns;
                    // Step 3.
                    this._name.namespaces = [ns2];
                    // Step 4.
                    if (this._kind === 2 /* Attribute */) {
                        if (this._parent) {
                            this._parent.addInScopeNamespace(ns2);
                        }
                    }
                    else if (this._kind === 1 /* Element */) {
                        this.addInScopeNamespace(ns2);
                    }
                };
                ASXML.prototype.text = function () {
                    // 13.4.4.37 XML.prototype.text ( );
                    var xl = this.sec.AXXMLList.CreateList(this, this._name);
                    this._children && this._children.forEach(function (v, i) {
                        if (v._kind === 3 /* Text */) {
                            xl.append(v);
                        }
                    });
                    return xl;
                };
                ASXML.prototype.toXMLString = function () {
                    return this.toXMLStringImpl();
                };
                ASXML.prototype.toXMLStringImpl = function (ancestorNamespaces, indentLevel) {
                    var node = this;
                    var sec = this.sec;
                    // 10.2.1 ToXMLString Applied to the XML Type
                    var prettyPrinting = sec.AXXML.prettyPrinting;
                    indentLevel |= 0;
                    var s = prettyPrinting ? getIndentString(indentLevel) : '';
                    var kind = node._kind;
                    switch (kind) {
                        // 4. If x.[[Class]] == "text",
                        case 3 /* Text */:
                            return prettyPrinting ?
                                s + escapeElementValue(sec, trimWhitespaces(node._value)) :
                                escapeElementValue(sec, node._value);
                        // 5. If x.[[Class]] == "attribute", return the result of concatenating s and
                        // EscapeAttributeValue(x.[[Value]])
                        case 2 /* Attribute */:
                            return s + escapeAttributeValue(node._value);
                        // 6. If x.[[Class]] == "comment", return the result of concatenating s, the string "<!--",
                        // x.[[Value]] and the string "-->"
                        case 4 /* Comment */:
                            return s + '<!--' + node._value + '-->';
                        // 7 If x.[[Class]] == "processing-instruction", return the result of concatenating s, the
                        // string "<?", x.[[Name]].localName, the space <SP> character, x.[[Value]] and the string
                        // "?>"
                        case 5 /* ProcessingInstruction */:
                            return s + '<?' + node._name.name + ' ' + node._value + '?>';
                        default:
                            release || assert(kind === 1 /* Element */);
                            break;
                    }
                    ancestorNamespaces = ancestorNamespaces || [];
                    var namespaceDeclarations = [];
                    // 10. For each ns in x.[[InScopeNamespaces]]
                    for (var i = 0; node._inScopeNamespaces && i < node._inScopeNamespaces.length; i++) {
                        var ns = node._inScopeNamespaces[i];
                        if (ancestorNamespaces.every(function (ans) { return ans.uri !== ns.uri || ans.prefix !== ns.prefix; })) {
                            namespaceDeclarations.push(ns);
                        }
                    }
                    // 11. For each name in the set of names consisting of x.[[Name]] and the name of each
                    // attribute in x.[[Attributes]]
                    var currentNamespaces = ancestorNamespaces.concat(namespaceDeclarations);
                    var namespace = GetNamespace(node._name, currentNamespaces);
                    if (namespace.prefix === undefined) {
                        // Let namespace.prefix be an arbitrary implementation defined namespace prefix, such that
                        // there is no ns2 ∈ (AncestorNamespaces ∪ namespaceDeclarations) with namespace.prefix ==
                        // ns2.prefix
                        var newPrefix = generateUniquePrefix(currentNamespaces);
                        var ns2 = AVMX.internPrefixedNamespace(0 /* Public */, namespace.uri, newPrefix);
                        // Let namespaceDeclarations = namespaceDeclarations ∪ { namespace }
                        namespaceDeclarations.push(ns2);
                        currentNamespaces.push(ns2);
                    }
                    // 12. Let s be the result of concatenating s and the string "<"
                    // 13. If namespace.prefix is not the empty string,
                    //   a. Let s be the result of concatenating s, namespace.prefix and the string ":"
                    // 14. Let s be the result of concatenating s and x.[[Name]].localName
                    var elementName = (namespace.prefix ? namespace.prefix + ':' : '') + node._name.name;
                    s += '<' + elementName;
                    node._attributes && node._attributes.forEach(function (attr) {
                        var name = attr._name;
                        var namespace = GetNamespace(name, currentNamespaces);
                        if (namespace.prefix === undefined) {
                            // Let namespace.prefix be an arbitrary implementation defined namespace prefix, such that
                            // there is no ns2 ∈ (AncestorNamespaces ∪ namespaceDeclarations) with namespace.prefix ==
                            // ns2.prefix
                            var newPrefix = generateUniquePrefix(currentNamespaces);
                            var ns2 = AVMX.internPrefixedNamespace(0 /* Public */, namespace.uri, newPrefix);
                            // Let namespaceDeclarations = namespaceDeclarations ∪ { namespace }
                            namespaceDeclarations.push(ns2);
                            currentNamespaces.push(ns2);
                        }
                    });
                    for (var i = 0; i < namespaceDeclarations.length; i++) {
                        var namespace = namespaceDeclarations[i];
                        if (namespace.uri === '') {
                            continue;
                        }
                        var attributeName = namespace.prefix ? 'xmlns:' + namespace.prefix : 'xmlns';
                        s += ' ' + attributeName + '="' + escapeAttributeValue(namespace.uri) + '"';
                    }
                    node._attributes && node._attributes.forEach(function (attr) {
                        var name = attr._name;
                        var namespace = GetNamespace(name, ancestorNamespaces);
                        var attributeName = namespace.prefix ? namespace.prefix + ':' + name.name : name.name;
                        s += ' ' + attributeName + '="' + escapeAttributeValue(attr._value) + '"';
                    });
                    // 17. If x.[[Length]] == 0
                    if (node._children.length === 0) {
                        //   a. Let s be the result of concatenating s and "/>"
                        s += '/>';
                        //   b. Return s
                        return s;
                    }
                    // 18. Let s be the result of concatenating s and the string ">"
                    s += '>';
                    // 19. Let indentChildren = ((x.[[Length]] > 1) or (x.[[Length]] == 1 and x[0].[[Class]] is
                    // not equal to "text"))
                    var indentChildren = node._children.length > 1 ||
                        (node._children.length === 1 && node._children[0]._kind !== 3 /* Text */);
                    var nextIndentLevel = (prettyPrinting && indentChildren) ?
                        indentLevel + sec.AXXML._prettyIndent : 0;
                    node._children.forEach(function (childNode, i) {
                        if (prettyPrinting && indentChildren) {
                            s += '\n';
                        }
                        s += childNode.toXMLStringImpl(currentNamespaces, nextIndentLevel);
                    });
                    if (prettyPrinting && indentChildren) {
                        s += '\n' + getIndentString(indentLevel);
                    }
                    s += '</' + elementName + '>';
                    return s;
                };
                ASXML.prototype.toJSON = function (k) {
                    return 'XML';
                };
                ASXML.prototype.axGetEnumerableKeys = function () {
                    if (this === this.axClass.dPrototype) {
                        return _super.prototype.axGetEnumerableKeys.call(this);
                    }
                    var keys = [];
                    for (var i = 0; i < this._children.length; i++) {
                        keys.push(this._children[i]._name.name);
                    }
                    return keys;
                };
                // 9.1.1.2 [[Put]] (P, V)
                ASXML.prototype.setProperty = function (mn, v) {
                    release || assert(mn instanceof AVMX.Multiname);
                    // Step 1. (Step 3 in Tamarin source.)
                    var sec = this.sec;
                    if (!mn.isAnyName() && !mn.isAttribute() && mn.name === mn.name >>> 0) {
                        sec.throwError('TypeError', AVMX.Errors.XMLAssignmentToIndexedXMLNotAllowed);
                    }
                    // Step 2. (Step 4 in Tamarin source.)
                    if (this._kind === 3 /* Text */ || this._kind === 4 /* Comment */ ||
                        this._kind === 5 /* ProcessingInstruction */ || this._kind === 2 /* Attribute */) {
                        return;
                    }
                    // Step 3.
                    var c;
                    if (!isXMLType(v, sec) || v._kind === 3 /* Text */ ||
                        v._kind === 2 /* Attribute */) {
                        c = toString(v, sec);
                    }
                    else {
                        c = v._deepCopy();
                    }
                    // Step 5 (implicit, mn is always a Multiname here).
                    // Step 6 (7 in Tamarin).
                    if (mn.isAttribute()) {
                        // Step 6.a (omitted, as in Tamarin).
                        // Step 6.b.
                        if (c && c.axClass === sec.AXXMLList) {
                            // Step 6.b.i.
                            if (c._children.length === 0) {
                                c = '';
                            }
                            else {
                                // Step 6.b.ii.1.
                                var s = toString(c._children[0], sec);
                                // Step 6.b.ii.2.
                                for (var j = 1; j < c._children.length; j++) {
                                    s += ' ' + toString(c._children[j], sec);
                                }
                                // Step 6.b.ii.3.
                                c = s;
                            }
                        }
                        else {
                            c = AVMX.axCoerceString(c);
                        }
                        // Step 6.d.
                        var a = null;
                        // Step 6.e.
                        var attributes = this._attributes;
                        var newAttributes = this._attributes = [];
                        for (var j = 0; attributes && j < attributes.length; j++) {
                            var attribute = attributes[j];
                            if (attribute._name.matches(mn)) {
                                // Step 6.e.1.
                                if (!a) {
                                    a = attribute;
                                }
                                else {
                                    attribute._parent = null;
                                    continue;
                                }
                            }
                            newAttributes.push(attribute);
                        }
                        // Step 6.f.
                        if (!a) {
                            // Wildcard attribute names shouldn't cause any attributes to be *added*, so we can bail
                            // here. Tamarin doesn't do this, and it's not entirely clear to me how they avoid
                            // adding attributes, but this works and doesn't regress any tests.
                            if (mn.isAnyName()) {
                                return;
                            }
                            var uri = '';
                            if (mn.namespaces.length === 1) {
                                uri = mn.namespaces[0].uri;
                            }
                            a = createXML(sec, 2 /* Attribute */, uri, mn.name);
                            a._parent = this;
                            newAttributes.push(a);
                        }
                        // Step 6.g.
                        a._value = c;
                        // Step 6.h.
                        return;
                    }
                    var i;
                    var isAny = mn.isAnyName();
                    var primitiveAssign = !isXMLType(c, sec) && !isAny && mn.name !== '*';
                    var isAnyNamespace = mn.isAnyNamespace();
                    for (var k = this._children.length - 1; k >= 0; k--) {
                        if ((isAny || this._children[k]._kind === 1 /* Element */ &&
                            this._children[k]._name.name === mn.name) &&
                            (isAnyNamespace ||
                                this._children[k]._kind === 1 /* Element */ &&
                                    this._children[k]._name.matches(mn))) {
                            if (i !== undefined) {
                                this.deleteByIndex(i);
                            }
                            i = k;
                        }
                    }
                    if (i === undefined) {
                        i = this._children.length;
                        if (primitiveAssign) {
                            var ns = mn.namespaces[0];
                            var uri = null;
                            var prefix;
                            if (ns.uri !== null) {
                                uri = ns.uri;
                                prefix = ns.prefix;
                            }
                            if (uri === null) {
                                var defaultNamespace = getDefaultNamespace(sec);
                                uri = defaultNamespace.uri;
                                prefix = defaultNamespace.prefix;
                            }
                            var y = createXML(sec, 1 /* Element */, uri, mn.name, prefix);
                            y._parent = this;
                            this._replaceByIndex(i, y);
                            var ns = y._name.namespace;
                            y.addInScopeNamespace(ns);
                        }
                    }
                    if (primitiveAssign) {
                        // Blow away kids of x[i].
                        var subChildren = this._children[i]._children;
                        for (var j = subChildren.length; j--;) {
                            subChildren[j]._parent = null;
                        }
                        subChildren.length = 0;
                        var s = toString(c, sec);
                        if (s !== "") {
                            this._children[i]._replaceByIndex(0, s);
                        }
                    }
                    else {
                        this._replaceByIndex(i, c);
                    }
                };
                ASXML.prototype.axSetProperty = function (mn, value, bc) {
                    if (this === this.axClass.dPrototype) {
                        release || AVMX.checkValue(value);
                        this[this.axResolveMultiname(mn)] = value;
                        return;
                    }
                    this.setProperty(coerceE4XMultiname(mn, this.sec), value);
                };
                // 9.1.1.1 XML.[[Get]] (P)
                ASXML.prototype.getProperty = function (mn) {
                    release || assert(mn instanceof AVMX.Multiname);
                    // Step 1.
                    var nm = mn.name;
                    if (Shumway.isIndex(nm)) {
                        // this is a shortcut to the E4X logic that wants us to create a new
                        // XMLList with of size 1 and access it with the given index.
                        if ((nm | 0) === 0) {
                            return this;
                        }
                        return null;
                    }
                    // Step 2 (implicit).
                    // Step 3.
                    var list = this.sec.AXXMLList.CreateList(this, mn);
                    var length = 0;
                    var anyName = mn.isAnyName();
                    var anyNamespace = mn.isAnyNamespace();
                    // Step 4.
                    if (mn.isAttribute()) {
                        for (var i = 0; this._attributes && i < this._attributes.length; i++) {
                            var v = this._attributes[i];
                            if ((anyName || v._name.name === nm) &&
                                (anyNamespace || v._name.matches(mn))) {
                                list._children[length++] = v;
                                assert(list._children[0]);
                            }
                        }
                        return list;
                    }
                    // Step 5.
                    for (var i = 0; this._children && i < this._children.length; i++) {
                        var v = this._children[i];
                        if ((anyName || v._kind === 1 /* Element */ && v._name.name === nm) &&
                            ((anyNamespace || v._name.matches(mn)))) {
                            list._children[length++] = v;
                            assert(list._children[0]);
                        }
                    }
                    // Step 6.
                    return list;
                };
                ASXML.prototype.axGetProperty = function (mn) {
                    if (this === this.axClass.dPrototype) {
                        var value = this[this.axResolveMultiname(mn)];
                        release || AVMX.checkValue(value);
                        return value;
                    }
                    return this.getProperty(coerceE4XMultiname(mn, this.sec));
                };
                // 9.1.1.6 [[HasProperty]] (P) (well, very roughly)
                ASXML.prototype.hasProperty = function (mn) {
                    if (Shumway.isIndex(mn.name)) {
                        // this is a shortcut to the E4X logic that wants us to create a new
                        // XMLList of size 1 and access it with the given index.
                        return (mn.name | 0) === 0;
                    }
                    var name = toXMLName(mn, this.sec);
                    var anyName = name.isAnyName();
                    var anyNamespace = name.isAnyNamespace();
                    if (mn.isAttribute()) {
                        for (var i = 0; this._attributes && i < this._attributes.length; i++) {
                            var v = this._attributes[i];
                            if (anyName || v._name.matches(name)) {
                                return true;
                            }
                        }
                        return false;
                    }
                    for (var i = 0; i < this._children.length; i++) {
                        var v = this._children[i];
                        if ((anyName || v._kind === 1 /* Element */ && v._name.name === name.name) &&
                            (anyNamespace || v._kind === 1 /* Element */ && v._name.matches(name))) {
                            return true;
                        }
                    }
                };
                ASXML.prototype.deleteProperty = function (mn) {
                    if (Shumway.isIndex(mn.name)) {
                        // This hasn't ever been implemented and silently does nothing in Tamarin (and Rhino).
                        return true;
                    }
                    var name = toXMLName(mn, this.sec);
                    var localName = name.name;
                    var anyName = mn.isAnyName();
                    var anyNamespace = mn.isAnyNamespace();
                    if (mn.isAttribute()) {
                        var attributes = this._attributes;
                        if (attributes) {
                            var newAttributes = this._attributes = [];
                            for (var i = 0; i < attributes.length; i++) {
                                var node = attributes[i];
                                var attrName = node._name;
                                if ((anyName || attrName.name === localName) &&
                                    (anyNamespace || attrName.matches(name))) {
                                    node._parent = null;
                                }
                                else {
                                    newAttributes.push(node);
                                }
                            }
                        }
                    }
                    else {
                        if (this._children.some(function (v, i) {
                            return (anyName || v._kind === 1 /* Element */ && v._name.name === name.name) &&
                                (anyNamespace || v._kind === 1 /* Element */ && v._name.matches(name));
                        })) {
                            return true;
                        }
                    }
                };
                ASXML.prototype.axHasProperty = function (mn) {
                    if (this === this.axClass.dPrototype) {
                        return _super.prototype.axHasPropertyInternal.call(this, mn);
                    }
                    return this.axHasPropertyInternal(mn);
                };
                ASXML.prototype.axHasPropertyInternal = function (mn) {
                    if (this.hasProperty(mn)) {
                        return true;
                    }
                    // HACK if child with specific name is not present, check object's attributes.
                    // The presence of the attribute/method can be checked during with(), see #850.
                    return !!this[this.axResolveMultiname(mn)];
                };
                ASXML.prototype.axDeleteProperty = function (mn) {
                    if (this.deleteProperty(mn)) {
                        return true;
                    }
                    // HACK if child with specific name is not present, check object's attributes.
                    // The presence of the attribute/method can be checked during with(), see #850.
                    return delete this[this.axResolveMultiname(mn)];
                };
                ASXML.prototype.axCallProperty = function (mn, args) {
                    var method = this[this.axResolveMultiname(mn)];
                    // The method might be dynamically defined on XML.prototype.
                    if (!method) {
                        method = this['$Bg' + mn.name];
                    }
                    // Check if the method exists before calling it.
                    if (method) {
                        AVMX.validateCall(this.sec, method, args.length);
                        return method.axApply(this, args);
                    }
                    // Otherwise, 11.2.2.1 CallMethod ( r , args )
                    // If f == undefined and Type(base) is XMLList and base.[[Length]] == 1
                    //   ii. Return the result of calling CallMethod(r0, args) recursively
                    // f. If f == undefined and Type(base) is XML and base.hasSimpleContent () == true
                    //   i. Let r0 be a new Reference with base object = ToObject(ToString(base)) and property
                    // name = P ii. Return the result of calling CallMethod(r0, args) recursively
                    if (this.hasSimpleContent()) {
                        return this.sec.box(toString(this, this.sec)).axCallProperty(mn, args);
                    }
                    this.sec.throwError('TypeError', AVMX.Errors.CallOfNonFunctionError, 'value');
                };
                ASXML.prototype._delete = function (key, isMethod) {
                    release || release || notImplemented("XML.[[Delete]]");
                };
                ASXML.prototype.deleteByIndex = function (p) {
                    var i = p >>> 0;
                    if (String(i) !== String(p)) {
                        throw "TypeError in XML.prototype.deleteByIndex(): invalid index " + p;
                    }
                    var children = this._children;
                    if (p < children.length && children[p]) {
                        children[p]._parent = null;
                        children.splice(p, 1);
                    }
                };
                // 9.1.1.11 [[Insert]] (P, V)
                ASXML.prototype.insert = function (p, v) {
                    // Step 1.
                    if (this._kind > 1 /* Element */) {
                        return;
                    }
                    // Steps 2-3 (Guaranteed by assert).
                    release || assert(typeof p === 'number' && Shumway.isIndex(p));
                    var i = p;
                    // Step 4.
                    if (v && v.axClass === this.axClass) {
                        var a = this;
                        while (a) {
                            if (a === v) {
                                this.sec.throwError('TypeError', AVMX.Errors.XMLIllegalCyclicalLoop);
                            }
                            a = a._parent;
                        }
                    }
                    // Step 5.
                    var n = 1;
                    // Step 6.
                    if (v && v.axClass === this.sec.AXXMLList) {
                        n = v._children.length;
                        // Step 7.
                        if (n === 0) {
                            return;
                        }
                    }
                    // Step 8.
                    var ownChildren = this._children;
                    for (var j = ownChildren.length - 1; j >= i; j--) {
                        ownChildren[j + n] = ownChildren[j];
                        assert(ownChildren[0]);
                    }
                    // Step 9 (implicit).
                    // Step 10.
                    if (v && v.axClass === this.sec.AXXMLList) {
                        n = v._children.length;
                        for (var j = 0; j < n; j++) {
                            v._children[j]._parent = this;
                            ownChildren[i + j] = v._children[j];
                        }
                    }
                    else {
                        //x.replace(i, v), inlined;
                        if (!(v && v.axClass === this.axClass)) {
                            v = this.sec.AXXML.Create(v);
                        }
                        v._parent = this;
                        if (!ownChildren) {
                            this._children = ownChildren = [];
                        }
                        ownChildren[i] = v;
                        assert(ownChildren[0]);
                    }
                };
                // 9.1.1.13 [[AddInScopeNamespace]] ( N )
                ASXML.prototype.addInScopeNamespace = function (ns) {
                    if (this._kind === 3 /* Text */ ||
                        this._kind === 4 /* Comment */ ||
                        this._kind === 5 /* ProcessingInstruction */ ||
                        this._kind === 2 /* Attribute */) {
                        return;
                    }
                    var prefix = ns.prefix;
                    if (prefix !== undefined) {
                        if (prefix === "" && this._name.uri === "") {
                            return;
                        }
                        var match = null;
                        this._inScopeNamespaces.forEach(function (v, i) {
                            if (v.prefix === prefix) {
                                match = v;
                            }
                        });
                        if (match !== null && match.uri !== ns.uri) {
                            this._inScopeNamespaces.forEach(function (v, i) {
                                if (v.prefix === match.prefix) {
                                    this._inScopeNamespaces[i] = ns; // replace old with new
                                }
                            });
                        }
                        if (this._name.prefix === prefix) {
                            this._name.prefix = undefined;
                        }
                        this._attributes.forEach(function (v, i) {
                            if (v._name.prefix === prefix) {
                                v._name.prefix = undefined;
                            }
                        });
                    }
                };
                ASXML.prototype.descendantsInto = function (name, xl) {
                    if (this._kind !== 1 /* Element */) {
                        return xl;
                    }
                    var length = xl._children.length;
                    var isAny = name.isAnyName();
                    if (name.isAttribute()) {
                        // Get attributes
                        this._attributes.forEach(function (v, i) {
                            if (isAny || v._name.matches(name)) {
                                xl._children[length++] = v;
                                assert(xl._children[0]);
                            }
                        });
                    }
                    else {
                        // Get children
                        this._children.forEach(function (v, i) {
                            if (isAny || v._name.matches(name)) {
                                xl._children[length++] = v;
                                assert(xl._children[0]);
                            }
                        });
                    }
                    // Descend
                    this._children.forEach(function (v, i) {
                        v.descendantsInto(name, xl);
                    });
                    return xl;
                };
                ASXML.instanceConstructor = ASXML;
                ASXML._flags = ASXML_FLAGS.ALL;
                ASXML._prettyIndent = 2;
                return ASXML;
            })(AS.ASObject);
            AS.ASXML = ASXML;
            function createXML(sec, kind, uri, name, prefix) {
                if (kind === void 0) { kind = 3 /* Text */; }
                if (uri === void 0) { uri = ''; }
                if (name === void 0) { name = ''; }
                var xml = sec.AXXML.Create();
                var ns = AVMX.internPrefixedNamespace(0 /* Public */, uri, prefix || '');
                var mn = new AVMX.Multiname(null, 0, kind === 2 /* Attribute */ ? 13 /* QNameA */ : 7 /* QName */, [ns], name, null);
                xml.init(kind, mn);
                return xml;
            }
            var ASXMLList = (function (_super) {
                __extends(ASXMLList, _super);
                function ASXMLList(value) {
                    _super.call(this);
                    this._children = [];
                    if (Shumway.isNullOrUndefined(value)) {
                        value = "";
                    }
                    if (!value) {
                        return;
                    }
                    if (value && value.axClass === this.sec.AXXMLList) {
                        var children = value._children;
                        for (var i = 0; i < children.length; i++) {
                            var child = children[i];
                            this._children[i] = child;
                            assert(this._children[0]);
                        }
                    }
                    else {
                        toXMLList(value, this);
                    }
                }
                ASXMLList.classInitializer = function () {
                    defineNonEnumerableProperty(this, '$Bglength', 1);
                    var proto = this.dPrototype;
                    var asProto = ASXMLList.prototype;
                    defineNonEnumerableProperty(proto, '$BgvalueOf', Object.prototype['$BgvalueOf']);
                    defineNonEnumerableProperty(proto, '$BghasOwnProperty', asProto.native_hasOwnProperty);
                    defineNonEnumerableProperty(proto, '$BgpropertyIsEnumerable', asProto.native_propertyIsEnumerable);
                    AS.addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
                    AS.addPrototypeFunctionAlias(proto, '$BgaddNamespace', asProto.addNamespace);
                    AS.addPrototypeFunctionAlias(proto, '$BgappendChild', asProto.appendChild);
                    AS.addPrototypeFunctionAlias(proto, '$Bgattribute', asProto.attribute);
                    AS.addPrototypeFunctionAlias(proto, '$Bgattributes', asProto.attributes);
                    AS.addPrototypeFunctionAlias(proto, '$Bgchild', asProto.child);
                    AS.addPrototypeFunctionAlias(proto, '$BgchildIndex', asProto.childIndex);
                    AS.addPrototypeFunctionAlias(proto, '$Bgchildren', asProto.children);
                    AS.addPrototypeFunctionAlias(proto, '$Bgcomments', asProto.comments);
                    AS.addPrototypeFunctionAlias(proto, '$Bgcontains', asProto.contains);
                    AS.addPrototypeFunctionAlias(proto, '$Bgcopy', asProto.copy);
                    AS.addPrototypeFunctionAlias(proto, '$Bgdescendants', asProto.descendants);
                    AS.addPrototypeFunctionAlias(proto, '$Bgelements', asProto.elements);
                    AS.addPrototypeFunctionAlias(proto, '$BghasComplexContent', asProto.hasComplexContent);
                    AS.addPrototypeFunctionAlias(proto, '$BghasSimpleContent', asProto.hasSimpleContent);
                    AS.addPrototypeFunctionAlias(proto, '$BginScopeNamespaces', asProto.inScopeNamespaces);
                    AS.addPrototypeFunctionAlias(proto, '$BginsertChildAfter', asProto.insertChildAfter);
                    AS.addPrototypeFunctionAlias(proto, '$BginsertChildBefore', asProto.insertChildBefore);
                    AS.addPrototypeFunctionAlias(proto, '$Bglength', asProto.length);
                    AS.addPrototypeFunctionAlias(proto, '$BglocalName', asProto.localName);
                    AS.addPrototypeFunctionAlias(proto, '$Bgname', asProto.name);
                    AS.addPrototypeFunctionAlias(proto, '$Bgnamespace', asProto.namespace);
                    AS.addPrototypeFunctionAlias(proto, '$BgnamespaceDeclarations', asProto.namespaceDeclarations);
                    AS.addPrototypeFunctionAlias(proto, '$BgnodeKind', asProto.nodeKind);
                    AS.addPrototypeFunctionAlias(proto, '$Bgnormalize', asProto.normalize);
                    AS.addPrototypeFunctionAlias(proto, '$Bgparent', asProto.parent);
                    AS.addPrototypeFunctionAlias(proto, '$BgprocessingInstructions', asProto.processingInstructions);
                    AS.addPrototypeFunctionAlias(proto, '$BgprependChild', asProto.prependChild);
                    AS.addPrototypeFunctionAlias(proto, '$BgremoveNamespace', asProto.removeNamespace);
                    AS.addPrototypeFunctionAlias(proto, '$Bgreplace', asProto.replace);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetChildren', asProto.setChildren);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetLocalName', asProto.setLocalName);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetName', asProto.setName);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetNamespace', asProto.setNamespace);
                    AS.addPrototypeFunctionAlias(proto, '$Bgtext', asProto.text);
                    AS.addPrototypeFunctionAlias(proto, '$BgtoXMLString', asProto.toXMLString);
                    AS.addPrototypeFunctionAlias(proto, '$BgtoJSON', asProto.toJSON);
                };
                ASXMLList.axApply = function (self, args) {
                    var value = args[0];
                    // 13.5.1 The XMLList Constructor Called as a Function
                    if (Shumway.isNullOrUndefined(value)) {
                        value = '';
                    }
                    if (value && value.axClass === this.sec.AXXMLList) {
                        return value;
                    }
                    var list = this.sec.AXXMLList.Create();
                    toXMLList(value, list);
                    return list;
                };
                // 11.4.1 The Addition Operator ( + )
                ASXMLList.addXML = function (left, right) {
                    var result;
                    if (left.axClass === left.sec.AXXML) {
                        result = left.sec.AXXMLList.Create();
                        result.append(left);
                    }
                    else {
                        result = left;
                    }
                    result.append(right);
                    return result;
                };
                ASXMLList.Create = function (value) {
                    var list = Object.create(this.sec.AXXMLList.tPrototype);
                    list.axInitializer(value);
                    return list;
                };
                ASXMLList.CreateList = function (targetObject, targetProperty) {
                    var list = this.Create();
                    list._targetObject = targetObject;
                    list._targetProperty = targetProperty;
                    return list;
                };
                ASXMLList.prototype.valueOf = function () {
                    return this;
                };
                // E4X 11.5.1 The Abstract Equality Comparison Algorithm, steps 1-2.
                // (but really 9.2.1.9 [[Equals]] (V))
                ASXMLList.prototype.equals = function (other) {
                    var children = this._children;
                    // Step 1.
                    if (other === undefined && children.length === 0) {
                        return true;
                    }
                    // Step 2.
                    if (other && other.axClass === this.sec.AXXMLList) {
                        var otherChildren = other._children;
                        // Step 2.a.
                        if (otherChildren.length !== children.length) {
                            return false;
                        }
                        // Step 2.b.
                        for (var i = 0; i < children.length; i++) {
                            if (!children[i].equals(otherChildren[i])) {
                                return false;
                            }
                        }
                        // Step 2.c.
                        return true;
                    }
                    // Steps 3-4.
                    return children.length === 1 && children[0].equals(other);
                };
                ASXMLList.prototype.toString = function () {
                    if (this.hasComplexContent()) {
                        return this.toXMLString();
                    }
                    var s = '';
                    for (var i = 0; i < this._children.length; i++) {
                        s += toString(this._children[i], this.sec);
                    }
                    return s;
                };
                // 9.2.1.7 [[DeepCopy]] ( )
                ASXMLList.prototype._deepCopy = function () {
                    var xl = this.sec.AXXMLList.CreateList(this._targetObject, this._targetProperty);
                    var length = this._children.length;
                    for (var i = 0; i < length; i++) {
                        xl._children[i] = this._children[i]._deepCopy();
                        assert(xl._children[0]);
                    }
                    return xl;
                };
                ASXMLList.prototype._shallowCopy = function () {
                    var xl = this.sec.AXXMLList.CreateList(this._targetObject, this._targetProperty);
                    var length = this._children.length;
                    for (var i = 0; i < length; i++) {
                        xl._children[i] = this._children[i];
                        assert(xl._children[0]);
                    }
                    return xl;
                };
                // 13.5.4.12 XMLList.prototype.hasOwnProperty ( P )
                ASXMLList.prototype.native_hasOwnProperty = function (P) {
                    P = AVMX.axCoerceString(P);
                    if (this === this.sec.AXXMLList.dPrototype) {
                        return AS.ASObject.prototype.native_hasOwnProperty.call(this, P);
                    }
                    if (Shumway.isIndex(P)) {
                        return (P | 0) < this._children.length;
                    }
                    var mn = toXMLName(P, this.sec);
                    var children = this._children;
                    for (var i = 0; i < children.length; i++) {
                        var node = children[i];
                        if (node._kind === 1 /* Element */) {
                            if (node.hasProperty(mn)) {
                                return true;
                            }
                        }
                    }
                    return false;
                };
                // 13.5.4.19 XMLList.prototype.propertyIsEnumerable ( P )
                ASXMLList.prototype.native_propertyIsEnumerable = function (P) {
                    return Shumway.isIndex(P) && (P | 0) < this._children.length;
                };
                ASXMLList.prototype.attribute = function (arg) {
                    if (Shumway.isNullOrUndefined(arg) && arguments.length > 0) {
                        this.sec.throwError('TypeError', AVMX.Errors.ConvertUndefinedToObjectError);
                    }
                    if (arg && arg.axClass === this.sec.AXQName) {
                        return this.getProperty(arg.name);
                    }
                    arg = AVMX.axCoerceString(arg);
                    if (arg === '*' || arguments.length === 0) {
                        arg = null;
                    }
                    tmpMultiname.name = arg;
                    tmpMultiname.namespaces = [AVMX.Namespace.PUBLIC];
                    tmpMultiname.kind = 13 /* QNameA */;
                    return this.getProperty(tmpMultiname);
                };
                ASXMLList.prototype.attributes = function () {
                    // 13.5.4.3 XMLList.prototype.attributes ( )
                    tmpMultiname.name = null;
                    tmpMultiname.namespaces = [];
                    tmpMultiname.kind = 13 /* QNameA */;
                    return this.getProperty(tmpMultiname);
                };
                ASXMLList.prototype.child = function (propertyName) {
                    if (Shumway.isIndex(propertyName)) {
                        var list = this.sec.AXXMLList.CreateList(this._targetObject, this._targetProperty);
                        if ((propertyName | 0) < this._children.length) {
                            list._children[0] = this._children[propertyName | 0]._deepCopy();
                            assert(list._children[0]);
                        }
                        return list;
                    }
                    return this.getProperty(toXMLName(propertyName, this.sec));
                };
                ASXMLList.prototype.children = function () {
                    // 13.5.4.4 XMLList.prototype.child ( propertyName )
                    return this.getProperty(anyMultiname);
                };
                // 9.2.1.8 [[Descendants]] (P)
                ASXMLList.prototype.descendants = function (name_) {
                    var name = toXMLName(name_, this.sec);
                    var list = this.sec.AXXMLList.CreateList(this._targetObject, this._targetProperty);
                    for (var i = 0; i < this._children.length; i++) {
                        var child = this._children[i];
                        if (child._kind === 1 /* Element */) {
                            child.descendantsInto(name, list);
                        }
                    }
                    return list;
                };
                ASXMLList.prototype.comments = function () {
                    // 13.5.4.6 XMLList.prototype.comments ( )
                    var xl = this.sec.AXXMLList.CreateList(this._targetObject, this._targetProperty);
                    this._children.forEach(function (child) {
                        if (child._kind === 1 /* Element */) {
                            var r = child.comments();
                            Array.prototype.push.apply(xl._children, r._children);
                        }
                    });
                    return xl;
                };
                // 13.5.4.8 XMLList.prototype.contains ( value )
                ASXMLList.prototype.contains = function (value) {
                    var children = this._children;
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        if (child.equals(value)) {
                            return true;
                        }
                    }
                    return false;
                };
                ASXMLList.prototype.copy = function () {
                    // 13.5.4.9 XMLList.prototype.copy ( )
                    return this._deepCopy();
                };
                ASXMLList.prototype.elements = function (name) {
                    // 13.5.4.11 XMLList.prototype.elements ( [ name ] )
                    var mn = toXMLName(name, this.sec);
                    var xl = this.sec.AXXMLList.CreateList(this._targetObject, mn);
                    this._children.forEach(function (child) {
                        if (child._kind === 1 /* Element */) {
                            var r = child.elements(mn);
                            Array.prototype.push.apply(xl._children, r._children);
                        }
                    });
                    return xl;
                };
                ASXMLList.prototype.hasComplexContent = function () {
                    // 13.5.4.13 XMLList.prototype.hasComplexContent( )
                    switch (this._children.length) {
                        case 0:
                            return false;
                        case 1:
                            return this._children[0].hasComplexContent();
                        default:
                            return this._children.some(function (child) {
                                return child._kind === 1 /* Element */;
                            });
                    }
                };
                ASXMLList.prototype.hasSimpleContent = function () {
                    // 13.5.4.14 XMLList.prototype.hasSimpleContent( )
                    switch (this._children.length) {
                        case 0:
                            return true;
                        case 1:
                            return this._children[0].hasSimpleContent();
                        default:
                            return this._children.every(function (child) {
                                return child._kind !== 1 /* Element */;
                            });
                    }
                };
                ASXMLList.prototype.length = function () {
                    return this._children.length;
                };
                ASXMLList.prototype.name = function () {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'name');
                    }
                    return this._children[0].name();
                };
                // 13.5.4.16 XMLList.prototype.normalize ( )
                ASXMLList.prototype.normalize = function () {
                    // Steps 1-2.
                    for (var i = 0; i < this._children.length;) {
                        var child = this._children[i];
                        // Step 2.a.
                        if (child._kind === 1 /* Element */) {
                            child.normalize();
                            i++;
                        }
                        else if (child._kind === 3 /* Text */) {
                            // Step 2.b.i.
                            for (i++; i < this._children.length;) {
                                var nextChild = this._children[i];
                                if (nextChild._kind !== 3 /* Text */) {
                                    break;
                                }
                                child._value += nextChild._value;
                                this.removeByIndex(i);
                            }
                            // Step 2.b.ii.
                            if (child._value.length === 0) {
                                this.removeByIndex(i);
                            }
                            else {
                                i++;
                            }
                        }
                        else {
                            i++;
                        }
                    }
                    return this;
                };
                ASXMLList.prototype.parent = function () {
                    // 13.5.4.17 XMLList.prototype.parent ( )
                    var children = this._children;
                    if (children.length === 0) {
                        return undefined;
                    }
                    var parent = children[0]._parent;
                    for (var i = 1; i < children.length; i++) {
                        if (children[i]._parent !== parent) {
                            return undefined;
                        }
                    }
                    return parent;
                };
                // 13.5.4.18 XMLList.prototype.processingInstructions ( [ name ] )
                ASXMLList.prototype.processingInstructions = function (name_) {
                    // (Numbering in the spec starts at 6.)
                    // Step 6 (implicit).
                    // Step 7.
                    var name = toXMLName(name_, this.sec);
                    // Step 8.
                    var list = this.sec.AXXMLList.CreateList(this._targetObject, this._targetProperty);
                    list._targetObject = this;
                    list._targetProperty = null;
                    // Step 9.
                    var children = this._children;
                    for (var i = 0; i < children.length; i++) {
                        children[i].processingInstructionsInto(name, list);
                    }
                    // Step 10.
                    return list;
                };
                ASXMLList.prototype.text = function () {
                    // 13.5.4.20 XMLList.prototype.text ( )
                    var xl = this.sec.AXXMLList.CreateList(this._targetObject, this._targetProperty);
                    this._children.forEach(function (v, i) {
                        if (v._kind === 1 /* Element */) {
                            var gq = v.text();
                            if (gq._children.length > 0) {
                                xl._children.push(gq);
                            }
                        }
                    });
                    return xl;
                };
                ASXMLList.prototype.toXMLString = function () {
                    // 10.2.2 ToXMLString Applied to the XMLList Type
                    var sec = this.sec;
                    return this._children.map(function (childNode) {
                        return toXMLString(sec, childNode);
                    }).join(sec.AXXML.prettyPrinting ? '\n' : '');
                };
                ASXMLList.prototype.toJSON = function (k) {
                    return 'XMLList';
                };
                ASXMLList.prototype.addNamespace = function (ns) {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'addNamespace');
                    }
                    var xml = this._children[0];
                    xml.addNamespace(ns);
                    return xml;
                };
                ASXMLList.prototype.appendChild = function (child) {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'appendChild');
                    }
                    var xml = this._children[0];
                    xml.appendChild(child);
                    return xml;
                };
                // 9.2.1.6 [[append]] (V)
                ASXMLList.prototype.append = function (V) {
                    // Step 1.
                    var children = this._children;
                    var i = children.length;
                    // Step 2.
                    var n = 1;
                    // Step 3.
                    if (V && V.axClass === this.sec.AXXMLList) {
                        this._targetObject = V._targetObject;
                        this._targetProperty = V._targetProperty;
                        var valueChildren = V._children;
                        n = valueChildren.length;
                        if (n === 0) {
                            return;
                        }
                        for (var j = 0; j < valueChildren.length; j++) {
                            children[i + j] = valueChildren[j];
                        }
                        return;
                    }
                    release || assert(V.axClass === this.sec.AXXML);
                    // Step 4.
                    children[i] = V;
                    // Step 5 (implicit).
                };
                ASXMLList.prototype.childIndex = function () {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'childIndex');
                    }
                    return this._children[0].childIndex();
                };
                ASXMLList.prototype.inScopeNamespaces = function () {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'inScopeNamespaces');
                    }
                    return this._children[0].inScopeNamespaces();
                };
                ASXMLList.prototype.insertChildAfter = function (child1, child2) {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'insertChildAfter');
                    }
                    return this._children[0].insertChildAfter(child1, child2);
                };
                ASXMLList.prototype.insertChildBefore = function (child1, child2) {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'insertChildBefore');
                    }
                    return this._children[0].insertChildBefore(child1, child2);
                };
                ASXMLList.prototype.nodeKind = function () {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'nodeKind');
                    }
                    return this._children[0].nodeKind();
                };
                ASXMLList.prototype.namespace = function (prefix) {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'namespace');
                    }
                    var firstChild = this._children[0];
                    return arguments.length ? firstChild.namespace(prefix) : firstChild.namespace();
                };
                ASXMLList.prototype.localName = function () {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'localName');
                    }
                    return this._children[0].localName();
                };
                ASXMLList.prototype.namespaceDeclarations = function () {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'namespaceDeclarations');
                    }
                    return this._children[0].namespaceDeclarations();
                };
                ASXMLList.prototype.prependChild = function (value) {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'prependChild');
                    }
                    return this._children[0].prependChild(value);
                };
                ASXMLList.prototype.removeNamespace = function (ns) {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'removeNamespace');
                    }
                    return this._children[0].removeNamespace(ns);
                };
                ASXMLList.prototype.replace = function (propertyName, value) {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'replace');
                    }
                    return this._children[0].replace(propertyName, value);
                };
                ASXMLList.prototype.setChildren = function (value) {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'setChildren');
                    }
                    return this._children[0].setChildren(value);
                };
                ASXMLList.prototype.setLocalName = function (name) {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'setLocalName');
                    }
                    return this._children[0].setLocalName(name);
                };
                ASXMLList.prototype.setName = function (name) {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'setName');
                    }
                    return this._children[0].setName(name);
                };
                ASXMLList.prototype.setNamespace = function (ns) {
                    if (this._children.length !== 1) {
                        this.sec.throwError('TypeError', AVMX.Errors.XMLOnlyWorksWithOneItemLists, 'setNamespace');
                    }
                    return this._children[0].setNamespace(ns);
                };
                ASXMLList.prototype.axGetEnumerableKeys = function () {
                    if (this === this.axClass.dPrototype) {
                        return _super.prototype.axGetEnumerableKeys.call(this);
                    }
                    return Object.keys(this._children);
                };
                // 9.2.1.1 [[Get]] (P)
                ASXMLList.prototype.getProperty = function (mn) {
                    var nm = mn.name;
                    if (Shumway.isIndex(nm)) {
                        return this._children[nm | 0];
                    }
                    var isAnyName = nm === null || nm === '*';
                    var isAnyNamespace = mn.isAnyNamespace();
                    var isAttribute = mn.isAttribute();
                    var xl = this.sec.AXXMLList.CreateList(this._targetObject, mn);
                    var children = this._children;
                    for (var i = 0; i < children.length; i++) {
                        var v = children[i];
                        if (v._kind === 1 /* Element */) {
                            // i. Let gq be the result of calling the [[Get]] method of x[i] with argument P
                            // We do this inline instead to reduce the amount of temporarily created XMLLists.
                            if (isAttribute) {
                                var attributes = v._attributes;
                                for (var j = 0; attributes && j < attributes.length; j++) {
                                    var v = attributes[j];
                                    if ((isAnyName || v._name.name === nm) &&
                                        (isAnyNamespace || v._name.matches(mn))) {
                                        xl._children.push(v);
                                    }
                                }
                            }
                            else {
                                var descendants = v._children;
                                for (var j = 0; descendants && j < descendants.length; j++) {
                                    var v = descendants[j];
                                    if ((isAnyName || v._kind === 1 /* Element */ && v._name.name === nm) &&
                                        (isAnyNamespace || v._name.matches(mn))) {
                                        xl._children.push(v);
                                    }
                                }
                            }
                        }
                    }
                    return xl;
                };
                ASXMLList.prototype.axGetProperty = function (mn) {
                    if (this === this.axClass.dPrototype) {
                        var value = this[this.axResolveMultiname(mn)];
                        release || AVMX.checkValue(value);
                        return value;
                    }
                    return this.getProperty(coerceE4XMultiname(mn, this.sec));
                };
                ASXMLList.prototype.axGetPublicProperty = function (nm) {
                    if (this === this.axClass.dPrototype) {
                        var value = this[AVMX.Multiname.getPublicMangledName(nm)];
                        release || AVMX.checkValue(value);
                        return value;
                    }
                    if (Shumway.isIndex(nm)) {
                        return this._children[nm | 0];
                    }
                    tmpMultiname.name = nm;
                    tmpMultiname.namespaces = [AVMX.Namespace.PUBLIC];
                    tmpMultiname.kind = 7 /* QName */;
                    return this.getProperty(tmpMultiname);
                };
                ASXMLList.prototype.hasProperty = function (mn) {
                    if (Shumway.isIndex(mn.name)) {
                        return Number(mn.name) < this._children.length;
                    }
                    // TODO scan children on property presence?
                    return true;
                };
                ASXMLList.prototype.axHasProperty = function (mn) {
                    return this.hasProperty(mn);
                };
                ASXMLList.prototype.axHasPropertyInternal = function (mn) {
                    return this.hasProperty(mn);
                };
                // 9.1.1.10 [[ResolveValue]] ( )
                ASXMLList.prototype.resolveValue = function () {
                    return this;
                };
                // 9.2.1.2 [[Put]] (P, V)
                ASXMLList.prototype.setProperty = function (mn, value) {
                    // Steps 1-2.
                    if (Shumway.isIndex(mn.name)) {
                        var i = mn.name | 0;
                        // Step 2.b.
                        var r = null;
                        // Step 2.a.
                        if (this._targetObject) {
                            r = this._targetObject.resolveValue();
                            if (r === null) {
                                return;
                            }
                        }
                        // Step 2.c.
                        var length = this._children.length;
                        if (i >= length) {
                            // Step 2.c.i.
                            if (r && r.axClass === this.sec.AXXMLList) {
                                // Step 2.c.i.1.
                                if (r._children.length !== 1) {
                                    return;
                                }
                                // Step 2.c.i.2.
                                r = r._children[0];
                            }
                            release || assert(r === null || r.axClass === this.sec.AXXML);
                            // Step 2.c.ii.
                            if (r && r._kind !== 1 /* Element */) {
                                return;
                            }
                            // Step 2.c.iii.
                            var y = this.sec.AXXML.Create();
                            y._parent = r;
                            var yName = this._targetProperty;
                            var yKind = 3 /* Text */;
                            // Step 2.c.iv.
                            if (this._targetProperty && this._targetProperty.isAttribute()) {
                                if (r.hasProperty(this._targetProperty)) {
                                    return;
                                }
                                yKind = 2 /* Attribute */;
                            }
                            else if (!this._targetProperty || this._targetProperty.name === null) {
                                yName = null;
                                yKind = 3 /* Text */;
                            }
                            else {
                                yKind = 1 /* Element */;
                            }
                            y.init(yKind, yName);
                            // Step 2.c.vii.
                            i = length;
                            // Step 2.c.viii.
                            if (y._kind !== 2 /* Attribute */) {
                                // Step 2.c.viii.1.
                                if (r !== null) {
                                    var j;
                                    // Step 2.c.viii.1.a.
                                    if (i > 0) {
                                        var lastChild = this._children[i - 1];
                                        var rLength = r._children.length - 1;
                                        for (j = 0; j < rLength; j++) {
                                            if (r._children[j] === lastChild) {
                                                release || assert(r._children[0]);
                                                break;
                                            }
                                        }
                                    }
                                    else {
                                        j = r._children.length - 1;
                                    }
                                    // Step 2.c.viii.1.c.
                                    r._children[j + 1] = y;
                                    assert(r._children[0]);
                                    y._parent = r;
                                }
                                // Step 2.c.viii.2.
                                if (value && value.axClass === this.sec.AXXML) {
                                    y._name = value._name;
                                }
                                else if (value && value.axClass === this.sec.AXXMLList) {
                                    y._name = value._targetProperty;
                                }
                                // Step 2.c.ix.
                                this.append(y);
                            }
                        }
                        // Step 2.d.
                        if (!isXMLType(value, this.sec) ||
                            value._kind === 3 /* Text */ || value._kind === 2 /* Attribute */) {
                            value = value + '';
                        }
                        var currentChild = this._children[i];
                        var childKind = currentChild._kind;
                        var parent = currentChild._parent;
                        // Step 2.e.
                        if (childKind === 2 /* Attribute */) {
                            var indexInParent = parent._children.indexOf(currentChild);
                            parent.setProperty(currentChild._name, false);
                            this._children[i] = parent._children[indexInParent];
                            assert(this._children[0]);
                            return;
                        }
                        // Step 2.f.
                        if (value && value.axClass === this.sec.AXXMLList) {
                            // Step 2.f.i.
                            var c = value._shallowCopy();
                            var cLength = c._children.length;
                            // Step 2.f.ii. (implemented above.)
                            // Step 2.f.iii.
                            if (parent !== null) {
                                // Step 2.f.iii.1.
                                var q = parent._children.indexOf(currentChild);
                                // Step 2.f.iii.2.
                                parent._replaceByIndex(q, c);
                                // Step 2.f.iii.3.
                                for (var j = 0; j < cLength; j++) {
                                    c._children[j] = parent._children[q + j];
                                }
                            }
                            // Step 2.f.iv.
                            if (cLength === 0) {
                                for (var j = i + 1; j < length; j++) {
                                    this._children[j - 1] = this._children[j];
                                    assert(this._children[0]);
                                }
                                // Step 2.f.vii. (only required if we're shrinking the XMLList).
                                this._children.length--;
                            }
                            else {
                                for (var j = length - 1; j > i; j--) {
                                    this._children[j + cLength - 1] = this._children[j];
                                    assert(this._children[0]);
                                }
                            }
                            // Step 2.f.vi.
                            for (var j = 0; j < cLength; j++) {
                                this._children[i + j] = c._children[j];
                                assert(this._children[0]);
                            }
                            return;
                        }
                        // Step 2.g.
                        if (childKind >= 3 /* Text */ || value && value.axClass === this.sec.AXXML) {
                            // Step 2.g.i. (implemented above.)
                            // Step 2.g.ii.
                            if (parent !== null) {
                                // Step 2.g.ii.1.
                                var q = parent._children.indexOf(currentChild);
                                // Step 2.g.ii.2.
                                parent._replaceByIndex(q, value);
                                // Step 2.g.ii.3.
                                value = parent._children[q];
                            }
                            // Step 2.g.iii.
                            if (typeof value === 'string') {
                                var t = this.sec.AXXML.Create(value);
                                this._children[i] = t;
                                assert(this._children[0]);
                            }
                            else {
                                release || assert(this.sec.AXXML.axIsType(value));
                                this._children[i] = value;
                                assert(this._children[0]);
                            }
                            return;
                        }
                        // Step 2.h.
                        currentChild.setProperty(anyMultiname, value);
                        return;
                    }
                    // Step 3.
                    if (this._children.length === 0) {
                        // Step 3.a.i.
                        r = this.resolveValue();
                        // Step 3.a.ii.
                        if (r === null || r._children.length !== 1) {
                            return;
                        }
                        // Step 3.a.iii.
                        this.append(r._children[0]);
                    }
                    // Step 3.b.
                    if (this._children.length === 1) {
                        this._children[0].setProperty(mn, value);
                        // Step 4.
                        return;
                    }
                    // Not in the spec, but in Flash.
                    this.sec.throwError('TypeError', AVMX.Errors.XMLAssigmentOneItemLists);
                };
                ASXMLList.prototype.axSetProperty = function (mn, value, bc) {
                    if (this === this.axClass.dPrototype) {
                        release || AVMX.checkValue(value);
                        this[this.axResolveMultiname(mn)] = value;
                        return;
                    }
                    this.setProperty(coerceE4XMultiname(mn, this.sec), value);
                };
                // 9.2.1.3 [[Delete]] (P)
                ASXMLList.prototype.axDeleteProperty = function (mn) {
                    var name = mn.name;
                    // Steps 1-2.
                    if (Shumway.isIndex(name)) {
                        var i = name | 0;
                        // Step 2.a.
                        if (i >= this._children.length) {
                            return true;
                        }
                        // Step 2.b.
                        this.removeByIndex(i);
                        return true;
                    }
                    // Step 3.
                    for (var i = 0; i < this._children.length; i++) {
                        var child = this._children[i];
                        if (child._kind === 1 /* Element */) {
                            child.deleteProperty(mn);
                        }
                    }
                    // Step 4.
                    return true;
                };
                ASXMLList.prototype.removeByIndex = function (index) {
                    var child = this._children[index];
                    var parent = child._parent;
                    if (parent) {
                        child._parent = null;
                        parent._children.splice(parent._children.indexOf(child), 1);
                    }
                    this._children.splice(index, 1);
                };
                ASXMLList.prototype.axCallProperty = function (mn, args) {
                    var method = this[this.axResolveMultiname(mn)];
                    // Check if the method exists before calling it.
                    if (method) {
                        AVMX.validateCall(this.sec, method, args.length);
                        return method.axApply(this, args);
                    }
                    // Otherwise, 11.2.2.1 CallMethod ( r , args )
                    // If f == undefined and Type(base) is XMLList and base.[[Length]] == 1
                    //   ii. Return the result of calling CallMethod(r0, args) recursively
                    if (this._children.length === 1) {
                        return this._children[0].axCallProperty(mn, args);
                    }
                    this.sec.throwError('TypeError', AVMX.Errors.CallOfNonFunctionError, 'value');
                };
                ASXMLList.instanceConstructor = ASXMLList;
                return ASXMLList;
            })(AS.ASObject);
            AS.ASXMLList = ASXMLList;
        })(AS = AVMX.AS || (AVMX.AS = {}));
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2015 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var AS;
        (function (AS) {
            var flash;
            (function (flash) {
                var xml;
                (function (xml) {
                    var axCoerceString = Shumway.AVMX.axCoerceString;
                    var XMLSpecialChars;
                    (function (XMLSpecialChars) {
                        XMLSpecialChars[XMLSpecialChars["APOS"] = 39] = "APOS";
                        XMLSpecialChars[XMLSpecialChars["AMP"] = 38] = "AMP";
                        XMLSpecialChars[XMLSpecialChars["QUOT"] = 34] = "QUOT";
                        XMLSpecialChars[XMLSpecialChars["LT"] = 60] = "LT";
                        XMLSpecialChars[XMLSpecialChars["GT"] = 62] = "GT";
                    })(XMLSpecialChars || (XMLSpecialChars = {}));
                    var XMLNode = (function (_super) {
                        __extends(XMLNode, _super);
                        function XMLNode(type /*uint*/, value) {
                            type = type >>> 0;
                            value = axCoerceString(value);
                            _super.call(this);
                        }
                        // Static   JS -> AS Bindings
                        // Static   AS -> JS Bindings
                        XMLNode.escapeXML = function (value) {
                            value = axCoerceString(value);
                            var i = 0, length = value.length, ch;
                            while (i < length) {
                                ch = value.charCodeAt(i);
                                if (ch === XMLSpecialChars.APOS || ch === XMLSpecialChars.AMP ||
                                    ch === XMLSpecialChars.QUOT || ch === XMLSpecialChars.LT ||
                                    ch === XMLSpecialChars.GT) {
                                    break;
                                }
                                i++;
                            }
                            if (i >= length) {
                                return value;
                            }
                            var parts = [value.substring(0, i)];
                            while (i < length) {
                                switch (ch) {
                                    case XMLSpecialChars.APOS:
                                        parts.push('&apos;');
                                        break;
                                    case XMLSpecialChars.AMP:
                                        parts.push('&amp;');
                                        break;
                                    case XMLSpecialChars.QUOT:
                                        parts.push('&quot;');
                                        break;
                                    case XMLSpecialChars.LT:
                                        parts.push('&lt;');
                                        break;
                                    case XMLSpecialChars.GT:
                                        parts.push('&gt;');
                                        break;
                                }
                                ++i;
                                var j = i;
                                while (i < length) {
                                    ch = value.charCodeAt(i);
                                    if (ch === XMLSpecialChars.APOS || ch === XMLSpecialChars.AMP ||
                                        ch === XMLSpecialChars.QUOT || ch === XMLSpecialChars.LT ||
                                        ch === XMLSpecialChars.GT) {
                                        break;
                                    }
                                    i++;
                                }
                                if (j < i) {
                                    parts.push(value.substring(j, i));
                                }
                            }
                            return parts.join('');
                        };
                        return XMLNode;
                    })(AS.ASObject);
                    xml.XMLNode = XMLNode;
                    var XMLDocument = (function (_super) {
                        __extends(XMLDocument, _super);
                        function XMLDocument(text) {
                            if (text === void 0) { text = null; }
                            text = axCoerceString(text);
                            _super.call(this, 1, "");
                        }
                        return XMLDocument;
                    })(flash.xml.XMLNode);
                    xml.XMLDocument = XMLDocument;
                    var XMLTag = (function (_super) {
                        __extends(XMLTag, _super);
                        function XMLTag() {
                            _super.call(this);
                            this._type = 0;
                            this._value = null;
                            this._empty = false;
                            this._attrs = null;
                        }
                        Object.defineProperty(XMLTag.prototype, "type", {
                            // Static   JS -> AS Bindings
                            // Static   AS -> JS Bindings
                            // Instance JS -> AS Bindings
                            // Instance AS -> JS Bindings
                            get: function () {
                                return this._type;
                            },
                            set: function (value /*uint*/) {
                                value = value >>> 0;
                                this._type = value;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        Object.defineProperty(XMLTag.prototype, "empty", {
                            get: function () {
                                return this._empty;
                            },
                            set: function (value) {
                                value = !!value;
                                this._empty = value;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        Object.defineProperty(XMLTag.prototype, "value", {
                            get: function () {
                                return this._value;
                            },
                            set: function (v) {
                                v = axCoerceString(v);
                                this._value = v;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        Object.defineProperty(XMLTag.prototype, "attrs", {
                            get: function () {
                                return this._attrs;
                            },
                            set: function (value) {
                                this._attrs = value;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        return XMLTag;
                    })(AS.ASObject);
                    xml.XMLTag = XMLTag;
                    var XMLNodeType = (function (_super) {
                        __extends(XMLNodeType, _super);
                        function XMLNodeType() {
                            _super.call(this);
                        }
                        return XMLNodeType;
                    })(AS.ASObject);
                    xml.XMLNodeType = XMLNodeType;
                    function isWhitespace(s) {
                        for (var i = 0; i < s.length; i++) {
                            var ch = s[i];
                            if (!(ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t')) {
                                return false;
                            }
                        }
                        return true;
                    }
                    var XMLParserForXMLDocument = (function (_super) {
                        __extends(XMLParserForXMLDocument, _super);
                        function XMLParserForXMLDocument(sec) {
                            _super.call(this);
                            this.sec = sec;
                            this.queue = [];
                            this.ignoreWhitespace = false;
                        }
                        XMLParserForXMLDocument.prototype.onError = function (code) {
                            this.queue.push(code);
                        };
                        XMLParserForXMLDocument.prototype.onPi = function (name, value) {
                            Shumway.Debug.warning('Unhandled XMLParserForXMLDocument.onPi');
                        };
                        XMLParserForXMLDocument.prototype.onComment = function (text) {
                            Shumway.Debug.warning('Unhandled XMLParserForXMLDocument.onComment');
                        };
                        XMLParserForXMLDocument.prototype.onCdata = function (text) {
                            this.queue.push({
                                type: 4,
                                value: text
                            });
                        };
                        XMLParserForXMLDocument.prototype.onDoctype = function (doctypeContent) {
                            Shumway.Debug.warning('Unhandled XMLParserForXMLDocument.onDoctype');
                        };
                        XMLParserForXMLDocument.prototype.onBeginElement = function (name, attributes, isEmpty) {
                            var attrObj = this.sec.createObject();
                            attributes.forEach(function (a) {
                                attrObj.axSetPublicProperty(a.name, a.value);
                            });
                            this.queue.push({
                                type: 1,
                                value: name,
                                empty: isEmpty,
                                attrs: attrObj
                            });
                        };
                        XMLParserForXMLDocument.prototype.onEndElement = function (name) {
                            this.queue.push({
                                type: 1,
                                value: '/' + name
                            });
                        };
                        XMLParserForXMLDocument.prototype.onText = function (text) {
                            if (this.ignoreWhitespace && isWhitespace(text)) {
                                return;
                            }
                            this.queue.push({
                                type: 3,
                                value: text
                            });
                        };
                        return XMLParserForXMLDocument;
                    })(AS.XMLParserBase);
                    var XMLParser = (function (_super) {
                        __extends(XMLParser, _super);
                        function XMLParser() {
                            _super.call(this);
                        }
                        XMLParser.prototype.startParse = function (source, ignoreWhite) {
                            source = axCoerceString(source);
                            ignoreWhite = !!ignoreWhite;
                            var parser = new XMLParserForXMLDocument(this.sec);
                            parser.ignoreWhitespace = ignoreWhite;
                            parser.parseXml(source);
                            this.queue = parser.queue;
                        };
                        XMLParser.prototype.getNext = function (tag) {
                            if (this.queue.length === 0) {
                                return -1 /* EndOfDocument */;
                            }
                            var nextItem = this.queue.shift();
                            if (typeof nextItem === 'number') {
                                return nextItem;
                            }
                            var parseResult = nextItem;
                            tag.type = parseResult.type;
                            tag.value = parseResult.value;
                            tag.empty = parseResult.empty || false;
                            tag.attrs = parseResult.attrs || null;
                            return 0 /* NoError */;
                        };
                        return XMLParser;
                    })(AS.ASObject);
                    xml.XMLParser = XMLParser;
                })(xml = flash.xml || (flash.xml = {}));
            })(flash = AS.flash || (AS.flash = {}));
        })(AS = AVMX.AS || (AVMX.AS = {}));
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var AS;
        (function (AS) {
            var assert = Shumway.Debug.assert;
            function createNullOrUndefinedDescription(sec, o) {
                return {
                    __proto__: sec.objectPrototype,
                    $Bgname: o === undefined ? "void" : "null",
                    $BgisDynamic: false,
                    $BgisFinal: true,
                    $BgisStatic: false,
                    $Bgtraits: {
                        __proto__: sec.objectPrototype,
                        $Bgvariables: null,
                        $Bgaccessors: null,
                        $Bgmetadata: sec.createArray([]),
                        $Bgconstructor: null,
                        $Bginterfaces: sec.createArray([]),
                        $Bgmethods: null,
                        $Bgbases: sec.createArray([])
                    }
                };
            }
            function describeTypeJSON(sec, o, flags) {
                // Class traits aren't returned for numeric primitives, undefined, null, bound methods, or
                // non-class-constructor functions.
                var isInt = (o | 0) === o;
                var nullOrUndefined = Shumway.isNullOrUndefined(o);
                if (flags & 512 /* USE_ITRAITS */ && (nullOrUndefined || isInt)) {
                    return null;
                }
                if (nullOrUndefined) {
                    return createNullOrUndefinedDescription(sec, o);
                }
                // Use the object's own sec if we're not dealing with a primitive to make sure
                // type checks are correct.
                if (o.sec) {
                    sec = o.sec;
                }
                o = sec.box(o);
                if (sec.AXFunction.axIsType(o)) {
                    if (sec.AXMethodClosure.axIsType(o)) {
                        if (flags & 512 /* USE_ITRAITS */) {
                            return null;
                        }
                    }
                    else if ('receiver' in o) {
                        return null;
                    }
                }
                var cls = o.hasOwnProperty('classInfo') ? o : o.axClass;
                release || assert(cls, "No class found for object " + o);
                var describeClass = cls === o && !(flags & 512 /* USE_ITRAITS */);
                var info = cls.classInfo;
                var description = sec.createObject();
                // For numeric literals that fit into ints, special case the name.
                if (isInt) {
                    description.$Bgname = 'int';
                }
                else {
                    description.$Bgname = info.instanceInfo.getName().toFQNString(true);
                }
                // More special casing for bound methods. See bug 1057750.
                description.$BgisDynamic = describeClass || !(info.instanceInfo.flags & 1 /* ClassSealed */);
                description.$BgisFinal = describeClass || !!(info.instanceInfo.flags & 2 /* ClassFinal */);
                //TODO: verify that `isStatic` is false for all instances, true for classes
                description.$BgisStatic = describeClass;
                if (flags & 256 /* INCLUDE_TRAITS */) {
                    description.$Bgtraits = addTraits(cls, info, describeClass, flags);
                }
                return description;
            }
            AS.describeTypeJSON = describeTypeJSON;
            var tmpName = new AVMX.Multiname(null, 0, 7 /* QName */, [AVMX.Namespace.PUBLIC], null);
            var tmpAttr = new AVMX.Multiname(null, 0, 13 /* QNameA */, [AVMX.Namespace.PUBLIC], null);
            function describeType(sec, value, flags) {
                // Ensure that the XML classes have been initialized:
                tmpName.name = 'XML';
                var xmlClass = sec.application.getClass(tmpName);
                var classDescription = describeTypeJSON(sec, value, flags);
                var x = xmlClass.Create('<type/>');
                tmpAttr.name = 'name';
                x.setProperty(tmpAttr, classDescription.$Bgname);
                var bases = classDescription.$Bgtraits.$Bgbases.value;
                if (bases.length) {
                    tmpAttr.name = 'base';
                    x.setProperty(tmpAttr, bases[0]);
                }
                tmpAttr.name = 'isDynamic';
                x.setProperty(tmpAttr, classDescription.$BgisDynamic.toString());
                tmpAttr.name = 'isFinal';
                x.setProperty(tmpAttr, classDescription.$BgisFinal.toString());
                tmpAttr.name = 'isStatic';
                x.setProperty(tmpAttr, classDescription.$BgisStatic.toString());
                describeTraits(x, classDescription.$Bgtraits);
                var instanceDescription = describeTypeJSON(sec, value, flags | 512 /* USE_ITRAITS */);
                if (instanceDescription) {
                    var e = xmlClass.Create('<factory/>');
                    tmpAttr.name = 'type';
                    e.setProperty(tmpAttr, instanceDescription.$Bgname);
                    if (describeTraits(e, instanceDescription.$Bgtraits)) {
                        x.appendChild(e);
                    }
                }
                return x;
            }
            AS.describeType = describeType;
            function describeTraits(x, traits) {
                var traitsCount = 0;
                var bases = traits.$Bgbases && traits.$Bgbases.value;
                for (var i = 0; bases && i < bases.length; i++) {
                    var base = bases[i];
                    var e = x.sec.AXXML.Create('<extendsClass type="' + AS.escapeAttributeValue(base) + '"/>');
                    x.appendChild(e);
                    traitsCount++;
                }
                var interfaces = traits.$Bginterfaces && traits.$Bginterfaces.value;
                for (var i = 0; interfaces && i < interfaces.length; i++) {
                    var e = x.sec.AXXML.Create('<implementsInterface type="' +
                        AS.escapeAttributeValue(interfaces[i]) + '"/>');
                    x.appendChild(e);
                    traitsCount++;
                }
                if (traits.$Bgconstructor !== null) {
                    var e = x.sec.AXXML.Create('<constructor/>');
                    describeParams(e, traits.$Bgconstructor);
                    x.appendChild(e);
                    traitsCount++;
                }
                var variables = traits.$Bgvariables && traits.$Bgvariables.value;
                for (var i = 0; variables && i < variables.length; i++) {
                    var variable = variables[i];
                    var nodeName = variable.$Bgaccess === 'readonly' ? 'constant' : 'variable';
                    var e = x.sec.AXXML.Create('<' + nodeName +
                        ' name="' + AS.escapeAttributeValue(variable.$Bgname) +
                        '" type="' + variable.$Bgtype + '"/>');
                    finishTraitDescription(variable, e, x);
                    traitsCount++;
                }
                var accessors = traits.$Bgaccessors && traits.$Bgaccessors.value;
                for (var i = 0; accessors && i < accessors.length; i++) {
                    var accessor = accessors[i];
                    var e = x.sec.AXXML.Create('<accessor ' +
                        'name="' + AS.escapeAttributeValue(accessor.$Bgname) +
                        '" access="' + accessor.$Bgaccess +
                        '" type="' + AS.escapeAttributeValue(accessor.$Bgtype) +
                        '" declaredBy="' +
                        AS.escapeAttributeValue(accessor.$BgdeclaredBy) + '"/>');
                    finishTraitDescription(accessor, e, x);
                    traitsCount++;
                }
                var methods = traits.$Bgmethods && traits.$Bgmethods.value;
                for (var i = 0; methods && i < methods.length; i++) {
                    var method = methods[i];
                    var e = x.sec.AXXML.Create('<method ' + 'name="' +
                        AS.escapeAttributeValue(method.$Bgname) +
                        '" declaredBy="' +
                        AS.escapeAttributeValue(method.$BgdeclaredBy) +
                        '" returnType="' +
                        AS.escapeAttributeValue(method.$BgreturnType) + '"/>');
                    describeParams(e, method.$Bgparameters.value);
                    finishTraitDescription(method, e, x);
                    traitsCount++;
                }
                describeMetadataXML(x, traits.$Bgmetadata);
                return traitsCount > 0;
            }
            function finishTraitDescription(trait, traitXML, traitsListXML) {
                if (trait.$Bguri !== null) {
                    tmpAttr.name = 'uri';
                    traitXML.setProperty(tmpAttr, trait.$Bguri);
                }
                if (trait.$Bgmetadata !== null) {
                    describeMetadataXML(traitXML, trait.$Bgmetadata);
                }
                traitsListXML.appendChild(traitXML);
            }
            function describeParams(x, parameters) {
                if (!parameters) {
                    return;
                }
                for (var i = 0; i < parameters.length; i++) {
                    var p = parameters[i];
                    var f = x.sec.AXXML.Create('<parameter index="' + (i + 1) + '" type="' +
                        AS.escapeAttributeValue(p.$Bgtype) + '" optional="' +
                        p.$Bgoptional + '"/>');
                    x.appendChild(f);
                }
            }
            function describeMetadataXML(x, metadata_) {
                if (!metadata_) {
                    return;
                }
                var metadata = metadata_.value;
                for (var i = 0; i < metadata.length; i++) {
                    var md = metadata[i];
                    var m = x.sec.AXXML.Create('<metadata name="' + AS.escapeAttributeValue(md.$Bgname)
                        + '"/>');
                    var values = md.$Bgvalue.value;
                    for (var j = 0; j < values.length; j++) {
                        var value = values[j];
                        var a = x.sec.AXXML.Create('<arg key="' +
                            AS.escapeAttributeValue(value.$Bgkey) + '" value="' +
                            AS.escapeAttributeValue(value.$Bgvalue) + '"/>');
                        m.appendChild(a);
                    }
                    x.appendChild(m);
                }
            }
            function describeMetadataList(sec, list) {
                if (!list) {
                    return null;
                }
                var result = sec.createArray([]);
                for (var i = 0; i < list.length; i++) {
                    var metadata = list[i];
                    var key = metadata.getName();
                    // Filter out the [native] metadata nodes. These are implementation details Flash doesn't
                    // expose, so we don't, either.
                    if (key === 'native') {
                        continue;
                    }
                    result.push(describeMetadata(sec, metadata));
                }
                return result;
            }
            function describeMetadata(sec, metadata) {
                var result = sec.createObject();
                result.$Bgname = metadata.name;
                var values = [];
                result.$Bgvalue = sec.createArray(values);
                for (var i = 0; i < metadata.keys.length; i++) {
                    var val = sec.createObject();
                    val.$Bgvalue = metadata.getValueAt(i);
                    val.$Bgkey = metadata.getKeyAt(i);
                    values.push(val);
                }
                return result;
            }
            function addTraits(cls, info, describingClass, flags) {
                var sec = cls.sec;
                var includeBases = flags & 2 /* INCLUDE_BASES */;
                var includeMethods = flags & 32 /* INCLUDE_METHODS */ && !describingClass;
                var obj = sec.createObject();
                var variablesVal = obj.$Bgvariables =
                    flags & 8 /* INCLUDE_VARIABLES */ ? sec.createArray([]) : null;
                var accessorsVal = obj.$Bgaccessors =
                    flags & 16 /* INCLUDE_ACCESSORS */ ? sec.createArray([]) : null;
                var metadataList = null;
                // Somewhat absurdly, class metadata is only included when describing instances.
                if (flags & 64 /* INCLUDE_METADATA */ && !describingClass) {
                    var metadata = info.trait.getMetadata();
                    if (metadata) {
                        metadataList = describeMetadataList(sec, metadata);
                    }
                }
                // This particular metadata list is always created, even if no metadata exists.
                obj.$Bgmetadata = metadataList || sec.createArray([]);
                // TODO: fill in.
                obj.$Bgconstructor = null;
                if (flags & 4 /* INCLUDE_INTERFACES */) {
                    obj.$Bginterfaces = sec.createArray([]);
                    if (!describingClass) {
                        var interfacesVal = obj.$Bginterfaces.value;
                        var interfaces = cls.classInfo.instanceInfo.getInterfaces(cls);
                        interfaces.forEach(function (iface) { return interfacesVal.push(iface.name.toFQNString(true)); });
                    }
                }
                else {
                    obj.$Bginterfaces = null;
                }
                var methodsVal = obj.$Bgmethods = includeMethods ? sec.createArray([]) : null;
                var basesVal = obj.$Bgbases = includeBases ? sec.createArray([]) : null;
                var encounteredKeys = Object.create(null);
                // Needed for accessor-merging.
                var encounteredGetters = Object.create(null);
                var encounteredSetters = Object.create(null);
                var addBase = false;
                var isInterface = info.instanceInfo.isInterface();
                while (cls) {
                    var className = cls.classInfo.instanceInfo.getName().toFQNString(true);
                    if (includeBases && addBase && !describingClass) {
                        basesVal.push(className);
                    }
                    else {
                        addBase = true;
                    }
                    if (flags & 1024 /* HIDE_OBJECT */ && cls === sec.AXObject) {
                        break;
                    }
                    if (!describingClass) {
                        describeTraits(sec, cls.classInfo.instanceInfo.traits.traits, isInterface);
                    }
                    else {
                        describeTraits(sec, cls.classInfo.traits.traits, isInterface);
                    }
                    cls = cls.superClass;
                }
                release || assert(cls === sec.AXObject || isInterface);
                // When describing Class objects, the bases to add are always Class and Object.
                if (describingClass) {
                    // When describing Class objects, accessors are ignored. *Except* the `prototype` accessor.
                    if (flags & 16 /* INCLUDE_ACCESSORS */) {
                        var val = sec.createObject();
                        val.$Bgname = 'prototype';
                        val.$Bgtype = '*';
                        val.$Bgaccess = "readonly";
                        val.$Bgmetadata = null;
                        val.$Bguri = null;
                        val.$BgdeclaredBy = 'Class';
                        accessorsVal.push(val);
                    }
                    if (includeBases) {
                        basesVal.pop();
                        basesVal.push('Class', 'Object');
                        cls = sec.AXClass;
                    }
                }
                // Having a hot function closed over isn't all that great, but moving this out would involve
                // passing lots and lots of arguments. We might do that if performance becomes an issue.
                function describeTraits(sec, traits, isInterface) {
                    release || assert(traits, "No traits array found on class" + cls.name);
                    // All types share some fields, but setting them in one place changes the order in which
                    // they're defined - and hence show up in iteration. While it is somewhat unlikely that
                    // real content relies on that order, tests certainly do, so we duplicate the code.
                    for (var i = 0; i < traits.length; i++) {
                        var t = traits[i];
                        var mn = t.getName();
                        var ns = mn.namespace;
                        // Hide all non-public members whose namespace doesn't have a URI specified.
                        // Or, if HIDE_NSURI_METHODS is set, hide those, too, because bugs in Flash.
                        // For interfaces, include all traits. We should've made sure to only have
                        // public methods in them during bytecode parsing/verification.
                        if (!isInterface && (!ns.isPublic() && !ns.uri ||
                            (flags & 1 /* HIDE_NSURI_METHODS */ && ns.uri))) {
                            continue;
                        }
                        // Strip the namespace off of interface methods. They're always treated as public.
                        var name = isInterface ? mn.name : mn.toFQNString(true);
                        if (encounteredGetters[name] !== encounteredSetters[name]) {
                            var val = encounteredKeys[name];
                            val.$Bgaccess = 'readwrite';
                            if (t.kind === 2 /* Getter */) {
                                var type = t.getMethodInfo().getType();
                                val.$Bgtype = type ? type.name.toFQNString(true) : '*';
                            }
                            continue;
                        }
                        if (encounteredKeys[name]) {
                            continue;
                        }
                        //TODO: check why we have public$$_init in `Object`
                        var val = sec.createObject();
                        encounteredKeys[name] = val;
                        var metadata = t.getMetadata();
                        switch (t.kind) {
                            case 6 /* Const */:
                            case 0 /* Slot */:
                                if (!(flags & 8 /* INCLUDE_VARIABLES */)) {
                                    continue;
                                }
                                val.$Bgname = name;
                                val.$Bguri = ns.reflectedURI;
                                var typeName = t.getTypeName();
                                val.$Bgtype = typeName ? typeName.toFQNString(true) : '*';
                                val.$Bgaccess = "readwrite";
                                val.$Bgmetadata = flags & 64 /* INCLUDE_METADATA */ ?
                                    describeMetadataList(sec, metadata) :
                                    null;
                                variablesVal.push(val);
                                break;
                            case 1 /* Method */:
                                if (!includeMethods) {
                                    continue;
                                }
                                var returnType = t.getMethodInfo().getType();
                                val.$BgreturnType = returnType ? returnType.name.toFQNString(true) : '*';
                                val.$Bgmetadata = flags & 64 /* INCLUDE_METADATA */ ?
                                    describeMetadataList(sec, metadata) :
                                    null;
                                val.$Bgname = name;
                                val.$Bguri = ns.reflectedURI;
                                var parametersVal = val.$Bgparameters = sec.createArray([]);
                                var parameters = t.getMethodInfo().parameters;
                                for (var j = 0; j < parameters.length; j++) {
                                    var param = parameters[j];
                                    var paramVal = sec.createObject();
                                    paramVal.$Bgtype = param.type ? param.getType().toFQNString(true) : '*';
                                    paramVal.$Bgoptional = 'value' in param;
                                    parametersVal.push(paramVal);
                                }
                                val.$BgdeclaredBy = className;
                                methodsVal.push(val);
                                break;
                            case 2 /* Getter */:
                            case 3 /* Setter */:
                                if (!(flags & 16 /* INCLUDE_ACCESSORS */) || describingClass) {
                                    continue;
                                }
                                val.$Bgname = name;
                                if (t.kind === 2 /* Getter */) {
                                    var returnType = t.getMethodInfo().getType();
                                    val.$Bgtype = returnType ? returnType.name.toFQNString(true) : '*';
                                    encounteredGetters[name] = val;
                                }
                                else {
                                    var paramType = t.getMethodInfo().parameters[0].getType();
                                    val.$Bgtype = paramType ? paramType.toFQNString(true) : '*';
                                    encounteredSetters[name] = val;
                                }
                                val.$Bgaccess = t.kind === 2 /* Getter */ ? "readonly" : "writeonly";
                                val.$Bgmetadata = flags & 64 /* INCLUDE_METADATA */ ?
                                    describeMetadataList(sec, metadata) :
                                    null;
                                val.$Bguri = ns.reflectedURI;
                                val.$BgdeclaredBy = className;
                                accessorsVal.push(val);
                                break;
                            default:
                                release || assert(false, "Unknown trait type: " + t.kind);
                                break;
                        }
                    }
                }
                // `methods` and `variables` are the only list that are `null`-ed if empty.
                if (!methodsVal || methodsVal.value.length === 0) {
                    obj.$Bgmethods = null;
                }
                if (!variablesVal || variablesVal.value.length === 0) {
                    obj.$Bgvariables = null;
                }
                return obj;
            }
        })(AS = AVMX.AS || (AVMX.AS = {}));
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var AS;
        (function (AS) {
            var assert = Shumway.Debug.assert;
            var flash;
            (function (flash) {
                var utils;
                (function (utils) {
                    /**
                     * TODO: We need a more robust Dictionary implementation that doesn't only give you back
                     * string keys when enumerating.
                     */
                    var Dictionary = (function (_super) {
                        __extends(Dictionary, _super);
                        function Dictionary(weakKeys) {
                            if (weakKeys === void 0) { weakKeys = false; }
                            _super.call(this);
                            this.map = new WeakMap();
                            this.keys = null;
                            this.weakKeys = !!weakKeys;
                            if (!weakKeys) {
                                this.keys = [];
                            }
                            this.primitiveMap = Object.create(null);
                        }
                        Dictionary.makePrimitiveKey = function (key) {
                            if (typeof key === "string" || typeof key === "number") {
                                return key;
                            }
                            release || assert(typeof key === "object" || typeof key === "function", typeof key);
                            return undefined;
                        };
                        Dictionary.prototype.toJSON = function () {
                            return "Dictionary";
                        };
                        Dictionary.prototype.axGetProperty = function (mn) {
                            if (this === this.axClass.dPrototype) {
                                return _super.prototype.axGetProperty.call(this, mn);
                            }
                            var key = Dictionary.makePrimitiveKey(mn.name);
                            if (key !== undefined) {
                                return this.primitiveMap[key];
                            }
                            return this.map.get(Object(mn.name));
                        };
                        Dictionary.prototype.axSetProperty = function (mn, value, bc) {
                            if (this === this.axClass.dPrototype) {
                                _super.prototype.axSetProperty.call(this, mn, value, bc);
                                return;
                            }
                            var key = Dictionary.makePrimitiveKey(mn.name);
                            if (key !== undefined) {
                                this.primitiveMap[key] = value;
                                return;
                            }
                            this.map.set(Object(mn.name), value);
                            if (!this.weakKeys && this.keys.indexOf(mn.name) < 0) {
                                this.keys.push(mn.name);
                            }
                        };
                        // TODO: Not implemented yet.
                        // public axCallProperty(mn: Multiname, args: any []) {
                        //   release || release || notImplemented("axCallProperty");
                        // }
                        Dictionary.prototype.axHasPropertyInternal = function (mn) {
                            if (this === this.axClass.dPrototype) {
                                return _super.prototype.axHasProperty.call(this, mn);
                            }
                            var key = Dictionary.makePrimitiveKey(mn.name);
                            if (key !== undefined) {
                                return key in this.primitiveMap;
                            }
                            return this.map.has(Object(mn.name));
                        };
                        Dictionary.prototype.axDeleteProperty = function (mn) {
                            if (this === this.axClass.dPrototype) {
                                return _super.prototype.axDeleteProperty.call(this, mn);
                            }
                            var key = Dictionary.makePrimitiveKey(mn.name);
                            if (key !== undefined) {
                                delete this.primitiveMap[key];
                            }
                            this.map.delete(Object(mn.name));
                            var i;
                            if (!this.weakKeys && (i = this.keys.indexOf(mn.name)) >= 0) {
                                this.keys.splice(i, 1);
                            }
                            return true;
                        };
                        Dictionary.prototype.axGetPublicProperty = function (nm) {
                            if (this === this.axClass.dPrototype) {
                                return _super.prototype.axGetPublicProperty.call(this, nm);
                            }
                            var key = Dictionary.makePrimitiveKey(nm);
                            if (key !== undefined) {
                                return this.primitiveMap[key];
                            }
                            return this.map.get(Object(nm));
                        };
                        Dictionary.prototype.axGetEnumerableKeys = function () {
                            if (this === this.axClass.dPrototype) {
                                return _super.prototype.axGetEnumerableKeys.call(this);
                            }
                            var primitiveMapKeys = [];
                            for (var k in this.primitiveMap) {
                                primitiveMapKeys.push(k);
                            }
                            if (this.weakKeys) {
                                // TODO implement workaround for flashx.textLayout.external.WeakRef
                                return primitiveMapKeys; // assuming all weak ref objects are gone
                            }
                            if (this.keys) {
                                return primitiveMapKeys.concat(this.keys);
                            }
                            return primitiveMapKeys.slice();
                        };
                        Dictionary.classInitializer = function () {
                            var proto = this.dPrototype;
                            var asProto = Dictionary.prototype;
                            AS.addPrototypeFunctionAlias(proto, '$BgtoJSON', asProto.toJSON);
                        };
                        return Dictionary;
                    })(AS.ASObject);
                    utils.Dictionary = Dictionary;
                })(utils = flash.utils || (flash.utils = {}));
            })(flash = AS.flash || (AS.flash = {}));
        })(AS = AVMX.AS || (AVMX.AS = {}));
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var AS;
        (function (AS) {
            var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
            var flash;
            (function (flash) {
                var utils;
                (function (utils) {
                    var proxyNamespace = AVMX.internNamespace(0 /* Public */, "http://www.adobe.com/2006/actionscript/flash/proxy");
                    var proxyPrefix = '$' + proxyNamespace.mangledName;
                    /**
                     * The Proxy class lets you override the default behavior of ActionScript operations
                     * (such as retrieving and modifying properties) on an object.
                     */
                    var ASProxy = (function (_super) {
                        __extends(ASProxy, _super);
                        function ASProxy() {
                            _super.apply(this, arguments);
                        }
                        ASProxy.classInitializer = function () {
                            var proto = this.dPrototype;
                            var asProto = ASProxy.prototype;
                            defineNonEnumerableProperty(proto, proxyPrefix + 'getProperty', asProto.native_getProperty);
                            defineNonEnumerableProperty(proto, proxyPrefix + 'setProperty', asProto.native_setProperty);
                            defineNonEnumerableProperty(proto, proxyPrefix + 'callProperty', asProto.native_callProperty);
                            defineNonEnumerableProperty(proto, proxyPrefix + 'hasProperty', asProto.native_hasProperty);
                            defineNonEnumerableProperty(proto, proxyPrefix + 'deleteProperty', asProto.native_deleteProperty);
                            defineNonEnumerableProperty(proto, proxyPrefix + 'getDescendants', asProto.native_getDescendants);
                            defineNonEnumerableProperty(proto, proxyPrefix + 'nextNameIndex', asProto.native_nextNameIndex);
                            defineNonEnumerableProperty(proto, proxyPrefix + 'nextName', asProto.native_nextName);
                            defineNonEnumerableProperty(proto, proxyPrefix + 'nextValue', asProto.native_nextValue);
                        };
                        ASProxy.prototype.native_getProperty = function () {
                            this.sec.throwError("flash.errors.IllegalOperationError", AVMX.Errors.ProxyGetPropertyError);
                        };
                        ASProxy.prototype.native_setProperty = function () {
                            this.sec.throwError("flash.errors.IllegalOperationError", AVMX.Errors.ProxySetPropertyError);
                        };
                        ASProxy.prototype.native_callProperty = function () {
                            this.sec.throwError("flash.errors.IllegalOperationError", AVMX.Errors.ProxyCallPropertyError);
                        };
                        ASProxy.prototype.native_hasProperty = function () {
                            this.sec.throwError("flash.errors.IllegalOperationError", AVMX.Errors.ProxyHasPropertyError);
                        };
                        ASProxy.prototype.native_deleteProperty = function () {
                            this.sec.throwError("flash.errors.IllegalOperationError", AVMX.Errors.ProxyDeletePropertyError);
                        };
                        ASProxy.prototype.native_getDescendants = function () {
                            this.sec.throwError("flash.errors.IllegalOperationError", AVMX.Errors.ProxyGetDescendantsError);
                        };
                        ASProxy.prototype.native_nextNameIndex = function () {
                            // Enumeration traverses the prototype chain. For proxies, this causes problems
                            // because a Proxy-extending class has the MOP override for `axNextNameIndex`, but can't
                            // have the `nextNameIndex` hook defined and thus hits this default hook. In that case,
                            // we'd incorrectly throw an error instead of just returning null if we didn't
                            // special-case here.
                            if (this === this.axClass.dPrototype) {
                                return;
                            }
                            this.sec.throwError("flash.errors.IllegalOperationError", AVMX.Errors.ProxyNextNameIndexError);
                        };
                        ASProxy.prototype.native_nextName = function () {
                            this.sec.throwError("flash.errors.IllegalOperationError", AVMX.Errors.ProxyNextNameError);
                        };
                        ASProxy.prototype.native_nextValue = function () {
                            this.sec.throwError("flash.errors.IllegalOperationError", AVMX.Errors.ProxyNextValueError);
                        };
                        ASProxy.prototype.axGetProperty = function (mn) {
                            var value;
                            var trait = typeof mn.name === 'string' ? this.traits.getTrait(mn.namespaces, mn.name) : null;
                            if (trait) {
                                var name = trait.name.getMangledName();
                                value = this[name];
                                if (typeof value === 'function') {
                                    return this.axGetMethod(name);
                                }
                            }
                            else {
                                value = this[proxyPrefix + 'getProperty'](this.sec.AXQName.FromMultiname(mn));
                            }
                            return value;
                        };
                        ASProxy.prototype.axGetNumericProperty = function (name) {
                            return this[proxyPrefix + 'getProperty']((+name) + '');
                        };
                        ASProxy.prototype.axSetNumericProperty = function (name, value) {
                            this[proxyPrefix + 'setProperty']((+name) + '', value);
                        };
                        ASProxy.prototype.axSetProperty = function (mn, value, bc) {
                            var trait = typeof mn.name === 'string' ? this.traits.getTrait(mn.namespaces, mn.name) : null;
                            if (trait) {
                                _super.prototype.axSetProperty.call(this, mn, value, bc);
                                return;
                            }
                            this[proxyPrefix + 'setProperty'](this.sec.AXQName.FromMultiname(mn), value);
                        };
                        ASProxy.prototype.axCallProperty = function (mn, args, isLex) {
                            var trait = typeof mn.name === 'string' ? this.traits.getTrait(mn.namespaces, mn.name) : null;
                            if (trait) {
                                return _super.prototype.axCallProperty.call(this, mn, args, isLex);
                            }
                            var callArgs = [this.sec.AXQName.FromMultiname(mn)].concat(args);
                            return this[proxyPrefix + 'callProperty'].apply(this, callArgs);
                        };
                        ASProxy.prototype.axHasProperty = function (mn) {
                            return this.axHasOwnProperty(mn);
                        };
                        ASProxy.prototype.axHasPublicProperty = function (nm) {
                            rn.name = nm;
                            if (this.axHasPropertyInternal(rn)) {
                                return true;
                            }
                            return this[proxyPrefix + 'hasProperty'](nm);
                        };
                        ASProxy.prototype.axHasOwnProperty = function (mn) {
                            var trait = typeof mn.name === 'string' ? this.traits.getTrait(mn.namespaces, mn.name) : null;
                            if (trait) {
                                return true;
                            }
                            return this[proxyPrefix + 'hasProperty'](this.sec.AXQName.FromMultiname(mn));
                        };
                        ASProxy.prototype.axDeleteProperty = function (mn) {
                            var trait = typeof mn.name === 'string' ? this.traits.getTrait(mn.namespaces, mn.name) : null;
                            if (trait) {
                                return delete this[trait.name.getMangledName()];
                            }
                            return this[proxyPrefix + 'deleteProperty'](this.sec.AXQName.FromMultiname(mn));
                        };
                        ASProxy.prototype.axNextName = function (index) {
                            return this[proxyPrefix + 'nextName'](index);
                        };
                        ASProxy.prototype.axNextValue = function (index) {
                            return this[proxyPrefix + 'nextValue'](index);
                        };
                        ASProxy.prototype.axNextNameIndex = function (index) {
                            return this[proxyPrefix + 'nextNameIndex'](index);
                        };
                        return ASProxy;
                    })(AS.ASObject);
                    utils.ASProxy = ASProxy;
                })(utils = flash.utils || (flash.utils = {}));
            })(flash = AS.flash || (AS.flash = {}));
            var rn = new AVMX.Multiname(null, 0, 17 /* RTQNameL */, [], null);
        })(AS = AVMX.AS || (AVMX.AS = {}));
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var AS;
        (function (AS) {
            var ASDate = (function (_super) {
                __extends(ASDate, _super);
                function ASDate(yearOrTimevalue, month, date, hour, minute, second, millisecond) {
                    if (date === void 0) { date = 1; }
                    if (hour === void 0) { hour = 0; }
                    if (minute === void 0) { minute = 0; }
                    if (second === void 0) { second = 0; }
                    if (millisecond === void 0) { millisecond = 0; }
                    _super.call(this);
                    switch (arguments.length) {
                        case 0:
                            this.value = new Date();
                            break;
                        case 1:
                            this.value = new Date(yearOrTimevalue);
                            break;
                        case 2:
                            this.value = new Date(yearOrTimevalue, month);
                            break;
                        case 3:
                            this.value = new Date(yearOrTimevalue, month, date);
                            break;
                        case 4:
                            this.value = new Date(yearOrTimevalue, month, date, hour);
                            break;
                        case 5:
                            this.value = new Date(yearOrTimevalue, month, date, hour, minute);
                            break;
                        case 6:
                            this.value = new Date(yearOrTimevalue, month, date, hour, minute, second);
                            break;
                        default:
                            this.value = new Date(yearOrTimevalue, month, date, hour, minute, second, millisecond);
                            break;
                    }
                }
                ASDate.parse = function (date) {
                    return Date.parse(date);
                };
                ASDate.UTC = function (year, month, date, hour, minute, second, millisecond) {
                    if (date === void 0) { date = 1; }
                    if (hour === void 0) { hour = 0; }
                    if (minute === void 0) { minute = 0; }
                    if (second === void 0) { second = 0; }
                    if (millisecond === void 0) { millisecond = 0; }
                    return Date.parse.apply(null, arguments);
                };
                ASDate.axCoerce = function (value) {
                    return this.axConstruct([value]);
                };
                ASDate.prototype.toString = function () {
                    if (!(this.value instanceof Date)) {
                        return 'Invalid Date';
                    }
                    // JS formats dates differently, so a little surgery is required here:
                    // We need to move the year to the end, get rid of the timezone name, and remove leading 0
                    // from the day.
                    var dateStr = this.value.toString();
                    var parts = dateStr.split(' ');
                    // Detect invalid dates. Not 100% sure all JS engines always print 'Invalid Date' here,
                    // so we just check how many parts the resulting string has, with some margin for error.
                    if (parts.length < 4) {
                        return 'Invalid Date';
                    }
                    parts.length = 6; // Get rid of the timezone, which might contain spaces.
                    parts.push(parts.splice(3, 1)[0]); // Move Year to the end.
                    if (parts[2][0] === '0') {
                        parts[2] = parts[2][1];
                    }
                    return parts.join(' ');
                };
                ASDate.prototype.toDateString = function () {
                    if (!(this.value instanceof Date)) {
                        return 'Invalid Date';
                    }
                    var dateStr = this.value.toDateString();
                    var parts = dateStr.split(' ');
                    // Detect invalid dates. Not 100% sure all JS engines always print 'Invalid Date' here,
                    // so we just check how many parts the resulting string has, with some margin for error.
                    if (parts.length < 4) {
                        return 'Invalid Date';
                    }
                    if (parts[2][0] === '0') {
                        parts[2] = parts[2][1];
                    }
                    return parts.join(' ');
                };
                ASDate.prototype.toJSON = function () { return !(this.value instanceof Date) ? 'Invalid Date' : this.value.toString(); };
                ASDate.prototype.valueOf = function () { return !(this.value instanceof Date) ? NaN : this.value.valueOf(); };
                ASDate.prototype.setTime = function (value) {
                    if (value === void 0) { value = 0; }
                    return !(this.value instanceof Date) ? NaN : this.value.setTime(value);
                };
                ASDate.prototype.toTimeString = function () { return !(this.value instanceof Date) ? 'Invalid Date' : this.value.toTimeString(); };
                ASDate.prototype.toLocaleString = function () { return !(this.value instanceof Date) ? 'Invalid Date' : this.value.toLocaleString(); };
                ASDate.prototype.toLocaleDateString = function () { return !(this.value instanceof Date) ? 'Invalid Date' : this.value.toLocaleDateString(); };
                ASDate.prototype.toLocaleTimeString = function () { return !(this.value instanceof Date) ? 'Invalid Date' : this.value.toLocaleTimeString(); };
                ASDate.prototype.toUTCString = function () { return !(this.value instanceof Date) ? 'Invalid Date' : this.value.toUTCString(); };
                ASDate.prototype.getUTCFullYear = function () { return !(this.value instanceof Date) ? NaN : this.value.getUTCFullYear(); };
                ASDate.prototype.getUTCMonth = function () { return !(this.value instanceof Date) ? NaN : this.value.getUTCMonth(); };
                ASDate.prototype.getUTCDate = function () { return !(this.value instanceof Date) ? NaN : this.value.getUTCDate(); };
                ASDate.prototype.getUTCDay = function () { return !(this.value instanceof Date) ? NaN : this.value.getUTCDay(); };
                ASDate.prototype.getUTCHours = function () { return !(this.value instanceof Date) ? NaN : this.value.getUTCHours(); };
                ASDate.prototype.getUTCMinutes = function () { return !(this.value instanceof Date) ? NaN : this.value.getUTCMinutes(); };
                ASDate.prototype.getUTCSeconds = function () { return !(this.value instanceof Date) ? NaN : this.value.getUTCSeconds(); };
                ASDate.prototype.getUTCMilliseconds = function () { return !(this.value instanceof Date) ? NaN : this.value.getUTCMilliseconds(); };
                ASDate.prototype.getFullYear = function () { return !(this.value instanceof Date) ? NaN : this.value.getFullYear(); };
                ASDate.prototype.getMonth = function () { return !(this.value instanceof Date) ? NaN : this.value.getMonth(); };
                ASDate.prototype.getDate = function () { return !(this.value instanceof Date) ? NaN : this.value.getDate(); };
                ASDate.prototype.getDay = function () { return !(this.value instanceof Date) ? NaN : this.value.getDay(); };
                ASDate.prototype.getHours = function () { return !(this.value instanceof Date) ? NaN : this.value.getHours(); };
                ASDate.prototype.getMinutes = function () { return !(this.value instanceof Date) ? NaN : this.value.getMinutes(); };
                ASDate.prototype.getSeconds = function () { return !(this.value instanceof Date) ? NaN : this.value.getSeconds(); };
                ASDate.prototype.getMilliseconds = function () { return !(this.value instanceof Date) ? NaN : this.value.getMilliseconds(); };
                ASDate.prototype.getTimezoneOffset = function () { return !(this.value instanceof Date) ? NaN : this.value.getTimezoneOffset(); };
                ASDate.prototype.getTime = function () { return !(this.value instanceof Date) ? NaN : this.value.getTime(); };
                ASDate.prototype.setFullYear = function (year, month, date) {
                    return !(this.value instanceof Date) ? NaN : this.value.setFullYear.apply(this.value, arguments);
                };
                ASDate.prototype.setMonth = function (month, date) {
                    return !(this.value instanceof Date) ? NaN : this.value.setMonth.apply(this.value, arguments);
                };
                ASDate.prototype.setDate = function (date) {
                    return !(this.value instanceof Date) ? NaN : this.value.setDate.apply(this.value, arguments);
                };
                ASDate.prototype.setHours = function (hour, minutes, seconds, milliseconds) {
                    return !(this.value instanceof Date) ? NaN : this.value.setHours.apply(this.value, arguments);
                };
                ASDate.prototype.setMinutes = function (minutes, seconds, milliseconds) {
                    return !(this.value instanceof Date) ? NaN : this.value.setMinutes.apply(this.value, arguments);
                };
                ASDate.prototype.setSeconds = function (seconds, milliseconds) {
                    return !(this.value instanceof Date) ? NaN : this.value.setSeconds.apply(this.value, arguments);
                };
                ASDate.prototype.setMilliseconds = function (milliseconds) {
                    return !(this.value instanceof Date) ? NaN : this.value.setMilliseconds.apply(this.value, arguments);
                };
                ASDate.prototype.setUTCFullYear = function (year, month, date) {
                    return !(this.value instanceof Date) ? NaN : this.value.setUTCFullYear.apply(this.value, arguments);
                };
                ASDate.prototype.setUTCMonth = function (month, date) {
                    return !(this.value instanceof Date) ? NaN : this.value.setUTCMonth.apply(this.value, arguments);
                };
                ASDate.prototype.setUTCDate = function (date) {
                    return !(this.value instanceof Date) ? NaN : this.value.setUTCDate.apply(this.value, arguments);
                };
                ASDate.prototype.setUTCHours = function (hour, minutes, seconds, milliseconds) {
                    return !(this.value instanceof Date) ? NaN : this.value.setUTCHours.apply(this.value, arguments);
                };
                ASDate.prototype.setUTCMinutes = function (minutes, seconds, milliseconds) {
                    return !(this.value instanceof Date) ? NaN : this.value.setUTCMinutes.apply(this.value, arguments);
                };
                ASDate.prototype.setUTCSeconds = function (seconds, milliseconds) {
                    return !(this.value instanceof Date) ? NaN : this.value.setUTCSeconds.apply(this.value, arguments);
                };
                ASDate.prototype.setUTCMilliseconds = function (milliseconds) {
                    return !(this.value instanceof Date) ? NaN : this.value.setUTCMilliseconds.apply(this.value, arguments);
                };
                Object.defineProperty(ASDate.prototype, "fullYear", {
                    get: function () {
                        return this.value.getFullYear();
                    },
                    set: function (value) {
                        this.value.setFullYear(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "month", {
                    get: function () {
                        return this.value.getMonth();
                    },
                    set: function (value) {
                        this.value.setMonth(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "date", {
                    get: function () {
                        return this.value.getDate();
                    },
                    set: function (value) {
                        this.value.setDate(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "hours", {
                    get: function () {
                        return this.value.getHours();
                    },
                    set: function (value) {
                        this.value.setHours(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "minutes", {
                    get: function () {
                        return this.value.getMinutes();
                    },
                    set: function (value) {
                        this.value.setMinutes(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "seconds", {
                    get: function () {
                        return this.value.getSeconds();
                    },
                    set: function (value) {
                        this.value.setSeconds(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "milliseconds", {
                    get: function () {
                        return this.value.getMilliseconds();
                    },
                    set: function (value) {
                        this.value.setMilliseconds(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "fullYearUTC", {
                    get: function () {
                        return this.value.getUTCFullYear();
                    },
                    set: function (value) {
                        this.value.setUTCFullYear(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "monthUTC", {
                    get: function () {
                        return this.value.getUTCMonth();
                    },
                    set: function (value) {
                        this.value.setUTCMonth(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "dateUTC", {
                    get: function () {
                        return this.value.getUTCDate();
                    },
                    set: function (value) {
                        this.value.setUTCDate(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "hoursUTC", {
                    get: function () {
                        return this.value.getUTCHours();
                    },
                    set: function (value) {
                        this.value.setUTCHours(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "minutesUTC", {
                    get: function () {
                        return this.value.getUTCMinutes();
                    },
                    set: function (value) {
                        this.value.setUTCMinutes(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "secondsUTC", {
                    get: function () {
                        return this.value.getUTCSeconds();
                    },
                    set: function (value) {
                        this.value.setUTCSeconds(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "millisecondsUTC", {
                    get: function () {
                        return this.value.getUTCMilliseconds();
                    },
                    set: function (value) {
                        this.value.setUTCMilliseconds(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "time", {
                    get: function () {
                        return this.value.getTime();
                    },
                    set: function (value) {
                        this.value.setTime(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "timezoneOffset", {
                    get: function () {
                        return this.value.getTimezoneOffset();
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "day", {
                    get: function () {
                        return this.value.getDay();
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(ASDate.prototype, "dayUTC", {
                    get: function () {
                        return this.value.getUTCDay();
                    },
                    enumerable: true,
                    configurable: true
                });
                ASDate.classInitializer = function () {
                    var proto = this.dPrototype;
                    var asProto = ASDate.prototype;
                    AS.addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
                    AS.addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.toString);
                    AS.addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);
                    AS.addPrototypeFunctionAlias(proto, '$BgtoDateString', asProto.toDateString);
                    AS.addPrototypeFunctionAlias(proto, '$BgtoTimeString', asProto.toTimeString);
                    AS.addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.toLocaleString);
                    AS.addPrototypeFunctionAlias(proto, '$BgtoLocaleDateString', asProto.toLocaleDateString);
                    AS.addPrototypeFunctionAlias(proto, '$BgtoLocaleTimeString', asProto.toLocaleTimeString);
                    AS.addPrototypeFunctionAlias(proto, '$BgtoUTCString', asProto.toUTCString);
                    // NB: The default AS implementation of |toJSON| is not ES5-compliant, but
                    // the native JS one obviously is.
                    AS.addPrototypeFunctionAlias(proto, '$BgtoJSON', asProto.toJSON);
                    AS.addPrototypeFunctionAlias(proto, '$BggetUTCFullYear', asProto.getUTCFullYear);
                    AS.addPrototypeFunctionAlias(proto, '$BggetUTCMonth', asProto.getUTCMonth);
                    AS.addPrototypeFunctionAlias(proto, '$BggetUTCDate', asProto.getUTCDate);
                    AS.addPrototypeFunctionAlias(proto, '$BggetUTCDay', asProto.getUTCDay);
                    AS.addPrototypeFunctionAlias(proto, '$BggetUTCHours', asProto.getUTCHours);
                    AS.addPrototypeFunctionAlias(proto, '$BggetUTCMinutes', asProto.getUTCMinutes);
                    AS.addPrototypeFunctionAlias(proto, '$BggetUTCSeconds', asProto.getUTCSeconds);
                    AS.addPrototypeFunctionAlias(proto, '$BggetUTCMilliseconds', asProto.getUTCMilliseconds);
                    AS.addPrototypeFunctionAlias(proto, '$BggetFullYear', asProto.getFullYear);
                    AS.addPrototypeFunctionAlias(proto, '$BggetMonth', asProto.getMonth);
                    AS.addPrototypeFunctionAlias(proto, '$BggetDate', asProto.getDate);
                    AS.addPrototypeFunctionAlias(proto, '$BggetDay', asProto.getDay);
                    AS.addPrototypeFunctionAlias(proto, '$BggetHours', asProto.getHours);
                    AS.addPrototypeFunctionAlias(proto, '$BggetMinutes', asProto.getMinutes);
                    AS.addPrototypeFunctionAlias(proto, '$BggetSeconds', asProto.getSeconds);
                    AS.addPrototypeFunctionAlias(proto, '$BggetMilliseconds', asProto.getMilliseconds);
                    AS.addPrototypeFunctionAlias(proto, '$BggetTimezoneOffset', asProto.getTimezoneOffset);
                    AS.addPrototypeFunctionAlias(proto, '$BggetTime', asProto.getTime);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetFullYear', asProto.setFullYear);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetMonth', asProto.setMonth);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetDate', asProto.setDate);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetHours', proto.setHours);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetMinutes', asProto.setMinutes);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetSeconds', asProto.setSeconds);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetMilliseconds', asProto.setMilliseconds);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetUTCFullYear', asProto.setUTCFullYear);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetUTCMonth', asProto.setUTCMonth);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetUTCDate', asProto.setUTCDate);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetUTCHours', asProto.setUTCHours);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetUTCMinutes', asProto.setUTCMinutes);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetUTCSeconds', asProto.setUTCSeconds);
                    AS.addPrototypeFunctionAlias(proto, '$BgsetUTCMilliseconds', asProto.setUTCMilliseconds);
                };
                return ASDate;
            })(AS.ASObject);
            AS.ASDate = ASDate;
        })(AS = AVMX.AS || (AVMX.AS = {}));
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var AS;
        (function (AS) {
            var notImplemented = Shumway.Debug.notImplemented;
            var unexpected = Shumway.Debug.unexpected;
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var assert = Shumway.Debug.assert;
            var flash;
            (function (flash) {
                var net;
                (function (net) {
                    (function (AMFEncoding) {
                        AMFEncoding[AMFEncoding["AMF0"] = 0] = "AMF0";
                        AMFEncoding[AMFEncoding["AMF3"] = 3] = "AMF3";
                        AMFEncoding[AMFEncoding["DEFAULT"] = 3] = "DEFAULT";
                    })(net.AMFEncoding || (net.AMFEncoding = {}));
                    var AMFEncoding = net.AMFEncoding;
                    var ObjectEncoding = (function (_super) {
                        __extends(ObjectEncoding, _super);
                        function ObjectEncoding() {
                            _super.apply(this, arguments);
                        }
                        Object.defineProperty(ObjectEncoding, "dynamicPropertyWriter", {
                            get: function () {
                                release || release || notImplemented("public flash.net.ObjectEncoding::get dynamicPropertyWriter");
                                return null;
                            },
                            set: function (value /* flash.net.IDynamicPropertyWriter */) {
                                release || release || notImplemented("public flash.net.ObjectEncoding::set dynamicPropertyWriter");
                            },
                            enumerable: true,
                            configurable: true
                        });
                        ObjectEncoding.AMF0 = AMFEncoding.AMF0;
                        ObjectEncoding.AMF3 = AMFEncoding.AMF3;
                        ObjectEncoding.DEFAULT = AMFEncoding.DEFAULT;
                        return ObjectEncoding;
                    })(AS.ASObject);
                    net.ObjectEncoding = ObjectEncoding;
                })(net = flash.net || (flash.net = {}));
            })(flash = AS.flash || (AS.flash = {}));
            var flash;
            (function (flash) {
                var utils;
                (function (utils) {
                    var ByteArray = (function (_super) {
                        __extends(ByteArray, _super);
                        function ByteArray(source) {
                            _super.call(this);
                            if (this._symbol) {
                                source = this._symbol;
                            }
                            var buffer;
                            var length = 0;
                            if (source) {
                                if (source instanceof ArrayBuffer) {
                                    buffer = source.slice();
                                }
                                else if (Array.isArray(source)) {
                                    buffer = new Uint8Array(source).buffer;
                                }
                                else if ('buffer' in source) {
                                    if (source.buffer instanceof ArrayBuffer) {
                                        buffer = new Uint8Array(source.buffer).buffer;
                                    }
                                    else if (source.buffer instanceof Uint8Array) {
                                        var begin = source.buffer.byteOffset;
                                        buffer = source.buffer.buffer.slice(begin, begin + source.buffer.length);
                                    }
                                    else {
                                        release || assert(source.buffer instanceof ArrayBuffer);
                                        buffer = source.buffer.slice();
                                    }
                                }
                                else {
                                    Shumway.Debug.unexpected("Source type.");
                                }
                                length = buffer.byteLength;
                            }
                            else {
                                buffer = new ArrayBuffer(ByteArray.INITIAL_SIZE);
                            }
                            this._buffer = buffer;
                            this._length = length;
                            this._position = 0;
                            this._resetViews();
                            this._objectEncoding = ByteArray.defaultObjectEncoding;
                            this._littleEndian = false; // AS3 is bigEndian by default.
                            this._bitBuffer = 0;
                            this._bitLength = 0;
                        }
                        ByteArray.classInitializer = function () {
                            var proto = DataBuffer.prototype;
                            Shumway.ObjectUtilities.defineNonEnumerableProperty(proto, '$BgtoJSON', proto.toJSON);
                        };
                        Object.defineProperty(ByteArray, "defaultObjectEncoding", {
                            get: function () {
                                return this._defaultObjectEncoding;
                            },
                            set: function (version /*uint*/) {
                                version = version >>> 0;
                                this._defaultObjectEncoding = version;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        ByteArray.prototype.toJSON = function () {
                            return "ByteArray";
                        };
                        ByteArray.prototype.readObject = function () {
                            switch (this._objectEncoding) {
                                case flash.net.ObjectEncoding.AMF0:
                                    return AVMX.AMF0.read(this);
                                case flash.net.ObjectEncoding.AMF3:
                                    return AVMX.AMF3.read(this);
                                default:
                                    unexpected("Object Encoding");
                            }
                        };
                        ByteArray.prototype.writeObject = function (object) {
                            switch (this._objectEncoding) {
                                case flash.net.ObjectEncoding.AMF0:
                                    return AVMX.AMF0.write(this, object);
                                case flash.net.ObjectEncoding.AMF3:
                                    return AVMX.AMF3.write(this, object);
                                default:
                                    unexpected("Object Encoding");
                            }
                        };
                        ByteArray.prototype.axGetPublicProperty = function (nm) {
                            if (typeof nm === 'number' || Shumway.isNumeric(nm = AVMX.axCoerceName(nm))) {
                                return this.axGetNumericProperty(nm);
                            }
                            return this['$Bg' + nm];
                        };
                        ByteArray.prototype.axGetNumericProperty = function (nm) {
                            release || assert(typeof nm === 'number');
                            return this.getValue(nm);
                        };
                        ByteArray.prototype.axSetPublicProperty = function (nm, value) {
                            release || AVMX.checkValue(value);
                            if (typeof nm === 'number' || Shumway.isNumeric(nm = AVMX.axCoerceName(nm))) {
                                this.axSetNumericProperty(nm, value);
                                return;
                            }
                            this['$Bg' + nm] = value;
                        };
                        ByteArray.prototype.axSetNumericProperty = function (nm, value) {
                            release || assert(typeof nm === 'number');
                            this.setValue(nm, value);
                        };
                        ByteArray.prototype.axGetProperty = function (mn) {
                            var name = mn.name;
                            if (typeof name === 'number' || Shumway.isNumeric(name = AVMX.axCoerceName(name))) {
                                release || assert(mn.isRuntimeName());
                                return this.getValue(+name);
                            }
                            return _super.prototype.axGetProperty.call(this, mn);
                        };
                        ByteArray.prototype.axSetProperty = function (mn, value, bc) {
                            release || AVMX.checkValue(value);
                            var name = mn.name;
                            if (typeof name === 'number' || Shumway.isNumeric(name = AVMX.axCoerceName(name))) {
                                release || assert(mn.isRuntimeName());
                                this.setValue(+name, value);
                                return;
                            }
                            _super.prototype.axSetProperty.call(this, mn, value, bc);
                        };
                        ByteArray.classNatives = [DataBuffer];
                        ByteArray.instanceNatives = [DataBuffer.prototype];
                        /* The initial size of the backing, in bytes. Doubled every OOM. */
                        ByteArray.INITIAL_SIZE = 128;
                        ByteArray._defaultObjectEncoding = flash.net.ObjectEncoding.DEFAULT;
                        return ByteArray;
                    })(AS.ASObject);
                    utils.ByteArray = ByteArray;
                })(utils = flash.utils || (flash.utils = {}));
            })(flash = AS.flash || (AS.flash = {}));
        })(AS = AVMX.AS || (AVMX.AS = {}));
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var AS;
        (function (AS) {
            var somewhatImplemented = Shumway.Debug.somewhatImplemented;
            var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
            var flash;
            (function (flash) {
                var system;
                (function (system) {
                    var IME = (function (_super) {
                        __extends(IME, _super);
                        function IME() {
                            _super.call(this);
                        }
                        Object.defineProperty(IME, "enabled", {
                            get: function () {
                                release || release || somewhatImplemented("public flash.system.IME::static get enabled");
                                return false;
                            },
                            set: function (enabled) {
                                release || release || somewhatImplemented("public flash.system.IME::static set enabled");
                                enabled = !!enabled;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        Object.defineProperty(IME, "conversionMode", {
                            get: function () {
                                release || somewhatImplemented("public flash.system.IME::static get conversionMode");
                                return 'UNKNOWN';
                            },
                            set: function (mode) {
                                mode = AVMX.axCoerceString(mode);
                                release || somewhatImplemented("public flash.system.IME::static set conversionMode");
                            },
                            enumerable: true,
                            configurable: true
                        });
                        IME.setCompositionString = function (composition) {
                            composition = AVMX.axCoerceString(composition);
                            release || somewhatImplemented("public flash.system.IME::static setCompositionString");
                        };
                        IME.doConversion = function () {
                            release || somewhatImplemented("public flash.system.IME::static doConversion");
                        };
                        IME.compositionSelectionChanged = function (start /*int*/, end /*int*/) {
                            start = start | 0;
                            end = end | 0;
                            release || somewhatImplemented("public flash.system.IME::static compositionSelectionChanged");
                        };
                        IME.compositionAbandoned = function () {
                            release || somewhatImplemented("public flash.system.IME::static compositionAbandoned");
                        };
                        Object.defineProperty(IME, "isSupported", {
                            get: function () {
                                release || somewhatImplemented("public flash.system.IME::static get isSupported");
                                return false;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        return IME;
                    })(AS.ASObject);
                    system.IME = IME;
                    var System = (function (_super) {
                        __extends(System, _super);
                        function System() {
                            _super.apply(this, arguments);
                        }
                        System.classInitializer = function () {
                            defineNonEnumerableProperty(this, '$Bgargv', this.sec.createArray([]));
                        };
                        Object.defineProperty(System, "ime", {
                            get: function () {
                                release || somewhatImplemented("public flash.system.System::get ime");
                                return null;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        System.setClipboard = function (string) {
                            string = AVMX.axCoerceString(string);
                            if (Shumway.ClipboardService.instance === null) {
                                Shumway.Debug.warning('setClipboard is only available in the Firefox extension');
                                return;
                            }
                            Shumway.ClipboardService.instance.setClipboard(string);
                        };
                        Object.defineProperty(System, "totalMemoryNumber", {
                            get: function () {
                                release || somewhatImplemented("public flash.system.System::get totalMemoryNumber");
                                return 1024 * 1024 * 2;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        Object.defineProperty(System, "freeMemory", {
                            get: function () {
                                release || somewhatImplemented("public flash.system.System::get freeMemory");
                                return 1024 * 1024;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        Object.defineProperty(System, "privateMemory", {
                            get: function () {
                                release || somewhatImplemented("public flash.system.System::get privateMemory");
                                return 1024 * 1024;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        Object.defineProperty(System, "useCodePage", {
                            get: function () {
                                return this._useCodePage;
                            },
                            set: function (value) {
                                release || somewhatImplemented("public flash.system.System::set useCodePage");
                                this._useCodePage = !!value;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        Object.defineProperty(System, "vmVersion", {
                            get: function () {
                                return "1.0 Shumway - Mozilla Research";
                            },
                            enumerable: true,
                            configurable: true
                        });
                        System.pause = function () {
                            // Debugging-only function we can just ignore.
                        };
                        System.resume = function () {
                            // Debugging-only function we can just ignore.
                        };
                        System.exit = function (code /*uint*/) {
                            // Debugging-only function we can just ignore.
                        };
                        System.gc = function () {
                            // Debugging-only function we can just ignore.
                        };
                        System.pauseForGCIfCollectionImminent = function (imminence) {
                            if (imminence === void 0) { imminence = 0.75; }
                            // Not gonna happen, probably ever.
                        };
                        System.disposeXML = function (node) {
                            // We have a cycle collector, so we can ignore this. \o/
                        };
                        Object.defineProperty(System, "swfVersion", {
                            get: function () {
                                return 19;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        Object.defineProperty(System, "apiVersion", {
                            get: function () {
                                return 26;
                            },
                            enumerable: true,
                            configurable: true
                        });
                        System.getArgv = function () {
                            return [];
                        };
                        System.getRunmode = function () {
                            return "mixed";
                        };
                        System._useCodePage = false;
                        return System;
                    })(AS.ASObject);
                    system.System = System;
                    system.OriginalSystem = System;
                })(system = flash.system || (flash.system = {}));
            })(flash = AS.flash || (AS.flash = {}));
        })(AS = AVMX.AS || (AVMX.AS = {}));
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
// Do this here temporarily until we find a nicer place.
Shumway.AVMX.AS.initializeBuiltins();
/*
 * Copyright 2014 Mozilla Foundation
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
/**
 * This file implements the AMF0 and AMF3 serialization protocols secified in:
 * http://wwwimages.adobe.com/www.adobe.com/content/dam/Adobe/en/devnet/amf/pdf/amf-file-format-spec.pdf
 */
var Shumway;
(function (Shumway) {
    var AVMX;
    (function (AVMX) {
        var assert = Shumway.Debug.assert;
        var AMF3ReferenceTables = (function () {
            function AMF3ReferenceTables() {
                this.strings = [];
                this.objects = [];
                this.traits = [];
                /**
                 * Trait names are kept in sync with |traits| and are used to optimize fetching public trait names.
                 */
                this.traitNames = [];
            }
            return AMF3ReferenceTables;
        })();
        var ClassAliases = (function () {
            function ClassAliases() {
                this._classMap = new WeakMap();
                this._nameMap = Object.create(null);
            }
            ClassAliases.prototype.getAliasByClass = function (axClass) {
                return this._classMap.get(axClass);
            };
            ClassAliases.prototype.getClassByAlias = function (alias) {
                return this._nameMap[alias];
            };
            ClassAliases.prototype.registerClassAlias = function (alias, axClass) {
                this._classMap.set(axClass, alias);
                release || assert(!this._nameMap[alias] || (this._nameMap[alias] === axClass));
                this._nameMap[alias] = axClass;
            };
            return ClassAliases;
        })();
        AVMX.ClassAliases = ClassAliases;
        function writeString(ba, s) {
            if (s.length > 0xFFFF) {
                throw "AMF short string exceeded";
            }
            if (!s.length) {
                ba.writeByte(0x00);
                ba.writeByte(0x00);
                return;
            }
            var bytes = Shumway.StringUtilities.utf8decode(s);
            ba.writeByte((bytes.length >> 8) & 255);
            ba.writeByte(bytes.length & 255);
            for (var i = 0; i < bytes.length; i++) {
                ba.writeByte(bytes[i]);
            }
        }
        function readString(ba) {
            var byteLength = (ba.readByte() << 8) | ba.readByte();
            if (!byteLength) {
                return "";
            }
            var buffer = new Uint8Array(byteLength);
            for (var i = 0; i < byteLength; i++) {
                buffer[i] = ba.readByte();
            }
            return Shumway.StringUtilities.utf8encode(buffer);
        }
        function writeDouble(ba, value) {
            var buffer = new ArrayBuffer(8);
            var view = new DataView(buffer);
            view.setFloat64(0, value, false);
            for (var i = 0; i < buffer.byteLength; i++) {
                ba.writeByte(view.getUint8(i));
            }
        }
        function readDouble(ba) {
            var buffer = new ArrayBuffer(8);
            var view = new DataView(buffer);
            for (var i = 0; i < buffer.byteLength; i++) {
                view.setUint8(i, ba.readByte());
            }
            return view.getFloat64(0, false);
        }
        var AMF0 = (function () {
            function AMF0() {
            }
            AMF0.write = function (ba, value) {
                switch (typeof value) {
                    case "boolean":
                        ba.writeByte(1 /* BOOLEAN */);
                        ba.writeByte(value ? 0x01 : 0x00);
                        break;
                    case "number":
                        ba.writeByte(0 /* NUMBER */);
                        writeDouble(ba, value);
                        break;
                    case "undefined":
                        ba.writeByte(6 /* UNDEFINED */);
                        break;
                    case "string":
                        ba.writeByte(2 /* STRING */);
                        writeString(ba, value);
                        break;
                    case "object":
                        var object = value;
                        release || assert(object === null || AVMX.AXBasePrototype.isPrototypeOf(object));
                        if (object === null) {
                            ba.writeByte(5 /* NULL */);
                        }
                        else if (ba.sec.AXArray.axIsType(object)) {
                            var array = object.value;
                            ba.writeByte(8 /* ECMA_ARRAY */);
                            ba.writeByte((array.length >>> 24) & 255);
                            ba.writeByte((array.length >> 16) & 255);
                            ba.writeByte((array.length >> 8) & 255);
                            ba.writeByte(array.length & 255);
                            // REDUX: What about sparse arrays?
                            AVMX.forEachPublicProperty(object, function (key, value) {
                                writeString(ba, key);
                                this.write(ba, value);
                            }, this);
                            ba.writeByte(0x00);
                            ba.writeByte(0x00);
                            ba.writeByte(9 /* OBJECT_END */);
                        }
                        else {
                            ba.writeByte(3 /* OBJECT */);
                            AVMX.forEachPublicProperty(object, function (key, value) {
                                writeString(ba, key);
                                this.write(ba, value);
                            }, this);
                            ba.writeByte(0x00);
                            ba.writeByte(0x00);
                            ba.writeByte(9 /* OBJECT_END */);
                        }
                        return;
                }
            };
            AMF0.read = function (ba) {
                var marker = ba.readByte();
                switch (marker) {
                    case 0 /* NUMBER */:
                        return readDouble(ba);
                    case 1 /* BOOLEAN */:
                        return !!ba.readByte();
                    case 2 /* STRING */:
                        return readString(ba);
                    case 3 /* OBJECT */:
                        var object = ba.sec.createObject();
                        while (true) {
                            var key = readString(ba);
                            if (!key.length)
                                break;
                            object.axSetPublicProperty(key, this.read(ba));
                        }
                        if (ba.readByte() !== 9 /* OBJECT_END */) {
                            throw "AMF0 End marker is not found";
                        }
                        return object;
                    case 5 /* NULL */:
                        return null;
                    case 6 /* UNDEFINED */:
                        return undefined;
                    case 8 /* ECMA_ARRAY */:
                        var array = ba.sec.createArray([]);
                        array.length = (ba.readByte() << 24) | (ba.readByte() << 16) |
                            (ba.readByte() << 8) | ba.readByte();
                        while (true) {
                            var key = readString(ba);
                            if (!key.length)
                                break;
                            array.axSetPublicProperty(key, this.read(ba));
                        }
                        if (ba.readByte() !== 9 /* OBJECT_END */) {
                            throw "AMF0 End marker is not found";
                        }
                        return array;
                    case 10 /* STRICT_ARRAY */:
                        var array = ba.sec.createArray([]);
                        var length = array.length = (ba.readByte() << 24) | (ba.readByte() << 16) |
                            (ba.readByte() << 8) | ba.readByte();
                        for (var i = 0; i < length; i++) {
                            array.axSetPublicProperty(i, this.read(ba));
                        }
                        return array;
                    case 17 /* AVMPLUS */:
                        return readAMF3Value(ba, new AMF3ReferenceTables());
                    default:
                        throw "AMF0 Unknown marker " + marker;
                }
            };
            return AMF0;
        })();
        AVMX.AMF0 = AMF0;
        function readU29(ba) {
            var b1 = ba.readByte();
            if ((b1 & 0x80) === 0) {
                return b1;
            }
            var b2 = ba.readByte();
            if ((b2 & 0x80) === 0) {
                return ((b1 & 0x7F) << 7) | b2;
            }
            var b3 = ba.readByte();
            if ((b3 & 0x80) === 0) {
                return ((b1 & 0x7F) << 14) | ((b2 & 0x7F) << 7) | b3;
            }
            var b4 = ba.readByte();
            return ((b1 & 0x7F) << 22) | ((b2 & 0x7F) << 15) | ((b3 & 0x7F) << 8) | b4;
        }
        function writeU29(ba, value) {
            if ((value & 0xFFFFFF80) === 0) {
                ba.writeByte(value & 0x7F);
            }
            else if ((value & 0xFFFFC000) === 0) {
                ba.writeByte(0x80 | ((value >> 7) & 0x7F));
                ba.writeByte(value & 0x7F);
            }
            else if ((value & 0xFFE00000) === 0) {
                ba.writeByte(0x80 | ((value >> 14) & 0x7F));
                ba.writeByte(0x80 | ((value >> 7) & 0x7F));
                ba.writeByte(value & 0x7F);
            }
            else if ((value & 0xC0000000) === 0) {
                ba.writeByte(0x80 | ((value >> 22) & 0x7F));
                ba.writeByte(0x80 | ((value >> 15) & 0x7F));
                ba.writeByte(0x80 | ((value >> 8) & 0x7F));
                ba.writeByte(value & 0xFF);
            }
            else {
                throw "AMF3 U29 range";
            }
        }
        function readUTF8(ba, references) {
            var u29s = readU29(ba);
            if (u29s === 0x01) {
                return "";
            }
            var strings = references.strings;
            if ((u29s & 1) === 0) {
                return strings[u29s >> 1];
            }
            var byteLength = u29s >> 1;
            var buffer = new Uint8Array(byteLength);
            for (var i = 0; i < byteLength; i++) {
                buffer[i] = ba.readByte();
            }
            var value = Shumway.StringUtilities.utf8encode(buffer);
            strings.push(value);
            return value;
        }
        function writeUTF8(ba, s, references) {
            if (s === "") {
                ba.writeByte(0x01); // empty string
                return;
            }
            var strings = references.strings;
            var index = strings.indexOf(s);
            if (index >= 0) {
                writeU29(ba, index << 1);
                return;
            }
            strings.push(s);
            var bytes = Shumway.StringUtilities.utf8decode(s);
            writeU29(ba, 1 | (bytes.length << 1));
            for (var i = 0; i < bytes.length; i++) {
                ba.writeByte(bytes[i]);
            }
        }
        function readAMF3Value(ba, references) {
            var marker = ba.readByte();
            switch (marker) {
                case 1 /* NULL */:
                    return null;
                case 0 /* UNDEFINED */:
                    return undefined;
                case 2 /* FALSE */:
                    return false;
                case 3 /* TRUE */:
                    return true;
                case 4 /* INTEGER */:
                    return readU29(ba);
                case 5 /* DOUBLE */:
                    return readDouble(ba);
                case 6 /* STRING */:
                    return readUTF8(ba, references);
                case 8 /* DATE */:
                    var u29o = readU29(ba);
                    release || assert((u29o & 1) === 1);
                    return ba.sec.AXDate.axConstruct([readDouble(ba)]);
                case 10 /* OBJECT */:
                    var u29o = readU29(ba);
                    if ((u29o & 1) === 0) {
                        return references.objects[u29o >> 1];
                    }
                    if ((u29o & 4) !== 0) {
                        throw "AMF3 Traits-Ext is not supported";
                    }
                    var axClass;
                    var traits;
                    var isDynamic = true;
                    var traitNames;
                    if ((u29o & 2) === 0) {
                        traits = references.traits[u29o >> 2];
                        traitNames = references.traitNames[u29o >> 2];
                    }
                    else {
                        var alias = readUTF8(ba, references);
                        if (alias) {
                            traits = axClass = ba.sec.classAliases.getClassByAlias(alias);
                        }
                        isDynamic = (u29o & 8) !== 0;
                        traitNames = [];
                        for (var i = 0, j = u29o >> 4; i < j; i++) {
                            traitNames.push(readUTF8(ba, references));
                        }
                        references.traits.push(traits);
                        references.traitNames.push(traitNames);
                    }
                    var object = axClass ? axClass.axConstruct([]) : ba.sec.createObject();
                    references.objects.push(object);
                    // Read trait properties.
                    for (var i = 0; i < traitNames.length; i++) {
                        var value = readAMF3Value(ba, references);
                        object.axSetPublicProperty(traitNames[i], value);
                    }
                    // Read dynamic properties.
                    if (isDynamic) {
                        while (true) {
                            var key = readUTF8(ba, references);
                            if (key === "")
                                break;
                            var value = readAMF3Value(ba, references);
                            object.axSetPublicProperty(key, value);
                        }
                    }
                    return object;
                case 9 /* ARRAY */:
                    var u29o = readU29(ba);
                    if ((u29o & 1) === 0) {
                        return references.objects[u29o >> 1];
                    }
                    var array = ba.sec.createArray([]);
                    references.objects.push(array);
                    var densePortionLength = u29o >> 1;
                    while (true) {
                        var key = readUTF8(ba, references);
                        if (!key.length)
                            break;
                        var value = readAMF3Value(ba, references);
                        array.axSetPublicProperty(key, value);
                    }
                    for (var i = 0; i < densePortionLength; i++) {
                        var value = readAMF3Value(ba, references);
                        array.axSetPublicProperty(i, value);
                    }
                    return array;
                default:
                    throw "AMF3 Unknown marker " + marker;
            }
        }
        /**
         * Tries to write a reference to a previously written object.
         */
        function tryWriteAndStartTrackingReference(ba, object, references) {
            var objects = references.objects;
            var index = objects.indexOf(object);
            if (index < 0) {
                objects.push(object);
                return false;
            }
            writeU29(ba, index << 1);
            return true;
        }
        var MAX_INT = 268435456 - 1; // 2^28 - 1
        var MIN_INT = -268435456; // -2^28
        function writeAMF3Value(ba, value, references) {
            switch (typeof value) {
                case "boolean":
                    ba.writeByte(value ? 3 /* TRUE */ : 2 /* FALSE */);
                    break;
                case "number":
                    var useInteger = value === (value | 0);
                    if (useInteger) {
                        if (value > MAX_INT || value < MIN_INT) {
                            useInteger = false;
                        }
                    }
                    if (useInteger) {
                        ba.writeByte(4 /* INTEGER */);
                        writeU29(ba, value);
                    }
                    else {
                        ba.writeByte(5 /* DOUBLE */);
                        writeDouble(ba, value);
                    }
                    break;
                case "undefined":
                    ba.writeByte(0 /* UNDEFINED */);
                    break;
                case "string":
                    ba.writeByte(6 /* STRING */);
                    writeUTF8(ba, value, references);
                    break;
                case "object":
                    if (value === null) {
                        ba.writeByte(1 /* NULL */);
                    }
                    else if (ba.sec.AXArray.axIsType(value)) {
                        var array = value;
                        ba.writeByte(9 /* ARRAY */);
                        if (tryWriteAndStartTrackingReference(ba, array, references)) {
                            break;
                        }
                        var densePortionLength = 0;
                        while (array.axHasPublicProperty(densePortionLength)) {
                            ++densePortionLength;
                        }
                        writeU29(ba, (densePortionLength << 1) | 1);
                        AVMX.forEachPublicProperty(array, function (i, value) {
                            if (Shumway.isNumeric(i) && i >= 0 && i < densePortionLength) {
                                return;
                            }
                            writeUTF8(ba, i, references);
                            writeAMF3Value(ba, value, references);
                        });
                        writeUTF8(ba, "", references);
                        for (var j = 0; j < densePortionLength; j++) {
                            writeAMF3Value(ba, array.axGetPublicProperty(j), references);
                        }
                    }
                    else if (ba.sec.AXDate.axIsType(value)) {
                        ba.writeByte(8 /* DATE */);
                        if (tryWriteAndStartTrackingReference(ba, value, references))
                            break;
                        writeU29(ba, 1);
                        writeDouble(ba, value.valueOf());
                    }
                    else {
                        var object = value;
                        // TODO Vector, Dictionary, ByteArray and XML support
                        ba.writeByte(10 /* OBJECT */);
                        if (tryWriteAndStartTrackingReference(ba, object, references)) {
                            break;
                        }
                        var isDynamic = true;
                        var axClass = object.axClass;
                        if (axClass) {
                            var classInfo = axClass.classInfo;
                            isDynamic = !classInfo.instanceInfo.isSealed();
                            var alias = ba.sec.classAliases.getAliasByClass(axClass) || "";
                            var traitsRef = references.traits.indexOf(axClass);
                            var traitNames = null;
                            if (traitsRef < 0) {
                                // Write traits since we haven't done so yet.
                                traitNames = classInfo.instanceInfo.runtimeTraits.getSlotPublicTraitNames();
                                references.traits.push(axClass);
                                references.traitNames.push(traitNames);
                                writeU29(ba, (isDynamic ? 0x0B : 0x03) + (traitNames.length << 4));
                                writeUTF8(ba, alias, references);
                                // Write trait names.
                                for (var i = 0; i < traitNames.length; i++) {
                                    writeUTF8(ba, traitNames[i], references);
                                }
                            }
                            else {
                                // Write a reference to the previously written traits.
                                traitNames = references.traitNames[traitsRef];
                                writeU29(ba, 0x01 + (traitsRef << 2));
                            }
                            // Write the actual trait values.
                            for (var i = 0; i < traitNames.length; i++) {
                                writeAMF3Value(ba, object.axGetPublicProperty(traitNames[i]), references);
                            }
                        }
                        else {
                            // REDUX: I don't understand in what situations we wouldn't have a class definition, ask Yury.
                            // object with no class definition
                            writeU29(ba, 0x0B);
                            writeUTF8(ba, "", references); // empty alias name
                        }
                        // Write dynamic properties.
                        if (isDynamic) {
                            AVMX.forEachPublicProperty(object, function (i, value) {
                                writeUTF8(ba, i, references);
                                writeAMF3Value(ba, value, references);
                            });
                            writeUTF8(ba, "", references);
                        }
                    }
                    return;
            }
        }
        var AMF3 = (function () {
            function AMF3() {
            }
            AMF3.write = function (ba, object) {
                writeAMF3Value(ba, object, new AMF3ReferenceTables());
            };
            AMF3.read = function (ba) {
                return readAMF3Value(ba, new AMF3ReferenceTables());
            };
            return AMF3;
        })();
        AVMX.AMF3 = AMF3;
    })(AVMX = Shumway.AVMX || (Shumway.AVMX = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
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
/// <reference path='../../build/ts/base.d.ts' />
/// <reference path='../../build/ts/tools.d.ts' />
///<reference path='module.ts' />
///<reference path='errors.ts' />
///<reference path='settings.ts' />
///<reference path='abc/stream.ts' />
///<reference path='abc/ops.ts' />
///<reference path='abc/lazy.ts' />
///<reference path='int.ts' />
///<reference path='run.ts' />
///<reference path='nat.ts' />
// ///<reference path='compiler/verifier.ts' />
// ///<reference path='compiler/baseline.ts' />
///<reference path='natives/GenericVector.ts' />
///<reference path='natives/int32Vector.ts' />
///<reference path='natives/uint32Vector.ts' />
///<reference path='natives/float64Vector.ts' />
///<reference path='natives/xml.ts' />
///<reference path='natives/xml-document.ts' />
///<reference path='natives/describeType.ts' />
///<reference path='natives/dictionary.ts' />
///<reference path='natives/proxy.ts' />
///<reference path='natives/date.ts' />
///<reference path='natives/byteArray.ts' />
///<reference path='natives/system.ts' />
///<reference path='amf.ts' />
//# sourceMappingURL=avm2.js.map