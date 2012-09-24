var body = $("body");
var stage = $("#stage");

function readFile(file) {
  var reader = new FileReader();
  if (file.name.endsWith(".abc")) {
    reader.onload = function() {
      var result = this.result;
      executeFile(file.name, new Uint8Array(result));
    }
  } else if (file.name.endsWith(".swf")) {
    reader.onload = function() {
      SWF.embed(this.result, stage[0]);
    }
  } else {
    throw new TypeError("unsupported format");
  }
  reader.readAsArrayBuffer(file);
}

body.on("dragenter dragover", function(event) {
  event.stopPropagation();
  event.preventDefault();
});

body.on("drop", function(event) {
  event.stopPropagation();
  event.preventDefault();
  var file = event.originalEvent.dataTransfer.files[0];
  readFile(file);
});

$("#files").on("change", function(event) {
  var file = event.originalEvent.target.files[0];
  readFile(file);
});

$("#openFile").click(function () {
  $("#files").click();
});

