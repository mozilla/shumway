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

module Shumway.AVM1 {

  export interface ActionCodeBlock {
    label: number;
    items: ActionCodeBlockItem[];
    jump: number;
  }

  export interface ActionCodeBlockItem {
    action: ParsedAction;
    next: number;
    conditionalJumpTo: number;
  }

  export interface AnalyzerResults {
    /** Sparsed array with compiled actions, index is an original location
     *  in the binary actions data */
    actions: ActionCodeBlockItem[];
    blocks: ActionCodeBlock[];
    dataId: string;
  }

  export class ActionsDataAnalyzer {
    constructor() {
      // ...
    }
    analyze(parser: ActionsDataParser): AnalyzerResults {
      var actions: ActionCodeBlockItem[] = [];
      var labels: number[] = [0];
      var processedLabels: boolean[] = [true];

      // Parsing all actions we can reach. Every action will have next position
      // and conditional jump location.
      var queue: number[] = [0];
      while (queue.length > 0) {
        var position = queue.shift();
        if (actions[position]) {
          continue;
        }
        parser.position = position;

        // reading block of actions until the first jump of end of actions
        while (!parser.eof && !actions[position]) {
          var action = parser.readNext();
          if (action.actionCode === 0) {
            break;
          }

          var nextPosition = parser.position;

          var item: ActionCodeBlockItem = {
            action: action,
            next: nextPosition,
            conditionalJumpTo: -1
          };

          var jumpPosition: number = 0;
          var branching: boolean = false;
          var nonConditionalBranching: boolean = false;
          switch (action.actionCode) {
            case ActionCode.ActionWaitForFrame:
            case ActionCode.ActionWaitForFrame2:
              branching = true;
              // skip is specified in amount of actions (instead of bytes)
              var skipCount: number = action.actionCode === ActionCode.ActionWaitForFrame ?
                action.args[1] : action.args[0];
              parser.skip(skipCount);
              jumpPosition = parser.position;
              parser.position = nextPosition;
              break;
            case ActionCode.ActionJump:
              nonConditionalBranching = true;
              branching = true;
              jumpPosition = nextPosition + action.args[0];
              break;
            case ActionCode.ActionIf:
              branching = true;
              jumpPosition = nextPosition + action.args[0];
              break;
            case ActionCode.ActionThrow:
            case ActionCode.ActionReturn:
            case ActionCode.None:
              nonConditionalBranching = true;
              branching = true;
              jumpPosition = parser.length;
              break;
          }
          if (branching) {
            if (jumpPosition < 0 || jumpPosition > parser.length) {
              console.error('jump outside the action block;');
              jumpPosition = parser.length;
            }
            if (nonConditionalBranching) {
              item.next = jumpPosition;
            } else {
              item.conditionalJumpTo = jumpPosition;
            }
            if (!processedLabels[jumpPosition]) {
              labels.push(jumpPosition);
              queue.push(jumpPosition);
              processedLabels[jumpPosition] = true;
            }
          }

          actions[position] = item;
          if (nonConditionalBranching) {
            break;
          }
          position = nextPosition;
        }
      }

      // Creating blocks for every unique label
      var blocks: ActionCodeBlock[] = [];
      labels.forEach((position) => {
        if (!actions[position]) {
          return;
        }
        var items: ActionCodeBlockItem[] = [];
        var lastPosition = position;

        // continue grabbing items until other label or next code exist
        do {
          var item: ActionCodeBlockItem = actions[lastPosition];
          items.push(item);
          lastPosition = item.next;
        } while (!processedLabels[lastPosition] && actions[lastPosition]);

        blocks.push({
          label: position,
          items: items,
          jump: lastPosition
        });
      });
      return {
        actions: actions,
        blocks: blocks,
        dataId: parser.dataId
      };
    }
  }
}
