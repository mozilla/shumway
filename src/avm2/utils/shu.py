#!/usr/bin/env python
import sys,os.path,os,getopt,time,subprocess,re,argparse,threading

from subprocess import Popen, PIPE
import datetime, time, signal
import pickle

from dis import disassemble

def execute (command, timeout = -1):
  start_time = time.time()
  # print "run: " + command
  process = [None]
  def target():
    process[0] = Popen([command + "&>tmp.out"], shell=True)
    process[0].communicate();
  
  thread = threading.Thread(target=target)
  thread.start()
  thread.join(timeout)
  if thread.is_alive():
    # Popen with "shell=True" returns the pid of the shell rather than that of the spawned process, 
    # so if the process hangs killing the shell won't kill the process. We need to do this nasty
    # hack to kill the child processes. The "ps eo pid,pgid,ppid" command lists the processes and
    # their pid / parent pid relationships.
    
    # Kill All Child Processes
    for row in [map(int,ps.split()) for ps in os.popen("ps eo pid,pgid,ppid").readlines()[1:]]:
      if row[2] == process[0].pid:
        os.kill(row[0], signal.SIGKILL)
        os.waitpid(-1, os.WNOHANG)
        
    # Kill Process
    os.kill(process[0].pid, signal.SIGKILL)
    os.waitpid(-1, os.WNOHANG)
    thread.join()
  
  elapsed_time = time.time() - start_time
  output = open('tmp.out', 'r').read();
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
        parser.add_argument('-timeout', default="2", help="timeout (s)")
        args = parser.parse_args(args)
        print "Testing %s" % args.src
        tests = [];
        for root, subFolders, files in os.walk(args.src):
            for file in files:
                if file.endswith(".abc"):
                    tests.append(os.path.join(root, file))
        
        INFO = '\033[94m'
        WARN = '\033[93m'
        PASS = '\033[92m'
        FAIL = '\033[91m'
        ENDC = '\033[0m'

        total = len(tests)
        passed = 0
        failed = 0
        count = 0

        shuElapsed = 0
        avmElapsed = 0
                    
        try:
          for test in tests:
              print str(count) + " of " + str(total) + ": " + test,
              count += 1
              shuResult = execute("js -m -n avm.js -x " + test, int(2))
              avmResult = execute("avmshell " + test, int(2))
              
              if not shuResult or not avmResult:
                continue
              
              if shuResult[0] == avmResult[0]:
                passed += 1
                shuElapsed += shuResult[1]
                avmElapsed += avmResult[1]
                print PASS + " PASSED" + ENDC,
                print "shu: " + str(round(shuResult[1] * 1000, 2)) + " milliseconds,",
                print "avm: " + str(round(avmResult[1] * 1000, 2)) + " milliseconds,",
                ratio = round(avmResult[1] / shuResult[1], 2)
                print (WARN if ratio < 1 else INFO) + str(round(avmResult[1] / shuResult[1], 2)) + "x faster" + ENDC
              else:
                failed += 1
                print FAIL + " FAILED"  + ENDC
        except:
          pass
        
        print "Results: failed: " + FAIL + str(failed) + ENDC + ", passed: " + PASS + str(passed) + ENDC + " of " + str(total),
        print "shuElapsed: " + str(round(shuElapsed * 1000, 2)) + " milliseconds",
        print "avmElapsed: " + str(round(avmElapsed * 1000, 2)) + " milliseconds",
        print str(round(avmElapsed / shuElapsed, 2)) + "x faster" + ENDC 
        
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
