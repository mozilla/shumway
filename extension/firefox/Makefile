# Just builds a ff extension

build:
	# Cleaning old files
	-rm -rf content/swf
	-rm -rf content/avm1
	-rm -rf content/avm2
	-rm shumway.xpi
	# Coping JavaScript content files
	mkdir content/swf
	cp ../../src/swf/*.js content/swf/
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
