
function getState() {
  return localStorage["Inspector-Settings"] ? JSON.parse(localStorage["Inspector-Settings"]): {};
}
var state = getState();
enableVerifier.value = state.chkVerifier;
enableOpt.value = state.chkOptimizations;
enableInlineCaching.value = state.chkInlineCaching;

function setState(state) {
  localStorage["Inspector-Settings"] = JSON.stringify(state);
}

// Bind checkboxes to the state.
$(window).load(function () {
  for (key in state) {
    $("#" + key).attr('checked', state[key]);
  }
});

$(":checkbox").each(function() {
  $(this).change(function () {
    state[$(this).attr("id")] = $(this).attr('checked') ? true : false;
    setState(state);
  });
});
