/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module Shumway {
  import assert = Shumway.Debug.assert;

  /**
   * Things that can be kept in linked lists.
   */
  export interface ILinkedListNode {
    next: ILinkedListNode;
    previous: ILinkedListNode;
  }

  /**
   * Maintains a LRU doubly-linked list.
   */
  export class LRUList<T extends ILinkedListNode> {
    private _head: T;
    private _tail: T;
    private _count: number = 0;

    public get count() {
      return this._count;
    }

    /**
     * Gets the node at the front of the list. Returns |null| if the list is empty.
     */
    get head(): T {
      return this._head;
    }

    constructor() {
      this._head = this._tail = null;
    }

    private _unshift(node: T) {
      release || assert (!node.next && !node.previous);
      if (this._count === 0) {
        this._head = this._tail = node;
      } else {
        node.next = this._head;
        node.next.previous = node;
        this._head = node;
      }
      this._count ++;
    }

    private _remove(node: T) {
      release || assert (this._count > 0);
      if (node === this._head && node === this._tail) {
        this._head = this._tail = null;
      } else if (node === this._head) {
        this._head = <T>(node.next);
        this._head.previous = null;
      } else if (node === this._tail) {
        this._tail = <T>(node.previous);
        this._tail.next = null;
      } else {
        node.previous.next = node.next;
        node.next.previous = node.previous;
      }
      node.previous = node.next = null;
      this._count --;
    }

    /**
     * Adds or moves a node to the front of the list.
     */
    use(node: T) {
      if (this._head === node) {
        return;
      }
      if (node.next || node.previous || this._tail === node) {
        this._remove(node);
      }
      this._unshift(node);
    }

    /**
     * Removes a node from the front of the list.
     */
    pop(): T {
      if (!this._tail) {
        return null;
      }
      var node = this._tail;
      this._remove(node);
      return node;
    }

    /**
     * Visits each node in the list in the forward or reverse direction as long as
     * the callback returns |true|;
     */
    visit(callback: (T) => boolean, forward: boolean = true) {
      var node: T = (forward ? this._head : this._tail);
      while (node) {
        if (!callback(node)) {
          break;
        }
        node = <T>(forward ? node.next : node.previous);
      }
    }
  }
}
