#!/usr/bin/env python
import sys,os.path,os,getopt,time,subprocess,re,argparse,threading

from subprocess import Popen, PIPE
import datetime, time, signal
import pickle
import Queue
import multiprocessing
import tempfile

from dis import disassemble

def execute (command, timeout = -1):
  start_time = time.time()
  # print "run: " + command
  processPid = [None]
  tmp = tempfile.mkstemp(text=True)
  os.close(tmp[0])
  def target():
    process = Popen([command + "&>" + tmp[1]], shell=True)
    processPid[0] = process.pid;
    process.communicate();

  thread = threading.Thread(target=target)
  thread.start()
  # print "Timeout", timeout
  thread.join(timeout)
  # time.sleep(2)
  if thread.is_alive():
    # Popen with "shell=True" returns the pid of the shell rather than that of the spawned process,
    # so if the process hangs killing the shell won't kill the process. We need to do this nasty
    # hack to kill the child processes. The "ps eo pid,pgid,ppid" command lists the processes and
    # their pid / parent pid relationships.

    # Kill All Child Processes
    for row in [map(int,ps.split()) for ps in os.popen("ps eo pid,pgid,ppid").readlines()[1:]]:
      if row[2] == processPid[0]:
        os.kill(row[0], signal.SIGKILL)
        os.waitpid(-1, os.WNOHANG)

    # Kill Process
    os.kill(processPid[0], signal.SIGKILL)
    os.waitpid(-1, os.WNOHANG)
    thread.join()

  elapsed_time = time.time() - start_time
  output = open(tmp[1], 'r').read();
  os.unlink(tmp[1])
  return (output.strip(), elapsed_time);

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

    if 'AVM' in os.environ:
      self.avm = os.environ['AVM']
    else:
      print "Environment variable AVM is not defined, set it to avmshell"


    if not self.asc:
      sys.exit();

  def runAsc(self, file, createSwf = False, builtin = False):
    args = ["java", "-jar", self.asc, "-d"]
    if builtin:
      args.extend(["-import", self.builtin_abc])
    args.append(file);
    subprocess.call(args)
    if createSwf:
      args = ["java", "-jar", self.asc, "-swf", "cls,1,1", "-d", file]
      subprocess.call(args)

  def runAvm(self, file, execute = True, trace = False, disassemble = False):
    args = ["js", "-m", "-n", "avm.js"];
    if disassemble:
      args.append("-d")
    if not trace:
      args.append("-q")
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
    parser.add_argument('src', help="source .as file")
    parser.add_argument('-builtin', action='store_true', help='import builtin.abc')
    parser.add_argument('-swf', action='store_true', help='optionally package compiled file in a .swf file')
    args = parser.parse_args(args)
    print "Compiling %s" % args.src
    self.runAsc(args.src, args.swf, builtin = args.builtin)

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
    parser.add_argument('src', help=".abc search path")
    parser.add_argument('-j', '--jobs', type=int, default=multiprocessing.cpu_count(), help="number of jobs to run in parallel")
    parser.add_argument('-t', '--timeout', type=int, default=2, help="timeout (s)")
    args = parser.parse_args(args)
    print "Testing %s" % args.src

    tests = Queue.Queue();

    if os.path.isdir(args.src):
      for root, subFolders, files in os.walk(args.src):
        for file in files:
          if file.endswith(".abc"):
            tests.put(os.path.join(root, file))
    elif args.src.endswith(".abc"):
      tests.put(os.path.abspath(args.src))

    INFO = '\033[94m'
    WARN = '\033[93m'
    PASS = '\033[92m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'

    total = tests.qsize()
    counts = {
      'passed': 0,
      'almost': 0,
      'kindof': 0,
      'failed': 0,
      'count': 0,
      'shuElapsed': 0,
      'avmElapsed': 0
    }

    def runTest(tests, counts):
      while tests.qsize() > 0:
        test = tests.get()
        out = [str(total - tests.qsize()) + " of " + str(total) + ": " + test]
        counts['count'] += 1
        shuResult = execute("js -m -n avm.js -x -cse " + test, int(args.timeout))
        avmResult = execute(self.avm + " " + test, int(args.timeout))

        if not shuResult or not avmResult:
          continue

        if shuResult[0] == avmResult[0]:
          counts['passed'] += 1
          counts['shuElapsed'] += shuResult[1]
          counts['avmElapsed'] += avmResult[1]
          out.append(PASS + " PASSED" + ENDC)
        else:
          if "PASSED" in shuResult[0] and not "FAILED" in shuResult[0]:
            counts['almost'] += 1
            counts['passed'] += 1
            out.append(INFO + " ALMOST"  + ENDC)
          elif "PASSED" in shuResult[0] and "FAILED" in shuResult[0]:
            counts['kindof'] += 1
            counts['passed'] += 1
            out.append(WARN + " KINDOF"  + ENDC)
          else:
            counts['failed'] += 1
            out.append(FAIL + " FAILED"  + ENDC)

        out.append("(\033[92m%d\033[0m + \033[94m%d\033[0m + \033[93m%d\033[0m = %d of %d)" % (counts['passed'], counts['almost'], counts['kindof'], counts['passed'] + counts['almost'] + counts['kindof'], counts['count']));
        out.append("shu: " + str(round(shuResult[1] * 1000, 2)) + " ms,")
        out.append("avm: " + str(round(avmResult[1] * 1000, 2)) + " ms,")
        ratio = round(avmResult[1] / shuResult[1], 2)
        out.append((WARN if ratio < 1 else INFO) + str(round(avmResult[1] / shuResult[1], 2)) + "x faster" + ENDC)
        sys.stdout.write(" ".join(out) + "\n")
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

    print "Results: failed: " + FAIL + str(counts['failed']) + ENDC + ", passed: " + PASS + str(counts['passed']) + ENDC + " of " + str(total),
    print "shuElapsed: " + str(round(counts['shuElapsed'] * 1000, 2)) + " ms",
    print "avmElapsed: " + str(round(counts['avmElapsed'] * 1000, 2)) + " ms",
    if counts['shuElapsed'] > 0:
      print str(round(counts['avmElapsed'] / counts['shuElapsed'], 2)) + "x faster" + ENDC

commands = {}
for command in [Asc(), Avm(), Dis(), Compile(), Test()]:
  commands[str(command)] = command;

parser = argparse.ArgumentParser()
parser.add_argument('command', help=",".join(commands.keys()))
args = parser.parse_args(sys.argv[1:2])

if (not args.command in commands):
  print "Invalid command: %s" % args.command
  parser.print_help()

command = commands[args.command];
command.execute(sys.argv[2:])
