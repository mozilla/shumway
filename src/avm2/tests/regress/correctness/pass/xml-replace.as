// Replace the first employee record with an open staff requisition
print("Testing XML.protoype.replace()");
(function () {
  var emps =
    <employees>
      <employee id="0"><name>Jim</name><age>25</age></employee>
      <employee id="1"><name>Joe</name><age>20</age></employee>
    </employees>;

  var correct =
    <employees>
      <requisition status="open" />
      <employee id="1"><name>Joe</name><age>20</age></employee>
    </employees>;

  emps = emps.replace(0, <requisition status="open" />);
  print(emps.toXMLString() === correct.toXMLString() ? "PASS" : "FAIL");
})();

// Replace all children with open staff requisition
(function () {
  var emps =
    <employees>
      <employee id="0"><name>Jim</name><age>25</age></employee>
      <employee id="1"><name>Joe</name><age>20</age></employee>
    </employees>;

  var correct =
    <employees>
      <requisition status="open" />
    </employees>;

  var emps = emps.replace("*", <requisition status="open" />);
  print(emps.toXMLString() === correct.toXMLString() ? "PASS" : "FAIL");
})();

// Replace all employee elements with open staff requisition
(function () {
  var emps =
    <employees>
      <employee id="0"><name>Jim</name><age>25</age></employee>
      <employee id="1"><name>Joe</name><age>20</age></employee>
    </employees>;

  var correct =
    <employees>
      <requisition status="open" />
    </employees>;

  emps = emps.replace("employee", <requisition status="open" />);
  print(emps.toXMLString() === correct.toXMLString() ? "PASS" : "FAIL");
})();

(function () {
  XML.prettyPrinting = false;
  var xml = new XML("<employee id='1'><firstname>John</firstname><lastname>Walton</lastname><age>25</age></employee>");
  xml = xml.replace(0, 'Mr. John');
  print(xml.text() == "Mr. John" ? "PASS" : "FAIL");
})();

(function () {
  var x0 = new XML("<employee id='1'><firstname>John</firstname><lastname>Walton</lastname><age>25</age></employee>");
  var x1 = new XML("<employee id='1'><firstname>John</firstname><lastname>Walton</lastname><age>25</age></employee>");
  x1 = x1.replace('phone','542144');
  print(x0.toXMLString() === x1.toXMLString() ? "PASS" : "FAIL");  
})();

(function () {
  var x0 = new XML("<employee id='1'>Johnny<lastname>Walton</lastname><age>25</age></employee>");
  var x1 = new XML("<employee id='1'><firstname>John</firstname><lastname>Walton</lastname><age>25</age></employee>");
  x1 = x1.replace('firstname','Johnny');
  print(x0.toXMLString() === x1.toXMLString() ? "PASS" : "FAIL");  
})();

// XMLList.prototype.replace();
(function () {
  var emps =
    <employees>
      <employee id="0"><name>Jim</name><age>25</age></employee>
      <employee id="1"><name>Joe</name><age>20</age></employee>
    </employees>;

  var correct = <>
    <employees>
      <requisition status="open" />
      <employee id="1"><name>Joe</name><age>20</age></employee>
    </employees>
  </>;

  emps = emps.replace(0, <requisition status="open" />);
  print(emps.toXMLString() === correct.toXMLString() ? "PASS" : "FAIL");
})();
