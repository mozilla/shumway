/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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
/*global slice, push, isArray, keys, fail */
/*global readSi8, readSi16, readSi32, readUi8, readUi16, readUi32, readFixed,
  readFixed8, readFloat16, readFloat, readDouble, readEncodedU32, readBool,
  align, readSb, readUb, readFb, readString, readBinary */

var defaultTemplateSet = [
  readSi8, readSi16, readSi32, readUi8, readUi16, readUi32, readFixed,
  readFixed8, readFloat16, readFloat, readDouble, readEncodedU32, readBool,
  align, readSb, readUb, readFb, readString, readBinary
];

var rtemplate = /^function\s*(.*)\s*\(([^)]*)\)\s*{\s*([\s\S]*.)\s*}$/;
var rinlinable = /^return\s*([^;]*)$/;

function generateParser(_struct) {
  var productions = [];
  var varCount = 0;

  (function produce(_struct, context) {
    if (typeof _struct !== 'object' || '$' in _struct) {
      _struct = { $$: _struct };
      context = undefined;
    } else if (!context) {
      context = '$' + varCount++;
    }

    var production = [];
    for (var field in _struct) {
      var type = _struct[field], options;
      if (typeof type === 'object' && type.$ !== undefined) {
        assert(!isArray(type.$), 'invalid type', 'generate');
        options = type;
        type = options.$;
      } else {
        options = { };
      }

      var merge = false;
      var hide = false;
      var refer = false;
      if (field[0] === '$') {
        if (+field[1] == field[1]) {
          assert(typeof type === 'object', 'can only merge structs', 'generate');
          merge = true;
          hide = true;
        } else {
          refer = true;
          if (field[1] === '$')
            hide = true;
        }
        field = field.replace(/^\$\$?\d*/, '');
      }
      var segment = [];
      if (field) {
        if (refer)
          segment.push('var ' + field + '=');
        if (!hide)
          segment.push(context + '.' + field + '=');
      }

      if (options.count || 'length' in options || options.condition) {
        var listVar;
        if (refer) {
          listVar = field;
        } else {
          listVar = '$' + varCount++;
          segment.unshift('var ' + listVar + '=');
        }
        segment.push('[]');
        if (options.count) {
          var countVar = '$' + varCount++;
          segment.push('var ' + countVar + '=' + options.count);
          segment.push('while(' + countVar + '--){');
        } else if ('length' in options) {
          var endVar = '$' + varCount++;
          var length = options.length;
          if (length <= 0)
            length = '$stream.remaining()+' + length;
          segment.push('var ' + endVar + '=$stream.pos+' + length + '');
          segment.push('while($stream.pos<' + endVar + '){');
        } else {
          segment.push('do{');
        }
        var obj = produce(type);
        if (obj) {
          segment.push('var ' + obj + '={}');
          segment.push(productions.pop());
          segment.push(listVar + '.push(' + obj + ')}');
        } else {
          segment.push(listVar + '.push(');
          segment.push(productions.pop());
          segment.push(')}');
        }
        if (options.condition)
          segment.push('while(' + options.condition + ')');
      } else {
        switch (typeof type) {
        case 'number':
          var template = defaultTemplateSet[type];
          assert(template, 'unknown type', 'generate');
          if (typeof template === 'function') {
            var terms = rtemplate.exec(template);
            var name = terms[1];
            var params = terms[2].split(', ');
            var body = terms[3].split('\n');
            var inline = true;
            var argc = params.length - 2;
            if (argc) {
              var args = options.args;
              assert(args && args.length >= argc, 'missing arguments', 'generate');
              params.splice(2, args.length, args);
              inline = false;
            }
            if (inline && rinlinable.test(body))
              type = RegExp.$1;
            else
              type = name + '(' + params.join(',') + ')';
          } else {
            type = template;
          }
          /* fall through */
        case 'string':
          segment.push(type);
          break;
        case 'object':
          var shared = segment.splice(0).join('');

          /*jshint -W083 */
          var branch = function branch(_struct) {
            var obj = produce(_struct, merge ? context : refer && field);
            var init = shared;
            if (!merge && obj) {
              if (!(refer || hide))
                init = 'var ' + obj + '=' + init;
              init += '{}';
            }
            segment.push(init);
            segment.push(productions.pop());
          };

          if (isArray(type)) {
            var expr = type[0];
            assert(expr, 'invalid control expression', 'generate');
            var branches = type[1];
            assert(typeof branches === 'object', 'invalid alternatives', 'generate');
            if (isArray(branches)) {
              assert(branches.length <= 2, 'too many alternatives', 'generate');
              segment.push('if(' + expr + '){');
              branch(branches[0]);
              segment.push('}');
              if (branches[1]) {
                segment.push('else{');
                branch(branches[1]);
                segment.push('}');
              }
            } else {
              var values = keys(branches);
              assert(values && values.length, 'missing case values', 'generate');
              segment.push('switch(' + expr + '){');
              var val;
              var i = 0;
              while ((val = values[i++])) {
                if (val !== 'unknown') {
                  segment.push('case ' + val + ':');
                  if (branches[val] != branches[values[i]]) {
                    branch(branches[val]);
                    segment.push('break');
                  }
                }
              }
              segment.push('default:');
              if ('unknown' in branches)
                branch(branches.unknown);
              segment.push('}');
            }
          } else {
            branch(type);
          }
          break;
        default:
          fail('invalid type', 'generate');
        }
      }
      push.apply(production, segment);
    }
    productions.push(production.join('\n'));
    return context;
  })(_struct, '$');

  var args = ['$bytes', '$stream', '$'];
  if (arguments.length > 1)
    push.apply(args, slice.call(arguments, 1));
  /*jshint -W067 */
  return (1, eval)(
    '(function(' + args.join(',') + '){\n' +
      '$||($={})\n' +
      productions.join('\n') + '\n' +
      'return $\n' +
    '})'
  );
}
