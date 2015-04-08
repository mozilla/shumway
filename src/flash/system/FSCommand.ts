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
  import axCoerceString = Shumway.AVMX.axCoerceString;

  export interface IFSCommandListener {
    executeFSCommand(command: string, args: string);
  }

  export function fscommand(securityDomain: ISecurityDomain, command: string, args: string): void {
    command = axCoerceString(command);
    args = axCoerceString(args);
    console.log('FSCommand: ' + command + '; ' + args);
    command = command.toLowerCase();
    if (command === 'debugger') {
      /* tslint:disable */
      debugger;
      /* tslint:enable */
      return;
    }

    securityDomain.player.executeFSCommand(command, args);
  }
}
