var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AST;
(function (AST) {
    // The top part of this file is copied from escodegen.
    var json = false;
    var escapeless = false;
    var hexadecimal = false;
    var renumber = false;
    var quotes = "double";

    function stringToArray(str) {
        var length = str.length, result = [], i;
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
                } else if (ch === '\x0B') {
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
        escapeStringCacheCount++;
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
            generateNumberCacheCount++;
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
        if ((temp.length < result.length || (hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length < result.length)) && +temp === value) {
            result = temp;
        }
        generateNumberCache[value] = result;
        generateNumberCacheCount++;
        return result;
    }

    var Precedence = {
        Default: 0,
        Sequence: 0,
        Assignment: 1,
        Conditional: 2,
        ArrowFunction: 2,
        LogicalOR: 3,
        LogicalAND: 4,
        BitwiseOR: 5,
        BitwiseXOR: 6,
        BitwiseAND: 7,
        Equality: 8,
        Relational: 9,
        BitwiseSHIFT: 10,
        Additive: 11,
        Multiplicative: 12,
        Unary: 13,
        Postfix: 14,
        Call: 15,
        New: 16,
        Member: 17,
        Primary: 18
    };

    var BinaryPrecedence = {
        '||': Precedence.LogicalOR,
        '&&': Precedence.LogicalAND,
        '|': Precedence.BitwiseOR,
        '^': Precedence.BitwiseXOR,
        '&': Precedence.BitwiseAND,
        '==': Precedence.Equality,
        '!=': Precedence.Equality,
        '===': Precedence.Equality,
        '!==': Precedence.Equality,
        'is': Precedence.Equality,
        'isnt': Precedence.Equality,
        '<': Precedence.Relational,
        '>': Precedence.Relational,
        '<=': Precedence.Relational,
        '>=': Precedence.Relational,
        'in': Precedence.Relational,
        'instanceof': Precedence.Relational,
        '<<': Precedence.BitwiseSHIFT,
        '>>': Precedence.BitwiseSHIFT,
        '>>>': Precedence.BitwiseSHIFT,
        '+': Precedence.Additive,
        '-': Precedence.Additive,
        '*': Precedence.Multiplicative,
        '%': Precedence.Multiplicative,
        '/': Precedence.Multiplicative
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

    function nodesToSource(nodes, precedence, separator) {
        var result = "";
        for (var i = 0; i < nodes.length; i++) {
            result += nodes[i].toSource(precedence);
            if (separator && (i < nodes.length - 1)) {
                result += separator;
            }
        }
        return result;
    }

    function alwaysParenthesize(text) {
        return '(' + text + ')';
    }

    function parenthesize(text, current, should) {
        if (current < should) {
            return '(' + text + ')';
        }
        return text;
    }

    var Node = (function () {
        function Node() {
        }
        Node.prototype.toSource = function (precedence) {
            notImplemented(this.type);
            return "";
        };
        return Node;
    })();
    AST.Node = Node;

    var Statement = (function (_super) {
        __extends(Statement, _super);
        function Statement() {
            _super.apply(this, arguments);
        }
        return Statement;
    })(Node);
    AST.Statement = Statement;

    var Expression = (function (_super) {
        __extends(Expression, _super);
        function Expression() {
            _super.apply(this, arguments);
        }
        return Expression;
    })(Node);
    AST.Expression = Expression;

    var Program = (function (_super) {
        __extends(Program, _super);
        function Program(body) {
            _super.call(this);
            this.body = body;
        }
        return Program;
    })(Node);
    AST.Program = Program;

    var EmptyStatement = (function (_super) {
        __extends(EmptyStatement, _super);
        function EmptyStatement() {
            _super.apply(this, arguments);
        }
        return EmptyStatement;
    })(Statement);
    AST.EmptyStatement = EmptyStatement;

    var BlockStatement = (function (_super) {
        __extends(BlockStatement, _super);
        function BlockStatement(body) {
            _super.call(this);
            this.body = body;
        }
        BlockStatement.prototype.toSource = function (precedence) {
            return "{" + nodesToSource(this.body, precedence) + "}";
        };
        return BlockStatement;
    })(Statement);
    AST.BlockStatement = BlockStatement;

    var ExpressionStatement = (function (_super) {
        __extends(ExpressionStatement, _super);
        function ExpressionStatement(expression) {
            _super.call(this);
            this.expression = expression;
        }
        ExpressionStatement.prototype.toSource = function (precedence) {
            return this.expression.toSource(Precedence.Sequence) + ";";
        };
        return ExpressionStatement;
    })(Statement);
    AST.ExpressionStatement = ExpressionStatement;

    var IfStatement = (function (_super) {
        __extends(IfStatement, _super);
        function IfStatement(test, consequent, alternate) {
            _super.call(this);
            this.test = test;
            this.consequent = consequent;
            this.alternate = alternate;
        }
        IfStatement.prototype.toSource = function (precedence) {
            var result = "if(" + this.test.toSource(Precedence.Sequence) + "){" + this.consequent.toSource(Precedence.Sequence) + "}";
            if (this.alternate) {
                result += "else{" + this.alternate.toSource(Precedence.Sequence) + "}";
            }
            return result;
        };
        return IfStatement;
    })(Statement);
    AST.IfStatement = IfStatement;

    var LabeledStatement = (function (_super) {
        __extends(LabeledStatement, _super);
        function LabeledStatement(label, body) {
            _super.call(this);
            this.label = label;
            this.body = body;
        }
        return LabeledStatement;
    })(Statement);
    AST.LabeledStatement = LabeledStatement;

    var BreakStatement = (function (_super) {
        __extends(BreakStatement, _super);
        function BreakStatement(label) {
            _super.call(this);
            this.label = label;
        }
        BreakStatement.prototype.toSource = function (precedence) {
            var result = "break";
            if (this.label) {
                result += " " + this.label.toSource(Precedence.Default);
            }
            return result + ";";
        };
        return BreakStatement;
    })(Statement);
    AST.BreakStatement = BreakStatement;

    var ContinueStatement = (function (_super) {
        __extends(ContinueStatement, _super);
        function ContinueStatement(label) {
            _super.call(this);
            this.label = label;
        }
        ContinueStatement.prototype.toSource = function (precedence) {
            var result = "continue";
            if (this.label) {
                result += " " + this.label.toSource(Precedence.Default);
            }
            return result + ";";
        };
        return ContinueStatement;
    })(Statement);
    AST.ContinueStatement = ContinueStatement;

    var WithStatement = (function (_super) {
        __extends(WithStatement, _super);
        function WithStatement(object, body) {
            _super.call(this);
            this.object = object;
            this.body = body;
        }
        return WithStatement;
    })(Statement);
    AST.WithStatement = WithStatement;

    var SwitchStatement = (function (_super) {
        __extends(SwitchStatement, _super);
        function SwitchStatement(discriminant, cases, lexical) {
            _super.call(this);
            this.discriminant = discriminant;
            this.cases = cases;
            this.lexical = lexical;
        }
        SwitchStatement.prototype.toSource = function (precedence) {
            return "switch(" + this.discriminant.toSource(Precedence.Sequence) + "){" + nodesToSource(this.cases, Precedence.Default, ";") + "};";
        };
        return SwitchStatement;
    })(Statement);
    AST.SwitchStatement = SwitchStatement;

    var ReturnStatement = (function (_super) {
        __extends(ReturnStatement, _super);
        function ReturnStatement(argument) {
            _super.call(this);
            this.argument = argument;
        }
        ReturnStatement.prototype.toSource = function (precedence) {
            var result = "return ";
            if (this.argument) {
                result += this.argument.toSource(Precedence.Sequence);
            }
            return result + ";";
        };
        return ReturnStatement;
    })(Statement);
    AST.ReturnStatement = ReturnStatement;

    var ThrowStatement = (function (_super) {
        __extends(ThrowStatement, _super);
        function ThrowStatement(argument) {
            _super.call(this);
            this.argument = argument;
        }
        ThrowStatement.prototype.toSource = function (precedence) {
            return "throw " + this.argument.toSource(Precedence.Sequence) + ";";
        };
        return ThrowStatement;
    })(Statement);
    AST.ThrowStatement = ThrowStatement;

    var TryStatement = (function (_super) {
        __extends(TryStatement, _super);
        function TryStatement(block, handlers, guardedHandlers, finalizer) {
            _super.call(this);
            this.block = block;
            this.handlers = handlers;
            this.guardedHandlers = guardedHandlers;
            this.finalizer = finalizer;
        }
        return TryStatement;
    })(Statement);
    AST.TryStatement = TryStatement;

    var WhileStatement = (function (_super) {
        __extends(WhileStatement, _super);
        function WhileStatement(test, body) {
            _super.call(this);
            this.test = test;
            this.body = body;
        }
        WhileStatement.prototype.toSource = function (precedence) {
            return "while(" + this.test.toSource(Precedence.Sequence) + "){" + this.body.toSource(Precedence.Sequence) + "}";
        };
        return WhileStatement;
    })(Statement);
    AST.WhileStatement = WhileStatement;

    var DoWhileStatement = (function (_super) {
        __extends(DoWhileStatement, _super);
        function DoWhileStatement(body, test) {
            _super.call(this);
            this.body = body;
            this.test = test;
        }
        return DoWhileStatement;
    })(Statement);
    AST.DoWhileStatement = DoWhileStatement;

    var ForStatement = (function (_super) {
        __extends(ForStatement, _super);
        function ForStatement(init, test, update, body) {
            _super.call(this);
            this.init = init;
            this.test = test;
            this.update = update;
            this.body = body;
        }
        return ForStatement;
    })(Statement);
    AST.ForStatement = ForStatement;

    var ForInStatement = (function (_super) {
        __extends(ForInStatement, _super);
        function ForInStatement(left, right, body, each) {
            _super.call(this);
            this.left = left;
            this.right = right;
            this.body = body;
            this.each = each;
        }
        return ForInStatement;
    })(Statement);
    AST.ForInStatement = ForInStatement;

    var DebuggerStatement = (function (_super) {
        __extends(DebuggerStatement, _super);
        function DebuggerStatement() {
            _super.apply(this, arguments);
        }
        return DebuggerStatement;
    })(Statement);
    AST.DebuggerStatement = DebuggerStatement;

    var Declaration = (function (_super) {
        __extends(Declaration, _super);
        function Declaration() {
            _super.apply(this, arguments);
        }
        return Declaration;
    })(Statement);
    AST.Declaration = Declaration;

    var FunctionDeclaration = (function (_super) {
        __extends(FunctionDeclaration, _super);
        function FunctionDeclaration(id, params, defaults, rest, body, generator, expression) {
            _super.call(this);
            this.id = id;
            this.params = params;
            this.defaults = defaults;
            this.rest = rest;
            this.body = body;
            this.generator = generator;
            this.expression = expression;
        }
        return FunctionDeclaration;
    })(Declaration);
    AST.FunctionDeclaration = FunctionDeclaration;

    var VariableDeclaration = (function (_super) {
        __extends(VariableDeclaration, _super);
        function VariableDeclaration(declarations, kind) {
            _super.call(this);
            this.declarations = declarations;
            this.kind = kind;
        }
        VariableDeclaration.prototype.toSource = function (precedence) {
            return this.kind + " " + nodesToSource(this.declarations, precedence, ",") + ";";
        };
        return VariableDeclaration;
    })(Declaration);
    AST.VariableDeclaration = VariableDeclaration;

    var VariableDeclarator = (function (_super) {
        __extends(VariableDeclarator, _super);
        function VariableDeclarator(id, init) {
            _super.call(this);
            this.id = id;
            this.init = init;
        }
        VariableDeclarator.prototype.toSource = function (precedence) {
            var result = this.id.toSource(Precedence.Assignment);
            if (this.init) {
                result += this.init.toSource(Precedence.Assignment);
            }
            return result;
        };
        return VariableDeclarator;
    })(Node);
    AST.VariableDeclarator = VariableDeclarator;

    var Identifier = (function (_super) {
        __extends(Identifier, _super);
        function Identifier(name) {
            _super.call(this);
            this.name = name;
        }
        Identifier.prototype.toSource = function (precedence) {
            return this.name;
        };
        return Identifier;
    })(Expression);
    AST.Identifier = Identifier;

    var Literal = (function (_super) {
        __extends(Literal, _super);
        function Literal(value) {
            _super.call(this);
            this.value = value;
        }
        Literal.prototype.toSource = function (precedence) {
            return toLiteralSource(this.value);
        };
        return Literal;
    })(Expression);
    AST.Literal = Literal;

    var ThisExpression = (function (_super) {
        __extends(ThisExpression, _super);
        function ThisExpression() {
            _super.apply(this, arguments);
        }
        ThisExpression.prototype.toSource = function (precedence) {
            return "this";
        };
        return ThisExpression;
    })(Expression);
    AST.ThisExpression = ThisExpression;

    var ArrayExpression = (function (_super) {
        __extends(ArrayExpression, _super);
        function ArrayExpression(elements) {
            _super.call(this);
            this.elements = elements;
        }
        ArrayExpression.prototype.toSource = function (precedence) {
            return "[" + nodesToSource(this.elements, Precedence.Assignment, ",") + "]";
        };
        return ArrayExpression;
    })(Expression);
    AST.ArrayExpression = ArrayExpression;

    var ObjectExpression = (function (_super) {
        __extends(ObjectExpression, _super);
        function ObjectExpression(properties) {
            _super.call(this);
            this.properties = properties;
        }
        ObjectExpression.prototype.toSource = function (precedence) {
            return "{" + nodesToSource(this.properties, Precedence.Sequence, ",") + "}";
        };
        return ObjectExpression;
    })(Expression);
    AST.ObjectExpression = ObjectExpression;

    var FunctionExpression = (function (_super) {
        __extends(FunctionExpression, _super);
        function FunctionExpression(id, params, defaults, rest, body, generator, expression) {
            _super.call(this);
            this.id = id;
            this.params = params;
            this.defaults = defaults;
            this.rest = rest;
            this.body = body;
            this.generator = generator;
            this.expression = expression;
        }
        return FunctionExpression;
    })(Expression);
    AST.FunctionExpression = FunctionExpression;

    var SequenceExpression = (function (_super) {
        __extends(SequenceExpression, _super);
        function SequenceExpression(expressions) {
            _super.call(this);
            this.expressions = expressions;
        }
        return SequenceExpression;
    })(Expression);
    AST.SequenceExpression = SequenceExpression;

    var UnaryExpression = (function (_super) {
        __extends(UnaryExpression, _super);
        function UnaryExpression(operator, prefix, argument) {
            _super.call(this);
            this.operator = operator;
            this.prefix = prefix;
            this.argument = argument;
        }
        UnaryExpression.prototype.toSource = function (precedence) {
            var argument = this.argument.toSource(Precedence.Unary);
            var result = this.prefix ? this.operator + argument : argument + this.operator;
            result = " " + result;
            result = parenthesize(result, Precedence.Unary, precedence);
            return result;
        };
        return UnaryExpression;
    })(Expression);
    AST.UnaryExpression = UnaryExpression;

    var BinaryExpression = (function (_super) {
        __extends(BinaryExpression, _super);
        function BinaryExpression(operator, left, right) {
            _super.call(this);
            this.operator = operator;
            this.left = left;
            this.right = right;
        }
        BinaryExpression.prototype.toSource = function (precedence) {
            var currentPrecedence = BinaryPrecedence[this.operator];
            var result = this.left.toSource(currentPrecedence) + this.operator + this.right.toSource(currentPrecedence + 1);
            return parenthesize(result, currentPrecedence, precedence);
        };
        return BinaryExpression;
    })(Expression);
    AST.BinaryExpression = BinaryExpression;

    var AssignmentExpression = (function (_super) {
        __extends(AssignmentExpression, _super);
        function AssignmentExpression(operator, left, right) {
            _super.call(this);
            this.operator = operator;
            this.left = left;
            this.right = right;
        }
        AssignmentExpression.prototype.toSource = function (precedence) {
            var result = this.left.toSource(Precedence.Assignment) + this.operator + this.right.toSource(Precedence.Assignment);
            return parenthesize(result, Precedence.Assignment, precedence);
        };
        return AssignmentExpression;
    })(Expression);
    AST.AssignmentExpression = AssignmentExpression;

    var UpdateExpression = (function (_super) {
        __extends(UpdateExpression, _super);
        function UpdateExpression(operator, argument, prefix) {
            _super.call(this);
            this.operator = operator;
            this.argument = argument;
            this.prefix = prefix;
        }
        return UpdateExpression;
    })(Expression);
    AST.UpdateExpression = UpdateExpression;

    var LogicalExpression = (function (_super) {
        __extends(LogicalExpression, _super);
        function LogicalExpression(operator, left, right) {
            _super.call(this, operator, left, right);
        }
        return LogicalExpression;
    })(BinaryExpression);
    AST.LogicalExpression = LogicalExpression;

    var ConditionalExpression = (function (_super) {
        __extends(ConditionalExpression, _super);
        function ConditionalExpression(test, consequent, alternate) {
            _super.call(this);
            this.test = test;
            this.consequent = consequent;
            this.alternate = alternate;
        }
        ConditionalExpression.prototype.toSource = function (precedence) {
            return this.test.toSource(Precedence.LogicalOR) + "?" + this.consequent.toSource(Precedence.Assignment) + ":" + this.alternate.toSource(Precedence.Assignment);
        };
        return ConditionalExpression;
    })(Expression);
    AST.ConditionalExpression = ConditionalExpression;

    var NewExpression = (function (_super) {
        __extends(NewExpression, _super);
        function NewExpression(callee, _arguments) {
            _super.call(this);
            this.callee = callee;
            this.arguments = _arguments;
        }
        NewExpression.prototype.toSource = function (precedence) {
            return "new " + this.callee.toSource(precedence) + "(" + nodesToSource(this.arguments, precedence, ",") + ")";
        };
        return NewExpression;
    })(Expression);
    AST.NewExpression = NewExpression;

    var CallExpression = (function (_super) {
        __extends(CallExpression, _super);
        function CallExpression(callee, _arguments) {
            _super.call(this);
            this.callee = callee;
            this.arguments = _arguments;
        }
        CallExpression.prototype.toSource = function (precedence) {
            return this.callee.toSource(precedence) + "(" + nodesToSource(this.arguments, precedence, ",") + ")";
        };
        return CallExpression;
    })(Expression);
    AST.CallExpression = CallExpression;

    var MemberExpression = (function (_super) {
        __extends(MemberExpression, _super);
        function MemberExpression(object, property, computed) {
            _super.call(this);
            this.object = object;
            this.property = property;
            this.computed = computed;
        }
        MemberExpression.prototype.toSource = function (precedence) {
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
        };
        return MemberExpression;
    })(Expression);
    AST.MemberExpression = MemberExpression;

    var Property = (function (_super) {
        __extends(Property, _super);
        function Property(key, value, kind) {
            _super.call(this);
            this.key = key;
            this.value = value;
            this.kind = kind;
        }
        Property.prototype.toSource = function (precedence) {
            return this.key.toSource(precedence) + ":" + this.value.toSource(precedence);
        };
        return Property;
    })(Node);
    AST.Property = Property;

    var SwitchCase = (function (_super) {
        __extends(SwitchCase, _super);
        function SwitchCase(test, consequent) {
            _super.call(this);
            this.test = test;
            this.consequent = consequent;
        }
        SwitchCase.prototype.toSource = function (precedence) {
            var result = this.test ? "case " + this.test.toSource(precedence) : "default";
            return result + ": " + nodesToSource(this.consequent, precedence, ";");
        };
        return SwitchCase;
    })(Node);
    AST.SwitchCase = SwitchCase;

    var CatchClause = (function (_super) {
        __extends(CatchClause, _super);
        function CatchClause(param, guard, body) {
            _super.call(this);
            this.param = param;
            this.guard = guard;
            this.body = body;
        }
        return CatchClause;
    })(Node);
    AST.CatchClause = CatchClause;

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
})(AST || (AST = {}));
