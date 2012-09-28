UTILS_HOME = ../../../utils
AVM ?= $(UTILS_HOME)/tamarin-redux/bin/shell/avmshell
BUILTINABC ?= $(UTILS_HOME)/tamarin-redux/generated/builtin.abc
ASC ?= $(UTILS_HOME)/asc.jar
JSSHELL ?= $(UTILS_HOME)/jsshell/js
THREADS ?= 8
TIMEOUT ?= 30000

NODE_MODULES = ../../../utils/node_modules

TEST_CMD = ASC=$(ASC) AVM=$(AVM) BUILTINABC=$(BUILTINABC) JSSHELL=$(JSSHELL) NODE_PATH=$(NODE_MODULES) node numbers.js -j $(THREADS) -t $(TIMEOUT) -jo

TEST_PATH ?= $(error Specify TEST_PATH variable)

default:
	echo "run: make [hello-world|test-pypy|test-interpreter|test-compiler|test-all]"

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

test-interpreter-all:
	$(TEST_CMD) -i tamarin.i.passed -i sunspider.i.passed -i pypy.i.passed -c i -nm

test-all:
	$(TEST_CMD) -i tamarin.i.passed -i sunspider.i.passed -i pypy.i.passed -c icov -nm

test-regress:
	ASC=$(ASC) AVM=$(AVM) BUILTINABC=$(BUILTINABC) ./shu.py reg
	$(TEST_CMD) -i ../tests/regress -e regress.disabled -c icov

.PHONY: default hello-world test-pypy test-interpreter test-compiler test-all
