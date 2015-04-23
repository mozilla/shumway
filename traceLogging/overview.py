import argparse
import subprocess
import struct
import json
import shutil
import os

argparser = argparse.ArgumentParser(description='Returns an overview of the mainthread.')
argparser.add_argument('js_shell', help='a js shell environment')
argparser.add_argument('js_file', help='the js file to parse')
args = argparser.parse_args()

shell = args.js_shell;
jsfile = args.js_file;
if jsfile[0] != "/":
    jsfile = os.getcwd() + "/" + jsfile;

pwd = os.path.dirname(os.path.realpath(__file__))
datapwd = os.path.dirname(jsfile)

# Get the data information
fp = open(jsfile, "r")
data = json.load(fp)
fp.close()

# Guess the mainthread for which we want to generate an overview
# We guess by taking the entry which has the largest tree.
max_size = 0
entry = 0
for j in range(len(data)):
    statinfo = os.stat(datapwd + "/" + data[j]["tree"])
    if statinfo.st_size > max_size:
        max_size = statinfo.st_size
        entry = j

overview = shell+" -e 'var data = "+json.dumps(data[entry])+"' -f "+pwd+"/overview.js"
print subprocess.check_output(overview, shell=True)
