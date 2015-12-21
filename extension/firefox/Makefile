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
CLOSURE ?= $(UTILS_HOME)/closure.jar
BUILD_DIR = ../../build/firefox
RESTARTLESS_DIR = ../../build/firefox-restartless
PROFILE ?= $(error Specify Firefox profile in PROFILE)
BUNDLES_DIR = ../../build/bundles-cc

# Just builds a ff extension

VERSION = `head -n 1 ../../build/version/version.txt`

build: ensureoutputdir
	# Copying extension files
	echo "Creating extension version: $(VERSION)"
	cp -R ../../LICENSE ../../LICENSE-OFL.txt ../../README-LICENSE.txt content chrome bootstrap.js chrome.manifest icon.png icon64.png $(BUILD_DIR)/
	sed s/\(SHUMWAY_VERSION\)/$(VERSION)/ install.rdf > $(BUILD_DIR)/install.rdf
	sed s/\(SHUMWAY_VERSION\)/$(VERSION)/ update.rdf > $(BUILD_DIR)/update.rdf
	cp ../../examples/inspector/debug/pingpong.js $(BUILD_DIR)/chrome/
	# Copying JavaScript content files
	mkdir -p $(BUILD_DIR)/content/playerglobal
	cp ../../build/playerglobal/playerglobal.json $(BUILD_DIR)/content/playerglobal/
	cp ../../build/playerglobal/playerglobal.abcs $(BUILD_DIR)/content/playerglobal/
	# Copying ABC and Relooper files
	mkdir -p $(BUILD_DIR)/content/libs
	cp ../../build/libs/builtin.abc $(BUILD_DIR)/content/libs/
	cp ../../build/libs/relooper.js $(BUILD_DIR)/content/libs/
	# Copying closure optimized shumway.js files
	cp $(BUNDLES_DIR)/shumway*.js $(BUILD_DIR)/content/
	cp ../../build/version/version.txt $(BUILD_DIR)/content/version.txt
	echo "extension" >> $(BUILD_DIR)/content/version.txt
	# Packaging XPI file
	cd $(BUILD_DIR); zip -r shumway.xpi *

ensureoutputdir: clean
	-mkdir -p $(BUILD_DIR)

clean:
	-rm -rf build
	-rm -rf $(BUILD_DIR)
	-rm -rf $(RESTARTLESS_DIR)

restartless:
	-rm -rf $(RESTARTLESS_DIR)
	mkdir -p $(RESTARTLESS_DIR)
	cd $(RESTARTLESS_DIR); find ../../extension/firefox -type f -maxdepth 1 -mindepth 1 -exec ln -s {} \;
	mkdir -p $(RESTARTLESS_DIR)/chrome
	cd $(RESTARTLESS_DIR)/chrome; find ../../../extension/firefox/chrome -maxdepth 1 -mindepth 1 -exec ln -s {} \;
	mkdir -p $(RESTARTLESS_DIR)/content
	cd $(RESTARTLESS_DIR)/content; find ../../../extension/firefox/content -maxdepth 1 -mindepth 1 -exec ln -s {} \;
	ln -s ../../../examples/inspector/debug/pingpong.js $(RESTARTLESS_DIR)/chrome/pingpong.js
	ln -s ../../../src/gfx $(RESTARTLESS_DIR)/content/gfx
	ln -s ../../../build/playerglobal $(RESTARTLESS_DIR)/content/playerglobal
	ln -s ../../../build/libs $(RESTARTLESS_DIR)/content/libs
	ln -s ../../../build/bundles/shumway.gfx.js $(RESTARTLESS_DIR)/content/shumway.gfx.js
	ln -s ../../../build/bundles/shumway.player.js $(RESTARTLESS_DIR)/content/shumway.player.js
	ln -s ../../../build/version/version.txt $(RESTARTLESS_DIR)/content/version.txt
	cd $(RESTARTLESS_DIR); pwd > "$(PROFILE)/extensions/shumway-dev@research.mozilla.org"
	grep "nglayout.debug.disable_xul_cache\", true" "$(PROFILE)/prefs.js" 1>/dev/null || echo "Set create 'nglayout.debug.disable_xul_cache' boolean preference to 'true'."

PHONY: build clean ensureoutputdir restartless
