# Builds gh-pages

SHUMWAY_ROOT=..

build: clean \
       $(SHUMWAY_ROOT)/src/flash/playerGlobal.min.abc \
       build-extension
	mkdir build
	cp -R $(SHUMWAY_ROOT)/LICENSE index.html images build/
	# Coping JavaScript content files
	mkdir build/src
	mkdir build/src/swf
	cp $(SHUMWAY_ROOT)/src/swf/*.js build/src/swf/
	mkdir build/src/flash
	cp $(SHUMWAY_ROOT)/src/flash/*.js build/src/flash/
	cp $(SHUMWAY_ROOT)/src/flash/playerGlobal.min.abc build/src/flash/
	mkdir build/src/flash/display
	cp $(SHUMWAY_ROOT)/src/flash/display/*.js build/src/flash/display/
	mkdir build/src/flash/events
	cp $(SHUMWAY_ROOT)/src/flash/events/*.js build/src/flash/events/
	mkdir build/src/flash/geom
	cp $(SHUMWAY_ROOT)/src/flash/geom/*.js build/src/flash/geom/
	mkdir build/src/flash/media
	cp $(SHUMWAY_ROOT)/src/flash/media/*.js build/src/flash/media/
	mkdir build/src/flash/net
	cp $(SHUMWAY_ROOT)/src/flash/net/*.js build/src/flash/net/
	mkdir build/src/flash/system
	cp $(SHUMWAY_ROOT)/src/flash/system/*.js build/src/flash/system/
	mkdir build/src/flash/text
	cp $(SHUMWAY_ROOT)/src/flash/text/*.js build/src/flash/text/
	mkdir build/src/flash/ui
	cp $(SHUMWAY_ROOT)/src/flash/ui/*.js build/src/flash/ui/
	mkdir build/src/flash/utils
	cp $(SHUMWAY_ROOT)/src/flash/utils/*.js build/src/flash/utils/
	mkdir build/src/avm1
	cp $(SHUMWAY_ROOT)/src/avm1/*.js build/src/avm1/
	mkdir build/src/avm2
	cp $(SHUMWAY_ROOT)/src/avm2/*.js build/src/avm2/
	mkdir build/src/avm2/compiler
	cp $(SHUMWAY_ROOT)/src/avm2/compiler/*.js build/src/avm2/compiler/
	mkdir -p build/src/avm2/compiler/lljs/src
	cp $(SHUMWAY_ROOT)/src/avm2/compiler/lljs/src/*.js build/src/avm2/compiler/lljs/src/
	mkdir -p build/src/avm2/generated/builtin
	cp $(SHUMWAY_ROOT)/src/avm2/generated/builtin/builtin.abc build/src/avm2/generated/builtin/
	mkdir build/lib
	mkdir build/lib/Kanvas
	cp $(SHUMWAY_ROOT)/lib/Kanvas/* build/lib/Kanvas/
	mkdir build/lib/DataView.js
	cp $(SHUMWAY_ROOT)/lib/DataView.js/* build/lib/DataView.js/
	# Copy examples
	cp -R $(SHUMWAY_ROOT)/examples build
	# Copy extensions
	mkdir -p build/extension/firefox
	cp $(SHUMWAY_ROOT)/extension/firefox/build/shumway.xpi build/extension/firefox/
	cp $(SHUMWAY_ROOT)/extension/firefox/build/update.rdf build/extension/firefox/
	# Removing hidden files
	-find build -name ".DS_Store" | xargs rm
	# Creating commit
	cd build; git init .; git checkout -b gh-pages;
	cd build; git add -A; git commit -m "Updates shumway gh-pages files"
	echo "Success gh-pages is created. To push:"
	echo "  cd web/build; git push -f git@github.com:mozilla/shumway.git gh-pages"

build-extension:
	$(MAKE) -C $(SHUMWAY_ROOT)/extension/firefox build

$(SHUMWAY_ROOT)/src/flash/playerGlobal.min.abc:
	make -C $(SHUMWAY_ROOT) build-playerglobal

clean:
	-rm -rf build

PHONY: build clean build-extension
