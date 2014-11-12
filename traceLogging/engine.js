if (typeof window === 'undefined') {
  var running = []
  function setTimeout(func, time) {
    running[running.length] = func;
    if (running.length == 1) {
      for (var i = 0; i < running.length; i++) {
        running[i]();
      }
      running = [];
    }
  };
}

function TextToColor(textmap) {
  var colors = ["#0044ff", "#8c4b00", "#cc5c33", "#ff80c4", "#ffbfd9", "#ff8800", "#8c5e00", "#adcc33", "#b380ff", "#bfd9ff", "#ffaa00", "#8c0038", "#bf8f30", "#f780ff", "#cc99c9", "#aaff00", "#000073", "#452699", "#cc8166", "#cca799", "#000066", "#992626", "#cc6666", "#ccc299", "#ff6600", "#526600", "#992663", "#cc6681", "#99ccc2", "#ff0066", "#520066", "#269973", "#61994d", "#739699", "#ffcc00", "#006629", "#269199", "#94994d", "#738299", "#ff0000", "#590000", "#234d8c", "#8c6246", "#7d7399", "#ee00ff", "#00474d", "#8c2385", "#8c7546", "#7c8c69", "#eeff00", "#4d003d", "#662e1a", "#62468c", "#8c6969", "#6600ff", "#4c2900", "#1a6657", "#8c464f", "#8c6981", "#44ff00", "#401100", "#1a2466", "#663355", "#567365", "#d90074", "#403300", "#101d40", "#59562d", "#66614d", "#cc0000", "#002b40", "#234010", "#4c2626", "#4d5e66", "#00a3cc", "#400011", "#231040", "#4c3626", "#464359", "#0000bf", "#331b00", "#80e6ff", "#311a33", "#4d3939", "#a69b00", "#003329", "#80ffb2", "#331a20", "#40303d", "#00a658", "#40ffd9", "#ffc480", "#ffe1bf", "#332b26", "#8c2500", "#9933cc", "#80fff6", "#ffbfbf", "#303326", "#005e8c", "#33cc47", "#b2ff80", "#c8bfff", "#263332", "#00708c", "#cc33ad", "#ffe680", "#f2ffbf", "#262a33", "#388c00", "#335ccc", "#8091ff", "#bfffd9"]

  this.map = {}

  var usedColors = 0;
  for(var i=0; i<textmap.length; i++) {
    var color = "";
    switch(textmap[i]) {
      case "IonCompilation": color = "green"; break;
      case "IonLinking": color = "green"; break;
      case "YarrCompile": color = "#BE8CFF"; break;
      case "YarrJIT": color = "#BE8CFF"; break;
      case "YarrInterpreter": color = "#BE8CFF"; break;
      case "MinorGC": color = "#CCCCCC"; break;
      case "GC": color = "#666666"; break;
      case "GCSweeping": color = "#666666"; break;
      case "GCAllocation": color = "#666666"; break;
      case "Interpreter": color = "#FFFFFF"; break;
      case "Baseline": color = "#FFE75E"; break;
      case "IonMonkey": color = "#54D93D"; break;
      case "ParserCompileScript": color = "#DB0000"; break;
      case "ParserCompileLazy": color = "#A30000"; break;
      case "ParserCompileFunction": color = "#CC8585"; break;
      case "VM": color = "#00aaff"; break;
      default:
        if (textmap[i].substring(0,6) == "script")
          color = "white";
        else
          color = colors[usedColors++];
        break;
    }
    this.map[textmap[i]] = color;
  }
}

TextToColor.prototype.getColor = function(text) {
  return this.map[text];
}

TextToColor.prototype.getColorMap = function() {
  return this.map;
}

function DataTree(buffer, textmap) {
  this.buffer = buffer;
  this.textmap = textmap;
  this.view = new DataView(buffer);
  this.colors = new TextToColor(textmap);
  /* Tree is saved like:
   *
   * [position: start, stop, textId, hasChilds, nextId]
   *
   * - position: is the position in the binary file (is not saved, reported here to understand the tree better).
   * - start: a timestamp
   * - stop: a timestamp
   * - textId: refers to the information
   * - hasChilds: if this leaf has a child (if it does, the first child is located at position+1)
   * - nextId: refers to the next child of the parent node.
   *
   *                                          [0: ..., ..., ..., 1, 0]
   *                                           |
   *                     [1: ..., ..., ..., 1, 10] ---> [10: ..., ..., ..., 1, 12] ---> [12: ..., ..., ..., 0, 0]
   *                       |                             |
   *  [2: ..., ..., ..., 1, 2]                    [11: ..., ..., ..., 0, 0]
   *   |
   *  ...
   *
   * default layout:
   * start: 64bits
   * stop: 64bits
   * textId: 31bits
   * hasChilds: 1bit
   * nextId: 32bits
   */
  this.itemSize = 8+8+4+4;
}

DataTree.prototype.size = function() {
  return this.buffer.byteLength;
}

DataTree.prototype.head = function() {
  return 0;
}

DataTree.prototype.start = function(id) {
  var p1 = this.view.getUint32(id * this.itemSize);
  var p2 = this.view.getUint32(id * this.itemSize + 4);
  return p1*4294967295+p2
}

DataTree.prototype.stop = function(id) {
  if (id == 0)
      return this.stop(this.childs(id)[this.childs(id).length - 1]);
  var p1 = this.view.getUint32(id * this.itemSize + 8);
  var p2 = this.view.getUint32(id * this.itemSize + 12);
  return p1*4294967295+p2
}

DataTree.prototype.textId = function(id) {
  var value = this.view.getUint32(id * this.itemSize + 16);
  return value >>> 1
}

DataTree.prototype.text = function(id) {
  return this.textmap[this.textId(id)]
}

DataTree.prototype.color = function(id) {
  return this.colors.getColor(this.text(id));
}

DataTree.prototype.nextId = function(id) {
  return this.view.getUint32(id * this.itemSize + 20);
}

DataTree.prototype.hasNextId = function(id) {
  return this.nextId(id) != 0;
}

DataTree.prototype.hasChilds = function(id) {
  var value = this.view.getUint32(id * this.itemSize + 16);
  return value%2 == 1
}

DataTree.prototype.firstChild = function(id) {
  return id + 1;
}

DataTree.prototype.childs = function(id) {
  if (!this.hasChilds(id))
    return [];

  var childs = []  
  var i = this.firstChild(id);
  while (true) {
    childs[childs.length] = i;

    if (!this.hasNextId(i))
      break;

    i = this.nextId(i);
  }
  return childs;
}

function CreateDataTree(size, start, stop) {
  this.buffer = new ArrayBuffer(size);
  this.tree = new DataTree(this.buffer, {});

  this._writeStart(0, start);
  this._writeStop(0, stop);
  this._writeTextId(0, 0);

  this.i = 1;
}

CreateDataTree.prototype.size = function() {
  return this.i*this.tree.itemSize;
}

CreateDataTree.prototype.addChild = function(parent, start, stop, textId) {
  var hasChilds = this.tree.hasChilds(parent);
  if (hasChilds) {
    var nextId = parent + 1;
    while(this.tree.nextId(nextId) != 0) {
      nextId = this.tree.nextId(nextId);
    }
    this._writeNextId(nextId, this.i);
  } else {
    if (this.i != parent + 1)
      throw "impossible adding child to "+parent+". Id is already:"+this.i;

    this._writeHasChilds(parent, 1);
  }

  this._writeStart(this.i, start);
  this._writeStop(this.i, stop);
  this._writeTextId(this.i, textId);
  return this.i++;
}

CreateDataTree.prototype._writeStart = function(id, start) {
  var p1 = start / 4294967295;
  var p2 = start % 4294967295;

  this.tree.view.setUint32(id * this.tree.itemSize, p1);
  this.tree.view.setUint32(id * this.tree.itemSize + 4, p2);
}

CreateDataTree.prototype._writeStop = function(id, stop) {
  var p1 = stop / 4294967295;
  var p2 = stop % 4294967295;

  this.tree.view.setUint32(id * this.tree.itemSize + 8, p1);
  this.tree.view.setUint32(id * this.tree.itemSize + 12, p2);
}

CreateDataTree.prototype._writeTextId = function(id, textId) {
  var hasChilds = this.tree.hasChilds(id);

  this.tree.view.setUint32(id * this.tree.itemSize + 16, textId*2+hasChilds);
}

CreateDataTree.prototype._writeHasChilds = function(id, hasChilds) {
  var textId = this.tree.textId(id);

  this.tree.view.setUint32(id * this.tree.itemSize + 16, textId*2+hasChilds);
}

CreateDataTree.prototype._writeNextId = function(id, nextId) {
  this.tree.view.setUint32(id * this.tree.itemSize + 20, nextId);
}

function Overview(tree, settings) {
  this.tree = tree;
  this.settings = settings;
  this.engineOverview = {}
  this.scriptOverview = {}
  this.scriptTimes = {}

  this.queue = [["",0]]
  this.futureQueue = []
  this.threshold = (tree.stop(0) - tree.start(0));

  if (typeof this.settings.maxThreshold == "undefined")
    this.settings.maxThreshold = 0;

  // hack to increase speed 3fold
  /*
  for (var i=0; i < tree.textmap.length; i++) {
    var info = tree.textmap[i].split(",");
    if (this.hasScriptInfo(info[0])) {
      var script = this.getScriptInfo(info);
      this.scriptOverview[script] = {};
      this.scriptTimes[script] = {"c":0, "s":0};
    }
  }*/

  this.visit = 0
}

Overview.prototype.init = function() {
  this.processQueue();
}

Overview.prototype.isScriptInfo = function(tag) {
  return tag.substring(0, 6) == "script";
}

Overview.prototype.clearScriptInfo = function(tag) {
  return tag == "G" || tag == "g";
}

Overview.prototype.processTreeItem = function(script, id) {
  this.visit += 1
  var time = this.tree.stop(id) - this.tree.start(id);
  var info = this.tree.text(id);

  if (this.clearScriptInfo(info))
    script = "";
  else if (this.isScriptInfo(info))
    script = info;

  //if (time < 0)
  //  throw "negative time";

  var childs = this.tree.childs(id);
  for (var i = 0; i < childs.length; i++) {
    var childTime = this.tree.stop(childs[i]) - this.tree.start(childs[i]);

    if (childTime >= this.settings.maxThreshold) {
       if (childTime < this.threshold) {
        this.futureQueue[this.futureQueue.length] = [script, childs[i]]
      } else {
        this.processTreeItem(script, childs[i])
      }
      time -= childTime;
    }
    //if (time < 0)
    //  throw "negative time";
  }

  // tree head
  if (id == 0)
      return;

  if (time > 0 && !this.isScriptInfo(info)) {
    if (!this.engineOverview[info])
      this.engineOverview[info] = 0;
    this.engineOverview[info] += time;
  }

  if (script != "") {
    if (!this.scriptTimes[script])
        this.scriptTimes[script] = {};
    if (!this.scriptTimes[script][info])
        this.scriptTimes[script][info] = 0;
    this.scriptTimes[script][info] += 1;

    if (!this.scriptOverview[script])
        this.scriptOverview[script] = {};
    if (!this.scriptOverview[script][info])
        this.scriptOverview[script][info] = 0;
    this.scriptOverview[script][info] += time;
  }
}

Overview.prototype.processQueue = function () {
  var queue = this.queue.splice(0, 10000);
  for (var i=0; i<queue.length; i++) {
    this.processTreeItem(queue[i][0], queue[i][1])
  }

  if (this.settings.chunk_cb)
    this.settings.chunk_cb(this);
  
  if (this.queue.length > 0) {
    setTimeout(Overview.prototype.processQueue.bind(this), 1);
    return;
  }

  if (this.futureQueue.length > 0) {
    this.queue = this.futureQueue;
    this.futureQueue = []
    this.threshold = this.threshold / 2
    setTimeout(Overview.prototype.processQueue.bind(this), 1);
    return;
  }

  if (this.settings.finish_cb)
    this.settings.finish_cb(this);
}

Overview.prototype.processQueueSeq = function () {
  while (true) {
    var queue = this.queue.splice(0, 10000);
    for (var i=0; i<queue.length; i++) {
      this.processTreeItem(queue[i][0], queue[i][1])
    }

    if (this.settings.chunk_cb)
      this.settings.chunk_cb(this);
    
    if (this.queue.length > 0)
      continue;

    if (this.futureQueue.length > 0) {
      this.queue = this.futureQueue;
      this.futureQueue = []
      this.threshold = this.threshold / 2
      continue;
    }

    if (this.settings.finish_cb)
      this.settings.finish_cb(this);
    break;
  }
}

Overview.prototype.reset = function() {
    this.queue = []
    this.futureQueue = []
}
