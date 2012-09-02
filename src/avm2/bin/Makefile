UTILS_HOME = ../../../utils
AVM ?= $(UTILS_HOME)/tamarin-redux/bin/shell/avmshell 
BUILTINABC ?= $(UTILS_HOME)/tamarin-redux/generated/builtin.abc
ASC ?= $(UTILS_HOME)/asc.jar
JSSHELL ?= $(UTILS_HOME)/jsshell/js
THREADS ?= 8

TEST_CMD = ASC=$(ASC) AVM=$(AVM) BUILTINABC=$(BUILTINABC) JSSHELL=$(JSSHELL) node numbers.js -j $(THREADS)

TEST_PATH ?= $(error Specify TEST_PATH variable)

default:
	echo "run: make [hello-world|test-pypy|test-interpreter|test-compiler]"

hello-world:
	ASC=$(ASC) AVM=$(AVM) BUILTINABC=$(BUILTINABC) ./shu.py asc -builtin ../tests/hello-world.as
	$(JSSHELL) avm.js -x ../tests/hello-world.abc
	$(TEST_CMD) -i ../tests/hello-world.abc -c icov

test-pypy:
	$(TEST_CMD) -i pypy.i.passed -c ic

test-interpreter:
	$(TEST_CMD) -i $(TEST_PATH) -c i

test-compiler:
	$(TEST_CMD) -i $(TEST_PATH) -c c

.PHONY: default hello-world test-pypy test-interpreter test-compiler
