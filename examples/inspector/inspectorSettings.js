function loadState() {
  return localStorage["Inspector-Settings"] ? JSON.parse(localStorage["Inspector-Settings"]): {};
}

function saveState(state) {
  localStorage["Inspector-Settings"] = JSON.stringify(state);
}

var state = loadState();

updateAVM2State();

function updateAVM2State() {
  enableVerifier.value = state.verifier;
  enableOpt.value = state.optimizer;
  enableInlineCaching.value = state.inlineCaching;
}

$(".avm2Option").each(function() {
  $(this).change(function () {
    state[$(this).attr("id")] = $(this).attr('checked') ? true : false;
    saveState(state);
  });
  $(this).toggleClass("pressedState", state[$(this).attr('id')]);
});

$(".avm2Option").click(function () {
  $(this).toggleClass("pressedState");
  var name = $(this).attr('id');
  state[name] = $(this).hasClass("pressedState");
  saveState(state);
  updateAVM2State();
});

$("#execute").click(function () {
  var file = $("#file").val();
  executeFile(file);
});