HINT = ./node_modules/jshint/bin/hint
CONFIG = ./lint.json

AVM1 = ../src/avm1
AVM2 = ../src/avm2

SOURCES = \
	$(AVM1)/stream.js \
	$(AVM1)/classes.js \
	$(AVM1)/globals.js \
	$(NULL)

lint:
	$(HINT) --config $(CONFIG) $(SOURCES)
	node ${AVM2}/bin/build.js ${AVM2}/bin/avm.js > ${AVM2}/bin/avm-release.js
	$(HINT) --config $(CONFIG) ${AVM2}/bin/avm-release.js

.PHONY: lint
