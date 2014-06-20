/**
 * Created by yury on 6/11/14.
 */

module Shumway.AVM1 {
  import avm1lib =  Shumway.AVM2.AS.avm1lib;

  export class AS2ActionsData {
    public ir; // will cache compiled representation
    constructor(public bytes: Uint8Array, public id: string) {}
  }

  export class AS2Context {
    public static instance: AS2Context = null;
    public stage;
    public classes;
    public globals: avm1lib.AS2Globals;
    constructor() {}

    public static create: (swfVersion: number) => AS2Context;

    public flushPendingScripts() {}
    public addAsset(className: string, symbolProps) {}
    public getAsset(className: string): any {}
    public resolveTarget(target): any {}
    public resolveLevel(level: number): any {}
    public addToPendingScripts(fn) {}

    public executeActions(actionsData: AS2ActionsData, stage, scopeObj) {}
  }
}
