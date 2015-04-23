/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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
/*jslint node: true */

'use strict';

var exec = require('child_process').exec;

function parseOptions() {
  var yargs = require('yargs')
    .usage('Usage: $0 (<pid>|-n <process_name>) [-t <timeout>]')
    .boolean(['help', 'children'])
    .string(['name', 'timeout'])
    .alias('name', 'n').alias('help', 'h').alias('timeout', 't').alias('children', 'c')
    .describe('help', 'Show this help message')
    .describe('name', 'Show all process with specified name')
    .describe('children', 'Show all sub-process details')
    .describe('timeout', 'Refresh interval in ms');
  var result = yargs.argv;
  if (result.help) {
    yargs.showHelp();
    process.exit(0);
  }
  return result;
}

var firstSync = true;
function syncProcesses(state, procs, level) {
  var newStates = [];
  procs.forEach(function (proc) {
    var procState = state.filter(function (procState) { return procState.pid === proc.pid && procState.active; })[0];
    if (procState) {
      procState.previousTime = procState.currentTime;
      procState.currentTime = proc.time;
      procState.minMemory = Math.min(procState.minMemory, proc.memory);
      procState.maxMemory = Math.max(procState.maxMemory, proc.memory);
      procState.currentMemory = proc.memory;
    } else {
      procState = {
        pid: proc.pid,
        name: proc.name,
        active: true,
        level: level,
        initializationTimestamp: Date.now(),
        startTime: firstSync ? proc.time : 0,
        previousTime: proc.time,
        currentTime: proc.time,
        minMemory: proc.memory,
        maxMemory: proc.memory,
        currentMemory: proc.memory,
        children: []
      };
      newStates.push(procState);
    }
    syncProcesses(procState.children, proc.children, level + 1);
  });
  state.forEach(function (procState) {
    if (!procState.active) {
      return;
    }
    if (procs.every(function (proc) { return procState.pid !== proc.pid; })) {
      var queue = [procState];
      while (queue.length > 0) {
        var item = queue.shift();
        item.active = false;
        item.previousTime = item.currentTime;
        Array.prototype.push.apply(queue, item.children);
      }
    }
  });
  Array.prototype.push.apply(state, newStates);
}

function printTime(time) {
  return Math.floor(time / 60) + ':' + (100 + (time % 60)).toFixed(1).substr(1);
}

function printProcess(procState, delta) {
  var result = [];
  var descendants = [];
  var queue = [procState];
  while (queue.length > 0) {
    var item = queue.shift();
    descendants.push(item);
    Array.prototype.push.apply(queue, item.children);
  }
  var totalMinMemory = 0, totalMaxMemory = 0, totalMemory = 0;
  var totalTime = 0, totalTimeDelta = 0;
  descendants.forEach(function (item) {
    totalMinMemory += item.active ? item.minMemory : 0;
    totalMaxMemory += item.active ? item.maxMemory : 0;
    totalMemory += item.active ? item.currentMemory : 0;
    totalTime += item.currentTime - item.startTime;
    totalTimeDelta += item.currentTime - item.previousTime;
  });
  result.push(procState.name + '(' + procState.pid+ ') ' +
    printTime(totalTime) + ' ' + (totalTimeDelta * 100 / delta).toFixed(2) + '% ' +
    (totalMemory / 1000000).toFixed(1) + 'M');
  if (childrenDetails) {
    descendants.forEach(function (item) {
      var indent = ' ';
      for (var i = -1; i < item.level; i++) {
        indent += '. ';
      }
      result.push(indent + item.name + '(' + item.pid + (item.active ? '' : ',inactive') + ') ' +
        printTime(item.currentTime - item.startTime) + ' ' +
        ((item.currentTime - item.previousTime) * 100 / delta).toFixed(2) + '% ' +
        (item.currentMemory / 1000000).toFixed(1) + 'M');
    });
  }
  return result;
}

var childrenDetails = false;
var procsState = [];
var lastTimestamp = Date.now();
var lastPrintHeight = 0;
function syncStats(procs) {
  syncProcesses(procsState, procs, 0);
  firstSync = false;
  var timestamp = Date.now();
  var timeDelta = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  var lines = [];
  procsState.forEach(function (procState) {
    if (!procState.active) {
      return;
    }
    Array.prototype.push.apply(lines, printProcess(procState, timeDelta));
  });

  var prefix = '';
  for (var i = 0; i < lastPrintHeight; i++) {
    prefix += '\x1B[A\x1B[K';
  }

  lines.forEach(function (line) {
    console.log(prefix + line);
    prefix = '';
  });
  lastPrintHeight = lines.length;
}

var filter;
function updateProcessStats() {
  function parsePSLine(line) {
    var i = 0, j, result = [];
    while (i < line.length && result.length < 4) {
      while (line[i] === ' ') {
        i++;
      }
      j = i;
      while (i < line.length && line[i] !== ' ') {
        i++;
      }
      result.push(line.substring(j, i));
    }
    if (result.length < 4 || result[0] === 'PID') {
      return null;
    }
    result.push(line.substring(i).trim());
    return result;
  }

  var cmd = 'ps -xwwo pid,ppid,time,rss,ucomm';
  exec(cmd, function (error, stdout, stderr) {
    // Parse ps output.
    var lines = stdout.split('\n').map(function (line) {
      var cells = parsePSLine(line);
      if (!cells) {
        return { pid: -1, parentid: -1 }; // marking as invalid entry
      }
      var timeParts = cells[2].split(':');
      var seconds = +timeParts.pop() + 60 * timeParts.pop();
      return {
        pid: +cells[0],
        parentid: +cells[1],
        time: seconds,
        memory: 1024 * cells[3],
        name: cells[4],
        children: []
      };
    });
    // Builds trees.
    var map = Object.create(null);
    lines.forEach(function (line) {
      if (line.pid < 0) {
        return;
      }
      map[line.pid] = line;
    });
    var roots = [];
    lines.forEach(function (line) {
      if (map[line.parentid]) {
        map[line.parentid].children.push(line);
      } else {
        roots.push(line);
      }
    });

    var procs = [];
    if (typeof filter === 'number') {
      // Filtering by pid
      if (map[filter]) {
        procs.push(map[filter]);
      }
    } else {
      // Scanning all processes and matching to filter
      var queue = roots.slice(0);
      while (queue.length > 0) {
        var item = queue.shift();
        if (item.name === filter) {
          procs.push(item);
        } else {
          Array.prototype.push.apply(queue, item.children);
        }
      }
    }
    syncStats(procs);
  });
}

function main(yargs) {
  var args = yargs._;
  filter = +args[0] || yargs.name;
  childrenDetails = yargs.children;
  if (!filter) {
    throw new Error('Invalid filter please specify pid or the name parameter');
  }
  updateProcessStats();
  var interval = yargs.timeout | 300;
  if (interval > 0) {
    setInterval(updateProcessStats, interval);
  }
}

main(parseOptions());