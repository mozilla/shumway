function quickSort(arrayInput, left, right) {
  var i = left;
  var j = right;
  var pivotPoint = arrayInput[Math.round((left+right)*.5)];
  while (i<=j) {
    while (arrayInput[i]<pivotPoint) {
      i++;
    }
    while (arrayInput[j]>pivotPoint) {
      j--;
    }
    if (i<=j) {
      var tempStore = arrayInput[i];
      arrayInput[i] = arrayInput[j];
      i++;
      arrayInput[j] = tempStore;
      j--;
    }
  }
  if (left<j) {
    quickSort(arrayInput, left, j);
  }
  if (i<right) {
    quickSort(arrayInput, i, right);
  }
  return;
}

var a = [];
for (var i = 0; i < 100; i++) {
  a.push(100 - i);
}
quickSort(a, 0, a.length - 1);
trace(a);