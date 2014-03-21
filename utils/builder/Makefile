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

UTILS_HOME = ..
CLOSURE ?= $(UTILS_HOME)/cc.jar
BUILD_DIR ?= ../../build/bundle
CLOSURE_BASIC_OPT ?= -fc -c s
CLOSURE_ADV_OPT ?= -fc -c a

build: ensureoutputdir
	# Coping JavaScript content files
	cp ../../src/*.js $(BUILD_DIR)/
	mkdir $(BUILD_DIR)/swf
	cp ../../src/swf/*.js $(BUILD_DIR)/swf/
	mkdir $(BUILD_DIR)/avm1lib
	cp ../../src/avm1lib/*.js $(BUILD_DIR)/avm1lib/
	mkdir $(BUILD_DIR)/flash
	cp ../../src/flash/stubs.js $(BUILD_DIR)/flash/
	cp ../../src/flash/util.js $(BUILD_DIR)/flash/
	mkdir $(BUILD_DIR)/flash/display
	cp ../../src/flash/display/*.js $(BUILD_DIR)/flash/display/
	mkdir $(BUILD_DIR)/flash/events
	cp ../../src/flash/events/*.js $(BUILD_DIR)/flash/events/
	mkdir $(BUILD_DIR)/flash/external
	cp ../../src/flash/external/*.js $(BUILD_DIR)/flash/external/
	mkdir $(BUILD_DIR)/flash/filters
	cp ../../src/flash/filters/*.js $(BUILD_DIR)/flash/filters/
	mkdir $(BUILD_DIR)/flash/geom
	cp ../../src/flash/geom/*.js $(BUILD_DIR)/flash/geom/
	mkdir $(BUILD_DIR)/flash/media
	cp ../../src/flash/media/*.js $(BUILD_DIR)/flash/media/
	mkdir $(BUILD_DIR)/flash/net
	cp ../../src/flash/net/*.js $(BUILD_DIR)/flash/net/
	mkdir $(BUILD_DIR)/flash/system
	cp ../../src/flash/system/*.js $(BUILD_DIR)/flash/system/
	mkdir $(BUILD_DIR)/flash/text
	cp ../../src/flash/text/*.js $(BUILD_DIR)/flash/text/
	mkdir $(BUILD_DIR)/flash/ui
	cp ../../src/flash/ui/*.js $(BUILD_DIR)/flash/ui/
	mkdir $(BUILD_DIR)/flash/utils
	cp ../../src/flash/utils/*.js $(BUILD_DIR)/flash/utils/
	mkdir $(BUILD_DIR)/avm1
	cp ../../src/avm1/*.js $(BUILD_DIR)/avm1/
	mkdir $(BUILD_DIR)/avm2
	cp ../../src/avm2/*.js $(BUILD_DIR)/avm2/
	mkdir $(BUILD_DIR)/avm2/compiler
	cp ../../src/avm2/compiler/*.js $(BUILD_DIR)/avm2/compiler/
	mkdir $(BUILD_DIR)/avm2/compiler/c4
	cp ../../src/avm2/compiler/c4/*.js $(BUILD_DIR)/avm2/compiler/c4/
	mkdir -p $(BUILD_DIR)/avm2/compiler/lljs/src
	cp ../../src/avm2/compiler/lljs/src/*.js $(BUILD_DIR)/avm2/compiler/lljs/src/
	mkdir -p $(BUILD_DIR)/avm2/generated/builtin
	cp ../../src/avm2/generated/builtin/builtin.abc $(BUILD_DIR)/avm2/generated/builtin/
	mkdir -p $(BUILD_DIR)/avm2/generated/avm1lib
	cp ../../src/avm2/generated/avm1lib/avm1lib.abc $(BUILD_DIR)/avm2/generated/avm1lib/
	# Extract UTF Strings
	mkdir $(BUILD_DIR)/lib
	cp ../../lib/ByteArray.js $(BUILD_DIR)/lib/
	mkdir $(BUILD_DIR)/lib/DataView.js
	cp ../../lib/DataView.js/* $(BUILD_DIR)/lib/DataView.js/
	mkdir $(BUILD_DIR)/lib/mp3
	cp ../../lib/mp3/* $(BUILD_DIR)/lib/mp3/
	# Pre-compile tag handlers
	$(UTILS_HOME)/jsshell/js generate-tag-handlers.js > $(BUILD_DIR)/swf/handlers.js
	# Package all the source files into two files.
	cp templates/LICENSE.js $(BUILD_DIR)/shumway.js
	CLOSURE=$(CLOSURE) node build.js templates/scripts.js $(CLOSURE_BASIC_OPT) >> $(BUILD_DIR)/shumway.js
	# Optionally Instrument File (Nicer without Closure)
	# CLOSURE=$(CLOSURE) node build.js templates/scripts.js -fc >> $(BUILD_DIR)/shumway.js
	# cp $(BUILD_DIR)/shumway.js $(BUILD_DIR)/shumway.js.original && node instrument.js $(BUILD_DIR)/shumway.js > $(BUILD_DIR)/shumway.js.instrumented && mv $(BUILD_DIR)/shumway.js.instrumented $(BUILD_DIR)/shumway.js
	cp templates/LICENSE.js $(BUILD_DIR)/shumway-worker.js
	CLOSURE=$(CLOSURE) node build.js templates/scripts-worker.js $(CLOSURE_BASIC_OPT) >> $(BUILD_DIR)/shumway-worker.js
	CLOSURE=$(CLOSURE) node build.js templates/scripts-worker-compiled.js $(CLOSURE_ADV_OPT) >> $(BUILD_DIR)/shumway-worker.js
	# Removing hidden files
	-find $(BUILD_DIR) -name ".DS_Store" -exec rm {} \;

ensureoutputdir: clean
	-mkdir -p $(BUILD_DIR)

clean:
	-rm -rf $(BUILD_DIR)

PHONY: build clean ensureoutputdir
