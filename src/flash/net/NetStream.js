function NetStream() {
  EventDispatcher.call(this);
}

NetStream.prototype = Object.create(EventDispatcher.prototype, {
  __class__: describeInternalProperty('flash.net.NetStream')
});