/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module Shumway.AVM2.Compiler {
  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import MethodInfo = Shumway.AVM2.ABC.MethodInfo;
  import Scope = Shumway.AVM2.Runtime.Scope;
  import Analysis = Shumway.AVM2.Analysis;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
  import ConstantPool = Shumway.AVM2.ABC.ConstantPool;

  // var verifier = new Shumway.AVM2.Verifier.Verifier();

  var writer = new IndentingWriter();

  declare var Relooper;

  var compileCount = 0;

  class Emitter {
    private _buffer: string [];
    private _indent = 0;
    private _emitIndent;
    constructor(emitIndent: boolean = true) {
      this._buffer = [];
      this._emitIndent = emitIndent;
    }
    reset() {
      this._buffer.length = 0;
      this._indent = 0;
    }
    enter(s: string) {
      this.writeLn(s);
      this._indent ++;
    }
    leave(s: string) {
      this._indent --;
      this.writeLn(s);
    }
    leaveAndEnter(s: string) {
      this._indent --;
      this.writeLn(s);
      this._indent ++;
    }
    writeLn(s: string) {
      if (this._emitIndent) {
        var prefix = "";
        for (var i = 0; i < this._indent; i++) {
          prefix += "  ";
        }
        s = prefix + s;
      }
      this._buffer.push(s);
    }
    writeLns(s: string) {
      var lines = s.split("\n");
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.length > 0) {
          this.writeLn(lines[i]);
        }
      }
    }
    writeEmitter(emitter: Emitter) {
      this._buffer.push.apply(this._buffer, emitter._buffer);
    }
    indent() {
      this._indent ++;
    }
    outdent() {
      this._indent --;
    }
    prependLn(s: string) {
      this._buffer.unshift(s);
    }
    toString(): string {
      return this._buffer.join("\n");
    }
  }

  class BaselineMultiname {
    constructor(public namespaces, public name, public flags) {

    }
  }
  class BaselineCompiler {
    blocks: Bytecode [];
    bytecodes: Bytecode [];
    bodyEmitter: Emitter;
    blockEmitter: Emitter;
    relooperEntryBlock: number;
    parameters: string [];
    local: string [];
    constantPool: ConstantPool;

    stack: number;
    private scopeIndex: number;

    static localNames = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

    /**
     * Make sure that none of these shadow global names, like "U" and "O".
     */
    static stackNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "_O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

    constructor(public methodInfo: MethodInfo, private scope: Scope, private hasDynamicScope: boolean,
                private globalName: string) {
      this.methodInfo.analysis;
      this.constantPool = this.methodInfo.abc.constantPool;
    }

    compile() {
      Relooper.cleanup();
      Relooper.init();

      this.bodyEmitter = new Emitter();
      this.blockEmitter = new Emitter();

      writer.enter("Compiling: " + (compileCount++) + " " + this.methodInfo);
      var analysis = this.methodInfo.analysis || new Analysis(this.methodInfo);
      if (!analysis.analyzedControlFlow) {
        analysis.analyzeControlFlow();
      }

      var blocks = this.blocks = analysis.blocks;
      this.bytecodes = analysis.bytecodes;

      writer.writeLn("Code: " + this.bytecodes.length);
      writer.writeLn("Blocks: " + blocks.length);
      writer.outdent();

      this.local = [];
      for (var i = 0; i < this.methodInfo.localCount; i ++) {
        this.local.push(this.getLocalName(i));
      }
      this.parameters = [];
      for (var i = 0; i < this.methodInfo.parameters.length; i ++) {
        var param = this.methodInfo.parameters[i];
        var paramName = this.local[i];
        this.parameters.push(paramName);
        if (param.optional && param.isUsed) {
          this.bodyEmitter.writeLn('arguments.length < ' + (i + 1) + ' && (' + paramName + ' = ' + param.value + ');');
        }
      }

      var localsDefinition = 'var ';
      for (var i = this.parameters.length; i < this.local.length; i++) {
        localsDefinition += this.local[i] + (i < (this.local.length - 1) ? ', ' : ';');
      }
      this.bodyEmitter.writeLn(localsDefinition);

      var stackSlotsDefinition = 'var ';
      for (var i = 0; i < this.methodInfo.maxStack; i++) {
        stackSlotsDefinition += this.getStack(i) + (i < (this.methodInfo.maxStack - 1) ? ', ' : ';');
      }
      this.bodyEmitter.writeLn(stackSlotsDefinition);

      this.bodyEmitter.writeLn('var mi = ' + this.globalName + ';');

      var relooperEntryBlock = this.relooperEntryBlock = Relooper.addBlock("// Entry Block");

      for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        block.relooperBlock = Relooper.addBlock("// Block: " + block.bid);
      }

      for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        this.stack = 0;
        this.scopeIndex = 0;
        this.emitBlock(block);
      }

      Relooper.addBranch(relooperEntryBlock, blocks[0].relooperBlock);

      for (var i = 1; i < blocks.length; i++) {
        Relooper.addBranch(blocks[i - 1].relooperBlock, blocks[i].relooperBlock);
      }

      var body = this.bodyEmitter.toString() + '\n' + Relooper.render(this.relooperEntryBlock);

      writer.writeLn(body);
      return {body: body, parameters: this.parameters};
    }

    getStack(i: number): string {
      if (i >= BaselineCompiler.stackNames.length) {
        return "s" + (i - BaselineCompiler.stackNames.length);
      }
      return BaselineCompiler.stackNames[i];
    }

    getLocalName(i: number): string {
      if (i >= BaselineCompiler.localNames.length) {
        return "l" + (i - BaselineCompiler.localNames.length);
      }
      return BaselineCompiler.localNames[i];
    }

    getScope(i: number): string {
      return "$" + i;
    }

    getLocal(i: number): string {
      if (i < 0 || i >= this.local.length) {
        throw new Error("Out of bounds local read: " + i + ' > ' + (this.local.length - 1));
      }
      return this.local[i];
    }

    peekAny(): string {
      return this.peek();
    }

    peek(): string {
      return this.getStack(this.stack - 1);
    }

    popAny(): string {
      return this.pop();
    }

    emitPopTemporaries(n: number) {
      for (var i = 0; i < n; i++) {
        this.blockEmitter.writeLn("var t" + i + " = " + this.pop() + ";");
      }
    }

    emitPushTemporary(...indices: number []) {
      for (var i = 0; i < indices.length; i++) {
        this.emitPush("t" + indices[i]);
      }
    }

    pop(): string {
      this.stack --;
      var v = this.getStack(this.stack);
      writer && writer.writeLn("// popped: stack: " + this.stack + " " + v);
      return v;
    }

    emitBlock(block: Bytecode) {
      this.blockEmitter.reset();
      this.blockEmitter.writeLn("// Block: " + block.bid);
      var bytecodes = this.bytecodes;
      for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
        var bc = bytecodes[bci];
        this.emitBytecode(block, bc);
      }
      Relooper.setBlockCode(block.relooperBlock, this.blockEmitter.toString());
    }

    peekScope() {
      return this.getScope(this.scopeIndex - 1);
    }

    emitBytecode(block: Bytecode, bc: Bytecode) {
      var multiname: BaselineMultiname;
      var op = bc.op;
      this.blockEmitter.writeLn("// BC: " + String(bc));
      switch (op) {
        case OP.getlocal:
          this.emitLoadLocal(bc.index);
          break;
        case OP.getlocal0:
        case OP.getlocal1:
        case OP.getlocal2:
        case OP.getlocal3:
          this.emitLoadLocal(op - OP.getlocal0);
          break;
        case OP.setlocal:
          this.emitStoreLocal(bc.index);
          break;
        case OP.setlocal0:
        case OP.setlocal1:
        case OP.setlocal2:
        case OP.setlocal3:
          this.emitStoreLocal(op - OP.setlocal0);
          break;
        case OP.pushwith:
        case OP.pushscope:
          this.emitPushScope(op === OP.pushwith);
          break;
        case OP.ifge:
        case OP.ifgt:
        case OP.ifle:
        case OP.iflt:
        case OP.iftrue:
        case OP.iffalse:
        case OP.ifeq:
        case OP.ifne:
        case OP.ifstricteq:
        case OP.ifstrictne:
          this.emitIf(block, bc);
          break;
        case OP.pushstring:
          this.emitPush('"' + this.constantPool.strings[bc.index] + '"');
          break;
        case OP.getlex:
          multiname = this.popMultiname(bc.index);
          this.blockEmitter.writeLn("// Read: " + multiname.name);
          // push(this.getProperty(this.findProperty(multiname, true), multiname, false));
          break;
        case OP.constructsuper:
          this.emitConstructSuper(bc);
          break;
        case OP.returnvoid:
          this.emitReturnVoid();
          break;
        default:
          this.blockEmitter.writeLn("// Not Implemented");
      }
    }

    emitLoadLocal(i: number) {
      this.emitPush(this.getLocal(i));
    }

    emitStoreLocal(i: number) {
      this.blockEmitter.writeLn(this.getLocal(i) + " = " + this.pop() + ";");
    }

    emitIf(block: Bytecode, bc: Bytecode) {
      var next = this.bytecodes[bc.position + 1];
      var target = bc.target;
      Relooper.addBranch(block.relooperBlock, next.relooperBlock);
      Relooper.addBranch(block.relooperBlock, target.relooperBlock, "c");
    }

    emitPush(v) {
      this.blockEmitter.writeLn(this.getStack(this.stack) + " = " + v +
                                "; // push at " + this.stack);
      this.stack++;
    }

    emitPushScope(isWith: boolean) {
      var parent = this.scopeIndex === 0 ? "null" : this.peekScope();
      var scope = "new Scope(" + parent + ", " + isWith + ")";
      this.blockEmitter.writeLn(this.getScope(this.scopeIndex) + " = " + scope + ";");
      this.scopeIndex ++;
    }

    emitConstructSuper(bc: Bytecode) {
      var superInvoke = 'mi.classScope.object.baseClass.instanceConstructorNoInitialize.call(this';
      var args = [];
      for (var i = bc.argCount; i--;) {
        args.push(this.pop());
      }
      if (args.length) {
        superInvoke += ', ' + args.join(', ');
      }
      superInvoke += ');';
      this.blockEmitter.writeLn(superInvoke);
      this.scopeIndex ++;
    }

    emitReturnVoid() {
      this.blockEmitter.writeLn('return;');
    }

    popMultiname(index: number): BaselineMultiname {
      var multiname = this.constantPool.multinames[index];
      var namespaces, name, flags;
      if (multiname.isRuntimeName()) {
        name = this.pop();
        // TODO: figure out what `flags` should be set to for runtime names.
        flags = 0;
      } else {
        name = multiname.name;
        flags = multiname.flags;
      }
      if (multiname.isRuntimeNamespace()) {
        namespaces = "[" + this.pop() + "]";
      } else {
        namespaces = "* constant(multiname.namespaces) *";
      }
      return new BaselineMultiname(namespaces, name, flags);
    }
  }

  export function baselineCompileMethod(methodInfo: MethodInfo, scope: Scope,
                                        hasDynamicScope: boolean, globalName: string) {
    var compiler = new BaselineCompiler(methodInfo, scope, hasDynamicScope, globalName);
    try {
      var result = compiler.compile();
      console.log(result);
    } catch (e) {
      writer.errorLn(e);
    }
    return result;
  }

  export function baselineCompileABC(abc: AbcFile) {
    abc.methods.forEach(function (method) {
      if (!method.code) {
        return;
      }
      baselineCompileMethod(method, null, false, '');
    });
  }
}
