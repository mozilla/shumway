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

.PHONY: lint
