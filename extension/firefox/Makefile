UTILS_HOME = ../../utils
CLOSURE ?= $(UTILS_HOME)/cc.jar

# Just builds a ff extension

VERSION_BASELINE=3a85f8698233b9567be5
VERSION=0.5.`git log --format=oneline $(VERSION_BASELINE)..|wc -l|tr -d ' '`

build: clean
	# Coping extension files
	echo "Creating extension verions: $(VERSION)"
	mkdir build
	cp -R ../../LICENSE components content bootstrap.js build/
	sed s/\(SHUMWAY_VERSION\)/$(VERSION)/ install.rdf > build/install.rdf
	sed s/\(SHUMWAY_VERSION\)/$(VERSION)/ update.rdf > build/update.rdf
	# Coping JavaScript content files
	mkdir build/content/swf
	cp ../../src/swf/*.js build/content/swf/
	mkdir build/content/flash
	cp ../../src/flash/*.js build/content/flash/
	cp ../../src/flash/playerglobal.abc build/content/flash/
	# Extract UTF Strings
	mkdir build/content/flash/display
	cp ../../src/flash/display/*.js build/content/flash/display/
	mkdir build/content/flash/events
	cp ../../src/flash/events/*.js build/content/flash/events/
	mkdir build/content/flash/external
	cp ../../src/flash/external/*.js build/content/flash/external/
	mkdir build/content/flash/filters
	cp ../../src/flash/filters/*.js build/content/flash/filters/
	mkdir build/content/flash/geom
	cp ../../src/flash/geom/*.js build/content/flash/geom/
	mkdir build/content/flash/media
	cp ../../src/flash/media/*.js build/content/flash/media/
	mkdir build/content/flash/net
	cp ../../src/flash/net/*.js build/content/flash/net/
	mkdir build/content/flash/system
	cp ../../src/flash/system/*.js build/content/flash/system/
	mkdir build/content/flash/text
	cp ../../src/flash/text/*.js build/content/flash/text/
	mkdir build/content/flash/ui
	cp ../../src/flash/ui/*.js build/content/flash/ui/
	mkdir build/content/flash/utils
	cp ../../src/flash/utils/*.js build/content/flash/utils/
	mkdir build/content/avm1
	cp ../../src/avm1/*.js build/content/avm1/
	mkdir build/content/avm2
	cp ../../src/avm2/*.js build/content/avm2/
	mkdir build/content/avm2/compiler
	cp ../../src/avm2/compiler/*.js build/content/avm2/compiler/
	mkdir build/content/avm2/compiler/c4
	cp ../../src/avm2/compiler/c4/*.js build/content/avm2/compiler/c4/
	mkdir -p build/content/avm2/compiler/lljs/src
	cp ../../src/avm2/compiler/lljs/src/*.js build/content/avm2/compiler/lljs/src/
	mkdir -p build/content/avm2/generated/builtin
	cp ../../src/avm2/generated/builtin/builtin.abc build/content/avm2/generated/builtin/
	# Extract UTF Strings
	mkdir build/content/lib
	mkdir build/content/lib/Kanvas
	cp ../../lib/Kanvas/* build/content/lib/Kanvas/
	mkdir build/content/lib/DataView.js
	cp ../../lib/DataView.js/* build/content/lib/DataView.js/
	mkdir build/content/lib/mp3
	cp ../../lib/mp3/* build/content/lib/mp3/
	# Pre-compile tag handlers
	../../utils/jsshell/js generate-tag-handlers.js > build/content/swf/handlers.js
	# Build Loader.js, since it's loaded in a worker.
	CLOSURE=$(CLOSURE) node build.js ../../src/flash/display/Loader.js > build/content/flash/display/Loader.js
	# Package all the source files into two files.
	CLOSURE=$(CLOSURE) node build.js content/web/scripts.js -pl -fc -c s > build/content/shumway.js
	CLOSURE=$(CLOSURE) node build.js content/web/scripts-worker.js > build/content/shumway-worker.js
	# Removing hidden files
	-find build -name ".DS_Store" -exec rm {} \;
	# Packaging XPI file
	cd build; zip -r shumway.xpi *

clean:
	-rm -rf build

PHONY: build clean legacy-clean
