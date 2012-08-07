function SimpleButton() {
  InteractiveObject.call(this);
}

SimpleButton.prototype = Object.create(InteractiveObject.prototype, {
  __class__: describeInternalProperty('flash.display.SimpleButton'),
});
