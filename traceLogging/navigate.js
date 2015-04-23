loadRelativeToScript("engine.js")
var textmap = JSON.parse(read(data["dict"]))
var array = read(data["tree"], 'binary');
var tree = new DataTree(array.buffer, textmap);

function percent(percent) {
    percent *= 100;
    percent = percent.toFixed(2);
    while (percent.length != 6)
        percent = " "+percent
    return percent + "%";
}

childs = tree.childs(0);
total = tree.stop(childs[childs.length - 1]) - tree.start(childs[0])
tab = "  "
for (var i = 0; i < opened.length; i++) {
    id = childs[opened[i]];
    time = tree.stop(id) - tree.start(id)
    print(tab + percent(time/total) + " " + tree.text(id));

    childs = tree.childs(id)
    total = time
    tab += "  "
}
for (var i = 0; i < childs.length; i++) {
    id = childs[i]
    time = tree.stop(id) - tree.start(id)
    print(tab + percent(time/total) + " " + tree.text(id));
}

