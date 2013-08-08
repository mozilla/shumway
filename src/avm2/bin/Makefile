# Copyright 2013 Mozilla Foundation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

AVM2_HOME = ..
UTILS_HOME = ../../../utils
AVM ?= $(UTILS_HOME)/tamarin-redux/bin/shell/avmshell
SHELLABC ?= $(AVM2_HOME)/gnerated/shell/shell.abc
BUILTINABC ?= $(AVM2_HOME)/generated/builtin/builtin.abc
ASC ?= $(UTILS_HOME)/asc.jar
JSSHELL ?= $(UTILS_HOME)/jsshell/js
THREADS ?= 8
TIMEOUT ?= 30000

NODE_MODULES = ../../../utils/node_modules

TEST_CMD = ASC=$(ASC) AVM=$(AVM) BUILTINABC=$(BUILTINABC) SHELLABC=$(SHELLABC) JSSHELL=$(JSSHELL) NODE_PATH=$(NODE_MODULES) node numbers.js -t $(TIMEOUT) -jo

TEST_PATH ?= $(error Specify TEST_PATH variable)

default:
	echo "run: make [hello-world|test-pypy|test-interpreter|test-compiler|test-all]"

hello-world:
	ASC=$(ASC) AVM=$(AVM) BUILTINABC=$(BUILTINABC) ./shu.py asc -builtin ../tests/hello-world.as
	$(JSSHELL) avm.js -x ../tests/hello-world.abc
	$(TEST_CMD) -j $(THREADS) -i ../tests/hello-world.abc -c icv

test-pypy:
	$(TEST_CMD) -j $(THREADS) -i pypy.i.passed -c ic

test-interpreter:
	$(TEST_CMD) -j $(THREADS) -i $(TEST_PATH) -c i

test-compiler:
	$(TEST_CMD) -j $(THREADS) -i $(TEST_PATH) -c c

test-interpreter-all:
	$(TEST_CMD) -j $(THREADS) -i tamarin.i.passed -i sunspider.i.passed -i pypy.i.passed -c i -nm

test-all:
	$(TEST_CMD) -j $(THREADS) -i tamarin.i.passed -i sunspider.i.passed -i pypy.i.passed -c icv -nm

test-regress:
	$(TEST_CMD) -j $(THREADS) -i ../tests/regress/correctness/pass/ -c icv
	$(TEST_CMD) -j 1 -i ../tests/performance/c4/basic.abc -c v
	echo "SUCCESS: ALL AVM2 TESTS PASSED"

run-avm:
	$(AVM) $(TEST_PATH)

run-shu-i:
	$(UTILS_HOME)/jsshell/js -m -n avm.js -x -i -rel $(TEST_PATH)

run-shu-c:
	$(UTILS_HOME)/jsshell/js -m -n avm.js -x -c4 -rel $(TEST_PATH)

run-shu-cv:
	$(UTILS_HOME)/jsshell/js -m -n avm.js -x -c4 -verify -rel $(TEST_PATH)

.PHONY: default hello-world test-pypy test-interpreter test-compiler test-all run-avm run-shu-i run-shu-c run-shu-cv
