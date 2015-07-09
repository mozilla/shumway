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

module Shumway.Shell {
  export class MicroTask {
    runAt: number;
    constructor(public id: number, public fn: () => any, public args: any[],
                public interval: number, public repeat: boolean) {
    }
  }
  
  var jsGlobal = (function() { return this || (1, eval)('this//# sourceURL=jsGlobal-getter'); })();

  export class MicroTasksQueue {
    private tasks: MicroTask[] = [];
    private nextId: number = 1;
    private time: number = 1388556000000; // 1-Jan-2014
    private stopped: boolean = true;

    constructor() {
    }

    public get isEmpty(): boolean {
      return this.tasks.length === 0;
    }

    public scheduleInterval(fn: () => any, args: any[], interval: number, repeat: boolean) {
      var MIN_INTERVAL = 4;
      interval = Math.round((interval || 0)/10) * 10;
      if (interval < MIN_INTERVAL) {
        interval = MIN_INTERVAL;
      }
      var taskId = this.nextId++;
      var task = new MicroTask(taskId, fn, args, interval, repeat);
      this.enqueue(task);
      return task;
    }

    public enqueue(task: MicroTask) {
      var tasks = this.tasks;
      task.runAt = this.time + task.interval;
      var i = tasks.length;
      while (i > 0 && tasks[i - 1].runAt > task.runAt) {
        i--;
      }
      if (i === tasks.length) {
        tasks.push(task);
      } else {
        tasks.splice(i, 0, task);
      }
    }

    public dequeue(): MicroTask {
      var task = this.tasks.shift();
      this.time = task.runAt;
      return task;
    }

    public remove(id: number) {
      var tasks = this.tasks;
      for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
          tasks.splice(i, 1);
          return;
        }
      }
    }

    public clear() {
      this.tasks.length = 0;
    }

    /**
     * Runs micro tasks for a certain |duration| and |count| whichever comes first. Optionally,
     * if the |clear| option is specified, the micro task queue is cleared even if not all the
     * tasks have been executed.
     *
     * If a |preCallback| function is specified, only continue execution if |preCallback()| returns true.
     */
    run(duration: number = 0, count: number = 0, clear: boolean = false, preCallback: Function = null) {
      this.stopped = false;
      var executedTasks = 0;
      var stopAt = Date.now() + duration;
      while (!this.isEmpty && !this.stopped) {
        if (duration > 0 && Date.now() >= stopAt) {
          break;
        }
        if (count > 0 && executedTasks >= count) {
          break;
        }
        var task = this.dequeue();
        if (preCallback && !preCallback(task)) {
          return;
        }
        task.fn.apply(null, task.args);
        executedTasks ++;
      }
      if (clear) {
        this.clear();
      }
      this.stopped = true;
    }

    stop() {
      this.stopped = true;
    }
  }
}
