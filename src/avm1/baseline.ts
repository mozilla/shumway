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

module Shumway.AVM1 {
  import notImplemented = Shumway.Debug.notImplemented;

  /**
   *  Bare-minimum JavaScript code generator to make debugging better.
   */
  export class ActionsDataCompiler {
    static cachedCalls;
    constructor() {
      if (!ActionsDataCompiler.cachedCalls) {
        ActionsDataCompiler.cachedCalls = generateActionCalls();
      }
    }
    private convertArgs(args: any[], id: number, res, ir: AnalyzerResults): string {
      var parts: string[] = [];
      for (var i: number = 0; i < args.length; i++) {
        var arg = args[i];
        if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
          if (arg instanceof ParsedPushConstantAction) {
            if (ir.singleConstantPool) {
              var constant = ir.singleConstantPool[(<ParsedPushConstantAction> arg).constantIndex];
              parts.push(constant === undefined ? 'undefined' : JSON.stringify(constant));
            } else {
              var hint = '';
              var currentConstantPool = res.constantPool;
              if (currentConstantPool) {
                var constant = currentConstantPool[(<ParsedPushConstantAction> arg).constantIndex];
                hint = constant === undefined ? 'undefined' : JSON.stringify(constant);
                // preventing code breakage due to bad constant
                hint = hint.indexOf('*/') >= 0 ? '' : ' /* ' + hint + ' */';
              }
              parts.push('constantPool[' + (<ParsedPushConstantAction> arg).constantIndex + ']' + hint);
            }
          } else if (arg instanceof ParsedPushRegisterAction) {
            var registerNumber = (<ParsedPushRegisterAction> arg).registerNumber;
            if (registerNumber < 0 || registerNumber >= ir.registersLimit) {
              parts.push('undefined'); // register is out of bounds -- undefined
            } else {
              parts.push('registers[' + registerNumber + ']');
            }
          } else if (arg instanceof AVM1ActionsData) {
            var resName = 'code_' + id + '_' + i;
            res[resName] = arg;
            parts.push('res.' + resName);
          } else {
            notImplemented('Unknown AVM1 action argument type');
          }
        } else if (arg === undefined) {
          parts.push('undefined'); // special case
        } else {
          parts.push(JSON.stringify(arg));
        }
      }
      return parts.join(',');
    }
    private convertAction(item: ActionCodeBlockItem, id: number, res, indexInBlock: number, ir: AnalyzerResults): string {
      switch (item.action.actionCode) {
        case ActionCode.ActionJump:
        case ActionCode.ActionReturn:
          return '';
        case ActionCode.ActionConstantPool:
          res.constantPool = item.action.args[0];
          return '  constantPool = [' + this.convertArgs(item.action.args[0], id, res, ir) + '];\n' +
            '  ectx.constantPool = constantPool;\n';
        case ActionCode.ActionPush:
          return '  stack.push(' + this.convertArgs(item.action.args, id, res, ir) + ');\n';
        case ActionCode.ActionStoreRegister:
          var registerNumber = item.action.args[0];
          if (registerNumber < 0 || registerNumber >= ir.registersLimit) {
            return ''; // register is out of bounds -- noop
          }
          return '  registers[' + registerNumber + '] = stack[stack.length - 1];\n';
        case ActionCode.ActionWaitForFrame:
        case ActionCode.ActionWaitForFrame2:
          return '  if (calls.' + item.action.actionName + '(ectx,[' +
            this.convertArgs(item.action.args, id, res, ir) + '])) { position = ' + item.conditionalJumpTo + '; ' +
            'checkTimeAfter -= ' + (indexInBlock + 1) + '; break; }\n';
        case ActionCode.ActionIf:
          return '  if (!!stack.pop()) { position = ' + item.conditionalJumpTo + '; ' +
            'checkTimeAfter -= ' + (indexInBlock + 1) + '; break; }\n';
        default:
          var result = '  calls.' + item.action.actionName + '(ectx' +
            (item.action.args ? ',[' + this.convertArgs(item.action.args, id, res, ir) + ']' : '') +
            ');\n';
          return result;
      }
    }
    generate(ir: AnalyzerResults): Function {
      var blocks = ir.blocks;
      var res = {};
      var uniqueId = 0;
      var debugName = ir.dataId;
      var fn = 'return function avm1gen_' + debugName + '(ectx) {\n' +
        'var position = 0;\n' +
        'var checkTimeAfter = 0;\n' +
        'var constantPool = ectx.constantPool, registers = ectx.registers, stack = ectx.stack;\n';
      if (avm1DebuggerEnabled.value) {
        fn += '/* Running ' + debugName + ' */ ' +
        'if (Shumway.AVM1.Debugger.pause || Shumway.AVM1.Debugger.breakpoints.' +
        debugName + ') { debugger; }\n'
      }
      fn += 'while (!ectx.isEndOfActions) {\n' +
      'if (checkTimeAfter <= 0) { checkTimeAfter = ' + CHECK_AVM1_HANG_EVERY + '; ectx.context.checkTimeout(); }\n' +
      'switch(position) {\n';
      blocks.forEach((b: ActionCodeBlock) => {
        fn += ' case ' + b.label + ':\n';
        b.items.forEach((item: ActionCodeBlockItem, index: number) => {
          fn += this.convertAction(item, uniqueId++, res, index, ir);
        });
        fn += '  position = ' + b.jump + ';\n' +
        '  checkTimeAfter -= ' + b.items.length + ';\n' +
        '  break;\n'
      });
      fn += ' default: ectx.isEndOfActions = true; break;\n}\n}\n' +
      'return stack.pop();};';
      fn += '//# sourceURL=avm1gen-' + debugName;
      return (new Function('calls', 'res', fn))(
        ActionsDataCompiler.cachedCalls, res);
    }
  }
}