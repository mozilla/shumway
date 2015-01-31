/*
 * Copyright 2015 Mozilla Foundation
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
  import AbcFile = ABC.AbcFile;
  import MethodInfo = ABC.MethodInfo;
  import Scope = Runtime.Scope;
  import Multiname = ABC.Multiname;
  import InstanceInfo = ABC.InstanceInfo;
  import ConstantPool = ABC.ConstantPool;
  import assert = Debug.assert;

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

    static localNames = ["this", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

    /**
     * Make sure that none of these shadow global names, like "U" and "O".
     */
    static stackNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "_O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

    constructor(public methodInfo: MethodInfo, private scope: Scope, private hasDynamicScope: boolean,
                private globalMiName: string) {
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
        var paramName = this.local[i + 1];
        this.parameters.push(paramName);
        if (param.optional && param.isUsed) {
          this.bodyEmitter.writeLn('arguments.length < ' + (i + 1) + ' && (' + paramName + ' = ' + param.value + ');');
        }
      }

      if (this.local.length > this.parameters.length + 1) {
        var localsDefinition = 'var ';
        for (var i = this.parameters.length + 1; i < this.local.length; i++) {
          localsDefinition += this.local[i] + (i < (this.local.length - 1) ? ', ' : ';');
        }
        this.bodyEmitter.writeLn(localsDefinition);
      }

      if (this.methodInfo.maxStack > 0) {
        var stackSlotsDefinition = 'var ';
        for (var i = 0; i < this.methodInfo.maxStack; i++) {
          stackSlotsDefinition +=
          this.getStack(i) + (i < (this.methodInfo.maxStack - 1) ? ', ' : ';');
        }
        this.bodyEmitter.writeLn(stackSlotsDefinition);
      }

      var scopesDefinition = 'var ';
      for (var i = 0; i < this.methodInfo.maxScopeDepth; i++) {
        scopesDefinition += this.getScope(i) + (i < (this.methodInfo.maxScopeDepth - 1) ? ', ' : ';');
      }
      this.bodyEmitter.writeLn(scopesDefinition);

      this.bodyEmitter.writeLn('var mi = ' + this.globalMiName + ';');

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

    stackTop(): string {
      return this.getStack(this.stack);
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
      return this.getStack(this.stack);
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
      release || assert(this.scopeIndex > 0);
      return this.getScope(this.scopeIndex - 1);
    }

    emitBytecode(block: Bytecode, bc: Bytecode) {
      release || assert(this.stack >= 0);
      release || assert(this.scopeIndex >= 0);
      var opName;
      var op = bc.op;
      release || (opName = OP[op]);
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
        case OP.initproperty:
        case OP.setproperty:
          this.emitSetProperty(bc.index);
          break;
        case OP.getproperty:
          this.emitGetProperty(bc.index);
          break;
        case OP.findproperty:
          this.emitFindProperty(bc.index, false);
          break;
        case OP.findpropstrict:
          this.emitFindProperty(bc.index, true);
          break;
        case OP.callproperty:
        case OP.callpropvoid:
        case OP.callproplex:
          this.emitCallProperty(bc);
          break;
        case OP.getlex:
          this.emitGetLex(bc.index);
          break;
        case OP.pushwith:
          this.emitPushScope(true);
          break;
        case OP.pushscope:
          this.emitPushScope(false);
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
        case OP.pushdouble:
          this.emitPush(this.constantPool.doubles[bc.index]);
          break;
        case OP.pushint:
          this.emitPush(this.constantPool.ints[bc.index]);
          break;
        case OP.pushuint:
          this.emitPush(this.constantPool.uints[bc.index]);
          break;
        case OP.pushbyte:
        case OP.pushshort:
          this.emitPush(bc.value);
          break;
        case OP.pushnull:
          this.emitPush(null);
          break;
        case OP.pushundefined:
          this.emitPush(undefined);
          break;
        case OP.pushtrue:
          this.emitPush(true);
          break;
        case OP.pushfalse:
          this.emitPush(false);
          break;
        case OP.pushnan:
          this.emitPush('NaN');
          break;
        case OP.pop:
          // TODO whether this can validly happen. It does happen in mx.core::BitmapAsset's ctor,
          // where a block starts with a pop, but perhaps something has gone wrong earlier for that?
          if (this.stack > 0) {
            this.stack--;
          }
          break;
        case OP.constructsuper:
          this.emitConstructSuper(bc);
          break;
        case OP.coerce:
          this.emitCoerce(bc);
          break;
        case OP.convert_b:
          this.emitConvertB();
          break;
        case OP.returnvoid:
          this.emitReturnVoid();
          break;
        case OP.dup:
          this.emitDup();
          break;
        default:
          this.blockEmitter.writeLn("// Not Implemented");
          throw 1;
      }
    }

    emitLoadLocal(i: number) {
      this.emitPush(this.getLocal(i));
    }

    emitStoreLocal(i: number) {
      this.blockEmitter.writeLn(this.getLocal(i) + " = " + this.pop() + ";");
    }

    emitSetProperty(nameIndex: number) {
      var value = this.pop();
      var multiname = this.constantPool.multinames[nameIndex];
      if (!multiname.isRuntime() && multiname.namespaces.length === 1) {
        var qualifiedName = Multiname.qualifyName(multiname.namespaces[0], multiname.name);
        this.blockEmitter.writeLn(this.pop() + '.' + qualifiedName + ' = ' + value + ';');
      } else {
        this.emitMultiname(nameIndex);
        this.blockEmitter.writeLn(this.pop() + ".asSetProperty(mn.namespaces, mn.name, mn.flags, " +
                                  value + ");");
      }
    }

    emitGetProperty(nameIndex: number) {
      var multiname = this.constantPool.multinames[nameIndex];
      if (!multiname.isRuntime() && multiname.namespaces.length === 1) {
        var qualifiedName = Multiname.qualifyName(multiname.namespaces[0], multiname.name);
        this.emitPush(this.pop() + '.' + qualifiedName);
      } else {
        this.emitMultiname(nameIndex);
        this.emitPush(this.pop() + ".asGetProperty(mn.namespaces, mn.name, mn.flags, false)");
      }
    }

    emitFindProperty(nameIndex: number, strict: boolean) {
      var scope = this.getScope(this.scopeIndex);
      this.emitMultiname(nameIndex);
      this.emitPush(scope + ".findScopeProperty(mn.namespaces, mn.name, mn.flags, mi, " + strict +
                    ")");
    }

    emitCallProperty(bc: Bytecode) {
      var args = new Array(bc.argCount);
      for (var i = bc.argCount; i--;) {
        args[i] = this.pop();
      }
      var receiver;
      if (bc.op === OP.callproplex) {
        // TODO: prevent popping runtime name parts twice.
        this.emitFindProperty(bc.index, true);
        receiver = this.peekScope();
      }
      var call: string;
      var multiname = this.constantPool.multinames[bc.index];
      if (!multiname.isRuntime() && multiname.namespaces.length === 1) {
        var qualifiedName = Multiname.qualifyName(multiname.namespaces[0], multiname.name);
        receiver || (receiver = this.pop());
        call = receiver + '.' + qualifiedName + '(' + args + ')';
      } else {
        this.emitMultiname(bc.index);
        receiver || (receiver = this.pop());
        call = receiver + ".asCallProperty(mn.namespaces, mn.name, mn.flags, [" + args + "])";
      }
      if (bc.op !== OP.callpropvoid) {
        this.emitPush(call);
      } else {
        this.blockEmitter.writeLn(call + ';');
      }
    }

    emitGetLex(nameIndex: number) {
      this.emitFindProperty(nameIndex, true);
      var receiver = this.peek();
      var multiname = this.constantPool.multinames[nameIndex];
      if (!multiname.isRuntime() && multiname.namespaces.length === 1) {
        var qualifiedName = Multiname.qualifyName(multiname.namespaces[0], multiname.name);
        this.blockEmitter.writeLn(receiver + ' = ' + receiver + '.' + qualifiedName + ';');
      } else {
        this.emitMultiname(nameIndex);
        this.emitPush(receiver + ".asGetProperty(mn.namespaces, mn.name, mn.flags, false)");
      }
    }

    emitMultiname(index: number) {
      var multiname = this.constantPool.multinames[index];
      // Can't handle these yet.
      Debug.assert(!multiname.isRuntimeName());
      Debug.assert(!multiname.isRuntimeNamespace());
      this.blockEmitter.writeLn('var mn = mi.abc.constantPool.multinames[' + index + ']; // ' +
                                multiname);
    }

    emitIf(block: Bytecode, bc: Bytecode) {
      var next = this.bytecodes[bc.position + 1];
      var target = bc.target;
      Relooper.addBranch(block.relooperBlock, next.relooperBlock);
      Relooper.addBranch(block.relooperBlock, target.relooperBlock, "c");
    }

    emitPush(v) {
      this.blockEmitter.writeLn(this.stackTop() + " = " + v + "; // push at " + this.stack);
      this.stack++;
    }

    emitPushScope(isWith: boolean) {
      var parent = this.scopeIndex === 0 ? "mi.classScope" : this.peekScope();
      var scope = "new Scope(" + parent + ", this, " + isWith + ")";
      this.scopeIndex++;
      this.blockEmitter.writeLn(this.getScope(this.scopeIndex) + " = " + scope + ";");
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

    emitCoerce(bc: Bytecode) {
      if (bc.ti && bc.ti.noCoercionNeeded) {
        return;
      }
      var value = this.pop();
      var coercion: string;
      var multiname = this.constantPool.multinames[bc.index];
      switch (multiname) {
        case Multiname.Int:     coercion = value + '|0'; break;
        case Multiname.Uint:    coercion = value + ' >>> 0'; break;
        case Multiname.Number:  coercion = '+' + value; break;
        case Multiname.Boolean: coercion = '!!' + value; break;
        case Multiname.Object:  coercion = 'Object(' + value + ')'; break;
        case Multiname.String:  coercion = 'asCoerceString(' + value + ')'; break;
        default:
          coercion = 'asCoerce(mi.abc.applicationDomain.getType(mi.abc.constantPool.multinames[' +
                     bc.index + ']), ' + value + ')';
      }
      this.emitPush(coercion);
    }

    emitConvertB() {
      var val = this.peek();
      this.blockEmitter.writeLn(val + ' = !!' + val + ';');
    }

    emitDup() {
      this.emitPush(this.peek());
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
                                        hasDynamicScope: boolean, globalMiName: string) {
    var compiler = new BaselineCompiler(methodInfo, scope, hasDynamicScope, globalMiName);
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
