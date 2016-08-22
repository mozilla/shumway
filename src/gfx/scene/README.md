#Shumway's Scene Graph Library
A lightweight 2D scene graph library that attempts to abide by the following philosophy:

1. Performance is more important than usability. Whenever faced with a decision between usability and performance, performance wins every time.

2. Thou shall not allocate too many temporary objects. Even short lived objects increase GC pressure, which in turn increase GC pause times and cause jank.

3. Not a framework, just a tool. This library only provides the basic elements of a screen graph. The rest is up to you.

## Scene Graph Node Types
The scene graph can contain several types of nodes: 

* *Node*: The base type of all nodes in the tree.
* *Shape*: A leaf node that controls the placement of visual assets.
* *Renderable*: A visual asset that may be used by any number of Shapes.
* *Group*: A node that can contain other nodes.
* *Stage*: A group with fixed bounds that understands scaling and alignment.

## Basic Usage

```
// Create a stage.
var stage = new Stage(new Rectangle(0, 0, 1024, 10240));

// Create a renderable asset.
var renderable = new CustomRenderable(new Rectangle(-16, -16, 32, 32), function (context) {
  context.fillStyle = "red";
  context.fillRect(-16, -16, 32, 32);
});

// Create a shape to hold the renderable.
var shape = new Shape(renderable);

// Add the shape to the stage.
stage.addChild(shape);
```

### Transforms
Nodes that have been transformed in some way have a `Transform` object associated with them. Most nodes in the scene graph are never transformed so it makes sense to split off the information about the transform from the node itself.

```
// Getting a shape's current transform.
var t = shape.getTransform();
// Move shape to {x: 10, y: 20};
var m = Matrix.createIdentity().translate(10, 20);
t.setMatrix(m);
m.free();
```

This looks a bit verbose, but its for a good reason. The call to `getTransform` is necessary to lazily construct a Transform object.  Next, we need to construct a translation matrix in order to update the node's current matrix transform. 

### Primitive Object Pools

Frequently used primitive objects are pooled in order to minimize the amount memory allocation. For instance, `Matrix.createIdentity` allocates a new object only if no dirty matrix objects exit in a dirty pool. The call to `free` adds the matrix to the dirty pool so it can be reused.  
```
var a = Matrix.createIdentity();
a.free(); // a should not be used past this point.
var b = Matrix.createIdentity();
b.free();
print(a === b); // may be true
```
Pooling can lead to subtle bugs, so it's important to understand how to use it carefully.
```
// Getting a shape's current matrix.
var m = shape.getTransform().getMatrix();
```
For performance reasons, `getMatrix` returns a reference to the current matrix object. The returned object should never be mutated or aliased in any way. However, the object may be used to assign another node's transform matrix or passed around freely.
```
otherShape.getTransform().setMatrix(m);
```
By convention, the scene graph API ensures that no incoming arguments may be aliased or mutated. The `setMatrix` function above copies the elements of the Matrix object, so it is safe.

Problems arise whoever, when the returned matrix is inadvertently mutated:
```
var m = shape.getTransform().getMatrix();
m.translate(2, 2); // Illegally changes the node's matrix.
m.free(); // Even worse, the matrix may be mutated later.
```
Matrix operations such as `translate`, `scale`, `rotate` mutate the object in place. Matrix objects don't hold back references to the transforms they are used in, therefore mutating them fails to update internal scene graph data structure.
 
 To properly update a node's transform matrix, use the `setMatrix` function.
```
shape.getTransform().setMatrix(m.translate(2, 2));
```

If you require a copy of the Matrix object, use the `clone` function:
```
var m = shape.getTransform().getMatrix().clone();
```
or, more conveniently, pass `true` to the `getMatrix` function. Most API methods take an optional argument that clones the value before returning it. If the callee already knows that it has a reference to a temporary copy it can return that instead, which is why it's more convenient to do the cloning in the callee rather than the caller. 
```
var m = shape.getTransform().getMatrix(true);
m.free(); // Don't forget to release it.
```
### Bounds
The most important feature of the scene graph is computing bounding boxes efficiently. At any point, you can call `getBounds()` on a node to get its bounding rectangle in the local coordinate space. This is useful when culling objects in the scene graph during rendering, or performing hit testing.

An object's bonds is the union of all of its transformed children's bounds. This is expensive to compute each time, so bounds are cached in each object but may be invalidated if a ancestor node's transform is changed. A system of dirty bit propagation ensures that the smallest number of bounds computations takes place. Unless you have a pathological case, bounds computations should be `O(1)` constant time.

Shape bounds are derived from their renderable bounds. Group bounds may or may not be computed from child nodes, depending on whether the `BoundsAutoCompute` flag is set on the group node.

## Rendering
The Scene Graph Library includes a Canvas2D render as an example, but users are encouraged to write their own. Here is a very simple Canvas2D renderer.

```typescript
export class Renderer extends NodeVisitor {
  context: Canvas2DRenderingContext = ...;
  visitGroup(group: Group, state: RenderStage) {
    var children = group.getChildren();
    for (var i = 0; i < children.length; i++) {
	  this.visit(children[i], state.transform(group.getTransform());
    }
  }
  visitShape(shape: Shape, state: RenderStage) {
    var m = state.matrix;
    context.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
    shape.renderable.render(context);
  }
}
```

A more interesting renderer, one that avoids painting outside of the viewport can be written with a simple viewport intersection test:

```typescript
visitGroup(group: Group, state: RenderState) {
  var boundsAABB = node.getBounds(true);
  state.matrix.transformRectangleAABB(boundsAABB);
  if (!viewport.intersects(boundsAABB)) {
    return; // Exit early, culling all ancestors.
  }
  ...
}
```

Using the concatenated transform matrix (`state.matrix`) we can compute the Axially-Aligned Bounding Box of the group's children. If these bounds don't intersect the viewport then there is no point in recursing down the tree. This type of optimization is only possible if bounds computations are efficient. 

### Easel

To use the included Canvas2DRenderer, create an empty `<div/>` element and an instance of the `Easel` class.
```
<div id="a" style="width: 512px; height: 512px;"></div>

var easel = new Easel(document.getElementById("a"), false);
easel.world.addChild(shape);
easel.startRendering();
```

#### Keyboard Shortcuts
* **ALT + Left Mouse Button + Mouse Move**: Pan stage.
* **ALT + Scroll Wheel**: Zoom stage.
* **ALT + B**: Toggle drawing of bounding boxes.
* **ALT + S**: Toggle drawing of renderables, useful to find rendering bottlenecks.
* **ALT + F**: Toggle paint flashing.
* **ALT + V**: Toggle clipping viewport.
* **ALT + C**: Toggle clearing buffer before rendering.
* **ALT + O**: Pause rendering.
* **ALT + D**: Toggle drawing of dirty regions.

## Example
```
var Easel = Shumway.GFX.Easel;
var Shape = Shumway.GFX.Shape;
var Group = Shumway.GFX.Group;
var Matrix = Shumway.GFX.Matrix;
var Rectangle = Shumway.GFX.Rectangle;
var CustomRenderable = Shumway.GFX.CustomRenderable;
// Happy Face Renderable
var renderable = new CustomRenderable(new Rectangle(-70, -70, 140, 140), function (context) {
  var radius = 70;
  var eyeRadius = 10;
  var centerX = 0;
  var centerY = 0;
  var eyeXOffset = 25;
  var eyeYOffset = 20;
  // draw the yellow circle
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle = 'yellow';
  context.fill();
  context.lineWidth = 5;
  context.strokeStyle = 'black';
  context.stroke();
  // draw the eyes
  context.beginPath();
  var eyeX = centerX - eyeXOffset;
  var eyeY = centerY - eyeXOffset;
  context.arc(eyeX, eyeY, eyeRadius, 0, 2 * Math.PI, false);
  var eyeX = centerX + eyeXOffset;
  context.arc(eyeX, eyeY, eyeRadius, 0, 2 * Math.PI, false);
  context.fillStyle = 'black';
  context.fill();
  // draw the mouth
  context.beginPath();
  context.arc(centerX, centerY, 50, 0, Math.PI, false);
  context.stroke();
});
// Create Easel
var easel = new Easel(document.getElementById("a"), false);
var g = new Group();
setInterval(tick, 16);
// Animate Happy Face
function tick() {
  var children = g.getChildren();
  for (var i = 0; i < children.length; i++) {
    var c = children[i];
    c.getTransform().x += c.dx;
    c.getTransform().y += c.dy;
  }
}
tick();
// Subclass Shape to store dx and dy values.
function Happy(renderable) {
  Shape.call(this, renderable);
  var speed = 4;
  this.dx = (Math.random() - 0.5) * speed;
  this.dy = (Math.random() - 0.5) * speed;
}
Happy.prototype = Object.create(Shape.prototype);
// Create a bunch of happy faces.
for (var i = 0; i < 100; i++) {
  var s = new Happy(renderable);
  var m = s.getTransform().getMatrix();
  m.tx = Math.random() * easel.stage.content.getBounds().w;
  m.ty = Math.random() * easel.stage.content.getBounds().h;
  m.a = m.d = Math.max(0.2, Math.random() / 2);
  s.getTransform().setMatrix(m);
  g.addChild(s);
}
easel.world.addChild(g);
easel.startRendering();
```