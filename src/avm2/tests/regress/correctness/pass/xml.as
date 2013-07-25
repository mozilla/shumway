print("XML statics");
(function () {
  var tests = [
    [XML.ignoreWhitespace = true, XML.ignoreWhitespace],
  ];
  for (var i = 0; i < tests.length; i++) {
    print(i + ": " + tests[i]);
  }
})();

print("Testing Basic XML");
(function () {
  var x = <foo a="aaa"><bar b="bbb">e=mc^2</bar></foo>;
  x.cat = <cat c="ccc"/>;
  x.@name = "x";
  x.@type = "T";
  var tests = [
    [x.name() == "foo", x.name()],
    [x.bar.name() == "bar", x.bar.name()],
    [x.@a == "aaa", x.@a],
    [x.@type == "T", x.@type],
    [x..bar == "e=mc^2", x..bar],
  ];
  for (var i = 0; i < tests.length; i++) {
    print(i + ": " + tests[i]);
  }
})();

print("Testing Any Name");
(function () {
  var x = <foo a="aaa"><bar b="bbb"/><cat c="ccc"/></foo>;
  var r1 = <><bar b="bbb"/><cat c="ccc"/></>;
  var tests = [
    [x.*.toXMLString() === r1.toXMLString(), x.*.toXMLString()],
    [x.@*.toString() === "aaa", x.@*.toString()],
    [x.*.@*.toString() === "bbbccc", x.*.@*.toString()],
  ];
  for (var i = 0; i < tests.length; i++) {
    print(i + ": " + tests[i]);
  }
})();

print("Testing attribute() and attributes() methods");
(function () {
  var x = <foo a="aaa"><bar b="bbb"/><cat c="ccc"/></foo>;
  var r1 = <><bar b="bbb"/><cat c="ccc"/></>;
  var tests = [
    [x.attribute("*"), x.attribute("*")],
    [x.attributes(), x.attributes()],
    [x.*.attribute("*"), x.*.attribute("*")],
    [x.*.attributes(), x.*.attributes()],
  ];
  for (var i = 0; i < tests.length; i++) {
    print(i + ": " + tests[i]);
  }
})();

print("Testing enumeration");
(function () {
  var x = <><foo a="aaa"/><bar b="bbb"/><cat c="ccc"/></>;
  x.foo;
  var a = []
  for each (var v in x) {
    a.push(v.@*);
  }
  var tests = [
    [a]
  ];
  for (var i = 0; i < tests.length; i++) {
    print(i + ": " + tests[i]);
  }
})();

print("Testing XMLList.prototype.setProperty() (aka [[PUT]])");
(function () {
  var x = <foo a="aaa"><bar b="bbb"/><bar/><cat c="ccc"/></foo>;
  var tests = [
    [x.bar.toXMLString()],
//    [x.bar = "barbarbar", x.bar.toXMLString()],
//    [x.* = "***", x.toXMLString()]
  ];
  for (var i = 0; i < tests.length; i++) {
    print(i + ": " + tests[i]);
  }
})();

print("Testing YouTube use of E4X");
class A {}
(function () {
  var variable:*;
  var type:XML;
  var eventClass:Class;

  var loc1:*;
  variable = undefined;
  eventClass = A;
  type =
    <type name="avmplus::A" base="Class" isDynamic="true" isFinal="true" isStatic="true">
      <extendsClass type="Class"/>
      <extendsClass type="Object"/>
      <variable name="c" type="String"/>
      <variable name="b" type="String"/>
      <variable name="a" type="String"/>
      <factory type="avmplus::A">
        <extendsClass type="Object"/>
        <variable name="x" type="*"/>
        <variable name="z" type="*"/>
        <variable name="y" type="*"/>
      </factory>
    </type>;

  var loc2:*=0;
  var loc5:*=0;
  var loc6:*=type;
  var loc4:*=new XMLList("");
  for each (var x:* in loc6.*) {
    with(x) {
      print("K: " + @type);
    }
  }
  return;

  for each (var loc7:* in loc6.*) {
    var loc8:*;
    with (loc8 = loc7) {
      print("WITH: " + @type.toString());
      if (@type == "String") {
        loc4[loc5++] = loc7;
      }
    }
  }
  var loc3:*=loc4;
  for each (variable in loc3) {
    eventClass[variable.@name] = type.@name + "." + variable.@name;
  }
  var keys = [];
  for (var p in eventClass) {
    keys.push(p);
  }
  keys.sort();
  print("keys: " + keys.length);
  for (var i = 0; i < keys.length; i++) {
    var p = keys[i];
    print("eventClass[p]="+eventClass[p]);
  }
})();

print("Testing XML.prototype.child as used by Candy Crush");
(function () {
  var x = new XML(
    '<gamedata randomseed="1282661104" version="1">' +
    '<musicOn>false</musicOn>' +
    '<soundOn>true</soundOn>' +
    '<isShortGame>false</isShortGame>' +
    '<booster_1>0</booster_1>' +
    '<booster_2>0</booster_2>' +
    '<booster_3>0</booster_3>' +
    '<booster_4>0</booster_4>' +
    '<booster_5>0</booster_5>' +
    '<bestScore>100</bestScore>' +
    '<bestChain>2</bestChain>' +
    '<bestLevel>1</bestLevel>' +
    '<bestCrushed>5</bestCrushed>' +
    '<bestMixed>2</bestMixed>' +
    '<text id="intro.time">Le jeu commence dans {0} secondes</text>' +
    '<text id="intro.title">Speel als volgt:</text>' +
    '<text id="intro.info1">Sett sammen 3 godteri i samme farge for å knuse  ...</text>' +
    '<text id="intro.info2">You can also combine the power candy for additio ...</text>' +
    '<text id="game.nomoves">No more moves!</text>' +
    '<text id="outro.opengame">Please register to play the full game</text>' +
    '<text id="outro.title">Game Over</text>' +
    '<text id="outro.now">now</text>' +
    '<text id="outro.bestever">best ever</text>' +
    '<text id="outro.score">Score</text>' +
    '<text id="outro.chain">Longest chain</text>' +
    '<text id="outro.level">Level reached</text>' +
    '<text id="outro.crushed">Candy crushed</text>' +
    '<text id="outro.time">Game ends in {0} seconds</text>' +
    '<text id="outro.trophy.one">crushed {0} candy in one game</text>' +
    '<text id="outro.trophy.two">scored {0} in one game</text>' +
    '<text id="outro.trophy.three">made {0} combined candy in one game</text>' +
    '<text id="outro.combo_wrapper_line">combo wrapper line description</text>' +
    '<text id="outro.combo_color_color">combo color color description</text>' +
    '<text id="outro.combo_color_line">combo color line description</text>' +
    '<text id="outro.combo_color_wrapper">combo color wrapper description. ...</text>' +
    '</gamedata>');
  var tests = [
    [x.child("text").length()],
  ];
  for (var i = 0; i < tests.length; i++) {
    print(i + ": " + tests[i]);
  }
})();

