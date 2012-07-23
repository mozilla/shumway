#!/usr/bin/env python
import argparse
import multiprocessing
import os.path
import os
import Queue
import signal
import subprocess
import sys
import time
import threading
import base64

from subprocess import Popen, PIPE, STDOUT
from collections import Counter

def readLines(file):
  lines = []
  for line in open(file, 'r').read().split('\n'):
    if line != "":
      lines.append(line)
  return lines

def execute (command, timeout = -1):
  start_time = time.time()
  processPid = [None]
  stdoutOutput = [None]
  stderrOutput = [None]
  def target():
    process = Popen(command, stdout=PIPE, stderr=STDOUT, close_fds=True)
    processPid[0] = process.pid;
    (stdoutOutput[0], stderrOutput[0]) = process.communicate();

  thread = threading.Thread(target=target)
  thread.start()
  thread.join(timeout)
  if thread.is_alive():
    # Kill Process
    try:
      os.killpg(processPid[0], signal.SIGKILL)
    except:
      pass
    os.waitpid(-1, os.WNOHANG)
    thread.join()

  elapsed_time = time.time() - start_time
  output = stdoutOutput[0]
  return (output.strip(), elapsed_time);


def execute2(cmd, timeout=None):
  '''
  Will execute a command, read the output and return it back.

  @param cmd: command to execute
  @param timeout: process timeout in seconds
  @return: a tuple of three: first stdout, then stderr, then exit code
  @raise OSError: on missing command or if a timeout was reached
  '''

  ph_out = None # process output
  ph_err = None # stderr
  ph_ret = None # return code

  start_time = time.time()

  def preexec_function():
    # Ignore the SIGINT signal by setting the handler to the standard
    # signal handler SIG_IGN.
    signal.signal(signal.SIGINT, signal.SIG_IGN)

  p = subprocess.Popen(cmd,
                       stdout=subprocess.PIPE,
                       stderr=subprocess.STDOUT,
                       close_fds=True,
                       preexec_fn = preexec_function)

  # if timeout is not set wait for process to complete
  if not timeout:
    ph_ret = p.wait()
  else:
    fin_time = time.time() + timeout
    while p.poll() == None and fin_time > time.time():
      time.sleep(0.001)

    # if timeout reached, raise an exception
    if fin_time < time.time():

      # starting 2.6 subprocess has a kill() method which is preferable
      # p.kill()
      try:
        os.kill(p.pid, signal.SIGKILL)
      except:
        pass
      return None

    ph_ret = p.returncode
    ph_out, ph_err = p.communicate()

  return (ph_out, time.time() - start_time)

class Base:
  asc = None
  avm = None
  builtin_abc = None

  def __init__(self):
    self.setEnvironmentVariables();
    pass

  def setEnvironmentVariables(self):
    if 'ASC' in os.environ:
      self.asc = os.environ['ASC'].strip();
    else:
      print "Environment variable ASC is not defined, set it to asc.jar"

    if 'BUILTINABC' in os.environ:
      self.builtin_abc = os.environ['BUILTINABC'].strip();
    else:
      print "Environment variable BUILTINABC is not defined, set it to builtin.abc"

    # The builtin.abc cannot be combined with the playerglobal.abc file that comes with Alchemy, thus we need
    # this other global.abc library.

    if 'GLOBALABC' in os.environ:
      self.global_abc = os.environ['GLOBALABC'].strip();

    if 'PLAYERGLOBALABC' in os.environ:
      self.player_global_abc = os.environ['PLAYERGLOBALABC'].strip();

    if 'AVM' in os.environ:
      self.avm = os.environ['AVM']
    else:
      print "Environment variable AVM is not defined, set it to avmshell"


    if not self.asc:
      sys.exit();

  def runAsc(self, files, createSwf = False, builtin = False, _global = False, playerGlobal = False, sc = False):
    
    if sc:
      outf = os.path.splitext(files[-1])[0]
      args = ["java", "-ea", "-DAS3", "-DAVMPLUS", "-classpath", self.asc,
              "macromedia.asc.embedding.ScriptCompiler", "-d", "-out", outf]
    else:
      args = ["java", "-ea", "-DAS3", "-DAVMPLUS", "-jar", self.asc, "-d"]


    if createSwf:
      args.extend(["-swf", "cls,1,1"])

    if builtin:
      args.extend(["-import", self.builtin_abc])

    if _global:
      args.extend(["-import", self.global_abc])

    if playerGlobal:
      playerGlobalAbcs = []      
      if not os.path.isdir(self.player_global_abc):
        playerGlobalAbcs.append(self.player_global_abc)
      else:
        for root, subFolders, abcFiles in os.walk(self.player_global_abc):
          for file in abcFiles:
            if file.endswith(".abc"):
              playerGlobalAbcs.append(os.path.join(root, file))
              
      for abc in playerGlobalAbcs:
        args.extend(["-import", abc])

    args.extend(files);
    subprocess.call(args)

    if sc:
      os.remove(outf + ".cpp")
      os.remove(outf + ".h")

  def runAvm(self, file, execute = True, trace = False, disassemble = False):
    args = ["js", "-m", "-n", "avm.js"];
    if disassemble:
      args.append("-d")
    if execute:
      args.append("-x")
    args.append(file)
    subprocess.call(args)

class Command(Base):
  name = ""

  def __init__(self, name):
    Base.__init__(self)
    self.name = name


class Asc(Command):
  def __init__(self):
    Command.__init__(self, "asc")

  def __repr__(self):
    return self.name

  def execute(self, args):
    parser = argparse.ArgumentParser(description='Compiles an ActionScript source file to .abc or .swf using the asc.jar compiler.')
    parser.add_argument('src', nargs='+', help="source .as file")
    parser.add_argument('-builtin', action='store_true', help='import builtin.abc')
    parser.add_argument('-globals', action='store_true', help='import global.abc')
    parser.add_argument('-playerGlobal', action='store_true', help='import playerGlobal.abc')
    parser.add_argument('-sc', action='store_true', help='use embedding.ScriptCompiler (needed to compile multiple scripts into one .abc file)')
    parser.add_argument('-swf', action='store_true', help='optionally package compiled file in a .swf file')
    args = parser.parse_args(args)
    print "Compiling %s" % args.src
    self.runAsc(args.src, args.swf, builtin = args.builtin, _global = args.globals, playerGlobal = args.playerGlobal,  sc = args.sc)

class Reg(Command):
  def __init__(self):
    Command.__init__(self, "reg")

  def __repr__(self):
    return self.name

  def execute(self, args):
    parser = argparse.ArgumentParser(description='Compiles all the source files in the test/regress directory using the asc.jar compiler.')
    parser.add_argument('src', nargs="?", default="../tests/regress", help="source .as file")
    parser.add_argument('-force', action='store_true', help="force recompilation of all regression tests")
    args = parser.parse_args(args)
    print "Compiling Tests"

    tests = [];
    if os.path.isdir(args.src):
      for root, subFolders, files in os.walk(args.src):
        for file in files:
          if file.endswith(".as") and file != "harness.as":
            asFile = os.path.join(root, file)
            abcFile = os.path.splitext(asFile)[0] + ".abc"
            compile = args.force
            if not os.path.exists(abcFile):
              compile = True
            elif os.path.getmtime(abcFile) < os.path.getmtime(asFile):
              compile = True
            if compile:
              tests.append(asFile)
    else:
      tests.append(os.path.abspath(args.src))

    for test in tests:
      args = ["java", "-jar", self.asc, "-d", "-import", self.builtin_abc, "-in", "../tests/regress/harness.as", test]
      subprocess.call(args)

class Avm(Command):
  def __init__(self):
    Command.__init__(self, "avm")

  def __repr__(self):
    return self.name

  def execute(self, args):
    parser = argparse.ArgumentParser(description='Runs an .abc file using Shumway AVM')
    parser.add_argument('src', help="source .abc file")
    parser.add_argument('-trace', action='store_true', help="trace bytecode execution")
    args = parser.parse_args(args)
    print "Running %s" % args.src
    self.runAvm(args.src, trace = args.trace)

class Dis(Command):
  def __init__(self):
    Command.__init__(self, "dis")

  def __repr__(self):
    return self.name

  def execute(self, args):
    parser = argparse.ArgumentParser(description='Disassembles an .abc file ')
    parser.add_argument('src', help="source .abc file")
    args = parser.parse_args(args)
    print "Disassembling %s" % args.src
    self.runAvm(args.src, execute = False, disassemble = True)

# Splits a text file with the following delimiters into multiple files.
# <<< type fileName-0
# ...
# >>>
# <<< type fileName-1
# ...
# >>>
class Split(Command):
  def __init__(self):
    Command.__init__(self, "split")

  def __repr__(self):
    return self.name

  def execute(self, args):
    parser = argparse.ArgumentParser(description='Splits a delimited text file into multiple text files.')
    parser.add_argument('src', help="source .txt file")
    parser.add_argument('dst', help="destination directory")
    args = parser.parse_args(args)

    if not os.path.isdir(args.dst):
      print "Destination \"" + args.dst + "\" is not a directory."
      sys.exit();
    src = args.src
    dst = os.path.abspath(args.dst)
    print "Splitting %s into %s" % (src, dst)
    file = None
    for line in readLines(src):
      if line.startswith("<<< "):
        tokens = line.split(" ")
        type = tokens[1]
        name = tokens[2]
        print "Open " + dst + "/" + name
        file = open(dst + "/" + name, "w")
      elif line == ">>>":
        file.close()
        file = None
      else:
        if file:
          if type == "BASE64":
            file.write(base64.b64decode(line))
          else:
            file.write(line + "\n")

class Compile(Command):
  def __init__(self):
    Command.__init__(self, "compile")

  def __repr__(self):
    return self.name

  def execute(self, args):
    parser = argparse.ArgumentParser(description='Compiles an .abc file to .js ')
    parser.add_argument('src', help="source .abc file")
    parser.add_argument('-trace', action='store_true', help="trace bytecode execution")
    args = parser.parse_args(args)
    print "Compiling %s" % args.src
    self.runAvm(args.src, trace = args.trace, execute = True)

class Test(Command):
  def __init__(self):
    Command.__init__(self, "test")

  def __repr__(self):
    return self.name

  def execute(self, args):
    parser = argparse.ArgumentParser(description='Runs all tests.')
    parser.add_argument('src', nargs='?', help=".abc search path")
    parser.add_argument('-j', '--jobs', type=int, default=multiprocessing.cpu_count(), help="number of jobs to run in parallel")
    parser.add_argument('-t', '--timeout', type=int, default=5, help="timeout (s)")
    parser.add_argument('-m', '--mode', type=str, default="aico", help="mode")
    parser.add_argument('-n', '--noColors', action='store_true', help="disable colors")
    parser.add_argument('-i', '--include', nargs="?", action='append', help="include tests from file")
    parser.add_argument('-e', '--exclude', nargs="?", action='append', help="exclude tests from file")

    args = parser.parse_args(args)

    include = []
    if args.include:
      for file in args.include:
        include += readLines(file)

    exclude = []
    if args.exclude:
      for file in args.exclude:
        exclude += readLines(file)

    print "---------------------------------------------------------------------------------------------------------"
    print "Each Tamarin acceptance test case includes a bunch of smaller tests, each of which print out PASSED or"
    print "FAILED. We compare the output under several configurations and print the results as follows:"
    print "PASSED - output matches AVM Shell"
    print "ALMOST - the \"PASSED\" string appears in the output but the \"FAILED\" string does not."
    print "KINDOF - the \"PASSED\" and \"FAILED\" string appear in the output."
    print "FAILED - the \"PASSED\" string doesn't appear anywhere."
    print "---------------------------------------------------------------------------------------------------------"

    tests = Queue.Queue();

    if args.src:
      if os.path.isdir(args.src):
        for root, subFolders, files in os.walk(args.src):
          for file in files:
            if file.endswith(".abc"):
              include.append(os.path.join(root, file))
      elif args.src.endswith(".abc"):
        include.append(os.path.abspath(args.src))

    for file in include:
      if not file in exclude:
        tests.put(file)

    INFO = '\033[94m'
    WARN = '\033[93m'
    PASS = '\033[92m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'

    if args.noColors:
      INFO = WARN = PASS = FAIL = ENDC = "";

    total = tests.qsize()
    counts = {
      'passed-i': 0,
      'almost-i': 0,
      'kindof-i': 0,
      'failed-i': 0,
      'passed-c': 0,
      'almost-c': 0,
      'kindof-c': 0,
      'failed-c': 0,
      'count': 0,
    }

    counter = Counter()

    def runTest(tests, counts):
      while tests.qsize() > 0:
        test = tests.get()
        out = []

        modes = {}
        modes["a"] = [self.avm, test]
        modes["i"] = ["js", "-m", "-n", "avm.js", "-x", "-i", test];
        modes["c"] = ["js", "-m", "-n", "avm.js", "-x", test];
        modes["o"] = ["js", "-m", "-n", "avm.js", "-x", "-opt", test];
        modes["v"] = ["js", "-m", "-n", "avm.js", "-x", "-opt", "-verify", test];

        results = {}

        for m in args.mode:
          results[m] = execute(modes[m], int(args.timeout))

        def compare (base, result):
          if result == None:
            return "FAILED"

          if base != None and base[0] == result[0]:
            return "PASSED"
          else:
            if "PASSED" in result[0] and not "FAILED" in result[0]:
              return "ALMOST"
            elif "PASSED" in result[0] and "FAILED" in result[0]:
              return "KINDOF"
            else:
              return "FAILED"

        def color (s):
          if s == "PASSED":
            return PASS + s + ENDC
          elif s == "ALMOST":
            return INFO + s + ENDC
          elif s == "KINDOF":
            return WARN + s + ENDC
          elif s == "FAILED":
            return FAIL + s + ENDC

        for k in results:
          if k != "a":
            c = compare(results["a"] if "a" in results else None, results[k])
            counter.update([k + "-" + c]);
            out.append(color(c))
          out.append(str(round(results[k][1], 2)) if results[k] != None else "N/A")

        out.append(test);

        sys.stdout.write("\t".join(out) + "\n")
        sys.stdout.flush()
        tests.task_done()

    jobs = []
    for i in range(int(args.jobs)):
      job = threading.Thread(target=runTest, args=(tests, counts))
      job.start()
      jobs.append(job)

    tests.join()

    for job in jobs:
      job.join()

    print counter

commands = {}
for command in [Asc(), Avm(), Dis(), Compile(), Test(), Reg(), Split()]:
  commands[str(command)] = command;

parser = argparse.ArgumentParser()
parser.add_argument('command', help=",".join(commands.keys()))
args = parser.parse_args(sys.argv[1:2])

if (not args.command in commands):
  print "Invalid command: %s" % args.command
  parser.print_help()

command = commands[args.command];
command.execute(sys.argv[2:])
