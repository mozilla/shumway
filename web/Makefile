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

# Builds gh-pages

SHUMWAY_ROOT=..
BUILD_DIR=../build/web
BUNDLE_DIR=../build/bundle
EXTENSION_DIR=../build/firefox

build: ensureoutputdir \
       $(SHUMWAY_ROOT)/build/playerglobal/playerglobal.abcs

	cp -R $(SHUMWAY_ROOT)/LICENSE index.html main.css main.swf gallery images $(BUILD_DIR)/
	# Coping JavaScript content files
	mkdir $(BUILD_DIR)/src
	mkdir $(BUILD_DIR)/src/swf
	cp $(SHUMWAY_ROOT)/src/swf/*.js $(BUILD_DIR)/src/swf/
	mkdir $(BUILD_DIR)/src/flash
	cp $(SHUMWAY_ROOT)/src/flash/stubs.js $(BUILD_DIR)/src/flash/
	cp $(SHUMWAY_ROOT)/src/flash/util.js $(BUILD_DIR)/src/flash/
	mkdir $(BUILD_DIR)/src/avm1lib
	cp $(SHUMWAY_ROOT)/src/avm1lib/*.js $(BUILD_DIR)/src/avm1lib/
	mkdir $(BUILD_DIR)/src/flash/accessibility
	cp $(SHUMWAY_ROOT)/src/flash/accessibility/*.js $(BUILD_DIR)/src/flash/accessibility/
	mkdir $(BUILD_DIR)/src/flash/display
	cp $(SHUMWAY_ROOT)/src/flash/display/*.js $(BUILD_DIR)/src/flash/display/
	mkdir $(BUILD_DIR)/src/flash/events
	cp $(SHUMWAY_ROOT)/src/flash/events/*.js $(BUILD_DIR)/src/flash/events/
	mkdir $(BUILD_DIR)/src/flash/external
	cp $(SHUMWAY_ROOT)/src/flash/external/*.js $(BUILD_DIR)/src/flash/external/
	mkdir $(BUILD_DIR)/src/flash/filters
	cp $(SHUMWAY_ROOT)/src/flash/filters/*.js $(BUILD_DIR)/src/flash/filters/
	mkdir $(BUILD_DIR)/src/flash/geom
	cp $(SHUMWAY_ROOT)/src/flash/geom/*.js $(BUILD_DIR)/src/flash/geom/
	mkdir $(BUILD_DIR)/src/flash/media
	cp $(SHUMWAY_ROOT)/src/flash/media/*.js $(BUILD_DIR)/src/flash/media/
	mkdir $(BUILD_DIR)/src/flash/net
	cp $(SHUMWAY_ROOT)/src/flash/net/*.js $(BUILD_DIR)/src/flash/net/
	mkdir $(BUILD_DIR)/src/flash/system
	cp $(SHUMWAY_ROOT)/src/flash/system/*.js $(BUILD_DIR)/src/flash/system/
	mkdir $(BUILD_DIR)/src/flash/text
	cp $(SHUMWAY_ROOT)/src/flash/text/*.js $(BUILD_DIR)/src/flash/text/
	mkdir $(BUILD_DIR)/src/flash/text/engine
	cp $(SHUMWAY_ROOT)/src/flash/text/engine/*.js $(BUILD_DIR)/src/flash/text/engine/
	mkdir $(BUILD_DIR)/src/flash/ui
	cp $(SHUMWAY_ROOT)/src/flash/ui/*.js $(BUILD_DIR)/src/flash/ui/
	mkdir $(BUILD_DIR)/src/flash/utils
	cp $(SHUMWAY_ROOT)/src/flash/utils/*.js $(BUILD_DIR)/src/flash/utils/
	mkdir $(BUILD_DIR)/src/avm1
	cp $(SHUMWAY_ROOT)/src/avm1/*.js $(BUILD_DIR)/src/avm1/
	mkdir $(BUILD_DIR)/src/avm2
	cp $(SHUMWAY_ROOT)/src/avm2/*.js $(BUILD_DIR)/src/avm2/
	mkdir $(BUILD_DIR)/src/avm2/compiler
	cp $(SHUMWAY_ROOT)/src/avm2/compiler/*.js $(BUILD_DIR)/src/avm2/compiler/
	mkdir $(BUILD_DIR)/src/avm2/compiler/c4
	cp $(SHUMWAY_ROOT)/src/avm2/compiler/c4/*.js $(BUILD_DIR)/src/avm2/compiler/c4/
	mkdir -p $(BUILD_DIR)/src/avm2/compiler/lljs/src
	cp $(SHUMWAY_ROOT)/src/avm2/compiler/lljs/src/*.js $(BUILD_DIR)/src/avm2/compiler/lljs/src/
	mkdir -p $(BUILD_DIR)/src/avm2/generated/builtin
	cp $(SHUMWAY_ROOT)/src/avm2/generated/builtin/builtin.abc $(BUILD_DIR)/src/avm2/generated/builtin/
	mkdir -p $(BUILD_DIR)/src/avm2/generated/shell
	cp $(SHUMWAY_ROOT)/src/avm2/generated/shell/shell.abc $(BUILD_DIR)/src/avm2/generated/shell/
	mkdir -p $(BUILD_DIR)/src/avm2/generated/avm1lib
	cp $(SHUMWAY_ROOT)/src/avm2/generated/avm1lib/avm1lib.abc $(BUILD_DIR)/src/avm2/generated/avm1lib/
	mkdir $(BUILD_DIR)/lib
	cp $(SHUMWAY_ROOT)/lib/ByteArray.js $(BUILD_DIR)/lib/
	mkdir $(BUILD_DIR)/lib/DataView.js
	cp $(SHUMWAY_ROOT)/lib/DataView.js/* $(BUILD_DIR)/lib/DataView.js/
	mkdir $(BUILD_DIR)/lib/mp3
	cp $(SHUMWAY_ROOT)/lib/mp3/* $(BUILD_DIR)/lib/mp3/
	mkdir $(BUILD_DIR)/lib/stats
	cp -R $(SHUMWAY_ROOT)/lib/stats/LICENSE $(BUILD_DIR)/lib/stats/
	cp -R $(SHUMWAY_ROOT)/lib/stats/build $(BUILD_DIR)/lib/stats/
	# playerglobals for the inspector
	mkdir $(BUILD_DIR)/build
	mkdir $(BUILD_DIR)/build/playerglobal
	cp $(SHUMWAY_ROOT)/build/playerglobal/playerglobal.json $(BUILD_DIR)/build/playerglobal/
	cp $(SHUMWAY_ROOT)/build/playerglobal/playerglobal.abcs $(BUILD_DIR)/build/playerglobal/
	# Copy examples
	cp -R $(SHUMWAY_ROOT)/examples $(BUILD_DIR)
	# Copy build and iframe files
	cp -R iframe $(BUILD_DIR)/
	cp -R $(BUNDLE_DIR)/shumway*.js $(BUILD_DIR)/src
	# Copy extensions
	mkdir -p $(BUILD_DIR)/extension/firefox
	cp $(EXTENSION_DIR)/shumway.xpi $(BUILD_DIR)/extension/firefox/
	cp $(EXTENSION_DIR)/update.rdf $(BUILD_DIR)/extension/firefox/
	# Removing hidden files
	-find build -name ".DS_Store" -exec rm {} \;
	# Creating commit
	cd $(BUILD_DIR); git init .; git checkout -b gh-pages;
	cd $(BUILD_DIR); git add -A; git commit -m "Updates shumway gh-pages files"
	echo "Success gh-pages is created. To push:"
	echo "  cd build/web; git push -f git@github.com:mozilla/shumway.git gh-pages"

$(SHUMWAY_ROOT)/build/playerglobal/playerglobal.abcs:
	make -C $(SHUMWAY_ROOT)/utils build-playerglobal

ensureoutputdir: clean
	-mkdir -p $(BUILD_DIR)

clean:
	-rm -rf build
	-rm -rf $(BUILD_DIR)

PHONY: build clean ensureoutputdir build-extension
