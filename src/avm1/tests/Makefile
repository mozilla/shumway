TESTS = \
	test.stream.js \
	test.classes.js \
	test.globals.js \
	test.interpreter.js \
	$(NULL)

NODE_MODULES = ../../../utils/node_modules
MOCHA_HOME = $(NODE_MODULES)/.bin

default:
	echo "run: make test"

test:
	NODE_PATH=$(NODE_MODULES) $(MOCHA_HOME)/mocha --reporter dot $(TESTS)

.PHONY: default test
