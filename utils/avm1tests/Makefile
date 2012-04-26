TAMARIN_ACCEPTANCE = ../../src/avm2/tests/acceptance
OUTPUT = ../../src/avm1/tests/acceptance
TA_ECMA3 = $(TAMARIN_ACCEPTANCE)/ecma3
MTASC = ../mtasc/mtasc
TMP = $(OUTPUT)

acceptance:
	-rm -fr $(OUTPUT)
	mkdir $(OUTPUT)
	find $(TA_ECMA3) -name "*.as" \
		-exec $(MAKE) build-test SOURCE={} TARGET=$(OUTPUT)/$(notdir {}).swf \;
	# excluding bad tests
	cd $(OUTPUT); rm e15_4_2_1_3.swf
	cd $(OUTPUT); ls *.swf > testfiles.txt

build-test:
	echo Processing $(SOURCE)...
	cp $(SOURCE) $(TMP)/TestBody.1~
	sed "s/function getTestCases/var getTestCases = function/" $(TMP)/TestBody.1~ > $(TMP)/TestBody.2~
	sed "s/writeHeaderToLog/TestCase.writeHeaderToLog/" $(TMP)/TestBody.2~ > $(TMP)/TestBody.1~
	sed "s/startTest/TestCase.startTest/" $(TMP)/TestBody.1~ > $(TMP)/TestBody.2~
	sed "s/var testcases = getTestCases();//" $(TMP)/TestBody.2~ > $(TMP)/TestBody.1~
	sed "s/test();//" $(TMP)/TestBody.1~ > $(TMP)/TestBody.2~
	sed "s/var MYVAR;//" $(TMP)/TestBody.2~ > $(TMP)/TestBody.1~
	sed "s/var MYVAR=/MYVAR=/" $(TMP)/TestBody.1~ > $(TMP)/TestBody.2~
	sed "s/function (\w+)/var \1 = function/" $(TMP)/TestBody.2~ > $(TMP)/TestBody.1~
	cat TestHeader.inc > $(TMP)/Test.as
	cat $(TMP)/TestBody.1~ >> $(TMP)/Test.as
	cat TestFooter.inc >> $(TMP)/Test.as
	rm $(TMP)/TestBody.1~ $(TMP)/TestBody.2~
	$(MTASC) -swf $(OUTPUT)/$(basename $(notdir $(SOURCE))).swf -main -header 1:1:1 \
		TestCase.as ReferenceError.as $(TMP)/Test.as
	rm $(TMP)/Test.as

.PHONY: acceptance build-test
