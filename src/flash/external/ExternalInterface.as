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

package flash.external {
  import flash.utils.getDefinitionByName;

  [native(cls="ExternalInterfaceClass")]
  public final class ExternalInterface {

    public static var marshallExceptions: Boolean = false;

    private static function ensureInitialized(): void {
      if (!available) {
        Error.throwError(Error, 2067); // Errors.ExternalInterfaceNotAvailableError
      }
      _initJS();
    }

    public static function addCallback(functionName: String, closure: Function): void {
      ensureInitialized();
      if (!closure) {
        _addCallback(functionName, null, true);
        return;
      }

      _addCallback(functionName, function (request: String, args: Array) {
        var returnAsJS: Boolean = true;
        if (args == null) {
          var xml: XML = convertToXML(request);
          returnAsJS = xml.@returntype == 'javascript';
          args = [];
          for each (var obj: XML in xml.children()) {
            args.push(convertFromXML(obj));
          }
        }

        var result;
        try {
          result = closure.apply(null, args);
        } catch (e) {
          if (marshallExceptions) {
            result = e;
          } else {
            throw e;
          }
        }
        return returnAsJS ? convertToJSString(result) : convertToXMLString(result);
      }, false);
    }
    private static function convertToXML(s: String): XML {
      var savedIgnoreWhitespace: Boolean = XML.ignoreWhitespace;
      XML.ignoreWhitespace = false;
      var xml: XML = XML(s);
      XML.ignoreWhitespace = savedIgnoreWhitespace;
      return xml;
    }

    private static function convertToXMLString(obj: *): String {
      switch (typeof obj) {
        case 'boolean':
          return obj ? '<true/>' : '<false/>';
        case 'number':
          return '<number>' + obj + '</number>';
        case 'string':
          return '<string>' + String(obj).replace(/&/g, '&amp;').
            replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</string>';
        case 'object':
          if (obj === null) {
            return '<null/>';
          }
          if (obj is Date) {
            return '<date>' + obj.time + '</date>';
          }
          if (obj is Error) {
            if (marshallExceptions) {
              return '<exception>' + obj + '</exception>';
            } else {
              return '<null/>'; // not sure?
            }
          }
          var result: Array;
          // Looks like length is used to detect array. (obj is Array) is better?
          if ('length' in obj) {
            result = [];
            for (var i: Number = 0; i < obj.length; i++) {
              result.push('<property id=\"' + i + '\">' + convertToXMLString(obj[i]) + '</property>');
            }
            return '<array>' + result.join('') + '</array>';
          }
          result = [];
          for (var name: String in obj) {
            result.push('<property id=\"' + name + '\">' + convertToXMLString(obj[i]) + '</property>');
          }
          return '<object>' + result.join('') + '</object>';
        default:
          return '<undefined/>';
      }
    }

    private static function convertFromXML(xml: Object /* XML | XMLList */): * {
      switch (String(xml.name())) {
        case 'true':
          return true;
        case 'false':
          return false;
        case 'number':
          return Number(xml.children());
        case 'string':
          return String(xml.children());
        case 'null':
          return null;
        case 'date':
          return new Date(Number(xml.children()));
        case 'exception':
          if (marshallExceptions) {
            throw new Error(xml.children());
          }
          return undefined;
        case 'array':
          var arr: Array = [];
          for each (var x: XML in xml.children()) {
            arr[x.@id] = convertFromXML(x.children());
          }
          return arr;
        case 'object':
          var obj: Object = {};
          for each (var x: XML in xml.children()) {
            obj[x.@id] = convertFromXML(x.children());
          }
          return obj;
        case 'class':
          return getDefinitionByName(String(xml.children()));
        default:
          return undefined;
      }
    }

    private static function convertToJSString(obj: *): String {
      if (typeof obj == 'string') {
        return '\"' + obj.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/"/g, '\\\"') + '\"';
      }
      if (obj is Array) {
        var parts: Array = [], arr: Array = Array(obj);
        for (var i = 0; i < arr.length; i++) {
          parts.push(convertToJSString(arr[i]));
        }
        return '[' + parts.join(',') + ']';
      }
      if (obj is Date) {
        return 'new Date(' + obj + ')';
      }
      if (marshallExceptions && (obj is Error)) {
        return 'throw \"' + obj + '\"';
      }
      if (typeof obj === 'object' && obj !== null) {
        var parts: Array = [];
        for each (var name: String in _getPropNames(obj)) {
          parts.push(name + ':' + convertToJSString(obj[name]));
        }
        return '({' + parts.join(',') + '})';
      }
      return String(obj);
    }

    public static function call(functionName: String, ... args): * {
      ensureInitialized();
      var argsExpr: String = '';
      if (args.length > 0) {
        argsExpr = convertToJSString(args[0]);
        for (var i: Number = 1; i < args.length; i++) {
          argsExpr += ',' + convertToJSString(args[i]);
        }
      }
      var catchExpr = marshallExceptions ? '\"<exception>\" + e + \"</exception>\";' : '\"<undefined/>\";';
      var evalExpr: String = 'try {' +
        '__flash__toXML(' + functionName + '(' + argsExpr + '));' +
        '} catch (e) {' + catchExpr + '}';
      var result: String = _evalJS(evalExpr);
      if (result == null) {
        return null;
      }
      return convertFromXML(convertToXML(result));
    }

    public static native function get available(): Boolean;
    public static native function get objectID(): String;

    // TODO refactor those native classes
    private static native function _addCallback(functionName: String, closure: Function, hasNullCallback: Boolean): void;
    private static native function _evalJS(expression: String): String;
    private static native function _getPropNames(obj: Object): Array;
    private static native function _initJS(): void;
  }
}
