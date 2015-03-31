var x = 2;
for(var i = 0; i < 20; i++ ) {
  trace("Number.sqrt(" + x +") " + Number(1.4142135623730951455).toFixed(i) + " : " + Number.sqrt(x).toFixed(i));
}

for(var i = 1; i < 20; i++ ) {
  trace(Number(1.4142135623730951455).toFixed(i));
  trace(Number(1.4142135623730951455).toExponential(i).substring(0, i));
  trace(Number(1.4142135623730951455).toPrecision(i).substring(0, i));
}