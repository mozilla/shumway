const SimpleButtonDefinition = (function () {
  var def = {
    __class__: 'flash.display.SimpleButton',

    get downState() {
      return this._downState;
    },
    set downState(val) {
      this._downState = val;
    },
    get hitTestState() {
      return this._hitArea;
    },
    set hitTestState(val) {
      this._hitArea = val;
    },
    get overState() {
      return this._overState;
    },
    set overState(val) {
      this._overState = val;
    },
    get upState() {
      return this._upState;
    },
    set upState(val) {
      this._upState = val;
    },
    get _isContainer() {
      return true;
    },

    initialize: function () {
      var s = this.symbol;
      if (s) {
        this._upState = createSprite(s.states.up, this);
        this._overState = createSprite(s.states.over, this);
        this._downState = createSprite(s.states.down, this);
        this._hitArea = createSprite(s.states.hitTest, this);
      }
      this._isMouseDown = false;
      this._isMouseOver = false;

      // binding mouse events
      const MouseEventClass = avm2.systemDomain.getClass("flash.events.MouseEvent");
      this.addEventListener(MouseEventClass.MOUSE_DOWN, function (evt) {
        this._isMouseDown = true;
        this._updateButton();
      }.bind(this), true);
      this.addEventListener(MouseEventClass.MOUSE_UP, function (evt) {
        this._isMouseDown = false;
        this._updateButton();
      }.bind(this), true);
      this.addEventListener(MouseEventClass.MOUSE_OVER, function (evt) {
        this._isMouseOver = true;
        this._updateButton();
      }.bind(this), true);
      this.addEventListener(MouseEventClass.MOUSE_OUT, function (evt) {
        this._isMouseOver = false;
        this._updateButton();
      }.bind(this), true);

    },

    _updateButton: function () {
      var state = this._upState;
      if (this._isMouseDown && this._isMouseOver && this._downState)
        state = this._downState;
      else if (this._isMouseOver && this._overState)
        state = this._overState;
      this._children = [state];
    }
  };

  function createSprite(symbolInfo, parent) {
    if (!symbolInfo) {
      return null;
    }
    var symbolClass = avm2.systemDomain.findClass(symbolInfo.className) ?
      avm2.systemDomain.getClass(symbolInfo.className) :
      avm2.applicationDomain.getClass(symbolInfo.className);
    var instance = symbolClass.createAsSymbol(symbolInfo.props);
    symbolClass.instance.call(instance);
    instance._animated = true;
    instance._parent = parent;
    return instance;
  }

  const desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        downState: desc(def, "downState"),
        hitTestState: desc(def, "hitTestState"),
        overState: desc(def, "overState"),
        upState: desc(def, "upState"),
        _updateButton: def._updateButton
      }
    }
  };

  return def;
}).call(this);
