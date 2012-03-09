# Just builds a ff extension

build:
	rm -rf content/swf
	rm -rf content/avm2
	cp -r ../../src/swf content/
	cp -r ../../src/avm2 content/
	cp ../../LICENSE .
	-rm shumway.xpi
	find . -name ".DS_Store" | xargs rm
	zip -r shumway.xpi install.rdf bootstrap.js content components LICENSE
