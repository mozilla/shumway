function TextField() {
  InteractiveObject.call(this);
}

TextField.prototype = Object.create(InteractiveObject.prototype, {
  __class__: describeInternalProperty('flash.text.TextField'),
});
