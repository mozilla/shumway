# Just builds a ff extension

build:
	# Cleaning old files
	-rm -rf content/swf
	-rm -rf content/flash
	-rm -rf content/avm1
	-rm -rf content/avm2
	-rm shumway.xpi
	# Coping JavaScript content files
	mkdir content/swf
	cp ../../src/swf/*.js content/swf/
	mkdir content/flash
	cp ../../src/flash/*.js content/flash/
	mkdir content/flash/display
	cp ../../src/flash/display/*.js content/flash/display/
	mkdir content/flash/events
	cp ../../src/flash/events/*.js content/flash/events/
	mkdir content/flash/geom
	cp ../../src/flash/geom/*.js content/flash/geom/
	mkdir content/flash/ui
	cp ../../src/flash/ui/*.js content/flash/ui/
	mkdir content/avm1
	cp ../../src/avm1/*.js content/avm1/
	mkdir content/avm2
	cp ../../src/avm2/*.js content/avm2/
	mkdir content/avm2/utils
	cp ../../src/avm2/utils/*.js content/avm2/utils/
	cp ../../LICENSE .
	# Removing hidden files
	-find . -name ".DS_Store" | xargs rm
	# Packaging XPI file
	zip -r shumway.xpi install.rdf bootstrap.js content components LICENSE
