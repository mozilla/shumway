if (!jsGlobal.performance) { jsGlobal.performance = {}; }
if (!jsGlobal.performance.now) { jsGlobal.performance.now = Date.now; }

var container = document.getElementById("container");
var Profiler = Shumway.Tools.Profiler;
var TraceLogger = Shumway.Tools.Profiler.TraceLogger;

var controller = new Profiler.Controller(container);
var traceLogger = new TraceLogger.TraceLogger("data/tracelogger/");

function load(name) {
  traceLogger.loadPage(name, onLoad, onProgress);
}

function onLoad(err, threads) {
  var self = this;
  setTimeout(function() {
    setProgress(0);
    setModalVisibility(false);
    controller.createProfile(self.buffers);
  }, 400);
}

function onProgress(info) {
  setProgress(Math.round(info.threadFilesLoaded * 100 / info.threadFilesTotal));
}

/**
 * User interface
 */

var engine = TLData.engines[0];
var suite = TLData.suites[0];
var script = suite.scripts[0];

var $engines = $("#engines-menu");
var $suites = $("#suites-menu");
var $scripts = $("#scripts-menu");

initEngines();
initSuites();
initScripts();

function initEngines(refresh) {
  $engines.empty();
  for(var i = 0; i < TLData.engines.length; i++) {
    $engines.append($("<option>").text(TLData.engines[i].name).attr("value", TLData.engines[i].name));
  }
  !refresh || $engines.selectpicker("refresh");
}

function initSuites(refresh) {
  $suites.empty();
  for(var i = 0; i < TLData.suites.length; i++) {
    $suites.append($("<option>").text(TLData.suites[i].name).attr("value", TLData.suites[i].name));
  }
  !refresh || $suites.selectpicker("refresh");
}

function initScripts(refresh) {
  $scripts.empty();
  for(var i = 0; i < suite.scripts.length; i++) {
    $scripts.append($("<option>").text(suite.scripts[i].name).attr("value", suite.scripts[i].name));
  }
  !refresh || $scripts.selectpicker("refresh");
}

$(".selectpicker").selectpicker({ width: "auto" });
$("#progress").modal({ backdrop: "static", keyboard: false, show: false });

$engines.on("change", function() {
  selectEngine($(this).val());
});
$suites.on("change", function() {
  selectSuite($(this).val());
});
$scripts.on("change", function() {
  selectScript($(this).val());
});

$("#submit").on("click", function() {
  setModalVisibility(true);
  load("data-" + suite.name + "-" + engine.name + "-" + script.name + ".json");
});

function selectEngine(name) {
  for(var i = 0; i < TLData.engines.length; i++) {
    if (TLData.engines[i].name === name) {
      if (engine !== TLData.engines[i]) {
        engine = TLData.engines[i];
      }
      break;
    }
  }
}

function selectSuite(name) {
  for(var i = 0; i < TLData.suites.length; i++) {
    if (TLData.suites[i].name === name) {
      if (suite !== TLData.suites[i]) {
        suite = TLData.suites[i];
        script = suite.scripts[0];
        initScripts(true);
      }
      break;
    }
  }
}

function selectScript(name) {
  for(var i = 0; i < suite.scripts.length; i++) {
    if (suite.scripts[i].name === name) {
      if (script !== suite.scripts[i]) {
        script = suite.scripts[i];
      }
      break;
    }
  }
}

function setProgress(percent) {
  var $bar = $("#progress-bar > .progress-bar");
  $bar.width(percent + "%");
  $("span", $bar).text(percent + "% Complete");
}

function setModalVisibility(visible) {
  $("#progress").modal(visible ? "show" : "hide")
}
