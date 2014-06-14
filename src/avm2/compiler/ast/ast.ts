declare function notImplemented(any);

module AST {

  // The top part of this file is copied from escodegen.

  var json = false;
  var escapeless = false;
  var hexadecimal = false;
  var renumber = false;
  var quotes = "double";

  function stringToArray(str) {
    var length = str.length,
      result = [],
      i;
    for (i = 0; i < length; ++i) {
      result[i] = str.charAt(i);
    }
    return result;
  }

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
        if (json || code > 0xff) {
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

  function escapeString(str) {
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

    if (typeof str[0] === 'undefined') {
      str = stringToArray(str);
    }

    for (i = 0, len = str.length; i < len; ++i) {
      ch = str[i];
      if (ch === '\'') {
        ++singleQuotes;
      } else if (ch === '"') {
        ++doubleQuotes;
      } else if (ch === '/' && json) {
        result += '\\';
      } else if ('\\\n\r\u2028\u2029'.indexOf(ch) >= 0) {
        result += escapeDisallowedCharacter(ch);
        continue;
      } else if ((json && ch < ' ') || !(json || escapeless || (ch >= ' ' && ch <= '~'))) {
        result += escapeAllowedCharacter(ch, str[i + 1]);
        continue;
      }
      result += ch;
    }

    single = !(quotes === 'double' || (quotes === 'auto' && doubleQuotes < singleQuotes));
    str = result;
    result = single ? '\'' : '"';

    if (typeof str[0] === 'undefined') {
      str = stringToArray(str);
    }

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
      return json ? 'null' : renumber ? '1e400' : '1e+400';
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
    if (!json && result.charAt(0) === '0' && point === 1) {
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
    notImplemented(value);
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
    type: string;

    toSource(precedence: number) : string {
      notImplemented(this.type);
      return "";
    }
  }

  export class Statement extends Node {

  }

  export class Expression extends Node {

  }

  export class Program extends Node {
    body: Node [];
    constructor (body: Node []) {
      super();
      this.body = body;
    }
  }

  export class EmptyStatement extends Statement {

  }

  export class BlockStatement extends Statement {
    body: Statement [];
    constructor (body: Statement []) {
      super();
      this.body = body;
    }
    toSource(precedence: number) : string {
      return "{" + nodesToSource(this.body, precedence) + "}";
    }
  }

  export class ExpressionStatement extends Statement {
    expression: Expression;
    constructor (expression: Expression) {
      super();
      this.expression = expression;
    }
    toSource(precedence: number) : string {
      return this.expression.toSource(Precedence.Sequence) + ";";
    }
  }

  export class IfStatement extends Statement {
    test: Expression;
    consequent: Statement;
    alternate: Statement;
    constructor (test: Expression, consequent: Statement, alternate: Statement) {
      super();
      this.test = test;
      this.consequent = consequent;
      this.alternate = alternate;
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
    label: Identifier;
    body: Statement;
    constructor (label: Identifier, body: Statement) {
      super();
      this.label = label;
      this.body = body;
    }
  }
  
  export class BreakStatement extends Statement {
    label: Identifier;
    constructor (label: Identifier) {
      super();
      this.label = label;
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
    label: Identifier;
    constructor (label: Identifier) {
      super();
      this.label = label;
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
    object: Expression;
    body: Statement;
    constructor (object: Expression, body: Statement) {
      super();
      this.object = object;
      this.body = body;
    }
  }

  export class SwitchStatement extends Statement {
    discriminant: Expression;
    cases: SwitchCase [];
    lexical: boolean;
    constructor (discriminant: Expression, cases: SwitchCase [], lexical: boolean) {
      super();
      this.discriminant = discriminant;
      this.cases = cases;
      this.lexical = lexical;
    }
    toSource(precedence: number) : string {
      return "switch(" + this.discriminant.toSource(Precedence.Sequence) + "){" + nodesToSource(this.cases, Precedence.Default, ";") + "};";
    }
  }
  
  export class ReturnStatement extends Statement {
    argument: Expression;
    constructor (argument: Expression) {
      super();
      this.argument = argument;
    }
    toSource(precedence: number) : string {
      var result = "return ";
      if (this.argument) {
        result += this.argument.toSource(Precedence.Sequence);
      }
      return result + ";";
    }
  }
  
  export class ThrowStatement extends Statement {
    argument: Expression;
    constructor (argument: Expression) {
      super();
      this.argument = argument;
    }
    toSource(precedence: number) : string {
      return "throw " + this.argument.toSource(Precedence.Sequence) + ";";
    }
  }
  
  export class TryStatement extends Statement {
    block: BlockStatement;
    handlers:  CatchClause;
    guardedHandlers: CatchClause [];
    finalizer: BlockStatement;
    constructor (block: BlockStatement, handlers:  CatchClause, guardedHandlers: CatchClause [], finalizer: BlockStatement) {
      super();
      this.block = block;
      this.handlers = handlers;
      this.guardedHandlers = guardedHandlers;
      this.finalizer = finalizer;
    }
  }
  
  export class WhileStatement extends Statement {
    test: Expression;
    body: Statement;
    constructor (test: Expression, body: Statement) {
      super();
      this.test = test;
      this.body = body;
    }
    toSource(precedence: number) : string {
      return "while(" + this.test.toSource(Precedence.Sequence) + "){" + this.body.toSource(Precedence.Sequence) + "}";
    }
  }

  export class DoWhileStatement extends Statement {
    body: Statement;
    test: Expression;
    constructor (body: Statement, test: Expression) {
      super();
      this.body = body;
      this.test = test;
    }
  }

  export class ForStatement extends Statement {
    init: Node;
    test: Expression;
    update: Expression;
    body: Statement;
    constructor (init: Node, test: Expression, update: Expression, body: Statement) {
      super();
      this.init = init;
      this.test = test;
      this.update = update;
      this.body = body;
    }
  }
  
  export class ForInStatement extends Statement {
    left: Node;
    right: Expression;
    body: Statement;
    each: boolean;
    constructor (left: Node, right: Expression, body: Statement, each: boolean) {
      super();
      this.left = left;
      this.right = right;
      this.body = body;
      this.each = each;
    }
  }
  
  export class DebuggerStatement extends Statement {
  }

  export class Declaration extends Statement {
  }
  
  export class FunctionDeclaration extends Declaration {
    id: Identifier;
    params: Node[];
    defaults: Expression[];
    rest: Identifier;
    body: BlockStatement;
    generator: boolean;
    expression: boolean;
    constructor (id: Identifier, params: Node[], defaults: Expression[], rest: Identifier, body: BlockStatement, generator: boolean, expression: boolean) {
      super();
      this.id = id;
      this.params = params;
      this.defaults = defaults;
      this.rest = rest;
      this.body = body;
      this.generator = generator;
      this.expression = expression;
    }
  }
  
  export class VariableDeclaration extends Declaration {
    declarations: VariableDeclarator[];
    kind: string;
    constructor (declarations: VariableDeclarator[], kind: string) {
      super();
      this.declarations = declarations;
      this.kind = kind;
    }
    toSource(precedence: number) : string {
      return this.kind + " " + nodesToSource(this.declarations, precedence, ",") + ";";
    }
  }
  
  export class VariableDeclarator extends Node {
    id: Node;
    init: Node;
    constructor (id: Node, init: Node) {
      super();
      this.id = id;
      this.init = init;
    }
    toSource(precedence: number) : string {
      var result = this.id.toSource(Precedence.Assignment);
      if (this.init) {
        result += this.init.toSource(Precedence.Assignment);
      }
      return result;
    }
  }
  
  export class Identifier extends Expression {
    name: string;
    constructor (name: string) {
      super();
      this.name = name;
    }
    toSource(precedence: number) : string {
      return this.name;
    }
  }
  
  export class Literal extends Expression {
    value: any;
    constructor (value: any) {
      super();
      this.value = value;
    }
    toSource(precedence: number) : string {
      return toLiteralSource(this.value);
    }
  }
  
  export class ThisExpression extends Expression {
    toSource(precedence: number) : string {
      return "this";
    }
  }
  
  export class ArrayExpression extends Expression {
    elements: Expression [];
    constructor (elements: Expression []) {
      super();
      this.elements = elements;
    }
    toSource(precedence: number) : string {
      return "[" + nodesToSource(this.elements, Precedence.Assignment, ",") + "]";
    }
  }
  
  export class ObjectExpression extends Expression {
    properties: Property [];
    constructor (properties: Property []) {
      super();
      this.properties = properties;
    }
    toSource(precedence: number) : string {
      return "{" + nodesToSource(this.properties, Precedence.Sequence, ",") + "}";
    }
  }
  
  export class FunctionExpression extends Expression {
    id: Identifier;
    params: Node[];
    defaults: Expression [];
    rest:  Identifier;
    body: BlockStatement;
    generator: boolean;
    expression: boolean;
    constructor (id: Identifier, params: Node[], defaults: Expression [], rest:  Identifier, body: BlockStatement, generator: boolean, expression: boolean) {
      super();
      this.id = id;
      this.params = params;
      this.defaults = defaults;
      this.rest = rest;
      this.body = body;
      this.generator = generator;
      this.expression = expression;
    }
  }
  
  export class SequenceExpression extends Expression {
    expressions: Expression [];
    constructor (expressions: Expression []) {
      super();
      this.expressions = expressions;
    }
  }
  
  export class UnaryExpression extends Expression {
    operator: string;
    prefix: boolean;
    argument: Expression;
    constructor (operator: string, prefix: boolean, argument: Expression) {
      super();
      this.operator = operator;
      this.prefix = prefix;
      this.argument = argument;
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
    operator: string;
    left: Expression;
    right: Expression;
    constructor (operator: string, left: Expression, right: Expression) {
      super();
      this.operator = operator;
      this.left = left;
      this.right = right;
    }
    toSource(precedence: number) : string {
      var currentPrecedence = BinaryPrecedence[this.operator];
      var result = this.left.toSource(currentPrecedence) + this.operator + this.right.toSource(currentPrecedence + 1);
      return parenthesize(result, currentPrecedence, precedence);
    }
  }
  
  export class AssignmentExpression extends Expression {
    operator: string;
    left: Expression;
    right: Expression;
    constructor (operator: string, left: Expression, right: Expression) {
      super();
      this.operator = operator;
      this.left = left;
      this.right = right;
    }
    toSource(precedence: number) : string {
      var result = this.left.toSource(Precedence.Assignment) + this.operator + this.right.toSource(Precedence.Assignment);
      return parenthesize(result, Precedence.Assignment, precedence);
    }
  }
  
  export class UpdateExpression extends Expression {
    operator: string;
    argument: Expression;
    prefix: boolean;
    constructor (operator: string, argument: Expression, prefix: boolean) {
      super();
      this.operator = operator;
      this.argument = argument;
      this.prefix = prefix;
    }
  }
  
  export class LogicalExpression extends BinaryExpression {
    constructor (operator: string, left: Expression, right: Expression) {
      super(operator, left, right);
    }
  }
  
  export class ConditionalExpression extends Expression {
    test: Expression;
    alternate: Expression;
    consequent: Expression;
    constructor (test: Expression, consequent: Expression, alternate: Expression) {
      super();
      this.test = test;
      this.consequent = consequent;
      this.alternate = alternate;
    }
    toSource(precedence: number) : string {
      return this.test.toSource(Precedence.LogicalOR) + "?" + this.consequent.toSource(Precedence.Assignment) + ":" + this.alternate.toSource(Precedence.Assignment);
    }
  }
  
  export class NewExpression extends Expression {
    callee: Expression;
    arguments: Expression [];
    constructor (callee: Expression, _arguments: Expression []) {
      super();
      this.callee = callee;
      this.arguments = _arguments;
    }
    toSource(precedence: number) : string {
      return "new " + this.callee.toSource(precedence) + "(" + nodesToSource(this.arguments, precedence, ",") + ")";
    }
  }
  
  export class CallExpression extends Expression {
    callee: Expression;
    arguments: Expression [];
    constructor (callee: Expression, _arguments: Expression []) {
      super();
      this.callee = callee;
      this.arguments = _arguments;
    }
    toSource(precedence: number) : string {
      return this.callee.toSource(precedence) + "(" + nodesToSource(this.arguments, precedence, ",") + ")";
    }
  }
  
  export class MemberExpression extends Expression {
    object: Expression;
    property: Node;
    computed: boolean;
    constructor (object: Expression, property: Node, computed: boolean) {
      super();
      this.object = object;
      this.property = property;
      this.computed = computed;
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
    key: Node;
    value: Expression;
    kind: string;
    constructor (key: Node, value: Expression, kind: string) {
      super();
      this.key = key;
      this.value = value;
      this.kind = kind;
    }
    toSource(precedence: number) : string {
      return this.key.toSource(precedence) + ":" + this.value.toSource(precedence);
    }
  }
  
  export class SwitchCase extends Node {
    test: Expression;
    consequent: Statement [];
    constructor (test: Expression, consequent: Statement []) {
      super();
      this.test = test;
      this.consequent = consequent;
    }
    toSource(precedence: number) : string {
      var result = this.test ? "case " + this.test.toSource(precedence) : "default";
      return result + ": " + nodesToSource(this.consequent, precedence, ";");
    }
  }
  
  export class CatchClause extends Node {
    param: Node;
    guard: Expression;
    body: BlockStatement;
    constructor (param: Node, guard: Expression, body: BlockStatement) {
      super();
      this.param = param;
      this.guard = guard;
      this.body = body;
    }
  }

  Node.prototype.type = "Node";
  Program.prototype.type = "Program";
  Statement.prototype.type = "Statement";
  EmptyStatement.prototype.type = "EmptyStatement";
  BlockStatement.prototype.type = "BlockStatement";
  ExpressionStatement.prototype.type = "ExpressionStatement";
  IfStatement.prototype.type = "IfStatement";
  LabeledStatement.prototype.type = "LabeledStatement";
  BreakStatement.prototype.type = "BreakStatement";
  ContinueStatement.prototype.type = "ContinueStatement";
  WithStatement.prototype.type = "WithStatement";
  SwitchStatement.prototype.type = "SwitchStatement";
  ReturnStatement.prototype.type = "ReturnStatement";
  ThrowStatement.prototype.type = "ThrowStatement";
  TryStatement.prototype.type = "TryStatement";
  WhileStatement.prototype.type = "WhileStatement";
  DoWhileStatement.prototype.type = "DoWhileStatement";
  ForStatement.prototype.type = "ForStatement";
  ForInStatement.prototype.type = "ForInStatement";
  DebuggerStatement.prototype.type = "DebuggerStatement";
  Declaration.prototype.type = "Declaration";
  FunctionDeclaration.prototype.type = "FunctionDeclaration";
  VariableDeclaration.prototype.type = "VariableDeclaration";
  VariableDeclarator.prototype.type = "VariableDeclarator";
  Expression.prototype.type = "Expression";
  Identifier.prototype.type = "Identifier";
  Literal.prototype.type = "Literal";
  ThisExpression.prototype.type = "ThisExpression";
  ArrayExpression.prototype.type = "ArrayExpression";
  ObjectExpression.prototype.type = "ObjectExpression";
  FunctionExpression.prototype.type = "FunctionExpression";
  SequenceExpression.prototype.type = "SequenceExpression";
  UnaryExpression.prototype.type = "UnaryExpression";
  BinaryExpression.prototype.type = "BinaryExpression";
  AssignmentExpression.prototype.type = "AssignmentExpression";
  UpdateExpression.prototype.type = "UpdateExpression";
  LogicalExpression.prototype.type = "LogicalExpression";
  ConditionalExpression.prototype.type = "ConditionalExpression";
  NewExpression.prototype.type = "NewExpression";
  CallExpression.prototype.type = "CallExpression";
  MemberExpression.prototype.type = "MemberExpression";
  Property.prototype.type = "Property";
  SwitchCase.prototype.type = "SwitchCase";
  CatchClause.prototype.type = "CatchClause";
}
