/// <reference path='all.ts'/>

module Shumway.Layers.Elements {

  import Frame = Shumway.Layers.Frame;
  import FrameContainer = Shumway.Layers.FrameContainer;
  // import RectanglePacker = Shumway.Geometry.RectanglePacker;

  export class FontAtlas {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    // packer: RectanglePacker;
    constructor(font: string) {
      this.canvas = document.createElement("canvas");
      var width = 512;
      var height = 512;
      this.canvas.width = width * 2;
      this.canvas.height = height * 2;
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
      this.context = this.canvas.getContext("2d");
      this.context.font = font;
      this.context.fillStyle = "white";
      // this.packer = new RectanglePacker(this.canvas.width, this.canvas.height, 2);
      this._draw();
    }
    private _draw() {
      this.context.save();
      this.context.scale(2, 2);
      var from = "0".charCodeAt(0);
      var to = "z".charCodeAt(0);
      for (var i = from; i < to * 16; i++) {
        var c = String.fromCharCode(i);
        var w = this.context.measureText(c).width;
//        var r = this.packer.insert(w, 12);
//        if (r) {
//          this.context.fillText(c, r.x, 12 + r.y);
//        }
      }
      this.context.restore();
    }
  }

  export class TextLine extends Frame {
    text: string;
    constructor(text: string) {
      super();
      this.text = text;
    }
  }

  export class Flake extends Frame {
    radius: number;
    density: number;
    rotationSpeed: number;
    scaleSpeed: number;
    speed: number;
    fillStyle = randomStyle();
    constructor(radius: number, density: number) {
      super();
      this.radius = radius;
      this.density = density;
      if (Math.random() < 0.9) {
        this.speed = 0;
        this.scaleSpeed = 0;
        this.rotationSpeed = 0;
      } else {
        this.speed = Math.random() / 5;
        this.scaleSpeed = 0.01 + Math.random() / 20;
        this.rotationSpeed = Math.random();
      }
      // this.rotation = Math.random() * 180;
    }
    render (context: CanvasRenderingContext2D, options?: any) {
      context.save();
      var t = this.transform;
      context.transform(t.a, t.b, t.c, t.d, t.tx, t.ty);
      context.fillStyle = this.fillStyle;
      context.fillRect(0, 0, this.w, this.h);
      context.restore();
    }
  }

  export class Snow extends FrameContainer implements IAnimator {
    private angle: number;
    private speed: number;
    constructor(count: number, radius: number, w: number, h: number) {
      super();
      this.w = w;
      this.h = h;
      this.angle = Math.random();
      this.createFlakes(count, radius);
    }
    private createFlakes(count: number, radius: number) {
      for (var i = 0; i < count; i++) {
        var flake = new Flake(radius / 4 + Math.random() * radius + 1, Math.random() * count);
        flake.x = Math.random() * this.w | 0;
        flake.y = Math.random() * this.h | 0;
        flake.h = flake.w = radius / 2 + Math.random() * radius;
        flake.origin.x = flake.w / 2;
        flake.origin.y = flake.h / 2;
        this.addChild(flake);
      }
    }
    onEnterFrame () {
      this.angle += 0.01;
      for (var i = 0; i < this.children.length; i++) {
        var flake: Flake = <Flake>this.children[i];
        flake.y += flake.speed * (Math.cos(this.angle + flake.density) + 1 + flake.radius / 2);
        flake.x += flake.speed * (Math.sin(this.angle) * 2);
        if (flake.x > this.w || flake.x < -flake.w || flake.y > this.h) {
          flake.x = Math.random() * (this.w - flake.w);
          flake.y = Math.random() * (this.h - flake.h) / 2;
        }
        flake.rotation += flake.rotationSpeed;
        if (flake.scaleX + flake.scaleSpeed > 2 || flake.scaleX + flake.scaleSpeed < 0.5) {
          flake.scaleSpeed *= -1;
        }
        flake.scaleX += flake.scaleSpeed;
      }
    }
  }
}