// this is temporary worker to test postMessage transfers

function collectTransfers(obj, transfers) {
  if (typeof obj === 'object' && obj !== null) {
    if ('buffer' in obj && obj.buffer instanceof ArrayBuffer) {
      if (transfers.indexOf(obj.buffer) < 0) {
        transfers.push(obj.buffer);
      }
    } else {
      for (var i in obj) {
        collectTransfers(obj[i], transfers);
      }
    }
  }
}

addEventListener('message', function (e) {
  var transfers = [];
  collectTransfers(e.data, transfers);
  postMessage(e.data, transfers);
});
