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

build: ensureoutputdir
	cp -R $(SHUMWAY_ROOT)/LICENSE index.html main.css demo.swf gallery images $(BUILD_DIR)/
	# Coping ABC files
	mkdir -p $(BUILD_DIR)/src/avm2/generated/builtin
	cp -R $(SHUMWAY_ROOT)/src/avm2/generated/builtin/*.abc $(BUILD_DIR)/src/avm2/generated/builtin/
	mkdir -p $(BUILD_DIR)/src/avm2/generated/avm1lib
	cp -R $(SHUMWAY_ROOT)/src/avm2/generated/avm1lib/*.abc $(BUILD_DIR)/src/avm2/generated/avm1lib/
	# Coping some JavaScript file
	mkdir -p $(BUILD_DIR)/src/player
	cp $(SHUMWAY_ROOT)/src/player/fakechannel.js $(BUILD_DIR)/src/player/
	mkdir -p $(BUILD_DIR)/src/swf
	cp $(SHUMWAY_ROOT)/src/swf/worker.js $(BUILD_DIR)/src/swf/
	# Coping generates JavaScript file
	mkdir $(BUILD_DIR)/build
	cp -R $(SHUMWAY_ROOT)/build/ts $(BUILD_DIR)/build/
	cp -R $(SHUMWAY_ROOT)/build/bundles $(BUILD_DIR)/build/
	# playerglobals for the inspector
	mkdir $(BUILD_DIR)/build/playerglobal
	cp $(SHUMWAY_ROOT)/build/playerglobal/playerglobal.json $(BUILD_DIR)/build/playerglobal/
	cp $(SHUMWAY_ROOT)/build/playerglobal/playerglobal.abcs $(BUILD_DIR)/build/playerglobal/
	# Copy examples
	cp -R $(SHUMWAY_ROOT)/examples $(BUILD_DIR)
	# Copy build and iframe files
	cp -R iframe $(BUILD_DIR)/
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

ensureoutputdir: clean
	-mkdir -p $(BUILD_DIR)

clean:
	-rm -rf build
	-rm -rf $(BUILD_DIR)

PHONY: build clean ensureoutputdir
