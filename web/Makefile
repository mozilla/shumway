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
EXTENSION_DIR=../build/firefox

build: ensureoutputdir \
       $(SHUMWAY_ROOT)/src/flash/playerglobal.abc \
       build-extension
	cp -R $(SHUMWAY_ROOT)/LICENSE index.html images $(BUILD_DIR)/
	# Coping JavaScript content files
	mkdir $(BUILD_DIR)/src
	mkdir $(BUILD_DIR)/src/swf
	cp $(SHUMWAY_ROOT)/src/swf/*.js $(BUILD_DIR)/src/swf/
	mkdir $(BUILD_DIR)/src/flash
	cp $(SHUMWAY_ROOT)/src/flash/*.js $(BUILD_DIR)/src/flash/
	cp $(SHUMWAY_ROOT)/src/flash/playerglobal.abc $(BUILD_DIR)/src/flash/
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
	mkdir $(BUILD_DIR)/lib
	mkdir $(BUILD_DIR)/lib/Kanvas
	cp $(SHUMWAY_ROOT)/lib/Kanvas/* $(BUILD_DIR)/lib/Kanvas/
	mkdir $(BUILD_DIR)/lib/DataView.js
	cp $(SHUMWAY_ROOT)/lib/DataView.js/* $(BUILD_DIR)/lib/DataView.js/
	mkdir $(BUILD_DIR)/lib/mp3
	cp $(SHUMWAY_ROOT)/lib/mp3/* $(BUILD_DIR)/lib/mp3/
	mkdir $(BUILD_DIR)/lib/xstats
	cp -R $(SHUMWAY_ROOT)/lib/xstats/* $(BUILD_DIR)/lib/xstats/
	# Copy examples
	cp -R $(SHUMWAY_ROOT)/examples $(BUILD_DIR)
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

build-extension:
	$(MAKE) -C $(SHUMWAY_ROOT)/extension/firefox build

$(SHUMWAY_ROOT)/src/flash/playerglobal.abc:
	make -C $(SHUMWAY_ROOT) build-playerglobal

ensureoutputdir: clean
	-mkdir -p $(BUILD_DIR)

clean:
	-rm -rf build
	-rm -rf $(BUILD_DIR)

PHONY: build clean ensureoutputdir build-extension
