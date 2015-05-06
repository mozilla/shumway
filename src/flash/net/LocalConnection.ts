/**
 * Copyright 2015 Mozilla Foundation
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

module Shumway.AVMX.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import assert = Debug.assert;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import ByteArray = flash.utils.ByteArray;
  import FileLoadingService = Shumway.FileLoadingService;

  var forbiddenNames = ['send', 'connect', 'close', 'allowDomain', 'allowInsecureDomain', 'client',
                        'domain'];
  Object.freeze(forbiddenNames);

  export class LocalConnection extends flash.events.EventDispatcher
                               implements ILocalConnectionReceiver {
    
    static classInitializer = null;

    constructor () {
      super();
      this._client = this;
      this._connectionName = null;
      this._allowedInsecureDomains = [];
      this._allowedSecureDomains = [];
    }
    
    static get isSupported() {
      return true;
    }
    
    private _client: ASObject;
    private _connectionName: string;

    // Required because allowDomain can be called before a connection is made.
    private _allowedInsecureDomains: string[];
    private _allowedSecureDomains: string[];

    close(): void {
      var connectionName = this._connectionName;
      if (!connectionName) {
        this.sec.throwError('ArgumentError', Errors.CloseNotConnectedError);
      }
      release || assert(typeof connectionName === 'string' && connectionName.length > 0);
      this._connectionName = null;
      // TODO: verify that these really are reset. For now, we aim to err on the safe side.
      this._allowedInsecureDomains = [];
      this._allowedSecureDomains = [];
      LocalConnectionService.instance.closeConnection(connectionName, this);
    }

    connect(connectionName: string): void {
      connectionName = axCoerceString(connectionName);
      if (connectionName === null) {
        this.sec.throwError('TypeError', Errors.NullPointerError, 'connectionName');
      }
      if (connectionName === '') {
        this.sec.throwError('TypeError', Errors.EmptyStringError, 'connectionName');
      }
      // The only disallowed character for the connection name is ":".
      if (connectionName.indexOf(':') > -1) {
        this.sec.throwError('ArgumentError', Errors.InvalidParamError);
      }
      if (this._connectionName) {
        this.sec.throwError('ArgumentError', Errors.AlreadyConnectedError);
      }
      var result = LocalConnectionService.instance.createConnection(connectionName, this);
      if (result === LocalConnectionConnectResult.AlreadyTaken) {
        this.sec.throwError('ArgumentError', Errors.AlreadyConnectedError);
      }
      this._connectionName = connectionName;
      release || assert(result === LocalConnectionConnectResult.Success);
      if (this._allowedInsecureDomains.length) {
        this._allowDomains(this._allowedInsecureDomains, false);
      }
      if (this._allowedSecureDomains.length) {
        this._allowDomains(this._allowedSecureDomains, true);
      }
    }

    send(connectionName: string, methodName: string, ...args): void {
      connectionName = axCoerceString(connectionName);
      methodName = axCoerceString(methodName);
      if (connectionName === null) {
        this.sec.throwError('TypeError', Errors.NullPointerError, 'connectionName');
      }
      if (connectionName === '') {
        this.sec.throwError('TypeError', Errors.EmptyStringError, 'connectionName');
      }
      if (methodName === null) {
        this.sec.throwError('TypeError', Errors.NullPointerError, 'methodName');
      }
      if (methodName === '') {
        this.sec.throwError('TypeError', Errors.EmptyStringError, 'methodName');
      }
      if (forbiddenNames.indexOf(methodName) > -1) {
        this.sec.throwError('ArgumentError', Errors.InvalidParamError);
      }
      var serializedArgs = new this.sec.flash.utils.ByteArray();
      serializedArgs.writeObject(this.sec.createArrayUnsafe(args));
      if (serializedArgs.length > 40 * 1024) {
        this.sec.throwError('ArgumentError', Errors.ArgumentSizeError);
      }
      var argsBuffer = serializedArgs.getBytes().buffer;
      try {
        LocalConnectionService.instance.send(connectionName, methodName, argsBuffer, this);
      } catch (e) {
        // Not sure what to do here, this shouldn't happen. We'll just ignore it with a warning.
        Debug.warning('Unknown error occurred in LocalConnection#send', e);
      }
    }

    get client(): ASObject {
       return this._client;
    }

    set client(client: ASObject) {
      if (!this.sec.AXObject.axIsType(client)) {
        this.sec.throwError('ArgumentError', Errors.InvalidParamError);
      }
      this._client = client;
    }

    allowDomain(): void {
      this._allowDomains(<any>arguments, false);
    }

    allowInsecureDomain(): void {
      this._allowDomains(<any>arguments, true);
    }

    private _allowDomains(domains: string[], secure: boolean) {
      var result = [];
      // If no connection has been made yet, store the domains for later retrieval.
      if (!this._connectionName) {
        result = secure ? this._allowedSecureDomains : this._allowedInsecureDomains;
      }
      for (var i = 0; i < domains.length; i++) {
        var domain = domains[i];
        if (!axIsTypeString(domain)) {
          this.sec.throwError('ArgumentError', Errors.AllowDomainArgumentError);
        }
        result.push(domain);
      }
      if (this._connectionName) {
        LocalConnectionService.instance.allowDomains(this._connectionName, domains, secure);
      }
    }

    public handleMessage(methodName: string, argsBuffer: ArrayBuffer,
                         sender: LocalConnection): void {
      var client = this._client;
      if (!client.axHasPublicProperty(methodName) || forbiddenNames.indexOf(methodName) > -1) {
        // Forbidden names really shouldn't reach this point, but should everything else fail,
        // we just pretend not to have found them here.
        sender.sec.throwError('ReferenceError', Errors.ReadSealedError, 'methodName',
                              this.axClass.name.name);
      }
      var handler = client.axGetPublicProperty(methodName);
      if (!axIsCallable(handler)) {
        // Non-callable handlers are just ignored.
        return;
      }

      var ba: ByteArray = new this.sec.flash.utils.ByteArray(argsBuffer);
      var args: ASArray = ba.readObject();
      if (!this.sec.AXArray.axIsType(args)) {
        sender.sec.throwError('TypeError', Errors.CheckTypeFailedError, args, 'Array');
      }
      handler.apply(client, args.value);
    }

    get domain(): string {
      somewhatImplemented("public flash.net.LocalConnection::get domain");
      // HACK some SWFs want to know where they are hosted
      // TODO: change this to use URL.
      var url = Shumway.AVMX.getCurrentABC().env.url;
      var m = /:\/\/(.+?)[:?#\/]/.exec(url);
      return m && m[1];
    }

    get isPerUser(): boolean {
      // We always return true, because everything else would be a lie.
      return true;
    }

    set isPerUser(newValue: boolean) {
      !!newValue;
      // Ignored. See
      // https://blogs.adobe.com/simplicity/2009/08/localconnectionisperuser_in_ai.html for an
      // explanation.
    }
  }
}
