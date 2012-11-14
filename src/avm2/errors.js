var Errors = {
  OutOfMemoryError                     : {code: 1000, message: "The system is out of memory."},
  NotImplementedError                  : {code: 1001, message: "The method %1 is not implemented."},
  InvalidPrecisionError                : {code: 1002, message: "Number.toPrecision has a range of 1 to 21. Number.toFixed and Number.toExponential have a range of 0 to 20. Specified value is not within expected range."},
  InvalidRadixError                    : {code: 1003, message: "The radix argument must be between 2 and 36; got %1."},
  InvokeOnIncompatibleObjectError      : {code: 1004, message: "Method %1 was invoked on an incompatible object."},
  ArrayIndexNotIntegerError            : {code: 1005, message: "Array index is not a positive integer (%1)."},
  CallOfNonFunctionError               : {code: 1006, message: "%1 is not a function."},
  ConstructOfNonFunctionError          : {code: 1007, message: "Instantiation attempted on a non-constructor."},
  AmbiguousBindingError                : {code: 1008, message: "%1 is ambiguous; Found more than one matching binding."},
  ConvertNullToObjectError             : {code: 1009, message: "Cannot access a property or method of a null object reference."},
  ConvertUndefinedToObjectError        : {code: 1010, message: "A term is undefined and has no properties."},
  IllegalOpcodeError                   : {code: 1011, message: "Method %1 contained illegal opcode %2 at offset %3."},
  LastInstExceedsCodeSizeError         : {code: 1012, message: "The last instruction exceeded code size."},
  FindVarWithNoScopeError              : {code: 1013, message: "Cannot call OP_findproperty when scopeDepth is 0."},
  ClassNotFoundError                   : {code: 1014, message: "Class %1 could not be found."},
  IllegalSetDxns                       : {code: 1015, message: "Method %1 cannot set default xml namespace"},
  DescendentsError                     : {code: 1016, message: "Descendants operator (..) not supported on type %1."},
  ScopeStackOverflowError              : {code: 1017, message: "Scope stack overflow occurred."},
  ScopeStackUnderflowError             : {code: 1018, message: "Scope stack underflow occurred."},
  GetScopeObjectBoundsError            : {code: 1019, message: "Getscopeobject %1 is out of bounds."},
  CannotFallOffMethodError             : {code: 1020, message: "Code cannot fall off the end of a method."},
  InvalidBranchTargetError             : {code: 1021, message: "At least one branch target was not on a valid instruction in the method."},
  IllegalVoidError                     : {code: 1022, message: "Type void may only be used as a function return type."},
  StackOverflowError                   : {code: 1023, message: "Stack overflow occurred."},
  StackUnderflowError                  : {code: 1024, message: "Stack underflow occurred."},
  InvalidRegisterError                 : {code: 1025, message: "An invalid register %1 was accessed."},
  SlotExceedsCountError                : {code: 1026, message: "Slot %1 exceeds slotCount=%2 of %3."},
  MethodInfoExceedsCountError          : {code: 1027, message: "Method_info %1 exceeds method_count=%2."},
  DispIdExceedsCountError              : {code: 1028, message: "Disp_id %1 exceeds max_disp_id=%2 of %3."},
  DispIdUndefinedError                 : {code: 1029, message: "Disp_id %1 is undefined on %2."},
  StackDepthUnbalancedError            : {code: 1030, message: "Stack depth is unbalanced. %1 != %2."},
  ScopeDepthUnbalancedError            : {code: 1031, message: "Scope depth is unbalanced. %1 != %2."},
  CpoolIndexRangeError                 : {code: 1032, message: "Cpool index %1 is out of range %2."},
  CpoolEntryWrongTypeError             : {code: 1033, message: "Cpool entry %1 is wrong type."},
  CheckTypeFailedError                 : {code: 1034, message: "Type Coercion failed: cannot convert %1 to %2."},
  IllegalSuperCallError                : {code: 1035, message: "Illegal super expression found in method %1."},
  CannotAssignToMethodError            : {code: 1037, message: "Cannot assign to a method %1 on %2."},
  RedefinedError                       : {code: 1038, message: "%1 is already defined."},
  CannotVerifyUntilReferencedError     : {code: 1039, message: "Cannot verify method until it is referenced."},
  CantUseInstanceofOnNonObjectError    : {code: 1040, message: "The right-hand side of instanceof must be a class or function."},
  IsTypeMustBeClassError               : {code: 1041, message: "The right-hand side of operator must be a class."},
  InvalidMagicError                    : {code: 1042, message: "Not an ABC file.  major_version=%1 minor_version=%2."},
  InvalidCodeLengthError               : {code: 1043, message: "Invalid code_length=%1."},
  InvalidMethodInfoFlagsError          : {code: 1044, message: "MethodInfo-%1 unsupported flags=%2."},
  UnsupportedTraitsKindError           : {code: 1045, message: "Unsupported traits kind=%1."},
  MethodInfoOrderError                 : {code: 1046, message: "MethodInfo-%1 referenced before definition."},
  MissingEntryPointError               : {code: 1047, message: "No entry point was found."},
  PrototypeTypeError                   : {code: 1049, message: "Prototype objects must be vanilla Objects."},
  ConvertToPrimitiveError              : {code: 1050, message: "Cannot convert %1 to primitive."},
  IllegalEarlyBindingError             : {code: 1051, message: "Illegal early binding access to %1."},
  InvalidURIError                      : {code: 1052, message: "Invalid URI passed to %1 function."},
  IllegalOverrideError                 : {code: 1053, message: "Illegal override of %1 in %2."},
  IllegalExceptionHandlerError         : {code: 1054, message: "Illegal range or target offsets in exception handler."},
  WriteSealedError                     : {code: 1056, message: "Cannot create property %1 on %2."},
  IllegalSlotError                     : {code: 1057, message: "%1 can only contain methods."},
  IllegalOperandTypeError              : {code: 1058, message: "Illegal operand type: %1 must be %2."},
  ClassInfoOrderError                  : {code: 1059, message: "ClassInfo-%1 is referenced before definition."},
  ClassInfoExceedsCountError           : {code: 1060, message: "ClassInfo %1 exceeds class_count=%2."},
  NumberOutOfRangeError                : {code: 1061, message: "The value %1 cannot be converted to %2 without losing precision."},
  WrongArgumentCountError              : {code: 1063, message: "Argument count mismatch on %1. Expected %2, got %3."},
  CannotCallMethodAsConstructor        : {code: 1064, message: "Cannot call method %1 as constructor."},
  UndefinedVarError                    : {code: 1065, message: "Variable %1 is not defined."},
  FunctionConstructorError             : {code: 1066, message: "The form function('function body') is not supported."},
  IllegalNativeMethodBodyError         : {code: 1067, message: "Native method %1 has illegal method body."},
  CannotMergeTypesError                : {code: 1068, message: "%1 and %2 cannot be reconciled."},
  ReadSealedError                      : {code: 1069, message: "Property %1 not found on %2 and there is no default value."},
  CallNotFoundError                    : {code: 1070, message: "Method %1 not found on %2"},
  AlreadyBoundError                    : {code: 1071, message: "Function %1 has already been bound to %2."},
  ZeroDispIdError                      : {code: 1072, message: "Disp_id 0 is illegal."},
  DuplicateDispIdError                 : {code: 1073, message: "Non-override method %1 replaced because of duplicate disp_id %2."},
  ConstWriteError                      : {code: 1074, message: "Illegal write to read-only property %1 on %2."},
  MathNotFunctionError                 : {code: 1075, message: "Math is not a function."},
  MathNotConstructorError              : {code: 1076, message: "Math is not a constructor."},
  WriteOnlyError                       : {code: 1077, message: "Illegal read of write-only property %1 on %2."},
  IllegalOpMultinameError              : {code: 1078, message: "Illegal opcode/multiname combination: %1<%2>."},
  IllegalNativeMethodError             : {code: 1079, message: "Native methods are not allowed in loaded code."},
  IllegalNamespaceError                : {code: 1080, message: "Illegal value for namespace."},
  ReadSealedErrorNs                    : {code: 1081, message: "Property %1 not found on %2 and there is no default value."},
  NoDefaultNamespaceError              : {code: 1082, message: "No default namespace has been set."},
  XMLPrefixNotBound                    : {code: 1083, message: "The prefix \"%1\" for element \"%2\" is not bound."},
  XMLBadQName                          : {code: 1084, message: "Element or attribute (\"%1\") does not match QName production: QName::=(NCName':')?NCName."},
  XMLUnterminatedElementTag            : {code: 1085, message: "The element type \"%1\" must be terminated by the matching end-tag \"</%2>\"."},
  XMLOnlyWorksWithOneItemLists         : {code: 1086, message: "The %1 method only works on lists containing one item."},
  XMLAssignmentToIndexedXMLNotAllowed  : {code: 1087, message: "Assignment to indexed XML is not allowed."},
  XMLMarkupMustBeWellFormed            : {code: 1088, message: "The markup in the document following the root element must be well-formed."},
  XMLAssigmentOneItemLists             : {code: 1089, message: "Assignment to lists with more than one item is not supported."},
  XMLMalformedElement                  : {code: 1090, message: "XML parser failure: element is malformed."},
  XMLUnterminatedCData                 : {code: 1091, message: "XML parser failure: Unterminated CDATA section."},
  XMLUnterminatedXMLDecl               : {code: 1092, message: "XML parser failure: Unterminated XML declaration."},
  XMLUnterminatedDocTypeDecl           : {code: 1093, message: "XML parser failure: Unterminated DOCTYPE declaration."},
  XMLUnterminatedComment               : {code: 1094, message: "XML parser failure: Unterminated comment."},
  XMLUnterminatedAttribute             : {code: 1095, message: "XML parser failure: Unterminated attribute."},
  XMLUnterminatedElement               : {code: 1096, message: "XML parser failure: Unterminated element."},
  XMLUnterminatedProcessingInstruction : {code: 1097, message: "XML parser failure: Unterminated processing instruction."},
  XMLNamespaceWithPrefixAndNoURI       : {code: 1098, message: "Illegal prefix %1 for no namespace."},
  RegExpFlagsArgumentError             : {code: 1100, message: "Cannot supply flags when constructing one RegExp from another."},
  NoScopeError                         : {code: 1101, message: "Cannot verify method %1 with unknown scope."},
  IllegalDefaultValue                  : {code: 1102, message: "Illegal default value for type %1."},
  CannotExtendFinalClass               : {code: 1103, message: "Class %1 cannot extend final base class."},
  XMLDuplicateAttribute                : {code: 1104, message: "Attribute \"%1\" was already specified for element \"%2\"."},
  CorruptABCError                      : {code: 1107, message: "The ABC data is corrupt, attempt to read out of bounds."},
  InvalidBaseClassError                : {code: 1108, message: "The OP_newclass opcode was used with the incorrect base class."},
  DanglingFunctionError                : {code: 1109, message: "Attempt to directly call unbound function %1 from method %2."},
  CannotExtendError                    : {code: 1110, message: "%1 cannot extend %2."},
  CannotImplementError                 : {code: 1111, message: "%1 cannot implement %2."},
  CoerceArgumentCountError             : {code: 1112, message: "Argument count mismatch on class coercion.  Expected 1, got %1."},
  InvalidNewActivationError            : {code: 1113, message: "OP_newactivation used in method without NEED_ACTIVATION flag."},
  NoGlobalScopeError                   : {code: 1114, message: "OP_getglobalslot or OP_setglobalslot used with no global scope."},
  NotConstructorError                  : {code: 1115, message: "%1 is not a constructor."},
  ApplyError                           : {code: 1116, message: "second argument to Function.prototype.apply must be an array."},
  XMLInvalidName                       : {code: 1117, message: "Invalid XML name: %1."},
  XMLIllegalCyclicalLoop               : {code: 1118, message: "Illegal cyclical loop between nodes."},
  DeleteTypeError                      : {code: 1119, message: "Delete operator is not supported with operand of type %1."},
  DeleteSealedError                    : {code: 1120, message: "Cannot delete property %1 on %2."},
  DuplicateMethodBodyError             : {code: 1121, message: "Method %1 has a duplicate method body."},
  IllegalInterfaceMethodBodyError      : {code: 1122, message: "Interface method %1 has illegal method body."},
  FilterError                          : {code: 1123, message: "Filter operator not supported on type %1."},
  InvalidHasNextError                  : {code: 1124, message: "OP_hasnext2 requires object and index to be distinct registers."},
  OutOfRangeError                      : {code: 1125, message: "The index %1 is out of range %2."},
  VectorFixedError                     : {code: 1126, message: "Cannot change the length of a fixed Vector."},
  TypeAppOfNonParamType                : {code: 1127, message: "Type application attempted on a non-parameterized type."},
  WrongTypeArgCountError               : {code: 1128, message: "Incorrect number of type parameters for %1. Expected %2, got %3."},
  JSONCyclicStructure                  : {code: 1129, message: "Cyclic structure cannot be converted to JSON string."},
  JSONInvalidReplacer                  : {code: 1131, message: "Replacer argument to JSON stringifier must be an array or a two parameter function."},
  JSONInvalidParseInput                : {code: 1132, message: "Invalid JSON parse input."},
  FileOpenError                        : {code: 1500, message: "Error occurred opening file %1."},
  FileWriteError                       : {code: 1501, message: "Error occurred writing to file %1."},
  ScriptTimeoutError                   : {code: 1502, message: "A script has executed for longer than the default timeout period of 15 seconds."},
  ScriptTerminatedError                : {code: 1503, message: "A script failed to exit after 30 seconds and was terminated."},
  EndOfFileError                       : {code: 1504, message: "End of file."},
  StringIndexOutOfBoundsError          : {code: 1505, message: "The string index %1 is out of bounds; must be in range %2 to %3."},
  InvalidRangeError                    : {code: 1506, message: "The specified range is invalid."},
  NullArgumentError                    : {code: 1507, message: "Argument %1 cannot be null."},
  InvalidArgumentError                 : {code: 1508, message: "The value specified for argument %1 is invalid."},
  ArrayFilterNonNullObjectError        : {code: 1510, message: "When the callback argument is a method of a class, the optional this argument must be null."},
  InvalidParamError                    : {code: 2004, message: "One of the parameters is invalid."},
  ParamRangeError                      : {code: 2006, message: "The supplied index is out of bounds."},
  NullPointerError                     : {code: 2007, message: "Parameter %1 must be non-null."},
  InvalidEnumError                     : {code: 2008, message: "Parameter %1 must be one of the accepted values."},
  CantInstantiateError                 : {code: 2012, message: "%1 class cannot be instantiated."},
  ArgumentError                        : {code: 2015, message: "Invalid BitmapData."},
  EOFError                             : {code: 2030, message: "End of file was encountered."},
  CompressedDataError                  : {code: 2058, message: "There was an error decompressing the data."},
  EmptyStringError                     : {code: 2085, message: "Parameter %1 must be non-empty string."},
  ProxyGetPropertyError                : {code: 2088, message: "The Proxy class does not implement getProperty. It must be overridden by a subclass."},
  ProxySetPropertyError                : {code: 2089, message: "The Proxy class does not implement setProperty. It must be overridden by a subclass."},
  ProxyCallPropertyError               : {code: 2090, message: "The Proxy class does not implement callProperty. It must be overridden by a subclass."},
  ProxyHasPropertyError                : {code: 2091, message: "The Proxy class does not implement hasProperty. It must be overridden by a subclass."},
  ProxyDeletePropertyError             : {code: 2092, message: "The Proxy class does not implement deleteProperty. It must be overridden by a subclass."},
  ProxyGetDescendantsError             : {code: 2093, message: "The Proxy class does not implement getDescendants. It must be overridden by a subclass."},
  ProxyNextNameIndexError              : {code: 2105, message: "The Proxy class does not implement nextNameIndex. It must be overridden by a subclass."},
  ProxyNextNameError                   : {code: 2106, message: "The Proxy class does not implement nextName. It must be overridden by a subclass."},
  ProxyNextValueError                  : {code: 2107, message: "The Proxy class does not implement nextValue. It must be overridden by a subclass."},
  InvalidArrayLengthError              : {code: 2108, message: "The value %1 is not a valid Array length."},
  ReadExternalNotImplementedError      : {code: 2173, message: "Unable to read object in stream.  The class %1 does not implement flash.utils.IExternalizable but is aliased to an externalizable class."}
};

function getErrorMessage(index) {
  if (!debuggerMode.value) {
    return "Error #" + index;
  }
  for (var k in Errors) {
    if (Errors[k].code == index) {
      return "Error #" + index + ": " + Errors[k].message;
    }
  }
}

function formatErrorMessage(error) {
  var message = error.message;
  Array.prototype.slice.call(arguments, 1).forEach(function (x, i) {
    message = message.replace("%" + (i + 1), x);
  });
  return "Error #" + error.code + ": " + message;
}

function translateErrorMessage(error) {
  if (error.type) {
    switch (error.type) {
      case "undefined_method":
        return formatErrorMessage(Errors.CallOfNonFunctionError, "value");
      default:
        throw notImplemented(error.type);
    }
  } else {
    if (error.message.indexOf("is not a function") >= 0) {
      return formatErrorMessage(Errors.CallOfNonFunctionError, "value");
    }
    return error.message;
  }
}