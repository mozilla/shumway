#!/usr/bin/env python
import sys,os.path,os,getopt,time,subprocess,re,argparse
from subprocess import Popen, PIPE
import datetime, time, signal
import pickle

from dis import disassemble

def execute (command, timeout = -1):
    start = datetime.datetime.now()
    start_time = time.time()
    process = Popen([command + "&>tmp.out"], shell=True)
    
    print "Running: " + command + " | Timeout: " + str(timeout) + " ",
    
    elapsed = 0
    try:
        if (timeout >= 0):
            count = 0
            while process.poll() is None:
                time.sleep(0.01)
                now = datetime.datetime.now()
                count += 1;
                if count % 10 == 0:
                    sys.stdout.write(".")
                    sys.stdout.flush()
                if (now - start).seconds > timeout:
                    os.kill(process.pid, signal.SIGKILL)
                    os.waitpid(-1, os.WNOHANG)
                    print " timed out in " + str((now - start).seconds) + " seconds", 
                    return None
    except:
        print " terminated after " + str((now - start).seconds) + " seconds", 
        return None
    
    print " completed in " + str((now - start).seconds) + " seconds", 
    output = open('tmp.out', 'r').read();
    elapsed_time = time.time() - start_time
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
        args = ["java", "-jar", self.asc]
        if builtin:
            args.extend(["-import", self.builtin_abc])
        args.append(file);
        subprocess.call(args)
        if createSwf:
            args = ["java", "-jar", self.asc, "-swf", "cls,1,1", "-d", file]
            subprocess.call(args)

    def runAvm(self, file, execute = True, trace = False, disassemble = False, comp = False):
        args = ["js", "-m", "-n", "avm.js"];
        if disassemble:
            args.append("-d")
        if not trace:
            args.append("-q")
        if comp:
            args.append("-c")
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
        self.runAvm(args.src, trace = args.trace, execute = False, comp = True)

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
        
        PASS = '\033[92m'
        FAIL = '\033[91m'
        ENDC = '\033[0m'

        total = len(tests)
        passed = 0
        failed = 0
        count = 0
        
        try:
            for test in tests:
                print str(count) + " of " + str(total) + ":",
                count += 1
                result = execute("js -m -n avm.js -x -q " + test, int(args.timeout))
                if result:
                    output, elapsed = result
                    if output.lower().find("pass") >= 0:
                        passed += 1
                        print PASS + " PASSED" + ENDC;
                    else:
                        failed += 1
                        print FAIL + " FAILED"  + ENDC;
                else:
                    failed += 1
                    print FAIL + " FAILED" + ENDC;
        except:
            pass
        
        print "Results: failed: " + FAIL + str(failed) + ENDC + ", passed: " + PASS + str(passed) + ENDC + " of " + str(total);
        
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
