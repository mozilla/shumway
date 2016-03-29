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
	# Copying compatibility utils
	mkdir -p $(BUILD_DIR)/src
	cp $(SHUMWAY_ROOT)/src/compatibility.js $(BUILD_DIR)/src/
	# Copying generated JavaScript file
	mkdir $(BUILD_DIR)/build
	cp -R $(SHUMWAY_ROOT)/build/ts $(BUILD_DIR)/build/
	cp -R $(SHUMWAY_ROOT)/build/bundles $(BUILD_DIR)/build/
	# playerglobals for the inspector
	mkdir $(BUILD_DIR)/build/playerglobal
	cp $(SHUMWAY_ROOT)/build/playerglobal/playerglobal.json $(BUILD_DIR)/build/playerglobal/
	cp $(SHUMWAY_ROOT)/build/playerglobal/playerglobal.abcs $(BUILD_DIR)/build/playerglobal/
	# Copying ABC and Relooper files
	mkdir $(BUILD_DIR)/build/libs
	cp -R $(SHUMWAY_ROOT)/build/libs/*.abc $(BUILD_DIR)/build/libs/
	cp -R $(SHUMWAY_ROOT)/build/libs/*.js $(BUILD_DIR)/build/libs/
	mkdir $(BUILD_DIR)/build/version
	cp -R $(SHUMWAY_ROOT)/build/version/version.js $(BUILD_DIR)/build/version/
	# Copying examples
	cp -R $(SHUMWAY_ROOT)/examples $(BUILD_DIR)
	# Copying build and iframe files
	cp -R iframe $(BUILD_DIR)/
	# Copying extensions
	mkdir -p $(BUILD_DIR)/extension/firefox
	cp $(EXTENSION_DIR)/shumway.xpi $(BUILD_DIR)/extension/firefox/
	cp $(EXTENSION_DIR)/update.rdf $(BUILD_DIR)/extension/firefox/
	# Packaging shell
	mkdir -p $(BUILD_DIR)/shell
	cd ../build/shell; zip -r ../../web/$(BUILD_DIR)/shell/shumway-shell.zip *
	# Packaging shuobject
	mkdir -p $(BUILD_DIR)/shuobject
	cd ../build/shuobject; zip -r ../../web/$(BUILD_DIR)/shuobject/shuobject.zip *
	cp ../extension/shuobject/shuobject.js $(BUILD_DIR)/
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
