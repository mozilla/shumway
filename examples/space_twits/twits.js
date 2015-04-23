// Based on https://github.com/dherman/space-twits

// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

// A freakishly stupid game. Doesn't even adhere very strictly to MVC.
// May Dijkstra have mercy on this sinner's soul.

// Scene graph classes (model / view).

function Scene(game_mc, width, height) {
    this.game_mc = game_mc;
    this.width = width;
    this.height = height;
    this.actors = [];
}

Scene.prototype.register = function(actor) {
    this.actors.push(actor);
    this.game_mc.asCallPublicProperty('addChild', [actor.mc]);
};

Scene.prototype.unregister = function(actor) {
    this.game_mc.asCallPublicProperty('removeChild', [actor.mc]);
    var i = this.actors.indexOf(actor);
    if (i >= 0) {
        this.actors.splice(i, 1);
    }
};

Scene.prototype.toString = function() {
    return "[object Scene]";
};

function Actor(scene, mc, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.mc = mc;
    this.mc.asSetPublicProperty('x', x);
    this.mc.asSetPublicProperty('y', y);
    scene.register(this);
}

Actor.prototype.moveTo = function(x, y) {
    this.x = x;
    this.y = y;
    this.mc.asSetPublicProperty('x', x);
    this.mc.asSetPublicProperty('y', y);
}

Actor.prototype.width = function() {
    return this.mc.asGetPublicProperty('width');
};

Actor.prototype.height = function() {
    return this.mc.asGetPublicProperty('height');
};

Actor.prototype.exit = function() {
    this.scene.unregister(this);
};

Actor.prototype.toString = function() {
    return "[" + this.type + " at " + this.x + ", " + this.y + "]";
};


function Alien(scene, x, y, direction, speed, strength) {
    var avm2 = Shumway.AVM2.Runtime.AVM2.instance;
    var SpaceshipClass = avm2.applicationDomain.getClass('twits.Spaceship');
    Actor.call(this, scene, new SpaceshipClass.instanceConstructor(), x, y);
    this.direction = direction;
    this.speed = speed;
    this.strength = strength;
    this.damage = 0;
}

Alien.prototype = Object.create(Actor.prototype);

Alien.prototype.type = "alien";

Alien.prototype.hit = function() {
    this.damage++;
    this.mc.asSetPublicProperty('alpha', 1 - (this.damage / this.strength));
};

Alien.prototype.dead = function() {
    return this.damage >= this.strength;
};

Alien.prototype.collidesWith = function(x, y, width, height) {
    var left = this.x - this.width() / 2, right = left + this.width(),
        top = this.y, bottom = top + this.height();
    return ((x > left && x < right) ||
            (x + width > left && x + width < right))
        && ((y > top && y < bottom) ||
            (y + height > top && y + height < bottom));
};

Alien.prototype.move = function() {
    var newX = this.x + (this.speed * this.direction);
    if (newX < this.width() / 2 || newX > this.scene.width - this.width() / 2) {
        this.direction *= -1;
        newX = this.x + (this.speed * this.direction);
    }
    this.moveTo(newX, this.y);
};


function SpaceShip(scene, x, y) {
    var avm2 = Shumway.AVM2.Runtime.AVM2.instance;
    var RocketClass = avm2.applicationDomain.getClass('twits.Rocket');
    Actor.call(this, scene, new RocketClass.instanceConstructor(), x, y);
    this.points = 0;
}

SpaceShip.prototype = Object.create(Actor.prototype);

SpaceShip.prototype.score = function() {
    this.points++;
};

SpaceShip.prototype.type = "spaceShip";

SpaceShip.prototype.left = function() {
    var minPosition = this.width() / 2;
    this.moveTo(Math.max(this.x - 10, minPosition), this.y);
};

SpaceShip.prototype.right = function() {
    var maxPosition = this.scene.width - this.width() / 2;
    this.moveTo(Math.min(this.x + 10, maxPosition), this.y);
};


function Shot(scene, x, y) {
    var avm2 = Shumway.AVM2.Runtime.AVM2.instance;
    var ShotClass = avm2.applicationDomain.getClass('twits.Shot');
    Actor.call(this, scene, new ShotClass.instanceConstructor(), x, y);
}

Shot.prototype = Object.create(Actor.prototype);

Shot.prototype.type = "shot";



// Controller
var Shumway;
function playTwits(shumwayObj) {
    Shumway = shumwayObj.Shumway;
    var game_mc = shumwayObj.stage.getChildAt(0);
    var width = shumwayObj.stage.stageWidth;
    var height = shumwayObj.stage.stageHeight;

    var SPACESHIP_HEIGHT = 50;
    var ALIEN_WIDTH = 50;
    var SCORE_HEIGHT = 40;

    var mid = width / 2;

    var scene, spaceShip, alien;

    scene = new Scene(game_mc, width, height);
    spaceShip = new SpaceShip(scene,
                              mid,
                              height - SPACESHIP_HEIGHT - SCORE_HEIGHT);
    alien = newAlien();

    var moving;

    function newAlien() {
        var x = Math.random() * (width - ALIEN_WIDTH) + (ALIEN_WIDTH / 2);
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
        game_mc.asCallPublicProperty('getChildByName', ["score"]).
                asSetPublicProperty('text', String(spaceShip.points * 1000));
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
