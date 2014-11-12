import argparse
import subprocess
import struct
import json
import shutil
import os

argparser = argparse.ArgumentParser(description='Rename the files.')
argparser.add_argument('js_file', help='the js file to parse')
argparser.add_argument('new_name', help='the new js file name (and path), without the .json')
args = argparser.parse_args()

jsfile = args.js_file
if jsfile[0] != "/":
    jsfile = os.getcwd() + "/" + jsfile

datapwd = os.path.dirname(jsfile)

new_name = args.new_name
if new_name[0] != "/":
    new_name = datapwd + "/" + new_name

# Get the data information
fp = open(jsfile, "r")
data = json.load(fp)
fp.close()

# Move jsfile
shutil.move(jsfile, new_name+".json")

for j in range(len(data)):
    tree = new_name+".tree."+str(j)+".tl"
    shutil.move(datapwd+"/"+data[j]["tree"], tree)
    data[j]["tree"] = os.path.basename(tree)

    events = new_name+".event."+str(j)+".tl"
    shutil.move(datapwd+"/"+data[j]["events"], events)
    data[j]["events"] = os.path.basename(events)

    ndict = new_name+".dict."+str(j)+".json"
    shutil.move(datapwd+"/"+data[j]["dict"], ndict)
    data[j]["dict"] = os.path.basename(ndict)

fp = open(new_name+".json", "w")
json.dump(data, fp)
fp.close()
