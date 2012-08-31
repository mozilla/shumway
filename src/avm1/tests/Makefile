TESTS = \
	test.stream.js \
	test.classes.js \
	test.globals.js \
	test.interpreter.js \
	$(NULL)

default:
	echo "run: make [install-mocha|test]"

test:
	./node_modules/.bin/mocha --reporter dot $(TESTS)

install-mocha:
	npm install mocha
	npm install expect.js

.PHONY: install-mocha test
