TAMARIN_ACCEPTANCE = ../../src/avm2/tests/acceptance
OUTPUT = ../../src/avm1/tests/acceptance
TA_ECMA3 = $(TAMARIN_ACCEPTANCE)/ecma3
MTASC = ../mtasc/mtasc
TMP = $(OUTPUT)

EXCLUDE = \
  e15_4_2_1_3 \
  e15_4_4_2 \
  e15_4_4_5 \
  toLocaleString \
  eregress_74474_001 \
  eregress_74474_002 \
  $(NULL)

acceptance:
	-rm -fr $(OUTPUT)
	mkdir $(OUTPUT)
	find $(TA_ECMA3) -name "*.as" \
		-exec $(MAKE) build-test SOURCE={} TARGET=$(OUTPUT)/$(notdir {}).swf \;
	cd $(OUTPUT); ls *.swf > testfiles.txt

build-test:
	echo Processing $(SOURCE)...
ifeq "$(findstring $(basename $(notdir $(SOURCE))), $(EXCLUDE))" ""
	cp $(SOURCE) $(TMP)/TestBody.1~
	sed "s/function getTestCases/var getTestCases = function/" $(TMP)/TestBody.1~ > $(TMP)/TestBody.2~
	sed "s/writeHeaderToLog/TestCase.writeHeaderToLog/" $(TMP)/TestBody.2~ > $(TMP)/TestBody.1~
	sed "s/startTest/TestCase.startTest/" $(TMP)/TestBody.1~ > $(TMP)/TestBody.2~
	sed "s/var testcases = getTestCases();//" $(TMP)/TestBody.2~ > $(TMP)/TestBody.1~
	sed "s/testcases = getTestCases();//" $(TMP)/TestBody.1~ > $(TMP)/TestBody.2~
	sed "s/var testcases = new Array();/var testcases = new Array(); var getTestCases = function() { return testcases; }; /" $(TMP)/TestBody.2~ > $(TMP)/TestBody.1~
	sed "s/test();//" $(TMP)/TestBody.1~ > $(TMP)/TestBody.2~
	sed "s/var MYVAR;//g" $(TMP)/TestBody.2~ > $(TMP)/TestBody.1~
	sed "s/var MYVAR=/MYVAR=/g" $(TMP)/TestBody.1~ > $(TMP)/TestBody.2~
	sed "s/var MYVAR =/MYVAR=/g" $(TMP)/TestBody.2~ > $(TMP)/TestBody.1~
	sed "s/function \([A-Za-z0-9_]\+\)/var \1 = function/g" $(TMP)/TestBody.1~ > $(TMP)/TestBody.2~
	sed "s/void 0/undefined/g" $(TMP)/TestBody.2~ > $(TMP)/TestBody.1~
	cat TestHeader.inc > $(TMP)/Test.as
	cat $(TMP)/TestBody.1~ >> $(TMP)/Test.as
	cat TestFooter.inc >> $(TMP)/Test.as
	rm $(TMP)/TestBody.1~ $(TMP)/TestBody.2~
	$(MTASC) -swf $(OUTPUT)/$(basename $(notdir $(SOURCE))).swf -main -header 1:1:1 \
		TestCase.as ReferenceError.as $(TMP)/Test.as
	rm $(TMP)/Test.as
else
	echo Excluded... skipping
endif

.PHONY: acceptance build-test
