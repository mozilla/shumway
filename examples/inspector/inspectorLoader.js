var body = $("body");
var stage = $("#stage");

function readFile(file) {
  var reader = new FileReader();
  if (file.name.endsWith(".abc")) {
    reader.onload = function() {
      var result = this.result;
      createAVM2(function (avm2) {
        avm2.applicationDomain.executeAbc(new AbcFile(new Uint8Array(result), file.name));
      });
    }
  } else if (file.name.endsWith(".swf")) {
    reader.onload = function() {
      var result = this.result;
      createAVM2(function (avm2) {
        SWF.embed(result, stage[0], {avm2: avm2});
      });
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

