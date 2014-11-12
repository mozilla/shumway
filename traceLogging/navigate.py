import argparse
import subprocess
import struct
import json
import shutil
import os
import sys

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


import sys,tty,termios
class _Getch:
    def __call__(self):
            fd = sys.stdin.fileno()
            old_settings = termios.tcgetattr(fd)
            try:
                tty.setraw(sys.stdin.fileno())
                ch = sys.stdin.read(1)
            finally:
                termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
            return ch
def getkey():
    inkey = _Getch()
    while(1):
        k=inkey()
        if k!='':
            break
    return k

def clearscreen():
    print chr(27) + "[2J"

def updateDisplay():
    global opened, display
    display = []
    if len(opened) == 0:
        for i in range(len(data)):
            display.append(data[i]["tree"])
    else:
        display.append(data[opened[0]]["tree"])

        overview = shell+" -e 'var data = "+json.dumps(data[opened[0]])+";var opened = "+json.dumps(opened[1:])+"' -f "+pwd+"/navigate.js"
        lines = subprocess.check_output(overview, shell=True)
        lines = lines.split("\n")
        display = display + lines

def makeDisplay():
    global line

    start = max(selected - 10, 0)
    stop = start + 40

    line = start
    for i in display[start:stop]:
        printline(i);

def printline(data):
    global selected, line
    if selected == line:
        print '\033[94m' + data + '\033[0m'
    else:
        print data
    line += 1
selected = 0
line = 0
opened = []
display = []
choice = "a"
updateDisplay()

while 1:
    clearscreen()
    makeDisplay()

    print(opened)
    choice = getkey()
    if choice == 'x' or choice == 'q':
        exit()
    if choice == '\x1b':
        choice = getkey()+getkey()
        if choice == '[A': # up
            if selected != 0:
                selected -= 1
        if choice == '[B': # down
            if selected + 1 != line:
                selected += 1
        if choice == '[6': # PgDn
            if selected + 10 < line:
                selected += 10
            else:
                selected = line - 1;
        if choice == '[5': # PgUp
            if selected - 10 > 0:
                selected -= 10
            else:
                selected = 0;
    if choice == chr(13): # enter
        if selected < len(opened):
            opened = opened[:selected]
            selected = len(opened)
            updateDisplay()
        else:
            opened.append(selected - len(opened))
            selected = len(opened) - 1 
            updateDisplay()
