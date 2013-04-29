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

UTILS_HOME = ../../utils
CLOSURE ?= $(UTILS_HOME)/cc.jar
BUILD_DIR = ../../build/firefox

# Just builds a ff extension

VERSION_BASELINE=a92fa8b98949f76adfc2741e
VERSION=0.6.`git log --format=oneline $(VERSION_BASELINE)..|wc -l|tr -d ' '`

build: ensureoutputdir ../src/flash/playerglobal.abc
	# Coping extension files
	echo "Creating extension verions: $(VERSION)"
	cp -R ../../LICENSE components content bootstrap.js $(BUILD_DIR)/
	sed s/\(SHUMWAY_VERSION\)/$(VERSION)/ install.rdf > $(BUILD_DIR)/install.rdf
	sed s/\(SHUMWAY_VERSION\)/$(VERSION)/ update.rdf > $(BUILD_DIR)/update.rdf
	# Coping JavaScript content files
	mkdir $(BUILD_DIR)/content/swf
	cp ../../src/swf/*.js $(BUILD_DIR)/content/swf/
	mkdir $(BUILD_DIR)/content/flash
	cp ../../src/flash/*.js $(BUILD_DIR)/content/flash/
	cp ../../src/flash/playerglobal.abc $(BUILD_DIR)/content/flash/
	# Extract UTF Strings
	mkdir $(BUILD_DIR)/content/flash/display
	cp ../../src/flash/display/*.js $(BUILD_DIR)/content/flash/display/
	mkdir $(BUILD_DIR)/content/flash/events
	cp ../../src/flash/events/*.js $(BUILD_DIR)/content/flash/events/
	mkdir $(BUILD_DIR)/content/flash/external
	cp ../../src/flash/external/*.js $(BUILD_DIR)/content/flash/external/
	mkdir $(BUILD_DIR)/content/flash/filters
	cp ../../src/flash/filters/*.js $(BUILD_DIR)/content/flash/filters/
	mkdir $(BUILD_DIR)/content/flash/geom
	cp ../../src/flash/geom/*.js $(BUILD_DIR)/content/flash/geom/
	mkdir $(BUILD_DIR)/content/flash/media
	cp ../../src/flash/media/*.js $(BUILD_DIR)/content/flash/media/
	mkdir $(BUILD_DIR)/content/flash/net
	cp ../../src/flash/net/*.js $(BUILD_DIR)/content/flash/net/
	mkdir $(BUILD_DIR)/content/flash/system
	cp ../../src/flash/system/*.js $(BUILD_DIR)/content/flash/system/
	mkdir $(BUILD_DIR)/content/flash/text
	cp ../../src/flash/text/*.js $(BUILD_DIR)/content/flash/text/
	mkdir $(BUILD_DIR)/content/flash/ui
	cp ../../src/flash/ui/*.js $(BUILD_DIR)/content/flash/ui/
	mkdir $(BUILD_DIR)/content/flash/utils
	cp ../../src/flash/utils/*.js $(BUILD_DIR)/content/flash/utils/
	mkdir $(BUILD_DIR)/content/avm1
	cp ../../src/avm1/*.js $(BUILD_DIR)/content/avm1/
	mkdir $(BUILD_DIR)/content/avm2
	cp ../../src/avm2/*.js $(BUILD_DIR)/content/avm2/
	mkdir $(BUILD_DIR)/content/avm2/compiler
	cp ../../src/avm2/compiler/*.js $(BUILD_DIR)/content/avm2/compiler/
	mkdir $(BUILD_DIR)/content/avm2/compiler/c4
	cp ../../src/avm2/compiler/c4/*.js $(BUILD_DIR)/content/avm2/compiler/c4/
	mkdir -p $(BUILD_DIR)/content/avm2/compiler/lljs/src
	cp ../../src/avm2/compiler/lljs/src/*.js $(BUILD_DIR)/content/avm2/compiler/lljs/src/
	mkdir -p $(BUILD_DIR)/content/avm2/generated/builtin
	cp ../../src/avm2/generated/builtin/builtin.abc $(BUILD_DIR)/content/avm2/generated/builtin/
	# Extract UTF Strings
	mkdir $(BUILD_DIR)/content/lib
	mkdir $(BUILD_DIR)/content/lib/Kanvas
	cp ../../lib/Kanvas/* $(BUILD_DIR)/content/lib/Kanvas/
	mkdir $(BUILD_DIR)/content/lib/DataView.js
	cp ../../lib/DataView.js/* $(BUILD_DIR)/content/lib/DataView.js/
	mkdir $(BUILD_DIR)/content/lib/mp3
	cp ../../lib/mp3/* $(BUILD_DIR)/content/lib/mp3/
	# Pre-compile tag handlers
	../../utils/jsshell/js generate-tag-handlers.js > $(BUILD_DIR)/content/swf/handlers.js
	# Build Loader.js, since it's loaded in a worker.
	CLOSURE=$(CLOSURE) node build.js ../../src/flash/display/Loader.js > $(BUILD_DIR)/content/flash/display/Loader.js
	# Package all the source files into two files.
	CLOSURE=$(CLOSURE) node build.js content/web/scripts.js -fc -c s > $(BUILD_DIR)/content/shumway.js
	CLOSURE=$(CLOSURE) node build.js content/web/scripts-worker.js > $(BUILD_DIR)/content/shumway-worker.js
	# Removing hidden files
	-find build -name ".DS_Store" -exec rm {} \;
	# Packaging XPI file
	cd $(BUILD_DIR); zip -r shumway.xpi *

../src/flash/playerglobal.abc:
	$(MAKE) -C ../../utils build-playerglobal

ensureoutputdir: clean
	-mkdir -p $(BUILD_DIR)

clean:
	-rm -rf build
	-rm -rf $(BUILD_DIR)

PHONY: build clean ensureoutputdir
