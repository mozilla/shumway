var s = '<root><array><property id="0"><string>hd</string></property><property id="1"><string>sd</string></property><property id="2"><string>mobile</string></property></array></root>';

var d : XMLList = new XML(s).children(); // getting 'array'

for each (var obj: Object in d.children()) { // enum by all 'property'
  var item: Object = obj.children();
  trace('item: ' + item.name()); // shall print "string"
}

trace('items total: ' + d.children().children().length());

