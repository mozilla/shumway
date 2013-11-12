var Flake = (function () {
  function flake(radius, density) {
    Frame.call(this);
    this.radius = radius;
    this.density = density;
    this.w = this.h = this.radius * 2;
    this._rotationSpeed = Math.random() / 100;
  }
  flake.prototype = Object.create(Frame.prototype);
  return flake;
})();

var Storm = (function () {
  function storm(parent, count, speed, radius) {
    this.parent = parent;
    this.speed = speed;
    this.angle = 0;
    this.flakes = [];

    for(var i = 0; i < count; i++) {
      var flake = new Flake(radius / 4 + Math.random() * radius + 1, Math.random() * count);
      // flake.center.x = flake.w / 2;
      // flake.center.y = flake.h / 2;
      flake.x = Math.random() * this.parent.w | 0;
      flake.y = Math.random() * this.parent.h | 0;
      flake.alignCenter();
      this.flakes.push(flake);
      this.parent.addChild(flake);
    }
    this.rotation = Math.random() * 0.1;
  }

  storm.prototype.step = function (time) {
    this.angle += 0.01;
    for (var i = 0; i < this.flakes.length; i++) {
      var flake = this.flakes[i];
      flake.y += this.speed * (Math.cos(this.angle + flake.density) + 1 + flake.radius / 2);
      flake.x += this.speed * (Math.sin(this.angle) * 2);
      if (flake.x > this.parent.w + flake.w || flake.x < -flake.w || flake.y > this.parent.h) {

        flake.x = Math.random() * (this.parent.w - flake.w);
        flake.y = Math.random() * (this.parent.h - flake.h);

//        if (i % 3 > 0){
//          flake.x = Math.random() * this.parent.w;
//          flake.y = -flake.h;
//        } else {
//          if (Math.sin(this.angle) > 0) {
//            flake.x = -flake.w;
//          } else {
//            flake.x = this.parent.w + 5;
//          }
//          flake.y = Math.random() * this.parent.h;
//        }
      }
      flake.rotation += flake._rotationSpeed;
    }
  };

  return storm;
})();