// Primitive Types: Boolean, int, null, Number, String, uint, void
// Complex Types: Object

function padRight(n, c, s) {
    var str = String(s);
    while (str.length < n) {
        str += c;
    }
    return str;
}

var columnWidth = 12;
var firstColumnWidth = 30;

function padColumn(s) {
  return padRight(columnWidth, ' ', s);
}

function ruler(name) {
    var n = 16;
    var str = padRight(firstColumnWidth - columnWidth, '-', name ? "-- " + name + " " : "");
    while (n--) {
        str += padRight(columnWidth, '-', '');
        if (n > 0) {
            str += "-+-";
        }
    }
    return str;
}

function getValue(x) {
    if (x === null) return "null";
    if (x === undefined) return "undefined";
    if (x === true) return "true";
    if (x === false) return "false";
    if (x === Infinity) return "Infinity";
    if (x === -Infinity) return "-Infinity";
    if (typeof(x) === "number") return x;
    if (typeof(x) === "boolean") return x;
    if (typeof(x) === "string") return "\"" + x + "\"";
    if (typeof(x) === "object") return "{}";
    if (typeof(x) === "function") return "function " + x.name;
    if (isNaN(x)) return "NaN";
}

function describeValue(x) {
    trace([
        padRight(firstColumnWidth, ' ', getValue(x)), typeof x,
        (x !== undefined ? x instanceof Boolean : "N/A"),
        (x !== undefined ? x instanceof Number : "N/A"),
        (x !== undefined ? x instanceof int : "N/A"),
        (x !== undefined ? x instanceof uint : "N/A"),
        (x !== undefined ? x instanceof String : "N/A"),
        (x !== undefined ? x instanceof Object : "N/A"),
        (x !== undefined ? x instanceof Function : "N/A"),
        (x !== undefined ? x is Boolean : "N/A"),
        (x !== undefined ? x is Number : "N/A"),
        (x !== undefined ? x is int : "N/A"),
        (x !== undefined ? x is uint : "N/A"),
        (x !== undefined ? x is String : "N/A"),
        (x !== undefined ? x is Object : "N/A"),
        (x !== undefined ? x is Function : "N/A")
    ].map(padColumn).join(" | "));
}

function coerceBoolean(x: Boolean) {
    describeValue(x);
}

var values = [
  null, undefined,
  true, false, "true", "false",
  -1, 0, 1, 3.5, NaN, Infinity, -Infinity, -0, "0", "08", "1",
  "A",
  (function foo() {})
];

trace(ruler());
trace([padRight(firstColumnWidth, ' ', "value"), "typeof",
       "io Boolean", "io Number", "io int", "io uint", "io String", "io Object", "io Function",
       "is Boolean", "is Number", "is int", "is uint", "is String", "is Object", "is Function"].map(padColumn).join(" | "));

trace(ruler("x"));
values.forEach(describeValue);

trace(ruler("Boolean(x)"));
values.map(function (x) { return Boolean(x); }).forEach(describeValue);

trace(ruler("new Boolean(x)"));
values.map(function (x) { return new Boolean(x); }).forEach(describeValue);

trace(ruler("(x:Boolean)"));
values.map(function (x:Boolean, y, z) { return x; }).forEach(describeValue);

trace(ruler("Number(x)"));
values.map(function (x) { return Number(x); }).forEach(describeValue);

trace(ruler("new Number(x)"));
values.map(function (x) { return new Number(x); }).forEach(describeValue);

trace(ruler("(x:Number)"));
values.map(function (x:Number, y, z) { return x; }).forEach(describeValue);

trace(ruler("String(x)"));
values.map(function (x) { return String(x); }).forEach(describeValue);

trace(ruler("new String(x)"));
values.map(function (x) { return new String(x); }).forEach(describeValue);

trace(ruler("(x:String)"));
values.map(function (x:String, y, z) { return x; }).forEach(describeValue);

trace(ruler("Object(x)"));
values.map(function (x) { return Object(x); }).forEach(describeValue);

trace(ruler("new Object(x)"));
values.map(function (x) { return new Object(x); }).forEach(describeValue);

trace(ruler("(x:Object)"));
values.map(function (x:Object, y, z) { return x; }).forEach(describeValue);