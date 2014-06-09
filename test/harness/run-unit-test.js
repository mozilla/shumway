"use strict";

if (typeof scriptArgs === 'undefined') {
	var scriptArgs = arguments;
}

if (scriptArgs.length === 0) {
	print('\nUsage:\n' +
		   '\t' + thisFilename() + ' [path-to-test-in-test-dir]\n' +
		   '\t' + '(.js file extension is optional.)\n' +
		   '\t' + 'To see passing tests output, prepend SHU_LOG_LEVEL=4.\n' +
		   '\nExample:\n' +
		   '\t' + 'SHU_LOG_LEVEL=4 ' + thisFilename() + ' unit/stage');
	quit(1);
}

if (typeof dateNow === 'undefined') {
	dateNow = Date.now;
}
var initStart = dateNow();

var CanvasRenderingContext2D;
if (!CanvasRenderingContext2D) {
	CanvasRenderingContext2D = function(){};
	CanvasRenderingContext2D.prototype = {
		save: function() {}
	}
}

function fixPath(path) {
	while (path.indexOf('../') === 0) {
		path = path.substr(3);
	}
	return path;
}

var self = this;
self.addEventListener = function(){};

function importScripts(scripts) {
	if (typeof scripts === 'string') {
		return load(fixPath(scripts));
	}
	scripts.forEach(function (script) {
		load(fixPath(script));
	});
}

function loadScript(path, callback) {
	load(fixPath(path));
	callback && callback();
}

function setTimeout() {}


function addLogPrefix(prefix, args) {
	return [].concat.apply([prefix], args);
}

var logLevel = parseInt(environment.SHU_LOG_LEVEL)|0;
var console = {
	info: function() {
		if (logLevel > 3) {
			print.apply(this, addLogPrefix('INFO: ', arguments));
		}
	},
	log: function() {
		if (logLevel > 2) {
			print.apply(this, arguments);
		}
	},
	warn: function() {
		if (logLevel > 1) {
			print.apply(this, addLogPrefix('WARN: ', arguments));
		}
	},
	error: function() {
		print.apply(this, addLogPrefix('ERR : ', arguments));
	},
	time: function(id) {
		this.timestamps[id] = dateNow();
    if (logLevel > 3) {
      print(id + ": timer started");
    }
	},
	timeEnd: function(id) {
		if (this.timestamps[id] && logLevel > 3) {
			print(id + ": " + (dateNow() - this.timestamps[id]) + 'ms');
		}
	},
	timestamps: {}
}

function loadPackage(id) {
  var sources = read('src/shumway' + id + '.package').split('\n');
  sources.forEach(function (path) {
    path = path.trim();
    if (path.length === 0 || path[0] === '#') {
      return;
    }
    load(path);
    // print(path);
  });
}
function loadEngine() {
  loadPackage('.parser');
  loadPackage('.player');
}

loadEngine();

load('examples/inspector/js/unit.js');

var executeUnitTests = function(avm2) {
	for (var i = 0; i < scriptArgs.length; i++) {
		var testFile = scriptArgs[i];
		if (testFile.substr(testFile.length - 3) !== '.js') {
			testFile += '.js';
		}
    executeTestFile(testFile);
	}
}

var unitTests;
var testFiles;
function executeTestFile(testFile) {
  unitTests = [];
  testFiles = [];
  var start = dateNow();
  try {
    load(fixPath(testFile));
    if (testFiles.length) {
      var basePath = testFile.substr(0, testFile.lastIndexOf('/') + 1);
      testFiles.forEach(function(file) { executeTestFile(basePath + file)});
      return;
    }
    print('\nRunning tests in file ' + testFile);
    unitTests.forEach(function(test) {test(avm2)});
  } catch (e) {
    print('Exception encountered while running ' + testFile + ':');
    print(e);
    print('stack:\n', e.stack);
  }
  print(testFile + ': Complete (' + Math.round((dateNow() - start) * 100) / 100 + 'ms + ' +
        initDuration + 'ms startup)');
}

// Shumway.AVM2.Runtime.traceExecution.value = true;
Shumway.AVM2.Runtime.globalMultinameAnalysis.value = true;

var avm2Root = "src/avm2/";
var builtinPath = avm2Root + "generated/builtin/builtin.abc";

// different playerglobals can be used here
var playerglobalInfo = {
  abcs: "build/playerglobal/playerglobal.abcs",
  catalog: "build/playerglobal/playerglobal.json"
};

var AVM2 = Shumway.AVM2.Runtime.AVM2;
var avm2 = null;

function loadPlayerglobal(abcsPath, catalogPath) {
  var playerglobal = Shumway.AVM2.Runtime.playerglobal = {
    abcs: read(abcsPath, 'binary').buffer,
    map: Object.create(null),
    scripts: Object.create(null)
  };
  var catalog = JSON.parse(read(catalogPath));
  console.time("Execute playerglobals.abc");
  for (var i = 0; i < catalog.length; i++) {
    var abc = catalog[i];
    playerglobal.scripts[abc.name] = abc;
    if (typeof abc.defs === 'string') {
      playerglobal.map[abc.defs] = abc.name;
      print(abc.defs)
    } else {
      for (var j = 0; j < abc.defs.length; j++) {
        var def = abc.defs[j];
        playerglobal.map[def] = abc.name;
      }
    }
  }
  console.timeEnd("Execute playerglobals.abc");
}

function createAVM2(builtinPath, libraryPathInfo, sysMode, appMode) {
  var buffer = read(builtinPath, 'binary');
  AVM2.initialize(sysMode, appMode, null);
  avm2 = AVM2.instance;
  console.time("Execute builtin.abc");
  // Avoid loading more Abcs while the builtins are loaded
  avm2.builtinsLoaded = false;
  avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));
  avm2.builtinsLoaded = true;
  console.timeEnd("Execute builtin.abc");
  loadPlayerglobal(libraryPathInfo.abcs, libraryPathInfo.catalog);
}
var initDuration = Math.round((dateNow() - initStart) * 100)/100;
createAVM2(builtinPath, playerglobalInfo, EXECUTION_MODE.INTERPRET, EXECUTION_MODE.INTERPRET);
var flash = Shumway.AVM2.AS.flash;
executeUnitTests(avm2);

