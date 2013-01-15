var body = $("body");
var stage = $("#stage");

function readFile(file) {
  var reader = new FileReader();
  if (file.name.endsWith(".abc") || file.name.endsWith(".swf")) {
    reader.onload = function() {
      executeFile(file.name, this.result);
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

$(".closeButton").click(function (event) {
  event.target.parentElement.setAttribute('hidden', true);
});

$(document).on("keydown", function (event) {
  if (event.keyCode == 119 && event.ctrlKey) { // Ctrl+F8
    pauseExecution = !pauseExecution;
  }
});
