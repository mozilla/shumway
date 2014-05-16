// this is temporary worker to test postMessage tranfers
addEventListener('message', function (e) {
  postMessage(e.data);
});