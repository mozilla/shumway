

function getText(id:String):String {
  var data = new XML('<x><a id="A">Hello</a><a id="B">World</a></x>');
  var elements:XMLList = data.child("a");
  var texts:XMLList = texts = elements.(@id == id);
  return (texts.text());
}

trace(getText("A"));
trace(getText("B"));
trace("--- DONE ---");