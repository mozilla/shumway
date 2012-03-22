// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

// A freakishly stupid game. Doesn't even adhere very strictly to MVC.
// May Dijkstra have mercy on this sinner's soul.


// Scene graph classes (model / view).

function Scene(context, width, height, images) {
    this.context = context;
    this.width = width;
    this.height = height;
    this.images = images;
    this.actors = [];
}

Scene.prototype.register = function(actor) {
    this.actors.push(actor);
};

Scene.prototype.unregister = function(actor) {
    var i = this.actors.indexOf(actor);
    if (i >= 0) {
        this.actors.splice(i, 1);
    }
};

Scene.prototype.toString = function() {
    return "[object Scene]";
};

Scene.prototype.draw = function() {
    this.context.clearRect(0, 0, this.width, this.height);
    for (var a = this.actors, i = 0, n = a.length; i < n; i++) {
        a[i].draw();
    }
};

function Actor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    scene.register(this);
}

Actor.prototype.moveTo = function(x, y) {
    this.x = x;
    this.y = y;
    this.scene.draw();
}

Actor.prototype.draw = function() {
    var image = this.scene.images[this.type];
    this.scene.context.drawImage(image, this.x, this.y);
};

Actor.prototype.width = function() {
    return this.scene.images[this.type].width;
};

Actor.prototype.height = function() {
    return this.scene.images[this.type].height;
};

Actor.prototype.exit = function() {
    this.scene.unregister(this);
    this.scene.draw();
};

Actor.prototype.toString = function() {
    return "[" + this.type + " at " + this.x + ", " + this.y + "]";
};


function Alien(scene, x, y, direction, speed, strength) {
    Actor.call(this, scene, x, y);
    this.direction = direction;
    this.speed = speed;
    this.strength = strength;
    this.damage = 0;
}

Alien.prototype = Object.create(Actor.prototype);

Alien.prototype.type = "alien";

Alien.prototype.hit = function() {
    this.damage++;
};

Alien.prototype.dead = function() {
    return this.damage >= this.strength;
};

Alien.prototype.draw = function() {
    this.scene.context.globalAlpha = 1 - (this.damage / this.strength);
    Actor.prototype.draw.call(this);
    this.scene.context.globalAlpha = 1;
};

Alien.prototype.collidesWith = function(x, y, width, height) {
    var left = this.x, right = left + this.width(),
        top = this.y, bottom = top + this.height();
    return ((x > left && x < right) ||
            (x + width > left && x + width < right))
        && ((y > top && y < bottom) ||
            (y + height > top && y + height < bottom));
};

Alien.prototype.move = function() {
    var newX = this.x + (this.speed * this.direction);
    if (newX < 0 || newX > this.scene.width - this.width()) {
        this.direction *= -1;
        newX = this.x + (this.speed * this.direction);
    }
    this.moveTo(newX, this.y);
};


function SpaceShip(scene, x, y) {
    Actor.call(this, scene, x, y);
    this.points = 0;
}

SpaceShip.prototype = Object.create(Actor.prototype);

SpaceShip.prototype.score = function() {
    this.points++;
};

SpaceShip.prototype.type = "spaceShip";

SpaceShip.prototype.left = function() {
    this.moveTo(Math.max(this.x - 10, 0), this.y);
};

SpaceShip.prototype.right = function() {
    var maxWidth = this.scene.width - this.width();
    this.moveTo(Math.min(this.x + 10, maxWidth), this.y);
};


function Shot(scene, x, y) {
    Actor.call(this, scene, x, y);
}

Shot.prototype = Object.create(Actor.prototype);

Shot.prototype.type = "shot";



// Controller

function play(context, width, height, images) {
    var mid = width / 2;

    var scene, spaceShip, alien;

    scene = new Scene(context, width, height, images);
    spaceShip = new SpaceShip(scene,
                              mid - images.spaceShip.width / 2,
                              height - images.spaceShip.height - 10);
    alien = newAlien();
    scene.draw();

    var moving;

    function newAlien() {
        var x = Math.random() * (width - images.alien.width);
        var strength = Math.floor(Math.random() * 4) + 2;
        var direction = Math.random() < 0.5 ? -1 : 1;
        var speed = (Math.random() * 10) + 5;
        var alien = new Alien(scene, x, 10, direction, speed, strength);
        moving = setInterval(alien.move.bind(alien), 100);
        return alien;
    }

    function fire() {
        var shot = new Shot(scene, 0, 0);
        shot.moveTo(spaceShip.x + (spaceShip.width() / 2) - (shot.width() / 2),
                    spaceShip.y - shot.height());
        var firing = setInterval(function() {
            var newY = shot.y - 15;
            if (newY < 0) {
                shot.exit();
                clearInterval(firing);
            } else if (alien.collidesWith(shot.x, newY, shot.width(), shot.height())) {
                alien.hit();
                if (alien.dead()) {
                    score();
                    alien.exit();
                    clearInterval(moving);
                    alien = newAlien();
                }
                shot.exit();
                clearInterval(firing);
            } else {
                shot.moveTo(shot.x, newY);
            }
        }, 30);
    }

    function score() {
        spaceShip.score();
        document.getElementById("score").innerHTML = (spaceShip.points * 1000);
    }

    var holdingLeft, holdingRight;

    function stopLeft() {
        if (typeof holdingLeft === "undefined") {
            return;
        }
        clearInterval(holdingLeft);
        holdingLeft = void 0;
    }

    function stopRight() {
        if (typeof holdingRight === "undefined") {
            return;
        }
        clearInterval(holdingRight);
        holdingRight = void 0;
    }

    window.onkeydown = function(event) {
        switch (event.keyCode) {
          case 37:
            if (typeof holdingLeft !== "undefined") {
                break;
            }
            stopRight();
            spaceShip.left();
            holdingLeft = setInterval(spaceShip.left.bind(spaceShip), 30);
            break;
          case 39:
            if (typeof holdingRight !== "undefined") {
                break;
            }
            stopLeft();
            spaceShip.right();
            holdingRight = setInterval(spaceShip.right.bind(spaceShip), 30);
            break;
        }
    };

    window.onkeyup = function(event) {
        switch (event.keyCode) {
          case 13:
          case 32:
            fire();
            break;
          case 37:
            stopLeft();
            break;
          case 39:
            stopRight();
            break;
        }
    };
}
