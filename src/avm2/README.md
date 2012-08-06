## The Shumway ActionScript Virtual Machine 2

## Overview

Shumway includes a JavaScript implementation of the [ActionScript Virtual Machine 2](http://www.adobe.com/content/dam/Adobe/en/devnet/actionscript/articles/avm2overview.pdf) which is responsible for executing ActionScript 3 (AS3) bytecode.
ActionScript 1 & 2 have an entirely different execution model and are not described here.

[ActionScript 3](http://en.wikipedia.org/wiki/ActionScript) is a superset of JavaScript.
Unfortunately, a straight forward translation from AS3 to JavaScript is not possible for two reasons:

* ActionScript 3 programs are not delivered in source form, instead they are packaged in a compact stack-based bytecode format called ABC (ActionScript Bytecode).

* The semantics of ActionScript 3 (and the runtime environment it executes in) are sufficiently different from JavaScript that it makes a direct translation impossible.

This document describes the design of the Shumway ActionScript Virtual Machine 2 (or simply Shumway).

The design philosophy in Shumway is to map the JavaScript-like features of AS3 directly to JavaScript and then emulate the rest.
This means that many of new ActionScript 3 features such as: Classes, Typed Vectors, Interfaces, Method Closures and Namespaces are often not as fast as their JavaScript-like counterparts.

## High-Level Overview

![Shumway AVM2 Overview](https://github.com/mozilla/shumway/raw/master/src/avm2/docs/img/high-level.jpg)

### 1 - ABC File Format & Execution Modes

Unlike JavaScript, ActionScript 3 code is not delivered in source form, but rather in a bytecode format called `.abc` which is very similar to `.class` files in Java. A detailed description of the file format is available [here](http://www.adobe.com/content/dam/Adobe/en/devnet/actionscript/articles/avm2overview.pdf).

An ActionScript 3 bytecode file can be generated in several ways: using the AS3 Compiler (asc.jar) or using various Flash authoring tools.
In principle, much like Java bytecode, it doesn't have to originate from ActionScript 3 source and may even be the result of code obfuscators and optimizers. Because of this, the control flow present in the bytecode may not be expressible in a structured programming language making the job of decompilers difficult.

The Shumway Virtual Machine provides two bytecode execution modes:

* Interpreter Only
* Hybrid Interpreter / Just-in-Time (JIT) Compilation

The Interpreter is slow but offers low latency, the compiled code on the other hand is faster but compilation takes time.
The classic VM 101 approach is to use an Interpreter until the application has warmed up and then switch to compiled code for efficient execution.

Usually when we talk about compilers we refer to the translation from a high-level language to a lower-level target language (usually assembly).
In Shumway, the translation is reversed. We convert a low-level bytecode language into high-level source language, JavaScript.
This type of translation is usually called decompilation, but we refer to it as compilation.

Stack-based bytecode is easy to interpret but is hard to compile back into a structured language like JavaScript. One of the main difficulties is that ActionScript bytecode includes `goto` instructions that can describe arbitrary control flow. Modeling this control flow using JavaScript's structured control flow constructs can be difficult.

### 2 - ABC File Parser

The `.abc` file parser is fairly straight forward. Most of the code is in `parser.js` with some references to `constants.js`.
To parse an `.abc` file simply use:

    var abcFile = new AbcFile(bytes);

This constructs a JS object graph with all constant pool references resolved to objects rather than indices into the constant pool tables.
The parser module also creates JS wrappers for `.abc` file entities such as: `Trait`, `Namespace`, `Multiname`, `MethodInfo`, `ClassInfo`, `InstanceInfo` and `ScriptInfo`.

### 3 - Bytecode Normalizer

ABC bytecode has a rather compact representation that makes it hard to work with.
The bytecode normalizer rewrites the original bytecode, which is expressed as a sequence of variable length opcodes,
into an array of JS Bytecode objects with properties for each of its operands.
The operands associated with each bytecode instruction are listed in the `opcodes.js` file.
The bytecode normalizer also rewrites the indices of each bytecode instruction so that it becomes impossible to jump to the middle of an instruction.

### 4 - Bytecode Interpreter

The bytecode interpreter is a simple `switch` based interpreter. It emulates an execution stack using a JavaScript array and delegates most of its work by calling into the Runtime `runtime.js`.

### 5 - Runtime

The runtime does most of the heavy lifting.
It tries to model ActionScript semantics on top of JavaScript while at the same time making sure it doesn't step on its own toes.
For instance, what if a client ActionScript program executes the following statement:

    String.prototype.toString = function () {
      return "X";
    };

If we reflect the actual JavaScript `String.prototype` object to ActionScript, then the client program can easily interfere with the host Shumway VM that is running it.
If we don't reflect the prototype object, then we would have to emulate the prototype chain semantics.

#### Namespaces & Multinames

In ActionScript, a semingly benign property access operation such as `obj.p` turns out to be quite complex.
When you lookup a property `p` on an object `obj` you are actually looking for a property named `"p"` in a set of open namespaces on `obj`.
The ActionScript compiler does not compile `obj.p` as `obj["p"]` but rather:

    obj[[n1, n2, n3]::"p"]

Which translates to: find a property named `"p"` in `obj` any of the currently opened namespaces: `n1`, `n2`, `n3`.
The name, `[n1, n2, n3]::"p"` is called a Multiname (a set of namespaces and name pair) and is the way all properties are accessed in ABC bytecode.
Now, if you know something about the type of `obj` you may be able to resolve the Multiname to a QName (a single namespace and name pair, or qualified name) so that you don't have to search all the namespaces. However, type information is not always available, so often times you're out of luck.

In Shumway, we mangle QNames by concatenating the namespace and name parts together using the `$` character.
For instance, the `n2::p` QName is mangled to `n2$p`.
In order to implement the above Multiname property lookup, we have to do a linear search over all mangled QNames of the Multiname.

    var mangledQNames = ["n1$p", "n2$p", "n3$p"];
    for (var i = 0; i < mangledQNames.length; i++) {
      if (mangledQNames[i] in obj) {
        return obj[mangledQNames[i]];
      }
    }

Very horrible indeed, and it only gets worse.

In ActionScript you can actually specify the namespace and/or name parts of a multiname at runtime. So the expression `[x]::[y]` means that both, the
namespace and the name parts of the multiname are not known until runtime.

### Traits

In order to improve performance ActionScript 3 introduced a trait system. Traits are statically known (and optionally typed) properties of objects.
In theory (and in practice if you're implementing a VM in C/C++) traits can help you optimize property lookup by simply indexing into an object at a known offset rather than performing a name lookup. In the previous example, if the ActionScript compiler determines that `obj` is of a known type with a trait named `p`, it can compile `obj.p` as `obj[7]` where 7 is the index in a slot array that holds the value of the property `p`.
The problem is that in ABC bytecode, slot and named property access can alias the same storage location and there is no clean way to emulate this in JavaScript.

In Shumway, we compile slot property accesses to something like:

    obj[obj.slotNames[7]]

To make matters worse, traits can also be typed.
If the property `p` is typed as an `int`, then the value assigned to it must be coerced to an integer on assignment.
This means that `obj.p = "123"` really becomes `obj.p = int(123)` but the coercion is implicit and does not appear explicitly in the bytecode.
Our example above becomes:

    obj[obj.slotNames[7]] = obj.slotTypes[7]("123");

and similarly, for named property accesses:

    obj["ns2$p"] = obj.slotTypes["ns2$p"]("123");

If `obj` happens to be an object without a trait named `"p"` then no coercion is needed.
If we could prove that `obj` is always an object with a integer trait `p` then we could optimize both property accesses as:

    obj.ns$p = "123" | 0;

Although the AS3 compiler probably has this type information, it doesn't communicate it through the bytecode it generates.
Luckily, some of the type information is inferrable via a dataflow analysis performed by the Shumway verifier in step 7.

### Scope & Script Execution

Each `.abc` file contains one or more scripts, each with its own global object (similar to the JavaScript global object).
If a property is not found in the current script's global object, it is looked up in the global objects of the remaining scripts in the `.abc` file.
If the property is found but the script has not been executed, the script is executed before the value of the property is returned.
A `.swf` file generated from the Flash authoring tool can contain multiple `.abc` files. The `.swf` file indicates when these `.abc` files should be executed.
Furthermore, a `.swf` file can also load other `.swf` files and organize them into something called [Application & Security Domains](http://www.senocular.com/flash/tutorials/contentdomains/?page=1).

![Script Hierarchy](https://github.com/mozilla/shumway/raw/master/src/avm2/docs/img/tree.jpg)

Because of ActionScript's complex scoping semantics, we can't reflect JavaScript's scope chain so instead we implement our own scope chain manually using a linked list.

### Classes

The ActionScript 3 object model is a combination of the JavaScript's prototypal inheritance and Java-like class based inheritance.
Classes in ActionScript 3 are defined by a collection of statically declared class and instance traits but the Class objects themselves are actually created dynamically using the `newclass` bytecode. This is done in order to wire up the scope chain so that all base class objects appear on the scope chain of class member methods. (Class shadowing semantics of definitions in Application Domains also require that classes are created dynamically.)

Consider the following example:

    class A { public var x = 3; }
    A.prototype.z = 1;

    class B extends A { public var y = 4; }
    B.prototype.w = 2;

    var b = new B();

In Shumway, an ActionScript 3 class is modeled as JavaScript constructor function.
The `.prototype` of the JS constructor function points to an object called the `traitsPrototype`.
This object contains all the trait properties of the class along with accumulated traits from all of its base classes.
The prototype of the `traitsPrototype` points to the original ActionScript's class `.prototype` object.
When accessing a property of a class instance, we first look in the object itself, then in its traitsPrototype (which is now its `__proto__`) and then
finally in its original class prototype. The class definitions above are compiled to something like this:

    function A () {}

    var Pa = {};
    var Ta = Object.create(Pa);
    Ta.public$x = 3;
    A.public$prototype = Pa;
    A.prototype = A.traitsPrototype = Ta;
    Pa.z = 1;

    function B () {}
    var Pb = Object.create(Pa);
    var Tb = Object.create(Pb);
    Tb.public$y = 4;
    B.public$prototype = Pb;
    B.prototype = B.traitsPrototype = Tb;
    Pb.w = 2;

    var b = new B();

The nice thing is that we don't have to copy down the default trait properties whenever we create new class instances.
The `__proto__` of object `b` points to Class `B`'s `traitsPrototype` which in turn points to `Pb` then to `Pa`.
If the client AS3 program wants to access the `__proto__` of `b` it actually gets the `public$__proto__` which
correctly points to `Pb`.
AS3 visible properties are always prefixed with a namespace, in this case the `public` namespace, so there is no way for AS3
code to get a reference to the `traitsPrototype`.

![Shumway AVM2 Overview](https://github.com/mozilla/shumway/raw/master/src/avm2/docs/img/class.jpg)

### 6 - Control Flow Graph (CFG) Restructuring

After normalizing the bytecode, the analysis phase (`analysis.js`) constructs a tree of structured control flow constructs: `if`, `else if`, `while`, `break`, `exit`, `return` and `label` that represent the control flow represented in the bytecode. This information is then used by the compiler to generate JavaScript source. This is a lot more complicated than it sounds, see for example [Chapter 6 of this Dissertation](http://zyloid.com/recomposer/files/decompilation_thesis.pdf).

### 7 - Verifier

For security reasons `.abc` files need to be verified before they are executed. This is not necessary for Shumway because we're already executing in the JS security sandbox. If the program is malicious, the best it can do is take down the VM. The verifier however can also be used as a dataflow analysis to prove the types of storage locations. This information can be very useful to the compiler and other optimization passes downstream. The verifier is no yet implemented in Shumway, but it's coming soon.

### 8 - Compiler

The compiler translates ABC bytecode into JavaScript source using the control flow restructuring information computed by the analysis in step 6.
It also performs some simple optimizations and will be more aggressive in the future once the verifier from step 7 is implemented.
The compiler generates a JavaScript AST that conforms to the [Parser API](https://developer.mozilla.org/en/SpiderMonkey/Parser_API) specification.
It then uses [ESCodegen](https://github.com/Constellation/escodegen/) to emit JavaScript source and then finally it uses `eval` to execute the code.

