function loadState() {
  return localStorage["Inspector-Settings"] ? JSON.parse(localStorage["Inspector-Settings"]) : {
    appCompiler: true,
    sysCompiler: false,
    verifier: true,
    release: true
  };
}

function saveState(state) {
  localStorage["Inspector-Settings"] = JSON.stringify(state);
}

var state = loadState();

updateAVM2State();

function updateAVM2State() {
  enableC4.value = true;
  enableVerifier.value = state.verifier;
  traceExecution.value = state.trace ? 2 : 0;
  release = state.release;
}

setTimeout(function displayInfo() {
  var output = "";
  var writer = new IndentingWriter(false, function (x) {
    x = x.replace(" ", "&nbsp;");
    output += x + "<br>";
  });

  Counter.trace(writer);
  // Timer.trace(writer);

  $("#info").html(output);
  setTimeout(displayInfo, 1000);
}, 1000);

$(".avm2Option").each(function() {
  $(this).change(function () {
    state[$(this).attr("id")] = $(this).attr('checked') ? true : false;
    saveState(state);
  });
  $(this).toggleClass("pressedState", !!state[$(this).attr('id')]);
});

$(".avm2Option").click(function () {
  $(this).toggleClass("pressedState");
  var name = $(this).attr('id');
  state[name] = $(this).hasClass("pressedState");
  saveState(state);
  updateAVM2State();
});
