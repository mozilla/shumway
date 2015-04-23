import argparse
import subprocess
import struct
import json
import shutil
import os
import collections

argparser = argparse.ArgumentParser(description='Reduce the logfile to make suitable for online destribution.')
argparser.add_argument('js_file', help='the js file to parse')
argparser.add_argument('output_name', help='the name of the output (without the .js)')
argparser.add_argument('--no-corrections', action='store_true', help='don\'t compute the corrections files')
args = argparser.parse_args()

corrections = not args.no_corrections

jsfile = args.js_file;
if jsfile[0] != "/":
    jsfile = os.getcwd() + "/" + jsfile;
output = args.output_name;

pwd = os.path.dirname(os.path.realpath(__file__))
datapwd = os.path.dirname(jsfile)

print "Get data information"
fp = open(jsfile, "r")
data = json.load(fp)
fp.close()

TreeItem = collections.namedtuple('TreeItem', ['id', 'start', 'stop', 'textId', 'children', 'nextId'])

class TreeReader(object):
    def __init__(self, fp):
        self.fp = fp

    def readItem(self, offset):
        struct_fmt = '!QQII'
        struct_len = struct.calcsize(struct_fmt)
        struct_unpack = struct.Struct(struct_fmt).unpack_from

        self.fp.seek(offset * struct_len)
        s = self.fp.read(struct_len)
        if not s:
            return
        s = struct_unpack(s)
        return TreeItem(offset, s[0], s[1], s[2] >> 1, s[2] & 0x1, s[3])

    def writeItem(self, item):
        struct_fmt = '!QQII'
        struct_len = struct.calcsize(struct_fmt)
        struct_pack = struct.Struct(struct_fmt).pack

        self.fp.seek(item.id * struct_len)
        s = struct_pack(item.start, item.stop, item.textId * 2 + item.children, item.nextId)

        self.fp.write(s)

    def getStop(self):
        parentItem = self.readItem(0) 
        if parentItem.stop is not 0:
            return parentItem.stop

        # If there are no children. Still use parentItem.stop
        if parentItem.children is 0:
            return parentItem.stop

        # The parent item doesn't contain the stop information.
        # Get the last tree item for the stop information.
        itemId = 1
        while True:
            item = self.readItem(itemId)
            if item.nextId is 0:
                return item.stop
            itemId = item.nextId
        
class CreateDataTree(TreeReader):
    def __init__(self, fp, start, stop):
        TreeReader.__init__(self, fp)

        self.writeItem(TreeItem(0, start, stop, 0, 0, 0))
        self.newId = 1

    def addChild(self, parent, oldItem):
        parentItem = self.readItem(parent)
        if parentItem.children is 1:
            lastChildItem = self.readItem(parent + 1)
            while lastChildItem.nextId is not 0:
                lastChildItem = self.readItem(lastChildItem.nextId) 
            self.writeItem(lastChildItem._replace(nextId = self.newId)) 
        else:
            assert self.newId == parent + 1
            self.writeItem(parentItem._replace(children = 1))
        self.writeItem(TreeItem(self.newId, oldItem.start, oldItem.stop, oldItem.textId, 0, 0))
        newId = self.newId
        self.newId += 1
        return newId

class Overview:
    def __init__(self, tree, dic):
        self.tree = tree
        self.dic = dic
        self.engineOverview = {}
        self.scriptOverview = {}
        self.scriptTimes = {}

    def isScriptInfo(self, tag):
      return tag[0:6] == "script";

    def clearScriptInfo(self, tag):
      return tag == "G" or tag == "g";

    def calc(self):
        self.processTreeItem("", self.tree.readItem(0))

    def processTreeItem(self, script, item):
        time = item.stop - item.start
        info = self.dic[item.textId]

        if self.clearScriptInfo(info):
            script = ""
        elif self.isScriptInfo(info):
            script = info

        if item.children is 1:
            childItem = self.tree.readItem(item.id + 1) 
            while childItem:
                time -= childItem.stop - childItem.start
                self.processTreeItem(script, childItem)
                if childItem.nextId is 0:
                    break
                childItem = self.tree.readItem(childItem.nextId) 

        if item.id == 0:
            return

        if script is "":
            return

        if time > 0 and not self.isScriptInfo(info):
            if info not in self.engineOverview:
                self.engineOverview[info] = 0
            self.engineOverview[info] += time

        if script is not "":
            if script not in self.scriptTimes:
                self.scriptTimes[script] = {}
            if info not in self.scriptTimes[script]:
                self.scriptTimes[script][info] = 0;
            self.scriptTimes[script][info] += 1;

        if script not in self.scriptOverview:
            self.scriptOverview[script] = {}
        if info not in self.scriptOverview[script]:
            self.scriptOverview[script][info] = 0
        self.scriptOverview[script][info] += time;

def visitItem(oldTree, newTree, parent, oldItem):
    if oldItem.stop - oldItem.start >= threshold:
        newId = newTree.addChild(parent, oldItem) 

        if oldItem.children is 0:
            return

        childItem = oldTree.readItem(oldItem.id + 1) 
        while childItem:
            visitItem(oldTree, newTree, newId, childItem)
            if childItem.nextId is 0:
                break
            childItem = oldTree.readItem(childItem.nextId) 
        
ndata = []
for j in range(len(data)):
    fp = open(datapwd+"/"+data[j]["tree"], "rb")
    wp = open(output+'.tree.'+str(j)+'.tl', 'w+b')

    oldTree = TreeReader(fp)
    parentItem = oldTree.readItem(0)
    start = parentItem.start
    stop = oldTree.getStop()
    newTree = CreateDataTree(wp, start, stop)

    # accurency of 0.1px when graph shown on 1600 width display (1600*400)
    threshold = (stop - start) / 640000

    if parentItem.children is 1:
        childItem = oldTree.readItem(1) 
        while childItem:
            visitItem(oldTree, newTree, 0, childItem)
            if childItem.nextId is 0:
                break
            childItem = oldTree.readItem(childItem.nextId) 

    if corrections:
        fp = open(datapwd+"/"+data[j]["dict"], "r")
        dic = json.load(fp)
        fp.close()

        fullOverview = Overview(oldTree, dic)
        fullOverview.calc()

        partOverview = Overview(newTree, dic)
        partOverview.calc()

        correction = {
          "engineOverview": {},
          "scriptTimes": {},
          "scriptOverview": {}
        }
        for i in fullOverview.engineOverview:
          correction["engineOverview"][i] = fullOverview.engineOverview[i]
          if i in partOverview.engineOverview:
            correction["engineOverview"][i] -= partOverview.engineOverview[i]
        for script in fullOverview.scriptTimes:
          correction["scriptTimes"][script] = {}
          for part in fullOverview.scriptTimes[script]:
            correction["scriptTimes"][script][part] = fullOverview.scriptTimes[script][part] 
            if script in partOverview.scriptTimes and part in partOverview.scriptTimes[script]:
              correction["scriptTimes"][script][part] -= partOverview.scriptTimes[script][part]
        for script in fullOverview.scriptOverview: 
          correction["scriptOverview"][script] = {}
          for part in fullOverview.scriptOverview[script]:
            correction["scriptOverview"][script][part] = fullOverview.scriptOverview[script][part] 
            if script in partOverview.scriptOverview and part in partOverview.scriptOverview[script]:
              correction["scriptOverview"][script][part] -= partOverview.scriptOverview[script][part]

        corrFile = open(output+'.corrections.'+str(j)+'.js', 'wb')
        json.dump(correction, corrFile)
        corrFile.close()
    
    print "copy textmap"
    shutil.copyfile(datapwd+"/"+data[j]["dict"], output+".dict."+str(j)+".js")

    ndata.append({
        "tree": os.path.basename(output)+'.tree.'+str(j)+'.tl',
        "dict": os.path.basename(output)+'.dict.'+str(j)+'.js'
    })

    if corrections:
        ndata[-1]["corrections"] = os.path.basename(output)+'.corrections.'+str(j)+'.js'

print "writing js file"

fp = open(output+".json", "w")
json.dump(ndata, fp);
fp.close()
