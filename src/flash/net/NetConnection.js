function NetConnection() {
  EventDispatcher.call(this);
}

NetConnection.prototype = Object.create(EventDispatcher.prototype, {
  __class__: describeInternalProperty('flash.net.NetConnection')
});