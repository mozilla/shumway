function TextField() {
}

TextField.prototype = Object.create(new InteractiveObject, {
  __class__: describeInternalProperty('flash.text.TextField'),
});
