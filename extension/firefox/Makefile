# Just builds a ff extension

build:
	# Cleaning old files
	-rm -rf content/swf
	-rm -rf content/flash
	-rm -rf content/avm1
	-rm -rf content/avm2
	-rm -rf content/glue
	-rm -rf content/lib
	-rm shumway.xpi
	# Coping JavaScript content files
	mkdir content/swf
	cp ../../src/swf/*.js content/swf/
	mkdir content/flash
	cp ../../src/flash/*.js content/flash/
	cp ../../src/flash/playerGlobal.min.abc content/flash/
	mkdir content/flash/display
	cp ../../src/flash/display/*.js content/flash/display/
	mkdir content/flash/events
	cp ../../src/flash/events/*.js content/flash/events/
	mkdir content/flash/geom
	cp ../../src/flash/geom/*.js content/flash/geom/
	mkdir content/flash/media
	cp ../../src/flash/media/*.js content/flash/media/
	mkdir content/flash/net
	cp ../../src/flash/net/*.js content/flash/net/
	mkdir content/flash/text
	cp ../../src/flash/text/*.js content/flash/text/
	mkdir content/flash/ui
	cp ../../src/flash/ui/*.js content/flash/ui/
	mkdir content/flash/utils
	cp ../../src/flash/utils/*.js content/flash/utils/
	mkdir content/avm1
	cp ../../src/avm1/*.js content/avm1/
	mkdir content/avm2
	cp ../../src/avm2/*.js content/avm2/
	mkdir content/avm2/compiler
	cp ../../src/avm2/compiler/*.js content/avm2/compiler/
	mkdir -p content/avm2/compiler/lljs/src
	cp ../../src/avm2/compiler/lljs/src/*.js content/avm2/compiler/lljs/src/
	mkdir -p content/avm2/generated/builtin
	cp ../../src/avm2/generated/builtin/builtin.abc content/avm2/generated/builtin/
	mkdir content/lib
	mkdir content/lib/Kanvas
	cp ../../lib/Kanvas/* content/lib/Kanvas/
	mkdir content/lib/DataView.js
	cp ../../lib/DataView.js/* content/lib/DataView.js/
	cp ../../LICENSE .
	# Removing hidden files
	-find . -name ".DS_Store" | xargs rm
	# Packaging XPI file
	zip -r shumway.xpi install.rdf bootstrap.js content components LICENSE
