# Just builds a ff extension

VERSION_BASELINE=c9d3aa7c886ce53648082
VERSION=0.3.`git log --format=oneline $(VERSION_BASELINE)..|wc -l|tr -d ' '`

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
	cp ../../src/flash/playerGlobal.min.abc build/content/flash/
	mkdir build/content/flash/display
	cp ../../src/flash/display/*.js build/content/flash/display/
	mkdir build/content/flash/events
	cp ../../src/flash/events/*.js build/content/flash/events/
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
	mkdir -p build/content/avm2/compiler/lljs/src
	cp ../../src/avm2/compiler/lljs/src/*.js build/content/avm2/compiler/lljs/src/
	mkdir -p build/content/avm2/generated/builtin
	cp ../../src/avm2/generated/builtin/builtin.abc build/content/avm2/generated/builtin/
	mkdir build/content/lib
	mkdir build/content/lib/Kanvas
	cp ../../lib/Kanvas/* build/content/lib/Kanvas/
	mkdir build/content/lib/DataView.js
	cp ../../lib/DataView.js/* build/content/lib/DataView.js/
	# Removing hidden files
	-find build -name ".DS_Store" | xargs rm
	# Packaging XPI file
	cd build; zip -r shumway.xpi *

clean: legacy-clean
	-rm -rf build

legacy-clean:
	# Cleaning old files
	-rm -rf content/swf
	-rm -rf content/flash
	-rm -rf content/avm1
	-rm -rf content/avm2
	-rm -rf content/glue
	-rm -rf content/lib
	-rm LICENSE
	-rm shumway.xpi

PHONY: build clean legacy-clean
