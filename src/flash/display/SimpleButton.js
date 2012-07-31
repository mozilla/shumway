function SimpleButton() {
}

SimpleButton.prototype = Object.create(new InteractiveObject, {
  __class__: describeInternalProperty('flash.display.SimpleButton'),
});
