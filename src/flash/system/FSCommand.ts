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
// Class: FSCommand
module Shumway.AVMX.AS.flash.system {
  import asCoerceString = Shumway.AVMX.asCoerceString;

  export class FSCommand extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      super();
    }

    static _fscommand(command: string, args: string): void {
      command = asCoerceString(command); args = asCoerceString(args);
      console.log('FSCommand: ' + command + '; ' + args);
      command = command.toLowerCase();
      if (command === 'debugger') {
        /* tslint:disable */
        debugger;
        /* tslint:enable */
        return;
      }

      var listener: IFSCommandListener = null; // REDUX: Shumway.AVM2.Runtime.AVM2.instance.globals['Shumway.Player.Utils'];
      listener.executeFSCommand(command, args);
    }
  }

  export interface IFSCommandListener {
    executeFSCommand(command: string, args: string);
  }
}
