var traceTerminal = new Terminal(document.getElementById("traceTerminal")); traceTerminal.refreshEvery(100);

function appendToTraceTerminal(str, color) {
  var scroll = traceTerminal.isScrolledToBottom();
  traceTerminal.buffer.append(str, color);
  if (scroll) {
    traceTerminal.gotoLine(traceTerminal.buffer.length - 1);
    traceTerminal.scrollIntoView();
  }
}

var console_log = console.log;
var console_info = console.info;
var console_warn = console.warn;

console.log = function (str) {
  if (state.logToConsole) {
    console_log.apply(console, arguments);
  }
  appendToTraceTerminal([].join.call(arguments, " "));
};
console.info = function (str) {
  if (state.logToConsole) {
    console_info.apply(console, arguments);
  }
  appendToTraceTerminal([].join.call(arguments, " "), "#666600");
};
console.warn = function (str) {
  if (state.logToConsole) {
    console_warn.apply(console, arguments);
  }
  appendToTraceTerminal([].join.call(arguments, " "), "#FF6700");
};

var frameTerminal = new Terminal(document.getElementById("frameTerminal")); frameTerminal.refreshEvery(100);

function appendToFrameTerminal(str, color) {
  var scroll = frameTerminal.isScrolledToBottom();
  frameTerminal.buffer.append(str, color);
  if (scroll) {
    frameTerminal.gotoLine(frameTerminal.buffer.length - 1);
    frameTerminal.scrollIntoView();
  }
}

var frameWriter = new IndentingWriter(false, function (str){
  appendToFrameTerminal(str);
});

var timeline = new Timeline(document.getElementById("fpsCanvas"));