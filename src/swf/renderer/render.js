/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                        		window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

SWF.render = function(stage, displayList, rate) {
	var ctx = stage.getContext('2d');
	(function loop() {
		if (displayList.dirty) {
			delete displayList.dirty;
			var depths = keys(displayList);
			depths.sort();
			console.time('frame');
			var i = 0;
			var depth;
			while (depth = depths[i++])
				displayList[depth].render(ctx);
			console.timeEnd('frame');
		}
		requestAnimationFrame(loop);
	})();
};
