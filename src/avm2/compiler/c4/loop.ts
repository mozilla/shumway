/*
 * Copyright 2014 Mozilla Foundation
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
///<reference path='../../references.ts' />

module Shumway.AVM2.Compiler.Looper {
  export module Control {
    export enum Kind {
      SEQ = 1,
      LOOP = 2,
      IF = 3,
      CASE = 4,
      SWITCH = 5,
      LABEL_CASE = 6,
      LABEL_SWITCH = 7,
      EXIT = 8,
      BREAK = 9,
      CONTINUE = 10,
      TRY = 11,
      CATCH = 12
    }
    
    export class ControlNode {
      constructor(public kind: Kind) {

      }
    }

    export class Seq extends ControlNode {
      constructor(public body) {
        super(Kind.SEQ);
      }

      trace(writer) {
        var body = this.body;
        for (var i = 0, j = body.length; i < j; i++) {
          body[i].trace(writer);
        }
      }

      first() {
        return this.body[0];
      }

      slice(begin, end) {
        return new Seq(this.body.slice(begin, end));
      }
    }

    export class Loop extends ControlNode {
      constructor(public body) {
        super(Kind.LOOP);
      }

      trace(writer) {
        writer.enter("loop {");
        this.body.trace(writer);
        writer.leave("}");
      }
    }

    export class If extends ControlNode {
      negated: boolean;
      else: any;
      constructor(public cond, public then, els, public nothingThrownLabel) {
        super(Kind.IF);
        this.negated = false;
        this.else = els;
      }

      trace(writer) {
        this.cond.trace(writer);
        if (this.nothingThrownLabel) {
          writer.enter("if (label is " + this.nothingThrownLabel + ") {");
        }
        writer.enter("if" + (this.negated ? " not" : "") + " {");
        this.then && this.then.trace(writer);
        if (this.else) {
          writer.outdent();
          writer.enter("} else {");
          this.else.trace(writer);
        }
        writer.leave("}");
        if (this.nothingThrownLabel) {
          writer.leave("}");
        }
      }
    }

    export class Case extends ControlNode {
      constructor(public index, public body) {
        super(Kind.CASE);
      }

      trace(writer) {
        if (this.index >= 0) {
          writer.writeLn("case " + this.index + ":");
        } else {
          writer.writeLn("default:");
        }
        writer.indent();
        this.body && this.body.trace(writer);
        writer.outdent();
      }
    }

    export class Switch extends ControlNode {
      constructor(public determinant, public cases, public nothingThrownLabel) {
        super(Kind.SWITCH);
      }

      trace(writer) {
        if (this.nothingThrownLabel) {
          writer.enter("if (label is " + this.nothingThrownLabel + ") {");
        }
        this.determinant.trace(writer);
        writer.writeLn("switch {");
        for (var i = 0, j = this.cases.length; i < j; i++) {
          this.cases[i].trace(writer);
        }
        writer.writeLn("}");
        if (this.nothingThrownLabel) {
          writer.leave("}");
        }
      }
    }

    export class LabelCase extends ControlNode {
      constructor(public labels, public body) {
        super(Kind.LABEL_CASE);
      }

      trace(writer) {
        writer.enter("if (label is " + this.labels.join(" or ") + ") {");
        this.body && this.body.trace(writer);
        writer.leave("}");
      }
    }

    export class LabelSwitch extends ControlNode {
      labelMap: any;
      constructor(public cases) {
        super(Kind.LABEL_SWITCH);
        var labelMap = {};

        for (var i = 0, j = cases.length; i < j; i++) {
          var c = cases[i];
          if (!c.labels) {
            // print(c.toSource());
          }
          for (var k = 0, l = c.labels.length; k < l; k++) {
            labelMap[c.labels[k]] = c;
          }
        }


        this.labelMap = labelMap;
      }

      trace(writer) {
        for (var i = 0, j = this.cases.length; i < j; i++) {
          this.cases[i].trace(writer);
        }
      }
    }

    export class Exit extends ControlNode {
      constructor(public label) {
        super(Kind.EXIT);
      }

      trace(writer) {
        writer.writeLn("label = " + this.label);
      }
    }

    export class Break extends ControlNode {
      constructor(public label, public head) {
        super(Kind.BREAK);
      }

      trace(writer) {
        this.label && writer.writeLn("label = " + this.label);
        writer.writeLn("break");
      }
    }

    export class Continue extends ControlNode {
      necessary: boolean;
      constructor (public label, public head) {
        super(Kind.CONTINUE);
        this.necessary = true;
      }
      trace(writer) {
        this.label && writer.writeLn("label = " + this.label);
        this.necessary && writer.writeLn("continue");
      }
    }

    export class Try extends ControlNode {
      nothingThrownLabel: boolean;
      constructor(public body, public catches) {
        super(Kind.TRY);
      }

      trace(writer) {
        writer.enter("try {");
        this.body.trace(writer);
        writer.writeLn("label = " + this.nothingThrownLabel);
        for (var i = 0, j = this.catches.length; i < j; i++) {
          this.catches[i].trace(writer);
        }
        writer.leave("}");
      }
    }

    export class Catch extends ControlNode {
      constructor (public varName, public typeName, public body) {
        super(Kind.CATCH);
      }

      trace(writer) {
        writer.outdent();
        writer.enter("} catch (" + (this.varName || "e") +
          (this.typeName ? (" : " + this.typeName) : "") + ") {");
        this.body.trace(writer);
      }
    }

  }
}