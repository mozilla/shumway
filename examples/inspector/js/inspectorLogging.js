var traceTerminal;
function setLogOptions(logToConsole, logToDebugPanel, traceTerminal_) {
  if (logToDebugPanel) {
    traceTerminal = traceTerminal_;
    console.log = function (str) {
      if (logToConsole) {
        console_log.apply(console, arguments);
      }
      appendToTraceTerminal([].join.call(arguments, " "));
    };
    console.info = function (str) {
      if (logToConsole) {
        console_info.apply(console, arguments);
      }
      appendToTraceTerminal([].join.call(arguments, " "), "#666600");
    };
    console.warn = function (str) {
      if (logToConsole) {
        console_warn.apply(console, arguments);
      }
      appendToTraceTerminal([].join.call(arguments, " "), "#FF6700");
    };
    console.error = function (str) {
      if (state.logToConsole) {
        console_error.apply(console, arguments);
      }
      appendToTraceTerminal([].join.call(arguments, " "), "#AA0000");
    };
  } else if (logToConsole) {
    console.info = console_info;
    console.log = console_log;
    console.warn = console_warn;
    console.error = console_error;
  } else {
    console.info = console.log = console.warn = console.error = function () {};
  }
}

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
var console_error = console.error;
