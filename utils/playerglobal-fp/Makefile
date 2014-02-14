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

UNAME = $(shell uname)

PLAYERGLOBAL_URL ?= http://download.macromedia.com/get/flashplayer/updaters/11/playerglobal11_4.swc
PLAYERGLOBAL_PATH ?= $(BUILD_DIR)/playerglobal.swc
BUILD_DIR = ./bin

UTILS_HOME = ..
APPARAT_HOME = $(UTILS_HOME)/apparat
SCALA_BIN = $(APPARAT_HOME)/scala-2.8.0.final/bin
APPARAT_BIN = $(APPARAT_HOME)/apparat-1.0-RC9
JSSHELL_HOME = $(UTILS_HOME)/jsshell

ifeq ("$(shell which base64)", "")
BASE64DEC = python -c "import base64, sys; f = open(sys.argv[1], 'wb'); base64.decode(sys.stdin, f); f.close()"
else
BASE64DEC = base64 --decode > 
endif

default:
	@echo "run: make [build|clean]"

build: $(BUILD_DIR)/library.swf
	$(JSSHELL_HOME)/js playerglobal-gen.js > playerglobal-fp.json
	$(JSSHELL_HOME)/js playerglobal-pack.js | $(BASE64DEC) playerglobal-fp.abcs
	mkdir -p ../../build/playerglobal
	mv playerglobal-fp.json ../../build/playerglobal
	mv playerglobal-fp.abcs ../../build/playerglobal

build-min: $(BUILD_DIR)/library.min.swf
	$(JSSHELL_HOME)/js playerglobal-dumpabc.js | $(BASE64DEC) $(BUILD_DIR)/playerGlobal.min.abc
	mkdir -p ../../src/avm2/generated/playerGlobal
	mv $(BUILD_DIR)/playerGlobal.min.abc ../../src/avm2/generated/playerGlobal/playerGlobal.abc

$(BUILD_DIR)/library.min.swf: $(BUILD_DIR)/library.swf
ifeq ($(findstring MINGW32, $(UNAME)),)
	PATH=$(SCALA_BIN):$(PATH) $(APPARAT_BIN)/reducer -i $(BUILD_DIR)/library.swf -o $(BUILD_DIR)/library.min.swf -m
else
	cmd //c runreducer.bat -i $(BUILD_DIR)/library.swf -o $(BUILD_DIR)/library.min.swf -m
endif

$(BUILD_DIR)/library.swf: $(PLAYERGLOBAL_PATH)
	unzip -n $(PLAYERGLOBAL_PATH) library.swf catalog.xml -d $(BUILD_DIR)

$(BUILD_DIR)/playerglobal.swc:
	mkdir -p $(BUILD_DIR)
	wget $(PLAYERGLOBAL_URL) -O $(BUILD_DIR)/playerglobal.swc

clean:
	-rm -rf $(BUILD_DIR)

.PHONY: build default clean

