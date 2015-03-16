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
 * Like most JITs we don't need all the fancy AST serialization, this
 * is a quick and dirty AST writer.
 */
module Shumway.AVM2.Compiler.AST {
  import notImplemented = Shumway.Debug.notImplemented;
  import assertUnreachable = Shumway.Debug.assertUnreachable;
  // The top part of this file is copied from escodegen.

  var escapeless = false;
  var hexadecimal = false;
  var renumber = false;
  var quotes = "double";

  function escapeAllowedCharacter(ch, next) {
    var code = ch.charCodeAt(0), hex = code.toString(16), result = '\\';

    switch (ch) {
      case '\b':
        result += 'b';
        break;
      case '\f':
        result += 'f';
        break;
      case '\t':
        result += 't';
        break;
      default:
        if (code > 0xff) {
          result += 'u' + '0000'.slice(hex.length) + hex;
        } else if (ch === '\u0000' && '0123456789'.indexOf(next) < 0) {
          result += '0';
        } else if (ch === '\x0B') { // '\v'
          result += 'x0B';
        } else {
          result += 'x' + '00'.slice(hex.length) + hex;
        }
        break;
    }

    return result;
  }

  function escapeDisallowedCharacter(ch) {
    var result = '\\';
    switch (ch) {
      case '\\':
        result += '\\';
        break;
      case '\n':
        result += 'n';
        break;
      case '\r':
        result += 'r';
        break;
      case '\u2028':
        result += 'u2028';
        break;
      case '\u2029':
        result += 'u2029';
        break;
      default:
        throw new Error('Incorrectly classified character');
    }

    return result;
  }

  var escapeStringCacheCount = 0;
  var escapeStringCache = Object.create(null);

  export function escapeString(str: string) {
    var result, i, len, ch, singleQuotes = 0, doubleQuotes = 0, single, original = str;
    result = escapeStringCache[original];
    if (result) {
      return result;
    }
    if (escapeStringCacheCount === 1024) {
      escapeStringCache = Object.create(null);
      escapeStringCacheCount = 0;
    }
    result = '';

    for (i = 0, len = str.length; i < len; ++i) {
      ch = str[i];
      if (ch === '\'') {
        ++singleQuotes;
      } else if (ch === '"') {
        ++doubleQuotes;
      } else if ('\\\n\r\u2028\u2029'.indexOf(ch) >= 0) {
        result += escapeDisallowedCharacter(ch);
        continue;
      } else if (!(escapeless || (ch >= ' ' && ch <= '~'))) {
        result += escapeAllowedCharacter(ch, str[i + 1]);
        continue;
      }
      result += ch;
    }

    single = !(quotes === 'double' || (quotes === 'auto' && doubleQuotes < singleQuotes));
    str = result;
    result = single ? '\'' : '"';

    for (i = 0, len = str.length; i < len; ++i) {
      ch = str[i];
      if ((ch === '\'' && single) || (ch === '"' && !single)) {
        result += '\\';
      }
      result += ch;
    }

    result += (single ? '\'' : '"');
    escapeStringCache[original] = result;
    escapeStringCacheCount ++;
    return result;
  }

  var generateNumberCacheCount = 0;
  var generateNumberCache = Object.create(null);

  function generateNumber(value) {
    var result, point, temp, exponent, pos;

    if (value !== value) {
      throw new Error('Numeric literal whose value is NaN');
    }
    if (value < 0 || (value === 0 && 1 / value < 0)) {
      throw new Error('Numeric literal whose value is negative');
    }

    if (value === 1 / 0) {
      return renumber ? '1e400' : '1e+400';
    }

    result = generateNumberCache[value];
    if (result) {
      return result;
    }
    if (generateNumberCacheCount === 1024) {
      generateNumberCache = Object.create(null);
      generateNumberCacheCount = 0;
    }
    result = '' + value;
    if (!renumber || result.length < 3) {
      generateNumberCache[value] = result;
      generateNumberCacheCount ++;
      return result;
    }

    point = result.indexOf('.');
    if (result.charAt(0) === '0' && point === 1) {
      point = 0;
      result = result.slice(1);
    }
    temp = result;
    result = result.replace('e+', 'e');
    exponent = 0;
    if ((pos = temp.indexOf('e')) > 0) {
      exponent = +temp.slice(pos + 1);
      temp = temp.slice(0, pos);
    }
    if (point >= 0) {
      exponent -= temp.length - point - 1;
      temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';
    }
    pos = 0;
    while (temp.charAt(temp.length + pos - 1) === '0') {
      --pos;
    }
    if (pos !== 0) {
      exponent -= pos;
      temp = temp.slice(0, pos);
    }
    if (exponent !== 0) {
      temp += 'e' + exponent;
    }
    if ((temp.length < result.length ||
      (hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length < result.length)) &&
      +temp === value) {
      result = temp;
    }
    generateNumberCache[value] = result;
    generateNumberCacheCount ++;
    return result;
  }

  var Precedence = {
    Default:          0,
    Sequence:         0,
    Assignment:       1,
    Conditional:      2,
    ArrowFunction:    2,
    LogicalOR:        3,
    LogicalAND:       4,
    BitwiseOR:        5,
    BitwiseXOR:       6,
    BitwiseAND:       7,
    Equality:         8,
    Relational:       9,
    BitwiseSHIFT:    10,
    Additive:        11,
    Multiplicative:  12,
    Unary:           13,
    Postfix:         14,
    Call:            15,
    New:             16,
    Member:          17,
    Primary:         18
  };

  var BinaryPrecedence = {
    '||':         Precedence.LogicalOR,
    '&&':         Precedence.LogicalAND,
    '|':          Precedence.BitwiseOR,
    '^':          Precedence.BitwiseXOR,
    '&':          Precedence.BitwiseAND,
    '==':         Precedence.Equality,
    '!=':         Precedence.Equality,
    '===':        Precedence.Equality,
    '!==':        Precedence.Equality,
    'is':         Precedence.Equality,
    'isnt':       Precedence.Equality,
    '<':          Precedence.Relational,
    '>':          Precedence.Relational,
    '<=':         Precedence.Relational,
    '>=':         Precedence.Relational,
    'in':         Precedence.Relational,
    'instanceof': Precedence.Relational,
    '<<':         Precedence.BitwiseSHIFT,
    '>>':         Precedence.BitwiseSHIFT,
    '>>>':        Precedence.BitwiseSHIFT,
    '+':          Precedence.Additive,
    '-':          Precedence.Additive,
    '*':          Precedence.Multiplicative,
    '%':          Precedence.Multiplicative,
    '/':          Precedence.Multiplicative
  };

  function toLiteralSource(value) {
    if (value === null) {
      return 'null';
    }
    if (typeof value === 'string') {
      return escapeString(value);
    }
    if (typeof value === 'number') {
      return generateNumber(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    assertUnreachable(value);
  }

  function nodesToSource(nodes: Node [], precedence: number, separator?: string) {
    var result = "";
    for (var i = 0; i < nodes.length; i++) {
      result += nodes[i].toSource(precedence);
      if (separator && (i < nodes.length - 1)) {
        result += separator;
      }
    }
    return result;
  }

  function alwaysParenthesize(text: string) {
    return '(' + text + ')';
  }

  function parenthesize(text: string, current: number, should: number) {
    if (current < should) {
      return '(' + text + ')';
    }
    return text;
  }

  export class Node {
    type = 'Node';

    toSource(precedence: number) : string {
      assertUnreachable('toSource called on abstract base class Node with type ' + this.type);
      return "";
    }
  }

  export class Statement extends Node {
    type = 'Statement'; 

  }

  export class Expression extends Node {
    type = 'Expression'; 

  }

  export class Program extends Node {
    type = 'Program'; 
    constructor (public body: Node []) {
      super();
    }
  }

  export class EmptyStatement extends Statement {
    type = 'EmptyStatement'; 

  }

  export class BlockStatement extends Statement {
    type = 'BlockStatement'; 
    end: IR.Node;
    constructor (public body: Statement []) {
      super();
    }
    toSource(precedence: number) : string {
      return "{\n" + nodesToSource(this.body, precedence) + "}";
    }
  }

  export class ExpressionStatement extends Statement {
    type = 'ExpressionStatement'; 
    constructor (public expression: Expression) {
      super();
    }
    toSource(precedence: number) : string {
      return this.expression.toSource(Precedence.Sequence) + ";\n";
    }
  }

  export class IfStatement extends Statement {
    type = 'IfStatement'; 
    constructor (public test: Expression, public consequent: Statement, public alternate: Statement) {
      super();
    }
    toSource(precedence: number) : string {
      var result = "if(" + this.test.toSource(Precedence.Sequence) + "){" + this.consequent.toSource(Precedence.Sequence) + "}";
      if (this.alternate) {
        result += "else{" + this.alternate.toSource(Precedence.Sequence) + "}";
      }
      return result;
    }
  }

  export class LabeledStatement extends Statement {
    type = 'LabeledStatement'; 
    constructor (public label: Identifier, public body: Statement) {
      super();
    }
  }

  export class BreakStatement extends Statement {
    type = 'BreakStatement'; 
    constructor (public label: Identifier) {
      super();
    }
    toSource(precedence: number) : string {
      var result = "break";
      if (this.label) {
        result += " " + this.label.toSource(Precedence.Default);
      }
      return result + ";";
    }
  }

  export class ContinueStatement extends Statement {
    type = 'ContinueStatement'; 
    constructor (public label: Identifier) {
      super();
    }
    toSource(precedence: number) : string {
      var result = "continue";
      if (this.label) {
        result += " " + this.label.toSource(Precedence.Default);
      }
      return result + ";";
    }
  }

  export class WithStatement extends Statement {
    type = 'WithStatement'; 
    constructor (public object: Expression, public body: Statement) {
      super();
    }
  }

  export class SwitchStatement extends Statement {
    type = 'SwitchStatement'; 
    constructor (public discriminant: Expression, public cases: SwitchCase [], public lexical: boolean) {
      super();
    }
    toSource(precedence: number) : string {
      return "switch(" + this.discriminant.toSource(Precedence.Sequence) + "){" + nodesToSource(this.cases, Precedence.Default, ";") + "};";
    }
  }

  export class ReturnStatement extends Statement {
    type = 'ReturnStatement'; 
    constructor (public argument: Expression) {
      super();
    }
    toSource(precedence: number) : string {
      var result = "return ";
      if (this.argument) {
        result += this.argument.toSource(Precedence.Sequence);
      }
      return result + ";\n";
    }
  }

  export class ThrowStatement extends Statement {
    type = 'ThrowStatement'; 
    constructor (public argument: Expression) {
      super();
    }
    toSource(precedence: number) : string {
      return "throw " + this.argument.toSource(Precedence.Sequence) + ";\n";
    }
  }

  export class TryStatement extends Statement {
    type = 'TryStatement'; 
    constructor (public block: BlockStatement, public handlers:  CatchClause, public guardedHandlers: CatchClause [], public finalizer: BlockStatement) {
      super();
    }
  }

  export class WhileStatement extends Statement {
    type = 'WhileStatement'; 
    constructor (public test: Expression, public body: Statement) {
      super();
    }
    toSource(precedence: number) : string {
      return "while(" + this.test.toSource(Precedence.Sequence) + "){" + this.body.toSource(Precedence.Sequence) + "}";
    }
  }

  export class DoWhileStatement extends Statement {
    type = 'DoWhileStatement'; 
    constructor (public body: Statement, public test: Expression) {
      super();
    }
  }

  export class ForStatement extends Statement {
    type = 'ForStatement'; 
    constructor (public init: Node, public test: Expression, public update: Expression, public body: Statement) {
      super();
    }
  }

  export class ForInStatement extends Statement {
    type = 'ForInStatement'; 
    constructor (public left: Node, public right: Expression, public body: Statement, public each: boolean) {
      super();
    }
  }

  export class DebuggerStatement extends Statement {
    type = 'DebuggerStatement'; 
  }

  export class Declaration extends Statement {
    type = 'Declaration'; 
  }

  export class FunctionDeclaration extends Declaration {
    type = 'FunctionDeclaration'; 
    constructor (public id: Identifier, public params: Node[], public defaults: Expression[], public rest: Identifier, public body: BlockStatement, public generator: boolean, public expression: boolean) {
      super();
    }
  }

  export class VariableDeclaration extends Declaration {
    type = 'VariableDeclaration'; 
    constructor (public declarations: VariableDeclarator[], public kind: string) {
      super();
    }
    toSource(precedence: number) : string {
      return this.kind + " " + nodesToSource(this.declarations, precedence, ",") + ";\n";
    }
  }

  export class VariableDeclarator extends Node {
    type = 'VariableDeclarator'; 
    constructor (public id: Node, public init?: Node) {
      super();
    }
    toSource(precedence: number) : string {
      var result = this.id.toSource(Precedence.Assignment);
      if (this.init) {
        result += "=" + this.init.toSource(Precedence.Assignment);
      }
      return result;
    }
  }

  export class Identifier extends Expression {
    type = 'Identifier'; 
    constructor (public name: string) {
      super();
    }
    toSource(precedence: number) : string {
      return this.name;
    }
  }

  export class Literal extends Expression {
    type = 'Literal'; 
    constructor (public value: any) {
      super();
    }
    toSource(precedence: number) : string {
      return toLiteralSource(this.value);
    }
  }

  export class ThisExpression extends Expression {
    type = 'ThisExpression'; 
    toSource(precedence: number) : string {
      return "this";
    }
  }

  export class ArrayExpression extends Expression {
    type = 'ArrayExpression'; 
    constructor (public elements: Expression []) {
      super();
    }
    toSource(precedence: number) : string {
      return "[" + nodesToSource(this.elements, Precedence.Assignment, ",") + "]";
    }
  }

  export class ObjectExpression extends Expression {
    type = 'ObjectExpression'; 
    constructor (public properties: Property []) {
      super();
    }
    toSource(precedence: number) : string {
      return "{" + nodesToSource(this.properties, Precedence.Sequence, ",") + "}";
    }
  }

  export class FunctionExpression extends Expression {
    type = 'FunctionExpression'; 
    constructor (public id: Identifier, public params: Node[], public defaults: Expression [], public rest:  Identifier, public body: BlockStatement, public generator: boolean, public expression: boolean) {
      super();
    }
  }

  export class SequenceExpression extends Expression {
    type = 'SequenceExpression'; 
    constructor (public expressions: Expression []) {
      super();
    }
  }

  export class UnaryExpression extends Expression {
    type = 'UnaryExpression'; 
    constructor (public operator: string, public prefix: boolean, public argument: Expression) {
      super();
    }
    toSource(precedence: number) : string {
      var argument = this.argument.toSource(Precedence.Unary);
      var result = this.prefix ? this.operator + argument : argument + this.operator;
      result = " " + result;
      result = parenthesize(result, Precedence.Unary, precedence);
      return result;
    }
  }

  export class BinaryExpression extends Expression {
    type = 'BinaryExpression'; 
    constructor (public operator: string, public left: Expression, public right: Expression) {
      super();
    }
    toSource(precedence: number) : string {
      var currentPrecedence = BinaryPrecedence[this.operator];
      var result = this.left.toSource(currentPrecedence) + this.operator + this.right.toSource(currentPrecedence + 1);
      return parenthesize(result, currentPrecedence, precedence);
    }
  }

  export class AssignmentExpression extends Expression {
    type = 'AssignmentExpression'; 
    constructor (public operator: string, public left: Expression, public right: Expression) {
      super();
    }
    toSource(precedence: number) : string {
      var result = this.left.toSource(Precedence.Assignment) + this.operator + this.right.toSource(Precedence.Assignment);
      return parenthesize(result, Precedence.Assignment, precedence);
    }
  }

  export class UpdateExpression extends Expression {
    type = 'UpdateExpression'; 
    constructor (public operator: string, public argument: Expression, public prefix: boolean) {
      super();
    }
  }

  export class LogicalExpression extends BinaryExpression {
    type = 'LogicalExpression'; 
    constructor (operator: string, left: Expression, right: Expression) {
      super(operator, left, right);
    }
  }

  export class ConditionalExpression extends Expression {
    type = 'ConditionalExpression'; 
    constructor (public test: Expression, public consequent: Expression, public alternate: Expression) {
      super();
    }
    toSource(precedence: number) : string {
      return this.test.toSource(Precedence.LogicalOR) + "?" + this.consequent.toSource(Precedence.Assignment) + ":" + this.alternate.toSource(Precedence.Assignment);
    }
  }

  export class NewExpression extends Expression {
    type = 'NewExpression'; 
    arguments: Expression [];
    constructor (public callee: Expression, _arguments: Expression []) {
      super();
      this.arguments = _arguments;
    }
    toSource(precedence: number) : string {
      return "new " + this.callee.toSource(precedence) + "(" + nodesToSource(this.arguments, precedence, ",") + ")";
    }
  }

  export class CallExpression extends Expression {
    type = 'CallExpression'; 
    arguments: Expression [];
    constructor (public callee: Expression, _arguments: Expression []) {
      super();
      this.arguments = _arguments;
    }
    toSource(precedence: number) : string {
      return this.callee.toSource(precedence) + "(" + nodesToSource(this.arguments, precedence, ",") + ")";
    }
  }

  export class MemberExpression extends Expression {
    type = 'MemberExpression'; 
    constructor (public object: Expression, public property: Node, public computed: boolean) {
      super();
    }
    toSource(precedence: number) : string {
      var result = this.object.toSource(Precedence.Call);
      if (this.object instanceof Literal) {
        result = alwaysParenthesize(result);
      }
      var property = this.property.toSource(Precedence.Sequence);
      if (this.computed) {
        result += "[" + property + "]";
      } else {
        result += "." + property;
      }
      return parenthesize(result, Precedence.Member, precedence);
    }
  }

  export class Property extends Node {
    type = 'Property'; 
    constructor (public key: Node, public value: Expression, public kind: string) {
      super();
    }
    toSource(precedence: number) : string {
      return this.key.toSource(precedence) + ":" + this.value.toSource(precedence);
    }
  }

  export class SwitchCase extends Node {
    type = 'SwitchCase'; 
    constructor (public test: Expression, public consequent: Statement []) {
      super();
    }
    toSource(precedence: number) : string {
      var result = this.test ? "case " + this.test.toSource(precedence) : "default";
      return result + ": " + nodesToSource(this.consequent, precedence, ";");
    }
  }

  export class CatchClause extends Node {
    type = 'CatchClause'; 
    constructor (public param: Node, public guard: Expression, public body: BlockStatement) {
      super();
    }
  }
}
